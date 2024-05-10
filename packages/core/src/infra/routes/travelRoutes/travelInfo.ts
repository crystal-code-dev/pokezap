import path from 'path'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'

export const travelInfo = async (data: TRouteParams): Promise<RouteResponse> => {
  const imageUrl = path.join(__dirname, '../../../assets/sprites/maps/kanto.png')
  return {
    message: `🗺 Mapa de Kanto 🗺 - [d]

Para viajar: pz. travel nome-do-local

🏡 home  _(Retornar à rota natal)_    
🎣 fishing-spot
🤿 diving-spot
⛰ rock-tunnel`,
    status: 200,
    data: null,
    imageUrl,
  }
}
