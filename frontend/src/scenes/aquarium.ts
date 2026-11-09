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
  isDarkColor,
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
  bubble,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type AquariumPose = 'home' | 'siphon' | 'bucket'

export interface AquariumParts {
  pose: AquariumPose
  murk: number
  level: number
  curtains: number
  mask: boolean
  sign: boolean
  bubbles: number
  lamp: boolean
  dim: boolean
  lush: boolean
  thought: boolean
  zzz: boolean
  school: boolean
  sparkles: boolean
  bucketStench: number
  stench: number
  flies: number
  mood: Mood
}

export const MAX_MURK = 6

const CURTAIN_AT = [0.1, 0.4, 0.7] as const
const STENCH_AT = [0.55, 0.8] as const
const FLIES_AT = [0.7, 0.9] as const
const BUCKET_AT = [0.2, 0.5, 0.8] as const
const WORRIED_AT = 0.4
const SICK_AT = 0.75
const BUBBLES_LEFT = [4, 3, 1, 0] as const
const WATER_TOP = 64
const SIPHON_DROP = 4
const SWIRL_X = 86

const QUIET = {
  curtains: 0,
  mask: false,
  sign: false,
  lamp: true,
  dim: false,
  lush: false,
  thought: false,
  zzz: false,
  school: false,
  sparkles: false,
  bucketStench: 0,
  stench: 0,
  flies: 0,
  level: WATER_TOP,
} as const

export function aquariumParts(scene: SceneView): AquariumParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...QUIET,
      pose: 'home',
      murk: 0,
      bubbles: 6,
      lush: true,
      school: true,
      sparkles: true,
      mood: 'happy',
    }
  }
  if (state === 'running') {
    const step = Math.min(3, Math.floor(clamp01(scene.progress) * 4))
    return {
      ...QUIET,
      pose: 'siphon',
      murk: 3 - step,
      level: WATER_TOP + SIPHON_DROP * (step + 1),
      bubbles: 4,
      lamp: false,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      pose: 'bucket',
      murk: 0,
      bubbles: 2,
      bucketStench: reached(stink, BUCKET_AT),
      flies: reached(stink, FLIES_AT),
      mood: stink >= SICK_AT ? 'sick' : stink >= WORRIED_AT ? 'worried' : 'calm',
    }
  }
  const hanging = reached(stink, CURTAIN_AT)
  const due = state === 'due'
  const resting = state === 'resting'
  const step = due ? 4 : resting || fill <= 0 ? 0 : Math.min(3, 1 + Math.floor(fill * 3))
  const pleads = stink >= (CURTAIN_AT[2] ?? 1)
  let mood: Mood = resting ? 'sleepy' : step >= 2 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (stink >= WORRIED_AT) mood = 'worried'
  if (stink >= SICK_AT) mood = 'sick'
  return {
    ...QUIET,
    pose: 'home',
    murk: Math.min(MAX_MURK, step + Math.max(0, hanging - 1)),
    curtains: hanging,
    mask: stink >= WORRIED_AT,
    sign: pleads,
    bubbles: resting ? 1 : (BUBBLES_LEFT[hanging] ?? 0),
    lamp: !resting,
    dim: resting,
    thought: due && !pleads,
    zzz: resting,
    stench: reached(stink, STENCH_AT),
    flies: reached(stink, FLIES_AT),
    mood,
  }
}

const WATERS = [C.water, '#6dc8d8', '#7cc6b0', '#86bd84', '#80a95c', '#6c9349', '#587d3b'] as const
const RIM = '#dff3fc'
const RIM_DARK = '#aed7ea'
const AIR = '#a4d8ef'
const SAND = '#ecd29c'
const SAND_DARK = '#cfae72'
const INK = '#4a1a14'
const ALGAE = '#47702f'
const ALGAE_DARK = '#35592a'
const LENS = '#e6f7ff'
const STRAP = '#2a2d3e'
const TUBE = '#d8f1fa'

interface Tones {
  water: string
  body: string
  dark: string
  light: string
  ink: string
}

function waterOf(parts: AquariumParts): string {
  const base = WATERS[parts.murk] ?? C.water
  return parts.dim ? mix(base, C.glass, 0.42) : base
}

