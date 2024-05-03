import { IResponse } from '../../../server/models/IResponse'
import { TravelDestinationDisabledError, TravelDestinationNotFoundError } from '../../errors/AppErrors'
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
      inviteCode: 'KTqXS5md84SKt5BBehndTn',
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
