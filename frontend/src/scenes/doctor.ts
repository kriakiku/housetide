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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type DoctorView = 'calendar' | 'call' | 'waiting' | 'heart'

export interface DoctorParts {
  view: DoctorView
  step: number
  sheets: number
  fallen: number
  crossed: number
  flutter: boolean
  bubble: boolean
  asleep: boolean
  dust: number
  webs: number
  card: boolean
  fever: number
  spider: boolean
  flies: number
  age: number
  beats: number
  ticks: number
  mood: Mood
}

export const MAX_STEP = 4
export const MAX_SHEETS = 4
export const MAX_FALLEN = 5

const CROSSED = [0, 2, 4, 5, 6] as const
const ALL_CROSSED = 7

const DUST_AT = [0.05, 0.4] as const
const WEB_AT = [0.2, 0.55] as const
const CARD_AT = 0.3
const FEVER_AT = [0.35, 0.65, 0.85] as const
const SPIDER_AT = 0.75
const FLIES_AT = [0.7, 0.92] as const
const AGE_AT = [0.05, 0.3, 0.55, 0.8] as const
const SICK_AT = 0.6

const CALM = {
  step: 0,
  sheets: MAX_SHEETS,
  fallen: 0,
  crossed: 0,
  flutter: false,
  bubble: false,
  asleep: false,
  dust: 0,
  webs: 0,
  card: false,
  fever: 0,
  spider: false,
  flies: 0,
  age: 0,
  beats: 2,
  ticks: 0,
} as const

export function doctorParts(scene: SceneView): DoctorParts {
  const { state } = scene
  if (state === 'clean') return { ...CALM, view: 'heart', mood: 'happy' }
  const fill = clamp01(scene.fill)
  const stink = clamp01(scene.stink)
  const dust = reached(stink, DUST_AT)
  const webs = reached(stink, WEB_AT)
  const hasCard = stink >= CARD_AT
  const fever = reached(stink, FEVER_AT)
  const flies = reached(stink, FLIES_AT)
  const age = reached(stink, AGE_AT) / AGE_AT.length
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...CALM,
      view: 'call',
      sheets: 0,
      crossed: ALL_CROSSED,
      dust: Math.min(1, dust),
      webs: Math.min(1, webs),
      fever,
      age: age / 2,
      beats: 2 + fever,
      ticks: Math.min(3, Math.floor(clamp01(scene.progress) * 3) + 1),
      mood: fever >= 2 ? 'worried' : 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      view: 'waiting',
      sheets: 0,
      crossed: ALL_CROSSED,
      dust,
      webs,
      card: hasCard,
      fever,
      spider: stink >= SPIDER_AT,
      flies,
      age,
      mood: sick ? 'sick' : stink >= WEB_AT[0] ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const step = due ? MAX_STEP : resting ? 0 : raw
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...CALM,
    view: 'calendar',
    step,
    sheets: due ? 0 : MAX_SHEETS - step,
    fallen: due ? MAX_FALLEN : step,
    crossed: due ? ALL_CROSSED : (CROSSED[step] ?? 0),
    flutter: !due && step >= 1,
    bubble: due,
    asleep: resting,
    dust,
    webs,
    card: hasCard,
    fever,
    spider: stink >= SPIDER_AT,
    flies,
    age,
    mood,
  }
}

const PAPER = '#fbf6e9'
const PAPER_EDGE = '#e4dcc6'
const PAPER_OLD = '#d6c493'
const FADED = '#8d8a78'
const DUST = '#d8c79c'
const DUST_DARK = '#b6a477'
const WEB = '#eef1f8'
const HEART = '#ff5f7e'
const HEART_DARK = '#d93f60'
const HEART_LIGHT = '#ff9db0'
const TUBE = C.coral
const TUBE_DARK = C.coralDark
const MERCURY = '#f2504b'
const SCREEN_LINE = '#6dfcc0'

interface Tones {
  body: string
  dark: string
  light: string
  soft: string
  cross: string
  page: string
  sheet: string
  edge: string
}

