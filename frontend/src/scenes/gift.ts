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
  shadeOf,
  shadow,
  sparkle,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type GiftView = 'countdown' | 'wrapping' | 'card' | 'party'

export interface GiftParts {
  view: GiftView
  step: number
  crossed: number
  urgent: boolean
  asleep: boolean
  sweat: boolean
  wilt: number
  balloon: number
  teddy: boolean
  flies: number
  blots: number
  mood: Mood
}

export const MAX_STEP = 4

const CROSSED = [0, 2, 4, 6, 7] as const
const DAYS = 8

const WILT_AT = [0.1, 0.3, 0.55] as const
const BALLOON_AT = [0.2, 0.45, 0.7] as const
const TEDDY_AT = 0.6
const FLIES_AT = [0.82, 0.95] as const
const BLOTS_AT = [0.3, 0.6, 0.85] as const
const SICK_AT = 0.55

const CALM = {
  step: 0,
  crossed: 0,
  urgent: false,
  asleep: false,
  sweat: false,
  wilt: 0,
  balloon: 0,
  teddy: false,
  flies: 0,
  blots: 0,
} as const

export function giftParts(scene: SceneView): GiftParts {
  const { state } = scene
  if (state === 'clean') return { ...CALM, view: 'party', mood: 'happy' }
  const stink = clamp01(scene.stink)
  const wilt = reached(stink, WILT_AT)
  const balloon = reached(stink, BALLOON_AT)
  if (state === 'running') {
    return { ...CALM, view: 'wrapping', wilt: Math.min(1, wilt), mood: 'happy' }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      view: 'card',
      wilt,
      balloon,
      flies: reached(stink, FLIES_AT),
      blots: reached(stink, BLOTS_AT),
      mood: stink >= SICK_AT ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_STEP, Math.floor(clamp01(scene.fill) * (MAX_STEP + 1)))
  const step = due ? MAX_STEP : resting ? 0 : raw
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (stink >= SICK_AT) mood = 'sick'
  return {
    ...CALM,
    view: 'countdown',
    step,
    crossed: due ? DAYS : resting ? 0 : (CROSSED[step] ?? DAYS),
    urgent: due,
    asleep: resting,
    sweat: !resting && !due && step >= 3,
    wilt,
    balloon,
    teddy: stink >= TEDDY_AT,
    flies: reached(stink, FLIES_AT),
    mood,
  }
}

const BODY = C.coral
const PAGE = '#fbf7ec'
const DAY = '#cfe6fb'
const BEAR = '#b99a76'
const BEAR_DARK = '#8f7353'
const BEAR_LIGHT = '#e2cdaf'
const STITCH = '#4a3627'
const BLOT = '#2b3a78'

const HEART = 'M0 7C-11-1-9-9-4-8.5C-2-8.3 0-6.5 0-4.6C0-6.5 2-8.3 4-8.5C9-9 11-1 0 7Z'

interface Tones {
  body: string
  dark: string
  light: string
  face: string
  ribbon: string
  ribbonDark: string
  ribbonLight: string
}

function tonesOf(scene: SceneView): Tones {
  const body = accentOf(scene, BODY)
  const base = { body, dark: shadeOf(body, 0.24), light: tintOf(body, 0.3) }
  if (body === BODY) {
    return {
      ...base,
      face: '#5a1c22',
      ribbon: C.sun,
      ribbonDark: C.sunDark,
      ribbonLight: '#ffe09a',
    }
  }
  if (isDarkColor(body)) {
    return {
      ...base,
      face: tintOf(body, 0.9),
      ribbon: tintOf(body, 0.36),
      ribbonDark: tintOf(body, 0.18),
      ribbonLight: tintOf(body, 0.56),
    }
  }
  return {
    ...base,
    face: mix(body, INK, 0.78),
    ribbon: C.cream,
    ribbonDark: C.creamDark,
    ribbonLight: '#ffffff',
  }
}

const LOOP_ANGLE = [0, 16, 32, 47] as const

