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

export type CuffPose = 'rolled' | 'puffed' | 'flat'
export type StripMode = 'off' | 'bars' | 'alarm' | 'wave' | 'reading' | 'calm'

export interface PressureParts {
  angle: number
  step: number
  cuff: CuffPose
  strip: StripMode
  lamp: string
  needle: string
  red: number
  sweat: number
  steam: number
  snack: number
  cracked: boolean
  bubble: boolean
  pulse: boolean
  log: boolean
  hearts: boolean
  asleep: boolean
  mood: Mood
}

export const MAX_STEP = 4

const REST_ANGLE = -106
const STEP_ANGLES = [-98, -76, -55, -36, -14] as const
const DUE_ANGLE = 14
const RUNNING_ANGLE = -8
const WAITING_ANGLE = -44
const CLEAN_ANGLE = -68
const RED_ANGLES = [47, 66, 86, 106] as const

const RED_AT = [0.1, 0.35, 0.6, 0.85] as const
const SWEAT_AT = [0.05, 0.3, 0.55] as const
const STEAM_AT = [0.4, 0.65, 0.85] as const
const SNACK_AT = [0.2, 0.5] as const
const CRACK_AT = 0.85
const SICK_AT = 0.65

const CALM = {
  step: 0,
  red: 0,
  sweat: 0,
  steam: 0,
  snack: 0,
  cracked: false,
  bubble: false,
  pulse: false,
  log: false,
  hearts: false,
  asleep: false,
  needle: '#ffffff',
} as const

function strained(base: number, red: number): number {
  return red > 0 ? (RED_ANGLES[red - 1] ?? base) : base
}

export function pressureParts(scene: SceneView): PressureParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...CALM,
      angle: CLEAN_ANGLE,
      cuff: 'rolled',
      strip: 'calm',
      lamp: C.mint,
      needle: C.mint,
      hearts: true,
      mood: 'happy',
    }
  }
  const red = reached(stink, RED_AT)
  const sweat = reached(stink, SWEAT_AT)
  const steam = reached(stink, STEAM_AT)
  const snack = reached(stink, SNACK_AT)
  const cracked = stink >= CRACK_AT
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...CALM,
      angle: RUNNING_ANGLE,
      cuff: 'puffed',
      strip: 'wave',
      lamp: C.mint,
      sweat: Math.min(1, sweat),
      pulse: true,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      angle: strained(WAITING_ANGLE, red),
      cuff: 'flat',
      strip: 'reading',
      lamp: red > 0 ? C.coral : C.sun,
      red,
      sweat,
      steam,
      snack: Math.min(1, snack),
      cracked,
      log: true,
      mood: sick ? 'sick' : red > 0 ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const step = due ? MAX_STEP : resting ? 0 : raw
  const base = resting ? REST_ANGLE : due ? DUE_ANGLE : (STEP_ANGLES[step] ?? DUE_ANGLE)
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = red > 0 ? 'worried' : 'pleading'
  if (sick) mood = 'sick'
  let lamp: string = resting ? C.metalDark : step >= 3 ? C.sun : C.mint
  if (due || red > 0) lamp = C.coral
  let screen: StripMode = resting ? 'off' : 'bars'
  if (due) screen = 'alarm'
  return {
    ...CALM,
    angle: strained(base, red),
    step,
    cuff: 'rolled',
    strip: screen,
    lamp,
    red,
    sweat,
    steam,
    snack,
    cracked,
    bubble: due,
    asleep: resting,
    mood,
  }
}

const CX = 131
const CY = 104
const ARC = 37
const ARC_WIDTH = 9.5
const ZONES = [
  [-118, -33, C.mint],
  [-28, 28, C.sun],
  [33, 118, C.coral],
] as const

const CASE = '#2a2f49'
const SALT = '#ffffff'
const CHIP = '#f4c15a'
const HEART = 'M0 10C-15-1-13-12-6-12C-3-12-1-10 0-7C1-10 3-12 6-12C13-12 15-1 0 10Z'

interface Tones {
  band: string
  dark: string
  deep: string
  light: string
  pale: string
}

function tonesOf(scene: SceneView): Tones {
  const band = accentOf(scene, C.sky)
  return {
    band,
    dark: shadeOf(band, 0.26),
    deep: shadeOf(band, 0.62),
    light: tintOf(band, 0.34),
    pale: tintOf(band, 0.68),
  }
}

function polar(radius: number, degrees: number): string {
  const a = (degrees * Math.PI) / 180
  return `${round(radius * Math.sin(a))} ${round(-radius * Math.cos(a))}`
}

