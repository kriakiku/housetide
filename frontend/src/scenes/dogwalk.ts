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
import type { Art, Mood, SceneOptions } from './common.ts'

export type DogwalkView = 'door' | 'asleep' | 'bounding' | 'mat' | 'bed'
export type LeashSpot = 'hook' | 'mouth' | 'feet' | 'trailing'

export interface DogwalkParts {
  view: DogwalkView
  step: number
  gaze: number
  tilt: number
  leash: LeashSpot
  wag: boolean
  begging: boolean
  crossed: boolean
  sweat: number
  puddle: boolean
  shoe: boolean
  flies: number
  stench: number
  mud: number
  prints: number
  mood: Mood
}

export const MAX_STEP = 3

const GAZE = [1, 4, 7, 9] as const
const TILT = [0, -4, -8, -12] as const
const LEAN = [0, 3, 6, 9] as const

const CROSSED_AT = 0.12
const PUDDLE_AT = 0.4
const SHOE_AT = 0.65
const FLY_AT = [0.88] as const
const WAITING_AT = [0.1, 0.4, 0.68] as const
const RUNNING_AT = [0.25, 0.6, 0.9] as const

const CALM = {
  step: 0,
  gaze: 0,
  tilt: 0,
  wag: false,
  begging: false,
  crossed: false,
  sweat: 0,
  puddle: false,
  shoe: false,
  flies: 0,
  stench: 0,
  mud: 0,
  prints: 0,
} as const

export function dogwalkParts(scene: SceneView): DogwalkParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...CALM, view: 'bed', leash: 'hook', mood: 'happy' }
  }
  if (state === 'running') {
    const mud = reached(stink, RUNNING_AT)
    return {
      ...CALM,
      view: 'bounding',
      leash: 'trailing',
      mud,
      flies: mud >= 3 ? 1 : 0,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    const level = reached(stink, WAITING_AT)
    return {
      ...CALM,
      view: 'mat',
      leash: 'hook',
      gaze: 5,
      tilt: 9,
      mud: level >= 2 ? 2 : 1,
      prints: level >= 1 ? level + 1 : 0,
      stench: level >= 3 ? 2 : 0,
      flies: level >= 3 ? 2 : 0,
      mood: level >= 2 ? 'worried' : 'calm',
    }
  }
  const crossed = stink >= CROSSED_AT
  const wet = stink >= PUDDLE_AT
  const chewed = stink >= SHOE_AT
  const flies = reached(stink, FLY_AT)
  const drops = reached(stink, [CROSSED_AT, PUDDLE_AT, SHOE_AT])
  const hazard = { crossed, puddle: wet, shoe: chewed, flies, sweat: drops }
  if (state === 'resting' && stink < CROSSED_AT) {
    return { ...CALM, view: 'asleep', leash: 'hook', mood: 'sleepy' }
  }
  if (state === 'due') {
    return {
      ...CALM,
      ...hazard,
      view: 'door',
      step: MAX_STEP,
      leash: 'feet',
      gaze: 0,
      wag: !crossed,
      begging: !crossed,
      mood: crossed ? 'worried' : 'pleading',
    }
  }
  const step = state === 'resting' ? 0 : Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  return {
    ...CALM,
    ...hazard,
    view: 'door',
    step,
    leash: 'mouth',
    gaze: GAZE[step] ?? 0,
    tilt: TILT[step] ?? 0,
    wag: !crossed && step >= 2,
    mood: crossed ? 'worried' : step >= MAX_STEP ? 'pleading' : 'calm',
  }
}

const FUR = '#f0b76f'
const FUR_DARK = '#d89149'
const EAR = '#92593a'
const EAR_DARK = '#6e4128'
const NOSE = '#3a2417'
const TONGUE = '#ff8fa0'
const TONGUE_DARK = '#dd6578'
const MUD = '#6f4a2d'
const MUD_DARK = '#54351e'
const PEE = '#f3d64c'
const PEE_LIGHT = '#fbeb93'
const DOOR = '#3f9c91'
const DOOR_DARK = '#2f7f76'
const DOOR_LIGHT = '#57b3a8'
const JAMB = '#dcd4c0'
const JAMB_DARK = '#b5ad98'
const MAT = '#c99a62'
const MAT_DARK = '#a2763f'
const SAND = '#e6c896'
const SAND_DARK = '#c9a874'
const SHOE = '#5ab4ff'
const SHOE_DARK = '#3a8fdb'
const HILL = '#3f8f6a'
const HILL_FAR = '#357a64'
const TREE_TRUNK = '#7a5234'

