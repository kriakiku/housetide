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
  round,
  shadeOf,
  shadow,
  sparkle,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type EyesView = 'desk' | 'break' | 'drops'
export type EyesLook = 'closed' | 'open' | 'pleading' | 'bright'

export interface EyesParts {
  view: EyesView
  look: EyesLook
  step: number
  lid: number
  squint: number
  red: number
  veins: number
  zigzags: number
  bags: number
  glare: number
  rays: number
  level: number
  tipped: boolean
  mugs: number
  tears: boolean
  sighs: boolean
  glow: boolean
  flies: number
  gaze: readonly [number, number, number, number]
  mood: Mood
}

export const MAX_STEP = 4

const OPEN_LIDS = [-23, -18, -13, -7, -1] as const
const RED_STEPS = [0, 0.14, 0.32, 0.52, 0.72] as const
const VEIN_STEPS = [0, 0, 2, 4, 6] as const
const STINK_AT = [0.12, 0.4, 0.7] as const
const FLY_AT = [0.85, 0.95] as const
const SICK_AT = 0.6
const LEVELS = [1, 0.55, 0.2, 0] as const
const ZIGZAGS = [0, 3, 6, 8] as const
const RAYS = [0, 0, 5, 11] as const

const AHEAD = [0, 2, 0, 2] as const

export function eyesParts(scene: SceneView): EyesParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const base = {
    squint: 0,
    veins: 0,
    zigzags: 0,
    bags: 0,
    glare: 0,
    rays: 0,
    level: 1,
    tipped: false,
    mugs: 0,
    tears: false,
    sighs: false,
    glow: false,
    flies: 0,
  }
  if (state === 'clean') {
    return {
      ...base,
      view: 'desk',
      look: 'bright',
      step: 0,
      lid: -25,
      red: 0,
      glow: true,
      gaze: AHEAD,
      mood: 'happy',
    }
  }
  const harm = reached(stink, STINK_AT)
  const sick = stink >= SICK_AT
  const damage = {
    zigzags: ZIGZAGS[harm] ?? 8,
    glare: harm,
    rays: RAYS[harm] ?? 11,
    level: LEVELS[harm] ?? 0,
    tipped: harm >= 3,
    flies: reached(stink, FLY_AT),
    squint: harm >= 3 ? 12 : 0,
    bags: Math.min(2, harm),
  }
  if (state === 'running') {
    return {
      ...base,
      view: 'break',
      look: 'open',
      step: 0,
      lid: -21,
      red: harm * 0.1,
      zigzags: Math.min(3, damage.zigzags),
      level: damage.level,
      gaze: [9, -5, 9, -5],
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...base,
      ...damage,
      view: 'drops',
      look: 'open',
      step: MAX_STEP,
      lid: -24,
      squint: 0,
      red: 0.3 + harm * 0.16,
      level: Math.max(0.16, damage.level * 0.5),
      tipped: false,
      gaze: [7, -8, -1, -9],
      mood: sick ? 'worried' : 'calm',
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
    ...base,
    ...damage,
    view: 'desk',
    look: resting ? 'closed' : due ? 'pleading' : 'open',
    step,
    lid: due ? -19 + harm * 3 : (OPEN_LIDS[step] ?? -1),
    red: Math.min(1, (RED_STEPS[step] ?? 0.72) + harm * 0.1),
    veins: VEIN_STEPS[step] ?? 6,
    bags: Math.max(damage.bags, step >= 4 ? 2 : step >= 2 ? 1 : 0),
    mugs: Math.min(3, step),
    tears: due,
    sighs: step >= 3 && !due,
    gaze: due ? [1, -2, -1, -2] : AHEAD,
    mood,
  }
}

const LEFT = 65
const RIGHT = 135
const CY = 71
const RX = 27
const RY = 26
const RIM = 3.5
const BASE = 178

const SCREEN_TONES = [C.glass, '#7f9fd8', '#dcecff', '#fbfdff'] as const
const DIM = '#182040'
const BREAK = '#2b4b80'
const CALM = '#114a46'
const DUE = '#37407a'
const SORE = '#ff8f86'
const VEIN = '#e8574c'
const ZIG = '#c92f2f'
const BAG = '#7b5aa6'
const WHITE = '#ffffff'
const BOTTLE = '#f3f6fd'
const BOTTLE_SHADE = '#c9d3e8'
const GLASS = '#dbe9f8'
const SKY = '#a9dfff'
const HILL = '#7fd487'
const HILL_DARK = '#58b56b'
const TRUNK = '#9a6a3f'
const COFFEE = '#5a3a26'

