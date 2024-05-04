import path from 'path'
import prisma from '../../../../../prisma-provider/src'
import { createGroupChat } from '../../../server/helpers/createGroupChat'
import { IResponse } from '../../../server/models/IResponse'
import {
  AlreadyInRaidGroupError,
  PlayerDoesNotHaveThePokemonInTheTeamError,
  PlayerNotFoundError,
  RouteDoesNotHaveUpgradeError,
  RouteNotFoundError,
  UnexpectedError,
} from '../../errors/AppErrors'
import { TRouteParams } from '../router'

export const raidGroup = async (data: TRouteParams): Promise<IResponse> => {
  if (data.playerPhone !== '5516988675837@c.us') throw new UnexpectedError('UTILIZE RAID START 🛠❌')
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
  if (gameRoom.mode === 'raid') throw new AlreadyInRaidGroupError()

  if (!gameRoom.upgrades.map(upg => upg.base.name).includes('bikeshop'))
    throw new RouteDoesNotHaveUpgradeError('bikeshop')

  const groupName = `PokeZap - RaidRoom ${Math.ceil(Math.random() * 100)}`
  const groupChat = await createGroupChat({
    groupName,
    playerPhone: player.phone,
    imageUrl: path.join(__dirname, '.././../../assets/sprites/misc/raid-room.jpg'),
  })

  if (!groupChat) throw new UnexpectedError('Não foi possível gerar o grupo de raid')

  await prisma.gameRoom.create({
    data: {
      level: 1,
      mode: 'raid',
      experience: 0,
      phone: groupChat.group.groupMetadata.id._serialized,
      name: groupName,
    },
  })

  return {
    message: `*${player.name}* deseja criar um grupo para RAID.

    Para juntar-se:
    https://chat.whatsapp.com/${groupChat.inviteCode}`,
    status: 200,
    data: null,
  }
}
