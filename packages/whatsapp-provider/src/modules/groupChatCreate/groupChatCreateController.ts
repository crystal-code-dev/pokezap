import { Request, Response } from 'express'
import { groupChatCreateUseCase } from './groupChatCreateUseCase'

export const groupChatCreateController = async (request: Request, response: Response): Promise<Response> => {
  try {
    const data = request.body
    if (!data) throw new Error('Invalid request')
    const groupNameEditUseCaseResponse = await groupChatCreateUseCase(data)

    return response.status(201).json(groupNameEditUseCaseResponse)
  } catch (error: any) {
    return response.status(400).send(error.message)
  }
}
