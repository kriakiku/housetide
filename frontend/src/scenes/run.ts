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
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type RunView = 'idle' | 'dash' | 'stretch' | 'finish'

export interface RunParts {
  view: RunView
  dust: number
  untied: number
  pleading: boolean
  asleep: boolean
  web: boolean
  stench: number
  mouse: boolean
  moved: boolean
  flies: number
  progress: number
  mood: Mood
}

export const MAX_UNTIED = 3

const FILL_AT = [0.05, 0.33, 0.66] as const
const WEB_AT = 0.12
const STENCH_AT = [0.3, 0.5, 0.75] as const
const MOUSE_AT = 0.55
const MOVED_AT = 0.8
const FLIES_AT = [0.65, 0.88] as const
const SICK_AT = 0.5

const QUIET = {
  dust: 0,
  untied: 0,
  pleading: false,
  asleep: false,
  web: false,
  stench: 0,
  mouse: false,
  moved: false,
  flies: 0,
  progress: 0,
} as const

export function runParts(scene: SceneView): RunParts {
  const { state } = scene
  if (state === 'clean') return { ...QUIET, view: 'finish', mood: 'happy' }
  const stink = clamp01(scene.stink)
  const sick = stink >= SICK_AT
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  if (state === 'running') {
    return {
      ...QUIET,
      view: 'dash',
      stench: Math.min(2, stench),
      progress: clamp01(scene.progress),
      mood: 'happy',
    }
  }
  const neglect = {
    web: stink >= WEB_AT,
    stench,
    mouse: stink >= MOUSE_AT,
    moved: stink >= MOVED_AT,
    flies,
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      ...neglect,
      moved: false,
      stench: Math.min(2, stench),
      view: 'stretch',
      mood: sick ? 'sick' : 'calm',
    }
  }
  const resting = state === 'resting'
  const due = state === 'due'
  const step = due ? MAX_UNTIED : resting ? 0 : reached(clamp01(scene.fill), FILL_AT)
  let mood: Mood = resting ? 'sleepy' : step >= 2 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...neglect,
    view: 'idle',
    dust: step,
    untied: step,
    pleading: due,
    asleep: resting,
    mood,
  }
}

const SCALE = 1.08
const GROUND = 176

const KNOT = [-6, -70] as const
const LACE = '#fff8ea'
const AGLET = C.sun
const DUST = '#d8c79c'
const DUST_DARK = '#b6a477'
const WEB = '#e6ebf5'
const PATH = '#4b4560'
const PATH_EDGE = '#5c5573'
const HILL = '#ffffff'
const SPEED = '#a9c8f0'
const NOOK = '#171a2e'
const MOUSE = '#aab3c9'
const MOUSE_DARK = '#7d87a3'
const BOTTLE = C.sky
const STONE = '#6f7796'
const STONE_LIGHT = '#8c94b0'
const CHECK_DARK = '#223258'

const BARS = [
  [-9.1, -67.5],
  [2, -61],
  [15.4, -56.2],
  [28.8, -53],
] as const

function backdrop(drifting: boolean): Art {
  const hills = svg`<path d="M8 168C26 142 52 138 74 156C86 146 100 144 116 158C134 136 168 138 192 168Z" fill=${HILL} opacity=".06" />`
  const pines = [
    [40, 158, 1],
    [54, 163, 0.72],
    [160, 156, 1.1],
  ] as const
  const trees = pines.map(([x, y, s]) =>
    at(x, y, svg`<path d="M0-30L10-14H5L13 0H-13L-5-14H-10Z" fill=${HILL} opacity=".09" />`, 0, s),
  )
  return part('hills', drifting ? motion('drift', [hills, trees], 2) : [hills, trees])
}

function road(moving: boolean): Art {
  const dashes = [24, 62, 100, 138].map(
    (x) =>
      svg`<rect x=${x} y="182" width="24" height="2.6" rx="1.3" fill=${C.creamDark} opacity=".75" />`,
  )
  return part('path', [
    svg`<rect x="8" y="170" width="184" height="17" rx="8.5" fill=${PATH} />`,
    svg`<rect x="8" y="170" width="184" height="4" rx="2" fill=${PATH_EDGE} />`,
    moving ? motion('drift', dashes) : dashes,
  ])
}

