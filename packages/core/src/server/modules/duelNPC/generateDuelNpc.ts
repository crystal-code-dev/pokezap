import prisma from '../../../../../prisma-provider/src'
import { Difficulty, DuelNpc, GameAreaName, Gender, Types } from '../../../../../prisma-provider/src/types'
import { UnexpectedError } from '../../../infra/errors/AppErrors'
import { duelNpcNames } from '../../constants/duelNpcNames'
import { pokemonTypes } from '../../constants/pokemonTypes'
import { getRandomBetween2 } from '../../helpers/getRandomBetween2'
import { generateDuelNpcPokemons } from '../pokemon/generate/generateDuelNpcPokemon'

type TGenDuelNpcParams = {
  type?: Types
  gender?: Gender
  difficulty: Difficulty
}

const metaLevels: Record<Difficulty, number> = {
  ['EASY']: 70,
  ['MEDIUM']: 90,
  ['HARD']: 110,
  ['EXPERT']: 135,
  ['INSANE']: 175,
}

export const generateDuelNpc = async ({
  type: inputType,
  gender: inputGender,
  difficulty,
}: TGenDuelNpcParams): Promise<DuelNpc> => {
  const type = inputType ?? (pokemonTypes[Math.floor(Math.random() * pokemonTypes.length)].toLocaleUpperCase() as Types)
  const gender =
    inputGender ??
    (getRandomBetween2({
      obj1: [Gender.FEMALE, 0.5],
      obj2: [Gender.MALE, 0.5],
    }) as Gender)

  const genderString = gender.toString().toLocaleLowerCase()
  const avatarNumber = Math.ceil(Math.random() * 16)

  const npcPokemons = await generateDuelNpcPokemons({
    difficulty,
    type,
    level: metaLevels[difficulty],
  })

  const name = duelNpcNames[gender][Math.floor(Math.random() * duelNpcNames[gender].length)]

  const npc = await prisma.duelNpc.upsert({
    where: {
      name,
    },
    create: {
      difficulty,
      name,
      location: getRandomBetween2({
        obj1: [GameAreaName.ROCKTUNNEL, 0.5],
        obj2: [GameAreaName.FISHINGSPOT, 0.5],
      }),
      gender,
      spriteUrl: genderString + '/' + avatarNumber,
      speciality: type,
      pokemons: {
        connect: npcPokemons.map(pk => {
          return { id: pk.id }
        }),
      },
    },
    update: {
      pokemons: {
        set: npcPokemons.map(pk => {
          return { id: pk.id }
        }),
      },
      speciality: type,
      isDefeated: false,
      isInBattle: false,
      difficulty,
    },
  })

  if (!npc) throw new UnexpectedError('unable to generate npc')
  return npc
}
