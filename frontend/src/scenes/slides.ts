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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type SlidesChart = 'ghost' | 'build' | 'calm' | 'down' | 'up'

export interface SlidesParts {
  rolled: boolean
  chart: SlidesChart
  built: number
  bullets: number
  cards: number
  clock: boolean
  notes: number
  rings: number
  spill: boolean
  arrow: boolean
  scribble: boolean
  fire: number
  panic: number
  sweat: boolean
  pointer: boolean
  lectern: boolean
  party: boolean
  mood: Mood
}

export const MAX_STEP = 4
export const MAX_BARS = 4

const CARDS_PER_STEP = 2
const LEFT_PILE = 5
const DUE_CARDS = 7

const NOTES_AT = [0.05, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9] as const
const RINGS_AT = [0.1, 0.35, 0.6] as const
const PANIC_AT = [0.4, 0.6, 0.8] as const
const FIRE_AT = [0.72, 0.88] as const
const DOWN_AT = 0.25
const ARROW_AT = 0.45
const SCRIBBLE_AT = 0.5
const SPILL_AT = 0.55
const SICK_AT = 0.6

const QUIET = {
  rolled: false,
  chart: 'calm',
  built: MAX_BARS,
  bullets: 3,
  cards: 0,
  clock: false,
  notes: 0,
  rings: 0,
  spill: false,
  arrow: false,
  scribble: false,
  fire: 0,
  panic: 0,
  sweat: false,
  pointer: false,
  lectern: false,
  party: false,
} as const

export function slidesParts(scene: SceneView): SlidesParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...QUIET, chart: 'up', party: true, mood: 'happy' }
  }
  const notes = reached(stink, NOTES_AT)
  const rings = reached(stink, RINGS_AT)
  const sick = stink >= SICK_AT
  const down = stink >= DOWN_AT
  if (state === 'running') {
    const progress = clamp01(scene.progress)
    const built = Math.min(MAX_BARS, Math.floor(progress * MAX_BARS) + 1)
    return {
      ...QUIET,
      chart: 'build',
      built,
      bullets: Math.min(3, built - 1),
      cards: Math.max(1, 3 - Math.floor(progress * 3)),
      notes: Math.min(2, notes),
      rings: Math.min(1, rings),
      pointer: true,
      mood: 'happy',
    }
  }
  const damage = {
    notes,
    rings,
    spill: stink >= SPILL_AT,
    arrow: stink >= ARROW_AT,
    scribble: stink >= SCRIBBLE_AT,
    fire: reached(stink, FIRE_AT),
    panic: reached(stink, PANIC_AT),
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      ...damage,
      chart: down ? 'down' : 'calm',
      lectern: true,
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const step = due ? MAX_STEP : resting ? 0 : Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...damage,
    rolled: resting && notes === 0 && rings === 0,
    chart: down ? 'down' : 'ghost',
    bullets: 0,
    cards: due ? DUE_CARDS : step * CARDS_PER_STEP,
    clock: due,
    sweat: due,
    mood,
  }
}

const CLOTH = '#fbf8ef'
const CLOTH_SHADE = '#e4dfd0'
const PLACEHOLDER = '#d3cfc4'
const COFFEE = '#8a5a36'
const CHAR = '#3a2c33'

const LEFT = 30
const RIGHT = 170
const TOP = 32
const FULL_BOTTOM = 136
const ROLLED_BOTTOM = 88
const BASE = 100
const BAR_X = [48, 61, 74, 87] as const
const BAR_W = 11
const ROWS = [62, 76, 90] as const
const ROW_W = [36, 28, 38] as const

const SHAPES: Record<SlidesChart, readonly number[]> = {
  ghost: [20, 32, 26, 44],
  build: [20, 32, 28, 48],
  calm: [22, 36, 30, 50],
  down: [48, 36, 22, 9],
  up: [12, 24, 38, 54],
}

function clothPath(bottom: number): string {
  return `M${LEFT} ${TOP}H${RIGHT}V${bottom}H${LEFT}Z`
}

