import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  COLORS as C,
  clamp01,
  drop,
  face,
  fly,
  frame,
  mix,
  motion,
  part,
  reached,
  round,
  shadeOf,
  shadow,
  sparkle,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'
import { bubble } from './laundry.ts'

export type WaterExtra = 'none' | 'moon' | 'jug' | 'glass' | 'party'

export interface WaterParts {
  level: number
  step: number
  capped: boolean
  capDropped: boolean
  extra: WaterExtra
  sun: number
  thought: boolean
  shimmer: number
  cracks: number
  cactus: number
  tumbleweed: boolean
  shades: boolean
  flies: number
  evaporated: number
  mood: Mood
}

export const MAX_THIRST = 4

const LEVELS = [84, 100, 116, 154, 160] as const
const DUE_LEVEL = 165
const POUR_LEVELS = [116, 108, 100, 92] as const
const FULL_LEVEL = 70

const SHIMMER_AT = [0.05, 0.3, 0.55] as const
const CRACK_AT = [0.12, 0.45, 0.75] as const
const CACTUS_AT = [0.25, 0.6] as const
const FLIES_AT = [0.5, 0.85] as const
const TUMBLEWEED_AT = 0.8
const SHADES_AT = 0.7
const SICK_AT = 0.6

const QUIET = {
  capDropped: false,
  thought: false,
  shimmer: 0,
  cracks: 0,
  cactus: 0,
  tumbleweed: false,
  shades: false,
  flies: 0,
  evaporated: 0,
  sun: 0,
} as const

export function waterParts(scene: SceneView): WaterParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...QUIET,
      level: FULL_LEVEL,
      step: 0,
      capped: false,
      extra: 'party',
      mood: 'happy',
    }
  }
  const shimmer = reached(stink, SHIMMER_AT)
  const cracks = reached(stink, CRACK_AT)
  const sick = stink >= SICK_AT
  if (state === 'running') {
    const pour = Math.min(POUR_LEVELS.length - 1, Math.floor(clamp01(scene.progress) * 4))
    return {
      ...QUIET,
      level: POUR_LEVELS[pour] ?? FULL_LEVEL,
      step: pour,
      capped: false,
      extra: 'jug',
      shimmer: Math.min(1, shimmer),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      level: FULL_LEVEL + 8,
      step: 0,
      capped: true,
      extra: 'glass',
      shimmer,
      cracks,
      flies: reached(stink, FLIES_AT),
      evaporated: reached(stink, CRACK_AT),
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const step = due ? MAX_THIRST : Math.min(MAX_THIRST, Math.floor(fill * (MAX_THIRST + 1)))
  const resting = state === 'resting'
  let mood: Mood = resting ? 'sleepy' : step >= 2 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    level: due ? DUE_LEVEL : resting ? LEVELS[0] : (LEVELS[step] ?? DUE_LEVEL),
    step: resting ? 0 : step,
    capped: !due,
    capDropped: due,
    extra: resting ? 'moon' : 'none',
    sun: resting ? 0 : due ? MAX_THIRST + 1 : step + (step > 0 || fill > 0 ? 1 : 0),
    thought: due,
    shimmer,
    cracks: due ? Math.max(1, cracks) : cracks,
    cactus: reached(stink, CACTUS_AT),
    tumbleweed: stink >= TUMBLEWEED_AT,
    shades: stink >= SHADES_AT,
    mood,
  }
}

const NECK = 23
const BODY = 47
const SHOULDER_TOP = 60
const SHOULDER_BOTTOM = 100
const BOTTLE_TOP = 48
const BOTTLE_BOTTOM = 180
const WALL = 6
const CORNER = 22

const RIM = '#f3fbff'
const EMPTY = '#c6e6f7'
const INK_BLUE = '#14406e'
const DUST = '#f4e2b4'
const LEMON = '#ffe27a'
const PITH = '#fff6d6'
const FOAM = '#dff5ff'

interface Tones {
  liquid: string
  dark: string
  foam: string
}

