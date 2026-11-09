import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  blobPath,
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
  sock,
  sparkle,
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type GymView = 'floor' | 'pump' | 'cooldown' | 'flex'

export interface GymParts {
  view: GymView
  step: number
  sag: number
  dust: number
  webs: number
  lumps: boolean
  bunny: boolean
  rust: number
  socks: number
  stench: number
  flies: number
  mushroom: boolean
  puffs: number
  reps: number
  trainers: boolean
  stale: boolean
  asleep: boolean
  mood: Mood
}

export const MAX_STEP = 4
export const MAX_DUST = 5

const DUST_AT = [0.05, 0.3, 0.6] as const
const WEB_AT = [0.15, 0.4, 0.7] as const
const RUST_AT = [0.2, 0.45, 0.75] as const
const SOCK_AT = [0.35, 0.65] as const
const STENCH_AT = [0.3, 0.55, 0.8] as const
const FLIES_AT = [0.5, 0.75, 0.92] as const
const COOL_FLIES_AT = [0.5, 0.85] as const
const BUNNY_AT = 0.55
const MUSHROOM_AT = 0.85
const STALE_AT = 0.3
const SICK_AT = 0.6

const STEP_DUST = [0, 1, 1, 2, 2] as const
const STEP_WEBS = [0, 0, 1, 2, 3] as const

const QUIET = {
  step: 0,
  sag: 0,
  dust: 0,
  webs: 0,
  lumps: false,
  bunny: false,
  rust: 0,
  socks: 0,
  stench: 0,
  flies: 0,
  mushroom: false,
  puffs: 0,
  reps: 0,
  trainers: false,
  stale: false,
  asleep: false,
} as const

export function gymParts(scene: SceneView): GymParts {
  const { state } = scene
  if (state === 'clean') return { ...QUIET, view: 'flex', mood: 'happy' }
  const fill = clamp01(scene.fill)
  const stink = clamp01(scene.stink)
  const rust = reached(stink, RUST_AT)
  const stench = reached(stink, STENCH_AT)
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...QUIET,
      view: 'pump',
      rust: Math.min(1, rust),
      puffs: reached(stink, DUST_AT),
      stench: Math.min(1, stench),
      reps: Math.min(4, Math.floor(clamp01(scene.progress) * 4) + 1),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      view: 'cooldown',
      dust: Math.min(2, reached(stink, DUST_AT)),
      rust,
      stench,
      flies: reached(stink, COOL_FLIES_AT),
      stale: stink >= STALE_AT,
      mood: sick ? 'sick' : 'calm',
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
    ...QUIET,
    view: 'floor',
    step,
    sag: step / MAX_STEP,
    dust: Math.min(MAX_DUST, (STEP_DUST[step] ?? 0) + reached(stink, DUST_AT)),
    webs: Math.max(STEP_WEBS[step] ?? 0, reached(stink, WEB_AT)),
    lumps: step >= 3,
    bunny: stink >= BUNNY_AT,
    rust,
    socks: reached(stink, SOCK_AT),
    stench,
    flies: reached(stink, FLIES_AT),
    mushroom: stink >= MUSHROOM_AT,
    trainers: due,
    asleep: resting,
    mood,
  }
}

interface Tone {
  plate: string
  plateDark: string
  inner: string
  innerDark: string
  light: string
  grip: string
  gripDark: string
}

const RUST = '#a9572a'
const RUST_DARK = '#7f3f1f'
const DUST = '#d8c79c'
const DUST_DARK = '#b6a477'
const WEB = '#e6ebf5'
const SHAKE = '#f7b7d6'
const ROPE = '#d9a94f'
const ROPE_DARK = '#a98238'
const HALF_PLATE = 52
const FLOOR_LINE = 182
const FLOOR_SCALE = 0.86
const FLOOR_X = 75
const FLOOR_Y = FLOOR_LINE - HALF_PLATE * FLOOR_SCALE

