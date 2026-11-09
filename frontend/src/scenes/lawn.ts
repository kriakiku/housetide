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
  INK,
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

export type LawnView = 'rows' | 'cutting' | 'bagged' | 'striped'
export type GnomeLook = 'proud' | 'peek' | 'hat' | 'cheer' | 'gone'

export interface LawnParts {
  view: LawnView
  step: number
  heights: readonly number[]
  gnome: GnomeLook
  dandelions: number
  clocks: number
  weeds: number
  snails: number
  climbers: number
  vines: boolean
  dream: boolean
  stench: number
  flies: number
  decay: number
  cut: number
  load: number
  mood: Mood
}

export const MAX_GROWTH = 4

const GROWTH = [
  [6, 6, 6, 5],
  [13, 13, 12, 9],
  [22, 21, 18, 12],
  [32, 29, 25, 15],
  [43, 38, 32, 19],
] as const
const DUE = [80, 72, 56, 26] as const
const OVERGROWN = [92, 84, 70, 28] as const
const UNCUT = [34, 31, 34, 25] as const
const FLAT = [2, 2, 2, 2] as const

const DANDELION_AT = [0.08, 0.2, 0.32] as const
const CLOCK_AT = [0.42, 0.56] as const
const WEED_AT = [0.26, 0.5] as const
const SNAIL_AT = [0.46, 0.62, 0.78] as const
const CLIMBER_AT = [0.7, 0.88] as const
const DECAY_AT = [0.3, 0.6, 0.85] as const
const STENCH_AT = [0.15, 0.4, 0.65] as const
const FLIES_AT = [0.3, 0.6] as const
const VINE_AT = 0.66
const LOST_AT = 0.72
const SICK_AT = 0.6
const DREAM_UNTIL = 0.5

const NEGLECT_FREE = {
  dandelions: 0,
  clocks: 0,
  weeds: 0,
  snails: 0,
  climbers: 0,
  vines: false,
  dream: false,
  stench: 0,
  flies: 0,
  decay: 0,
} as const

export function lawnParts(scene: SceneView): LawnParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...NEGLECT_FREE,
      view: 'striped',
      step: 0,
      heights: FLAT,
      gnome: 'cheer',
      cut: 0,
      load: 0,
      mood: 'happy',
    }
  }
  const dandelions = reached(stink, DANDELION_AT)
  const decay = reached(stink, DECAY_AT) / DECAY_AT.length
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...NEGLECT_FREE,
      view: 'cutting',
      step: MAX_GROWTH,
      heights: UNCUT,
      gnome: 'cheer',
      dandelions,
      decay,
      snails: Math.min(1, reached(stink, SNAIL_AT)),
      cut: Math.min(3, Math.floor(clamp01(scene.progress) * 4)),
      load: clamp01(scene.progress),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...NEGLECT_FREE,
      view: 'bagged',
      step: 0,
      heights: FLAT,
      gnome: 'gone',
      dandelions: Math.min(2, dandelions),
      decay,
      snails: Math.min(1, reached(stink, SNAIL_AT)),
      stench: reached(stink, STENCH_AT),
      flies: reached(stink, FLIES_AT),
      cut: 0,
      load: 1,
      mood: sick ? 'sick' : 'pleading',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const lost = stink >= LOST_AT
  const raw = Math.min(MAX_GROWTH, Math.floor(fill * (MAX_GROWTH + 1)))
  const step = due ? MAX_GROWTH + 1 : resting ? 0 : raw
  let heights: readonly number[] = GROWTH[Math.min(MAX_GROWTH, step)] ?? GROWTH[0]
  if (due) heights = DUE
  if (lost) heights = OVERGROWN
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    view: 'rows',
    step,
    heights,
    gnome: lost ? 'hat' : due ? 'peek' : 'proud',
    dandelions,
    clocks: reached(stink, CLOCK_AT),
    weeds: reached(stink, WEED_AT),
    snails: reached(stink, SNAIL_AT),
    climbers: reached(stink, CLIMBER_AT),
    vines: stink >= VINE_AT,
    dream: due && stink < DREAM_UNTIL,
    stench: 0,
    flies: 0,
    decay,
    cut: 0,
    load: 0,
    mood,
  }
}

