import { createCanvas } from 'canvas'
import fs from 'fs'
import path from 'path'
import { removeFileFromDisk } from './helpers/fileHelper'
import { loadOrSaveImageFromCache } from './helpers/loadOrSaveImageFromCache'
import { logger } from './helpers/logger'

type TParams = {}

export const iGenBerryRanch = async (data: TParams) => {
  // Define the dimensions of the canvas and the background
  const canvasWidth = 500
  const canvasHeight = 500
  const backgroundUrl = './src/assets/sprites/UI/hud/berry-ranch.png'

  // Load the background image
  const background = await loadOrSaveImageFromCache(backgroundUrl)

  // Create a canvas with the defined dimensions
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = false

  // Draw the background on the canvas
  ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight)

  const berryNames = [
    'payapa',
    'shuca',
    'occa',
    'babiri',
    'charti',
    'chilian',
    'coba',
    'haban',
    'kasib',
    'passho',
    'roseli',
    'wacan',
    'yache',
    'tanga',
    'rindo',
  ]
  const states = ['seed', 'sprout', 'tall', 'bloom', 'berry']

  let j = 0
  let k = 0

  for (let i = 0; i < 8; i++) {
    if (i === 2 || i === 4 || i === 6 || i === 8) {
      j++
      k = 0
    }

    const x = 40 + k * 190
    const y = 45 + j * 90

    const berryName = berryNames[Math.floor(Math.random() * berryNames.length)]
    const state = states[Math.floor(Math.random() * states.length)]

    const sprite = await loadOrSaveImageFromCache(`./src/assets/sprites/berry-trees/${berryName}/${state}.png`)
    ctx.drawImage(sprite, x, y, 50, 80)

    ctx.font = ' 13px Pokemon'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText(`${berryName}`, x + 25, y + 85)

    // berry tree 2

    const berryName2 = berryNames[Math.floor(Math.random() * berryNames.length)]
    const state2 = states[Math.floor(Math.random() * states.length)]

    const sprite2 = await loadOrSaveImageFromCache(`./src/assets/sprites/berry-trees/${berryName2}/${state2}.png`)
    ctx.drawImage(sprite2, x + 65, y, 50, 80)

    ctx.font = ' 13px Pokemon'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText(`${berryName2}`, x + 90, y + 85)

    // water drops

    const amount = Math.floor(Math.random() * 4)

    const waterDropSprite = await loadOrSaveImageFromCache(`./src/assets/sprites/berry-trees/water-drop.png`)
    ctx.drawImage(waterDropSprite, x + 100, y + 30, 21, 21)

    ctx.font = ' 17px Pokemon'
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.fillText(`${amount}`, x + 118, y + 60)

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
      logger.info('The PNG file was created.')
      resolve(filepath)
    })
  })

  removeFileFromDisk(filepath, 11000)

  return filepath
}
