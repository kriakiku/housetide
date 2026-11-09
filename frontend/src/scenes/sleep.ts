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

export type SleepView = 'bedside' | 'lights' | 'charging' | 'night'

export interface SleepParts {
  view: SleepView
  sun: boolean
  moon: number
  stars: number
  dusk: number
  glow: number
  blaze: number
  rings: number
  cups: number
  clock: boolean
  sweat: boolean
  bulbs: number
  dim: number
  leak: number
  mood: Mood
}

export const MAX_STEP = 4
export const MAX_CUPS = 5

const RINGS_AT = [0.1, 0.4, 0.7] as const
const CUPS_AT = [0.08, 0.25, 0.45, 0.65, 0.85] as const
const BLAZE_AT = [0.15, 0.5, 0.8] as const
const LEAK_AT = [0.15, 0.45, 0.75] as const
const DIM_AT = [0.34, 0.67] as const

const QUIET = {
  sun: false,
  moon: 0,
  stars: 0,
  dusk: 0,
  glow: 0,
  blaze: 0,
  rings: 0,
  cups: 0,
  clock: false,
  sweat: false,
  bulbs: 0,
  dim: 0,
  leak: 0,
} as const

function tired(rings: number, fallback: Mood): Mood {
  if (rings >= 3) return 'sleepy'
  return rings === 2 ? 'worried' : fallback
}

export function sleepParts(scene: SceneView): SleepParts {
  const { state } = scene
  if (state === 'clean') return { ...QUIET, view: 'night', moon: 6, stars: 19, mood: 'happy' }
  const stink = clamp01(scene.stink)
  const rings = reached(stink, RINGS_AT)
  const cupCount = reached(stink, CUPS_AT)
  if (state === 'running') {
    const dim = reached(clamp01(scene.progress), DIM_AT)
    return {
      ...QUIET,
      view: 'lights',
      moon: 5,
      stars: 6,
      rings,
      cups: cupCount,
      bulbs: 2 - dim,
      dim,
      mood: rings >= 2 ? 'sleepy' : 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      view: 'charging',
      moon: 5,
      stars: 6,
      dusk: 3,
      rings,
      cups: cupCount,
      leak: reached(stink, LEAK_AT),
      mood: tired(rings, 'calm'),
    }
  }
  if (state === 'resting') return { ...QUIET, view: 'bedside', sun: true, mood: 'sleepy' }
  const due = state === 'due'
  const step = due ? MAX_STEP : Math.min(MAX_STEP, Math.floor(clamp01(scene.fill) * (MAX_STEP + 1)))
  return {
    ...QUIET,
    view: 'bedside',
    moon: (due ? MAX_STEP + 1 : step) + 1,
    stars: due ? 6 : step,
    dusk: due ? MAX_STEP : step,
    glow: step,
    blaze: reached(stink, BLAZE_AT),
    rings,
    cups: cupCount,
    clock: due,
    sweat: due && rings < 3,
    mood: due ? tired(rings, 'pleading') : step >= 3 ? 'worried' : 'calm',
  }
}

const NIGHT_SKY = 'M50 168A86 86 0 1 1 150 168Z'
const NIGHT = '#141b45'
const WOOD = '#a56f4a'
const WOOD_DARK = '#7f5237'
const WOOD_LIGHT = '#c98e63'
const CASE = '#8c96b3'
const SCREEN_OFF = '#1a2144'
const SCREEN_ON = '#e9f6ff'
const LAMP_OFF = '#4b4f78'

const PILLOW = 'M-62-40C-34-49 34-49 62-40C56-16 56 16 62 40C34 49-34 49-62 40C-56 16-56-16-62-40Z'
const PILLOW_BELLY =
  'M-59 18C-30 38 30 38 59 18C58 26 60 34 62 40C34 49-34 49-62 40C-60 34-58 26-59 18Z'
const PINCHES = 'M-58-36l9 7M58-36l-9 7M-58 36l9-7M58 36l-9-7'
const BAGS = [
  'M-18 5A7.5 5.5 0 0 0-4 5A8 3 0 0 1-18 5Z',
  'M-19 4A8.5 7 0 0 0-3 4A9 3.5 0 0 1-19 4Z',
  'M-20 3A9.5 9 0 0 0-2 3A10 4.5 0 0 1-20 3Z',
] as const
const BAG_UNDER = 'M-17 15.5Q-11 19-5 15.5'
const MOON = 'M6-20A21 21 0 1 0 20 12A17 17 0 0 1 6-20Z'
const BOLT = 'M3-18L-11 3H-2L-4 18L11-4H2Z'
const ZED = 'M-8-8H8L-8 8H8'

