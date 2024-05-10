import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'
import { travel } from './travel'
import { travelInfo } from './travelInfo'

const routesMap = new Map<string, any>([])

export const travelRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , subRouteName] = data.routeParams
  if (!subRouteName) return await travelInfo(data)

  return await travel(data)
}