function web(): Art {
  const spokes = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const a = (i * Math.PI) / 4
    return svg`<path d=${`M0 0L${round(Math.cos(a) * 21)} ${round(Math.sin(a) * 9)}`} />`
  })
  const rings = [0.5, 1].map((k) => svg`<ellipse rx=${round(21 * k)} ry=${round(9 * k)} />`)
  return part(
    'cobweb',
    at(
      -38,
      -76,
      svg`<g fill="none" stroke=${WEB} stroke-width="1.4" stroke-linecap="round">${spokes}${rings}</g>`,
    ),
  )
}

function spider(): Art {
  return part('spider', [
    svg`<path d="M-62-74V-40" stroke=${WEB} stroke-width="1.2" />`,
    at(
      -62,
      -74,
      motion('sway', [
        at(
          0,
          34,
          svg`<path d="M-8-5L-3-1M8-5L3-1M-9 1H-3M9 1H3M-7 7L-3 3M7 7L3 3" stroke=${C.fly} stroke-width="1.6" stroke-linecap="round" /><circle r="5" fill=${C.fly} />`,
        ),
      ]),
    ),
  ])
}

function mouseHead(): Art {
  return part(
    'mouse',
    at(-38, -80, [
      svg`<circle cx="-10" cy="-8" r="7" fill=${MOUSE_DARK} /><circle cx="10" cy="-8" r="7" fill=${MOUSE_DARK} />`,
      svg`<circle cx="-10" cy="-8" r="4" fill=${C.pink} /><circle cx="10" cy="-8" r="4" fill=${C.pink} />`,
      svg`<circle r="11" fill=${MOUSE} />`,
      svg`<circle cx="-4.5" cy="-1.5" r="2" fill=${C.fly} /><circle cx="4.5" cy="-1.5" r="2" fill=${C.fly} />`,
      svg`<circle cy="3" r="2.2" fill=${C.pinkDark} />`,
      svg`<path d="M-7 3H-17M-7 6L-15 9M7 3H17M7 6L15 9" stroke=${C.cream} stroke-width="1.2" stroke-linecap="round" />`,
    ]),
  )
}

function chimney(): Art {
  return part('chimney', [
    svg`<rect x="-59" y="-104" width="11" height="30" fill=${C.terracotta} />`,
    svg`<rect x="-62" y="-108" width="17" height="6" rx="2" fill=${C.terracottaDark} />`,
    at(-52, -115, motion('rise', svg`<circle r="5.5" fill=${C.metalMid} opacity=".85" />`, 1)),
  ])
}

function cottage(shade: string): Art {
  return part('cottage', [
    at(-56, -34, [
      svg`<circle r="7.6" fill=${C.cream} />`,
      svg`<circle r="5.6" fill=${C.sun} />`,
      svg`<path d="M0-5.6V5.6M-5.6 0H5.6" stroke=${shade} stroke-width="1.6" />`,
    ]),
  ])
}

function barsArt(count: number): Art {
  return BARS.slice(BARS.length - count).map(
    ([x, y], i) =>
      svg`<path d=${`M${round(x + 1.2)} ${round(y - 2.2)}L${round(x - 5.4)} ${round(y + 9.4)}`} stroke=${LACE} stroke-width="4.6" stroke-linecap="round" data-index=${i} />`,
  )
}

function bow(droop: boolean): Art {
  const loop = droop
    ? 'M0 0C-8 3-22 8-20 15C-17 21-5 12 0 0Z'
    : 'M0 0C-12-13-25-10-24-1C-23 7-9 6 0 0Z'
  const loopRight = droop
    ? 'M0 0C8 3 21 10 18 17C15 22 4 12 0 0Z'
    : 'M0 0C12-13 25-10 24-1C23 7 9 6 0 0Z'
  const tails = droop
    ? 'M0 0C-3 12-8 18-6 28M0 0C4 12 10 18 10 30'
    : 'M0 0C-3 8-8 12-13 17M0 0C3 8 8 12 13 17'
  return part(
    'bow',
    at(
      KNOT[0],
      KNOT[1],
      [
        svg`<path d=${tails} fill="none" stroke=${LACE} stroke-width="3.6" stroke-linecap="round" />`,
        svg`<path d=${loop} fill=${LACE} /><path d=${loopRight} fill=${LACE} />`,
        svg`<circle r="4" fill=${C.creamDark} />`,
      ],
      droop ? -18 : 24,
      1.05,
    ),
  )
}

function aglet(x: number, y: number, rotate: number): Art {
  return at(
    x,
    y,
    svg`<rect x="-2.6" y="-7" width="5.2" height="11" rx="2" fill=${AGLET} />`,
    rotate,
  )
}

