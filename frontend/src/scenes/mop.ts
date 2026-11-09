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
  bubble,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type MopView = 'idle' | 'swish' | 'dry' | 'gleam'

export interface MopParts {
  view: MopView
  step: number
  prints: number
  spots: number
  paws: number
  wallPaws: number
  bucketPaw: boolean
  spill: boolean
  stench: number
  flies: number
  murk: number
  grime: number
  stain: number
  wish: boolean
  sleeping: boolean
  reach: number
  mood: Mood
}

export const MAX_MESS = 4

const STINK_AT = [0.15, 0.4, 0.65, 0.85] as const
const SICK_AT = 0.65
const PRINT_STEPS = [1, 3, 5, 7, 9] as const
const SPOT_STEPS = [0, 0, 1, 2, 3] as const
const WALL_PAW_STEPS = [0, 0, 3, 5, 6] as const
const STENCH_STEPS = [0, 0, 0, 1, 2] as const
const FLY_STEPS = [0, 0, 0, 1, 2] as const

const QUIET = {
  step: 0,
  prints: 0,
  spots: 0,
  paws: 0,
  wallPaws: 0,
  bucketPaw: false,
  spill: false,
  stench: 0,
  flies: 0,
  murk: 0,
  grime: 0,
  stain: 0,
  wish: false,
  sleeping: false,
  reach: 0,
} as const

function pick(list: readonly number[], index: number): number {
  return list[index] ?? 0
}

export function mopParts(scene: SceneView): MopParts {
  const { state } = scene
  if (state === 'clean') return { ...QUIET, view: 'gleam', mood: 'happy' }
  const fill = clamp01(scene.fill)
  const stink = clamp01(scene.stink)
  const level = reached(stink, STINK_AT)
  const sick = stink >= SICK_AT
  const neglect = {
    paws: level > 0 ? 6 : 0,
    wallPaws: pick(WALL_PAW_STEPS, level),
    bucketPaw: level > 0,
    spill: level >= 2,
    stench: pick(STENCH_STEPS, level),
    flies: pick(FLY_STEPS, level),
    stain: level / STINK_AT.length,
  }
  if (state === 'running') {
    return {
      ...QUIET,
      view: 'swish',
      prints: PRINT_STEPS[MAX_MESS],
      spots: SPOT_STEPS[MAX_MESS],
      paws: neglect.paws,
      flies: neglect.flies,
      reach: clamp01(scene.progress),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      ...neglect,
      view: 'dry',
      bucketPaw: false,
      murk: 0.45 + stink * 0.4,
      mood: sick ? 'sick' : 'calm',
    }
  }
  if (state === 'resting') {
    return {
      ...QUIET,
      ...neglect,
      view: 'idle',
      sleeping: true,
      murk: stink * 0.6,
      mood: sick ? 'sick' : 'sleepy',
    }
  }
  const due = state === 'due'
  const step = due ? MAX_MESS : Math.min(MAX_MESS, Math.floor(fill * (MAX_MESS + 1)))
  const worried = step >= 3
  let mood: Mood = worried ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...neglect,
    view: 'idle',
    step,
    prints: pick(PRINT_STEPS, step),
    spots: pick(SPOT_STEPS, step) + (due ? 1 : 0),
    murk: step / MAX_MESS,
    grime: step / MAX_MESS,
    wish: due,
    mood,
  }
}

const GROUND = 174
const MUD = '#86674b'
const PAW_MUD = '#c0935f'
const STICKY = '#d8953a'
const STICKY_DARK = '#a86c26'
const MURK = '#807a4c'
const FOAM = '#f4fbff'
const SHEEN = '#a9e2fb'

interface Tones {
  body: string
  dark: string
  light: string
  shine: string
}

function tonesOf(scene: SceneView): Tones {
  const body = accentOf(scene, C.sun)
  return body === C.sun
    ? { body, dark: C.sunDark, light: '#ffe08f', shine: '#fff3c9' }
    : { body, dark: shadeOf(body), light: tintOf(body, 0.42), shine: tintOf(body, 0.75) }
}

function tileColumn(col: number, y: number, margin: number): number {
  return Math.min(200 - margin, Math.max(margin, 100 + (col * 36 * (y - 110)) / 58))
}

