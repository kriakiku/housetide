import { svg } from 'lit'
import type { SVGTemplateResult, TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  clamp01,
  COLORS as C,
  drop,
  face,
  fly,
  frame,
  mix,
  motion,
  part,
  reached,
  shadeOf,
  shadow,
  sparkle,
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type DuckMood = 'asleep' | 'calm' | 'pleading' | 'worried' | 'horrified' | 'happy'
export type BottlePose = 'none' | 'waiting' | 'spraying'

export interface BathroomParts {
  scale: number
  mould: number
  stench: number
  flies: number
  sludge: number
  duck: DuckMood
  bottle: BottlePose
  foam: number
  sponge: boolean
  timer: boolean
  gleam: boolean
  dim: boolean
  mood: Mood
}

export const MAX_SCALE = 6

const MOULD_AT = [0.05, 0.25, 0.45, 0.65, 0.85] as const
const STENCH_AT = [0.15, 0.4, 0.7] as const
const FLIES_AT = [0.45, 0.7, 0.92] as const
const SLUDGE_AT = [0.55, 0.85] as const
const LATE_FLIES_AT = [0.65, 0.9] as const
const MOULD_PER_STEP = 2

function duckFor(stink: number, fallback: DuckMood): DuckMood {
  if (stink >= 0.5) return 'horrified'
  if (stink >= 0.2) return 'worried'
  return fallback
}

export function bathroomParts(scene: SceneView): BathroomParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const mould = reached(stink, MOULD_AT) * MOULD_PER_STEP
  const base = {
    scale: 0,
    mould,
    stench: reached(stink, STENCH_AT),
    flies: 0,
    sludge: reached(stink, SLUDGE_AT),
    duck: 'calm' as DuckMood,
    bottle: 'none' as BottlePose,
    foam: 0,
    sponge: false,
    timer: false,
    gleam: false,
    dim: false,
    mood: 'calm' as Mood,
  }
  if (state === 'clean') return { ...base, duck: 'happy', gleam: true, mood: 'happy' }
  if (state === 'running') {
    return {
      ...base,
      scale: Math.min(2, Math.floor(fill * MAX_SCALE)),
      duck: 'happy',
      bottle: 'spraying',
      foam: 2,
      sponge: true,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...base,
      flies: reached(stink, LATE_FLIES_AT),
      duck: duckFor(stink, 'calm'),
      foam: 1,
      timer: true,
      mood: stink >= 0.5 ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const scale = due ? MAX_SCALE : Math.min(MAX_SCALE - 1, Math.floor(fill * MAX_SCALE))
  let mood: Mood = scale >= 4 ? 'worried' : 'calm'
  if (state === 'resting') mood = 'sleepy'
  if (due) mood = 'pleading'
  if (stink >= 0.45) mood = 'sick'
  let duckMood: DuckMood = scale >= 4 ? 'worried' : 'calm'
  if (state === 'resting') duckMood = 'asleep'
  if (due) duckMood = 'pleading'
  return {
    ...base,
    scale,
    flies: reached(stink, FLIES_AT),
    duck: duckFor(stink, duckMood),
    bottle: due ? 'waiting' : 'none',
    dim: state === 'resting',
    mood,
  }
}

const FACE_INK = '#3a4466'
const SCALE_TINT = '#d9c98a'
const GRIME = '#a9a463'
const MOULD = '#3d5a48'
const BEAK = '#ff9a3d'
const SLIME = '#6f8f35'

const TILE_W = 26
const TILE_STEP = 29
const TILE_TOP = 32
const TILE_ROWS = 5
const TILE_COLS = 7

function tiles(parts: BathroomParts): Art {
  const glow = parts.gleam ? 0.13 : parts.dim ? 0.04 : 0.07
  const cells = Array.from({ length: TILE_ROWS * TILE_COLS }, (_, i) => i)
  return part('tiles', [
    cells.map((i) => {
      const col = i % TILE_COLS
      const row = Math.floor(i / TILE_COLS)
      const y = TILE_TOP + row * TILE_STEP
      const h = row === TILE_ROWS - 1 ? 20 : TILE_W
      const accent = (col + row) % 2 === 0
      return svg`<rect x=${col * TILE_STEP} y=${y} width=${TILE_W} height=${h} rx="3" fill=${accent ? '#fff' : C.sky} opacity=${accent ? glow : glow * 1.4} />`
    }),
    svg`<rect y="26" width="200" height="4" fill="#fff" opacity=${glow * 1.3} />`,
  ])
}

const MOULD_SPOTS = [
  [85.5, 30.5, 1.05],
  [143.5, 88.5, 1],
  [27.5, 59.5, 1.05],
  [114.5, 88.5, 0.9],
  [114.5, 30.5, 1],
  [13.5, 117.5, 0.8],
  [56.5, 30.5, 1.15],
  [186.5, 117.5, 0.8],
  [172.5, 59.5, 0.85],
  [85.5, 88.5, 0.95],
] as const

function mouldPatch(x: number, y: number, size: number, index: number): SVGTemplateResult {
  const flip = index % 2 === 0 ? 1 : -1
  return part(
    'mould',
    at(
      x,
      y,
      svg`
        <circle cx="-3" cy="1" r="9" fill=${MOULD} />
        <circle cx="7" cy="-5" r="6.5" fill=${MOULD} />
        <circle cx="6" cy="6" r="5.5" fill=${MOULD} />
        <circle cx="-11" cy="-6" r="4.5" fill=${MOULD} />
        <circle cx="-15" cy="5" r="2.2" fill=${MOULD} />
        <circle cx="15" cy="3" r="2" fill=${MOULD} />
        <circle cx="-5" cy="-2" r="2.6" fill=${C.musty} />
        <circle cx="6" cy="-6" r="1.9" fill=${C.musty} />
        <circle cx="4" cy="6" r="1.6" fill=${C.musty} />
      `,
      flip * 6,
      size,
    ),
    index,
  )
}

const LIME_DRIPS = [
  [50, 16, 1],
  [150, 22, 2],
  [74, 12, 3],
  [130, 15, 4],
  [61, 8, 5],
  [162, 30, 6],
] as const

function limeDrip(x: number, length: number): Art {
  return svg`<path d=${`M${x - 4} 114V${114 + length}a4 4 0 0 0 8 0V114Z`} fill=${SCALE_TINT} />`
}

function limescale(step: number): Art {
  return [
    LIME_DRIPS.filter(([, , min]) => step >= min).map(([x, length, min]) =>
      part('limescale', limeDrip(x, length), min),
    ),
    when(step >= 3, () =>
      part(
        'scale-ring',
        svg`<path d="M34 138Q66 131 80 133M120 133Q140 131 166 138" fill="none" stroke=${SCALE_TINT} stroke-width="4" stroke-linecap="round" />`,
      ),
    ),
    when(step >= 5, () =>
      part(
        'scale-ring',
        svg`<path d="M38 150Q50 147 62 147M138 147Q150 147 162 150" fill="none" stroke=${SCALE_TINT} stroke-width="3.4" stroke-linecap="round" opacity=".85" />`,
      ),
    ),
  ]
}

function headCrust(step: number): Art {
  const blobs = [
    [131, 59, 3.4],
    [144, 60, 2.8],
    [153, 59, 3.1],
  ] as const
  return part(
    'head-crust',
    blobs
      .slice(0, Math.ceil(step / 2))
      .map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${SCALE_TINT} />`),
  )
}

function shower(parts: BathroomParts, chrome: string, chromeDark: string): Art {
  return part('shower', [
    svg`<path d="M170 106V48Q170 26 150 26H142V38" fill="none" stroke=${chromeDark} stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d="M170 106V48Q170 26 150 26H142V38" fill="none" stroke=${chrome} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d="M124 53Q124 36 142 36Q160 36 160 53Z" fill=${chrome} />`,
    svg`<rect x="120" y="51" width="44" height="7" rx="3.5" fill=${chromeDark} />`,
    svg`<rect x="160" y="82" width="20" height="9" rx="4.5" fill=${chromeDark} />`,
    svg`<circle cx="160" cy="86.5" r="6" fill=${C.sky} /><circle cx="180" cy="86.5" r="6" fill=${C.coral} />`,
    when(parts.scale >= 2, () => headCrust(parts.scale)),
  ])
}

function tub(parts: BathroomParts): Art {
  const decay = parts.sludge / 2
  const staining = Math.max(parts.scale * 0.03, decay * 0.5 + parts.mould * 0.015)
  const dimming = parts.dim ? 0.36 : 0
  const paint = (hex: string): string =>
    mix(
      mix(hex, parts.scale > 0 && !parts.mould ? SCALE_TINT : GRIME, staining),
      '#262c49',
      dimming,
    )
  const rim = parts.gleam ? '#ffffff' : paint('#fbfcff')
  const body = parts.gleam ? '#f3f7ff' : paint('#e8edf7')
  const shade = parts.gleam ? '#d7e2f5' : paint(C.metalMid)
  const foot = parts.dim ? mix(C.sun, '#262c49', dimming) : C.sun
  const footDark = parts.dim ? mix(C.sunDark, '#262c49', dimming) : C.sunDark
  return part('tub', [
    [50, 150].map(
      (x) =>
        svg`<path d=${`M${x - 11} 166H${x + 11}L${x + 7} 180Q${x + 6} 184 ${x + 2} 184H${x - 2}Q${x - 6} 184 ${x - 7} 180Z`} fill=${foot} /><path d=${`M${x - 10} 170H${x + 10}`} stroke=${footDark} stroke-width="3" stroke-linecap="round" />`,
    ),
    svg`<path d="M28 108H172V140Q172 174 138 174H62Q28 174 28 140Z" fill=${body} />`,
    svg`<path d="M28 140Q28 174 62 174H138Q172 174 172 140V137Q168 164 134 164H66Q32 164 28 137Z" fill=${shade} />`,
    svg`<rect x="20" y="100" width="160" height="15" rx="7.5" fill=${rim} />`,
    svg`<path d="M20 110.5Q20 115 27.5 115H172.5Q180 115 180 110.5Z" fill=${shade} opacity=".55" />`,
    svg`<path d="M40 122V142" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=${parts.gleam ? 1 : 0.55} />`,
    when(parts.gleam, () =>
      part(
        'gleam',
        svg`<path d="M160 122V136M40 150Q44 156 50 158" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" />`,
      ),
    ),
  ])
}