function tonesOf(scene: SceneView, parts: AquariumParts): Tones {
  const body = accentOf(scene, C.coral)
  return {
    water: waterOf(parts),
    body,
    dark: body === C.coral ? C.coralDark : shadeOf(body),
    light: tintOf(body, 0.45),
    ink: isDarkColor(body) ? C.cream : INK,
  }
}

function waterPath(level: number): string {
  return `M25 ${level}q12.5-3.5 25 0t25 0t25 0t25 0t25 0t25 0V138Q175 157 156 157H44Q25 157 25 138Z`
}

const GRAVEL = 'M26 139Q40 131 58 136T92 137T128 134T174 138V138Q174 157 155 157H45Q26 157 26 138Z'

function gravel(tinge: (color: string) => string): Art {
  const pebbles = [
    [46, 146, 6, C.coral],
    [66, 150, 5, C.lilac],
    [84, 145, 6, C.cream],
    [106, 150, 7, C.sky],
    [126, 145, 5, C.sun],
    [146, 150, 6, C.mint],
    [162, 145, 5, C.pink],
    [36, 151, 4, C.cream],
  ] as const
  return part('gravel', [
    svg`<path d=${GRAVEL} fill=${tinge(SAND)} />`,
    svg`<path d="M26 139Q40 131 58 136T92 137T128 134T174 138" fill="none" stroke=${tinge(SAND_DARK)} stroke-width="2.6" stroke-linecap="round" />`,
    pebbles.map(
      ([x, y, r, color]) =>
        svg`<ellipse cx=${x} cy=${y} rx=${r} ry=${round(r * 0.72)} fill=${tinge(color)} />`,
    ),
  ])
}

function castle(tinge: (color: string) => string): Art {
  const wall = tinge(C.lilac)
  const dark = tinge(C.lilacDark)
  const door = tinge('#4a3a78')
  const roof = tinge(C.pink)
  const flag = tinge(C.sun)
  return part(
    'castle',
    at(146, 140, [
      svg`<path d="M-4-74V-52" stroke=${dark} stroke-width="2.6" stroke-linecap="round" />`,
      svg`<path d="M-3-74L13-69L-3-63Z" fill=${flag} stroke=${flag} stroke-width="1.6" stroke-linejoin="round" />`,
      svg`<path d="M12 0V-30H29V0Z" fill=${dark} />`,
      svg`<path d="M9.5-30L20.5-47L31.5-30Z" fill=${roof} stroke=${roof} stroke-width="3" stroke-linejoin="round" />`,
      svg`<path d="M-24 0V-53H-16.5V-47H-8.5V-53H0.5V-47H8.5V-53H16V0Z" fill=${wall} stroke=${wall} stroke-width="2" stroke-linejoin="round" />`,
      svg`<path d="M-14 1V-13A10 10 0 0 1 6-13V1Z" fill=${door} />`,
      svg`<path d="M-4 1V-22M-14-8H6" stroke=${dark} stroke-width="2" />`,
      svg`<rect x="-8.5" y="-40" width="9" height="13" rx="4.5" fill=${door} />`,
      svg`<circle cx="20.5" cy="-17" r="3.6" fill=${door} />`,
    ]),
  )
}

function blade(height: number, width: number, color: string, flip: number): Art {
  const bend = round(height * 0.17 * flip)
  const half = round(height / 2)
  return svg`<path d=${`M0 0q${-bend} ${round(-height / 4)} 0 ${-half}t0 ${-half}`} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" />`
}

interface Tuft {
  x: number
  blades: ReadonlyArray<readonly [number, number]>
}

const TUFTS: readonly Tuft[] = [
  {
    x: 40,
    blades: [
      [-9, 0.8],
      [8, 0.72],
      [0, 1],
    ],
  },
  {
    x: 168,
    blades: [
      [-6, 0.72],
      [3, 1],
    ],
  },
  {
    x: 118,
    blades: [
      [-4, 0.5],
      [4, 0.42],
    ],
  },
]

