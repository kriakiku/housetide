import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  at,
  blobPath,
  clamp01,
  COLORS as C,
  face,
  fly,
  frame,
  mix,
  motion,
  part,
  reached,
  round,
  shadow,
  sparkle,
  stenchLines,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type BedView = 'made' | 'changing' | 'bare'

export interface BedParts {
  view: BedView
  rumple: number
  stains: number
  crumbs: number
  mites: number
  stench: number
  flies: number
  stool: boolean
  night: boolean
  pretty: boolean
  mood: Mood
}

export const MAX_RUMPLE = 5

const STAINS_AT = [0.05, 0.25, 0.5] as const
const CRUMBS_AT = [0.15, 0.4] as const
const MITES_AT = [0.45, 0.65, 0.85] as const
const STENCH_AT = [0.2, 0.5, 0.75] as const
const FLIES_AT = [0.7, 0.92] as const

export function bedParts(scene: SceneView): BedParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const dirt = {
    stains: reached(stink, STAINS_AT),
    crumbs: reached(stink, CRUMBS_AT),
    mites: reached(stink, MITES_AT),
    stench: reached(stink, STENCH_AT),
    flies: reached(stink, FLIES_AT),
  }
  const base = { rumple: 0, stool: false, night: false, pretty: false, ...dirt }
  if (state === 'clean') return { ...base, view: 'made', pretty: true, mood: 'happy' }
  if (state === 'running') {
    return { ...base, view: 'changing', stains: Math.min(dirt.stains, 2), mites: 0, mood: 'happy' }
  }
  if (state === 'waiting') {
    return { ...base, view: 'bare', mood: stink >= 0.6 ? 'sick' : 'calm' }
  }
  if (state === 'due') {
    return {
      ...base,
      view: 'made',
      rumple: MAX_RUMPLE,
      stool: true,
      mood: stink >= 0.45 ? 'sick' : 'pleading',
    }
  }
  const rumple = state === 'resting' ? 0 : Math.min(MAX_RUMPLE - 1, Math.floor(fill * MAX_RUMPLE))
  let mood: Mood = state === 'resting' ? 'sleepy' : rumple >= 3 ? 'worried' : 'calm'
  if (stink >= 0.45) mood = 'sick'
  return { ...base, view: 'made', rumple, night: state === 'resting', mood }
}

const NIGHT = '#2b3566'
const CUFF = '#e7dfff'
const STAIN = '#a8925a'
const WOOD_FACE = '#5b3413'
const STRIPE = '#c9dcf3'

const HEAD_Y = 122
const FOOT_Y = 154
const HEM_Y = 175
const WOBBLES = [1, -0.7, 1.15, -0.9, 0.8, -1.1] as const

interface Palette {
  wood: string
  woodDark: string
  woodLight: string
  top: string
  side: string
  crease: string
  cuff: string
  cuffShade: string
  pillow: string
  pillowShade: string
}

function palette(parts: BedParts): Palette {
  const grime = parts.stains * 0.13
  const tone = (hex: string, dirty = true): string =>
    mix(dirty ? mix(hex, '#8f8a66', grime) : hex, NIGHT, parts.night ? 0.3 : 0)
  return {
    wood: tone(C.wicker, false),
    woodDark: tone(C.wickerDark, false),
    woodLight: tone(C.wickerLight, false),
    top: tone(C.lilac),
    side: tone(mix(C.lilac, C.lilacDark, 0.7)),
    crease: tone(mix(C.lilacDark, '#5f4aa8', 0.45)),
    cuff: tone(CUFF),
    cuffShade: tone(mix(CUFF, C.lilac, 0.55)),
    pillow: tone(C.cream),
    pillowShade: tone(C.creamDark),
  }
}

