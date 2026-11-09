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
  bubble,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type AirconView = 'wall' | 'rinse' | 'rack'
export type AirconLouvre = 'shut' | 'open' | 'empty'
export type AirconLamp = 'off' | 'on' | 'alarm' | 'cool'

export interface AirconParts {
  view: AirconView
  fluff: number
  peek: number
  breeze: number
  wilt: number
  mould: number
  spores: number
  droop: number
  sneeze: boolean
  tissues: boolean
  stench: number
  flies: number
  grime: number
  filterMould: number
  louvre: AirconLouvre
  lamp: AirconLamp
  asleep: boolean
  frost: boolean
  mood: Mood
}

export const MAX_FLUFF = 4

const PEEKS = [0, 0, 0, 13, 52] as const
const BREEZES = [3, 3, 2, 1, 0] as const

const MOULD_AT = [0.08, 0.3, 0.55, 0.82] as const
const WILT_AT = [0.2, 0.5] as const
const DROOP_AT = [0.15, 0.45] as const
const SNEEZE_AT = 0.42
const TISSUES_AT = 0.72
const SPORES_AT = [0.4, 0.65, 0.88] as const
const STENCH_AT = [0.62, 0.84] as const
const FLIES_AT = [0.78, 0.94] as const
const FILTER_MOULD_AT = [0.25, 0.6] as const
const SICK_AT = 0.6

const QUIET = {
  fluff: 0,
  peek: 0,
  breeze: 0,
  wilt: 0,
  mould: 0,
  spores: 0,
  droop: 0,
  sneeze: false,
  tissues: false,
  stench: 0,
  flies: 0,
  grime: 0,
  filterMould: 0,
  asleep: false,
  frost: false,
} as const

export function airconParts(scene: SceneView): AirconParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...QUIET,
      view: 'wall',
      breeze: 3,
      louvre: 'open',
      lamp: 'cool',
      frost: true,
      mood: 'happy',
    }
  }
  const mould = reached(stink, MOULD_AT)
  const shared = {
    mould,
    droop: reached(stink, DROOP_AT),
    spores: reached(stink, SPORES_AT),
    stench: reached(stink, STENCH_AT),
    flies: reached(stink, FLIES_AT),
    sneeze: stink >= SNEEZE_AT,
    tissues: stink >= TISSUES_AT,
  }
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...QUIET,
      view: 'rinse',
      mould: Math.min(2, mould),
      droop: Math.min(1, shared.droop),
      grime: Math.max(1, 3 - Math.floor(clamp01(scene.progress) * 3)),
      filterMould: reached(stink, FILTER_MOULD_AT),
      louvre: 'empty',
      lamp: 'on',
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      ...shared,
      view: 'rack',
      filterMould: reached(stink, FILTER_MOULD_AT),
      louvre: 'empty',
      lamp: 'on',
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_FLUFF - 1, Math.ceil(fill * (MAX_FLUFF - 1)))
  const fluff = due ? MAX_FLUFF : resting ? 0 : raw
  let mood: Mood = resting ? 'sleepy' : fluff >= 2 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...shared,
    view: 'wall',
    fluff,
    peek: PEEKS[fluff] ?? 0,
    breeze: resting ? 0 : (BREEZES[fluff] ?? 0),
    wilt: resting ? 0 : reached(stink, WILT_AT),
    grime: 3,
    louvre: resting ? 'shut' : 'open',
    lamp: resting ? 'off' : due ? 'alarm' : 'on',
    asleep: resting,
    mood,
  }
}

const W = 172
const LEFT = 14
const H = 72
const R = 18
const CENTER = 100

const ICE = '#bdeaff'
const ICE_DEEP = '#7fd0fb'
const VENT = '#171d36'
const MESH = '#e9f0f9'
const MESH_LINE = '#bfcbe0'
const FLUFF = '#bcc2d1'
const FLUFF_DARK = '#99a0b4'
const FLUFF_LIGHT = '#dde1ea'
const MOULD = '#4d7046'
const MOULD_DARK = '#34502f'
const MOULD_SPOT = '#94b765'
const YELLOWED = '#cfc9a0'
const BROWN_LEAF = '#9b7a3e'
const TISSUE = '#fdfaf2'
const CAP = '#c2563f'
const STALK = '#ece2c6'
const POT_INK = '#5b2612'