function zone(from: number, to: number, color: string): Art {
  const d = `M${polar(ARC, from)}A${ARC} ${ARC} 0 0 1 ${polar(ARC, to)}`
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width=${ARC_WIDTH} stroke-linecap="round" />`
}

function ticks(): Art {
  const marks = [-118, -96, -74, -52, -30, -8, 14, 36, 58, 80, 102].map(
    (a) => `M${polar(ARC - ARC_WIDTH / 2 - 3, a + 8)}L${polar(ARC - ARC_WIDTH / 2 - 6.5, a + 8)}`,
  )
  return svg`<path d=${marks.join('')} stroke=${C.metalDark} stroke-width="1.8" stroke-linecap="round" opacity=".7" />`
}

function needle(parts: PressureParts): Art {
  const pointer = [
    svg`<path d="M-3.6 0L-1.3-27Q0-29.5 1.3-27L3.6 0Z" fill=${parts.needle} />`,
    svg`<circle r="7" fill=${C.metal} />`,
    svg`<circle r="2.8" fill=${C.metalDark} />`,
  ]
  const shake = parts.red >= 3 ? 'wobble' : parts.pulse ? 'slosh' : parts.red >= 1 ? 'sway' : ''
  return part('needle', at(0, 0, shake ? motion(shake, pointer) : pointer, parts.angle))
}

function crack(): Art {
  return part(
    'crack',
    svg`<path d="M26-34L17-24L24-19L13-9M17-24L8-27" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".8" />`,
  )
}

function dial(parts: PressureParts): Art {
  return part(
    'dial',
    at(CX, CY, [
      svg`<circle r="52" fill=${C.metalMid} />`,
      svg`<path d="M-41-26A49 49 0 0 1-17-46" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" />`,
      svg`<circle r="46.5" fill=${C.glass} />`,
      ZONES.map(([from, to, color]) => zone(from, to, color)),
      ticks(),
      face(0, 25, parts.mood, C.cream, 0.92),
      needle(parts),
      when(parts.cracked, crack),
    ]),
  )
}

function wavePath(unit: number, amp: number): readonly string[] {
  const h = round(unit / 2)
  const spike = (v: number): number => round(v * amp)
  return [
    `M${-h} 0H${h}`,
    `M${-h} 0Q0 ${spike(-13)} ${h} 0`,
    `M${-h} 0L${round(-h / 2)} ${spike(5)}L${round(h / 4)} ${spike(-30)}L${h} 0`,
    `M${-h} 0L${round(-h / 5)} ${spike(12)}L${h} 0`,
    `M${-h} 0Q0 ${spike(-8)} ${h} 0`,
  ]
}

const WAVE_DELAYS = [4, 3, 2, 1, 0] as const

function pulseWave(
  x: number,
  y: number,
  unit: number,
  amp: number,
  width: number,
  color: string,
): Art {
  return wavePath(unit, amp).map((d, i) =>
    at(
      x + i * unit,
      y,
      motion(
        'twinkle',
        svg`<path d=${d} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`,
        WAVE_DELAYS[i] ?? 0,
      ),
    ),
  )
}

function stripBars(step: number): Art {
  const colors = [C.mint, C.mint, C.sun, C.sun]
  return colors.map((color, i) => {
    const lit = i < step
    return svg`<rect x=${CX - 32 + i * 16.4} y="163.5" width="14" height="7" rx="2.5" fill=${lit ? color : C.metalDark} opacity=${lit ? 1 : 0.32} />`
  })
}

function strip(parts: PressureParts): Art {
  const line = (color: string, opacity: number): Art =>
    svg`<path d=${`M${CX - 30} 167H${CX + 30}`} stroke=${color} stroke-width="2.6" stroke-linecap="round" opacity=${opacity} />`
  const screens: Record<StripMode, () => Art> = {
    off: () => line(C.metalDark, 0.55),
    bars: () => stripBars(parts.step),
    alarm: () =>
      [0, 1, 2].map((i) =>
        motion(
          'flicker',
          svg`<rect x=${CX - 28 + i * 20} y="163.5" width="16" height="7" rx="2.5" fill=${C.coral} />`,
          (i % 2) + 1,
        ),
      ),
    wave: () => pulseWave(CX - 26, 170, 13, 0.3, 2.6, C.mint),
    reading: () => [
      svg`<rect x=${CX - 32} y="163.5" width="24" height="7" rx="2.5" fill=${C.cream} />`,
      svg`<rect x=${CX - 4} y="163.5" width="16" height="7" rx="2.5" fill=${C.cream} opacity=".6" />`,
      motion(
        'flicker',
        svg`<rect x=${CX + 16} y="162.5" width="4" height="9" rx="1.5" fill=${C.sun} />`,
      ),
    ],
    calm: () => [
      svg`<path d=${`M${CX - 30} 167q7.5-6 15 0t15 0t15 0t15 0`} fill="none" stroke=${C.mint} stroke-width="2.6" stroke-linecap="round" />`,
    ],
  }
  return part('strip', [
    svg`<rect x=${CX - 39} y="160" width="78" height="14" rx="5.5" fill=${C.glass} />`,
    screens[parts.strip](),
  ])
}