const VEIN_ANGLES = [172, 8, 150, 30, 196, -16, 128, 52] as const

interface Tones {
  body: string
  dark: string
  light: string
  lid: string
  edge: string
  ink: string
}

function tonesOf(scene: SceneView): Tones {
  const body = accentOf(scene, C.sun)
  return {
    body,
    dark: shadeOf(body, 0.2),
    light: tintOf(body, 0.42),
    lid: shadeOf(body, 0.1),
    edge: shadeOf(body, 0.45),
    ink: isDarkColor(body) ? C.cream : INK,
  }
}

function lidPath(h: number, sag: number, flip = 1): string {
  const ox = RX + RIM
  const oy = RY + RIM
  const dx = round(ox * Math.sqrt(Math.max(0, 1 - (h / oy) ** 2)))
  const y = round(h * flip)
  const sweep = flip === 1 ? 1 : 0
  const large = h > 0 ? 1 : 0
  const control = round((h + sag) * flip)
  return `M${-dx} ${y}A${ox} ${oy} 0 ${large} ${sweep} ${dx} ${y}Q0 ${control} ${-dx} ${y}Z`
}

function veinLine(angle: number, side: number, zigzag: boolean): string {
  const a = (angle * Math.PI) / 180
  const cos = Math.cos(a) * side
  const sin = Math.sin(a)
  const points = [1, 0.87, 0.75, 0.62].map((r, i) => {
    const jog = i === 0 || !zigzag ? 0 : i % 2 ? 2.6 : -2.6
    return [round(cos * RX * r - sin * jog), round(sin * RY * r + cos * jog)] as const
  })
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('')
}

