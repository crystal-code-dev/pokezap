import { container } from 'tsyringe'
import { Client, GroupChat } from 'whatsapp-web.js'

type Params = {
  playerPhone: string
  groupName: string
}

type Response = {
  message: string
  success?: boolean
  group?: GroupChat
  inviteCode?: string
}

export const groupChatCreateUseCase = async ({ playerPhone, groupName }: Params): Promise<Response> => {
  const client = container.resolve<Client>('WhatsappClient')

  const createGroupResult = await client.createGroup(groupName, playerPhone)
  if (typeof createGroupResult === 'string')
    return {
      message: createGroupResult,
    }

  const group = (await client.getChatById(createGroupResult.gid._serialized)) as GroupChat
  const inviteCode = await group.getInviteCode()

  return {
    message: `Group created`,
    group,
    inviteCode,
    success: true,
  }
}
