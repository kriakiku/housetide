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
import { bubble, ding } from './laundry.ts'

export type CarwashView = 'parked' | 'washing' | 'drying' | 'shining'

export interface CarwashParts {
  view: CarwashView
  splash: number
  caked: number
  droppings: number
  moss: number
  bird: boolean
  flat: boolean
  stench: number
  flies: number
  kit: boolean
  asleep: boolean
  murk: number
  mood: Mood
}

export const MAX_SPLASH = 4

const CAKED_AT = [0.05, 0.25] as const
const DROPPINGS_AT = [0.15, 0.4] as const
const MOSS_AT = [0.35, 0.65] as const
const STENCH_AT = [0.55, 0.8] as const
const FLIES_AT = [0.6, 0.85] as const
const BIRD_AT = 0.5
const FLAT_AT = 0.9
const SICK_AT = 0.6

const SPOTLESS = {
  splash: 0,
  caked: 0,
  droppings: 0,
  moss: 0,
  bird: false,
  flat: false,
  stench: 0,
  flies: 0,
  kit: false,
  asleep: false,
  murk: 0,
} as const

export function carwashParts(scene: SceneView): CarwashParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') return { ...SPOTLESS, view: 'shining', mood: 'happy' }
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  const droppings = reached(stink, DROPPINGS_AT)
  const bird = stink >= BIRD_AT
  const sick = stink >= SICK_AT
  if (state === 'running') {
    const scrubbed = reached(clamp01(scene.progress), [0.34, 0.67])
    return {
      ...SPOTLESS,
      view: 'washing',
      splash: Math.max(0, 2 - scrubbed),
      murk: reached(stink, [0.05, 0.4]),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...SPOTLESS,
      view: 'drying',
      droppings,
      bird,
      stench,
      flies,
      murk: reached(stink, [0.2, 0.5]),
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_SPLASH, Math.floor(fill * (MAX_SPLASH + 1)))
  const splash = due ? MAX_SPLASH : resting ? 0 : raw
  let mood: Mood = resting ? 'sleepy' : splash >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...SPOTLESS,
    view: 'parked',
    splash,
    caked: reached(stink, CAKED_AT),
    droppings,
    moss: reached(stink, MOSS_AT),
    bird,
    flat: stink >= FLAT_AT,
    stench,
    flies,
    kit: due,
    asleep: resting,
    murk: reached(stink, [0.05, 0.4]),
    mood,
  }
}

const BODY =
  'M-76-18C-80-42-72-62-44-66L-38-68C-30-98-12-116 12-116C40-116 58-96 64-70C76-66 82-48 78-18Q78-12 70-12H-68Q-76-12-76-18Z'
const SILL = 'M-77-31H79.3Q79-24 78-18Q78-12 70-12H-68Q-76-12-76-18Q-77-24-77-31Z'
const FRONT_GLASS = 'M-31-72C-25-92-13-105 3-107.5Q6-108 6-105V-75Q6-72 3-72Z'
const REAR_GLASS = 'M16-105Q16-108 19-107.5C36-105 50-92 56-75Q57-72 54-72H19Q16-72 16-75Z'
const FRONT_SHINE = 'M-8-100L-18-76H-10L0-103.5Z'
const REAR_SHINE = 'M31-102L25-76H31L38-99Z'
const WIPED = 'M-22-74A22 22 0 0 1 2-92V-74Z'

const FRONT_WHEEL = -46
const REAR_WHEEL = 50
const FACE_X = 4
const FACE_Y = -45

const GLASS = '#c4e8fc'
const MUD = '#8a5f3c'
const MUD_DARK = '#6a4529'
const MUD_LIGHT = '#a97c52'
const POO = '#f6f3e8'
const POO_DARK = '#a3a78f'
const MOSS = '#5f9440'
const MOSS_DARK = '#44702f'
const MOSS_LIGHT = '#86b85a'
const FOAM = '#fbfdff'
const FOAM_SHADE = '#cde2f5'
const CHAMOIS = '#f0cf95'
const CHAMOIS_DARK = '#cfa565'
const TYRE = '#20243b'
const SPONGE = '#ffd76a'
const SPONGE_DARK = '#e8ae3c'
const PIGEON = '#b9c3d8'
const PIGEON_DARK = '#8590ad'