function toneOf(scene: SceneView, parts: GymParts): Tone {
  const accent = accentOf(scene, C.coral)
  const age = parts.rust / 3
  const plate = mix(accent, RUST, age * 0.28)
  return {
    plate,
    plateDark: shadeOf(plate, 0.3),
    inner: shadeOf(plate, 0.14),
    innerDark: shadeOf(plate, 0.4),
    light: tintOf(plate, 0.5),
    grip: mix(C.metal, DUST, age * 0.5),
    gripDark: mix(C.metalMid, RUST, age * 0.3),
  }
}

function box(x: number, y: number, w: number, h: number, r: number, fill: string): Art {
  return svg`<rect x=${round(x)} y=${round(y)} width=${round(w)} height=${round(h)} rx=${r} fill=${fill} />`
}

function line(d: string, color: string, width: number): Art {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`
}

function span(sign: number, from: number, to: number): number {
  return sign > 0 ? from : -to
}

function bellEnd(sign: number, tone: Tone): Art {
  const big = span(sign, 34, 58)
  const inner = span(sign, 56, 70)
  return [
    box(span(sign, 69, 75), -15, 6, 30, 3, C.metalDark),
    box(inner, -40, 14, 80, 7, tone.innerDark),
    box(inner, -40, 14, 73, 7, tone.inner),
    box(big, -52, 24, 104, 10, tone.plateDark),
    box(big, -52, 24, 96, 10, tone.plate),
    box(big + 5, -43, 5, 38, 2.5, tone.light),
    box(big + 5, 1, 5, 6.5, 2.5, tone.light),
    box(big + 7, 18, 11, 3.6, 1.8, tone.plateDark),
    box(big + 7, 25.5, 11, 3.6, 1.8, tone.plateDark),
    box(span(sign, 29, 35), -30, 6, 60, 3, C.metalDark),
  ]
}

function grip(tone: Tone): Art {
  return [
    box(-31, -23, 62, 46, 7, tone.gripDark),
    box(-31, -23, 62, 39, 7, tone.grip),
    line('M-25.5-14V9M25.5-14V9', tone.gripDark, 2.6),
  ]
}

const RUST_SPOTS = [
  [-46, -28, 7, 9],
  [47, 26, 7, 10],
  [-44, 34, 6, 7],
  [48, -36, 6, 7],
  [-61, 6, 4.5, 11],
  [61, -14, 4.5, 9],
] as const

function rustPatches(level: number): Art {
  if (level === 0) return []
  return part('rust', [
    RUST_SPOTS.slice(0, level * 2).map(
      ([x, y, w, h], i) =>
        svg`<path d=${blobPath(w, h)} transform=${`translate(${x} ${y})`} fill=${i % 2 ? RUST_DARK : RUST} />`,
    ),
    when(
      level >= 2,
      () =>
        svg`<path d=${blobPath(6, 3.5)} transform="translate(20 16)" fill=${RUST} /><path d=${blobPath(4.5, 3)} transform="translate(-19 17)" fill=${RUST_DARK} />`,
    ),
  ])
}

function dustCap(x0: number, x1: number, y: number, h: number): Art {
  const w = x1 - x0
  const top = round(y - h)
  const high = round(y - h * 1.25)
  const d = `M${x0 - 1.5} ${y + 3}C${x0 - 2} ${top} ${round(x0 + w * 0.28)} ${high} ${round(x0 + w * 0.5)} ${top}C${round(x0 + w * 0.72)} ${high} ${x1 + 2} ${top} ${x1 + 1.5} ${y + 3}Q${round(x0 + w * 0.5)} ${y + 7} ${x0 - 1.5} ${y + 3}Z`
  return svg`<path d=${d} fill=${DUST} />`
}

const DUST_HEIGHT = [0, 3, 6, 9, 13, 17] as const

function dustLayer(level: number): Art {
  if (level === 0) return []
  const h = DUST_HEIGHT[level] ?? 17
  const specks = [
    [-46, -46, 1.7],
    [44, -44, 1.9],
    [-52, -36, 1.4],
    [50, -30, 1.5],
    [-62, -32, 1.3],
    [62, -33, 1.4],
    [-10, -18, 1.3],
    [11, -19, 1.4],
  ] as const
  return part('dust', [
    specks
      .slice(0, level * 2)
      .map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST_DARK} />`),
    dustCap(-58, -34, -52, h),
    dustCap(34, 58, -52, h),
    dustCap(-70, -58, -40, h * 0.7),
    dustCap(58, 70, -40, h * 0.7),
    when(level >= 2, () => dustCap(-20, 16, -26, h * 0.5)),
  ])
}

