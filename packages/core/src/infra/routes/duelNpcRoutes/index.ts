import prisma from '../../../../../prisma-provider/src'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { MissingParametersDuelRouteError, RouteNotFoundError, SubRouteNotFoundError } from '../../errors/AppErrors'
import { TRouteParams } from '../router'
import { duelNpcFind } from './duelNpcFind'
import { duelNpcInfo } from './duelNpcInfo'

const subRouteMap = new Map<string, any>([
  ['INFO', duelNpcInfo],
  ['FIND', duelNpcFind],
])

export const duelNpcRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const gameRoom = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
  })
  if (!gameRoom) throw new RouteNotFoundError('', '')

  const [, , subRoute] = data.routeParams
  if (!subRoute) throw new MissingParametersDuelRouteError()

  const route = subRouteMap.get(subRoute)
  if (!route) throw new SubRouteNotFoundError(subRoute)

  return await route(data)
}
