import prisma from '../../../../../../prisma-provider/src'
import {
  BasePokemon,
  Difficulty,
  PrismaPromise,
  RaidPokemon,
  RaidPokemonBaseData,
  Types,
} from '../../../../../../prisma-provider/src/types'
import { UnexpectedError } from '../../../../infra/errors/AppErrors'
import { generateGeneralStats } from '../generateGeneralStats'
import { generateHpStat } from '../generateHpStat'
import { windPokeEvolve } from '../windPokeEvolve'

type TParams = {
  level: number
  type: Types
  difficulty: Difficulty
}

export const generateDuelNpcPokemons = async ({ level, type, difficulty }: TParams): Promise<RaidPokemon[]> => {
  const typeString = type.toString().toLocaleLowerCase()
  const possibleBasePokemons = await prisma.basePokemon.findMany({
    where: {
      OR: [
        {
          type1Name: typeString,
        },
        {
          type2Name: typeString,
        },
      ],
      BaseExperience: {
        lt: 550,
        gte: 150,
      },
    },
  })

  const basePokemons: BasePokemon[] = []

  for (let i = 0; i < 6; i++) {
    basePokemons.push(possibleBasePokemons[Math.floor(Math.random() * possibleBasePokemons.length)])
  }

  const pokemonPromises: PrismaPromise<RaidPokemonBaseData>[] = []

  for (const basePokemon of basePokemons) {
    const talentIds = [
      Math.max(Math.ceil(Math.random() * 18), 1),
      Math.max(Math.ceil(Math.random() * 18), 1),
      Math.max(Math.ceil(Math.random() * 18), 1),
      Math.max(Math.ceil(Math.random() * 18), 1),
      Math.max(Math.ceil(Math.random() * 18), 1),
      Math.max(Math.ceil(Math.random() * 18), 1),
      Math.max(Math.ceil(Math.random() * 18), 1),
      Math.max(Math.ceil(Math.random() * 18), 1),
      Math.max(Math.ceil(Math.random() * 18), 1),
    ]

    pokemonPromises.push(
      prisma.raidPokemon.create({
        data: {
          basePokemonId: basePokemon.id,
          level: level,
          spriteUrl: basePokemon.defaultSpriteUrl,
          hp: Math.round(generateHpStat(basePokemon.BaseHp, level)),
          atk: Math.round(generateGeneralStats(basePokemon.BaseAtk, level)),
          def: Math.round(generateGeneralStats(basePokemon.BaseDef, level)),
          spAtk: Math.round(generateGeneralStats(basePokemon.BaseSpAtk, level)),
          spDef: Math.round(generateGeneralStats(basePokemon.BaseSpDef, level)),
          speed: Math.round(generateGeneralStats(basePokemon.BaseSpeed, level)),
          talentId1: talentIds[0],
          talentId2: talentIds[1],
          talentId3: talentIds[2],
          talentId4: talentIds[3],
          talentId5: talentIds[4],
          talentId6: talentIds[5],
          talentId7: talentIds[6],
          talentId8: talentIds[7],
          talentId9: talentIds[8],
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
    )
  }

  const npcPokemons = await prisma.$transaction(pokemonPromises)

  if (!npcPokemons || npcPokemons.length < 6) throw new UnexpectedError('unable to generate npc pokemons')

  const evolvedNpcPokemons: RaidPokemon[] = []

  for (const pokemon of npcPokemons) {
    const evolved = await windPokeEvolve(pokemon, 600)
    if (!('duelNpcId' in evolved)) continue
    evolvedNpcPokemons.push(evolved)
  }

  return evolvedNpcPokemons
}