function monitorBody(parts: PressureParts): Art {
  const lamp = svg`<circle cx="87" cy="57" r="4" fill=${parts.lamp} />`
  return part('monitor', [
    svg`<rect x="92" y="176" width="20" height="9" rx="3" fill=${C.metalDark} /><rect x="150" y="176" width="20" height="9" rx="3" fill=${C.metalDark} />`,
    svg`<rect x="75" y="44" width="112" height="137" rx="18" fill=${C.metal} />`,
    svg`<path d="M169 44a18 18 0 0 1 18 18V163a18 18 0 0 1-18 18H172a9 9 0 0 0 7-9V54a10 10 0 0 0-10-10Z" fill=${C.metalMid} />`,
    parts.strip === 'alarm' || parts.pulse ? motion('flicker', lamp, 1) : lamp,
    svg`<rect x="168" y="53" width="10" height="7" rx="3" fill=${C.metalMid} />`,
    dial(parts),
    strip(parts),
  ])
}

function monitor(parts: PressureParts): Art {
  return parts.red >= 4 ? motion('rumble', monitorBody(parts)) : monitorBody(parts)
}

function tube(pose: CuffPose): Art {
  const d = pose === 'flat' ? 'M62 180C72 170 58 128 77 118' : 'M58 142C60 100 69 90 77 106'
  return part('tube', [
    svg`<path d=${d} fill="none" stroke=${C.metalDark} stroke-width="5" stroke-linecap="round" />`,
    when(
      pose !== 'flat',
      () => svg`<rect x="53" y="139" width="10" height="7" rx="2.5" fill=${C.metalMid} />`,
    ),
  ])
}

function cuffShape(rx: number, h: number, bulge: number, tones: Tones): Art {
  const side = (x: number, b: number): string =>
    `${x + b} ${round(-h * 0.5)} ${x + b} ${round(h * 0.5)}`
  const body = `M${-rx} ${-h}C${side(-rx, -bulge)} ${-rx} ${h}A${rx} 9 0 0 0 ${rx} ${h}C${side(rx, bulge)} ${rx} ${-h}Z`
  const wide = rx + bulge * 0.74
  const strap = `M${-wide} -10Q0 2 ${wide} -10V8Q0 20 ${-wide} 8Z`
  const edge = (y: number): string => `M${-rx + 5} ${y}Q0 ${y + 12} ${rx - 5} ${y}`
  return [
    svg`<path d=${body} fill=${tones.band} />`,
    svg`<ellipse cy=${-h} rx=${rx} ry="9" fill=${tones.light} />`,
    svg`<ellipse cy=${-h} rx=${rx - 6} ry="5.2" fill=${tones.deep} />`,
    svg`<path d=${edge(-h + 9)} fill="none" stroke=${tones.pale} stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 4" />`,
    svg`<path d=${strap} fill=${tones.dark} />`,
    svg`<path d=${edge(14)} fill="none" stroke=${tones.pale} stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 4" opacity=".7" />`,
    svg`<rect x="-3" y="-3.5" width="25" height="16" rx="4" fill=${tones.pale} />`,
    at(9.5, 5, svg`<path d=${HEART} fill=${C.coral} />`, 0, 0.5),
    svg`<rect x="-16" y="-8" width="8" height="23" rx="3.5" fill="none" stroke=${C.metal} stroke-width="3" />`,
  ]
}

function rolledCuff(tones: Tones): Art {
  return part('cuff', [shadow(40, 183, 32), at(40, 158, cuffShape(31, 17, 2, tones))])
}

