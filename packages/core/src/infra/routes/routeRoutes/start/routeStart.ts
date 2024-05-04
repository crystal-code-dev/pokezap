import prisma from '../../../../../../prisma-provider/src'
import { GameAreaName } from '../../../../../../prisma-provider/src/types'
import { PlayerNotFoundError, RouteAlreadyRegisteredError } from '../../../../infra/errors/AppErrors'
import { TRouteParams } from '../../../../infra/routes/router'
import { RouteResponse } from '../../../../server/models/RouteResponse'

export const routeStart = async (data: TRouteParams): Promise<RouteResponse> => {
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
  if (route) throw new RouteAlreadyRegisteredError()

  const newRoute = await prisma.gameRoom.create({
    data: {
      level: 1,
      experience: 0,
      gameArea: GameAreaName.PRIVATE,
      phone: data.groupCode,
      incenseCharges: 0,
      players: {
        connect: {
          id: player.id,
        },
      },
    },
  })

  return {
    message: `O grupo atual foi registrado com sucesso como: ROTA ${newRoute.id}`,
    status: 200,
    data: null,
  }
}