function tileGrid(opacity: number): Art {
  const rows = [
    [168, 180],
    [180, 199],
  ] as const
  const paths: string[] = []
  rows.forEach(([top, bottom], row) => {
    const margin = row ? 16 : 0.5
    for (let col = -4; col < 4; col += 1) {
      if ((((col + row) % 2) + 2) % 2 !== 0) continue
      const a = round(tileColumn(col, top, margin))
      const b = round(tileColumn(col + 1, top, margin))
      const c = round(tileColumn(col + 1, bottom, margin))
      const d = round(tileColumn(col, bottom, margin))
      if (b > a) paths.push(`M${a} ${top}L${b} ${top}L${c} ${bottom}L${d} ${bottom}Z`)
    }
  })
  return part('tiles', svg`<path d=${paths.join('')} fill="#fff" opacity=${opacity} />`)
}

const PRINTS: ReadonlyArray<readonly [number, number, number]> = [
  [17, 181, -6],
  [36, 187, 5],
  [56, 181, -5],
  [75, 187, 6],
  [95, 180, -6],
  [114, 187, 5],
  [134, 181, -5],
  [153, 187, 6],
  [172, 180, -6],
]

function footprint(x: number, y: number, rotate: number): Art {
  return at(
    x,
    y,
    svg`<ellipse cx="4" rx="7.4" ry="3.5" fill=${MUD} /><ellipse cx="-8" rx="3.7" ry="3" fill=${MUD} /><path d="M1.5-2.6V2.6M5-3V3M8.5-2.4V2.4" stroke="#0c0f1e" stroke-width="1.3" stroke-linecap="round" opacity=".4" />`,
    rotate,
  )
}

const SPOTS: ReadonlyArray<readonly [number, number, number, number]> = [
  [130, 182, 12, 4],
  [52, 183, 14, 4.4],
  [176, 178, 10, 3.4],
  [94, 181, 11, 3.6],
  [20, 183, 8, 3],
]

function stickySpot(x: number, y: number, rx: number, ry: number): Art {
  return part('spot', [
    svg`<ellipse cx=${x} cy=${y} rx=${rx} ry=${ry} fill=${STICKY_DARK} />`,
    svg`<ellipse cx=${x} cy=${y - 0.8} rx=${rx - 1.6} ry=${ry - 1.3} fill=${STICKY} />`,
    svg`<path d=${`M${x - rx * 0.5} ${y - 1.3}q${rx * 0.25} -1.3 ${rx * 0.5} -0.8`} fill="none" stroke="#ffe3ab" stroke-width="1.5" stroke-linecap="round" />`,
  ])
}

function floorPaw(x: number, y: number, flip: number): Art {
  return part(
    'paw',
    at(
      x,
      y,
      svg`<g fill=${PAW_MUD}><ellipse rx="4.4" ry="2.7" /><ellipse cx=${-5.4 * flip} cy="-2.2" rx="1.7" ry="1.3" /><ellipse cx=${-2.4 * flip} cy="-3.9" rx="1.7" ry="1.3" /><ellipse cx=${1.4 * flip} cy="-4" rx="1.7" ry="1.3" /><ellipse cx=${4.8 * flip} cy="-2.6" rx="1.7" ry="1.3" /></g>`,
    ),
  )
}

const FLOOR_PAWS: ReadonlyArray<readonly [number, number, number]> = [
  [186, 183, 1],
  [160, 179, -1],
  [136, 185, 1],
  [106, 180, -1],
  [76, 185, 1],
  [40, 181, -1],
]

function wallPaw(x: number, y: number, rotate: number, scale: number, color: string): Art {
  return part(
    'paw',
    at(
      x,
      y,
      svg`<g fill=${color}><path d="M0-1C4-1 8 3 8 7C8 11 4 11 0 9C-4 11-8 11-8 7C-8 3-4-1 0-1Z" /><circle cx="-9" cy="-2" r="2.9" /><circle cx="-3.6" cy="-8" r="3.1" /><circle cx="3.6" cy="-8" r="3.1" /><circle cx="9" cy="-2" r="2.9" /></g>`,
      rotate,
      scale,
    ),
  )
}

const WALL_PAWS: ReadonlyArray<readonly [number, number, number]> = [
  [22, 124, 14],
  [38, 100, -10],
  [22, 78, 16],
  [40, 56, -8],
  [26, 36, 12],
  [48, 22, 34],
]

