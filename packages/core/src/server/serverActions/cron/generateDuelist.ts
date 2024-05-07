import { Difficulty } from '../../../../../prisma-provider/src/types'
import { generateDuelNpc } from '../../modules/duelNPC/generateDuelNpc'

export const generateDuelist = async () => {
  Promise.all([
    generateDuelNpc({
      difficulty: Difficulty.MEDIUM,
    }),
    generateDuelNpc({
      difficulty: Difficulty.HARD,
    }),
    generateDuelNpc({
      difficulty: Difficulty.EASY,
    }),
    generateDuelNpc({
      difficulty: Difficulty.EXPERT,
    }),
    generateDuelNpc({
      difficulty: Difficulty.INSANE,
    }),
  ])
}
