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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type YogaView = 'nap' | 'sit' | 'plead' | 'tree' | 'rest' | 'lotus'
export type YogaCandle = 'none' | 'ready' | 'lit'

export interface YogaParts {
  view: YogaView
  step: number
  dust: number
  aches: number
  knots: number
  slump: number
  icePack: boolean
  candle: YogaCandle
  sweat: boolean
  mood: Mood
}

export const MAX_ROLL = 4
export const ROLLED = MAX_ROLL + 1

const DUST_AT = [0.05, 0.3, 0.6] as const
const ACHES_AT = [0.15, 0.45, 0.75] as const
const KNOTS_AT = [0.25, 0.55, 0.85] as const
const SLUMP_AT = [0.2, 0.5, 0.8] as const
const ICE_AT = 0.8
const SICK_AT = 0.55

const QUIET = { dust: 0, aches: 0, knots: 0, slump: 0, icePack: false, sweat: false } as const

export function yogaParts(scene: SceneView): YogaParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...QUIET, view: 'lotus', step: 0, candle: 'none', mood: 'happy' }
  }
  const dust = reached(stink, DUST_AT)
  const aches = reached(stink, ACHES_AT)
  const knots = reached(stink, KNOTS_AT)
  const slump = reached(stink, SLUMP_AT)
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...QUIET,
      view: 'tree',
      step: 0,
      dust: Math.min(1, dust),
      knots: Math.min(1, knots),
      candle: 'lit',
      mood: 'happy',
    }
  }
  const shared = { dust, aches, knots, slump, icePack: stink >= ICE_AT }
  if (state === 'waiting') {
    return {
      ...shared,
      view: 'rest',
      step: 0,
      candle: 'none',
      sweat: false,
      mood: sick ? 'sick' : 'calm',
    }
  }
  if (state === 'due') {
    return {
      ...shared,
      view: 'plead',
      step: ROLLED,
      candle: 'ready',
      sweat: false,
      mood: sick ? 'sick' : 'pleading',
    }
  }
  if (state === 'resting') {
    return { ...shared, view: 'nap', step: 0, candle: 'none', sweat: false, mood: 'sleepy' }
  }
  const step = Math.min(MAX_ROLL, Math.floor(fill * (MAX_ROLL + 1)))
  return {
    ...shared,
    view: 'sit',
    step,
    candle: 'none',
    sweat: step >= 3 && !sick,
    mood: sick ? 'sick' : step >= 2 ? 'worried' : 'calm',
  }
}

const SKIN = '#ffd6b3'
const SKIN_DARK = '#efa97c'
const CHEEK = '#ff9486'
const FACE = '#5b2612'
const BUN = '#7a4a35'
const PANTS = C.coral
const PANTS_DARK = C.coralDark
const BAND = C.sun
const BAND_DARK = C.sunDark
const DUST = '#d8c79c'
const DUST_DARK = '#a8976c'
const GLASS = '#dff1fb'
const KNOT_INK = '#8f2f2a'

const MAT_LEFT = 16
const MAT_RIGHT = 184
const MAT_TOP = 165
const MAT_FACE = 182
const MAT_BOTTOM = 186

const ROLL_RADIUS = [0, 12, 18, 24, 30, 37] as const
const ROLL_X = [MAT_RIGHT, 170, 154, 141, 129, 148] as const
const SIT_X = [88, 80, 72, 62, 54] as const

interface Figure {
  x: number
  mid: number
  rx: number
  ry: number
  art: Art
}

