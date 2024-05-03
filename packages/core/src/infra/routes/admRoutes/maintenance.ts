import prisma from '../../../../../prisma-provider/src'
import { groupChatNameUpdate } from '../../../server/helpers/groupChatNameUpdate'
import { IResponse } from '../../../server/models/IResponse'
import { TRouteParams } from '../router'

export const maintenance = async (data: TRouteParams): Promise<IResponse> => {
  const [, , , onOff] = data.routeParams

  const maintenanceOn = onOff === 'ON'

  const gameRooms = await prisma.gameRoom.findMany({
    where: {
      phone: {
        contains: '@g.us',
      },
    },
  })

  const promises = []

  if (maintenanceOn) {
    for (const gameRoom of gameRooms) {
      const newName = '[🛠 OFF] ' + gameRoom.name
      promises.push(
        groupChatNameUpdate({
          chatId: gameRoom.phone,
          newName,
        })
      )
    }
  } else {
    for (const gameRoom of gameRooms) {
      const newName = gameRoom.name

      promises.push(
        groupChatNameUpdate({
          chatId: gameRoom.phone,
          newName,
        })
      )
    }
  }

  await Promise.all(promises)

  return {
    message: ``,
    react: '✔',
    status: 200,
    data: null,
  }
}
