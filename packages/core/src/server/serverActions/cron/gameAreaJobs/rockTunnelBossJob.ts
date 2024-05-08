import prisma from '../../../../../../prisma-provider/src'
import { GameAreaName } from '../../../../../../prisma-provider/src/types'
import { gameAreasData } from '../../../constants/gameAreasData'
import { verifySpawnTime } from '../../../modules/gameArea/verifySpawnTime'
import { specialBossInvasion } from '../specialBossInvasion'

export const rockTunnelBossJob = async () => {
  const date = new Date()
  const hours = date.getHours()
  const verify = verifySpawnTime(gameAreasData[GameAreaName.ROCKTUNNEL].spawnTime, hours)
  if (!verify) return
  const gameRooms = await prisma.gameRoom.findMany({
    where: {
      gameArea: GameAreaName.ROCKTUNNEL,
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

  for (const gameRoom of gameRooms) {
    const roomLevel = Math.max(
      30,
      gameRoom.players.reduce((acc, player) => acc + (player.teamPoke1?.level ?? 0), 0) / gameRoom.players.length
    )
    specialBossInvasion({
      gameRoom,
      level: roomLevel,
      name: 'steelix',
      shinyChance: 99,
      areaName: 'fishing-spot',
      cashReward: 1000,
      lootData: [
        {
          itemName: 'metal-coat',
          dropChance: 0.05,
        },
      ],
      requiredPlayers: 2,
    })
  }
}
