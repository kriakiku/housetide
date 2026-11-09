import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  COLORS as C,
  clamp01,
  face,
  frame,
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

export type CookingView = 'stove' | 'plated'

export interface CookingParts {
  view: CookingView
  step: number
  lid: boolean
  flame: number
  soup: boolean
  hat: boolean
  crave: boolean
  timer: boolean
  asleep: boolean
  wisps: number
  clouds: number
  pan: boolean
  panFire: boolean
  alarm: boolean
  flag: boolean
  scorch: number
  mood: Mood
}

export const MAX_STEP = 6

const WISP_AT = [0.08, 0.3] as const
const CLOUD_AT = [0.3, 0.55, 0.8] as const
const SCORCH_AT = [0.08, 0.3, 0.55, 0.8] as const
const PAN_AT = 0.3
const ALARM_AT = 0.55
const SICK_AT = 0.55
const PANIC_AT = 0.8

const CALM = {
  step: 0,
  lid: true,
  flame: 0,
  soup: false,
  hat: false,
  crave: false,
  timer: false,
  asleep: false,
  wisps: 0,
  clouds: 0,
  pan: false,
  panFire: false,
  alarm: false,
  flag: false,
  scorch: 0,
} as const

export function cookingParts(scene: SceneView): CookingParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...CALM, view: 'plated', lid: false, hat: true, mood: 'happy' }
  }
  const wisps = reached(stink, WISP_AT)
  const scorch = reached(stink, SCORCH_AT) / SCORCH_AT.length
  if (state === 'running') {
    return {
      ...CALM,
      view: 'stove',
      lid: false,
      flame: 2,
      soup: true,
      wisps: Math.min(1, wisps),
      scorch: Math.min(0.25, scorch),
      mood: 'happy',
    }
  }
  const panic = stink >= PANIC_AT
  const burnt = {
    wisps,
    scorch,
    clouds: reached(stink, CLOUD_AT),
    pan: stink >= PAN_AT,
    panFire: panic,
    alarm: stink >= ALARM_AT,
    flag: panic,
  }
  const sick = stink >= SICK_AT
  if (state === 'waiting') {
    return {
      ...CALM,
      ...burnt,
      view: 'stove',
      flame: 1,
      timer: true,
      mood: sick ? 'sick' : 'calm',
    }
  }
  if (state === 'due') {
    return {
      ...CALM,
      ...burnt,
      view: 'stove',
      lid: false,
      hat: true,
      crave: !burnt.alarm,
      mood: sick ? 'sick' : 'pleading',
    }
  }
  const resting = state === 'resting'
  const step = resting ? 0 : Math.max(1, Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1))))
  let mood: Mood = resting ? 'sleepy' : step >= 4 ? 'worried' : 'calm'
  if (sick) mood = 'sick'
  return { ...CALM, ...burnt, view: 'stove', step, asleep: resting, mood }
}

const CHAR = '#25232b'
const CHAR_LIGHT = '#46434f'
const SMOKE = '#6d6c7a'
const EMBER = '#ff8a3c'
const PAPER = '#fbf7ec'
const SAUCE = '#d9412f'
const NOODLE = '#f7d683'
const TOMATO = '#ef5a47'
const CARROT = '#ff9a3d'
const ONION = '#e9c48f'
const MUSHROOM = '#c9a382'

const COUNTER = 128

function cabinet(x: number): Art {
  return [
    svg`<rect x=${x} y="136" width="40" height="46" rx="3" fill=${C.wicker} />`,
    svg`<rect x=${x + 6} y="144" width="28" height="31" rx="4" fill=${C.wickerDark} opacity=".5" />`,
    svg`<circle cx=${x + 20} cy="152" r="3" fill=${C.wickerLight} />`,
  ]
}

function kitchen(): Art {
  return part('kitchen', [
    cabinet(14),
    cabinet(146),
    svg`<rect x="10" y="128" width="50" height="10" rx="5" fill=${C.wickerLight} />`,
    svg`<rect x="140" y="128" width="50" height="10" rx="5" fill=${C.wickerLight} />`,
  ])
}

