import prisma from '../../../../../prisma-provider/src'
import { RouteResponse } from '../../../server/models/RouteResponse'
import {
  InvalidRouteError,
  MaxDailyDuelistsError,
  MissingParameterError,
  NoNpcFoundError,
  NpcAlreadyInBattleError,
  NpcDoesNotExistsError,
  PlayerNotFoundError,
} from '../../errors/AppErrors'
import { TRouteParams } from '../router'
import { duelNpcDuel } from './_duelNpcDuel'

export const duelNpcFind = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , npcName, duel] = data.routeParams
  if (!npcName) throw new MissingParameterError('Nome do treinador que está procurando')

  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
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
      teamPoke2: {
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
      teamPoke3: {
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
      teamPoke4: {
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
      teamPoke5: {
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
      teamPoke6: {
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
  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const gameroom = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
  })

  if (!gameroom) throw new InvalidRouteError()

  const npc = await prisma.duelNpc.findFirst({
    where: {
      name: npcName.toLocaleLowerCase(),
      isDefeated: false,
    },
    include: {
      pokemons: {
        include: {
          baseData: {
            include: {
              skills: true,
            },
          },
        },
      },
    },
  })

  if (!npc) throw new NpcDoesNotExistsError(npcName)
  if (npc.isInBattle) throw new NpcAlreadyInBattleError(`#${npc.id} ${npc.name}`)
  if (npc.location !== gameroom.gameArea) throw new NoNpcFoundError(`#${npc.id} ${npc.name}`)

  if (duel === 'DUEL') {
    if (player.dailyDefeatedDuelists >= 4) throw new MaxDailyDuelistsError(player.name)
    const duelResponse = await duelNpcDuel({
      player,
      npc,
    })
    return duelResponse
  }

  return {
    message: `Você encontrou *${npc.name}*! Um duelista especializado em pokemon do tipo ${npc.speciality}!

Seu time é:
${npc.pokemons.map(poke => `*${poke.baseData.name}* nível ${poke.level}`).join('\n')}   
👍 - Duelar `,
    status: 200,
    actions: [`pz. duelist find ${npc.name} duel`],
  }
}