function veins(count: number, zigzags: number, side: number): Art {
  const soft = VEIN_ANGLES.slice(zigzags, Math.max(zigzags, count)).map(
    (angle) =>
      svg`<path d=${veinLine(angle, side, false)} fill="none" stroke=${VEIN} stroke-width="1.5" stroke-linecap="round" opacity=".75" />`,
  )
  const sharp = VEIN_ANGLES.slice(0, zigzags).map(
    (angle) =>
      svg`<path d=${veinLine(angle, side, true)} fill="none" stroke=${ZIG} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
  )
  return part('veins', [soft, sharp])
}

function iris(parts: EyesParts, x: number, y: number): Art {
  const pleading = parts.look === 'pleading'
  const bright = parts.look === 'bright'
  const r = pleading ? 18.5 : 16
  const pupil = pleading ? 13.5 : bright ? 8 : 9
  const color = bright ? C.mint : C.sky
  const ring = bright ? C.mintDark : C.skyDark
  const art: Art = [
    svg`<circle r=${r} fill=${ring} />`,
    svg`<circle r=${r - 3} fill=${color} />`,
    svg`<circle r=${pupil} fill=${INK} />`,
    svg`<circle cx="-5.5" cy="-6" r=${pleading ? 5.6 : 4.6} fill=${WHITE} />`,
    svg`<circle cx="5" cy="5" r=${pleading ? 3.2 : 2.3} fill=${WHITE} />`,
    when(
      pleading,
      () =>
        svg`<path d="M-9 8Q0 14 9 8" fill="none" stroke=${WHITE} stroke-width="2.4" stroke-linecap="round" opacity=".85" />`,
    ),
    when(bright, () => svg`<circle cx="6.5" cy="-7" r="2" fill=${WHITE} />`),
  ]
  return part('iris', at(x, y, art))
}

function lashes(color: string): Art {
  return [
    svg`<path d="M-24 6Q0 25 24 6" fill="none" stroke=${color} stroke-width="4" stroke-linecap="round" />`,
    svg`<path d="M-17 15l-4 6M0 19v7M17 15l4 6" fill="none" stroke=${color} stroke-width="3.4" stroke-linecap="round" />`,
    svg`<path d="M-15-12Q0-22 15-12" fill="none" stroke=${color} stroke-width="2.6" stroke-linecap="round" opacity=".3" />`,
  ]
}

function upperLid(parts: EyesParts, tones: Tones, side: number): Art {
  const art: Art = [
    svg`<path d=${lidPath(parts.lid + 2.5, 7)} fill=${INK} opacity=".16" />`,
    svg`<path d=${lidPath(parts.lid, 7)} fill=${tones.lid} />`,
    lidEdge(parts.lid, tones.edge),
  ]
  if (parts.look === 'pleading') return at(0, 0, art, side * 13)
  if (parts.look === 'bright') return art
  if (parts.step <= 1) return motion('bob', art)
  return at(-64, 0, motion('sway', at(64, 0, art)))
}

function lidEdge(h: number, color: string): Art {
  const ox = RX + RIM
  const oy = RY + RIM
  const dx = round(ox * Math.sqrt(Math.max(0, 1 - (h / oy) ** 2)))
  return svg`<path d=${`M${-dx} ${h}Q0 ${h + 7} ${dx} ${h}`} fill="none" stroke=${color} stroke-width="3.2" stroke-linecap="round" />`
}

function bags(count: number): Art {
  if (count === 0) return []
  const rows = [
    `M-23 ${RY + 2}Q0 ${RY + 14} 23 ${RY + 2}Q0 ${RY + 8} -23 ${RY + 2}Z`,
    `M-17 ${RY + 8}Q0 ${RY + 17} 17 ${RY + 8}Q0 ${RY + 13} -17 ${RY + 8}Z`,
  ]
  return part(
    'bags',
    rows.slice(0, count).map((d) => svg`<path d=${d} fill=${BAG} />`),
  )
}

function tear(side: number): Art {
  return part('tear', [
    svg`<path d="M-17 20Q0 30 17 20Q0 25-17 20Z" fill=${C.water} />`,
    at(side * 15, 29, motion('drip', drop(0, 0, C.water, 0.72), side > 0 ? 3 : 1)),
  ])
}

function eye(parts: EyesParts, tones: Tones, x: number, gx: number, gy: number, side: number): Art {
  const socket = svg`<ellipse rx=${RX + RIM} ry=${RY + RIM} fill=${tones.lid} />`
  if (parts.look === 'closed') {
    return part('eye', at(x, CY, [socket, lashes(tones.edge)]), side > 0 ? 1 : 0)
  }
  const white = mix(WHITE, SORE, parts.red)
  return part(
    'eye',
    at(x, CY, [
      bags(parts.bags),
      socket,
      svg`<ellipse rx=${RX} ry=${RY} fill=${white} />`,
      veins(parts.veins, parts.zigzags, side),
      iris(parts, gx, gy),
      upperLid(parts, tones, side),
      when(
        parts.squint > 0,
        () => svg`<path d=${lidPath(-parts.squint, 5, -1)} fill=${tones.lid} />`,
      ),
      when(parts.tears, () => tear(side)),
    ]),
    side > 0 ? 1 : 0,
  )
}

function screenTone(parts: EyesParts): string {
  if (parts.glow) return CALM
  if (parts.view === 'break') return BREAK
  if (parts.glare > 0) return SCREEN_TONES[parts.glare] ?? WHITE
  if (parts.look === 'closed') return DIM
  if (parts.look === 'pleading') return DUE
  return mix(C.glass, '#4a68a8', parts.step / MAX_STEP)
}

function pips(step: number): Art {
  const lit = step >= 3 ? C.coral : C.mint
  return part('screen-time', [
    svg`<rect x="143" y="117" width="31" height="11" rx="5.5" fill=${INK} />`,
    [0, 1, 2, 3].map(
      (i) =>
        svg`<rect x=${148 + i * 6} y="120.5" width="4" height="4" rx="1.5" fill=${i < step ? lit : '#3a4163'} />`,
    ),
  ])
}

function monitor(parts: EyesParts, tones: Tones): Art {
  const lamp = parts.look === 'closed' ? C.metalDark : parts.glare >= 2 ? C.coral : C.mint
  const tone = screenTone(parts)
  const sheen = parts.glare >= 2 ? BAG : WHITE
  return part('monitor', [
    svg`<rect x="87" y="134" width="26" height="34" fill=${tones.dark} />`,
    svg`<path d="M87 148H113V156H87Z" fill=${shadeOf(tones.body, 0.34)} />`,
    svg`<path d="M60 178Q60 165 74 165H126Q140 165 140 178Z" fill=${tones.body} />`,
    svg`<path d="M60 178Q60 174 62 171H138Q140 174 140 178Z" fill=${tones.dark} />`,
    svg`<rect x="20" y="26" width="160" height="110" rx="17" fill=${tones.body} />`,
    svg`<path d="M20 112H180V119A17 17 0 0 1 163 136H37A17 17 0 0 1 20 119Z" fill=${tones.dark} />`,
    svg`<path d="M37 30.5H163" stroke=${tones.light} stroke-width="3.4" stroke-linecap="round" />`,
    svg`<rect x="29" y="36" width="142" height="74" rx="9" fill=${tone} data-part="screen" />`,
    svg`<path d="M92 36H124L84 110H52Z" fill=${sheen} opacity=".06" />`,
    when(parts.glow, () =>
      at(
        100,
        CY,
        motion('pulse', [
          svg`<ellipse rx="60" ry="34" fill=${C.mint} opacity=".28" />`,
          svg`<ellipse rx="44" ry="24" fill=${C.mint} opacity=".3" />`,
        ]),
      ),
    ),
    eye(parts, tones, LEFT, parts.gaze[0], parts.gaze[1], -1),
    eye(parts, tones, RIGHT, parts.gaze[2], parts.gaze[3], 1),
    svg`<circle cx="36" cy="122.5" r="4.4" fill=${INK} /><circle cx="36" cy="122.5" r="2.4" fill=${lamp} />`,
    pips(parts.step),
    face(100, 122.5, parts.mood, tones.ink, 0.74),
  ])
}

function placed(parts: EyesParts, tones: Tones, x: number, size: number): Art {
  return at(x, BASE, at(-100, -BASE, monitor(parts, tones)), 0, size)
}

function bottle(level: number, inverted: boolean, cap: boolean): Art {
  const full = 22 * clamp01(level)
  const top = inverted ? -30 : -8 - full
  return part('eye-drops', [
    svg`<path d="M-13-34H13V-6Q13 0 7 0H-7Q-13 0-13-6Z" fill=${BOTTLE} />`,
    svg`<path d="M6-34H13V-6Q13 0 7 0H1Q6 0 6-6Z" fill=${BOTTLE_SHADE} />`,
    svg`<path d="M-13-34Q-13-42-5-44L-3-53H3L5-44Q13-42 13-34Z" fill=${BOTTLE} />`,
    svg`<rect x="-8.5" y="-30" width="15" height="22" rx="3" fill=${GLASS} />`,
    when(
      full > 0,
      () =>
        svg`<rect x="-8.5" y=${round(top)} width="15" height=${round(full)} rx="3" fill=${C.water} data-part="drops-level" />`,
    ),
    when(cap, () => [
      svg`<path d="M-6-47H6L7-62Q7-64 5-64H-5Q-7-64-7-62Z" fill=${C.coral} />`,
      svg`<path d="M-1.5-63H2M-1.5-58H2M-1.5-53H2" stroke=${C.coralDark} stroke-width="2" stroke-linecap="round" />`,
    ]),
  ])
}

function deskBottle(parts: EyesParts): Art {
  if (parts.tipped) {
    return [
      shadow(156, 184, 26, 0.24),
      at(134, 174, bottle(0, false, true), 96, 0.8),
      part(
        'empty',
        svg`<path d="M166 164l4-5 3 4 5-6" fill="none" stroke=${C.cream} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity=".8" />`,
      ),
    ]
  }
  return [shadow(168, 184, 16, 0.26), at(170, 184, bottle(parts.level, false, true), 0, 0.72)]
}

const MUG_SPOTS = [
  [26, 184, 0, C.coral],
  [50, 180, -4, C.sky],
  [36, 158, 5, C.mint],
] as const

function mug(x: number, y: number, tilt: number, color: string, index: number): Art {
  return part(
    'mug',
    at(
      x,
      y,
      [
        svg`<path d="M10-17a6 6 0 0 1 0 12" fill="none" stroke=${shadeOf(color)} stroke-width="3.4" />`,
        svg`<path d="M-11-22H11V-4Q11 0 7 0H-7Q-11 0-11-4Z" fill=${color} />`,
        svg`<rect x="-11" y="-23.5" width="22" height="4.6" rx="2.3" fill=${shadeOf(color)} />`,
        svg`<rect x="-8" y="-22.5" width="16" height="2.4" rx="1.2" fill=${COFFEE} />`,
      ],
      tilt,
      0.92,
    ),
    index,
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
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${INK} stroke-width="9" stroke-linecap="round" stroke-linejoin="round" /><path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

const RAY_SPOTS = [
  [100, 17, 0],
  [52, 18, -16],
  [148, 18, 16],
  [14, 58, -90],
  [186, 58, 90],
  [26, 17, -38],
  [174, 17, 38],
  [14, 100, -90],
  [186, 100, 90],
  [76, 17, -6],
  [124, 17, 6],
] as const

function glare(parts: EyesParts): Art {
  if (parts.glare < 2) return []
  const bright = parts.glare >= 3
  return part('glare', [
    svg`<rect x="11" y="17" width="178" height="128" rx="27" fill="#fff6c9" opacity=${bright ? 0.2 : 0.1} />`,
    svg`<rect x="15" y="21" width="170" height="120" rx="22" fill="#fff6c9" opacity=${bright ? 0.32 : 0.16} />`,
    RAY_SPOTS.slice(0, parts.rays).map(([x, y, angle], i) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d="M0 0V9" stroke="#fff6c9" stroke-width="5" stroke-linecap="round" />`,
          (i % 3) + 1,
        ),
        angle,
      ),
    ),
  ])
}

