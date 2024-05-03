import prisma from '../../../../../prisma-provider/src'
import { sendMessage } from '../../helpers/sendMessage'

export const pokemonCenterJob = async () => {
  const gameRooms = await prisma.gameRoom.findMany({
    where: {
      mode: 'route',
      upgrades: {
        some: {
          base: {
            name: 'pokemon-center',
          },
        },
      },
    },
    include: {
      players: true,
    },
  })

  for (const gameRoom of gameRooms) {
    await prisma.player.updateMany({
      where: {
        id: {
          in: gameRoom.players.map(player => player.id),
        },
      },
      data: {
        energy: {
          increment: 2,
        },
      },
    })

    try {
      await sendMessage({
        chatId: gameRoom.phone,
        content: `🔋💞 Centro pokemon da rota *#${gameRoom.id}* acaba de fornecer 2 energia extra! 🔋💞`,
      })
    } catch (e: any) {}
  }
}
