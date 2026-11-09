import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  clamp01,
  COLORS as C,
  drop,
  face,
  frame,
  INK,
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

export type ServiceView = 'parked' | 'bay' | 'workshop'
export type DashMode = 'hidden' | 'warning' | 'clear'

export interface ServiceParts {
  view: ServiceView
  dash: DashMode
  lamps: number
  can: boolean
  ticket: boolean
  asleep: boolean
  shiny: boolean
  puddle: number
  smoke: number
  wrench: boolean
  soot: boolean
  cracked: boolean
  mood: Mood
}

export const MAX_LAMPS = 5

const PUDDLE_AT = [0.05, 0.4, 0.7] as const
const SMOKE_AT = [0.25, 0.55, 0.85] as const
const WRENCH_AT = 0.35
const SOOT_AT = 0.6
const CRACK_AT = 0.75
const SICK_AT = 0.55

const CALM = {
  dash: 'hidden',
  lamps: 0,
  can: false,
  ticket: false,
  asleep: false,
  shiny: false,
} as const

export function serviceParts(scene: SceneView): ServiceParts {
  const { state } = scene
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const decay = {
    puddle: reached(stink, PUDDLE_AT),
    smoke: reached(stink, SMOKE_AT),
    wrench: stink >= WRENCH_AT && state !== 'running',
    soot: stink >= SOOT_AT,
    cracked: stink >= CRACK_AT,
  }
  const sick = stink >= SICK_AT
  if (state === 'clean') {
    return { ...CALM, ...decay, view: 'bay', dash: 'clear', shiny: true, mood: 'happy' }
  }
  if (state === 'running') {
    return { ...CALM, ...decay, view: 'workshop', mood: sick ? 'worried' : 'happy' }
  }
  if (state === 'waiting') {
    return { ...CALM, ...decay, view: 'bay', ticket: true, mood: sick ? 'sick' : 'calm' }
  }
  if (state === 'resting') {
    return { ...CALM, ...decay, view: 'parked', asleep: !sick, mood: sick ? 'sick' : 'sleepy' }
  }
  const due = state === 'due'
  const raw = Math.floor(clamp01(scene.fill) * (MAX_LAMPS + 1))
  const lamps = due ? MAX_LAMPS : Math.min(MAX_LAMPS - 1, raw)
  let mood: Mood = lamps >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return { ...CALM, ...decay, view: 'bay', dash: 'warning', lamps, can: due, mood }
}

const TYRE = '#1b1f33'
const BAY = '#1a1e33'
const GRILLE = '#262c49'
const PANEL = '#12152a'
const PANEL_RIM = '#3a4163'
const LAMP_OFF = '#3b4265'
const OIL = '#10111b'
const OIL_SHEEN = '#8f7fd8'
const OIL_GLINT = '#4fb7b0'
const FRESH_OIL = '#f2b632'
const SMOKE = '#6a6f83'
const SMOKE_DARK = '#4a4e60'
const PAPER = '#fbf7ec'
const BATTERY = '#3f4768'

interface Paint {
  body: string
  dark: string
  under: string
  brace: string
  light: string
  bumper: string
  face: string
}

function paintOf(scene: SceneView): Paint {
  const body = accentOf(scene, C.sky)
  return {
    body,
    dark: shadeOf(body, 0.26),
    under: shadeOf(body, 0.56),
    brace: shadeOf(body, 0.72),
    light: tintOf(body, 0.42),
    bumper: tintOf(body, 0.68),
    face: mix(body, INK, 0.84),
  }
}

function tyres(): Art {
  return svg`<rect x="38" y="160" width="28" height="26" rx="7" fill=${TYRE} /><rect x="134" y="160" width="28" height="26" rx="7" fill=${TYRE} />`
}

