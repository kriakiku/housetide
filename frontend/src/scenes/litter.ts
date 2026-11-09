import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  clamp01,
  COLORS as C,
  face,
  fly,
  frame,
  INK,
  isDarkColor,
  mix,
  motion,
  part,
  reached,
  shadeOf,
  shadow,
  sparkle,
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type CatPose = 'loaf' | 'side' | 'stare' | 'watch' | 'nudge' | 'smug' | 'away'

export interface LitterParts {
  lumps: number
  overflow: boolean
  flag: boolean
  raked: boolean
  scooping: boolean
  bag: boolean
  scoop: boolean
  errand: boolean
  pose: CatPose
  peg: boolean
  squint: boolean
  stench: number
  flies: number
  sparkles: boolean
  mood: Mood
}

export const MAX_LUMPS = 8

const STENCH_AT = [0.08, 0.32, 0.58] as const
const FLIES_AT = [0.42, 0.66, 0.85] as const
const PEG_AT = 0.3
const SQUINT_AT = 0.58
const LEAVE_AT = 0.85

export function litterParts(scene: SceneView): LitterParts {
  const { state, fill, stink } = scene
  if (state === 'clean') {
    return {
      lumps: 0,
      overflow: false,
      flag: false,
      raked: true,
      scooping: false,
      bag: false,
      scoop: true,
      errand: false,
      pose: 'smug',
      peg: false,
      squint: false,
      stench: 0,
      flies: 0,
      sparkles: true,
      mood: 'happy',
    }
  }
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  const peg = stink >= PEG_AT
  const squint = stink >= SQUINT_AT
  const gone = stink >= LEAVE_AT
  const base = {
    overflow: false,
    flag: false,
    raked: false,
    scooping: false,
    bag: false,
    scoop: true,
    errand: false,
    peg,
    squint,
    stench,
    flies,
    sparkles: false,
  }
  if (state === 'running') {
    return {
      ...base,
      lumps: 2,
      scoop: false,
      scooping: true,
      pose: 'watch',
      stench: Math.min(stench, 2),
      flies: 0,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...base,
      lumps: 0,
      bag: true,
      scoop: false,
      errand: !gone,
      pose: gone ? 'away' : 'nudge',
      mood: stink >= PEG_AT ? 'worried' : 'calm',
    }
  }
  if (state === 'due') {
    return {
      ...base,
      lumps: MAX_LUMPS,
      overflow: true,
      scoop: false,
      flag: true,
      pose: gone ? 'away' : 'stare',
      mood: squint ? 'sick' : 'pleading',
    }
  }
  const lumps = Math.min(MAX_LUMPS - 1, Math.floor(clamp01(fill) * MAX_LUMPS))
  if (state === 'resting') {
    return {
      ...base,
      lumps: 0,
      pose: peg ? (gone ? 'away' : 'side') : 'loaf',
      mood: stink >= SQUINT_AT ? 'sick' : 'sleepy',
    }
  }
  let mood: Mood = lumps >= 5 ? 'worried' : 'calm'
  if (squint) mood = 'sick'
  return { ...base, lumps, scoop: lumps < 6, pose: gone ? 'away' : 'side', mood }
}

interface Paint {
  body: string
  dark: string
  light: string
  inner: string
  face: string
}

const TRAY = C.mint
const SAND = '#eed39a'
const SAND_DARK = '#d3b273'
const SAND_LIGHT = '#f8e6bd'
const CLOD = '#a57a52'
const CLOD_DARK = '#7f5a3a'
const CLOD_PALE = '#c39a68'
const FUR = C.metalMid
const FUR_LIGHT = C.metal
const FUR_DARK = C.metalDark
const EAR = '#f3a7bd'
const NOSE = '#e8799b'
const EYE = '#ffe08a'
const SCOOP = C.coral
const SCOOP_DARK = C.coralDark
const BAG = '#f4f6fc'
const BAG_SHADE = '#bcc6dc'
const TIE = C.sun

