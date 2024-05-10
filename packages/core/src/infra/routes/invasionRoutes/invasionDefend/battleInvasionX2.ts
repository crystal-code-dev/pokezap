import prisma from '../../../../../../prisma-provider/src'

import { RouteResponse } from '../../../../server/models/RouteResponse'
import { duelNXN } from '../../../../server/oldModules/duel/duelNXN'

import { InvasionSession, TDuelNXNResponse } from '../../../../../../prisma-provider/src/types'
import { handleExperienceGain } from '../../../../server/oldModules/pokemon/handleExperienceGain'
import {
  InsufficentPlayersForInvasionError,
  NoDuelLoserFoundError,
  NoDuelWinnerFoundError,
  PlayerDoesNotHaveThePokemonInTheTeamError,
  SessionIdNotFoundError,
  TypeMissmatchError,
  UnexpectedError,
} from '../../../errors/AppErrors'
import { DuelPlayer } from '../../duelRoutes/generatedDuelAccept'
import { TRouteParams } from '../../router'

export const battleInvasionX2 = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , invasionSessionIdString] = data.routeParams
  const invasionSessionId = Number(invasionSessionIdString)
  if (typeof invasionSessionId !== 'number') throw new TypeMissmatchError(invasionSessionIdString, 'number')

  const invasionSession = await prisma.invasionSession.findFirst({
    where: {
      id: invasionSessionId,
    },
    include: {
      lobbyPlayers: {
        include: {
          teamPoke1: {
            include: {
              baseData: {
                include: {
                  skills: true,
                },
              },
              heldItem: {
                include: {
                  baseItem: true,
                },
              },
            },
          },
        },
      },
      enemyPokemons: {
        include: {
          baseData: {
            include: {
              skills: true,
            },
          },
          heldItem: {
            include: {
              baseItem: true,
            },
          },
        },
      },
    },
  })

  if (!invasionSession || invasionSession.isFinished) throw new SessionIdNotFoundError(invasionSessionId)
  if (invasionSession.lobbyPlayers.length !== invasionSession.requiredPlayers)
    throw new InsufficentPlayersForInvasionError(invasionSession.lobbyPlayers.length, invasionSession.requiredPlayers)
  if (invasionSession.enemyPokemons.length !== 2) throw new UnexpectedError('Não há 2 pokemon inimigos.')

  const player1 = invasionSession.lobbyPlayers[0]
  const player2 = invasionSession.lobbyPlayers[1]

  if (!player1.teamPoke1) throw new PlayerDoesNotHaveThePokemonInTheTeamError(player1.name)
  if (!player2.teamPoke1) throw new PlayerDoesNotHaveThePokemonInTheTeamError(player2.name)

  await prisma.invasionSession.update({
    where: {
      id: invasionSession.id,
    },
    data: {
      inInLobby: false,
      isInProgress: true,
      isFinished: false,
    },
  })

  const duel = await duelNXN({
    leftTeam: [player1.teamPoke1, player2.teamPoke1],
    rightTeam: [invasionSession.enemyPokemons[0], invasionSession.enemyPokemons[1]],
    wildBattle: true,
    staticImage: true,
  })

  if (!duel || !duel.imageUrl) throw new UnexpectedError('duelo')
  if (!duel.winnerTeam) throw new NoDuelWinnerFoundError()
  if (!duel.loserTeam) throw new NoDuelLoserFoundError()

  if ([player1.teamPoke1.id, player2.teamPoke1.id].includes(duel.loserTeam[0].id)) {
    return await handleInvasionLose({
      duel,
      player1,
      player2,
      invasionSession,
    })
  }

  const cashReward = invasionSession.cashReward || 0
  const lootData = invasionSession.lootItemsDropRate as {
    itemName: string
    dropChance: number
    amount?: [number, number]
  }[]

  const playerIdLootRewardData: Record<number, { name: string; amount: number }[]> = {
    [player1.id]: [],
    [player2.id]: [],
  }

  for (const player of [player1, player2]) {
    for (const loot of lootData) {
      const random = Math.random()
      if (random < loot.dropChance) {
        loot.amount
          ? playerIdLootRewardData[player.id].push({
              name: loot.itemName,
              amount: Math.ceil(Math.random() * loot.amount[1] - loot.amount[0]),
            })
          : playerIdLootRewardData[player.id].push({
              name: loot.itemName,
              amount: 1,
            })
      }
    }
  }

  const itemRewardPrismaPromises: any[] = []

  for (const player of [player1, player2]) {
    for (const loot of playerIdLootRewardData[player.id]) {
      const operation = prisma.item.upsert({
        where: {
          ownerId_name: {
            name: loot.name,
            ownerId: player.id,
          },
        },
        create: {
          amount: loot.amount,
          name: loot.name,
          ownerId: player.id,
        },
        update: {
          amount: {
            increment: loot.amount,
          },
        },
      })
      itemRewardPrismaPromises.push(operation)
    }
  }

  const cashUpdatePrismaPromise = prisma.player.updateMany({
    where: {
      OR: [{ id: player1.id }, { id: player2.id }],
    },
    data: {
      cash: {
        increment: cashReward,
      },
    },
  })

  const invasionSessionUpdatePromise = prisma.invasionSession.update({
    where: {
      id: invasionSession.id,
    },
    data: {
      isInProgress: false,
      inInLobby: false,
      isFinished: true,
    },
  })

  const gameRoomUpdatePromise = prisma.gameRoom.update({
    where: {
      id: invasionSession.gameRoomId,
    },
    data: {
      invasor: {
        disconnect: true,
      },
    },
  })

  await prisma.$transaction([
    ...itemRewardPrismaPromises,
    cashUpdatePrismaPromise,
    invasionSessionUpdatePromise,
    gameRoomUpdatePromise,
  ])

  const player1ExpGainPromise = handleExperienceGain({
    pokemon: player1.teamPoke1,
    targetPokemon: invasionSession.enemyPokemons[0],
  })

  const player2ExpGainPromise = handleExperienceGain({
    pokemon: player2.teamPoke1,
    targetPokemon: invasionSession.enemyPokemons[1],
  })

  const [player1ExpGain, player2ExpGain] = await Promise.all([player1ExpGainPromise, player2ExpGainPromise])

  const player1LevelUpMessage0 = player1ExpGain.leveledUp
    ? `*${player1.teamPoke1.baseData.name}* subiu para o nível ${player1.teamPoke1.level}!`
    : ''
  const player2LevelUpMessage0 = player2ExpGain.leveledUp
    ? `*${player2.teamPoke1.baseData.name}* subiu para o nível ${player2.teamPoke1.level}!`
    : ''

  let lootDisplay: string[] = []
  for (const player of [player1, player2]) {
    for (const loot of playerIdLootRewardData[player.id]) {
      lootDisplay.push(`*${player.name}* obteve ${loot.amount} *${loot.name}*!`)
    }
  }

  const afterMessage = `*${player1.name}* e ${player2.name} vencem a invasão e recebem $${cashReward} POKECOINS!.
${lootDisplay.join('\n')}
${player1LevelUpMessage0}
${player2LevelUpMessage0}
`

  return {
    message: `*${player1.name}* e *${player2.name}* enfrentam ${invasionSession.name}!`,
    status: 200,
    data: null,
    imageUrl: duel.imageUrl,
    afterMessage,
    isAnimated: false,
  }
}

type THandleInvasionLoseData = {
  player1: DuelPlayer
  player2: DuelPlayer
  duel: TDuelNXNResponse
  invasionSession: InvasionSession
}

const handleInvasionLose = async (data: THandleInvasionLoseData) => {
  const { player1, player2, invasionSession } = data

  const cashLose = Math.round((invasionSession.cashReward || 0) * 1.5)

  await prisma.player.updateMany({
    where: {
      OR: [{ id: player1.id }, { id: player2.id }],
    },
    data: {
      cash: {
        decrement: cashLose,
      },
    },
  })

  await prisma.invasionSession.update({
    where: {
      id: invasionSession.id,
    },
    data: {
      lobbyPlayers: {
        set: [],
      },
      isFinished: false,
      isInProgress: false,
      inInLobby: true,
    },
  })

  return {
    message: `*${player1.name}* e *${player2.name}* foram derrotados e perderam $${cashLose}.`,
    status: 200,
    data: null,
  }
}
