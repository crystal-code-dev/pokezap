import prisma from '../../../../../prisma-provider/src'
import {
  InsufficientFundsError,
  InvalidChildrenAmountError,
  MissingParametersBreedRouteError,
  PlayerNotFoundError,
  PlayersPokemonNotFoundError,
  PokemonAlreadyHasChildrenError,
  TypeMissmatchError,
  UnexpectedError,
} from '../../../infra/errors/AppErrors'
import { sendMessage } from '../../../server/helpers/sendMessage'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { breed } from '../../../server/modules/pokemon/breed'
import { getBreedCost } from '../../../server/modules/pokemon/getBreedCost'
import { getChildrenCount } from '../../../server/modules/pokemon/getChildrenCount'
import { TRouteParams } from '../router'

export const pokemonBreed2 = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , pokemonId1String, pokemonId2String, desiredChildrenAmountString] = data.routeParams
  const desiredChildrenAmount = Number(desiredChildrenAmountString)
  if (!pokemonId1String || !pokemonId2String) throw new MissingParametersBreedRouteError()
  if (isNaN(desiredChildrenAmount) || desiredChildrenAmount > 4) throw new InvalidChildrenAmountError()

  const pokemonId1 = Number(pokemonId1String.slice(pokemonId1String.indexOf('#') + 1))
  if (isNaN(pokemonId1)) throw new TypeMissmatchError(pokemonId1String, 'number')

  const pokemonId2 = Number(pokemonId2String.slice(pokemonId2String.indexOf('#') + 1))
  if (isNaN(pokemonId2)) throw new TypeMissmatchError(pokemonId2String, 'number')

  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
  })

  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  const pokemon1 = await prisma.pokemon.findFirst({
    where: {
      id: pokemonId1,
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
  if (!pokemon1) throw new PlayersPokemonNotFoundError(pokemonId1, player.name)

  const pokemon2 = await prisma.pokemon.findFirst({
    where: {
      id: pokemonId2,
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
  if (!pokemon2) throw new PlayersPokemonNotFoundError(pokemonId2, player.name)

  const breedCost = getBreedCost(desiredChildrenAmount, pokemon1, pokemon2)
  if (breedCost.error)
    throw new PokemonAlreadyHasChildrenError(breedCost.parentId, breedCost.parentName, breedCost.childrenAmount)
  const { totalCost, shardCost } = breedCost

  if (!totalCost) throw new UnexpectedError('no breed cost found')

  if (player.cash < totalCost) throw new InsufficientFundsError(player.name, player.cash, totalCost ?? 0)

  await prisma.player.update({
    where: {
      id: player.id,
    },
    data: {
      cash: {
        decrement: totalCost,
      },
      pokeShards: {
        decrement: shardCost,
      },
    },
  })

  let updatedPoke1ChildrenCount = getChildrenCount(pokemon1)
  let updatedPoke2ChildrenCount = getChildrenCount(pokemon2)

  for (let i = 0; i < desiredChildrenAmount; i++) {
    const newBaby = await breed({
      poke1: pokemon1,
      poke2: pokemon2,
    })

    if (typeof newBaby === 'string') {
      return {
        message: newBaby,
        status: 200,
        data: null,
      }
    }

    const updateChildrenData = (counter: number) => {
      if (counter === 0) {
        counter++
        return { childrenId1: newBaby.id }
      }
      if (counter === 1) {
        counter++
        return { childrenId2: newBaby.id }
      }
      if (counter === 2) {
        counter++
        return { childrenId3: newBaby.id }
      }
      if (counter === 3) {
        counter++
        return { childrenId4: newBaby.id }
      }
      throw new UnexpectedError('pokemonBreed2')
    }

    await prisma.pokemon.update({
      where: {
        id: pokemon1.id,
      },
      data: updateChildrenData(updatedPoke1ChildrenCount),
    })

    await prisma.pokemon.update({
      where: {
        id: pokemon2.id,
      },
      data: updateChildrenData(updatedPoke2ChildrenCount),
    })

    await sendMessage({
      chatId: data.groupCode,
      content: `#${newBaby.id} foi gerado por breed de #${pokemon1.id} ${pokemon1.baseData.name} e #${pokemon2.id} ${pokemon2.baseData.name}`,
    })

    updatedPoke1ChildrenCount++
    updatedPoke2ChildrenCount++
  }
  return {
    message: ``,
    react: '✔',
    status: 200,
    data: null,
  }
}