function floaters(parts: EyesParts, spots: ReadonlyArray<readonly [number, number]>): Art {
  return spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i))
}

const FRESH_SPARKLES = [
  [24, 22, 1, 1],
  [178, 20, 1.2, 2],
  [36, 156, 1.15, 3],
  [150, 154, 0.75, 4],
  [100, 46, 0.5, 5],
] as const

function deskView(parts: EyesParts, tones: Tones): Art {
  return [
    when(parts.glow, () =>
      part(
        'calm-glow',
        at(
          100,
          81,
          motion('pulse', [
            svg`<rect x="-92" y="-67" width="184" height="134" rx="30" fill=${C.mint} opacity=".16" />`,
            svg`<rect x="-86" y="-61" width="172" height="122" rx="25" fill=${C.mint} opacity=".2" />`,
          ]),
        ),
      ),
    ),
    glare(parts),
    shadow(100, 182, 50),
    MUG_SPOTS.slice(0, parts.mugs).map(([x, y, tilt, color], i) => [
      shadow(x, y, 14, 0.2),
      mug(x, y, tilt, color, i),
    ]),
    monitor(parts, tones),
    deskBottle(parts),
    when(parts.look === 'closed', () => [
      zed(154, 27, 0.62, 1),
      zed(170, 39, 0.82, 2),
      zed(180, 23, 0.5, 3),
    ]),
    when(parts.glow, () => FRESH_SPARKLES.map(([x, y, s, d]) => sparkle(x, y, s, d))),
    floaters(parts, [
      [132, 150],
      [70, 150],
    ]),
  ]
}