const BASES = [116, 134, 152, 170] as const
const LAWN_BOTTOM = 177
const JITTER = [0.9, 1, 0.78, 1.06, 0.84, 0.98, 0.74, 1.04, 0.88, 0.8, 1.02, 0.86] as const
const LEAN = [-0.2, 0.14, 0.24, -0.12, 0.18, -0.22, 0.08, 0.22, -0.16, 0.12, -0.06, 0.2] as const

const HEAD_CEILING = 28
const FLAG_CLEARANCE = 60
const SKIN = '#ffcfa8'
const NOSE = '#f2a27c'
const HAT = C.lilac
const HAT_DARK = C.lilacDark
const TYRE = '#20243b'
const STEM = '#3f9a55'
const SLUG = '#e8cfa0'

function pick(list: readonly number[], index: number): number {
  return list[index % list.length] ?? 0
}

function edgeLeft(y: number): number {
  return round(36 - ((y - 116) / 61) * 26)
}

function edgeRight(y: number): number {
  return round(200 - edgeLeft(y))
}

function bladePath(
  left: number,
  right: number,
  base: number,
  bottom: number,
  height: number,
  width: number,
  phase: number,
): string {
  const count = Math.max(1, Math.round((right - left) / width))
  const step = (right - left) / count
  const parts: string[] = [`M${round(left)} ${base}`]
  for (let i = 0; i < count; i += 1) {
    const x = left + i * step
    const h = height * pick(JITTER, i + phase)
    const tip = x + step / 2 + pick(LEAN, i + phase) * Math.min(h, 44) * 0.55
    const shoulder = base - h * 0.5
    const valley = base - Math.min(2.5, h * 0.25)
    parts.push(
      `Q${round(x + step * 0.1)} ${round(shoulder)} ${round(tip)} ${round(base - h)}`,
      `Q${round(x + step * 0.9)} ${round(shoulder)} ${round(x + step)} ${round(i === count - 1 ? base : valley)}`,
    )
  }
  parts.push(`L${round(right + (right > 100 ? 4 : 0))} ${bottom}`)
  parts.push(`L${round(left - (left < 100 ? 4 : 0))} ${bottom}Z`)
  return parts.join('')
}

interface Greens {
  back: readonly string[]
  front: readonly string[]
}

function greens(state: SceneView['state'], decay: number): Greens {
  const dim = state === 'resting' ? 0.34 : 0
  const finish = (color: string): string => mix(mix(color, C.musty, decay * 0.55), '#232a4d', dim)
  return {
    back: [0.34, 0.24, 0.14, 0.05].map((t) => finish(mix(C.leafDark, INK, t))),
    front: [0.62, 0.42, 0.2, 0].map((t) => finish(mix(C.leaf, C.leafDark, t))),
  }
}

function grassRow(index: number, height: number, colors: Greens, left: number, right: number): Art {
  const base = BASES[index] ?? 170
  const bottom = BASES[index + 1] ?? LAWN_BOTTOM
  const tall = height > 22
  const width = tall ? 14 : 11
  return part(
    'grass-row',
    [
      svg`<path d=${bladePath(left, right, base, bottom, height, width, index * 3)} fill=${colors.back[index]} />`,
      svg`<path d=${bladePath(left + 5, right - 3, base, bottom, height * 0.66, width, index * 5 + 2)} fill=${colors.front[index]} />`,
    ],
    index,
  )
}

function soil(colors: Greens): Art {
  const lip = Array.from({ length: 14 }, () => 'q6.5 9.5 13 0').join('')
  return part('turf', [
    svg`<path d="M12 174H188V178Q188 186 180 186H20Q12 186 12 178Z" fill=${C.soil} />`,
    svg`<path d="M26 182h7M60 180h5M112 182h9M150 180h6" stroke=${C.soilWet} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<path d=${`M9 175${lip}V172H9Z`} fill=${colors.front[3]} />`,
  ])
}

