import prisma from '../../../../../../prisma-provider/src'
import { RouteResponse } from '../../../../server/models/RouteResponse'
import { PlayerNotFoundError, UpgradeNotFoundError } from '../../../errors/AppErrors'
import { TRouteParams } from '../../router'
import { bazarOffers } from './bazarOffers'

export const bazarInfo = async (data: TRouteParams): Promise<RouteResponse> => {
  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
    include: {
      ownedItems: {
        include: {
          baseItem: true,
        },
      },
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const route = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
    include: {
      activeWildPokemon: true,
      upgrades: {
        include: {
          base: true,
        },
      },
    },
  })

  if (!route?.upgrades.some(upg => upg.base.name === 'bazar')) throw new UpgradeNotFoundError('bazar')

  const bazarItemDisplay = bazarOffers.map(offer => `*${offer.name}* - 💲${offer.cash} - 🎫${offer.tickets}`).join('\n')

  return {
    message: `🛒 *Bazar* 🛒

Utilize: pz. bazar buy item quantidade
${bazarItemDisplay}
[d]
`,
    status: 200,
  }
}
