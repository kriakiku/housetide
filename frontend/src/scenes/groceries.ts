import { nothing, svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  COLORS as C,
  clamp01,
  drop,
  face,
  frame,
  mix,
  motion,
  part,
  reached,
  round,
  shadeOf,
  shadow,
  sparkle,
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'
import { ding } from './laundry.ts'

export type GroceriesView = 'bag' | 'pantry' | 'cart' | 'door' | 'full'

export interface GroceriesParts {
  view: GroceriesView
  step: number
  rows: number
  curl: boolean
  taped: boolean
  folded: boolean
  loaded: number
  sprout: boolean
  rotten: boolean
  dust: number
  tumbleweed: boolean
  moths: number
  stench: number
  wilt: number
  mood: Mood
}

export const MAX_STEP = 5

const ROWS = [2, 4, 6, 8, 10, 11] as const
const DUST_AT = 0.08
const TUMBLEWEED_AT = 0.3
const MOTHS_AT = [0.5, 0.78] as const
const STENCH_AT = [0.65, 0.88] as const
const SICK_AT = 0.6

const QUIET = {
  step: 0,
  rows: 0,
  curl: false,
  taped: false,
  folded: false,
  loaded: 0,
  sprout: false,
  rotten: false,
  dust: 0,
  tumbleweed: false,
  moths: 0,
  stench: 0,
  wilt: 0,
} as const

export function groceriesParts(scene: SceneView): GroceriesParts {
  const { state } = scene
  if (state === 'clean') return { ...QUIET, view: 'full', mood: 'happy' }
  const fill = clamp01(scene.fill)
  const stink = clamp01(scene.stink)
  const dust = stink >= DUST_AT ? 1 : 0
  const weed = stink >= TUMBLEWEED_AT
  const moths = reached(stink, MOTHS_AT)
  const stench = reached(stink, STENCH_AT)
  const sick = stink >= SICK_AT
  const decay = { dust, tumbleweed: weed, moths, stench }
  if (state === 'running') {
    return {
      ...QUIET,
      ...decay,
      view: 'cart',
      moths: Math.min(1, moths),
      stench: 0,
      loaded: 1 + Math.min(3, Math.floor(clamp01(scene.progress) * 4)),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      ...decay,
      view: 'door',
      wilt: reached(stink, [0.08, 0.3, 0.55, 0.8]) / 4,
      mood: sick ? 'sick' : 'calm',
    }
  }
  if (state === 'due') {
    return {
      ...QUIET,
      ...decay,
      view: 'pantry',
      sprout: stink >= DUST_AT,
      rotten: stink >= STENCH_AT[0],
      mood: sick ? 'sick' : 'pleading',
    }
  }
  const resting = state === 'resting'
  const step = resting ? 0 : Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...decay,
    view: 'bag',
    step,
    rows: resting ? 0 : (ROWS[step] ?? 2),
    curl: step >= MAX_STEP,
    taped: step >= 4,
    folded: resting,
    mood,
  }
}

const KRAFT = '#dca66a'
const PAPER = '#fbf7ec'
const CARROT = '#ff9440'
const CARROT_DARK = '#d9702a'
const BREAD = '#f4c374'
const BREAD_DARK = '#c98a3e'
const APPLE = '#f0524f'
const APPLE_DARK = '#c23a3c'
const ONION = '#b86aa8'
const ONION_DARK = '#8a4a84'
const ONION_LIGHT = '#dba6cf'
const MOTH = '#ddd2ba'
const MOTH_DARK = '#a4937a'
const MOTH_BODY = '#6a5a48'
const WEED = '#c4a56d'
const WEED_DARK = '#94773f'
const DUST = '#bfae8b'
const WEB = '#e6ebf5'
const NOOK = '#2b2344'
const SPEED = '#a9c8f0'
const TYRE = '#20243b'
const STALE = '#8a7a4a'

interface Paper {
  main: string
  dark: string
  deep: string
  light: string
  ink: string
}

function paperOf(accent: string): Paper {
  return {
    main: accent,
    dark: shadeOf(accent, 0.2),
    deep: shadeOf(accent, 0.55),
    light: tintOf(accent, 0.34),
    ink: shadeOf(accent, 0.76),
  }
}

function teeth(left: number, right: number, y: number, depth: number): string {
  const count = Math.max(2, Math.round((right - left) / 18) * 2)
  const step = (right - left) / count
  return Array.from(
    { length: count + 1 },
    (_, i) => `L${round(left + i * step)} ${round(y + (i % 2 ? depth : 0))}`,
  ).join('')
}

