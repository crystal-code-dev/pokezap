import { EService } from '../../enums/EService'
import { IWhatsappController } from '../../interfaces/IWhatsappController'
import { AdmAnnounceController } from '../../server/modules/whatsapp/controllers/AdmAnnounce.controller'

type TParsedResponse = {
  service: EService
  parseLevel: number
}

type TParserControllerResponse = {
  controller: IWhatsappController
  dataStrings: string[]
}

export class WhatsAppParser {
  private firstLevelParseMap = new Map<string, EService>([
    ['battle', EService.BATTLE_WILD_POKEMON],
    ['breed', EService.BREED_START],
    ['hatch', EService.BREED_HATCH],
    ['casino', EService.CASINO_PLAY],
    ['catch', EService.CATCH],
    ['shop', EService.SHOP_INFO],
    ['loja', EService.CATCH],
    ['buy', EService.CATCH],
    ['bazar', EService.BAZAR_INFO],
    ['inventory', EService.INVENTORY],
    ['i', EService.INVENTORY],
    ['items', EService.INVENTORY_ITEMS],
    ['itens', EService.INVENTORY_ITEMS],
    ['pokes', EService.INVENTORY_POKEMONS],
    ['pokemons', EService.INVENTORY_POKEMONS],
    ['egg', EService.INVENTORY_EGGS],
    ['eggs', EService.INVENTORY_EGGS],
    ['poke', EService.POKEMON_INFO],
    ['pokemon', EService.POKEMON_INFO],
    ['setrole', EService.POKEMON_SET_ROLE],
    ['set-role', EService.POKEMON_SET_ROLE],
    ['favorite', EService.POKEMON_FAVORITE],
    ['favorito', EService.POKEMON_FAVORITE],
    ['unfavorite', EService.POKEMON_UNFAVORITE],
    ['evolve', EService.POKEMON_EVOLVE],
    ['evoluir', EService.POKEMON_EVOLVE],
    ['experience', EService.POKEMON_EXPERIENCE],
    ['giveitem', EService.POKEMON_GIVE_ITEM],
    ['give-item', EService.POKEMON_GIVE_ITEM],
    ['dropitem', EService.POKEMON_DROP_ITEM],
    ['drop-item', EService.POKEMON_DROP_ITEM],
    ['megaevolve', EService.MEGA_EVOLVE],
    ['mega-evolve', EService.MEGA_EVOLVE],
    ['mega-revert', EService.MEGA_REVERT],
    ['megarevert', EService.MEGA_REVERT],
    ['help', EService.HELP],
    ['info', EService.HELP],
    ['ajuda', EService.HELP],
    ['cash', EService.PLAYER_CASH],
    ['energy', EService.PLAYER_ENERGY],
    ['sell', EService.SELL],
    ['team', EService.TEAM_SET],
    ['useitem', EService.USE_ITEM],
    ['user-item', EService.USE_ITEM],
    ['pokeranch', EService.POKERANCH],
    ['poke-ranch', EService.POKERANCH],
  ])

