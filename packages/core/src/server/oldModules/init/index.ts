import cron from 'node-cron'
import { dailyResetJob } from '../../serverActions/cron/dailyResetJob'
import { fishingSpotBossJob } from '../../serverActions/cron/gameAreaJobs'
import { rockTunnelBossJob } from '../../serverActions/cron/gameAreaJobs/rockTunnelBossJob'
import { rockTunnelSpawnJob } from '../../serverActions/cron/gameAreaJobs/rockTunnelSpawnJob'
import { generateDuelist } from '../../serverActions/cron/generateDuelist'
import { pokeBossInvasion } from '../../serverActions/cron/pokeBossInvasion'
import { pokemonCenterJob } from '../../serverActions/cron/pokemonCenterJob'
import { rocketInvasion } from '../../serverActions/cron/rocketInvasion'
import { wildPokeSpawn } from '../../serverActions/cron/wildPokeSpawn'

export const initProcess = async () => {
  cron.schedule(`10,30,50 * * * *`, () => wildPokeSpawn())
  cron.schedule('*/4 * * * *', () => {
    wildPokeSpawn({
      needIncense: true,
    })
  })
  cron.schedule('*/20 * * * *', () => {
    fishingSpotBossJob()
    rockTunnelSpawnJob()
  })
  cron.schedule('1 0,6,12,18 * * *', () => pokemonCenterJob())
  cron.schedule('0 0 * * *', () => dailyResetJob())
  cron.schedule(`0 0,6,12,18 * * *`, () => pokeBossInvasion())
  cron.schedule(`0 2,6,10,14,18,22 * * *`, () => {
    rocketInvasion()
    generateDuelist()
    rockTunnelBossJob()
  })
}
