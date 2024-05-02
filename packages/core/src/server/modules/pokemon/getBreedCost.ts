import { Pokemon } from '../../../types/prisma'
import { getChildrenCount } from './getChildrenCount'

export const getBreedCost = (childrenAmount: number, pokemon1: Pokemon, pokemon2: Pokemon) => {
  const poke1ChildrenCount = getChildrenCount(pokemon1)
  if (childrenAmount > 4 - poke1ChildrenCount)
    return {
      parentId: pokemon1.id,
      parentName: pokemon1.baseData.name,
      childrenAmount: poke1ChildrenCount,
      error: true,
    }

  const poke2ChildrenCount = getChildrenCount(pokemon2)
  if (childrenAmount > 4 - poke2ChildrenCount)
    return {
      parentId: pokemon2.id,
      parentName: pokemon2.baseData.name,
      childrenAmount: poke2ChildrenCount,
      error: true,
    }

  const getBreedingCosts = (poke: any, childrenCount: number) => {
    let finalCost = 0
    let updatedChildrenCount = childrenCount + 1

    for (let i = 0; i < childrenAmount; i++) {
      finalCost += (220 + (poke.baseData.BaseExperience ** 2 / 231) * updatedChildrenCount ** 3.23) / 2.7
      updatedChildrenCount++
    }
    return finalCost
  }
  const totalCost = Math.round(
    getBreedingCosts(pokemon1, poke1ChildrenCount) + getBreedingCosts(pokemon2, poke2ChildrenCount)
  )

  const shardCost = Math.round(totalCost / 10)
  return { totalCost, shardCost }
}