function loop(side: number, tilt: number, color: string, dark: string): Art {
  return svg`<g transform=${`scale(${side} 1) rotate(${-tilt})`}>
    <path d="M0 0C-7-25-42-33-47-11C-50 7-18 8 0 0Z" fill=${color} />
    <path d="M-10-4C-17-17-35-21-38-10C-40-2-23 0-10-4Z" fill=${dark} />
  </g>`
}

function tail(side: number, color: string, dark: string): Art {
  return svg`<g transform=${`scale(${side} 1)`}>
    <path d="M-2 0C-12 7-21 15-28 26L-18 25L-13 33C-7 20 0 10 6 2Z" fill=${dark} />
  </g><g transform=${`scale(${side} 1)`}>
    <path d="M-2 0C-10 6-17 12-23 20L-15 20C-9 13-3 7 4 2Z" fill=${color} />
  </g>`
}

function bow(wilt: number, tones: Tones): Art {
  const fade = wilt * 0.2
  const color = mix(tones.ribbon, C.musty, fade)
  const dark = mix(tones.ribbonDark, C.mustyDark, fade)
  const tilt = LOOP_ANGLE[wilt] ?? 0
  return part(
    'bow',
    at(0, -82 + wilt * 3, [
      tail(1, color, dark),
      tail(-1, color, dark),
      loop(1, tilt, color, dark),
      loop(-1, tilt, color, dark),
      svg`<rect x="-10" y="-9" width="20" height="17" rx="6.5" fill=${dark} />`,
      svg`<rect x="-7.5" y="-9" width="15" height="15" rx="5.5" fill=${color} />`,
    ]),
  )
}

const DOTS = [
  [-36, -42],
  [-27, -14],
  [-37, -13],
  [-22, -46],
  [24, -46],
  [34, -28],
  [24, -10],
] as const

function box(mood: Mood, wilt: number, tones: Tones, extra: Art = []): Art {
  return part('box', [
    svg`<rect x="-46" y="-62" width="92" height="62" rx="7" fill=${tones.body} />`,
    svg`<path d="M34-62H46V-7Q46 0 39 0H34Z" fill=${tones.dark} opacity=".55" />`,
    DOTS.map(([x, y]) => svg`<circle cx=${x} cy=${y} r="3.1" fill=${tones.light} opacity=".75" />`),
    svg`<path d="M-46-58H46V-50H-46Z" fill=${tones.dark} opacity=".7" />`,
    svg`<rect x="-11" y="-62" width="22" height="62" fill=${tones.ribbon} />`,
    svg`<rect x="5.5" y="-62" width="5.5" height="62" fill=${tones.ribbonDark} opacity=".65" />`,
    extra,
    svg`<rect x="-55" y="-82" width="110" height="27" rx="7" fill=${tones.light} />`,
    svg`<path d="M-55-65H55V-62Q55-55 48-55H-48Q-55-55-55-62Z" fill=${tones.body} />`,
    svg`<rect x="-11" y="-82" width="22" height="27" fill=${tones.ribbonLight} />`,
    svg`<rect x="5.5" y="-82" width="5.5" height="27" fill=${tones.ribbon} />`,
    face(0, -29, mood, tones.face, 1.24),
    bow(wilt, tones),
  ])
}

function cell(x: number, y: number, crossed: boolean): Art {
  return crossed
    ? [
        svg`<rect x=${x} y=${y} width="15" height="14" rx="3.5" fill=${C.creamDark} />`,
        svg`<path d=${`M${x + 4} ${y + 3.6}l7 6.8m0-6.8l-7 6.8`} stroke=${C.coralDark} stroke-width="2.6" stroke-linecap="round" />`,
      ]
    : svg`<rect x=${x} y=${y} width="15" height="14" rx="3.5" fill=${DAY} />`
}

