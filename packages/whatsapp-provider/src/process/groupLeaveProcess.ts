import { container } from 'tsyringe'
import { Client, GroupNotification, MessageMedia } from 'whatsapp-web.js'
import { ServerResponse } from '../../../core/src/types/ServerResponse'
import { logger } from '../helpers/logger'
import { requestServer } from '../helpers/requestServer'

export const groupLeaveProcess = async (notification: GroupNotification, initDate: Date) => {
  const msgDate = new Date(notification.timestamp * 1000)
  if (msgDate.getTime() < initDate.getTime()) return

  const zapClient = container.resolve<Client>('WhatsappClient')

  const playerPhone = (notification.id as any).participant
  const contact = await notification.getContact()
  const playerName = contact.pushname ?? contact.name ?? contact.shortName ?? 'Nome indefinido'
  logger.info(`${playerName} leaves ${notification.chatId}`)

  const response: ServerResponse = await requestServer({
    playerPhone,
    routeParams: ['PZ.', 'ROTA', 'LEAVE'],
    playerName,
    groupCode: notification.chatId,
  })

  const options: any = {}
  if (response.imageUrl) {
    options.media = MessageMedia.fromFilePath(response.imageUrl)
  }
  await zapClient.sendMessage(notification.chatId, response.message, options)
}
