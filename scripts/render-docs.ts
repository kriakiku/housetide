import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  COLORS,
  drop,
  face,
  frame,
  mix,
  motion,
  shadow,
  sparkle,
} from '../frontend/src/scenes/common.ts'
import { renderScene } from '../frontend/src/scenes/index.ts'
import { pillsParts, type PillsParts } from '../frontend/src/scenes/pills.ts'
import { plantParts, type PlantParts } from '../frontend/src/scenes/plant.ts'
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
  slots?: readonly string[]
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
  slots: readonly string[],
): Tile => ({
  title: 'Morning pills',
  stage,
  status,
  button,
  tone,
  scene: { name: 'pills', state, fill, slots },
})

const THIS_MORNING = ['taken', 'taken', 'missed', 'current', 'full', 'full', 'full']
const TAKEN_TODAY = ['taken', 'taken', 'missed', 'taken', 'full', 'full', 'full']
const TONIGHT = ['taken', 'taken', 'missed', 'taken', 'current', 'full', 'full']

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

const pillsWaiting = pill(
  'accumulating',
  0.9,
  'Take your pills',
  'in 1 h',
  'Do early',
  'quiet',
  THIS_MORNING,
)
const pillsDue = pill('due', 1, 'Take your pills', 'Due now', 'Done', 'loud', THIS_MORNING)
const pillsDone = pill('clean', 0, 'Take your pills', 'Done for today', 'Done', 'done', TAKEN_TODAY)
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
    pills: pill('resting', 0, 'Take your pills', 'tomorrow at 08:00', 'Do early', 'quiet', TONIGHT),
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

const TILE_W = 272
const TILE_H = 324
const PANEL_Y = 96
const TILES_Y = PANEL_Y + 56
const COLUMNS = [56, 344, 632]
const SCENE_SIZE = 176
const SCENE_Y = TILES_Y + 12
const SCENE_RX = 25

function sceneContent(tile: Tile, x: number, prefix: string, animations: boolean): string {
  return sceneMarkup(
    tile.scene,
    x + TILE_W / 2 - SCENE_SIZE / 2,
    SCENE_Y,
    SCENE_SIZE,
    prefix,
    animations,
  )
}

function textContent(tile: Tile, x: number): string {
  const center = x + TILE_W / 2
  return [
    label(
      center,
      TILES_Y + 215,
      18,
      '#f2f0f8',
      tile.title,
      'text-anchor="middle" font-weight="600"',
    ),
    label(center, TILES_Y + 238, 14, '#aba8b8', tile.stage, 'text-anchor="middle"'),
    label(center, TILES_Y + 259, 14, '#d9d6e3', tile.status, 'text-anchor="middle"'),
    buttonMarkup(tile, x + 16, TILES_Y + 274, TILE_W - 32),
  ].join('')
}

interface Run {
  column: number
  tile: Tile
  start: number
  end: number
}

function runs(): Run[] {
  const result: Run[] = []
  const slots = (moment: Moment) => [moment.pills, moment.laundry, moment.plant]
  COLUMNS.forEach((_, column) => {
    let current: Run | undefined
    MOMENTS.forEach((moment, index) => {
      const tile = slots(moment)[column] as Tile
      if (current && JSON.stringify(current.tile) === JSON.stringify(tile)) {
        current.end = index + 1
        return
      }
      current = { column, tile, start: index, end: index + 1 }
      result.push(current)
    })
  })
  return result
}

const DRAIN_SECONDS = 1.5
const CENTER_Y = SCENE_Y + SCENE_SIZE / 2
const centerX = (column: number) => COLUMNS[column]! + TILE_W / 2
const origin = (column: number, y = CENTER_Y) => `transform-origin:${centerX(column)}px ${y}px`

function spiralArm(cx: number, turn: number): string {
  const points = Array.from({ length: 40 }, (_, step) => {
    const t = step / 39
    const radius = 8 + t * 132
    const angle = turn + t * Math.PI * 2.6
    return `${(cx + Math.cos(angle) * radius).toFixed(1)} ${(CENTER_Y + Math.sin(angle) * radius).toFixed(1)}`
  })
  return `<path d="M${points.join('L')}" fill="none" stroke="#7cc0ff" stroke-width="6" stroke-linecap="round" opacity="0.75"/>`
}

function whirlMarkup(delay: number, still: boolean): string {
  const cx = centerX(1)
  const style = still ? '' : ` style="${origin(1)};animation-delay:${delay.toFixed(2)}s"`
  const arms = [0, 1, 2, 3].map((arm) => spiralArm(cx, (arm * Math.PI) / 2)).join('')
  return `<g clip-path="url(#scene1)"><g class="whirl"${style}><circle cx="${cx}" cy="${CENTER_Y}" r="140" fill="#1d5aa8"/>${arms}<circle cx="${cx}" cy="${CENTER_Y}" r="13" fill="#06101f"/></g></g>`
}