function stroke(d: string, color: string, width: number): Art {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`
}

function ball(x: number, y: number, r: number, color: string): Art {
  return svg`<circle cx=${round(x)} cy=${round(y)} r=${round(r)} fill=${color} />`
}

function oval(x: number, y: number, rx: number, ry: number, color: string): Art {
  return svg`<ellipse cx=${round(x)} cy=${round(y)} rx=${round(rx)} ry=${round(ry)} fill=${color} />`
}

function belt(rx: number, ry: number): Art {
  const half = round(rx * 0.87)
  const y = round(-ry * 0.5)
  return svg`<path d=${`M${-half} ${y}A${round(rx)} ${round(ry)} 0 0 0 ${half} ${y}Q0 ${round(y + ry * 0.2)} ${-half} ${y}Z`} fill=${PANTS} />`
}

function dumpling(rx: number, ry: number, mood: Mood, droop = 0, waist = true): Art {
  const crown = -ry * 2
  const eyeline = -ry * (1.04 - droop * 0.07)
  const edge = round(rx * 0.86)
  const bandY = round(-ry * 1.52)
  return [
    ball(0, crown - 2, 9.5, BUN),
    oval(0, -ry, rx, ry, SKIN),
    when(waist, () => belt(rx, ry)),
    stroke(`M${-edge} ${bandY}Q0 ${round(bandY - 9)} ${edge} ${bandY}`, BAND, 6.5),
    at(
      edge,
      bandY + 1,
      svg`<path d="M0 0C6-8 15-7 15-2C15 2 7 3 0 0ZM0 0C7 0 13 5 11 9C8 12 2 7 0 0Z" fill=${BAND_DARK} />`,
    ),
    oval(-rx * 0.66, eyeline + 9, 6.5, 4, CHEEK),
    oval(rx * 0.66, eyeline + 9, 6.5, 4, CHEEK),
    face(0, round(eyeline), mood, FACE, 1.08),
  ]
}

function napFigure(parts: YogaParts): Figure {
  const rx = 45
  const ry = 27
  return {
    x: 92,
    mid: 176 - ry,
    rx,
    ry,
    art: at(92, 176, [
      stroke('M-38-18C-52-12-54-2-46-2', SKIN_DARK, 9),
      stroke('M38-18C52-12 54-2 46-2', SKIN_DARK, 9),
      dumpling(rx, ry, parts.mood),
      oval(-23, -2, 12, 7, PANTS_DARK),
      oval(23, -2, 12, 7, PANTS_DARK),
      oval(-30, -4, 7, 8, SKIN),
      oval(30, -4, 7, 8, SKIN),
    ]),
  }
}

function sitFigure(parts: YogaParts): Figure {
  const x = SIT_X[parts.step] ?? 54
  const rx = 34 + parts.slump * 2.5
  const ry = 34 - parts.slump * 2.5
  const hang = parts.slump * 3
  const hand = rx + 6
  const lean = -parts.slump * 2 - (parts.step >= 3 ? 4 : 0)
  return {
    x,
    mid: 172 - ry,
    rx,
    ry,
    art: at(
      x,
      172,
      [
        stroke(`M${-rx * 0.85} ${-ry * 1.1}Q${-rx - 13} ${-ry * 0.6} ${-hand} -11`, SKIN_DARK, 9),
        stroke(`M${rx * 0.85} ${-ry * 1.1}Q${rx + 13} ${-ry * 0.6} ${hand} -11`, SKIN_DARK, 9),
        dumpling(rx, ry, parts.mood, parts.slump),
        stroke('M-33-5Q-4 11 27-1', PANTS_DARK, 13),
        stroke('M33-5Q4 11-27-1', PANTS, 13),
        ball(-38, -6, 6.5, SKIN),
        ball(38, -6, 6.5, SKIN),
        ball(-hand, -11 + hang, 5.5, SKIN),
        ball(hand, -11 + hang, 5.5, SKIN),
      ],
      lean,
    ),
  }
}

function pleadFigure(parts: YogaParts): Figure {
  const x = 76
  const rx = 32 + parts.slump * 2
  const ry = 34 - parts.slump * 2
  const hands = -ry * 0.3 + parts.slump
  return {
    x,
    mid: 176 - ry,
    rx,
    ry,
    art: at(
      x,
      176,
      [
        oval(0, -3, 37, 9, PANTS_DARK),
        dumpling(rx, ry, parts.mood),
        stroke(`M${-rx * 0.82} ${-ry * 0.72}Q${-16} ${hands + 12} -3 ${hands + 2}`, SKIN_DARK, 8.5),
        stroke(`M${rx * 0.82} ${-ry * 0.72}Q16 ${hands + 12} 3 ${hands + 2}`, SKIN_DARK, 8.5),
        at(-3.4, hands, oval(0, 0, 5, 9, SKIN), -7),
        at(3.4, hands, oval(0, 0, 5, 9, SKIN), 7),
      ],
      -parts.slump * 3,
    ),
  }
}

function treeFigure(parts: YogaParts): Figure {
  const rx = 30
  const ry = 31
  const seat = 118
  return {
    x: 100,
    mid: seat - ry,
    rx,
    ry,
    art: part('balance', [
      at(100, 0, [
        stroke('M-22 72C-44 50-36 36-3 30', SKIN_DARK, 9),
        stroke('M22 72C44 50 36 36 3 30', SKIN_DARK, 9),
        at(-3.4, 27, oval(0, 0, 5, 11, SKIN), -7),
        at(3.4, 27, oval(0, 0, 5, 11, SKIN), 7),
        oval(-2, 172, 13, 6, SKIN),
        stroke('M-2 114V168', PANTS, 12.5),
        stroke('M10 112L39 130L7 142', PANTS_DARK, 12),
        ball(6, 142, 7, SKIN),
        at(0, seat, dumpling(rx, ry, parts.mood)),
      ]),
    ]),
  }
}

function restFigure(parts: YogaParts): Figure {
  const x = 86
  const rx = 33 + parts.slump
  const ry = 33 - parts.slump
  const lift = 34 - parts.slump
  const blanket = 'M-31-49Q0-33 31-49C47-42 56-22 62-3Q63 6 55 6H-55Q-63 6-62-3C-56-22-47-42-31-49Z'
  const bands = [
    ['M-53-22Q0-6 53-22', C.coral],
    ['M-58-11Q0 5 58-11', C.sky],
  ] as const
  return {
    x,
    mid: 176 - lift - ry,
    rx,
    ry,
    art: at(x, 176, [
      at(0, -lift, dumpling(rx, ry, parts.mood, 0, false), -parts.slump * 2),
      part('blanket', [
        svg`<path d=${blanket} fill=${C.cream} />`,
        bands.map(([d, color]) => stroke(d, color, 5)),
        stroke('M-31-49Q0-33 31-49', C.creamDark, 6),
      ]),
    ]),
  }
}

const PETAL = 'M0 0C-15-12-16-34 0-52C16-34 15-12 0 0Z'

function petal(angle: number, color: string, length = 1): Art {
  return at(0, 0, svg`<path d=${PETAL} fill=${color} />`, angle, length)
}

function lotusBack(): Art {
  const deep = mix(C.pinkDark, C.lilac, 0.25)
  return [
    petal(-88, deep, 1.14),
    petal(88, deep, 1.14),
    petal(-64, C.pinkDark, 1.26),
    petal(64, C.pinkDark, 1.26),
    petal(-38, C.pink, 1.4),
    petal(38, C.pink, 1.4),
  ]
}

function lotusFront(): Art {
  const pale = tintOf(C.pink, 0.45)
  return [
    petal(-76, C.pink, 0.9),
    petal(76, C.pink, 0.9),
    petal(-48, pale, 0.86),
    petal(48, pale, 0.86),
    petal(-22, tintOf(C.pink, 0.68), 0.8),
    petal(22, tintOf(C.pink, 0.68), 0.8),
    petal(0, '#fff', 0.68),
  ]
}

function lotusFigure(parts: YogaParts): Figure {
  const rx = 33
  const ry = 34
  const seat = 150
  return {
    x: 100,
    mid: seat - ry,
    rx,
    ry,
    art: at(100, 0, [
      at(0, 170, part('lotus-back', lotusBack())),
      at(0, seat, [
        stroke('M-28-44C-48-52-56-66-55-84', SKIN_DARK, 9),
        stroke('M28-44C48-52 56-66 55-84', SKIN_DARK, 9),
        ball(-55, -86, 6.5, SKIN),
        ball(55, -86, 6.5, SKIN),
        dumpling(rx, ry, parts.mood),
      ]),
      at(0, 172, part('lotus-front', lotusFront())),
    ]),
  }
}

function figureFor(parts: YogaParts): Figure {
  const builders: Record<YogaView, (parts: YogaParts) => Figure> = {
    nap: napFigure,
    sit: sitFigure,
    plead: pleadFigure,
    tree: treeFigure,
    rest: restFigure,
    lotus: lotusFigure,
  }
  return builders[parts.view](parts)
}

function matPath(right: number): string {
  const l = MAT_LEFT
  const r = right
  return `M${l + 11} ${MAT_TOP}H${r - 11}Q${r - 7} ${MAT_TOP} ${r - 6} ${MAT_TOP + 4}L${r} ${MAT_FACE - 4}Q${r + 1} ${MAT_FACE} ${r - 4} ${MAT_FACE}H${l + 4}Q${l - 1} ${MAT_FACE} ${l} ${MAT_FACE - 4}L${l + 6} ${MAT_TOP + 4}Q${l + 7} ${MAT_TOP} ${l + 11} ${MAT_TOP}Z`
}

function flatMat(right: number, base: string, dark: string, light: string): Art {
  const dots: number[] = []
  for (let x = MAT_LEFT + 16; x < right - 8; x += 15) dots.push(x)
  return part('mat', [
    svg`<path d=${`M${MAT_LEFT} ${MAT_FACE - 4}V${MAT_BOTTOM - 4}Q${MAT_LEFT} ${MAT_BOTTOM} ${MAT_LEFT + 4} ${MAT_BOTTOM}H${right - 4}Q${right} ${MAT_BOTTOM} ${right} ${MAT_BOTTOM - 4}V${MAT_FACE - 4}Z`} fill=${dark} />`,
    svg`<path d=${matPath(right)} fill=${base} />`,
    stroke(`M${MAT_LEFT + 12} ${MAT_TOP + 4}H${right - 12}`, light, 2.4),
    dots.map((x) => ball(x, MAT_TOP + 10, 2.3, light)),
  ])
}

function spiralPath(r: number): string {
  const turns = 1 + r / 15
  const count = Math.ceil(turns * 48)
  const end = Math.PI * 0.72
  const points = Array.from({ length: count + 1 }, (_, i) => {
    const t = i / count
    const angle = end - (1 - t) * turns * 2 * Math.PI
    const radius = r * (0.12 + 0.86 * t)
    return `${i ? 'L' : 'M'}${round(Math.cos(angle) * radius)} ${round(Math.sin(angle) * radius)}`
  })
  return points.join('')
}

function roll(step: number, base: string, dark: string, light: string, dust: number): Art {
  const r = ROLL_RADIUS[step] ?? 0
  if (r === 0) return []
  const x = ROLL_X[step] ?? MAT_RIGHT
  const y = MAT_BOTTOM - r
  const coil: Art = [
    ball(0, 0, r, base),
    stroke(spiralPath(r), dark, Math.min(4, 2.2 + r * 0.06)),
    stroke(
      `M${round(-r * 0.68)} ${round(-r * 0.68)}A${round(r * 0.96)} ${round(r * 0.96)} 0 0 1 ${round(r * 0.3)} ${round(-r * 0.9)}`,
      light,
      3,
    ),
  ]
  return part('roll', [
    shadow(x, MAT_BOTTOM - 1, r * 0.95, 0.3),
    at(x, y, step === ROLLED ? coil : motion('wobble', coil)),
    when(dust > 0 && r >= 18, () =>
      at(
        x,
        y - r,
        svg`<path d=${`M${round(-r * 0.62)} ${round(r * 0.24)}C${round(-r * 0.4)} -3 ${round(r * 0.4)} -3 ${round(r * 0.62)} ${round(r * 0.24)}Q0 ${round(r * 0.08)} ${round(-r * 0.62)} ${round(r * 0.24)}Z`} fill=${DUST} />`,
      ),
    ),
  ])
}

function ghostMat(right: number): Art {
  return part(
    'mat-ghost',
    svg`<path d=${`M${right} ${MAT_TOP + 2}H${MAT_RIGHT - 8}L${MAT_RIGHT - 2} ${MAT_BOTTOM - 4}H${right}`} fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round" stroke-linejoin="round" opacity=".2" />`,
  )
}

