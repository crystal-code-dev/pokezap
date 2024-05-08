import { RouteResponse } from '../../../../server/models/RouteResponse'
import { SubRouteNotFoundError } from '../../../errors/AppErrors'
import { TRouteParams } from '../../router'
import { bazarBuy } from './bazarBuy'
import { bazarInfo } from './bazarInfo'

const subRouteMap = new Map<string, any>([
  // OUT ROUTES
  ['BUY', bazarBuy],
  ['COMPRAR', bazarBuy],

  // IN ROUTES
  ['INFO', bazarInfo],
])

export const bazarRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , subRoute] = data.routeParams
  if (!subRoute) return await bazarInfo(data)

  const route = subRouteMap.get(subRoute)
  if (!route) throw new SubRouteNotFoundError(subRoute)

  return await route(data)
}
