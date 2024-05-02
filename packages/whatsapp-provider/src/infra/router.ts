import { Router } from 'express'
import { groupChatNameUpdateController } from '../modules/groupChatNameUpdate/groupChatNameUpdateController'
import { sendMessageController } from '../modules/sendMessage/sendMessageController'

const expressRouter = Router() as any

expressRouter.post('/send-message', sendMessageController)
expressRouter.post('/group-chat-name-update', groupChatNameUpdateController)

export default expressRouter