function puffedCuff(tones: Tones): Art {
  const flares = [
    [9, 144, 'M3 0q-7 12 0 24'],
    [74, 144, 'M-3 0q7 12 0 24'],
  ] as const
  return part('cuff', [
    shadow(40, 184, 34),
    at(41, 157, motion('throb', cuffShape(26, 18, 10, tones))),
    flares.map(([x, y, d], i) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke=${tones.pale} stroke-width="3.6" stroke-linecap="round" />`,
          i + 1,
        ),
      ),
    ),
  ])
}

function flatCuff(tones: Tones): Art {
  return part('cuff', [
    shadow(58, 186, 52, 0.24),
    svg`<rect x="12" y="172" width="92" height="14" rx="7" fill=${tones.band} />`,
    svg`<path d="M19 182H97" stroke=${tones.dark} stroke-width="4" stroke-linecap="round" />`,
    svg`<rect x="78" y="174" width="20" height="6" rx="3" fill=${tones.pale} />`,
  ])
}

function bubbleArt(): Art {
  return part('plea', [
    svg`<circle cx="71" cy="88" r="3" fill=${C.cream} /><circle cx="62" cy="81" r="4.6" fill=${C.cream} />`,
    at(
      40,
      58,
      motion('pulse', [
        svg`<circle r="28" fill=${C.cream} />`,
        at(0, 1, svg`<path d=${HEART} fill=${C.coral} />`, 0, 1.28),
        svg`<path d="M-17 2H-8L-4-6L2 9L6 2H17" fill="none" stroke=${C.cream} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
      ]),
    ),
  ])
}

function running(tones: Tones): Art {
  return part('pulse', [
    at(38, 34, motion('throb', svg`<path d=${HEART} fill=${C.coral} />`), 0, 1.45),
    pulseWave(14, 84, 12, 0.72, 4.6, C.mint),
    [
      [62, 104, 2.6, 1],
      [68, 96, 2, 3],
      [74, 100, 2.4, 2],
    ].map(([x = 0, y = 0, r = 2, d = 1]) =>
      motion('flicker', svg`<circle cx=${x} cy=${y} r=${r} fill=${tones.pale} />`, d),
    ),
  ])
}

function pencil(): Art {
  return [
    svg`<path d="M0 0L5-13L14-8Z" fill=${C.wickerLight} />`,
    svg`<path d="M0 0L2.4-6.2L6.2-4Z" fill=${INK} />`,
    svg`<path d="M5-13L25-47L34-42L14-8Z" fill=${C.sun} />`,
    svg`<path d="M9.5-10.5L29.5-44.5" stroke=${C.sunDark} stroke-width="2.4" />`,
    svg`<path d="M25-47L28-52.5Q30-55 33-53.5L36-51.5Q38.6-49.8 37-47L34-42Z" fill=${C.pink} />`,
  ]
}

function logBook(tones: Tones): Art {
  const rows = [-26, -12, 2] as const
  const widths = [30, 24, 34] as const
  return part(
    'log',
    at(
      43,
      134,
      [
        svg`<rect x="-33" y="-44" width="64" height="86" rx="7" fill=${tones.dark} />`,
        svg`<rect x="-28" y="-40" width="58" height="78" rx="4" fill=${C.cream} />`,
        [-20, -6, 8, 22].map(
          (x) =>
            svg`<rect x=${x - 1.6} y="-50" width="3.2" height="15" rx="1.6" fill=${C.metalDark} />`,
        ),
        rows.map((y, i) => [
          at(-19, y, svg`<path d=${HEART} fill=${C.coral} />`, 0, 0.42),
          svg`<rect x="-11" y=${y - 2.8} width=${widths[i] ?? 30} height="5.6" rx="2.8" fill=${i === 2 ? tones.band : C.creamDark} />`,
        ]),
        at(-19, 18, svg`<path d=${HEART} fill=${C.coral} />`, 0, 0.42),
        svg`<rect x="-11" y="15.2" width="14" height="5.6" rx="2.8" fill=${tones.band} />`,
        at(6, 18, motion('wobble', pencil())),
      ],
      5,
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

function shaker(): Art {
  return part('salt', [
    shadow(83, 187, 14, 0.22),
    at(
      83,
      186,
      [
        svg`<path d="M-11-24H11L13-3Q13 0 10 0H-10Q-13 0-13-3Z" fill="#cfe3f5" />`,
        svg`<path d="M-11.8-13H11.8L13-3Q13 0 10 0H-10Q-13 0-13-3Z" fill=${SALT} />`,
        svg`<path d="M-12-24C-12-36 12-36 12-24Z" fill=${C.metalDark} />`,
        svg`<g fill=${CASE}><circle cx="-5" cy="-28" r="1.4" /><circle cx="0" cy="-30" r="1.4" /><circle cx="5" cy="-28" r="1.4" /></g>`,
        svg`<rect x="-8" y="-20" width="3.4" height="14" rx="1.7" fill="#fff" />`,
      ],
      -7,
      0.9,
    ),
    svg`<g fill=${SALT}><circle cx="108" cy="184" r="1.7" /><circle cx="116" cy="185.5" r="1.4" /><circle cx="124" cy="184.5" r="1.8" /><circle cx="132" cy="185.5" r="1.3" /></g>`,
  ])
}

function chip(x: number, y: number, rotate: number, size: number): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-9 4Q-6-9 0-9T9 4Q0 8-9 4Z" fill=${CHIP} />`,
      svg`<path d="M-4 1q1-4 3-5M3 2q0-3 1-5" fill="none" stroke=${C.sunDark} stroke-width="1.8" stroke-linecap="round" />`,
    ],
    rotate,
    size,
  )
}

