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
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type JournalView = 'closed' | 'writing' | 'drying'
export type PenSpot = 'top' | 'side' | 'behind' | 'none'

export interface JournalParts {
  view: JournalView
  droop: number
  pages: number
  latched: boolean
  bound: boolean
  written: number
  pen: PenSpot
  asking: boolean
  asleep: boolean
  dust: number
  coffee: number
  rust: number
  moths: number
  holes: number
  stench: number
  decay: number
  mood: Mood
}

export const MAX_DROOP = 4

const DUST_AT = [0.05, 0.3] as const
const COFFEE_AT = [0.18, 0.5] as const
const RUST_AT = [0.3, 0.65] as const
const MOTHS_AT = [0.45, 0.82] as const
const HOLES_AT = [0.6, 0.85] as const
const STENCH_AT = [0.75, 0.95] as const
const SICK_AT = 0.6

const QUIET = {
  droop: 0,
  pages: 0,
  latched: true,
  bound: false,
  written: 0,
  pen: 'none',
  asking: false,
  asleep: false,
  dust: 0,
  coffee: 0,
  rust: 0,
  moths: 0,
  holes: 0,
  stench: 0,
  decay: 0,
} as const

const ROWS = [
  [20, 11, 15],
  [13, 24, 9],
  [27, 19],
  [10, 16, 20],
] as const

const TOTAL = ROWS.reduce((sum, row) => sum + row.length, 0)

export function journalParts(scene: SceneView): JournalParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...QUIET, view: 'closed', bound: true, pen: 'behind', mood: 'happy' }
  }
  const dust = reached(stink, DUST_AT)
  const coffee = reached(stink, COFFEE_AT)
  const rust = reached(stink, RUST_AT)
  const moths = reached(stink, MOTHS_AT)
  const holes = reached(stink, HOLES_AT)
  const stench = reached(stink, STENCH_AT)
  const decay = reached(stink, [...DUST_AT, ...COFFEE_AT, ...RUST_AT, ...MOTHS_AT]) / 6
  const sick = stink >= SICK_AT
  if (state === 'running') {
    const written = Math.max(1, Math.min(TOTAL, Math.ceil(clamp01(scene.progress) * TOTAL)))
    return {
      ...QUIET,
      view: 'writing',
      latched: false,
      written,
      dust: Math.min(1, dust),
      coffee: Math.min(1, coffee),
      rust,
      decay: decay * 0.5,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      view: 'drying',
      latched: false,
      written: TOTAL,
      dust,
      coffee: Math.min(1, coffee),
      rust,
      moths,
      decay,
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_DROOP, Math.floor(fill * (MAX_DROOP + 1)))
  const droop = due ? MAX_DROOP : resting ? 0 : raw
  let mood: Mood = resting ? 'sleepy' : droop >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    view: 'closed',
    droop,
    pages: due
      ? 4 - (coffee >= 2 ? 1 : 0) - (moths >= 2 ? 1 : 0)
      : resting
        ? 0
        : Math.max(0, droop - (moths >= 2 ? 1 : 0)),
    latched: droop < 2,
    pen: due || droop >= 2 ? 'side' : 'top',
    asking: due,
    asleep: resting,
    dust,
    coffee,
    rust,
    moths,
    holes,
    stench,
    decay,
    mood,
  }
}

const PAPER = '#fffaf0'
const PAGE_EDGE = '#e3dbc6'
const COFFEE = '#7a4f2a'
const COFFEE_DARK = '#4f3219'
const RUST = '#a8562e'
const RUST_DARK = '#74371b'
const DUST = '#ddd0ad'
const DUST_DARK = '#b6a67f'
const DULL = '#8d8270'
const INK_WET = '#2f7fd0'
const INK_DRY = '#2a2f4d'
const MOTH = '#ecdcb6'
const MOTH_DARK = '#94805a'
const HEART = 'M0 10C-16 0-15-12-7-12C-3.5-12-1-10 0-7C1-10 3.5-12 7-12C15-12 16 0 0 10Z'
const WAVY = 'M0 0c-6-5 6-10 0-15c-6-5 6-10 0-15'

