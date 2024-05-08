import { iGenPokemonTeam } from '../../../../../image-generator/src/iGenPokemonTeam'
import prisma from '../../../../../prisma-provider/src'
import { getActiveClanBonus } from '../../../server/helpers/getActiveClanBonus'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { PlayerNotFoundError } from '../../errors/AppErrors'
import { TRouteParams } from '../router'

export const teamInfo = async (data: TRouteParams): Promise<RouteResponse> => {
  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
    include: {
      ownedPokemons: {
        include: {
          baseData: true,
        },
      },
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

  if (!player) throw new PlayerNotFoundError(data.playerName)

  const imageUrl = await iGenPokemonTeam({
    playerData: player,
  })

  return {
    message: `Time Pokemon de ${player.name} 
      Bonus de clã ativo: ${getActiveClanBonus([
        player.teamPoke1,
        player.teamPoke2,
        player.teamPoke3,
        player.teamPoke4,
        player.teamPoke5,
        player.teamPoke6,
      ])}`,
    status: 200,
    data: null,
    imageUrl: imageUrl,
  }
}