function roller(accent: string): Art {
  return part('roller', [
    svg`<rect x="20" y="17" width="160" height="17" rx="8.5" fill=${accent} />`,
    svg`<rect x="20" y="27" width="160" height="7" rx="3.5" fill=${shadeOf(accent)} />`,
    svg`<rect x="31" y="21" width="44" height="3.6" rx="1.8" fill=${tintOf(accent, 0.55)} />`,
    svg`<rect x="14" y="20" width="11" height="11" rx="4" fill=${C.metalMid} />`,
    svg`<rect x="175" y="20" width="11" height="11" rx="4" fill=${C.metalMid} />`,
  ])
}

function rail(y: number, accent: string): Art {
  return part('rail', [
    svg`<rect x="25" y=${y - 2} width="150" height="9" rx="4.5" fill=${C.metalMid} />`,
    svg`<rect x="25" y=${y + 3} width="150" height="4" rx="2" fill=${C.metalDark} />`,
    svg`<path d=${`M100 ${y + 7}v5`} stroke=${C.metalDark} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<circle cx="100" cy=${y + 16} r="4.6" fill=${accent} />`,
  ])
}

function tripod(top: number): Art {
  return part('tripod', [
    svg`<path d="M100 150L64 182M100 150L136 182" stroke=${C.metalDark} stroke-width="7" stroke-linecap="round" />`,
    svg`<path d="M100 150V178" stroke=${C.metalDark} stroke-width="5.5" stroke-linecap="round" />`,
    svg`<path d=${`M100 ${top}V150`} stroke=${C.metalMid} stroke-width="8" stroke-linecap="round" />`,
    svg`<rect x="92" y="143" width="16" height="13" rx="4.5" fill=${C.metal} />`,
    svg`<circle cx="64" cy="182" r="4.2" fill=${C.metalMid} /><circle cx="136" cy="182" r="4.2" fill=${C.metalMid} />`,
  ])
}

function axes(): Art {
  return svg`<path d=${`M44 42V${BASE + 2}H102`} fill="none" stroke=${C.metalDark} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`
}

function solidBar(x: number, height: number, color: string, cap: string, index: number): Art {
  const top = BASE - height
  return part(
    'bar',
    [
      svg`<path d=${`M${x} ${BASE}V${top + 3}q0-3 3-3h${BAR_W - 6}q3 0 3 3V${BASE}Z`} fill=${color} />`,
      svg`<path d=${`M${x + 3} ${BASE}V${top + 4}`} stroke=${cap} stroke-width="2.4" stroke-linecap="round" />`,
    ],
    index,
  )
}

function ghostBar(x: number, height: number, color: string, index: number): Art {
  return part(
    'ghost-bar',
    svg`<rect x=${x + 1} y=${BASE - height + 1} width=${BAR_W - 2} height=${height - 1} rx="2.5" fill="none" stroke=${color} stroke-width="2.2" stroke-dasharray="3.6 3.8" stroke-linecap="round" />`,
    index,
  )
}

function bars(parts: SlidesParts, accent: string): Art {
  const heights = SHAPES[parts.chart]
  const charred = parts.fire > 0 ? mix(accent, CHAR, 0.2 + parts.fire * 0.22) : accent
  const cap = tintOf(charred, 0.5)
  const ghost = tintOf(accent, 0.3)
  return BAR_X.map((x, i) => {
    const height = heights[i] ?? 0
    if (parts.chart === 'ghost' || i >= parts.built) return ghostBar(x, height, ghost, i)
    const bar = solidBar(x, height, charred, cap, i)
    return parts.chart === 'build' && i === parts.built - 1 ? motion('pulse', bar) : bar
  })
}