const MOON_SPOTS = [
  [0, 0],
  [40, 114],
  [41, 98],
  [43, 82],
  [45, 66],
  [47, 52],
  [47, 44],
] as const

const STAR_SPOTS = [
  [88, 66],
  [20, 56],
  [122, 28],
  [78, 26],
  [108, 72],
  [150, 18],
  [66, 52],
  [176, 48],
  [24, 86],
  [136, 58],
  [100, 44],
  [160, 74],
  [58, 16],
  [182, 84],
  [150, 52],
  [116, 14],
  [172, 24],
  [34, 92],
  [12, 74],
] as const

interface Tones {
  body: string
  dark: string
  light: string
  ink: string
  bag: string
}

function tonesOf(scene: SceneView): Tones {
  const body = accentOf(scene, '#a9bcff')
  return {
    body,
    dark: shadeOf(body, 0.2),
    light: tintOf(body, 0.5),
    ink: isDarkColor(body) ? tintOf(body, 0.82) : mix(body, INK, 0.78),
    bag: mix(body, '#2b2150', 0.62),
  }
}

function bags(level: number, tones: Tones): Art {
  if (level === 0) return []
  const color = mix(tones.body, tones.bag, level === 1 ? 0.5 : level === 2 ? 0.8 : 1)
  const shape = BAGS[level - 1] ?? BAGS[0]
  const eye: Art = [
    svg`<path d=${shape} fill=${color} />`,
    when(
      level === 3,
      () =>
        svg`<path d=${BAG_UNDER} fill="none" stroke=${color} stroke-width="1.8" stroke-linecap="round" />`,
    ),
  ]
  return part('rings', [eye, at(22, 0, eye)])
}

function pillowBody(parts: SleepParts, tones: Tones): Art {
  return [
    svg`<path d=${PILLOW} fill=${tones.body} stroke=${tones.body} stroke-width="9" stroke-linejoin="round" data-part="pillow" />`,
    svg`<path d=${PILLOW_BELLY} fill=${tones.dark} stroke=${tones.dark} stroke-width="4" stroke-linejoin="round" />`,
    svg`<path d="M-42-35C-22-40 6-41 26-38" fill="none" stroke=${tones.light} stroke-width="6" stroke-linecap="round" />`,
    svg`<circle cx="40" cy="-35" r="3" fill=${tones.light} />`,
    svg`<path d=${PINCHES} fill="none" stroke=${tones.dark} stroke-width="3.4" stroke-linecap="round" />`,
    when(parts.mood === 'happy', () => [
      svg`<ellipse cx="-30" cy="13" rx="8" ry="5" fill=${C.pink} opacity=".7" />`,
      svg`<ellipse cx="30" cy="13" rx="8" ry="5" fill=${C.pink} opacity=".7" />`,
    ]),
    at(0, 2, bags(parts.rings, tones), 0, 1.4),
    face(0, 2, parts.mood, tones.ink, 1.4),
  ]
}

function sun(): Art {
  const beams = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    const point = (r: number): string => `${round(Math.cos(a) * r)} ${round(Math.sin(a) * r)}`
    return svg`<path d=${`M${point(29)}L${point(38)}`} stroke=${C.sun} stroke-width="6" stroke-linecap="round" />`
  })
  return part('sun', at(52, 56, [motion('throb', beams), svg`<circle r="23" fill=${C.sun} />`]))
}

function dayCloud(): Art {
  return part(
    'cloud',
    at(
      128,
      40,
      motion(
        'drift',
        svg`<g fill=${C.cream}><circle cx="-13" cy="3" r="10" /><circle cx="3" cy="-4" r="13" /><circle cx="17" cy="4" r="9" /><rect x="-23" y="2" width="49" height="11" rx="5.5" /></g>`,
      ),
    ),
  )
}