function heart(x: number, y: number, color: string, size = 1, rotate = 0): Art {
  return at(x, y, svg`<path d=${HEART} fill=${color} />`, rotate, size)
}

function pen(): Art {
  return part('pen', [
    svg`<path d="M0 0L-6.5-14V-22H6.5V-14Z" fill=${C.sun} />`,
    svg`<path d="M0-3V-13" stroke=${C.sunDark} stroke-width="1.8" stroke-linecap="round" />`,
    svg`<circle cy="-14" r="2" fill=${C.sunDark} />`,
    svg`<rect x="-8" y="-29" width="16" height="9" rx="2.5" fill=${C.metalMid} />`,
    svg`<rect x="-8" y="-82" width="16" height="55" rx="6" fill=${C.sky} />`,
    svg`<rect x="-8" y="-82" width="5" height="55" rx="2.5" fill=${C.skyDark} opacity=".45" />`,
    svg`<rect x="-8" y="-68" width="16" height="4" fill=${C.sun} />`,
    svg`<rect x="-6.5" y="-92" width="13" height="13" rx="5.5" fill=${C.skyDark} />`,
  ])
}

function plateColors(rust: number): { plate: string; dark: string } {
  if (rust >= 2) return { plate: RUST, dark: RUST_DARK }
  if (rust === 1) return { plate: mix(C.sun, RUST, 0.55), dark: mix(C.sunDark, RUST_DARK, 0.6) }
  return { plate: C.sun, dark: C.sunDark }
}

function clasp(rust: number): Art {
  const { plate, dark } = plateColors(rust)
  return part('clasp', [
    svg`<rect x="-14" y="-18" width="28" height="36" rx="8" fill=${plate} />`,
    svg`<rect x="-14" y="10" width="28" height="8" rx="4" fill=${dark} opacity=".6" />`,
    svg`<circle cy="-3" r="4.6" fill=${C.fly} /><path d="M-2.4-2H2.4L4 9H-4Z" fill=${C.fly} />`,
    when(
      rust === 0,
      () => svg`<rect x="-9" y="-13" width="7" height="3.6" rx="1.8" fill="#fff6d0" />`,
    ),
    when(
      rust >= 1,
      () =>
        svg`<g fill=${RUST_DARK}><circle cx="-8" cy="-11" r="2.6" /><circle cx="9" cy="-6" r="1.9" /><circle cx="8" cy="7" r="2.8" /></g>`,
    ),
    when(
      rust >= 2,
      () =>
        svg`<g fill="#d67a3f"><circle cx="-9" cy="4" r="2.2" /><circle cx="2" cy="-14" r="1.8" /><circle cx="-3" cy="13" r="2" /></g>`,
    ),
  ])
}

function flakes(x: number, y: number): Art {
  return part(
    'rust-flakes',
    (
      [
        [-6, 0, 1],
        [5, 8, 3],
      ] as const
    ).map(([dx, dy, d]) =>
      at(
        x + dx,
        y + dy,
        motion('drip', svg`<rect x="-2" y="-2" width="4" height="4" rx="1" fill=${RUST} />`, d),
      ),
    ),
  )
}

const RIBBON_PATHS = [
  [70, 50, 66, 30, 46, 40, 30, 28],
  [70, 50, 64, 28, 44, 26, 28, 38],
  [70, 50, 62, 28, 36, 30, 33, 62],
  [70, 50, 62, 30, 42, 34, 45, 96],
  [70, 50, 62, 32, 51, 38, 52, 144],
] as const