function plants(
  parts: AquariumParts,
  tinge: (color: string) => string,
  picked: readonly number[],
): Art {
  const height = parts.lush ? 72 : 40
  const decay = parts.curtains / 3
  const light = tinge(mix(C.leaf, '#8d8a3e', decay))
  const dark = tinge(mix(C.leafDark, '#6d6a30', decay))
  const moving = parts.lush || parts.pose === 'siphon'
  return TUFTS.filter((_, t) => picked.includes(t)).map((tuft, t) =>
    part(
      'plant',
      at(
        tuft.x,
        142,
        tuft.blades.map(([x, share], i) => {
          const art = blade(
            round(height * share),
            parts.lush ? 8 : 7,
            i % 2 ? light : dark,
            i % 2 ? 1 : -1,
          )
          return at(x, 0, moving ? motion('wobble', art, ((i + t) % 5) + 1) : art)
        }),
      ),
      t,
    ),
  )
}

const PATCHES = [
  [1, 122, 15, 1],
  [-1, 118, 12, 2],
  [1, 90, 11, 3],
  [-1, 86, 10, 3],
  [1, 72, 7, 5],
  [-1, 68, 7, 5],
] as const

function glassAlgae(murk: number, water: string): Art {
  const color = mix(water, ALGAE, 0.42)
  return part(
    'glass-algae',
    PATCHES.filter(([, , , from]) => murk >= from).map(([side, y, r]) => {
      const x = side > 0 ? 25 : 175
      const sweep = side > 0 ? 1 : 0
      return svg`<path d=${`M${x} ${y - r}A${r} ${r} 0 0 ${sweep} ${x} ${y + r}Z`} fill=${color} />`
    }),
  )
}

const MOTES = [
  [62, 80],
  [140, 118],
  [118, 74],
  [50, 112],
  [108, 128],
  [78, 72],
  [160, 104],
  [38, 84],
  [130, 72],
  [66, 130],
] as const

function motes(murk: number): Art {
  return part(
    'motes',
    MOTES.slice(0, murk * 2).map(
      ([x, y], i) =>
        svg`<circle cx=${x} cy=${y} r=${i % 3 ? 1.8 : 2.6} fill=${ALGAE_DARK} opacity=".55" />`,
    ),
  )
}

function snail(): Art {
  return part(
    'snail',
    at(62, 74, [
      svg`<path d="M-11 6H9Q15 6 15-1" fill="none" stroke=${C.creamDark} stroke-width="4.5" stroke-linecap="round" />`,
      svg`<circle cx="-2" cy="-1" r="8" fill=${C.terracotta} />`,
      svg`<path d="M-2-1a3 3 0 0 1 3 3a5.5 5.5 0 0 1-8-3a6 6 0 0 1 8-4.5" fill="none" stroke=${C.terracottaDark} stroke-width="2" stroke-linecap="round" />`,
    ]),
  )
}

const STRANDS = [
  [34, 34, 11, 1, 1],
  [54, 20, 8, 1, 2],
  [168, 30, 10, 1, 3],
  [44, 56, 9, 2, 4],
  [72, 24, 8, 2, 5],
  [152, 44, 9, 2, 1],
  [130, 22, 8, 2, 2],
  [30, 82, 10, 3, 3],
  [58, 62, 11, 3, 4],
  [88, 22, 9, 3, 5],
  [112, 30, 10, 3, 1],
  [172, 76, 10, 3, 2],
  [142, 62, 9, 3, 3],
] as const

function curtains(level: number): Art {
  return part(
    'algae-curtains',
    STRANDS.filter(([, , , from]) => level >= from).map(([x, length, width, from, delay], i) => {
      const half = round(length / 2)
      const swing = i % 2 ? 6 : -6
      const d = `M0 0q${swing} ${round(length / 4)} 0 ${half}t0 ${half}`
      return at(
        x,
        WATER_TOP - 6,
        motion(
          'sway',
          svg`<path d=${d} fill="none" stroke=${from % 2 ? ALGAE : ALGAE_DARK} stroke-width=${width} stroke-linecap="round" />`,
          delay,
        ),
      )
    }),
  )
}

const BUBBLES = [
  [126, 96, 6, 1],
  [46, 104, 5, 3],
  [118, 114, 4, 2],
  [62, 92, 4, 4],
  [112, 94, 3.2, 5],
  [150, 96, 4.5, 2],
] as const

function bubbles(count: number): Art {
  return BUBBLES.slice(0, count).map(([x, y, r, d]) => bubble(x, y, r, d))
}

