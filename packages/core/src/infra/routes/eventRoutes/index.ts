import { eventText } from '../../../server/constants/eventText'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'
import { eventInfo } from './eventInfo'

const subRouteMap = new Map<string, any>([
  ['INFO', eventInfo],
  ['RANK', eventInfo],
  ['RANKING', eventInfo],
])

export const eventRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , subRoute] = data.routeParams

  const route = subRouteMap.get(subRoute ?? '')
  if (!route)
    return {
      message: eventText,
      status: 200,
    }

  return await route(data)
}
