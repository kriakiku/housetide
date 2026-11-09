import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneState, SceneView } from '../types.ts'
import {
  accentOf,
  at,
  clamp01,
  COLORS as C,
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
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, SceneOptions } from './common.ts'

export type TomatoExpression =
  | 'asleep'
  | 'hopeful'
  | 'determined'
  | 'frozen'
  | 'distracted'
  | 'blissful'
  | 'queasy'
  | 'rotten'

export interface TomatoParts {
  view: 'desk' | 'hammock'
  dial: number
  lit: number
  rot: number
  stench: number
  flies: number
  drift: number
  phone: boolean
  bubble: 'play' | 'pause' | null
  sparks: boolean
  expression: TomatoExpression
}

export const DIAL_STEPS = 12
export const MAX_ROT = 4

const ROT_AT = [0.1, 0.35, 0.6, 0.85] as const
const STENCH_AT = [0.1, 0.4, 0.7] as const
const FLIES_AT = [0.45, 0.7, 0.9] as const
const DRIFT_AT = [0.3, 0.6, 0.9] as const
const MAX_DRIFT = DRIFT_AT.length

const EXPRESSIONS: Record<SceneState, TomatoExpression> = {
  resting: 'asleep',
  accumulating: 'distracted',
  due: 'hopeful',
  running: 'determined',
  waiting: 'frozen',
  clean: 'blissful',
}

export function tomatoParts(scene: SceneView): TomatoParts {
  const { state, fill, stink } = scene
  const dial = Math.round(clamp01(scene.progress) * DIAL_STEPS)
  const clean = state === 'clean'
  const rot = clean ? 0 : reached(stink, ROT_AT)
  const litBy: Record<SceneState, number> = {
    resting: 0,
    accumulating: dial,
    due: DIAL_STEPS,
    running: dial,
    waiting: dial,
    clean: DIAL_STEPS,
  }
  let expression = EXPRESSIONS[state]
  if (rot === 2) expression = 'queasy'
  if (rot > 2) expression = 'rotten'
  const bubbles: Partial<Record<SceneState, 'play' | 'pause'>> = { due: 'play', waiting: 'pause' }
  return {
    view: clean ? 'hammock' : 'desk',
    dial,
    lit: litBy[state],
    rot,
    stench: clean ? 0 : reached(stink, STENCH_AT),
    flies: clean ? 0 : reached(stink, FLIES_AT),
    drift: state === 'accumulating' ? reached(fill, DRIFT_AT) : 0,
    phone: state === 'accumulating',
    bubble: bubbles[state] ?? null,
    sparks: state === 'running' && rot < 3,
    expression,
  }
}

interface Palette {
  body: string
  shade: string
  light: string
  ink: string
  pupil: string
  groove: string
  off: string
  on: string
  leaf: string
  leafDark: string
  stem: string
}

const ROT_BODY = '#7d6238'
const ROT_LEAF = '#8c7a3e'

function paletteOf(scene: SceneView, parts: TomatoParts): Palette {
  const decay = parts.rot / MAX_ROT
  const accent = accentOf(scene, C.coral)
  const body = mix(accent, ROT_BODY, decay * 0.74)
  const fade = parts.drift / MAX_DRIFT
  const lit: Record<SceneState, string> = {
    resting: C.sun,
    accumulating: mix(C.sun, C.creamDark, fade * 0.8),
    due: C.sun,
    running: C.sun,
    waiting: mix(C.sun, C.metalDark, 0.55),
    clean: C.mint,
  }
  return {
    body,
    shade: shadeOf(body, 0.26),
    light: tintOf(body, 0.34),
    ink: isDarkColor(body) ? tintOf(body, 0.86) : mix(body, INK, 0.8),
    pupil: isDarkColor(body) ? INK : mix(body, INK, 0.8),
    groove: shadeOf(body, 0.34),
    off: mix(C.cream, ROT_BODY, decay * 0.55),
    on: mix(lit[scene.state], ROT_BODY, decay * 0.5),
    leaf: mix(C.leaf, ROT_LEAF, decay),
    leafDark: mix(C.leafDark, ROT_BODY, decay),
    stem: mix(C.leafDark, ROT_BODY, decay),
  }
}

