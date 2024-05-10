import { firstNames, secondNames } from '../../../constants/route/routeNames'

export const createRouteName = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const secondName = secondNames[Math.floor(Math.random() * secondNames.length)]

  return firstName + ' da ' + secondName
}