function towel(accent: string): Art {
  return part('towel', [
    svg`<path d="M112 150H130V172Q130 175 127 175H115Q112 175 112 172Z" fill=${C.cream} />`,
    svg`<path d="M112 162H130M112 167H130" stroke=${accent} stroke-width="2.6" />`,
  ])
}

function knob(x: number, on: boolean): Art {
  return svg`<circle cx=${x} cy="140" r="4.6" fill=${on ? C.coral : C.metalDark} />`
}

function stove(parts: CookingParts, accent: string): Art {
  const glow = parts.flame > 0
  return part('stove', [
    svg`<rect x="62" y="178" width="14" height="7" rx="2.5" fill=${C.metalDark} /><rect x="124" y="178" width="14" height="7" rx="2.5" fill=${C.metalDark} />`,
    svg`<rect x="54" y="128" width="92" height="52" rx="6" fill=${C.metal} />`,
    svg`<rect x="50" y="124" width="100" height="9" rx="4.5" fill=${C.metalMid} />`,
    knob(82, glow),
    knob(100, false),
    knob(118, false),
    svg`<rect x="66" y="154" width="68" height="21" rx="5" fill=${glow ? mix(C.glass, EMBER, 0.62) : C.glass} />`,
    svg`<path d="M73 170l9-11M84 170l5-6" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".28" />`,
    svg`<rect x="64" y="147" width="72" height="5.5" rx="2.75" fill=${C.metalDark} />`,
    towel(accent),
    svg`<rect x="70" y="118" width="60" height="7" rx="3" fill=${C.fly} />`,
  ])
}

const FLAME = 'M0-18C5-10 9-7 9-2A9 9 0 0 1-9-2C-9-7-5-10 0-18Z'
const FLAME_CORE = 'M0-9C3-5 4.5-4 4.5-1A4.5 4.5 0 0 1-4.5-1C-4.5-4-3-5 0-9Z'

function flame(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'flicker',
      svg`<path d=${FLAME} fill=${EMBER} /><path d=${FLAME_CORE} fill=${C.sun} />`,
      delay,
    ),
    0,
    size,
  )
}

function flames(level: number): Art {
  const spots = level >= 2 ? [68, 84, 100, 116, 132] : [84, 100, 116]
  const size = level >= 2 ? 0.74 : 0.56
  return part(
    'flames',
    spots.map((x, i) => flame(x, 120, i % 2 ? size * 1.15 : size, (i % 3) + 1)),
  )
}

function potBody(parts: CookingParts, accent: string): Art {
  const ink = parts.mood === 'sick' ? C.cream : shadeOf(accent, 0.8)
  const body = mix(accent, CHAR, parts.scorch * 0.5)
  const dark = shadeOf(body, 0.3)
  const light = tintOf(body, 0.34)
  return part('pot', [
    svg`<rect x="40" y="72" width="26" height="13" rx="6.5" fill=${dark} />`,
    svg`<rect x="134" y="72" width="26" height="13" rx="6.5" fill=${dark} />`,
    svg`<path d="M58 62H142V102Q142 118 126 118H74Q58 118 58 102Z" fill=${body} />`,
    svg`<path d="M58 100V102Q58 118 74 118H126Q142 118 142 102V100Q100 110 58 100Z" fill=${dark} />`,
    when(parts.scorch > 0, () =>
      part(
        'scorch',
        svg`<path d="M58 103Q64 110 72 105Q80 101 88 107Q96 112 104 105Q112 100 120 107Q128 112 134 105Q138 102 142 103Q142 118 126 118H74Q58 118 58 103Z" fill=${CHAR} opacity=${round(0.3 + parts.scorch * 0.6)} />`,
      ),
    ),
    svg`<rect x="52" y="56" width="96" height="13" rx="6.5" fill=${light} />`,
    svg`<rect x="66" y="76" width="6" height="20" rx="3" fill=${light} opacity=".75" />`,
    face(100, 88, parts.mood, ink, 1.25),
  ])
}