function candle(x: number, base: number, height: number, lit: boolean): Art {
  const top = base - height
  return part('candle', [
    shadow(x, base + 1, 15, 0.26),
    when(lit, () =>
      at(x, top - 15, motion('pulse', svg`<circle r="20" fill=${C.sun} opacity=".26" />`, 2)),
    ),
    svg`<rect x=${x - 8} y=${top} width="16" height=${height} rx="3.5" fill=${C.cream} />`,
    svg`<rect x=${x + 3} y=${top} width="5" height=${height} rx="2.5" fill=${C.creamDark} />`,
    svg`<path d=${`M${x - 8} ${top + 4}Q${x - 8} ${top} ${x - 4} ${top}H${x + 4}Q${x + 2} ${top + 6} ${x - 1} ${top + 4}Q${x - 3} ${top + 12} ${x - 5.5} ${top + 7}Q${x - 7} ${top + 10} ${x - 8} ${top + 8}Z`} fill="#fff" />`,
    svg`<rect x=${x - 1.2} y=${top - 6} width="2.4" height="7" rx="1.2" fill=${C.fly} />`,
    svg`<rect x=${x - 14} y=${base - 4} width="28" height="6" rx="3" fill=${C.terracotta} />`,
    when(lit, () =>
      at(
        x,
        top - 7,
        motion('throb', [
          svg`<path d="M0-19C7-10 9-6 9-1A9 9 0 0 1-9-1C-9-6-7-10 0-19Z" fill=${C.sun} />`,
          svg`<path d="M0-9C3-5 4.5-3 4.5-.5A4.5 4.5 0 0 1-4.5-.5C-4.5-3-3-5 0-9Z" fill=${C.spark} />`,
        ]),
      ),
    ),
  ])
}

