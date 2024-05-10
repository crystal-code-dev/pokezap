import express from 'express'
import 'reflect-metadata'
import { registerFonts } from '../../image-generator/src/helpers/registerFonts'
import { logger } from './infra/logger'
import router from './infra/routers'
import { initProcess } from './server/oldModules/init'

process.on('uncaughtException', error => {
  logger.error(error)
})

registerFonts()

const app = express()
app.use(express.json())
app.use(router)

initProcess()

app.listen(4000, async () => {
  logger.info('PokeZap is online!')
})