function web(sign: number, size: number): Art {
  const threads = [0, 1, 2, 3].map((i) => {
    const a = ((6 + i * 26) * Math.PI) / 180
    return [Math.cos(a) * 32, -Math.sin(a) * 32] as const
  })
  const arc = (k: number): string =>
    threads
      .map(([x, y], i) => {
        const px = round(x * k)
        const py = round(y * k)
        if (i === 0) return `M${px} ${py}`
        const prev = threads[i - 1] ?? [x, y]
        return `Q${round(((x + prev[0]) / 2) * k * 0.84)} ${round(((y + prev[1]) / 2) * k * 0.84)} ${px} ${py}`
      })
      .join('')
  return part(
    'cobweb',
    svg`<g transform=${`translate(${sign * -33} -23) scale(${round(sign * size)} ${round(size)})`} fill="none" stroke=${WEB} stroke-width="1.8" stroke-linecap="round" opacity=".9">
      ${threads.map(([x, y]) => svg`<path d=${`M0 0L${round(x)} ${round(y)}`} />`)}
      ${[0.42, 0.7, 0.96].map((k) => svg`<path d=${arc(k)} />`)}
    </g>`,
  )
}

function spider(): Art {
  return part(
    'spider',
    at(
      6,
      -52,
      motion('bob', [
        line('M0 0V25', WEB, 1.5),
        at(0, 29, [
          line('M-3-1L-9-5M-3 1L-10 2M-3 3L-8 8M3-1L9-5M3 1L10 2M3 3L8 8', C.fly, 1.6),
          svg`<circle r="5" fill=${C.fly} />`,
          svg`<circle cx="-1.8" cy="-1" r="1.2" fill="#fff" /><circle cx="1.8" cy="-1" r="1.2" fill="#fff" />`,
        ]),
      ]),
    ),
  )
}

function mushroom(y: number): Art {
  return part(
    'mushroom',
    at(-46, y, [
      box(-3, -9, 6, 12, 3, C.cream),
      svg`<path d="M-11-7C-11-19 11-19 11-7Q0-4-11-7Z" fill=${C.lilac} />`,
      svg`<circle cx="-4" cy="-11" r="1.8" fill=${C.cream} /><circle cx="4" cy="-12" r="1.5" fill=${C.cream} />`,
    ]),
  )
}

function dumbbell(tone: Tone, mood: Mood, extras: Art, band = false): Art {
  return [
    bellEnd(-1, tone),
    bellEnd(1, tone),
    grip(tone),
    face(0, band ? 2 : -3, mood, C.fly, band ? 1 : 1.12),
    extras,
  ]
}

function neglect(parts: GymParts): Art {
  const height = DUST_HEIGHT[parts.dust] ?? 0
  return [
    rustPatches(parts.rust),
    when(parts.webs >= 1, () => web(1, parts.webs >= 2 && !parts.trainers ? 1 : 0.68)),
    when(parts.webs >= 3, () => web(-1, parts.trainers ? 0.68 : 0.9)),
    dustLayer(parts.dust),
    when(parts.webs >= 3 && !parts.trainers, spider),
    when(parts.mushroom, () => mushroom(-50 - height)),
  ]
}

