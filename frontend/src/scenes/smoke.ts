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
  mix,
  motion,
  part,
  reached,
  round,
  shadeOf,
  shadow,
  sparkle,
  TILE,
  tileFor,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type SmokeView = 'ceiling' | 'swap' | 'test'
export type SmokeLamp = 'off' | 'ok' | 'low' | 'alarm' | 'busy'

export interface SmokeParts {
  view: SmokeView
  bars: number
  lamp: SmokeLamp
  blinkButton: boolean
  chirps: number
  sweat: number
  crust: number
  pillows: number
  feathers: boolean
  frantic: boolean
  asleep: boolean
  napper: boolean
  oldBattery: boolean
  sparkles: boolean
  mood: Mood
}

export const MAX_BARS = 4

const DRAIN_AT = [0.15, 0.4, 0.65] as const
const CHIRP_AT = [0.05, 0.3, 0.6] as const
const SWEAT_AT = [0.1, 0.4, 0.7] as const
const CRUST_AT = [0.25, 0.55, 0.8] as const
const PILLOW_AT = [0.6, 0.85] as const
const FEATHER_AT = 0.72
const FRANTIC_AT = 0.6
const SICK_AT = 0.85

const CALM = {
  blinkButton: false,
  chirps: 0,
  sweat: 0,
  crust: 0,
  pillows: 0,
  feathers: false,
  frantic: false,
  asleep: false,
  napper: false,
  oldBattery: false,
  sparkles: false,
} as const

export function smokeParts(scene: SceneView): SmokeParts {
  const { state } = scene
  if (state === 'clean') {
    return {
      ...CALM,
      view: 'ceiling',
      bars: MAX_BARS,
      lamp: 'ok',
      napper: true,
      sparkles: true,
      mood: 'happy',
    }
  }
  const stink = clamp01(scene.stink)
  const crust = reached(stink, CRUST_AT)
  const chirps = reached(stink, CHIRP_AT)
  const pillows = reached(stink, PILLOW_AT)
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...CALM,
      view: 'swap',
      bars: MAX_BARS,
      lamp: 'busy',
      crust,
      oldBattery: true,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      view: 'test',
      bars: MAX_BARS,
      lamp: 'ok',
      blinkButton: true,
      chirps: Math.min(2, chirps),
      crust,
      pillows: Math.min(1, pillows),
      oldBattery: true,
      mood: sick ? 'sick' : stink >= FRANTIC_AT ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const drained = reached(clamp01(scene.fill), DRAIN_AT)
  const bars = due ? 0 : resting ? MAX_BARS : MAX_BARS - drained
  let mood: Mood = resting ? 'sleepy' : bars <= 2 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (stink >= FRANTIC_AT) mood = 'worried'
  if (sick) mood = 'sick'
  let light: SmokeLamp = resting ? 'off' : bars <= 2 ? 'low' : 'ok'
  if (due) light = 'alarm'
  return {
    ...CALM,
    view: 'ceiling',
    bars,
    lamp: light,
    chirps,
    sweat: Math.max(reached(stink, SWEAT_AT), !due && !resting && bars === 1 ? 1 : 0),
    crust,
    pillows,
    feathers: stink >= FEATHER_AT,
    frantic: stink >= FRANTIC_AT,
    asleep: resting && chirps === 0,
    mood,
  }
}

const CY = 80
const RX = 56
const RY = 40
const DEPTH = 13
const COVER_X = 45
const COVER_Y = 30
const HATCH = RY - 3
const CENTER = 100
const SWAP_CENTER = 66
const LAMP_X = -22
const BUTTON_X = 22
const TOP_ROW = -17

const CASE = '#2e3557'
const SKIN = '#ffcfa8'
const SKIN_DARK = '#e8ab80'
const CRUST = '#dff5cf'
const CRUST_DARK = '#8fcfa2'
const RUST = '#a2683a'
const COVER_SHADE = C.creamDark
const FEATHER = '#f4f0ff'

function ellipseArc(rx: number, ry: number, from: number, to: number): string {
  const point = (deg: number): string => {
    const a = (deg * Math.PI) / 180
    return `${round(Math.cos(a) * rx)} ${round(Math.sin(a) * ry)}`
  }
  return `M${point(from)}A${rx} ${ry} 0 0 ${to > from ? 1 : 0} ${point(to)}`
}

