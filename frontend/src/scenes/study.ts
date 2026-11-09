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

export type StudyView = 'stack' | 'writing' | 'handin'
export type StudyLamp = 'off' | 'on' | 'bright'

export interface StudyParts {
  view: StudyView
  step: number
  books: number
  notes: number
  lean: number
  lamp: StudyLamp
  alarm: boolean
  cap: boolean
  star: boolean
  ring: number
  mug: boolean
  balls: number
  webs: number
  spider: boolean
  snore: boolean
  stench: number
  flies: number
  sweat: boolean
  written: number
  grime: number
  mood: Mood
}

export const MAX_STEP = 4

const PILE = [2, 3, 4, 5, 5] as const
const STICKIES = [0, 1, 3, 5, 7] as const
const DUE_BOOKS = 6
const DUE_NOTES = 7

const RING_AT = [0.1, 0.3] as const
const BALLS_AT = [0.2, 0.42, 0.62, 0.82] as const
const WEBS_AT = [0.3, 0.55] as const
const MUG_AT = 0.1
const SPIDER_AT = 0.5
const SNORE_AT = 0.6
const STENCH_AT = [0.7, 0.88] as const
const FLIES_AT = [0.65, 0.9] as const

const CALM = {
  notes: 0,
  lean: 0,
  alarm: false,
  cap: false,
  star: false,
  ring: 0,
  mug: false,
  balls: 0,
  webs: 0,
  spider: false,
  snore: false,
  stench: 0,
  flies: 0,
  sweat: false,
  written: 0,
  grime: 0,
} as const

export function studyParts(scene: SceneView): StudyParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...CALM,
      view: 'stack',
      step: 0,
      books: 3,
      lamp: 'on',
      cap: true,
      star: true,
      mood: 'happy',
    }
  }
  const ring = reached(stink, RING_AT)
  const mug = stink >= MUG_AT
  const balls = reached(stink, BALLS_AT)
  const grime = reached(stink, [...RING_AT, ...WEBS_AT, ...STENCH_AT]) / 6
  if (state === 'running') {
    return {
      ...CALM,
      view: 'writing',
      step: MAX_STEP,
      books: 2,
      lamp: 'bright',
      ring: Math.min(1, ring),
      mug,
      balls: Math.min(1, balls),
      written: clamp01(scene.progress),
      grime: Math.min(0.2, grime),
      mood: 'happy',
    }
  }
  const neglect = {
    ring,
    mug,
    balls,
    webs: reached(stink, WEBS_AT),
    spider: stink >= SPIDER_AT,
    snore: stink >= SNORE_AT,
    stench: reached(stink, STENCH_AT),
    flies: reached(stink, FLIES_AT),
    grime,
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      ...neglect,
      view: 'handin',
      step: MAX_STEP,
      books: 2,
      lamp: 'on',
      mood: neglect.snore ? 'sleepy' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const step = due ? MAX_STEP : resting ? 0 : raw
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (neglect.snore) mood = 'sleepy'
  return {
    ...CALM,
    ...neglect,
    view: 'stack',
    step,
    books: due ? DUE_BOOKS : (PILE[step] ?? DUE_BOOKS),
    notes: due ? DUE_NOTES : (STICKIES[step] ?? DUE_NOTES),
    lean: due ? 1.5 : step >= 3 ? 1 : step * 0.4,
    lamp: resting ? 'off' : 'on',
    alarm: due,
    sweat: !due && step >= 3 && !neglect.snore,
    mood,
  }
}

const CX = 116
const BASE = 162
const COFFEE = '#5d3a22'
const PAGE = '#fbf7ec'
const SCRIBBLE = '#39426b'

const DESK_TOP = C.wicker
const DESK_LIP = C.wickerLight
const DESK_FRONT = C.wickerDark

interface BookSpec {
  w: number
  h: number
  dx: number
  tilt: number
  open: boolean
}

interface Placed extends BookSpec {
  x: number
  y: number
  index: number
  color: string
}