function raisedArms(tone: Tone): Art {
  return part('arms', [
    line('M-20-16Q-30-30-23-46', tone.gripDark, 7),
    line('M20-16Q30-30 23-46', tone.gripDark, 7),
    svg`<circle cx="-22" cy="-48" r="6" fill=${tone.grip} /><circle cx="22" cy="-48" r="6" fill=${tone.grip} />`,
  ])
}

function flexArm(sign: number, tone: Tone): Art {
  const x = (value: number): number => value * sign
  const arm = `M${x(33)}-5L${x(62)}-1L${x(58)}-36`
  const shapes = (color: string, grow: number): Art => [
    line(arm, color, 8.5 + grow * 2),
    svg`<circle cx=${x(47)} cy="-9" r=${11 + grow} fill=${color} />`,
    svg`<circle cx=${x(58)} cy="-41" r=${9 + grow} fill=${color} />`,
  ]
  return [
    shapes(tone.gripDark, 1.8),
    shapes(tone.grip, 0),
    line(`M${x(40)}-3q${x(7)} 5 ${x(15)} 1`, tone.gripDark, 2.4),
  ]
}

function starPath(outer: number, inner: number): string {
  const points = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer
    const a = ((-90 + i * 36) * Math.PI) / 180
    return `${i ? 'L' : 'M'}${round(Math.cos(a) * r)} ${round(Math.sin(a) * r)}`
  })
  return `${points.join('')}Z`
}

function medal(): Art {
  return part('medal', [
    line('M-14 21L0 37', C.skyDark, 6.5),
    line('M14 21L0 37', C.sky, 6.5),
    at(
      0,
      42,
      motion('sway', [
        svg`<circle r="12.5" fill=${C.sunDark} />`,
        svg`<circle cy="-.8" r="11" fill=${C.sun} />`,
        svg`<path d=${starPath(7.5, 3.2)} fill="#fff6d6" />`,
      ]),
    ),
  ])
}

function bagBody(sag: number, unzipped: boolean, age: number): Art {
  const color = mix(C.lilac, C.musty, age * 0.45)
  const dark = mix(C.lilacDark, C.mustyDark, age * 0.55)
  const deep = shadeOf(dark, 0.3)
  const w = round(37 + 3 * sag)
  const top = round(-56 + 19 * sag)
  const dip = round(-5 + 19 * sag)
  const outline = `M${-w} -9C${-w} ${top + 9} ${-w + 8} ${top} ${-w + 16} ${top}Q0 ${top + dip} ${w - 16} ${top}C${w - 8} ${top} ${w} ${top + 9} ${w} -9Q${w} 0 ${w - 9} 0H${-w + 9}Q${-w} 0 ${-w} -9Z`
  const seam = round(top + 6 + dip / 2)
  const handle = round(26 - 17 * sag)
  const lean = round(10 * sag)
  return [
    line(
      `M-17 ${top + 3}C${-20 - lean} ${top - handle} ${16 - lean} ${top - handle} 17 ${top + 3}`,
      deep,
      5,
    ),
    svg`<path d=${outline} fill=${color} />`,
    box(-22, top + 4, 8, -top - 4, 1, dark),
    box(14, top + 4, 8, -top - 4, 1, dark),
    box(-12, -27, 24, 20, 6, dark),
    at(0, -17, [
      box(-7, -1.6, 14, 3.2, 1.6, C.cream),
      box(-9, -6, 4, 12, 1.6, C.cream),
      box(5, -6, 4, 12, 1.6, C.cream),
    ]),
    unzipped
      ? svg`<path d=${`M${-w + 14} ${seam - 2}Q0 ${seam + dip * 0.4 + 9} ${w - 14} ${seam - 2}Q0 ${seam + dip * 0.4 - 7} ${-w + 14} ${seam - 2}Z`} fill=${deep} />`
      : line(`M${-w + 14} ${top + 6}Q0 ${top + 6 + dip} ${w - 14} ${top + 6}`, C.sun, 3),
    when(!unzipped, () => box(w - 19, top + 3, 5, 9, 2, C.sunDark)),
  ]
}

