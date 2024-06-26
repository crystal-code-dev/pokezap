import { iGenRaidCreate } from '../../../../../image-generator/src/iGenRaidCreate'
import prisma from '../../../../../prisma-provider/src'
import { GameAreaName, RaidPokemonBaseDataSkills } from '../../../../../prisma-provider/src/types'
import { raidsDataMap } from '../../../server/constants/raidsDataMap'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { generateMegaPokemon } from '../../../server/modules/pokemon/generate/generateMegaPokemon'
import { generateRaidPokemon } from '../../../server/modules/pokemon/generate/generateRaidPokemon'

import {
  CantStartRaidOutsideRaidGroupError,
  InvalidDifficultError,
  MissingParameterError,
  PlayerDoesNotHaveThePokemonInTheTeamError,
  PlayerNotFoundError,
  RaidDataNotFoundError,
  RaidNotFoundError,
  RouteNotFoundError,
  UnexpectedError,
} from '../../errors/AppErrors'
import { TRouteParams } from '../router'

export type TRaidDifficultData = {
  shinyChance: number
  bossLevel: number
  enemiesLevel: number
  cashReward: number
  dropRate: number
  roomCount: number
}

export const raidDifficultyDataMap = new Map<string, TRaidDifficultData>([
  [
    'easy',
    {
      shinyChance: 0.05,
      bossLevel: 100,
      enemiesLevel: 50,
      cashReward: 750,
      dropRate: 0.5,
      roomCount: 4,
    },
  ],
  [
    'medium',
    {
      shinyChance: 0.08,
      bossLevel: 110,
      enemiesLevel: 65,
      cashReward: 1400,
      dropRate: 0.75,
      roomCount: 5,
    },
  ],
  [
    'hard',
    {
      shinyChance: 0.11,
      bossLevel: 175,
      enemiesLevel: 80,
      cashReward: 2300,
      dropRate: 1.25,
      roomCount: 6,
    },
  ],
  [
    'expert',
    {
      shinyChance: 0.15,
      bossLevel: 240,
      enemiesLevel: 90,
      cashReward: 4000,
      dropRate: 2.25,
      roomCount: 7,
    },
  ],
  [
    'insane',
    {
      shinyChance: 0.25,
      bossLevel: 320,
      enemiesLevel: 120,
      cashReward: 8000,
      dropRate: 3.5,
      roomCount: 8,
    },
  ],
])

