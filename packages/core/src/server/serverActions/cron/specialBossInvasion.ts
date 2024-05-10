import { iGenPokeBossInvasion } from '../../../../../image-generator/src'
import prisma from '../../../../../prisma-provider/src'
import { GameRoom } from '../../../../../prisma-provider/src/types'
import { UnexpectedError } from '../../../infra/errors/AppErrors'
import { LootData } from '../../constants/bossInvasionLootMap'
import { sendMessage } from '../../helpers/sendMessage'
import { generateBossPokemon } from '../../oldModules/pokemon/generate/generateBossPokemon'

type SpecialBossInvasionParams = {
  name: string
  level: number
  shinyChance: number
  gameRoom: GameRoom
  areaName: string
  cashReward: number
  lootData: LootData[]
  requiredPlayers: number
}

export const specialBossInvasion = async ({
  gameRoom,
  level,
  name,
  shinyChance,
  areaName,
  cashReward,
  lootData,
  requiredPlayers,
}: SpecialBossInvasionParams) => {
  const baseData = await prisma.basePokemon.findFirst({
    where: {
      name,
    },
  })

  if (!baseData) return

  if (gameRoom.invasorId) return

  const pokeBoss = await generateBossPokemon({
    baseData,
    level,
    savage: true,
    shinyChance,
  })

  const displayName = pokeBoss.isShiny
    ? `SHINY ${pokeBoss.baseData.name.toUpperCase()}`
    : pokeBoss.baseData.name.toUpperCase()

  const announcementText = `Um *${displayName}* nível ${pokeBoss.level} invadiu *${areaName}*!`
  const lootItemsDropRate = lootData

  const invasionSession = await prisma.invasionSession.create({
    data: {
      name: 'Invasão: ' + displayName,
      announcementText,
      creatorId: gameRoom.id,
      gameRoomId: gameRoom.id,
      mode: 'boss-invasion',
      requiredPlayers,
      enemyPokemons: {
        connect: {
          id: pokeBoss.id,
        },
      },
      forfeitCost: 9999999,
      cashReward,
      lootItemsDropRate,
    },
  })

  await prisma.gameRoom.update({
    where: {
      id: gameRoom.id,
    },
    data: {
      invasorId: invasionSession.id,
    },
  })

  const imageUrl = await iGenPokeBossInvasion({
    invasionSession,
    pokeBoss,
  })

  const result = await sendMessage({
    chatId: gameRoom.phone,
    imageUrl,
    options: {
      caption: `${announcementText}

        👍 - Juntar-se a equipe de defesa (necessário: ${invasionSession.requiredPlayers} treinadores.)
`,
    },
  })

  if (!result) throw new UnexpectedError('No message response from provider.')

  await prisma.message.create({
    data: {
      msgId: result.id.id,
      type: 'poke-boss-invasion-announcement',
      body: '',
      actions: [`pz. invasion defend ${invasionSession.id}`],
    },
  })
}
