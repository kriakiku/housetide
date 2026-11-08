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
const BOTTOM_Y = SCENE_Y + SCENE_SIZE
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

const filterState = (blur: number, hue: number, saturate: number) =>
  `filter: blur(${blur}px) hue-rotate(${hue}deg) saturate(${saturate})`

function pillKeyframes({ start, end }: Run): string {
  const here = `opacity: 1; ${filterState(0, 0, 1)}; transform: scale(1) rotate(0deg)`
  return stops(
    `p${start}-${end}`,
    start,
    end,
    [
      [-0.4, `opacity: 0; ${filterState(18, -170, 2.6)}; transform: scale(0.8) rotate(-9deg)`],
      [0.25, `opacity: 0.85; ${filterState(7, -60, 1.9)}; transform: scale(1.06) rotate(4deg)`],
      [0.9, here],
    ],
    [
      [-0.9, here],
      [-0.25, `opacity: 0.85; ${filterState(7, 70, 1.9)}; transform: scale(1.07) rotate(-4deg)`],
      [0.4, `opacity: 0; ${filterState(18, 200, 2.6)}; transform: scale(1.26) rotate(9deg)`],
    ],
  )
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

function plantKeyframes({ start, end }: Run): string {
  const flat = 'opacity: 1; transform: scale(1.3, 0.02)'
  const here = 'opacity: 1; transform: scale(1, 1)'
  return stops(
    `g${start}-${end}`,
    start,
    end,
    [
      [0, flat],
      [0.26, 'opacity: 1; transform: scale(0.88, 1.18)'],
      [0.46, 'opacity: 1; transform: scale(1.07, 0.93)'],
      [0.64, 'opacity: 1; transform: scale(0.97, 1.03)'],
      [0.8, here],
    ],
    [
      [-0.6, here],
      [-0.3, 'opacity: 1; transform: scale(0.9, 1.12)'],
      [0, flat],
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
    [0, 'p', pillKeyframes, 'ease-in-out'],
    [1, 'd', drainKeyframes, 'ease-in-out'],
    [2, 'g', plantKeyframes, 'linear'],
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
  const css = animated ? `${sceneAnimations}\n${dayStyles(allRuns)}` : ''
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
    const kind = ['p', 'd', 'g'][column]
    const pivot = column === 2 ? origin(2, BOTTOM_Y) : origin(column)
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