export const raidCreate = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , raidNameUppercase, difficultUppercase] = data.routeParams

  if (!raidNameUppercase || !difficultUppercase)
    throw new MissingParameterError('Nome da raid à ser criada e dificuldade')
  const difficult = difficultUppercase.toLowerCase()
  if (!['easy', 'medium', 'hard', 'expert', 'insane'].includes(difficult)) throw new InvalidDifficultError()

  const raidName = raidNameUppercase.toLowerCase()
  const raidData = raidsDataMap.get(raidName.toLowerCase())
  if (!raidData) throw new RaidDataNotFoundError(raidName)

  const player = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
    include: {
      teamPoke1: true,
      gameRoom: true,
    },
  })
  if (!player) throw new PlayerNotFoundError(data.playerPhone)
  if (!player.teamPoke1) throw new PlayerDoesNotHaveThePokemonInTheTeamError(player.name)

  const gameRoom = await prisma.gameRoom.findFirst({
    where: {
      phone: data.groupCode,
    },
    include: {
      upgrades: {
        include: {
          base: true,
        },
      },
      raid: true,
    },
  })

  if (!gameRoom) throw new RouteNotFoundError(player.name, data.groupCode)
  if (gameRoom.gameArea !== GameAreaName.RAIDROOM) throw new CantStartRaidOutsideRaidGroupError()

  const [bossBaseData, enemiesBaseData, lootData] = await prisma.$transaction([
    prisma.basePokemon.findFirst({
      where: {
        name: raidName,
      },
    }),
    prisma.basePokemon.findMany({
      where: {
        name: {
          in: raidData.enemies,
        },
      },
    }),
    prisma.baseItem.findMany({
      where: {
        name: {
          in: raidData.loot.map(item => item.name),
        },
      },
    }),
  ])

  if (!bossBaseData) throw new UnexpectedError('no bossbasedata found')

  const announcementText = `RAID: ${raidName}!`

  const raidDifficultData = raidDifficultyDataMap.get(difficult)
  if (!raidDifficultData) throw new UnexpectedError('cant find raiddata in map')

  const megaPokemon = await generateMegaPokemon({
    name: raidName.toLowerCase(),
    shinyChance: raidDifficultData.shinyChance,
    level: raidDifficultData.bossLevel,
  })

  const raid = await prisma.raid.create({
    data: {
      difficulty: difficult,
      announcementText,
      cashReward: raidDifficultData.cashReward,
      creatorId: player.id,
      forfeitCost: raidDifficultData.cashReward / 2,
      gameRoomId: gameRoom.id,
      mode: 'raid',
      name: `RAID : ${raidName}!`,
      requiredPlayers: 3,
      imageUrl: raidData.type,
    },
  })

  const enemiesDataPromises: Promise<RaidPokemonBaseDataSkills>[] = []

  for (const enemy of raidData.enemies) {
    enemiesDataPromises.push(
      generateRaidPokemon({
        level: Math.round(Math.min(raidDifficultData.enemiesLevel * 0.9 + Math.random() * 0.2, 100)),
        name: enemy,
      })
    )
    enemiesDataPromises.push(
      generateRaidPokemon({
        level: Math.round(Math.min(raidDifficultData.enemiesLevel * 0.9 + Math.random() * 0.2, 100)),
        name: enemy,
      })
    )
    enemiesDataPromises.push(
      generateRaidPokemon({
        level: Math.round(Math.min(raidDifficultData.enemiesLevel * 0.9 + Math.random() * 0.2, 100)),
        name: enemy,
      })
    )
  }

  const enemiesData = await Promise.all(enemiesDataPromises)

  const getRandomPokemons = (array: RaidPokemonBaseDataSkills[], amount: number) => {
    const shuffledArray = array.slice() // Create a copy of the array
    let currentIndex = shuffledArray.length

    // While there are elements remaining to shuffle
    while (currentIndex > 0) {
      // Pick a random index from the remaining elements
      const randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex--

      // Swap the current element with the randomly selected element
      const temporaryValue = shuffledArray[currentIndex]
      shuffledArray[currentIndex] = shuffledArray[randomIndex]
      shuffledArray[randomIndex] = temporaryValue
    }

    // Return the desired number of elements from the shuffled array
    return shuffledArray.slice(0, amount)
  }

  const createRoomsData: any[] = []

  for (let i = 0; i < raidData.rooms - 1; i++) {
    const enemyAmount = 4
    const enemies = getRandomPokemons(enemiesData, enemyAmount)
    createRoomsData.push({
      announcementText: `SALA ${i + 1}/${raidData.rooms} DA RAID ${raidName}.`,
      creatorId: player.id,
      gameRoomId: gameRoom.id,
      isFinalRoom: false,
      mode: 'raid-room',
      name: 'SALA ',
      requiredPlayers: raid.requiredPlayers,
      raidId: raid.id,
      enemiesIds: enemies.map(p => p.id),
      enemyPokemons: {
        connect: enemies.map(p => {
          return { id: p.id }
        }),
      },
    })
  }

  createRoomsData.push({
    announcementText: `Prepare-se! *${raidName.toUpperCase()}* apareceu!.`,
    creatorId: player.id,
    gameRoomId: gameRoom.id,
    isFinalRoom: true,
    mode: 'raid-room',
    name: 'SALA FINAL',
    requiredPlayers: raid.requiredPlayers,
    raidId: raid.id,
    enemiesIds: [megaPokemon.id],
    enemyPokemons: {
      connect: {
        id: megaPokemon.id,
      },
    },
  })

  await prisma
    .$transaction(
      createRoomsData.map(raidRoomCreateData =>
        prisma.raidRoom.create({
          data: raidRoomCreateData,
        })
      )
    )
    .catch(e => console.log(e))

  const raidReadAgain = await prisma.raid.findUnique({
    where: {
      id: raid.id,
    },
    include: {
      raidRooms: true,
    },
  })

  if (!raidReadAgain) throw new RaidNotFoundError(raid.id)
  if (raidReadAgain.raidRooms.length === 0)
    throw new UnexpectedError('failed to create rooms in raid: ' + raidReadAgain.id)

  await prisma.raid.update({
    where: {
      id: raid.id,
    },
    data: {
      currentRoomIndex: raidReadAgain.raidRooms[0].id,
    },
  })

  const imageUrl = await iGenRaidCreate({
    backgroundName: raidData.type,
    boss: bossBaseData,
    enemyPokemons: enemiesBaseData,
    possibleLoot: lootData,
  })

  return {
    message: `*${player.name}* inicou uma caravana para RAID: ${raidName} ${difficult}.

      👍 - Juntar-se\n\n❤ - Juntar - se`,
    status: 200,
    data: null,
    imageUrl,
    actions: [`pz. raid join ${raid.id}`, `pz. raid join ${raid.id}`],
  }
}