function calendar(crossed: number, urgent: boolean): Art {
  const days = Array.from({ length: DAYS }, (_, i) =>
    cell(-27 + (i % 3) * 18.5, 26 + Math.floor(i / 3) * 17, i < crossed),
  )
  const birthday = [
    urgent
      ? motion('flicker', svg`<rect x="8" y="57" width="23" height="22" rx="7" fill=${C.spark} />`)
      : [],
    svg`<rect x="10" y="60" width="19" height="17" rx="4.5" fill=${C.pink} />`,
    at(19.5, 68.5, svg`<path d=${HEART} fill="#fff" />`, 0, 0.74),
  ]
  return part('calendar', [
    svg`<path d="M-14 8L0 0L14 8" fill="none" stroke=${C.metalDark} stroke-width="2.2" stroke-linejoin="round" />`,
    svg`<circle r="3.2" fill=${C.metalDark} />`,
    svg`<rect x="-33" y="4" width="66" height="79" rx="8" fill=${PAGE} />`,
    svg`<path d="M-33 21V12A8 8 0 0 1-25 4H25A8 8 0 0 1 33 12V21Z" fill=${C.sky} />`,
    svg`<rect x="-15" y="11" width="30" height="4.5" rx="2.25" fill="#fff" opacity=".85" />`,
    svg`<rect x="-24" y="1" width="5" height="11" rx="2.5" fill=${C.metal} /><rect x="19" y="1" width="5" height="11" rx="2.5" fill=${C.metal} />`,
    days,
    birthday,
  ])
}

const NEAR = [
  [158, 26, 0.62],
  [153, 26, 0.76],
  [149, 25, 0.9],
  [150, 22, 1.04],
  [150, 18, 1.16],
] as const
const FAR = [164, 30, 0.5] as const
const LOOMING = [146, 16, 1.3] as const

function placed(parts: GiftParts): readonly [number, number, number] {
  if (parts.urgent) return LOOMING
  if (parts.asleep) return FAR
  return NEAR[parts.step] ?? LOOMING
}

function shed(x: number, y: number, delay: number, rotate: number): Art {
  return part(
    'torn-page',
    at(
      x,
      y,
      motion(
        'fall',
        at(
          0,
          0,
          [
            svg`<rect x="-9" y="-10" width="18" height="20" rx="3" fill=${PAGE} />`,
            svg`<rect x="-9" y="-10" width="18" height="6" rx="3" fill=${C.sky} />`,
            svg`<path d="M-4-1l8 7m0-7l-8 7" stroke=${C.coralDark} stroke-width="2.4" stroke-linecap="round" />`,
          ],
          rotate,
        ),
        delay,
      ),
    ),
  )
}

