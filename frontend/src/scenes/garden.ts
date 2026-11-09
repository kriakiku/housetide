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
  INK,
  isDarkColor,
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

export type GardenView = 'bed' | 'pulling' | 'sowing' | 'harvest'

export interface GardenParts {
  view: GardenView
  weeds: number
  tower: number
  carrot: number
  limp: number
  trowel: boolean
  asleep: boolean
  bubble: boolean
  help: boolean
  snails: number
  helmets: boolean
  flag: boolean
  flies: number
  moss: number
  cracks: number
  grazing: boolean
  mood: Mood
}

export const MAX_WEEDS = 6

const TOWER_AT = [0.15, 0.4, 0.7] as const
const SNAIL_AT = [0.08, 0.3, 0.5, 0.65, 0.8] as const
const FLIES_AT = [0.6, 0.9] as const
const MOSS_AT = [0.25, 0.55] as const
const HELP_AT = 0.35
const HELMET_AT = 0.65
const FLAG_AT = 0.8
const SICK_AT = 0.5
const WAITING_SNAIL_AT = [0.3, 0.6] as const
const CRACK_AT = [0.1, 0.45] as const
const GRAZING_AT = 0.5

const CALM = {
  weeds: 0,
  tower: 0,
  limp: 0,
  trowel: false,
  asleep: false,
  bubble: false,
  help: false,
  snails: 0,
  helmets: false,
  flag: false,
  flies: 0,
  moss: 0,
  cracks: 0,
  grazing: false,
} as const