function moon(step: number, scale: number): Art {
  const [x, y] = MOON_SPOTS[step] ?? [47, 44]
  return when(step > 0, () =>
    part('moon', at(x, y, svg`<path d=${MOON} fill=${C.spark} />`, -8, scale)),
  )
}

function stars(count: number): Art {
  return STAR_SPOTS.slice(0, count).map(([x, y], i) =>
    part(
      'star',
      at(
        x,
        y,
        motion(
          'twinkle',
          svg`<circle r=${i % 3 === 0 ? 2.8 : 1.9} fill=${C.spark} />`,
          (i % 5) + 1,
        ),
      ),
      i,
    ),
  )
}

function dusk(level: number): Art {
  return when(
    level > 0,
    () =>
      svg`<path d=${NIGHT_SKY} fill=${NIGHT} opacity=${round(0.12 * level)} data-part="dusk" />`,
  )
}

function nightstand(): Art {
  return part('nightstand', [
    shadow(161, 184, 30),
    svg`<rect x="141" y="172" width="8" height="12" rx="2" fill=${WOOD_DARK} /><rect x="173" y="172" width="8" height="12" rx="2" fill=${WOOD_DARK} />`,
    svg`<rect x="136" y="130" width="50" height="46" rx="4" fill=${WOOD} />`,
    svg`<rect x="132" y="125" width="58" height="9" rx="4.5" fill=${WOOD_LIGHT} />`,
    svg`<rect x="143" y="140" width="36" height="27" rx="4" fill=${WOOD_DARK} />`,
    svg`<circle cx="161" cy="153" r="4" fill=${WOOD_LIGHT} />`,
  ])
}

function screenCards(glow: number, blaze: number): Art {
  const inks = [C.coral, C.sky, C.sun]
  const count = Math.min(3, Math.max(glow, blaze > 0 ? 3 : 0))
  return Array.from({ length: count }, (_, i) => {
    const y = -54 + i * 17
    const card = mix('#46609d', '#ffffff', (glow + blaze) / 7)
    const bar = mix('#7f9bd1', '#b8c8e4', (glow + blaze) / 7)
    return [
      svg`<rect x="-12.5" y=${y} width="25" height="14" rx="3.5" fill=${card} />`,
      svg`<circle cx="-6.5" cy=${y + 7} r="3.6" fill=${inks[i] ?? C.coral} />`,
      svg`<rect x="-1" y=${y + 3.4} width="10" height="2.8" rx="1.4" fill=${bar} /><rect x="-1" y=${y + 8} width="7" height="2.8" rx="1.4" fill=${bar} />`,
    ]
  })
}

function rays(blaze: number): Art {
  const spikes = Array.from({ length: 12 }, (_, i) => {
    const a = ((i + 0.5) * Math.PI) / 6
    const c = Math.cos(a)
    const s = Math.sin(a)
    const reach = (x: number, y: number): string => `${round(c * x)} ${round(s * y)}`
    const out = reach(23 + blaze * 2.4, 41 + blaze * 7)
    return svg`<path d=${`M${reach(22, 38)}L${out}`} stroke=${mix(C.sun, '#ffffff', 0.25)} stroke-width="5" stroke-linecap="round" />`
  })
  return part('rays', at(0, -31, motion('throb', spikes)))
}

function phone(glow: number, blaze: number): Art {
  const heat = clamp01(glow / MAX_STEP) * 0.62 + (blaze / 3) * 0.38
  const screen = mix(SCREEN_OFF, SCREEN_ON, heat)
  const body: Art = [
    svg`<rect x="-19" y="-62" width="38" height="62" rx="9" fill=${CASE} />`,
    svg`<rect x="-15.5" y="-58.5" width="31" height="55" rx="6" fill=${screen} />`,
    svg`<rect x="-5" y="-60.5" width="10" height="2" rx="1" fill=${C.metalDark} />`,
    screenCards(glow, blaze),
    when(blaze >= 2, () =>
      at(
        17,
        -60,
        motion('pulse', [
          svg`<circle r="9" fill=${C.coral} />`,
          svg`<rect x="-5" y="-1.6" width="10" height="3.2" rx="1.6" fill="#fff" />`,
        ]),
      ),
    ),
  ]
  return part('phone', blaze >= 3 ? motion('buzz', body) : body)
}