interface Tones {
  main: string
  dark: string
  light: string
}

function tonesOf(scene: SceneView): Tones {
  const main = accentOf(scene, C.coral)
  return { main, dark: shadeOf(main), light: tintOf(main, 0.55) }
}

function strap(d: string, tones: Tones, width = 6): Art {
  return part('leash', [
    svg`<path d=${d} fill="none" stroke=${tones.dark} stroke-width=${width + 2} stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d=${d} fill="none" stroke=${tones.main} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d=${d} fill="none" stroke=${tones.light} stroke-width="1.4" stroke-linecap="round" stroke-dasharray="3 6" />`,
  ])
}

function clip(x: number, y: number, rotate = 0): Art {
  return part(
    'clip',
    at(
      x,
      y,
      [
        svg`<circle r="5" fill="none" stroke=${C.metalDark} stroke-width="3" />`,
        svg`<path d="M5-1h9q4 0 4 4t-4 4h-3" fill="none" stroke=${C.metalMid} stroke-width="3.4" stroke-linecap="round" />`,
      ],
      rotate,
    ),
  )
}

function earShape(lift: number): Art {
  return at(
    0,
    0,
    [
      svg`<path d="M6-7C-12-15-29-3-31 22C-32 39-16 45-9 31C-5 21-2 9 7 6Z" fill=${EAR} />`,
      svg`<path d="M-15 10C-20 19-21 27-18 33" fill="none" stroke=${EAR_DARK} stroke-width="3" stroke-linecap="round" />`,
    ],
    lift,
  )
}

interface HeadLook {
  mood: Mood
  gaze: number
  ears?: readonly [number, number]
  tongue?: boolean
  bite?: Tones
}

function tongueArt(): Art {
  return [
    svg`<path d="M-7 0H7V12A7 7 0 0 1-7 12Z" fill=${TONGUE} />`,
    svg`<path d="M0 2V12" stroke=${TONGUE_DARK} stroke-width="2.2" stroke-linecap="round" />`,
  ]
}

function head(look: HeadLook): Art {
  const g = look.gaze
  const [left, right] = look.ears ?? [0, 0]
  const leftEar = at(-24, -18, earShape(left))
  const rightEar = svg`<g transform="scale(-1 1)">${at(-24, -18, earShape(right))}</g>`
  return part('head', [
    svg`<path d="M0-31C23-31 36-17 36 2C36 21 21 31 0 31C-21 31-36 21-36 2C-36-17-23-31 0-31Z" fill=${FUR} />`,
    svg`<path d="M-7-29Q0-37 3-29Q7-34 10-27" fill=${FUR} stroke=${FUR} stroke-width="3" stroke-linejoin="round" />`,
    svg`<ellipse cx=${round(g * 0.75)} cy="-13" rx="5.5" ry="13" fill=${C.cream} />`,
    svg`<ellipse cx=${g - 26} cy="11" rx="6" ry="4" fill=${C.coral} opacity=".35" />`,
    svg`<ellipse cx=${g + 26} cy="11" rx="6" ry="4" fill=${C.coral} opacity=".35" />`,
    svg`<ellipse cx=${g} cy="12" rx="17.5" ry="13" fill=${C.cream} />`,
    when(look.tongue === true, () => at(g + 5, 14, motion('sway', tongueArt()))),
    face(g, 0, look.mood, NOSE, 1.2),
    svg`<path d=${`M${g - 5.5} 2.5Q${g} -1 ${g + 5.5} 2.5Q${g + 5} 7 ${g} 8.5Q${g - 5} 7 ${g - 5.5} 2.5Z`} fill=${NOSE} />`,
    svg`<ellipse cx=${g - 1.8} cy="2.8" rx="1.8" ry="1" fill="#fff" opacity=".7" />`,
    look.bite ? bite(g, look.bite) : [],
    leftEar,
    rightEar,
  ])
}

function bite(g: number, tones: Tones): Art {
  const loop = `M${g - 13} 19C${g - 28} 22 ${g - 29} 40 ${g - 18} 40C${g - 9} 40 ${g - 8} 29 ${g - 8} 20`
  return part('leash-bite', [
    svg`<path d=${loop} fill="none" stroke=${tones.dark} stroke-width="7.5" stroke-linecap="round" />`,
    svg`<path d=${loop} fill="none" stroke=${tones.main} stroke-width="5.5" stroke-linecap="round" />`,
    svg`<rect x=${g - 19} y="14" width="38" height="9" rx="4.5" fill=${tones.dark} />`,
    svg`<rect x=${g - 18} y="14.5" width="36" height="6.5" rx="3.25" fill=${tones.main} />`,
  ])
}

