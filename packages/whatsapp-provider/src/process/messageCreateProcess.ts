import ffmpeg from 'fluent-ffmpeg'
import { container } from 'tsyringe'
import { Client, Message, MessageMedia } from 'whatsapp-web.js'

import { AxiosError } from 'axios'
import path from 'path'
import { ServerResponse } from '../../../core/src/types/ServerResponse'
import prisma from '../../../prisma-provider/src'
import { UserDemandHandler } from '../constants/UserDemandHandler'
import { deleteSentMessage } from '../helpers/deleteSentMessage'
import { logger } from '../helpers/logger'
import { requestServer } from '../helpers/requestServer'
import { verifyTargetChat } from '../helpers/verifyTargetChat'

const userDemand = new UserDemandHandler()

export const messageCreateProcess = async (msg: Message, initDate: Date) => {
  try {
    if (!msg.body.toUpperCase().includes('POKEZAP.') && !msg.body.toUpperCase().includes('PZ.')) return
    const zapClient = container.resolve<Client>('WhatsappClient')

    const msgDate = new Date(msg.timestamp * 1000)
    if (msgDate.getTime() < initDate.getTime()) return

    // generic
    const permit = await verifyTargetChat(msg.to)
    if (!permit) return

    logger.info('msgcreate')

    const contact = await msg.getContact()

    if (msg.body.includes('[dsb]')) return
    if (msg.body.includes('[d]')) return

    const playerPhone = getPlayerPhone(msg)

    // generic
    const demand = userDemand.get(playerPhone)
    if (demand && demand >= 3) {
      msg.react('💤')
      return
    }
    userDemand.add(playerPhone, 1)
    setTimeout(() => userDemand.reduce(playerPhone, 1), 2000)

    const response: ServerResponse = await requestServer({
      playerPhone,
      routeParams: msg.body.toUpperCase().split(' '),
      playerName: contact.pushname ?? contact.name ?? contact.shortName ?? 'Nome indefinido',
      groupCode: msg.id.remote,
    })

    if (response.react) {
      msg.react(response.react)
      return
    }

    if (!response.imageUrl) {
      const result = await msg.reply(response.message)
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
        setTimeout(async () => {
          await zapClient.sendMessage(msg.id.remote, msgBody)
          if (msg.id.remote.includes('@g.us')) deleteSentMessage(result)
        }, response.afterMessageDelay || 5000)
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

    console.log('1')

    const media = MessageMedia.fromFilePath(filePath)
    const result = await zapClient.sendMessage(msg.id.remote, response.message, {
      media,
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
      const chatId = msg.id.remote
      setTimeout(async () => {
        const msg = await zapClient.sendMessage(chatId, msgBody)
        if (chatId.includes('@g.us')) deleteSentMessage(msg)
      }, response.afterMessageDelay || 5000)
    }
    return
  } catch (e: any) {
    console.error(e)
    const error = e as AxiosError
    if (error.response?.data) {
      const data = error.response.data as any

      msg.reply(data.message)
    } else {
      msg.reply('❌ Sem resposta do servidor ❌')
    }
  }
}

const getPlayerPhone = (msg: Message) => {
  if (!msg.author) return msg.from

  const match = msg.author.match(/^(\d+):(\d+)@c\.us$/)
  if (match) {
    return `${match[1]}@c.us`
  }

  return msg.author
}