const WINDOW_X = 148
const WINDOW_Y = 55
const PANE = 27

function tree(): Art {
  return at(
    -5,
    13,
    motion('sway', [
      svg`<rect x="-2" y="-16" width="4" height="17" rx="1.5" fill=${TRUNK} />`,
      svg`<circle cx="0" cy="-23" r="11" fill=${C.leafDark} />`,
      svg`<circle cx="-5" cy="-19" r="7" fill=${C.leaf} />`,
      svg`<circle cx="4.5" cy="-26" r="6.5" fill=${C.leaf} />`,
    ]),
  )
}

function view(): Art {
  const chord = (y: number): number => round(Math.sqrt(PANE * PANE - y * y))
  const back = chord(9)
  const front = chord(15)
  return part(
    'window',
    at(WINDOW_X, WINDOW_Y, [
      svg`<circle r="31.5" fill=${C.cream} />`,
      svg`<circle r="31.5" fill="none" stroke=${C.creamDark} stroke-width="2.6" />`,
      svg`<circle r=${PANE} fill=${SKY} />`,
      svg`<circle cx="13" cy="-13" r="6.5" fill=${C.sun} />`,
      at(
        -11,
        -15,
        motion('drift', svg`<rect x="-9" y="-3" width="18" height="6" rx="3" fill="#fff" />`),
      ),
      svg`<path d=${`M${-back} 9A${PANE} ${PANE} 0 0 0 ${back} 9Q0-1 ${-back} 9Z`} fill=${HILL} />`,
      tree(),
      svg`<path d=${`M${-front} 15A${PANE} ${PANE} 0 0 0 ${front} 15Q6 7 ${-front} 15Z`} fill=${HILL_DARK} />`,
      at(
        13,
        -1,
        motion(
          'bob',
          svg`<path d="M-4.5 0q2.2-3.5 4.5 0q2.3-3.5 4.5 0" fill="none" stroke=${INK} stroke-width="1.7" stroke-linecap="round" />`,
          2,
        ),
      ),
    ]),
  )
}

