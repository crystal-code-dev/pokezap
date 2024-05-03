import prisma from '../../../../../../prisma-provider/src'
import { gameAreasData } from '../../../constants/gameAreasData'
import { verifySpawnTime } from '../../../modules/gameArea/verifySpawnTime'
import { specialPokeSpawn } from '../specialPokeSpawn'

export const fishingSpotSpawnJob = async () => {
  const date = new Date()
  const hours = date.getHours()
  const verify = verifySpawnTime(gameAreasData.fishingSpot.spawnTime, hours)
  if (!verify) return
  const fishingSpotGameRooms = await prisma.gameRoom.findMany({
    where: {
      mode: 'fishing-spot',
    },
    include: {
      players: {
        select: {
          teamPoke1: {
            select: {
              level: true,
            },
          },
        },
      },
    },
  })

  for (const gameRoom of fishingSpotGameRooms) {
    specialPokeSpawn({
      gameRoom,
      levelRange: [1, 10],
      pokeNames: ['magikarp'],
      shinyChance: 0.15,
    })
  }
}