function trailingLace(d: string, x: number, y: number, rotate: number): Art {
  return [
    svg`<path d=${d} fill="none" stroke=${LACE} stroke-width="3.8" stroke-linecap="round" />`,
    aglet(x, y, rotate),
  ]
}

function swayingLace(d: string, x: number, y: number, rotate: number, delay: number): Art {
  return motion('sway', trailingLace(d, x, y, rotate), delay)
}

function loosened(untied: number): Art {
  return part('loose-laces', [
    trailingLace('M-6-70C20-78 52-58 60-30C63-12 66 0 76 1', 80, 1, 92),
    when(untied >= 3, () => trailingLace('M-6-70C4-90 34-72 32-44C31-24 26-4 8 2', 3, 3, -96)),
    svg`<circle cx=${KNOT[0]} cy=${KNOT[1]} r="4" fill=${C.creamDark} />`,
  ])
}

function raisedLaces(): Art {
  return part(
    'raised-laces',
    at(KNOT[0], KNOT[1], [
      swayingLace('M0 0C-10-22-34-24-30-58', -30, -60, -6, 1),
      swayingLace('M0 0C12-20 36-24 34-54', 34, -56, 6, 3),
      svg`<circle r="4.4" fill=${C.creamDark} />`,
    ]),
  )
}

function streamingLaces(): Art {
  return part(
    'streaming-laces',
    at(
      KNOT[0],
      KNOT[1],
      motion('sway', [
        trailingLace('M0 0C-20-22-42 2-62-10C-72-16-80-8-90-12', -92, -12, -80),
        trailingLace('M0 0C-14-30-40-14-58-26C-66-32-74-26-84-32', -86, -33, -72),
      ]),
    ),
  )
}