function candleArt(kind: YogaCandle): Art {
  if (kind === 'ready') {
    return [
      candle(29, 178, 40, false),
      part('match', [
        stroke('M12 184L27 186', C.wickerLight, 3),
        ball(11, 183.6, 3.2, C.coralDark),
      ]),
    ]
  }
  if (kind === 'lit') return candle(30, 172, 34, true)
  return []
}

function water(): Art {
  return part('water', [
    shadow(165, 178, 18, 0.26),
    stroke('M171 142L178 116L186 113', C.coral, 4.5),
    svg`<path d="M151 138H179L175.5 174Q175 178 171 178H159Q155 178 154.5 174Z" fill=${GLASS} opacity=".55" />`,
    svg`<path d="M153 149H177L175 174Q174.5 177 171 177H159Q155.5 177 155 174Z" fill=${C.water} />`,
    stroke('M155 149H175', tintOf(C.water, 0.55), 3.4),
    stroke('M157 142L159.5 170', '#fff', 3),
    at(165, 104, motion('bob', stroke('M0-13V5M-10-5L0 6L10-5', C.sun, 6.5))),
  ])
}

function zeds(x: number, y: number): Art {
  const glyph = stroke('M-8-8H8L-8 8H8', C.cream, 4)
  return part(
    'zzz',
    (
      [
        [0, 0, 0.7, 1],
        [18, -22, 1, 2],
        [40, -42, 0.62, 3],
      ] as const
    ).map(([dx, dy, size, delay]) =>
      at(x + dx, y + dy, motion('drift', at(0, 0, glyph, 0, size), delay)),
    ),
  )
}