function tonesOf(scene: SceneView, age: number): Tones {
  const accent = accentOf(scene, C.sky)
  const body = mix(accent, FADED, age * 0.5)
  return {
    body,
    dark: shadeOf(body, 0.28),
    light: tintOf(body, 0.45),
    soft: tintOf(body, 0.68),
    cross: shadeOf(body, 0.36),
    page: mix(PAPER, PAPER_OLD, age * 0.8),
    sheet: mix(PAPER, PAPER_OLD, age * 0.9),
    edge: mix(PAPER_EDGE, DUST_DARK, age * 0.8),
  }
}

const FRONT_X = -66
const FRONT_W = 124
const FRONT_TOP = -118
const FRONT_BOTTOM = -8
const HEADER_H = 30
const MIDDLE = FRONT_X + FRONT_W / 2
const CELL_W = 15
const CELL_H = 14
const CELL_GAP = 5
const CELL_LEFT = MIDDLE - (4 * CELL_W + 3 * CELL_GAP) / 2
const ROWS = [-54, -34] as const
const SHEET_STEP = 3.2

function sheets(count: number, tones: Tones): Art {
  return Array.from({ length: count }, (_, i) => count - i).map((n) =>
    part(
      'sheet',
      svg`<rect x=${round(FRONT_X + n * SHEET_STEP)} y=${round(FRONT_TOP - n * SHEET_STEP)} width=${FRONT_W} height=${FRONT_BOTTOM - FRONT_TOP} rx="9" fill=${n % 2 ? tones.edge : tones.sheet} />`,
      n,
    ),
  )
}

function miniHeart(x: number, y: number, size: number, color: string): Art {
  return at(
    x,
    y,
    svg`<path d="M0 7C-8 2-10-2-8.5-5C-7-8-2.5-8 0-4.5C2.5-8 7-8 8.5-5C10-2 8 2 0 7Z" fill=${color} />`,
    0,
    size,
  )
}

function cellAt(index: number): readonly [number, number] {
  const column = index % 4
  const row = ROWS[index >= 4 ? 1 : 0] ?? -34
  return [CELL_LEFT + column * (CELL_W + CELL_GAP), row]
}

function cells(crossed: number, tones: Tones, urgent: boolean): Art {
  const days = Array.from({ length: 7 }, (_, i) => i).map((i) => {
    const [x, y] = cellAt(i)
    const done = i < crossed
    return part(
      done ? 'day-crossed' : 'day',
      [
        svg`<rect x=${x} y=${y} width=${CELL_W} height=${CELL_H} rx="3.5" fill=${done ? tones.edge : tones.soft} />`,
        when(
          done,
          () =>
            svg`<path d=${`M${x + 4} ${y + 3.5}l7 7m0-7l-7 7`} fill="none" stroke=${tones.cross} stroke-width="2.6" stroke-linecap="round" />`,
        ),
      ],
      i,
    )
  })
  const [x, y] = cellAt(7)
  const cx = x + CELL_W / 2
  const cy = y + CELL_H / 2
  const mark: Art = [
    svg`<rect x=${x} y=${y} width=${CELL_W} height=${CELL_H} rx="3.5" fill=${C.coral} />`,
    miniHeart(cx, cy - 0.4, 0.72, PAPER),
  ]
  const halo = svg`<rect x=${x - 3.5} y=${y - 3.5} width=${CELL_W + 7} height=${CELL_H + 7} rx="6.5" fill="none" stroke=${C.coralDark} stroke-width="2.6" />`
  return [days, part('appointment', [mark, urgent ? motion('pulse', halo) : halo])]
}

function ring(x: number): Art {
  return [
    svg`<rect x=${x - 4.5} y=${FRONT_TOP - 13} width="9" height="24" rx="4.5" fill=${C.metalDark} />`,
    svg`<rect x=${x - 3} y=${FRONT_TOP - 13} width="4" height="22" rx="2" fill=${C.metal} />`,
  ]
}