const CX = 100
const CY = 124
const RING = 43
const BODY =
  'M100 66C116 56 150 56 166 84C182 112 172 154 144 171C130 179 114 180 100 180C86 180 70 179 56 171C28 154 18 112 34 84C50 56 84 56 100 66Z'
const SEGMENT_HALF = (11 * Math.PI) / 180
const SEGMENT = `M${round(-RING * Math.sin(SEGMENT_HALF))} ${round(-RING * Math.cos(SEGMENT_HALF))}A${RING} ${RING} 0 0 1 ${round(RING * Math.sin(SEGMENT_HALF))} ${round(-RING * Math.cos(SEGMENT_HALF))}`
const NEEDLE = 'M0-55L6.5-38Q0-34-6.5-38Z'
const SEPAL = 'M0-2C-8 4-8 18 0 34C8 18 8 4 0-2Z'
const SEPALS = [
  [80, 0.95],
  [38, 0.66],
  [-38, 0.66],
  [-80, 0.95],
] as const

function line(d: string, color: string, width = 3.4): Art {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`
}

function eye(x: number, y: number, r: number, ink: string): Art {
  return svg`<circle cx=${x} cy=${y} r=${r} fill=${ink} /><circle cx=${x + r * 0.34} cy=${y - r * 0.38} r=${r * 0.34} fill="#fff" />`
}

function lid(r: number, share: number): string {
  const y = -r + 2 * r * share
  const half = round(Math.sqrt(Math.max(0, r * r - y * y)))
  return `M${-half} ${round(y)}A${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${half} ${round(y)}Z`
}

function lookingEye(
  x: number,
  y: number,
  r: number,
  lookX: number,
  lookY: number,
  share: number,
  palette: Palette,
): Art {
  return at(x, y, [
    svg`<circle r=${r} fill=${C.cream} />`,
    svg`<circle cx=${lookX} cy=${lookY} r=${r * 0.56} fill=${palette.pupil} />`,
    when(share > 0, () => svg`<path d=${lid(r, share)} fill=${palette.shade} />`),
  ])
}

function crossEye(x: number, y: number, ink: string): Art {
  return at(x, y, line('M-7-7L7 7M7-7L-7 7', ink, 4.2))
}

const LIDS = [0, 0.26, 0.44, 0.6] as const
const SLACK = [
  'M-7 14q7 5 14 0',
  'M-7 16h14',
  'M-6 15q6-5 12 0',
  'M-5 17a5 5 0 0 1 10 0a5 5 0 0 1-10 0Z',
]

function faceOf(parts: TomatoParts, palette: Palette): Art {
  const { ink } = palette
  const cheek = mix(palette.body, C.pink, 0.55)
  const cheeks = svg`<ellipse cx="-27" cy="9" rx="6.5" ry="4" fill=${cheek} /><ellipse cx="27" cy="9" rx="6.5" ry="4" fill=${cheek} />`
  const drift = parts.drift
  const shapes: Record<TomatoExpression, () => Art> = {
    asleep: () => [
      line('M-24-3q7 6 14 0', ink),
      line('M10-3q7 6 14 0', ink),
      line('M-4 13h8', ink),
    ],
    hopeful: () => [
      cheeks,
      eye(-15, -4, 8, ink),
      eye(15, -4, 8, ink),
      svg`<path d="M-9 11q9 11 18 0Z" fill=${ink} stroke=${ink} stroke-width="3" stroke-linejoin="round" />`,
    ],
    determined: () => [
      eye(-15, -2, 6.8, ink),
      eye(15, -2, 6.8, ink),
      line('M-25-14L-8-10', ink, 5),
      line('M25-14L8-10', ink, 5),
      svg`<path d="M3 14h11v3a5.5 5.5 0 0 1-11 0Z" fill=${C.pink} />`,
      line('M-10 15q10-3 21-1', ink, 3.8),
    ],
    frozen: () => [
      lookingEye(-15, -3, 9.5, 3, -3.2, 0, palette),
      lookingEye(15, -3, 9.5, 3, -3.2, 0, palette),
      line('M-6 15h12', ink),
    ],
    distracted: () => [
      lookingEye(-15, -3, 9.5, 2.4 + drift * 0.5, -1.4 - drift * 0.6, LIDS[drift] ?? 0, palette),
      lookingEye(15, -3, 9.5, 2.4 + drift * 0.5, -1.4 - drift * 0.6, LIDS[drift] ?? 0, palette),
      drift === MAX_DRIFT
        ? svg`<path d=${SLACK[drift] ?? ''} fill=${ink} />`
        : line(SLACK[drift] ?? '', ink),
    ],
    blissful: () => [
      cheeks,
      line('M-24-1q7-8 14 0', ink, 4),
      line('M10-1q7-8 14 0', ink, 4),
      line('M-8 11q8 9 16 0', ink, 4),
    ],
    queasy: () => [
      lookingEye(-15, -3, 9, 0, 2, 0.5, palette),
      lookingEye(15, -3, 9, 0, 2, 0.5, palette),
      line('M-11 16q4-5 7-1t7-1t8 2', ink),
    ],
    rotten: () => [
      crossEye(-16, -4, ink),
      lookingEye(15, -4, 10, -2, 3, 0.42, palette),
      line('M-11 13q11 4 22 0', ink),
      svg`<path d="M-2 14h13v8a6.5 6.5 0 0 1-13 0Z" fill=${C.pink} />`,
      line('M4.5 16v6', C.pinkDark, 2),
    ],
  }
  return part('face', at(CX, CY, shapes[parts.expression]()))
}

function dialBand(parts: TomatoParts, palette: Palette): Art {
  return part(
    'dial',
    at(CX, CY, [
      svg`<circle r=${RING} fill="none" stroke=${palette.groove} stroke-width="13" />`,
      Array.from({ length: DIAL_STEPS }, (_, i) =>
        at(
          0,
          0,
          svg`<path d=${SEGMENT} fill="none" stroke=${i < parts.lit ? palette.on : palette.off} stroke-width="7.5" />`,
          (i + 0.5) * (360 / DIAL_STEPS),
        ),
      ),
    ]),
  )
}

function pointer(parts: TomatoParts, palette: Palette, ticking: boolean): Art {
  const needle: Art = [
    svg`<path d=${NEEDLE} fill=${palette.pupil} stroke=${C.cream} stroke-width="2.2" stroke-linejoin="round" />`,
  ]
  return part(
    'pointer',
    at(CX, CY, ticking ? motion('sway', needle) : needle, parts.dial * (360 / DIAL_STEPS)),
    parts.dial,
  )
}

function crown(palette: Palette, rot: number, swaying: boolean): Art {
  const stalk: Art = [
    line('M0 2C0-8 2-14 6-22', palette.stem, 9),
    svg`<ellipse cx="7" cy="-24" rx="7.5" ry="4.5" transform="rotate(-16 7 -24)" fill=${palette.leaf} />`,
  ]
  return part(
    'crown',
    at(CX, 64, [
      swaying ? motion('sway', stalk) : stalk,
      SEPALS.map(([angle, size]) =>
        at(
          0,
          0,
          [svg`<path d=${SEPAL} fill=${palette.leaf} />`, line('M0 5V22', palette.leafDark, 2.2)],
          angle + Math.sign(angle) * rot * 6,
          size,
        ),
      ),
      svg`<circle r="7" fill=${palette.leaf} />`,
    ]),
  )
}

function arm(d: string, hand: readonly [number, number], color: string): Art {
  return [line(d, color, 9), svg`<circle cx=${hand[0]} cy=${hand[1]} r="7" fill=${color} />`]
}

function arms(scene: SceneView, parts: TomatoParts, palette: Palette): Art {
  const color = palette.shade
  if ((scene.state === 'due' || scene.state === 'running') && parts.rot >= 2) {
    return part('arms', [
      arm('M32 134Q24 146 28 160', [28, 162], color),
      arm('M168 134Q176 146 172 160', [172, 162], color),
    ])
  }
  if (scene.state === 'due') {
    return part('arms', [
      arm('M34 120Q18 114 17 92', [17, 90], color),
      arm('M166 120Q182 114 183 92', [183, 90], color),
    ])
  }
  if (scene.state === 'running') {
    return part('arms', [
      arm('M36 148Q18 148 18 130', [18, 128], color),
      arm('M164 148Q182 148 182 130', [182, 128], color),
    ])
  }
  if (parts.phone && parts.drift >= 2) {
    return part('arms', arm('M166 106Q194 100 174 79', [173, 77], color))
  }
  return []
}

const SPOTS = [
  [38, 114, 5, 4],
  [163, 138, 6, 4.5],
  [156, 88, 4, 3],
] as const

function blemishes(parts: TomatoParts, palette: Palette): Art {
  const spot = mix(palette.body, C.soil, 0.55)
  return [
    when(parts.rot >= 1, () =>
      part(
        'spots',
        SPOTS.map(
          ([x, y, rx, ry]) => svg`<ellipse cx=${x} cy=${y} rx=${rx} ry=${ry} fill=${spot} />`,
        ),
      ),
    ),
    when(parts.rot >= 2, () =>
      part('wrinkles', [
        line('M34 134q7 4 3 12M32 96q8 3 5 11', palette.shade, 3.2),
        line('M168 106q-7 4-4 11M168 142q-8 3-6 12', palette.shade, 3.2),
        line('M64 70q-6 8-4 16M136 70q6 8 4 16', palette.shade, 3.2),
      ]),
    ),
    when(parts.rot >= 3, () =>
      part('mould', [
        svg`<g fill=${C.musty}><circle cx="60" cy="74" r="9" /><circle cx="50" cy="82" r="7" /><circle cx="69" cy="80" r="6" /><circle cx="150" cy="158" r="7" /><circle cx="142" cy="165" r="5" /></g>`,
        svg`<g fill=${C.cream}><circle cx="57" cy="72" r="1.8" /><circle cx="64" cy="78" r="1.5" /><circle cx="50" cy="82" r="1.6" /><circle cx="149" cy="157" r="1.5" /></g>`,
      ]),
    ),
  ]
}

function tomatoBody(scene: SceneView, parts: TomatoParts, palette: Palette, ticking: boolean): Art {
  const sway = scene.state === 'running' && parts.rot < 3
  return [
    svg`<ellipse cx="74" cy="178" rx="15" ry="6.5" fill=${palette.shade} /><ellipse cx="126" cy="178" rx="15" ry="6.5" fill=${palette.shade} />`,
    arms(scene, parts, palette),
    part('body', [
      svg`<path d=${BODY} fill=${palette.body} />`,
      svg`<path d="M38 98C43 84 52 76 64 72C56 83 49 94 46 108C44 114 35 110 38 98Z" fill=${palette.light} opacity=".75" />`,
    ]),
    blemishes(parts, palette),
    dialBand(parts, palette),
    crown(palette, parts.rot, sway),
    faceOf(parts, palette),
    pointer(parts, palette, ticking),
  ]
}

function sagged(rot: number, art: Art): Art {
  if (rot < 2) return art
  const wide = round(1 + (rot - 1) * 0.03)
  const tall = round(1 - (rot - 1) * 0.05)
  return svg`<g transform=${`translate(100 179) scale(${wide} ${tall}) translate(-100 -179)`}>${art}</g>`
}

function bubble(kind: 'play' | 'pause', stale: boolean): Art {
  const glyph = stale ? mix(C.fly, C.musty, 0.5) : kind === 'play' ? C.mintDark : C.skyDark
  const sign =
    kind === 'play'
      ? svg`<path d="M-7-11L12 0L-7 11Z" fill=${glyph} stroke=${glyph} stroke-width="4" stroke-linejoin="round" />`
      : svg`<rect x="-11" y="-12" width="8.5" height="24" rx="3" fill=${glyph} /><rect x="2.5" y="-12" width="8.5" height="24" rx="3" fill=${glyph} />`
  const paper = stale ? mix(C.cream, C.musty, 0.35) : C.cream
  const face = svg`<circle r="24" fill=${paper} />`
  return part(kind === 'play' ? 'start-bubble' : 'pause-bubble', [
    svg`<circle cx="140" cy="56" r="3.2" fill=${paper} />`,
    at(164, 36, kind === 'play' ? motion('pulse', [face, sign]) : [face, sign]),
  ])
}

function phone(drift: number): Art {
  const bars = Array.from(
    { length: Math.min(3, drift + 1) },
    (_, i) =>
      svg`<rect x="-10" y=${-16 + i * 11} width=${i === 1 ? 14 : 20} height="7" rx="3.5" fill=${C.cream} />`,
  )
  return part('phone', [
    at(
      156,
      48,
      [
        motion('rumble', [
          svg`<rect x="-16" y="-27" width="32" height="54" rx="7" fill=${C.metal} />`,
          svg`<rect x="-13" y="-22" width="26" height="42" rx="3" fill=${C.skyDark} />`,
          bars,
          svg`<rect x="-5" y="22" width="10" height="2.5" rx="1.25" fill=${C.metalDark} />`,
          svg`<circle cx="14" cy="-25" r=${7 + drift} fill=${C.pinkDark} />`,
        ]),
        Array.from({ length: Math.min(2, drift + 1) }, (_, i) => [
          motion('flicker', line(`M${22 + i * 5}-12q6 12 0 24`, C.metalMid), i + 1),
          motion('flicker', line(`M${-22 - i * 5}-12q-6 12 0 24`, C.metalMid), i + 2),
        ]),
      ],
      10,
      0.8 + drift * 0.07,
    ),
  ])
}

const FOCUS = [
  [50, 30, 1],
  [28, 58, 0.8],
  [20, 96, 0.62],
] as const

function focusSparks(drift: number): Art {
  return part(
    'focus',
    FOCUS.map(([x, y, size], i) =>
      i < MAX_DRIFT - drift
        ? sparkle(x, y, size, i + 1)
        : svg`<circle cx=${x} cy=${y} r="3.2" fill=${C.metalDark} opacity=".55" />`,
    ),
  )
}

function snooze(): Art {
  return part('snooze', [
    at(146, 46, motion('bob', line('M-6-6H6L-6 6H6', C.lilac, 3.6), 1), 0, 1),
    at(166, 28, motion('bob', line('M-8-8H8L-8 8H8', C.lilac, 4), 3), 0, 1),
  ])
}

function concentration(): Art {
  return part('sparks', [
    sparkle(36, 56, 0.9, 1),
    sparkle(166, 50, 1.05, 2),
    sparkle(144, 26, 0.65, 3),
    at(60, 46, motion('flicker', line('M0 0L-6-9', C.spark, 4), 1)),
    at(140, 48, motion('flicker', line('M0 0L6-9', C.spark, 4), 2)),
    at(80, 36, motion('flicker', line('M0 0L-2-10', C.spark, 4), 3)),
  ])
}

function surrender(): Art {
  return part(
    'white-flag',
    at(
      36,
      118,
      motion('wobble', [
        line('M0 0V-66', C.wicker, 4),
        svg`<path d="M0-66Q11-71 26-65V-44Q12-50 0-45Z" fill=${C.cream} />`,
      ]),
      -4,
    ),
  )
}

const FLY_SPOTS = [
  [26, 36],
  [158, 92],
  [170, 150],
] as const

const STENCH_SPOTS = [
  [180, 108],
  [80, 60],
  [20, 166],
] as const

function desk(scene: SceneView, parts: TomatoParts, palette: Palette): Art {
  const running = scene.state === 'running'
  const body = tomatoBody(scene, parts, palette, running)
  let posed: Art = sagged(parts.rot, body)
  if (running) posed = at(CX, CY, motion('rumble', at(-CX, -CY, posed)))
  if (scene.state === 'due') posed = motion('bob', posed)
  return [
    when(
      parts.rot === MAX_ROT,
      () => svg`<ellipse cx="100" cy="183" rx="72" ry="5" fill=${C.mustyDark} data-part="ooze" />`,
    ),
    shadow(100, 184, 66),
    when(parts.rot === MAX_ROT, surrender),
    posed,
    when(scene.state === 'resting' && parts.rot < 3, snooze),
    when(parts.bubble !== null, () => bubble(parts.bubble ?? 'play', parts.rot >= 3)),
    when(parts.phone, () => [phone(parts.drift), focusSparks(parts.drift)]),
    when(parts.sparks, concentration),
    stenchLines(STENCH_SPOTS.slice(0, parts.stench)),
    FLY_SPOTS.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function teaCup(): Art {
  return part(
    'tea',
    at(-8, 0, [
      svg`<rect x="146" y="152" width="34" height="7" rx="3.5" fill=${C.wicker} />`,
      svg`<path d="M151 159L147 182M175 159L179 182" stroke=${C.wickerDark} stroke-width="5" stroke-linecap="round" />`,
      svg`<path d="M176 136a7 6 0 0 1 0 12" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" />`,
      svg`<path d="M150 131H178V143Q178 152 169 152H159Q150 152 150 143Z" fill=${C.cream} />`,
      svg`<rect x="150" y="131" width="28" height="4" rx="2" fill=${C.terracottaDark} />`,
      line('M158 135v9', C.creamDark, 1.8),
      svg`<rect x="154.5" y="143" width="7" height="7" rx="1.5" fill=${C.sun} />`,
      at(158, 118, motion('waft', line('M0 6c-6-5 6-9 0-14', C.cream, 4), 1)),
      at(171, 116, motion('waft', line('M0 6c-6-5 6-9 0-14', C.cream, 4), 3)),
    ]),
  )
}