function moon(): Art {
  return part(
    'moon',
    at(
      40,
      46,
      [
        svg`<path d="M6-20A21 21 0 1 0 20 12A17 17 0 0 1 6-20Z" fill=${C.spark} />`,
        ball(30, -18, 2.4, C.spark),
        ball(-24, -24, 1.8, C.spark),
      ],
      -8,
    ),
  )
}

function leaf(x: number, y: number, rotate: number, size: number, delay: number): Art {
  const shape: Art = [
    svg`<path d="M0 0C-9-5-10-17 0-26C10-17 9-5 0 0Z" fill=${delay % 2 ? C.leaf : C.mint} />`,
    stroke('M0-3V-19', C.leafDark, 2),
  ]
  return part('leaf', at(x, y, motion('drift', at(0, 13, shape, rotate, size), delay)))
}

function breath(centre: number): Art {
  return part('breath', [
    (
      [
        [52, 0.42, 1],
        [68, 0.24, 3],
      ] as const
    ).map(([r, opacity, delay]) =>
      at(
        100,
        centre,
        motion(
          'pulse',
          svg`<circle r=${r} fill="none" stroke=${tintOf(C.sky, 0.4)} stroke-width="4" opacity=${opacity} />`,
          delay,
        ),
      ),
    ),
  ])
}

