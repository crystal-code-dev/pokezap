import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'
import { teamInfo } from './teamInfo'
import { teamLoad } from './teamLoad'
import { teamMainPoke } from './teamMainPoke'
import { teamSave } from './teamSave'
import { teamSet } from './teamSet'

const routesMap = new Map<string, any>([
  ['SAVE', teamSave],
  ['SALVAR', teamSave],
  ['LOAD', teamLoad],
  ['CARREGAR', teamLoad],
  ['MAINPOKE', teamMainPoke],
  ['PRINCIPAL', teamMainPoke],
  ['MAIN', teamMainPoke],
  ['MAIN-POKE', teamMainPoke],
  ['POKE-PRINCIPAL', teamMainPoke],
])

export const teamRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , subRouteName] = data.routeParams
  if (!subRouteName) return await teamInfo(data)

  const route = routesMap.get(subRouteName)
  if (!route) return await teamSet(data)

  return await route(data)
}
