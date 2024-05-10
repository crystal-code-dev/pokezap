import prisma from '../../../../../../prisma-provider/src'
import { GameAreaName } from '../../../../../../prisma-provider/src/types'
import { gameAreasData } from '../../../constants/gameAreasData'
import { verifySpawnTime } from '../../../oldModules/gameArea/verifySpawnTime'
import { specialPokeSpawn } from '../specialPokeSpawn'

export const rockTunnelSpawnJob = async () => {
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

  const pokeNames = ['geodude', 'graveler', 'onix']

  for (const gameRoom of gameRooms) {
    specialPokeSpawn({
      gameRoom,
      levelRange: [3, 15],
      pokeNames,
      shinyChance: 0.15,
    })
  }
}
