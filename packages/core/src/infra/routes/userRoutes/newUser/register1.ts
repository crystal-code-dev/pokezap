import { RouteResponse } from '../../../../server/models/RouteResponse'
import { TRouteParams } from '../../router'

export const register1 = async (data: TRouteParams): Promise<RouteResponse> => {
  return {
    message: `Muito bom, você já entendeu uma das formas de interagir com o bot do PokeZap!

    Vamos criar seu personagem agora? Me diga se ele será menino ou menina:
    👍 - menino
    ❤ - menina
    `,
    status: 200,
    actions: ['pokezap. iniciar menino', 'pz. iniciar menina'],
    data: null,
  }
}
