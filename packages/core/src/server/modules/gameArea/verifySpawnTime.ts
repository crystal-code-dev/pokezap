export const verifySpawnTime = (spawnTimes: number[][], hours: number): boolean => {
  for (const [timeA, timeB] of spawnTimes) {
    console.log([timeA, timeB], hours)
    if (hours >= timeA && hours <= timeB) return true
  }
  return false
}
