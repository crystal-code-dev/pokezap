import prisma from '../../../../../prisma-provider/src'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'

export const eventInfo = async (data: TRouteParams): Promise<RouteResponse> => {
  const players = await prisma.player.findMany({
    where: {
      ownedPokemons: {
        some: {
          parentId1: null,
          parentId2: null,
          baseData: {
            name: 'magikarp',
          },
        },
      },
    },
    include: {
      ownedPokemons: {
        include: {
          baseData: true,
        },
      },
    },
  })

  let ranking = '🎣 TOP-5 CAPTURAS MAGIKARP'

  const sortedByRanking = players.sort(
    p => p.ownedPokemons.filter(poke => !poke.parentId1 && !poke.parentId2 && poke.baseData.name === 'magikarp').length
  )

  const playerRanking: { name: string; points: number }[] = []

  for (const player of players) {
    const gigas = player.ownedPokemons.filter(
      p => p.baseData.name === 'magikarp' && !p.parentId1 && !p.parentId2 && p.isGiant
    ).length
    const shiny = player.ownedPokemons.filter(
      p => p.baseData.name === 'magikarp' && !p.parentId1 && !p.parentId2 && p.isShiny
    ).length
    const normal = player.ownedPokemons.filter(
      p => p.baseData.name === 'magikarp' && !p.parentId1 && !p.parentId2 && !p.isGiant
    ).length
    const points = normal * 5 + shiny * 50 + gigas * 20
    playerRanking.push({ name: player.name, points })
  }

  const rankDisplay = playerRanking
    .sort((a, b) => b.points - a.points)
    .slice(0, 5)
    .map((p, index) => `${index + 1} - *${p.name}* - 🎣: ${p.points}`)
    .join('\n')

  for (let i = 0; i < 5; i++) {}

  return {
    message: `🎣 *RANKING EVENTO PESCARIA* 🎣 \n\n${rankDisplay}`,
    status: 200,
  }
}
