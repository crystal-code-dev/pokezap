import { Image, createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
import { pokemonTypes } from '../../../common/constants/pokemonTypes'
import { DuelNpc, RaidPokemonBaseDataSkillsHeld } from '../../prisma-provider/src/types'
import { removeFileFromDisk } from './helpers/fileHelper'
import { loadOrSaveImageFromCache } from './helpers/loadOrSaveImageFromCache'

type TParams = {
  npc: DuelNpc & {
    pokemons: RaidPokemonBaseDataSkillsHeld[]
  }
}

export const iGenDuelistFind = async ({ npc }: TParams) => {
  // Define the dimensions of the canvas and the background
  const canvasWidth = 500
  const canvasHeight = 500
  const backgroundUrl = './src/assets/sprites/UI/hud/duelist_find.png'

  // Load the background image
  const background = await loadOrSaveImageFromCache(backgroundUrl)

  // Create a canvas with the defined dimensions
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false

  // Draw the background on the canvas
  ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight)

  const talentImageMap = new Map<string, Image>([])
  for (const type of pokemonTypes) {
    talentImageMap.set(type, await loadOrSaveImageFromCache('./src/assets/sprites/UI/types/circle/' + type + '.png'))
  }

  let j = 0
  let k = 0

  const npcSprite = await loadOrSaveImageFromCache('./src/assets/sprites/avatars/' + npc.spriteUrl + '.png')
  ctx.drawImage(npcSprite, 100, -20, 300, 300)

  console.log(npc.pokemons.map(p => p.baseData.name))

  for (let i = 0; i < 6; i++) {
    if (i === 3) {
      j++
      k = 0
    }

    const pokemon = npc.pokemons[i]

    if (!pokemon) continue

    const x = 125 + k * 100
    const y = 295 + j * 100

    const spriteUrl = pokemon.spriteUrl
    const sprite = await loadOrSaveImageFromCache(spriteUrl)
    ctx.drawImage(sprite, x, y, 70, 70)

    ctx.font = ' 9px Pokemon'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'end'
    ctx.fillText(`Lv: ${pokemon.level}`, x + 70, y + 75)

    ctx.font = ' 9px Pokemon'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'start'
    ctx.fillText(pokemon.baseData.name, x, y + 60)

    const type1Image = talentImageMap.get(pokemon.baseData.type1Name)
    if (!type1Image) continue
    ctx.drawImage(type1Image, x, y + 60, 14, 14)

    const type2Image = talentImageMap.get(pokemon.baseData.type2Name ?? pokemon.baseData.type1Name)
    if (!type2Image) continue
    ctx.drawImage(type2Image, x + 20, y + 60, 14, 14)

    k++
  }

  const filepath: string = await new Promise(resolve => {
    // Save the canvas to disk
    const filename = `images/image-${Math.random()}.png`
    const filepath = path.join(__dirname, filename)
    const out = fs.createWriteStream(filepath)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => {
      resolve(filepath)
    })
  })

  removeFileFromDisk(filepath, 5000)

  return filepath
}