function dandelionHead(clock: boolean): Art {
  if (clock) {
    const puffs = Array.from({ length: 10 }, (_, i) => {
      const a = (i * Math.PI) / 5
      return svg`<circle cx=${round(Math.cos(a) * 10)} cy=${round(Math.sin(a) * 10)} r="2.4" fill="#ffffff" />`
    })
    return [
      svg`<circle r="10.5" fill=${C.cream} opacity=".55" />`,
      puffs,
      svg`<circle r="3" fill=${C.creamDark} />`,
    ]
  }
  const petals = Array.from({ length: 10 }, (_, i) => {
    return svg`<ellipse cy="-7.4" rx="3.4" ry="5.2" transform=${`rotate(${i * 36})`} fill=${C.sun} />`
  })
  return [petals, svg`<circle r="5.6" fill=${C.sunDark} />`]
}

const DANDELIONS = [
  [2, 54, 10],
  [1, 166, 13],
  [3, 182, 12],
  [0, 128, 14],
  [2, 176, 8],
  [0, 62, 11],
] as const

function dandelion(x: number, base: number, top: number, clock: boolean, delay: number): Art {
  const height = base - top
  const stalk = svg`<path d=${`M0 0Q${delay % 2 ? 4 : -4} ${round(-height * 0.5)} 0 ${round(-height)}`} fill="none" stroke=${STEM} stroke-width="3.4" stroke-linecap="round" />`
  return part(
    clock ? 'dandelion-clock' : 'dandelion',
    at(x, base, motion('sway', [stalk, at(0, -height, dandelionHead(clock))], delay)),
  )
}

const WEEDS = [
  [3, 158, 44],
  [2, 74, 30],
] as const

function thistle(x: number, base: number, height: number, delay: number): Art {
  const leaf = 'M0 0C4-7 11-5 13-11C15-6 20-7 23-11C24-3 16 3 8 2C5 2 2 1 0 0Z'
  const leaves = [0.28, 0.5, 0.72].map((share, i) => {
    const side = i % 2 ? -1 : 1
    return at(
      0,
      round(-height * share),
      svg`<g transform=${`scale(${side} 1)`}><path d=${leaf} fill=${C.mintDark} /></g>`,
      side * -8,
      0.9,
    )
  })
  return part(
    'weed',
    at(
      x,
      base,
      motion(
        'sway',
        [
          svg`<path d=${`M0 0V${-height}`} stroke=${C.leafDark} stroke-width="5" stroke-linecap="round" />`,
          leaves,
          at(0, -height, [
            svg`<path d="M-9-6L-11-16L-6-12L-4-20L0-13L4-20L6-12L11-16L9-6Z" fill=${C.pink} stroke=${C.pink} stroke-width="2" stroke-linejoin="round" />`,
            svg`<ellipse cy="-1" rx="10" ry="9" fill=${C.leafDark} />`,
            svg`<path d="M-6-3l4 4m0-4l4 4m0-4l4 4" fill="none" stroke=${C.mint} stroke-width="1.6" stroke-linecap="round" />`,
          ]),
        ],
        delay,
      ),
    ),
  )
}

function plantsOn(row: number, parts: LawnParts, maxX: number): Art {
  const height = parts.heights[row] ?? 0
  const base = BASES[row] ?? 170
  const top = base - height
  const clear = parts.gnome === 'hat' ? FLAG_CLEARANCE : 0
  const flowers = DANDELIONS.flatMap<Art>(([r, x, extra], i) =>
    r === row && i < parts.dandelions * 2 && x < maxX && x > clear
      ? [
          dandelion(
            x,
            base + 4,
            Math.max(HEAD_CEILING, top - extra),
            i < parts.clocks * 2,
            (i % 4) + 1,
          ),
        ]
      : [],
  )
  const weeds = WEEDS.flatMap<Art>(([r, x, extra], i) =>
    r === row && i < parts.weeds && x < maxX ? [thistle(x, base + 4, height + extra, i + 2)] : [],
  )
  return [weeds, flowers]
}

