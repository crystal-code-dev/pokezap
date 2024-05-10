import prisma from '../../../../../prisma-provider/src'
import { GameAreaName } from '../../../../../prisma-provider/src/types'
import { sendMessage } from '../../../server/helpers/sendMessage'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'

export const announce = async (data: TRouteParams): Promise<RouteResponse> => {
  const gameRooms = await prisma.gameRoom.findMany({
    where: {
      phone: {
        contains: '@g.us',
      },
      gameArea: GameAreaName.ROUTE,
    },
  })

  const promises = []

  for (const gameRoom of gameRooms) {
    const newName = gameRoom.name

    promises.push(
      sendMessage({
        chatId: gameRoom.phone,
        content: `📢 *Anúncio - Atualizações* 📢

        Para conferir:        
        https://chat.whatsapp.com/DvOexb2MK5uGGxaG85zZaC        
        `,
      })
    )
  }

  await Promise.all(promises)

  return {
    message: ``,
    react: '✔',
    status: 200,
    data: null,
  }
}
