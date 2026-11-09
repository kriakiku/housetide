import { svg } from 'lit'
import type { SVGTemplateResult, TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  COLORS as C,
  clamp01,
  drop,
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
import type { Art, SceneOptions } from './common.ts'

export type OwlView = 'asleep' | 'watching' | 'due' | 'supervising' | 'waiting' | 'bliss'
export type OwlPupils = 'soft' | 'round' | 'dots' | 'mismatched' | 'half-spiral' | 'spiral'

export interface OwlParts {
  sly: boolean
  view: OwlView
  glow: number
  gaze: number
  lid: number
  rage: number
  twitch: boolean
  veins: number
  browAngle: number
  pupils: OwlPupils
  ruffle: number
  grin: number
  knife: number
  knifeLowered: boolean
  sweat: number
  sun: number
  clock: boolean
  alarm: boolean
  clipboard: boolean
  tapping: boolean
  heart: boolean
}

export const MAX_GLOW = 5
export const MAX_RAGE = 7
export const MAX_KNIFE = 5

const GLOW_AT = [0.2, 0.4, 0.6, 0.8] as const
const RAGE_AT = [0.12, 0.25, 0.4, 0.55, 0.7, 0.85, 0.98] as const
const LIDS = [0.5, 0.42, 0.32, 0.2, 0.08, 0] as const
const BROWS = [-6, -3, 3, 11, 16, 20, 22, 22] as const
const PUPILS: readonly OwlPupils[] = [
  'round',
  'round',
  'round',
  'dots',
  'mismatched',
  'half-spiral',
  'spiral',
  'spiral',
]
const KNIFE_BY_RAGE = [0, 0, 1, 2, 3, 4, 5, 5] as const
const SWEAT_BY_RAGE = [0, 0, 0, 0, 0, 1, 2, 5] as const
const RUFFLE_BY_RAGE = [0, 0, 0, 0, 1, 2, 3, 3] as const

const CALM = {
  sly: false,
  glow: 0,
  gaze: 0,
  lid: 0.3,
  rage: 0,
  twitch: false,
  veins: 0,
  browAngle: 0,
  pupils: 'soft',
  ruffle: 0,
  grin: 0,
  knife: 0,
  knifeLowered: false,
  sweat: 0,
  sun: -1,
  clock: false,
  alarm: false,
  clipboard: false,
  tapping: false,
  heart: false,
} as const

export function owlParts(scene: SceneView): OwlParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = clamp01(scene.stink)
  if (state === 'resting') return { ...CALM, view: 'asleep', lid: 1 }
  if (state === 'clean') return { ...CALM, view: 'bliss', lid: 1, heart: true }
  if (state === 'running') {
    return { ...CALM, view: 'supervising', gaze: 2, lid: 0.3, clipboard: true }
  }
  if (state === 'waiting') {
    const irritation = reached(stink, [0.4, 0.75])
    return {
      ...CALM,
      view: 'waiting',
      gaze: 3,
      lid: 0.34,
      glow: 1 + irritation,
      twitch: irritation >= 1,
      veins: irritation >= 2 ? 1 : 0,
      ruffle: irritation >= 2 ? 1 : 0,
      knife: 3,
      knifeLowered: true,
      tapping: true,
    }
  }
  if (state === 'accumulating') {
    const glow = reached(fill, GLOW_AT)
    return { ...CALM, view: 'watching', glow, gaze: glow, lid: LIDS[glow] ?? 0, sun: glow }
  }
  const rage = reached(stink, RAGE_AT)
  return {
    ...CALM,
    view: 'due',
    glow: MAX_GLOW,
    gaze: 4,
    lid: 0,
    rage,
    sly: rage >= 6,
    twitch: rage >= 1,
    veins: reached(rage, [2, 5]),
    browAngle: BROWS[rage] ?? 0,
    pupils: PUPILS[rage] ?? 'round',
    ruffle: RUFFLE_BY_RAGE[rage] ?? 0,
    grin: rage,
    knife: KNIFE_BY_RAGE[rage] ?? 0,
    sweat: SWEAT_BY_RAGE[rage] ?? 0,
    clock: true,
    alarm: rage >= 3,
  }
}

const HALO = '#ffe08f'
const WING_SIZE = 0.84
const EYE_RX = 10.5
const EYE_RY = 13
const LEFT_EYE = 85
const RIGHT_EYE = 115
const EYE_Y = 75

const BODY =
  'M100 44C134 44 152 68 152 108C152 150 130 172 100 172C70 172 48 150 48 108C48 68 66 44 100 44Z'