function tonesOf(scene: SceneView): Tones {
  const liquid = accentOf(scene, C.water)
  return liquid === C.water
    ? { liquid, dark: C.waterDark, foam: FOAM }
    : { liquid, dark: shadeOf(liquid), foam: tintOf(liquid, 0.75) }
}

function halfWidth(y: number, inset: number): number {
  const t = clamp01((y - SHOULDER_TOP) / (SHOULDER_BOTTOM - SHOULDER_TOP))
  return NECK + (BODY - NECK) * t * t * (3 - 2 * t) - inset
}

function shapePath(top: number, inset: number, wave: number): string {
  const bottom = BOTTLE_BOTTOM - inset
  const width = halfWidth(top, inset)
  const lowest = halfWidth(BOTTLE_BOTTOM, inset)
  const radius = CORNER - inset
  const shoulder: Array<readonly [number, number]> = []
  for (let y = Math.ceil(top / 3) * 3; y <= SHOULDER_BOTTOM; y += 3) {
    shoulder.push([round(halfWidth(y, inset)), y])
  }
  const down = shoulder.map(([x, y]) => `L${x} ${y}`).join('')
  const up = shoulder
    .toReversed()
    .map(([x, y]) => `L${-x} ${y}`)
    .join('')
  const crest = round(width / 2)
  const edge = round(width)
  const head =
    wave === 0
      ? `M${-edge} ${top}L${edge} ${top}`
      : `M${-edge} ${top}Q${-crest} ${top - wave} 0 ${top}T${edge} ${top}`
  return [
    head,
    down,
    `L${lowest} ${bottom - radius}Q${lowest} ${bottom} ${lowest - radius} ${bottom}`,
    `L${radius - lowest} ${bottom}Q${-lowest} ${bottom} ${-lowest} ${bottom - radius}`,
    up,
    'Z',
  ].join('')
}

function surface(level: number, color: string): Art {
  const width = Math.max(4, halfWidth(level, WALL) - 1)
  const crest = round(width / 2)
  const edge = round(width)
  return svg`<path d=${`M${-edge} ${level + 1}Q${-crest} ${level - 3} 0 ${level + 1}T${edge} ${level + 1}`} fill="none" stroke=${color} stroke-width="5" stroke-linecap="round" />`
}

function tideMarks(level: number, color: string): Art {
  return part(
    'tide-marks',
    LEVELS.filter((mark) => mark < level - 6).map((mark) => {
      const edge = round(halfWidth(mark, WALL) - 5)
      return svg`<path d=${`M${-edge} ${mark}H${edge}`} stroke=${color} stroke-width="2.4" stroke-linecap="round" opacity=".32" />`
    }),
  )
}

function cap(): Art {
  return [
    svg`<rect x="-28" y="26" width="56" height="30" rx="8" fill=${C.coral} />`,
    svg`<rect x="-28" y="46" width="56" height="10" rx="5" fill=${C.coralDark} />`,
    svg`<path d="M-17 33v9M-6 33v9M6 33v9M17 33v9" stroke=${C.coralDark} stroke-width="3.2" stroke-linecap="round" />`,
  ]
}

function droppedCap(): Art {
  return part(
    'cap',
    at(
      29,
      170,
      [
        svg`<rect x="-16" y="-10" width="32" height="20" rx="6" fill=${C.coral} />`,
        svg`<rect x="-16" y="3" width="32" height="7" rx="3.5" fill=${C.coralDark} />`,
      ],
      -24,
    ),
  )
}

const GLASS_CRACKS = [
  'M31 104l-8 9 6 6-9 11M23 113l9 3',
  'M-34 112l9 6-7 9 8 7',
  'M-14 76l6 7-6 5 5 8',
] as const

const FLOOR_CRACKS = [
  'M38 186l11-6 9 3 8-7M49 180l-3-6',
  'M136 187l10-7 11 3 9-7M157 183l4 5',
  'M72 188l6-4 11 2M112 188l8-4 8 2',
] as const