function mask(tones: Tones): Art {
  const dark = isDarkColor(tones.body)
  const lens = dark ? C.glass : LENS
  const band = dark ? C.cream : STRAP
  return part('diving-mask', [
    svg`<path d="M-7-7Q-26-14-40-4" fill="none" stroke=${band} stroke-width="4.5" stroke-linecap="round" />`,
    svg`<path d="M-12-6C-20-14-16-40-17-66" fill="none" stroke=${C.sun} stroke-width="5.5" stroke-linecap="round" />`,
    svg`<path d="M-17-66V-72" stroke=${C.coralDark} stroke-width="7" stroke-linecap="round" />`,
    svg`<rect x="-8" y="-18" width="44" height="24" rx="10" fill=${lens} stroke=${band} stroke-width="3.6" />`,
  ])
}

const FRONT_TUFTS = [0, 1] as const
const ALL_TUFTS = [0, 1, 2] as const
const BACK_TUFTS = [2] as const

const BODY = 'M44 0C44-24 20-33-4-33C-26-33-40-14-46 0C-40 14-26 33-4 33C20 33 44 24 44 0Z'
const TAIL = 'M-36 0C-50-8-60-28-74-28C-67-12-67 12-74 28C-60 28-50 8-36 0Z'
const DORSAL = 'M-26-26C-20-50 8-50 16-30Z'
const BELLY = 'M-30 19C-14 33 22 33 37 16C22 26-12 27-30 19Z'

function fish(parts: AquariumParts, tones: Tones): Art {
  return part('fish', [
    svg`<path d=${TAIL} fill=${tones.dark} stroke=${tones.dark} stroke-width="3" stroke-linejoin="round" />`,
    svg`<path d="M-44 0L-62-14M-44 0H-64M-44 0L-62 14" stroke=${tones.body} stroke-width="3" stroke-linecap="round" />`,
    svg`<path d=${DORSAL} fill=${tones.dark} stroke=${tones.dark} stroke-width="3" stroke-linejoin="round" />`,
    svg`<path d="M-8 30C-10 44 6 46 12 30Z" fill=${tones.dark} stroke=${tones.dark} stroke-width="3" stroke-linejoin="round" />`,
    svg`<path d=${BODY} fill=${tones.body} />`,
    svg`<path d=${BELLY} fill=${tones.light} />`,
    svg`<path d="M-30-9q7 6 0 14M-20-17q8 7 0 16M-20 4q7 6 0 13" fill="none" stroke=${tones.dark} stroke-width="2.8" stroke-linecap="round" />`,
    svg`<circle cx="-1" cy="7" r="4.6" fill=${tones.light} opacity=".8" /><circle cx="33" cy="7" r="4.6" fill=${tones.light} opacity=".8" />`,
    when(parts.mask, () => mask(tones)),
    face(14, -6, parts.mood, tones.ink, 1),
    svg`<path d="M-17 7C-27 11-29 23-19 25C-12 26-8 16-11 8Z" fill=${tones.dark} />`,
  ])
}