function hammock(scene: SceneView, parts: TomatoParts, palette: Palette): Art {
  const cloth = accentOf(scene, C.sun) === C.sun ? C.lilac : C.sun
  const clothDark = shadeOf(cloth, 0.22)
  return [
    shadow(100, 184, 62, 0.22),
    part('posts', [
      svg`<rect x="10" y="50" width="9" height="132" rx="4.5" fill=${C.wickerDark} /><rect x="181" y="50" width="9" height="132" rx="4.5" fill=${C.wickerDark} />`,
      line('M15 58L52 94M185 58L148 94', C.cream, 3.2),
    ]),
    part(
      'hammock',
      at(
        100,
        50,
        motion(
          'sway',
          at(-100, -50, [
            svg`<path d="M44 90Q100 118 156 90L152 112Q100 138 48 112Z" fill=${clothDark} />`,
            at(100, 86, at(-CX, -CY, tomatoBody(scene, parts, palette, false)), -7, 0.66),
            svg`<path d="M42 90Q100 186 158 90Q100 148 42 90Z" fill=${cloth} />`,
            line('M58 107Q100 146 142 107', clothDark, 3),
          ]),
        ),
      ),
    ),
    teaCup(),
    sparkle(38, 44, 0.9, 1),
    sparkle(160, 30, 0.75, 2),
    sparkle(36, 146, 0.7, 3),
  ]
}

export function tomato(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = tomatoParts(scene)
  const palette = paletteOf(scene, parts)
  const art =
    parts.view === 'hammock' ? hammock(scene, parts, palette) : desk(scene, parts, palette)
  return frame('tomato', scene, options, art)
}
