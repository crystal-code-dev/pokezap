import prisma from '../../../../../prisma-provider/src'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'

export const duelNpcInfo = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , difficultyString] = data.routeParams

  const npcs = await prisma.duelNpc.findMany({
    where: {
      isDefeated: false,
    },
  })

  return {
    message: `*🔎⚔ Duelistas Encontrados 🔎⚔*

${npcs
  .map(
    npc =>
      `[${npc.difficulty}] *${npc.name}*, especialista em ${npc.speciality}.  🗺📌 ${npc.location
        .toString()
        .toLocaleLowerCase()}`
  )
  .join('\n')}
    `,
    status: 200,
  }
}