function paintOf(scene: SceneView): Paint {
  const body = accentOf(scene, TRAY)
  return {
    body,
    dark: shadeOf(body, 0.26),
    light: tintOf(body, 0.36),
    inner: shadeOf(body, 0.5),
    face: isDarkColor(body) ? tintOf(body, 0.84) : mix(body, INK, 0.76),
  }
}

function pawPrint(x: number, y: number, color: string, rotate = 0): Art {
  return at(
    x,
    y,
    svg`<g fill=${color}><ellipse cy="2" rx="5" ry="4.2" /><circle cx="-5.4" cy="-3" r="1.9" /><circle cx="-1.9" cy="-5.8" r="1.9" /><circle cx="1.9" cy="-5.8" r="1.9" /><circle cx="5.4" cy="-3" r="1.9" /></g>`,
    rotate,
  )
}

function trayBack(paint: Paint): Art {
  return svg`<path d="M20 132Q22 112 40 110H112Q130 112 132 132Z" fill=${paint.inner} />`
}

function sandBed(raked: boolean): Art {
  return part('sand', [
    svg`<path d="M20 134C30 112 54 105 76 105C98 105 122 112 132 134Z" fill=${SAND} />`,
    raked
      ? svg`<g fill="none" stroke=${SAND_DARK} stroke-width="2.6" stroke-linecap="round"><path d="M31 127C44 114 58 110.5 76 110.5C94 110.5 108 114 121 127" /><path d="M43 129C53 120 63 117 76 117C89 117 99 120 109 129" /><path d="M57 130C63 125.5 69 124 76 124C83 124 89 125.5 95 130" /></g>`
      : svg`<g fill=${SAND_DARK}><circle cx="44" cy="121" r="1.7" /><circle cx="60" cy="113" r="1.7" /><circle cx="96" cy="114" r="1.7" /><circle cx="112" cy="122" r="1.7" /><circle cx="78" cy="109.5" r="1.4" /></g><path d="M36 120Q48 111 62 109" fill="none" stroke=${SAND_LIGHT} stroke-width="3" stroke-linecap="round" />`,
  ])
}

function clod(x: number, y: number, w: number, h: number, tone: number, rotate: number): Art {
  const fill = tone === 0 ? CLOD : tone === 1 ? CLOD_DARK : CLOD_PALE
  const speck = tone === 1 ? CLOD : CLOD_DARK
  return at(
    x,
    y,
    svg`<path d=${`M${-w} ${h * 0.35}C${-w * 1.08} ${-h * 0.6} ${-w * 0.42} ${-h} ${w * 0.08} ${-h * 0.92}C${w * 0.8} ${-h} ${w * 1.08} ${-h * 0.35} ${w} ${h * 0.25}C${w} ${h * 0.82} ${w * 0.5} ${h} 0 ${h * 0.95}C${-w * 0.6} ${h} ${-w} ${h * 0.82} ${-w} ${h * 0.35}Z`} fill=${fill} /><circle cx=${-w * 0.35} cy=${-h * 0.25} r="1.5" fill=${speck} /><circle cx=${w * 0.4} cy=${h * 0.2} r="1.3" fill=${speck} /><path d=${`M${-w * 0.6} ${-h * 0.5}Q${-w * 0.2} ${-h * 0.92} ${w * 0.3} ${-h * 0.72}`} fill="none" stroke="#fff" stroke-opacity=".24" stroke-width="2.2" stroke-linecap="round" />`,
    rotate,
  )
}

const LUMPS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [54, 118, 13, 9.5, 0],
  [100, 118, 14, 10, 1],
  [76, 112, 12, 9, 2],
  [36, 124, 10, 8, 1],
  [117, 123, 10, 7.5, 0],
  [62, 100, 13, 10, 1],
  [92, 101, 13.5, 10, 0],
  [77, 86, 12.5, 10, 2],
]