const SPECS: readonly BookSpec[] = [
  { w: 118, h: 44, dx: 0, tilt: 0, open: false },
  { w: 100, h: 24, dx: -7, tilt: -0.5, open: true },
  { w: 108, h: 21, dx: 6, tilt: 0.8, open: false },
  { w: 90, h: 19, dx: -6, tilt: -1.4, open: true },
  { w: 98, h: 20, dx: 7, tilt: 1.6, open: false },
  { w: 76, h: 17, dx: -3, tilt: -2.4, open: true },
]

function palette(accent: string): readonly string[] {
  return [
    accent,
    mix(accent, C.sun, 0.74),
    tintOf(accent, 0.34),
    mix(accent, C.lilac, 0.76),
    shadeOf(accent, 0.2),
    mix(accent, C.sky, 0.76),
  ]
}

function stacked(count: number, lean: number, colors: readonly string[], age: number): Placed[] {
  const placed: Placed[] = []
  let top = BASE
  for (const [index, spec] of SPECS.slice(0, count).entries()) {
    placed.push({
      ...spec,
      index,
      x: CX + spec.dx * (1 + lean * 0.35),
      y: top - spec.h / 2,
      tilt: spec.tilt * lean,
      color: mix(colors[index] ?? C.coral, C.musty, age * 0.42),
    })
    top -= spec.h
  }
  return placed
}

function topOf(books: readonly Placed[]): number {
  return books.reduce((least, book) => Math.min(least, book.y - book.h / 2), BASE)
}

function bookSpine(book: Placed): Art {
  const half = book.w / 2
  const hh = book.h / 2
  const dark = shadeOf(book.color, 0.26)
  const light = tintOf(book.color, 0.42)
  const title = book.index > 0
  return [
    svg`<rect x=${-half} y=${-hh} width=${book.w} height=${book.h} rx="6.5" fill=${book.color} />`,
    svg`<path d=${`M${-half} ${hh - 8}V${hh - 6.5}a6.5 6.5 0 0 0 6.5 6.5H${half - 6.5}a6.5 6.5 0 0 0 6.5-6.5V${hh - 8}Z`} fill=${dark} />`,
    svg`<rect x=${-half + 9} y=${-hh} width="5" height=${book.h - 1} fill=${light} /><rect x=${half - 14} y=${-hh} width="5" height=${book.h - 1} fill=${light} />`,
    when(
      title,
      () =>
        svg`<rect x="-19" y=${-hh + 5} width="38" height="4.5" rx="2.25" fill=${light} /><rect x="-11" y=${-hh + 12} width="22" height="3" rx="1.5" fill=${light} opacity=".7" />`,
    ),
  ]
}

function bookPages(book: Placed): Art {
  const half = book.w / 2
  const hh = book.h / 2
  const lip = 4.6
  const dark = shadeOf(book.color, 0.26)
  const inner = book.h - lip * 2 + 2
  const rows = Math.max(1, Math.floor(inner / 5))
  const cover = `M${half} ${-hh}H${-half + 7}Q${-half} ${-hh} ${-half} ${-hh + 7}V${hh - 7}Q${-half} ${hh} ${-half + 7} ${hh}H${half}V${hh - lip}H${-half + 15}V${-hh + lip}H${half}Z`
  return [
    svg`<rect x=${-half + 11} y=${-hh + lip - 1} width=${book.w - 14} height=${inner} fill=${PAGE} />`,
    Array.from({ length: rows }, (_, i) => {
      const y = round(-hh + lip + ((i + 0.5) * (inner - 2)) / rows)
      return svg`<path d=${`M${-half + 18} ${y}H${half - 5}`} stroke=${C.creamDark} stroke-width="1.6" stroke-linecap="round" />`
    }),
    svg`<path d=${cover} fill=${book.color} />`,
    svg`<path d=${`M${-half + 7} ${hh}H${half}V${hh - lip}H${-half + 3}Z`} fill=${dark} />`,
  ]
}

function drawBook(book: Placed, body?: Art): Art {
  return part(
    'book',
    at(book.x, book.y, [book.open ? bookPages(book) : bookSpine(book), body ?? []], book.tilt),
    book.index,
  )
}

