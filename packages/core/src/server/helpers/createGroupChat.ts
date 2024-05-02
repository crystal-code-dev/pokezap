import axios from 'axios'

type Params = {
  playerPhone: string
  groupName: string
  imageUrl?: string
}

type Response = {
  message: string
  success?: boolean
  group?: any
  inviteCode?: string
}

export const createGroupChat = async (inputData: Params): Promise<Response | undefined> => {
  try {
    const res = await axios.post('http://localhost:4002/group-chat-create', inputData)

    if (!res.data) throw new Error('No axios response')

    return (await res.data) as Response
  } catch (e: any) {
    return e.response?.data
  }
}