interface Tone {
  body: string
  dark: string
  deep: string
  light: string
  ink: string
}

function toneOf(accent: string): Tone {
  const n = Number.parseInt(accent.slice(1), 16)
  const luma = 0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)
  return {
    body: accent,
    dark: shadeOf(accent),
    deep: shadeOf(accent, 0.55),
    light: tintOf(accent),
    ink: luma < 80 ? C.cream : mix(accent, '#1b1f33', 0.82),
  }
}

function wheel(x: number, flat: boolean): Art {
  if (flat) {
    return part(
      'wheel',
      at(x, 0, [
        svg`<path d="M-23 0C-25-5-18-8-16-14C-12-26 12-26 16-14C18-8 25-5 23 0Q22 1 20 1H-20Q-22 1-23 0Z" fill=${TYRE} />`,
        svg`<circle cy="-13" r="7.5" fill=${C.metal} />`,
        svg`<circle cy="-13" r="2.8" fill=${C.metalDark} />`,
      ]),
    )
  }
  return part(
    'wheel',
    at(x, -16, [
      svg`<circle r="16.5" fill=${TYRE} />`,
      svg`<circle r="8.5" fill=${C.metal} />`,
      svg`<circle r="3" fill=${C.metalDark} />`,
    ]),
  )
}

function arch(x: number, color: string): Art {
  return svg`<path d=${`M${x - 25} -12A25 25 0 0 1 ${x + 25} -12Z`} fill=${color} />`
}

const CROWN_HEIGHT = [31, 34, 37, 41] as const
const FINGERS_AT = [2, 3, 5, 6] as const

const FINGERS = [
  [-9, -26, -14, -42],
  [11, -26, 18, -40],
  [-20, -18, -28, -29],
  [1, -32, 2, -48],
  [19, -18, 27, -28],
  [-17, -30, -22, -46],
] as const

const AIR_MUD = [
  [2, -68, -76, 3.2, 1],
  [2, -54, -84, 2.4, 2],
  [3, -74, -96, 4.2, 3],
  [3, -46, -96, 3, 4],
  [3, 78, -78, 3.2, 1],
  [4, -60, -114, 5, 2],
  [4, -84, -80, 2.8, 5],
  [4, 78, -100, 4.2, 3],
] as const

function mirrored(x: number, art: Art): Art {
  return svg`<g transform=${`translate(${x} -12) scale(-1 1)`}>${art}</g>`
}

function wheelMud(level: number): Art {
  const h = CROWN_HEIGHT[level - 1] ?? CROWN_HEIGHT[0]
  const fingers = FINGERS.slice(0, FINGERS_AT[level - 1] ?? 2).map(([x0, y0, x1, y1]) => {
    const flingX = round(x1 + (x1 - x0) * 0.75)
    const flingY = round(y1 + (y1 - y0) * 0.75)
    return [
      svg`<path d=${`M${x0 - 7} ${y0 + 4}Q${x1 - 1} ${y0 - 2} ${x1 - 3} ${y1}A3 3 0 0 1 ${x1 + 3} ${y1}Q${x1 + 1} ${y0 - 2} ${x0 + 7} ${y0 + 4}Z`} fill=${MUD} />`,
      svg`<circle cx=${flingX} cy=${flingY} r="2.7" fill=${MUD} />`,
    ]
  })
  return [
    fingers,
    svg`<path d=${`M-28 0C-30 ${-h * 0.62}-20 ${-h}-4 ${-h}C12 ${-h} 28 ${-h * 0.72} 28 0Z`} fill=${MUD} />`,
    svg`<path d=${`M-19 ${-h + 8}C-14 ${-h + 3}-8 ${-h + 2}-2 ${-h + 2}`} fill="none" stroke=${MUD_LIGHT} stroke-width="3" stroke-linecap="round" />`,
  ]
}