function bullets(parts: SlidesParts, accent: string): Art {
  const ghost = parts.chart === 'ghost' || parts.chart === 'build'
  return [
    svg`<rect x="112" y="42" width="48" height="9" rx="4.5" fill=${ghost ? PLACEHOLDER : INK} />`,
    ROWS.map((y, i) => {
      const live = i < parts.bullets
      return part(
        'bullet',
        [
          svg`<circle cx="115" cy=${y} r="3.6" fill=${live ? accent : PLACEHOLDER} />`,
          svg`<rect x="123" y=${y - 3} width=${ROW_W[i] ?? 30} height="6" rx="3" fill=${live ? C.metalDark : PLACEHOLDER} />`,
        ],
        i,
      )
    }),
  ]
}

function arrowDown(): Art {
  return part('arrow-down', [
    svg`<path d="M47 50L62 62L71 55L93 84" fill="none" stroke=${C.coralDark} stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d="M97 89L83 86L95 76Z" fill=${C.coralDark} stroke=${C.coralDark} stroke-width="3" stroke-linejoin="round" />`,
  ])
}

function arrowUp(): Art {
  return part('arrow-up', [
    svg`<path d="M47 74L62 58L70 64L90 42" fill="none" stroke=${C.mintDark} stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d="M97 35L95 49L83 38Z" fill=${C.mintDark} stroke=${C.mintDark} stroke-width="3" stroke-linejoin="round" />`,
  ])
}