function phoneGlow(glow: number, blaze: number): Art {
  const halos = Math.min(3, glow) + blaze
  const light = blaze > 0 ? mix(C.sky, C.sun, blaze / 3) : C.sky
  return part('phone-glow', [
    Array.from(
      { length: halos },
      (_, i) =>
        svg`<ellipse cx="0" cy="-31" rx=${25 + i * 3} ry=${42 + i * 7} fill=${light} opacity=${round(0.1 + blaze * 0.015)} />`,
    ),
    when(blaze > 0, () => rays(blaze)),
  ])
}

function cupArt(color: string, band: string, top: boolean): Art {
  return [
    svg`<path d="M12-15a6 6 0 0 1 0 11" fill="none" stroke=${band} stroke-width="3.6" stroke-linecap="round" />`,
    svg`<path d="M-12-18H12V-6Q12 0 6 0H-6Q-12 0-12-6Z" fill=${color} />`,
    svg`<rect x="-12" y="-13" width="24" height="4.5" fill=${band} />`,
    svg`<rect x="-14" y="-21" width="28" height="5" rx="2.5" fill=${top ? '#6b4128' : tintOf(color, 0.4)} />`,
  ]
}

const CUP_TONES = [
  [C.cream, C.coral],
  [C.coral, C.cream],
  [C.sun, C.sunDark],
  [C.mint, C.mintDark],
  [C.pink, C.cream],
] as const
const CUP_SWAY = [0, 3, -2, 4, -1] as const
const CUP_TILT = [-2, 3, -4, 5, -3] as const

