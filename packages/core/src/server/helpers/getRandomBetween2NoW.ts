export const getRandomBetween2NoW = (x: unknown, y: unknown) => {
  const random = Math.random()
  if (random < 0.5) return x
  return y
}
