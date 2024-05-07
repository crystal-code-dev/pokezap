import prisma from '../../../../../prisma-provider/src'
import {
  BasePokemon,
  DuelNpc,
  Player,
  Pokemon,
  PokemonBaseDataSkillsHeld,
  RaidPokemonBaseDataSkillsHeld,
  Skill,
  TDuelNXNResponse,
} from '../../../../../prisma-provider/src/types'
import { metaValues } from '../../../constants/metaValues'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { ContinuousDuel6x6 } from '../../../server/modules/duel/ContinuousDuel6x6'
import { PlayerDoesNotHaveSixPokemonTeamError, UnexpectedError } from '../../errors/AppErrors'
import { logger } from '../../logger'

export type DuelPokemon = Pokemon & {
  baseData: BasePokemon & {
    skills: Skill[]
  }
}

export type DuelPlayer = Player & {
  teamPoke1: DuelPokemon | null
}

type DuelNpcDuelParams = {
  player: Player & {
    teamPoke1?: PokemonBaseDataSkillsHeld | null
    teamPoke2?: PokemonBaseDataSkillsHeld | null
    teamPoke3?: PokemonBaseDataSkillsHeld | null
    teamPoke4?: PokemonBaseDataSkillsHeld | null
    teamPoke5?: PokemonBaseDataSkillsHeld | null
    teamPoke6?: PokemonBaseDataSkillsHeld | null
  }
  npc: DuelNpc & {
    pokemons: RaidPokemonBaseDataSkillsHeld[]
  }
}

export const duelNpcDuel = async ({ player, npc }: DuelNpcDuelParams): Promise<RouteResponse> => {
  if (
    !player.teamPoke1 ||
    !player.teamPoke2 ||
    !player.teamPoke3 ||
    !player.teamPoke4 ||
    !player.teamPoke5 ||
    !player.teamPoke6
  )
    throw new PlayerDoesNotHaveSixPokemonTeamError(player.name)

  await prisma.duelNpc.update({
    where: {
      id: npc.id,
    },
    data: {
      isInBattle: true,
    },
  })

  let duel: TDuelNXNResponse | undefined

  try {
    duel =
      (await ContinuousDuel6x6({
        leftTeam: [
          player.teamPoke1,
          player.teamPoke2,
          player.teamPoke3,
          player.teamPoke4,
          player.teamPoke5,
          player.teamPoke6,
        ],
        rightTeam: [
          npc.pokemons[0],
          npc.pokemons[1],
          npc.pokemons[2],
          npc.pokemons[3],
          npc.pokemons[4],
          npc.pokemons[5],
        ],
        staticImage: true,
      })) ?? undefined
  } catch (e: any) {
    npcOutOfBattle(npc)
    logger.error(e)
    throw new UnexpectedError('duel could not be defined1')
  }

  if (!duel || !duel.imageUrl) throw new UnexpectedError('duel could not be defined2')

  const loserId = duel.loserTeam[0].ownerId
  const playerDefeated = loserId ? true : false

  npcOutOfBattle(npc)
  let rewardMessage = ''

  if (!playerDefeated) {
    await prisma.duelNpc.update({
      where: {
        id: npc.id,
      },
      data: {
        isDefeated: true,
      },
    })
    const { cash, tickets } = metaValues.duelistRewards[npc.difficulty]

    await prisma.$transaction([
      prisma.player.update({
        where: {
          id: player.id,
        },
        data: {
          cash: {
            increment: cash,
          },
        },
      }),
      prisma.item.upsert({
        where: {
          ownerId_name: {
            ownerId: player.id,
            name: 'bazar-ticket',
          },
        },
        update: {
          amount: {
            increment: tickets,
          },
        },
        create: {
          amount: tickets,
          ownerId: player.id,
          name: 'bazar-ticket',
        },
      }),
    ])
    rewardMessage = `*${player.name}* recebe $${cash} e ${tickets} bazar-tickets!`
  }

  const winnerName = playerDefeated ? npc.name : player.name
  const afterMessage = `*${winnerName}* vence o duelo!
  
${rewardMessage}

${duel.damageDealtMessage}`

  return {
    message: `*${player.name}* enfrenta o duelista *${npc.name}*!`,
    status: 200,
    data: null,
    imageUrl: duel.imageUrl,
    afterMessage,
    isAnimated: false,
  }
}

const npcOutOfBattle = async (npc: DuelNpc) => {
  await prisma.duelNpc.update({
    where: {
      id: npc.id,
    },
    data: {
      isInBattle: false,
    },
  })
}