function wave(x0: number, y0: number, x1: number, y1: number, amp: number, bumps: number): string {
  return Array.from({ length: bumps }, (_, i) => {
    const mid = (i + 0.5) / bumps
    const end = (i + 1) / bumps
    const k = WOBBLES[i % WOBBLES.length] ?? 1
    return `Q${round(x0 + (x1 - x0) * mid)} ${round(y0 + (y1 - y0) * mid + amp * k)} ${round(x0 + (x1 - x0) * end)} ${round(y0 + (y1 - y0) * end)}`
  }).join('')
}

function scale(art: Art, x: number, size: number): Art {
  return at(x, 184, at(-100, -184, art), 0, size)
}

function headboard(p: Palette, mood: Mood): Art {
  return part('headboard', [
    svg`<rect x="26" y="70" width="14" height="110" rx="6" fill=${p.woodDark} /><rect x="160" y="70" width="14" height="110" rx="6" fill=${p.woodDark} />`,
    svg`<circle cx="33" cy="66" r="9" fill=${p.woodLight} /><circle cx="167" cy="66" r="9" fill=${p.woodLight} />`,
    svg`<path d="M36 134V84C36 62 66 50 100 50C134 50 164 62 164 84V134Z" fill=${p.wood} />`,
    svg`<path d="M46 134V88C46 70 72 60 100 60C128 60 154 70 154 88V134Z" fill=${p.woodLight} />`,
    face(100, 76, mood, WOOD_FACE, 1),
  ])
}

function frameBase(p: Palette): Art {
  return part('frame', [
    svg`<rect x="30" y="172" width="14" height="13" rx="3" fill=${p.woodDark} /><rect x="156" y="172" width="14" height="13" rx="3" fill=${p.woodDark} />`,
    svg`<rect x="20" y="164" width="160" height="14" rx="6" fill=${p.wood} />`,
  ])
}

const PILLOW = 'M-27-15Q0-21 27-15Q33 0 27 15Q0 21-27 15Q-33 0-27-15Z'

function pillow(
  x: number,
  y: number,
  rotate: number,
  size: number,
  fill: string,
  shade: string,
  dent: boolean,
): Art {
  return part(
    'pillow',
    at(
      x,
      y,
      [
        svg`<path d=${PILLOW} fill=${shade} stroke=${shade} stroke-width="7" stroke-linejoin="round" />`,
        svg`<path d=${PILLOW} fill=${fill} stroke=${fill} stroke-width="3" stroke-linejoin="round" />`,
        dent
          ? svg`<path d="M-14 1q14 10 28-2" fill="none" stroke=${shade} stroke-width="3.5" stroke-linecap="round" />`
          : svg`<path d="M-22-9q5 3 3 8" fill="none" stroke=${shade} stroke-width="3" stroke-linecap="round" />`,
      ],
      rotate,
      size,
    ),
  )
}

function pillows(parts: BedParts, p: Palette): Art {
  const r = parts.rumple
  const size = parts.pretty ? 1.06 : 1
  const dent = r >= 2
  return [
    pillow(
      (parts.pretty ? 67 : 70) - r * 1.2,
      108 + r * 0.5,
      -r * 2.6,
      size,
      p.pillow,
      p.pillowShade,
      dent,
    ),
    pillow(
      (parts.pretty ? 133 : 130) + r * 2,
      108 + r * 1.2,
      r * 5,
      size,
      p.pillow,
      p.pillowShade,
      dent,
    ),
  ]
}

const CREASES: ReadonlyArray<readonly [number, string]> = [
  [1, 'M58 142q14-8 28 0'],
  [1, 'M122 136q12 7 26-1'],
  [2, 'M92 147q11-8 24-1'],
  [2, 'M46 164q8 5 15 0'],
  [3, 'M138 164q9-5 17 1'],
  [3, 'M84 141q9 4 17-1'],
  [4, 'M96 166q9-6 18 0'],
  [4, 'M36 148q10-6 19-1'],
  [5, 'M146 148q9 5 19-2'],
  [5, 'M70 170q7-5 13 0'],
]