function cups(count: number): Art {
  return when(count > 0, () =>
    part('coffee', [
      shadow(28, 184, 20, 0.3),
      Array.from({ length: count }, (_, i) => {
        const [color, band] = CUP_TONES[i] ?? [C.cream, C.coral]
        return part(
          'cup',
          at(
            28 + (CUP_SWAY[i] ?? 0),
            183 - i * 21,
            cupArt(color, band, i === count - 1),
            CUP_TILT[i] ?? 0,
          ),
          i,
        )
      }),
      at(
        28,
        183 - count * 21 - 2,
        motion(
          'waft',
          svg`<path d="M0 0c-5-4 5-8 0-12" fill="none" stroke=${C.cream} stroke-width="3.4" stroke-linecap="round" opacity=".8" />`,
          2,
        ),
      ),
    ]),
  )
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return part(
    'zed',
    at(
      x,
      y,
      motion(
        'drift',
        at(
          0,
          0,
          svg`<path d=${ZED} fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
          0,
          size,
        ),
        delay,
      ),
    ),
  )
}

function alarmClock(): Art {
  return part(
    'clock',
    at(
      124,
      44,
      motion('wobble', [
        svg`<path d="M-13 18l-5 7M13 18l5 7" stroke=${C.coralDark} stroke-width="4.5" stroke-linecap="round" />`,
        svg`<g transform="rotate(-36)"><path d="M-10-23a10 10 0 0 1 20 0Z" fill=${C.sun} /></g>`,
        svg`<g transform="rotate(36)"><path d="M-10-23a10 10 0 0 1 20 0Z" fill=${C.sun} /></g>`,
        svg`<circle r="22" fill=${C.coral} />`,
        svg`<circle r="16.5" fill=${C.cream} />`,
        svg`<path d="M0-13.5v3M0 13.5v-3M-13.5 0h3M13.5 0h-3" stroke=${C.creamDark} stroke-width="2.6" stroke-linecap="round" />`,
        svg`<path d="M0 0V-11M0 0L-7 4" fill="none" stroke=${INK} stroke-width="3.2" stroke-linecap="round" />`,
        svg`<circle r="2.6" fill=${C.coralDark} />`,
      ]),
    ),
  )
}

function pointingArm(tones: Tones): Art {
  return part('arm', [
    svg`<path d="M102 108Q106 88 120 79" fill="none" stroke=${tones.body} stroke-width="11" stroke-linecap="round" />`,
    svg`<circle cx="124" cy="75" r="9.5" fill=${tones.body} />`,
  ])
}

function bedside(parts: SleepParts, tones: Tones): Art {
  const big = parts.glow >= MAX_STEP
  return [
    dusk(parts.dusk),
    when(parts.sun, sun),
    when(parts.sun, dayCloud),
    stars(parts.stars),
    moon(parts.moon, big ? 1.3 : 1.2),
    at(161, 125, phoneGlow(parts.glow, parts.blaze), 3),
    nightstand(),
    at(161, 125, phone(parts.glow, parts.blaze), 3),
    when(parts.clock, () => pointingArm(tones)),
    shadow(78, 184, 62),
    at(78, 137, pillowBody(parts, tones), 0, 0.95),
    when(parts.sweat, () => at(114, 118, motion('drip', drop(0, 0, C.water, 0.85), 1))),
    when(parts.clock, alarmClock),
    cups(parts.cups),
  ]
}

function bulbs(lit: number): Art {
  const spots = [0.13, 0.32, 0.5, 0.68, 0.87].map((t) => [14 + 172 * t, 18 + 68 * t * (1 - t)])
  return part('bulbs', [
    svg`<path d="M14 18Q100 52 186 18" fill="none" stroke=${C.metalDark} stroke-width="2.6" stroke-linecap="round" />`,
    spots.map(([x = 0, y = 0], i) => {
      const on = i >= 5 - lit
      const bulb = svg`<path d="M0 3C5 6 6 11 6 13A6 6 0 0 1-6 13C-6 11-5 6 0 3Z" fill=${on ? C.sun : LAMP_OFF} />`
      return at(x, y, [
        svg`<rect x="-3" y="-2" width="6" height="6" rx="1.5" fill=${C.metalDark} />`,
        on && i === 5 - lit ? motion('flicker', bulb) : bulb,
      ])
    }),
  ])
}

function lamp(dim: number): Art {
  const shade = mix(C.sun, LAMP_OFF, 0.72 + dim * 0.14)
  const edge = mix(C.sunDark, LAMP_OFF, 0.72 + dim * 0.14)
  return part('lamp', [
    svg`<rect x="158.5" y="90" width="5" height="33" fill=${C.metalDark} />`,
    svg`<rect x="146" y="120" width="30" height="6" rx="3" fill=${C.metalMid} />`,
    svg`<path d="M148 58H174L188 91Q189 94 186 94H136Q133 94 134 91Z" fill=${shade} />`,
    svg`<rect x="134" y="89" width="54" height="5" rx="2.5" fill=${edge} />`,
  ])
}

function pullCord(tones: Tones): Art {
  const clicks = ['M8-7l6-5', 'M-8-7l-6-5', 'M-10 2h-7'] as const
  return part('cord', [
    svg`<path d="M143 94V113" stroke=${C.metalMid} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<path d="M118 120Q130 114 141 118" fill="none" stroke=${tones.body} stroke-width="11" stroke-linecap="round" />`,
    svg`<circle cx="143" cy="118" r="7.5" fill=${tones.body} />`,
    svg`<circle cx="143" cy="112" r="4.2" fill=${C.sun} />`,
    at(
      143,
      112,
      clicks.map((d, i) =>
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke=${C.spark} stroke-width="3" stroke-linecap="round" />`,
          i + 1,
        ),
      ),
    ),
  ])
}

function lights(parts: SleepParts, tones: Tones): Art {
  return [
    svg`<path d=${NIGHT_SKY} fill=${NIGHT} opacity=${round(0.45 + parts.dim * 0.14)} data-part="dimmed" />`,
    stars(parts.stars),
    moon(parts.moon, 1.05),
    bulbs(parts.bulbs),
    nightstand(),
    lamp(parts.dim),
    shadow(72, 184, 58),
    part('pillow-body', at(72, 140, motion('bob', pillowBody(parts, tones)), 0, 0.9)),
    pullCord(tones),
    zed(96, 88, 0.72, 1),
    zed(112, 68, 1, 2),
    zed(90, 56, 0.66, 3),
    cups(parts.cups),
  ]
}

function leakArt(level: number): Art {
  return when(level > 0, () => {
    const spots = [
      [161, 56, 'M-7 3q7-7 14 0'],
      [161, 48, 'M-11 3q11-11 22 0'],
      [161, 40, 'M-15 3q15-15 30 0'],
    ] as const
    return part('leak', [
      svg`<rect x="136" y="121" width="50" height="3.4" rx="1.7" fill=${C.sky} opacity=${round(0.3 + level * 0.2)} />`,
      spots
        .slice(0, level)
        .map(([x, y, d], i) =>
          at(
            x,
            y,
            motion(
              'flicker',
              svg`<path d=${d} fill="none" stroke=${C.sky} stroke-width="3.6" stroke-linecap="round" />`,
              i + 1,
            ),
          ),
        ),
    ])
  })
}

