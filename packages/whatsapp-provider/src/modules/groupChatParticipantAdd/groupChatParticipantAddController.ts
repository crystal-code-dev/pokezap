import { Request, Response } from 'express'
import { groupChatParticipantAddUseCase } from './groupChatParticipantAddUseCase'

export const groupChatParticipantAddController = async (request: Request, response: Response): Promise<Response> => {
  try {
    const data = request.body
    if (!data) throw new Error('Invalid request')
    const groupNameEditUseCaseResponse = await groupChatParticipantAddUseCase(data)

    return response.status(201).json(groupNameEditUseCaseResponse)
  } catch (error: any) {
    return response.status(400).send(error.message)
  }
}