function vents(): Art {
  return [37, 30].map((rx, i) => {
    const ry = rx * 0.68
    const spread = i ? 24 : 32
    const d = ellipseArc(rx, ry, -spread, spread) + ellipseArc(rx, ry, 180 + spread, 180 - spread)
    return svg`<path d=${d} fill="none" stroke=${COVER_SHADE} stroke-width="3.6" stroke-linecap="round" />`
  })
}

const LAMP_TONES: Record<SmokeLamp, string> = {
  off: C.metalDark,
  ok: C.check,
  low: C.sun,
  alarm: C.coral,
  busy: C.sky,
}

function lamp(kind: SmokeLamp): Art {
  const tone = LAMP_TONES[kind]
  const core = (r: number): Art => [
    svg`<circle r=${r} fill=${tone} />`,
    svg`<circle cx=${-r * 0.34} cy=${-r * 0.34} r=${r * 0.3} fill="#fff" opacity=".85" />`,
  ]
  const body: Art =
    kind === 'alarm'
      ? [
          motion('pulse', svg`<circle r="17" fill=${C.coral} opacity=".3" />`),
          motion('flicker', core(8.5)),
        ]
      : kind === 'off'
        ? core(4.8)
        : [
            svg`<circle r="11" fill=${tone} opacity=".3" />`,
            kind === 'low' || kind === 'busy' ? motion('flicker', core(6), 2) : core(6),
          ]
  return part('lamp', at(LAMP_X, TOP_ROW, body))
}

function testButton(blink: boolean): Art {
  const cap = svg`<circle r="4.8" fill=${blink ? C.sun : C.metalMid} />`
  return part(
    'test-button',
    at(BUTTON_X, TOP_ROW, [
      when(blink, () => [
        motion('pulse', svg`<circle r="16" fill=${C.sun} opacity=".3" />`),
        motion(
          'throb',
          svg`<circle r="23" fill="none" stroke=${C.sun} stroke-width="2.6" stroke-dasharray="3 6" stroke-linecap="round" opacity=".9" />`,
          2,
        ),
      ]),
      svg`<circle r="7" fill=${COVER_SHADE} />`,
      blink ? motion('flicker', cap) : cap,
    ]),
  )
}

function sideSlots(): Art {
  const lines = Array.from({ length: 11 }, (_, i) => {
    const a = ((208 + i * 12.4) * Math.PI) / 180
    const x = round(Math.cos(a) * RX)
    const y = Math.sin(a) * RY
    return `M${x} ${round(y - DEPTH * 0.3)}V${round(y - DEPTH * 0.76)}`
  })
  return svg`<path d=${lines.join('')} stroke=${C.metalDark} stroke-width="3" stroke-linecap="round" />`
}

function detector(parts: SmokeParts, accent: string): Art {
  const glint = tintOf(accent, 0.55)
  return part('detector', [
    when(parts.lamp === 'alarm' && !parts.frantic, () =>
      motion('pulse', svg`<ellipse rx=${RX + 13} ry=${RY + 13} fill=${C.coral} opacity=".26" />`),
    ),
    svg`<rect x="-34" y=${-RY - DEPTH - 6} width="68" height="16" rx="4" fill=${C.metalDark} />`,
    svg`<path d=${`M${-RX} ${-DEPTH}A${RX} ${RY} 0 0 1 ${RX} ${-DEPTH}V0A${RX} ${RY} 0 0 1 ${-RX} 0Z`} fill=${C.metal} />`,
    sideSlots(),
    svg`<ellipse rx=${RX} ry=${RY} fill=${accent} />`,
    svg`<path d=${ellipseArc(RX - 5, RY - 5, 196, 248)} fill="none" stroke=${glint} stroke-width="3.6" stroke-linecap="round" />`,
    svg`<ellipse rx=${COVER_X} ry=${COVER_Y} fill=${COVER_SHADE} />`,
    svg`<ellipse cy="-2.4" rx=${COVER_X} ry=${COVER_Y - 2.4} fill=${C.cream} />`,
    vents(),
    lamp(parts.lamp),
    testButton(parts.blinkButton),
    face(0, 3, parts.mood, C.fly, 1.08),
    svg`<rect x="-15" y=${HATCH - 4} width="30" height="7" rx="3.5" fill=${shadeOf(accent, 0.55)} />`,
  ])
}

function barColor(bars: number): string {
  if (bars >= 3) return C.mint
  return bars === 2 ? C.sun : C.coral
}