function ribbonTail(droop: number, color: string, dark: string): Art {
  const shape = RIBBON_PATHS[droop] ?? RIBBON_PATHS[0]
  const [ax, ay, bx, by, cx, cy, x, y] = shape
  const angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI - 90
  return part('ribbon', [
    svg`<rect x=${ax - 7} y=${ay - 6} width="14" height="9" rx="3" fill=${dark} />`,
    svg`<path d=${`M${ax} ${ay}C${bx} ${by} ${cx} ${cy} ${x} ${y}`} fill="none" stroke=${color} stroke-width="9" stroke-linecap="butt" />`,
    at(x, y, svg`<path d="M-4.5-1H4.5V14L0 8.5L-4.5 14Z" fill=${dark} />`, angle),
  ])
}

function danglingStrap(rust: number, dark: string): Art {
  return part('strap', [
    svg`<path d="M160 112C181 112 182 132 178 148" fill="none" stroke=${dark} stroke-width="14" stroke-linecap="round" />`,
    at(177, 156, clasp(rust), 8, 0.66),
    when(rust >= 2, () => flakes(176, 172)),
  ])
}

function latchedStrap(rust: number, dark: string): Art {
  return part('strap', [
    svg`<rect x="136" y="104" width="34" height="22" rx="7" fill=${dark} />`,
    at(139, 115, clasp(rust)),
    when(rust >= 2, () => flakes(139, 141)),
  ])
}

function stitches(tint: string): Art {
  return svg`<rect x="66" y="57" width="72" height="108" rx="9" fill="none" stroke=${tint} stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 7.2" opacity=".85" />`
}