function dustOn(step: number): Art {
  if (step === 0) return []
  const specks = [
    [-46, -34, 1.8],
    [-8, -30, 1.6],
    [8, -36, 2],
    [36, -30, 1.8],
    [58, -28, 2],
    [-34, -26, 1.5],
    [24, -24, 1.4],
  ] as const
  return part('dust', [
    specks.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST} />`),
    when(
      step >= 2,
      () =>
        svg`<path d="M42-52C50-57 68-56 76-44C80-40 81-36 81-32C70-44 54-48 42-52Z" fill=${DUST} />`,
    ),
    when(
      step >= 3,
      () =>
        svg`<path d="M-64-60C-68-70-58-78-50-70C-48-66-56-60-64-60ZM6-61C12-66 22-61 30-58C36-58 40-54 42-52C28-54 16-56 6-61Z" fill=${DUST} />`,
    ),
  ])
}

function dustBunnies(step: number): Art {
  if (step < 1) return []
  const all = [
    [30, 176, 9],
    [168, 180, 7],
    [60, 182, 5.5],
  ] as const
  return part(
    'dust-bunny',
    all
      .slice(0, step)
      .map(
        ([x, y, r]) =>
          svg`<ellipse cx=${x} cy=${y} rx=${r} ry=${round(r * 0.55)} fill=${DUST_DARK} /><ellipse cx=${x - 1.5} cy=${y - 1.6} rx=${round(r * 0.66)} ry=${round(r * 0.36)} fill=${DUST} />`,
      ),
  )
}

function inkOn(accent: string): string {
  const n = Number.parseInt(accent.slice(1), 16)
  const light = (0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255
  return light < 0.36 ? C.cream : shadeOf(accent, 0.86)
}

interface Shoe {
  parts: RunParts
  accent: string
  laces: Art
  barCount?: number
}

function shoe({ parts, accent, laces, barCount = 4 }: Shoe): Art {
  const dusty = mix(accent, DUST, parts.dust * 0.09)
  const dark = shadeOf(dusty, 0.26)
  const light = tintOf(dusty, 0.42)
  const pale = tintOf(dusty, 0.66)
  const toe = tintOf(dusty, 0.22)
  const ink = inkOn(accent)
  return part('shoe', [
    svg`<path d="M-26-68L-24-92Q-23-100-14-97L2-90Q7-87 4-81L-4-62Z" fill=${light} />`,
    svg`<path d="M-20-87L-4-81" stroke=${pale} stroke-width="3" stroke-linecap="round" />`,
    svg`<ellipse cx="-38" cy="-76" rx="23" ry="10" fill=${NOOK} />`,
    when(parts.moved, chimney),
    when(parts.web, web),
    when(parts.mouse, mouseHead),
    svg`<path d="M-64-16C-69-30-67-40-65-50C-64-58-62-66-60-74C-50-62-28-62-16-74C-6-62 12-56 34-52C58-52 82-48 82-20L82-14H-64Z" fill=${dusty} />`,
    svg`<path d="M-16-74C-6-62 12-56 34-52L30-41C12-44-9-52-25-63Z" fill=${dark} />`,
    svg`<path d="M34-52C58-52 82-48 82-20L82-14H28C36-24 38-40 34-52Z" fill=${toe} />`,
    svg`<g fill=${pale}><circle cx="52" cy="-39" r="2.4" /><circle cx="62" cy="-36" r="2.4" /><circle cx="70" cy="-30" r="2.4" /></g>`,
    svg`<path d="M-64-14C-69-30-67-40-65-50C-54-53-44-44-42-14Z" fill=${dark} />`,
    svg`<path d="M-60-74C-50-62-28-62-16-74" fill="none" stroke=${pale} stroke-width="5" stroke-linecap="round" />`,
    svg`<path d="M2-38L12-20H21L11-38ZM14-38L24-20H31L21-38Z" fill=${pale} />`,
    at(-59, -68, svg`<rect x="-5" y="-11" width="9" height="19" rx="3" fill=${C.sun} />`, 14),
    svg`<path d="M-68-25C-71-8-64 0-54 0H52C70 0 88-6 88-20C88-24 85-25 82-24C63-17 44-18 22-20H-40C-50-20-60-21-68-25Z" fill=${C.cream} />`,
    svg`<path d="M-48-14L-44-5M-30-14L-26-5M-12-14L-8-5M6-14L10-5M24-14L28-5M42-13L46-5M60-12L63-5" stroke=${C.creamDark} stroke-width="3" stroke-linecap="round" />`,
    svg`<path d="M-67-9C-64-3-60 0-54 0H52C63 0 76-2 86-11L84-5C76 2 62 3 52 3H-54C-62 3-66-2-67-9Z" fill=${shadeOf(accent, 0.45)} />`,
    when(parts.moved, () => cottage(dark)),
    face(-28, -40, parts.mood, ink, 1.12),
    barsArt(barCount),
    laces,
    dustOn(parts.dust),
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

function dreamBubble(): Art {
  const squares = [0, 1, 2, 3, 4, 5].map((i) => {
    const col = i % 3
    const row = Math.floor(i / 3)
    return svg`<rect x=${-4 + col * 7} y=${-15 + row * 7} width="7" height="7" fill=${(col + row) % 2 === 0 ? CHECK_DARK : '#fff'} />`
  })
  return part('wish', [
    svg`<circle cx="130" cy="72" r="3.6" fill=${C.cream} /><circle cx="139" cy="62" r="5.4" fill=${C.cream} />`,
    at(
      162,
      42,
      motion('pulse', [
        svg`<circle r="25" fill=${C.cream} />`,
        svg`<rect x="-7" y="-16" width="3.4" height="32" rx="1.7" fill=${C.wickerDark} />`,
        squares,
        svg`<rect x="-4" y="-15" width="21" height="14" fill="none" stroke=${CHECK_DARK} stroke-width="1.4" />`,
      ]),
    ),
  ])
}

type Spots = ReadonlyArray<readonly [number, number]>

const IDLE_STENCH: Spots = [
  [20, 122],
  [182, 124],
  [146, 112],
]
const IDLE_FLIES: Spots = [
  [24, 34],
  [110, 28],
]
const STRETCH_STENCH: Spots = [
  [184, 124],
  [152, 92],
]
const STRETCH_FLIES: Spots = [
  [70, 40],
  [172, 44],
]

function neglectOverlay(parts: RunParts, lines: Spots, spots: Spots): Art {
  return [
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function idleView(parts: RunParts, accent: string): Art {
  let laces: Art
  if (parts.pleading) laces = raisedLaces()
  else if (parts.untied >= 2) laces = loosened(parts.untied)
  else laces = bow(parts.untied === 1)
  const barCount = parts.pleading || parts.untied >= 3 ? 3 : 4
  return [
    backdrop(false),
    road(false),
    shadow(100, 182, 74),
    dustBunnies(parts.dust),
    at(93, GROUND, shoe({ parts, accent, laces, barCount }), parts.pleading ? -3 : 0, SCALE),
    when(parts.web && !parts.moved, () => at(93, GROUND, spider(), 0, SCALE)),
    when(parts.pleading, dreamBubble),
    when(parts.asleep, () => [zed(136, 74, 0.72, 1), zed(154, 52, 1, 2), zed(172, 32, 0.66, 3)]),
    neglectOverlay(parts, IDLE_STENCH, IDLE_FLIES),
  ]
}

function speedLines(): Art {
  const lines = [
    [16, 104, 24, 1],
    [10, 124, 34, 3],
    [24, 143, 20, 2],
  ] as const
  return part(
    'speed',
    lines.map(([x, y, w, d]) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${`M0 0H${w}`} stroke=${SPEED} stroke-width="4.5" stroke-linecap="round" />`,
          d,
        ),
      ),
    ),
  )
}