function alarm(): Art {
  const lines = [
    [100, 22, 'M0 0L-9-7'],
    [92, 44, 'M0 0H-11'],
    [99, 66, 'M0 0L-9 6'],
  ] as const
  return part(
    'alarm',
    lines.map(([x, y, d], i) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke=${C.sun} stroke-width="4.5" stroke-linecap="round" />`,
          i + 1,
        ),
      ),
    ),
  )
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

const LIMP = '#a58ad6'
const LIMP_DARK = '#7f68ad'

function sadFace(color: string): Art {
  return svg`<circle cx="-5" cy="-1" r="1.9" fill=${color} /><circle cx="5" cy="-1" r="1.9" fill=${color} /><path d="M-4 6q4-4 8 0" fill="none" stroke=${color} stroke-width="2" stroke-linecap="round" />`
}

function sadBalloon(stage: number, x: number, y: number): Art {
  if (stage === 0) return []
  if (stage === 1) {
    return part(
      'balloon',
      at(x, y, [
        svg`<path d="M0 0C-7-7 1-17-9-28" fill="none" stroke=${C.metalMid} stroke-width="1.8" stroke-linecap="round" />`,
        at(
          -10,
          -52,
          motion('sway', [
            svg`<path d="M-3 25L3 25L0 20Z" fill=${C.lilacDark} />`,
            svg`<path d="M0 22C-14 20-20 6-20-3C-20-15-11-23 0-23C11-23 20-15 20-3C20 6 14 20 0 22Z" fill=${C.lilac} />`,
            svg`<path d="M-13-8C-12-14-8-17-4-18" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".6" />`,
            sadFace(C.glass),
          ]),
        ),
      ]),
    )
  }
  if (stage === 2) {
    return part(
      'balloon',
      at(x, y, [
        svg`<path d="M0 0C-5-3-4-10-11-13" fill="none" stroke=${C.metalMid} stroke-width="1.8" stroke-linecap="round" />`,
        at(
          -15,
          -27,
          motion(
            'sway',
            [
              svg`<path d="M-3 16L3 16L0 12Z" fill=${LIMP_DARK} />`,
              svg`<path d="M0 14C-8 13-14 6-13-3C-14-11-7-15-2-13C4-16 12-12 13-3C14 5 8 13 0 14Z" fill=${LIMP} />`,
              svg`<path d="M-8-9q3 3 2 7M7-11q-1 4 2 6M-3 9q2-3 6-2" fill="none" stroke=${LIMP_DARK} stroke-width="1.8" stroke-linecap="round" />`,
              at(0, 0, sadFace(C.glass), 0, 0.72),
            ],
            2,
          ),
        ),
      ]),
    )
  }
  const ground = x - 14
  return part('balloon', [
    svg`<path d=${`M${x} ${y}C${x - 7} ${y + 22} ${ground + 9} 146 ${ground} 159`} fill="none" stroke=${C.metalMid} stroke-width="1.8" stroke-linecap="round" />`,
    shadow(ground, 183, 21, 0.24),
    at(ground, 172, [
      svg`<path d="M-4-14H4L0-8Z" fill=${LIMP_DARK} />`,
      svg`<path d="M-19 5C-21-5-12-11-3-9C4-13 16-10 18-1C20 8 12 11 1 11C-8 11-17 12-19 5Z" fill=${LIMP} />`,
      svg`<path d="M-13-3q3 2 3 5M12-4q-2 2-2 5M-5 8q5-2 10 0" fill="none" stroke=${LIMP_DARK} stroke-width="1.8" stroke-linecap="round" />`,
      at(0, 0, sadFace(C.glass), 0, 0.72),
    ]),
  ])
}

function pumpTag(): Art {
  return [
    svg`<path d="M0-13V-5" stroke=${C.cream} stroke-width="1.6" stroke-linecap="round" />`,
    svg`<rect x="-10" y="-5" width="20" height="23" rx="4" fill=${C.sky} />`,
    svg`<rect x="-6" y="-1" width="9" height="15" rx="1.6" fill="#fff" />`,
    svg`<rect x="-4.5" y="1" width="6" height="4" rx="1" fill=${C.skyDark} />`,
    svg`<path d="M3 3H5.5V10Q5.5 12 7 12" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />`,
  ]
}

function teddy(): Art {
  return part(
    'teddy',
    at(160, 184, [
      shadow(0, 0, 26, 0.24),
      at(
        0,
        0,
        [
          svg`<ellipse cx="-17" cy="-9" rx="11" ry="9" fill=${BEAR} /><ellipse cx="17" cy="-9" rx="11" ry="9" fill=${BEAR} />`,
          svg`<ellipse cx="-19" cy="-9" rx="6" ry="5.5" fill=${BEAR_LIGHT} /><ellipse cx="19" cy="-9" rx="6" ry="5.5" fill=${BEAR_LIGHT} />`,
          svg`<ellipse cy="-23" rx="18" ry="20" fill=${BEAR} />`,
          svg`<ellipse cy="-20" rx="10" ry="12" fill=${BEAR_LIGHT} />`,
          svg`<path d="M-13-46L-25-30" stroke=${BEAR} stroke-width="11" stroke-linecap="round" />`,
          svg`<path d="M13-38L20-24" stroke=${BEAR} stroke-width="11" stroke-linecap="round" />`,
          svg`<circle cx="-14" cy="-73" r="8" fill=${BEAR} /><circle cx="15" cy="-71" r="7" fill=${BEAR} />`,
          svg`<circle cx="-14" cy="-73" r="4" fill=${BEAR_DARK} />`,
          svg`<ellipse cy="-58" rx="19" ry="17" fill=${BEAR} />`,
          svg`<ellipse cx="1" cy="-52" rx="10" ry="8" fill=${BEAR_LIGHT} />`,
          svg`<path d="M-2-56h6l-3 3.4Z" fill=${STITCH} stroke=${STITCH} stroke-width="1.6" stroke-linejoin="round" />`,
          svg`<path d="M1-52v3M-5-48q3 2 6-1q3 1 5-2" fill="none" stroke=${STITCH} stroke-width="1.8" stroke-linecap="round" />`,
          svg`<circle cx="-8" cy="-62" r="3.6" fill=${STITCH} /><circle cx="-9" cy="-63.2" r="1.1" fill="#fff" />`,
          svg`<path d="M6-65l6 5.5m0-5.5l-6 5.5" stroke=${STITCH} stroke-width="2.2" stroke-linecap="round" />`,
          svg`<path d="M-11-30l4 3m-1-5l-1 6" stroke=${BEAR_DARK} stroke-width="1.6" stroke-linecap="round" />`,
          at(23, -64, pumpTag(), 10, 0.74),
          at(0, -21, [
            svg`<path d=${HEART} fill=${C.coral} transform="scale(1.45)" />`,
            svg`<path d="M-7-5l3 2m7-2l3 2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8" />`,
          ]),
          svg`<circle cx="-22" cy="-27" r="6" fill=${BEAR} /><circle cx="20" cy="-22" r="6" fill=${BEAR} />`,
          at(
            -20,
            -9,
            [
              svg`<rect x="-7" y="-5" width="14" height="10" rx="2" fill=${C.sun} />`,
              svg`<path d="M-3.5-1.5H3.5M-3.5 1.5H1" stroke=${C.coralDark} stroke-width="1.8" stroke-linecap="round" />`,
            ],
            -10,
          ),
        ],
        -4,
        0.94,
      ),
    ]),
  )
}

function buzzing(flies: number, spots: ReadonlyArray<readonly [number, number]>): Art {
  return spots.slice(0, flies).map(([x, y], i) => fly(x, y, i))
}

function countdownView(parts: GiftParts, tones: Tones): Art {
  const [x, y, s] = placed(parts)
  const hung = at(
    x,
    y,
    parts.urgent ? motion('wobble', calendar(parts.crossed, true)) : calendar(parts.crossed, false),
    parts.urgent ? 0 : 4,
    s,
  )
  return [
    hung,
    when(parts.step >= 3 || parts.urgent, () => shed(172, 136, 2, -18)),
    when(parts.urgent, alarm),
    shadow(92, 183, 62),
    at(92, 182, box(parts.mood, parts.wilt, tones)),
    sadBalloon(parts.balloon, 40, 104),
    when(parts.sweat, () => at(148, 110, motion('drip', drop(0, 0, C.water, 0.9), 2))),
    when(parts.urgent && parts.balloon === 0, () =>
      at(36, 96, motion('drip', drop(0, 0, C.water, 1), 1)),
    ),
    when(parts.teddy, teddy),
    when(parts.asleep, () => [zed(52, 88, 0.62, 1), zed(38, 66, 0.86, 2), zed(58, 44, 0.54, 3)]),
    buzzing(parts.flies, [
      [24, 76],
      [62, 44],
    ]),
  ]
}

interface Paper {
  fill: string
  dark: string
}

function paperOf(body: string): Paper {
  const n = Number.parseInt(body.slice(1), 16)
  const green = (n >> 8) & 255
  return green > ((n >> 16) & 255) && green >= (n & 255)
    ? { fill: C.lilac, dark: C.lilacDark }
    : { fill: C.mint, dark: C.mintDark }
}

function paperSheet(paper: Paper): Art {
  const dots = [
    [34, 179],
    [48, 183],
    [152, 183],
    [170, 179],
    [178, 184],
    [27, 184],
  ] as const
  return part('paper-sheet', [
    svg`<path d="M32 173H178L194 190H16Z" fill=${paper.dark} />`,
    svg`<path d="M32 171H178L192 186H18Z" fill=${paper.fill} />`,
    dots.map(([x, y]) => svg`<circle cx=${x} cy=${y} r="2.6" fill=${C.cream} />`),
  ])
}

function paperRoll(paper: Paper): Art {
  const dots = Array.from({ length: 7 }, (_, i) => [i % 2 ? 2 : -7, -14 - i * 17] as const)
  return part(
    'paper-roll',
    at(
      170,
      180,
      motion(
        'sway',
        at(
          0,
          0,
          [
            svg`<rect x="-16" y="-130" width="32" height="130" rx="4" fill=${paper.fill} />`,
            svg`<path d="M7-130H16V-4Q16 0 12 0H7Z" fill=${paper.dark} opacity=".6" />`,
            dots.map(([x, y]) => svg`<circle cx=${x} cy=${y} r="3.2" fill=${C.cream} />`),
            svg`<ellipse cy="-130" rx="16" ry="6.5" fill=${paper.dark} />`,
            svg`<ellipse cy="-130" rx="11" ry="4.2" fill=${paper.fill} />`,
            svg`<ellipse cy="-130" rx="5" ry="2.1" fill=${INK} />`,
          ],
          -4,
        ),
        2,
      ),
    ),
  )
}

function foldedCorners(paper: Paper): Art {
  return part('wrapped', [
    svg`<path d="M-46-36L-12 0H-39Q-46 0-46-7Z" fill=${paper.fill} />`,
    svg`<path d="M-46-36L-12 0" stroke=${paper.dark} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<path d="M46-36L12 0H39Q46 0 46-7Z" fill=${paper.fill} />`,
    svg`<path d="M46-36L12 0" stroke=${paper.dark} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<circle cx="-37" cy="-10" r="2.6" fill=${C.cream} /><circle cx="37" cy="-10" r="2.6" fill=${C.cream} />`,
  ])
}

function scissorHalf(side: number): Art {
  return svg`<g transform=${`scale(1 ${side})`}>
    <path d="M-4-3.4L32 7.5L-3 3.4Z" fill=${C.metal} />
    <path d="M0 0L-19-6.5" stroke=${C.sky} stroke-width="5" stroke-linecap="round" />
    <circle cx="-26" cy="-9" r="7" fill="none" stroke=${C.sky} stroke-width="4.5" />
  </g>`
}

function scissors(): Art {
  return part(
    'scissors',
    at(
      27,
      146,
      [
        scissorHalf(1),
        motion('wobble', scissorHalf(-1)),
        svg`<circle r="3.2" fill=${C.metalDark} />`,
      ],
      72,
    ),
  )
}

function wrappingView(parts: GiftParts, tones: Tones): Art {
  const paper = paperOf(tones.body)
  return [
    paperSheet(paper),
    paperRoll(paper),
    shadow(98, 182, 54, 0.2),
    at(
      98,
      181,
      motion('bob', at(0, 0, box(parts.mood, parts.wilt, tones, foldedCorners(paper)), 0, 0.92)),
    ),
    scissors(),
    sparkle(92, 56, 0.8, 2),
    sparkle(136, 72, 0.55, 4),
    sparkle(52, 78, 0.6, 3),
  ]
}

function pen(): Art {
  return part(
    'pen',
    at(
      140,
      160,
      motion(
        'sway',
        at(
          0,
          0,
          [
            svg`<path d="M0 0L-5.5-13H5.5Z" fill=${C.metalMid} />`,
            svg`<path d="M0 0L-1.8-5.5H1.8Z" fill=${C.glass} />`,
            svg`<rect x="-6.5" y="-62" width="13" height="50" rx="3" fill=${C.sky} />`,
            svg`<rect x="-6.5" y="-27" width="13" height="6" fill=${C.skyDark} />`,
            svg`<rect x="-3.5" y="-58" width="3" height="27" rx="1.5" fill="#fff" opacity=".5" />`,
            svg`<rect x="-6.5" y="-70" width="13" height="10" rx="4" fill=${C.coral} />`,
          ],
          50,
          0.84,
        ),
      ),
    ),
  )
}

const BLOTS = [
  [118, 150, 4.6],
  [168, 172, 5.2],
  [122, 118, 3.2],
] as const

function greeting(blots: number): Art {
  return part('card', [
    shadow(146, 184, 40),
    at(146, 134, [
      svg`<path d="M-37-46L37-50L41 44L-33 50Z" fill=${C.creamDark} />`,
      svg`<path d="M-37-46H35V46H-37Z" fill=${PAGE} />`,
      at(-1, -24, motion('throb', svg`<path d=${HEART} fill=${C.pink} transform="scale(1.5)" />`)),
      svg`<rect x="-26" y="-2" width="48" height="5.5" rx="2.75" fill=${C.metalMid} />`,
      svg`<rect x="-26" y="10" width="34" height="5.5" rx="2.75" fill=${C.metalMid} />`,
      svg`<path d="M-25 29H24" stroke=${C.skyDark} stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7" />`,
      svg`<path d="M-26 26q5-9 8-3t6 0q3-5 6 0" fill="none" stroke=${BLOT} stroke-width="2.6" stroke-linecap="round" />`,
    ]),
    BLOTS.slice(0, blots).map(
      ([x, y, r]) =>
        svg`<circle cx=${x} cy=${y} r=${r} fill=${BLOT} /><circle cx=${x + r + 2} cy=${y - r} r=${r * 0.35} fill=${BLOT} />`,
    ),
  ])
}