function splashMud(level: number): Art {
  if (level === 0) return []
  const art = wheelMud(level)
  return part('splash', [at(FRONT_WHEEL, -12, art), mirrored(REAR_WHEEL, art)], level)
}

function airMud(level: number): Art {
  return AIR_MUD.filter(([min]) => level >= min).map(([, x, y, r, delay]) =>
    part(
      'mud-fleck',
      at(
        x,
        y,
        motion(
          'rise',
          [
            svg`<circle r=${r} fill=${MUD_LIGHT} />`,
            svg`<circle cx=${r * 1.5} cy=${r * 1.3} r=${r * 0.45} fill=${MUD_LIGHT} />`,
          ],
          delay,
        ),
      ),
    ),
  )
}

function cake(level: number): Art {
  if (level === 0) return []
  return part('caked-mud', [
    svg`<path d="M-30-92C-20-112-4-120 12-120C38-120 57-103 61-84C59-77 54-77 52-84C50-91 46-92 44-86C42-75 36-75 34-86C32-96 26-96 24-90C22-79 16-79 14-90C12-100 4-100 2-94C0-83-6-83-8-94C-10-100-16-98-20-90C-24-83-29-85-30-92Z" fill=${MUD_DARK} />`,
    svg`<path d="M-16-103C-6-113 4-116 14-116C28-116 38-110 46-101" fill="none" stroke=${MUD_LIGHT} stroke-width="4" stroke-linecap="round" />`,
    when(
      level >= 2,
      () => svg`
      <path d="M-74-55C-64-70-52-70-37-72C-34-63-39-54-44-60C-48-66-52-60-54-53C-56-46-61-48-62-55C-64-60-69-52-74-55Z" fill=${MUD_DARK} />
      <path d="M62-72C74-68 82-58 81-46C78-40 74-42 73-49C72-55 67-54 66-49C64-42 60-44 60-52Z" fill=${MUD_DARK} />
      <path d="M-68-60C-62-65-54-67-46-68" fill="none" stroke=${MUD_LIGHT} stroke-width="3.4" stroke-linecap="round" />`,
    ),
  ])
}

const SPLATS = [
  [-54, -60, 0.95, 12],
  [34, -92, 0.9, -8],
  [58, -50, 1, 20],
  [-8, -92, 0.75, -14],
  [66, -34, 0.72, 8],
  [-62, -38, 0.72, -10],
] as const

function splat(x: number, y: number, size: number, rotate: number): Art {
  return part(
    'dropping',
    at(
      x,
      y,
      [
        svg`<path d="M0-7C3-8 6-6 5.5-3C9-1 8 4 5 4.5C6 9 3 15 1 15C-1 15-2 10-2 6C-6 7-9 3-6-1C-8-4-3-7 0-7Z" fill=${POO} />`,
        svg`<circle cx="-.5" cy="-.5" r="2.4" fill=${POO_DARK} />`,
      ],
      rotate,
      size,
    ),
  )
}

function droppingsArt(step: number): Art {
  return SPLATS.slice(0, step * 3).map(([x, y, s, r]) => splat(x, y, s, r))
}

function tuft(x: number, y: number, r: number): Art {
  return part(
    'moss',
    at(x, y, [
      svg`<g fill=${MOSS_DARK}><circle cx=${-r} cy="1" r=${r * 0.85} /><circle cx=${r} cy="1" r=${r * 0.85} /><rect x=${-r * 1.8} y="0" width=${r * 3.6} height=${r * 0.9} rx=${r * 0.4} /></g>`,
      svg`<circle cy=${-r * 0.45} r=${r} fill=${MOSS} />`,
      svg`<circle cx=${-r * 0.3} cy=${-r * 0.8} r=${r * 0.36} fill=${MOSS_LIGHT} />`,
    ]),
  )
}

