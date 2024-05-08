import prisma from '../../../../../prisma-provider/src'

export const dailyResetJob = async () => {
  await prisma.player.updateMany({
    data: {
      energy: 20,
      dailyDefeatedDuelists: 0,
    },
  })
}
