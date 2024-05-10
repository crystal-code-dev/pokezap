import prisma from '../../../../../../prisma-provider/src'
import { TRouteParams } from '../../../../infra/routes/router'
import { RouteResponse } from '../../../../server/models/RouteResponse'
import { MissingParameterError, PokemonNotFoundError, UnexpectedError } from '../../../errors/AppErrors'
import { pokemonAvailabeSkills } from './pokemonAvailabeSkills'
import { pokemonSkillsByRole } from './pokemonSkillsByRole'

export const pokemonSkills = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , element, pokemonName] = data.routeParams
  if (!element) throw new MissingParameterError('Nome do pokemon ou elemento + nome do pokemon')
  if (!pokemonName) return await pokemonAvailabeSkills(data)

  const type = await prisma.type.findFirst({
    where: {
      name: element.toLowerCase(),
    },
  })

  if (!type) {
    if (['TANKER', 'SUPPORT', 'DAMAGE'].includes(element)) {
      return await pokemonSkillsByRole(data)
    } else {
      throw new UnexpectedError(`Tipo "${element}" não é um tipo válido.`)
    }
  }

  const pokemon = await prisma.basePokemon.findFirst({
    where: {
      name: pokemonName.toLowerCase(),
    },
    include: {
      skills: {
        where: {
          typeName: type.name,
        },
      },
    },
  })
  if (!pokemon) throw new PokemonNotFoundError(pokemonName)

  const skillTable = pokemon.skillTable
  const skillMap = new Map<string, string>([])

  for (const skill of skillTable) {
    const split = skill.split('%')
    skillMap.set(split[0], split[1])
  }

  const skills = pokemon.skills

  const skillDisplays: string[] = []

  for (const skill of skills) {
    const skillLevel = skillMap.get(skill.name)
    const skillDisplay = `*${skill.name}* -PWR:${skill.attackPower === 0 ? 'status' : skill.attackPower} -LVL:${
      skillLevel === '999' ? '💿' : skillLevel
    }`
    skillDisplays.push(skillDisplay)
  }

  return {
    message: `SKILLS DO TIPO ${type.name.toUpperCase()} para ${pokemonName.toUpperCase()}: \n\n${skillDisplays.join(
      '\n'
    )}`,
    status: 200,
    data: null,
  }
}
