import { iGenBerryRanch } from '../../../../../image-generator/src/iGenBerryRanch'
import { RouteResponse } from '../../../server/models/RouteResponse'
import { TRouteParams } from '../router'

export const berryTest = async (data: TRouteParams): Promise<RouteResponse> => {
  const imageUrl = await iGenBerryRanch({})

  return {
    message: ``,
    imageUrl,
    status: 200,
    data: null,
  }
}