interface BagStyle {
  w: number
  h: number
  paper: Paper
  mood?: Mood
  size?: number
  handles?: boolean
  blush?: boolean
  contents?: Art
  rise?: number
}

function handle(top: number, rise: number, color: string): Art {
  const span = round(top * 0.5)
  return svg`<path d=${`M${-span} -2C${-span} ${-rise} ${span} ${-rise} ${span} -2`} fill="none" stroke=${color} stroke-width="6.5" stroke-linecap="round" />`
}

function bag(style: BagStyle): Art {
  const {
    w,
    h,
    paper,
    mood,
    size = 1,
    handles = true,
    blush = false,
    contents = nothing,
    rise = 0,
  } = style
  const top = w / 2 - 3
  const bottom = w / 2
  const front = `M${teeth(-top, top, -h, 6).slice(1)}L${bottom} -7Q${bottom} 0 ${bottom - 7} 0H${-bottom + 7}Q${-bottom} 0 ${-bottom} -7Z`
  const back = `M${teeth(-top + 3, top - 3, -h - 8, 5).slice(1)}V${-h + 12}H${-top + 3}Z`
  const gusset = `M${top - 13} ${-h + 6}L${top} ${-h + 6}L${bottom} -7Q${bottom} 0 ${bottom - 7} 0H${bottom - 15}Z`
  const faceY = round(-h * 0.56 - rise)
  return [
    when(handles, () => at(0, -h - 3, handle(top, 40, paper.dark))),
    svg`<path d=${back} fill=${paper.deep} />`,
    contents,
    svg`<path d=${front} fill=${paper.main} />`,
    svg`<path d=${gusset} fill=${paper.dark} />`,
    svg`<rect x=${-bottom + 7} y=${round(-h + 15)} width=${round(w - 28)} height="5" rx="2.5" fill=${paper.light} />`,
    svg`<path d=${`M${-bottom + 8} -11H${bottom - 18}`} stroke=${paper.dark} stroke-width="3.5" stroke-linecap="round" />`,
    when(blush, () => [
      svg`<ellipse cx=${-23 * size - 6} cy=${faceY + 10} rx="7" ry="4.5" fill=${C.coral} opacity=".55" />`,
      svg`<ellipse cx=${23 * size - 6} cy=${faceY + 10} rx="7" ry="4.5" fill=${C.coral} opacity=".55" />`,
    ]),
    mood ? face(-6, faceY, mood, paper.ink, size) : nothing,
  ]
}

function foldedBag(paper: Paper, mood: Mood): Art {
  return [
    svg`<path d="M-50-82H50L54-7Q54 0 47 0H-47Q-54 0-54-7Z" fill=${paper.main} />`,
    svg`<path d="M36-82H50L54-7Q54 0 47 0H39Z" fill=${paper.dark} />`,
    svg`<path d="M-44-11H34" stroke=${paper.dark} stroke-width="3.5" stroke-linecap="round" />`,
    svg`<path d="M-53-100Q-53-104-49-104H49Q53-104 53-100V-78Q53-74 49-74H-49Q-53-74-53-78Z" fill=${paper.light} />`,
    svg`<path d="M-47-83H47" stroke=${paper.main} stroke-width="3" stroke-linecap="round" />`,
    face(-6, -42, mood, paper.ink, 1.1),
  ]
}

const WIDTHS = [30, 20, 34, 16, 27, 32, 18, 25, 33, 21, 29, 15] as const
const PITCH = 12.5

function listSheet(rows: number, taped: boolean): Art {
  const end = 15 + rows * PITCH
  const body = `M-26 0H26V${end}${teeth(26, -26, end, 4)}Z`
  return [
    svg`<path d=${body} fill=${PAPER} />`,
    svg`<rect x="-26" y="0" width="52" height="9" fill=${C.sky} />`,
    Array.from({ length: rows }, (_, i) => {
      const y = 15 + i * PITCH
      const width = WIDTHS[i % WIDTHS.length] ?? 20
      return svg`<rect x="-20" y=${y} width="7" height="7" rx="2" fill="none" stroke=${C.metalDark} stroke-width="1.8" /><rect x="-9" y=${y + 1.4} width=${width} height="4.4" rx="2.2" fill=${C.glass} opacity=".6" />`
    }),
    when(
      taped,
      () =>
        svg`<rect x="-31" y=${15 + 6 * PITCH - 5.5} width="62" height="8" rx="1.5" fill=${C.sun} opacity=".85" transform="rotate(-3 0 88)" />`,
    ),
  ]
}