function mushroom(x: number, y: number, size: number): Art {
  return part(
    'mushroom',
    at(
      x,
      y,
      [
        svg`<path d="M-3 0V-11H3V0Z" fill=${C.cream} />`,
        svg`<path d="M-11-9C-11-22 11-22 11-9Q11-7 9-7H-9Q-11-7-11-9Z" fill=${C.coral} />`,
        svg`<circle cx="-4" cy="-13" r="1.9" fill=${C.cream} /><circle cx="4" cy="-15" r="1.6" fill=${C.cream} /><circle cx="6" cy="-10" r="1.3" fill=${C.cream} />`,
      ],
      0,
      size,
    ),
  )
}

function sprout(): Art {
  const leaf = 'M0 0C-7-3-9-12-2-18C6-13 6-5 0 0Z'
  return part(
    'sprout',
    at(-8, -117, [
      svg`<path d="M0 2C-1-6 0-10 1-15" fill="none" stroke=${MOSS_DARK} stroke-width="2.6" stroke-linecap="round" />`,
      at(1, -14, svg`<path d=${leaf} fill=${MOSS} />`, 52, 0.95),
      at(1, -13, svg`<path d=${leaf} fill=${MOSS_LIGHT} />`, -48, 0.85),
    ]),
  )
}

function mossArt(step: number): Art {
  if (step === 0) return []
  return [
    tuft(44, -106, 5.5),
    tuft(-22, -106, 4.5),
    tuft(-12, -19, 6),
    tuft(14, -18, 5),
    when(step >= 2, () => [
      tuft(25, -117, 7),
      tuft(-58, -69, 5.5),
      tuft(72, -68, 5),
      tuft(1, -17, 7),
      sprout(),
      mushroom(-20, -13, 0.8),
      mushroom(20, -13, 1),
    ]),
  ]
}

function pigeon(): Art {
  return part('bird', [
    at(
      -6,
      -121,
      motion('bob', [
        svg`<path d="M3-1V5M9-1V5" stroke=${C.sunDark} stroke-width="2.2" stroke-linecap="round" />`,
        svg`<path d="M12-11L26-17L22-5Z" fill=${PIGEON_DARK} />`,
        svg`<ellipse cx="6" cy="-10" rx="13" ry="10.5" fill=${PIGEON} />`,
        svg`<circle cx="-5" cy="-21" r="7.5" fill=${PIGEON} />`,
        svg`<path d="M-1-12C5-16 14-14 16-8C10-3 2-4-1-12Z" fill=${PIGEON_DARK} />`,
        svg`<path d="M-12-23L-19-20.5L-12-18Z" fill=${C.sun} />`,
        svg`<circle cx="-7" cy="-22.5" r="1.8" fill=${C.fly} />`,
      ]),
    ),
    at(26, -112, motion('fall', drop(0, 0, POO, 0.72), 2)),
  ])
}

function antenna(tone: Tone): Art {
  return part('antenna', [
    svg`<path d="M54-90L72-122" stroke=${C.metalDark} stroke-width="2.8" stroke-linecap="round" />`,
    svg`<circle cx="72" cy="-123" r="4.2" fill=${tone.light} />`,
  ])
}

interface CarOptions {
  gloss?: Art
  over?: Art
  headlight?: string
}

