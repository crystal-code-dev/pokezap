import prisma from '../../../../../prisma-provider/src'
import { PlayerNotFoundError, RouteNotFoundError } from '../../../infra/errors/AppErrors'
import { TRouteParams } from '../../../infra/routes/router'
import { RouteResponse } from '../../../server/models/RouteResponse'

export const routeExit = async (data: TRouteParams): Promise<RouteResponse> => {
  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerName)

  const route = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
  })

  if (!route) throw new RouteNotFoundError(player.name, data.groupCode)

  const updatedRoute = await prisma.gameRoom.update({
    where: {
      id: route.id,
    },
    data: {
      players: {
        disconnect: {
          id: player.id,
        },
      },
    },
  })

  return {
    message: `*${player.name}* saiu de *${updatedRoute.inGameName}*.`,
    status: 200,
    data: null,
  }
}