function bottle(parts: WaterParts, tint: number, tones: Tones): Art {
  const liquid = mix(tones.liquid, '#b9c98a', tint * 0.55)
  const top = parts.level > 140 ? tones.dark : tintOf(tones.liquid, 0.42)
  const glassFill = mix(EMPTY, DUST, Math.max(tint, parts.step / MAX_THIRST) * 0.8)
  const mark = mix(tones.dark, '#a9894f', parts.step / MAX_THIRST)
  return [
    svg`<path d=${shapePath(BOTTLE_TOP, 0, 0)} fill=${RIM} data-part="bottle" />`,
    svg`<path d=${shapePath(BOTTLE_TOP, WALL, 0)} fill=${glassFill} />`,
    tideMarks(parts.level, mark),
    part('water', [
      svg`<path d=${shapePath(parts.level, WALL, 3)} fill=${liquid} />`,
      parts.extra === 'jug' ? motion('bob', surface(parts.level, top)) : surface(parts.level, top),
    ]),
  ]
}

function bottleLip(): Art {
  return svg`<rect x="-28" y="44" width="56" height="13" rx="6.5" fill=${RIM} />`
}

function shine(): Art {
  return svg`<path d="M-33 112V150" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".62" /><path d="M-33 160v2" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".62" />`
}

