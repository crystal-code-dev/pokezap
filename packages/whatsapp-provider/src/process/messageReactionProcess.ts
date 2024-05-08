import { AxiosError } from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import path from 'path'
import { container } from 'tsyringe'
import { Client, MessageMedia, Reaction } from 'whatsapp-web.js'
import { reactions } from '../../../../common/constants/reactions'
import { ServerResponse } from '../../../core/src/types/ServerResponse'
import prisma from '../../../prisma-provider/src/index'
import { UserDemandHandler } from '../constants/UserDemandHandler'
import { deleteSentMessage } from '../helpers/deleteSentMessage'
import { logger } from '../helpers/logger'
import { requestServer } from '../helpers/requestServer'
import { verifyTargetChat } from '../helpers/verifyTargetChat'

const userDemand = new UserDemandHandler()

export const messageReactionProcess = async (msg: Reaction, initDate: Date) => {
  try {
    const permit = await verifyTargetChat(msg.msgId.remote)
    if (!permit) return

    const msgDate = new Date(msg.timestamp * 1000)
    if (msgDate.getTime() < initDate.getTime()) return

    const zapClient = container.resolve<Client>('WhatsappClient')

    const message = await prisma.message.findFirst({
      where: {
        msgId: msg.msgId.id,
      },
    })

    if (!message) return

    const player = await prisma.player.findFirst({
      where: {
        phone: msg.senderId,
      },
    })

    const getRequestedAction = () => {
      for (let i = 0; i < message.actions.length; i++) {
        if (reactions[i].includes(msg.reaction)) {
          return message?.actions[i]?.toUpperCase().split(' ')
        }
      }
    }

    const routeParams = getRequestedAction()

    if (!routeParams) return

    const startCheck: string = routeParams[1]

    if (!player) {
      if (startCheck !== 'START' && startCheck !== 'INICIAR' && startCheck !== 'INICIO') return
    }

    // if (player) {
    //   const demand = userDemand.get(player.phone) ?? 0
    //   if (demand >= 4) {
    //     return
    //   }
    //   userDemand.add(player.phone, 1)
    //   setTimeout(() => userDemand.reduce(player.phone, 1), 2000)
    // }

    const response: ServerResponse = await requestServer({
      playerPhone: msg.senderId,
      routeParams: routeParams,
      playerName: player?.name || '',
      groupCode: msg.msgId.remote,
      fromReact: true,
    })

    if (!response) return

    if (!response.imageUrl) {
      const result = await zapClient.sendMessage(msg.id.remote, response.message)
      if (msg.id.remote.includes('@g.us')) deleteSentMessage(result)
      if (response.actions) {
        await prisma.message.create({
          data: {
            msgId: result.id.id,
            type: 'default',
            body: result.body,
            actions: response.actions,
          },
        })
      }
      return
    }

    const filePath = response.isAnimated
      ? await new Promise<string>(resolve => {
          if (!response.isAnimated) resolve(response.imageUrl!)

          const outputPath = path.join(__dirname, `../ffmpeg/video-${Math.random().toFixed(5)}.mp4`)

          if (!response.imageUrl) return

          ffmpeg(response.imageUrl)
            .videoCodec('libx264')
            .outputOptions('-profile:v', 'baseline', '-level', '3.0', '-pix_fmt', 'yuv420p')
            .noAudio()
            .on('end', () => {
              console.log('Conversão concluída!')
              resolve(outputPath)
            })
            .on('error', err => {
              console.error('Ocorreu um erro durante a conversão:', err)
              return
            })
            .save(outputPath)
        }).catch(err => {
          logger.error(err)
          return ''
        })
      : response.imageUrl

    const media = MessageMedia.fromFilePath(filePath)
    const result = await zapClient.sendMessage(msg.id.remote, response.message, {
      media: media,
    })

    if (msg.id.remote.includes('@g.us')) deleteSentMessage(result)

    if (response.actions) {
      await prisma.message.create({
        data: {
          msgId: result.id.id,
          type: 'default',
          body: result.body,
          actions: response.actions,
        },
      })
    }

    if (response.afterMessage) {
      const msgBody = response.afterMessage
      const afterActions = response.afterMessageActions
      const chatId = msg.id.remote
      setTimeout(async () => {
        const result = await zapClient.sendMessage(chatId, msgBody)
        if (msg.id.remote.includes('@g.us')) deleteSentMessage(result)
        if (afterActions) {
          await prisma.message.create({
            data: {
              msgId: result.id.id,
              type: 'default',
              body: result.body,
              actions: afterActions,
            },
          })
        }
      }, response.afterMessageDelay || 5000)
    }
  } catch (e: any) {
    logger.error(e.response?.message ?? e.message)
    logger.error(e.response?.data ?? e.data)
    const error = e as AxiosError
    if (error.response?.data) {
      const data = error.response.data as any
    }
  }
}
