import prisma from '../../../../../prisma-provider/src'
import { IResponse } from '../../../server/models/IResponse'
import {
  PlayerNotFoundError,
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
])

export const travel = async (data: TRouteParams): Promise<IResponse> => {
  const [, , destinationString] = data.routeParams

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