function rings(): Art {
  return part(
    'rings',
    at(WINDOW_X, WINDOW_Y, [
      motion(
        'pulse',
        svg`<circle r="36" fill="none" stroke=${C.cream} stroke-width="2.4" opacity=".42" />`,
      ),
      motion(
        'pulse',
        svg`<circle r="40.5" fill="none" stroke=${C.cream} stroke-width="2" opacity=".24" />`,
        3,
      ),
    ]),
  )
}

function sightDots(): Art {
  return part(
    'sight',
    svg`<path d="M92 74Q101 66 112 64" fill="none" stroke=${C.cream} stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7" opacity=".55" />`,
  )
}

function leaves(): Art {
  const spots = [
    [134, 112, 30, 1, 1],
    [178, 124, -40, 0.8, 3],
    [136, 154, 70, 0.9, 4],
  ] as const
  return part(
    'leaves',
    spots.map(([x, y, angle, size, delay]) =>
      at(
        x,
        y,
        motion(
          'drift',
          at(0, 0, svg`<path d="M0 0C-6-3-7-12 0-17C7-12 6-3 0 0Z" fill=${C.leaf} />`, angle, size),
          delay,
        ),
      ),
    ),
  )
}

function breakView(parts: EyesParts, tones: Tones): Art {
  return [
    rings(),
    view(),
    shadow(68, 182, 40),
    at(68, BASE, motion('sway', at(0, 0, at(-100, -BASE, monitor(parts, tones)), 0, 0.72))),
    sightDots(),
    leaves(),
    shadow(164, 184, 15, 0.26),
    at(164, 184, bottle(parts.level, false, true), 0, 0.74),
  ]
}

function dropsView(parts: EyesParts, tones: Tones): Art {
  const x = 100 + (RIGHT - 100) * 0.82
  return [
    at(100, BASE, at(-100, -BASE, glare({ ...parts, rays: 0 })), 0, 0.82),
    shadow(100, 182, 44),
    placed(parts, tones, 100, 0.82),
    part('cap', [
      shadow(160, 184, 11, 0.22),
      at(160, 183, [
        svg`<path d="M-7 0H7L8-15Q8-17 6-17H-6Q-8-17-8-15Z" fill=${C.coral} />`,
        svg`<path d="M-2-14H3M-2-9H3M-2-4H3" stroke=${C.coralDark} stroke-width="2" stroke-linecap="round" />`,
      ]),
    ]),
    at(
      x,
      14,
      motion('bob', [
        at(0, 0, bottle(parts.level, true, false), 180, 0.78),
        svg`<path d="M-17 14q-4 6 0 12M17 14q4 6 0 12" fill="none" stroke=${C.cream} stroke-width="2.6" stroke-linecap="round" opacity=".7" />`,
      ]),
    ),
    part('last-drop', at(x, 62, motion('throb', drop(0, 0, C.water, 1.05)))),
    floaters(parts, [
      [44, 40],
      [168, 96],
    ]),
  ]
}

export function eyes(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = eyesParts(scene)
  const views: Record<EyesView, (parts: EyesParts, tones: Tones) => Art> = {
    desk: deskView,
    break: breakView,
    drops: dropsView,
  }
  const art = views[parts.view](parts, tonesOf(scene))
  return frame('eyes', scene, options, art)
}