function puffs(): Art {
  const all = [
    [46, 164, 11, 1],
    [26, 158, 8, 3],
    [64, 172, 7, 2],
    [17, 171, 5, 4],
  ] as const
  return part(
    'puffs',
    all.map(([x, y, r, d]) =>
      at(
        x,
        y,
        motion(
          'drift',
          svg`<circle r=${r} fill=${C.cream} /><circle cx=${round(r * 0.3)} cy=${round(r * 0.3)} r=${round(r * 0.55)} fill=${C.creamDark} />`,
          d,
        ),
      ),
    ),
  )
}

function routeMeter(progress: number): Art {
  const left = 58
  const width = 88
  const reachedX = round(left + width * progress)
  return part('route', [
    svg`<path d=${`M${left} 30H${left + width}`} stroke=${C.fly} stroke-width="7" stroke-linecap="round" opacity=".5" />`,
    svg`<path d=${`M${left} 30H${reachedX}`} stroke=${C.sun} stroke-width="7" stroke-linecap="round" />`,
    svg`<circle cx=${reachedX} cy="30" r="7.5" fill=${C.cream} />`,
    at(left + width + 8, 30, [
      svg`<rect x="-1.5" y="-14" width="3" height="20" rx="1.5" fill=${C.cream} />`,
      svg`<path d="M1-14H15L11-9L15-4H1Z" fill=${C.coral} />`,
    ]),
  ])
}