function coverDust(step: number): Art {
  if (step === 0) return []
  const specks = [
    [76, 72, 1.9],
    [118, 62, 1.6],
    [130, 84, 2],
    [84, 140, 1.7],
    [112, 150, 1.5],
    [74, 118, 1.4],
    [46, 112, 1.7],
  ] as const
  return part('dust', [
    specks.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST} opacity=".9" />`),
    when(
      step >= 2,
      () =>
        svg`<path d="M38 52Q36 44 46 44Q54 39 64 43Q74 38 84 43Q96 38 106 43Q118 38 128 43Q144 40 146 52Q136 48 126 51Q112 47 100 51Q86 47 74 51Q58 47 50 51Q44 49 38 52Z" fill=${DUST} />`,
    ),
  ])
}

function floorDust(): Art {
  return part('dust-bunny', [
    svg`<ellipse cx="30" cy="184" rx="11" ry="4.5" fill=${DUST_DARK} /><ellipse cx="28" cy="182" rx="7" ry="3.5" fill=${DUST} />`,
    svg`<ellipse cx="176" cy="182" rx="8" ry="3.4" fill=${DUST_DARK} /><ellipse cx="175" cy="180.5" rx="5" ry="2.4" fill=${DUST} />`,
  ])
}

function ring(x: number, y: number, r: number, dash = ''): Art {
  return svg`<circle cx=${x} cy=${y} r=${r} fill=${COFFEE} fill-opacity=".14" stroke=${COFFEE} stroke-opacity=".78" stroke-width="3.6" stroke-dasharray=${dash || 'none'} stroke-linecap="round" />`
}

function coverCoffee(step: number): Art {
  if (step === 0) return []
  return part('coffee-stain', [
    ring(114, 146, 14),
    when(step >= 2, () => ring(90, 154, 11, '30 12')),
    when(
      step >= 2,
      () =>
        svg`<path d="M95 47H111V58Q111 62 108 62T105 58V54Q103 52 101 54V76Q101 81 98 81T95 76Z" fill=${COFFEE} />`,
    ),
  ])
}

function mug(mouldy: boolean): Art {
  return part(
    'mug',
    at(
      103,
      47,
      [
        svg`<path d="M15-22H21Q29-22 29-14T21-6H15" fill="none" stroke=${C.creamDark} stroke-width="5" stroke-linecap="round" />`,
        svg`<path d="M-17-28H17V-5Q17 0 12 0H-12Q-17 0-17-5Z" fill=${C.cream} />`,
        svg`<ellipse cy="-28" rx="17" ry="4.6" fill=${C.creamDark} />`,
        svg`<ellipse cy="-27.4" rx="13.5" ry="3" fill=${mouldy ? C.musty : COFFEE_DARK} />`,
        svg`<path d="M-9-28V-16Q-9-13-6.5-13T-4-16V-27Z" fill=${COFFEE} />`,
        when(
          mouldy,
          () =>
            svg`<g fill=${C.stench}><circle cx="-8" cy="-31" r="3.6" /><circle cx="-1" cy="-33" r="4.6" /><circle cx="8" cy="-31" r="3.8" /></g>`,
        ),
      ],
      -2,
      0.87,
    ),
  )
}

function moth(x: number, y: number, index: number, size = 1): Art {
  const wing = 'M1-2C9-13 22-13 25-7C26-1 17 5 8 4C13 7 13 13 8 14C3 14 1 8 1 2Z'
  const half = svg`<path d=${wing} fill=${MOTH} /><circle cx="15" cy="-6" r="3" fill=${MOTH_DARK} /><path d="M6 8q2 2 3 0" fill="none" stroke=${MOTH_DARK} stroke-width="1.6" stroke-linecap="round" />`
  return part(
    'moth',
    at(
      x,
      y,
      motion(
        'buzz',
        at(
          0,
          0,
          [
            svg`<g>${half}</g><g transform="scale(-1 1)">${half}</g>`,
            svg`<ellipse rx="3.6" ry="9.5" cy="1" fill=${MOTH_DARK} />`,
            svg`<path d="M-1-8Q-3-15-9-15M1-8Q3-15 9-15" fill="none" stroke=${MOTH_DARK} stroke-width="1.8" stroke-linecap="round" />`,
            svg`<circle cx="-2" cy="-6" r="1.1" fill=${C.fly} /><circle cx="2" cy="-6" r="1.1" fill=${C.fly} />`,
          ],
          index % 2 ? 16 : -14,
          size,
        ),
        (index % 3) + 1,
      ),
    ),
    index,
  )
}

const HOLE_SPOTS = [
  [72, 70, 5],
  [132, 66, 4],
  [136, 152, 6],
  [70, 146, 4],
] as const

function mothHoles(count: number, rim: string): Art {
  return part(
    'moth-holes',
    HOLE_SPOTS.slice(0, count).map(
      ([x, y, r], i) =>
        svg`<path d=${`M${x - r} ${y}l${r * 0.5}-${r * 0.9}l${r * 0.7} ${r * 0.2}l${r * 0.8}-${r * 0.1}l${r * 0.2} ${r * 0.9}l-${r * 0.6} ${r * 0.8}l-${r} 0Z`} fill=${PAPER} stroke=${rim} stroke-width="2.2" stroke-linejoin="round" data-index=${i} />`,
    ),
  )
}

function sheet(rotate: number, size: number): Art {
  return at(
    0,
    0,
    [
      svg`<path d="M-15-20Q0-25 15-20Q20 0 15 20Q0 15-15 20Q-20 0-15-20Z" fill=${PAPER} />`,
      svg`<path d="M15-20Q20 0 15 20Q7 17.4 2 17Q10 0 6-22.4Q11-21.4 15-20Z" fill=${PAGE_EDGE} opacity=".7" />`,
    ],
    rotate,
    size,
  )
}

const SHEETS = [
  [175, 76, 18, 0.74, 'sway', 1],
  [150, 32, 28, 0.62, 'bob', 2],
  [25, 62, -20, 0.76, 'bob', 3],
  [60, 31, -12, 0.58, 'drift', 4],
] as const

const DUE_SHEETS = [
  [175, 82, 22, 0.72, 'sway', 1],
  [27, 54, -22, 0.8, 'bob', 2],
  [66, 31, 14, 0.56, 'drift', 3],
  [116, 27, -10, 0.46, 'bob', 4],
] as const

function loosePages(count: number, due: boolean): Art {
  const spots = due ? DUE_SHEETS : SHEETS
  return part(
    'blank-pages',
    spots
      .slice(0, count)
      .map(([x, y, r, s, name, d], i) => part('page', at(x, y, motion(name, sheet(r, s), d)), i)),
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

function askBubble(): Art {
  return part('asking', [
    svg`<circle cx="149" cy="56" r="3.6" fill=${C.cream} /><circle cx="156" cy="49" r="5.4" fill=${C.cream} />`,
    at(162, 26, [
      svg`<rect x="-24" y="-14" width="50" height="30" rx="14" fill=${C.cream} transform="translate(0 2)" />`,
      at(1, 3, [
        svg`<rect x="-14" y="-5" width="17" height="4.5" rx="2.25" fill=${C.creamDark} />`,
        svg`<rect x="-14" y="3" width="24" height="4.5" rx="2.25" fill=${C.creamDark} />`,
        motion(
          'flicker',
          svg`<rect x="6.5" y="-8" width="4.5" height="10.5" rx="2" fill=${C.coralDark} />`,
        ),
      ]),
    ]),
  ])
}

function bandAndHeart(band: string, bandDark: string): Art {
  return part('heart-ribbon', [
    svg`<rect x="36" y="136" width="134" height="17" fill=${band} />`,
    svg`<rect x="36" y="149" width="134" height="4" fill=${bandDark} opacity=".55" />`,
    svg`<path d="M100 146C86 130 66 134 68 146C70 156 88 154 100 146ZM106 146C120 130 140 134 138 146C136 156 118 154 106 146Z" fill=${band} />`,
    svg`<path d="M95 150L84 176L92 172L97 180L102 152ZM111 150L122 176L114 172L109 180L104 152Z" fill=${bandDark} />`,
    heart(103, 147, C.pink, 1.26),
    svg`<path d="M95 138Q91 139 91 144" fill="none" stroke="#ffd7ec" stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function closedBody(parts: JournalParts, accent: string): Art {
  const cover = mix(accent, DULL, parts.decay * 0.42)
  const shade = shadeOf(cover, 0.22)
  const deep = shadeOf(cover, 0.42)
  const tint = tintOf(cover, 0.42)
  const ribbon = tintOf(accent, 0.72)
  const ribbonDark = tintOf(accent, 0.4)
  const pagesColor = mix(PAPER, DUST, parts.decay * 0.5)
  return [
    part('book', [
      svg`<rect x="56" y="54" width="114" height="128" rx="10" fill=${deep} />`,
      svg`<path d="M60 56H159Q163 56 163 60V174Q163 178 159 178H60Z" fill=${pagesColor} />`,
      svg`<path d="M152 60V175M157.5 60V175" stroke=${PAGE_EDGE} stroke-width="2" />`,
      svg`<rect x="36" y="46" width="114" height="130" rx="11" fill=${cover} />`,
      svg`<path d="M47 46H58V176H47A11 11 0 0 1 36 165V57A11 11 0 0 1 47 46Z" fill=${shade} />`,
      svg`<rect x="58" y="46" width="3.4" height="130" fill=${deep} opacity=".55" />`,
      svg`<rect x="36" y="64" width="22" height="5" fill=${tint} opacity=".8" /><rect x="36" y="154" width="22" height="5" fill=${tint} opacity=".8" />`,
      stitches(tint),
      svg`<path d="M150 62V57A11 11 0 0 0 139 46H134Z M150 160V165A11 11 0 0 1 139 176H134Z" fill=${C.sun} />`,
    ]),
    mothHoles(parts.holes, deep),
    coverCoffee(parts.coffee),
    coverDust(parts.dust),
    parts.bound ? bandAndHeart(ribbon, ribbonDark) : [],
    parts.latched ? latchedStrap(parts.rust, deep) : danglingStrap(parts.rust, deep),
    when(parts.bound, () => [
      svg`<circle cx="75" cy="113" r="6.5" fill=${C.pink} opacity=".55" /><circle cx="117" cy="113" r="6.5" fill=${C.pink} opacity=".55" />`,
    ]),
    face(96, parts.bound ? 100 : 108, parts.mood, shadeOf(accent, 0.76), 1.32),
    ribbonTail(parts.droop, ribbon, ribbonDark),
  ]
}

function closedScene(parts: JournalParts, accent: string): Art {
  const body = closedBody(parts, accent)
  return [
    shadow(104, 184, 74),
    when(parts.pen === 'behind', () => at(136, 93, at(0, 0, pen(), 16, 0.86))),
    when(parts.dust >= 2, floorDust),
    parts.bound ? motion('bob', body) : body,
    when(parts.coffee >= 2, () => mug(parts.stench >= 1)),
    when(parts.pen === 'top', () => at(60, 40, pen(), 90, 0.86)),
    when(parts.pen === 'side', () =>
      at(
        21,
        180,
        parts.asking ? motion('sway', at(0, 0, pen(), 4, 0.92)) : at(0, 0, pen(), 4, 0.92),
      ),
    ),
    loosePages(parts.pages, parts.asking),
    when(parts.asking, askBubble),
    when(parts.asking && parts.mood === 'pleading', () =>
      part('tear', at(111, 122, motion('drip', drop(0, 0, C.water, 0.72), 2))),
    ),
    when(parts.asleep, () => [zed(152, 34, 0.7, 1), zed(168, 24, 0.95, 2), zed(182, 40, 0.55, 3)]),
    when(parts.bound, () => [
      part('hearts', [
        at(26, 50, motion('bob', heart(0, 0, C.pink, 0.8, -14), 1)),
        at(176, 40, motion('bob', heart(0, 0, C.pink, 1, 12), 2)),
      ]),
      sparkle(26, 104, 1.2, 1),
      sparkle(182, 92, 0.9, 2),
      sparkle(92, 24, 1, 3),
      sparkle(24, 156, 0.75, 4),
      sparkle(60, 28, 0.55, 5),
    ]),
    stenchLines(
      (
        [
          [68, 116],
          [181, 148],
        ] as const
      ).slice(0, parts.stench),
    ),
    (
      [
        [126, 80],
        [62, 31],
      ] as const
    )
      .slice(0, parts.moths)
      .map(([x, y], i) => moth(x, y, i, i === 0 ? 0.82 : 0.9)),
  ]
}

function rowY(base: number, x: number): number {
  const lift = Math.max(0, (134 - x) / 24)
  return round(base + 5 * lift * lift)
}

interface Segment {
  x0: number
  x1: number
  base: number
}

const SEGMENTS: readonly Segment[] = ROWS.flatMap((row, r) => {
  const out: Segment[] = []
  let x = 114
  for (const w of row) {
    out.push({ x0: x, x1: x + w, base: 114 + r * 12 })
    x += w + 6
  }
  return out
})

function bars(count: number, color: string): Art {
  return part(
    'written',
    SEGMENTS.slice(0, count).map(
      ({ x0, x1, base }) =>
        svg`<path d=${`M${x0} ${rowY(base, x0)}L${x1} ${rowY(base, x1)}`} stroke=${color} stroke-width="5" stroke-linecap="round" />`,
    ),
  )
}

function openDust(step: number): Art {
  if (step === 0) return []
  const specks = [
    [40, 110, 1.8],
    [78, 150, 1.6],
    [36, 150, 1.5],
    [160, 104, 1.7],
    [126, 158, 1.5],
  ] as const
  return part('dust', [
    specks.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST_DARK} />`),
    when(
      step >= 2,
      () =>
        svg`<path d="M16 96Q14 88 26 89Q40 84 54 88Q70 84 84 89Q94 87 96 95Q86 92 74 94Q56 90 42 94Q28 92 16 96Z" fill=${DUST} />`,
    ),
  ])
}

function openBook(parts: JournalParts, accent: string, ink: string): Art {
  const cover = mix(accent, DULL, parts.decay * 0.42)
  const shade = shadeOf(cover, 0.3)
  const deep = shadeOf(cover, 0.46)
  const paper = mix(PAPER, DUST, parts.decay * 0.5)
  const edge = mix(PAGE_EDGE, DUST_DARK, parts.decay * 0.5)
  const leftPage = 'M100 110C84 96 54 92 26 98V168C54 162 84 165 100 176Z'
  const rightPage = 'M100 110C116 96 146 92 174 98V168C146 162 116 165 100 176Z'
  const ribbon = tintOf(accent, 0.72)
  const ribbonDark = tintOf(accent, 0.4)
  return part('book', [
    svg`<path d="M104 106C102 86 90 74 72 80" fill="none" stroke=${ribbon} stroke-width="9" />`,
    at(72, 80, svg`<path d="M-4.5-1H4.5V14L0 8.5L-4.5 14Z" fill=${ribbonDark} />`, 108),
    svg`<path d="M12 98Q12 90 20 90H180Q188 90 188 98V174Q188 182 180 182H112Q104 182 100 186Q96 182 88 182H20Q12 182 12 174Z" fill=${shade} />`,
    svg`<path d="M12 98Q12 90 20 90H180Q188 90 188 98V170Q188 178 180 178H112Q104 178 100 182Q96 178 88 178H20Q12 178 12 170Z" fill=${cover} />`,
    svg`<g transform="translate(0 4)"><path d=${leftPage} fill=${edge} /><path d=${rightPage} fill=${edge} /></g>`,
    svg`<path d=${leftPage} fill=${paper} /><path d=${rightPage} fill=${paper} />`,
    svg`<path d="M100 110C96 106 92 103 88 101C90 124 92 150 88 169C93 171 97 173 100 176C104 173 107 171 112 169C108 150 110 124 112 101C108 103 104 106 100 110Z" fill=${edge} opacity=".6" />`,
    svg`<path d="M100 110V176" stroke=${edge} stroke-width="3" stroke-linecap="round" />`,
    face(63, 130, parts.mood, ink, 1.14),
    svg`<path d="M183 124C189 134 188 150 184 158" fill="none" stroke=${deep} stroke-width="11" stroke-linecap="round" />`,
    at(182, 164, clasp(parts.rust), 6, 0.5),
    openDust(parts.dust),
    when(parts.coffee >= 1, () => part('coffee-stain', ring(39, 152, 9, '32 8'))),
  ])
}

function scribbles(x: number, y: number): Art {
  return part(
    'scribble',
    (
      [
        [-13, -7, 'M0 6L-7 2', 1],
        [12, -8, 'M0 6L7 1', 2],
        [14, 4, 'M0 2H8', 3],
      ] as const
    ).map(([dx, dy, d, delay]) =>
      at(
        x + dx,
        y + dy,
        motion(
          'flicker',
          svg`<path d=${d} stroke=${C.spark} stroke-width="3.4" stroke-linecap="round" />`,
          delay,
        ),
      ),
    ),
  )
}

function floaters(): Art {
  const rising = [
    [38, 74, C.pink, 0.72, 1],
    [66, 52, C.sun, 0.56, 3],
    [28, 40, C.coral, 0.5, 4],
  ] as const
  const words = [
    [92, 60, 2],
    [52, 26, 5],
  ] as const
  return part('ideas', [
    rising.map(([x, y, color, s, d]) => at(x, y, motion('rise', heart(0, 0, color, s), d))),
    words.map(([x, y, d]) =>
      at(
        x,
        y,
        motion(
          'rise',
          svg`<rect x="-12" y="-3" width="13" height="6" rx="3" fill=${C.cream} /><rect x="5" y="-3" width="8" height="6" rx="3" fill=${C.cream} />`,
          d,
        ),
      ),
    ),
  ])
}

function writingScene(parts: JournalParts, accent: string): Art {
  const last = SEGMENTS[Math.max(0, parts.written - 1)] ?? SEGMENTS[0]
  const nibX = last ? last.x1 + 3 : 120
  const nibY = last ? rowY(last.base, last.x1) + 1 : 118
  return [
    shadow(100, 185, 88),
    floaters(),
    openBook(parts, accent, INK_DRY),
    bars(parts.written, INK_DRY),
    when(parts.rust >= 2, () => flakes(180, 178)),
    at(nibX, nibY, motion('wobble', at(0, 0, pen(), -22, 0.82))),
    scribbles(Math.min(nibX, 164), nibY),
    sparkle(160, 34, 0.8, 2),
    sparkle(30, 80, 0.55, 3),
  ]
}

function inkwell(): Art {
  return part('inkwell', [
    shadow(168, 184, 22, 0.28),
    at(172, 158, at(0, 0, pen(), 9, 0.78)),
    svg`<rect x="158" y="146" width="22" height="9" rx="3" fill=${C.metalDark} />`,
    svg`<path d="M154 154H184Q188 154 188 158V178Q188 184 182 184H156Q150 184 150 178V158Q150 154 154 154Z" fill=${C.glass} />`,
    svg`<path d="M150 166H188V178Q188 184 182 184H156Q150 184 150 178Z" fill=${INK_WET} />`,
    svg`<rect x="155" y="158" width="4" height="20" rx="2" fill="#fff" opacity=".5" />`,
  ])
}

function hourglass(): Art {
  return at(
    44,
    44,
    motion('pulse', [
      svg`<circle r="26" fill=${C.cream} />`,
      svg`<path d="M-11-16H11M-11 16H11" stroke=${C.wickerDark} stroke-width="4.6" stroke-linecap="round" />`,
      svg`<path d="M-8-14H8Q8-5 1.6 0Q8 5 8 14H-8Q-8 5-1.6 0Q-8-5-8-14Z" fill=${C.sky} opacity=".35" />`,
      svg`<path d="M-5.6-8H5.6Q4.4-4 0-1Q-4.4-4-5.6-8ZM-6.6 13.5Q-5 7 0 5Q5 7 6.6 13.5Z" fill=${C.sunDark} />`,
    ]),
  )
}

function dryingWaft(): Art {
  const wafts = [
    [96, 90, 1],
    [114, 86, 2],
    [132, 90, 3],
  ] as const
  return part('drying', [
    wafts.map(([x, y, d]) =>
      at(
        x,
        y,
        motion(
          'waft',
          svg`<path d=${WAVY} fill="none" stroke="#bfe3ff" stroke-width="4" stroke-linecap="round" />`,
          d,
        ),
      ),
    ),
    hourglass(),
  ])
}

function wetGlints(): Art {
  return part(
    'wet-ink',
    SEGMENTS.filter((_, i) => i % 3 === 1).map(({ x0, x1, base }, i) =>
      at(
        round((x0 + x1) / 2),
        rowY(base, x0) - 0.8,
        motion(
          'twinkle',
          svg`<rect x="-3" y="-1" width="6" height="2" rx="1" fill="#e6f5ff" />`,
          (i % 4) + 1,
        ),
      ),
    ),
  )
}

function dryingScene(parts: JournalParts, accent: string): Art {
  return [
    shadow(81, 185, 70),
    at(
      81,
      184,
      at(-100, -184, [openBook(parts, accent, INK_DRY), bars(parts.written, INK_WET), wetGlints()]),
      0,
      0.8,
    ),
    at(2, 0, inkwell()),
    dryingWaft(),
    (
      [
        [150, 50],
        [100, 34],
      ] as const
    )
      .slice(0, parts.moths)
      .map(([x, y], i) => moth(x, y, i, 0.9)),
  ]
}

export function journal(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = journalParts(scene)
  const accent = accentOf(scene, C.coral)
  const views: Record<JournalView, () => Art> = {
    closed: () => closedScene(parts, accent),
    writing: () => writingScene(parts, accent),
    drying: () => dryingScene(parts, accent),
  }
  return frame('journal', scene, options, views[parts.view]())
}