function roll(x: number, y: number): Art {
  return at(x, y, [
    svg`<circle r="13" fill=${PAPER} />`,
    svg`<path d="M0 8.5a8.5 8.5 0 1 1 8.5-8.5a6 6 0 0 1-6 6a4 4 0 0 1-4-4a2 2 0 0 1 2-2" fill="none" stroke=${C.creamDark} stroke-width="2.4" stroke-linecap="round" />`,
  ])
}

function pin(): Art {
  return [
    svg`<circle cy="1" r="6.5" fill=${C.coralDark} />`,
    svg`<circle cy="0" r="6" fill=${C.coral} />`,
    svg`<circle cx="-2" cy="-2" r="1.7" fill="#fff" opacity=".75" />`,
  ]
}

function shoppingList(parts: GroceriesParts): Art {
  const sheet: Art = [
    listSheet(parts.rows, parts.taped),
    when(parts.curl, () => roll(3, 150)),
    pin(),
  ]
  return part('list', at(151, 22, parts.curl ? sheet : motion('sway', sheet)))
}

interface Food {
  green: string
  greenDark: string
  orange: string
  orangeDark: string
  red: string
  redDark: string
  bread: string
  breadDark: string
}

function foodOf(wilt: number): Food {
  const stale = (color: string): string => mix(color, STALE, wilt * 0.82)
  return {
    green: stale(C.leaf),
    greenDark: stale(C.leafDark),
    orange: stale(CARROT),
    orangeDark: stale(CARROT_DARK),
    red: stale(APPLE),
    redDark: stale(APPLE_DARK),
    bread: stale(BREAD),
    breadDark: stale(BREAD_DARK),
  }
}

function apple(color: string, dark: string, green: string): Art {
  return part('apple', [
    svg`<path d="M0-11C-6-18-19-15-19-2C-19 10-9 18 0 15C9 18 19 10 19-2C19-15 6-18 0-11Z" fill=${color} />`,
    svg`<path d="M-3 15C8 17 19 10 19-2C19-7 17-10 14-12C17 2 8 12-3 15Z" fill=${dark} />`,
    svg`<ellipse cx="-9" cy="-5" rx="3.6" ry="5" fill="#fff" opacity=".5" />`,
    svg`<path d="M0-11Q0-18 3-22" fill="none" stroke=${C.soil} stroke-width="3.4" stroke-linecap="round" />`,
    svg`<path d="M3-19C8-27 17-25 19-20C13-14 7-14 3-19Z" fill=${green} />`,
  ])
}

