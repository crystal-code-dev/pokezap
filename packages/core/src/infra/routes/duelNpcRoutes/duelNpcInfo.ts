import prisma from '../../../../../prisma-provider/src'
import { Difficulty } from '../../../../../prisma-provider/src/types'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { MissingParameterError } from '../../errors/AppErrors'
import { logger } from '../../logger'
import { TRouteParams } from '../router'

export const duelNpcInfo = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , difficultyString] = data.routeParams
  if (!difficultyString) throw new MissingParameterError('Dificuldade de duelista que está procurando:')

  const difficulty = difficultyString as Difficulty
  logger.warn({ difficulty })

  const npcs = await prisma.duelNpc.findMany({
    where: {
      difficulty,
      isDefeated: false,
    },
  })

  return {
    message: `*🔎⚔ Duelistas Encontrados 🔎⚔*

${npcs
  .map(npc => `*${npc.name}*, especialista em ${npc.speciality}. Em ${npc.location.toString().toLocaleLowerCase()}`)
  .join('\n')}
    `,
    status: 200,
  }
}
