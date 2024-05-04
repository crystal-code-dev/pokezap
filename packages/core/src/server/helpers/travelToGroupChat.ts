import axios from 'axios'

type Params = {
  chatId: string
  participandId: string
}

type Message = {
  id: {
    id: string
  }
}

export const travelToGroupChat = async (inputData: Params): Promise<Message | undefined> => {
  try {
    const res = await axios.post('http://localhost:4002/group-chat-participant-add', inputData)

    return await res.data
  } catch (e: any) {
    return e.response?.data
  }
}