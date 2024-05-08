import { Difficulty } from '../../../../../prisma-provider/src/types'
import { generateDuelNpc } from '../../modules/duelNPC/generateDuelNpc'

export const generateDuelist = async () => {
  Promise.all([
    generateDuelNpc({
      difficulty: Difficulty.MEDIUM,
    }),
    generateDuelNpc({
      difficulty: Difficulty.EASY,
    }),
    generateDuelNpc({
      difficulty: Difficulty.EASY,
    }),
    generateDuelNpc({
      difficulty: Difficulty.EASY,
    }),
  ])
}