export function gardenParts(scene: SceneView): GardenParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') return { ...CALM, view: 'harvest', carrot: 3, mood: 'happy' }
  const moss = reached(stink, MOSS_AT)
  if (state === 'running') {
    return {
      ...CALM,
      view: 'pulling',
      carrot: 1,
      tower: Math.min(1, reached(stink, TOWER_AT)),
      snails: Math.min(2, reached(stink, SNAIL_AT)),
      moss,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      view: 'sowing',
      carrot: 0,
      snails: reached(stink, WAITING_SNAIL_AT),
      flies: reached(stink, FLIES_AT),
      cracks: reached(stink, CRACK_AT),
      grazing: stink >= GRAZING_AT,
      moss,
      mood: stink >= 0.75 ? 'sick' : stink >= 0.3 ? 'pleading' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const step = Math.min(MAX_WEEDS - 1, Math.floor(fill * MAX_WEEDS))
  const weeds = due ? MAX_WEEDS : resting ? 0 : step
  const help = due && stink >= HELP_AT
  let mood: Mood = resting ? 'sleepy' : weeds >= 4 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (stink >= SICK_AT) mood = 'sick'
  return {
    ...CALM,
    view: 'bed',
    weeds,
    tower: reached(stink, TOWER_AT),
    carrot: weeds >= 4 ? 1 : 2,
    limp: (due ? 1 : 0) + reached(stink, [HELP_AT]),
    trowel: !due,
    asleep: resting,
    bubble: due && !help,
    help,
    snails: reached(stink, SNAIL_AT),
    helmets: stink >= HELMET_AT,
    flag: stink >= FLAG_AT,
    flies: reached(stink, FLIES_AT),
    moss,
    mood,
  }
}

const CARROT = '#ff9838'
const CARROT_DARK = '#e27518'
const CARROT_FACE = '#6e2f08'
const WEED = '#9cc23c'
const WEED_DARK = '#6f9a2c'
const WEED_BLUE = '#4fa77f'
const SEED = '#f2dfae'
const ROOT = '#ecdcc0'
const SNAIL = '#f4dfa8'
const SNAIL_DARK = '#d8bb7a'
const HELMET = '#6d7f45'
const CLOD = '#7a5740'

interface Wood {
  body: string
  dark: string
  light: string
  face: string
}

function woodOf(scene: SceneView): Wood {
  const body = accentOf(scene, C.wicker)
  if (body === C.wicker) {
    return { body, dark: C.wickerDark, light: C.wickerLight, face: '#5b3413' }
  }
  return {
    body,
    dark: shadeOf(body, 0.26),
    light: tintOf(body, 0.3),
    face: isDarkColor(body) ? tintOf(body, 0.82) : mix(body, INK, 0.74),
  }
}

function soilBack(color: string): Art {
  return part('soil', [
    svg`<path d="M30 128C28 112 44 106 64 107C84 100 116 100 136 107C156 106 172 112 170 128Z" fill=${color} />`,
  ])
}

function soilFront(color: string): Art {
  const humps = [28, 57, 86, 115, 144].map((x) => `Q${x + 14.5} 104 ${x + 29} 120`).join('')
  return svg`<path d=${`M28 128V120${humps}V128Z`} fill=${color} data-part="soil-front" />`
}

function frond(length: number, color: string, rib: string): Art {
  const leaflets = [0.34, 0.5, 0.66, 0.82].map((share, i) => {
    const ry = round(length * (0.19 - i * 0.024))
    const y = round(-length * share)
    const leaf = svg`<ellipse cy=${-ry} rx=${round(ry * 0.52)} ry=${ry} fill=${color} />`
    return [at(0, y, leaf, -52), at(0, y, leaf, 52)]
  })
  const tip = round(length * 0.15)
  return [
    leaflets,
    svg`<ellipse cy=${round(-length * 0.92)} rx=${round(tip * 0.55)} ry=${tip} fill=${color} />`,
    svg`<path d=${`M0 0V${round(-length * 0.9)}`} stroke=${rib} stroke-width="2.6" stroke-linecap="round" />`,
  ]
}

function tops(length: number, spread: number, limp: number): Art {
  const leaf = mix(C.leaf, '#b9a64a', limp * 0.26)
  const rib = mix(C.leafDark, '#8a7a33', limp * 0.26)
  const fan = spread + limp * 20
  return [
    at(0, 0, frond(length * 0.88, leaf, rib), -fan),
    at(0, 0, frond(length * 0.88, leaf, rib), fan),
    at(0, 0, frond(length, leaf, rib), limp * 12),
  ]
}

function carrot(x: number, y: number, size: number, limp: number, index: number): Art {
  return part(
    'carrot',
    at(
      x,
      y,
      [
        at(0, -25, tops(38, 26, limp)),
        svg`<path d="M-7 18C-11 6-16-6-16.5-16C-17-25-9-28 0-28C9-28 17-25 16.5-16C16-6 11 6 7 18Z" fill=${CARROT} />`,
        svg`<path d="M-11-14H-4M3-7H10M-8 0H-2" stroke=${CARROT_DARK} stroke-width="2.8" stroke-linecap="round" />`,
      ],
      0,
      size,
    ),
    index,
  )
}

function helpCarrot(x: number, y: number): Art {
  const arm = (side: number, delay: number): Art =>
    at(
      side * 18,
      -14,
      motion(
        'wobble',
        [
          svg`<path d=${`M0 0Q${side * 12}-4 ${side * 15}-20`} fill="none" stroke=${CARROT_DARK} stroke-width="6" stroke-linecap="round" />`,
          svg`<circle cx=${side * 15} cy="-23" r="5.5" fill=${CARROT} />`,
        ],
        delay,
      ),
    )
  return part(
    'help-carrot',
    at(x, y, [
      at(0, -58, tops(34, 34, 1)),
      arm(-1, 1),
      arm(1, 2),
      svg`<path d="M-10 18C-16-6-25-28-25-44C-25-56-14-60 0-60C14-60 25-56 25-44C25-28 16-6 10 18Z" fill=${CARROT} />`,
      svg`<path d="M-19-48H-10M8-8H15M-17 0H-10" stroke=${CARROT_DARK} stroke-width="3" stroke-linecap="round" />`,
      face(0, -28, 'pleading', CARROT_FACE, 0.72),
    ]),
  )
}

function tuft(height: number): Art {
  const blades = [
    [-16, 0.68, WEED_DARK],
    [15, 0.74, WEED_DARK],
    [-8, 1, WEED],
    [8, 0.94, WEED],
    [0, 0.8, WEED_BLUE],
  ] as const
  return blades.map(([tip, share, color]) => {
    const h = round(height * share)
    const bend = round(tip * 0.3)
    return svg`<path d=${`M${bend - 5} 6Q${bend - 2} ${round(-h * 0.5)} ${tip} ${-h}Q${bend + 5} ${round(-h * 0.5)} ${bend + 5} 6Z`} fill=${color} />`
  })
}

function jagged(side: number, size: number, color: string): Art {
  const leaf = svg`<path d="M0 2L6-3L5-9L13-11L13-18L22-18L22-24L32-25C31-14 24-4 12 1Z" fill=${color} />`
  return svg`<g transform=${`scale(${round(side * size)} ${round(size)})`}>${leaf}</g>`
}

function dandelion(height: number, lean: number, smug: boolean): Art {
  return [
    jagged(-1, 0.68, WEED_DARK),
    jagged(1, 0.68, WEED_DARK),
    jagged(-1, 0.44, WEED),
    jagged(1, 0.44, WEED),
    svg`<path d=${`M0 2Q${round(lean * 2.2)} ${round(-height * 0.5)} ${lean} ${-height}`} fill="none" stroke=${WEED} stroke-width="4" stroke-linecap="round" />`,
    at(lean, -height - 4, [
      [0, 1, 2, 3, 4, 5, 6, 7].map(
        (i) =>
          svg`<ellipse cy="-9" rx="4.6" ry="6.4" transform=${`rotate(${i * 45})`} fill=${C.sun} />`,
      ),
      svg`<circle r="8" fill=${C.sunDark} />`,
      when(smug, () => [
        svg`<circle cx="-3.4" cy="-.6" r="1.5" fill=${C.fly} /><circle cx="3.4" cy="-.6" r="1.5" fill=${C.fly} />`,
        svg`<path d="M-6-5L-1.6-3.2M6-5L1.6-3.2M-3 3.2Q0 5.8 3.6 2.4" fill="none" stroke=${C.fly} stroke-width="1.6" stroke-linecap="round" />`,
      ]),
    ]),
  ]
}

function thistle(height: number, lean: number): Art {
  const count = Math.max(2, Math.floor(height / 15))
  const leaves = Array.from({ length: count }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1
    const share = (i + 0.7) / (count + 0.6)
    const size = 1 - (i / count) * 0.42
    return at(
      round(lean * share * share),
      round(-height * share),
      svg`<path d="M0 0L9-8L9-3L17-8L16-3L25-5L18 2L21 5L12 5L12 9Z" fill=${i % 2 ? WEED_BLUE : WEED_DARK} />`,
      side === 1 ? -14 : 194,
      size,
    )
  })
  return [
    svg`<path d=${`M0 3Q${round(lean * 0.3)} ${round(-height * 0.5)} ${lean} ${-height}`} fill="none" stroke=${WEED_DARK} stroke-width="5" stroke-linecap="round" />`,
    leaves,
    at(lean, -height - 7, [
      svg`<path d="M-11-8L-13-23L-6-15L-3-26L1-16L6-26L8-15L14-22L11-8Z" fill=${C.pink} />`,
      svg`<circle r="11" fill=${WEED_DARK} />`,
      svg`<path d="M-7-5L5 7M-1-9L9 2M-9 1L0 9M7-6L-5 7M0-9L-9 2M9 0L2 8" stroke=${WEED} stroke-width="1.6" stroke-linecap="round" />`,
    ]),
  ]
}