function headlight(x: number, shiny: boolean, cracked: boolean): Art {
  return [
    svg`<circle cx=${x} cy="135" r="12.5" fill=${C.metal} />`,
    svg`<circle cx=${x} cy="135" r="9" fill=${shiny ? '#fff6cf' : C.spark} />`,
    svg`<path d=${`M${x - 5.5} 133a7 7 0 0 1 5.5-4.5`} fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" />`,
    when(
      cracked,
      () =>
        svg`<path d=${`M${x - 8} 130l6 4-3 4 6 1 3 5M${x - 2} 134l7-5`} fill="none" stroke=${C.metalDark} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
  ]
}

function bodyShell(paint: Paint): Art {
  return svg`<path d="M42 94H158Q168 94 170 104L177 150Q178 172 162 172H38Q22 172 23 150L30 104Q32 94 42 94Z" fill=${paint.body} />`
}

function fascia(paint: Paint, parts: ServiceParts): Art {
  const slats = [133, 139]
  return [
    svg`<rect x="72" y="127" width="56" height="18" rx="6" fill=${GRILLE} />`,
    slats.map(
      (y) =>
        svg`<rect x="79" y=${y - 1.5} width="42" height="3" rx="1.5" fill=${C.metalDark} opacity=".75" />`,
    ),
    part('headlight', [
      headlight(52, parts.shiny, false),
      headlight(148, parts.shiny, parts.cracked),
    ]),
    svg`<rect x="18" y="146" width="164" height="31" rx="14" fill=${paint.bumper} />`,
    svg`<circle cx="36" cy="161" r="5" fill=${C.sun} /><circle cx="164" cy="161" r="5" fill=${C.sun} />`,
    face(100, 160.5, parts.mood, paint.face, 1.12),
  ]
}

function engine(parts: ServiceParts): Art {
  const block = parts.shiny ? C.metal : C.metalMid
  const ribs = parts.shiny ? C.metalMid : C.metalDark
  const grime = parts.soot ? 0.55 : parts.smoke > 0 ? 0.28 : 0
  const cover = mix(block, SMOKE_DARK, grime)
  return part('engine', [
    svg`<path d="M46 96H154Q160 96 160 102V120Q160 126 154 126H46Q40 126 40 120V102Q40 96 46 96Z" fill=${BAY} />`,
    svg`<path d="M66 116H58V122M134 116H142V122" fill="none" stroke=${C.metalDark} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<rect x="47" y="105" width="18" height="17" rx="3" fill=${BATTERY} />`,
    svg`<rect x="50" y="102" width="4" height="4" fill=${C.coral} /><rect x="58" y="102" width="4" height="4" fill=${C.metalMid} />`,
    svg`<path d="M50 113h5M52.5 110.5v5M58 113h5" stroke=${C.cream} stroke-width="1.8" stroke-linecap="round" />`,
    svg`<rect x="136" y="105" width="17" height="17" rx="4.5" fill="#a9dcf7" />`,
    svg`<path d="M136 112h17v5.5a4.5 4.5 0 0 1-4.5 4.5h-8a4.5 4.5 0 0 1-4.5-4.5Z" fill=${C.waterDark} />`,
    svg`<rect x="140" y="101" width="9" height="5" rx="1.5" fill=${C.skyDark} />`,
    svg`<rect x="71" y="101" width="58" height="25" rx="6" fill=${cover} />`,
    [80, 90, 100, 110, 120].map(
      (x) =>
        svg`<rect x=${x - 2} y="109" width="4" height="13" rx="2" fill=${mix(ribs, SMOKE_DARK, grime)} />`,
    ),
    svg`<rect x="93" y="95" width="14" height="8" rx="2.5" fill=${C.sun} /><rect x="96" y="93" width="8" height="4" rx="1.5" fill=${C.sunDark} />`,
    when(parts.shiny, () => [
      svg`<path d="M76 106h22" stroke="#fff" stroke-width="3" stroke-linecap="round" />`,
      svg`<path d="M106 106h5" stroke="#fff" stroke-width="3" stroke-linecap="round" />`,
    ]),
  ])
}

function bonnet(paint: Paint): Art {
  return part('bonnet', [
    svg`<path d="M50 104L36 58Q34 48 44 48H156Q166 48 164 58L150 104Z" fill=${paint.under} />`,
    svg`<path d="M57 98L46 62Q45 57 51 57H149Q155 57 154 62L143 98Z" fill=${paint.brace} />`,
    svg`<path d="M56 64L144 94M144 64L56 94M100 60V96" fill="none" stroke=${paint.under} stroke-width="4" stroke-linecap="round" />`,
    svg`<rect x="31" y="44" width="138" height="14" rx="7" fill=${paint.body} />`,
    svg`<rect x="42" y="47.5" width="46" height="3.4" rx="1.7" fill=${paint.light} />`,
    svg`<path d="M140 98L152 58" stroke=${C.metalMid} stroke-width="3.6" stroke-linecap="round" />`,
  ])
}

function cabin(paint: Paint): Art {
  return [
    svg`<ellipse cx="32" cy="92" rx="12" ry="7.5" fill=${paint.dark} /><ellipse cx="168" cy="92" rx="12" ry="7.5" fill=${paint.dark} />`,
    svg`<path d="M42 104L58 66Q62 56 74 56H126Q138 56 142 66L158 104Z" fill=${paint.body} />`,
    svg`<path d="M52 96L65 69Q68 63 76 63H124Q132 63 135 69L148 96Z" fill=${C.glass} />`,
    svg`<path d="M66 96L82 63H100L84 96ZM92 96L108 63H114L98 96Z" fill="#fff" opacity=".16" />`,
    svg`<path d="M70 95L96 89M130 95L104 89" stroke=${INK} stroke-width="3" stroke-linecap="round" />`,
  ]
}

function closedLid(paint: Paint, parts: ServiceParts): Art {
  return [
    svg`<path d="M66 100L60 124M134 100L140 124" stroke=${paint.dark} stroke-width="3.4" stroke-linecap="round" />`,
    svg`<rect x="78" y="104" width="44" height="3.4" rx="1.7" fill=${paint.light} />`,
    when(
      parts.smoke > 0,
      () =>
        svg`<path d="M44 96H156" stroke=${SMOKE_DARK} stroke-width="3" stroke-linecap="round" />`,
    ),
  ]
}

function soot(): Art {
  return part('soot', [
    svg`<path d="M54 146V154a2.3 2.3 0 0 0 4.6 0V146ZM63 146V150a2 2 0 0 0 4 0V146ZM144 146V152a2.2 2.2 0 0 0 4.4 0V146Z" fill=${OIL} />`,
    svg`<path d="M28 168Q24 159 33 158Q38 153 45 159Q53 161 49 169Q39 175 28 168Z" fill=${OIL} opacity=".85" />`,
    svg`<path d="M143 152q5-6 11-3t7 8q-6 7-13 4t-5-9Z" fill=${OIL} opacity=".72" />`,
  ])
}

function openCar(paint: Paint, parts: ServiceParts): Art {
  return part('car', [
    tyres(),
    bonnet(paint),
    bodyShell(paint),
    engine(parts),
    fascia(paint, parts),
    when(parts.soot, soot),
  ])
}

function closedCar(paint: Paint, parts: ServiceParts): Art {
  return part('car', [
    tyres(),
    cabin(paint),
    bodyShell(paint),
    closedLid(paint, parts),
    fascia(paint, parts),
    when(parts.soot, soot),
  ])
}

function roomy(art: Art): Art {
  return at(100, 184, at(-100, -184, art), 0, 0.84)
}

function lampHalo(on: boolean, tint: string): Art {
  return on ? svg`<circle r="13.5" fill=${tint} opacity=".22" />` : []
}

const GLYPHS: readonly ((color: string) => Art)[] = [
  (c) =>
    svg`<path d="M-10-3H-7V-7H-3V-9H3V-7H6L8-3H11V5H8L6 8H-3L-7 4H-10Z" fill=${c} stroke=${c} stroke-width="1" stroke-linejoin="round" />`,
  (c) => [
    svg`<path d="M-3-3H5L12-7V-3L6 7H-3Z" fill=${c} stroke=${c} stroke-width="1.6" stroke-linejoin="round" />`,
    svg`<path d="M-3-1L-11-6" stroke=${c} stroke-width="3" stroke-linecap="round" />`,
    svg`<path d="M-11 0C-9 3-8 4-8 6a3 3 0 0 1-6 0C-14 4-13 3-11 0Z" fill=${c} />`,
    svg`<rect x="-1" y="-8" width="6" height="3" rx="1" fill=${c} />`,
  ],
  (c) => [
    svg`<rect x="-11" y="-5" width="22" height="14" rx="2.5" fill=${c} />`,
    svg`<rect x="-8" y="-9" width="5" height="4" fill=${c} /><rect x="3" y="-9" width="5" height="4" fill=${c} />`,
    svg`<path d="M-8 2h6M-5-1v6M3 2h6" stroke=${PANEL} stroke-width="2" stroke-linecap="round" />`,
  ],
  (c) => [
    svg`<rect x="-2.5" y="-11" width="5" height="14" rx="2.5" fill=${c} />`,
    svg`<circle cy="3" r="5" fill=${c} />`,
    svg`<path d="M4-8h4M4-3h3" stroke=${c} stroke-width="2.2" stroke-linecap="round" />`,
    svg`<path d="M-11 11q3-3 5.5 0t5.5 0 5.5 0 5.5 0" fill="none" stroke=${c} stroke-width="2.4" stroke-linecap="round" />`,
  ],
  (c) => [
    svg`<path d="M0-9L10.5 8H-10.5Z" fill=${c} stroke=${c} stroke-width="3.4" stroke-linejoin="round" />`,
    svg`<rect x="-1.5" y="-4" width="3" height="7.5" rx="1.5" fill=${PANEL} /><circle cy="7" r="1.8" fill=${PANEL} />`,
  ],
]

const LAMP_COLORS = [C.sun, C.coral, C.sun, C.coral, C.coral] as const

function lamp(index: number, parts: ServiceParts): Art {
  const x = 44 + index * 28
  const glyph = GLYPHS[index] ?? GLYPHS[0]
  if (!glyph) return []
  const clear = parts.dash === 'clear'
  const on = clear || index < parts.lamps
  const lit = clear ? C.mint : (LAMP_COLORS[index] ?? C.sun)
  const newest = index === parts.lamps - 1 && !clear
  const art: Art = [lampHalo(on, lit), glyph(on ? lit : LAMP_OFF)]
  const urgent = parts.lamps === MAX_LAMPS && index % 2 === 0
  return part(
    on ? 'lamp-on' : 'lamp-off',
    at(x, 37, newest || urgent ? motion('pulse', art, (index % 5) + 1) : art),
    index,
  )
}

function dashboard(parts: ServiceParts): Art {
  return part('dashboard', [
    svg`<path d="M24 58V30Q24 14 40 14H160Q176 14 176 30V58Q176 62 172 62H28Q24 62 24 58Z" fill=${PANEL_RIM} />`,
    svg`<path d="M29 57V31Q29 19 41 19H159Q171 19 171 31V57Z" fill=${PANEL} />`,
    Array.from({ length: MAX_LAMPS }, (_, i) => lamp(i, parts)),
  ])
}

export function wrenchArt(fill: string, shade: string): Art {
  return [
    svg`<rect x="-4.5" y="-24" width="9" height="50" rx="3" fill=${fill} />`,
    svg`<path d="M-6-46L-4-33H4L6-46C14-42 15-31 11-25C8-21 5.5-20 4.5-17H-4.5C-5.5-20-8-21-11-25C-15-31-14-42-6-46Z" fill=${fill} />`,
    svg`<path fill-rule="evenodd" d="M0 19a11.5 11.5 0 1 0 0 23a11.5 11.5 0 1 0 0-23ZM0 25.5a5 5 0 1 1 0 10a5 5 0 1 1 0-10Z" fill=${fill} />`,
    svg`<rect x="-1.5" y="-14" width="3" height="28" rx="1.5" fill=${shade} />`,
  ]
}

function thrownWrench(): Art {
  return part(
    'wrench',
    at(38, 176, [shadow(0, 8, 22, 0.3), at(0, 1, wrenchArt(C.metalMid, C.metalDark), -74, 0.55)]),
  )
}

export function oilCanArt(): Art {
  return [
    svg`<path d="M-5-29L-31-51L-26-56L7-25Z" fill=${C.coralDark} />`,
    svg`<path d="M15-23C31-30 32-5 18-7" fill="none" stroke=${C.coralDark} stroke-width="4.5" stroke-linecap="round" />`,
    svg`<path d="M-17 0H17Q21 0 20-4L15-20Q8-31 0-32Q-8-31-15-20L-20-4Q-21 0-17 0Z" fill=${C.coral} />`,
    svg`<path d="M-19-9H19L20-4Q21 0 17 0H-17Q-21 0-20-4Z" fill=${C.coralDark} />`,
    svg`<path d="M-1-24C3-19 5-17 5-14a6 6 0 0 1-12 0C-7-17-5-19-1-24Z" fill=${C.cream} />`,
    svg`<rect x="-4" y="-36" width="9" height="6" rx="2" fill=${C.metalDark} />`,
  ]
}

function waitingCan(): Art {
  return part('oil-can', [
    shadow(168, 184, 20, 0.3),
    at(168, 184, svg`<g transform="scale(-.74 .74)">${oilCanArt()}</g>`),
  ])
}

function funnel(): Art {
  return [
    svg`<path d="M87 78H113L104 90V97H96V90Z" fill=${C.metalMid} />`,
    svg`<rect x="85" y="75.5" width="30" height="5" rx="2.5" fill=${C.metal} />`,
  ]
}

function pouringCan(): Art {
  const glugs = [
    [104, 64, 1, 0.9],
    [103, 69, 3, 0.75],
  ] as const
  return part('oil-can', [
    funnel(),
    svg`<path d="M105 57Q103 62 103 77" fill="none" stroke=${FRESH_OIL} stroke-width="3.4" stroke-linecap="round" />`,
    glugs.map(([x, y, d, s]) => at(x, y, motion('drip', drop(0, 0, FRESH_OIL, s), d))),
    at(158, 45, motion('sway', oilCanArt(), 2), -78, 0.92),
  ])
}

function spanner(): Art {
  return part('spanner', [
    at(
      76,
      110,
      motion('wobble', at(0, 0, at(0, 27, wrenchArt(C.metal, C.metalDark), 0, 0.82), 155)),
    ),
    at(
      76,
      110,
      motion(
        'flicker',
        svg`<path d="M-30-66A72 72 0 0 1-6-72M-6-72l-7-5M-6-72l-6 6" fill="none" stroke=${C.cream} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
        2,
      ),
    ),
    svg`<circle cx="76" cy="110" r="4.5" fill=${C.sun} />`,
  ])
}