function terminals(crust: number): Art {
  return [
    svg`<rect x="-16" y="16" width="12" height="6" rx="1.6" fill=${C.metalMid} />`,
    svg`<rect x="4" y="16" width="12" height="6" rx="1.6" fill=${C.metalDark} />`,
    when(
      crust >= 1,
      () =>
        svg`<path d="M-20 22q-2-7 4-7q2-6 8-3q6-3 7 4q5 3 2 7Z" fill=${CRUST} data-part="crust" />`,
    ),
    when(
      crust >= 2,
      () =>
        svg`<path d="M2 22q-3-6 3-7q3-5 8-2q6-2 7 4q4 3 1 6Z" fill=${CRUST} data-part="crust" />`,
    ),
  ]
}

function battery(bars: number, crust: number, blinkEmpty = false): Art {
  const stain = crust / 3
  const body = mix(C.sun, '#b98a4a', stain)
  const dark = mix(C.sunDark, RUST, stain)
  const cells = Array.from({ length: MAX_BARS }, (_, i) => {
    const x = -22 + i * 11.4
    const lit = i < bars
    return svg`<rect x=${x} y="28" width="9.4" height="14" rx="2.6" fill=${lit ? barColor(bars) : '#46507a'} data-part="bar" data-lit=${lit ? 1 : 0} />`
  })
  return part('battery', [
    terminals(crust),
    svg`<rect x="-30" y="20" width="60" height="30" rx="6" fill=${body} />`,
    svg`<path d="M-30 44H30A6 6 0 0 1 24 50H-24A6 6 0 0 1 -30 44Z" fill=${dark} />`,
    svg`<rect x="-25" y="25" width="50" height="20" rx="4.5" fill=${CASE} />`,
    cells,
    when(blinkEmpty, () =>
      motion(
        'flicker',
        svg`<rect x="-22" y="28" width="9.4" height="14" rx="2.6" fill="none" stroke=${C.coral} stroke-width="2.2" />`,
      ),
    ),
    when(
      crust >= 2,
      () =>
        svg`<path d="M-29 26q5 1 5 7t3 7q-5 3-8-1Z" fill=${CRUST_DARK} data-part="crust" /><circle cx="24" cy="47" r="3" fill=${CRUST} data-part="crust" />`,
    ),
    when(
      crust >= 3,
      () =>
        svg`<path d="M12 50q0 7 3 9t3-3q0-3 1-6Z" fill=${CRUST_DARK} data-part="crust" /><path d="M-14 50q0 4 2 5t2-2v-3Z" fill=${CRUST} data-part="crust" />`,
    ),
  ])
}