function marks(parts: MopParts, keep: (x: number) => boolean): Art {
  return [
    part(
      'prints',
      PRINTS.slice(0, parts.prints)
        .filter(([x]) => keep(x))
        .map(([x, y, r]) => footprint(x, y, r)),
    ),
    SPOTS.slice(0, parts.spots)
      .filter(([x]) => keep(x))
      .map(([x, y, rx, ry]) => stickySpot(x, y, rx, ry)),
    FLOOR_PAWS.slice(0, parts.paws)
      .filter(([x]) => keep(x))
      .map(([x, y, flip]) => floorPaw(x, y, flip)),
  ]
}

function spill(x: number): Art {
  return part('spill', [
    svg`<path d=${`M${x - 40} 180c2-6 16-8 28-7c14-3 34-2 44 3c10 2 12 8 2 10c-10 4-24 3-34 3c-14 2-36 0-40-9Z`} fill=${STICKY_DARK} />`,
    at(x + 2, 164, sock(0, 0, C.pink, C.pinkDark, 28, 0.72)),
    svg`<path d=${`M${x - 34} 180c4-4 14-4 24-3c8 4 18 4 28 1c8 0 20 2 22 6c-6 3-18 3-28 3c-16 2-40 0-46-7Z`} fill=${STICKY} />`,
    svg`<path d=${`M${x - 22} 180q8-2 15-1M${x + 18} 181q6-1 11 0`} fill="none" stroke="#ffe3ab" stroke-width="2" stroke-linecap="round" />`,
    svg`<path d=${`M${x - 14} 170q2 4 1 8M${x + 22} 169q-2 4 0 9`} fill="none" stroke=${STICKY} stroke-width="2.4" stroke-linecap="round" />`,
  ])
}

const HEAD_TOP = 'M-14-70C-30-64-44-42-46-14'
const HEAD_RIGHT = 'C44-42 30-64 14-70Q0-76-14-70Z'
const LOBES = [12, 14, 13, 15, 13, 14, 11] as const

function scallops(depth: number): string {
  return LOBES.map((w) => `q${w / 2} ${depth} ${w} 0`).join('')
}

const HEAD_PATH = `${HEAD_TOP}${scallops(28)}${HEAD_RIGHT}`
const TIP_PATH = 'M-46-22Q-34.5-27-23-22T0-22T23-22T46-22L46-14'

function tipBand(color: string): Art {
  const lobes = LOBES.toReversed()
    .map((w) => `q${-w / 2} 28 ${-w} 0`)
    .join('')
  return svg`<path d=${`${TIP_PATH}${lobes}Z`} fill=${color} />`
}

const STRAND_X = [-34, -21, -7, 8, 22, 35] as const

interface MopLook {
  mood: Mood
  body: string
  line: string
  tip: string
  blush?: boolean
  lean?: number
  bubble?: boolean
}

function figure(look: MopLook): Art {
  const lean = look.lean ?? 26
  const stick = `M0-76L${lean}-158`
  return part('mop', [
    part('handle', [
      svg`<path d=${stick} stroke=${C.coralDark} stroke-width="9" stroke-linecap="round" />`,
      svg`<path d=${`M-1.6-76L${lean - 1.6}-157`} stroke=${C.coral} stroke-width="5" stroke-linecap="round" />`,
      svg`<path d=${`M${round(lean * 0.93)}-152L${lean}-158`} stroke=${C.metal} stroke-width="9.5" stroke-linecap="round" />`,
    ]),
    svg`<path d=${HEAD_PATH} fill=${look.body} />`,
    tipBand(look.tip),
    STRAND_X.map(
      (x) =>
        svg`<path d=${`M${x}-8Q${round(x * 0.98)}-18 ${round(x * 0.86)}-28`} fill="none" stroke=${look.line} stroke-width="2.6" stroke-linecap="round" />`,
    ),
    svg`<path d="M-27-60Q-37-46-40-28M27-60Q37-46 40-28" fill="none" stroke=${look.line} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<rect x="-19" y="-84" width="38" height="15" rx="5.5" fill=${C.metalMid} />`,
    svg`<rect x="-19" y="-75" width="38" height="6" rx="3" fill=${C.metalDark} />`,
    svg`<circle cx="-11" cy="-79" r="1.8" fill=${C.metal} /><circle cx="11" cy="-79" r="1.8" fill=${C.metal} />`,
    when(
      look.blush === true,
      () =>
        svg`<ellipse cx="-27" cy="-38" rx="6" ry="3.8" fill=${C.pink} opacity=".7" /><ellipse cx="27" cy="-38" rx="6" ry="3.8" fill=${C.pink} opacity=".7" />`,
    ),
    face(0, -46, look.mood, INK, 1.08),
    when(look.bubble === true, () =>
      part(
        'snore',
        at(
          16,
          -34,
          motion(
            'pulse',
            svg`<circle r="5.5" fill=${SHEEN} opacity=".55" /><circle cx="-1.8" cy="-1.8" r="1.3" fill="#fff" />`,
          ),
        ),
      ),
    ),
  ])
}

