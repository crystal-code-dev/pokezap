import prisma from '../../../../../../prisma-provider/src'
import { BasePokemon, GymPokemon, Skill } from '../../../../../../prisma-provider/src/types'
import { UnexpectedError } from '../../../../infra/errors/AppErrors'
import { talentNameMap } from '../../../constants/talentNameMap'
import { generateGeneralStats } from '../generateGeneralStats'
import { generateHpStat } from '../generateHpStat'

type TParams = {
  name: string
  level: number
  ownerId: number
}

export const generateGymPokemons = async (data: TParams): Promise<GymPokemon> => {
  const { name, level, ownerId } = data

  const baseData = await prisma.basePokemon.findFirst({
    where: {
      name,
    },
    include: {
      skills: true,
    },
  })

  if (!baseData) throw new UnexpectedError('No basePokemon found for : ' + name)

  const getTalentPossibilites = (baseData: BasePokemon & { skills: Skill[] }) => {
    return baseData.skills.map((skill: Skill) => {
      if (skill.attackPower <= 40)
        return {
          type: skill.typeName,
          reqCount: 1,
        }
      if (skill.attackPower <= 80)
        return {
          type: skill.typeName,
          reqCount: 2,
        }
      return {
        type: skill.typeName,
        reqCount: 3,
      }
    })
  }

  const possibleTalents = getTalentPossibilites(baseData)

  let availableTalentSlots = 9
  const talents: { reqCount: number; type: string }[] = []
  const finalTalentIds: number[] = []

  if (baseData.type1Name) {
    talents.push({
      reqCount: 3,
      type: baseData.type1Name,
    })
    availableTalentSlots -= 3
  }

  if (baseData.type2Name) {
    talents.push({
      reqCount: 3,
      type: baseData.type2Name,
    })
    availableTalentSlots -= 3
  }

  for (const talent of talents) {
    const talentId = talentNameMap.get(talent.type)
    if (!talentId) throw new UnexpectedError('Unabled to find talent id for type ' + talent.type)
    for (let i = 0; i < talent.reqCount; i++) {
      finalTalentIds.push(talentId)
    }
  }
  while (finalTalentIds.length < 9) {
    const newTalent = possibleTalents[Math.floor(Math.random() * possibleTalents.length)]
    const talentId = talentNameMap.get(newTalent.type)
    if (!talentId) throw new UnexpectedError('Unabled to find talent id for type ' + newTalent.type)
    for (let i = 0; i < 3; i++) {
      finalTalentIds.push(talentId)
    }
    availableTalentSlots -= 3
  }
  return await prisma.gymPokemon.create({
    data: {
      basePokemonName: baseData.name,
      ownerId,
      level: level,
      isShiny: true,
      spriteUrl: baseData.shinySpriteUrl,
      hp: Math.round(generateHpStat(baseData.BaseHp, level) * 1.15),
      atk: Math.round(generateGeneralStats(baseData.BaseAtk, level) * 1.15),
      def: Math.round(generateGeneralStats(baseData.BaseDef, level) * 1.15),
      spAtk: Math.round(generateGeneralStats(baseData.BaseSpAtk, level) * 1.15),
      spDef: Math.round(generateGeneralStats(baseData.BaseSpDef, level) * 1.15),
      speed: Math.round(generateGeneralStats(baseData.BaseSpeed, level) * 1.15),
      talentId1: finalTalentIds[0],
      talentId2: finalTalentIds[1],
      talentId3: finalTalentIds[2],
      talentId4: finalTalentIds[3],
      talentId5: finalTalentIds[4],
      talentId6: finalTalentIds[5],
      talentId7: finalTalentIds[6],
      talentId8: finalTalentIds[7],
      talentId9: finalTalentIds[8],
    },
    include: {
      baseData: {
        include: {
          skills: true,
        },
      },
    },
  })
}