function car(parts: CarwashParts, tone: Tone, options: CarOptions = {}): Art {
  const grime = parts.caked + parts.moss
  const glass = mix(GLASS, MUD_LIGHT, Math.min(1, parts.splash * 0.09 + grime * 0.2))
  const lamp = options.headlight ?? (parts.asleep ? C.metalMid : C.sun)
  const happy = parts.mood === 'happy'
  const shell: Art = [
    antenna(tone),
    svg`<path d=${BODY} fill=${tone.body} data-part="body" />`,
    svg`<path d=${SILL} fill=${tone.dark} />`,
    svg`<path d="M-68-54C-64-60-56-62-46-63" fill="none" stroke=${tone.light} stroke-width="4.5" stroke-linecap="round" />`,
    svg`<path d="M-6-111.5C4-114 22-114 34-109" fill="none" stroke=${tone.light} stroke-width="4" stroke-linecap="round" />`,
    svg`<path d=${FRONT_GLASS} fill=${glass} /><path d=${REAR_GLASS} fill=${glass} />`,
    svg`<path d=${FRONT_SHINE} fill="#fff" opacity=".7" /><path d=${REAR_SHINE} fill="#fff" opacity=".7" />`,
    when(grime >= 2, () => [
      svg`<path d=${WIPED} fill=${GLASS} />`,
      svg`<path d="M-1-74L-20-85" stroke=${C.fly} stroke-width="2.4" stroke-linecap="round" />`,
    ]),
    svg`<path d="M-38-67.5H66" stroke=${tone.dark} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<rect x="-41" y="-77" width="9" height="7" rx="3" fill=${tone.dark} />`,
    svg`<rect x="26" y="-61.5" width="12" height="4.6" rx="2.3" fill=${tone.deep} />`,
    options.gloss ?? [],
    svg`<ellipse cx="-73" cy="-48" rx="7" ry="9" fill=${lamp} />`,
    svg`<ellipse cx="-74.5" cy="-50.5" rx="2.4" ry="3.4" fill="#fff" opacity=".7" />`,
    svg`<rect x="74" y="-59" width="7" height="17" rx="3.5" fill=${C.coralDark} />`,
    wheelMudLayer(parts),
    arch(FRONT_WHEEL, tone.deep),
    arch(REAR_WHEEL, tone.deep),
    svg`<rect x="-85" y="-30" width="17" height="9" rx="4.5" fill=${C.metalMid} />`,
    svg`<rect x="71" y="-30" width="16" height="9" rx="4.5" fill=${C.metalMid} />`,
    cake(parts.caked),
    mossArt(parts.moss),
    droppingsArt(parts.droppings),
    when(happy, () => [
      svg`<ellipse cx=${FACE_X - 26} cy=${FACE_Y + 7} rx="5.5" ry="3.4" fill=${tintOf(tone.body, 0.5)} opacity=".85" />`,
      svg`<ellipse cx=${FACE_X + 26} cy=${FACE_Y + 7} rx="5.5" ry="3.4" fill=${tintOf(tone.body, 0.5)} opacity=".85" />`,
    ]),
    face(FACE_X, FACE_Y, parts.mood, tone.ink, 1.18),
    when(parts.bird, pigeon),
    options.over ?? [],
  ]
  return part('car', [
    parts.flat ? at(FRONT_WHEEL, 0, at(-FRONT_WHEEL, 0, shell), 3.6) : shell,
    wheel(FRONT_WHEEL, false),
    wheel(REAR_WHEEL, parts.flat),
  ])
}

function wheelMudLayer(parts: CarwashParts): Art {
  return splashMud(Math.max(parts.splash, parts.caked * 2))
}