const RAYS = [-100, -72, -20, 20, 72, 100] as const

function glow(centre: number): Art {
  return part(
    'halo',
    at(100, centre, [
      motion('pulse', svg`<circle r="76" fill=${C.spark} opacity=".16" />`, 1),
      svg`<circle r="58" fill=${C.spark} opacity=".24" />`,
      RAYS.map((angle, i) =>
        at(0, 0, motion('flicker', stroke('M0-82V-70', C.spark, 4), (i % 3) + 1), angle),
      ),
    ]),
  )
}

function plea(): Art {
  return part('plea', [
    ball(88, 103, 3.5, C.cream),
    ball(95, 90, 6, C.cream),
    at(
      112,
      55,
      motion('pulse', [
        ball(0, 0, 29, C.cream),
        at(0, 15, [lotusBackMini(), lotusFrontMini()], 0, 0.62),
      ]),
    ),
  ])
}

function lotusBackMini(): Art {
  return [petal(-62, C.pinkDark, 1), petal(62, C.pinkDark, 1)]
}

function lotusFrontMini(): Art {
  return [petal(-30, C.pink, 1.02), petal(30, C.pink, 1.02), petal(0, tintOf(C.pink, 0.45), 1)]
}

function knot(x: number, y: number, index: number): Art {
  return part(
    'knot',
    at(
      round(x),
      round(y),
      motion(
        'throb',
        [
          at(
            0,
            0,
            [
              ball(0, 0, 10.5, C.coral),
              stroke('M-6-2C-2-9 7-6 5 1C3 7-7 6-6 0C-5-5 4-5 7 3', KNOT_INK, 2.8),
            ],
            0,
            0.8,
          ),
        ],
        index + 1,
      ),
    ),
    index,
  )
}

function bolt(x: number, y: number, rotate: number, index: number): Art {
  return part(
    'ache',
    at(
      round(x),
      round(y),
      motion(
        'flicker',
        at(
          0,
          0,
          svg`<path d="M3-17L-9 2H-1L-4 17L10-4H2L8-17Z" fill=${C.sun} stroke=${C.coralDark} stroke-width="2" stroke-linejoin="round" />`,
          rotate,
        ),
        (index % 3) + 1,
      ),
    ),
    index,
  )
}

function neglect(parts: YogaParts, figure: Figure): Art {
  const { x, mid, rx, ry } = figure
  const knots = [
    [x - rx * 0.98, mid + ry * 0.74],
    [x + rx * 0.98, mid + ry * 0.68],
    [x + rx * 0.5, mid + ry * 1.02],
  ] as const
  const bolts = [
    [x - rx - 15, mid - ry * 0.95, -16],
    [x + rx + 15, mid - ry * 1.05, 16],
    [x + rx + 20, mid + ry * 0.2, 34],
  ] as const
  return [
    knots.slice(0, parts.knots).map(([kx, ky], i) => knot(kx, ky, i)),
    bolts
      .slice(0, parts.aches)
      .map(([bx, by, r], i) => bolt(Math.min(176, Math.max(24, bx)), by, r, i)),
  ]
}

function icePack(figure: Figure): Art {
  const { x, mid, ry } = figure
  return part(
    'ice-pack',
    at(
      x - 3,
      mid - ry - 7,
      [
        svg`<path d="M-27 3C-27-11-12-17 0-17C12-17 27-11 27 3Q27 8 21 8H-21Q-27 8-27 3Z" fill=${C.sky} />`,
        stroke('M-16-5Q-12-11-5-12', tintOf(C.sky, 0.6), 3.4),
        svg`<rect x="-7" y="-25" width="14" height="10" rx="3" fill=${C.skyDark} />`,
      ],
      -9,
    ),
  )
}