interface BucketLook {
  water: string | null
  paw?: boolean
  foam?: boolean
}

function suds(x: number, y: number, s: number): Art {
  return at(
    x,
    y,
    svg`<g fill=${FOAM}><circle cx="-9" cy="1" r="6" /><circle cx="0" cy="-3" r="8" /><circle cx="9" cy="1" r="6.2" /></g><path d="M-3-6a4 4 0 0 1 4-2" fill="none" stroke=${SHEEN} stroke-width="1.8" stroke-linecap="round" />`,
    0,
    s,
  )
}

function bucket(tones: Tones, look: BucketLook): Art {
  return part('bucket', [
    svg`<circle cx="-21" cy="-5" r="5.4" fill=${C.metalDark} /><circle cx="21" cy="-5" r="5.4" fill=${C.metalDark} />`,
    svg`<circle cx="-21" cy="-5" r="2" fill=${C.metal} /><circle cx="21" cy="-5" r="2" fill=${C.metal} />`,
    svg`<path d="M-38-60C-38-103 38-103 38-60" fill="none" stroke=${C.metalMid} stroke-width="3.8" stroke-linecap="round" />`,
    svg`<rect x="-12" y="-97" width="24" height="7.5" rx="3.7" fill=${C.metalDark} />`,
    svg`<ellipse cy="-60" rx="38" ry="9.5" fill=${tones.light} />`,
    svg`<ellipse cy="-59" rx="33" ry="7" fill=${shadeOf(tones.body, 0.62)} />`,
    when(look.water !== null, () => [
      svg`<ellipse cy="-57.5" rx="29.5" ry="5.2" fill=${look.water ?? C.water} />`,
      svg`<path d="M-17-58.5q7-2 14-.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" opacity=".7" />`,
    ]),
    when(look.foam === true, () => [suds(-14, -64, 1.05), suds(13, -66, 1.2), suds(0, -74, 0.8)]),
    svg`<path d="M-38-60L-30-9Q-29-4-24-4H24Q29-4 30-9L38-60C38-49 -38-49 -38-60Z" fill=${tones.body} />`,
    svg`<path d="M-30-9Q-29-4-24-4H24Q29-4 30-9L31.6-18C14-14-14-14-31.6-18Z" fill=${tones.dark} />`,
    svg`<path d="M-38-60C-38-49 38-49 38-60L37.2-54.6C34-45-34-45-37.2-54.6Z" fill=${tones.light} />`,
    svg`<path d="M-28.5-42L-25.5-22" stroke=${tones.shine} stroke-width="5" stroke-linecap="round" opacity=".8" />`,
    drop(2, -30, tones.shine, 1.25),
    when(look.paw === true, () => wallPaw(17, -28, 18, 0.72, shadeOf(MUD, 0.08))),
  ])
}

function wish(): Art {
  return part('wish', [
    svg`<circle cx="100" cy="92" r="4" fill=${C.cream} /><circle cx="110" cy="76" r="6.4" fill=${C.cream} />`,
    at(
      142,
      46,
      motion('pulse', [
        svg`<circle r="25" fill=${C.cream} />`,
        drop(-5, 2, C.waterDark, 1.7),
        svg`<circle cx="11" cy="-6" r="5.5" fill="none" stroke=${C.skyDark} stroke-width="2.4" />`,
        svg`<circle cx="13" cy="8" r="3.4" fill="none" stroke=${C.skyDark} stroke-width="2.2" />`,
      ]),
    ),
  ])
}