type WeedKind = 'tuft' | 'dandelion' | 'thistle'

interface WeedSpot {
  kind: WeedKind
  x: number
  h: number
  grow: number
  lean: number
}

const WEEDS: readonly WeedSpot[] = [
  { kind: 'tuft', x: 79, h: 24, grow: 15, lean: 0 },
  { kind: 'dandelion', x: 121, h: 34, grow: 3, lean: 3 },
  { kind: 'tuft', x: 156, h: 24, grow: 15, lean: 0 },
  { kind: 'thistle', x: 32, h: 38, grow: 11, lean: -3 },
  { kind: 'dandelion', x: 74, h: 42, grow: 13, lean: -5 },
  { kind: 'thistle', x: 160, h: 36, grow: 11.5, lean: 3 },
]

function weed(spot: WeedSpot, tower: number, index: number): Art {
  const height = spot.h + tower * spot.grow
  const art: Record<WeedKind, () => Art> = {
    tuft: () => tuft(height),
    dandelion: () => dandelion(height, spot.lean, tower >= 2),
    thistle: () => thistle(height, spot.lean),
  }
  return part('weed', at(spot.x, 118, motion('sway', art[spot.kind](), (index % 3) + 1)), index)
}

function trowel(): Art {
  return part('trowel', [
    svg`<rect x="-3" y="-58" width="6" height="26" rx="2" fill=${C.metalDark} />`,
    svg`<rect x="-7.5" y="-96" width="15" height="42" rx="7.5" fill=${C.coral} />`,
    svg`<rect x="-7.5" y="-62" width="15" height="7" rx="2.5" fill=${C.coralDark} />`,
    svg`<circle cy="-88" r="2.6" fill=${C.coralDark} />`,
    svg`<path d="M0 2C-15-8-18-26-14-38Q0-44 14-38C18-26 15-8 0 2Z" fill=${C.metal} />`,
    svg`<path d="M0 2C15-8 18-26 14-38Q7-41 0-41Z" fill=${C.metalMid} />`,
  ])
}

