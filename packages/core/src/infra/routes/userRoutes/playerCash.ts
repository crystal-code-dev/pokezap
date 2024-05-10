import prisma from '../../../../../prisma-provider/src'
import { PlayerNotFoundError } from '../../../infra/errors/AppErrors'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'

export const playerCash = async (data: TRouteParams): Promise<RouteResponse> => {
  const player = await prisma.player.findUnique({
    where: {
      phone: data.playerPhone,
    },
  })

  if (!player) throw new PlayerNotFoundError(data.playerName)

  return {
    message: `*#${player.id} ${player.name}* possui $${player.cash}.  `,
    status: 200,
  }
}