function cardView(parts: GiftParts, tones: Tones): Art {
  return [
    shadow(64, 183, 50),
    at(64, 182, at(0, 0, box(parts.mood, parts.wilt, tones), 0, 0.84)),
    sadBalloon(parts.balloon, 42, 118),
    greeting(parts.blots),
    pen(),
    buzzing(parts.flies, [
      [108, 56],
      [38, 40],
    ]),
  ]
}

const CONFETTI = [
  [24, 92, C.pink, 25, 1],
  [40, 56, C.sun, -20, 2],
  [62, 24, C.sky, 40, 3],
  [86, 40, C.mint, -35, 4],
  [114, 22, C.pink, 15, 5],
  [138, 40, C.sun, 50, 1],
  [160, 22, C.lilac, -15, 2],
  [176, 62, C.sky, 30, 3],
  [184, 104, C.mint, -40, 4],
  [16, 136, C.sun, 20, 5],
  [184, 142, C.pink, -10, 2],
] as const

const RINGS = [
  [34, 26, C.mint, 3],
  [106, 52, C.sun, 1],
  [150, 62, C.coral, 4],
  [58, 72, C.lilac, 5],
] as const

function confetti(): Art {
  return part('confetti', [
    CONFETTI.map(([x, y, color, r, d]) =>
      at(
        x,
        y,
        motion(
          'fall',
          at(0, 0, svg`<rect x="-6" y="-3" width="12" height="6" rx="1.6" fill=${color} />`, r),
          d,
        ),
      ),
    ),
    RINGS.map(([x, y, color, d]) =>
      at(x, y, motion('fall', svg`<circle r="3.6" fill=${color} />`, d)),
    ),
  ])
}

function partyView(parts: GiftParts, tones: Tones): Art {
  return [
    shadow(100, 184, 76),
    confetti(),
    at(100, 182, at(0, 0, box(parts.mood, 0, tones), 0, 1.18)),
    sparkle(26, 170, 1, 1),
    sparkle(176, 164, 0.85, 3),
    sparkle(158, 92, 0.9, 2),
    sparkle(42, 104, 0.7, 4),
  ]
}

export function gift(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = giftParts(scene)
  const tones = tonesOf(scene)
  const views: Record<GiftView, (parts: GiftParts, tones: Tones) => Art> = {
    countdown: countdownView,
    wrapping: wrappingView,
    card: cardView,
    party: partyView,
  }
  return frame('gift', scene, options, views[parts.view](parts, tones))
}
