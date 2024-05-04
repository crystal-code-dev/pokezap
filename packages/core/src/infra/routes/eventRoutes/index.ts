import { IResponse } from '../../../server/models/IResponse'
import { TRouteParams } from '../router'

const message = `🎣🐟 *EVENTO DE PESCARIA* 🎣🐟
📅 SABADO E DOMINGO 📅

Cardumes enormes de magikarps estão aparecendo em *fishing-spot*!
Muitos magikarps gigantes e até shiny! 
Utilize "pz. travel" e vá para fishing-spot capturar o máximo que puder!

🥇 Premiação para os que somarem mais pontos
🥇 Gigantes e shiny valem mais!
😨 Cuidado com o Shiny Gyarados! [d]
🕐 Os cardumes aparecem entre: 8h - 9h, 12h - 13h, 16h - 17h, 20h - 21h
`

export const eventRoutes = async (data: TRouteParams): Promise<IResponse> => {
  return {
    message,
    status: 200,
  }
}