function wireLine(d: string, color: string): Art {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width="3.2" stroke-linecap="round" />`
}

function wires(length: number): Art {
  const path = (x: number, sway: number): string =>
    `M${x * 0.8} 0C${x + sway} ${length * 0.4} ${x - sway} ${length * 0.7} ${x} ${length}`
  return [wireLine(path(-10, -3), C.coral), wireLine(path(10, 3), C.metalMid)]
}

const SWEAT_SPOTS = [
  [-37, 34, 0.75, 1],
  [37, 30, 0.85, 2],
  [-42, 52, 0.6, 3],
] as const

function dangling(parts: SmokeParts): Art {
  const body: Art = [
    wires(17),
    battery(parts.bars, parts.crust, parts.view === 'ceiling' && parts.bars === 0),
    SWEAT_SPOTS.slice(0, parts.sweat).map(([x, y, s, d]) =>
      at(x, y, motion('drip', drop(0, 0, C.water, s), d)),
    ),
  ]
  return at(0, HATCH, parts.frantic ? motion('slosh', body) : motion('sway', body))
}

function chirpArcs(count: number): Art {
  return part(
    'chirp',
    Array.from({ length: count }, (_, i) => {
      const rx = RX + 11 + i * 10
      const ry = RY + 11 + i * 10
      const spread = 30 - i * 3
      const color = count >= 3 ? mix(C.sun, C.coral, i / 2) : C.sun
      const d = ellipseArc(rx, ry, -spread, spread) + ellipseArc(rx, ry, 180 + spread, 180 - spread)
      return motion(
        'flicker',
        svg`<path d=${d} fill="none" stroke=${color} stroke-width="4.6" stroke-linecap="round" />`,
        i + 1,
      )
    }),
  )
}

const PILLOW = 'M-30-22Q-15-17 0-18T30-22Q26-10 27 0T30 22Q15 17 0 18T-30 22Q-26 10-27 0T-30-22Z'

function pillow(tone: string, dark: string, restful: boolean): Art {
  const eye = (x: number): Art =>
    restful
      ? svg`<path d=${`M${x - 5} -2q5 5 10 0`} fill="none" stroke=${C.fly} stroke-width="2.6" stroke-linecap="round" />`
      : [
          svg`<path d=${`M${x - 6} 4q6 5 12 0`} fill="none" stroke=${dark} stroke-width="2.8" stroke-linecap="round" />`,
          svg`<circle cx=${x} cy="-1" r="3.8" fill=${C.fly} />`,
          svg`<rect x=${x - 5.5} y="-6.5" width="11" height="5" fill=${tone} />`,
          svg`<path d=${`M${x - 5.5} -1.6h11`} stroke=${C.fly} stroke-width="2.4" stroke-linecap="round" />`,
        ]
  return [
    svg`<path d=${PILLOW} fill=${tone} />`,
    svg`<path d="M-22 14Q0 10 22 14" fill="none" stroke=${dark} stroke-width="2.6" stroke-linecap="round" />`,
    eye(-10),
    eye(10),
    restful
      ? svg`<path d="M-3 7q3 3 6 0" fill="none" stroke=${C.fly} stroke-width="2.4" stroke-linecap="round" />`
      : svg`<path d="M-5 11q2.5-2.5 5 0t5 0" fill="none" stroke=${C.fly} stroke-width="2.4" stroke-linecap="round" />`,
  ]
}

const SPEED = '#c9d2ee'

function thrownPillow(x: number, y: number, tilt: number, side: number, index: number): Art {
  return part(
    'pillow',
    [
      at(
        x,
        y,
        svg`<g transform=${`scale(${side} 1)`}><path d="M-20 22C-25 34-20 42-8 46" fill="none" stroke=${SPEED} stroke-width="4" stroke-linecap="round" stroke-dasharray="1 8" opacity=".75" /></g>`,
      ),
      at(x, y, motion('wobble', at(0, 0, pillow(C.lilac, C.lilacDark, false), tilt, 0.72), 1)),
    ],
    index,
  )
}

const FEATHER_SPOTS = [
  [26, 96, 25, 1],
  [172, 118, -30, 3],
  [150, 150, 60, 2],
] as const

function feathers(): Art {
  return part(
    'feathers',
    FEATHER_SPOTS.map(([x, y, r, d]) =>
      at(
        x,
        y,
        motion(
          'fall',
          at(
            0,
            0,
            [
              svg`<path d="M0-11C7-7 7 5 0 11C-7 5-7-7 0-11Z" fill=${FEATHER} />`,
              svg`<path d="M0-8V14" stroke=${C.lilacDark} stroke-width="1.6" stroke-linecap="round" />`,
            ],
            r,
          ),
          d,
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

const CEILING_DROP = 24
const CEILING_CAP = `M${TILE.slice(1, -1)
  .split('L')
  .filter((point) => Number(point.split(' ')[1]) <= CEILING_DROP)
  .join('L')}Z`

function ceiling(scene: SceneView, bleed: boolean): Art {
  const tile = tileFor(scene.state, scene.stink)
  return part(
    'ceiling',
    svg`<path d=${bleed ? 'M0 0H200V20.7H0Z' : CEILING_CAP} fill=${tile.floor} />`,
  )
}

function ladder(): Art {
  return part('ladder', [
    shadow(161, 184, 30),
    svg`<path d="M173 144L186.5 182" stroke=${C.metalDark} stroke-width="5.5" stroke-linecap="round" />`,
    svg`<path d="M144.5 170H176M147 156H173" stroke=${C.metalDark} stroke-width="5" stroke-linecap="round" />`,
    svg`<path d="M149 142L139 182M171 142L180 182" stroke=${C.metalMid} stroke-width="6.5" stroke-linecap="round" />`,
  ])
}

function ladderCap(): Art {
  return svg`<rect x="138" y="136" width="44" height="10" rx="4" fill=${C.coral} data-part="ladder-cap" /><rect x="138" y="142" width="44" height="4" rx="2" fill=${C.coralDark} />`
}

function hand(): Art {
  return part('hand', [
    svg`<path d="M160 108C160 124 176 130 208 130" fill="none" stroke=${C.sky} stroke-width="18" />`,
    at(160, 0, [
      svg`<rect x="-11" y="102" width="22" height="9" rx="4" fill=${C.skyDark} />`,
      svg`<rect x="-7" y="93" width="14" height="11" fill=${SKIN} />`,
    ]),
  ])
}

function fingers(): Art {
  return at(160, 0, [
    svg`<rect x="-14" y="84" width="28" height="16" rx="8" fill=${SKIN} />`,
    [-11.5, -4, 3.5, 11].map(
      (x) => svg`<rect x=${x - 3.4} y="74" width="6.8" height="18" rx="3.4" fill=${SKIN} />`,
    ),
    [-7.5, 0, 7.5].map(
      (x) =>
        svg`<path d=${`M${x} 83V90`} stroke=${SKIN_DARK} stroke-width="1.6" stroke-linecap="round" />`,
    ),
    svg`<rect x="-22" y="82" width="15" height="7.6" rx="3.8" transform="rotate(-24 -14 86)" fill=${SKIN} />`,
  ])
}

function freshBattery(): Art {
  return part('new-battery', [
    at(160, 40, at(0, 0, battery(MAX_BARS, 0), 0, 0.82)),
    sparkle(127, 46, 0.8, 1),
    sparkle(182, 44, 0.55, 3),
  ])
}

function plugRoute(): Art {
  return part(
    'route',
    svg`<path d="M130 84C118 124 106 138 84 138" fill="none" stroke=${SPEED} stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10" opacity=".75" />`,
  )
}