function crackArt(count: number, color: string): Art {
  return part(
    'cracks',
    GLASS_CRACKS.slice(0, count).map(
      (d) =>
        svg`<path d=${d} fill="none" stroke=${color} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
  )
}

function floorCracks(count: number): Art {
  return part(
    'floor-cracks',
    FLOOR_CRACKS.slice(0, count).map(
      (d) =>
        svg`<path d=${d} fill="none" stroke="#0c0f1e" stroke-opacity=".5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
  )
}

function iceCube(
  x: number,
  y: number,
  size: number,
  rotate: number,
  delay: number,
  liquid: string,
): Art {
  const half = size / 2
  return part(
    'ice',
    at(
      x,
      y,
      motion(
        'bob',
        at(
          0,
          0,
          [
            svg`<rect x=${-half} y=${-half} width=${size} height=${size} rx="5" fill="#effaff" />`,
            svg`<path d=${`M${-half + 5} ${half - 6}V${-half + 5}H${half - 6}`} fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
            svg`<rect x=${-half + 9} y=${-half + 9} width=${size - 13} height=${size - 13} rx="3" fill=${tintOf(liquid, 0.55)} />`,
          ],
          rotate,
        ),
        delay,
      ),
    ),
  )
}

function lemonSlice(x: number, y: number, r: number, rotate: number): Art {
  const segments = Array.from({ length: 8 }, (_, i) => (i * 360) / 8)
  const inner = round(r * 0.78)
  const wide = round(r * 0.26)
  return part(
    'lemon',
    at(
      x,
      y,
      [
        svg`<circle r=${r} fill=${C.sun} />`,
        svg`<circle r=${round(r * 0.86)} fill=${PITH} />`,
        segments.map(
          (a) =>
            svg`<path d=${`M0-${round(r * 0.14)}L${-wide}-${round(inner * 0.76)}Q0-${inner + 2} ${wide}-${round(inner * 0.76)}Z`} transform=${`rotate(${a})`} fill=${LEMON} stroke=${LEMON} stroke-width="1.5" stroke-linejoin="round" />`,
        ),
      ],
      rotate,
    ),
  )
}

function mintSprig(): Art {
  const leaf = 'M0 0C-9-5-10-17 0-26C10-17 9-5 0 0Z'
  return part('mint', [
    at(-10, 50, svg`<path d=${leaf} fill=${C.leafDark} />`, -34, 0.95),
    at(-2, 50, svg`<path d=${leaf} fill=${C.leaf} />`, 6, 1.1),
    at(
      -2,
      47,
      svg`<path d="M0 0V-18" stroke=${C.leafDark} stroke-width="2" stroke-linecap="round" />`,
      6,
    ),
  ])
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'drift',
      at(
        0,
        0,
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        0,
        size,
      ),
      delay,
    ),
  )
}

function zeds(): Art {
  return part('zzz', [zed(144, 58, 0.72, 1), zed(160, 38, 1, 2), zed(178, 24, 0.62, 3)])
}

function moon(): Art {
  return part(
    'moon',
    at(
      42,
      46,
      [
        svg`<path d="M6-20A21 21 0 1 0 20 12A17 17 0 0 1 6-20Z" fill=${C.spark} />`,
        svg`<circle cx="30" cy="-18" r="2.4" fill=${C.spark} /><circle cx="-24" cy="-24" r="1.8" fill=${C.spark} />`,
      ],
      -8,
    ),
  )
}

function sun(step: number, shades: boolean): Art {
  const r = 10 + step * 2.2
  const inner = r + 5
  const outer = inner + 3 + step * 1.2
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    const x1 = round(Math.cos(a) * inner)
    const y1 = round(Math.sin(a) * inner)
    const x2 = round(Math.cos(a) * outer)
    const y2 = round(Math.sin(a) * outer)
    return svg`<path d=${`M${x1} ${y1}L${x2} ${y2}`} stroke=${C.sun} stroke-width="5" stroke-linecap="round" />`
  })
  const glasses = when(shades, () =>
    part('shades', [
      svg`<path d="M-19-4H19" stroke=${C.fly} stroke-width="3" stroke-linecap="round" />`,
      svg`<path d="M-17-4h14v5a6 6 0 0 1-14 0ZM3-4h14v5a6 6 0 0 1-14 0Z" fill=${C.fly} />`,
      svg`<path d="M-5 11q5 4 10 0" fill="none" stroke=${C.sunDark} stroke-width="3" stroke-linecap="round" />`,
    ]),
  )
  return part(
    'sun',
    at(152, 50, [motion('throb', rays), svg`<circle r=${round(r)} fill=${C.sun} />`, glasses]),
  )
}

function warmth(step: number): Art {
  return when(step > 0, () =>
    part(
      'warmth',
      svg`<circle cx="100" cy="98" r="86" fill=${C.terracotta} opacity=${round(step * 0.045)} />`,
    ),
  )
}

function shimmerLines(count: number, spots: ReadonlyArray<readonly [number, number]>): Art {
  const wavy = 'M0 0c-7-6 7-11 0-17c-7-6 7-11 0-17'
  return spots
    .slice(0, count)
    .map(([x, y], i) =>
      part(
        'shimmer',
        at(
          x,
          y,
          motion(
            'waft',
            svg`<path d=${wavy} fill="none" stroke=${mix(C.sun, '#ffffff', 0.2)} stroke-width="4.5" stroke-linecap="round" opacity=".85" />`,
            i + 1,
          ),
        ),
        i,
      ),
    )
}

function thought(tones: Tones): Art {
  return part('thirst', [
    svg`<circle cx="50" cy="93" r="3.5" fill=${C.cream} /><circle cx="47" cy="79" r="6" fill=${C.cream} />`,
    at(
      40,
      44,
      motion('pulse', [svg`<circle r="25" fill=${C.cream} />`, drop(0, 1, tones.dark, 1.8)]),
    ),
  ])
}

function sweat(tones: Tones): Art {
  return part('sweat', at(157, 100, motion('drip', drop(0, 0, tones.liquid, 0.95), 2)))
}

function cactus(stage: number): Art {
  const skin = stage >= 2 ? '#9a9a55' : '#6fb56a'
  const dark = stage >= 2 ? '#7b7c41' : '#4c8f52'
  const body = stage >= 2 ? 'M0-8C0-30 5-36 12-33C19-30 19-22 19-15' : 'M0-8C0-26 2-38 12-40'
  const arm = stage >= 2 ? 'M3-22C-6-20-11-14-12-6' : 'M1-20C-8-20-12-26-12-32'
  const spines =
    stage >= 2 ? 'M2-20l-5-2M8-33l-3-5M20-33l4-4M26-20l5-1' : 'M-1-18l5 0M3-33l-5-3M12-40l3-5'
  return part('cactus', [
    svg`<path d=${arm} fill="none" stroke=${dark} stroke-width="7.5" stroke-linecap="round" />`,
    svg`<path d=${body} fill="none" stroke=${skin} stroke-width="11" stroke-linecap="round" />`,
    svg`<path d=${spines} fill="none" stroke=${C.cream} stroke-width="1.8" stroke-linecap="round" />`,
    svg`<path d="M-13-6H13L10 11Q9.5 14 6 14H-6Q-9.5 14-10 11Z" fill=${C.terracotta} />`,
    svg`<rect x="-16" y="-10" width="32" height="8" rx="4" fill=${C.terracottaDark} />`,
  ])
}

function tumbleweed(): Art {
  return part(
    'tumbleweed',
    at(
      34,
      160,
      motion('wobble', [
        svg`<circle r="17" fill="#8a6b3f" opacity=".28" />`,
        svg`<path d="M-15-4C-6-16 8-16 15-5M-14 7C-7-3 8-4 14 8M-8 14C-13 2-8-11 1-16M8 14C14 3 10-10 0-16M-16 2C-6 8 7 9 16 1" fill="none" stroke="#b08a52" stroke-width="2.8" stroke-linecap="round" />`,
      ]),
    ),
  )
}

function jug(): Art {
  return part('jug', [
    at(
      160,
      38,
      [
        svg`<path d="M24-14a15 15 0 0 1 0 28" fill="none" stroke=${C.lilacDark} stroke-width="7" stroke-linecap="round" />`,
        svg`<path d="M-24-22H24L27 20Q27 26 21 26H-21Q-27 26-27 20L-26-5L-40-20Q-34-24-24-22Z" fill=${C.lilac} />`,
        svg`<path d="M-16 8H18" stroke=${C.lilacDark} stroke-width="3.4" stroke-linecap="round" />`,
      ],
      -26,
      0.82,
    ),
  ])
}

function stream(level: number, tones: Tones): Art {
  const d = `M122 37C108 38 100 46 100 60V${level}`
  return part('stream', [
    svg`<path d=${d} fill="none" stroke=${tones.liquid} stroke-width="12" stroke-linecap="round" />`,
    motion(
      'flicker',
      svg`<path d=${d} fill="none" stroke=${tones.foam} stroke-width="3.6" stroke-linecap="round" stroke-dasharray="9 13" />`,
    ),
  ])
}

function splashes(level: number, tones: Tones): Art {
  const spots = [
    [-26, level - 8, 0.8, 1],
    [24, level - 11, 0.9, 2],
    [-12, level - 14, 0.62, 3],
    [14, level - 6, 0.58, 4],
  ] as const
  return part(
    'splash',
    spots.map(([x, y, s, d]) => at(100 + x, y, motion('drip', drop(0, 0, tones.foam, s), d))),
  )
}

function glassEdge(y: number): number {
  return round(-26 + (y - 104) * 0.09)
}

function glass(parts: WaterParts, tones: Tones): Art {
  const level = 116 + parts.evaporated * 9
  const liquid = mix(tones.liquid, '#b9c98a', parts.evaporated / 3)
  const stale = parts.evaporated >= 2
  return part(
    'glass',
    at(148, 0, [
      shadow(0, 183, 28, 0.24),
      svg`<path d="M4 150L20 86L34 80" fill="none" stroke=${C.coral} stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />`,
      svg`<path d="M4 150L20 86L34 80" fill="none" stroke=${C.cream} stroke-width="6.5" stroke-linejoin="round" stroke-dasharray="7 9" />`,
      svg`<rect x="-30" y="99" width="60" height="6" rx="3" fill=${RIM} />`,
      svg`<path d="M-27 102H27L21 174Q20.5 180 15 180H-15Q-20.5 180-21 174Z" fill=${RIM} opacity=".42" />`,
      svg`<path d=${`M${glassEdge(level)} ${level}H${-glassEdge(level)}L${-glassEdge(176)} 172Q${-glassEdge(176) - 0.5} 176 ${-glassEdge(176) - 5} 176H${glassEdge(176) + 5}Q${glassEdge(176) + 0.5} 176 ${glassEdge(176)} 172Z`} fill=${liquid} />`,
      svg`<path d=${`M${glassEdge(level) + 1.5} ${level + 1}H${-glassEdge(level) - 1.5}`} stroke=${mix(liquid, '#ffffff', 0.5)} stroke-width="4.5" stroke-linecap="round" />`,
      face(0, 148, stale ? 'worried' : 'pleading', INK_BLUE, 0.78),
      svg`<path d="M-20 112L-16.5 150" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".6" />`,
    ]),
  )
}

function chevron(): Art {
  return part(
    'drink-me',
    at(
      138,
      80,
      motion(
        'bob',
        svg`<path d="M0-15V4M-11-6L0 6L11-6" fill="none" stroke=${C.sun} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
  )
}

function bottleBody(parts: WaterParts, tint: number, tones: Tones): Art {
  const party = parts.extra === 'party'
  return [
    bottle(parts, tint, tones),
    parts.capped ? cap() : bottleLip(),
    when(parts.extra === 'jug', () => [
      bubble(-30, 166, 6, 1),
      bubble(28, 160, 7.5, 2),
      bubble(12, 168, 4.5, 3),
      bubble(-30, 132, 4, 4),
      bubble(32, 128, 3.5, 5),
    ]),
    when(party, () => [
      bubble(34, 154, 5.5, 1),
      bubble(-34, 162, 4.5, 3),
      bubble(30, 122, 3.5, 4),
      iceCube(-25, 96, 25, -14, 1, tones.liquid),
      iceCube(27, 98, 25, 16, 2, tones.liquid),
      iceCube(1, 86, 21, 42, 3, tones.liquid),
    ]),
    crackArt(parts.cracks, mix(C.metalDark, '#6b5a3a', 0.4)),
    shine(),
    face(0, 140, parts.mood, INK_BLUE, 1.25),
    when(party, () => [mintSprig(), lemonSlice(29, 54, 22, 12)]),
  ]
}

function shimmerSpots(offered: boolean): ReadonlyArray<readonly [number, number]> {
  return offered
    ? [
        [16, 142],
        [186, 122],
        [114, 62],
      ]
    : [
        [18, 136],
        [182, 124],
        [40, 120],
      ]
}

export function water(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = waterParts(scene)
  const tones = tonesOf(scene)
  const tint = Math.max(parts.cracks, parts.evaporated) / 3
  const offered = parts.extra === 'glass'
  const party = parts.extra === 'party'
  const centred = at(100, 0, bottleBody(parts, tint, tones))
  const posed = offered ? at(71, 180, at(-100, -180, centred), 0, 0.8) : centred
  return frame('water', scene, options, [
    warmth(parts.sun),
    when(parts.sun > 0, () => sun(parts.sun, parts.shades)),
    when(parts.extra === 'moon', moon),
    when(parts.extra === 'moon', zeds),
    when(!offered, () => floorCracks(parts.cracks)),
    shadow(offered ? 71 : 100, 183, offered ? 44 : 56),
    when(parts.cactus > 0, () => at(164, 168, cactus(parts.cactus))),
    when(parts.tumbleweed, tumbleweed),
    when(parts.capDropped && !parts.tumbleweed, droppedCap),
    part('carafe', party ? motion('bob', posed) : posed),
    when(party, () => [
      sparkle(32, 62, 1.2, 1),
      sparkle(172, 118, 1.05, 2),
      sparkle(26, 140, 0.8, 3),
      sparkle(170, 34, 0.85, 4),
    ]),
    when(parts.thought, () => thought(tones)),
    when(parts.thought, () => sweat(tones)),
    when(parts.extra === 'jug', () => [
      stream(parts.level, tones),
      jug(),
      splashes(parts.level, tones),
    ]),
    when(offered, () => [glass(parts, tones), chevron()]),
    fliesOver(parts.flies),
    shimmerLines(parts.shimmer, shimmerSpots(offered)),
  ])
}

function fliesOver(count: number): Art {
  const spots: Array<readonly [number, number]> = [
    [172, 52],
    [116, 96],
  ]
  return spots.slice(0, count).map(([x, y], i) => fly(x, y, i))
}
