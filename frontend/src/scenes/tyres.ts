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

export type TyresLamp = 'off' | 'ok' | 'alarm'

export interface TyresParts {
  sag: number
  step: number
  needle: number
  lamp: TyresLamp
  hose: boolean
  capped: boolean
  capBubble: boolean
  airBubble: boolean
  glossy: boolean
  asleep: boolean
  sweat: boolean
  nail: boolean
  hiss: number
  weeds: number
  rust: boolean
  snail: boolean
  flies: number
  mood: Mood
}

export const MAX_STEP = 4

const SAGS = [0, 0.14, 0.3, 0.48, 0.68] as const
const NEEDLE_FLAT = -104
const NEEDLE_FULL = 62
const NEEDLE_PROUD = 84

const NAIL_AT = 0.1
const HISS_AT = [0.25, 0.6] as const
const WEEDS_AT = [0.4, 0.62, 0.82] as const
const RUST_AT = 0.55
const SNAIL_AT = 0.72
const FLIES_AT = [0.9] as const
const SICK_AT = 0.6

const CALM = {
  sag: 0,
  step: 0,
  needle: NEEDLE_FULL,
  lamp: 'ok',
  hose: false,
  capped: true,
  capBubble: false,
  airBubble: false,
  glossy: false,
  asleep: false,
  sweat: false,
  nail: false,
  hiss: 0,
  weeds: 0,
  rust: false,
  snail: false,
  flies: 0,
} as const

function needleFor(sag: number): number {
  return NEEDLE_FULL + (NEEDLE_FLAT - NEEDLE_FULL) * sag
}