interface Tones {
  trim: string
  dark: string
  light: string
}

function tonesOf(scene: SceneView): Tones {
  const trim = accentOf(scene, C.sky)
  return { trim, dark: shadeOf(trim), light: tintOf(trim, 0.5) }
}

function unitTop(parts: AirconParts): number {
  return parts.view === 'wall' ? 30 : 18
}

type Clump = readonly [number, number, number]

function lobesOf([x, y, r]: Clump): ReadonlyArray<readonly [number, number, number]> {
  return [
    [x, y + r * 0.08, r],
    [x - r * 0.78, y + r * 0.04, r * 0.7],
    [x + r * 0.76, y - r * 0.06, r * 0.66],
    [x - r * 0.3, y + r * 0.62, r * 0.56],
    [x + r * 0.42, y + r * 0.58, r * 0.5],
  ]
}

function fluffMass(clumps: readonly Clump[], glint: boolean): Art {
  const lobes = clumps.flatMap(lobesOf)
  return [
    lobes.map(
      ([x, y, r]) =>
        svg`<circle cx=${round(x)} cy=${round(y + 1.6)} r=${round(r)} fill=${FLUFF_DARK} />`,
    ),
    lobes.map(
      ([x, y, r]) =>
        svg`<circle cx=${round(x)} cy=${round(y - 0.4)} r=${round(r - 0.6)} fill=${FLUFF} />`,
    ),
    when(glint, () =>
      clumps.map(
        ([x, y, r]) =>
          svg`<ellipse cx=${round(x - r * 0.25)} cy=${round(y - r * 0.38)} rx=${round(r * 0.46)} ry=${round(r * 0.26)} fill=${FLUFF_LIGHT} />`,
      ),
    ),
  ]
}

function tuft(x: number, y: number, r: number): Art {
  return fluffMass([[x, y, r]], true)
}

const TUFTS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [],
  [
    [72, 8],
    [132, 9],
  ],
  [
    [48, 8],
    [72, 9],
    [102, 10.5],
    [132, 9.5],
    [156, 7.5],
  ],
  [
    [38, 8],
    [56, 10],
    [78, 9],
    [100, 11.5],
    [124, 9.5],
    [144, 11],
    [162, 8],
  ],
  [
    [36, 8.5],
    [50, 10],
    [66, 9],
    [82, 10.5],
    [100, 11],
    [118, 10],
    [134, 10.5],
    [150, 9.5],
    [165, 8.5],
  ],
]

function strand(x: number, length: number, delay: number): Art {
  const d = `M0 0C-3 ${round(length * 0.4)} 4 ${round(length * 0.6)} 0 ${length}`
  return at(
    x,
    70,
    motion(
      'sway',
      [
        svg`<path d=${d} fill="none" stroke=${FLUFF_DARK} stroke-width="3" stroke-linecap="round" />`,
        tuft(0, length + 2, 4.6),
      ],
      delay,
    ),
  )
}

function fluffOnVent(level: number): Art {
  if (level === 0) return []
  const clumps = TUFTS[level] ?? []
  return part('fluff', [
    when(level === 3, () => strand(92, 20, 1)),
    when(level >= 4, () => [strand(52, 20, 2), strand(166, 14, 3)]),
    fluffMass(
      clumps.map(([x, r]) => [x, 65, r] as const),
      true,
    ),
    when(
      level >= 3,
      () =>
        svg`<path d="M46 0C50-5 58-4 62-1C68-6 80-6 86-1C92-5 104-4 108 0Z" fill=${FLUFF} /><path d="M128 0C131-4 138-5 142-1C147-5 156-4 158 0Z" fill=${FLUFF_LIGHT} />`,
    ),
  ])
}

