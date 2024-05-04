import prisma from '../../../../../prisma-provider/src'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { PlayerNotFoundError } from '../../errors/AppErrors'
import { TRouteParams } from '../router'

export const playerEnergy = async (data: TRouteParams): Promise<RouteResponse> => {
  const player = await prisma.player.findUnique({
    where: {
      phone: data.playerPhone,
    },
  })

  if (!player) throw new PlayerNotFoundError(data.playerName)

  return {
    message: `*#${player.id} ${player.name}* possui ${player.energy} de energia.  `,
    status: 200,
  }
}