function miniFish(x: number, y: number, flip: number, delay: number, tones: Tones): Art {
  return part(
    'mini-fish',
    at(
      x,
      y,
      motion(
        'drift',
        [
          svg`<path d=${`M${-9 * flip} 0L${-17 * flip}-7V7Z`} fill=${tones.dark} stroke=${tones.dark} stroke-width="2" stroke-linejoin="round" />`,
          svg`<ellipse rx="12" ry="7.5" fill=${tones.light} />`,
          svg`<circle cx=${5.5 * flip} cy="-1.5" r="2" fill=${INK} />`,
        ],
        delay,
      ),
    ),
  )
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

function sign(): Art {
  return part('sign', [
    svg`<path d="M104 128L134 92" stroke=${C.wickerDark} stroke-width="5" stroke-linecap="round" />`,
    at(
      136,
      88,
      [
        svg`<rect x="-23" y="-18" width="46" height="36" rx="6" fill=${C.cream} />`,
        svg`<rect x="-23" y="11" width="46" height="7" rx="3.5" fill=${C.creamDark} />`,
        svg`<rect x="-3.8" y="-13" width="7.6" height="15" rx="3.8" fill=${C.coralDark} />`,
        svg`<circle cy="8" r="4" fill=${C.coralDark} />`,
        svg`<path d="M-16-9H-10M-16-1H-10M10-9H16M10-1H16" stroke=${C.creamDark} stroke-width="3.6" stroke-linecap="round" />`,
      ],
      6,
    ),
  ])
}

function thought(): Art {
  return part('wish', [
    svg`<circle cx="118" cy="110" r="3.6" fill=${C.cream} /><circle cx="124" cy="100" r="5.6" fill=${C.cream} />`,
    at(
      144,
      84,
      motion('pulse', [
        svg`<circle r="21" fill=${C.cream} />`,
        svg`<path d="M0-13C1.6-4 4-1.6 13 0C4 1.6 1.6 4 0 13C-1.6 4-4 1.6-13 0C-4-1.6-1.6-4 0-13Z" fill=${C.sunDark} />`,
        svg`<circle cx="11" cy="-10" r="2.6" fill=${C.sky} /><circle cx="-11" cy="10" r="2" fill=${C.sky} />`,
      ]),
    ),
  ])
}

function thermometer(): Art {
  return part(
    'thermometer',
    at(43, 56, [
      svg`<path d="M0 0V-13H-13" fill="none" stroke=${C.metalDark} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
      svg`<rect x="-8" y="-2" width="16" height="72" rx="8" fill=${C.cream} />`,
      svg`<circle cy="72" r="12" fill=${C.cream} />`,
      svg`<rect x="-3.2" y="22" width="6.4" height="50" fill=${C.coralDark} />`,
      svg`<circle cy="72" r="8" fill=${C.coralDark} />`,
      svg`<path d="M3 8H8M3 18H8M3 28H8M3 38H8M3 48H8" stroke=${C.metalDark} stroke-width="2.4" stroke-linecap="round" />`,
    ]),
  )
}

function swirlAt(level: number): { cy: number; r: number } {
  const r = Math.min(42, (136 - level) / 2 + 6)
  return { cy: round(level + r), r: round(r) }
}

function swirlFront(level: number, water: string): Art {
  const { cy, r } = swirlAt(level)
  return part(
    'swirl-front',
    at(
      SWIRL_X,
      cy,
      motion(
        'spin',
        svg`<circle r=${round(r * 0.66)} fill="none" stroke=${tintOf(water, 0.8)} stroke-width="3.6" stroke-linecap="round" stroke-dasharray="20 34" opacity=".8" />`,
        2,
      ),
    ),
  )
}

function swirl(level: number, water: string, debris: string): Art {
  const light = tintOf(water, 0.72)
  const { cy, r } = swirlAt(level)
  return part(
    'swirl',
    at(
      SWIRL_X,
      cy,
      motion('spin', [
        svg`<circle r=${r} fill="none" stroke=${light} stroke-width="6" stroke-linecap="round" stroke-dasharray="46 22" opacity=".9" />`,
        svg`<circle r=${round(r * 0.62)} fill="none" stroke=${light} stroke-width="5" stroke-linecap="round" stroke-dasharray="26 14" opacity=".9" />`,
        svg`<circle cx=${r} r="3.4" fill=${debris} /><circle cx=${-r} r="2.6" fill=${debris} /><circle cy=${round(r * 0.62)} r="2.8" fill=${debris} /><circle cy=${round(-r * 0.62)} r="2.2" fill=${debris} />`,
      ]),
    ),
  )
}

function hood(parts: AquariumParts): Art {
  const light = parts.lamp ? C.sun : C.metalDark
  const dot = parts.sparkles ? C.check : parts.thought || parts.sign ? C.coral : light
  return part('hood', [
    when(
      parts.lamp,
      () =>
        svg`<path d="M52 52L38 138H162L148 52Z" fill=${C.spark} opacity=${parts.sparkles ? 0.2 : 0.09} data-part="light" />`,
    ),
    svg`<rect x="46" y="49" width="108" height="6" rx="3" fill=${light} />`,
    svg`<rect x="16" y="34" width="168" height="18" rx="9" fill=${C.metal} />`,
    svg`<path d="M25 47H175" stroke=${C.metalMid} stroke-width="5" stroke-linecap="round" />`,
    svg`<circle cx="168" cy="41" r="3" fill=${dot} />`,
  ])
}

function rim(): Art {
  return part('rim', [
    svg`<rect x="18" y="43" width="164" height="9" rx="4.5" fill=${RIM} />`,
    at(
      18,
      44,
      [
        svg`<rect x="-2" y="-16" width="118" height="16" rx="8" fill=${C.metal} />`,
        svg`<path d="M6-5H108" stroke=${C.metalMid} stroke-width="4.5" stroke-linecap="round" />`,
      ],
      -17,
    ),
  ])
}

function stand(): Art {
  return part('stand', [
    svg`<rect x="26" y="165" width="148" height="18" rx="4" fill=${C.wickerDark} />`,
    svg`<rect x="14" y="157" width="172" height="12" rx="6" fill=${C.wicker} />`,
    svg`<path d="M22 160.5H178" stroke=${C.wickerLight} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<path d="M100 171V183" stroke=${C.wicker} stroke-width="2.6" />`,
    svg`<circle cx="91" cy="176" r="2.4" fill=${C.wickerLight} /><circle cx="109" cy="176" r="2.4" fill=${C.wickerLight} />`,
  ])
}

function tank(parts: AquariumParts, tones: Tones): Art {
  const amount = parts.murk * 0.08 + (parts.dim ? 0.3 : 0)
  const tinge = (color: string): string => mix(color, tones.water, amount)
  const siphon = parts.pose === 'siphon'
  let fishAt: readonly [number, number, number, number] = [90, 104, 0, 0.84]
  if (parts.zzz) fishAt = [92, 113, 5, 0.84]
  if (siphon) fishAt = [SWIRL_X + 4, (parts.level + 136) / 2, -8, 0.72]
  if (parts.pose === 'bucket') fishAt = [106, 104, 0, 0.82]
  if (parts.sign) fishAt = [84, 112, 0, 0.84]
  if (parts.lush) fishAt = [92, 100, 0, 0.76]
  const posed = at(0, 0, fish(parts, tones), fishAt[2], fishAt[3])
  const animation = siphon ? 'wobble' : parts.sparkles || parts.pose === 'bucket' ? 'bob' : ''
  const scum = parts.murk >= 3
  return part('tank', [
    svg`<path d="M26 52H174V${parts.level + 4}H26Z" fill=${parts.dim ? mix(AIR, C.glass, 0.5) : tinge(AIR)} />`,
    when(
      siphon,
      () =>
        svg`<path d=${`M28 ${WATER_TOP + 1}H172`} stroke=${ALGAE} stroke-width="4" stroke-linecap="round" opacity=".5" data-part="tide-mark" />`,
    ),
    part('water', svg`<path d=${waterPath(parts.level)} fill=${tones.water} />`),
    when(siphon, () => swirl(parts.level, tones.water, ALGAE)),
    plants(parts, tinge, parts.lush ? BACK_TUFTS : ALL_TUFTS),
    castle(tinge),
    gravel(tinge),
    glassAlgae(parts.murk, tones.water),
    motes(parts.murk),
    when(parts.murk >= 2 && !siphon, snail),
    curtains(parts.curtains),
    bubbles(parts.bubbles),
    when(parts.school, () => [
      miniFish(146, 76, -1, 1, tones),
      miniFish(54, 76, 1, 3, tones),
      miniFish(158, 122, -1, 2, tones),
    ]),
    when(parts.zzz, () =>
      part('zzz', [zed(128, 96, 0.6, 1), zed(142, 82, 0.8, 2), zed(132, 70, 0.55, 3)]),
    ),
    when(parts.sign, sign),
    at(fishAt[0], fishAt[1], animation ? motion(animation, posed) : posed),
    when(parts.lush, () => plants(parts, tinge, FRONT_TUFTS)),
    when(siphon, () => swirlFront(parts.level, tones.water)),
    when(
      parts.sign,
      () =>
        svg`<ellipse cx="105" cy="127" rx="8" ry="6" fill=${tones.dark} transform="rotate(-40 105 127)" />`,
    ),
    when(parts.thought, thought),
    when(parts.pose === 'bucket', thermometer),
    when(
      scum,
      () =>
        svg`<path d=${`M30 ${parts.level + 1}H170`} stroke=${mix(tones.water, ALGAE, 0.7)} stroke-width="4" stroke-linecap="round" stroke-dasharray="14 7" data-part="scum" />`,
    ),
    svg`<rect x="23" y="49" width="154" height="108" rx="20" fill="none" stroke=${RIM} stroke-width="6" data-part="glass" />`,
    svg`<path d="M23.5 138Q23.5 155 40 156" fill="none" stroke=${RIM_DARK} stroke-width="3" stroke-linecap="round" />`,
    svg`<path d="M37 ${parts.level + 10}V${parts.level + 34}M37 ${parts.level + 44}v3" stroke="#fff" stroke-width="5.5" stroke-linecap="round" opacity=${round(0.65 - parts.murk * 0.08)} />`,
    siphon ? rim() : hood(parts),
    stand(),
  ])
}

const HOSE = 'M112 124C112 88 110 52 130 45C152 38 170 58 168 146'

function hose(tones: Tones): Art {
  return part('hose', [
    svg`<path d=${HOSE} fill="none" stroke=${TUBE} stroke-width="10" stroke-linecap="round" />`,
    svg`<path d=${HOSE} fill="none" stroke=${mix(tones.water, ALGAE, 0.45)} stroke-width="5.5" stroke-linecap="round" />`,
    motion(
      'flicker',
      svg`<path d=${HOSE} fill="none" stroke=${C.spark} stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 15" />`,
    ),
    at(112, 124, [
      svg`<path d="M-8 0H8L12 24H-12Z" fill=${TUBE} opacity=".92" stroke=${TUBE} stroke-width="3" stroke-linejoin="round" />`,
      svg`<path d="M-7 8L-9 22H9L7 8Z" fill=${mix(tones.water, ALGAE, 0.45)} />`,
    ]),
  ])
}

function bucket(old: string): Art {
  return part(
    'bucket',
    at(166, 183, [
      svg`<path d="M-23-40H23L18-4Q17.5 0 13 0H-13Q-17.5 0-18-4Z" fill=${C.sun} />`,
      svg`<path d="M-21.5-24H21.5" stroke=${C.sunDark} stroke-width="5" />`,
      svg`<path d="M-23-40C-21-20 21-20 23-40" fill="none" stroke=${C.metalDark} stroke-width="3.6" stroke-linecap="round" />`,
      svg`<ellipse cy="-40" rx="24" ry="7.5" fill=${C.sunDark} />`,
      svg`<ellipse cy="-39" rx="19.5" ry="5" fill=${old} />`,
      svg`<path d="M-10-40q5 2 10 0M4-37q4 1 8 0" fill="none" stroke=${ALGAE_DARK} stroke-width="2.2" stroke-linecap="round" />`,
    ]),
  )
}

function shortStench(level: number): Art {
  const wavy = 'M0 0c-5-3 5-6 0-9c-5-3 5-6 0-9'
  return (
    [
      [62, 33, 1],
      [138, 33, 2],
      [100, 33, 3],
    ] as const
  )
    .slice(0, level + 1)
    .map(([x, y, d], i) =>
      part(
        'stench',
        at(
          x,
          y,
          motion(
            'waft',
            svg`<path d=${wavy} fill="none" stroke=${C.stench} stroke-width="5" stroke-linecap="round" />`,
            d,
          ),
        ),
        i,
      ),
    )
}

export function aquarium(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = aquariumParts(scene)
  const tones = tonesOf(scene, parts)
  const body = tank(parts, tones)
  const home = parts.pose === 'home'
  const shrunk = at(0, 25.76, body, 0, 0.86)
  const flySpots = home
    ? ([
        [30, 27],
        [168, 26],
      ] as const)
    : ([
        [168, 92],
        [150, 44],
      ] as const)
  return frame('aquarium', scene, options, [
    shadow(home ? 100 : 86, 182, home ? 84 : 76),
    home ? body : shrunk,
    when(!home, () => shadow(166, 182, 26, 0.22)),
    when(parts.pose === 'siphon', () => [bucket(mix(WATERS[4], ALGAE, 0.3)), hose(tones)]),
    when(parts.pose === 'bucket', () => [
      bucket(mix(WATERS[5], ALGAE, 0.35)),
      when(parts.bucketStench >= 2, () =>
        stenchLines(
          (
            [
              [176, 134],
              [156, 136],
            ] as const
          ).slice(0, parts.bucketStench - 1),
        ),
      ),
      part('drip', at(144, 176, motion('drip', drop(0, 0, mix(WATERS[5], ALGAE, 0.2), 0.7), 2))),
    ]),
    when(parts.stench > 0, () => shortStench(parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
    when(parts.sparkles, () => [
      sparkle(28, 25, 1.05, 1),
      sparkle(174, 25, 1, 2),
      sparkle(100, 24, 0.8, 3),
    ]),
  ])
}