const SPLOTCHES: ReadonlyArray<readonly [number, number, number, number]> = [
  [34, 60, 7, 1],
  [42, 56, 6, 1],
  [166, 60, 7, 1],
  [158, 57, 5.5, 1],
  [50, 52, 7, 2],
  [60, 56, 6, 2],
  [30, 50, 6, 2],
  [150, 52, 7, 2],
  [140, 56, 5.5, 2],
  [171, 50, 6, 2],
  [70, 50, 6.5, 3],
  [82, 54, 5.5, 3],
  [130, 50, 6.5, 3],
  [120, 54, 5, 3],
  [26, 40, 7, 3],
  [36, 44, 6, 3],
  [174, 40, 7, 3],
  [164, 44, 6, 3],
  [94, 50, 6, 4],
  [108, 51, 6, 4],
  [100, 55, 5, 4],
  [24, 30, 5.5, 4],
  [176, 30, 5.5, 4],
  [60, 72, 4.5, 4],
  [140, 73, 4.5, 4],
]

function toadstool(x: number, y: number, size: number): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-2.6 0L-2 -8H2L2.6 0Z" fill=${STALK} />`,
      svg`<path d="M-8-7C-8-13-4-15 0-15C4-15 8-13 8-7Q0-10-8-7Z" fill=${CAP} />`,
      svg`<circle cx="-3" cy="-11" r="1.4" fill=${TISSUE} /><circle cx="3" cy="-12" r="1.1" fill=${TISSUE} />`,
    ],
    0,
    size,
  )
}

function mouldOnUnit(level: number): Art {
  if (level === 0) return []
  const shown = SPLOTCHES.filter((splotch) => splotch[3] <= level)
  return part('mould', [
    shown.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r + 1.5} fill=${MOULD_DARK} />`),
    shown.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${MOULD} />`),
    shown
      .filter((_, i) => i % 2 === 0)
      .map(
        ([x, y, r], i) =>
          svg`<circle cx=${round(x - r * 0.3)} cy=${y - 1.5} r=${i % 3 ? 1.4 : 1.9} fill=${MOULD_SPOT} />`,
      ),
    when(level >= 4, () => [toadstool(50, 46, 0.9), toadstool(152, 46, 0.72)]),
  ])
}

function louvre(kind: AirconLouvre, tones: Tones): Art {
  if (kind === 'shut') {
    return part('louvre', [
      svg`<rect x="30" y="54" width="140" height="13" rx="6.5" fill=${tones.dark} />`,
      svg`<path d="M38 60.5H162" stroke=${tones.trim} stroke-width="2.4" stroke-linecap="round" />`,
    ])
  }
  if (kind === 'empty') {
    return part('louvre', [
      svg`<rect x="30" y="54" width="140" height="13" rx="6.5" fill=${VENT} />`,
      svg`<path d="M40 60.5H160" stroke=${tones.light} stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 8" />`,
    ])
  }
  return part('louvre', [
    svg`<rect x="30" y="54" width="140" height="13" rx="6.5" fill=${VENT} />`,
    svg`<rect x="35" y="60" width="130" height="5" rx="2.5" fill=${tones.light} />`,
  ])
}

function display(lamp: AirconLamp): Art {
  const colour = { off: C.metalDark, on: C.mint, alarm: C.coral, cool: ICE }[lamp]
  const bars = svg`<rect x="150" y="17" width="5" height="8" rx="1.6" fill=${colour} /><rect x="157" y="17" width="5" height="8" rx="1.6" fill=${colour} /><circle cx="166" cy="18.5" r="1.7" fill=${colour} />`
  return part('display', [
    svg`<rect x="145" y="12" width="27" height="18" rx="5.5" fill=${C.glass} />`,
    lamp === 'alarm' ? motion('flicker', bars) : bars,
  ])
}

