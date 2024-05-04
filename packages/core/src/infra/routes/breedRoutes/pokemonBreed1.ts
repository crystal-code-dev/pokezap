import { iGenPokemonBreed } from '../../../../../image-generator/src'
import prisma from '../../../../../prisma-provider/src'
import {
  CantBreedShiniesError,
  MissingParametersBreedRouteError,
  PlayerNotFoundError,
  PlayersPokemonNotFoundError,
  PokemonAlreadyHasChildrenError,
  TypeMissmatchError,
} from '../../../infra/errors/AppErrors'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { getBreedCost } from '../../../server/modules/pokemon/getBreedCost'
import { TRouteParams } from '../router'
import { pokemonBreed2 } from './pokemonBreed2'

export const pokemonBreed1 = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , id1, id2, amount] = data.routeParams
  if (!id1 || !id2) throw new MissingParametersBreedRouteError()
  if (amount) return await pokemonBreed2(data)

  const idFix1 = Number(id1.slice(id1.indexOf('#') + 1))
  if (typeof idFix1 !== 'number') throw new TypeMissmatchError(id1, 'number')

  const idFix2 = Number(id2.slice(id2.indexOf('#') + 1))
  if (typeof idFix2 !== 'number') throw new TypeMissmatchError(id2, 'number')

  const player = await prisma.player.findUnique({
    where: {
      phone: data.playerPhone,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const pokemon1 = await prisma.pokemon.findFirst({
    where: {
      id: idFix1,
      ownerId: player.id,
    },
    include: {
      baseData: true,
      talent1: true,
      talent2: true,
      talent3: true,
      talent4: true,
      talent5: true,
      talent6: true,
      talent7: true,
      talent8: true,
      talent9: true,
    },
  })
  if (!pokemon1) throw new PlayersPokemonNotFoundError(idFix1, player.name)

  const pokemon2 = await prisma.pokemon.findFirst({
    where: {
      id: idFix2,
      ownerId: player.id,
    },
    include: {
      baseData: true,
      talent1: true,
      talent2: true,
      talent3: true,
      talent4: true,
      talent5: true,
      talent6: true,
      talent7: true,
      talent8: true,
      talent9: true,
    },
  })
  if (!pokemon2) throw new PlayersPokemonNotFoundError(idFix2, player.name)

  if (pokemon1.childrenId4) throw new PokemonAlreadyHasChildrenError(pokemon1.id, pokemon1.baseData.name, 4)
  if (pokemon2.childrenId4) throw new PokemonAlreadyHasChildrenError(pokemon2.id, pokemon1.baseData.name, 4)
  if (pokemon1.isShiny || pokemon2.isShiny) throw new CantBreedShiniesError()

  const cost1 = getBreedCost(1, pokemon1, pokemon2)
  const cost2 = getBreedCost(2, pokemon1, pokemon2)
  const cost3 = getBreedCost(3, pokemon1, pokemon2)
  const cost4 = getBreedCost(4, pokemon1, pokemon2)

  const imageUrl = await iGenPokemonBreed({
    pokemon1: pokemon1,
    pokemon2: pokemon2,
  })

  return {
    message: `*${player.name}* inicou o processo de breed entre:
    #${pokemon1.id} ${pokemon1.baseData.name} e #${pokemon2.id} ${pokemon2.baseData.name}
    
    👍 - 1 filhote --- 💲 $${cost1?.totalCost ?? '❌ Não é possível'}
    ❤ - 2 filhotes -- 💲 $${cost2?.totalCost ?? '❌ Não é possível'}
    😂 - 3 filhotes -- 💲 $${cost3?.totalCost ?? '❌ Não é possível'}
    😮 - 4 filhotes -- 💲 $${cost4?.totalCost ?? '❌ Não é possível'}`,
    status: 200,
    data: null,
    imageUrl: imageUrl,
    actions: [
      `pz. breed ${pokemon1.id} ${pokemon2.id} 1`,
      `pz. breed ${pokemon1.id} ${pokemon2.id} 2`,
      `pz. breed ${pokemon1.id} ${pokemon2.id} 3`,
      `pz. breed ${pokemon1.id} ${pokemon2.id} 4`,
    ],
  }
}