function charger(leak: number): Art {
  const bolt = mix(C.sun, C.coral, leak / 3)
  const body: Art = [
    svg`<rect x="-18" y="-58" width="36" height="58" rx="8.5" fill=${CASE} />`,
    svg`<rect x="-14.5" y="-54.5" width="29" height="51" rx="5.5" fill=${SCREEN_OFF} />`,
    part('charge', [
      svg`<rect x="-4" y="-46" width="8" height="4" rx="1.5" fill=${C.mint} />`,
      svg`<rect x="-9.5" y="-43" width="19" height="32" rx="4.5" fill="none" stroke=${C.mint} stroke-width="3" />`,
      svg`<rect x="-6" y="-26" width="12" height="11.5" rx="2" fill=${C.mint} />`,
      at(0, -27, motion('pulse', svg`<path d=${BOLT} fill=${bolt} />`), 0, 0.62),
    ]),
  ]
  return part('charger', [
    svg`<path d="M174 122H183C190 122 188.5 138 188.5 150V182" fill="none" stroke=${C.metalMid} stroke-width="3" stroke-linecap="round" />`,
    at(161, 121, leak >= 2 ? motion('buzz', body) : body),
    svg`<rect x="143" y="117" width="36" height="9" rx="3.5" fill=${C.mint} />`,
    svg`<rect x="153" y="120" width="16" height="3" rx="1.5" fill="#eafff6" />`,
  ])
}

function waitingDots(tones: Tones): Art {
  return part(
    'waiting-dots',
    [0, 1, 2].map((i) =>
      at(60 + i * 18, 78, motion('pulse', svg`<circle r="4.6" fill=${tones.light} />`, i + 1)),
    ),
  )
}

function charging(parts: SleepParts, tones: Tones): Art {
  return [
    dusk(parts.dusk),
    stars(parts.stars),
    moon(parts.moon, 1.15),
    nightstand(),
    charger(parts.leak),
    leakArt(parts.leak),
    shadow(78, 184, 62),
    at(78, 137, pillowBody(parts, tones), 0, 0.95),
    waitingDots(tones),
    cups(parts.cups),
  ]
}

function nightcap(): Art {
  return part('nightcap', [
    svg`<path d="M-40-46C-38-78-16-96 8-92C26-90 42-78 46-58C38-66 30-70 24-68C26-60 26-52 24-44Z" fill=${C.coral} />`,
    svg`<path d="M-37-62C-20-56 8-56 25-62M-26-81C-12-75 14-75 33-80" fill="none" stroke=${C.cream} stroke-width="5.5" stroke-linecap="round" />`,
    svg`<rect x="-47" y="-52" width="80" height="13" rx="6.5" fill=${C.cream} />`,
    svg`<circle cx="47" cy="-55" r="10" fill=${C.cream} />`,
  ])
}

function night(parts: SleepParts, tones: Tones): Art {
  return [
    svg`<path d=${NIGHT_SKY} fill=${NIGHT} data-part="night" />`,
    stars(parts.stars),
    at(36, 46, svg`<path d=${MOON} fill=${C.spark} />`, -8, 1.25),
    sparkle(136, 32, 1.1, 1),
    sparkle(100, 24, 0.7, 2),
    sparkle(179, 104, 0.85, 3),
    sparkle(21, 108, 0.85, 4),
    sparkle(78, 20, 0.55, 5),
    shadow(92, 184, 70),
    part('pillow-body', at(92, 136, motion('bob', [pillowBody(parts, tones), nightcap()]))),
    zed(158, 78, 0.7, 1),
    zed(170, 57, 1, 2),
    zed(183, 37, 0.62, 3),
  ]
}

export function sleep(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = sleepParts(scene)
  const tones = tonesOf(scene)
  const views: Record<SleepView, (p: SleepParts, t: Tones) => Art> = {
    bedside,
    lights,
    charging,
    night,
  }
  const art = views[parts.view](parts, tones)
  return frame('sleep', scene, options, art)
}