export function tyresParts(scene: SceneView): TyresParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...CALM, needle: NEEDLE_PROUD, glossy: true, mood: 'happy' }
  }
  const overgrowth = reached(stink, WEEDS_AT)
  const rust = stink >= RUST_AT
  const crawler = stink >= SNAIL_AT
  const flies = reached(stink, FLIES_AT)
  const hiss = reached(stink, HISS_AT)
  const sick = stink >= SICK_AT
  if (state === 'running') {
    const sag = 0.6 * (1 - clamp01(scene.progress))
    return {
      ...CALM,
      sag,
      needle: needleFor(sag),
      hose: true,
      capped: false,
      weeds: Math.min(1, overgrowth),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    const sag = hiss > 0 ? 0.08 * hiss : 0
    return {
      ...CALM,
      sag,
      needle: needleFor(sag),
      capped: false,
      capBubble: true,
      hiss,
      weeds: overgrowth,
      rust,
      snail: crawler,
      flies,
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const step = due ? MAX_STEP : resting ? 0 : Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const sag = due ? 1 : (SAGS[step] ?? 1)
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...CALM,
    sag,
    step,
    needle: needleFor(sag),
    lamp: resting ? 'off' : due || step >= 3 ? 'alarm' : 'ok',
    airBubble: due,
    asleep: resting,
    sweat: !due && step >= 3,
    nail: stink >= NAIL_AT,
    hiss,
    weeds: overgrowth,
    rust,
    snail: crawler,
    flies,
    mood,
  }
}

const CX = 78
const GROUND = 182
const R = 62
const RIM = 38
const DROP = 18
const SOFT = 3
const VALVE_ANGLE = -58
const NAIL_ANGLE = 222

const TREAD = '#14172a'
const SIDE = '#3b4060'
const SIDE_LIGHT = '#565c82'
const BEAD = '#22263f'
const HOSE = '#ef6a5c'
const HOSE_DARK = '#c94f44'
const AIR = '#eaf4ff'
const RUST = '#a4562f'
const RUST_DARK = '#7f3f22'
const SNAIL_BODY = '#f2dcb0'
const SNAIL_SHELL = '#c98a5a'
const SNAIL_SWIRL = '#8f5a34'
const DANDELION = '#ffd65c'

function radians(deg: number): number {
  return (deg * Math.PI) / 180
}

function hubY(sag: number): number {
  return GROUND + 2 - R + DROP * sag
}

function outline(radius: number, sag: number): string {
  const inset = R - radius
  const floor = R - DROP * sag - inset * (1 - 0.72 * sag)
  const points: string[] = []
  for (let deg = 0; deg < 360; deg += 4) {
    const a = radians(deg)
    const sin = Math.sin(a)
    const swell = (radius / R) ** 4
    const bulge = 1 + (0.05 + 0.13 * Math.exp(-(((sin - 0.72) / 0.3) ** 2))) * sag * swell
    const y = radius * sin
    const over = (y - floor) / SOFT
    const flat = y - SOFT * Math.log1p(Math.exp(over))
    points.push(`${round(radius * Math.cos(a) * bulge)} ${round(flat)}`)
  }
  return `M${points.join('L')}Z`
}

function arc(radius: number, from: number, to: number): string {
  const a = radians(from)
  const b = radians(to)
  const large = Math.abs(to - from) > 180 ? 1 : 0
  const sweep = to > from ? 1 : 0
  return `M${round(radius * Math.cos(a))} ${round(radius * Math.sin(a))}A${radius} ${radius} 0 ${large} ${sweep} ${round(radius * Math.cos(b))} ${round(radius * Math.sin(b))}`
}

function polar(radius: number, deg: number): [number, number] {
  const a = radians(deg)
  return [radius * Math.cos(a), radius * Math.sin(a)]
}

function tyreBody(parts: TyresParts): Art {
  const { sag, glossy } = parts
  const side = glossy ? mix(SIDE, '#4a5078', 0.7) : mix(SIDE, C.musty, parts.weeds * 0.08)
  return part('tyre', [
    svg`<path d=${outline(R, sag)} fill=${TREAD} stroke=${TREAD} stroke-width="7" stroke-dasharray="11 6.2" />`,
    svg`<path d=${outline(R - 6, sag)} fill=${side} />`,
    svg`<path d=${outline(RIM + 8, sag)} fill=${BEAD} />`,
    glossy
      ? part('gloss', [
          svg`<path d=${arc(R - 11, 190, 262)} fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".62" />`,
          svg`<path d=${arc(R - 11, 275, 290)} fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".62" />`,
          svg`<path d=${arc(R - 11, 28, 62)} fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".3" />`,
        ])
      : svg`<path d=${arc(R - 11, 200, 262)} fill="none" stroke=${SIDE_LIGHT} stroke-width="4.5" stroke-linecap="round" />`,
    when(sag >= 0.45, () => {
      const y = R - DROP * sag
      const fold = Math.min(1, (sag - 0.3) / 0.7)
      return part(
        'creases',
        [-1, 1].map(
          (dir) =>
            svg`<path d=${`M${round(dir * 46)} ${round(y - 20 * fold)}q${round(dir * 7)} ${round(6 * fold)} ${round(dir * 5)} ${round(13 * fold)}`} fill="none" stroke=${BEAD} stroke-width="3.4" stroke-linecap="round" />`,
        ),
      )
    }),
  ])
}

const SPOKES = [0, 72, 144, 216, 288] as const
const RUST_SPOTS = [
  [-54, 34, 4.2],
  [34, 33, 3.2],
  [162, 34, 3.8],
  [248, 33.5, 2.8],
] as const

function rim(parts: TyresParts, accent: string): Art {
  const deep = mix(accent, INK, 0.74)
  const dark = shadeOf(accent)
  const light = tintOf(accent, 0.5)
  const hub = tintOf(accent, 0.72)
  const spoke = isDarkColor(accent) ? tintOf(accent, 0.34) : accent
  return part('rim', [
    svg`<circle r=${RIM} fill=${spoke} />`,
    svg`<circle r="33" fill=${accent} />`,
    svg`<circle r="30.5" fill=${deep} />`,
    SPOKES.map((deg) => {
      const [x, y] = polar(32, deg - 90)
      return svg`<path d=${`M0 0L${round(x)} ${round(y)}`} stroke=${spoke} stroke-width="11" stroke-linecap="round" />`
    }),
    svg`<path d=${arc(34.5, 195, 285)} fill="none" stroke=${light} stroke-width="3.6" stroke-linecap="round" />`,
    when(
      parts.glossy,
      () =>
        svg`<path d=${arc(34.5, 20, 70)} fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".75" />`,
    ),
    svg`<circle r="23.5" fill=${dark} />`,
    svg`<circle r="21.5" fill=${hub} />`,
    when(parts.rust, () =>
      part(
        'rust',
        RUST_SPOTS.map(([deg, radius, size]) => {
          const [x, y] = polar(radius, deg)
          return svg`<circle cx=${round(x)} cy=${round(y)} r=${size} fill=${RUST} /><circle cx=${round(x + 1)} cy=${round(y + 1)} r=${round(size * 0.45)} fill=${RUST_DARK} />`
        }),
      ),
    ),
  ])
}

function valve(capped: boolean): Art {
  const [x, y] = polar(RIM - 3, VALVE_ANGLE)
  return part(
    'valve',
    at(
      x,
      y,
      [
        svg`<rect x="-3.5" y="-17" width="7" height="19" rx="2" fill=${C.metalMid} />`,
        svg`<rect x="-3.5" y="-17" width="2.4" height="19" rx="1.2" fill=${C.metal} />`,
        capped
          ? svg`<rect x="-5.5" y="-24" width="11" height="10" rx="2.6" fill=${C.coral} /><path d="M-2-22v6M2-22v6" stroke=${C.coralDark} stroke-width="1.4" stroke-linecap="round" />`
          : svg`<path d="M-3.5-13h7M-3.5-9.5h7" stroke=${C.metalDark} stroke-width="1.5" />`,
      ],
      VALVE_ANGLE + 90,
    ),
  )
}

function nail(): Art {
  const [x, y] = polar(R - 4, NAIL_ANGLE)
  return part(
    'nail',
    at(
      x,
      y,
      [
        svg`<path d="M-2.6-20H2.6L1.2 4H-1.2Z" fill=${C.metalMid} />`,
        svg`<path d="M.6-20H2.6L1.2 4H.2Z" fill=${C.metalDark} />`,
        svg`<rect x="-7.5" y="-25" width="15" height="6" rx="2.6" fill=${C.metal} />`,
        svg`<rect x="-7.5" y="-21.4" width="15" height="2.4" rx="1.2" fill=${C.metalDark} />`,
      ],
      NAIL_ANGLE + 90,
    ),
  )
}

const WISP = 'M0 0c-7-5 7-9 0-14c-7-5 7-9 0-14'

function wisps(spots: ReadonlyArray<readonly [number, number, number]>, count: number): Art {
  return spots
    .slice(0, count)
    .map(([x, y, size], i) =>
      part(
        'hiss',
        at(
          x,
          y,
          motion(
            'waft',
            svg`<path d=${WISP} fill="none" stroke=${AIR} stroke-width="4" stroke-linecap="round" opacity=".85" />`,
            i + 1,
          ),
          0,
          size,
        ),
        i,
      ),
    )
}

function wheel(parts: TyresParts, accent: string): Art {
  return at(CX, hubY(parts.sag), [
    tyreBody(parts),
    rim(parts, accent),
    valve(parts.capped),
    when(parts.nail, nail),
    face(0, -1, parts.mood, INK, 0.9),
    when(parts.sweat, () => at(-31, -16, motion('drip', drop(0, 0, C.water, 0.8), 1))),
  ])
}

function dialZone(from: number, to: number, color: string): Art {
  return svg`<path d=${arc(14, from, to)} fill="none" stroke=${color} stroke-width="5" />`
}

function dial(parts: TyresParts): Art {
  const alarm = parts.lamp === 'alarm'
  const wobble = parts.hose
  const hand = svg`<path d="M-2.6 0L0-15L2.6 0Z" fill=${INK} />`
  const pointer = wobble ? motion('wobble', hand) : hand
  const body: Art = [
    svg`<circle r="23" fill=${C.metalMid} />`,
    svg`<circle r="19.5" fill=${C.cream} />`,
    dialZone(155, 210, C.coral),
    dialZone(210, 280, C.sun),
    dialZone(280, 385, parts.glossy ? C.check : C.mint),
    at(0, 0, pointer, parts.needle),
    svg`<circle r="4" fill=${INK} /><circle r="1.5" fill=${C.cream} />`,
  ]
  return part(
    'gauge',
    at(165, 60, [
      when(alarm || parts.glossy, () =>
        motion('pulse', svg`<circle r="25.5" fill=${alarm ? C.coral : C.check} opacity=".32" />`),
      ),
      body,
    ]),
  )
}

function coil(): Art {
  return part('coil', [
    [0, 4, 8].map(
      (dx) =>
        svg`<ellipse cx=${160 + dx + 3} cy="138" rx="9" ry="13" fill="none" stroke=${dx === 8 ? HOSE : HOSE_DARK} stroke-width="4.2" />`,
    ),
    svg`<path d="M179 148q5 10 1 18" fill="none" stroke=${HOSE} stroke-width="4.2" stroke-linecap="round" />`,
    svg`<rect x="175.5" y="165" width="9" height="11" rx="2.5" fill=${C.metalDark} />`,
  ])
}

function tower(parts: TyresParts): Art {
  const lamp = parts.lamp === 'off' ? C.metalDark : parts.lamp === 'alarm' ? C.coral : C.mint
  const bodyTone = mix(C.metal, C.musty, parts.weeds * 0.1)
  return part('pump', [
    shadow(168, 184, 22, 0.26),
    svg`<rect x="160" y="78" width="12" height="16" fill=${C.metalDark} />`,
    svg`<rect x="154" y="90" width="28" height="90" rx="8" fill=${bodyTone} />`,
    svg`<path d="M173 90H174Q182 90 182 98V172Q182 180 174 180H173Z" fill=${C.metalMid} />`,
    svg`<rect x="148" y="176" width="40" height="8" rx="4" fill=${C.metalDark} />`,
    svg`<rect x="160" y="100" width="16" height="4.5" rx="2.25" fill=${C.metalMid} />`,
    parts.lamp === 'alarm'
      ? at(168, 114, motion('flicker', svg`<circle r="4.5" fill=${lamp} />`))
      : svg`<circle cx="168" cy="114" r="4.5" fill=${lamp} />`,
    when(!parts.hose, coil),
  ])
}

function hose(parts: TyresParts): Art {
  const hub = hubY(parts.sag)
  const [vx, vy] = polar(RIM + 13, VALVE_ANGLE)
  const [nx, ny] = polar(RIM + 33, VALVE_ANGLE)
  const [cx, cy] = polar(RIM + 60, VALVE_ANGLE)
  const line = `M155 130C132 134 ${round(CX + cx)} ${round(hub + cy)} ${round(CX + nx)} ${round(hub + ny)}`
  return part('hose', [
    svg`<path d=${line} fill="none" stroke=${HOSE_DARK} stroke-width="8" stroke-linecap="round" />`,
    svg`<path d=${line} fill="none" stroke=${HOSE} stroke-width="5" stroke-linecap="round" />`,
    at(
      CX + vx,
      hub + vy,
      [
        svg`<rect x="-6" y="-23" width="12" height="25" rx="3" fill=${C.metalMid} />`,
        svg`<rect x="-6" y="-23" width="4.4" height="25" rx="2.2" fill=${C.metal} />`,
        svg`<rect x="-8.5" y="-8" width="17" height="5.5" rx="2.7" fill=${C.metalDark} />`,
      ],
      VALVE_ANGLE + 90,
    ),
    svg`<rect x="150" y="124" width="9" height="12" rx="2.5" fill=${C.metalDark} />`,
  ])
}

function chevron(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'rise',
      svg`<path d="M-10 5L0-5L10 5" fill="none" stroke=${AIR} stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`,
      delay,
    ),
    0,
    size,
  )
}

