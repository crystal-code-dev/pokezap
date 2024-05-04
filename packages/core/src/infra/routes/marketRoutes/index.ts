import { RouteResponse } from '../../../server/models/RouteResponse'
import { MissingParametersMarketRouteError, SubRouteNotFoundError } from '../../errors/AppErrors'
import { TRouteParams } from '../router'
import { marketAccept } from './marketAccept'
import { marketAnnounce } from './marketAnnounce'
import { marketOffers } from './marketOffers'

const subRouteMap = new Map<string, any>([
  ['ANNOUNCE', marketAnnounce],
  ['ANOUNCE', marketAnnounce],
  ['ANUNCIAR', marketAnnounce],

  ['OFFER', marketOffers],
  ['OFFERS', marketOffers],
  ['CHECK', marketOffers],
  ['OFERTAS', marketOffers],

  ['ACCEPT', marketAccept],
  ['ACEITAR', marketAccept],
  ['ACEPT', marketAccept],
])

export const marketRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , subRoute] = data.routeParams
  if (!subRoute) throw new MissingParametersMarketRouteError()

  const route = subRouteMap.get(subRoute)
  if (!route) throw new SubRouteNotFoundError(subRoute)

  return await route(data)
}
