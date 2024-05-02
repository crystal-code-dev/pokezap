import prisma from '.'
import { logger } from '../../core/src/infra/logger'
import { commonPokemons } from './seedItems/commonPokemons'
import { fetchMoreSkillsDetails } from './seedItems/fetchMoreSkillsDetails'
import { items } from './seedItems/items'
import { skills } from './seedItems/skills'
import { specialPokemons } from './seedItems/specialPokemons'

const moveLevelForMachineMoves = 999

const runSeed = async () => {
  await populateTypesAndTalents()
  await populateSkills()
  await populateBasePokemons()
  await populateItems()
  await populateMegas()
  await fetchMoreSkillsDetails()
}

const populateItems = async () => {
  logger.info('Populating items')
  for (const item of items) {
    await prisma.baseItem.create({
      data: {
        name: item.name,
        type: item.category,
        spriteUrl: item.sprite,
        npcPrice: item.cost,
      },
    })
  }
}

const populateSkills = async () => {
  logger.info('Populating skills')
  for (const skill of skills) {
    await prisma.skill
      .create({
        data: {
          attackPower: skill.power ?? 0,
          name: skill.name,
          isPhysical: skill.class === 'physical',
          isSpecial: skill.class === 'special',
          typeName: skill.type,
        },
      })
      .catch((err: any) => {
        //
      })
  }
}

const populateTypesAndTalents = async () => {
  logger.info('Populating types and talents')

  const pokeTypes = [
    'normal',
    'fighting',
    'flying',
    'poison',
    'ground',
    'rock',
    'bug',
    'ghost',
    'steel',
    'fire',
    'water',
    'grass',
    'electric',
    'psychic',
    'ice',
    'dragon',
    'dark',
    'fairy',
  ]

  for (const pokeType of pokeTypes) {
    await prisma.type.create({
      data: {
        name: pokeType,
      },
    })

    await prisma.talent.create({
      data: {
        typeName: pokeType,
      },
    })
  }
}

const populateBasePokemons = async () => {
  logger.info('Populating base pokemons')

  for (const pokemon of commonPokemons) {
    const skillTable: string[] = []

    for (const move of pokemon.moves) {
      if (move.level > 0) {
        skillTable.push(`${move.name}%${move.level}`)
        continue
      }

      skillTable.push(`${move.name}%${moveLevelForMachineMoves}`)
    }

    await prisma.basePokemon.create({
      data: {
        pokedexId: pokemon.id,
        name: pokemon.name,
        defaultSpriteUrl: pokemon.sprites.normal,
        shinySpriteUrl: pokemon.sprites.shiny,
        height: pokemon.height,
        isFirstEvolution: pokemon.evolutionData.isFirstEvolution,
        type1Name: pokemon.types[0],
        type2Name: pokemon.types[1],
        evolutionData: pokemon.evolutionData,
        BaseHp: pokemon.stats.hp,
        BaseAtk: pokemon.stats.atk,
        BaseDef: pokemon.stats.def,
        BaseSpAtk: pokemon.stats.spAtk,
        BaseSpDef: pokemon.stats.spDef,
        BaseSpeed: pokemon.stats.speed,
        BaseAllStats:
          pokemon.stats.atk +
          pokemon.stats.def +
          pokemon.stats.hp +
          pokemon.stats.spAtk +
          pokemon.stats.spDef +
          pokemon.stats.speed,
        BaseExperience: pokemon.baseExperience,
        skills: {
          connect: pokemon.moves.map((m: any) => {
            return {
              name: m.name,
            }
          }),
        },
        skillTable,
      },
    })
  }
}

const populateMegas = async () => {
  logger.info('Populating mega pokemons')

  for (const specialPokemon of specialPokemons) {
    const skillTable: string[] = []

    for (const move of specialPokemon.moves) {
      if (move.level > 0) {
        skillTable.push(`${move.name}%${move.level}`)
        continue
      }

      skillTable.push(`${move.name}%${moveLevelForMachineMoves}`)
    }

    const isRegional = specialPokemon.name.includes('alola') || specialPokemon.name.includes('galar')
    const isMega = specialPokemon.name.includes('mega')

    await prisma.basePokemon.create({
      data: {
        pokedexId: specialPokemon.id,
        name: specialPokemon.name,
        defaultSpriteUrl: specialPokemon.sprites.normal,
        shinySpriteUrl: specialPokemon.sprites.shiny,
        height: specialPokemon.height,
        isFirstEvolution: specialPokemon.evolutionData.isFirstEvolution,
        isRegional,
        isMega,
        evolutionData: specialPokemon.evolutionData,
        type1Name: specialPokemon.types[0],
        type2Name: specialPokemon.types[1],
        BaseHp: specialPokemon.stats.hp,
        BaseAtk: specialPokemon.stats.atk,
        BaseDef: specialPokemon.stats.def,
        BaseSpAtk: specialPokemon.stats.spAtk,
        BaseSpDef: specialPokemon.stats.spDef,
        BaseSpeed: specialPokemon.stats.speed,
        BaseAllStats:
          specialPokemon.stats.atk +
          specialPokemon.stats.def +
          specialPokemon.stats.hp +
          specialPokemon.stats.spAtk +
          specialPokemon.stats.spDef +
          specialPokemon.stats.speed,
        BaseExperience: specialPokemon.baseExperience,
        skills: {
          connect: specialPokemon.moves.map((m: any) => {
            return {
              name: m.name,
            }
          }),
        },
        skillTable,
      },
    })
  }
}

runSeed()
  .then(() => {
    logger.info('Seed data populated')
    process.exit(0)
  })
  .catch(err => {
    logger.error('Error populating seed data', err)
    process.exit(1)
  })