function puff(x: number, y: number, r: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'rise',
      [
        svg`<circle r=${r} fill=${AIR} />`,
        svg`<circle cx=${round(r * 0.9)} cy=${round(-r * 0.5)} r=${round(r * 0.62)} fill=${AIR} />`,
        svg`<circle cx=${round(-r * 0.3)} cy=${round(-r * 0.3)} r=${round(r * 0.3)} fill="#fff" />`,
      ],
      delay,
    ),
  )
}

function puffs(parts: TyresParts): Art {
  const hub = hubY(parts.sag)
  return part('puffs', [
    puff(90, hub - 76, 8, 1),
    puff(70, hub - 88, 5.5, 3),
    puff(106, hub - 94, 4.5, 2),
    puff(52, hub - 76, 4, 4),
    chevron(24, 92, 1, 1),
    chevron(24, 68, 0.85, 3),
    chevron(24, 48, 0.7, 5),
  ])
}

function bubbleShell(x: number, y: number, tailX: number, tailY: number, art: Art): Art {
  const dx = tailX - x
  const dy = tailY - y
  const nearX = round(x + dx * 0.62)
  const nearY = round(y + dy * 0.62)
  const midX = round(x + dx * 0.84)
  const midY = round(y + dy * 0.84)
  return [
    svg`<circle cx=${nearX} cy=${nearY} r="4.6" fill=${C.cream} />`,
    svg`<circle cx=${midX} cy=${midY} r="3" fill=${C.cream} />`,
    at(x, y, art),
  ]
}