function plate(parts: StudyParts, dark: string): Art {
  return [
    svg`<rect x="-34" y="-16" width="68" height="33" rx="11" fill=${PAGE} />`,
    when(
      parts.snore,
      () =>
        svg`<path d="M-16 6q4.5 4 9 0M7 6q4.5 4 9 0" fill="none" stroke=${mix(dark, PAGE, 0.3)} stroke-width="2.4" stroke-linecap="round" />`,
    ),
    face(0, -1, parts.mood, INK, 0.98),
    when(parts.snore, () =>
      part(
        'snot-bubble',
        at(
          6,
          10,
          motion('throb', [
            svg`<circle r="5.6" fill=${C.water} opacity=".82" /><circle cx="-1.8" cy="-1.8" r="1.5" fill="#fff" />`,
          ]),
        ),
      ),
    ),
    when(parts.sweat, () =>
      at(
        28,
        -13,
        motion(
          'drip',
          svg`<path d="M0-5C2.4-2 3.6 0 3.6 1.8a3.6 3.6 0 0 1-7.2 0C-3.6 0-2.4-2 0-5Z" fill=${C.water} />`,
        ),
      ),
    ),
  ]
}

function goldStar(size: number): Art {
  const points = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 6.2 : 13.5
    const a = (i * Math.PI) / 5 - Math.PI / 2
    return `${i ? 'L' : 'M'}${round(Math.cos(a) * r)} ${round(Math.sin(a) * r)}`
  }).join('')
  return at(
    0,
    0,
    [
      svg`<path d=${`${points}Z`} fill=${C.sunDark} stroke=${C.sunDark} stroke-width="5" stroke-linejoin="round" />`,
      svg`<path d=${`${points}Z`} fill=${C.sun} stroke=${C.sun} stroke-width="2" stroke-linejoin="round" />`,
    ],
    0,
    size,
  )
}

function sticky(color: string, size: number, rotate: number): Art {
  const s = size / 2
  const fold = size * 0.3
  return at(
    0,
    0,
    [
      svg`<path d=${`M${-s} ${-s}H${s}V${s - fold}L${s - fold} ${s}H${-s}Z`} fill=${color} />`,
      svg`<path d=${`M${s} ${s - fold}L${s - fold} ${s - fold}V${s}Z`} fill=${shadeOf(color, 0.3)} />`,
      svg`<path d=${`M${round(-s + 3.5)} ${round(-s + 5.5)}H${round(s - 3.5)}M${round(-s + 3.5)} ${round(-s + 10)}H${round(s - 6)}`} stroke=${shadeOf(color, 0.42)} stroke-width="2" stroke-linecap="round" />`,
    ],
    rotate,
  )
}

function flag(color: string): Art {
  return svg`<rect x="-3" y="-3" width="17" height="7.5" rx="1.8" fill=${color} />`
}

type Pin =
  | { book: number; kind: 'note'; x: number; y: number; color: string; size: number; r: number }
  | { book: number; kind: 'flag'; y: number; color: string }

const PINS: readonly Pin[] = [
  { book: 0, kind: 'note', x: 45, y: -6, color: C.sun, size: 21, r: 7 },
  { book: 1, kind: 'flag', y: -2, color: C.mint },
  { book: 1, kind: 'note', x: -36, y: -6, color: C.pink, size: 18, r: -9 },
  { book: 2, kind: 'note', x: 40, y: 2, color: C.mint, size: 18, r: 10 },
  { book: 3, kind: 'flag', y: 0, color: C.sky },
  { book: 0, kind: 'note', x: -45, y: -5, color: C.sky, size: 21, r: -8 },
  { book: 4, kind: 'note', x: -32, y: 0, color: C.sun, size: 17, r: -7 },
]

function pins(books: readonly Placed[], count: number): Art {
  return PINS.slice(0, count).map((pin, i) => {
    const book = books[pin.book]
    if (!book) return []
    const art =
      pin.kind === 'flag'
        ? at(book.w / 2, pin.y, flag(pin.color))
        : at(pin.x, pin.y, sticky(pin.color, pin.size, pin.r))
    return part('sticky', at(book.x, book.y, art, book.tilt), i)
  })
}

