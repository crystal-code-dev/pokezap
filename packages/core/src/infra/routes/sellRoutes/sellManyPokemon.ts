import prisma from '../../../../../prisma-provider/src'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { getTalentPurity } from '../../../server/modules/pokemon/getTalentPurity'
import {
  CantSellFavoritePokemonError,
  CantSellPokemonInTeamError,
  FilterNotAvailableError,
  MissingParameterError,
  PlayerDoestNotOwnThePokemonError,
  PlayerNotFoundError,
  TypeMissmatchError,
  ZeroPokemonsFoundError,
} from '../../errors/AppErrors'
import { TRouteParams } from '../router'

enum SellManyPokemonFilterNames {
  CHILDREN = 'CHILDREN',
  PURITY = 'PURITY',
}

const filterMap = new Map<string, SellManyPokemonFilterNames>([
  ['EGG', SellManyPokemonFilterNames.CHILDREN],
  ['EGGS', SellManyPokemonFilterNames.CHILDREN],
  //
  ['TALENT', SellManyPokemonFilterNames.PURITY],
  ['TALENT', SellManyPokemonFilterNames.PURITY],
  ['PURITY', SellManyPokemonFilterNames.PURITY],
  ['TALENTO', SellManyPokemonFilterNames.PURITY],
  ['TALENTOS', SellManyPokemonFilterNames.PURITY],
])

export const sellManyPokemon = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , filterTypeString, valueString] = data.routeParams

  const filterType: SellManyPokemonFilterNames | undefined = filterMap.get(filterTypeString)

  if (!filterType) throw new FilterNotAvailableError(filterTypeString)
  if (!valueString) throw new MissingParameterError('Valor para o filtro')
  const value = Number(valueString)
  if (isNaN(value)) throw new TypeMissmatchError(valueString, 'NÚMERO')

  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
    include: {
      ownedPokemons: true,
    },
  })

  if (!player) throw new PlayerNotFoundError(data.playerPhone)

  let where: any = undefined

  console.log(filterType)

  if (filterType === SellManyPokemonFilterNames.CHILDREN)
    where = {
      childrenId1: {
        not: null,
      },
      childrenId2: {
        not: null,
      },
      childrenId3: {
        [value > 2 ? 'not' : 'equals']: null,
      },
      childrenId4: {
        [value > 3 ? 'not' : 'equals']: null,
      },
      ownerId: player.id,
      isAdult: true,
    }

  if (filterType === SellManyPokemonFilterNames.PURITY)
    where = {
      ownerId: player.id,
      isAdult: true,
    }

  let pokemons = await prisma.pokemon.findMany({
    where,
    include: {
      baseData: true,
      teamSlot1: true,
      teamSlot2: true,
      teamSlot3: true,
      teamSlot4: true,
      teamSlot5: true,
      teamSlot6: true,
      owner: true,
    },
  })

  if (filterType === SellManyPokemonFilterNames.PURITY) {
    pokemons = pokemons.filter(poke => getTalentPurity(poke) < value)
  }

  if (pokemons.length === 0) throw new ZeroPokemonsFoundError()

  let totalCash = 0

  for (const pokemon of pokemons) {
    if (pokemon.ownerId !== player.id) throw new PlayerDoestNotOwnThePokemonError(pokemon.id, player.name)
    if (pokemon.isFavorite)
      throw new CantSellFavoritePokemonError(pokemon.id, pokemon.nickName ?? pokemon.baseData.name)
    if (
      pokemon.teamSlot1 ||
      pokemon.teamSlot2 ||
      pokemon.teamSlot3 ||
      pokemon.teamSlot4 ||
      pokemon.teamSlot5 ||
      pokemon.teamSlot6
    )
      throw new CantSellPokemonInTeamError(pokemon.id)

    const pokemonSellPrice = Math.floor(
      35 + (pokemon.level ** 2 / 150) * 100 + (pokemon.baseData.BaseExperience ** 2 / 1200) * 50
    )

    totalCash += pokemonSellPrice
  }

  if (data.fromReact && data.routeParams[data.routeParams.length - 1] === 'CONFIRM') {
    await prisma.pokemon.updateMany({
      where: {
        id: {
          in: pokemons.map(p => p.id),
        },
      },
      data: {
        ownerId: null,
        gameRoomId: null,
        statusTrashed: true,
      },
    })

    await prisma.player.update({
      where: {
        id: player.id,
      },
      data: {
        cash: {
          increment: totalCash,
        },
      },
    })
    return {
      message: `${data.playerName} vendeu ${pokemons
        .map(poke => {
          return `#${poke.id} ${poke.baseData.name}`
        })
        .join(', ')} e obteve $${totalCash}.`,
      status: 200,
      data: null,
    }
  }

  return {
    message: `Deseja vender ${pokemons
      .map(poke => {
        return `#${poke.id} ${poke.baseData.name}`
      })
      .join(', ')} por $${totalCash}?
    👍 - CONFIRMAR`,
    status: 200,
    data: null,
    actions: [`pz. sell poke ${pokemons.map(poke => poke.id).join(' ')} confirm`],
  }
}