const INK_DUCK = '#2b2740'
const BEAK_CLOSED = 'M19-36Q31-36 33-32Q31-27 19-28Z'

function duckEyes(mood: DuckMood): Art {
  const ink = INK_DUCK
  const arc = (d: string): SVGTemplateResult =>
    svg`<path d=${d} fill="none" stroke=${ink} stroke-width="2.6" stroke-linecap="round" />`
  if (mood === 'asleep') return arc('M6-34q4 3.6 8 0')
  if (mood === 'happy') return arc('M6-33q4-6 8 0')
  if (mood === 'pleading') {
    return svg`<circle cx="11" cy="-34" r="5" fill=${ink} /><circle cx="12.8" cy="-36" r="1.9" fill="#fff" />`
  }
  if (mood === 'horrified') {
    return svg`<circle cx="10" cy="-35" r="6.6" fill="#fff" /><circle cx="10.5" cy="-35" r="1.8" fill=${ink} />`
  }
  if (mood === 'worried') {
    return [svg`<circle cx="11" cy="-34" r="2.8" fill=${ink} />`, arc('M5-41.5l8-2.5')]
  }
  return svg`<circle cx="11" cy="-34" r="2.8" fill=${ink} />`
}

function duckBeak(mood: DuckMood, beak: string, dark: string): Art {
  if (mood === 'horrified') {
    return svg`<path d="M20-35H31L30-25H20Z" fill="#6b2233" /><path d="M20-41Q30-43 35-38Q30-33 20-34Z" fill=${beak} /><path d="M20-26Q27-27 31-25Q27-19 20-20Z" fill=${dark} />`
  }
  return svg`<path d=${BEAK_CLOSED} fill=${beak} /><path d="M21-32H32" stroke=${dark} stroke-width="1.6" stroke-linecap="round" />`
}