function mopTones(parts: MopParts, tip: string): Pick<MopLook, 'body' | 'line' | 'tip'> {
  return {
    body: mix(C.cream, C.musty, parts.stain * 0.55),
    line: mix(C.creamDark, C.mustyDark, parts.stain * 0.7),
    tip,
  }
}

function neglectOverlay(parts: MopParts, stench: ReadonlyArray<readonly [number, number]>): Art {
  const spots: ReadonlyArray<readonly [number, number]> = [
    [168, 76],
    [184, 26],
  ]
  return [
    stenchLines(stench.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function idle(parts: MopParts, tones: Tones): Art {
  const x = 62
  const tip = mix(C.creamDark, MUD, parts.grime)
  const water = parts.wish ? null : mix(C.water, MURK, parts.murk)
  const body = figure({
    ...mopTones(parts, tip),
    mood: parts.mood,
    bubble: parts.sleeping,
    blush: parts.wish,
  })
  return [
    tileGrid(0.05),
    part(
      'wall-paws',
      WALL_PAWS.slice(0, parts.wallPaws).map(([px, py, r]) => wallPaw(px, py, r, 0.82, PAW_MUD)),
    ),
    shadow(x, GROUND, 50),
    shadow(148, GROUND, 40),
    at(148, GROUND, bucket(tones, { water, paw: parts.bucketPaw })),
    parts.sleeping
      ? at(x, GROUND, motion('sway', body), 5)
      : parts.wish
        ? at(x, GROUND, motion('sway', body))
        : at(x, GROUND, body),
    marks(parts, () => true),
    when(parts.spill, () => spill(112)),
    when(parts.wish, wish),
    neglectOverlay(parts, [
      [184, 106],
      [106, 62],
    ]),
  ]
}

function trail(fromX: number): Art {
  const left = round(fromX)
  return part('trail', [
    svg`<path d=${`M${left} 182C${left + 24} 172 ${left + 44} 190 ${left + 66} 180S${left + 106} 174 190 184C${left + 104} 192 ${left + 66} 190 ${left + 40} 190S${left + 8} 192 ${left} 182Z`} fill=${SHEEN} opacity=".55" />`,
    svg`<path d=${`M${left + 14} 181q18-5 36 0M${left + 66} 183q14-4 30-1M${left + 98} 180q12-3 22 0`} fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85" />`,
  ])
}

function swish(parts: MopParts, tones: Tones): Art {
  const x = 96 - 44 * parts.reach
  const lean = 28
  const body = figure({
    ...mopTones(parts, C.water),
    mood: parts.mood,
    blush: true,
    lean,
  })
  return [
    tileGrid(0.06),
    marks(parts, (px) => px < x - 34),
    trail(x),
    shadow(158, GROUND, 30),
    at(158, GROUND, bucket(tones, { water: C.water, foam: true }), 0, 0.82),
    shadow(x, GROUND + 2, 46),
    at(
      x + lean,
      16,
      motion('slosh', [
        at(-lean, 158, body),
        part('splash', [
          at(-lean - 64, 118, motion('flicker', drop(0, 0, C.water, 1), 1)),
          at(-lean + 60, 96, motion('flicker', drop(0, 0, C.water, 0.8), 2)),
        ]),
      ]),
    ),
    part('swoosh', [
      at(
        x - 56,
        142,
        motion(
          'flicker',
          svg`<path d="M0 0q-10 12-2 26M-9 6q-5 7-2 14" fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,
          3,
        ),
      ),
    ]),
    part('suds', [suds(x - 30, 177, 0.9), suds(x + 34, 179, 0.75), suds(x + 74, 183, 0.6)]),
    bubble(x - 58, 112, 7, 1),
    bubble(x + 44, 84, 5.5, 2),
    bubble(174, 66, 9, 3),
    bubble(134, 42, 6, 4),
    (
      [
        [176, 62],
        [32, 72],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([fx, fy], i) => fly(fx, fy, i)),
  ]
}

function cone(): Art {
  return part('cone', [
    svg`<rect x="-36" y="-9" width="72" height="11" rx="5.5" fill=${C.coralDark} />`,
    svg`<path d="M-7-72Q0-78 7-72L25-6H-25Z" fill=${C.coral} />`,
    svg`<path d="M-15.5-40H15.5L20.4-22H-20.4Z" fill=${C.cream} />`,
    svg`<path d="M-5.5-60H5.5L8.2-50.4H-8.2Z" fill=${C.cream} />`,
    svg`<path d="M-2-69L-12-14" stroke="#ffb0a5" stroke-width="3.6" stroke-linecap="round" />`,
    drop(0, -30, C.waterDark, 1.05),
  ])
}

function wisp(x: number, y: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'waft',
      svg`<path d="M0 0c-5-4 5-8 0-12c-5-4 5-8 0-12" fill="none" stroke=${SHEEN} stroke-width="3.2" stroke-linecap="round" opacity=".75" />`,
      delay,
    ),
  )
}

function wetFloor(): Art {
  return part('wet', [
    svg`<path d="M10 180c6-7 30-8 50-6c30-5 80-5 104 0c16 0 28 3 26 8c-1 7-30 9-54 8c-30 3-90 3-116-1c-8-1-13-5-10-9Z" fill=${SHEEN} opacity=".36" />`,
    svg`<path d="M26 180q14-4 28-1M146 182q14-4 30-1M92 186q14-2 26-1" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8" />`,
    wisp(24, 168, 1),
    wisp(186, 166, 3),
  ])
}

function dry(parts: MopParts, tones: Tones): Art {
  const x = 52
  const water = mix(C.water, MURK, parts.murk)
  return [
    tileGrid(0.07),
    wetFloor(),
    part(
      'wall-paws',
      WALL_PAWS.slice(0, parts.wallPaws).map(([px, py, r]) => wallPaw(px, py, r, 0.82, PAW_MUD)),
    ),
    shadow(x, GROUND, 44),
    shadow(164, GROUND, 30),
    at(162, GROUND, bucket(tones, { water }), 0, 0.8),
    at(x, GROUND, figure({ ...mopTones(parts, SHEEN), mood: parts.mood, lean: 20 }), 0, 0.92),
    marks(parts, () => true),
    when(parts.spill, () => spill(150)),
    at(108, 182, motion('sway', cone())),
    neglectOverlay(parts, [
      [186, 96],
      [136, 94],
    ]),
  ]
}

function reflection(x: number, art: Art, opacity = 0.34): Art {
  return svg`<g transform="translate(${x} ${GROUND - 1}) scale(1 -.24)" opacity=${opacity}>${art}</g>`
}

function gleamTiles(): Art {
  return [tileGrid(0.1), reflection(66, svg`<path d=${HEAD_PATH} fill="#fff" />`)]
}

function glints(): Art {
  return part(
    'glint',
    svg`<path d="M24 186L32 172H38L30 186ZM36 186L44 172H47L39 186ZM108 188L116 172H124L116 188ZM174 186L182 172H186L178 186Z" fill="#fff" opacity=".42" />`,
  )
}

function gleam(tones: Tones): Art {
  const x = 66
  const bodyRefl = svg`<path d="M-36-52Q-36-60-26-60H26Q36-60 36-52L30-8Q29-4 24-4H-24Q-29-4-30-8Z" fill=${tones.body} />`
  const body = figure({
    mood: 'happy',
    body: '#fffaf0',
    line: C.creamDark,
    tip: '#ffffff',
    blush: true,
  })
  return [
    gleamTiles(),
    reflection(150, bodyRefl, 0.2),
    glints(),
    shadow(150, GROUND, 38, 0.2),
    at(150, GROUND, bucket(tones, { water: '#8fdcff' })),
    at(x, GROUND, motion('bob', body)),
    sparkle(24, 70, 1.25, 1),
    sparkle(172, 54, 1.05, 2),
    sparkle(116, 30, 0.8, 3),
    sparkle(30, 178, 0.8, 4),
    sparkle(112, 180, 1.05, 5),
    sparkle(178, 176, 0.75, 2),
    bubble(116, 74, 6, 1),
  ]
}

export function mop(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = mopParts(scene)
  const tones = tonesOf(scene)
  const views: Record<MopView, () => Art> = {
    idle: () => idle(parts, tones),
    swish: () => swish(parts, tones),
    dry: () => dry(parts, tones),
    gleam: () => gleam(tones),
  }
  return frame('mop', scene, options, views[parts.view]())
}
