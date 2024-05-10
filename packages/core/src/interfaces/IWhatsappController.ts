export interface IWhatsappControllerExecuteParams {
  playerName: string
  playerPhone: string
  groupCode: string
  fromReact?: boolean
  dataStrings: string[]
}

export interface IWhatsappControllerExecuteResponse {
  message: string
  imageUrl?: string
  react?: string
  afterMessage?: string
  afterMessageDelay?: number
}

export interface IWhatsappController {
  execute: (data: IWhatsappControllerExecuteParams) => Promise<unknown>
}