function planks(wood: Wood, parts: GardenParts): Art {
  return part('bed', [
    svg`<rect x="24" y="128" width="152" height="50" fill=${wood.body} />`,
    svg`<rect x="24" y="161" width="152" height="4" fill=${wood.dark} opacity=".6" />`,
    svg`<path d="M46 171.5H72M128 171.5H150M50 147H62M140 150H154" stroke=${wood.dark} stroke-width="2.6" stroke-linecap="round" opacity=".4" />`,
    svg`<rect x="16" y="112" width="20" height="71" rx="6" fill=${wood.dark} /><rect x="164" y="112" width="20" height="71" rx="6" fill=${wood.dark} />`,
    svg`<rect x="12" y="120" width="176" height="17" rx="8.5" fill=${wood.light} />`,
    svg`<circle cx="26" cy="128.5" r="2.4" fill=${wood.dark} /><circle cx="174" cy="128.5" r="2.4" fill=${wood.dark} />`,
    when(parts.moss >= 1, () =>
      part(
        'moss',
        svg`<path d="M12 129Q12 120 21 120H52Q56 126 48 127Q46 134 37 131Q30 139 24 133Q15 136 12 129Z" fill=${WEED_DARK} />`,
      ),
    ),
    when(parts.moss >= 2, () =>
      part('moss', [
        svg`<path d="M188 129Q188 120 179 120H138Q134 126 142 127Q146 135 156 131Q164 140 172 133Q184 137 188 129Z" fill=${WEED_DARK} />`,
        svg`<path d="M60 120H88Q90 125 82 125Q76 131 70 126Q60 127 60 120Z" fill=${WEED} />`,
      ]),
    ),
    face(100, 147, parts.mood, wood.face, 1.05),
  ])
}

const SHELLS = [
  [C.coral, C.coralDark],
  [C.lilac, C.lilacDark],
  [C.sky, C.skyDark],
  [C.pink, C.pinkDark],
  [C.sun, C.sunDark],
] as const

function snail(x: number, y: number, size: number, index: number, kit: 0 | 1 | 2): Art {
  const [shell, shellDark] = SHELLS[index % SHELLS.length] ?? SHELLS[0]
  const body: Art = [
    when(kit === 2, () => [
      svg`<path d="M-6-27V-58" stroke=${C.cream} stroke-width="2.8" stroke-linecap="round" />`,
      at(
        -6,
        -57,
        motion('sway', [
          svg`<path d="M0 0L30 3L24 10L30 18L0 18Z" fill=${C.coral} />`,
          svg`<path d="M6 5H19M6 12H15" stroke=${C.cream} stroke-width="2.6" stroke-linecap="round" />`,
        ]),
      ),
    ]),
    svg`<path d="M15-20L12-33M22-19L24-32" stroke=${SNAIL_DARK} stroke-width="3" stroke-linecap="round" />`,
    svg`<circle cx="12" cy="-34" r="3.3" fill=${C.fly} /><circle cx="24" cy="-33" r="3.3" fill=${C.fly} />`,
    svg`<circle cx="11" cy="-35" r="1" fill="#fff" /><circle cx="23" cy="-34" r="1" fill="#fff" />`,
    svg`<path d="M-26 0Q-28-4-20-5H8C11-5 11-12 12-18C13-26 28-26 28-16C28-6 24 0 16 0Z" fill=${SNAIL} />`,
    svg`<circle cx="-6" cy="-17" r="15.5" fill=${shell} />`,
    svg`<path d="M-6-7A10 10 0 1 1 3-18A6.4 6.4 0 1 1-8.4-20A3 3 0 1 1-3.4-18" fill="none" stroke=${shellDark} stroke-width="3" stroke-linecap="round" />`,
    svg`<path d="M19-13Q22-10 25-13" fill="none" stroke=${C.fly} stroke-width="1.8" stroke-linecap="round" />`,
    when(
      kit >= 1,
      () =>
        svg`<path d="M10-21A10 10 0 0 1 30-21Q30-19 28-19H12Q10-19 10-21Z" fill=${HELMET} /><path d="M8-19H32" stroke=${shadeOf(HELMET)} stroke-width="3" stroke-linecap="round" />`,
    ),
  ]
  return part('snail', at(x, y, motion('bob', body, (index % 4) + 1), 0, size), index)
}

