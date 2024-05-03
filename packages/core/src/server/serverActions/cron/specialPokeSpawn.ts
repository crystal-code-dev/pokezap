import { iGenWildPokemon } from '../../../../../image-generator/src'
import prisma from '../../../../../prisma-provider/src'
import { metaValues } from '../../../constants/metaValues'
import { GameRoom } from '../../../types/prisma'
import { sendMessage } from '../../helpers/sendMessage'
import { generateWildPokemon } from '../../modules/pokemon/generate/generateWildPokemon'

type TParams = {
  pokeNames: string[]
  levelRange: [number, number]
  shinyChance?: number
  giantChance?: number
  gameRoom: GameRoom
}

export const specialPokeSpawn = async (data: TParams) => {
  const { gameRoom, pokeNames, levelRange } = data

  if (gameRoom.invasorId && Math.random() < 0.5) {
    sendMessage({
      chatId: gameRoom.phone,
      content: `Um pokemon selvagem apareceu, mas foi afugentado por algum invasor.

    (utilize o comando: "route verify" ou "route forfeit")`,
    })
  }

  const basePokemons = await prisma.basePokemon.findMany({
    where: {
      name: {
        in: pokeNames,
      },
    },
    include: {
      skills: true,
    },
  })

  const baseData = basePokemons[Math.floor(Math.random() * basePokemons.length)]
  const level = Math.floor(Math.random() * (levelRange[1] - levelRange[0]))

  const shinyChance = data.shinyChance ?? 0.05

  const newWildPokemon = await generateWildPokemon({
    baseData,
    level,
    shinyChance,
    savage: true,
    isAdult: true,
    gameRoomId: gameRoom.id,
  })

  const imageUrl = await iGenWildPokemon({
    pokemon: newWildPokemon,
  })
  const displayName = newWildPokemon.isShiny
    ? `shiny ${newWildPokemon.baseData.name}`
    : `${newWildPokemon.baseData.name}`

  const response = await sendMessage({
    chatId: gameRoom.phone,
    imageUrl,
    options: {
      caption: `Um *${displayName}* selvagem de nível ${newWildPokemon.level} acaba de aparecer!
Ações:
👍 - Batalhar
❤ - Batalhar
`,
    },
  })

  if (!response?.id?.id) return

  await prisma.message.create({
    data: {
      msgId: response.id.id,
      type: '?',
      body: '',
      actions: [`pz. battle ${newWildPokemon.id} fast`, `pz. battle ${newWildPokemon.id} fast`],
    },
  })

  setTimeout(() => {
    pokemonRanAwayWarning({ prisma, newWildPokemon, data, gameRoom })
  }, metaValues.wildPokemonFleeTimeInSeconds * 1000)
}

const pokemonRanAwayWarning = async ({ prisma, newWildPokemon, _, gameRoom }: any) => {
  const pokemon = await prisma.pokemon.findFirst({
    where: {
      id: newWildPokemon.id,
    },
    include: {
      defeatedBy: true,
      baseData: true,
    },
  })

  if (!pokemon) return
  if (pokemon.defeatedBy.length === 0) {
    sendMessage({
      chatId: gameRoom.phone,
      content: `#${pokemon.id} - ${pokemon.baseData.name} fugiu.`,
    })
  }
}