const BODY_SHADE =
  'M100 172C130 172 152 150 152 108C152 68 134 44 100 44C122 50 143 72 143 108C143 146 124 168 100 172Z'
const MASK =
  'M100 63C92 50 67 52 67 73C67 91 90 98 100 107C110 98 133 91 133 73C133 52 108 50 100 63Z'
const TUFT_MAIN = 'M72 62C69 52 66 44 64 32C74 37 85 44 92 52Z'
const TUFT_SIDE = 'M62 74C58 66 55 58 52 50C60 52 69 56 76 62Z'
const TUFT_VANE = 'M68 40C71 45 74 50 77 56'
const WING = 'M-12-5C-16 14-13 34-2 47C9 41 15 18 12-5C8-13-8-13-12-5Z'
const FINGER = 'M-5 40C-4 52-3 60 0 67C4 60 6 52 7 38Z'
const BEAK = 'M-6.5-5Q0-9 6.5-5Q4.5 4 0 9.5Q-4.5 4-6.5-5Z'
const HEART = 'M0 7C-11-2-9-11-3.5-10C-1-9.5 0-7.5 0-6.5C0-7.5 1-9.5 3.5-10C9-11 11-2 0 7Z'
const VEIN = 'M-7-2.5Q-2.5-2.5-2.5-7M2.5-7Q2.5-2.5 7-2.5M7 2.5Q2.5 2.5 2.5 7M-2.5 7Q-2.5 2.5-7 2.5'
const STAR_RAY = 'M0-14V-10'
const Z_PATH = 'M-5-5H5L-5 5H5'
const SPIKE = 'M-6 3L0-9L6 3Z'
const FEATHER = 'M0-9C6-6 6 3 0 9C-6 3-6-6 0-9Z'

const SPIKES = [
  [49, 96, -84, 1],
  [151, 96, 84, 1],
  [50, 126, -100, 1],
  [150, 126, 100, 1],
  [88, 45, -10, 2],
  [112, 45, 10, 2],
  [48, 112, -92, 2],
  [152, 112, 92, 2],
  [54, 142, -113, 3],
  [146, 142, 113, 3],
  [100, 44, 0, 3],
  [51, 84, -76, 3],
  [149, 84, 76, 3],
  [69, 162, -142, 3],
  [131, 162, 142, 3],
] as const