function itemsMarkup(delay: number, still: boolean): string {
  const cx = centerX(1)
  const shapes = [
    '<path d="M-18 -14l10 -6q8 6 16 0l10 6l8 12l-10 6v18h-32v-18l-10 -6z" fill="#ffcf4a"/>',
    '<path d="M-8 -20h14v18l12 12q4 8 -6 10h-12l-12 -14z" fill="#ff7b6e"/>',
    '<rect x="-20" y="-14" width="40" height="28" rx="5" fill="#59d3a8"/>',
    '<path d="M-18 -14l10 -6q8 6 16 0l10 6l8 12l-10 6v18h-32v-18l-10 -6z" fill="#b48cff"/>',
    '<path d="M-8 -20h14v18l12 12q4 8 -6 10h-12l-12 -14z" fill="#7cc0ff"/>',
  ]
  const items = shapes
    .map((shape, index) => {
      const angle = index * 72 + 20
      const inner = still
        ? ` transform="translate(${34 + index * 11} 0)"`
        : ` style="${origin(1)};animation-delay:${(delay + index * 0.05).toFixed(2)}s"`
      return `<g transform="rotate(${angle} ${cx} ${CENTER_Y})"><g class="suck"${inner}><g transform="translate(${cx} ${CENTER_Y}) scale(0.62)">${shape}</g></g></g>`
    })
    .join('')
  return `<g clip-path="url(#scene1)">${items}</g>`
}