function seeds(count: number): Art {
  const spots = [
    [150, 24, 1],
    [104, 26, 2],
  ] as const
  return part(
    'seeds',
    spots
      .slice(0, count)
      .map(([x, y, d]) =>
        at(
          x,
          y,
          motion(
            'drift',
            svg`<path d="M0 6V-2M-4-5L0-2L4-5M0-6V-2" fill="none" stroke=${C.cream} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />`,
            d,
          ),
        ),
      ),
  )
}

function gnomeBody(look: GnomeLook): Art {
  const happy = look === 'cheer'
  const hat: Art = [
    svg`<path d="M-16-48C-11-72 0-84 11-90C9-74 13-60 16-48C6-44-6-44-16-48Z" fill=${HAT} />`,
    svg`<path d="M-15-48C-6-44 6-44 15-48" fill="none" stroke=${HAT_DARK} stroke-width="4.4" stroke-linecap="round" />`,
  ]
  if (look === 'hat') return hat
  return [
    svg`<ellipse cx="-7" cy="-1" rx="7" ry="4" fill=${C.fly} /><ellipse cx="7" cy="-1" rx="7" ry="4" fill=${C.fly} />`,
    svg`<path d="M-14-2V-18Q-14-29 0-29Q14-29 14-18V-2Q14 0 12 0H-12Q-14 0-14-2Z" fill=${C.sky} />`,
    svg`<rect x="-14.5" y="-11" width="29" height="4.5" fill=${C.skyDark} />`,
    svg`<path d="M-13-38Q-16-14 0-8Q16-14 13-38Z" fill=${C.cream} />`,
    svg`<ellipse cy="-41" rx="12" ry="9" fill=${SKIN} />`,
    happy
      ? svg`<path d="M-9.5-43q2.5-3.4 5 0M4.5-43q2.5-3.4 5 0" fill="none" stroke=${INK} stroke-width="2.2" stroke-linecap="round" />`
      : svg`<circle cx="-6.5" cy="-43" r="2.2" fill=${INK} /><circle cx="6.5" cy="-43" r="2.2" fill=${INK} />`,
    svg`<circle cy="-37" r="4.6" fill=${NOSE} />`,
    hat,
    when(happy, () => [
      svg`<path d="M-14-22L-23-34M14-22L23-34" stroke=${C.sky} stroke-width="6" stroke-linecap="round" />`,
      svg`<circle cx="-24" cy="-36" r="4" fill=${SKIN} /><circle cx="24" cy="-36" r="4" fill=${SKIN} />`,
    ]),
  ]
}

function whiteFlag(): Art {
  return part('sos-flag', [
    svg`<path d="M0 0L5-40" stroke=${C.wicker} stroke-width="3" stroke-linecap="round" />`,
    at(
      5,
      -40,
      motion(
        'wobble',
        svg`<path d="M0 0H17Q15 5 18 11H1Z" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />`,
      ),
    ),
  ])
}

function gnome(look: GnomeLook, x: number, base = 148): Art {
  if (look === 'gone') return []
  const y = look === 'hat' ? 162 : base
  return part('gnome', [
    at(x, y, gnomeBody(look), 0, 0.78),
    when(look === 'hat', () => at(x + 8, y - 46, whiteFlag())),
  ])
}

function wheel(x: number, y: number, r: number, spinning: boolean, accent: string): Art {
  const hub = [0, 120, 240].map((a) => {
    const rad = (a * Math.PI) / 180
    return svg`<circle cx=${round(Math.cos(rad) * r * 0.32)} cy=${round(Math.sin(rad) * r * 0.32)} r=${round(r * 0.13)} fill=${shadeOf(accent, 0.3)} />`
  })
  return at(x, y, [
    svg`<circle r=${r} fill=${TYRE} />`,
    svg`<circle r=${round(r * 0.62)} fill=${C.metal} />`,
    spinning ? motion('spin', hub) : hub,
  ])
}

