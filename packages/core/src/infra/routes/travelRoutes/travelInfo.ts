import path from 'path'
import { IResponse } from '../../../server/models/IResponse'
import { TRouteParams } from '../router'

export const travelInfo = async (data: TRouteParams): Promise<IResponse> => {
  const imageUrl = path.join(__dirname, '../../../assets/sprites/maps/kanto.png')
  return {
    message: `🗺 Mapa de Kanto 🗺 - [d]

Para viajar: pz. travel nome-do-local
    
1 - 🎣 fishing-spot
2 - 🤿 diving-spot`,
    status: 200,
    data: null,
    imageUrl,
  }
}
