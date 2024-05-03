import { IResponse } from '../../../server/models/IResponse'
import { TRouteParams } from '../router'
import { travel } from './travel'
import { travelInfo } from './travelInfo'

const routesMap = new Map<string, any>([])

export const travelRoutes = async (data: TRouteParams): Promise<IResponse> => {
  const [, , subRouteName] = data.routeParams
  if (!subRouteName) return await travelInfo(data)

  return await travel(data)
}