function bag(parts: GymParts): Art {
  const top = -56 + 19 * parts.sag
  const age = parts.rust / 3
  return part('bag', [
    when(parts.socks >= 2, () =>
      at(16, top + 5, motion('wobble', sock(0, 0, '#b9b58a', C.mustyDark, 170, 0.78))),
    ),
    bagBody(parts.sag, parts.socks > 0, age),
    when(parts.socks >= 1, () => sock(-4, top + 15, '#c9c49a', C.mustyDark, -8, 0.82)),
  ])
}

function trainer(body: string, dark: string): Art {
  return [
    svg`<path d="M-19-4V-19Q-19-23-14-23H-6C-4-16 2-13 9-11L16-9Q21-7.5 21-3V-2H-19Z" fill=${body} />`,
    svg`<path d="M-17-23H-7Q-7-20-8-18H-16Q-17-20-17-23Z" fill=${dark} />`,
    line('M-13-9L1-15M-5-5L8-10', C.sun, 3),
    line('M-1-16l3-3M3-13.500l3-3M7-11.500l3-3', C.cream, 2.2),
    box(-21, -6, 44, 6, 3, C.cream),
    box(-21, -2.2, 44, 2.2, 1.1, C.creamDark),
  ]
}

function trainers(): Art {
  return part('trainers', [
    at(167, 186, motion('sway', trainer(C.skyDark, shadeOf(C.skyDark, 0.3)), 2), 0, 0.82),
    at(143, 186, motion('sway', trainer(C.sky, C.skyDark), 1), 0, 0.92),
  ])
}

function coil(rotate: number, color: string): Art {
  return at(
    158,
    28,
    svg`<ellipse cy="24" rx="15" ry="24" fill="none" stroke=${color} stroke-width="3.2" />`,
    rotate,
  )
}

function rope(): Art {
  return part('rope', [
    coil(-15, ROPE_DARK),
    coil(14, ROPE_DARK),
    coil(0, ROPE),
    line('M151 66L148 78M165 66L168 76', ROPE_DARK, 3.2),
    at(147, 85, box(-4, -8, 8, 17, 3.5, C.mintDark), 8),
    at(169, 83, box(-4, -8, 8, 17, 3.5, C.mintDark), -8),
    svg`<circle cx="158" cy="27" r="4.5" fill=${C.metalDark} />`,
  ])
}

function flexGlyph(color: string, dark: string): Art {
  return [
    line('M20 12L-13 13L-10-8', color, 10),
    svg`<ellipse cx="4" cy="3" rx="14" ry="12" fill=${color} />`,
    svg`<circle cx="-5" cy="-14" r="8" fill=${color} />`,
    line('M-5 9q8 5 17 1', dark, 2.4),
    line('M-3-12q-3 2-6 1', dark, 2),
  ]
}