function earTips(x: number, y: number): Art {
  return part('ear-tips', [
    svg`<path d=${`M${x} ${y}V${y + 9}M${x} ${y + 9}Q${x - 9} ${y + 12} ${x - 9} ${y + 25}M${x} ${y + 9}Q${x + 9} ${y + 12} ${x + 9} ${y + 25}`} fill="none" stroke=${C.metalDark} stroke-width="3.6" stroke-linecap="round" />`,
    svg`<circle cx=${x - 9} cy=${y + 27} r="3.6" fill=${INK} /><circle cx=${x + 9} cy=${y + 27} r="3.6" fill=${INK} />`,
  ])
}

function chestPiece(x: number, y: number): Art {
  return part('chest-piece', [
    svg`<circle cx=${x} cy=${y} r="11.5" fill=${C.metalDark} />`,
    svg`<circle cx=${x} cy=${y} r="8.5" fill=${C.metal} />`,
    svg`<circle cx=${x} cy=${y} r="3.6" fill=${C.metalMid} />`,
  ])
}

function stethoscope(): Art {
  const left = MIDDLE - 54
  const right = MIDDLE + 54
  const tubes = `M${MIDDLE - 44} ${FRONT_TOP - 1}C${left - 6} ${FRONT_TOP + 10} ${left} ${FRONT_TOP + 46} ${left} -60M${MIDDLE + 44} ${FRONT_TOP - 1}C${right + 6} ${FRONT_TOP + 10} ${right} ${FRONT_TOP + 46} ${right} -48`
  return part('stethoscope', [
    svg`<path d=${tubes} fill="none" stroke=${TUBE_DARK} stroke-width="8" stroke-linecap="round" />`,
    svg`<path d=${tubes} fill="none" stroke=${TUBE} stroke-width="4.6" stroke-linecap="round" />`,
    earTips(left, -62),
    chestPiece(right, -36),
  ])
}