function pencil(length: number): Art {
  const end = -length
  return part('pencil', [
    svg`<path d="M0 0L-5.8-15H5.8Z" fill=${C.wickerLight} />`,
    svg`<path d="M0 0L-2.3-6H2.3Z" fill=${C.fly} />`,
    svg`<rect x="-5.8" y=${end + 13} width="11.6" height=${length - 28} fill=${C.sun} />`,
    svg`<rect x="1.4" y=${end + 13} width="4.4" height=${length - 28} fill=${C.sunDark} />`,
    svg`<rect x="-5.8" y=${end + 6} width="11.6" height="8" fill=${C.metalMid} />`,
    svg`<rect x="-5.8" y=${end} width="11.6" height="7.5" rx="3" fill=${C.pink} />`,
  ])
}

function lamp(mode: StudyLamp, shadeColor: string): Art {
  const lit = mode !== 'off'
  const arm = C.metalDark
  const head = at(
    40,
    40,
    [
      when(mode === 'bright', () =>
        at(0, 21, motion('pulse', svg`<circle r="27" fill=${C.spark} opacity=".3" />`)),
      ),
      when(lit, () => svg`<circle cy="21" r="17" fill=${C.spark} opacity=".2" />`),
      svg`<circle cy="17" r="11" fill=${lit ? C.spark : C.metalMid} />`,
      svg`<path d="M-11-16Q0-26 11-16L25 11Q27 16 21 16H-21Q-27 16-25 11Z" fill=${shadeColor} />`,
      svg`<path d="M-25 12Q-26 16-21 16H21Q26 16 25 12L24 10H-24Z" fill=${shadeOf(shadeColor, 0.24)} />`,
      svg`<path d="M-12-6L-17 6" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".5" />`,
    ],
    -38,
  )
  return part('lamp', [
    svg`<path d="M36 152L18 102L36 46" fill="none" stroke=${arm} stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<circle cx="18" cy="102" r="6.5" fill=${C.metalMid} />`,
    svg`<path d="M14 163Q14 148 36 148Q58 148 58 163Z" fill=${shadeColor} />`,
    svg`<rect x="10" y="159" width="52" height="7" rx="3.5" fill=${shadeOf(shadeColor, 0.24)} />`,
    head,
  ])
}

function beam(): Art {
  return part(
    'beam',
    at(40, 40, svg`<path d="M-20 16L-62 118H74L20 16Z" fill=${C.spark} opacity=".15" />`, -38),
  )
}

function desk(): Art {
  return part('desk', [
    shadow(100, 185, 88, 0.32),
    svg`<path d="M26 150H174Q178 150 180 154L190 172V176H10V172L20 154Q22 150 26 150Z" fill=${DESK_TOP} />`,
    svg`<path d="M26 150H174Q178 150 179.6 153H20.4Q22 150 26 150Z" fill=${DESK_LIP} />`,
    svg`<rect x="10" y="173" width="180" height="11" rx="4.5" fill=${DESK_FRONT} />`,
  ])
}

function coffeeRing(x: number, y: number, rx: number): Art {
  return svg`<ellipse cx=${x} cy=${y} rx=${rx} ry=${round(rx * 0.42)} fill="none" stroke=${COFFEE} stroke-width="2.6" stroke-dasharray="17 2 9 3" opacity=".78" />`
}

function rings(count: number): Art {
  return part('coffee-ring', [
    when(count >= 1, () => coffeeRing(149, 168, 12.5)),
    when(count >= 2, () => coffeeRing(164, 165.5, 10)),
  ])
}

function coffeeMug(foul: boolean): Art {
  const top = foul ? C.musty : COFFEE
  return part(
    'mug',
    at(174, 171, [
      svg`<path d="M-11-22H-16A7 7 0 0 0-16-8H-11" fill="none" stroke=${C.metalMid} stroke-width="4" stroke-linecap="round" />`,
      svg`<path d="M-12-26H12V-4Q12 0 8 0H-8Q-12 0-12-4Z" fill=${C.metal} />`,
      svg`<path d="M5-26H12V-4Q12 0 8 0H5Z" fill=${C.metalMid} />`,
      svg`<ellipse cy="-26" rx="12" ry="3.8" fill=${C.metalMid} /><ellipse cy="-25.6" rx="9.6" ry="2.6" fill=${top} />`,
      svg`<path d="M-7-16h8M-7-11h5" stroke=${C.metalDark} stroke-width="2.2" stroke-linecap="round" />`,
    ]),
  )
}

