import prisma from '../../../../../../prisma-provider/src'
import { GameAreaName } from '../../../../../../prisma-provider/src/types'
import { gameAreasData } from '../../../constants/gameAreasData'
import { verifySpawnTime } from '../../../oldModules/gameArea/verifySpawnTime'
import { specialPokeSpawn } from '../specialPokeSpawn'

export const fishingSpotSpawnJob = async () => {
  const date = new Date()
  const hours = date.getHours()
  const verify = verifySpawnTime(gameAreasData[GameAreaName.FISHINGSPOT].spawnTime, hours)
  if (!verify) return
  const fishingSpotGameRooms = await prisma.gameRoom.findMany({
    where: {
      gameArea: GameAreaName.FISHINGSPOT,
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
