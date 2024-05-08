import prisma from '../../../../../../prisma-provider/src'
import { RouteResponse } from '../../../../server/models/RouteResponse'
import {
  InsufficientBazarTicketsError,
  InsufficientFundsError,
  ItemNotAvailableInBazarError,
  MissingParameterError,
  PlayerNotFoundError,
  RouteDoesNotHaveUpgradeError,
  RouteNotFoundError,
  TypeMissmatchError,
} from '../../../errors/AppErrors'
import { TRouteParams } from '../../router'
import { bazarOffers } from './bazarOffers'

export const bazarBuy = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , , itemStringUpper, amountString] = data.routeParams
  if (!itemStringUpper) throw new MissingParameterError('Nome do item')

  const itemString = itemStringUpper.toLocaleLowerCase()

  const offer = bazarOffers.find(offer => offer.name === itemString)

  if (!offer) throw new ItemNotAvailableInBazarError(itemString)

  const amount = amountString ? Number(amountString) : 1
  if (isNaN(amount)) throw new TypeMissmatchError(amountString, 'NUMERO')

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

  if (!route) throw new RouteNotFoundError(player.name, data.groupCode)
  if (!route.upgrades.map(upg => upg.base.name).includes('bazar')) throw new RouteDoesNotHaveUpgradeError('bazar')

  const { name, tickets, cash } = offer

  const playerBazarTickets = player.ownedItems.find(item => item.name === 'bazar-ticket')

  if (player.cash < amount * cash) throw new InsufficientFundsError(player.name, player.cash, amount * cash)
  if (!playerBazarTickets || playerBazarTickets.amount < amount * tickets)
    throw new InsufficientBazarTicketsError(player.name, playerBazarTickets?.amount ?? 0, amount * tickets)

  const transaction = await prisma.$transaction([
    prisma.item.upsert({
    where: {
      ownerId_name: {
        ownerId: player.id,
        name,
      },
    },
    create: {
      name,
      amount,
      ownerId: player.id,
    },
    update: {
      amount: {
        increment: amount,
      },
    },
  }),
    prisma.player.update({
      where:{
        id: player.id
      },
      data:{
        cash: {
          decrement: cash
        }
      }
    }),
    prisma.item.update({
      where:{
        ownerId_name:{
          ownerId: player.id,
          name: "bazar-ticket"
        }
      },
      data:{
        amount:{
          decrement: tickets
        }
      }
    })
  ])


  return {
    message: `🛒 *${player.name}* acaba de comprar ${amount} *${name}* no bazar! 🛒
`,
    status: 200,
  }
}