const BALL_SPOTS = [
  [26, 171, 9.5, 10],
  [108, 178, 8, 70],
  [170, 178, 8.5, 200],
  [66, 178, 8.5, 130],
] as const

function paperBall(x: number, y: number, r: number, rotate: number, index: number): Art {
  const shape: readonly (readonly [number, number])[] = [
    [0, -1],
    [0.55, -0.82],
    [0.98, -0.34],
    [0.82, 0.24],
    [1, 0.66],
    [0.36, 0.96],
    [-0.28, 0.82],
    [-0.84, 0.92],
    [-0.98, 0.22],
    [-0.76, -0.34],
    [-0.86, -0.86],
    [-0.3, -0.76],
  ]
  const d = `${shape.map(([a, b], i) => `${i ? 'L' : 'M'}${round(a * r)} ${round(b * r)}`).join('')}Z`
  const k = round(r / 9)
  return part(
    'paper-ball',
    at(
      x,
      y,
      [
        svg`<path d=${d} fill=${C.metal} stroke=${C.metal} stroke-width="2" stroke-linejoin="round" />`,
        svg`<path d="M-6-4L-1 0L-4 6M-1 0L5-4L7 2M5-4L2-8" transform=${`scale(${k})`} fill="none" stroke=${C.metalMid} stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />`,
      ],
      rotate,
    ),
    index,
  )
}

function cobweb(x: number, y: number, side: number, reach: number, index: number): Art {
  const threads = [0, 1, 2, 3].map((i) => {
    const a = ((6 + i * 26) * Math.PI) / 180
    return [Math.cos(a) * reach, Math.sin(a) * reach] as const
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
      svg`<g transform=${`scale(${side} 1)`} fill="none" stroke="#f2f4fb" stroke-width="1.9" stroke-linecap="round" opacity=".92">
        ${threads.map(([tx, ty]) => svg`<path d=${`M0 0L${round(tx)} ${round(ty)}`} />`)}
        ${[0.4, 0.68, 0.96].map((k) => svg`<path d=${arc(k)} />`)}
      </g>`,
    ),
    index,
  )
}

function spider(): Art {
  return part(
    'spider',
    at(
      46,
      62,
      motion('sway', [
        svg`<path d="M0-6V32" stroke="#f2f4fb" stroke-width="1.5" opacity=".85" />`,
        at(
          0,
          38,
          [
            svg`<path d="M-6-3L-14-9L-17-3M-6 0L-16 0L-19 6M-6 3L-13 8L-15 13M6-3L14-9L17-3M6 0L16 0L19 6M6 3L13 8L15 13" fill="none" stroke=${C.wing} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />`,
            svg`<circle r="8.6" fill=${C.fly} stroke=${C.wing} stroke-width="1.5" />`,
            svg`<circle cx="-3" cy="-1.4" r="2.2" fill="#fff" /><circle cx="3" cy="-1.4" r="2.2" fill="#fff" /><circle cx="-2.6" cy="-.9" r="1" fill=${C.fly} /><circle cx="3.4" cy="-.9" r="1" fill=${C.fly} />`,
          ],
          0,
          0.84,
        ),
      ]),
    ),
  )
}

function zed(x: number, y: number, size: number, delay: number, index: number): Art {
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
    index,
  )
}

function snores(): Art {
  return [zed(186, 88, 0.5, 1, 0), zed(186, 70, 0.68, 2, 1), zed(183, 50, 0.88, 3, 2)]
}

function clockBell(x: number, rotate: number): Art {
  return at(
    x,
    -22,
    svg`<path d="M-10 3A10 10 0 0 1 10 3Z" fill=${C.metalMid} /><rect x="-2" y="-11" width="4" height="4" rx="1.5" fill=${C.metalDark} />`,
    rotate,
  )
}

