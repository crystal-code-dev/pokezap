import prisma from '../../../../../../prisma-provider/src'
import { getPokemonRequestData } from '../../../../server/helpers/getPokemonRequestData'
import { IResponse } from '../../../../server/models/IResponse'
import {
  MissingParametersPokemonInformationError,
  PlayerNotFoundError,
  PokemonDoesNotHaveOwnerError,
  PokemonNotFoundError,
  UnexpectedError,
} from '../../../errors/AppErrors'
import { TRouteParams } from '../../router'

export const pokemonExperience = async (data: TRouteParams): Promise<IResponse> => {
  const [, , , pokemonIdString] = data.routeParams
  if (!pokemonIdString) throw new MissingParametersPokemonInformationError()

  let searchMode = 'string'

  const pokemonId = Number(pokemonIdString.slice(pokemonIdString.indexOf('#') + 1))
  if (!isNaN(pokemonId)) searchMode = 'number'

  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const pokemonRequestData = getPokemonRequestData({
    playerId: player.id,
    pokemonId: pokemonId,
    pokemonIdentifierString: pokemonIdString,
    searchMode,
    includeNotOwned: false,
  })
  if (!pokemonRequestData) throw new UnexpectedError('NO REQUEST DATA FOUND.')

  const pokemon = await prisma.pokemon.findFirst({
    where: pokemonRequestData.where,
    select: {
      nickName: true,
      level: true,
      experience: true,
      id: true,
      isAdult: true,
      baseData: {
        select: {
          name: true,
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!pokemon || (searchMode === 'string' && !pokemon.isAdult))
    throw new PokemonNotFoundError(pokemonRequestData.identifier)

  if (!pokemon.owner) throw new PokemonDoesNotHaveOwnerError(pokemon.id, pokemon.baseData.name)

  const level = pokemon.level
  const nextLevel = level + 1
  const neededExperience = nextLevel ** 3
  const currentExperience = pokemon.experience
  const ratio = (100 - (currentExperience / neededExperience) * 100).toFixed(1)

  return {
    message: `#${pokemon.id} *${
      pokemon.nickName ?? pokemon.baseData.name
    }* está à ${ratio}% de avançar ao nível ${nextLevel}`,
    status: 200,
    data: null,
  }
}