function collar(y: number, tones: Tones, w = 46): Art {
  return part('collar', [
    svg`<rect x=${-w / 2} y=${y} width=${w} height="11" rx="5.5" fill=${tones.main} />`,
    svg`<rect x=${-w / 2 + 3} y=${y + 7} width=${w - 6} height="3" rx="1.5" fill=${tones.dark} />`,
    svg`<circle cy=${y + 15} r="6.5" fill=${C.sun} />`,
    svg`<circle cy=${y + 15} r="3" fill=${C.sunDark} />`,
  ])
}

function paw(x: number, y: number, muddy: boolean): Art {
  const fill = muddy ? MUD : C.cream
  const toe = muddy ? MUD_DARK : C.creamDark
  return [
    svg`<ellipse cx=${x} cy=${y} rx="12" ry="8" fill=${fill} />`,
    svg`<path d=${`M${x - 4} ${y + 1.5}v3.5M${x + 4} ${y + 1.5}v3.5`} stroke=${toe} stroke-width="2.2" stroke-linecap="round" />`,
    when(
      muddy,
      () =>
        svg`<path d=${`M${x - 10} ${y - 5}q4-6 6 0t6 0t8-1`} fill="none" stroke=${MUD} stroke-width="4" stroke-linecap="round" />`,
    ),
  ]
}

interface SitPose {
  look: HeadLook
  tones: Tones
  tilt?: number
  lean?: number
  wag?: boolean
  begging?: boolean
  crossed?: boolean
  wiping?: boolean
  mud?: number
  strapEnd?: number
}

const HEAD_Y = -108

