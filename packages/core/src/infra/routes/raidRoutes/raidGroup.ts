import prisma from '../../../../../prisma-provider/src'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { PlayerNotFoundError, RouteDoesNotHaveUpgradeError, RouteNotFoundError } from '../../errors/AppErrors'
import { TRouteParams } from '../router'

export const raidGroup = async (data: TRouteParams): Promise<RouteResponse> => {
  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
    include: {
      teamPoke1: true,
      gameRoom: true,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const gameRoom = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
    include: {
      upgrades: {
        include: {
          base: true,
        },
      },
      raid: true,
    },
  })

  if (!gameRoom) throw new RouteNotFoundError(player.name, data.groupCode)
  if (!gameRoom.upgrades.map(upg => upg.base.name).includes('bikeshop'))
    throw new RouteDoesNotHaveUpgradeError('bikeshop')

  return {
    message: `*${player.name}* deseja criar um grupo para RAID.

    Acesse uma das salas:
    1 - https://chat.whatsapp.com/C00ycdFwnLRI3yRciibE0f
    2 - https://chat.whatsapp.com/GMXUzCYC52m9ncLsp7FzNH
    3 - https://chat.whatsapp.com/Gl0w80P9OQV5pgcLQK0jsr`,
    status: 200,
    data: null,
  }
}