function skyMarkup(moment: Moment, index: number, cls: string): string {
  const id = `sky${index}`
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${moment.sky[0]}"/><stop offset="0.7" stop-color="${moment.sky[1]}"/></linearGradient><rect class="${cls}" width="${WIDTH}" height="${HEIGHT}" fill="url(#${id})"/>`
}

function chromeMarkup(): string {
  const tab = (x: number, text: string, active: boolean) =>
    (active
      ? `<rect x="${x - 34}" y="${PANEL_Y + 12}" width="68" height="32" rx="16" fill="#e4cdee"/>`
      : '') +
    label(
      x,
      PANEL_Y + 33,
      14,
      active ? '#1f1d2b' : '#c7c4d3',
      text,
      'text-anchor="middle" font-weight="600"',
    )
  return [
    `<rect x="40" y="${PANEL_Y}" width="880" height="396" rx="20" fill="#1a1922"/>`,
    label(64, PANEL_Y + 34, 19, '#f2f0f8', 'Housetide', 'font-weight="600"'),
    tab(716, 'Today', true),
    tab(790, 'Tasks', false),
    tab(864, 'History', false),
    ...COLUMNS.map(
      (x) =>
        `<rect x="${x}" y="${TILES_Y}" width="${TILE_W}" height="${TILE_H}" rx="16" fill="#25232f"/><rect x="${x + TILE_W / 2 - SCENE_SIZE / 2}" y="${SCENE_Y}" width="${SCENE_SIZE}" height="${SCENE_SIZE}" rx="${SCENE_RX}" fill="#1b1a24"/>`,
    ),
  ].join('')
}

function captionMarkup(moment: Moment, index: number): string {
  return `<g class="c c${index}">${label(56, 551, 32, '#ffffff', moment.time, 'font-weight="700"')}${label(170, 549, 21, '#ffffff', moment.caption)}</g>`
}

const sunX = (hour: number) => 40 + ((hour - 5) / 16) * 880
const sunY = (hour: number) => 124 - Math.sin((Math.PI * (hour - 5)) / 16) * 92

const percent = (index: number) => (index / MOMENTS.length) * 100

type Stop = [number, string]

function stops(name: string, start: number, end: number, enter: Stop[], exit: Stop[]): string {
  const seconds = MOMENTS.length * FRAME_SECONDS
  const pct = (value: number) => (value / seconds) * 100
  const lead = start === 0 ? -Math.min(...enter.map(([at]) => at)) : 0
  const trail = end === MOMENTS.length ? -Math.max(...exit.map(([at]) => at)) : 0
  const entered = enter.map(([at, state]): Stop => [percent(start) + pct(at + lead), state])
  const left = exit.map(([at, state]): Stop => [percent(end) + pct(at + trail), state])
  const all = [...entered, ...left]
  const first = all[0]![0]
  const last = all.at(-1)![0]
  const body = all.map(([at, state]) => `${at}% { ${state} }`).join(' ')
  const before = first > 0 ? `0%, ${first - 0.01}% { opacity: 0 } ` : ''
  const after = last < 100 ? ` ${last + 0.01}%, 100% { opacity: 0 }` : ''
  return `@keyframes ${name} { ${before}${body}${after} }`
}

function drainKeyframes({ start, end }: Run): string {
  const here = 'opacity: 1; transform: rotate(0deg) scale(1)'
  return stops(
    `d${start}-${end}`,
    start,
    end,
    [
      [0, 'opacity: 1; transform: rotate(-260deg) scale(0.04)'],
      [0.6, here],
    ],
    [
      [-DRAIN_SECONDS / 2, here],
      [0, 'opacity: 1; transform: rotate(720deg) scale(0.03)'],
    ],
  )
}

function textKeyframes({ start, end }: Run): string {
  return stops(
    `t${start}-${end}`,
    start,
    end,
    [
      [-0.25, 'opacity: 0'],
      [0.25, 'opacity: 1'],
    ],
    [
      [-0.25, 'opacity: 1'],
      [0.25, 'opacity: 0'],
    ],
  )
}

function skyKeyframes(index: number): string {
  const blend = 3
  const start = percent(index)
  const end = percent(index + 1)
  if (index === MOMENTS.length - 1) {
    return `@keyframes s${index} { 0%, ${start - blend}% { opacity: 0 } ${start}%, ${100 - blend}% { opacity: 1 } 100% { opacity: 0 } }`
  }
  return `@keyframes s${index} { 0%, ${start - blend}% { opacity: 0 } ${start}%, ${end}% { opacity: 1 } ${end + 0.01}%, 100% { opacity: 0 } }`
}

function captionKeyframes(index: number): string {
  const glide = 1.6
  const start = percent(index)
  const end = percent(index + 1)
  const hidden = 'opacity: 0; transform: translateY(14px)'
  const shown = 'opacity: 1; transform: translateY(0)'
  const left = 'opacity: 0; transform: translateY(-14px)'
  if (index === 0) {
    return `@keyframes c0 { 0% { ${hidden} } ${glide}%, ${end - glide}% { ${shown} } ${end}%, 100% { ${left} } }`
  }
  return `@keyframes c${index} { 0%, ${start}% { ${hidden} } ${start + glide}%, ${end - glide}% { ${shown} } ${end}%, 100% { ${left} } }`
}

interface Tracks {
  fill?: string[]
  stroke?: string[]
  opacity?: string[]
  transform?: string[]
  filter?: string[]
}

const LEAF_PATH = 'M0 0C-14-7-15-27 0-40C15-27 14-7 0 0Z'
const BENDS = [0.12, 0.65, 1.3, 1.95, 2.55]
const JOINT = 19.5

interface Timeline {
  animated: boolean
  focus: number
  attrs: (tracks: Tracks, delay?: number) => string
  rules: string[]
}

function timeline(only: number | undefined, prefix: string): Timeline {
  const animated = only === undefined
  const focus = only ?? 4
  const count = MOMENTS.length
  const seconds = count * FRAME_SECONDS
  const blend = (1.2 / seconds) * 100
  const known = new Map<string, string>()
  const rules: string[] = []
  const classFor = (tracks: Tracks): string => {
    const key = JSON.stringify(tracks)
    const existing = known.get(key)
    if (existing) return existing
    const name = `${prefix}${known.size}`
    known.set(key, name)
    const at = (index: number) =>
      (Object.entries(tracks) as Array<[string, string[]]>)
        .map(([property, values]) => `${property}: ${values[index]}`)
        .join('; ')
    const frames = MOMENTS.flatMap((_, index) => {
      const previous = (index + count - 1) % count
      return [
        `${percent(index)}% { ${at(previous)} }`,
        `${percent(index) + blend}% { ${at(index)} }`,
      ]
    })
    rules.push(`.${name} { animation: ${name} ${seconds}s ease-in-out infinite }`)
    rules.push(`@keyframes ${name} { ${frames.join(' ')} 100% { ${at(count - 1)} } }`)
    return name
  }
  const attrs = (tracks: Tracks, delay = 0): string => {
    const list = (Object.entries(tracks) as Array<[string, string[]]>)
      .filter(([property]) => property !== 'filter')
      .map(([property, values]) => {
        const value = values[focus] as string
        return `${property}="${property === 'transform' ? value.replaceAll('deg', '').replaceAll('px', '') : value}"`
      })
    if (animated) {
      list.push(`class="kf ${classFor(tracks)}"`)
      if (delay) list.push(`style="animation-delay:${delay.toFixed(2)}s"`)
    }
    return list.join(' ')
  }
  return { animated, focus, attrs, rules }
}

function backgroundLayers(
  name: 'plant' | 'pills',
  tiles: Tile[],
  attrs: Timeline['attrs'],
): string {
  return [...new Set(tiles.map((tile) => JSON.stringify(tile.scene)))]
    .map((scene) => {
      const parsed = { progress: 0.5, fill: 0, stink: 0, ...(JSON.parse(scene) as object) } as never
      const markup = serialize(frame(name, parsed, { animations: false }, [])).replace(
        '<svg',
        '<svg width="200" height="200"',
      )
      const visible = tiles.map((tile) => (JSON.stringify(tile.scene) === scene ? '1' : '0'))
      return `<g ${attrs({ opacity: visible })}>${markup}</g>`
    })
    .join('')
}

const PILL_SLOTS = [
  [52, 72],
  [84, 72],
  [116, 72],
  [148, 72],
  [52, 124],
  [84, 124],
  [116, 124],
] as const
const STALE_TOP = '#8f8a84'
const STALE_BOTTOM = '#aaa497'

function livingPills(only: number | undefined): { markup: string; css: string } {
  const { animated, attrs, rules } = timeline(only, 'q')
  const tiles = MOMENTS.map((moment) => moment.pills)
  const states = tiles.map((tile) =>
    pillsParts({ progress: 0.5, fill: 0, stink: 0, ...tile.scene } as never),
  )
  const series = <T>(pick: (state: PillsParts) => T) => states.map(pick)
  const show = (pick: (state: PillsParts) => boolean) =>
    series((state) => (pick(state) ? '1' : '0'))
  const slotState = (state: PillsParts, index: number) => state.cells[index] ?? 'full'

  const slots = PILL_SLOTS.map(([x, y], index) => {
    const delay = index * 0.05
    const emptied = show((state) => slotState(state, index) === 'taken')
    const full = show((state) => slotState(state, index) !== 'taken')
    const top = series((state) => {
      const value = slotState(state, index)
      if (value === 'current') return COLORS.sun
      return value === 'missed' ? STALE_TOP : COLORS.coral
    })
    const bottom = series((state) =>
      slotState(state, index) === 'missed' ? STALE_BOTTOM : COLORS.cream,
    )
    const capsule: Tracks = {
      opacity: full,
      filter: series((state) => (slotState(state, index) === 'taken' ? 'blur(5px)' : 'blur(0px)')),
      transform: series((state) => {
        const value = slotState(state, index)
        if (value === 'taken') return 'translate(8px, -74px) rotate(46deg) scale(0.45)'
        return value === 'missed'
          ? 'translate(0px, 0px) rotate(-14deg) scale(0.84)'
          : 'translate(0px, 0px) rotate(0deg) scale(1)'
      }),
    }
    const shine = series((state) => (slotState(state, index) === 'missed' ? '0.15' : '0.6'))
    const halo = series((state) => {
      if (slotState(state, index) !== 'current') return '0'
      return state.phase === 'ready' ? '1' : '0.45'
    })
    const wells = `<rect x="-13.5" y="-25.5" width="27" height="51" rx="13.5" fill="${COLORS.metal}" ${attrs({ opacity: full }, delay)}/><g ${attrs({ opacity: emptied }, delay + 0.2)}><rect x="-13" y="-25" width="26" height="50" rx="13" fill="#545c78"/><path d="M-8 8a8 11 0 0 0 16 0" fill="none" stroke="#7d86a3" stroke-width="3.4" stroke-linecap="round"/></g>`
    const ring = `<g ${attrs({ opacity: halo }, delay)}>${serialize(motion('pulse', '<rect x="-18.5" y="-30.5" width="37" height="61" rx="18.5" fill="none" stroke-width="5" stroke="#ffc94a"/>' as never))}</g>`
    const body = `<g ${attrs(capsule, delay)}><rect x="-10" y="-22" width="20" height="44" rx="10" ${attrs({ fill: top }, delay)}/><path d="M-10 0H10V12A10 10 0 0 1-10 12Z" ${attrs({ fill: bottom }, delay)}/><rect x="-5.5" y="-16" width="4" height="13" rx="2" fill="#fff" ${attrs({ opacity: shine }, delay)}/></g>`
    return `<g transform="translate(${x} ${y})">${ring}${wells}${body}</g>`
  }).join('')

  const checks = PILL_SLOTS.map(([x, y], index) => {
    const on = (state: PillsParts) => state.phase === 'popped' && state.day === index
    const tracks: Tracks = {
      opacity: show(on),
      transform: series((state) => (on(state) ? 'scale(1)' : 'scale(0)')),
    }
    return `<g transform="translate(${x} ${y})"><g ${attrs(tracks, 0.45)}><circle r="19" fill="${COLORS.check}"/><path d="M-9 0l6.5 7L9.5-7" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></g></g>`
  }).join('')

  const faces = [...new Set(states.map((state) => state.mood))]
    .map(
      (mood) =>
        `<g ${attrs({ opacity: show((state) => state.mood === mood) }, 0.2)}>${serialize(face(148, 124, mood, COLORS.fly, 0.82))}</g>`,
    )
    .join('')
  const glassed = (state: PillsParts) => state.phase === 'popped' || state.phase === 'taken-pending'
  const packMove = series((state) => {
    const [x, y, size] = glassed(state) ? [86, 90, 0.84] : [100, 100, 1]
    return `translate(${x}px, ${y}px) rotate(${state.tilt}deg) scale(${size}) translate(-100px, -100px)`
  })
  const pack = `<g ${attrs({ transform: packMove })}><rect x="30" y="36" width="140" height="124" rx="16" fill="${COLORS.metalMid}"/><path d="M30 92H170" stroke="${COLORS.metalDark}" stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round"/>${slots}${faces}${checks}</g>`
  const glass = `<g transform="translate(168 146)"><g ${attrs({ opacity: show(glassed), transform: series((state) => (glassed(state) ? 'translate(0px, 0px)' : 'translate(40px, 12px)')) }, 0.3)}><path d="M-17-30H17L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill="#cfe8ff" opacity=".35"/><path d="M-15.5-10H15.5L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill="${COLORS.water}"/><path d="M-9-2L-7 22" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55"/></g></g>`
  const twinkles = (
    [
      [26, 30, 1.2, 1],
      [178, 34, 0.95, 2],
      [24, 130, 0.85, 3],
    ] as const
  )
    .map(
      ([x, y, size, delay], index) =>
        `<g ${attrs({ opacity: show((state) => state.phase === 'popped') }, 0.55 + index * 0.1)}>${serialize(sparkle(x, y, size, delay))}</g>`,
    )
    .join('')
  const left = centerX(0) - SCENE_SIZE / 2
  const body = [
    backgroundLayers('pills', tiles, attrs),
    serialize(shadow(100, 176, 72)),
    pack,
    glass,
    twinkles,
  ].join('')
  return {
    markup: `<svg x="${left}" y="${SCENE_Y}" width="${SCENE_SIZE}" height="${SCENE_SIZE}" viewBox="0 0 200 200" class="${animated ? 'ht-animated' : ''}">${body}</svg>`,
    css: rules.join('\n'),
  }
}

function livingPlant(only: number | undefined, showCan: boolean): { markup: string; css: string } {
  const { animated, attrs, rules } = timeline(only, 'k')
  const seconds = MOMENTS.length * FRAME_SECONDS
  const tiles = MOMENTS.map((moment) => moment.plant)
  const states = tiles.map((tile) =>
    plantParts({ progress: 0.5, fill: 0, stink: 0, ...tile.scene } as never),
  )
  const series = <T>(pick: (state: PlantParts) => T) => states.map(pick)
  const decay = (state: PlantParts) => state.wilt / 3
  const colors = (from: string, to: string) => series((state) => mix(from, to, decay(state)))
  const show = (pick: (state: PlantParts) => boolean) =>
    series((state) => (pick(state) ? '1' : '0'))
  const arcOf = (state: PlantParts) => (BENDS[state.droop] ?? 0) + state.wilt * 0.12
  const bend = series((state) => `rotate(${(((arcOf(state) / 4) * 180) / Math.PI).toFixed(2)}deg)`)
  const spreadOf = (state: PlantParts) => 52 + state.droop * 14
  const leafColor = colors(COLORS.leaf, '#9b7a3e')
  const veinColor = colors(COLORS.leafDark, '#7a5d2c')
  const stemColor = colors(COLORS.leafDark, '#7f6a35')
  const petalColor = colors(COLORS.pink, '#a98a6b')
  const centerColor = colors(COLORS.sun, '#8d6b37')

  const leaf = (side: number, extra: number, size: number, delay: number) => {
    const swing = series((state) => `rotate(${side * (spreadOf(state) + extra)}deg)`)
    return `<g ${attrs({ transform: swing }, delay)}><g transform="scale(${size})"><path d="${LEAF_PATH}" ${attrs({ fill: leafColor }, delay)}/><path d="M0-4V-32" stroke-width="2.6" stroke-linecap="round" ${attrs({ stroke: veinColor }, delay)}/></g></g>`
  }

  const petals = Array.from({ length: 8 }, (_, index) => {
    const delay = index * 0.05
    const tracks: Tracks = {
      fill: petalColor,
      opacity: series((state) => (index < state.petals ? '1' : '0')),
      transform: series((state) =>
        index < state.petals ? 'translate(0px, 0px) scale(1)' : 'translate(0px, 44px) scale(0.4)',
      ),
    }
    return `<g transform="rotate(${index * 45})"><ellipse cx="0" cy="-17" rx="8" ry="12" ${attrs(tracks, delay)}/></g>`
  }).join('')
  const flower = `<g transform="scale(0.98)">${petals}<circle r="11" ${attrs({ fill: centerColor }, 0.1)}/></g>`

  const segment = (inner: string, delay: number, extra = '') =>
    `<g ${attrs({ transform: bend }, delay)}><path d="M0 0V${-JOINT}" fill="none" stroke-width="7.5" stroke-linecap="round" ${attrs({ stroke: stemColor }, delay)}/>${extra}<g transform="translate(0 ${-JOINT})">${inner}</g></g>`
  const crown = segment(
    segment(
      segment(segment(flower, 0.27), 0.18, leaf(-1, 8, 0.82, 0.22)),
      0.09,
      leaf(1, 0, 1, 0.14),
    ),
    0,
    leaf(-1, 0, 1.05, 0.06),
  )

  const fallen = [
    [46, 172, -30],
    [158, 176, 40],
    [62, 180, 70],
  ]
    .map(([x, y, r], index) => {
      const tracks: Tracks = {
        opacity: series((state) => (index < state.fallen ? '1' : '0')),
        transform: series((state) =>
          index < state.fallen
            ? 'translate(0px, 0px) rotate(0deg)'
            : 'translate(0px, -70px) rotate(120deg)',
        ),
      }
      return `<g transform="translate(${x} ${y})"><g ${attrs(tracks, 0.3 + index * 0.12)}><g transform="rotate(${r}) scale(0.5)"><path d="${LEAF_PATH}" fill="#7c5d30"/></g></g></g>`
    })
    .join('')

  const soil = `<ellipse cx="100" cy="124" rx="38" ry="4.5" ${attrs({ fill: series((state) => (state.wet ? COLORS.soilWet : COLORS.soil)) }, 0.35)}/>`
  const cracks = `<path d="M78 124l6 2 3-2M108 123l5 2 4-2" fill="none" stroke="#7a5a44" stroke-width="2" stroke-linecap="round" ${attrs({ opacity: show((state) => !state.wet && state.wilt > 0) })}/>`
  const faces = [...new Set(states.map((state) => state.mood))]
    .map(
      (mood) =>
        `<g ${attrs({ opacity: show((state) => state.mood === mood) }, 0.2)}>${serialize(face(100, 158, mood, '#5b2612', 0.95))}</g>`,
    )
    .join('')
  const popped = (pick: (state: PlantParts) => boolean) => ({
    opacity: show(pick),
    transform: series((state) => (pick(state) ? 'scale(1)' : 'scale(0)')),
  })
  const thirst = `<circle cx="64" cy="82" r="4.5" fill="${COLORS.cream}" ${attrs({ opacity: show((state) => state.thirst) }, 0.1)}/><circle cx="54" cy="69" r="7.5" fill="${COLORS.cream}" ${attrs({ opacity: show((state) => state.thirst) }, 0.25)}/><g transform="translate(42 40)"><g ${attrs(
    popped((state) => state.thirst),
    0.4,
  )}><circle r="24" fill="${COLORS.cream}"/>${serialize(drop(0, 1, COLORS.waterDark, 1.7))}</g></g>`
  const falling = [
    [52, 34, 1],
    [148, 26, 2],
    [32, 80, 3],
    [170, 74, 4],
  ]
    .map(
      ([x, y, delay], index) =>
        `<g ${attrs({ opacity: show((state) => state.drops) }, 0.2 + index * 0.12)}><g transform="translate(${x} ${y})">${serialize(motion('fall', drop(0, 0, COLORS.water, 1.05), delay))}</g></g>`,
    )
    .join('')
  const twinkles = (
    [
      [40, 112, 1, 2],
      [164, 118, 0.85, 3],
      [100, 16, 0.9, 1],
    ] as const
  )
    .map(
      ([x, y, size, delay], index) =>
        `<g ${attrs({ opacity: show((state) => state.drops) }, 0.5 + index * 0.1)}>${serialize(sparkle(x, y, size, delay))}</g>`,
    )
    .join('')

  const pour = states.findIndex((state) => state.drops)
  const pourAt = percent(pour)
  const span = (value: number) => (value / seconds) * 100
  const canDrops = [
    [92, 60, 1],
    [104, 74, 2],
    [84, 82, 3],
    [96, 96, 4],
  ]
    .map(
      ([x, y, delay]) =>
        `<g transform="translate(${x} ${y})">${serialize(motion('fall', drop(0, 0, COLORS.water, 0.9), delay))}</g>`,
    )
    .join('')
  const canVisible = showCan ? '' : ' opacity="0"'
  const can = `<g class="${animated ? 'kf can' : ''}"${canVisible}><g transform="translate(150 42) rotate(-10)"><rect x="-20" y="-14" width="46" height="34" rx="7" fill="${COLORS.sky}"/><path d="M-20-2L-48-20" stroke="${COLORS.sky}" stroke-width="8" stroke-linecap="round"/><rect x="-56" y="-30" width="9" height="20" rx="3" transform="rotate(-32 -52 -20)" fill="${COLORS.skyDark}"/><path d="M26-6a14 14 0 0 1 0 22" fill="none" stroke="${COLORS.skyDark}" stroke-width="6" stroke-linecap="round"/></g>${canDrops}</g>`
  rules.push(
    `.can { opacity: 0; transform-box: fill-box; animation: can ${seconds}s ease-in-out infinite }`,
  )
  rules.push(
    `@keyframes can { 0%, ${pourAt - span(1.1)}% { opacity: 0; transform: translate(34px, -20px) rotate(16deg) } ${pourAt - span(0.7)}%, ${pourAt + span(0.6)}% { opacity: 1; transform: translate(0px, 0px) rotate(0deg) } ${pourAt + span(1)}%, 100% { opacity: 0; transform: translate(34px, -20px) rotate(16deg) } }`,
  )
  rules.push('@media (prefers-reduced-motion: reduce) { .kf { animation: none } }')

  const backgrounds = backgroundLayers('plant', tiles, attrs)
  const left = centerX(2) - SCENE_SIZE / 2
  const body = [
    backgrounds,
    serialize(shadow(100, 183, 52)),
    fallen,
    `<g transform="translate(100 138)">${crown}</g>`,
    `<path d="M62 134H138L130 176Q129 182 122 182H78Q71 182 70 176Z" fill="${COLORS.terracotta}"/>`,
    `<rect x="55" y="122" width="90" height="19" rx="8" fill="${COLORS.terracottaDark}"/>`,
    soil,
    cracks,
    faces,
    thirst,
    falling,
    twinkles,
    can,
  ].join('')
  return {
    markup: `<svg x="${left}" y="${SCENE_Y}" width="${SCENE_SIZE}" height="${SCENE_SIZE}" viewBox="0 0 200 200" class="${animated ? 'ht-animated' : ''}">${body}</svg>`,
    css: rules.join('\n'),
  }
}

function dayStyles(allRuns: Run[]): string {
  const total = MOMENTS.length
  const seconds = total * FRAME_SECONDS
  const pct = (value: number) => (value / seconds) * 100
  const sun = MOMENTS.map((moment, index) => {
    const opacity = moment.hour > 21 ? 0 : 1
    return `${percent(index)}% { transform: translate(${sunX(moment.hour)}px, ${sunY(moment.hour)}px); opacity: ${opacity} }`
  }).join(' ')
  const last = MOMENTS.at(-1) as Moment
  const moon = `0%, ${percent(total - 1) - 1}% { opacity: 0 } ${percent(total - 1)}%, 99% { opacity: 1 } 100% { opacity: 0 }`
  const kinds: Array<[number, string, (run: Run) => string, string]> = [
    [1, 'd', drainKeyframes, 'ease-in-out'],
  ]
  const sceneRules = kinds.flatMap(([column, kind, frames, easing]) => {
    const own = allRuns.filter((run) => run.column === column)
    return [
      ...own.map(
        (run) =>
          `.${kind}${run.start}-${run.end} { animation: ${kind}${run.start}-${run.end} ${seconds}s ${easing} infinite }`,
      ),
      ...own.map(frames),
    ]
  })
  const textRuns = [...new Map(allRuns.map((run) => [`${run.start}-${run.end}`, run])).values()]
  const drain = pct(DRAIN_SECONDS)
  return [
    '.f, .run, .txt, .c, .whirl, .suck { opacity: 0 }',
    '.f0 { opacity: 1 }',
    ...MOMENTS.slice(1).map(
      (_, offset) => `.f${offset + 1} { animation: s${offset + 1} ${seconds}s linear infinite }`,
    ),
    ...MOMENTS.slice(1).map((_, offset) => skyKeyframes(offset + 1)),
    ...sceneRules,
    ...textRuns.map(
      (run) =>
        `.t${run.start}-${run.end} { animation: t${run.start}-${run.end} ${seconds}s linear infinite }`,
    ),
    ...textRuns.map(textKeyframes),
    ...MOMENTS.map(
      (_, index) => `.c${index} { animation: c${index} ${seconds}s ease-out infinite }`,
    ),
    ...MOMENTS.map((_, index) => captionKeyframes(index)),
    `.whirl { animation: whirl ${seconds}s linear infinite }`,
    `@keyframes whirl { 0% { transform: rotate(0deg); opacity: 0 } ${drain * 0.14}% { opacity: 1 } ${drain * 0.74}% { opacity: 1 } ${drain}%, 100% { transform: rotate(1260deg); opacity: 0 } }`,
    `.suck { animation: suck ${seconds}s ease-in infinite }`,
    `@keyframes suck { 0% { transform: rotate(0deg) translateX(84px) scale(1); opacity: 1 } ${drain * 0.48}% { transform: rotate(760deg) translateX(0) scale(0.1); opacity: 1 } ${drain * 0.5}%, 100% { transform: rotate(760deg) translateX(0) scale(0); opacity: 0 } }`,
    `.sun { animation: sun ${seconds}s linear infinite }`,
    `@keyframes sun { ${sun} 100% { transform: translate(${sunX(last.hour)}px, ${sunY(last.hour)}px); opacity: 0 } }`,
    `.moon { opacity: 0; animation: moon ${seconds}s linear infinite }`,
    `@keyframes moon { ${moon} }`,
    '@media (prefers-reduced-motion: reduce) { .f, .run, .txt, .c, .sun, .moon, .whirl, .suck { animation: none } .f4, .at4, .c4 { opacity: 1 } .f0:not(.f4) { opacity: 0 } }',
  ].join('\n')
}

function dayCycle(only?: number, stillOffset?: number): string {
  const animated = only === undefined
  const seconds = MOMENTS.length * FRAME_SECONDS
  const allRuns = runs()
  const preview = stillOffset !== undefined
  const shown = allRuns.filter((run) => animated || (only >= run.start && only < run.end))
  const focus = MOMENTS[only ?? 4] as Moment
  const sceneAnimations = sceneStyles.cssText.replace(/\.ht-scene\s*\{[^}]*\}/, '')
  const living = livingPlant(only, preview)
  const pills = livingPills(only)
  const css = animated
    ? `${sceneAnimations}\n${dayStyles(allRuns)}\n${living.css}\n${pills.css}`
    : ''
  const moments = MOMENTS.map((moment, index) => ({ moment, index })).filter(
    ({ index }) => animated || index === only,
  )
  const sky = moments.map(({ moment, index }) => skyMarkup(moment, index, `f f${index}`)).join('')
  const boundary = (run: Run) => run.start * FRAME_SECONDS - DRAIN_SECONDS / 2 - seconds
  const laundryRuns = allRuns.filter((run) => run.column === 1)
  const under = animated
    ? laundryRuns.map((run) => whirlMarkup(boundary(run), false)).join('')
    : preview
      ? whirlMarkup(0, true)
      : ''
  const scenes = COLUMNS.map((_, column) => {
    if (column === 0) return `<g clip-path="url(#scene0)">${pills.markup}</g>`
    if (column === 2) return `<g clip-path="url(#scene2)">${living.markup}</g>`
    const kind = ['p', 'd', 'g'][column]
    const pivot = origin(column)
    const groups = shown
      .filter((run) => run.column === column && !(preview && column === 1))
      .map((run) => {
        const at4 = run.start <= 4 && run.end > 4 ? ' at4' : ''
        const style = animated ? ` style="${pivot}"` : ''
        const content = sceneContent(
          run.tile,
          COLUMNS[column]!,
          `t${column}r${run.start}-`,
          animated,
        )
        return `<g class="run ${kind}${run.start}-${run.end}${at4}"${style}>${content}</g>`
      })
      .join('')
    return `<g clip-path="url(#scene${column})">${groups}</g>`
  }).join('')
  const texts = shown
    .map((run) => {
      const at4 = run.start <= 4 && run.end > 4 ? ' at4' : ''
      return `<g class="txt t${run.start}-${run.end}${at4}">${textContent(run.tile, COLUMNS[run.column]!)}</g>`
    })
    .join('')
  const over = animated
    ? laundryRuns.map((run) => itemsMarkup(boundary(run), false)).join('')
    : preview
      ? itemsMarkup(0, true)
      : ''
  const clips = COLUMNS.map((x, column) => {
    const left = x + TILE_W / 2 - SCENE_SIZE / 2
    return `<clipPath id="scene${column}"><rect x="${left}" y="${SCENE_Y}" width="${SCENE_SIZE}" height="${SCENE_SIZE}" rx="${SCENE_RX}"/></clipPath>`
  }).join('')
  const strip = `<rect y="508" width="${WIDTH}" height="64" fill="#14131b" opacity="0.72"/>`
  const captions = moments.map(({ moment, index }) => captionMarkup(moment, index)).join('')
  const night = focus.hour > 21
  const sunTransform = animated
    ? ''
    : ` transform="translate(${sunX(focus.hour)} ${sunY(focus.hour)})"`
  const sun =
    !animated && night
      ? ''
      : `<g class="sun"${sunTransform}><circle r="44" fill="#ffe9a8" opacity="0.28"/><circle r="26" fill="#ffd76a"/></g>`
  const moon =
    animated || night
      ? `<g class="moon" transform="translate(820 52)"><circle r="24" fill="#e8e6f5"/><circle cx="9" cy="-5" r="20" fill="#1a2247"/></g>`
      : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="A day in Housetide, from dawn to night"><style><![CDATA[${css}]]></style><clipPath id="round"><rect width="${WIDTH}" height="${HEIGHT}" rx="24"/></clipPath>${clips}<g clip-path="url(#round)">${sky}${sun}${moon}${chromeMarkup()}${under}${scenes}${over}${texts}${strip}${captions}</g></svg>\n`
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
  writeFileSync(
    process.argv[frameArg + 2] as string,
    dayCycle(
      Number(process.argv[frameArg + 1]),
      process.argv[frameArg + 3] ? Number(process.argv[frameArg + 3]) : undefined,
    ),
  )
}