function airPlea(parts: TyresParts): Art {
  const hub = hubY(parts.sag)
  return part(
    'plea',
    bubbleShell(
      110,
      40,
      CX + 16,
      hub - 62,
      motion('pulse', [
        svg`<circle r="25" fill=${C.cream} />`,
        svg`<path d="M0 14V-11" stroke=${C.skyDark} stroke-width="8" stroke-linecap="round" />`,
        svg`<path d="M-11-3L0-14L11-3" fill="none" stroke=${C.skyDark} stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />`,
      ]),
    ),
  )
}

function capPlea(parts: TyresParts): Art {
  const hub = hubY(parts.sag)
  const [vx, vy] = polar(RIM + 14, VALVE_ANGLE)
  return part(
    'valve-cap',
    bubbleShell(114, 37, CX + vx + 2, hub + vy - 4, [
      svg`<circle r="23" fill=${C.cream} />`,
      svg`<rect x="-4.5" y="4" width="9" height="15" rx="1.5" fill=${C.metalDark} />`,
      svg`<path d="M-4.5 9h9M-4.5 13h9" stroke=${C.metal} stroke-width="1.6" />`,
      motion('bob', [
        svg`<rect x="-8.5" y="-18" width="17" height="13" rx="3.5" fill=${C.coral} />`,
        svg`<path d="M-3.5-15v7M0-15v7M3.5-15v7" stroke=${C.coralDark} stroke-width="1.5" stroke-linecap="round" />`,
      ]),
      svg`<path d="M-15-2C-13 5 11 6 15-1M10.5-2L15.5-1.5L16.5 4" fill="none" stroke=${C.skyDark} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
    ]),
  )
}

const BLADES = [
  'M0 0C-2-10-7-18-14-22C-7-22-1-16 3 0Z',
  'M-3 0C-3-14-1-26-4-36C2-28 5-14 4 0Z',
  'M0 0C3-12 8-20 16-24C10-16 6-8 6 0Z',
] as const

function tuft(x: number, size: number, tone: number, delay: number): Art {
  const color = mix(C.leaf, C.mustyDark, tone)
  const dark = mix(C.leafDark, C.mustyDark, tone)
  return at(
    x,
    186,
    motion(
      'sway',
      [
        svg`<path d=${BLADES[0]} fill=${dark} />`,
        svg`<path d=${BLADES[2]} fill=${dark} />`,
        svg`<path d=${BLADES[1]} fill=${color} />`,
      ],
      delay,
    ),
    0,
    size,
  )
}

function weeds(level: number): Art {
  if (level === 0) return []
  return part('weeds', [
    tuft(26, 0.95, 0.1, 1),
    tuft(140, 0.85, 0.2, 2),
    when(level >= 2, () => [tuft(46, 1.25, 0.25, 3), tuft(112, 1.15, 0.1, 4)]),
    when(level >= 3, () => [
      part('vine', [
        svg`<path d="M28 186C17 166 15 146 22 128" fill="none" stroke=${C.leafDark} stroke-width="4" stroke-linecap="round" />`,
        at(19, 156, svg`<path d="M0 0C-9-5-13-14-11-20C-3-18 3-10 0 0Z" fill=${C.leaf} />`),
        at(22, 128, svg`<path d="M0 0C9-5 14-13 12-20C3-18-3-10 0 0Z" fill=${C.leaf} />`),
      ]),
      at(136, 186, [
        svg`<path d="M0 0C1-14-1-24 1-34" fill="none" stroke=${C.leafDark} stroke-width="3.4" stroke-linecap="round" />`,
        at(1, -36, [
          [0, 60, 120, 180, 240, 300].map(
            (deg) =>
              svg`<ellipse cy="-7" rx="4.2" ry="6.4" transform=${`rotate(${deg})`} fill=${DANDELION} />`,
          ),
          svg`<circle r="4.6" fill=${C.sunDark} />`,
        ]),
      ]),
      tuft(66, 0.8, 0.3, 5),
    ]),
  ])
}

function snail(parts: TyresParts): Art {
  const top = hubY(parts.sag) - R - 3
  return part(
    'snail',
    at(66, top, [
      svg`<path d="M-17 0H17Q24 0 24-7V-16" fill="none" stroke=${SNAIL_BODY} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`,
      svg`<path d="M21-15L17-25M26-15L29-25" stroke=${SNAIL_BODY} stroke-width="2.6" stroke-linecap="round" />`,
      svg`<circle cx="16.5" cy="-26" r="2.4" fill=${INK} /><circle cx="29.5" cy="-26" r="2.4" fill=${INK} />`,
      svg`<circle cy="-13" r="14" fill=${SNAIL_SHELL} />`,
      svg`<path d="M9-13A9 9 0 1 0 0-4A6.2 6.2 0 1 0-5.5-13A3 3 0 0 0 1-12" fill="none" stroke=${SNAIL_SWIRL} stroke-width="2.8" stroke-linecap="round" />`,
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

function rosette(): Art {
  const petals = Array.from({ length: 10 }, (_, i) => i * 36)
  return part(
    'rosette',
    at(
      30,
      62,
      motion('sway', [
        svg`<path d="M-9 8L-14 34L-5 28L0 36L3 10Z" fill=${C.coralDark} />`,
        svg`<path d="M9 8L14 34L5 28L0 36L-3 10Z" fill=${C.coral} />`,
        petals.map(
          (deg) => svg`<circle cy="-13" r="6" transform=${`rotate(${deg})`} fill=${C.sun} />`,
        ),
        svg`<circle r="13" fill=${C.sunDark} />`,
        svg`<circle r="10" fill=${C.spark} />`,
        svg`<path d="M-5 0L-1.5 4L5.5-4" fill="none" stroke=${C.sunDark} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
      ]),
    ),
  )
}

