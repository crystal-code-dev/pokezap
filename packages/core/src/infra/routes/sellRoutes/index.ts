import { MissingParametersTradeRouteError, SubRouteNotFoundError } from '../../../infra/errors/AppErrors'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'
import { sellItem } from './sellItem.ts'
import { sellManyPokemon } from './sellManyPokemon'
import { sellPokemon } from './sellPokemon'

const routesMap = new Map<string, any>([
  ['POKE', sellPokemon],
  ['ALL-POKE', sellManyPokemon],
  ['POKEMON', sellPokemon],
  ['POKES', sellPokemon],
  ['POKEMONS', sellPokemon],
  ['ITEN', sellItem],
  ['ITEM', sellItem],
  ['ITENS', sellItem],
  ['ITEMS', sellItem],
])

export const sellRoutes = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , subRouteName] = data.routeParams
  if (!subRouteName) throw new MissingParametersTradeRouteError()

  const route = routesMap.get(subRouteName)
  if (!route) throw new SubRouteNotFoundError(subRouteName)

  return await route(data)
}
