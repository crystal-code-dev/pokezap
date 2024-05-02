import { Router } from 'express'
import { groupChatCreateController } from '../modules/groupChatCreate/groupChatCreateController'
import { groupChatNameUpdateController } from '../modules/groupChatNameUpdate/groupChatNameUpdateController'
import { sendMessageController } from '../modules/sendMessage/sendMessageController'

const expressRouter = Router() as any

expressRouter.post('/send-message', sendMessageController)
expressRouter.post('/group-chat-name-update', groupChatNameUpdateController)
expressRouter.post('/group-chat-create', groupChatCreateController)

export default expressRouter
