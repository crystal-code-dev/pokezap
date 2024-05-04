import { GameAreaName } from '../../../../prisma-provider/src/types'

type GameArea = {
  inviteCode: string
  spawnTime?: number[][]
  experienceModifier?: number
  catchModifier?: number
}

type WildGameAreaNames = Exclude<GameAreaName, 'PRIVATE'>

export const gameAreasData: Record<WildGameAreaNames, GameArea> = {
  [GameAreaName.FISHINGSPOT]: {
    inviteCode: '120363277796230795@g.us',
    spawnTime: [
      [8, 9],
      [12, 13],
      [14, 15],
      [19, 20],
      [22, 23],
    ],
    catchModifier: 0.25,
  },
  [GameAreaName.ROUTE]: {
    inviteCode: '120363277796230795@g.us',
    spawnTime: [
      [8, 9],
      [12, 13],
      [16, 17],
      [20, 21],
    ],
  },
  [GameAreaName.RAIDROOM]: {
    inviteCode: '120363277796230795@g.us',
    spawnTime: [
      [8, 9],
      [12, 13],
      [16, 17],
      [20, 21],
    ],
  },
  [GameAreaName.DUELROOM]: {
    inviteCode: '120363277796230795@g.us',
    spawnTime: [
      [8, 9],
      [12, 13],
      [16, 17],
      [20, 21],
    ],
  },
}