function neglect(
  parts: CarwashParts,
  lines: ReadonlyArray<readonly [number, number]>,
  spots: ReadonlyArray<readonly [number, number]>,
): Art {
  return [
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return part(
    'zed',
    at(
      x,
      y,
      motion(
        'bob',
        at(
          0,
          0,
          svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
          0,
          size,
        ),
        delay,
      ),
    ),
  )
}

function moon(): Art {
  return part(
    'moon',
    at(40, 42, svg`<path d="M6-18A19 19 0 1 0 18 11A15.5 15.5 0 0 1 6-18Z" fill=${C.spark} />`, -8),
  )
}

function sponge(): Art {
  return [
    svg`<rect x="-20" y="-12" width="40" height="26" rx="8" fill=${SPONGE} />`,
    svg`<path d="M-20 5H20V6A8 8 0 0 1 12 14H-12A8 8 0 0 1-20 6Z" fill=${SPONGE_DARK} />`,
    svg`<g fill=${SPONGE_DARK}><circle cx="-10" cy="-5" r="2.6" /><circle cx="1" cy="-7" r="1.9" /><circle cx="11" cy="-3" r="2.8" /><circle cx="-2" cy="0" r="1.7" /></g>`,
  ]
}

function suds(spots: ReadonlyArray<readonly [number, number, number]>, murk = 0): Art {
  const shade = mix(FOAM_SHADE, MUD_LIGHT, murk * 0.4)
  const top = mix(FOAM, MUD_LIGHT, murk * 0.14)
  return [
    spots.map(([x, y, r]) => svg`<circle cx=${x} cy=${y + 2.4} r=${r} fill=${shade} />`),
    spots.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${top} />`),
  ]
}

function bucket(parts: CarwashParts): Art {
  const band = mix(C.skyDark, C.musty, parts.murk * 0.14)
  const pail = mix(C.sky, C.musty, parts.murk * 0.14)
  return part('bucket', [
    shadow(166, 184, 26, 0.26),
    at(
      166,
      184,
      at(
        0,
        0,
        [
          svg`<path d="M-23-42C-25-66 25-66 23-42" fill="none" stroke=${C.metalDark} stroke-width="4" stroke-linecap="round" />`,
          suds([
            [-15, -45, 8],
            [-3, -50, 10],
            [12, -47, 9],
            [19, -43, 5],
          ]),
          svg`<path d="M-24-41H24L19-5Q18 0 13 0H-13Q-18 0-19-5Z" fill=${pail} />`,
          svg`<rect x="-27" y="-45" width="54" height="9" rx="4.5" fill=${band} />`,
          svg`<path d="M-15-30L-12.5-8" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".5" />`,
          at(2, -60, motion('wobble', sponge(), 2), -8, 0.86),
        ],
        0,
        0.84,
      ),
    ),
    bubble(184, 118, 4.5, 1),
    bubble(146, 112, 3.4, 3),
  ])
}

function wish(): Art {
  return part('wish', [
    svg`<circle cx="122" cy="72" r="3.6" fill=${C.cream} /><circle cx="134" cy="62" r="5.6" fill=${C.cream} />`,
    at(
      165,
      41,
      motion('pulse', [
        svg`<circle r="27" fill=${C.cream} />`,
        drop(-8, 1, C.waterDark, 1.45),
        at(
          11,
          -3,
          svg`<path d="M0-10C1.2-3 3-1.2 10 0C3 1.2 1.2 3 0 10C-1.2 3-3 1.2-10 0C-3-1.2-1.2-3 0-10Z" fill=${C.sunDark} />`,
          0,
          1.15,
        ),
      ]),
    ),
  ])
}

function parkedView(parts: CarwashParts, tone: Tone): Art {
  const carX = parts.kit ? 84 : 100
  const scale = parts.kit ? 0.9 : parts.bird ? 0.92 : 1
  const tear =
    parts.kit && parts.mood !== 'sick'
      ? at(FACE_X - 24, FACE_Y + 10, motion('drip', drop(0, 0, C.water, 0.72), 2))
      : []
  return [
    shadow(carX + 4, 183, 84 * scale),
    part(
      'car-pose',
      at(carX, 182, [car(parts, tone, { over: tear }), airMud(parts.splash)], 0, scale),
    ),
    when(parts.kit, () => [bucket(parts), wish()]),
    when(parts.asleep, () => [
      moon(),
      zed(128, 56, 0.72, 1),
      zed(146, 38, 1, 2),
      zed(167, 24, 0.62, 3),
    ]),
    neglect(
      parts,
      parts.kit
        ? [
            [26, 92],
            [108, 66],
          ]
        : [
            [22, 112],
            [176, 110],
          ],
      parts.kit
        ? [
            [40, 48],
            [74, 26],
          ]
        : [
            [36, 40],
            [160, 36],
          ],
    ),
  ]
}

function gantry(): Art {
  const nozzles = [34, 80, 126]
  const spray = nozzles.flatMap((x, n) => [
    at(
      x,
      34,
      motion(
        'flicker',
        svg`<path d="M0 0L-15 42M0 0V46M0 0L15 42" fill="none" stroke=${C.water} stroke-width="4" stroke-linecap="round" stroke-dasharray="9 8" />`,
        n + 1,
      ),
    ),
    at(x - 9, 56, motion('fall', drop(0, 0, C.water, 0.8), n + 1)),
    at(x + 10, 62, motion('fall', drop(0, 0, '#dff5ff', 0.7), n + 3)),
  ])
  return part('gantry', [
    spray,
    nozzles.map(
      (x) => svg`<rect x=${x - 7} y="24" width="14" height="11" rx="3" fill=${C.metalDark} />`,
    ),
    svg`<rect x="12" y="15" width="176" height="13" rx="6.5" fill=${C.metalMid} />`,
    svg`<rect x="12" y="23" width="176" height="5" rx="2.5" fill=${C.metalDark} />`,
  ])
}

function brush(): Art {
  const rows = [0, 1, 2, 3, 4, 5]
  const bristles = rows.map((i) => {
    const y = 34 + i * 24
    const fill = i % 2 === 0 ? C.lilac : C.lilacDark
    return svg`<rect x="-22" y=${y} width="44" height="27" rx="13" fill=${fill} />`
  })
  const streaks = rows.map((i) =>
    at(
      0,
      46 + i * 24,
      motion(
        'flicker',
        svg`<path d="M-13-4V4M0-6V6M13-4V4" stroke=${i % 2 === 0 ? C.lilacDark : C.lilac} stroke-width="3" stroke-linecap="round" />`,
        (i % 3) + 1,
      ),
    ),
  )
  return part('brush', [
    shadow(165, 184, 26, 0.26),
    at(165, 0, [
      svg`<rect x="-4" y="26" width="8" height="12" fill=${C.metalDark} />`,
      motion('rumble', [bristles, streaks]),
    ]),
  ])
}

const ROOF_FOAM = [
  [-26, -98, 9],
  [-14, -112, 11],
  [3, -119, 13],
  [22, -120, 12],
  [39, -112, 11],
  [52, -99, 9],
] as const

const BODY_FOAM = [
  [-66, -68, 8],
  [-52, -74, 10],
  [-38, -72, 7],
  [-18, -18, 7],
  [-6, -15, 9],
  [10, -14, 10],
  [24, -18, 7],
  [64, -74, 8],
  [76, -62, 7],
] as const

function sponging(): Art {
  return part(
    'sponge',
    at(
      -60,
      -92,
      motion('wobble', [
        sponge(),
        suds([
          [-20, 15, 6],
          [-7, 19, 7],
          [10, 18, 6],
          [22, 12, 5],
        ]),
      ]),
      -14,
      1.08,
    ),
  )
}

function runoff(parts: CarwashParts): Art {
  const color = mix(C.water, MUD, parts.murk * 0.38)
  return part(
    'runoff',
    svg`<ellipse cx="86" cy="184" rx="76" ry="6" fill=${color} opacity=".75" />`,
  )
}

function washingView(parts: CarwashParts, tone: Tone): Art {
  const over: Art = [suds(ROOF_FOAM, parts.murk), suds(BODY_FOAM, parts.murk), sponging()]
  return [
    runoff(parts),
    part('car-pose', at(80, 182, car(parts, tone, { over }), 0, 0.9)),
    brush(),
    gantry(),
    bubble(24, 128, 7, 1),
    bubble(128, 74, 8, 2),
    bubble(16, 96, 5, 3),
    bubble(102, 64, 5.5, 4),
    bubble(142, 120, 5, 5),
  ]
}

const DROPLETS = [
  [36, -56, 0.48],
  [50, -48, 0.56],
  [64, -56, 0.5],
  [34, -40, 0.42],
  [-28, -56, 0.44],
  [-58, -44, 0.5],
  [-16, -80, 0.42],
] as const

function chamois(parts: CarwashParts): Art {
  const cloth = mix(CHAMOIS, C.musty, parts.murk * 0.22)
  const fold = mix(CHAMOIS_DARK, C.mustyDark, parts.murk * 0.22)
  return part(
    'chamois',
    at(
      34,
      -116,
      motion('sway', [
        svg`<path d="M-24-4C-6-7 12 2 26 25C29 30 28 34 25 36L22 50C21 56 15 56 13 51C11 46 7 46 5 52C3 58-3 58-5 52C-7 46-11 46-13 52C-15 57-21 57-22 51L-27 2C-27-2-26-4-24-4Z" fill=${cloth} />`,
        svg`<path d="M-14 30L-13 46M-1 32L-1 47M13 34L13 45" fill="none" stroke=${fold} stroke-width="2.8" stroke-linecap="round" />`,
        svg`<path d="M-19 7C-8 7 3 11 12 19" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".5" />`,
      ]),
    ),
  )
}

function dryingView(parts: CarwashParts, tone: Tone): Art {
  const gloss: Art = [svg`<path d="M-16-66L-30-30H-20L-6-66Z" fill="#fff" opacity=".22" />`]
  const beads: Art = part(
    'beads',
    DROPLETS.map(([x, y, s]) => at(x, y, [drop(0, 0, '#dff5ff', s)])),
  )
  const over: Art = [beads, chamois(parts)]
  const drips = (
    [
      [-76, -6, 0.7, 1],
      [-14, -6, 0.9, 3],
      [14, -7, 0.62, 2],
      [80, -6, 0.8, 4],
    ] as const
  ).map(([x, y, s, d]) => at(x, y, motion('drip', drop(0, 0, C.water, s), d)))
  const scale = parts.bird ? 0.92 : 1
  return [
    shadow(100, 183, 80),
    part(
      'puddle',
      svg`<ellipse cx="100" cy="184" rx="82" ry="6" fill=${mix(C.water, MUD, parts.murk * 0.2)} opacity=".62" />`,
    ),
    part(
      'car-pose',
      at(100, 182, [car(parts, tone, { gloss, over }), part('drip', drips)], 0, scale),
    ),
    at(-126, -8, ding()),
    neglect(
      parts,
      [
        [176, 74],
        [160, 58],
      ],
      [
        [150, 30],
        [24, 104],
      ],
    ),
  ]
}

const STAR = 'M0-10C1.2-3 3-1.2 10 0C3 1.2 1.2 3 0 10C-1.2 3-3 1.2-10 0C-3-1.2-1.2-3 0-10Z'

function shiningView(parts: CarwashParts, tone: Tone): Art {
  const gloss: Art = part('gloss', [
    svg`<path d="M-30-66L-53-14H-30L-6-66Z" fill="#fff" opacity=".34" />`,
    svg`<path d="M0-66L-22-14H-13L10-66Z" fill="#fff" opacity=".34" />`,
    svg`<path d="M-70-42C-68-54-60-60-50-62" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".55" />`,
  ])
  const over = at(
    -58,
    -68,
    motion(
      'throb',
      [
        svg`<circle r="10" fill="#fff" opacity=".85" />`,
        at(0, 0, svg`<path d=${STAR} fill="#fff" />`, 0, 2.5),
      ],
      1,
    ),
  )
  return [
    part(
      'reflection',
      svg`<ellipse cx="100" cy="184" rx="82" ry="6" fill="#bff4ec" opacity=".2" />`,
    ),
    shadow(100, 183, 74, 0.2),
    part(
      'car-pose',
      at(100, 182, motion('bob', car(parts, tone, { gloss, over, headlight: C.spark }))),
    ),
    sparkle(30, 48, 1.5, 1),
    sparkle(168, 34, 1.7, 2),
    sparkle(178, 112, 0.95, 3),
    sparkle(92, 26, 1, 4),
    sparkle(20, 134, 0.8, 5),
    bubble(138, 52, 6, 1),
    bubble(58, 30, 4.5, 3),
  ]
}

export function carwash(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = carwashParts(scene)
  const tone = toneOf(accentOf(scene, C.coral))
  const views: Record<CarwashView, (parts: CarwashParts, tone: Tone) => Art> = {
    parked: parkedView,
    washing: washingView,
    drying: dryingView,
    shining: shiningView,
  }
  const art = views[parts.view](parts, tone)
  return frame('carwash', scene, options, art)
}