function stroke(d: string, color: string, width: number): SVGTemplateResult {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`
}

function lidPath(rx: number, ry: number, left: number, right: number): string {
  const chord = (share: number): readonly [number, number] => {
    const y = -ry + 2 * ry * clamp01(share)
    return [rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)), y]
  }
  const [xl, yl] = chord(left)
  const [xr, yr] = chord(right)
  const large = yl + yr > 0 ? 1 : 0
  return `M${round(-xl)} ${round(yl)}A${rx} ${ry} 0 ${large} 1 ${round(xr)} ${round(yr)}Z`
}

function spiralPath(radius: number, turns: number): string {
  const steps = Math.round(turns * 14)
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const angle = t * turns * Math.PI * 2
    const r = radius * t
    return `${i ? 'L' : 'M'}${round(Math.cos(angle) * r)} ${round(Math.sin(angle) * r)}`
  }).join('')
}

interface EyeLook {
  rx: number
  ry: number
  lidL: number
  lidR: number
  dx: number
  dy: number
  pupil: 'round' | 'dot' | 'big' | 'spiral'
  r: number
  under: number
}

function eye(
  look: EyeLook,
  glow: number,
  lidColor: string,
  underColor: string,
  jitter: boolean,
): Art {
  const { rx, ry } = look
  const white = glow >= 2 ? mix(C.cream, C.spark, glow / MAX_GLOW) : C.cream
  const ring = glow > 0
  const ringOpacity = Math.min(1, 0.4 + glow * 0.14)
  const ringWidth = 1.6 + glow * 0.75
  const pupil: Art =
    look.pupil === 'spiral'
      ? at(look.dx, look.dy, motion('spin', stroke(spiralPath(rx - 2.5, 2.6), INK, 2.1)))
      : [
          svg`<circle cx=${look.dx} cy=${look.dy} r=${look.r} fill=${INK} />`,
          when(look.pupil !== 'dot', () => [
            svg`<circle cx=${round(look.dx + look.r * 0.34)} cy=${round(look.dy - look.r * 0.38)} r=${round(look.r * 0.32)} fill="#fff" />`,
          ]),
        ]
  const art: Art = [
    when(ring, () => [
      svg`<ellipse rx=${rx + ringWidth} ry=${ry + ringWidth} fill=${C.sun} opacity=${ringOpacity} />`,
    ]),
    svg`<ellipse rx=${rx} ry=${ry} fill=${white} />`,
    pupil,
    when(look.lidL > 0.01 || look.lidR > 0.01, () => [
      svg`<path d=${lidPath(rx + 0.7, ry + 0.7, look.lidL, look.lidR)} fill=${lidColor} />`,
    ]),
    when(look.under > 0, () => [
      svg`<path d=${lidPath(rx + 0.7, ry + 0.7, look.under, look.under)} transform="scale(1 -1)" fill=${underColor} />`,
    ]),
  ]
  return jitter ? motion('rumble', art) : art
}

function halos(glow: number): Art {
  if (glow < 3) return []
  const outer = glow >= 5 ? 0.2 : 0.12
  const inner = glow >= 4 ? 0.36 : 0.24
  return part(
    'glow',
    [LEFT_EYE, RIGHT_EYE].map((x, i) =>
      at(
        x,
        EYE_Y,
        motion(
          'pulse',
          [
            svg`<circle r=${glow >= 4 ? 27 : 22} fill=${HALO} opacity=${outer} />`,
            svg`<circle r=${glow >= 4 ? 21 : 18} fill=${HALO} opacity=${inner} />`,
          ],
          i + 1,
        ),
      ),
    ),
  )
}

interface FaceColors {
  mask: string
  lid: string
  brow: string
  mouth: string
}

function dueEyes(parts: OwlParts): readonly [EyeLook, EyeLook] {
  const base: EyeLook = {
    rx: EYE_RX,
    ry: EYE_RY,
    lidL: 0,
    lidR: 0,
    dx: 0,
    dy: 0,
    pupil: 'round',
    r: 5.8,
    under: 0,
  }
  const tilt = Math.max(0, parts.browAngle) / 90
  const left: EyeLook = { ...base, lidR: tilt * 1.4 }
  const right: EyeLook = { ...base, lidL: tilt * 1.4 }
  if (parts.twitch) right.under = 0.14
  if (parts.rage >= 2) {
    left.r = 4.6
    right.r = 4.6
  }
  switch (parts.pupils) {
    case 'dots':
      return [
        { ...left, pupil: 'dot', r: 2.3 },
        { ...right, pupil: 'dot', r: 2.3 },
      ]
    case 'mismatched':
      return [
        { ...left, pupil: 'dot', r: 1.9, dx: -2.4, dy: -3.4, ry: EYE_RY - 2 },
        { ...right, pupil: 'big', r: 6.6, dx: 1.2, dy: 2.2, rx: EYE_RX + 1.4, ry: EYE_RY + 1.6 },
      ]
    case 'half-spiral':
      return [
        { ...left, pupil: 'dot', r: 1.9, dx: 2.4, dy: 3, ry: EYE_RY - 2 },
        { ...right, pupil: 'spiral', rx: EYE_RX + 1.4, ry: EYE_RY + 1.6, lidL: 0 },
      ]
    case 'spiral':
      return [
        { ...left, pupil: 'spiral', lidR: 0.06, under: 0 },
        { ...right, pupil: 'spiral', rx: EYE_RX + 1.6, ry: EYE_RY + 2, lidL: 0.06, under: 0 },
      ]
    default:
      return [left, right]
  }
}

function eyeLooks(parts: OwlParts): readonly [EyeLook, EyeLook] {
  if (parts.view === 'due') return dueEyes(parts)
  const away = 4 - Math.min(4, parts.gaze)
  const dx = parts.view === 'supervising' ? 3.6 : -away * 1.15
  const dy = parts.view === 'supervising' ? 4.4 : away * 0.75
  const base: EyeLook = {
    rx: EYE_RX,
    ry: EYE_RY,
    lidL: parts.lid,
    lidR: parts.lid,
    dx,
    dy,
    pupil: 'round',
    r: 5.8,
    under: 0,
  }
  if (parts.view === 'waiting') {
    return [
      { ...base, dx: 2.2, lidL: 0.42, lidR: 0.46, under: 0.1 },
      { ...base, dx: 2.2, lidL: 0.14, lidR: 0.14, under: parts.twitch ? 0.16 : 0 },
    ]
  }
  return [base, base]
}

function closedEyes(view: OwlView, color: string): Art {
  const d = view === 'bliss' ? 'M-10 4Q0-9 10 4' : 'M-10-1Q0 8 10-1'
  return [
    at(LEFT_EYE, EYE_Y, stroke(d, color, 4)),
    at(RIGHT_EYE, EYE_Y, stroke(d, color, 4)),
    when(view === 'asleep', () => [
      at(LEFT_EYE, EYE_Y + 1, stroke('M-11-1l-3-3M11-1l3-3M0 4V8', color, 2)),
      at(RIGHT_EYE, EYE_Y + 1, stroke('M-11-1l-3-3M11-1l3-3M0 4V8', color, 2)),
    ]),
  ]
}

function brows(parts: OwlParts, color: string): Art {
  if (parts.view === 'asleep' || parts.view === 'bliss') return []
  const browAt = (x: number, y: number, rotate: number): Art =>
    part('brow', at(x, y, stroke('M-11 0H11', color, 5.4), rotate))
  if (parts.view === 'waiting') {
    return [browAt(LEFT_EYE, EYE_Y - 16, 6), browAt(RIGHT_EYE + 1, EYE_Y - 24, 12)]
  }
  if (parts.view === 'supervising') {
    return [browAt(LEFT_EYE, EYE_Y - 18, -12), browAt(RIGHT_EYE, EYE_Y - 18, 12)]
  }
  if (parts.view === 'watching') {
    const raise = parts.glow * 0.7
    return [
      browAt(LEFT_EYE, EYE_Y - 16 - raise, -2 + parts.glow * 1.2),
      browAt(RIGHT_EYE, EYE_Y - 16 - raise, 2 - parts.glow * 1.2),
    ]
  }
  const a = parts.browAngle
  const lower = parts.rage >= 2 ? Math.min(3, a * 0.2) : 0
  const lift = parts.rage === 0 ? 4 : 0
  return [
    browAt(LEFT_EYE, EYE_Y - 18 - lift + lower, a),
    browAt(RIGHT_EYE, EYE_Y - 18 - lift + lower, -a),
  ]
}

function toothyGrin(halfWidth: number, height: number, ink: string): Art {
  const w = halfWidth
  const h = height
  const shape = `M${-w} 0Q0 ${round(h * 0.34)} ${w} 0Q${round(w * 0.94)} ${round(h * 1.16)} 0 ${round(h * 1.16)}Q${round(-w * 0.94)} ${round(h * 1.16)} ${-w} 0Z`
  const gaps = Math.round(w / 6)
  const teeth = Array.from({ length: gaps * 2 - 1 }, (_, i) => {
    const x = ((i - gaps + 1) * w) / gaps
    const t = 1 - (x / w) ** 2
    const top = h * 0.17 * t
    const bottom = h * 1.16 * Math.sqrt(t) * 0.86
    return `M${round(x)} ${round(top + 0.5)}V${round(Math.max(top + 1, bottom))}`
  }).join('')
  const seam = `M${round(-w * 0.88)} ${round(h * 0.42)}Q0 ${round(h * 0.86)} ${round(w * 0.88)} ${round(h * 0.42)}`
  return [
    svg`<path d=${shape} fill="#fffaf0" stroke=${ink} stroke-width="2.8" stroke-linejoin="round" />`,
    stroke(teeth, ink, 1.8),
    stroke(seam, ink, 1.8),
  ]
}

function mouth(parts: OwlParts, color: string): Art {
  if (parts.view === 'asleep') return stroke('M94 99Q100 102 106 99', color, 3)
  if (parts.view === 'bliss') return stroke('M84 95Q100 110 116 95', color, 3.6)
  if (parts.view === 'supervising') return stroke('M88 96Q100 106 112 96', color, 3.4)
  if (parts.view === 'waiting') return stroke('M84 99Q96 102 116 95', color, 3.4)
  if (parts.view === 'watching') {
    const lift = parts.glow * 0.7
    return stroke(
      `M${90 - parts.glow} 97Q100 ${round(102 + lift)} ${110 + parts.glow} 97`,
      color,
      3.2,
    )
  }
  const g = parts.grin
  if (g <= 1) return stroke(g === 0 ? 'M84 96Q100 109 116 96' : 'M81 95Q100 110 119 95', color, 3.6)
  if (g === 2) return [stroke('M77 93Q100 112 123 93', color, 3.8), corners(77, 123, 93, color)]
  if (g === 3) return [stroke('M73 91Q100 115 127 91', color, 4), corners(73, 127, 91, color)]
  const shapes: Record<number, readonly [number, number]> = {
    4: [24, 12],
    5: [29, 15],
    6: [34, 18],
    7: [38, 22],
  }
  const [w, h] = shapes[g] ?? [38, 22]
  return part('grin', at(100, 92, toothyGrin(w, h, color)))
}

function corners(left: number, right: number, y: number, color: string): Art {
  return stroke(
    `M${left - 3} ${y - 3}L${left + 1} ${y + 2}M${right + 3} ${y - 3}L${right - 1} ${y + 2}`,
    color,
    2.8,
  )
}

const SLY_EYE = 'M-14 6Q0-2 14-9Q12 6-2 9Q-9 10-14 6Z'

function slyAlmond(x: number, flip: boolean): Art {
  return at(
    x,
    EYE_Y,
    svg`<g transform=${flip ? 'scale(-1 1)' : 'scale(1 1)'}><path d=${SLY_EYE} fill=${C.cream} stroke=${C.coral} stroke-width="5" stroke-linejoin="round" /></g>`,
  )
}

function slyPupil(x: number): Art {
  return at(
    x,
    EYE_Y + 1,
    svg`<circle r="5" fill=${INK} /><circle cx="1.8" cy="-1.8" r="1.5" fill="#fff" />`,
  )
}

function slyEyes(): Art {
  return [
    slyAlmond(LEFT_EYE, true),
    slyAlmond(RIGHT_EYE, false),
    slyPupil(LEFT_EYE + 4),
    slyPupil(RIGHT_EYE + 6),
  ]
}

function faceArt(parts: OwlParts, colors: FaceColors): Art {
  const closed = parts.view === 'asleep' || parts.view === 'bliss'
  const looks = eyeLooks(parts)
  return [
    svg`<path d=${MASK} fill=${mix(colors.mask, C.spark, parts.glow * 0.08)} />`,
    svg`<ellipse cx="76" cy="93" rx="6.5" ry="4" fill=${C.pink} opacity=${parts.view === 'bliss' ? 0.8 : 0.45} />`,
    svg`<ellipse cx="124" cy="93" rx="6.5" ry="4" fill=${C.pink} opacity=${parts.view === 'bliss' ? 0.8 : 0.45} />`,
    parts.sly
      ? part('eyes', slyEyes())
      : closed
        ? part('eyes', closedEyes(parts.view, colors.mouth))
        : part('eyes', [
            at(LEFT_EYE, EYE_Y, eye(looks[0], parts.glow, colors.lid, colors.mask, false), 6),
            at(
              RIGHT_EYE,
              EYE_Y,
              eye(looks[1], parts.glow, colors.lid, colors.mask, parts.twitch),
              -6,
            ),
          ]),
    brows(parts, colors.brow),
    when(parts.twitch, () => part('twitch', stroke('M129 66l4-3M131 75h5M129 84l4 3', INK, 2.2))),
  ]
}

function tuft(body: string, side: string, vane: string): Art {
  return [
    svg`<path d=${TUFT_SIDE} fill=${side} />`,
    svg`<path d=${TUFT_MAIN} fill=${body} />`,
    stroke(TUFT_VANE, vane, 2.6),
  ]
}

function tufts(body: string, side: string, vane: string, droop: boolean): Art {
  const one = tuft(body, side, vane)
  const fold = droop ? -30 : 0
  const left = at(80, 64, at(-80, -64, one), fold)
  const right = svg`<g transform="translate(200 0) scale(-1 1)">${left}</g>`
  return part('tufts', [left, right])
}

function chest(color: string, line: string): Art {
  const rows = [
    [128, -18, 4],
    [141, -24, 5],
    [154, -18, 4],
  ] as const
  return part('chest', [
    svg`<path d="M100 112C124 112 138 128 138 146C138 160 120 168 100 168C80 168 62 160 62 146C62 128 76 112 100 112Z" fill=${color} />`,
    rows.map(([y, start, count]) =>
      Array.from({ length: count }, (_, i) =>
        stroke(`M${100 + start + i * 12 - 6} ${y}a6 6 0 0 0 12 0`, line, 2.8),
      ),
    ),
  ])
}

function feet(tapping: boolean): Art {
  const toes = 'M0-1L-8 7M0-1L0 9M0-1L8 7'
  const toe = stroke(toes, C.sunDark, 5.4)
  return part('feet', [
    at(80, 171, toe),
    tapping ? at(112, 174, motion('wobble', at(8, -3, toe)), -20) : at(120, 171, toe),
    when(tapping, () => stroke('M140 169q5 2 6 7M146 165q7 3 8 11', C.spark, 2.4)),
  ])
}

function wing(fill: string, line: string, finger: boolean): Art {
  return [
    when(finger, () => [svg`<path d=${FINGER} fill=${fill} />`]),
    svg`<path d=${WING} fill=${fill} />`,
    stroke('M-6 12q6 6 13 0M-5 24q6 6 11 0', line, 2.4),
  ]
}

const BLADE_TOP = 'L-7-49C-7-62 11-62 11-49'
const BLADE_FULL = `M-4-13L-7-17${BLADE_TOP}C12-38 11-24 4-13Z`
const BLADE_SHADE = 'M3-13L3-60C8-58 11-54 11-49C12-38 11-24 4-13Z'
const BUTTER = 'M-3-38C-2-44 8-45 10.5-41C12-36 9-31 5-32C2-30-4-32-3-38Z'

function bladeStub(cut: number): string {
  return `M-7 ${cut}${BLADE_TOP}C11.6-42 11 ${round(cut - 8)} 10 ${cut}Z`
}

function knifeArt(cut: number | null, blink: boolean): Art {
  const blade = cut === null ? BLADE_FULL : bladeStub(cut)
  const shade =
    cut === null
      ? BLADE_SHADE
      : `M3 ${cut}L3-60C8-58 11-54 11-49C11.6-42 11 ${round(cut - 8)} 10 ${cut}Z`
  return [
    when(cut === null, () => [
      svg`<rect x="-6" y="-13" width="12" height="27" rx="6" fill=${C.pink} />`,
      svg`<rect x="-2.3" y="-6" width="4.6" height="14" rx="2.3" fill=${tintOf(C.pink, 0.55)} />`,
    ]),
    svg`<path d=${blade} fill=${C.metal} />`,
    svg`<path d=${shade} fill=${C.metalMid} />`,
    when(cut === null, () => [
      svg`<path d=${BUTTER} fill=${C.sun} />`,
      svg`<path d="M0-39Q3-42 7-40.5" fill="none" stroke=${tintOf(C.sun, 0.6)} stroke-width="2" stroke-linecap="round" />`,
    ]),
    when(blink, () => [sparkle(-7, -51, 0.66, 1)]),
  ]
}

interface KnifePose {
  x: number
  y: number
  rotate: number
  shoulder: number
  cut: number | null
}

const KNIFE_POSES: Record<number, KnifePose> = {
  1: { x: 150.5, y: 166.5, rotate: 8, shoulder: -38, cut: -30 },
  2: { x: 148.7, y: 157, rotate: 8, shoulder: -38, cut: -24 },
  3: { x: 147.4, y: 144.8, rotate: 8, shoulder: -40, cut: -15 },
  4: { x: 172, y: 120, rotate: 6, shoulder: -72, cut: null },
  5: { x: 167, y: 80, rotate: 8, shoulder: -138, cut: null },
}

const LOWERED_POSE: KnifePose = { x: 160, y: 144, rotate: 30, shoulder: -38, cut: null }

const SUN_PATH = [
  [24, 76],
  [34, 38],
  [100, 28],
  [166, 38],
  [176, 76],
] as const

function sun(step: number): Art {
  if (step < 0) return []
  const [x, y] = SUN_PATH[step] ?? SUN_PATH[0]
  const disc = mix(C.sun, C.coral, step / 5)
  const rays = Array.from({ length: 8 }, (_, i) => at(0, 0, stroke(STAR_RAY, disc, 2.6), i * 45))
  return part('sun', at(x, y, [motion('throb', rays), svg`<circle r="8" fill=${disc} />`]))
}

function clock(alarm: boolean, rage: number): Art {
  const face = mix(C.cream, '#ffd9cf', rage / MAX_RAGE)
  const minute = -30 + rage * 28
  const body: Art = [
    svg`<circle cx="-9" cy="-14" r="5.5" fill=${C.coralDark} />`,
    svg`<circle cx="9" cy="-14" r="5.5" fill=${C.coralDark} />`,
    stroke('M-9 15l-3 4M9 15l3 4', C.coralDark, 3.4),
    svg`<circle r="15" fill=${C.coral} />`,
    svg`<circle r="11.5" fill=${face} />`,
    at(0, 0, stroke('M0 0V-9', INK, 2.4), minute),
    at(0, 0, stroke('M0 0V-6', INK, 2.8), 62),
    svg`<circle r="1.8" fill=${INK} />`,
  ]
  return part(
    'clock',
    at(34, 42, [
      alarm ? motion('rumble', body) : body,
      when(alarm, () => [stroke('M-20-19q-3 5-1 10M20-19q3 5 1 10', C.spark, 2.4)]),
    ]),
  )
}

function clipboard(): Art {
  return part('clipboard', [
    svg`<rect x="-14" y="-18" width="28" height="37" rx="4" fill=${C.wickerDark} />`,
    svg`<rect x="-11" y="-13" width="22" height="29" rx="2" fill=${C.cream} />`,
    svg`<rect x="-6" y="-21" width="12" height="7" rx="2.5" fill=${C.metalDark} />`,
    stroke('M-8-6l2 2 3-4M-8 2l2 2 3-4', C.check, 2.2),
    stroke('M1-6H8M1 2H8M-8 10H8', C.metalMid, 2.2),
  ])
}

function pencil(): Art {
  return part('pencil', [
    svg`<rect x="-3" y="-22" width="6" height="26" rx="1" fill=${C.sun} />`,
    svg`<path d="M-3 4H3L0 11Z" fill=${C.cream} />`,
    svg`<rect x="-3" y="-26" width="6" height="5" rx="2" fill=${C.pink} />`,
  ])
}

function sweatDrops(count: number): Art {
  const spots = [
    [141, 58, 1],
    [58, 60, 2],
    [146, 92, 3],
    [50, 84, 4],
    [134, 38, 5],
  ] as const
  return part(
    'sweat',
    spots
      .slice(0, count)
      .map(([x, y, d]) => at(x, y, motion('drip', drop(0, 0, C.water, 0.95), d))),
  )
}

function looseFeathers(body: string, ruffle: number): Art {
  const spots = [
    [32, 118, 28, 1],
    [176, 158, -32, 2],
    [24, 156, 60, 3],
  ] as const
  return spots
    .slice(0, ruffle)
    .map(([x, y, rotate, d]) =>
      part(
        'loose-feather',
        at(x, y, motion('drift', at(0, 0, svg`<path d=${FEATHER} fill=${body} />`, rotate), d)),
      ),
    )
}

function perch(): Art {
  return part('perch', [
    svg`<path d="M92 160H108L112 178H88Z" fill=${C.wickerDark} />`,
    svg`<rect x="76" y="176" width="48" height="8" rx="4" fill=${shadeOf(C.wickerDark, 0.2)} />`,
    stroke('M26 158C60 152 130 164 174 154', C.wickerDark, 12),
    stroke('M40 155l10 1M92 157l12 1M140 158l10-1', shadeOf(C.wickerDark, 0.26), 2.4),
    at(174, 152, [
      svg`<path d="M0 0C4-10 14-13 22-12C20-4 12 3 0 0Z" fill=${C.leaf} />`,
      stroke('M2-1C8-5 13-8 17-10', C.leafDark, 1.8),
    ]),
  ])
}

function moon(): Art {
  return part('moon', [
    svg`<path d="M0-13A13 13 0 1 0 12 5A10.5 10.5 0 1 1 0-13Z" transform="translate(168 34)" fill=${C.spark} />`,
    at(36, 34, svg`<circle r="2.4" fill=${C.spark} opacity=".8" />`),
    at(62, 18, svg`<circle r="1.8" fill=${C.spark} opacity=".7" />`),
    at(182, 84, svg`<circle r="2" fill=${C.spark} opacity=".6" />`),
  ])
}

function snores(): Art {
  return part('snore', [
    at(150, 74, at(0, 0, motion('rise', stroke(Z_PATH, C.spark, 3.2), 1), 0, 0.9)),
    at(166, 102, at(0, 0, motion('rise', stroke(Z_PATH, C.spark, 3.2), 3), 0, 0.65)),
  ])
}

export function owl(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = owlParts(scene)
  const body = accentOf(scene, C.lilac)
  const dark = shadeOf(body, 0.2)
  const deep = shadeOf(body, 0.46)
  const mask = tintOf(body, 0.68)
  const belly = tintOf(body, 0.42)
  const scallop = body
  const face = { mask, lid: body, brow: deep, mouth: mix(deep, INK, 0.5) }
  const isDue = parts.view === 'due'

  const pose =
    parts.knife > 0 ? (parts.knifeLowered ? LOWERED_POSE : KNIFE_POSES[parts.knife]) : undefined
  const blink = parts.knife > 0
  const full = parts.knife >= MAX_KNIFE
  const knife: Art = pose
    ? part(
        'knife',
        at(
          pose.x,
          pose.y,
          full ? motion('sway', knifeArt(pose.cut, blink)) : knifeArt(pose.cut, blink),
          pose.rotate,
          parts.knifeLowered ? 0.92 : 1,
        ),
      )
    : []

  const rightAngle = (() => {
    if (pose) return pose.shoulder
    if (parts.view === 'supervising') return 24
    return parts.view === 'bliss' ? -36 : -8
  })()
  const leftAngle = (() => {
    if (isDue) return 150
    if (parts.view === 'supervising') return 112
    return parts.view === 'bliss' ? 36 : 8
  })()

  const leftWing = part('wing-left', at(60, 116, wing(dark, deep, isDue), leftAngle, WING_SIZE))
  const rightWing = part('wing-right', at(140, 116, wing(dark, deep, false), rightAngle, WING_SIZE))

  const owlArt: Art = [
    part(
      'ruffle',
      SPIKES.filter(([, , , level]) => level <= parts.ruffle).map(([x, y, r]) =>
        at(x, y, svg`<path d=${SPIKE} fill=${body} />`, r),
      ),
    ),
    tufts(body, dark, deep, parts.view === 'asleep'),
    svg`<path d=${BODY} fill=${body} data-part="body" />`,
    svg`<path d=${BODY_SHADE} fill=${shadeOf(body, 0.1)} />`,
    chest(belly, scallop),
    part('scarf', [
      svg`<path d="M116 132L134 128L142 158L124 162Z" fill=${C.coralDark} />`,
      svg`<path d="M124 162l2 7M130 161l2 7M136 159l2 7" stroke=${C.coralDark} stroke-width="3" stroke-linecap="round" />`,
      svg`<path d="M55 115Q100 134 145 115L148 127Q100 148 52 127Z" fill=${C.coral} />`,
      svg`<path d="M70 124l-2 8M86 129l-1 8M102 131v8M118 129l2 8M133 124l3 8" stroke=${C.coralDark} stroke-width="2.6" stroke-linecap="round" />`,
    ]),
    feet(parts.tapping),
    halos(parts.glow),
    faceArt(parts, face),
    mouth(parts, face.mouth),
    at(100, 89, svg`<path d=${BEAK} fill=${C.sunDark} />`),
    when(parts.veins > 0, () => [
      part(
        'vein',
        at(126, 56, motion('throb', [stroke(VEIN, mask, 6.5), stroke(VEIN, C.coralDark, 3)])),
      ),
    ]),
    when(parts.veins > 1, () => [
      part(
        'vein',
        at(
          73,
          58,
          motion('throb', [stroke(VEIN, mask, 6.5), stroke(VEIN, C.coralDark, 3)], 2),
          0,
          0.8,
        ),
      ),
    ]),
    knife,
    when(parts.clipboard, () => [at(26, 98, pencil(), -18)]),
    leftWing,
    rightWing,
    when(parts.clipboard, () => [
      at(126, 138, clipboard(), 7),
      svg`<ellipse cx="118" cy="156" rx="9" ry="6" fill=${dark} />`,
      part(
        'puff',
        at(
          142,
          88,
          motion('drift', [
            svg`<circle r="5.5" fill=${C.cream} opacity=".85" />`,
            svg`<circle cx="9" cy="-3" r="7" fill=${C.cream} opacity=".85" />`,
            svg`<circle cx="19" cy="1" r="4.5" fill=${C.cream} opacity=".85" />`,
          ]),
        ),
      ),
    ]),
    when(parts.view === 'asleep', () => [
      part(
        'bubble',
        at(
          118,
          106,
          motion('pulse', [
            svg`<circle r="7" fill=${C.water} opacity=".55" />`,
            svg`<circle cx="-2.4" cy="-2.4" r="1.7" fill="#fff" />`,
          ]),
        ),
      ),
    ]),
  ]

  const figure: Art = (() => {
    if (parts.view === 'asleep') return at(16, 2.5, owlArt, 0, 0.84)
    if (parts.view === 'bliss') return motion('bob', owlArt)
    return owlArt
  })()

  const art: Art = [
    parts.view === 'asleep' ? shadow(100, 180, 44) : shadow(100, 180, 58),
    when(parts.view === 'asleep', () => [moon(), perch()]),
    sun(parts.sun),
    when(parts.clock, () => clock(parts.alarm, parts.rage)),
    looseFeathers(body, parts.ruffle),
    figure,
    when(parts.view === 'asleep', snores),
    sweatDrops(parts.sweat),
    when(parts.heart, () => [
      part('heart', at(100, 30, motion('pulse', svg`<path d=${HEART} fill=${C.coral} />`), 0, 1.5)),
      sparkle(36, 62, 0.9, 1),
      sparkle(168, 70, 1, 2),
      sparkle(28, 130, 0.65, 3),
      sparkle(176, 140, 0.7, 4),
    ]),
  ]

  return frame('owl', scene, options, art)
}