const FLOOR_SNAILS = [
  [150, 185.5, 0.72],
  [108, 185.5, 0.72],
  [66, 185.5, 0.72],
  [28, 185.5, 0.66],
  [178, 118, 0.5],
] as const

function snailArmy(parts: GardenParts): Art {
  return FLOOR_SNAILS.slice(0, parts.snails).map(([x, y, size], i) => {
    const kit = i === 0 && parts.flag ? 2 : parts.helmets ? 1 : 0
    return snail(x, y, size, i, kit)
  })
}

function bubbleTail(points: ReadonlyArray<readonly [number, number, number]>): Art {
  return points.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${C.cream} />`)
}

function trowelBubble(): Art {
  return part('bubble', [
    bubbleTail([
      [122, 92, 4],
      [134, 80, 6.5],
    ]),
    at(
      156,
      44,
      motion('pulse', [svg`<circle r="30" fill=${C.cream} />`, at(-13, 18, trowel(), 34, 0.46)]),
    ),
  ])
}

function exclaim(x: number, tilt: number): Art {
  return at(
    x,
    0,
    [
      svg`<rect x="-4.5" y="-18" width="9" height="23" rx="4.5" fill=${C.coral} />`,
      svg`<circle cy="14" r="5" fill=${C.coral} />`,
    ],
    tilt,
  )
}

function helpBubble(): Art {
  return part('help', [
    bubbleTail([
      [117, 58, 3.4],
      [122, 51, 5],
    ]),
    at(
      134,
      36,
      motion('pulse', [svg`<circle r="22" fill=${C.cream} />`, exclaim(-7, -8), exclaim(8, 8)]),
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

function bedView(parts: GardenParts, wood: Wood): Art {
  const size = 0.72 + parts.carrot * 0.1
  const weeds = WEEDS.slice(0, parts.weeds).filter((_, i) => !parts.help || i !== 1)
  const flySpots = [
    [92, 22],
    [177, 76],
  ] as const
  return [
    shadow(100, 184, 86),
    soilBack(C.soil),
    parts.help
      ? [carrot(52, 120, 0.56, 3, 0), carrot(146, 120, 0.56, 3, 1)]
      : [
          carrot(58, 120, size, parts.limp, 0),
          carrot(100, 120, size, parts.limp, 1),
          carrot(142, 120, size, parts.limp, 2),
        ],
    weeds.map((spot, i) => weed(spot, parts.tower, i)),
    when(parts.help, () => helpCarrot(100, 120)),
    when(parts.trowel, () => at(173, 120, trowel(), 14, 0.66)),
    soilFront(mix(C.soil, C.wicker, 0.14)),
    planks(wood, parts),
    snailArmy(parts),
    when(parts.bubble, trowelBubble),
    when(parts.help, helpBubble),
    when(parts.asleep, () => [zed(136, 50, 0.7, 1), zed(152, 34, 1, 2), zed(170, 20, 0.6, 3)]),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function clod(x: number, y: number, size: number, delay: number, color: string): Art {
  return part(
    'clod',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<path d="M-7 2C-9-4-4-8 1-7C7-8 9-2 7 3C4 8-5 7-7 2Z" fill=${color} />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function uprooted(): Art {
  const roots = ['M-8 4Q-12 16-7 26', 'M-3 6Q-1 20-6 33', 'M3 6Q7 18 3 30', 'M9 3Q15 12 12 22']
  return part('uprooted', [
    roots.map(
      (d) =>
        svg`<path d=${d} fill="none" stroke=${ROOT} stroke-width="2.8" stroke-linecap="round" />`,
    ),
    at(0, -2, dandelion(46, 4, false)),
    svg`<path d="M-15 3C-17-5-8-9-1-7C7-10 16-5 15 3C13 11-13 11-15 3Z" fill=${C.soil} />`,
  ])
}

function pullingView(parts: GardenParts, wood: Wood): Art {
  const clods = [
    [64, 78, 1.25, 1, CLOD],
    [44, 56, 0.9, 2, CLOD],
    [28, 86, 1.05, 3, C.soil],
    [78, 42, 0.75, 4, CLOD],
    [132, 92, 0.9, 2, CLOD],
    [172, 84, 0.8, 5, CLOD],
    [182, 60, 0.6, 3, CLOD],
  ] as const
  const lever: Art = [at(-4, -28, uprooted(), -6), at(0, 0, trowel(), 34)]
  return [
    shadow(100, 184, 86),
    soilBack(C.soil),
    weed({ kind: 'tuft', x: 166, h: 26, grow: 14, lean: 0 }, parts.tower, 0),
    carrot(52, 120, 0.8, 0, 0),
    part('dig-hole', svg`<ellipse cx="100" cy="112" rx="26" ry="9" fill=${C.soilWet} />`),
    at(104, 116, part('lever', motion('wobble', lever))),
    soilFront(mix(C.soil, C.wicker, 0.14)),
    planks(wood, parts),
    clods.map(([x, y, s, d, color]) => clod(x, y, s, d, color)),
    part(
      'effort',
      (
        [
          ['M168 25q9 2 13 10', 1],
          ['M175 15q8 3 12 11', 3],
        ] as const
      ).map(([d, delay]) =>
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,
          delay,
        ),
      ),
    ),
    snailArmy(parts),
  ]
}

function packet(grazed: boolean): Art {
  return part('seed-packet', [
    svg`<rect x="-3" y="-34" width="6" height="58" rx="2" fill=${C.creamDark} />`,
    svg`<rect x="-26" y="-92" width="52" height="66" rx="5" fill=${C.cream} />`,
    svg`<path d="M-26-74V-87Q-26-92-21-92H21Q26-92 26-87V-74Z" fill=${C.mint} />`,
    svg`<path d="M-16-83H16" stroke=${C.mintDark} stroke-width="4" stroke-linecap="round" />`,
    at(0, -52, [
      at(0, -13, tops(13, 28, 0)),
      svg`<path d="M-9-14C-5-18 5-18 9-14C9-1 4 10 0 18C-4 10-9-1-9-14Z" fill=${CARROT} />`,
      svg`<path d="M-5-7H1M1 1H6" stroke=${CARROT_DARK} stroke-width="2.2" stroke-linecap="round" />`,
    ]),
    when(grazed, () => snail(9, -91, 0.46, 2, 0)),
  ])
}

function wateringCan(): Art {
  return part('watering-can', [
    svg`<path d="M24-30A15 15 0 0 1 24 0" fill="none" stroke=${C.skyDark} stroke-width="6" stroke-linecap="round" />`,
    svg`<path d="M-14-16L-38-38" stroke=${C.sky} stroke-width="8" stroke-linecap="round" />`,
    svg`<rect x="-47" y="-49" width="10" height="20" rx="3" transform="rotate(-42 -42 -39)" fill=${C.skyDark} />`,
    svg`<path d="M-20-36H24V-5Q24 0 19 0H-15Q-20 0-20-5Z" fill=${C.sky} />`,
    svg`<rect x="-24" y="-41" width="52" height="8" rx="4" fill=${C.skyDark} />`,
    svg`<path d="M-11-28V-8" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".45" />`,
  ])
}

function seeds(): Art {
  const spots = [46, 66, 86, 114, 134, 154]
  return part('seeds', [
    spots.map(
      (x, i) => svg`<ellipse cx=${x} cy=${i % 2 ? 108 : 106} rx="3.4" ry="2.3" fill=${SEED} />`,
    ),
  ])
}

function cracksOn(step: number): Art {
  if (step === 0) return []
  const lines = ['M44 112l5 3-2 4 5 2', 'M138 110l-4 4 3 3-5 3']
  const more = ['M78 106l4 4-3 3 5 3', 'M118 106l-3 4 4 3-2 4']
  return part(
    'cracks',
    [...lines, ...(step >= 2 ? more : [])].map(
      (d) =>
        svg`<path d=${d} fill="none" stroke=${CLOD} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
  )
}

