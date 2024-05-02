import { container } from 'tsyringe'
import { Client, GroupChat } from 'whatsapp-web.js'

type Params = {
  chatId: string
  newName: string
}

type Response = {
  message: string
  success?: boolean
}

export const groupChatNameUpdateUseCase = async ({ chatId, newName }: Params): Promise<Response> => {
  const client = container.resolve<Client>('WhatsappClient')

  const chat = await client.getChatById(chatId)
  if (!chat.isGroup)
    return {
      message: 'Not a groupChat',
    }

  const groupChat = chat as GroupChat
  const result = await groupChat.setSubject(newName)

  if (!result)
    return {
      message: 'Error',
    }

  return {
    message: `Updated to ${newName}`,
    success: true,
  }
}