function swapScene(parts: SmokeParts, accent: string, top: Art): Art {
  return [
    top,
    at(SWAP_CENTER, CY, [detector(parts, accent), at(0, HATCH, motion('slosh', looseWires()))]),
    ladder(),
    ladderCap(),
    hand(),
    motion('bob', [freshBattery(), fingers()], 1),
    plugRoute(),
    shadow(70, 184, 24),
    part('old-battery', at(70, 178, at(0, -35, battery(0, parts.crust)), -8, 0.62)),
  ]
}

function looseWires(): Art {
  return [
    wires(20),
    svg`<rect x="-14.5" y="19" width="9" height="7" rx="2" fill=${C.metalDark} />`,
    svg`<rect x="5.5" y="19" width="9" height="7" rx="2" fill=${C.metalDark} />`,
  ]
}

function testScene(parts: SmokeParts, accent: string, top: Art): Art {
  return [
    top,
    ladder(),
    ladderCap(),
    chirpArcsAt(parts.chirps),
    at(CENTER, CY, [detector(parts, accent), dangling(parts)]),
    shadow(62, 184, 24),
    part('old-battery', at(62, 178, at(0, -35, battery(0, parts.crust)), -8, 0.62)),
    when(parts.pillows >= 1, () => thrownPillow(38, 136, -14, 1, 0)),
  ]
}

function chirpArcsAt(count: number): Art {
  return at(CENTER, CY, chirpArcs(count))
}

const CLEAN_SPARKLES = [
  [28, 74, 1.1, 1],
  [172, 62, 1.25, 2],
  [160, 128, 0.85, 3],
  [22, 118, 0.7, 4],
  [186, 104, 0.55, 5],
] as const

function ceilingScene(parts: SmokeParts, accent: string, top: Art): Art {
  const unit: Art = [detector(parts, accent), dangling(parts)]
  return [
    top,
    shadow(100, 184, 44, 0.18),
    chirpArcsAt(parts.chirps),
    at(CENTER, CY, parts.frantic ? motion('rumble', unit) : unit),
    when(parts.pillows >= 1, () => thrownPillow(36, 134, -14, 1, 0)),
    when(parts.pillows >= 2, () => thrownPillow(164, 138, 16, -1, 1)),
    when(parts.feathers, feathers),
    when(parts.napper, () => [
      part('pillow', [
        shadow(46, 183, 28, 0.3),
        at(46, 164, pillow(C.lilac, C.lilacDark, true), 0, 0.72),
      ]),
      zed(46, 134, 0.46, 1),
      zed(58, 123, 0.64, 2),
    ]),
    when(parts.asleep, () => [zed(166, 76, 0.62, 1), zed(178, 58, 0.86, 2), zed(170, 38, 0.5, 3)]),
    when(parts.sparkles, () => CLEAN_SPARKLES.map(([x, y, s, d]) => sparkle(x, y, s, d))),
  ]
}

export function smoke(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = smokeParts(scene)
  const accent = accentOf(scene, C.sky)
  const views: Record<SmokeView, (parts: SmokeParts, accent: string, top: Art) => Art> = {
    ceiling: ceilingScene,
    swap: swapScene,
    test: testScene,
  }
  return frame(
    'smoke',
    scene,
    options,
    views[parts.view](parts, accent, ceiling(scene, options?.bleed === true)),
  )
}
