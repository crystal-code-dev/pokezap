import { Message } from 'whatsapp-web.js'
import { logger } from './logger'

export const deleteSentMessage = async (msg: Message) => {
  setTimeout(() => {
    try {
      msg.delete(true)
    } catch (e: any) {
      logger.error(e)
    }
  }, 10 * 1000 * 60)
}
