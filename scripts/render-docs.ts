import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { renderScene } from '../frontend/src/scenes/index.ts'
import { sceneStyles } from '../frontend/src/styles.ts'

const OUT = join(import.meta.dir, '..', 'docs')
const CELL = 200
const GAP = 16
const LABEL = 30

interface Sample {
  label: string
  name: string
  state: string
  fill?: number
  stink?: number
}

function serialize(value: unknown): string {
  if (value === null || value === undefined || value === false || typeof value === 'symbol')
    return ''
  if (Array.isArray(value)) return value.map(serialize).join('')
  if (typeof value === 'object' && 'strings' in value && 'values' in value) {
    const { strings, values } = value as { strings: string[]; values: unknown[] }
    return strings
      .map((part, index) => {
        if (index >= values.length) return part
        const rendered = serialize(values[index])
        return part + (/=\s*$/.test(part) ? `"${rendered}"` : rendered)
      })
      .join('')
  }
  return String(value)
}

function cell(sample: Sample, index: number, prefix: string): string {
  const x = GAP + index * (CELL + GAP)
  const scene = { progress: 0.5, fill: 0, stink: 0, ...sample } as never
  const markup = serialize(renderScene(scene, { animations: false }))
    .replaceAll(/<!--.*?-->/g, '')
    .replaceAll(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
    .replaceAll(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace('<svg', `<svg x="${x}" y="${GAP}" width="${CELL}" height="${CELL}"`)
  const label = `<text x="${x + CELL / 2}" y="${GAP + CELL + 22}" text-anchor="middle" fill="#ABA8B8" font-size="15" font-family="-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif">${sample.label}</text>`
  return markup + label
}

function gallery(name: string, samples: Sample[]): void {
  const width = GAP + samples.length * (CELL + GAP)
  const height = GAP + CELL + LABEL + GAP
  const body = samples.map((sample, index) => cell(sample, index, `${name}${index}-`)).join('')
  writeFileSync(
    join(OUT, `${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" rx="24" fill="#1C1B24"/>${body}</svg>\n`,
  )
}

const FONT = '-apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
const BOLT = 'M7,2V13H10V22L17,10H13L17,2H7Z'
const WIDTH = 960
const HEIGHT = 572
const FRAME_SECONDS = 3

interface Tile {
  title: string
  stage: string
  status: string
  scene: Omit<Sample, 'label'>
  button: string
  tone: 'loud' | 'quiet' | 'auto' | 'done'
}

interface Moment {
  time: string
  hour: number
  caption: string
  sky: [string, string]
  pills: Tile
  laundry: Tile
  plant: Tile
}

const pill = (
  state: string,
  fill: number,
  stage: string,
  status: string,
  button: string,
  tone: Tile['tone'],
): Tile => ({
  title: 'Morning pills',
  stage,
  status,
  button,
  tone,
  scene: { name: 'pills', state, fill },
})

const wash = (
  state: string,
  fill: number,
  stink: number,
  stage: string,
  status: string,
  button: string,
  tone: Tile['tone'],
): Tile => ({
  title: 'Laundry',
  stage,
  status,
  button,
  tone,
  scene: { name: 'laundry', state, fill, stink },
})

const green = (
  state: string,
  fill: number,
  stink: number,
  status: string,
  button: string,
  tone: Tile['tone'],
): Tile => ({
  title: 'Water the fern',
  stage: 'Water it',
  status,
  button,
  tone,
  scene: { name: 'plant', state, fill, stink },
})

const pillsWaiting = pill('accumulating', 0.9, 'Take your pills', 'in 1 h', 'Do early', 'quiet')
const pillsDue = pill('due', 1, 'Take your pills', 'Due now', 'Done', 'loud')
const pillsDone = pill('clean', 0, 'Take your pills', 'Done for today', 'Done', 'done')
const plantLater = green('accumulating', 0.6, 0, 'today at 15:00', 'Do early', 'quiet')
const plantDue = green('due', 1, 0.4, 'Due now', 'Done', 'loud')
const plantDone = green('clean', 0, 0, 'Done for today', 'Done', 'done')
const overdue = wash('due', 1, 0.8, 'Collect and load', '2 days overdue', 'Started', 'loud')

const MOMENTS: Moment[] = [
  {
    time: '07:00',
    hour: 7,
    caption: "The week's laundry has been quietly piling up",
    sky: ['#55619f', '#f6ab82'],
    pills: pillsWaiting,
    laundry: wash(
      'accumulating',
      0.8,
      0,
      'Collect and load',
      'today at 09:00',
      'Do early',
      'quiet',
    ),
    plant: plantLater,
  },
  {
    time: '08:00',
    hour: 8,
    caption: 'Pill time',
    sky: ['#6aa3dc', '#fbd5a0'],
    pills: pillsDue,
    laundry: wash('accumulating', 0.9, 0, 'Collect and load', 'in 1 h', 'Do early', 'quiet'),
    plant: plantLater,
  },
  {
    time: '08:05',
    hour: 8.1,
    caption: "One tap, and that's the pills done",
    sky: ['#68a4df', '#f7dcb0'],
    pills: pillsDone,
    laundry: wash('accumulating', 0.9, 0, 'Collect and load', 'in 55 min', 'Do early', 'quiet'),
    plant: plantLater,
  },
  {
    time: '09:30',
    hour: 9.5,
    caption: 'Ignored for days, and the scene is not subtle about it',
    sky: ['#4e9ae0', '#c2e4f7'],
    pills: pillsDone,
    laundry: overdue,
    plant: plantLater,
  },
  {
    time: '10:30',
    hour: 10.5,
    caption: 'The washer draws power, so the wash starts itself',
    sky: ['#3f90e0', '#a8dbf7'],
    pills: pillsDone,
    laundry: wash('running', 1, 0, 'Washing', 'Started 2 min ago', 'Automatic', 'auto'),
    plant: plantLater,
  },
  {
    time: '12:10',
    hour: 12.2,
    caption: 'Power drops, and now it wants hanging up',
    sky: ['#2f87e0', '#9fd6f7'],
    pills: pillsDone,
    laundry: wash('waiting', 1, 0, 'Hang it up', 'Just finished', 'Hung up', 'loud'),
    plant: plantLater,
  },
  {
    time: '15:00',
    hour: 15,
    caption: 'Three hours later, it starts getting musty',
    sky: ['#4f94d8', '#d4e2ee'],
    pills: pillsDone,
    laundry: wash('waiting', 1, 0.7, 'Hang it up', 'Waiting 3 h', 'Hung up', 'loud'),
    plant: plantDue,
  },
  {
    time: '15:10',
    hour: 15.2,
    caption: 'Hung up at last',
    sky: ['#5496d6', '#dfe2e6'],
    pills: pillsDone,
    laundry: wash('clean', 0, 0, 'Collect and load', 'Clean', 'Done', 'done'),
    plant: plantDue,
  },
  {
    time: '18:30',
    hour: 18.5,
    caption: 'Fern watered. All clear.',
    sky: ['#6859a7', '#f08b5e'],
    pills: pillsDone,
    laundry: wash('clean', 0, 0, 'Collect and load', 'Clean', 'Done', 'done'),
    plant: plantDone,
  },
  {
    time: '22:30',
    hour: 22.5,
    caption: 'Tomorrow the tide comes in again',
    sky: ['#0d1330', '#28315c'],
    pills: pill('resting', 0, 'Take your pills', 'tomorrow at 08:00', 'Do early', 'quiet'),
    laundry: wash('accumulating', 0.08, 0, 'Collect and load', 'in 7 days', 'Do early', 'quiet'),
    plant: green('resting', 0, 0, 'in 7 days', 'Do early', 'quiet'),
  },
]

const label = (x: number, y: number, size: number, fill: string, value: string, extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="${FONT}" ${extra}>${value}</text>`

function sceneMarkup(
  sample: Omit<Sample, 'label'>,
  x: number,
  y: number,
  size: number,
  prefix: string,
  animations: boolean,
): string {
  const scene = { progress: 0.5, fill: 0, stink: 0, ...sample } as never
  return serialize(renderScene(scene, { animations }))
    .replaceAll(/<!--.*?-->/g, '')
    .replaceAll(/\bid="([^"]+)"/g, `id="${prefix}$1"`)
    .replaceAll(/url\(#([^)]+)\)/g, `url(#${prefix}$1)`)
    .replace('<svg', `<svg x="${x}" y="${y}" width="${size}" height="${size}"`)
}

function buttonMarkup(tile: Tile, x: number, y: number, width: number): string {
  const palette = {
    loud: ['#7f77dd', '#ffffff'],
    quiet: ['#34323f', '#c7c4d3'],
    auto: ['#2c4257', '#9fd6f7'],
    done: ['#24483f', '#8fe0c0'],
  }[tile.tone]
  const [background, foreground] = palette as [string, string]
  const center = x + width / 2
  const bolt =
    tile.tone === 'auto'
      ? `<path transform="translate(${center - 60} ${y + 10}) scale(0.75)" d="${BOLT}" fill="${foreground}"/>`
      : ''
  return (
    `<rect x="${x}" y="${y}" width="${width}" height="38" rx="19" fill="${background}"/>${bolt}` +
    label(center, y + 24, 14.5, foreground, tile.button, 'text-anchor="middle" font-weight="600"')
  )
}

function tileMarkup(tile: Tile, x: number, y: number, prefix: string, animations: boolean): string {
  const width = 272
  const center = x + width / 2
  return [
    `<rect x="${x}" y="${y}" width="${width}" height="324" rx="16" fill="#25232f"/>`,
    sceneMarkup(tile.scene, center - 88, y + 12, 176, prefix, animations),
    label(center, y + 215, 18, '#f2f0f8', tile.title, 'text-anchor="middle" font-weight="600"'),
    label(center, y + 238, 14, '#aba8b8', tile.stage, 'text-anchor="middle"'),
    label(center, y + 259, 14, '#d9d6e3', tile.status, 'text-anchor="middle"'),
    buttonMarkup(tile, x + 16, y + 274, width - 32),
  ].join('')
}

function skyMarkup(moment: Moment, index: number, cls: string): string {
  const id = `sky${index}`
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${moment.sky[0]}"/><stop offset="0.7" stop-color="${moment.sky[1]}"/></linearGradient><rect class="${cls}" width="${WIDTH}" height="${HEIGHT}" fill="url(#${id})"/>`
}

function uiMarkup(moment: Moment, index: number, cls: string, animations: boolean): string {
  const panelY = 96
  const tilesY = panelY + 56
  const tab = (x: number, text: string, active: boolean) =>
    (active
      ? `<rect x="${x - 34}" y="${panelY + 12}" width="68" height="32" rx="16" fill="#e4cdee"/>`
      : '') +
    label(
      x,
      panelY + 33,
      14,
      active ? '#1f1d2b' : '#c7c4d3',
      text,
      'text-anchor="middle" font-weight="600"',
    )
  return `<g class="${cls}">${[
    `<rect x="40" y="${panelY}" width="880" height="396" rx="20" fill="#1a1922"/>`,
    label(64, panelY + 34, 19, '#f2f0f8', 'Housetide', 'font-weight="600"'),
    tab(716, 'Today', true),
    tab(790, 'Tasks', false),
    tab(864, 'History', false),
    tileMarkup(moment.pills, 56, tilesY, `f${index}a-`, animations),
    tileMarkup(moment.laundry, 344, tilesY, `f${index}b-`, animations),
    tileMarkup(moment.plant, 632, tilesY, `f${index}c-`, animations),
    `<rect y="508" width="${WIDTH}" height="64" fill="#14131b" opacity="0.72"/>`,
    label(56, 551, 32, '#ffffff', moment.time, 'font-weight="700"'),
    label(170, 549, 21, '#ffffff', moment.caption),
  ].join('')}</g>`
}

const sunX = (hour: number) => 40 + ((hour - 5) / 16) * 880
const sunY = (hour: number) => 124 - Math.sin((Math.PI * (hour - 5)) / 16) * 92

function keyframes(index: number, total: number): string {
  const step = 100 / total
  const start = index * step
  const end = start + step
  const fade = 0.8
  if (index === 0) {
    return `@keyframes f0 { 0%, ${end - fade}% { opacity: 1 } ${end}%, ${100 - fade}% { opacity: 0 } 100% { opacity: 1 } }`
  }
  return `@keyframes f${index} { 0%, ${start - fade}% { opacity: 0 } ${start}%, ${end - fade}% { opacity: 1 } ${end}%, 100% { opacity: 0 } }`
}

function dayStyles(): string {
  const total = MOMENTS.length
  const seconds = total * FRAME_SECONDS
  const sun = MOMENTS.map((moment, index) => {
    const at = (index / total) * 100
    const opacity = moment.hour > 21 ? 0 : 1
    return `${at}% { transform: translate(${sunX(moment.hour)}px, ${sunY(moment.hour)}px); opacity: ${opacity} }`
  }).join(' ')
  const moon = `0%, ${(100 * (total - 1)) / total - 1}% { opacity: 0 } ${(100 * (total - 1)) / total}%, 99% { opacity: 1 } 100% { opacity: 0 }`
  const last = MOMENTS.at(-1) as Moment
  return [
    '.f { opacity: 0 }',
    ...MOMENTS.map((_, index) => `.f${index} { animation: f${index} ${seconds}s linear infinite }`),
    ...MOMENTS.map((_, index) => keyframes(index, total)),
    `.sun { animation: sun ${seconds}s linear infinite }`,
    `@keyframes sun { ${sun} 100% { transform: translate(${sunX(last.hour)}px, ${sunY(last.hour)}px); opacity: 0 } }`,
    `.moon { opacity: 0; animation: moon ${seconds}s linear infinite }`,
    `@keyframes moon { ${moon} }`,
    '@media (prefers-reduced-motion: reduce) { .f, .sun, .moon { animation: none } .f4 { opacity: 1 } }',
  ].join('\n')
}

function dayCycle(only?: number): string {
  const animated = only === undefined
  const moments = MOMENTS.map((moment, index) => ({ moment, index })).filter(
    ({ index }) => animated || index === only,
  )
  const focus = MOMENTS[only ?? 4]
  const sceneAnimations = sceneStyles.cssText.replace(/\.ht-scene\s*\{[^}]*\}/, '')
  const css = animated ? `${sceneAnimations}\n${dayStyles()}` : '.f { opacity: 1 }'
  const sky = moments.map(({ moment, index }) => skyMarkup(moment, index, `f f${index}`)).join('')
  const ui = moments
    .map(({ moment, index }) => uiMarkup(moment, index, `f f${index}`, animated))
    .join('')
  const sunTransform = animated
    ? ''
    : ` transform="translate(${sunX(focus.hour)} ${sunY(focus.hour)})"`
  const sun = `<g class="sun"${sunTransform}><circle r="44" fill="#ffe9a8" opacity="0.28"/><circle r="26" fill="#ffd76a"/></g>`
  const moon =
    animated || focus.hour > 21
      ? `<g class="moon" transform="translate(820 52)"><circle r="24" fill="#e8e6f5"/><circle cx="9" cy="-5" r="20" fill="#1a2247"/></g>`
      : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="A day in Housetide, from dawn to night"><style><![CDATA[${css}]]></style><clipPath id="round"><rect width="${WIDTH}" height="${HEIGHT}" rx="24"/></clipPath><g clip-path="url(#round)">${sky}${only !== undefined && focus.hour > 21 ? '' : sun}${moon}${ui}</g></svg>\n`
}

mkdirSync(OUT, { recursive: true })
gallery('laundry', [
  { label: 'Piling up', name: 'laundry', state: 'accumulating', fill: 0.35 },
  { label: 'Overdue, and it shows', name: 'laundry', state: 'due', fill: 1, stink: 0.8 },
  { label: 'Washing', name: 'laundry', state: 'running', fill: 1 },
  { label: 'Hang it up', name: 'laundry', state: 'waiting', fill: 1, stink: 0.5 },
  { label: 'Clean', name: 'laundry', state: 'clean' },
])
gallery('others', [
  { label: 'Time for a pill', name: 'pills', state: 'due', fill: 1 },
  { label: 'Taken', name: 'pills', state: 'clean' },
  { label: 'Getting thirsty', name: 'plant', state: 'accumulating', fill: 0.7 },
  { label: 'Please', name: 'plant', state: 'due', fill: 1, stink: 0.9 },
  { label: 'Any other task', name: 'generic', state: 'accumulating', fill: 0.6 },
])
writeFileSync(join(OUT, 'day.svg'), dayCycle())

const frameArg = process.argv.indexOf('--frame')
if (frameArg !== -1) {
  writeFileSync(process.argv[frameArg + 2] as string, dayCycle(Number(process.argv[frameArg + 1])))
}
