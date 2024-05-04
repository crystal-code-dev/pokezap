import { iGenDuelX1 } from '../../../../../image-generator/src/iGenDuelX1'
import prisma from '../../../../../prisma-provider/src'
import {
  CantDuelItselfError,
  NoEnergyError,
  PlayerDoesNotHaveThePokemonInTheTeamError,
  PlayerNotFoundError,
  TypeMissmatchError,
} from '../../../infra/errors/AppErrors'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'

export const duelX1Route = async (data: TRouteParams): Promise<RouteResponse> => {
  const [, , , challengedPlayerIdString] = data.routeParams
  const challengedPlayerId = Number(challengedPlayerIdString)
  if (typeof challengedPlayerId !== 'number') throw new TypeMissmatchError(challengedPlayerIdString, 'number')

  const player1 = await prisma.player.findFirst({
    where: {
      phone: data.playerPhone,
    },
    include: {
      teamPoke1: {
        include: {
          baseData: {
            include: {
              skills: true,
            },
          },
        },
      },
    },
  })
  if (!player1) throw new PlayerNotFoundError(data.playerPhone)
  if (!player1.teamPoke1) throw new PlayerDoesNotHaveThePokemonInTheTeamError(player1.name)
  if (player1.energy <= 0) throw new NoEnergyError(player1.name)
  if (player1.id === challengedPlayerId) throw new CantDuelItselfError()

  const player2 = await prisma.player.findFirst({
    where: {
      id: challengedPlayerId,
    },
    include: {
      teamPoke1: {
        include: {
          baseData: {
            include: {
              skills: true,
            },
          },
        },
      },
    },
  })
  if (!player2) throw new PlayerNotFoundError(challengedPlayerIdString)
  if (!player2.teamPoke1) throw new PlayerDoesNotHaveThePokemonInTheTeamError(player2.name)

  const newSession = await prisma.session.create({
    data: {
      mode: 'duel-x1',
      creatorId: player1.id,
      invitedId: player2.id,
    },
  })

  const imageUrl = await iGenDuelX1({
    player1: player1,
    player2: player2,
  })

  return {
    message: `${player1.name} desafia ${player2.name} para um duelo!

    👍 - Batalha Rápida
    😂 - Batalha Vídeo`,
    status: 200,
    data: null,
    imageUrl: imageUrl,
    actions: [
      `pz. duel acceptx1 ${newSession.id} fast`,
      `pz. duel acceptx1 ${newSession.id} fast`,
      `pz. duel acceptx1 ${newSession.id}`,
    ],
  }
}
