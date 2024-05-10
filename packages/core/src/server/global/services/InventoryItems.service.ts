import prisma from '../../../../../prisma-provider/src'
import { BaseItem, Item } from '../../../../../prisma-provider/src/types'
import { PlayerNotFoundError } from '../../../infra/errors/AppErrors'
import { IWhatsappControllerExecuteParams } from '../../../interfaces/IWhatsappController'

export interface InventoryItemsClassResponse {
  items: (Item & {
    baseItem: BaseItem
  })[]
}

class InventoryItemsClass {
  async execute({
    playerPhone,
    playerName,
    dataStrings,
    groupCode,
  }: IWhatsappControllerExecuteParams): Promise<InventoryItemsClassResponse> {
    const options = dataStrings

    const lastOption = options[options.length - 1]

    const numberPage = () => {
      if (!isNaN(Number(lastOption))) return Number(lastOption)
      return 1
    }

    const typeFilters = options
      .map(value => {
        if (isNaN(Number(value))) {
          if (['BALL', 'BALLS', 'POKEBALL', 'POKEBALLS'].includes(value)) return 'standard-balls special-balls'
          if (['PLATE', 'PLATES'].includes(value)) return 'plates'
          if (['GEM', 'GEMS', 'JEWEL'].includes(value)) return 'jewels'
        }
        return undefined
      })
      .filter(value => value !== undefined)
      .join(' ')
      .split(' ')
      .filter(value => value !== '')

    const player = await prisma.player.findFirst({
      where: {
        phone: playerPhone,
      },
      include: {
        ownedItems: {
          where: {
            amount: {
              gt: 0,
            },
            baseItem: {
              type: {
                in: typeFilters.length > 0 ? typeFilters : undefined,
              },
            },
          },
          skip: Math.max(0, (numberPage() - 1) * 19),
          take: 19,
          include: {
            baseItem: true,
          },
        },
      },
    })
    if (!player) throw new PlayerNotFoundError(playerPhone)

    return {
      items: player.ownedItems,
    }
  }
}

export const inventoryItems = new InventoryItemsClass()