const HISS_DUE = [
  [17, 66, 1],
  [38, 54, 0.8],
] as const

const HISS_WAIT = [
  [84, 46, 0.8],
  [66, 44, 0.65],
] as const

const CLEAN_SPARKLES = [
  [126, 34, 1.3, 1],
  [88, 26, 0.85, 2],
  [146, 110, 0.8, 3],
  [19, 126, 0.7, 4],
] as const

export function tyres(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = tyresParts(scene)
  const accent = accentOf(scene, C.sun)
  const body = wheel(parts, accent)
  const contact = 54 + 12 * parts.sag
  const art: Art = [
    tower(parts),
    dial(parts),
    shadow(CX, 184, contact),
    parts.hose ? at(CX, GROUND, motion('throb', at(-CX, -GROUND, body))) : body,
    when(parts.hose, () => [hose(parts), puffs(parts)]),
    when(parts.snail, () => snail(parts)),
    weeds(parts.weeds),
    wisps(parts.capBubble ? HISS_WAIT : HISS_DUE, parts.hiss),
    when(parts.airBubble, () => airPlea(parts)),
    when(parts.capBubble, () => capPlea(parts)),
    when(parts.asleep, () => [zed(118, 50, 0.7, 1), zed(100, 32, 1, 2), zed(124, 20, 0.6, 3)]),
    when(parts.glossy, () => [
      rosette(),
      CLEAN_SPARKLES.map(([x, y, size, delay]) => sparkle(x, y, size, delay)),
    ]),
    when(parts.flies > 0, () => [fly(56, 26, 0), fly(136, 100, 1)]),
  ]
  return frame('tyres', scene, options, art)
}
