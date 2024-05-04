import { Client } from 'whatsapp-web.js'

import { authFailureProcess } from './authFailureProcess'
import { codeProcess } from './codeProcess'
import { groupJoinProcess } from './groupJoinProcess'
import { groupLeaveProcess } from './groupLeaveProcess'
import { loadingScreenProcess } from './loadingScreenProcess'
import { messageCreateProcess } from './messageCreateProcess'
import { messageReactionProcess } from './messageReactionProcess'
import { qrCodeProcess } from './qrCodeProcess'
import { readyProcess } from './readyProcess'

export const handleAllProcess = async (client: Client) => {
  client.initialize()
  const initDate = new Date()
  client.on('loading_screen', loadingScreenProcess)
  client.on('qr', qr => qrCodeProcess(qr))
  client.on('auth_failure', authFailureProcess)
  client.on('ready', readyProcess)
  client.on('message_reaction', async msg => messageReactionProcess(msg, initDate))
  client.on('message_create', async msg => messageCreateProcess(msg, initDate))
  client.on('group_join', notification => groupJoinProcess(notification, initDate))
  client.on('group_leave', notification => groupLeaveProcess(notification, initDate))
  client.on('code', codeProcess)
}