  private secondLevelParseMap = new Map<string, EService>([
    ['adm announce', EService.ADM_ANNOUNCE],
    ['adm maintenance', EService.ADM_MAINTENANCE],
    ['adm test', EService.ADM_TEST],
    ['breed confirm', EService.BREED_CONFIRM],
    ['casino play', EService.CASINO_PLAY],
    ['duelist find', EService.DUELIST_FIND],
    ['duelist info', EService.DUELIST_INFO],
    ['duelist duel', EService.DUELIST_DUEL],
    ['event info', EService.EVENT_INFO],
    ['event rank', EService.EVENT_RANK],
    ['help', EService.HELP],
    ['help skill', EService.HELP_SKILL],
    ['invasion forfeit', EService.INVASION_FORFEIT],
    ['inventory items', EService.INVENTORY_ITEMS],
    ['inventory pokemons', EService.INVENTORY_POKEMONS],
    ['inventory eggs', EService.INVENTORY_EGGS],
    ['mega evolve', EService.MEGA_EVOLVE],
    ['mega revert', EService.MEGA_REVERT],
    ['pokemon dropitem', EService.POKEMON_DROP_ITEM],
    ['pokemon evolve', EService.POKEMON_EVOLVE],
    ['pokemon experience', EService.POKEMON_EXPERIENCE],
    ['pokemon giveitem', EService.POKEMON_GIVE_ITEM],
    ['pokemon info', EService.POKEMON_INFO],
    ['pokemon nickname', EService.POKEMON_NICKNAME],
    ['pokemon set role', EService.POKEMON_SET_ROLE],
    ['pokemon favorite', EService.POKEMON_FAVORITE],
    ['pokemon unfavorite', EService.POKEMON_UNFAVORITE],
    ['pokemon skills', EService.POKEMON_AVAILABLE_SKILLS],
    ['raid group', EService.RAID_GROUP],
    ['raid start', EService.RAID_START],
    ['raid cancel', EService.RAID_CANCEL],
    ['raid join', EService.RAID_JOIN],
    ['raid progress', EService.RAID_PROGRESS],
    ['raid room-select', EService.RAID_ROOM_SELECT],
    ['ranking elo', EService.RANKING_ELO],
    ['ranking catch', EService.RANKING_CATCH],
    ['bazar info', EService.BAZAR_INFO],
    ['bazar buy', EService.BAZAR_BUY],
    ['daycare info', EService.DAYCARE_INFO],
    ['daycare enter', EService.DAYCARE_ENTER],
    ['daycare leave', EService.DAYCARE_LEAVE],
    ['route enter', EService.ROUTE_ENTER],
    ['route info', EService.ROUTE_INFO],
    ['route lock', EService.ROUTE_LOCK],
    ['route start', EService.ROUTE_START],
    ['route upgrade', EService.ROUTE_UPGRADE],
    ['route verify', EService.ROUTE_VERIFY],
    ['route leave', EService.ROUTE_LEAVE],
    ['pokeranch', EService.POKERANCH],
    ['sell item', EService.SELL_ITEM],
    ['sell pokemon', EService.SELL_POKEMON],
    ['sell many-pokemon', EService.SELL_MANY_POKEMON],
    ['send item', EService.SEND_ITEM],
    ['send poke', EService.SEND_POKE],
    ['send cash', EService.SEND_CASH],
    ['shop info', EService.SHOP_INFO],
    ['shop buy', EService.SHOP_BUY],
    ['team info', EService.TEAM_INFO],
    ['team load', EService.TEAM_LOAD],
    ['team main', EService.TEAM_MAIN],
    ['team save', EService.TEAM_SAVE],
    ['team set', EService.TEAM_SET],
    ['use item', EService.USE_ITEM],
    ['player info', EService.PLAYER_INFO],
    ['player register', EService.PLAYER_REGISTER],
    ['player cash', EService.PLAYER_CASH],
    ['player energy', EService.PLAYER_ENERGY],
  ])

