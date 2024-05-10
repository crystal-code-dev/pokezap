import { PokemonBaseData, RaidPokemonBaseData } from '../../../../../prisma-provider/src/types'
import { talentIdMap } from '../../constants/talentIdMap'

export const getTalentPurity = (pokemon: PokemonBaseData | RaidPokemonBaseData): number => {
  const talents = [
    talentIdMap.get(pokemon.talentId1),
    talentIdMap.get(pokemon.talentId2),
    talentIdMap.get(pokemon.talentId3),
    talentIdMap.get(pokemon.talentId4),
    talentIdMap.get(pokemon.talentId5),
    talentIdMap.get(pokemon.talentId6),
    talentIdMap.get(pokemon.talentId7),
    talentIdMap.get(pokemon.talentId8),
    talentIdMap.get(pokemon.talentId9),
  ]

  if (talents.every(talent => talent === pokemon.baseData.type1Name || talent === pokemon.baseData.type2Name)) return 9

  const gameTalents = [
    'fire',
    'grass',
    'water',
    'ice',
    'electric',
    'fairy',
    'steel',
    'rock',
    'ground',
    'dark',
    'bug',
    'flying',
    'fighting',
    'psychic',
    'ghost',
    'normal',
    'poison',
  ]
  const talentCounts: { name: string; count: number }[] = []

  for (const talent of gameTalents) {
    const count = talents.filter(t => t === talent).length
    talentCounts.push({ name: talent, count })
  }

  const sortedTalentCounts = talentCounts.sort((a, b) => b.count - a.count)

  console.log({ sortedTalentCounts })

  if (sortedTalentCounts[0].count + sortedTalentCounts[1].count === 9 && sortedTalentCounts[0].count !== 8) return 9
  if (sortedTalentCounts[0].count === 8) return 8
  if (sortedTalentCounts[0].count + sortedTalentCounts[1].count === 8) return sortedTalentCounts[1].count !== 1 ? 8 : 7
  if (sortedTalentCounts[0].count + sortedTalentCounts[1].count === 7) return sortedTalentCounts[1].count !== 1 ? 7 : 6
  if (sortedTalentCounts[0].count + sortedTalentCounts[1].count === 6) return sortedTalentCounts[1].count !== 1 ? 6 : 5
  if (sortedTalentCounts[0].count + sortedTalentCounts[1].count === 5) return sortedTalentCounts[1].count !== 1 ? 5 : 4
  if (sortedTalentCounts[0].count + sortedTalentCounts[1].count === 4) return sortedTalentCounts[1].count !== 1 ? 4 : 3
  if (sortedTalentCounts[0].count + sortedTalentCounts[1].count === 3) return sortedTalentCounts[1].count !== 1 ? 3 : 2
  if (sortedTalentCounts[0].count + sortedTalentCounts[1].count === 2) return 1
  return 0
}
