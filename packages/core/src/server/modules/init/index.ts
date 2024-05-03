import cron from 'node-cron'
import { pokeBossInvasion } from '../../../server/serverActions/cron/pokeBossInvasion'
import { wildPokeSpawn } from '../../../server/serverActions/cron/wildPokeSpawn'
import { energyResetJob } from '../../serverActions/cron/energyResetJob'
import { fishingSpotBossJob, fishingSpotSpawnJob } from '../../serverActions/cron/gameAreaJobs'
import { pokemonCenterJob } from '../../serverActions/cron/pokemonCenterJob'
import { rocketInvasion } from '../../serverActions/cron/rocketInvasion'

export const initProcess = async () => {
  cron.schedule(`10,30,50 * * * *`, () => wildPokeSpawn())
  cron.schedule('*/2 * * * *', () => {
    fishingSpotSpawnJob()
  })
  cron.schedule('*/4 * * * *', () => {
    wildPokeSpawn({
      needIncense: true,
    })
  })
  cron.schedule('*/20 * * * *', () => {
    fishingSpotBossJob()
  })
  cron.schedule('1 0,6,12,18 * * *', () => pokemonCenterJob())
  cron.schedule('0 0,12 * * *', () => energyResetJob())
  cron.schedule(`0 0,6,12,18 * * *`, () => pokeBossInvasion())
  cron.schedule(`0 2,6,10,14,18,22 * * *`, () => rocketInvasion())
}
