import { Gender } from '../../../../prisma-provider/src/types'

export const duelNpcNames: Record<Gender, string[]> = {
  ['MALE']: ['jorge', 'antonio', 'bill', 'lucas', 'pablo', 'leo', 'alfredo', 'rogerio', 'valdomir'],
  ['FEMALE']: ['julia', 'delmina', 'aparecida', 'fatima', 'lais', 'hosana', 'lurdes'],
}
