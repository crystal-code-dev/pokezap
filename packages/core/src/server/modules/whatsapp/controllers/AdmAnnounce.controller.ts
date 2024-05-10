import { UnexpectedError } from '../../../../infra/errors/AppErrors'
import { IWhatsappController, IWhatsappControllerExecuteResponse } from '../../../../interfaces/IWhatsappController'
import { AdmAnnounceService } from '../../../global/services/AdmAnnounce.service'

class AdmAnnounceControllerClass implements IWhatsappController {
  async execute(): Promise<IWhatsappControllerExecuteResponse> {
    const serviceResponse = await AdmAnnounceService.execute()
    if (!serviceResponse) throw new UnexpectedError('Service response')

    return {
      message: '',
      react: '✔',
    }
  }
}

export const AdmAnnounceController = new AdmAnnounceControllerClass()
