import { iGenBerryRanch } from '../../../../../../image-generator/src/iGenBerryRanch'
import prisma from '../../../../../../prisma-provider/src'
import { RouteResponse } from '../../../../server/models/RouteResponse'
import { PlayerNotFoundError, RouteDoesNotHaveUpgradeError, RouteNotFoundError } from '../../../errors/AppErrors'
import { TRouteParams } from '../../router'

export const berryRanchInfo = async (data: TRouteParams): Promise<RouteResponse> => {
  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
    include: {
      teamPoke1: true,
      teamPoke2: true,
      teamPoke3: true,
      teamPoke4: true,
      teamPoke5: true,
      teamPoke6: true,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const route = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
    include: {
      upgrades: {
        include: {
          base: true,
        },
      },
      Ranch: {
        include: {
          ranchSlots: {
            include: {
              berryTress: true,
            },
          },
        },
      },
    },
  })

  if (!route) throw new RouteNotFoundError(player.name, data.groupCode)
  if (!route.upgrades.map(upg => upg.base.name).includes('berry-ranch'))
    throw new RouteDoesNotHaveUpgradeError('berry-ranch')

  const imageUrl = await iGenBerryRanch(route.Ranch)

  return {
    message: `
`,
    status: 200,
    imageUrl,
  }
}