const SPECKS = [
  [34, 176, 1.8],
  [58, 183, 1.5],
  [84, 171, 1.7],
  [112, 180, 1.9],
  [138, 172, 1.5],
  [166, 182, 1.8],
  [46, 170, 1.4],
  [152, 177, 1.6],
] as const

function bunny(x: number, y: number, size: number): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-15 5C-19-3-12-7-9-6C-9-13 2-14 4-8C10-11 18-5 15 5Q14 8 11 8H-12Q-15 8-15 5Z" fill=${DUST} />`,
      svg`<path d="M-15 5Q0 11 15 5Q14 8 11 8H-12Q-15 8-15 5Z" fill=${DUST_DARK} />`,
      ball(-5, -1, 1.7, C.fly),
      ball(5, -1, 1.7, C.fly),
    ],
    0,
    size,
  )
}

function dustArt(count: number): Art {
  if (count === 0) return []
  return part('dust', [
    SPECKS.map(([x, y, r]) => ball(x, y, r, DUST_DARK)),
    when(count >= 2, () => [oval(42, 174, 15, 4, DUST), oval(128, 176, 18, 4.5, DUST)]),
    when(count >= 3, () => oval(92, 180, 20, 3.6, DUST)),
  ])
}

function dustBunnies(count: number, view: YogaParts['view']): Art {
  return part('dust-bunnies', [
    when(count >= 2 && view !== 'rest', () => bunny(172, 177, 0.8)),
    when(count >= 3, () => [bunny(120, 178, 0.66), bunny(30, 177, 1)]),
  ])
}

function backdrop(parts: YogaParts, figure: Figure): Art {
  if (parts.view === 'tree') {
    return [
      breath(92),
      leaf(30, 62, -34, 1.05, 1),
      leaf(168, 40, 32, 1.2, 2),
      leaf(174, 118, 64, 0.9, 3),
      leaf(56, 26, 14, 0.74, 4),
    ]
  }
  if (parts.view === 'lotus') return glow(figure.mid - 6)
  if (parts.view === 'nap') return [moon(), zeds(142, 96)]
  return []
}

function foreground(parts: YogaParts, figure: Figure): Art {
  return [
    when(parts.view === 'plead', plea),
    when(parts.view === 'rest', water),
    when(parts.sweat, () =>
      at(
        figure.x + figure.rx + 8,
        figure.mid - figure.ry * 0.9,
        motion('drip', drop(0, 0, C.water, 0.9), 2),
      ),
    ),
    when(parts.view === 'lotus', () => [
      sparkle(26, 58, 1.25, 1),
      sparkle(174, 44, 1.45, 2),
      sparkle(180, 132, 0.85, 3),
      sparkle(22, 134, 0.9, 4),
      sparkle(100, 24, 0.8, 5),
    ]),
  ]
}

export function yoga(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = yogaParts(scene)
  const figure = figureFor(parts)
  const accent = mix(accentOf(scene, C.lilac), DUST, parts.dust * 0.12)
  const dark = shadeOf(accent)
  const light = tintOf(accent, 0.45)
  const rolled = parts.step > 0
  const right = rolled ? (ROLL_X[parts.step] ?? MAT_RIGHT) : MAT_RIGHT
  const body = part('yogi', parts.view === 'lotus' ? motion('bob', figure.art) : figure.art)
  return frame('yoga', scene, options, [
    backdrop(parts, figure),
    shadow(100, 186, 86, 0.22),
    when(rolled && parts.step < ROLLED, () => ghostMat(right)),
    when(parts.step < ROLLED, () => flatMat(right, accent, dark, light)),
    dustArt(parts.dust),
    roll(parts.step, accent, dark, light, parts.dust),
    candleArt(parts.candle),
    body,
    dustBunnies(parts.dust, parts.view),
    neglect(parts, figure),
    when(parts.icePack, () => icePack(figure)),
    foreground(parts, figure),
  ])
}
