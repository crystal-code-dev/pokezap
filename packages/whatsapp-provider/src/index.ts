import express from 'express'
import ffmpegPath from 'ffmpeg-static'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { Client, LinkingMethod, NoAuth } from 'whatsapp-web.js'
import { logger } from './helpers/logger'
import router from './infra/router'
import { handleAllProcess } from './process'

process.on('uncaughtException', error => {
  logger.error(error?.message)
})

const app = express()
app.use(express.json())
app.use(router)

const client = new Client({
  authStrategy: new NoAuth(),
  webVersion: '2.2412.54v2',
  linkingMethod: new LinkingMethod({
    phone: {
      number: '+6285236870633',
    },
  }),
  puppeteer: {
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  },
  ffmpegPath: ffmpegPath ?? '',
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/guigo613/alternative-wa-version/main/html/2.2412.54v2.html',
  },
})
handleAllProcess(client)

container.registerInstance<Client>('WhatsappClient', client)

app.listen(4002, async () => {
  logger.info('Whatsapp-provider online on 4002')
})
