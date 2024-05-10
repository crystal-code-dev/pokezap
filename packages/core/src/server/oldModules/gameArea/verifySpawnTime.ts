export const verifySpawnTime = (spawnTimes: number[][] | undefined, hours: number): boolean => {
  if (!spawnTimes) return true
  for (const [timeA, timeB] of spawnTimes) {
    console.log([timeA, timeB], hours)
    if (hours >= timeA && hours <= timeB) return true
  }
  return false
}