function lumpsArt(count: number): Art {
  return LUMPS.slice(0, count).map(([x, y, w, h, tone], i) =>
    part('lump', clod(x, y, w, h, tone, i % 2 ? 10 : -12), i),
  )
}

function surrender(): Art {
  return part(
    'flag',
    at(
      77,
      80,
      motion('wobble', [
        svg`<path d="M0 2V-34" stroke=${C.metalMid} stroke-width="3.4" stroke-linecap="round" />`,
        svg`<path d="M1.5-34C10-39 16-29 26-33V-16C16-12 10-22 1.5-17Z" fill="#fff" />`,
      ]),
      -5,
    ),
  )
}

function spilled(): Art {
  return part('spill', [
    svg`<g fill=${SAND}><circle cx="13" cy="170" r="2.4" /><circle cx="32" cy="186" r="2.2" /><circle cx="12" cy="185" r="1.8" /><circle cx="134" cy="185" r="2.2" /><circle cx="140" cy="179" r="1.8" /></g>`,
    clod(19, 179, 8.5, 6, 1, 8),
  ])
}

function trayFront(mood: Mood, paint: Paint): Art {
  return part('tray', [
    svg`<path d="M18 132H134L127 176Q126 182 119 182H33Q26 182 25 176Z" fill=${paint.body} />`,
    svg`<path d="M21.5 170H130.5L129 176Q128 182 119 182H33Q24 182 23 176Z" fill=${paint.dark} />`,
    svg`<rect x="10" y="124" width="132" height="16" rx="8" fill=${paint.light} />`,
    svg`<rect x="60" y="128.2" width="32" height="7.6" rx="3.8" fill=${paint.dark} />`,
    pawPrint(36, 155, paint.dark, -14),
    pawPrint(116, 155, paint.dark, 14),
    face(76, 154, mood, paint.face, 1.06),
  ])
}

function scoopHead(load: boolean): Art {
  return [
    svg`<path d="M-3-62H3L4-26H-4Z" fill=${SCOOP} />`,
    svg`<rect x="-5.5" y="-82" width="11" height="24" rx="5.5" fill=${SCOOP_DARK} />`,
    svg`<circle cy="-76" r="2.2" fill=${INK} opacity=".35" />`,
    when(load, () => [clod(-6, -33, 11, 8.5, 1, -8), clod(8, -32, 9, 7.5, 2, 12)]),
    svg`<path d="M-19-27H19L16-2Q15 4 9 4H-9Q-15 4-16-2Z" fill=${SCOOP} />`,
    svg`<rect x="-21" y="-30" width="42" height="7" rx="3.5" fill=${SCOOP_DARK} />`,
    svg`<g fill=${SCOOP_DARK}><rect x="-11" y="-18" width="4.4" height="16" rx="2.2" /><rect x="-2.2" y="-18" width="4.4" height="17" rx="2.2" /><rect x="6.6" y="-18" width="4.4" height="16" rx="2.2" /></g>`,
  ]
}

function restingScoop(): Art {
  return part('scoop', at(30, 124, scoopHead(false), -11, 0.82))
}

const ARCS = [
  ['M62 76C46 56 28 66 22 106', 1],
  ['M112 64C124 50 136 60 140 100', 2],
  ['M68 56C64 42 52 36 42 52', 3],
] as const

const GRAINS = [
  [24, 92, 3.6, 1],
  [36, 66, 3, 2],
  [58, 58, 3.4, 3],
  [106, 54, 3.2, 1],
  [130, 66, 3.8, 2],
  [139, 90, 3, 3],
  [44, 45, 2.8, 4],
] as const

function sandArcs(): Art {
  return part('sand-arcs', [
    ARCS.map(([d, delay]) =>
      motion(
        'flicker',
        svg`<path d=${d} fill="none" stroke=${SAND} stroke-width="3.4" stroke-linecap="round" stroke-dasharray="1 9" />`,
        delay,
      ),
    ),
    GRAINS.map(([x, y, r, delay]) =>
      at(x, y, motion('fall', svg`<circle r=${r} fill=${SAND_LIGHT} />`, delay)),
    ),
  ])
}

