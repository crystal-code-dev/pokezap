import prisma from '../../../../../../prisma-provider/src'
import { IResponse } from '../../../../server/models/IResponse'
import { ItemNotFoundError, PlayerNotFoundError } from '../../../errors/AppErrors'
import { TRouteParams } from '../../router'

export const useEther = async (data: TRouteParams): Promise<IResponse> => {
  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const item = await prisma.item.findFirst({
    where: {
      baseItem: {
        name: 'ether',
      },
      ownerId: player.id,
    },
  })

  if (!item || item.amount <= 0) throw new ItemNotFoundError('ether')

  await prisma.$transaction([
    prisma.player.update({
      where: {
        id: player.id,
      },
      data: {
        energy: {
          increment: 2,
        },
      },
    }),

    prisma.item.update({
      where: {
        id: item.id,
      },
      data: {
        amount: {
          decrement: 1,
        },
      },
    }),
  ])

  return {
    message: `🔋 *${player.name}* usou ether e restarou 2 energia.`,
    status: 200,
    data: null,
  }
}