function grassBag(load: number): Art {
  if (load >= 1) {
    return part('grass-bag', [
      svg`<path d="M49-86L66-62" stroke=${C.creamDark} stroke-width="6" stroke-linecap="round" />`,
      at(
        78,
        -60,
        Array.from({ length: 9 }, (_, i) => {
          const x = -32 + i * 7
          const up = 26 + (i % 3) * 7 - Math.abs(i - 4) * 3
          return svg`<path d=${`M${x} 8Q${x + 1} ${8 - up * 0.6} ${x + (i % 2 ? 6 : -3)} ${8 - up}Q${x + 8} ${8 - up * 0.5} ${x + 8} 8Z`} fill=${i % 2 ? C.leaf : C.leafDark} />`
        }),
      ),
      svg`<path d="M50-62C54-80 104-82 110-58Z" fill=${C.leaf} />`,
      svg`<path d="M42-56C42-64 56-64 72-64C92-64 112-60 114-40C116-14 104-3 76-3C50-3 40-14 40-34Z" fill=${C.cream} />`,
      svg`<path d="M46-54C60-60 92-60 108-50" fill="none" stroke=${C.creamDark} stroke-width="5" stroke-linecap="round" />`,
      svg`<path d="M52-34C60-22 58-14 56-8M78-40C84-26 84-14 80-6M100-36C104-26 102-14 96-8" fill="none" stroke=${C.creamDark} stroke-width="3.4" stroke-linecap="round" />`,
    ])
  }
  const belly = round(70 + load * 14)
  const level = round(-22 - load * 18)
  return part('grass-bag', [
    svg`<path d=${`M44-52C52-60 ${belly - 4}-60 ${belly + 2}-50C${belly + 12}-34 ${belly + 10}-6 ${belly - 4}-5H52C42-6 38-36 44-52Z`} fill=${C.cream} />`,
    svg`<path d=${`M41 ${level}C52 ${level - 5} ${belly} ${level - 5} ${belly + 8} ${level}C${belly + 10}-14 ${belly + 6}-6 ${belly - 4}-6H52C44-6 40-18 41 ${level}Z`} fill=${C.leaf} />`,
    svg`<path d=${`M46-50C54-55 ${belly - 6}-55 ${belly}-49`} fill="none" stroke=${C.creamDark} stroke-width="4.4" stroke-linecap="round" />`,
    svg`<path d=${`M54-16q5-5 9 0M${belly - 12}-18q4-5 8 0`} fill="none" stroke=${C.leafDark} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function mower(parts: LawnParts, accent: string, spinning: boolean): Art {
  const shade = shadeOf(accent, 0.26)
  const tint = tintOf(accent, 0.42)
  const ink = mix(accent, INK, 0.85)
  return part('mower', [
    svg`<path d="M34-44L64-120" stroke=${C.metalDark} stroke-width="8" stroke-linecap="round" />`,
    svg`<path d="M56-98Q72-100 78-120" fill="none" stroke=${C.metalMid} stroke-width="4" stroke-linecap="round" />`,
    svg`<path d="M63-120L81-126" stroke=${TYRE} stroke-width="11" stroke-linecap="round" />`,
    svg`<path d="M12-74Q34-88 54-94" fill="none" stroke=${C.creamDark} stroke-width="2.4" stroke-linecap="round" />`,
    when(parts.load > 0, () => grassBag(parts.load)),
    svg`<rect x="-22" y="-84" width="34" height="22" rx="5" fill=${C.metalMid} />`,
    svg`<path d="M-22-74h34" stroke=${C.metalDark} stroke-width="2.6" />`,
    svg`<rect x="-28" y="-90" width="46" height="10" rx="5" fill=${C.metal} />`,
    svg`<rect x="-12" y="-97" width="14" height="9" rx="3" fill=${tint} />`,
    svg`<path d="M-50-20C-52-38-34-68 2-68C34-68 50-46 52-20C52-14 48-11 44-11H-44C-48-11-50-14-50-20Z" fill=${accent} />`,
    svg`<path d="M-51-24H52C52-14 48-11 44-11H-44C-48-11-51-14-51-24Z" fill=${shade} />`,
    svg`<path d="M-36-44C-30-55-18-61-6-62" fill="none" stroke=${tint} stroke-width="5.4" stroke-linecap="round" />`,
    svg`<circle cx="-44" cy="-31" r="5" fill=${C.spark} />`,
    face(1, -41, parts.mood, ink, 1.18),
    wheel(32, -14, 15, spinning, accent),
    wheel(-33, -11, 11, spinning, accent),
    when(parts.vines, () =>
      part('vines', [
        svg`<path d="M38-54C50-58 44-68 54-72C62-76 52-88 62-92" fill="none" stroke=${C.leafDark} stroke-width="4" stroke-linecap="round" />`,
        at(47, -62, svg`<ellipse rx="6" ry="3.6" transform="rotate(-30)" fill=${C.mint} />`),
        at(60, -80, svg`<ellipse rx="6" ry="3.6" transform="rotate(24)" fill=${C.mint} />`),
      ]),
    ),
    when(parts.climbers >= 1, () => at(-8, -92, snail(1, 2), 0, 0.72)),
    when(parts.climbers >= 2, () => at(30, -58, snail(2, 3), 40, 0.62)),
  ])
}

function snail(shellIndex: number, delay: number): Art {
  const shells = [C.wicker, C.terracotta, C.lilac, C.sun] as const
  const shell = shells[shellIndex % shells.length] ?? C.wicker
  return part(
    'snail',
    motion(
      'bob',
      [
        svg`<path d="M-19 0Q-21-5-16-6H8Q15-5 19 0Z" fill=${SLUG} />`,
        svg`<path d="M-14-4V-13" stroke=${SLUG} stroke-width="7" stroke-linecap="round" />`,
        svg`<path d="M-15-15L-18-23M-12-15L-10-23" stroke=${SLUG} stroke-width="2.2" stroke-linecap="round" />`,
        svg`<circle cx="-18" cy="-24" r="2.2" fill=${INK} /><circle cx="-10" cy="-24" r="2.2" fill=${INK} />`,
        svg`<circle cx="2" cy="-12" r="11" fill=${shell} />`,
        svg`<path d="M9-14A7.6 7.6 0 1 0 2-5A5 5 0 1 0-1-14" fill="none" stroke=${shadeOf(shell, 0.34)} stroke-width="2.6" stroke-linecap="round" />`,
      ],
      delay,
    ),
  )
}

function snailArmy(count: number): Art {
  const spots = [
    [172, 0.86],
    [28, 0.86],
    [143, 0.84],
    [57, 0.84],
    [114, 0.82],
    [86, 0.82],
  ] as const
  return spots.slice(0, count * 2).map(([x, s], i) => at(x, 185, snail(i, (i % 5) + 1), 0, s))
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return part(
    'zed',
    at(
      x,
      y,
      motion(
        'drift',
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function moon(): Art {
  return part('moon', [
    at(46, 48, [svg`<path d="M6-20A21 21 0 1 0 20 12A17 17 0 0 1 6-20Z" fill=${C.spark} />`], -8),
    svg`<circle cx="82" cy="30" r="2.4" fill=${C.spark} /><circle cx="24" cy="86" r="2" fill=${C.spark} /><circle cx="118" cy="50" r="1.8" fill=${C.spark} />`,
  ])
}

function dream(): Art {
  const bands = [0, 1, 2, 3].map(
    (i) =>
      svg`<rect x="-17" y=${-13 + i * 6.5} width="34" height="6.5" fill=${i % 2 ? C.leafDark : C.leaf} />`,
  )
  return part('dream', [
    svg`<circle cx="72" cy="84" r="4" fill=${C.cream} /><circle cx="66" cy="72" r="6" fill=${C.cream} />`,
    at(46, 42, motion('pulse', [svg`<circle r="27" fill=${C.cream} />`, bands])),
  ])
}

function flatBands(colors: Greens, count: number): Art {
  const top = 112
  const span = LAWN_BOTTOM - top
  const ys = Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count
    return round(top + span * (t * 0.62 + t * t * 0.38))
  })
  return part(
    'stripes',
    ys.slice(0, -1).map((y, i) => {
      const next = ys[i + 1] ?? LAWN_BOTTOM
      const head =
        i === 0
          ? `M${edgeLeft(y + 7)} ${y + 7}Q${edgeLeft(y)} ${y} ${edgeLeft(y) + 8} ${y}H${edgeRight(y) - 8}Q${edgeRight(y)} ${y} ${edgeRight(y + 7)} ${y + 7}`
          : `M${edgeLeft(y)} ${y}H${edgeRight(y)}`
      const color = i % 2 ? colors.back[3] : colors.front[3]
      return svg`<path d=${`${head}L${edgeRight(next)} ${next}H${edgeLeft(next)}Z`} fill=${color} />`
    }),
  )
}

function brightGreens(): Greens {
  const light = mix(C.leaf, '#ffffff', 0.18)
  return {
    back: Array.from({ length: 4 }, () => C.leafDark),
    front: Array.from({ length: 4 }, () => light),
  }
}

function clippings(x: number): Art {
  const spots = [
    [66, -46, -20, 1, 'fall'],
    [52, -120, 30, 2, 'rise'],
    [24, -132, 60, 3, 'fall'],
    [38, -106, -50, 4, 'rise'],
    [44, -148, 12, 5, 'rise'],
    [72, -128, 74, 1, 'fall'],
    [98, -30, -66, 3, 'rise'],
  ] as const
  return part(
    'clippings',
    spots.map(([dx, dy, r, d, name], i) =>
      at(
        Math.min(184, x + dx),
        172 + dy,
        motion(
          name,
          at(
            0,
            0,
            svg`<path d="M-1-6Q4-1 1 6" fill="none" stroke=${i % 2 ? C.leaf : C.mint} stroke-width="4.4" stroke-linecap="round" />`,
            r,
          ),
          d,
        ),
      ),
    ),
  )
}

function exhaust(x: number): Art {
  return part('exhaust', [
    at(x - 22, 72, motion('rise', svg`<circle r="7" fill=${C.metal} opacity=".55" />`, 1)),
    at(x - 36, 54, motion('rise', svg`<circle r="5" fill=${C.metal} opacity=".45" />`, 3)),
  ])
}

function shakes(x: number): Art {
  const lines = [
    [x - 52, 124, 'M0 0q-6 9 0 18'],
    [x - 60, 140, 'M0 0q-6 7 0 14'],
  ] as const
  return part(
    'shake',
    lines.map(([sx, sy, d], i) =>
      at(
        sx,
        sy,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,
          i + 1,
        ),
      ),
    ),
  )
}

function neatStripe(cut: number, colors: Greens): Art {
  const light = mix(C.leaf, '#ffffff', 0.34)
  const seam = mix(C.leaf, '#ffffff', 0.12)
  const top = 134
  const edges = [top, 143, 154, 166, LAWN_BOTTOM]
  return part('neat-stripe', [
    edges.slice(0, -1).map((y, i) => {
      const next = edges[i + 1] ?? LAWN_BOTTOM
      return svg`<path d=${`M${cut} ${y}H${edgeRight(y)}L${edgeRight(next)} ${next}H${cut}Z`} fill=${i % 2 ? seam : light} />`
    }),
    svg`<path d=${`M${cut} ${top}H${edgeRight(top)}`} stroke=${colors.front[2]} stroke-width="1.5" />`,
  ])
}

function rowsView(parts: LawnParts, accent: string, colors: Greens): Art {
  const height = (i: number): number => parts.heights[i] ?? 0
  const row = (i: number): Art => [
    plantsOn(i, parts, 999),
    grassRow(i, height(i), colors, edgeLeft(BASES[i] ?? 170), edgeRight(BASES[i] ?? 170)),
  ]
  return [
    row(0),
    row(1),
    gnome(parts.gnome, 29),
    row(2),
    at(98, 172, mower(parts, accent, false)),
    row(3),
    soil(colors),
    snailArmy(parts.snails),
  ]
}

function cuttingView(parts: LawnParts, accent: string, colors: Greens): Art {
  const x = 124 - parts.cut * 18
  const row = (i: number, maxX: number): Art => [
    plantsOn(i, parts, maxX),
    grassRow(
      i,
      parts.heights[i] ?? 0,
      colors,
      edgeLeft(BASES[i] ?? 170),
      i >= 2 ? x + 4 : edgeRight(BASES[i] ?? 170),
    ),
  ]
  return [
    row(0, x),
    gnome(parts.gnome, 168, 128),
    row(1, x),
    neatStripe(x, colors),
    row(2, x),
    row(3, x),
    soil(colors),
    at(x, 172, motion('rumble', at(0, 0, mower(parts, accent, true), 0, 0.9))),
    exhaust(x),
    shakes(x),
    clippings(x),
    snailArmy(parts.snails),
  ]
}

function baggedView(parts: LawnParts, accent: string, colors: Greens): Art {
  const x = 62
  const chevron = part(
    'empty-me',
    at(
      166,
      60,
      motion(
        'bob',
        svg`<path d="M0-15V4M-11-6L0 6L11-6" fill="none" stroke=${C.sun} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
  )
  const flySpots: Array<readonly [number, number]> = [
    [188, 34],
    [112, 52],
  ]
  return [
    flatBands(colors, 6),
    plantsOn(0, parts, 999),
    plantsOn(1, parts, 999),
    soil(colors),
    at(x, 172, mower(parts, accent, false)),
    svg`<g fill=${C.leaf}><path d="M138 178q5-7 9 0ZM166 180q4-6 8 0Z" /></g>`,
    chevron,
    stenchLines(
      (
        [
          [120, 106],
          [184, 116],
          [34, 84],
        ] as const
      ).slice(0, parts.stench),
    ),
    flySpots.slice(0, parts.flies).map(([fx, fy], i) => fly(fx, fy, i)),
    snailArmy(parts.snails),
  ]
}

function butterfly(x: number, y: number): Art {
  const wing = 'M0 0C-6-16-22-20-24-9C-25-1-14 3-4 2C-14 4-18 12-12 15C-6 18-1 9 0 2Z'
  return part(
    'butterfly',
    at(
      x,
      y,
      motion(
        'bob',
        at(
          0,
          0,
          [
            motion(
              'wobble',
              svg`<path d=${wing} fill=${C.pink} /><circle cx="-14" cy="-8" r="3" fill=${C.spark} />`,
            ),
            svg`<g transform="scale(-1 1)"><path d=${wing} fill=${C.pinkDark} /><circle cx="-14" cy="-8" r="3" fill=${C.spark} /></g>`,
            svg`<ellipse rx="2.8" ry="10" fill=${C.fly} />`,
            svg`<path d="M-1-9Q-5-16-8-17M1-9Q5-16 8-17" fill="none" stroke=${C.fly} stroke-width="1.8" stroke-linecap="round" />`,
          ],
          18,
        ),
      ),
    ),
  )
}

function stripedView(parts: LawnParts, accent: string): Art {
  const colors = brightGreens()
  return [
    flatBands(colors, 6),
    gnome(parts.gnome, 34),
    soil(colors),
    at(112, 174, motion('bob', at(0, 0, mower(parts, accent, false), 0, 0.92))),
    butterfly(72, 72),
    sparkle(26, 46, 1.2, 1),
    sparkle(178, 44, 1, 2),
    sparkle(112, 34, 0.8, 3),
    sparkle(182, 118, 0.7, 4),
  ]
}

export function lawn(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = lawnParts(scene)
  const accent = accentOf(scene, C.coral)
  const colors = greens(scene.state, parts.decay)
  const views: Record<LawnView, () => Art> = {
    rows: () => rowsView(parts, accent, colors),
    cutting: () => cuttingView(parts, accent, colors),
    bagged: () => baggedView(parts, accent, colors),
    striped: () => stripedView(parts, accent),
  }
  const resting = scene.state === 'resting'
  return frame('lawn', scene, options, [
    shadow(100, 185, 90),
    when(resting, moon),
    views[parts.view](),
    when(resting, () => [zed(112, 70, 0.72, 1), zed(128, 50, 1, 2), zed(146, 32, 0.62, 3)]),
    when(parts.dream, dream),
    when(parts.clocks > 0, () => seeds(parts.clocks)),
  ])
}