function sifting(): Art {
  return part('scoop', [
    at(80, 92, motion('wobble', scoopHead(true), 1), 24),
    (
      [
        [86, 104, 1],
        [78, 108, 3],
        [94, 110, 5],
      ] as const
    ).map(([x, y, d]) => at(x, y, motion('fall', svg`<circle r="2.8" fill=${SAND} />`, d))),
  ])
}

function bag(x: number, size: number): Art {
  return part('bag', [
    svg`<ellipse cx=${x} cy="182" rx=${23 * size} ry="4.5" fill="#0c0f1e" opacity=".3" />`,
    at(
      x,
      182,
      motion('wobble', [
        svg`<path d="M-7-44C-23-38-25-18-23-8C-22-2-17 1-11 1H11C17 1 22-2 23-8C25-18 23-38 7-44Z" fill=${BAG} />`,
        svg`<path d="M-13-30C-16-20-16-10-13-4M10-32C14-22 15-12 12-4" fill="none" stroke=${BAG_SHADE} stroke-width="2.6" stroke-linecap="round" />`,
        svg`<path d="M-3-50C-11-60-17-55-15-49C-13-45-7-46-3-47ZM3-50C11-60 17-55 15-49C13-45 7-46 3-47Z" fill=${BAG} />`,
        svg`<path d="M-9-52C-7-50-5-49-3-48.5M9-52C7-50 5-49 3-48.5" fill="none" stroke=${BAG_SHADE} stroke-width="1.8" stroke-linecap="round" />`,
        svg`<rect x="-7" y="-50" width="14" height="7" rx="3.5" fill=${TIE} />`,
      ]),
      0,
      size,
    ),
  ])
}