function flower(x: number, y: number, color: string, centre: string, size: number): Art {
  const petals = [0, 72, 144, 216, 288].map(
    (a) =>
      svg`<ellipse cx="0" cy="-5.2" rx="3.4" ry="4.4" transform=${`rotate(${a})`} fill=${color} />`,
  )
  return at(x, y, [petals, svg`<circle r="2.8" fill=${centre} />`], 0, size)
}

function pattern(): Art {
  const spots = [
    [70, 145, 0.82],
    [100, 145, 0.82],
    [130, 145, 0.82],
    [40, 166, 1],
    [80, 166, 1],
    [120, 166, 1],
    [160, 166, 1],
  ] as const
  return part(
    'pattern',
    spots.map(([x, y, size]) => flower(x, y, C.cream, C.sun, size)),
  )
}

function scallops(): string {
  return Array.from({ length: 11 }, () => 'q-5.8 9-11.6 0').join('')
}

function blanket(parts: BedParts, p: Palette): Art {
  const r = parts.rumple
  const hemAmp = [0, 2, 3.5, 5.5, 8, 11][r] ?? 0
  const foldAmp = r * 1.1
  const bulge = r * 1.1
  const hem = wave(177, HEM_Y, 23, HEM_Y, hemAmp, 6)
  const whole = `M44 ${HEAD_Y}L156 ${HEAD_Y}Q${167 + bulge} ${HEAD_Y + 18} 177 ${FOOT_Y}L177 ${HEM_Y}${hem}L23 ${FOOT_Y}Q${33 - bulge} ${HEAD_Y + 18} 44 ${HEAD_Y}Z`
  const front = `M23 ${FOOT_Y}${wave(23, FOOT_Y, 177, FOOT_Y, foldAmp, 5)}L177 ${HEM_Y}${hem}Z`
  const cuffEdge = parts.pretty ? scallops() : wave(166, 134, 34, 134, r * 1.2, 4)
  return part('blanket', [
    svg`<path d=${whole} fill=${p.top} stroke=${p.top} stroke-width="5" stroke-linejoin="round" />`,
    svg`<path d=${front} fill=${p.side} stroke=${p.side} stroke-width="5" stroke-linejoin="round" />`,
    when(parts.pretty, pattern),
    svg`<path d=${`M42 120H158L${parts.pretty ? 165.8 : 166} 134${cuffEdge}L42 120Z`} fill=${p.cuff} stroke=${p.cuff} stroke-width="3" stroke-linejoin="round" data-part="cuff" />`,
    svg`<path d="M50 127H150" stroke=${p.cuffShade} stroke-width="2.6" stroke-linecap="round" />`,
    CREASES.filter(([min]) => r >= min).map(
      ([, d]) =>
        svg`<path d=${d} fill="none" stroke=${p.crease} stroke-width="3.4" stroke-linecap="round" data-part="crease" />`,
    ),
    when(r >= 4, () =>
      part(
        'flipped',
        svg`<path d="M176 155L146 153Q160 149 164 136Q172 146 176 155Z" fill=${p.cuff} stroke=${p.cuff} stroke-width="3" stroke-linejoin="round" /><path d="M150 151Q160 146 164 140" fill="none" stroke=${p.cuffShade} stroke-width="2.4" stroke-linecap="round" />`,
      ),
    ),
  ])
}

function stains(count: number): Art {
  const spots = [
    [120, 141, 13, 6.5],
    [58, 160, 11, 7.5],
    [146, 162, 9, 6.5],
  ] as const
  return spots
    .slice(0, count)
    .map(([x, y, w, h], i) =>
      part(
        'stain',
        at(
          x,
          y,
          svg`<path d=${blobPath(w, h)} fill=${STAIN} /><path d=${blobPath(w * 0.55, h * 0.5)} fill=${mix(STAIN, '#6d5a30', 0.55)} />`,
        ),
        i,
      ),
    )
}

const CRUMB_SPOTS = [
  [78, 141, 2.6],
  [86, 147, 2],
  [71, 148, 1.8],
  [96, 139, 1.6],
  [150, 146, 2.6],
  [142, 151, 2],
  [156, 153, 1.7],
  [108, 158, 2.3],
] as const

