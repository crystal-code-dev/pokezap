import prisma from '../../../../../prisma-provider/src'
import { RouteResponse } from '../../../server/models/RouteResponse'
import {
  PlayerNotFoundError,
  RouteDoesNotHaveUpgradeError,
  RouteNotFoundError,
  TravelDestinationDisabledError,
  TravelDestinationNotFoundError,
} from '../../errors/AppErrors'
import { TRouteParams } from '../router'

type TravelDestination = {
  id: number
  name: string
  groupPhone: string
  inviteCode: string
  requires: null | {
    level: number
    badgeIds: number[]
    itens: string[]
  }
  disabled?: boolean
}

const travelDestinationsMap = new Map<string, TravelDestination>([
  [
    'FISHING-SPOT',
    {
      id: 1,
      name: 'fishing-spot',
      groupPhone: '',
      inviteCode: 'F2fHcVRuJHvJyWYEhjbiw7',
      requires: null,
    },
  ],

  [
    'DIVING-SPOT',
    {
      id: 2,
      name: 'diving-spot',
      groupPhone: '',
      inviteCode: '',
      requires: null,
      disabled: true,
    },
  ],
  [
    'ROCK-TUNNEL',
    {
      id: 3,
      name: 'rock-tunnel',
      groupPhone: '',
      inviteCode: 'BQF5XSAwCSGCggk0raDqSo',
      requires: null,
    },
  ],
])

export const travel = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , destinationString] = data.routeParams

  const gameRoom = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
    include: {
      upgrades: {
        include: {
          base: true,
        },
      },
    },
  })

  if (!gameRoom) throw new RouteNotFoundError(data.playerName, data.groupCode)
  if (gameRoom.gameArea === 'ROUTE' && !gameRoom.upgrades.some(upg => upg.base.name === 'minivan'))
    throw new RouteDoesNotHaveUpgradeError('minivan')
  if (gameRoom.gameArea === 'PRIVATE' && !gameRoom.upgrades.some(upg => upg.base.name === 'minivan'))
    throw new RouteDoesNotHaveUpgradeError('minivan')

  if (['HOME', 'ROTA', 'VOLTAR', 'CASA'].includes(destinationString)) {
    const player = await prisma.player.findFirst({
      where: {
        phone: data.playerPhone,
      },
    })
    if (!player) throw new PlayerNotFoundError(data.playerPhone)

    return {
      message: `🗺 Mapa de Kanto 🗺
🚲 Para retornar à sua rota natal:

https://chat.whatsapp.com/${player.homeInviteCode}`,
      status: 200,
    }
  }

  const destination = travelDestinationsMap.get(destinationString)
  if (!destination) throw new TravelDestinationNotFoundError(destinationString)
  if (destination.disabled) throw new TravelDestinationDisabledError(destinationString)

  if (destination.requires) {
  }

  return {
    message: `🗺 Mapa de Kanto 🗺
🚲 Para acessar *${destination.name}*:

https://chat.whatsapp.com/${destination.inviteCode}`,
    status: 200,
    data: null,
  }
}