function sowingView(parts: GardenParts, wood: Wood, soil: string): Art {
  const flySpots = [
    [36, 48],
    [176, 40],
  ] as const
  const waiting = [
    [150, 185.5, 0.66],
    [66, 185.5, 0.66],
  ] as const
  return [
    shadow(100, 184, 86),
    soilBack(soil),
    seeds(),
    cracksOn(parts.cracks),
    at(72, 122, motion('sway', packet(parts.grazing))),
    soilFront(mix(soil, C.wicker, 0.14)),
    planks(wood, parts),
    at(146, 122, wateringCan(), 0, 0.92),
    part('hanging-drop', at(103, 97, motion('drip', drop(0, 0, C.water, 0.8), 2))),
    waiting.slice(0, parts.snails).map(([x, y, size], i) => snail(x, y, size, i, 0)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function wing(side: number): Art {
  return svg`<g transform=${`scale(${side} 1)`}>
  <path d="M1-2C8-20 28-22 29-9C29 1 13 5 1 2Z" fill=${C.pink} />
  <path d="M1 1C10 3 21 7 18 17C14 25 3 17 1 6Z" fill=${C.sun} />
  <circle cx="19" cy="-10" r="4" fill=${C.cream} />
  <circle cx="11" cy="11" r="2.8" fill=${C.coral} />
</g>`
}

function butterfly(): Art {
  return part(
    'butterfly',
    at(
      156,
      36,
      motion(
        'drift',
        motion('bob', [
          svg`<path d="M-58 34q16 22 30 2t10-14" fill="none" stroke=${C.cream} stroke-width="2" stroke-linecap="round" stroke-dasharray="1 6" opacity=".7" />`,
          at(
            0,
            0,
            [
              wing(-1),
              wing(1),
              svg`<rect x="-2.6" y="-12" width="5.2" height="26" rx="2.6" fill=${C.fly} />`,
              svg`<path d="M-1-12Q-3-20-8-22M1-12Q3-20 8-22" fill="none" stroke=${C.fly} stroke-width="1.8" stroke-linecap="round" />`,
            ],
            16,
          ),
        ]),
        2,
      ),
    ),
  )
}

function bigCarrot(x: number, y: number, rotate: number): Art {
  return at(
    x,
    y,
    [
      at(0, -20, tops(22, 30, 0)),
      svg`<path d="M-12-20C-7-25 7-25 12-20C12-2 5 14 0 26C-5 14-12-2-12-20Z" fill=${CARROT} />`,
      svg`<path d="M-7-10H1M2-1H8M-5 8H1" stroke=${CARROT_DARK} stroke-width="2.6" stroke-linecap="round" />`,
    ],
    rotate,
    0.8,
  )
}

function harvestView(parts: GardenParts, wood: Wood): Art {
  return [
    shadow(100, 184, 86),
    soilBack(C.soilWet),
    part('rows', [
      carrot(46, 118, 1.12, 0, 0),
      carrot(100, 116, 1.36, 0, 1),
      carrot(154, 118, 1.12, 0, 2),
    ]),
    soilFront(mix(C.soilWet, C.wicker, 0.12)),
    planks(wood, parts),
    part('harvest', bigCarrot(156, 177, 72)),
    butterfly(),
    sparkle(28, 40, 1, 1),
    sparkle(72, 24, 0.8, 3),
    sparkle(182, 92, 0.75, 2),
  ]
}

export function garden(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = gardenParts(scene)
  const wood = woodOf(scene)
  const views: Record<GardenView, () => Art> = {
    bed: () => bedView(parts, wood),
    pulling: () => pullingView(parts, wood),
    sowing: () => sowingView(parts, wood, C.soil),
    harvest: () => harvestView(parts, wood),
  }
  return frame('garden', scene, options, views[parts.view]())
}