function dustOn(step: number): Art {
  if (step === 0) return []
  const specks = [
    [-46, -106, 1.9],
    [-16, -94, 1.5],
    [18, -108, 1.7],
    [38, -96, 2],
    [-34, -78, 1.5],
    [30, -64, 1.6],
    [-44, -46, 1.4],
    [24, -46, 1.3],
  ] as const
  return part('dust', [
    specks.map(
      ([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST_DARK} opacity=".9" />`,
    ),
    when(
      step >= 2,
      () =>
        svg`<path d=${`M${FRONT_X + 6} ${FRONT_TOP + 7}Q${FRONT_X + 8} ${FRONT_TOP - 6} ${FRONT_X + 24} ${FRONT_TOP - 3}Q${MIDDLE - 18} ${FRONT_TOP - 9} ${MIDDLE} ${FRONT_TOP - 4}Q${MIDDLE + 22} ${FRONT_TOP - 9} ${MIDDLE + 38} ${FRONT_TOP - 3}Q${MIDDLE + 58} ${FRONT_TOP - 5} ${MIDDLE + 57} ${FRONT_TOP + 7}Q${MIDDLE + 30} ${FRONT_TOP + 3} ${MIDDLE} ${FRONT_TOP + 7}Q${MIDDLE - 30} ${FRONT_TOP + 3} ${FRONT_X + 6} ${FRONT_TOP + 7}Z`} fill=${DUST} />`,
    ),
  ])
}

function web(x: number, y: number, side: number, size: number): Art {
  const threads = [0, 1, 2, 3, 4].map((i) => {
    const a = ((6 + i * 19.5) * Math.PI) / 180
    return [Math.cos(a), Math.sin(a)] as const
  })
  const arc = (k: number): string =>
    threads
      .map(([tx, ty], i) => {
        const px = round(tx * k)
        const py = round(ty * k)
        if (i === 0) return `M${px} ${py}`
        const [ax, ay] = threads[i - 1] ?? [tx, ty]
        return `Q${round(((tx + ax) / 2) * k * 0.86)} ${round(((ty + ay) / 2) * k * 0.86)} ${px} ${py}`
      })
      .join('')
  return part(
    'cobweb',
    at(
      x,
      y,
      svg`<g transform=${`scale(${side} 1)`} fill="none" stroke=${WEB} stroke-width="1.9" stroke-linecap="round" stroke-opacity=".92">
        ${threads.map(([tx, ty]) => svg`<path d=${`M0 0L${round(tx * size)} ${round(ty * size)}`} />`)}
        ${[0.38, 0.66, 0.94].map((k) => svg`<path d=${arc(size * k)} />`)}
      </g>`,
    ),
  )
}

interface CalendarLook {
  sheets: number
  crossed: number
  mood: Mood
  urgent?: boolean
  dust?: number
}

function calendar(look: CalendarLook, tones: Tones): Art {
  return part('calendar', [
    sheets(look.sheets, tones),
    svg`<rect x=${FRONT_X} y=${FRONT_TOP} width=${FRONT_W} height=${FRONT_BOTTOM - FRONT_TOP} rx="10" fill=${tones.page} />`,
    svg`<path d=${`M${FRONT_X} ${FRONT_TOP + HEADER_H}V${FRONT_TOP + 10}a10 10 0 0 1 10-10H${FRONT_X + FRONT_W - 10}a10 10 0 0 1 10 10V${FRONT_TOP + HEADER_H}Z`} fill=${tones.body} />`,
    svg`<rect x=${FRONT_X} y=${FRONT_TOP + HEADER_H - 4} width=${FRONT_W} height="4" fill=${tones.dark} />`,
    svg`<rect x=${MIDDLE - 18} y=${FRONT_TOP + 10} width="36" height="7" rx="3.5" fill=${tones.light} />`,
    cells(look.crossed, tones, look.urgent === true),
    face(MIDDLE, -71, look.mood, C.fly, 1.08),
    svg`<rect x="-76" y="-13" width="152" height="13" rx="6" fill=${tones.dark} />`,
    svg`<rect x="-66" y="-6.5" width="132" height="2.6" rx="1.3" fill=${tones.body} />`,
    ring(MIDDLE - 30),
    ring(MIDDLE + 30),
    stethoscope(),
    dustOn(look.dust ?? 0),
  ])
}

function page(x: number, y: number, rotate: number, tones: Tones, size = 1): Art {
  return at(
    x,
    y,
    [
      svg`<rect x="-15" y="-11" width="30" height="22" rx="3.5" fill=${tones.page} />`,
      svg`<path d="M-15-5V-7.5A3.5 3.5 0 0 1-11.5-11H11.5A3.5 3.5 0 0 1 15-7.5V-5Z" fill=${tones.body} />`,
      svg`<path d="M-9 0H-3M3 0H9M-9 6H-3" stroke=${tones.edge} stroke-width="3.2" stroke-linecap="round" />`,
    ],
    rotate,
    size,
  )
}

const FALLEN_SPOTS = [
  [28, 169, -14],
  [172, 171, 12],
  [57, 174, 9],
  [144, 174, -9],
  [100, 175, -3],
] as const

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

const HANDSET =
  'M-31 3C-31-15-15-21 0-21C15-21 31-15 31 3V10Q31 15 26 15H13Q8 15 8 10V5Q8-2 0-2Q-8-2-8 5V10Q-8 15-13 15H-26Q-31 15-31 10Z'

export function handset(color: string, shine: string): Art {
  return [
    svg`<path d=${HANDSET} fill=${color} />`,
    svg`<path d="M-23-5C-18-12-9-15 0-15C9-15 18-12 23-5" fill="none" stroke=${shine} stroke-width="3.6" stroke-linecap="round" />`,
  ]
}

function pleaBubble(): Art {
  return part('plea', [
    svg`<circle cx="138" cy="62" r="3.5" fill=${C.cream} /><circle cx="147" cy="53" r="5" fill=${C.cream} />`,
    at(
      164,
      36,
      motion('pulse', [
        svg`<circle r="22" fill=${C.cream} />`,
        at(0, 0, handset(C.coral, tintOf(C.coral, 0.4)), -135, 0.66),
      ]),
    ),
  ])
}

function card(x: number, y: number, tones: Tones): Art {
  return part(
    'dusty-card',
    at(
      x,
      y,
      [
        svg`<rect x="-19" y="-52" width="38" height="52" rx="5" fill=${mix(PAPER, PAPER_OLD, 0.7)} />`,
        svg`<path d="M-19-40V-47A5 5 0 0 1-14-52H14A5 5 0 0 1 19-47V-40Z" fill=${mix(HEART, FADED, 0.45)} />`,
        miniHeart(0, -46, 0.56, mix(PAPER, PAPER_OLD, 0.4)),
        svg`<rect x="-12" y="-32" width="24" height="4" rx="2" fill=${tones.edge} />`,
        svg`<rect x="-12" y="-24" width="17" height="4" rx="2" fill=${tones.edge} />`,
        svg`<rect x="-12" y="-14" width="24" height="9" rx="2.5" fill="none" stroke=${DUST_DARK} stroke-width="2" stroke-dasharray="2.5 3" />`,
        svg`<path d="M-20-48Q-19-58-8-55Q2-61 9-55Q21-57 20-47Q10-51 2-48Q-9-52-20-48Z" fill=${DUST} />`,
        svg`<circle cx="-7" cy="-37" r="1.5" fill=${DUST_DARK} /><circle cx="9" cy="-19" r="1.4" fill=${DUST_DARK} /><circle cx="-10" cy="-9" r="1.3" fill=${DUST_DARK} />`,
      ],
      -9,
    ),
  )
}

function thermometer(x: number, y: number, fever: number, rotate: number, scale = 1): Art {
  const rise = [0, 22, 42, 62][fever] ?? 0
  const mood: Mood = fever >= 3 ? 'sick' : 'worried'
  return part(
    'thermometer',
    at(
      x,
      y,
      [
        svg`<rect x="-9" y="-92" width="18" height="86" rx="9" fill=${C.metal} />`,
        svg`<rect x="-3.6" y=${-24 - rise} width="7.2" height=${rise + 20} rx="3.6" fill=${MERCURY} />`,
        svg`<path d="M9-80H4M9-66H4M9-52H4M9-38H4" stroke=${C.metalDark} stroke-width="2" stroke-linecap="round" />`,
        svg`<circle cy="-9" r="17" fill=${MERCURY} />`,
        svg`<circle cx="-6" cy="-15" r="3.4" fill="#fff" opacity=".6" />`,
        face(0, -9, mood, '#fff', 0.56),
        when(fever >= 2, () =>
          at(
            13,
            -86,
            motion(
              'drip',
              svg`<path d="M0-6C3-2 4 0 4 2a4 4 0 0 1-8 0C-4 0-3-2 0-6Z" fill=${C.water} />`,
            ),
          ),
        ),
        when(fever >= 3, () =>
          motion(
            'flicker',
            svg`<path d="M-16-100l-5-7M0-104v-9M16-100l5-7" fill="none" stroke=${C.sun} stroke-width="3.4" stroke-linecap="round" />`,
          ),
        ),
      ],
      rotate,
      scale,
    ),
  )
}

function spider(x: number, y: number): Art {
  return part(
    'spider',
    at(
      x,
      y,
      motion('sway', [
        svg`<path d="M0 0V34" stroke=${WEB} stroke-width="1.6" />`,
        at(0, 42, [
          svg`<path d="M-7-3L-14-8M-7 0L-15 0M-7 3L-14 8M7-3L14-8M7 0L15 0M7 3L14 8" fill="none" stroke=${C.fly} stroke-width="2.2" stroke-linecap="round" />`,
          svg`<circle r="8.5" fill=${C.fly} stroke=${C.wing} stroke-width="1.2" />`,
          svg`<circle cx="-3" cy="-1.5" r="2.1" fill="#fff" /><circle cx="3" cy="-1.5" r="2.1" fill="#fff" /><circle cx="-3" cy="-1.2" r="1" fill=${C.fly} /><circle cx="3" cy="-1.2" r="1" fill=${C.fly} />`,
        ]),
      ]),
    ),
  )
}

function calendarView(parts: DoctorParts, tones: Tones): Art {
  const flySpots = [
    [116, 34],
    [28, 40],
  ] as const
  return [
    shadow(100, 182, 76),
    at(
      100,
      178,
      calendar(
        {
          sheets: parts.sheets,
          crossed: parts.crossed,
          mood: parts.mood,
          urgent: parts.bubble,
          dust: parts.dust,
        },
        tones,
      ),
      0,
      0.92,
    ),
    when(parts.webs >= 1, () => web(40, 64, 1, 50)),
    when(parts.webs >= 2, () => web(160, 64, -1, 42)),
    FALLEN_SPOTS.slice(0, parts.fallen).map(([x, y, r], i) =>
      part('fallen-page', page(x, y, r, tones, 0.86), i),
    ),
    when(parts.flutter, () =>
      part('flutter', at(170, 92, motion('fall', page(0, 0, 16, tones), 2))),
    ),
    when(parts.card, () => card(38, 182, tones)),
    when(parts.fever > 0, () => thermometer(173, 178, parts.fever, 1, 0.86)),
    when(parts.spider, () => spider(30, 64)),
    when(parts.bubble, pleaBubble),
    when(parts.asleep, () => [zed(146, 50, 0.72, 1), zed(162, 36, 1, 2), zed(180, 22, 0.6, 3)]),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function ecgPath(beats: number): string {
  const span = 76 / beats
  const scale = Math.min(1, span / 30)
  const beat = (i: number): string => {
    const x = -38 + i * span
    return `L${round(x + span * 0.18)} 8l${round(3 * scale)} -4l${round(3 * scale)} 4l${round(3 * scale)} 5l${round(4 * scale)} -30l${round(4 * scale)} 35l${round(3 * scale)} -10L${round(x + span)} 8`
  }
  return `M-38 8${Array.from({ length: beats }, (_, i) => beat(i)).join('')}`
}

function monitor(parts: DoctorParts): Art {
  const line =
    parts.fever >= 2 ? mix(SCREEN_LINE, C.coral, 0.85) : parts.fever >= 1 ? C.sun : SCREEN_LINE
  const dots = [0, 1, 2].map(
    (i) =>
      svg`<rect x=${16 + i * 9} y="-26" width="6.5" height="4.5" rx="2.2" fill=${i < parts.ticks ? line : '#3a4a78'} />`,
  )
  return part('monitor', [
    svg`<path d="M-28 34L-40 54L-8 36Z" fill=${C.metalMid} />`,
    svg`<rect x="-48" y="-36" width="96" height="74" rx="13" fill=${C.metalMid} />`,
    svg`<rect x="-42" y="-30" width="84" height="62" rx="9" fill=${C.glass} />`,
    svg`<path d="M-40 8H40" stroke="#34466f" stroke-width="1.6" />`,
    motion(
      'flicker',
      svg`<path d=${ecgPath(parts.beats)} fill="none" stroke=${line} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
    at(-27, -18, motion('throb', miniHeart(0, 0, 1, HEART))),
    dots,
  ])
}

function waves(): Art {
  const arcs = [
    [144, 124, 'M0-9Q6 0 0 9'],
    [153, 120, 'M0-14Q10 0 0 14'],
  ] as const
  return part(
    'sound',
    arcs.map(([x, y, d], i) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke=${C.spark} stroke-width="4" stroke-linecap="round" />`,
          i + 1,
        ),
        -18,
      ),
    ),
  )
}

function deskPhone(): Art {
  return part('desk-phone', [
    shadow(150, 183, 34, 0.24),
    svg`<path d="M122 182L128 158Q130 150 138 150H162Q170 150 172 158L178 182Z" fill=${C.coral} />`,
    svg`<rect x="118" y="176" width="64" height="8" rx="4" fill=${C.coralDark} />`,
    svg`<circle cx="150" cy="166" r="9.5" fill=${C.cream} />`,
    svg`<circle cx="150" cy="166" r="3.2" fill=${C.coralDark} />`,
    svg`<path d="M133 151C124 153 128 146 122 148C116 150 121 143 115 144" fill="none" stroke=${C.coralDark} stroke-width="3.4" stroke-linecap="round" />`,
  ])
}

function callView(parts: DoctorParts, tones: Tones): Art {
  return [
    shadow(60, 182, 52),
    deskPhone(),
    at(
      60,
      180,
      motion(
        'bob',
        at(
          0,
          0,
          calendar(
            { sheets: 0, crossed: parts.crossed, mood: parts.mood, dust: parts.dust },
            tones,
          ),
          0,
          0.64,
        ),
      ),
    ),
    when(parts.webs >= 1, () => web(18, 98, 1, 32)),
    at(120, 118, motion('sway', at(0, 0, handset(C.coral, tintOf(C.coral, 0.4)), 78, 0.92), 2)),
    waves(),
    at(136, 60, motion('bob', monitor(parts), 1)),
    when(parts.fever >= 3, () => thermometer(178, 183, 3, 6, 0.46)),
  ]
}

function seat(x: number, color: string, dark: string): Art {
  return part('chair', [
    svg`<rect x=${x - 30} y="86" width="60" height="58" rx="11" fill=${dark} />`,
    svg`<rect x=${x - 26} y="90" width="52" height="42" rx="9" fill=${color} />`,
    svg`<rect x=${x - 36} y="136" width="72" height="13" rx="6.5" fill=${color} />`,
    svg`<rect x=${x - 36} y="143" width="72" height="6" rx="3" fill=${dark} />`,
  ])
}

function bench(): Art {
  const color = C.sun
  const dark = C.sunDark
  return part('bench', [
    shadow(104, 183, 84),
    svg`<rect x="26" y="150" width="156" height="7" rx="3.5" fill=${C.metalDark} />`,
    svg`<path d="M46 156L38 182M162 156L170 182M104 156V182" stroke=${C.metalDark} stroke-width="6.5" stroke-linecap="round" />`,
    seat(66, color, dark),
    seat(142, color, dark),
  ])
}

function ticket(age: number): Art {
  const paper = mix(PAPER, PAPER_OLD, age)
  const ink = mix(C.fly, DUST_DARK, age * 0.5)
  return part('ticket', [
    svg`<path d="M-21-30Q-21-34-17-34H17Q21-34 21-30V27L14.8 33L8.4 27L2 33L-4.4 27L-10.8 33L-17 27L-21 31Z" fill=${paper} />`,
    svg`<circle cy="-20" r="7.5" fill=${mix(C.coral, FADED, age * 0.6)} />`,
    miniHeart(0, -20.4, 0.62, paper),
    svg`<path d="M-14-6H14" stroke=${ink} stroke-width="1.6" stroke-dasharray="2.4 3.4" stroke-linecap="round" />`,
    svg`<rect x="-13" y="1" width="8" height="15" rx="2.5" fill=${ink} /><rect x="-3" y="1" width="8" height="15" rx="2.5" fill=${ink} /><rect x="7" y="1" width="6" height="15" rx="2.5" fill=${ink} />`,
    svg`<rect x="-13" y="20" width="26" height="2.8" rx="1.4" fill=${ink} opacity=".5" />`,
  ])
}

function board(): Art {
  return part('queue-board', [
    svg`<rect x="118" y="20" width="68" height="38" rx="8" fill=${C.metalDark} />`,
    svg`<rect x="123" y="25" width="58" height="28" rx="5" fill=${C.glass} />`,
    svg`<path d="M131 39H146M140 33L146.5 39L140 45" fill="none" stroke=${C.mint} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<rect x="155" y="31" width="7" height="16" rx="2.5" fill=${C.sun} /><rect x="165" y="31" width="7" height="16" rx="2.5" fill=${C.sun} />`,
  ])
}

function wallClock(): Art {
  return part('clock', [
    svg`<circle cx="74" cy="31" r="16" fill=${C.metalDark} />`,
    svg`<circle cx="74" cy="31" r="12.5" fill=${C.cream} />`,
    svg`<path d="M74 31V22.5M74 31L80 34" fill="none" stroke=${C.fly} stroke-width="2.8" stroke-linecap="round" />`,
  ])
}

function waitingView(parts: DoctorParts, tones: Tones): Art {
  const flySpots = [
    [118, 72],
    [26, 34],
  ] as const
  return [
    wallClock(),
    board(),
    bench(),
    at(
      66,
      138,
      calendar({ sheets: 0, crossed: parts.crossed, mood: parts.mood, dust: parts.dust }, tones),
      0,
      0.64,
    ),
    when(parts.webs >= 1, () => web(24, 54, 1, 34)),
    when(parts.webs >= 2, () => web(108, 54, -1, 28)),
    when(parts.card, () => card(166, 182, tones)),
    at(142, 108, motion('bob', at(0, 0, ticket(parts.age), 7, 0.96))),
    when(parts.fever > 0, () => thermometer(24, 180, parts.fever, -4, 0.56)),
    when(parts.spider, () => spider(174, 58)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

const HEART_SHAPE = 'M0 44C-48 12-62-10-52-32C-42-52-14-50 0-26C14-50 42-52 52-32C62-10 48 12 0 44Z'

function plus(x: number, y: number, size: number, color: string, delay: number): Art {
  return part(
    'confetti',
    at(
      x,
      y,
      motion(
        'twinkle',
        svg`<path d="M0-7V7M-7 0H7" stroke=${color} stroke-width="5" stroke-linecap="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function joyHeart(): Art {
  return part('heart', [
    svg`<path d=${HEART_SHAPE} fill=${HEART} />`,
    svg`<path d="M0 44C-30 24-46 8-53-8C-40 16-16 26 0 28C16 26 40 16 53-8C46 8 30 24 0 44Z" fill=${HEART_DARK} />`,
    svg`<path d="M-44-22C-40-34-30-38-22-36" fill="none" stroke=${HEART_LIGHT} stroke-width="6" stroke-linecap="round" />`,
    svg`<circle cx="-30" cy="-3" r="6.5" fill=${HEART_LIGHT} /><circle cx="30" cy="-3" r="6.5" fill=${HEART_LIGHT} />`,
    face(0, -12, 'happy', '#6b1730', 1.15),
  ])
}

function badge(): Art {
  return part('check', [
    svg`<circle r="23" fill=${C.check} />`,
    svg`<circle r="17.5" fill=${mix(C.check, '#ffffff', 0.18)} />`,
    svg`<path d="M-9.5 0L-3 7L10-7.5" fill="none" stroke="#fff" stroke-width="5.6" stroke-linecap="round" stroke-linejoin="round" />`,
  ])
}

function coiled(): Art {
  const tube = 'M163 173C150 184 128 186 122 176C118 166 146 162 150 172C152 180 138 180 128 176'
  return part('stethoscope', [
    svg`<path d=${tube} fill="none" stroke=${TUBE_DARK} stroke-width="7" stroke-linecap="round" />`,
    svg`<path d=${tube} fill="none" stroke=${TUBE} stroke-width="3.8" stroke-linecap="round" />`,
    chestPiece(172, 172),
  ])
}

function heartView(tones: Tones): Art {
  return [
    shadow(100, 182, 52),
    coiled(),
    at(40, 182, calendar({ sheets: 0, crossed: ALL_CROSSED, mood: 'happy' }, tones), 0, 0.4),
    at(102, 92, motion('throb', at(0, 0, joyHeart(), 0, 1.3))),
    at(150, 128, badge()),
    sparkle(30, 56, 1.25, 1),
    sparkle(172, 42, 1.1, 2),
    sparkle(182, 100, 0.75, 3),
    sparkle(100, 24, 0.8, 4),
    plus(24, 112, 0.8, C.sun, 2),
    plus(62, 24, 0.7, C.mint, 3),
    plus(146, 22, 0.7, C.pink, 1),
  ]
}

export function doctor(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = doctorParts(scene)
  const tones = tonesOf(scene, parts.age)
  const views: Record<DoctorView, () => Art> = {
    calendar: () => calendarView(parts, tones),
    call: () => callView(parts, tones),
    waiting: () => waitingView(parts, tones),
    heart: () => heartView(tones),
  }
  const art = views[parts.view]()
  return frame('doctor', scene, options, art)
}
