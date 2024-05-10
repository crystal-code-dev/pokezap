import { iGenWildPokemon } from '../../../../../image-generator/src'
import prisma from '../../../../../prisma-provider/src'
import { GameRoom, Player, PokemonBaseData } from '../../../../../prisma-provider/src/types'

import { generateWildPokemon } from './generate/generateWildPokemon'

type TParams = {
  player: Player
  gameRoom: GameRoom
}

type TResponse = {
  pokemon: PokemonBaseData
  imageUrl: string | undefined
}

export const spawnTutorialPokemon = async (data: TParams): Promise<TResponse> => {
  const baseExperienceTreshold = Math.floor(64 + (1 / 100) * 276)

  const basePokemons = await prisma.basePokemon.findMany({
    where: {
      BaseExperience: {
        lte: baseExperienceTreshold,
      },
      isMega: false,
      isRegional: false,
      isFirstEvolution: true,
    },
    include: {
      skills: true,
    },
  })

  const baseData = basePokemons[Math.floor(Math.random() * basePokemons.length)]
  const level = 1

  const wildPokemon = await generateWildPokemon({
    baseData,
    level,
    shinyChance: 0,
    savage: true,
    isAdult: true,
    gameRoomId: data.gameRoom.id,
  })

  const imageUrl = await iGenWildPokemon({
    pokemon: wildPokemon,
  })

  return { pokemon: wildPokemon, imageUrl }
}