function foamHat(): Art {
  return part(
    'foam-hat',
    svg`
      <circle cx="9" cy="-46" r="8" fill="#dbe6f7" />
      <circle cx="1" cy="-44" r="5.5" fill="#fff" />
      <circle cx="9" cy="-48" r="7.5" fill="#fff" />
      <circle cx="17" cy="-45" r="5" fill="#fff" />
      <circle cx="10" cy="-56" r="3.8" fill="#fff" />
    `,
  )
}

interface DuckTone {
  main: string
  dark: string
  cheek: string
}

function duckTone(scene: SceneView): DuckTone {
  const main = accentOf(scene, C.sun)
  if (main === C.sun) return { main, dark: C.sunDark, cheek: C.pink }
  return { main, dark: shadeOf(main), cheek: tintOf(main, 0.55) }
}

function duckArt(mood: DuckMood, dim: boolean, hat: boolean, tone: DuckTone): Art {
  const yellow = dim ? mix(tone.main, '#262c49', 0.3) : tone.main
  const wing = dim ? mix(tone.dark, '#262c49', 0.3) : tone.dark
  const beak = dim ? mix(BEAK, '#262c49', 0.3) : BEAK
  const beakDark = dim ? mix(C.coralDark, '#262c49', 0.3) : C.coralDark
  return [
    svg`<path d="M-26-27C-21-19-16-20-8-22C3-24 19-21 22-9C24 1 13 2 0 2H-8C-22 2-29-11-26-27Z" fill=${yellow} />`,
    svg`<circle cx="9" cy="-33" r="13.5" fill=${yellow} />`,
    svg`<path d="M-13-13Q-3-20 7-12Q1-3-8-5Q-13-7-13-13Z" fill=${wing} />`,
    duckBeak(mood, beak, beakDark),
    duckEyes(mood),
    when(
      mood === 'happy',
      () => svg`<circle cx="6" cy="-27" r="3" fill=${tone.cheek} opacity=".75" />`,
    ),
    when(hat, foamHat),
  ]
}