function unit(parts: AirconParts, tones: Tones, stink: number): Art {
  const body = mix(C.metal, YELLOWED, stink * 0.55)
  const side = mix(C.metalMid, YELLOWED, stink * 0.5)
  const right = LEFT + W
  return part(
    'unit',
    at(0, unitTop(parts), [
      svg`<rect x=${LEFT} y="0" width=${W} height=${H} rx=${R} fill=${body} />`,
      svg`<path d=${`M${right - 16} 0a${R} ${R} 0 0 1 16 ${R}V46H${right - 10}V16a12 12 0 0 0-6-16Z`} fill=${side} />`,
      svg`<path d="M30 15H54M30 23H54M30 31H46" stroke=${side} stroke-width="3.4" stroke-linecap="round" />`,
      svg`<path d=${`M${LEFT} 44H${right}V${H - R}a${R} ${R} 0 0 1-${R} ${R}H${LEFT + R}a${R} ${R} 0 0 1-${R}-${R}Z`} fill=${tones.trim} />`,
      svg`<path d=${`M${LEFT} 44H${right}V49H${LEFT}Z`} fill=${tones.light} />`,
      louvre(parts.louvre, tones),
      display(parts.lamp),
      face(CENTER, 23, parts.mood, C.fly, 1.05),
      mouldOnUnit(parts.mould),
      fluffOnVent(parts.fluff),
    ]),
  )
}

function sideTable(tissue: boolean, tones: Tones): Art {
  return part('table', [
    shadow(156, 184, 24, 0.24),
    svg`<rect x="153" y="150" width="6" height="30" fill=${C.wickerDark} />`,
    svg`<rect x="142" y="179" width="28" height="5" rx="2.5" fill=${C.wickerDark} />`,
    svg`<rect x="132" y="145" width="48" height="7" rx="3.5" fill=${C.wicker} />`,
    tissue ? tissueBox() : remote(tones),
  ])
}

function remote(tones: Tones): Art {
  return part(
    'remote',
    at(
      156,
      145,
      [
        svg`<rect x="-7" y="-21" width="14" height="21" rx="4" fill=${C.metal} />`,
        svg`<rect x="-4" y="-18" width="8" height="5" rx="1.5" fill=${C.glass} />`,
        svg`<circle cx="0" cy="-8" r="2.6" fill=${tones.trim} />`,
      ],
      7,
    ),
  )
}

function tissueBox(): Art {
  return [
    svg`<rect x="139" y="127" width="34" height="18" rx="3.5" fill=${C.lilac} />`,
    svg`<rect x="139" y="127" width="34" height="5" fill=${C.lilacDark} />`,
    svg`<path d="M149 128C148 119 155 117 156 111C159 116 165 120 164 128Z" fill=${TISSUE} />`,
  ]
}

function grimeOn(w: number, h: number, level: number): Art {
  if (level === 0) return []
  const spots: ReadonlyArray<readonly [number, number, number]> = [
    [-0.26, 0.28, 7],
    [-0.08, 0.55, 8],
    [-0.28, 0.76, 7],
    [0.02, 0.84, 6],
    [0.2, 0.24, 7.5],
    [0.27, 0.62, 7],
  ]
  return part(
    'grime',
    fluffMass(
      spots.slice(0, level * 2).map(([x, y, r]) => [round(x * w), round(y * h), r] as const),
      false,
    ),
  )
}