function scribble(): Art {
  return part(
    'scribble',
    svg`<path d="M113 58L156 66L116 72L158 80L114 86L154 95" fill="none" stroke=${C.coral} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
  )
}

const FLAME = 'M0 0C-13-1-16-14-8-23C-7-17-4-15-2-18C-4-26 1-32 6-37C6-27 15-21 14-10C13-3 7 0 0 0Z'

function flame(x: number, y: number, size: number, delay: number, index: number): Art {
  return part(
    'flame',
    at(
      x,
      y,
      motion(
        'flicker',
        [
          svg`<path d=${FLAME} fill=${C.coral} />`,
          at(1, -1, svg`<path d=${FLAME} fill=${C.sun} />`, 0, 0.56),
        ],
        delay,
      ),
      0,
      size,
    ),
    index,
  )
}

function fire(level: number): Art {
  const flames: Art[] = [
    flame(54, 56, 1.05, 1, 0),
    flame(68, 68, 0.9, 2, 1),
    flame(80, 82, 0.72, 3, 2),
    flame(93, 95, 0.6, 1, 3),
  ]
  return [
    flames.slice(0, level + 1),
    when(level >= 2, () =>
      part('smoke', [
        at(46, 28, motion('waft', svg`<circle r="7" fill=${C.metalDark} opacity=".8" />`, 1)),
        at(62, 22, motion('waft', svg`<circle r="5" fill=${C.metalDark} opacity=".7" />`, 3)),
      ]),
    ),
  ]
}

const RING_SPOTS = [
  [146, 110, 12],
  [52, 112, 10],
  [124, 103, 8],
] as const

function coffeeRings(count: number): Art {
  return part(
    'coffee-rings',
    RING_SPOTS.slice(0, count).map(
      ([x, y, r]) =>
        svg`<circle cx=${x} cy=${y} r=${r} fill="none" stroke=${COFFEE} stroke-width="3.8" stroke-dasharray=${`${round(r * 5)} ${round(r * 1.2)}`} opacity=".8" />`,
    ),
  )
}

const NOTE_SPOTS = [
  [157, 90, 9, C.sun, C.sunDark],
  [28, 68, -13, C.pink, C.pinkDark],
  [168, 58, 11, C.mint, C.mintDark],
  [38, 128, -7, C.lilac, C.lilacDark],
  [134, 46, -10, C.sun, C.sunDark],
  [183, 92, 15, C.pink, C.pinkDark],
  [122, 24, 7, C.lilac, C.lilacDark],
] as const

function stickyNote(
  x: number,
  y: number,
  rotate: number,
  color: string,
  shade: string,
  index: number,
): Art {
  return part(
    'sticky-note',
    at(
      x,
      y,
      [
        svg`<path d="M-12-12H12V5L5 12H-12Z" fill=${color} />`,
        svg`<path d="M12 5H7Q5 5 5 7V12Z" fill=${shade} />`,
        svg`<path d="M-7-5H7M-7 1H2" stroke=${shade} stroke-width="2.6" stroke-linecap="round" />`,
      ],
      rotate,
    ),
    index,
  )
}

function stickyNotes(count: number): Art {
  return NOTE_SPOTS.slice(0, count).map(([x, y, r, color, shade], i) =>
    stickyNote(x, y, r, color, shade, i),
  )
}

const PANIC_SPOTS = [
  [71, 106, 1, 1],
  [131, 106, 1.1, 2],
  [66, 128, 0.85, 3],
  [134, 128, 0.9, 4],
] as const

function panicDrops(count: number): Art {
  return part(
    'panic',
    PANIC_SPOTS.slice(0, count + 1).map(([x, y, s, d]) =>
      at(x, y, motion('drip', drop(0, 0, C.waterDark, s), d)),
    ),
  )
}

function restingContent(accent: string): Art {
  const cap = tintOf(accent, 0.5)
  const stub = (x: number, height: number): Art => [
    svg`<rect x=${x} y=${78 - height} width="9" height=${height} rx="2.5" fill=${accent} />`,
    svg`<path d=${`M${x + 2.6} 78V${82 - height}`} stroke=${cap} stroke-width="2" stroke-linecap="round" />`,
  ]
  return [
    stub(38, 12),
    stub(49, 22),
    stub(60, 17),
    [50, 62, 74].map((y) => [
      svg`<circle cx="134" cy=${y} r="3" fill=${accent} />`,
      svg`<rect x="141" y=${y - 2.5} width="19" height="5" rx="2.5" fill=${PLACEHOLDER} />`,
    ]),
  ]
}

function screen(parts: SlidesParts, accent: string): Art {
  const bottom = parts.rolled ? ROLLED_BOTTOM : FULL_BOTTOM
  const content: Art = parts.rolled
    ? restingContent(accent)
    : [
        coffeeRings(parts.rings),
        part('chart', [axes(), bars(parts, accent)]),
        part('bullets', bullets(parts, accent)),
        when(parts.chart === 'up', arrowUp),
        when(parts.scribble, scribble),
        when(parts.arrow, arrowDown),
      ]
  return part('screen', [
    svg`<path d=${clothPath(bottom)} fill=${CLOTH} />`,
    svg`<rect x=${LEFT} y=${TOP + 2} width=${RIGHT - LEFT} height="4" fill=${CLOTH_SHADE} />`,
    content,
    face(100, parts.rolled ? 62 : 117, parts.mood, INK, parts.rolled ? 1.12 : 1.15),
    rail(bottom, accent),
    roller(accent),
  ])
}

function trouble(parts: SlidesParts): Art {
  return when(!parts.rolled, () => [
    stickyNotes(parts.notes),
    when(parts.fire > 0, () => fire(parts.fire - 1)),
    when(parts.panic > 0, () => panicDrops(parts.panic)),
  ])
}

const CARD_SHIFT = [0, 4, -3, 3, -2] as const
const CARD_TILT = [-1.5, 2, -2.5, 1.5, -1] as const

function card(x: number, y: number, rotate: number, top: boolean, index: number): Art {
  return part(
    'slide-card',
    at(
      x,
      y,
      [
        svg`<rect x="-26" y="-14" width="52" height="33" rx="3.5" fill=${C.metalDark} />`,
        svg`<rect x="-26" y="-16" width="52" height="33" rx="3.5" fill=${C.metal} />`,
        when(top, () => [
          svg`<rect x="-18" y="-10" width="26" height="4.5" rx="2.2" fill=${C.metalMid} />`,
          svg`<rect x="-18" y="-2" width="36" height="13" rx="2.5" fill="none" stroke=${C.metalMid} stroke-width="2" stroke-dasharray="3 3.4" />`,
        ]),
      ],
      rotate,
    ),
    index,
  )
}

function pile(x: number, count: number, first: number): Art {
  return Array.from({ length: count }, (_, i) =>
    card(x + (CARD_SHIFT[i] ?? 0), 162 - i * 7, CARD_TILT[i] ?? 0, i === count - 1, first + i),
  )
}

function piles(cards: number, clockAbove: boolean): Art {
  const left = Math.min(LEFT_PILE, cards)
  const right = Math.max(0, cards - left)
  return [
    when(left > 0, () => [shadow(40, 183, 32, 0.24), pile(40, left, 0)]),
    when(right > 0, () => [shadow(160, 183, 32, 0.24), pile(160, right, left)]),
    when(clockAbove, () => alarmClock(164, 182 - 33 - right * 7)),
  ]
}

function alarmClock(x: number, baseline: number): Art {
  const body: Art = [
    svg`<path d="M-13 20L-17 26M13 20L17 26" stroke=${C.coralDark} stroke-width="5" stroke-linecap="round" />`,
    svg`<circle cx="-14" cy="-20" r="9" fill=${C.sun} /><circle cx="14" cy="-20" r="9" fill=${C.sun} />`,
    svg`<rect x="-2.5" y="-29" width="5" height="9" rx="2" fill=${C.sunDark} />`,
    svg`<circle r="22" fill=${C.coral} />`,
    svg`<circle r="17" fill=${C.cream} />`,
    svg`<path d="M0-14V-11M14 0H11M0 14V11M-14 0H-11" stroke=${C.creamDark} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<path d="M0 0L-2-12M0 0L-7-3" stroke=${INK} stroke-width="3" stroke-linecap="round" />`,
    svg`<circle r="2.6" fill=${C.coralDark} />`,
  ]
  return part(
    'clock',
    at(
      x,
      baseline - 22,
      [
        motion('rumble', body),
        motion(
          'flicker',
          [
            svg`<path d="M-29-9Q-33 0-29 9" fill="none" stroke=${C.sun} stroke-width="3.6" stroke-linecap="round" />`,
            svg`<path d="M29-9Q33 0 29 9" fill="none" stroke=${C.sun} stroke-width="3.6" stroke-linecap="round" />`,
          ],
          2,
        ),
      ],
      0,
      0.88,
    ),
  )
}

function mugSpill(): Art {
  return part('spill', [
    svg`<ellipse cx="88" cy="180" rx="24" ry="5" fill=${COFFEE} />`,
    at(
      114,
      175,
      [
        svg`<path d="M-11-9H11V6Q11 11 6 11H-6Q-11 11-11 6Z" fill=${C.cream} />`,
        svg`<ellipse cx="0" cy="-9" rx="11" ry="3.4" fill=${COFFEE} />`,
        svg`<path d="M11-5a6 6 0 0 1 0 11" fill="none" stroke=${C.creamDark} stroke-width="3.4" stroke-linecap="round" />`,
      ],
      -82,
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

function moon(): Art {
  return part(
    'moon',
    at(
      46,
      128,
      [
        svg`<path d="M6-20A21 21 0 1 0 20 12A17 17 0 0 1 6-20Z" fill=${C.spark} />`,
        svg`<circle cx="28" cy="-14" r="2.2" fill=${C.spark} /><circle cx="-24" cy="-22" r="1.8" fill=${C.spark} />`,
      ],
      -8,
      0.9,
    ),
  )
}

function zeds(): Art {
  return part('zzz', [zed(136, 132, 0.7, 1), zed(154, 116, 1, 2), zed(174, 104, 0.6, 3)])
}

function fist(): Art {
  return [
    svg`<rect x="-4" y="-46" width="8" height="42" rx="3.5" fill=${C.fly} />`,
    svg`<rect x="-4" y="-46" width="8" height="7" rx="2.5" fill=${C.metalMid} />`,
    svg`<rect x="-13" y="13" width="26" height="12" rx="4.5" fill=${C.lilac} />`,
    svg`<rect x="-16" y="-14" width="32" height="29" rx="12" fill=${C.cream} />`,
    svg`<path d="M-15-5H8M-15 2H8M-14 9H8" stroke=${C.creamDark} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<rect x="4" y="-16" width="13" height="23" rx="6.5" fill=${C.cream} />`,
  ]
}

function pointer(parts: SlidesParts): Art {
  const heights = SHAPES.build
  const index = Math.max(0, parts.built - 1)
  const targetX = (BAR_X[index] ?? 48) + BAR_W / 2
  const targetY = BASE - (heights[index] ?? 0) - 3
  const handX = 156
  const handY = 158
  const angle = Math.atan2(targetX - handX, handY - targetY)
  const tipX = handX + Math.sin(angle) * 46
  const tipY = handY - Math.cos(angle) * 46
  const beam = `M${round(tipX)} ${round(tipY)}L${round(targetX)} ${round(targetY)}`
  return part('pointer', [
    svg`<path d=${beam} stroke=${C.coral} stroke-width="3.4" stroke-linecap="round" opacity=".85" />`,
    at(
      targetX,
      targetY,
      motion('pulse', [
        svg`<circle r="9" fill=${C.coral} opacity=".3" />`,
        svg`<circle r="4.4" fill=${C.coralDark} />`,
      ]),
    ),
    at(handX, handY, fist(), (angle * 180) / Math.PI),
    sparkle(targetX + 13, targetY - 9, 0.62, 2),
    sparkle(targetX - 12, targetY - 2, 0.42, 4),
  ])
}

function lectern(accent: string): Art {
  const body: Art = [
    shadow(0, 1, 32, 0.28),
    svg`<rect x="-29" y="-7" width="58" height="8" rx="4" fill=${C.wickerDark} />`,
    svg`<path d="M-21-68H21L26-5H-26Z" fill=${C.wicker} />`,
    svg`<path d="M-13-57H13L16-15H-16Z" fill=${C.wickerDark} />`,
    svg`<path d="M-30-80H30L26-65Q25.6-63 23-63H-23Q-25.6-63-26-65Z" fill=${C.wickerLight} />`,
    svg`<circle cx="0" cy="-36" r="10" fill=${accent} />`,
    svg`<path d="M-4.5-31V-36M0-31V-41M4.5-31V-38" stroke=${tintOf(accent, 0.75)} stroke-width="2.6" stroke-linecap="round" />`,
  ]
  const clicker: Art = [
    svg`<rect x="-9" y="-19" width="18" height="38" rx="7" fill=${C.metal} />`,
    svg`<rect x="-9" y="9" width="18" height="10" rx="5" fill=${C.metalMid} />`,
    svg`<circle cx="0" cy="-5" r="5.4" fill=${C.coral} />`,
    svg`<circle cx="0" cy="9" r="2.4" fill=${C.metalDark} />`,
  ]
  return part('lectern', [
    at(160, 182, body),
    part('clicker', at(160, 88, clicker, -24)),
    at(
      140,
      70,
      motion('pulse', [
        svg`<path d="M0-8Q-6 0 0 8" fill="none" stroke=${C.sun} stroke-width="3.6" stroke-linecap="round" />`,
        svg`<path d="M-8-13Q-17 0-8 13" fill="none" stroke=${C.sun} stroke-width="3.6" stroke-linecap="round" />`,
      ]),
    ),
    part(
      'present-me',
      at(
        170,
        44,
        motion(
          'bob',
          svg`<path d="M0-13V5M-11-5L0 7L11-5" fill="none" stroke=${C.sun} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`,
        ),
      ),
    ),
  ])
}

function openGlove(mirror: boolean): Art {
  const hand: Art = [
    svg`<rect x="-13" y="16" width="26" height="11" rx="4.5" fill=${C.lilac} />`,
    svg`<path d="M-11 5C-22 3-27-7-23-12C-19-16-14-11-11-6Z" fill=${C.creamDark} />`,
    svg`<path d="M-13 18C-16 2-17-14-13-23C-10-31 0-33 7-30C13-27 15-17 15-6C15 5 14 11 13 18Z" fill=${C.cream} />`,
    svg`<path d="M-5-27V-13M3-28V-13" stroke=${C.creamDark} stroke-width="2.6" stroke-linecap="round" />`,
  ]
  return mirror ? svg`<g transform="scale(-1 1)">${hand}</g>` : hand
}

function clappingHands(): Art {
  return part('clapping', [
    at(29, 157, motion('wobble', at(0, 0, openGlove(false), 18, 0.88), 1)),
    at(62, 157, motion('wobble', at(0, 0, openGlove(true), -18, 0.88), 1)),
    at(
      45,
      122,
      motion('flicker', [
        svg`<path d="M0-9V-1M-13-3L-8 3M13-3L8 3" stroke=${C.coral} stroke-width="4" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

function trophy(): Art {
  return part(
    'trophy',
    at(
      156,
      182,
      [
        svg`<path d="M-20-56C-35-58-34-36-13-35M20-56C35-58 34-36 13-35" fill="none" stroke=${C.sunDark} stroke-width="5.5" stroke-linecap="round" />`,
        svg`<rect x="-22" y="-9" width="44" height="10" rx="3.5" fill=${C.wickerDark} />`,
        svg`<rect x="-13" y="-17" width="26" height="9" rx="2.5" fill=${C.sunDark} />`,
        svg`<rect x="-4.5" y="-29" width="9" height="13" fill=${C.sunDark} />`,
        svg`<path d="M-21-64H21C21-42 13-27 0-27C-13-27-21-42-21-64Z" fill=${C.sun} />`,
        svg`<rect x="-24" y="-68" width="48" height="7" rx="3.5" fill=${C.sunDark} />`,
        svg`<path d="M0-58L3.4-51.2L10.9-50.1L5.4-44.8L6.7-37.3L0-40.8L-6.7-37.3L-5.4-44.8L-10.9-50.1L-3.4-51.2Z" fill=${C.spark} />`,
      ],
      0,
      0.9,
    ),
  )
}

const CONFETTI = [
  [22, 46, 1, C.coral],
  [178, 42, 2, C.mint],
  [14, 88, 3, C.sun],
  [186, 86, 4, C.pink],
  [24, 112, 5, C.lilac],
  [180, 116, 1, C.sun],
] as const

function confetti(): Art {
  return part(
    'confetti',
    CONFETTI.map(([x, y, d, color], i) =>
      at(
        x,
        y,
        motion(
          'fall',
          svg`<rect x="-3.5" y="-5.5" width="7" height="11" rx="1.5" fill=${color} transform=${`rotate(${i * 37 - 40})`} />`,
          d,
        ),
      ),
    ),
  )
}

function tilted(parts: SlidesParts, art: Art): Art {
  return parts.fire >= 2 ? at(100, 34, at(-100, -34, art), -3) : art
}

function posed(parts: SlidesParts, art: Art): Art {
  return parts.lectern ? at(70, 182, at(-100, -182, art), 0, 0.82) : art
}

export function slides(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = slidesParts(scene)
  const accent = accentOf(scene, C.sky)
  const bottom = parts.rolled ? ROLLED_BOTTOM : FULL_BOTTOM
  const art: Art = [
    shadow(parts.lectern ? 70 : 100, 184, parts.lectern ? 44 : 54),
    posed(parts, [tripod(bottom), tilted(parts, screen(parts, accent))]),
    when(parts.spill, mugSpill),
    piles(parts.cards, parts.clock),
    posed(parts, tilted(parts, trouble(parts))),
    when(parts.sweat && parts.panic === 0, () =>
      part('sweat', at(174, 58, motion('drip', drop(0, 0, C.water, 1.1), 2))),
    ),
    when(parts.rolled, moon),
    when(parts.rolled, zeds),
    when(parts.pointer, () => pointer(parts)),
    when(parts.lectern, () => lectern(accent)),
    when(parts.party, () => [
      clappingHands(),
      trophy(),
      confetti(),
      sparkle(116, 162, 0.8, 2),
      sparkle(188, 66, 0.85, 4),
      sparkle(12, 66, 1, 1),
      sparkle(190, 150, 0.6, 3),
    ]),
  ]
  return frame('slides', scene, options, art)
}
