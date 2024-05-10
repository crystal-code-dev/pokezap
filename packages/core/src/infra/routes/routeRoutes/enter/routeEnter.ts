import prisma from '../../../../../../prisma-provider/src'
import { GameAreaName } from '../../../../../../prisma-provider/src/types'
import { PlayerNotFoundError, SendEmptyMessageError } from '../../../../infra/errors/AppErrors'
import { TRouteParams } from '../../../../infra/routes/router'
import { RouteResponse } from '../../../../server/models/RouteResponse'

export const routeEnter = async (data: TRouteParams): Promise<RouteResponse> => {
  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
    include: {
      gameRoom: true,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerName)
  const gameRoom = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
  })

  if (!gameRoom || gameRoom.gameArea === GameAreaName.RAIDROOM) throw new SendEmptyMessageError()

  await prisma.player.update({
    where: {
      id: player.id,
    },
    data: {
      gameRoomId: gameRoom.id,
    },
  })

  return {
    message: `*${player.name}* acaba de chegar em *${gameRoom.inGameName}!*`,
    status: 200,
    data: null,
  }
}
