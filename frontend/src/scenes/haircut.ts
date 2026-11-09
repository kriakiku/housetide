import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  COLORS as C,
  clamp01,
  face,
  fly,
  frame,
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

export type HaircutStyle = 'grown' | 'overgrown' | 'floor' | 'half' | 'trim' | 'sharp'

export interface HaircutParts {
  style: HaircutStyle
  step: number
  tangle: number
  frizz: boolean
  comb: boolean
  nest: boolean
  chick: boolean
  stench: number
  flies: number
  cape: boolean
  scissors: boolean
  mirror: boolean
  cracked: boolean
  regrowth: boolean
  clippings: number
  plea: boolean
  asleep: boolean
  shine: boolean
  mood: Mood
}

export const MAX_STEP = 4

const TANGLE_AT = [0.15, 0.4, 0.65, 0.85] as const

const CALM = {
  tangle: 0,
  frizz: false,
  comb: false,
  nest: false,
  chick: false,
  stench: 0,
  flies: 0,
  cape: false,
  scissors: false,
  mirror: false,
  cracked: false,
  regrowth: false,
  clippings: 0,
  plea: false,
  asleep: false,
  shine: false,
} as const

export function haircutParts(scene: SceneView): HaircutParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...CALM, style: 'sharp', step: 0, shine: true, mood: 'happy' }
  }
  if (state === 'running') {
    return {
      ...CALM,
      style: 'half',
      step: 2,
      cape: true,
      scissors: true,
      clippings: 2,
      mood: 'happy',
    }
  }
  const tangle = reached(stink, TANGLE_AT)
  if (state === 'waiting') {
    let mood: Mood = 'calm'
    if (tangle >= 2) mood = 'worried'
    if (tangle >= 3) mood = 'sick'
    return {
      ...CALM,
      style: 'trim',
      step: 0,
      tangle,
      cape: true,
      mirror: true,
      regrowth: tangle >= 1,
      cracked: tangle >= 2,
      clippings: Math.min(4, 1 + tangle),
      stench: tangle >= 3 ? tangle - 2 : 0,
      flies: tangle >= 3 ? 1 : 0,
      mood,
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const step = due ? MAX_STEP : resting ? 0 : raw
  let style: HaircutStyle = due ? 'overgrown' : 'grown'
  if (tangle >= 2) style = 'floor'
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (tangle >= 3) mood = 'sick'
  return {
    ...CALM,
    style,
    step,
    tangle,
    frizz: tangle >= 1,
    comb: tangle >= 2,
    nest: tangle >= 3,
    chick: tangle >= 4,
    stench: tangle >= 4 ? 2 : 0,
    flies: tangle >= 4 ? 2 : 0,
    plea: due,
    asleep: resting && tangle === 0,
    mood,
  }
}

type Tip = readonly [x: number, y: number, cx?: number, cy?: number]

interface Cut {
  lift: number
  depth: number
  tips: readonly Tip[]
  back?: readonly Tip[]
}

const R = 50
const SKIN = '#ffdcbf'
const SKIN_DARK = '#f3b892'
const BLUSH = '#ff9f8f'
const INK = '#5b2a1c'
const CAPE = '#eef2fa'
const CAPE_DARK = '#c9d2e6'
const GLASS = '#bfe6fb'
const GLASS_LIGHT = '#e4f5ff'
const TWIG = '#a97a48'
const TWIG_DARK = '#7a5430'
const NEST = '#8f6638'
const EGG = '#f4efe0'

const GROWN: readonly Cut[] = [
  {
    lift: 60,
    depth: 7,
    tips: [
      [53, 2],
      [44, -14],
      [27, -30],
      [6, -25],
      [-16, -32],
      [-38, -23],
      [-53, 2],
    ],
  },
  {
    lift: 62,
    depth: 7,
    tips: [
      [55, 14],
      [45, -6],
      [28, -22],
      [6, -16],
      [-16, -24],
      [-39, -14],
      [-55, 14],
    ],
  },
  {
    lift: 64,
    depth: 8,
    tips: [
      [59, 30],
      [50, 34],
      [43, 26],
      [44, -4, 39, 12],
      [27, -16],
      [6, -9],
      [-16, -18],
      [-44, -4],
      [-43, 26, -39, 12],
      [-50, 34],
      [-59, 30],
    ],
    back: [
      [59, 30],
      [38, 40],
      [14, 34],
      [-14, 40],
      [-38, 34],
      [-59, 30],
    ],
  },
  {
    lift: 66,
    depth: 8,
    tips: [
      [63, 52],
      [54, 60],
      [44, 50],
      [44, -2, 37, 26],
      [27, -8],
      [6, -2],
      [-16, -10],
      [-44, -2],
      [-44, 50, -37, 26],
      [-54, 60],
      [-63, 52],
    ],
    back: [
      [63, 52],
      [40, 62],
      [14, 54],
      [-14, 62],
      [-40, 54],
      [-63, 52],
    ],
  },
  {
    lift: 68,
    depth: 8,
    tips: [
      [68, 66],
      [58, 74],
      [47, 62],
      [45, 4, 37, 34],
      [28, -1],
      [6, 5],
      [-16, -3],
      [-45, 4],
      [-47, 62, -37, 34],
      [-58, 74],
      [-68, 66],
    ],
    back: [
      [68, 66],
      [42, 74],
      [14, 66],
      [-14, 74],
      [-42, 66],
      [-68, 66],
    ],
  },
]

const OVERGROWN: Cut = {
  lift: 68,
  depth: 10,
  tips: [
    [69, 70],
    [59, 77],
    [48, 66],
    [47, 30, 41, 46],
    [36, 31, 42, 12],
    [1, 25, 16, -1],
    [-36, 31, -16, -1],
    [-47, 30, -42, 12],
    [-48, 66, -41, 46],
    [-59, 77],
    [-69, 70],
  ],
  back: [
    [69, 70],
    [42, 77],
    [14, 69],
    [-14, 77],
    [-42, 69],
    [-69, 70],
  ],
}

const FLOOR: Cut = {
  lift: 64,
  depth: 10,
  tips: [
    [70, 74],
    [64, 79],
    [52, 72],
    [49, 32, 42, 50],
    [36, 31, 42, 12],
    [1, 25, 16, -1],
    [-36, 31, -16, -1],
    [-49, 32, -42, 12],
    [-52, 72, -42, 50],
    [-64, 79],
    [-70, 74],
  ],
  back: [
    [70, 74],
    [86, 79],
    [40, 79],
    [0, 79],
    [-40, 79],
    [-86, 79],
    [-70, 74],
  ],
}

const HALF: Cut = {
  lift: 63,
  depth: 8,
  tips: [
    [64, 34],
    [55, 41],
    [45, 33],
    [44, -4, 38, 14],
    [27, -14],
    [6, -9],
    [-16, -27],
    [-38, -22],
    [-53, 2],
  ],
  back: [
    [64, 34],
    [46, 30],
    [52, 0],
  ],
}

const TRIM: Cut = {
  lift: 59,
  depth: 3,
  tips: [
    [52, -6],
    [45, -14],
    [32, -32],
    [10, -33],
    [-12, -33],
    [-34, -32],
    [-45, -14],
    [-52, -6],
  ],
}

function strands(tips: readonly Tip[], depth: number): string {
  return tips
    .slice(1)
    .map((tip, i) => {
      const prev = tips[i] ?? tip
      const cx = tip[2] ?? (prev[0] + tip[0]) / 2
      const cy = tip[3] ?? Math.min(prev[1], tip[1]) - depth
      return `Q${round(cx)} ${round(cy)} ${tip[0]} ${tip[1]}`
    })
    .join('')
}

function dome(tips: readonly Tip[], lift: number): string {
  const right = tips[0] ?? [R, 0]
  const left = tips.at(-1) ?? [-R, 0]
  const top = -lift
  const reach = lift * 0.86
  return [
    `M${left[0]} ${left[1]}`,
    `C${left[0] - 12} ${round(top * 0.5)} ${round(-reach)} ${top} 0 ${top}`,
    `C${round(reach)} ${top} ${right[0] + 12} ${round(top * 0.5)} ${right[0]} ${right[1]}`,
  ].join('')
}

function cutPath(cut: Cut): string {
  return `${dome(cut.tips, cut.lift)}${strands(cut.tips, cut.depth)}Z`
}

function backPath(cut: Cut, tips: readonly Tip[]): string {
  return `${dome(cut.tips, cut.lift)}${strands(tips, 7)}Z`
}

function cutOf(parts: HaircutParts): Cut {
  if (parts.style === 'overgrown') return OVERGROWN
  if (parts.style === 'floor') return FLOOR
  if (parts.style === 'half') return HALF
  if (parts.style === 'grown') return GROWN[parts.step] ?? OVERGROWN
  return TRIM
}

interface Tones {
  hair: string
  dark: string
  light: string
}

function shoulders(): Art {
  return part('shirt', [
    svg`<path d="M-48 78C-48 56-32 47-15 44H15C32 47 48 56 48 78Z" fill=${C.sky} />`,
    svg`<path d="M-15 44H15L0 60Z" fill=${C.skyDark} />`,
  ])
}

function bowTie(): Art {
  return part('bow-tie', [
    svg`<path d="M0 52L-17 43Q-20 42-20 45V60Q-20 63-17 62Z" fill=${C.sun} />`,
    svg`<path d="M0 52L17 43Q20 42 20 45V60Q20 63 17 62Z" fill=${C.sun} />`,
    svg`<path d="M-15 48V57M15 48V57" stroke=${C.sunDark} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<rect x="-5" y="46" width="10" height="12" rx="3.5" fill=${C.sunDark} />`,
  ])
}

function barberCape(tones: Tones, clippings: number): Art {
  const specks = (
    [
      [-36, 66, 18],
      [30, 60, -24],
      [2, 70, 8],
      [-14, 58, -30],
    ] as const
  ).slice(0, clippings + 1)
  return part('cape', [
    svg`<path d="M-64 78C-60 54-34 42 0 42C34 42 60 54 64 78Z" fill=${CAPE} />`,
    svg`<path d="M-42 77L-30 50M-14 78L-10 46M14 78L10 46M42 77L30 50" stroke=${C.sky} stroke-width="5" stroke-linecap="round" opacity=".55" />`,
    svg`<path d="M-24 45C-12 52 12 52 24 45L21 40C10 45-10 45-21 40Z" fill=${CAPE_DARK} />`,
    specks.map(([x, y, r]) => tuft(x, y, r, tones.hair, 0.7)),
  ])
}

function tuft(x: number, y: number, rotate: number, color: string, size = 1): Art {
  return at(
    x,
    y,
    svg`<path d="M-11 4C-10-5 3-10 12-6C8-3 7 1 6 5C1 3-5 2-11 4Z" fill=${color} />`,
    rotate,
    size,
  )
}

function ears(): Art {
  return [-1, 1].map(
    (side) =>
      svg`<circle cx=${side * 49} cy="10" r="9" fill=${SKIN} /><circle cx=${side * 50} cy="10" r="4.5" fill=${SKIN_DARK} />`,
  )
}

function skull(faceY: number): Art {
  return part('head', [
    svg`<circle r=${R} fill=${SKIN} />`,
    svg`<path d="M-44 24A50 50 0 0 0 44 24Q0 56-44 24Z" fill=${SKIN_DARK} opacity=".55" />`,
    svg`<ellipse cx="-30" cy=${faceY + 13} rx="8" ry="5" fill=${BLUSH} opacity=".65" />`,
    svg`<ellipse cx="30" cy=${faceY + 13} rx="8" ry="5" fill=${BLUSH} opacity=".65" />`,
  ])
}

function sheen(parts: HaircutParts, tones: Tones): Art {
  if (parts.style === 'floor' || parts.tangle >= 3) return []
  return svg`<path d="M-36-40C-28-52-16-57-6-58" fill="none" stroke=${tones.light} stroke-width="5" stroke-linecap="round" opacity=".8" />`
}

function strandLines(tones: Tones, long: boolean): Art {
  const crown = 'M-14-54C-18-42-18-32-16-22M20-52C23-42 24-32 22-22'
  const locks = 'M54 4C59 24 59 44 56 58M-54 4C-59 24-59 44-56 58'
  return svg`<path d=${long ? `${crown}${locks}` : crown} fill="none" stroke=${tones.dark} stroke-width="3" stroke-linecap="round" />`
}

function cowlick(tones: Tones, step: number): Art {
  if (step < 1) return []
  const big = step >= 3
  return part(
    'cowlick',
    at(
      6,
      big ? -62 : -58,
      motion(
        'sway',
        svg`<path d=${big ? 'M-9 6C-9-10 4-22 20-20C10-14 8-6 9 6Z' : 'M-7 5C-7-5 2-13 13-12C6-8 5-3 6 5Z'} fill=${tones.hair} />`,
        1,
      ),
    ),
  )
}

function frizz(tones: Tones, tangle: number): Art {
  const curls = (
    [
      ['M-58-40C-74-42-76-58-64-58C-56-58-58-48-64-50', tones.hair],
      ['M58-40C72-46 78-60 66-62C58-62 60-52 66-54', tones.hair],
      ['M-66 10C-82 6-84-10-72-10C-65-9-67 0-72-2', tones.dark],
      ['M66 8C82 6 86-10 74-12C67-12 68-2 74-4', tones.dark],
    ] as const
  ).slice(0, tangle >= 2 ? 4 : 2)
  const knots = (
    [
      [-54, 34],
      [54, 44],
      [-8, -44],
      [-56, 62],
      [28, -46],
    ] as const
  ).slice(0, 1 + tangle)
  return part('tangles', [
    curls.map(
      ([d, color]) =>
        svg`<path d=${d} fill="none" stroke=${color} stroke-width="4.5" stroke-linecap="round" />`,
    ),
    knots.map(([x, y]) =>
      at(
        x,
        y,
        svg`<path d="M-9 2C-7-8 8-9 9-1S-5 9-6 2S3-5 5 0" fill="none" stroke=${tones.dark} stroke-width="3" stroke-linecap="round" />`,
      ),
    ),
  ])
}

function comb(): Art {
  const teeth = [-15, -10, -5, 0, 10, 15].map(
    (x) => svg`<rect x=${x - 1.6} y="4" width="3.2" height="12" rx="1.4" fill=${C.mint} />`,
  )
  return part(
    'comb',
    at(
      -54,
      8,
      [
        teeth,
        svg`<rect x="-20" y="-6" width="40" height="12" rx="5.5" fill=${C.mint} />`,
        svg`<rect x="-15" y="-3" width="26" height="2.6" rx="1.3" fill="#fff" opacity=".55" />`,
      ],
      -34,
      1.05,
    ),
  )
}

function nestOnTop(chick: boolean): Art {
  const twigs = [
    'M-32-2L22 10',
    'M-26 10L34-2',
    'M-20-6L10 14',
    'M18-8L-12 14',
    'M-36 4L-22 8',
    'M26 8L38 3',
  ]
  return part('nest', [
    at(4, -16, motion('bob', part('bird', bird()), 2)),
    when(chick, () => at(-21, -10, part('chick', chickArt()))),
    at(26, -8, svg`<ellipse rx="6" ry="7.5" fill=${EGG} transform="rotate(14)" />`),
    svg`<path d="M-34-6C-30 16 30 16 34-6C20 2-20 2-34-6Z" fill=${NEST} />`,
    twigs.map(
      (d, i) =>
        svg`<path d=${d} fill="none" stroke=${i % 2 ? TWIG_DARK : TWIG} stroke-width="3.4" stroke-linecap="round" />`,
    ),
  ])
}

function bird(): Art {
  return [
    svg`<circle r="15" fill=${C.pink} />`,
    svg`<path d="M-11 4A12 12 0 0 0 11 4Q0-2-11 4Z" fill=${C.cream} />`,
    svg`<path d="M6-1C14-2 18 6 12 10C9 7 6 4 6-1Z" fill=${C.pinkDark} />`,
    svg`<circle cx="-6" cy="-5" r="2.4" fill=${C.fly} />`,
    svg`<circle cx="4" cy="-5" r="2.4" fill=${C.fly} />`,
    svg`<path d="M-4-2L3-2L-1 4Z" fill=${C.sun} />`,
    svg`<path d="M-3-14C-5-20-1-22 0-17C2-22 6-20 3-14Z" fill=${C.pinkDark} />`,
  ]
}

function chickArt(): Art {
  return [
    svg`<circle r="8" fill=${C.sun} />`,
    svg`<circle cx="-3" cy="-2" r="1.5" fill=${C.fly} /><circle cx="3" cy="-2" r="1.5" fill=${C.fly} />`,
    svg`<path d="M-3 1H3L0 6Z" fill=${C.coral} />`,
  ]
}

function hairPool(tones: Tones): Art {
  return part('hair-pool', [
    svg`<path d="M-84 80C-88 70-70 64-44 66H44C70 64 88 70 84 80Z" fill=${tones.dark} />`,
    svg`<path d="M-74 75C-60 69-44 77-28 72M30 74C48 69 62 77 76 72" fill="none" stroke=${tones.light} stroke-width="3" stroke-linecap="round" opacity=".5" />`,
  ])
}

function hairSharp(tones: Tones): Art {
  return part('hair', [
    svg`<path d="M-30-38C-42-32-45-18-45-8L-46 4H-52C-57-14-55-34-42-48Z" fill=${tones.hair} />`,
    svg`<path d="M20-46L30-35C41-27 45-18 45-8L46 4H52C58-14 58-36 50-52Z" fill=${tones.hair} />`,
    svg`<path d="M-45-14L-46 4H-52C-54-4-54.5-9-54-14Z" fill=${tones.dark} />`,
    svg`<path d="M45-14L46 4H52C54-4 54.5-9 54-14Z" fill=${tones.dark} />`,
    svg`<path d="M-50-26C-54-48-32-64-18-66C2-80 38-82 54-66C64-55 60-37 47-39C26-43-4-41-28-32C-36-29-43-26-50-26Z" fill=${tones.hair} />`,
    svg`<path d="M-30-47C-12-63 20-71 42-61" fill="none" stroke=${tones.light} stroke-width="8" stroke-linecap="round" />`,
    svg`<path d="M-8-43C8-49 26-50 40-46" fill="none" stroke=${tones.dark} stroke-width="3" stroke-linecap="round" />`,
  ])
}

function headArt(parts: HaircutParts, tones: Tones, cut: Cut): Art {
  const faceY = parts.style === 'overgrown' || parts.style === 'floor' ? 17 : 10
  const sharp = parts.style === 'sharp'
  return [
    when(cut.back !== undefined, () =>
      part('hair-back', svg`<path d=${backPath(cut, cut.back ?? [])} fill=${tones.dark} />`),
    ),
    when(parts.style === 'floor', () => hairPool(tones)),
    when(parts.cape, () => barberCape(tones, parts.clippings)),
    when(!parts.cape, shoulders),
    when(sharp, bowTie),
    ears(),
    skull(faceY),
    face(parts.mirror ? 8 : 0, faceY, parts.mood, INK, 1.22),
    sharp
      ? hairSharp(tones)
      : part('hair', [
          when(parts.style === 'grown' && !parts.nest, () => cowlick(tones, parts.step)),
          svg`<path d=${cutPath(cut)} fill=${tones.hair} />`,
          when(parts.style !== 'trim' && parts.style !== 'half' && parts.step >= 2, () =>
            strandLines(tones, parts.step >= 3),
          ),
          sheen(parts, tones),
        ]),
    when(parts.regrowth, () => regrow(tones)),
    when(parts.frizz, () => frizz(tones, parts.tangle)),
    when(parts.comb, comb),
    when(parts.nest, () =>
      at(2, parts.style === 'floor' ? -60 : -66, nestOnTop(parts.chick), 0, 0.85),
    ),
  ]
}

function regrow(tones: Tones): Art {
  return part(
    'regrowth',
    at(
      8,
      -56,
      motion('sway', svg`<path d="M-6 3C-6-7 2-14 13-13C6-9 5-4 6 3Z" fill=${tones.hair} />`, 2),
    ),
  )
}

function clippingPiles(count: number, tones: Tones): Art {
  const spots = (
    [
      [170, 185, 1],
      [28, 186, 0.85],
      [116, 186, 1.05],
      [72, 186, 0.8],
    ] as const
  ).slice(0, count)
  return part(
    'clippings',
    spots.map(([x, y, size]) =>
      at(
        x,
        y,
        [
          svg`<path d="M-25 0C-23-6-17-8-13-7C-10-13-2-14 2-10C7-13 16-12 18-6C22-6 25-3 25 0Z" fill=${tones.dark} />`,
          tuft(-8, -8, -18, tones.hair, 0.72),
          tuft(9, -6, 24, tones.light, 0.6),
        ],
        0,
        size,
      ),
    ),
  )
}

function bladeHalf(ring: string): Art {
  return [
    svg`<path d="M5 3L-52-1C-34-10-8-10 5-4Z" fill=${C.metal} />`,
    svg`<path d="M5 3L-52-1L-20-1Z" fill=${C.metalMid} />`,
    svg`<path d="M2 0L24 9" stroke=${ring} stroke-width="6.5" stroke-linecap="round" />`,
    svg`<circle cx="34" cy="13" r="9.5" fill="none" stroke=${ring} stroke-width="6.5" />`,
  ]
}

function shears(ring: string, animated: boolean): Art {
  const upper = at(0, 0, bladeHalf(ring), 13)
  const lower = at(0, 0, svg`<g transform="scale(1 -1)">${bladeHalf(ring)}</g>`, -13)
  return [
    animated ? motion('wobble', upper, 1) : upper,
    animated ? motion('wobble', lower, 3) : lower,
    svg`<circle r="4.5" fill=${C.metalDark} /><circle r="1.8" fill=${C.metal} />`,
  ]
}

function scissorsArt(): Art {
  return part('scissors', [
    at(158, 134, shears(C.coral, true), 12, 0.74),
    (
      [
        [146, 106, 'M0-9V-3'],
        [162, 102, 'M0-8L3-2'],
        [174, 116, 'M8-5L3-2'],
      ] as const
    ).map(([x, y, d], i) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} stroke=${C.spark} stroke-width="3.4" stroke-linecap="round" />`,
          i + 1,
        ),
      ),
    ),
  ])
}

function fallingTufts(tones: Tones): Art {
  return part(
    'falling-hair',
    (
      [
        [132, 156, 30, 1],
        [150, 150, -40, 3],
        [120, 168, 70, 2],
        [146, 170, 12, 4],
      ] as const
    ).map(([x, y, r, d], i) =>
      at(x, y, motion('fall', tuft(0, 0, r, i % 2 ? tones.dark : tones.hair, 1), d)),
    ),
  )
}

function reflection(tones: Tones): Art {
  return [
    svg`<circle cy="6" r="18" fill=${SKIN} />`,
    svg`<path d="M-19 4C-22-20 22-20 19 4C16-6 8-9 0-9C-8-9-16-6-19 4Z" fill=${tones.hair} />`,
    svg`<circle cx="-7" cy="8" r="2.2" fill=${INK} /><circle cx="7" cy="8" r="2.2" fill=${INK} />`,
    svg`<path d="M-4 15q4 3 8 0" fill="none" stroke=${INK} stroke-width="2.2" stroke-linecap="round" />`,
  ]
}

function handMirror(parts: HaircutParts, tones: Tones): Art {
  const frameColor = parts.cracked ? C.sunDark : C.sun
  return part('mirror', [
    svg`<rect x="-5.5" y="30" width="11" height="48" rx="5" fill=${C.sunDark} />`,
    svg`<ellipse rx="31" ry="37" fill=${frameColor} />`,
    svg`<ellipse rx="25" ry="31" fill=${GLASS} />`,
    reflection(tones),
    svg`<path d="M-17-20L-6-27M-20-10L3-26" stroke=${GLASS_LIGHT} stroke-width="4.5" stroke-linecap="round" />`,
    when(parts.cracked, () =>
      part(
        'mirror-crack',
        svg`<path d="M14-27L5-13L13-7L-1 7L6 13L-4 29M5-13L-7-14M-1 7L-14 4" fill="none" stroke=${C.glass} stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
  ])
}

function mirrorRig(parts: HaircutParts, tones: Tones): Art {
  return [
    svg`<path d="M116 178C124 164 138 152 148 148L156 160C148 170 142 178 140 184H116Z" fill=${CAPE} />`,
    at(158, 76, motion('sway', at(0, 0, handMirror(parts, tones), 7), 1)),
    part('hand', [
      svg`<circle cx="150" cy="150" r="13" fill=${SKIN} />`,
      svg`<path d="M139 143C146 136 160 138 163 146" fill="none" stroke=${SKIN_DARK} stroke-width="3" stroke-linecap="round" />`,
    ]),
    part(
      'approval',
      at(
        126,
        32,
        motion('pulse', [
          svg`<circle r="15" fill="none" stroke=${C.check} stroke-width="3.6" stroke-dasharray="5 6" stroke-linecap="round" />`,
          svg`<path d="M-7 0L-2 6L8-6" fill="none" stroke=${C.check} stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity=".55" />`,
        ]),
      ),
    ),
  ]
}

function pleaBubble(): Art {
  return part('plea', [
    svg`<circle cx="156" cy="72" r="3.5" fill=${C.cream} /><circle cx="161" cy="61" r="5.5" fill=${C.cream} />`,
    at(
      168,
      37,
      motion('pulse', [
        svg`<circle r="23" fill=${C.cream} />`,
        at(-1, 1, shears(C.coral, false), -30, 0.42),
      ]),
    ),
  ])
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

function placement(parts: HaircutParts): [number, number, number] {
  if (parts.scissors) return [80, 106, 1]
  if (parts.mirror) return [72, 112, 0.95]
  if (parts.plea) return [96, 106, 1]
  return [100, 106, 1]
}

const STENCH = [
  [20, 118],
  [182, 118],
] as const

const WAITING_STENCH = [
  [17, 92],
  [183, 158],
] as const

function joyful(art: Art, active: boolean): Art {
  return active ? motion('bob', art) : art
}

export function haircut(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = haircutParts(scene)
  const hair = accentOf(scene, C.terracotta)
  const tones: Tones = { hair, dark: shadeOf(hair, 0.26), light: tintOf(hair, 0.42) }
  const cut = cutOf(parts)
  const [x, y, scale] = placement(parts)
  const art: Art = [
    shadow(x, 184, parts.style === 'floor' ? 84 : 62),
    at(x, y, joyful(at(0, 0, headArt(parts, tones, cut), 0, scale), parts.shine)),
    when(parts.clippings > 0, () => clippingPiles(parts.clippings, tones)),
    when(parts.scissors, () => [fallingTufts(tones), scissorsArt()]),
    when(parts.mirror, () => mirrorRig(parts, tones)),
    when(parts.plea, pleaBubble),
    when(parts.asleep, () => [zed(150, 66, 0.72, 1), zed(166, 46, 1, 2), zed(182, 28, 0.62, 3)]),
    when(parts.shine, () => [
      at(142, 42, sparkle(0, 0, 1.25, 1)),
      sparkle(36, 54, 1.1, 2),
      sparkle(174, 104, 0.85, 3),
      sparkle(22, 120, 0.7, 4),
      sparkle(66, 24, 0.6, 5),
    ]),
    stenchLines((parts.mirror ? WAITING_STENCH : STENCH).slice(0, parts.stench)),
    (
      [
        [30, 52],
        [62, 26],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([fx, fy], i) => fly(fx, fy, i)),
  ]
  return frame('haircut', scene, options, art)
}