function limb(d: string, color: string, width: number): Art {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`
}

function legs(pose: SitPose): Art {
  const muddy = (pose.mud ?? 0) > 0
  if (pose.crossed) {
    const under = 'M-15-54C-15-34 14-26 17-7'
    const over = 'M15-54C15-34-14-26-17-7'
    return part('legs-crossed', [
      limb(under, mix(FUR, FUR_DARK, 0.75), 15),
      paw(18, -6, muddy),
      limb(over, FUR_DARK, 20),
      limb(over, FUR, 15),
      paw(-18, -6, muddy),
    ])
  }
  const right: Art = [
    limb('M14-52V-8', FUR, 15),
    limb('M22.5-40V-12', FUR_DARK, 2.6),
    paw(15, -6, muddy),
  ]
  const leftStill: Art = [
    limb('M-14-52V-8', FUR, 15),
    limb('M-22.5-40V-12', FUR_DARK, 2.6),
    paw(-15, -6, muddy),
  ]
  const gap = limb('M0-40V-10', FUR_DARK, 2.6)
  if (pose.begging) {
    return part('legs', [
      right,
      at(
        -14,
        -56,
        motion('wobble', [
          limb('M0 0L-30-18', FUR, 15),
          at(-33, -20, [
            svg`<circle r="10.5" fill=${C.cream} />`,
            svg`<ellipse cy="2" rx="4.6" ry="3.6" fill=${TONGUE} />`,
            svg`<circle cx="-4.6" cy="-3.6" r="1.8" fill=${TONGUE} /><circle cy="-5" r="1.8" fill=${TONGUE} /><circle cx="4.6" cy="-3.6" r="1.8" fill=${TONGUE} />`,
          ]),
        ]),
      ),
    ])
  }
  if (pose.wiping) {
    return part('legs', [
      leftStill,
      gap,
      at(14, -52, motion('slosh', [limb('M0 0L14 44', FUR, 15), paw(16, 46, true)])),
    ])
  }
  return part('legs', [leftStill, right, gap])
}

function sitting(pose: SitPose): Art {
  const lean = pose.lean ?? 0
  const tilt = pose.tilt ?? 0
  const mud = pose.mud ?? 0
  const tail = [
    svg`<path d="M0 0C-12-2-25-10-23-32" fill="none" stroke=${FUR_DARK} stroke-width="11" stroke-linecap="round" />`,
    svg`<path d="M-23-27L-23-33" fill="none" stroke=${C.cream} stroke-width="11" stroke-linecap="round" />`,
  ]
  return part('dog', [
    when(!pose.crossed, () => at(-36, -16, pose.wag ? motion('wobble', tail) : tail)),
    svg`<ellipse cx="-31" cy="-19" rx="18" ry="20" fill=${FUR_DARK} /><ellipse cx="31" cy="-19" rx="18" ry="20" fill=${FUR_DARK} />`,
    svg`<ellipse cx=${pose.crossed ? -30 : -41} cy="-6" rx="13" ry="7.5" fill=${C.cream} /><ellipse cx=${pose.crossed ? 30 : 41} cy="-6" rx="13" ry="7.5" fill=${C.cream} />`,
    svg`<path d=${`M${lean - 17}-88C-32-66-38-34-38-12C-38-3-33 0-26 0H26C33 0 38-3 38-12C38-34 32-66 ${lean + 17}-88Z`} fill=${FUR} />`,
    svg`<path d=${`M${lean - 13}-78C-23-58-18-36 0-28C18-36 23-58 ${lean + 13}-78Z`} fill=${C.cream} />`,
    at(lean, 0, collar(-86, pose.tones)),
    legs(pose),
    when(mud >= 2, () =>
      splats([
        [-26, -30, 5],
        [24, -46, 4],
        [-8, -58, 3.4],
      ]),
    ),
    at(lean, HEAD_Y, head(pose.look), tilt),
  ])
}

function splats(points: ReadonlyArray<readonly [number, number, number]>): Art {
  return part(
    'mud',
    points.map(
      ([x, y, r]) =>
        svg`<ellipse cx=${x} cy=${y} rx=${r} ry=${round(r * 0.8)} fill=${MUD} /><circle cx=${round(x + r * 1.5)} cy=${round(y - r * 0.9)} r=${round(r * 0.34)} fill=${MUD} /><circle cx=${round(x - r * 1.4)} cy=${round(y + r * 0.7)} r=${round(r * 0.26)} fill=${MUD} />`,
    ),
  )
}

function door(hook?: Tones): Art {
  return part('door', [
    svg`<rect x="118" y="26" width="72" height="146" rx="7" fill=${JAMB} />`,
    svg`<rect x="124" y="32" width="60" height="140" rx="3" fill=${DOOR} />`,
    svg`<rect x="132" y="104" width="44" height="58" rx="5" fill=${DOOR_DARK} />`,
    svg`<rect x="136" y="108" width="36" height="50" rx="3" fill=${DOOR_LIGHT} opacity=".28" />`,
    svg`<circle cx="154" cy="66" r="20" fill=${JAMB} />`,
    svg`<circle cx="154" cy="66" r="15.5" fill="#bfe6ff" />`,
    svg`<circle cx="160" cy="60" r="6" fill=${C.sun} />`,
    svg`<path d="M139 73Q147 64 155 71T169.5 69A15.5 15.5 0 0 1 139 73Z" fill=${C.leaf} />`,
    svg`<circle cx="130" cy="98" r="5.5" fill=${C.sunDark} /><circle cx="130" cy="97" r="4.5" fill=${C.sun} />`,
    svg`<rect x="114" y="168" width="80" height="6" rx="3" fill=${JAMB_DARK} />`,
    when(hook !== undefined, () => (hook ? hungLeash(154, 96, hook) : [])),
  ])
}

function hungLeash(x: number, y: number, tones: Tones): Art {
  return part('hung-leash', [
    strap(
      `M${x - 3} ${y + 2}C${x - 20} ${y + 16} ${x - 12} ${y + 42} ${x} ${y + 36}C${x + 12} ${y + 30} ${x + 8} ${y + 12} ${x + 3} ${y + 2}`,
      tones,
    ),
    strap(`M${x + 6} ${y + 18}C${x + 16} ${y + 34} ${x + 14} ${y + 46} ${x + 10} ${y + 52}`, tones),
    clip(x + 10, y + 57, 90),
    svg`<rect x=${x - 7} y=${y - 4} width="14" height="7" rx="3.5" fill=${C.metalMid} />`,
  ])
}

function scratches(): Art {
  return part(
    'scratches',
    svg`<path d="M146 146l5 16M155 144l5 18M164 147l4 14" fill="none" stroke=${DOOR_DARK} stroke-width="3" stroke-linecap="round" />`,
  )
}

const TICKS = ['M12-9l9-6', 'M0-16l3-10', 'M15 4h10'] as const

function eagerTicks(x: number, y: number, count: number): Art {
  return part(
    'eager',
    at(
      x,
      y,
      motion(
        'pulse',
        TICKS.slice(0, count).map(
          (d) =>
            svg`<path d=${d} fill="none" stroke=${C.sun} stroke-width="4" stroke-linecap="round" />`,
        ),
      ),
    ),
  )
}

function puddle(x: number): Art {
  return part('puddle', [
    svg`<path d=${`M${x - 50} 182C${x - 54} 174 ${x - 28} 172 ${x} 173C${x + 28} 172 ${x + 54} 174 ${x + 50} 182C${x + 48} 190 ${x + 24} 187 ${x + 8} 190C${x - 8} 193 ${x - 20} 187 ${x - 32} 190C${x - 44} 192 ${x - 48} 188 ${x - 50} 182Z`} fill=${PEE} />`,
    svg`<path d=${`M${x + 22} 185q8 1.5 15-1`} fill="none" stroke=${PEE_LIGHT} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<path d=${`M${x - 36} 185q6 1.5 12 0`} fill="none" stroke=${PEE_LIGHT} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function shoe(x: number, y: number): Art {
  return part(
    'shoe',
    at(
      x,
      y,
      [
        shadow(0, 2, 30, 0.24),
        svg`<circle cx="-30" cy="-30" r="4.5" fill=${C.cream} /><circle cx="26" cy="-27" r="3.2" fill=${C.cream} /><circle cx="34" cy="-16" r="2.4" fill=${C.cream} />`,
        svg`<path d="M-29-6V-25Q-29-31-23-31H-11L-1-21L4-25L8-18L14-22L17-14L24-17L25-6Z" fill=${SHOE} />`,
        svg`<path d="M-29-24H-14V-6H-29Z" fill=${SHOE_DARK} opacity=".55" />`,
        svg`<path d="M-30-6H27L24 0H-27Q-30 0-30-3Z" fill=${C.cream} />`,
        svg`<path d="M-30-6H4L1-2L-4-5L-9-1L-14-5H-30Z" fill=${C.creamDark} />`,
        svg`<path d="M-6-19l6-4M-2-14l6-4" stroke="#fff" stroke-width="2.6" stroke-linecap="round" />`,
        svg`<path d="M-24-20v3M-19-20v3M-22-13v3" stroke=${SHOE_DARK} stroke-width="2" stroke-linecap="round" />`,
        at(38, -2, svg`<path d="M-7 2L-4-5L1-1L5-6L8 2Z" fill=${SHOE} />`),
      ],
      -5,
      0.85,
    ),
  )
}

function sweat(count: number, x: number, y: number): Art {
  const spots = [
    [-46, -36, 0.85, 1],
    [-22, -44, 0.7, 3],
    [-54, -10, 0.6, 2],
  ] as const
  return part(
    'sweat',
    spots
      .slice(0, count)
      .map(([dx, dy, s, d]) => at(x + dx, y + dy, motion('drip', drop(0, 0, C.water, s), d))),
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

function treeThought(): Art {
  return part('thought', [
    svg`<circle cx="130" cy="58" r="3.6" fill=${C.cream} /><circle cx="140" cy="46" r="5.5" fill=${C.cream} />`,
    at(
      166,
      36,
      motion('pulse', [
        svg`<circle r="22" fill=${C.cream} />`,
        svg`<rect x="-3" y="2" width="6" height="14" rx="2" fill=${TREE_TRUNK} />`,
        svg`<circle cy="-5" r="11" fill=${C.leaf} /><circle cx="-8" cy="1" r="7" fill=${C.leaf} /><circle cx="8" cy="1" r="7" fill=${C.leafDark} />`,
      ]),
    ),
  ])
}

function coil(x: number, y: number, tones: Tones, loose: boolean): Art {
  const ring = (cy: number, rx: number): Art => [
    svg`<ellipse cx="0" cy=${cy} rx=${rx} ry="5.5" fill="none" stroke=${tones.dark} stroke-width="8" />`,
    svg`<ellipse cx="0" cy=${cy} rx=${rx} ry="5.5" fill="none" stroke=${tones.main} stroke-width="5" />`,
  ]
  return part(
    'leash-coil',
    at(x, y, [
      ring(0, 22),
      ring(-5, 17),
      ring(-10, 11),
      loose ? [strap('M20 1C32 6 40 5 46 2', tones, 5.5), clip(50, 1, 0)] : [],
    ]),
  )
}

function doorView(parts: DogwalkParts, tones: Tones): Art {
  const due = parts.leash === 'feet'
  const x = due ? 86 : 68 + parts.step * 3
  const scale = due ? 1.04 : 0.94
  const lean = LEAN[parts.step] ?? 0
  const pose: SitPose = {
    tones,
    look: {
      mood: parts.mood,
      gaze: parts.gaze,
      ears: due ? [10, 10] : [parts.step * 2, parts.step * 5],
      bite: due ? undefined : tones,
    },
    tilt: parts.tilt,
    lean: due ? 0 : lean,
    wag: parts.wag,
    begging: parts.begging,
    crossed: parts.crossed,
  }
  const dog = at(x, 172, sitting(pose), 0, scale)
  const headY = 172 + HEAD_Y * scale
  return [
    door(),
    when(parts.step >= MAX_STEP && !due, scratches),
    shadow(x, 176, 50),
    when(parts.puddle, () => puddle(x)),
    parts.crossed ? motion('rumble', dog) : dog,
    when(parts.leash === 'mouth', () => mouthStrap(x, scale, lean, parts, tones)),
    when(due, () => (parts.crossed ? coil(30, 180, tones, false) : coil(94, 180, tones, true))),
    when(due, treeThought),
    when(parts.step > 0 && !due && !parts.crossed, () =>
      eagerTicks(x + 40, headY - 26, parts.step),
    ),
    sweat(parts.sweat, x, headY),
    when(parts.shoe, () => shoe(156, 182)),
    when(parts.flies > 0, () => fly(176, 118, 0)),
  ]
}

function mouthStrap(x: number, s: number, lean: number, parts: DogwalkParts, tones: Tones): Art {
  const a = (parts.tilt * Math.PI) / 180
  const px = parts.gaze + 18
  const py = 18
  const sx = round(x + s * (lean + px * Math.cos(a) - py * Math.sin(a)))
  const sy = round(172 + s * (HEAD_Y + px * Math.sin(a) + py * Math.cos(a)))
  const ex = 128
  const ey = 178
  return [
    strap(`M${sx} ${sy}C${sx + 12} ${sy + 34} ${sx - 10} 152 ${ex - 18} ${ey}L${ex} ${ey}`, tones),
    clip(ex + 4, ey, 0),
  ]
}

function lying(tones: Tones, look: HeadLook): Art {
  return part('dog', [
    at(-58, -12, [
      svg`<path d="M0 0C-14 2-20-6-16-18" fill="none" stroke=${FUR_DARK} stroke-width="11" stroke-linecap="round" />`,
      svg`<path d="M-16-14L-16-20" fill="none" stroke=${C.cream} stroke-width="11" stroke-linecap="round" />`,
    ]),
    svg`<path d="M-64-6C-72-36-50-60-20-60C8-60 26-48 30-30Q32-8 18 0H-58Q-63 0-64-6Z" fill=${FUR} />`,
    svg`<ellipse cx="-40" cy="-26" rx="24" ry="25" fill=${FUR_DARK} />`,
    svg`<ellipse cx="-22" cy="-7" rx="17" ry="7.5" fill=${C.cream} />`,
    svg`<path d="M-8-56Q-18-32-8-7" fill="none" stroke=${tones.dark} stroke-width="12" />`,
    svg`<path d="M-8-56Q-18-32-8-7" fill="none" stroke=${tones.main} stroke-width="9" />`,
    paw(8, -6, false),
    paw(52, -6, false),
    at(30, -36, head(look), 0, 0.95),
  ])
}

function asleepView(parts: DogwalkParts, tones: Tones): Art {
  return [
    door(tones),
    shadow(78, 178, 66),
    at(84, 176, lying(tones, { mood: parts.mood, gaze: 0, ears: [4, 4] }), 0, 0.92),
    zed(110, 74, 0.7, 1),
    zed(96, 54, 1, 2),
    zed(76, 34, 0.65, 3),
  ]
}

function heart(x: number, y: number, size: number, delay: number): Art {
  return part(
    'heart',
    at(
      x,
      y,
      motion(
        'bob',
        svg`<path d="M0 9C-12 1-12-9-5-9C-2-9 0-7 0-5C0-7 2-9 5-9C12-9 12 1 0 9Z" fill=${C.pink} />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function bedView(parts: DogwalkParts, tones: Tones): Art {
  return [
    part('wall-hook', [
      svg`<rect x="142" y="30" width="40" height="11" rx="5.5" fill=${JAMB} />`,
      svg`<circle cx="149" cy="35.5" r="1.8" fill=${JAMB_DARK} /><circle cx="175" cy="35.5" r="1.8" fill=${JAMB_DARK} />`,
      hungLeash(162, 40, tones),
    ]),
    shadow(94, 183, 82),
    part('bed', [
      svg`<rect x="14" y="132" width="164" height="50" rx="25" fill=${tones.dark} />`,
      svg`<rect x="14" y="128" width="164" height="46" rx="23" fill=${tones.main} />`,
      svg`<ellipse cx="96" cy="150" rx="66" ry="15" fill=${tones.light} />`,
      svg`<path d="M28 142Q24 150 30 158M164 142Q168 150 162 158" fill="none" stroke=${tones.dark} stroke-width="3" stroke-linecap="round" />`,
    ]),
    at(92, 160, lying(tones, { mood: parts.mood, gaze: 0, ears: [8, 8], tongue: true }), 0, 0.92),
    heart(112, 62, 1.05, 1),
    heart(92, 40, 0.7, 2),
    sparkle(34, 86, 1.2, 1),
    sparkle(26, 42, 0.8, 3),
    sparkle(138, 92, 0.8, 2),
    sparkle(62, 28, 0.7, 4),
  ]
}

function pawPrint(x: number, y: number, rotate: number, index: number): Art {
  return part(
    'paw-print',
    at(
      x,
      y,
      [
        svg`<ellipse cy="2" rx="5.5" ry="4" fill=${MUD} />`,
        svg`<circle cx="-5.5" cy="-3" r="2" fill=${MUD} /><circle cx="-1.8" cy="-5.2" r="2" fill=${MUD} /><circle cx="2.2" cy="-5.2" r="2" fill=${MUD} /><circle cx="5.8" cy="-3" r="2" fill=${MUD} />`,
      ],
      rotate,
    ),
    index,
  )
}

const PRINT_SPOTS = [
  [178, 181, -80],
  [160, 177, -76],
  [15, 181, 80],
  [136, 46, -24],
] as const

function mat(): Art {
  return part('mat', [
    svg`<path d="M24 186L38 168H134L148 186Z" fill=${MAT_DARK} />`,
    svg`<path d="M30 183L41 170H131L142 183Z" fill=${MAT} />`,
    svg`<path d="M28 186h4M38 186h4M48 186h4M58 186h4M68 186h4M78 186h4M88 186h4M98 186h4M108 186h4M118 186h4M128 186h4M138 186h4" stroke=${MAT_DARK} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function smears(): Art {
  return part(
    'smears',
    svg`<path d="M88 178q14-5 30-1M94 182q10-3 26 0M50 177q8-3 16-1" fill="none" stroke=${MUD} stroke-width="4" stroke-linecap="round" />`,
  )
}

function matView(parts: DogwalkParts, tones: Tones): Art {
  const pose: SitPose = {
    tones,
    look: { mood: parts.mood, gaze: parts.gaze, ears: [2, 4] },
    tilt: parts.tilt,
    wiping: true,
    mud: parts.mud,
  }
  const lines: ReadonlyArray<readonly [number, number]> = [
    [20, 112],
    [178, 112],
  ]
  return [
    door(tones),
    PRINT_SPOTS.slice(0, parts.prints).map(([x, y, r], i) => pawPrint(x, y, r, i)),
    mat(),
    smears(),
    at(86, 172, sitting(pose), 0, 0.96),
    at(112, 172, motion('drip', drop(0, 0, MUD, 0.62), 2)),
    stenchLines(lines.slice(0, parts.stench)),
    (
      [
        [26, 50],
        [172, 34],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([x, y], i) => fly(x, y, i)),
  ]
}

function scenery(): Art {
  return part('park', [
    svg`<circle cx="172" cy="32" r="14" fill=${C.sun} />`,
    svg`<path d="M0 168C22 142 58 140 92 158C118 144 164 138 200 168Z" fill=${HILL_FAR} />`,
    svg`<circle cx="16" cy="164" r="11" fill=${HILL} /><circle cx="32" cy="167" r="8" fill=${HILL} /><circle cx="176" cy="163" r="12" fill=${HILL} /><circle cx="160" cy="167" r="8" fill=${HILL} />`,
    svg`<rect x="8" y="172" width="184" height="14" rx="7" fill=${SAND} />`,
    svg`<path d="M26 179h12M64 179h12M102 179h12M140 179h12" stroke=${SAND_DARK} stroke-width="3" stroke-linecap="round" />`,
  ])
}

function bounding(parts: DogwalkParts, tones: Tones): Art {
  const leg = (d: string, color = FUR): Art =>
    svg`<path d=${d} fill="none" stroke=${color} stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />`
  const end = (x: number, y: number, r: number): Art =>
    at(x, y, svg`<ellipse rx="11.5" ry="7.5" fill=${parts.mud > 0 ? MUD : C.cream} />`, r)
  return part('dog', [
    leg('M-38 10C-54 18-66 24-76 26', FUR_DARK),
    leg('M36 12C50 22 58 32 64 44', FUR_DARK),
    end(-82, 27, 12),
    end(67, 49, 60),
    at(
      -52,
      -14,
      motion('wobble', [
        svg`<path d="M0 0C-14-8-24-20-22-40" fill="none" stroke=${FUR_DARK} stroke-width="11" stroke-linecap="round" />`,
        svg`<path d="M-22-35L-22-41" fill="none" stroke=${C.cream} stroke-width="11" stroke-linecap="round" />`,
      ]),
    ),
    svg`<path d="M-60-2C-60-26-36-32-12-30C14-28 40-36 54-20C66-6 58 20 36 22C10 26-20 26-40 24C-54 22-60 14-60-2Z" fill=${FUR} />`,
    svg`<path d="M-30 22C-10 27 16 26 38 21C48 16 54 8 52 2C34 16 0 16-30 22Z" fill=${C.cream} />`,
    svg`<ellipse cx="-36" cy="0" rx="22" ry="21" fill=${FUR_DARK} opacity=".55" />`,
    leg('M-32 12C-44 26-52 38-58 46'),
    leg('M44 8C58 16 72 24 82 26'),
    end(-61, 50, 60),
    end(87, 28, 12),
    when(parts.mud >= 1, () =>
      splats([
        [-18, 4, 5],
        [12, 12, 4],
      ]),
    ),
    when(parts.mud >= 2, () =>
      splats([
        [-42, -10, 4.4],
        [30, -8, 4],
        [-2, -18, 3.2],
      ]),
    ),
    svg`<path d="M36-34Q54-12 45 19" fill="none" stroke=${tones.dark} stroke-width="13" />`,
    svg`<path d="M36-34Q54-12 45 19" fill="none" stroke=${tones.main} stroke-width="10" />`,
    strap('M44-14C16-70-14-48-40-70C-48-78-56-88-66-82', tones, 5.5),
    at(
      -72,
      -84,
      svg`<circle r="8.5" fill="none" stroke=${tones.dark} stroke-width="6" /><circle r="8.5" fill="none" stroke=${tones.main} stroke-width="3.6" />`,
    ),
    at(62, -36, head({ mood: 'happy', gaze: 6, ears: [62, -14], tongue: true }), 6, 0.9),
  ])
}

function boundingView(parts: DogwalkParts, tones: Tones): Art {
  return [
    scenery(),
    shadow(96, 179, 56, 0.16),
    part(
      'dust',
      (
        [
          [18, 164, 6, 1],
          [30, 156, 4, 2],
          [12, 150, 3, 3],
        ] as const
      ).map(([x, y, r, d]) =>
        at(x, y, motion('drift', svg`<circle r=${r} fill=${SAND} opacity=".75" />`, d)),
      ),
    ),
    part(
      'speed',
      (
        [
          [14, 100, 14, 1],
          [10, 118, 10, 2],
          [16, 134, 12, 3],
        ] as const
      ).map(([x, y, w, d]) =>
        at(
          x,
          y,
          motion(
            'flicker',
            svg`<path d=${`M0 0H${w}`} stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".55" />`,
            d,
          ),
        ),
      ),
    ),
    at(92, 104, motion('bob', at(0, 0, bounding(parts, tones), -5, 0.86))),
    when(parts.flies > 0, () => fly(136, 28, 0)),
  ]
}

export function dogwalk(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = dogwalkParts(scene)
  const views: Record<DogwalkView, (parts: DogwalkParts, tones: Tones) => Art> = {
    door: doorView,
    asleep: asleepView,
    bounding: boundingView,
    mat: matView,
    bed: bedView,
  }
  const art = views[parts.view](parts, tonesOf(scene))
  return frame('dogwalk', scene, options, art)
}
