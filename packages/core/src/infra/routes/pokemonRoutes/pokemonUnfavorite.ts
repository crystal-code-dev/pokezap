import prisma from '../../../../../prisma-provider/src'
import { getPokemon } from '../../../server/helpers/getPokemon'
import { RouteResponse } from '../../../server/models/RouteResponse'
import {
  MissingParametersPokemonInformationError,
  PlayerNotFoundError,
  PokemonNotFoundError,
} from '../../errors/AppErrors'
import { TRouteParams } from '../router'

export const pokemonUnfavorite = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , pokemonIdString] = data.routeParams
  if (!pokemonIdString) throw new MissingParametersPokemonInformationError()

  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const pokemon = await getPokemon(prisma, pokemonIdString, player.id)
  if (!pokemon) throw new PokemonNotFoundError(pokemonIdString)

  await prisma.pokemon.update({
    where: {
      id: pokemon.id,
    },
    data: {
      isFavorite: false,
    },
  })

  return {
    message: ``,
    react: '👌',
    status: 200,
  }
}
