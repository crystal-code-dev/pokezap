import { container } from 'tsyringe'
import { Client, GroupChat } from 'whatsapp-web.js'

type Params = {
  chatId: string
  participandId: string
}

type Response = {
  message: string
  success?: boolean
}

export const groupChatParticipantAddUseCase = async ({ chatId, participandId }: Params): Promise<Response> => {
  const client = container.resolve<Client>('WhatsappClient')

  const chat = await client.getChatById(chatId)
  if (!chat.isGroup)
    return {
      message: 'Not a groupChat',
    }

  const groupChat = chat as GroupChat
  await groupChat.addParticipants([participandId])

  return {
    message: `Done`,
    success: true,
  }
}