  private parseMap = new Map<string, EService>([
    ['adm-announce', EService.ADM_ANNOUNCE],
    ['adm-generate-duel', EService.ADM_GENERATE_DUEL],
    ['adm-maintenance', EService.ADM_MAINTENANCE],
    ['adm-test', EService.ADM_TEST],
    ['battle', EService.BATTLE_WILD_POKEMON],
    ['breed', EService.BREED_START],
    ['breed-confirm', EService.BREED_CONFIRM],
    ['hatch', EService.BREED_HATCH],
    ['casino-play', EService.CASINO_PLAY],
    ['casino', EService.CASINO_PLAY],
    ['catch', EService.CATCH],
    ['duelist-find', EService.DUELIST_FIND],
    ['duelist-info', EService.DUELIST_INFO],
    ['duelist-duel', EService.DUELIST_DUEL],
    ['duel-x1-request', EService.DUEL_X1_REQUEST],
    ['duel-x2-request', EService.DUEL_X2_REQUEST],
    ['duel-x6-request', EService.DUEL_X6_REQUEST],
    ['duel-x1-accept', EService.DUEL_X1_ACCEPT],
    ['duel-x2-accept', EService.DUEL_X2_ACCEPT],
    ['duel-x6-accept', EService.DUEL_X6_ACCEPT],
    ['duel-generated-accept', EService.DUEL_GENERATED_ACCEPT],
    ['event-info', EService.EVENT_INFO],
    ['event-rank', EService.EVENT_RANK],
    ['help', EService.HELP],
    ['help-skill', EService.HELP_SKILL],
    ['invasion-defend-join', EService.INVASION_DEFEND_JOIN],
    ['invasion-defend-battle', EService.INVASION_DEFEND_BATTLE],
    ['invasion-forfeit', EService.INVASION_FORFEIT],
    ['inventory-items', EService.INVENTORY_ITEMS],
    ['inventory-pokemons', EService.INVENTORY_POKEMONS],
    ['inventory-eggs', EService.INVENTORY_EGGS],
    ['mega-evolve', EService.MEGA_EVOLVE],
    ['mega-revert', EService.MEGA_REVERT],
    ['pokemon-drop-item', EService.POKEMON_DROP_ITEM],
    ['pokemon-evolve', EService.POKEMON_EVOLVE],
    ['pokemon-experience', EService.POKEMON_EXPERIENCE],
    ['pokemon-give-item', EService.POKEMON_GIVE_ITEM],
    ['pokemon-info', EService.POKEMON_INFO],
    ['pokemon-nickname', EService.POKEMON_NICKNAME],
    ['pokemon-set-role', EService.POKEMON_SET_ROLE],
    ['pokemon-favorite', EService.POKEMON_FAVORITE],
    ['pokemon-unfavorite', EService.POKEMON_UNFAVORITE],
    ['pokemon-available-skills', EService.POKEMON_AVAILABLE_SKILLS],
    ['pokemon-type-skills', EService.POKEMON_TYPE_SKILLS],
    ['pokemon-role-skills', EService.POKEMON_ROLE_SKILLS],
    ['raid-group', EService.RAID_GROUP],
    ['raid-start', EService.RAID_START],
    ['raid-cancel', EService.RAID_CANCEL],
    ['raid-join', EService.RAID_JOIN],
    ['raid-progress', EService.RAID_PROGRESS],
    ['raid-room-select', EService.RAID_ROOM_SELECT],
    ['ranking-elo', EService.RANKING_ELO],
    ['ranking-catch', EService.RANKING_CATCH],
    ['bazar-info', EService.BAZAR_INFO],
    ['bazar-buy', EService.BAZAR_BUY],
    ['daycare-info', EService.DAYCARE_INFO],
    ['daycare-enter', EService.DAYCARE_ENTER],
    ['daycare-leave', EService.DAYCARE_LEAVE],
    ['route-enter', EService.ROUTE_ENTER],
    ['route-info', EService.ROUTE_INFO],
    ['route-lock', EService.ROUTE_LOCK],
    ['route-start', EService.ROUTE_START],
    ['route-upgrade', EService.ROUTE_UPGRADE],
    ['route-verify', EService.ROUTE_VERIFY],
    ['route-leave', EService.ROUTE_LEAVE],
    ['pokeranch', EService.POKERANCH],
    ['sell-item', EService.SELL_ITEM],
    ['sell-pokemon', EService.SELL_POKEMON],
    ['sell-many-pokemon', EService.SELL_MANY_POKEMON],
    ['send-item', EService.SEND_ITEM],
    ['send-poke', EService.SEND_POKE],
    ['send-cash', EService.SEND_CASH],
    ['shop-info', EService.SHOP_INFO],
    ['shop-buy', EService.SHOP_BUY],
    ['team-info', EService.TEAM_INFO],
    ['team-load', EService.TEAM_LOAD],
    ['team-main', EService.TEAM_MAIN],
    ['team-save', EService.TEAM_SAVE],
    ['team-set', EService.TEAM_SET],
    ['use-item', EService.USE_ITEM],
    ['player-info', EService.PLAYER_INFO],
    ['player-register', EService.PLAYER_REGISTER],
    ['player-cash', EService.PLAYER_CASH],
    ['player-energy', EService.PLAYER_ENERGY],
  ])

  private serviceControllerMap = new Map<EService, IWhatsappController>([
    [EService.ADM_ANNOUNCE, AdmAnnounceController],
  ])

  private parse(commandString: string): TParsedResponse | undefined {
    const command = commandString.trim().toLocaleLowerCase().split(' ')
    const firstLevelService = this.firstLevelParseMap.get(command.slice(1, 2).join(' '))
    const secondLevelService = this.secondLevelParseMap.get(command.slice(1, 3).join(' '))
    const thirdLevelService = this.secondLevelParseMap.get(command.slice(1, 3).join(' '))

    if (thirdLevelService)
      return {
        service: thirdLevelService,
        parseLevel: 3,
      }
    if (secondLevelService)
      return {
        service: secondLevelService,
        parseLevel: 2,
      }
    if (firstLevelService)
      return {
        service: firstLevelService,
        parseLevel: 1,
      }
  }

  public getController(commandString: string): TParserControllerResponse | undefined {
    const parsed = this.parse(commandString)
    if (!parsed) return undefined
    const { service, parseLevel } = parsed
    const controller = this.serviceControllerMap.get(service)
    if (!controller) return undefined
    const dataStrings = commandString.split(' ').slice(parseLevel)
    return { controller, dataStrings }
  }
}