function lid(accent: string): Art {
  return part('lid', [
    svg`<rect x="93" y="16" width="14" height="16" rx="5" fill=${shadeOf(accent, 0.3)} />`,
    svg`<rect x="86" y="14" width="28" height="10" rx="5" fill=${shadeOf(accent, 0.3)} />`,
    svg`<path d="M56 58C56 40 76 28 100 28C124 28 144 40 144 58Z" fill=${tintOf(accent, 0.16)} />`,
    svg`<path d="M68 49C72 42 80 37 90 35" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".55" />`,
  ])
}

function restingLid(accent: string): Art {
  return part('spare-lid', at(34, COUNTER, at(-100, -58, lid(accent)), 0, 0.46))
}

function potMouth(accent: string): Art {
  return svg`<ellipse cx="100" cy="58" rx="44" ry="10" fill=${shadeOf(accent, 0.62)} />`
}

function soupArt(): Art {
  const foam = [
    [68, 56, 7],
    [84, 52, 9],
    [116, 52, 8],
    [132, 56, 7],
  ] as const
  return part('soup', [
    motion('bob', [
      svg`<ellipse cx="100" cy="56" rx="42" ry="9" fill=${C.sun} />`,
      foam.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${PAPER} />`),
      svg`<circle cx="100" cy="51" r="5" fill=${C.sunDark} />`,
    ]),
  ])
}

function spoon(): Art {
  return part(
    'spoon',
    at(
      122,
      62,
      motion(
        'wobble',
        at(
          0,
          0,
          [
            svg`<path d="M0 6V-30" stroke=${C.wickerDark} stroke-width="7" stroke-linecap="round" />`,
            svg`<ellipse cy="-38" rx="7.5" ry="10.5" fill=${C.wickerDark} />`,
            svg`<ellipse cx="-1.4" cy="-39" rx="3.4" ry="6" fill=${C.wickerLight} />`,
          ],
          14,
        ),
      ),
    ),
  )
}

function bubbleUp(x: number, y: number, r: number, delay: number): Art {
  return part(
    'bubble',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<circle r=${r} fill=${PAPER} opacity=".3" /><circle r=${r} fill="none" stroke=${PAPER} stroke-width="2.4" /><circle cx=${-r * 0.35} cy=${-r * 0.35} r=${r * 0.24} fill="#fff" />`,
        delay,
      ),
    ),
  )
}

function steam(spots: ReadonlyArray<readonly [number, number]>, color: string): Art {
  return part(
    'steam',
    spots.map(([x, y], i) =>
      at(
        x,
        y,
        motion(
          'waft',
          svg`<path d="M0 0c-7-6 7-11 0-17c-7-6 7-11 0-17" fill="none" stroke=${color} stroke-width="5" stroke-linecap="round" />`,
          (i % 4) + 1,
        ),
      ),
    ),
  )
}

function hopping(): Art {
  return part('hopping', [
    at(
      84,
      30,
      motion('bob', svg`<circle r="7" fill=${CARROT} /><circle r="3.4" fill=${C.sun} />`, 1),
    ),
    at(
      38,
      56,
      motion(
        'bob',
        svg`<circle r="5.5" fill=${C.leaf} /><circle cx="-1.6" cy="-1.6" r="1.5" fill="#fff" opacity=".7" />`,
        3,
      ),
    ),
    at(
      166,
      50,
      motion(
        'bob',
        svg`<circle r="7" fill=${TOMATO} /><path d="M-3.4-5.4l3.4 2.2 3.4-2.2" fill="none" stroke=${C.leafDark} stroke-width="2.2" stroke-linecap="round" />`,
        2,
      ),
    ),
  ])
}

function tomato(): Art {
  return [
    svg`<ellipse cx="0" cy="-13" rx="15" ry="13.5" fill=${TOMATO} />`,
    svg`<path d="M-8-19q-2 4-1 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55" />`,
    svg`<path d="M0-26L-7-23L-3-22L-5-18L0-21L5-18L3-22L7-23Z" fill=${C.leafDark} stroke=${C.leafDark} stroke-width="1.5" stroke-linejoin="round" />`,
  ]
}

function carrot(): Art {
  return [
    svg`<path d="M-10-14C-16-20-20-16-20-12C-25-12-25-5-19-6C-18-1-12-3-10-7Z" fill=${C.leaf} />`,
    svg`<path d="M-11-16C-4-18 8-14 21-7C22-6 22-5 20-5C8-1-4 1-11-2C-14-6-14-12-11-16Z" fill=${CARROT} />`,
    svg`<path d="M-3-14l1 6M6-11l1 4" stroke=${C.sunDark} stroke-width="2.2" stroke-linecap="round" />`,
  ]
}

function mushroom(): Art {
  return [
    svg`<path d="M-4-12H4L6-2Q6 0 4 0H-4Q-6 0-6-2Z" fill=${PAPER} />`,
    svg`<path d="M-12-11C-12-22-5-25 0-25C5-25 12-22 12-11Q12-9 10-9H-10Q-12-9-12-11Z" fill=${MUSHROOM} />`,
    svg`<circle cx="-4" cy="-18" r="2" fill=${PAPER} /><circle cx="4" cy="-20" r="1.6" fill=${PAPER} />`,
  ]
}

function broccoli(): Art {
  return [
    svg`<path d="M-5-14H5L7-2Q7 0 5 0H-5Q-7 0-7-2Z" fill=${C.leaf} />`,
    svg`<g fill=${C.leafDark}><circle cx="-10" cy="-18" r="8.5" /><circle cx="10" cy="-18" r="8.5" /><circle cx="0" cy="-25" r="9.5" /></g>`,
    svg`<circle cx="-3" cy="-27" r="2.4" fill=${C.leaf} /><circle cx="8" cy="-21" r="2" fill=${C.leaf} /><circle cx="-11" cy="-19" r="2" fill=${C.leaf} />`,
  ]
}

function onion(): Art {
  return [
    svg`<path d="M0-30C2-25 5-23 9-20C16-16 15-3 7 0H-7C-15-3-16-16-9-20C-5-23-2-25 0-30Z" fill=${ONION} />`,
    svg`<path d="M-3-20C-7-14-7-7-4-2M4-20C7-14 7-7 4-2" fill="none" stroke=${C.wickerDark} stroke-width="2" stroke-linecap="round" opacity=".7" />`,
  ]
}

function cheese(): Art {
  return [
    svg`<path d="M-13 0V-13L11-23Q13-20 13-13V0Z" fill=${C.sun} />`,
    svg`<path d="M-13-13H13V0H-13Z" fill=${C.sunDark} opacity=".55" />`,
    svg`<circle cx="-5" cy="-6" r="2.6" fill=${C.sun} /><circle cx="5" cy="-5" r="2" fill=${C.sun} />`,
  ]
}

type Ingredient = readonly [number, number, () => Art]

const INGREDIENTS: readonly Ingredient[] = [
  [28, COUNTER, tomato],
  [168, COUNTER, carrot],
  [50, COUNTER, mushroom],
  [155, COUNTER - 14, broccoli],
  [27, COUNTER - 24, onion],
  [176, COUNTER - 14, cheese],
]

function ingredients(step: number): Art {
  return part(
    'ingredients',
    INGREDIENTS.slice(0, step)
      .map(([x, y, art], i) => {
        const latest = i === step - 1
        return part('ingredient', at(x, y, latest ? motion('sway', art()) : art()), i)
      })
      .toReversed(),
  )
}

function chefHat(tone: string, fold: string): Art {
  return [
    svg`<g fill=${tone}><circle cx="-15" cy="-30" r="12.5" /><circle cx="15" cy="-30" r="12.5" /><circle cx="0" cy="-37" r="15" /><rect x="-19" y="-32" width="38" height="24" /></g>`,
    svg`<path d="M-8-13V-26M8-13V-26M0-13V-30" stroke=${fold} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<rect x="-20" y="-13" width="40" height="13" rx="3.5" fill=${mix(tone, fold, 0.5)} />`,
  ]
}

function waitingHat(scorch: number): Art {
  const tone = mix(PAPER, CHAR, scorch * 0.55)
  const fold = mix(C.creamDark, CHAR, scorch * 0.55)
  return part('hat', at(166, COUNTER, motion('sway', at(0, 0, chefHat(tone, fold), 0, 0.86))))
}

function fork(): Art {
  return svg`<path d="M0-16V-5M-5-16V-8Q-5-4 0-4Q5-4 5-8V-16M0-4V16" fill="none" stroke=${C.metalDark} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`
}

function knife(): Art {
  return svg`<path d="M-3-17C4-14 5-5 4 2H-3Z" fill=${C.metalDark} stroke=${C.metalDark} stroke-width="1.6" stroke-linejoin="round" /><path d="M-1 2V16" stroke=${C.metalDark} stroke-width="4.4" stroke-linecap="round" />`
}

function craving(): Art {
  return part('crave', [
    svg`<circle cx="122" cy="48" r="3.5" fill=${C.cream} /><circle cx="132" cy="42" r="5.5" fill=${C.cream} />`,
    at(
      164,
      38,
      motion('pulse', [
        svg`<circle r="23.5" fill=${C.cream} />`,
        at(-8, 0, fork()),
        at(9, 0, knife()),
      ]),
    ),
  ])
}

function timer(): Art {
  const ticks = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    return svg`<path d=${`M${round(Math.sin(a) * 11.5)} ${round(-Math.cos(a) * 11.5)}L${round(Math.sin(a) * 14)} ${round(-Math.cos(a) * 14)}`} stroke=${C.creamDark} stroke-width="2.2" stroke-linecap="round" />`
  })
  return part(
    'timer',
    at(168, COUNTER, [
      svg`<rect x="-15" y="-5" width="30" height="5" rx="2.5" fill=${C.skyDark} />`,
      svg`<rect x="-5" y="-53" width="10" height="8" rx="3" fill=${C.skyDark} />`,
      svg`<circle cy="-25" r="22" fill=${C.sky} />`,
      svg`<circle cy="-25" r="16.5" fill=${PAPER} />`,
      at(0, -25, [
        ticks,
        svg`<path d="M0 0L0-13A13 13 0 0 1 11.3-6.5Z" fill=${C.coral} />`,
        svg`<path d="M0 0L0-12" stroke=${C.fly} stroke-width="3" stroke-linecap="round" />`,
        svg`<circle r="3" fill=${C.fly} />`,
      ]),
      at(
        0,
        -24,
        motion(
          'flicker',
          svg`<path d="M-17-17l-5-5M17-17l5-5M-9-25l-2-6M9-25l2-6" fill="none" stroke=${C.sun} stroke-width="3.6" stroke-linecap="round" />`,
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
        'bob',
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function zeds(): Art {
  return [zed(146, 46, 0.72, 1), zed(162, 28, 1, 2), zed(180, 20, 0.62, 3)]
}

function smokeCloud(x: number, y: number, size: number, delay: number): Art {
  return part(
    'smoke-cloud',
    at(
      x,
      y,
      motion(
        'drift',
        [
          svg`<g fill=${CHAR}><circle cx="-18" cy="4" r="14" /><circle cx="2" cy="-6" r="19" /><circle cx="22" cy="5" r="13" /><rect x="-31" y="3" width="66" height="15" rx="7.5" /></g>`,
          svg`<path d="M-24-2a10 10 0 0 1 9-8M-6-16a13 13 0 0 1 10-3" fill="none" stroke=${CHAR_LIGHT} stroke-width="3.4" stroke-linecap="round" />`,
        ],
        delay,
      ),
      0,
      size,
    ),
  )
}

const WISP_SPOTS = [
  [80, 50],
  [122, 48],
] as const

const CLOUD_SPOTS = [
  [100, 36, 0.86, 1],
  [58, 52, 0.74, 2],
  [104, 42, 1.1, 3],
] as const

function smoke(parts: CookingParts): Art {
  return [
    steam(WISP_SPOTS.slice(0, parts.wisps), SMOKE),
    CLOUD_SPOTS.slice(0, parts.clouds).map(([x, y, s, d]) => smokeCloud(x, y, s, d)),
  ]
}

function surrenderFlag(): Art {
  return part(
    'surrender',
    at(
      66,
      67,
      motion(
        'wobble',
        at(
          0,
          0,
          [
            svg`<path d="M0 4V-50" stroke=${C.wickerDark} stroke-width="5" stroke-linecap="round" />`,
            svg`<path d="M0-50C-8-55-16-45-30-49V-27C-16-23-8-33 0-28Z" fill=${PAPER} />`,
          ],
          -12,
        ),
      ),
    ),
  )
}

function smokeAlarm(): Art {
  const arcs = svg`<path d="M-27-11q-6 11 0 22M-35-16q-9 16 0 32M27-11q6 11 0 22M35-16q9 16 0 32" fill="none" stroke=${C.coral} stroke-width="4" stroke-linecap="round" />`
  return part(
    'smoke-alarm',
    at(148, 40, [
      motion('flicker', arcs),
      motion('rumble', [
        svg`<circle r="20" fill=${C.metal} />`,
        svg`<circle r="14.5" fill=${C.metalMid} />`,
        svg`<circle cx="-5.5" cy="-3" r="2.6" fill=${C.fly} /><circle cx="5.5" cy="-3" r="2.6" fill=${C.fly} />`,
        svg`<ellipse cx="0" cy="6" rx="4.4" ry="5.6" fill=${C.fly} />`,
        at(0, -16.5, motion('flicker', svg`<circle r="3.4" fill=${C.coral} />`, 1)),
      ]),
    ]),
  )
}

function charredPan(fire: boolean): Art {
  return part(
    'charred-pan',
    at(
      162,
      183,
      [
        svg`<path d="M-26-16L-48-21" stroke=${CHAR} stroke-width="7" stroke-linecap="round" />`,
        svg`<g fill=${CHAR}><circle cx="-13" cy="-19" r="7" /><circle cx="3" cy="-21" r="9" /><circle cx="16" cy="-18" r="6" /></g>`,
        svg`<circle cx="3" cy="-23" r="2.2" fill=${EMBER} /><circle cx="-13" cy="-20" r="1.6" fill=${EMBER} />`,
        svg`<path d="M-28-17H28L23-3Q22 0 18 0H-18Q-22 0-23-3Z" fill=${CHAR} />`,
        svg`<rect x="-30" y="-19" width="60" height="6" rx="3" fill=${CHAR_LIGHT} />`,
        svg`<path d="M-14-9l5 3 3-3 5 3M8-8l5 3 4-2" fill="none" stroke=${EMBER} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
        when(fire, () => [flame(-9, -24, 0.72, 1), flame(8, -27, 0.95, 2)]),
      ],
      -3,
      0.92,
    ),
  )
}

function stoveView(parts: CookingParts, accent: string): Art {
  const charred = mix(accent, CHAR, parts.scorch * 0.5)
  const pot: Art = [
    when(parts.flag, surrenderFlag),
    when(!parts.lid, () => potMouth(accent)),
    when(parts.soup, soupArt),
    when(parts.soup, spoon),
    potBody(parts, accent),
    when(parts.lid, () => (parts.timer ? motion('rumble', lid(charred)) : lid(charred))),
  ]
  return [
    shadow(100, 184, 88),
    kitchen(),
    stove(parts, accent),
    part('pot-group', parts.soup ? motion('rumble', pot) : pot),
    when(parts.flame > 0, () => flames(parts.flame)),
    ingredients(parts.step),
    when(parts.hat, () => [waitingHat(parts.scorch), restingLid(accent)]),
    when(parts.timer, timer),
    when(parts.soup, () => [
      steam(
        [
          [60, 50],
          [106, 48],
          [150, 48],
        ],
        C.cream,
      ),
      hopping(),
      bubbleUp(72, 34, 4.5, 2),
      bubbleUp(120, 26, 5.5, 3),
      bubbleUp(94, 18, 3.5, 4),
    ]),
    when(parts.timer && parts.clouds === 0, () =>
      steam(
        [
          [68, 48],
          [132, 48],
        ],
        C.cream,
      ),
    ),
    when(parts.pan, () => charredPan(parts.panFire)),
    smoke(parts),
    when(parts.alarm, smokeAlarm),
    when(parts.crave, craving),
    when(parts.asleep, zeds),
  ]
}

function scallops(): string {
  const bumps = Array.from({ length: 8 }, () => 'q-11 11-22 0').join('')
  return `M12 140H188V162${bumps}Z`
}

function table(accent: string): Art {
  return part('table', [
    svg`<rect x="30" y="160" width="11" height="25" rx="3" fill=${C.wickerDark} /><rect x="159" y="160" width="11" height="25" rx="3" fill=${C.wickerDark} />`,
    svg`<path d=${scallops()} fill=${PAPER} />`,
    [23, 45, 67, 89, 111, 133, 155, 177].map(
      (x) => svg`<rect x=${x - 5} y="140" width="10" height="22" fill=${accent} opacity=".55" />`,
    ),
    svg`<rect x="10" y="134" width="180" height="9" rx="4.5" fill=${C.wickerLight} />`,
  ])
}

function plate(): Art {
  const basil = 'M0 0C-8-3-9-12 0-18C9-12 8-3 0 0Z'
  return part(
    'meal',
    at(132, 134, [
      svg`<path d="M-30 0H30L24 5Q22 6 20 6H-20Q-22 6-24 5Z" fill=${C.creamDark} />`,
      svg`<ellipse cy="-3" rx="51" ry="8" fill=${PAPER} />`,
      svg`<ellipse cy="-4" rx="39" ry="4.6" fill=${C.creamDark} />`,
      svg`<path d="M-35-3C-40-20-24-30-18-32C-13-48 13-49 18-32C27-29 40-18 35-3Q0 6-35-3Z" fill=${C.sun} />`,
      svg`<path d="M-29-8C-22-22-8-20-3-8M-14-5C-8-20 10-22 16-5M4-6C10-18 24-20 30-8M-24-20C-14-30 2-29 8-20" fill="none" stroke=${NOODLE} stroke-width="3.6" stroke-linecap="round" />`,
      svg`<path d="M-18-30C-20-34 -17-37-15-37M16-14C19-20 24-20 26-16" fill="none" stroke=${C.sunDark} stroke-width="2.8" stroke-linecap="round" />`,
      svg`<path d="M-21-32C-19-50 19-52 22-32C24-24 17-20 14-26C13-18 5-16 2-24C-1-17-9-16-11-25C-15-20-23-25-21-32Z" fill=${SAUCE} />`,
      svg`<path d="M-11-38C-7-43 0-45 6-44" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45" />`,
      svg`<circle cx="9" cy="-38" r="1.8" fill=${PAPER} /><circle cx="-6" cy="-31" r="1.6" fill=${PAPER} /><circle cx="14" cy="-31" r="1.5" fill=${PAPER} />`,
      at(-1, -46, svg`<path d=${basil} fill=${C.leafDark} />`, -36, 0.9),
      at(1, -46, svg`<path d=${basil} fill=${C.leaf} />`, 24, 1.05),
    ]),
  )
}

function platedView(parts: CookingParts, accent: string): Art {
  const chef: Art = at(
    60,
    134,
    at(-100, -118, [
      potMouth(accent),
      potBody(parts, accent),
      at(100, 60, chefHat(PAPER, C.creamDark), -7, 1.32),
    ]),
    0,
    0.66,
  )
  return [
    shadow(100, 184, 84),
    table(accent),
    part('pot-group', motion('bob', chef)),
    steam(
      [
        [116, 82],
        [148, 78],
      ],
      C.cream,
    ),
    plate(),
    sparkle(112, 34, 1.15, 1),
    sparkle(174, 44, 1.4, 2),
    sparkle(22, 100, 0.8, 3),
    sparkle(182, 106, 0.72, 4),
    sparkle(26, 42, 0.9, 5),
  ]
}

export function cooking(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = cookingParts(scene)
  const accent = accentOf(scene, C.coral)
  const art = parts.view === 'plated' ? platedView(parts, accent) : stoveView(parts, accent)
  return frame('cooking', scene, options, art)
}