function snooze(): Art {
  const z = 'M0 0h9l-9 10h9'
  return part('snooze', [
    at(
      94,
      42,
      motion(
        'drift',
        svg`<path d=${z} fill="none" stroke=${C.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
        1,
      ),
    ),
    at(
      108,
      24,
      motion(
        'drift',
        svg`<path d=${z} fill="none" stroke=${C.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
        3,
      ),
      0,
      0.7,
    ),
  ])
}

function panic(): Art {
  return part('panic', [
    at(28, 58, motion('drip', drop(0, 0, C.water, 0.9), 1)),
    at(74, 42, motion('drip', drop(0, 0, C.water, 0.72), 3)),
  ])
}

function duck(parts: BathroomParts, tone: DuckTone): Art {
  const hat = parts.foam > 0
  const lift = parts.foam === 2 ? -2 : 0
  const tilt: Record<DuckMood, number> = {
    asleep: 7,
    calm: 0,
    pleading: -4,
    worried: -6,
    horrified: -12,
    happy: 0,
  }
  const art = duckArt(parts.duck, parts.dim, hat, tone)
  const moving =
    parts.duck === 'happy'
      ? motion('bob', art)
      : parts.duck === 'horrified'
        ? motion('rumble', art)
        : art
  return part(
    'duck',
    at(parts.bottle === 'spraying' ? 44 : 50, 101 - lift, moving, tilt[parts.duck], 1.12),
  )
}

function sprayBottle(): Art {
  return [
    svg`<path d="M-14 0H14V-26C14-34 7-36 6-42H-6C-7-36-14-34-14-26Z" fill=${C.mint} />`,
    svg`<rect x="-14" y="-24" width="28" height="15" fill=${C.cream} />`,
    svg`<circle cy="-16.5" r="4.6" fill=${C.sky} />`,
    svg`<rect x="-5.5" y="-49" width="11" height="8" rx="2" fill=${C.coralDark} />`,
    svg`<path d="M-27-61H9Q13-61 13-57V-52Q13-48 9-48H-11L-15-54H-27Q-30-54-30-57.5Q-30-61-27-61Z" fill=${C.coral} />`,
    svg`<path d="M-5-47Q-14-44-15-33" fill="none" stroke=${C.coralDark} stroke-width="4.4" stroke-linecap="round" />`,
    svg`<path d="M-9-37V-5" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".4" />`,
  ]
}

function waitingBottle(): Art {
  return part('spray-bottle', at(106, 101, motion('wobble', sprayBottle()), 0, 0.9))
}

function foamBalls(list: ReadonlyArray<readonly [number, number, number]>): Art {
  return [
    list.map(
      ([x, y, r]) =>
        svg`<circle cx=${x} cy=${y} r=${r + 1.6} fill="#c8d6ee" /><circle cx=${x - 0.8} cy=${y - 1.2} r=${r} fill="#fff" />`,
    ),
  ]
}

const FOAM_LOW = [
  [94, 89, 13],
  [132, 90, 13],
  [76, 94, 10],
  [150, 96, 9],
  [113, 94, 12],
] as const

const FOAM_HIGH = [
  [104, 70, 10],
  [78, 74, 9],
  [130, 73, 9],
  [92, 82, 18],
  [136, 86, 16],
  [70, 88, 15],
  [154, 92, 11],
  [116, 90, 15],
  [50, 92, 12],
  [32, 96, 9],
] as const

function foamHeap(level: number): Art {
  return part('foam', foamBalls(level === 2 ? FOAM_HIGH : FOAM_LOW))
}

function foamDrips(level: number): Art {
  const runs =
    level === 2
      ? ([
          [64, 26],
          [136, 14],
        ] as const)
      : ([
          [78, 20],
          [122, 14],
          [150, 16],
        ] as const)
  return part(
    'foam-drip',
    runs.map(
      ([x, length]) =>
        svg`<path d=${`M${x - 7} 106V${108 + length}a7 7 0 0 0 14 0V106Z`} fill="#fff" />`,
    ),
  )
}

function bubble(x: number, y: number, r: number, delay: number): Art {
  return part(
    'bubble',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<circle r=${r} fill=${C.water} opacity=".22" /><circle r=${r} fill="none" stroke="#d6f2ff" stroke-width="2.2" /><circle cx=${-r * 0.35} cy=${-r * 0.35} r=${r * 0.24} fill="#fff" />`,
        delay,
      ),
    ),
  )
}

function spraying(): Art {
  const mist = [
    [78, 44, 3.6, 1],
    [70, 54, 2.8, 2],
    [84, 58, 3.2, 3],
    [66, 42, 2.4, 4],
    [94, 66, 2.6, 2],
  ] as const
  return part('spray-bottle', [
    part(
      'mist',
      mist.map(([x, y, r, d]) =>
        at(x, y, motion('flicker', svg`<circle r=${r} fill="#eaf8ff" />`, d)),
      ),
    ),
    at(122, 74, motion('rumble', sprayBottle()), -30, 0.8),
  ])
}

function sponge(): Art {
  return part(
    'sponge',
    at(
      142,
      136,
      motion('wobble', [
        svg`<circle cx="-18" cy="10" r="7" fill="#fff" /><circle cx="17" cy="11" r="6" fill="#fff" /><circle cx="-4" cy="15" r="6" fill="#fff" />`,
        svg`<rect x="-20" y="-6" width="40" height="17" rx="6" fill=${C.mint} />`,
        svg`<rect x="-20" y="-15" width="40" height="17" rx="6" fill=${C.sun} />`,
        svg`<circle cx="-10" cy="-8" r="2.4" fill=${C.sunDark} /><circle cx="1" cy="-10" r="1.8" fill=${C.sunDark} /><circle cx="11" cy="-7" r="2.6" fill=${C.sunDark} />`,
      ]),
      -10,
    ),
  )
}

function hourglass(): Art {
  return part(
    'hourglass',
    at(106, 72, [
      svg`<path d="M-13-22H13V-12Q13-5 3.5 0Q13 5 13 12V22H-13V12Q-13 5-3.5 0Q-13-5-13-12Z" fill="#d6ecff" />`,
      svg`<path d="M-9-11H9Q7-5 0-1Q-7-5-9-11Z" fill=${C.sun} />`,
      svg`<path d="M-11 20Q-8 9 0 8Q8 9 11 20Z" fill=${C.sun} />`,
      motion('drip', svg`<rect x="-1.2" y="-1" width="2.4" height="9" fill=${C.sunDark} />`),
      svg`<rect x="-18" y="-29" width="36" height="8" rx="4" fill=${C.wicker} />`,
      svg`<rect x="-18" y="21" width="36" height="8" rx="4" fill=${C.wicker} />`,
    ]),
  )
}

function plea(): Art {
  return part('plea', [
    at(
      134,
      86,
      motion(
        'pulse',
        svg`<path d="M0-13V2" stroke=${C.sun} stroke-width="6" stroke-linecap="round" /><circle cy="11" r="3.6" fill=${C.sun} />`,
      ),
    ),
  ])
}

function sludge(level: number): Art {
  return part('sludge', [
    when(
      level >= 1,
      () =>
        svg`<path d="M116 106Q116 98 124 99Q132 96 140 99Q150 96 158 99Q168 98 168 106V112Q168 118 160 118H158V134a5 5 0 0 1-10 0V118H136V126a4.5 4.5 0 0 1-9 0V118H124Q116 118 116 112Z" fill=${SLIME} /><path d="M124 105Q130 102 136 104" fill="none" stroke=${C.stench} stroke-width="3" stroke-linecap="round" />`,
    ),
    when(
      level >= 2,
      () =>
        svg`<ellipse cx="60" cy="182" rx="26" ry="5.5" fill=${SLIME} /><ellipse cx="140" cy="186" rx="18" ry="3.6" fill=${SLIME} />`,
    ),
  ])
}

export function bathroom(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = bathroomParts(scene)
  const chrome = parts.dim ? mix(C.metal, '#262c49', 0.4) : C.metal
  const chromeDark = parts.dim ? mix(C.metalDark, '#262c49', 0.4) : C.metalDark
  const stenchSpots: Array<readonly [number, number]> = [
    [15, 98],
    [185, 78],
    [185, 164],
  ]
  const flySpots: Array<readonly [number, number]> = [
    [100, 22],
    [188, 40],
    [20, 34],
  ]
  const art: Art = [
    tiles(parts),
    MOULD_SPOTS.slice(0, parts.mould).map(([x, y, s], i) => mouldPatch(x, y, s, i)),
    shadow(100, 184, 78),
    shower(parts, chrome, chromeDark),
    when(parts.dim, () => at(142, 66, motion('drip', drop(0, 0, C.waterDark, 0.8)))),
    when(parts.foam > 0, () => foamHeap(parts.foam)),
    tub(parts),
    limescale(parts.scale),
    when(parts.foam > 0, () => foamDrips(parts.foam)),
    when(parts.sludge > 0, () => sludge(parts.sludge)),
    face(100, 146, parts.mood, parts.dim ? mix(FACE_INK, '#262c49', 0.3) : FACE_INK, 1.05),
    duck(parts, duckTone(scene)),
    when(parts.duck === 'asleep', snooze),
    when(parts.duck === 'horrified', panic),
    when(parts.bottle === 'waiting', () => [waitingBottle(), plea()]),
    when(parts.bottle === 'spraying', spraying),
    when(parts.sponge, sponge),
    when(parts.timer, hourglass),
    when(parts.foam === 2, () => [
      bubble(182, 62, 7, 1),
      bubble(24, 40, 6, 2),
      bubble(148, 66, 5, 3),
      bubble(17, 72, 7, 4),
      bubble(52, 20, 5, 5),
    ]),
    when(parts.gleam, () => [
      sparkle(116, 76, 1.25, 1),
      sparkle(184, 128, 0.9, 2),
      sparkle(92, 50, 0.75, 3),
      sparkle(24, 46, 0.85, 4),
      sparkle(16, 136, 0.7, 5),
      bubble(142, 88, 7, 2),
      bubble(84, 84, 5, 4),
    ]),
    stenchLines(stenchSpots.slice(0, parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
  return frame('bathroom', scene, options, art)
}