function gear(x: number, y: number, size: number, color: string, delay: number): Art {
  return part(
    'gear',
    at(
      x,
      y,
      motion('spin', [
        svg`<circle r="14" fill="none" stroke=${color} stroke-width="6" stroke-dasharray="5.5 5.5" />`,
        svg`<circle r="10" fill="none" stroke=${color} stroke-width="7" />`,
      ]),
      delay * 20,
      size,
    ),
  )
}

function invoice(): Art {
  return part(
    'invoice',
    at(62, 13, [
      motion(
        'sway',
        [
          svg`<rect x="-25" y="7" width="50" height="52" rx="4" fill=${PAPER} />`,
          svg`<path d="M-17 22H5M-17 30H12M-17 38H3" stroke=${C.creamDark} stroke-width="3.4" stroke-linecap="round" />`,
          svg`<rect x="-17" y="46" width="19" height="6" rx="3" fill=${C.coral} />`,
          svg`<circle cx="13" cy="46" r="7" fill="none" stroke=${C.coralDark} stroke-width="2.4" />`,
          svg`<path d="M9.5 46l2.5 3 5-5.5" fill="none" stroke=${C.coralDark} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`,
        ],
        1,
      ),
      svg`<path d="M-7 3L-4-5H4L7 3" fill="none" stroke=${C.metalDark} stroke-width="2.6" stroke-linejoin="round" />`,
      svg`<rect x="-13" y="2" width="26" height="11" rx="3" fill=${C.metalDark} />`,
    ]),
  )
}