function wish(tone: Tone): Art {
  return part('wish', [
    svg`<circle cx="73" cy="82" r="3.6" fill=${C.cream} /><circle cx="67" cy="70" r="5.8" fill=${C.cream} />`,
    at(
      55,
      40,
      motion('pulse', [
        svg`<circle r="26" fill=${C.cream} />`,
        at(-2, 1, flexGlyph(tone.plate, tone.plateDark), 0, 0.92),
      ]),
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

function dustLumps(): Art {
  return part('dust-lumps', [
    svg`<ellipse cx="62" cy="182" rx="9" ry="4" fill=${DUST_DARK} /><ellipse cx="60" cy="180.5" rx="6" ry="3" fill=${DUST} />`,
    svg`<ellipse cx="90" cy="184" rx="6" ry="2.8" fill=${DUST_DARK} /><ellipse cx="89" cy="183" rx="4" ry="2" fill=${DUST} />`,
  ])
}

function dustBunny(): Art {
  return part(
    'dust-bunny',
    at(76, 182, [
      svg`<ellipse cx="-5" cy="-19" rx="3" ry="7.5" transform="rotate(-12 -5 -19)" fill=${DUST_DARK} />`,
      svg`<ellipse cx="5" cy="-19" rx="3" ry="7.5" transform="rotate(12 5 -19)" fill=${DUST_DARK} />`,
      svg`<path d="M-13 0C-16-16-6-17 0-17C6-17 16-16 13 0Q0 3-13 0Z" fill=${DUST} />`,
      svg`<circle cx="-4" cy="-9" r="1.8" fill=${C.fly} /><circle cx="4" cy="-9" r="1.8" fill=${C.fly} />`,
    ]),
  )
}

const FLY_SPOTS = [
  [124, 40],
  [178, 48],
  [124, 84],
] as const

function floorView(parts: GymParts, tone: Tone): Art {
  const lines: Array<readonly [number, number]> = [
    [132, 118],
    [176, 122],
    [96, 74],
  ]
  return [
    rope(),
    when(parts.asleep, () => [zed(82, 78, 0.7, 1), zed(98, 58, 1, 2), zed(84, 36, 0.62, 3)]),
    shadow(149, 184, 40, 0.24),
    at(149, 182, bag(parts)),
    when(parts.lumps, dustLumps),
    when(parts.bunny, dustBunny),
    shadow(FLOOR_X, 184, 62),
    part(
      'dumbbell',
      at(
        FLOOR_X,
        FLOOR_Y,
        dumbbell(tone, parts.mood, [neglect(parts), when(parts.trainers, () => raisedArms(tone))]),
        0,
        FLOOR_SCALE,
      ),
    ),
    when(parts.trainers, () => [
      trainers(),
      wish(tone),
      at(92, 150, motion('drip', drop(0, 0, C.water, 0.62), 2)),
    ]),
    stenchLines(lines.slice(0, parts.stench)),
    FLY_SPOTS.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function headband(): Art {
  return part('headband', [
    box(-33, -23, 66, 12, 4, C.sun),
    box(-33, -15, 66, 4, 2, C.sunDark),
    line('M33-17l6-7M33-15l9-2', C.sunDark, 3.4),
  ])
}

function legs(tone: Tone): Art {
  return part('legs', [
    line('M-13 20V78', tone.gripDark, 8),
    line('M-13 20V78', tone.grip, 4.5),
    line('M13 20L27 46L17 62', tone.gripDark, 8),
    line('M13 20L27 46L17 62', tone.grip, 4.5),
    at(-10, 86, trainer(C.sky, C.skyDark), 0, 0.82),
    at(22, 70, trainer(C.sky, C.skyDark), -14, 0.82),
  ])
}

function pumpArms(tone: Tone): Art {
  return part('arms', [
    motion('wobble', [
      line('M-22-6Q-52-2-50-34', tone.gripDark, 8),
      line('M-22-6Q-52-2-50-34', tone.grip, 4.8),
      svg`<circle cx="-50" cy="-40" r="8.5" fill=${tone.grip} />`,
    ]),
    motion(
      'wobble',
      [
        line('M22-6Q52-2 50-34', tone.gripDark, 8),
        line('M22-6Q52-2 50-34', tone.grip, 4.8),
        svg`<circle cx="50" cy="-40" r="8.5" fill=${tone.grip} />`,
      ],
      2,
    ),
  ])
}

function repCounter(reps: number): Art {
  return part('reps', [
    box(62, 14, 76, 21, 9, '#0c0f1e'),
    [0, 1, 2, 3].map((i) => box(70 + i * 15.5, 21, 12, 7, 3.5, i < reps ? C.sun : '#39405e')),
  ])
}

const ARCS = [
  [28, 66, 'M0 0Q-9 24 0 48', 1],
  [16, 74, 'M0 0Q-7 16 0 32', 2],
  [172, 66, 'M0 0Q9 24 0 48', 2],
  [184, 74, 'M0 0Q7 16 0 32', 3],
  [42, 52, 'M0 0Q10-12 26-12', 3],
  [158, 52, 'M0 0Q-10-12-26-12', 1],
] as const

const SWEAT = [
  [26, 46, -24, 0.95, 1],
  [174, 42, 24, 1, 2],
  [18, 118, -40, 0.8, 3],
  [184, 122, 40, 0.8, 4],
  [100, 46, 0, 0.7, 5],
] as const

const PUFFS = [
  [34, 150, 0.9],
  [168, 148, 1.1],
  [58, 172, 0.7],
] as const

function puff(x: number, y: number, size: number, delay: number): Art {
  return part(
    'dust-puff',
    at(
      x,
      y,
      motion(
        'drift',
        svg`<g fill=${DUST} opacity=".85"><circle cx="-8" cy="1" r="7" /><circle cx="2" cy="-3" r="9" /><circle cx="10" cy="2" r="6" /></g>`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function pumpView(parts: GymParts, tone: Tone): Art {
  const body = dumbbell(
    tone,
    parts.mood,
    [rustPatches(parts.rust), headband(), pumpArms(tone)],
    true,
  )
  return [
    shadow(100, 184, 44),
    repCounter(parts.reps),
    PUFFS.slice(0, parts.puffs).map(([x, y, s], i) => puff(x, y, s, i + 1)),
    part(
      'arcs',
      ARCS.map(([x, y, d, delay]) => at(x, y, motion('flicker', line(d, '#a9c8f0', 4), delay))),
    ),
    part('dumbbell', motion('bob', at(100, 108, [legs(tone), body], 0, 0.84))),
    part(
      'sweat',
      SWEAT.map(([x, y, r, s, d]) =>
        at(x, y, motion('drip', at(0, 0, drop(0, 0, C.water, s), r), d)),
      ),
    ),
    stenchLines(
      (
        [
          [148, 182],
          [52, 182],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

function towel(age: number): Art {
  const cloth = mix(C.cream, C.musty, age * 0.75)
  const fold = mix(C.creamDark, C.mustyDark, age * 0.75)
  const stripe = mix(C.sky, C.mustyDark, age * 0.7)
  return part('towel', [
    svg`<path d="M-69-44Q-69-60-58-60H-37Q-30-60-30-50V10Q-30 13-33 13H-66Q-69 13-69 10Z" fill=${cloth} />`,
    box(-69, -5, 39, 6, 1, stripe),
    box(-69, 3.5, 39, 3, 1, stripe),
    line('M-62-52H-38', fold, 3),
    line('M-44-44V-16', fold, 2.8),
    line('M-65 13v5M-58 13v5M-51 13v5M-44 13v5M-37 13v5', fold, 2.6),
  ])
}

function shaker(stale: boolean): Art {
  const liquid = stale ? mix(SHAKE, C.stench, 0.72) : SHAKE
  const crest = stale ? mix(SHAKE, C.stench, 0.4) : '#fde0ee'
  const clear = '#d8ecf9'
  return part('shaker', [
    svg`<path d="M-21-62L-17-5Q-16.5 0-12 0H12Q16.5 0 17-5L21-62Z" fill=${clear} />`,
    svg`<path d="M-18.7-40L-16.5-6Q-16-2-12-2H12Q16-2 16.5-6L18.7-40Z" fill=${liquid} />`,
    line('M-17.5-40H17.5', crest, 4),
    line('M6-32H14M8-24H14M6-16H14', '#ffffff', 2.4),
    svg`<rect x="-13" y="-34" width="4.5" height="24" rx="2.2" fill="#fff" opacity=".6" />`,
    box(-24, -75, 48, 16, 6, C.mint),
    box(-24, -64, 48, 5, 2.5, C.mintDark),
    box(-9, -85, 18, 11, 4, C.mintDark),
    when(
      stale,
      () =>
        svg`<circle cx="-5" cy="-44" r="2.5" fill=${C.stench} /><circle cx="6" cy="-46" r="2" fill=${C.stench} />`,
    ),
  ])
}

function chevron(): Art {
  return part(
    'drink-me',
    at(
      158,
      68,
      motion(
        'bob',
        svg`<path d="M0-16V6M-12-6L0 7L12-6" fill="none" stroke=${C.sun} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
  )
}

const WAFT = 'M0 0c-7-6 7-11 0-17c-7-6 7-11 0-17'

function steam(): Art {
  return part(
    'steam',
    (
      [
        [30, 74, 1],
        [72, 88, 2],
        [114, 74, 3],
      ] as const
    ).map(([x, y, d]) =>
      at(
        x,
        y,
        motion(
          'waft',
          svg`<path d=${WAFT} fill="none" stroke=${C.cream} stroke-width="4.5" stroke-linecap="round" opacity=".7" />`,
          d,
        ),
      ),
    ),
  )
}

function cooldownView(parts: GymParts, tone: Tone): Art {
  const lines: Array<readonly [number, number]> = [
    [120, 88],
    [32, 72],
    [76, 88],
  ]
  const spots: Array<readonly [number, number]> = [
    [126, 44],
    [46, 40],
  ]
  return [
    shadow(FLOOR_X, 184, 62),
    part(
      'dumbbell',
      at(
        FLOOR_X,
        FLOOR_Y,
        dumbbell(tone, parts.mood, [
          rustPatches(parts.rust),
          dustLayer(parts.dust),
          towel(parts.stale ? 0.2 + parts.rust * 0.12 : 0),
        ]),
        0,
        FLOOR_SCALE,
      ),
    ),
    shadow(158, 184, 28, 0.26),
    at(158, 182, shaker(parts.stale)),
    chevron(),
    when(parts.stench === 0, steam),
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

const CONFETTI = [
  [38, 50, 24, C.mint],
  [164, 46, -28, C.sky],
  [66, 26, -36, C.pink],
  [140, 22, 34, C.lilac],
  [17, 134, 60, C.sun],
  [183, 132, -54, C.mint],
] as const

function flexView(tone: Tone, mood: Mood): Art {
  return [
    shadow(100, 184, 76),
    part(
      'confetti',
      CONFETTI.map(([x, y, r, color], i) =>
        at(x, y, motion('twinkle', box(-6, -2.5, 12, 5, 2.5, color), (i % 5) + 1), r),
      ),
    ),
    part(
      'star',
      at(100, 44, [
        motion('throb', svg`<path d=${starPath(27, 12)} fill=${C.sun} />`),
        svg`<path d=${starPath(13, 6)} fill="#fff6d6" />`,
      ]),
    ),
    part(
      'dumbbell',
      motion(
        'bob',
        at(100, 128, dumbbell(tone, mood, [flexArm(-1, tone), flexArm(1, tone), medal()])),
      ),
    ),
    sparkle(23, 84, 1.15, 1),
    sparkle(176, 82, 1.25, 2),
    sparkle(146, 66, 0.72, 3),
    sparkle(56, 70, 0.68, 4),
  ]
}

export function gym(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = gymParts(scene)
  const tone = toneOf(scene, parts)
  const views: Record<GymView, () => Art> = {
    floor: () => floorView(parts, tone),
    pump: () => pumpView(parts, tone),
    cooldown: () => cooldownView(parts, tone),
    flex: () => flexView(tone, parts.mood),
  }
  const art = views[parts.view]()
  return frame('gym', scene, options, art)
}