function dashView(parts: RunParts, accent: string): Art {
  return [
    backdrop(true),
    road(true),
    shadow(112, 182, 58, 0.22),
    speedLines(),
    puffs(),
    at(
      112,
      144,
      motion('rumble', at(0, 0, shoe({ parts, accent, laces: streamingLaces() }), 9, 0.84)),
    ),
    routeMeter(parts.progress),
    stenchLines(
      (
        [
          [170, 128],
          [146, 100],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

function waterBottle(): Art {
  const dark = shadeOf(BOTTLE, 0.26)
  const light = tintOf(BOTTLE, 0.55)
  return part('bottle', [
    shadow(0, 2, 22, 0.26),
    svg`<rect x="-5" y="-92" width="10" height="11" rx="3.5" fill=${C.sun} />`,
    svg`<path d="M-11-80H11L13-71H-13Z" fill=${C.cream} />`,
    svg`<path d="M-17-5Q-17 0-12 0H12Q17 0 17-5V-26Q13-33 17-40V-62Q17-71 10-72H-10Q-17-71-17-62V-40Q-13-33-17-26Z" fill=${BOTTLE} />`,
    svg`<path d="M17-5Q17 0 12 0H4Q9 0 9-5V-26Q5-33 9-40V-62Q9-70 3-72H10Q17-71 17-62V-40Q13-33 17-26Z" fill=${dark} />`,
    svg`<rect x="-11" y="-63" width="4" height="20" rx="2" fill=${light} />`,
    svg`<rect x="-11" y="-22" width="4" height="13" rx="2" fill=${light} />`,
    svg`<path d="M-5-17H4M-5-11H1" stroke=${C.cream} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function pendingDrop(): Art {
  return part(
    'pending',
    at(29, 74, [
      motion('pulse', svg`<circle r="15" fill=${C.cream} />`),
      motion('bob', drop(0, 1, C.waterDark, 1.1)),
    ]),
  )
}

function stretchView(parts: RunParts, accent: string): Art {
  const body = at(60, 0, shoe({ parts, accent, laces: [] }))
  return [
    backdrop(false),
    road(false),
    shadow(116, 182, 68),
    part('curb', [
      svg`<rect x="138" y="155" width="52" height="27" rx="7" fill=${STONE} />`,
      svg`<rect x="138" y="155" width="52" height="9" rx="4.5" fill=${STONE_LIGHT} />`,
    ]),
    at(29, 182, waterBottle(), 0, 0.85),
    at(68, GROUND, body, -14, 0.8),
    part(
      'stretching-laces',
      at(96, 111, [
        swayingLace('M0 0C-12-30-44-34-50-10', -50, -8, 196, 1),
        swayingLace('M0 0C14-20 8-40 24-56', 25, -58, 18, 3),
        svg`<circle r="3.8" fill=${C.creamDark} />`,
      ]),
    ),
    pendingDrop(),
    at(142, 100, motion('drip', drop(0, 0, C.water, 0.8), 1)),
    at(160, 112, motion('drip', drop(0, 0, C.water, 0.6), 3)),
    neglectOverlay(parts, STRETCH_STENCH, STRETCH_FLIES),
  ]
}

function medal(): Art {
  return part('medal', [
    svg`<path d="M-14-73L16-36M3-65L24-36" stroke=${C.sky} stroke-width="6" stroke-linecap="round" />`,
    at(
      20,
      -29,
      [
        svg`<circle r="17" fill=${C.sunDark} />`,
        svg`<circle r="13.6" fill=${C.sun} />`,
        svg`<path d="M0-8L2.4-2.6L8.2-2L3.8 1.8L5 7.6L0 4.6L-5 7.6L-3.8 1.8L-8.2-2L-2.4-2.6Z" fill=${C.spark} />`,
      ],
      0,
    ),
  ])
}

function finishArch(): Art {
  const cols = 16
  const size = 10.5
  const checks = Array.from({ length: cols * 2 }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    return svg`<rect x=${16 + col * size} y=${round(20 + row * size)} width=${size} height=${size} fill=${(col + row) % 2 === 0 ? C.cream : CHECK_DARK} />`
  })
  return part('arch', [
    svg`<rect x="12" y="26" width="7" height="156" rx="3.5" fill=${C.metalMid} />`,
    svg`<rect x="181" y="26" width="7" height="156" rx="3.5" fill=${C.metalMid} />`,
    checks,
  ])
}

function ribbonPiece(d: string, tail: string): Art {
  return [
    svg`<path d=${d} fill="none" stroke=${C.sun} stroke-width="9" stroke-linejoin="round" />`,
    svg`<path d=${tail} fill=${C.sun} />`,
  ]
}

function ribbon(): Art {
  return part('ribbon', [
    at(
      184,
      104,
      motion(
        'sway',
        ribbonPiece(
          'M0 0C-10-14-18 6-28-8C-34-16-38-18-44-18',
          'M-40-22.5H-58L-52-18L-58-13.5H-40Z',
        ),
        1,
      ),
    ),
    at(
      16,
      104,
      motion(
        'sway',
        ribbonPiece('M0 0C10-14 18 6 28-8C34-16 38-18 44-18', 'M40-22.5H58L52-18L58-13.5H40Z'),
        3,
      ),
    ),
  ])
}

function confetti(): Art {
  const bits = [
    [42, 60, C.pink, 20, 1],
    [72, 56, C.mint, -30, 2],
    [146, 58, C.lilac, 40, 3],
    [166, 66, C.coral, -15, 4],
    [106, 70, C.sky, 50, 5],
  ] as const
  return part(
    'confetti',
    bits.map(([x, y, color, r, d]) =>
      at(
        x,
        y,
        motion('fall', svg`<rect x="-5" y="-2" width="10" height="4.5" rx="2" fill=${color} />`, d),
        r,
      ),
    ),
  )
}

function finishView(parts: RunParts, accent: string): Art {
  return [
    backdrop(false),
    road(false),
    finishArch(),
    shadow(100, 182, 62, 0.24),
    ribbon(),
    at(100, GROUND - 4, motion('bob', at(0, 0, shoe({ parts, accent, laces: [] }), -4, 0.86))),
    at(100, GROUND - 4, motion('bob', at(0, 0, medal(), -4, 0.86))),
    confetti(),
    sparkle(126, 80, 1.15, 1),
    sparkle(34, 136, 0.8, 2),
    sparkle(172, 128, 0.9, 3),
  ]
}

export function run(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = runParts(scene)
  const accent = accentOf(scene, C.coral)
  const views: Record<RunView, (parts: RunParts, accent: string) => Art> = {
    idle: idleView,
    dash: dashView,
    stretch: stretchView,
    finish: finishView,
  }
  return frame('run', scene, options, views[parts.view](parts, accent))
}
