import prisma from '..'
import axios from 'axios'

export const fetchMoreSkillsDetails = async () => {
  const baseUrl = 'https://pokeapi.co/api/v2'
  const endpoint = '/move/'

  // Fetch data for the first 151 Pokemon
  const limit = 920
  const url = `${baseUrl}${endpoint}?limit=${limit}`

  axios
    .get(url)
    .then(response => response.data())
    .then(async (data: any) => {
      // Map each Pokemon to a new object with name and types properties
      const moveData = data.results.map((move: any) => ({
        name: move.name,
      }))

      // Fetch additional data for each Pokemon and add types to the objects
      const skillsData = await Promise.all(
        moveData.map((move: any) => {
          const url = `${baseUrl}${endpoint}${move.name}`
          return axios
            .get(url)
            .then(response => response.data())
            .then((data: any) => {
              move.id = data.id
              move.type = data.type.name
              move.target = data.target.name
              move.pp = data.pp ?? 10
              move.class = data.damage_class.name
              move.power = data.power
              move.accuracy = data.accuracy ?? 100
              move.statChangeName = data.stat_changes[0]?.stat?.name ?? 'none'
              move.statChangeAmount = data.stat_changes[0]?.change ?? 0
              move.ailment = data.meta?.ailment?.name ?? 'none'
              move.ailmentChance = data.meta?.ailment_chance
              move.drain = data.meta?.drain
              move.healing = data.meta?.healing
              move.category = data.meta?.category.name
              move.description = data.effect_entries[0]?.short_effect ?? 'description not available'
              return move
            })
        })
      )

      const prismaOperations: any[] = []

      skillsData.map(skill => {
        const operation = prisma.skill.update({
          where: {
            name: skill.name,
          },
          data: {
            target: skill.target,
            pp: skill.pp,
            accuracy: skill.accuracy,
            statChangeAmount: skill.statChangeAmount,
            statChangeName: skill.statChangeName,
            drain: skill.drain,
            healing: skill.healing,
            ailment: skill.ailment,
            ailmentChance: skill.ailmentChance,
            category: skill.category,
            description: skill.description,
            class: skill.class,
          },
        })
        prismaOperations.push(operation)
      })

      await Promise.all(prismaOperations)
    })
}