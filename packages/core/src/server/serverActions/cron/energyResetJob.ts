import prisma from '../../../../../prisma-provider/src'

export const energyResetJob = async () => {
  await prisma.player.updateMany({
    data: {
      energy: 10,
    },
  })
}