function filterPanel(
  w: number,
  h: number,
  tones: Tones,
  grime: number,
  mouldLevel: number,
  stain: number,
): Art {
  const half = w / 2
  const mesh = mix(MESH, FLUFF, stain)
  const line = mix(MESH_LINE, FLUFF_DARK, stain)
  const rows = Array.from({ length: Math.floor((h - 12) / 8) }, (_, i) => 10 + i * 8)
  const cols = Array.from({ length: Math.floor((w - 12) / 8) }, (_, i) => -half + 10 + i * 8)
  const dots: ReadonlyArray<readonly [number, number, number]> = [
    [-0.28, 0.3, 5],
    [0.24, 0.22, 4.2],
    [0.08, 0.62, 5.6],
    [-0.2, 0.74, 3.8],
    [0.3, 0.8, 4.4],
  ]
  return part('filter', [
    svg`<rect x=${-half} y="0" width=${w} height=${h} rx="7" fill=${tones.dark} />`,
    svg`<rect x=${-half + 5} y="5" width=${w - 10} height=${h - 10} rx="3" fill=${mesh} />`,
    rows.map(
      (y) => svg`<path d=${`M${-half + 5} ${y}H${half - 5}`} stroke=${line} stroke-width="1.5" />`,
    ),
    cols.map((x) => svg`<path d=${`M${x} 5V${h - 5}`} stroke=${line} stroke-width="1.5" />`),
    svg`<rect x="-2" y="2" width="4" height=${h - 4} fill=${tones.dark} />`,
    grimeOn(w, h, grime),
    dots
      .slice(0, mouldLevel === 0 ? 0 : mouldLevel === 1 ? 2 : 5)
      .map(
        ([x, y, r]) =>
          svg`<circle cx=${round(x * w)} cy=${round(y * h)} r=${r + 1.2} fill=${MOULD_DARK} /><circle cx=${round(x * w)} cy=${round(y * h)} r=${r} fill=${MOULD} /><circle cx=${round(x * w - 1.4)} cy=${round(y * h - 1.2)} r="1.3" fill=${MOULD_SPOT} />`,
      ),
    svg`<rect x="-11" y=${h - 2} width="22" height="7" rx="3.5" fill=${tones.trim} />`,
  ])
}

function peekingFilter(parts: AirconParts, tones: Tones, top: number): Art {
  if (parts.peek === 0) return []
  const h = 58
  const y = top + H + parts.peek - h
  const panel = filterPanel(70, h, tones, 3, 0, 0.5)
  return at(CENTER, y, parts.peek > 20 ? motion('sway', panel) : panel)
}

const FRESH = [
  [58, 0, 1],
  [100, 6, 2],
  [142, 0, 3],
] as const

function breeze(count: number, top: number): Art {
  const y = top + H + 3
  return part(
    'breeze',
    FRESH.slice(0, count).map(([x, dy, d]) =>
      at(
        count === 1 ? CENTER : x,
        y + dy,
        motion(
          'waft',
          svg`<path d="M0 0C-9 11 9 21 0 34" fill="none" stroke=${ICE} stroke-width="6" stroke-linecap="round" opacity=".8" />`,
          d,
        ),
      ),
    ),
  )
}

function wiltedAir(level: number, top: number, wide: boolean, tissue: boolean): Art {
  const y = top + H + 2
  const colour = mix(ICE, C.musty, level === 1 ? 0.45 : 0.85)
  const spots = wide ? [46, 142].slice(0, tissue ? 1 : level) : [146, 112, 74].slice(0, level + 1)
  return part(
    'wilted-air',
    spots.map((x, i) =>
      at(
        x,
        y,
        motion(
          'sway',
          [
            svg`<path d="M0 0C0 13 3 20 11 22C19 24 22 31 19 40" fill="none" stroke=${colour} stroke-width="6" stroke-linecap="round" />`,
            drop(19, 49, colour, 0.62),
          ],
          i + 1,
        ),
      ),
    ),
  )
}

