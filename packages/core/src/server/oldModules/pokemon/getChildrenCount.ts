import { Pokemon } from '../../../../../prisma-provider/src/types'

export const getChildrenCount = (poke: Pokemon): number => {
  if (!poke.childrenId1) return 0
  if (!poke.childrenId2) return 1
  if (!poke.childrenId3) return 2
  if (!poke.childrenId4) return 3
  return 4
}