function errand(): Art {
  return part('errand', [
    svg`<circle cx="130" cy="80" r="3.4" fill=${C.cream} /><circle cx="118" cy="70" r="5" fill=${C.cream} />`,
    at(
      72,
      52,
      motion('pulse', [
        svg`<circle cx="-16" cy="5" r="17" fill=${C.cream} /><circle cx="14" cy="5" r="18" fill=${C.cream} /><circle cy="-8" r="21" fill=${C.cream} /><rect x="-32" y="4" width="64" height="18" rx="9" fill=${C.cream} />`,
        svg`<path d="M-11-6H11L8.6 16Q8.3 19 5.5 19H-5.5Q-8.3 19-8.6 16Z" fill=${C.metalDark} />`,
        svg`<rect x="-14" y="-12" width="28" height="6" rx="3" fill=${INK} opacity=".72" />`,
        svg`<rect x="-4.5" y="-16" width="9" height="5" rx="2.5" fill=${INK} opacity=".72" />`,
        svg`<path d="M-4 0L-3 13M4 0L3 13" stroke=${C.cream} stroke-width="2.2" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

function headShape(fur: string): Art {
  return svg`<path d="M-25 2C-27-14-14-22 0-22C14-22 27-14 25 2C23 16 12 20 0 20C-12 20-23 16-25 2Z" fill=${fur} />`
}

function ears(): Art {
  return [
    svg`<path d="M-23-5L-22-33Q-21-36-18-34L-3-19Z" fill=${FUR} stroke=${FUR} stroke-width="3" stroke-linejoin="round" />`,
    svg`<path d="M23-5L22-33Q21-36 18-34L3-19Z" fill=${FUR} stroke=${FUR} stroke-width="3" stroke-linejoin="round" />`,
    svg`<path d="M-19-13L-18.5-28L-9-18.5Z" fill=${EAR} stroke=${EAR} stroke-width="2" stroke-linejoin="round" />`,
    svg`<path d="M19-13L18.5-28L9-18.5Z" fill=${EAR} stroke=${EAR} stroke-width="2" stroke-linejoin="round" />`,
  ]
}

function headStripes(): Art {
  return svg`<path d="M-7-21.5V-14M0-22.5V-13M7-21.5V-14" stroke=${FUR_DARK} stroke-width="3.4" stroke-linecap="round" /><path d="M-25.5-1H-19M25.5-1H19" stroke=${FUR_DARK} stroke-width="3" stroke-linecap="round" />`
}

function muzzle(smile: boolean): Art {
  return [
    svg`<ellipse cy="9.5" rx="10" ry="7.2" fill=${FUR_LIGHT} />`,
    svg`<path d="M-3 4.5H3Q3.6 5 3 6L.6 8.4Q0 9-.6 8.4L-3 6Q-3.6 5-3 4.5Z" fill=${NOSE} />`,
    svg`<path d=${smile ? 'M-6 10Q-3 14 0 10.5Q3 14 6 10' : 'M-5 14Q0 10.5 5 14'} fill="none" stroke=${INK} stroke-width="2.2" stroke-linecap="round" />`,
  ]
}

function whiskers(): Art {
  return svg`<path d="M-13 8L-31 5M-13 12L-30 14M13 8L31 5M13 12L30 14" stroke=${C.cream} stroke-width="1.6" stroke-linecap="round" opacity=".85" />`
}

type EyeKind = 'side' | 'stare' | 'watch' | 'down' | 'shut' | 'bliss' | 'squeeze'

function eye(x: number, kind: EyeKind, flip: number): Art {
  if (kind === 'shut') {
    return svg`<path d=${`M${x - 6} -1Q${x} 4 ${x + 6} -1`} fill="none" stroke=${INK} stroke-width="2.8" stroke-linecap="round" />`
  }
  if (kind === 'bliss') {
    return svg`<path d=${`M${x - 6.5} 1Q${x} -7 ${x + 6.5} 1`} fill="none" stroke=${INK} stroke-width="3" stroke-linecap="round" />`
  }
  if (kind === 'squeeze') {
    const tip = x + flip * 6
    const back = x - flip * 6
    return svg`<path d=${`M${back} -5L${tip} -.5L${back} 4`} fill="none" stroke=${INK} stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />`
  }
  if (kind === 'stare') {
    return [
      svg`<circle cx=${x} cy="-1" r="7.6" fill=${EYE} />`,
      svg`<circle cx=${x} cy="-.5" r="2.6" fill=${INK} />`,
      svg`<path d=${`M${x - 9.5} ${-8 + flip * 2}L${x + 9.5} ${-8 - flip * 2}`} stroke=${INK} stroke-width="2.8" stroke-linecap="round" />`,
    ]
  }
  if (kind === 'watch') {
    return [
      svg`<circle cx=${x} cy="-1" r="7.8" fill=${EYE} />`,
      svg`<circle cx=${x - 2} cy="-2.4" r="5.2" fill=${INK} />`,
      svg`<circle cx=${x - 3.6} cy="-4.6" r="1.7" fill="#fff" />`,
    ]
  }
  const pupil = kind === 'down' ? x - 2.4 : x - 3.6
  const low = kind === 'down' ? 3.6 : 2.8
  return [
    svg`<path d=${`M${x - 7.5} -2A7.5 7.5 0 0 0 ${x + 7.5} -2Z`} fill=${EYE} />`,
    svg`<ellipse cx=${pupil} cy=${low - 2.8 + 0.4} rx="3" ry="3.2" fill=${INK} />`,
    svg`<path d=${`M${x - 9} ${-2 + flip * 1.6}L${x + 9} ${-2 - flip * 1.6}`} stroke=${INK} stroke-width="2.8" stroke-linecap="round" />`,
  ]
}

function clothesPeg(): Art {
  return part('peg', [
    svg`<path d="M-5-6H-.8L-1.6 27Q-5 31.5-8 27ZM5-6H.8L1.6 27Q5 31.5 8 27Z" fill=${C.sun} />`,
    svg`<path d="M-3.2 14.5H-1.2L-2.2 25H-5ZM3.2 14.5H1.2L2.2 25H5Z" fill=${C.sunDark} />`,
    svg`<rect x="-8.4" y="4" width="16.8" height="7.4" rx="3.7" fill=${C.metal} />`,
    svg`<rect x="-8.4" y="6.8" width="16.8" height="1.8" fill=${C.metalDark} />`,
  ])
}

function head(kind: EyeKind, parts: LitterParts, smile = false): Art {
  return [
    ears(),
    headShape(FUR),
    headStripes(),
    whiskers(),
    muzzle(smile),
    eye(-11, parts.squint && kind !== 'bliss' ? 'squeeze' : kind, -1),
    eye(11, parts.squint && kind !== 'bliss' ? 'squeeze' : kind, 1),
    when(parts.peg, () => at(0, 6.5, clothesPeg(), 9)),
  ]
}

function sittingBody(tail: Art): Art {
  return [
    tail,
    svg`<path d="M-20 0C-27-20-17-46 0-46C17-46 27-20 20 0Q19 3 15 3H-15Q-19 3-20 0Z" fill=${FUR} />`,
    svg`<path d="M-9-2C-13-16-8-34 0-34C8-34 13-16 9-2Z" fill=${FUR_LIGHT} />`,
    svg`<path d="M-23-16L-15-14.5M-24.5-8L-16-7M23-16L15-14.5M24.5-8L16-7" stroke=${FUR_DARK} stroke-width="3.4" stroke-linecap="round" />`,
  ]
}

function paws(left = true): Art {
  return [
    left ? svg`<rect x="-14" y="-12" width="12" height="16" rx="6" fill=${FUR_LIGHT} />` : [],
    svg`<rect x="2" y="-12" width="12" height="16" rx="6" fill=${FUR_LIGHT} />`,
  ]
}

const TAIL_CURL = 'M15 0C27 4 31-6 28-18C26-25 21-26 20-20'
const TAIL_UP = 'M16-4C27-8 29-30 25-44C23-51 27-58 29-54'

const CAT_SCALE = 0.92

function tailStroke(d: string): Art {
  return [
    svg`<path d=${d} fill="none" stroke=${FUR} stroke-width="10" stroke-linecap="round" />`,
    svg`<path d=${d} fill="none" stroke=${FUR_DARK} stroke-width="10" stroke-linecap="round" stroke-dasharray="0 88 12" pathLength="100" />`,
  ]
}

function sitting(
  x: number,
  kind: EyeKind,
  parts: LitterParts,
  tailPath: string,
  front: Art,
  tilt = 0,
  smile = false,
): Art {
  return at(
    x,
    180,
    [
      sittingBody(tailStroke(tailPath)),
      front,
      at(0, -60, motion('sway', head(kind, parts, smile), 2), tilt),
    ],
    0,
    CAT_SCALE,
  )
}

function loaf(): Art {
  return at(
    158,
    180,
    motion('throb', [
      svg`<path d="M-27 2C-34-20-18-40 4-40C24-40 34-20 28 2Q27 4 22 4H-22Q-26 4-27 2Z" fill=${FUR} />`,
      svg`<path d="M18-34L27-30M24-24L31-20M26-14L31-11" stroke=${FUR_DARK} stroke-width="3.4" stroke-linecap="round" />`,
      svg`<path d="M28-3C32 7 8 8-14 5" fill="none" stroke=${mix(FUR, FUR_DARK, 0.42)} stroke-width="9" stroke-linecap="round" />`,
      at(
        -8,
        -24,
        [
          ears(),
          headShape(FUR),
          headStripes(),
          muzzle(true),
          eye(-11, 'shut', -1),
          eye(11, 'shut', 1),
        ],
        -7,
        0.86,
      ),
    ]),
    0,
    0.94,
  )
}

function zees(): Art {
  return part('zzz', [
    at(
      176,
      112,
      motion(
        'rise',
        svg`<path d="M-6-6H6L-6 6H6" fill="none" stroke=${C.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
        1,
      ),
    ),
    at(
      184,
      92,
      motion(
        'rise',
        svg`<path d="M-4.5-4.5H4.5L-4.5 4.5H4.5" fill="none" stroke=${C.cream} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".8" />`,
        3,
      ),
      0,
      0.9,
    ),
  ])
}

function tapper(y: number, rotate: number): Art {
  return part(
    'tap',
    at(
      -6,
      y,
      motion(
        'wobble',
        [
          svg`<path d="M0 0C-14 2-24 8-31 12" fill="none" stroke=${FUR} stroke-width="11" stroke-linecap="round" />`,
          svg`<circle cx="-32" cy="13" r="7.4" fill=${FUR_LIGHT} />`,
          svg`<path d="M-36 12V17M-32 13V19M-28 13V18" stroke=${FUR_DARK} stroke-width="1.8" stroke-linecap="round" />`,
        ],
        2,
      ),
      rotate,
    ),
  )
}

function tapMarks(): Art {
  return part(
    'tap-marks',
    at(
      124,
      116,
      svg`<path d="M-8-3L-11-10M0-5V-13M8-3L11-10" stroke=${C.cream} stroke-width="3" stroke-linecap="round" />`,
    ),
  )
}

function walkingAway(parts: LitterParts): Art {
  return part(
    'cat',
    at(155, 180, [
      at(
        -21,
        -24,
        motion(
          'sway',
          [
            svg`<path d="M0 8C-9-8-11-34-6-52C-3-63 9-62 10-53" fill="none" stroke=${FUR} stroke-width="9" stroke-linecap="round" />`,
            svg`<path d="M-11-16L-3-15M-12-30L-4-29M-10-44L-2-43" stroke=${FUR_DARK} stroke-width="3.2" stroke-linecap="round" />`,
          ],
          1,
        ),
      ),
      motion('bob', [
        svg`<rect x="-20" y="-20" width="11" height="23" rx="5.5" fill=${FUR_DARK} />`,
        svg`<rect x="12" y="-20" width="11" height="23" rx="5.5" fill=${FUR_DARK} />`,
        svg`<path d="M-26-18C-28-36-14-42 3-42C18-42 28-36 27-20C26-8 18-7 3-7C-14-7-25-8-26-18Z" fill=${FUR} />`,
        svg`<path d="M-14-40L-12-31M-5-41L-4-31M4-41L5-31" stroke=${FUR_DARK} stroke-width="3.4" stroke-linecap="round" />`,
        at(
          -13,
          -14,
          svg`<rect x="-5.5" y="-2" width="11" height="21" rx="5.5" fill=${FUR_LIGHT} />`,
          12,
        ),
        at(
          11,
          -14,
          svg`<rect x="-5.5" y="-2" width="11" height="21" rx="5.5" fill=${FUR_LIGHT} />`,
          -12,
        ),
      ]),
      at(
        18,
        -49,
        [
          svg`<path d="M-3-14L0-30Q1-33 4-31L13-19Z" fill=${shadeOf(FUR, 0.14)} stroke=${shadeOf(FUR, 0.14)} stroke-width="3" stroke-linejoin="round" />`,
          svg`<path d="M-12-12L-13-31Q-13-34-10-33L4-21Z" fill=${FUR} stroke=${FUR} stroke-width="3" stroke-linejoin="round" />`,
          svg`<path d="M-8.5-16L-9.5-27.5L-1.5-21Z" fill=${EAR} stroke=${EAR} stroke-width="2" stroke-linejoin="round" />`,
          svg`<path d="M-16 0C-18-14-8-22 2-21C12-20 17-13 17-5L18.5-1Q18.5 3 14.5 4C13.5 11 7 15 0 14C-9 14-15 9-16 0Z" fill=${FUR} />`,
          svg`<path d="M-11-14L-3-11M-15-6L-7-5" stroke=${FUR_DARK} stroke-width="3.2" stroke-linecap="round" />`,
          svg`<path d="M1-5Q5.5-1 10-4.5" fill="none" stroke=${INK} stroke-width="2.8" stroke-linecap="round" />`,
          svg`<ellipse cx="10" cy="7" rx="7.5" ry="5.6" fill=${FUR_LIGHT} />`,
          svg`<path d="M15-.5L18.6-1.4Q20 0 18.4 2.4Z" fill=${NOSE} />`,
          when(parts.peg, () => at(15, 1.5, clothesPeg(), 14, 0.8)),
        ],
        -14,
        0.92,
      ),
    ]),
  )
}

function cat(parts: LitterParts): Art {
  const poses: Record<CatPose, () => Art> = {
    loaf: () => loaf(),
    side: () => sitting(158, 'side', parts, TAIL_CURL, paws(), -4),
    stare: () => sitting(158, 'stare', parts, TAIL_CURL, [paws(false), tapper(-42, 26)], -7),
    watch: () => sitting(158, 'watch', parts, TAIL_UP, paws(), -9),
    nudge: () => sitting(160, 'down', parts, TAIL_UP, [paws(false), tapper(-30, 6)], -10),
    smug: () => sitting(158, 'bliss', parts, TAIL_UP, paws(), 7, true),
    away: () => walkingAway(parts),
  }
  return parts.pose === 'away' ? poses.away() : part('cat', poses[parts.pose]())
}

type Spot = readonly [number, number]

const PILE_STENCH: readonly Spot[] = [
  [18, 112],
  [122, 104],
  [42, 72],
]
const SAND_STENCH: readonly Spot[] = [
  [62, 104],
  [104, 102],
  [84, 68],
]
const BAG_STENCH: readonly Spot[] = [
  [100, 126],
  [24, 112],
  [128, 124],
]

function stenchSpots(parts: LitterParts): readonly Spot[] {
  if (parts.bag) return BAG_STENCH
  return parts.scoop ? SAND_STENCH : PILE_STENCH
}

const FLY_SPOTS: readonly Spot[] = [
  [28, 36],
  [126, 30],
  [170, 62],
]

const CLEAN_SPARKLES = [
  [58, 80, 1.2, 1],
  [118, 66, 1.05, 2],
  [86, 38, 0.9, 3],
  [178, 40, 0.75, 4],
] as const

function heart(x: number, y: number): Art {
  return part(
    'heart',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<path d="M0 8C-13-1-11-10-5-10C-2-10 0-7 0-6C0-7 2-10 5-10C11-10 13-1 0 8Z" fill=${C.pink} />`,
        2,
      ),
    ),
  )
}

export function litter(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = litterParts(scene)
  const paint = paintOf(scene)
  const art: Art = [
    shadow(76, 183, 66),
    shadow(parts.pose === 'away' ? 154 : 158, 183, parts.pose === 'away' ? 33 : 27, 0.24),
    trayBack(paint),
    when(parts.scoop, restingScoop),
    sandBed(parts.raked),
    lumpsArt(parts.lumps),
    when(parts.flag, surrender),
    when(parts.scooping, sifting),
    trayFront(parts.mood, paint),
    when(parts.overflow, spilled),
    when(parts.scooping, sandArcs),
    when(parts.bag, () => (parts.pose === 'away' ? bag(110, 0.9) : bag(116, 1))),
    cat(parts),
    when(parts.pose === 'loaf', zees),
    when(parts.pose === 'stare', tapMarks),
    when(parts.errand, errand),
    stenchLines(stenchSpots(parts).slice(0, parts.stench)),
    FLY_SPOTS.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
    when(parts.sparkles, () => [
      CLEAN_SPARKLES.map(([x, y, size, delay]) => sparkle(x, y, size, delay)),
      heart(140, 82),
    ]),
  ]
  return frame('litter', scene, options, art)
}