function pottedPlant(parts: AirconParts, x: number, y: number): Art {
  const decay = parts.droop / 2
  const leaf = mix(C.leaf, BROWN_LEAF, decay * 0.85)
  const vein = mix(C.leafDark, '#7a5d2c', decay * 0.85)
  const spread = parts.droop * 19
  const fan = [
    [-58, 0.74],
    [58, 0.74],
    [-27, 0.92],
    [27, 0.92],
    [0, 1],
  ] as const
  const leaves = fan.map(([angle, size]) =>
    at(
      0,
      -34,
      [
        svg`<path d="M0 0C-11-5-12-21 0-32C12-21 11-5 0 0Z" fill=${leaf} />`,
        svg`<path d="M0-4V-24" stroke=${vein} stroke-width="2.2" stroke-linecap="round" />`,
      ],
      angle + Math.sign(angle) * spread + (angle === 0 ? parts.droop * 16 : 0),
      size,
    ),
  )
  const inkLine = (d: string): Art =>
    svg`<path d=${d} fill="none" stroke=${POT_INK} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`
  const happyEyes = svg`<circle cx="-6.5" cy="-19" r="2" fill=${POT_INK} /><circle cx="6.5" cy="-19" r="2" fill=${POT_INK} />`
  let mug: Art = [happyEyes, inkLine('M-3-14q3 2.6 6 0')]
  if (parts.asleep) mug = [inkLine('M-9-19h5M4-19h5'), inkLine('M-2-14h4')]
  if (parts.droop >= 1) mug = [happyEyes, inkLine('M-3-13q3-3 6 0')]
  if (parts.sneeze) {
    mug = [
      inkLine('M-10-22l4 3-4 3M10-22l-4 3 4 3'),
      svg`<ellipse cx="0" cy="-12" rx="3.6" ry="4" fill=${POT_INK} />`,
    ]
  }
  const body = [
    leaves,
    svg`<path d="M-18-30H18L14-3Q13 0 10 0H-10Q-13 0-14-3Z" fill=${C.terracotta} />`,
    svg`<rect x="-21" y="-36" width="42" height="9" rx="4" fill=${C.terracottaDark} />`,
    mug,
  ]
  return part('plant', [
    shadow(x, y, 24, 0.24),
    at(x, y, parts.sneeze ? motion('rumble', body) : body),
    when(parts.sneeze, () => sneezeBurst(x, y)),
  ])
}

function sneezeBurst(x: number, y: number): Art {
  const lines = [
    [27, -30, 12, -7],
    [30, -17, 14, 0],
    [27, -4, 12, 7],
  ] as const
  const spray = [
    [52, -38, 0.6, 1],
    [58, -17, 0.78, 2],
    [52, 3, 0.56, 3],
  ] as const
  return part('sneeze', [
    lines.map(
      ([dx, dy, lx, ly]) =>
        svg`<path d=${`M${x + dx} ${y + dy}l${lx} ${ly}`} stroke=${C.cream} stroke-width="3.4" stroke-linecap="round" />`,
    ),
    spray.map(([dx, dy, s, d]) =>
      at(x + dx, y + dy, motion('flicker', drop(0, 0, C.mint, s), d), 90),
    ),
    at(
      x + 72,
      y - 22,
      motion('wobble', svg`<path d="M0 0C-7-3-8-13 0-20C8-13 7-3 0 0Z" fill=${BROWN_LEAF} />`),
      55,
      0.85,
    ),
  ])
}

function ball(x: number, y: number, s: number): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-7 2C-9-4-4-8 0-7C5-9 9-4 7 1C8 6 3 8-1 7C-5 8-8 6-7 2Z" fill=${TISSUE} />`,
      svg`<path d="M-3-2l3 3 3-3M-1 3l3-1" fill="none" stroke=${C.creamDark} stroke-width="1.5" stroke-linecap="round" />`,
    ],
    0,
    s,
  )
}

function crumpled(): Art {
  return part('crumpled', [ball(118, 180, 0.9), ball(102, 184, 0.68)])
}

