import prisma from '../../../../../prisma-provider/src'
import { sendMessage } from '../../../server/helpers/sendMessage'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { RouteNotFoundError, SendEmptyMessageError, UnexpectedError } from '../../errors/AppErrors'
import { TRouteParams } from '../router'
import { tournamentStart } from './tournamentStart'

export const tournamentCreate = async (data: TRouteParams): Promise<RouteResponse> => {
  if (data.playerPhone !== '5516988675837@c.us') throw new SendEmptyMessageError()
  const [, , , gameRoomIdString] = data.routeParams

  const gameRoomId = Number(gameRoomIdString)

  if (isNaN(gameRoomId)) throw new UnexpectedError('gameRoomIdString must be a number')

  const gameRoom = await prisma.gameRoom.findFirst({
    where: {
      id: gameRoomId,
    },
  })

  if (!gameRoom) throw new RouteNotFoundError('', gameRoomIdString)

  const tournament = await prisma.tournament.create({
    data: {
      cashPrize: 1000,
      gameroomId: gameRoomId,
      gymLeaderId: 1,
      active: false,
    },
  })

  sendMessage({
    chatId: gameRoom.phone,
    content: `
  *INSCRIÇÕES PARA O TORNEIO ABERTAS!*

  O torneio se iniciará em breve, para entrar utilize:
  pz. torneio entrar

  [dsb]
  `,
  })

  setTimeout(() => {
    try {
      tournamentStart({ ...data, routeParams: ['pz', 'torneio', 'start', gameRoomIdString] })
    } catch (e: any) {
      console.error(e)
    }
  }, 1000 * 20)

  return {
    react: '✔',
    status: 200,
    message: '',
  }
}
