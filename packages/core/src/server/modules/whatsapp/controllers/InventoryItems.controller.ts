import { iGenInventoryItems } from '../../../../../../image-generator/src'
import { IWhatsappController, IWhatsappControllerExecuteParams } from '../../../../interfaces/IWhatsappController'
import { inventoryItems } from '../../../global/services/InventoryItems.service'

class InventoryItemsControllerClass implements IWhatsappController {
  async execute(data: IWhatsappControllerExecuteParams) {
    const { items } = await inventoryItems.execute(data)
    const imageUrl = iGenInventoryItems({
      items,
    })
  }
}

export const InventoryItemsController = new InventoryItemsControllerClass()