function spores(count: number, top: number): Art {
  const spots = [
    [120, top + H + 34, 3.4, 1],
    [78, top + H + 22, 2.6, 2],
    [146, top + H + 18, 3, 3],
    [108, top + H + 8, 2.4, 4],
    [60, top + H + 44, 2.8, 5],
    [134, top + H + 52, 2.4, 2],
  ] as const
  return part(
    'spores',
    spots
      .slice(0, count)
      .map(([x, y, r, d]) =>
        at(x, y, motion('drift', svg`<circle r=${r} fill=${C.stench} opacity=".85" />`, d)),
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

function snowflake(x: number, y: number, size: number, delay: number): Art {
  const arm = svg`<path d="M0 0V-14M0-8l-4-4M0-8l4-4" fill="none" stroke=${TISSUE} stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />`
  return part(
    'snowflake',
    at(
      x,
      y,
      motion(
        'spin',
        [0, 60, 120, 180, 240, 300].map((angle) => at(0, 0, arm, angle)),
        delay,
      ),
      0,
      size,
    ),
  )
}

function curl(x: number, y: number, d: string, colour: string, delay: number): Art {
  return part(
    'swirl',
    at(
      x,
      y,
      motion(
        'drift',
        svg`<path d=${d} fill="none" stroke=${colour} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
    ),
  )
}

function frost(top: number): Art {
  const y = top + H
  return [
    curl(112, y + 17, 'M-36 0H16a10 10 0 1 0-10-10', ICE, 1),
    curl(106, y + 38, 'M-38 0H22a8.5 8.5 0 1 1-8.5 8.5', ICE_DEEP, 3),
    snowflake(84, y + 62, 0.8, 2),
    snowflake(172, y + 14, 1.05, 1),
    snowflake(22, y + 12, 0.8, 3),
    sparkle(120, y + 70, 0.7, 4),
    sparkle(64, y + 13, 0.6, 1),
    sparkle(21, top - 7, 0.75, 2),
    sparkle(172, top - 6, 0.9, 1),
  ]
}

function wallView(parts: AirconParts, tones: Tones, stink: number): Art {
  const top = unitTop(parts)
  const wide = parts.peek > 20
  return [
    peekingFilter(parts, tones, top),
    sideTable(parts.tissues, tones),
    when(parts.tissues, crumpled),
    when(parts.wilt === 0 && !parts.frost, () => breeze(parts.breeze, top)),
    when(parts.wilt > 0, () => wiltedAir(parts.wilt, top, wide, parts.tissues)),
    pottedPlant(parts, 40, 183),
    unit(parts, tones, stink),
    when(parts.frost, () => frost(top)),
    when(parts.asleep, () => [zed(148, 22, 0.46, 1), zed(163, 17, 0.66, 2), zed(179, 13, 0.42, 3)]),
    when(parts.lamp === 'alarm' && parts.mood !== 'sick', () =>
      at(176, top + H + 9, motion('drip', drop(0, 0, ICE_DEEP, 0.8), 2)),
    ),
    when(parts.fluff >= 2, () => motes(parts.fluff, top)),
    spores(parts.spores, top),
    neglect(
      parts,
      [[184, 142], wide ? [16, 158] : [116, 176]],
      [
        [178, 114],
        [74, 124],
      ],
    ),
  ]
}

function motes(level: number, top: number): Art {
  const spots = [
    [120, top + H + 30, 2.6, 1],
    [76, top + H + 36, 2.2, 2],
    [146, top + H + 44, 3, 3],
    [100, top + H + 52, 2.2, 4],
  ] as const
  return part(
    'motes',
    spots
      .slice(0, level)
      .map(([x, y, r, d]) =>
        at(x, y, motion('drift', svg`<circle r=${r} fill=${FLUFF_LIGHT} />`, d)),
      ),
  )
}

function neglect(
  parts: AirconParts,
  lines: ReadonlyArray<readonly [number, number]>,
  spots: ReadonlyArray<readonly [number, number]>,
): Art {
  return [
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function showerHead(): Art {
  return part('shower', [
    svg`<path d="M182 184C190 160 188 132 174 118" fill="none" stroke=${C.metalDark} stroke-width="5" stroke-linecap="round" />`,
    at(
      168,
      112,
      [
        svg`<rect x="-7" y="-6" width="30" height="12" rx="6" fill=${C.metalMid} />`,
        svg`<path d="M-8-17Q-14-17-14-11V11Q-14 17-8 17H-3V-17Z" fill=${C.metal} />`,
        svg`<path d="M-14-9V9" stroke=${C.metalDark} stroke-width="3" stroke-linecap="round" stroke-dasharray="1 5" />`,
      ],
      -24,
    ),
  ])
}

function jets(): Art {
  const lines = [
    [150, 106, 112, 110, 1],
    [152, 116, 114, 126, 2],
    [156, 126, 122, 140, 3],
  ] as const
  return part(
    'spray',
    lines.map(([x1, y1, x2, y2, d]) =>
      motion(
        'flicker',
        svg`<path d=${`M${x1} ${y1}L${x2} ${y2}`} stroke=${ICE} stroke-width="5" stroke-linecap="round" stroke-dasharray="12 7" />`,
        d,
      ),
    ),
  )
}

function tub(): Art {
  return part('tub', [
    shadow(112, 184, 54),
    svg`<path d="M66 148H158L151 178Q150 184 143 184H81Q74 184 73 178Z" fill=${C.metalMid} />`,
    svg`<path d="M70 158H154L151 178Q150 184 143 184H81Q74 184 73 178Z" fill=${C.metalDark} opacity=".35" />`,
    svg`<rect x="60" y="142" width="104" height="11" rx="5.5" fill=${C.metal} />`,
  ])
}

function rinseView(parts: AirconParts, tones: Tones, stink: number): Art {
  const flying = [
    [62, 118, 7, 1],
    [50, 138, 5, 3],
    [70, 104, 4.4, 2],
  ] as const
  return [
    pottedPlant(parts, 34, 183),
    unit(parts, tones, stink),
    at(106, 92, motion('rumble', filterPanel(76, 62, tones, parts.grime, parts.filterMould, 0.1))),
    tub(),
    part(
      'flying-fluff',
      flying
        .slice(0, parts.grime + 1)
        .map(([x, y, r, d]) => at(x, y, motion('drift', tuft(0, 0, r), d))),
    ),
    jets(),
    showerHead(),
    bubble(70, 132, 5, 1),
    bubble(150, 136, 6.5, 2),
    bubble(60, 104, 3.6, 3),
    (
      [
        [86, 150, 1],
        [136, 150, 3],
      ] as const
    ).map(([x, y, d]) => at(x, y, motion('fall', drop(0, 0, C.water, 0.7), d))),
  ]
}

function dryingRack(): Art {
  return part('rack', [
    svg`<path d="M86 184L100 112M152 184L138 112M100 184L86 112M138 184L152 112" stroke=${C.metalDark} stroke-width="4" stroke-linecap="round" />`,
    svg`<rect x="76" y="108" width="86" height="6" rx="3" fill=${C.metalMid} />`,
    svg`<rect x="84" y="160" width="70" height="4" rx="2" fill=${C.metalMid} />`,
  ])
}

function rackView(parts: AirconParts, tones: Tones, stink: number): Art {
  const top = unitTop(parts)
  return [
    pottedPlant(parts, 34, 183),
    unit(parts, tones, stink),
    shadow(119, 184, 46),
    svg`<ellipse cx="119" cy="181" rx="26" ry="4" fill=${C.water} opacity=".55" />`,
    dryingRack(),
    at(119, 112, filterPanel(56, 42, tones, 0, parts.filterMould, 0)),
    svg`<rect x="104" y="106" width="5" height="12" rx="2" fill=${C.coral} /><rect x="129" y="106" width="5" height="12" rx="2" fill=${C.coral} />`,
    part(
      'drips',
      (
        [
          [104, 164, 1],
          [121, 168, 3],
          [136, 165, 2],
        ] as const
      ).map(([x, y, d]) => at(x, y, motion('drip', drop(0, 0, C.water, 0.72), d))),
    ),
    part(
      'homeward',
      svg`<path d="M72 128C60 116 62 104 76 97" fill="none" stroke=${ICE} stroke-width="3.6" stroke-linecap="round" stroke-dasharray="1 8" /><path d="M72 92L80 96L73 102" fill="none" stroke=${ICE} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
    spores(parts.spores, top + 24),
    neglect(
      parts,
      [
        [176, 176],
        [66, 160],
      ],
      [
        [172, 118],
        [70, 118],
      ],
    ),
  ]
}

export function aircon(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = airconParts(scene)
  const stink = scene.state === 'clean' ? 0 : clamp01(scene.stink)
  const tones = tonesOf(scene)
  const views: Record<AirconView, (p: AirconParts, t: Tones, s: number) => Art> = {
    wall: wallView,
    rinse: rinseView,
    rack: rackView,
  }
  return frame('aircon', scene, options, views[parts.view](parts, tones, stink))
}