function chipBag(): Art {
  return part('chips', [
    shadow(56, 187, 21, 0.26),
    at(
      56,
      186,
      [
        svg`<path d="M-19-46L-14-50L-9-46L-4-50L1-46L6-50L11-46L16-50L20-46L23-4Q23 0 19 0H-19Q-23 0-23-4Z" fill=${C.coral} />`,
        svg`<path d="M-20.4-38H20.6L21.4-31H-21Z" fill=${C.coralDark} />`,
        svg`<path d="M-22.4-11H22.4L23-4Q23 0 19 0H-19Q-23 0-23-4Z" fill=${C.coralDark} />`,
        svg`<circle cy="-20" r="11.5" fill=${C.cream} />`,
        chip(0, -20, -14, 0.92),
        svg`<rect x="-16.5" y="-29" width="3.2" height="16" rx="1.6" fill="#fff" opacity=".55" />`,
      ],
      -5,
      0.8,
    ),
    chip(27, 185, 18, 0.72),
    chip(17, 182, -24, 0.56),
  ])
}

function steamLines(count: number): Art {
  const spots = [
    [131, 46, 1],
    [100, 48, 2],
    [162, 48, 3],
  ] as const
  return spots
    .slice(0, count)
    .map(([x, y, delay], i) =>
      part(
        'steam',
        at(
          x,
          y,
          motion(
            'waft',
            svg`<path d="M0 0c-8-6 8-12 0-18c-8-6 8-12 0-18" fill="none" stroke=${C.cream} stroke-width="6" stroke-linecap="round" opacity=".85" />`,
            delay,
          ),
          0,
          0.8,
        ),
        i,
      ),
    )
}

function sweatDrops(count: number): Art {
  const spots = [
    [176, 74, 0.92, 1],
    [187, 106, 1, 3],
    [86, 74, 0.78, 2],
  ] as const
  return spots
    .slice(0, count)
    .map(([x, y, size, delay], i) =>
      part('sweat', at(x, y, motion('drip', drop(0, 0, C.water, size), delay)), i),
    )
}

function hearts(): Art {
  return part('hearts', [
    at(40, 74, motion('throb', svg`<path d=${HEART} fill=${C.coral} />`), 0, 2.15),
    at(68, 40, motion('bob', svg`<path d=${HEART} fill=${C.pink} />`, 2), 12, 0.78),
    at(18, 36, motion('bob', svg`<path d=${HEART} fill=${C.pink} />`, 4), -14, 0.56),
  ])
}

const SPARKLES = [
  [42, 26, 0.9, 1],
  [175, 28, 1.25, 2],
  [120, 26, 0.72, 3],
  [18, 110, 0.72, 4],
] as const

export function pressure(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = pressureParts(scene)
  const tones = tonesOf(scene)
  const cuffs: Record<CuffPose, () => Art> = {
    rolled: () => rolledCuff(tones),
    puffed: () => puffedCuff(tones),
    flat: () => flatCuff(tones),
  }
  const art: Art = [
    shadow(131, 185, 62),
    monitor(parts),
    steamLines(parts.steam),
    cuffs[parts.cuff](),
    tube(parts.cuff),
    when(parts.log, () => logBook(tones)),
    when(parts.pulse, () => running(tones)),
    when(parts.bubble, bubbleArt),
    when(parts.snack >= 2, chipBag),
    when(parts.snack >= 1, shaker),
    sweatDrops(parts.sweat),
    when(parts.hearts, () => [
      hearts(),
      SPARKLES.map(([x, y, size, delay]) => sparkle(x, y, size, delay)),
    ]),
    when(parts.asleep, () => [zed(44, 92, 0.7, 1), zed(58, 70, 0.95, 2), zed(38, 48, 0.62, 3)]),
  ]
  return frame('pressure', scene, options, art)
}