function crumbs(count: number): Art {
  const shown = count >= 2 ? CRUMB_SPOTS.length : 4
  return count > 0
    ? part(
        'crumbs',
        CRUMB_SPOTS.slice(0, shown).map(
          ([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${C.sunDark} />`,
        ),
      )
    : []
}

function mite(x: number, y: number, index: number): Art {
  const legs = 'M-9-3l-6-3M-10 2h-7M-8 6l-6 4M9-3l6-3M10 2h7M8 6l6 4'
  return part(
    'mite',
    at(
      x,
      y,
      motion(
        'wobble',
        [
          svg`<path d=${legs} fill="none" stroke=${C.mustyDark} stroke-width="2.4" stroke-linecap="round" />`,
          svg`<path d="M-4-10l-3-6M4-10l3-6" fill="none" stroke=${C.mustyDark} stroke-width="2.2" stroke-linecap="round" />`,
          svg`<circle r="11.5" fill=${C.musty} />`,
          svg`<circle cx="-4.6" cy="-1.6" r="4.2" fill="#fff" /><circle cx="4.6" cy="-1.6" r="4.2" fill="#fff" />`,
          svg`<circle cx="-3.8" cy="-1" r="2.2" fill=${C.fly} /><circle cx="5.4" cy="-1" r="2.2" fill=${C.fly} />`,
          svg`<path d="M-3 6q3 2.6 6 0" fill="none" stroke=${C.fly} stroke-width="1.8" stroke-linecap="round" />`,
        ],
        (index % 3) + 1,
      ),
    ),
    index,
  )
}

const MITE_SPOTS = [
  [62, 142],
  [140, 150],
  [100, 164],
] as const

function mites(count: number): Art {
  return MITE_SPOTS.slice(0, count).map(([x, y], i) => mite(x, y, i))
}

function folded(x: number, y: number, size: number): Art {
  return part(
    'fresh-set',
    at(
      x,
      y,
      [
        svg`<rect x="-24" y="-13" width="48" height="13" rx="6" fill=${C.lilac} />`,
        svg`<rect x="-22" y="-25" width="44" height="13" rx="6" fill=${C.cream} />`,
        svg`<rect x="-20" y="-37" width="40" height="13" rx="6" fill=${C.pink} />`,
        svg`<path d="M-18-6.5h36M-16-18.5h32M-14-30.5h28" stroke="#000" stroke-opacity=".12" stroke-width="2.6" stroke-linecap="round" />`,
        svg`<rect x="-3.5" y="-37" width="7" height="37" fill=${C.sun} />`,
        svg`<path d="M0-38C-12-49-16-37-3-37M0-38C12-49 16-37 3-37" fill=${C.sun} stroke=${C.sunDark} stroke-width="1.6" stroke-linejoin="round" />`,
      ],
      0,
      size,
    ),
  )
}

function stool(): Art {
  return part('stool', [
    shadow(162, 184, 24),
    svg`<path d="M148 146L142 184M176 146L182 184" stroke=${C.wickerDark} stroke-width="6.5" stroke-linecap="round" />`,
    svg`<path d="M146 168H178" stroke=${C.wickerDark} stroke-width="4.5" stroke-linecap="round" />`,
    svg`<rect x="138" y="138" width="48" height="10" rx="5" fill=${C.wickerLight} />`,
  ])
}

function moon(): Art {
  return part(
    'moon',
    at(
      42,
      36,
      motion('bob', svg`<path d="M6-17A18 18 0 1 0 17 8A14.5 14.5 0 0 1 6-17Z" fill=${C.sun} />`),
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
        'drift',
        svg`<path d="M-7-7H7L-7 7H7" fill="none" stroke=${C.cream} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      -8,
      size,
    ),
  )
}

function dream(): Art {
  return [
    moon(),
    zed(134, 42, 0.9, 1),
    zed(153, 28, 1.2, 2),
    at(84, 24, motion('twinkle', svg`<circle r="2.6" fill=${C.spark} />`, 2)),
    at(178, 66, motion('twinkle', svg`<circle r="2.2" fill=${C.spark} />`, 3)),
    at(18, 76, motion('twinkle', svg`<circle r="2" fill=${C.spark} />`, 1)),
  ]
}

const STENCH_SPOTS = [
  [18, 128],
  [182, 122],
  [100, 46],
] as const

const FLY_SPOTS = [
  [40, 34],
  [152, 22],
] as const

const NIGHT_FLY_SPOTS = [
  [72, 26],
  [120, 28],
] as const

const BARE_FLY_SPOTS = [
  [40, 34],
  [96, 28],
] as const

function grimeLayer(parts: BedParts): Art {
  return [
    stenchLines(STENCH_SPOTS.slice(0, parts.stench)),
    (parts.night ? NIGHT_FLY_SPOTS : FLY_SPOTS)
      .slice(0, parts.flies)
      .map(([x, y], i) => fly(x, y, i)),
  ]
}

function madeBed(parts: BedParts): Art {
  const p = palette(parts)
  return [
    shadow(100, 184, 80),
    headboard(p, parts.mood),
    frameBase(p),
    pillows(parts, p),
    blanket(parts, p),
    stains(parts.stains),
    crumbs(parts.crumbs),
    mites(parts.mites),
  ]
}

function made(parts: BedParts): Art {
  if (parts.stool) {
    return [
      scale(madeBed(parts), 78, 0.82),
      stool(),
      at(162, 138, motion('bob', folded(0, 0, 0.92))),
      sparkle(176, 82, 0.7, 2),
      sparkle(142, 92, 0.5, 4),
      grimeLayer(parts),
    ]
  }
  return [
    madeBed(parts),
    when(parts.night, dream),
    when(parts.pretty, () => [
      sparkle(26, 46, 1.25, 1),
      sparkle(174, 40, 1.05, 2),
      sparkle(100, 26, 0.85, 3),
      sparkle(20, 134, 0.7, 4),
      sparkle(180, 130, 0.8, 5),
    ]),
    grimeLayer(parts),
  ]
}

function mattress(): Art {
  const lines = Array.from({ length: 7 }, (_, i) => (i + 1) / 8)
  return part('mattress', [
    svg`<path d="M44 116H156L178 150V172H22V150Z" fill=${C.metal} stroke=${C.metal} stroke-width="6" stroke-linejoin="round" />`,
    lines.map(
      (t) =>
        svg`<path d=${`M${round(44 + 112 * t)} 118L${round(22 + 156 * t)} 150V172`} fill="none" stroke=${STRIPE} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
    svg`<path d="M21 150H179" stroke=${C.metalMid} stroke-width="4.5" stroke-linecap="round" />`,
  ])
}

function barePillow(x: number, rotate: number): Art {
  return part(
    'bare-pillow',
    at(
      x,
      107,
      [
        svg`<path d=${PILLOW} fill=${C.metalDark} stroke=${C.metalDark} stroke-width="7" stroke-linejoin="round" />`,
        svg`<path d=${PILLOW} fill=${C.metalMid} stroke=${C.metalMid} stroke-width="3" stroke-linejoin="round" />`,
        svg`<path d="M-18-13V13M-6-15V15M6-15V15M18-13V13" stroke=${C.metalDark} stroke-opacity=".55" stroke-width="2.6" stroke-linecap="round" />`,
      ],
      rotate,
      0.92,
    ),
  )
}

function bareFrame(parts: BedParts, mood: Mood): Art {
  const p = palette({ ...parts, night: false, stains: 0 })
  return [shadow(100, 184, 80), headboard(p, mood), frameBase(p), mattress()]
}

const SHEET_TOP = 'M14 60C22 28 52 36 76 22C100 8 126 30 150 18C168 9 182 24 187 42'
const SHEET_HEM = 'C176 68 154 50 130 64C108 76 88 58 66 68C44 78 26 66 14 60Z'

function sheet(): Art {
  const dots = [
    [36, 48],
    [58, 40],
    [80, 34],
    [104, 28],
    [130, 36],
    [152, 30],
    [172, 36],
    [48, 60],
    [72, 52],
    [96, 50],
    [120, 52],
    [144, 48],
    [166, 50],
  ] as const
  const under = mix(C.creamDark, C.sky, 0.35)
  return part(
    'sheet',
    motion(
      'bob',
      at(
        100,
        46,
        motion(
          'sway',
          at(-100, -46, [
            svg`<path d="M14 60C26 78 46 84 66 76C88 66 108 84 130 72C154 58 176 76 187 42C176 54 154 42 130 54C108 66 88 48 66 58C44 68 26 66 14 60Z" fill=${under} stroke=${under} stroke-width="3" stroke-linejoin="round" />`,
            svg`<path d=${SHEET_TOP + SHEET_HEM} fill=${C.cream} stroke=${C.cream} stroke-width="4" stroke-linejoin="round" />`,
            dots.map(([x, y]) => svg`<circle cx=${x} cy=${y} r="2.8" fill=${C.sky} />`),
            svg`<path d="M66 66Q70 50 62 38M130 62Q124 46 134 32" fill="none" stroke=${C.creamDark} stroke-width="3.4" stroke-linecap="round" />`,
          ]),
        ),
      ),
    ),
  )
}

function swoosh(): Art {
  const lines = [
    [10, 108, 'M0 0q10-8 20-4'],
    [170, 104, 'M0-4q10-4 20 4'],
    [14, 132, 'M0 0q7-6 15-3'],
    [171, 129, 'M0-3q8-3 15 3'],
  ] as const
  return part(
    'swoosh',
    lines.map(([x, y, d], i) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,
          (i % 2) + 1,
        ),
      ),
    ),
  )
}

function mattressStains(count: number): Art {
  const spots = [
    [78, 138, 13, 6.5],
    [132, 160, 11, 6.5],
    [58, 160, 9, 6],
  ] as const
  return spots
    .slice(0, count)
    .map(([x, y, w, h], i) =>
      part('stain', at(x, y, svg`<path d=${blobPath(w, h)} fill=${STAIN} />`), i),
    )
}

function changing(parts: BedParts): Art {
  return [
    scale([bareFrame(parts, parts.mood), mattressStains(parts.stains)], 100, 0.84),
    sheet(),
    swoosh(),
    stenchLines(
      (
        [
          [62, 170],
          [138, 170],
          [100, 170],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

function wish(): Art {
  return part('wish', [
    svg`<circle cx="120" cy="50" r="3.6" fill=${C.cream} /><circle cx="130" cy="42" r="5.6" fill=${C.cream} />`,
    at(
      158,
      30,
      motion('pulse', [
        svg`<circle r="22" fill=${C.cream} />`,
        at(0, 0, svg`<path d=${PILLOW} fill=${C.lilac} />`, -6, 0.5),
      ]),
    ),
  ])
}

function bare(parts: BedParts): Art {
  const lines = [
    [18, 128],
    [182, 122],
    [62, 46],
  ] as const
  return [
    bareFrame(parts, parts.mood),
    barePillow(67, -6),
    barePillow(133, 6),
    mattressStains(parts.stains),
    crumbs(parts.crumbs),
    mites(Math.min(parts.mites, 2)),
    at(100, 162, motion('bob', folded(0, 0, 1))),
    wish(),
    stenchLines(lines.slice(0, parts.stench)),
    BARE_FLY_SPOTS.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

export function bed(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = bedParts(scene)
  const views: Record<BedView, () => Art> = {
    made: () => made(parts),
    changing: () => changing(parts),
    bare: () => bare(parts),
  }
  return frame('bed', scene, options, views[parts.view]())
}
