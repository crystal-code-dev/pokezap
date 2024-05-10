import { RouteResponse } from '../../../../server/models/RouteResponse'
import { MissingParameterError, SubRouteNotFoundError } from '../../../errors/AppErrors'
import { TRouteParams } from '../../router'

const subRouteMap = new Map<string, any>([])

export const berryRanchRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , subRoute] = data.routeParams
  if (!subRoute) throw new MissingParameterError('Ação')

  const route = subRouteMap.get(subRoute)
  if (!route) throw new SubRouteNotFoundError(subRoute)

  return await route(data)
}
