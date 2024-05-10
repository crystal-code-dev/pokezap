import { Request, Response, Router } from 'express'
import { IWhatsappRequestData } from '../../interfaces/IWhatsappRequestData'
import { UnexpectedError } from '../errors/AppErrors'
import { WhatsAppParser } from '../parsers/whatsapp.parser'

const whatsappRouter = Router() as Router

const whatsappParser = new WhatsAppParser()

whatsappRouter.post('/wpp', async (req: Request, res: Response) => {
  try {
    const { groupCode, messageBody, playerName, playerPhone, fromReact } = req.body as IWhatsappRequestData
    const parserResponse = whatsappParser.getController(messageBody)
    if (!parserResponse) throw new UnexpectedError('')
    const { controller, dataStrings } = parserResponse
    const data = await controller.execute({
      groupCode,
      dataStrings,
      playerName,
      playerPhone,
      fromReact,
    })
    res.status(200).send(data)
  } catch (err) {
    res.status(500).send(err)
  }
})

export default whatsappRouter
