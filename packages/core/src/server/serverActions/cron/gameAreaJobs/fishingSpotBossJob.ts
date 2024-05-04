import prisma from '../../../../../../prisma-provider/src'
import { GameAreaName } from '../../../../../../prisma-provider/src/types'
import { gameAreasData } from '../../../constants/gameAreasData'
import { verifySpawnTime } from '../../../modules/gameArea/verifySpawnTime'
import { specialBossInvasion } from '../specialBossInvasion'

export const fishingSpotBossJob = async () => {
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
    const roomLevel =
      gameRoom.players.reduce((acc, player) => acc + (player.teamPoke1?.level ?? 0), 0) / gameRoom.players.length
    specialBossInvasion({
      gameRoom,
      level: roomLevel,
      name: 'gyarados',
      shinyChance: 99,
      areaName: 'fishing-spot',
      cashReward: 1000,
      lootData: [],
      requiredPlayers: 2,
    })
  }
}