function alarmClock(): Art {
  return part('alarm', [
    shadow(44, 167, 22, 0.24),
    at(
      44,
      147,
      motion('rumble', [
        svg`<path d="M-11 15L-16 21M11 15L16 21" stroke=${C.metalDark} stroke-width="5" stroke-linecap="round" />`,
        clockBell(-12, -28),
        clockBell(12, 28),
        svg`<rect x="-2.5" y="-27" width="5" height="9" rx="2" fill=${C.metalDark} />`,
        svg`<circle r="20" fill=${C.sun} />`,
        svg`<circle r="14.5" fill=${PAGE} />`,
        svg`<path d="M0-10V0L7 4" fill="none" stroke=${INK} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
        svg`<circle r="2.3" fill=${C.coralDark} />`,
      ]),
    ),
    (
      [
        [24, 125, -42, 1],
        [17, 143, -82, 2],
        [45, 113, 0, 3],
      ] as const
    ).map(([x, y, r, d]) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d="M0 0V-8" stroke=${C.cream} stroke-width="4.4" stroke-linecap="round" />`,
          d,
        ),
        r,
      ),
    ),
  ])
}

function gradCap(y: number, accent: string): Art {
  const cloth = mix(accent, INK, 0.88)
  const board = mix(accent, INK, 0.72)
  return part(
    'grad-cap',
    at(CX + 2, y, [
      svg`<path d="M-27-20V-3Q0 9 27-3V-20Z" fill=${cloth} />`,
      svg`<path d="M0-44L52-24Q54-23 52-22L0-2L-52-22Q-54-23-52-24Z" fill=${board} />`,
      svg`<path d="M-52-22L0-2L52-22L52-20L0 0L-52-20Z" fill=${cloth} />`,
      svg`<path d="M-50-23.4L0-43L50-23.4" fill="none" stroke=${tintOf(accent, 0.25)} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`,
      at(0, -23, [
        motion('sway', [
          svg`<path d="M0 0L37 11V30" fill="none" stroke=${C.sun} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
          svg`<path d="M33 29H41L43 45H31Z" fill=${C.sun} /><rect x="32.5" y="27" width="9" height="5" rx="2" fill=${C.sunDark} />`,
        ]),
        svg`<circle r="4" fill=${C.sunDark} />`,
      ]),
    ]),
  )
}

function star(x: number, y: number): Art {
  return part('gold-star', at(x, y, motion('throb', at(0, 0, goldStar(1.12), 12))))
}

const CONFETTI = [
  [122, 18, 25, 0, 1],
  [158, 28, -30, 1, 2],
  [62, 92, 40, 2, 3],
  [176, 18, 60, 3, 4],
  [92, 34, -20, 4, 5],
  [170, 112, 15, 0, 2],
] as const

function confetti(accent: string): Art {
  const colors = [C.sun, C.mint, C.sky, C.pink, tintOf(accent, 0.3)] as const
  return part(
    'confetti',
    CONFETTI.map(([x, y, r, c, d]) =>
      at(
        x,
        y,
        motion(
          'fall',
          at(
            0,
            0,
            svg`<rect x="-4.5" y="-2.5" width="9" height="5" rx="1.4" fill=${colors[c]} />`,
            r,
          ),
          d,
        ),
      ),
    ),
  )
}

function squiggle(x: number, y: number, length: number): string {
  const count = Math.max(1, Math.round(length / 6))
  return `M${round(x)} ${round(y)}q3-3.8 6 0${'t6 0'.repeat(count - 1)}`
}

function notebook(parts: StudyParts, accent: string): Art {
  const cover = mix(accent, C.sky, 0.82)
  const leftPage = 'M0-40C-16-48-42-48-58-42L-65 0C-42-6-16-6 0 2Z'
  const rightPage = 'M0-40C16-48 42-48 58-42L65 0C42-6 16-6 0 2Z'
  const leftRows = [-35, -27, -19, -11] as const
  const rightRows = [-36, -28, -20, -12] as const
  const progress = clamp01(parts.written) * rightRows.length
  const full = Math.min(rightRows.length - 1, Math.floor(progress))
  const share = clamp01(progress - full)
  const lineY = rightRows[full] ?? -12
  const inked = 6 + share * 36
  const tipX = 10 + Math.max(6, Math.round(inked / 6) * 6)
  return part(
    'notebook',
    at(
      CX + 2,
      96,
      [
        svg`<path d="M0-36C-16-44-44-44-62-38L-71 4C-46-2-16-2 0 7C16-2 46-2 71 4L62-38C44-44 16-44 0-36Z" fill=${shadeOf(cover, 0.2)} />`,
        svg`<path d=${leftPage} fill=${PAGE} />`,
        svg`<path d=${rightPage} fill=${C.cream} />`,
        svg`<path d="M0-40V2" stroke=${C.creamDark} stroke-width="2.4" stroke-linecap="round" />`,
        leftRows.map(
          (y, i) =>
            svg`<path d=${squiggle(-52 + i * 1.2, y + 1, i === 3 ? 24 : 42)} fill="none" stroke=${SCRIBBLE} stroke-width="2.2" stroke-linecap="round" />`,
        ),
        rightRows
          .slice(0, full)
          .map(
            (y, i) =>
              svg`<path d=${squiggle(10, y + 1, 42 + i)} fill="none" stroke=${SCRIBBLE} stroke-width="2.2" stroke-linecap="round" />`,
          ),
        svg`<path d=${squiggle(10, lineY + 1, inked)} fill="none" stroke=${SCRIBBLE} stroke-width="2.2" stroke-linecap="round" />`,
        at(tipX, lineY + 1, motion('wobble', at(0, 0, pencil(56), 20))),
      ],
      0,
      0.94,
    ),
  )
}

function ideaBulb(): Art {
  const rays = [-62, -31, 0, 31, 62]
  return part(
    'lightbulb',
    at(112, 27, [
      rays.map((r, i) =>
        at(
          0,
          0,
          at(
            0,
            -17,
            motion(
              'flicker',
              svg`<path d="M0 0V-6" stroke=${C.sun} stroke-width="3.6" stroke-linecap="round" />`,
              (i % 3) + 1,
            ),
          ),
          r,
        ),
      ),
      motion('throb', [
        svg`<circle r="12" fill=${C.sun} />`,
        svg`<circle cx="-4" cy="-4" r="3.4" fill="#fff" opacity=".85" />`,
      ]),
      svg`<rect x="-5.5" y="10" width="11" height="7" rx="2" fill=${C.metalMid} />`,
    ]),
  )
}

function arms(accent: string): Art {
  const sleeve = shadeOf(accent, 0.28)
  const mitt = tintOf(accent, 0.3)
  return part('arms', [
    svg`<path d="M71 126Q64 108 84 99" fill="none" stroke=${sleeve} stroke-width="7" stroke-linecap="round" />`,
    svg`<path d="M161 126Q168 108 148 99" fill="none" stroke=${sleeve} stroke-width="7" stroke-linecap="round" />`,
    svg`<circle cx="85" cy="98" r="7" fill=${mitt} /><circle cx="147" cy="98" r="7" fill=${mitt} />`,
  ])
}

function testRow(y: number, width: number): Art {
  return [
    svg`<circle cx="-22" cy=${y} r="5.5" fill=${C.check} />`,
    svg`<path d=${`M-25 ${y}l2.3 2.6 4.2-4.8`} fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<rect x="-12" y=${y - 2.2} width=${width} height="4.4" rx="2.2" fill=${C.metalDark} />`,
  ]
}

function testPaper(): Art {
  return part(
    'test-paper',
    at(
      116,
      58,
      motion('bob', [
        svg`<rect x="-36" y="-42" width="72" height="84" rx="5" fill=${C.metalMid} />`,
        svg`<rect x="-34" y="-43" width="68" height="83" rx="5" fill=${PAGE} />`,
        svg`<rect x="-26" y="-36" width="30" height="5.5" rx="2.75" fill=${SCRIBBLE} />`,
        svg`<rect x="13" y="-37" width="14" height="10" rx="2.5" fill="none" stroke=${C.coral} stroke-width="2" />`,
        testRow(-17, 34),
        testRow(-3, 28),
        testRow(11, 36),
        at(-22, 26, motion('pulse', svg`<circle r="8" fill=${C.sun} opacity=".5" />`)),
        svg`<circle cx="-22" cy="26" r="5.5" fill="none" stroke=${C.coralDark} stroke-width="2.4" stroke-dasharray="3 2.6" />`,
        svg`<rect x="-12" y="23.8" width="30" height="4.4" rx="2.2" fill=${C.creamDark} />`,
      ]),
      -3,
    ),
  )
}

function floorLitter(parts: StudyParts): Art {
  return [
    BALL_SPOTS.slice(0, parts.balls).map(([x, y, r, rotate], i) => paperBall(x, y, r, rotate, i)),
  ]
}

function pile(parts: StudyParts, books: readonly Placed[], accent: string): Art {
  const main = books[0]
  const rest = books.slice(1)
  const shaky = books.slice(4)
  const firm = rest.filter((book) => book.index < 4)
  const pivot = books[3]
  return [
    main ? drawBook(main, plate(parts, shadeOf(accent, 0.4))) : [],
    firm.map((book) => drawBook(book)),
    when(shaky.length > 0 && pivot !== undefined, () => {
      const y = (pivot?.y ?? 0) - (pivot?.h ?? 0) / 2
      return at(
        CX,
        y,
        motion(
          'sway',
          at(
            -CX,
            -y,
            shaky.map((book) => drawBook(book)),
          ),
        ),
      )
    }),
  ]
}

function cobwebs(parts: StudyParts, books: readonly Placed[]): Art {
  const top = books.at(-1)
  const main = books[0]
  if (!top) return []
  const edge = top.y - top.h / 2 + 1
  return [
    when(parts.webs >= 1, () => cobweb(top.x - top.w / 2 + 1, edge, 1, 33, 0)),
    when(parts.webs >= 2 && main !== undefined, () =>
      cobweb(
        (main?.x ?? CX) + (main?.w ?? 0) / 2 - 1,
        (main?.y ?? BASE) - (main?.h ?? 0) / 2 + 1,
        -1,
        27,
        1,
      ),
    ),
  ]
}

function pests(
  parts: StudyParts,
  lines: ReadonlyArray<readonly [number, number]>,
  spots: ReadonlyArray<readonly [number, number]>,
): Art {
  return [
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function surface(parts: StudyParts): Art {
  return [rings(parts.ring), when(parts.mug, () => coffeeMug(parts.stench > 0))]
}

function stackView(parts: StudyParts, accent: string, colors: readonly string[]): Art {
  const books = stacked(parts.books, parts.lean, colors, parts.grime)
  const top = topOf(books)
  return [
    desk(),
    lamp(parts.lamp, C.mint),
    surface(parts),
    when(parts.spider, spider),
    pile(parts, books, accent),
    pins(books, parts.notes),
    cobwebs(parts, books),
    when(parts.cap, () => [
      gradCap(top, accent),
      star(CX + 50, BASE - 31),
      confetti(accent),
      part('gold-sparkles', [
        sparkle(30, 112, 1.1, 1),
        sparkle(180, 58, 1.35, 2),
        sparkle(84, 22, 0.8, 3),
        sparkle(184, 94, 0.72, 4),
      ]),
    ]),
    at(58, 170, pencil(78), 87),
    floorLitter(parts),
    when(parts.alarm, alarmClock),
    when(parts.snore, snores),
    pests(
      parts,
      [
        [174, 142],
        [186, 130],
      ],
      [
        [172, 22],
        [140, 68],
      ],
    ),
  ]
}

function writingView(parts: StudyParts, accent: string, colors: readonly string[]): Art {
  const books = stacked(2, 0, colors, parts.grime)
  return [
    desk(),
    lamp(parts.lamp, C.mint),
    beam(),
    surface(parts),
    pile(parts, books, accent),
    notebook(parts, accent),
    ideaBulb(),
    floorLitter(parts),
  ]
}

function handinView(parts: StudyParts, accent: string, colors: readonly string[]): Art {
  const books = stacked(2, 0, colors, parts.grime)
  return [
    desk(),
    lamp(parts.lamp, C.mint),
    surface(parts),
    when(parts.spider, spider),
    pile(parts, books, accent),
    cobwebs(parts, books),
    testPaper(),
    arms(accent),
    at(58, 170, pencil(78), 87),
    floorLitter(parts),
    when(parts.snore, snores),
    pests(
      parts,
      [
        [174, 142],
        [186, 130],
      ],
      [
        [172, 22],
        [76, 82],
      ],
    ),
  ]
}

export function study(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = studyParts(scene)
  const accent = accentOf(scene, C.coral)
  const colors = palette(accent)
  const views: Record<StudyView, (p: StudyParts, a: string, c: readonly string[]) => Art> = {
    stack: stackView,
    writing: writingView,
    handin: handinView,
  }
  return frame('study', scene, options, views[parts.view](parts, accent, colors))
}
