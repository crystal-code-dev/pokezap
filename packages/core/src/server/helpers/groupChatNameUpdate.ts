import axios from 'axios'

type Params = {
  chatId: string
  newName: string
}

export const groupChatNameUpdate = async (inputData: Params): Promise<any> => {
  try {
    const res = await axios.post('http://localhost:4002/group-chat-name-update', inputData)

    return await res.data
  } catch (e: any) {
    return e.response?.data
  }
}
