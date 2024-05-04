import {
  Pokemon,
  PokemonBaseData,
  RaidPokemon,
  RaidPokemonBaseData,
  Skill,
  attackPower,
  enemyName,
} from '../../../../prisma-provider/src/types'
import { typeEffectivenessMap } from '../constants/atkEffectivenessMap'

export function getBestSkillSet(
  pokemonSkillMap: [number, Skill][],
  attacker: Pokemon | RaidPokemon,
  defenderTeam: PokemonBaseData[] | RaidPokemonBaseData[]
): {
  damageSkills: Map<Skill, Map<enemyName, attackPower>>
  tankerSkills: Skill[]
  supportSkills: Skill[]
} {
  const damageSkillsFinalMap = new Map<Skill, Map<enemyName, attackPower>>([])

  for (const [power, skill] of pokemonSkillMap) {
    if (power <= 0) continue
    const defenderNameXSkillPowerMap = new Map<enemyName, attackPower>([])
    for (const defender of defenderTeam) {
      const skillPower = calculateDamageAgainstPokemonX(attacker, defender, { ...skill, preProcessedPower: power })
      defenderNameXSkillPowerMap.set(defender.baseData.name, skillPower)
    }
    damageSkillsFinalMap.set(skill, defenderNameXSkillPowerMap)
  }

  const tankerSkills: Skill[] = []
  for (const [power, skill] of pokemonSkillMap) {
    if (!checkIfSkillIsTankerSkill(skill)) continue
    tankerSkills.push(skill)
  }

  const supportSkills: Skill[] = []
  for (const [power, skill] of pokemonSkillMap) {
    if (!checkIfSkillIsSupportSkill(skill)) continue
    supportSkills.push(skill)
  }

  return {
    damageSkills: damageSkillsFinalMap,
    supportSkills,
    tankerSkills,
  }
}

const calculateDamageAgainstPokemonX = (
  attacker: Pokemon | RaidPokemon,
  defender: PokemonBaseData | RaidPokemonBaseData,
  skill: Skill & { preProcessedPower: number }
): number => {
  const efMultiplier = getAttackEffectivenessMultiplier(
    skill.typeName,
    defender.baseData.type1Name,
    defender.baseData.type2Name
  )

  const processedAttackPower = (((attacker.level * 0.4 + 2) * skill.preProcessedPower) / 50 + 2) * efMultiplier

  return processedAttackPower
}

const getAttackEffectivenessMultiplier = (atkType: string, defType1: string, defType2?: string | null) => {
  const effectivenessData = typeEffectivenessMap.get(atkType)
  const getFactor = (type: string, efData: any) => {
    if (efData.effective.includes(type)) return 2
    if (efData.ineffective.includes(type)) return 0.5
    if (efData.noDamage.includes(type)) return 'no-damage'
    return 1
  }

  const factor1 = getFactor(defType1, effectivenessData)
  const factor2 = getFactor(defType2 || 'notype', effectivenessData)

  if (factor1 === 'no-damage' || factor2 === 'no-damage') return 0.25
  return factor1 * factor2
}

export const checkIfSkillIsTankerSkill = (skill: Skill): boolean => {
  if (['defense', 'special-defense'].includes(skill.statChangeName)) return true
  if (skill.category === 'net-good-stats' && skill.target === 'user' && skill.statChangeName === 'evasion') return true
  if (['damage+heal'].includes(skill.category)) return true
  return false
}

export const checkIfSkillIsSupportSkill = (skill: Skill): boolean => {
  if (skill.category === 'net-good-stats' && ['selected-pokemon', 'user-and-allies', 'ally'].includes(skill.target))
    return true
  if (['heal'].includes(skill.category)) return true

  return false
}