function carrot(food: Food): Art {
  return part('carrot', [
    svg`<path d="M0-4C-3-16-11-22-15-22C-14-13-8-6 0-1Z" fill=${food.greenDark} />`,
    svg`<path d="M0-4C3-16 11-22 15-22C14-13 8-6 0-1Z" fill=${food.greenDark} />`,
    svg`<path d="M0-1C-6-12-5-26 0-32C5-26 6-12 0-1Z" fill=${food.green} />`,
    svg`<path d="M-11 2C-11-5 11-5 11 2C11 18 4 42 0 50C-4 42-11 18-11 2Z" fill=${food.orange} />`,
    svg`<path d="M-9 11h8M3 20h6.5M-7.5 28h6" stroke=${food.orangeDark} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function baguette(food: Food): Art {
  return part('baguette', [
    svg`<path d="M0-62C10-62 14-50 14-36V44C14 56 9 62 0 62C-9 62-14 56-14 44V-36C-14-50-10-62 0-62Z" fill=${food.bread} />`,
    svg`<path d="M6-60C11-57 14-48 14-36V44C14 56 9 62 0 62C5 56 6 50 6 44Z" fill=${food.breadDark} opacity=".55" />`,
    [-44, -24, -4, 16].map(
      (y) =>
        svg`<path d=${`M-8 ${y + 9}Q-2 ${y + 4} 7 ${y - 5}`} stroke=${food.breadDark} stroke-width="4.2" stroke-linecap="round" fill="none" />`,
    ),
  ])
}

function lettuce(food: Food): Art {
  return part('greens', [
    svg`<g fill=${food.greenDark}><circle cx="-19" cy="-4" r="13" /><circle cx="19" cy="-3" r="13" /><circle cy="-14" r="16" /></g>`,
    svg`<g fill=${food.green}><circle cx="-12" cy="0" r="11" /><circle cx="12" cy="1" r="11" /><circle cy="-6" r="12" /></g>`,
    svg`<path d="M0 8V-10M0-1L-7-8M0 3L7-5" fill="none" stroke=${food.greenDark} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function carton(food: Food): Art {
  return part('carton', [
    svg`<path d="M-15-30L-8-44H8L15-30Z" fill=${C.creamDark} />`,
    svg`<rect x="-8" y="-49" width="16" height="6" rx="1.5" fill=${C.metalMid} />`,
    svg`<rect x="-15" y="-31" width="30" height="48" fill=${C.cream} />`,
    svg`<rect x="-15" y="-16" width="30" height="16" fill=${mix(C.sky, food.bread, 0.1)} />`,
    drop(0, -8, '#fff', 0.68),
  ])
}

function cheese(food: Food): Art {
  return part('cheese', [
    svg`<path d="M-20 13V-3L18-17V13Z" fill=${mix(C.sun, food.bread, 0.3)} />`,
    svg`<path d="M-20-3L18-17L22-3Z" fill=${C.sunDark} />`,
    svg`<circle cx="-7" cy="6" r="4" fill=${C.sunDark} /><circle cx="8" cy="3" r="3" fill=${C.sunDark} />`,
  ])
}

function moth(x: number, y: number, index: number, tilt = 0): Art {
  const trail = svg`<path d="M-44 26q10-16 22-12t12-6" fill="none" stroke=${MOTH} stroke-width="2" stroke-linecap="round" stroke-dasharray="1 6" opacity=".7" />`
  const wing = (side: number): Art => svg`<g transform=${`scale(${side} 1)`}>
    <path d="M0 3C5 9 8 18 15 19C20 17 19 8 12 3Z" fill=${MOTH_DARK} />
    <path d="M1-4C7-16 22-18 28-11C30-3 19 5 1 4Z" fill=${MOTH} />
    <circle cx="16" cy="-7" r="3.2" fill=${MOTH_DARK} />
    <circle cx="9" cy="-3" r="1.8" fill=${MOTH_DARK} />
  </g>`
  const body: Art = [
    wing(-1),
    wing(1),
    svg`<path d="M-1.5-11Q-5-18-10-19M1.5-11Q5-18 10-19" fill="none" stroke=${MOTH_BODY} stroke-width="1.8" stroke-linecap="round" />`,
    svg`<ellipse cy="1" rx="4.2" ry="11" fill=${MOTH_BODY} />`,
    svg`<circle cx="-2" cy="-7" r="1.4" fill="#fff" /><circle cx="2" cy="-7" r="1.4" fill="#fff" />`,
  ]
  return part(
    'moth',
    at(x, y, motion('buzz', [trail, at(0, 0, body, tilt)], (index % 3) + 1), 0, 0.84),
    index,
  )
}

function weedBall(r: number): Art {
  const loops = [0, 32, 68, 104, 142].map(
    (angle, i) =>
      svg`<ellipse rx=${r} ry=${round(r * (0.34 + i * 0.13))} transform=${`rotate(${angle})`} fill="none" stroke=${i % 2 ? WEED_DARK : WEED} stroke-width="2.3" />`,
  )
  const twigs = [15, 75, 130, 200, 255, 315].map((angle) => {
    const a = (angle * Math.PI) / 180
    const px = round(Math.cos(a) * r * 0.88)
    const py = round(Math.sin(a) * r * 0.88)
    const qx = round(Math.cos(a + 0.3) * r * 1.3)
    const qy = round(Math.sin(a + 0.3) * r * 1.3)
    return svg`<path d=${`M${px} ${py}L${qx} ${qy}`} stroke=${WEED} stroke-width="2.3" stroke-linecap="round" />`
  })
  return [svg`<circle r=${r} fill=${WEED_DARK} opacity=".3" />`, loops, twigs]
}

function tumbleweed(x: number, y: number, r: number): Art {
  return part('tumbleweed', at(x, y, motion('drift', motion('spin', weedBall(r)))))
}

function gust(x: number, y: number): Art {
  return part(
    'gust',
    (
      [
        [0, 0, 16, 1],
        [-5, 9, 11, 2],
      ] as const
    ).map(([dx, dy, w, d]) =>
      at(
        x + dx,
        y + dy,
        motion(
          'flicker',
          svg`<path d=${`M${-w} 0H0`} stroke=${WEED} stroke-width="3" stroke-linecap="round" opacity=".6" />`,
          d,
        ),
      ),
    ),
  )
}

function dustBunnies(spots: ReadonlyArray<readonly [number, number, number]>): Art {
  return part(
    'dust',
    spots.map(([x, y, s]) =>
      at(
        x,
        y,
        svg`<ellipse rx="10" ry="5" fill=${shadeOf(DUST, 0.3)} /><ellipse cx="-2" cy="-2" rx="6.5" ry="3.6" fill=${DUST} />`,
        0,
        s,
      ),
    ),
  )
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return part(
    'zed',
    at(
      x,
      y,
      motion(
        'bob',
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function bagView(parts: GroceriesParts, paper: Paper): Art {
  if (parts.folded) {
    return [
      shadow(100, 184, 62),
      part('bag', at(100, 183, foldedBag(paper, parts.mood))),
      when(parts.mood === 'sleepy', () => [
        zed(150, 62, 0.72, 1),
        zed(165, 42, 1, 2),
        zed(180, 24, 0.62, 3),
      ]),
      neglect(
        parts,
        [[30, 80]],
        [[166, 100]],
        [
          [30, 180, 1],
          [172, 182, 0.8],
        ],
      ),
      when(parts.tumbleweed, () => [tumbleweed(170, 170, 13)]),
    ]
  }
  return [
    shadow(68, 184, 58),
    part('bag', at(68, 183, bag({ w: 104, h: 102, paper, mood: parts.mood, size: 1.05 }))),
    shoppingList(parts),
    neglect(
      parts,
      [
        [18, 76],
        [124, 66],
      ],
      [
        [40, 30],
        [102, 32],
      ],
      [
        [20, 184, 0.9],
        [124, 185, 0.7],
      ],
    ),
    when(parts.tumbleweed, () => tumbleweed(175, 172, 13)),
    when(parts.tumbleweed && !parts.curl, () => gust(158, 170)),
  ]
}

function neglect(
  parts: GroceriesParts,
  lines: ReadonlyArray<readonly [number, number]>,
  spots: ReadonlyArray<readonly [number, number]>,
  bunnies: ReadonlyArray<readonly [number, number, number]>,
): Art {
  return [
    when(parts.dust > 0, () => dustBunnies(bunnies)),
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.moths).map(([x, y], i) => moth(x, y, i, i ? 16 : -14)),
  ]
}

function web(x: number, y: number, side: number, size: number): Art {
  const threads = [4, 30, 58, 86].map((angle) => {
    const a = (angle * Math.PI) / 180
    return [Math.cos(a) * size, Math.sin(a) * size] as const
  })
  const arc = (k: number): string =>
    threads
      .map(([tx, ty], i) => {
        const px = round(tx * k)
        const py = round(ty * k)
        if (i === 0) return `M${px} ${py}`
        const prev = threads[i - 1] ?? [tx, ty]
        return `Q${round(((tx + prev[0]) / 2) * k * 0.82)} ${round(((ty + prev[1]) / 2) * k * 0.82)} ${px} ${py}`
      })
      .join('')
  return part(
    'cobweb',
    at(
      x,
      y,
      svg`<g transform=${`scale(${side} 1)`} fill="none" stroke=${WEB} stroke-width="1.5" stroke-linecap="round" opacity=".8">
        ${threads.map(([tx, ty]) => svg`<path d=${`M0 0L${round(tx)} ${round(ty)}`} />`)}
        ${[0.45, 0.72, 1].map((k) => svg`<path d=${arc(k)} />`)}
      </g>`,
    ),
  )
}

function onion(parts: GroceriesParts): Art {
  const body = parts.rotten ? mix(ONION, C.musty, 0.75) : ONION
  const dark = parts.rotten ? mix(ONION_DARK, C.mustyDark, 0.8) : ONION_DARK
  const light = parts.rotten ? mix(ONION_LIGHT, C.musty, 0.55) : ONION_LIGHT
  return part('onion', [
    when(parts.sprout, () => [
      svg`<path d="M0-40C-4-47-9-51-14-53C-13-46-8-40-3-37Z" fill=${C.leafDark} />`,
      svg`<path d="M0-40C2-48 6-54 10-57C12-50 8-42 3-37Z" fill=${C.leaf} />`,
    ]),
    svg`<path d="M0-44C2-36 8-33 15-29C26-23 29-12 24-4C20 1 11 2 0 2C-11 2-20 1-24-4C-29-12-26-23-15-29C-8-33-2-36 0-44Z" fill=${body} />`,
    svg`<path d="M0-40C2-30 22-26 22-12C22-6 18-2 12 0C24 1 28-14 22-22C16-30 4-32 0-40Z" fill=${dark} />`,
    svg`<path d="M-3-34C-10-26-18-22-18-12" fill="none" stroke=${light} stroke-width="3" stroke-linecap="round" />`,
    svg`<path d="M-8 2C5 3 12 2 14 1" fill="none" stroke=${dark} stroke-width="3.6" stroke-linecap="round" />`,
    svg`<path d="M-13-17l6-4M13-17l-6-4" fill="none" stroke=${C.fly} stroke-width="2.2" stroke-linecap="round" />`,
    svg`<circle cx="-8" cy="-13" r="2.8" fill=${C.fly} /><circle cx="8" cy="-13" r="2.8" fill=${C.fly} />`,
    svg`<path d="M-5-4Q0-9 5-4" fill="none" stroke=${C.fly} stroke-width="2.4" stroke-linecap="round" />`,
    at(-13, -6, motion('drip', drop(0, 0, C.water, 0.62), 2)),
  ])
}

function door(side: number, askew: boolean): Art {
  const leaf = [
    svg`<path d=${`M0 2L${side * 11}-8V158L0 148Z`} fill=${C.creamDark} />`,
    svg`<path d=${`M${side * 2.5} 14L${side * 8.5} 8V54L${side * 2.5} 58Z M${side * 2.5} 72L${side * 8.5} 70V142L${side * 2.5} 138Z`} fill=${C.metalDark} opacity=".45" />`,
    svg`<circle cx=${side * 8} cy="64" r="2.6" fill=${C.sunDark} />`,
  ]
  const x = side < 0 ? 22 : 118
  return at(askew ? x + 7 : x, 28, leaf, askew ? side * -3.5 : 0)
}

function pantry(parts: GroceriesParts): Art {
  const askew = parts.moths >= 2
  const shelves = [78, 124] as const
  return part('pantry', [
    door(1, false),
    door(-1, askew),
    svg`<rect x="30" y="176" width="12" height="9" rx="2" fill=${C.metalDark} /><rect x="98" y="176" width="12" height="9" rx="2" fill=${C.metalDark} />`,
    svg`<rect x="22" y="22" width="96" height="158" rx="6" fill=${C.cream} />`,
    svg`<rect x="30" y="30" width="80" height="142" rx="3" fill=${NOOK} />`,
    shelves.map((y) => [
      svg`<rect x="30" y=${y} width="80" height="6" fill=${C.creamDark} />`,
      svg`<rect x="30" y=${y + 6} width="80" height="4" fill="#000" opacity=".22" />`,
    ]),
    svg`<rect x="16" y="14" width="108" height="13" rx="5" fill=${C.cream} /><rect x="16" y="23" width="108" height="4" rx="2" fill=${C.creamDark} />`,
    part('ghosts', [
      svg`<path d="M40 78V54Q40 50 44 50H58Q62 50 62 54V78" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round" opacity=".2" />`,
      svg`<path d="M76 78V60H98V78" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 5" stroke-linecap="round" opacity=".2" />`,
      svg`<ellipse cx="72" cy="171" rx="26" ry="2.6" fill="#fff" opacity=".07" />`,
    ]),
    when(parts.dust > 0, () => [
      web(30, 30, 1, 32),
      svg`<path d="M34 77.5h20M72 77.5h30M34 123.5h12M98 123.5h9" stroke=${DUST} stroke-width="2.4" stroke-linecap="round" />`,
    ]),
    at(70, 123, onion(parts)),
    when(parts.tumbleweed, () => tumbleweed(70, 154, 15)),
  ])
}

function rolledList(): Art {
  return at(
    -8,
    -84,
    [
      svg`<rect x="-14" y="-30" width="28" height="44" fill=${PAPER} />`,
      svg`<rect x="-14" y="-34" width="28" height="9" rx="4.5" fill=${C.creamDark} />`,
      (
        [
          [-20, 18],
          [-10, 13],
          [0, 16],
        ] as const
      ).map(
        ([y, width]) =>
          svg`<rect x="-9" y=${y} width=${width} height="4.4" rx="2.2" fill=${C.glass} opacity=".6" />`,
      ),
    ],
    -9,
  )
}

function pantryView(parts: GroceriesParts, paper: Paper): Art {
  return [
    shadow(70, 184, 56, 0.24),
    pantry(parts),
    shadow(144, 184, 46),
    part(
      'bag',
      at(
        144,
        184,
        bag({
          w: 90,
          h: 92,
          paper,
          mood: parts.mood,
          size: 0.95,
          handles: false,
          contents: rolledList(),
        }),
      ),
    ),
    stenchLines(
      (
        [
          [184, 116],
          [104, 118],
        ] as const
      ).slice(0, parts.stench),
    ),
    parts.moths >= 1 ? moth(158, 40, 0, 18) : nothing,
    parts.moths >= 2 ? moth(88, 52, 1, -12) : nothing,
  ]
}

function wheel(x: number, delay: number): Art {
  return at(x, 175, [
    svg`<circle r="10" fill=${TYRE} />`,
    svg`<circle r="5" fill=${C.metal} />`,
    motion(
      'spin',
      svg`<path d="M-3.8 0H3.8M0-3.8V3.8" stroke=${C.metalDark} stroke-width="2.2" stroke-linecap="round" />`,
      delay,
    ),
  ])
}

function cartBack(): Art {
  return svg`<path d="M36 112H178L164 154H52Z" fill=${C.metal} opacity=".14" />`
}

function cartFront(): Art {
  const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
    const t = i / 8
    return svg`<path d=${`M${round(40 + t * 134)} 116L${round(55 + t * 106)} 154`} />`
  })
  return [
    svg`<g stroke=${C.metalMid} stroke-width="3" stroke-linecap="round" fill="none">${bars}<path d="M45 130H170M49.5 142H165.5" /></g>`,
    svg`<path d="M52 155H164" stroke=${C.metalDark} stroke-width="5" stroke-linecap="round" />`,
    svg`<rect x="32" y="110" width="150" height="9" rx="4.5" fill=${C.metal} />`,
    svg`<path d="M32 113L22 84" fill="none" stroke=${C.metalDark} stroke-width="6" stroke-linecap="round" />`,
    svg`<rect x="10" y="78" width="24" height="10" rx="5" fill=${C.coral} />`,
    svg`<path d="M62 158L66 172M152 158L146 172M66 165H148" fill="none" stroke=${C.metalDark} stroke-width="5" stroke-linecap="round" />`,
  ]
}

function falling(food: Food): Art {
  const pieces: Array<[number, number, number, number, Art]> = [
    [82, 34, 1, 0.62, apple(C.mint, C.mintDark, food.greenDark)],
    [116, 22, 3, 0.56, at(0, 0, carrot(food), 24)],
    [142, 46, 2, 0.66, apple(food.red, food.redDark, food.green)],
  ]
  return part(
    'falling',
    pieces.map(([x, y, d, s, art]) => at(x, y, motion('fall', at(0, 0, art, 0, s), d))),
  )
}

function cartLoad(food: Food, loaded: number): Art {
  const items: Art[] = [
    at(64, 100, cheese(food), -10, 1),
    at(158, 108, carton(food), 8, 0.86),
    at(150, 104, apple(food.red, food.redDark, food.green), 0, 0.68),
    at(70, 100, lettuce(food), 0, 0.72),
  ]
  return part('cart-load', items.slice(0, loaded))
}

function speedLines(): Art {
  const lines = [
    [18, 128, 14, 1],
    [14, 146, 10, 2],
    [20, 162, 14, 3],
  ] as const
  return part('speed', [
    lines.map(([x, y, w, d]) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${`M0 0H${w}`} stroke=${SPEED} stroke-width="4" stroke-linecap="round" />`,
          d,
        ),
      ),
    ),
    at(40, 178, motion('drift', svg`<circle r="5.5" fill=${C.metal} opacity=".55" />`, 1)),
    at(28, 172, motion('drift', svg`<circle r="3.5" fill=${C.metal} opacity=".45" />`, 3)),
  ])
}

function cartView(parts: GroceriesParts, paper: Paper): Art {
  const food = foodOf(0)
  return [
    shadow(104, 184, 68),
    when(parts.dust > 0, () => dustBunnies([[182, 182, 0.7]])),
    part(
      'cart',
      motion('rumble', [
        cartBack(),
        cartLoad(food, parts.loaded),
        at(
          106,
          152,
          bag({ w: 84, h: 92, paper, mood: parts.mood, size: 0.9, handles: false, rise: 8 }),
        ),
        cartFront(),
        wheel(66, 1),
        wheel(146, 2),
      ]),
    ),
    falling(food),
    speedLines(),
    when(parts.tumbleweed, () => tumbleweed(20, 174, 10)),
    when(parts.moths > 0, () => moth(36, 48, 0, -18)),
  ]
}

function porch(): Art {
  return part('door', [
    svg`<rect x="14" y="14" width="88" height="154" rx="6" fill=${C.cream} />`,
    svg`<rect x="22" y="22" width="72" height="146" rx="3" fill=${C.coral} />`,
    svg`<path d="M22 22H34V168H22Z" fill=${C.coralDark} opacity=".35" />`,
    svg`<path d="M36 68V46A22 22 0 0 1 80 46V68Z" fill=${C.spark} />`,
    svg`<path d="M58 24V68M36 50H80" stroke=${C.coral} stroke-width="3" />`,
    svg`<rect x="38" y="82" width="40" height="28" rx="4" fill=${C.coralDark} opacity=".6" />`,
    svg`<rect x="38" y="122" width="40" height="38" rx="4" fill=${C.coralDark} opacity=".6" />`,
    svg`<rect x="46" y="92" width="24" height="7" rx="2" fill=${C.metal} />`,
    svg`<circle cx="86" cy="104" r="5" fill=${C.sun} /><circle cx="84.5" cy="102.5" r="1.6" fill="#fff" opacity=".8" />`,
    part('mat', [
      svg`<rect x="10" y="171" width="104" height="14" rx="3" fill=${C.terracottaDark} />`,
      svg`<path d="M16 178h92" stroke=${C.sun} stroke-width="3" stroke-dasharray="7 5" stroke-linecap="round" />`,
    ]),
  ])
}

function doorView(parts: GroceriesParts, paper: Paper): Art {
  const food = foodOf(parts.wilt)
  const twin = paperOf(tintOf(paper.main, 0.18))
  const back = paperOf(shadeOf(paper.main, 0.14))
  return [
    porch(),
    shadow(170, 184, 18, 0.22),
    part(
      'bag-back',
      at(
        170,
        182,
        bag({
          w: 38,
          h: 44,
          paper: back,
          handles: false,
          contents: at(1, -48, apple(food.red, food.redDark, food.green), 0, 0.72),
        }),
      ),
    ),
    shadow(128, 184, 44),
    part(
      'bag',
      at(
        128,
        184,
        bag({
          w: 82,
          h: 80,
          paper,
          mood: parts.mood,
          size: 0.82,
          handles: false,
          contents: [
            at(22, -116, baguette(food), 14, 0.72),
            at(-16, -92, carrot(food), -14, 0.8),
            at(4, -88, lettuce(food), 0, 0.76),
          ],
        }),
      ),
    ),
    shadow(66, 184, 26, 0.22),
    part(
      'bag-front',
      at(
        66,
        184,
        bag({
          w: 54,
          h: 52,
          paper: twin,
          handles: false,
          contents: [
            at(10, -70, carton(food), 8, 0.8),
            at(-11, -58, apple(C.mint, C.mintDark, food.greenDark), 0, 0.72),
          ],
        }),
      ),
    ),
    at(-50, -12, ding()),
    neglect(
      parts,
      [
        [183, 164],
        [110, 118],
      ],
      [
        [168, 86],
        [130, 34],
      ],
      [[188, 185, 0.6]],
    ),
    when(parts.tumbleweed, () => [tumbleweed(24, 170, 12)]),
  ]
}

function fullView(paper: Paper): Art {
  const food = foodOf(0)
  const contents: Art = [
    at(34, -116, baguette(food), 15),
    at(-36, -126, carrot(food), -18),
    at(-12, -136, carrot(food), -5, 0.92),
    at(10, -96, lettuce(food)),
    at(-30, -88, lettuce(food), 0, 0.85),
    at(-20, -92, apple(food.red, food.redDark, food.green), -8, 1.02),
    at(14, -90, apple(C.mint, C.mintDark, food.greenDark), 10, 1),
  ]
  return [
    shadow(100, 184, 64),
    part(
      'bag',
      at(
        100,
        184,
        motion(
          'bob',
          bag({
            w: 108,
            h: 84,
            paper,
            mood: 'happy',
            size: 1.08,
            handles: false,
            blush: true,
            contents,
          }),
        ),
      ),
    ),
    sparkle(30, 92, 1.25, 1),
    sparkle(172, 104, 1.05, 2),
    sparkle(28, 156, 0.8, 3),
    sparkle(178, 34, 0.85, 4),
    sparkle(172, 158, 0.7, 5),
  ]
}

export function groceries(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = groceriesParts(scene)
  const stink = scene.state === 'clean' ? 0 : clamp01(scene.stink)
  const paper = paperOf(mix(accentOf(scene, KRAFT), C.musty, stink * 0.28))
  const views: Record<GroceriesView, () => Art> = {
    bag: () => bagView(parts, paper),
    pantry: () => pantryView(parts, paper),
    cart: () => cartView(parts, paper),
    door: () => doorView(parts, paper),
    full: () => fullView(paper),
  }
  return frame('groceries', scene, options, views[parts.view]())
}
