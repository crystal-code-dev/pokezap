import { UnexpectedError } from '../../../infra/errors/AppErrors'
import { PokemonBaseData, RaidPokemonBaseData } from '../../../types'
import { talentNameMap } from '../../constants/talentNameMap'

export const getPokemonPurity = (pokemon: PokemonBaseData | RaidPokemonBaseData) => {
  const talent1Id = talentNameMap.get(pokemon.baseData.type1Name)
  const talent2Id = talentNameMap.get(pokemon.baseData.type2Name ?? '')
  if (!talent1Id) throw new UnexpectedError('No type1 for: ' + pokemon.id)
  let purityCount = 0
  for (const talentId of [
    pokemon.talentId1,
    pokemon.talentId2,
    pokemon.talentId3,
    pokemon.talentId4,
    pokemon.talentId5,
    pokemon.talentId6,
    pokemon.talentId7,
    pokemon.talentId8,
    pokemon.talentId9,
  ]) {
    if (talentId === talent1Id) {
      purityCount++
      return
    }
    if (talentId === talent2Id) purityCount++
  }

  return purityCount
}
