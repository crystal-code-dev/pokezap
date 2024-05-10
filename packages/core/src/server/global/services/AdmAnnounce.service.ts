import prisma from '../../../../../prisma-provider/src'
import { GameAreaName } from '../../../../../prisma-provider/src/types'
import { sendMessage } from '../../helpers/sendMessage'

export interface AdmAnnounceServiceClassResponse {
  success: boolean
}

class AdmAnnounceServiceClass {
  async execute(): Promise<AdmAnnounceServiceClassResponse> {
    const gameRooms = await prisma.gameRoom.findMany({
      where: {
        phone: {
          contains: '@g.us',
        },
        gameArea: GameAreaName.ROUTE,
      },
    })

    for (const gameRoom of gameRooms) {
      const newName = gameRoom.name

      await sendMessage({
        chatId: gameRoom.phone,
        content: `📢 *Anúncio - Atualizações* 📢

        Para conferir:        
        https://chat.whatsapp.com/DvOexb2MK5uGGxaG85zZaC        
        `,
      })

      await new Promise(resolve => setTimeout(() => resolve(9), 1000))
    }

    return {
      success: true,
    }
  }
}

export const AdmAnnounceService = new AdmAnnounceServiceClass()
