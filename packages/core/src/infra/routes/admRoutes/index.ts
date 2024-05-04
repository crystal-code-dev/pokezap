import { RouteResponse } from '../../../server/models/RouteResponse'
import { MissingParametersMarketRouteError, SubRouteNotFoundError } from '../../errors/AppErrors'
import { TRouteParams } from '../router'
import { announce } from './announce'
import { duelX1Generate } from './duelX1Generate'
import { maintenance } from './maintenance'

const subRouteMap = new Map<string, any>([
  ['DUEL', duelX1Generate],
  ['MAINTENANCE', maintenance],
  ['ANNOUNCE', announce],
])

export const admRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , subRoute] = data.routeParams
  if (!['5516988675837@c.us', '5516981453197@c.us'].includes(data.playerPhone))
    return {
      react: '💤',
      message: '',
      status: 300,
    }
  if (!subRoute) throw new MissingParametersMarketRouteError()

  const route = subRouteMap.get(subRoute)
  if (!route) throw new SubRouteNotFoundError(subRoute)

  return await route(data)
}
