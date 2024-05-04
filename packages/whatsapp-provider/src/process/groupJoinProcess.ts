import { container } from 'tsyringe'
import { Client, GroupNotification, MessageMedia } from 'whatsapp-web.js'
import { ServerResponse } from '../../../../common/types/ServerResponse'
import { logger } from '../helpers/logger'
import { requestServer } from '../helpers/requestServer'

export const groupJoinProcess = async (notification: GroupNotification, initDate: Date) => {
  const msgDate = new Date(notification.timestamp * 1000)
  if (msgDate.getTime() < initDate.getTime()) return

  const zapClient = container.resolve<Client>('WhatsappClient')

  const playerPhone = (notification.id as any).participant
  const playerName = 'Nome indefinido'
  logger.info(`${playerPhone} joins ${notification.chatId}`)

  const response: ServerResponse = await requestServer({
    playerPhone,
    routeParams: ['PZ.', 'ROTA', 'ENTER'],
    playerName,
    groupCode: notification.chatId,
  })

  const options: any = {}
  if (response.imageUrl) {
    options.media = MessageMedia.fromFilePath(response.imageUrl)
  }
  await zapClient.sendMessage(notification.chatId, response.message, options)
}