function keys(paint: Paint): Art {
  return part('keys', [
    svg`<rect x="118" y="14" width="56" height="13" rx="5" fill=${C.wicker} />`,
    svg`<circle cx="125" cy="20.5" r="1.8" fill=${C.wickerDark} /><circle cx="167" cy="20.5" r="1.8" fill=${C.wickerDark} />`,
    svg`<path d="M146 22V29a3.5 3.5 0 0 0 7 0" fill="none" stroke=${C.metalMid} stroke-width="3.2" stroke-linecap="round" />`,
    at(
      146,
      30,
      motion(
        'wobble',
        [
          svg`<circle cy="6" r="6.5" fill="none" stroke=${C.metal} stroke-width="2.6" />`,
          svg`<rect x="-10" y="11" width="20" height="24" rx="7" fill=${paint.body} />`,
          svg`<circle cy="20" r="3.5" fill=${paint.bumper} />`,
          svg`<rect x="-2" y="33" width="4" height="9" fill=${C.metal} />`,
          svg`<path d="M2 37h3M2 40h4" stroke=${C.metal} stroke-width="2" />`,
        ],
        2,
      ),
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

function puddle(level: number): Art {
  if (level === 0) return []
  const rx = [0, 42, 60, 76][level] ?? 76
  const blobs =
    level >= 2
      ? svg`<ellipse cx=${100 - rx * 0.8} cy="184" rx="15" ry="3.4" fill=${OIL} /><ellipse cx=${100 + rx * 0.72} cy="183" rx="18" ry="3.8" fill=${OIL} />`
      : []
  return part(
    'oil-puddle',
    [
      svg`<ellipse cx="100" cy="182.5" rx=${rx} ry="5" fill=${OIL} />`,
      blobs,
      svg`<path d=${`M${100 - rx * 0.45} 182.5q${rx * 0.2} -2.4 ${rx * 0.42} 0`} fill="none" stroke=${OIL_SHEEN} stroke-width="2.2" stroke-linecap="round" />`,
      svg`<path d=${`M${100 + rx * 0.12} 185q${rx * 0.16} 1.8 ${rx * 0.34} 0`} fill="none" stroke=${OIL_GLINT} stroke-width="2" stroke-linecap="round" />`,
    ],
    level,
  )
}

function oilDrips(): Art {
  return part(
    'oil-drip',
    (
      [
        [86, 177, 1],
        [114, 176, 3],
      ] as const
    ).map(([x, y, d]) => at(x, y, motion('drip', drop(0, 0, OIL, 0.6), d))),
  )
}

function puff(x: number, y: number, size: number, delay: number, grumpy: boolean): Art {
  const cloud = [
    svg`<g fill=${SMOKE}><circle cx="-13" cy="3" r="11" /><circle cx="2" cy="-5" r="14.5" /><circle cx="15" cy="4" r="10.5" /><rect x="-23" y="3" width="47" height="11" rx="5.5" /></g>`,
    svg`<circle cx="-5" cy="-9" r="6" fill="#8b90a5" />`,
    grumpy
      ? svg`<path d="M-12-1l6 2M12-1l-6 2M-5 8q5-4 10 0" fill="none" stroke=${SMOKE_DARK} stroke-width="2.6" stroke-linecap="round" />`
      : [],
  ]
  return part('smoke', at(x, y, motion('waft', motion('drift', cloud, delay), delay), 0, size))
}

const SMOKE_SPOTS = [
  [100, 86, 1, 1],
  [58, 70, 0.8, 2],
  [146, 66, 1.12, 3],
] as const

function smokeCluster(count: number): Art {
  return SMOKE_SPOTS.slice(0, count).map(([x, y, s, d], i) => puff(x, y, s, d, i === 2))
}

function decayFloor(parts: ServiceParts): Art {
  return [puddle(parts.puddle), when(parts.puddle >= 1, oilDrips)]
}

function parkedView(parts: ServiceParts, paint: Paint): Art {
  return [
    shadow(100, 184, 80),
    decayFloor(parts),
    closedCar(paint, parts),
    when(parts.wrench, thrownWrench),
    parts.smoke > 0
      ? at(
          0,
          34,
          SMOKE_SPOTS.slice(0, parts.smoke).map(([x, y, s, d], i) =>
            puff(x, y, s * 0.9, d, i === 2),
          ),
        )
      : [],
    when(parts.asleep, () => [zed(150, 46, 0.72, 1), zed(166, 30, 1, 2), zed(184, 16, 0.62, 3)]),
  ]
}

const CLEAN_SPARKLES = [
  [24, 92, 1.3, 1],
  [178, 96, 1.05, 2],
  [128, 118, 0.85, 3],
  [60, 143, 0.8, 4],
  [186, 150, 0.75, 5],
] as const

function bayView(parts: ServiceParts, paint: Paint): Art {
  return [
    shadow(100, 184, 72),
    decayFloor(parts),
    roomy(openCar(paint, parts)),
    when(parts.dash !== 'hidden', () => dashboard(parts)),
    when(parts.ticket, () => [invoice(), keys(paint)]),
    when(parts.can, waitingCan),
    when(parts.wrench, thrownWrench),
    roomy(smokeCluster(parts.smoke)),
    when(parts.shiny, () => CLEAN_SPARKLES.map(([x, y, s, d]) => sparkle(x, y, s, d))),
  ]
}

function workshopView(parts: ServiceParts, paint: Paint): Art {
  return [
    gear(27, 36, 0.98, '#7fa6d4', 0),
    gear(60, 22, 0.6, '#5f88bb', 1),
    shadow(100, 184, 80),
    decayFloor(parts),
    motion('bob', [openCar(paint, parts), spanner()]),
    pouringCan(),
    smokeCluster(Math.min(2, parts.smoke)),
  ]
}

export function service(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = serviceParts(scene)
  const paint = paintOf(scene)
  const views: Record<ServiceView, (p: ServiceParts, c: Paint) => Art> = {
    parked: parkedView,
    bay: bayView,
    workshop: workshopView,
  }
  return frame('service', scene, options, views[parts.view](parts, paint))
}
