import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  at,
  clamp01,
  COLORS as C,
  face,
  fly,
  frame,
  INK,
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

export type VacuumView = 'sleep' | 'hunt' | 'suck' | 'full' | 'shine'

export interface VacuumParts {
  view: VacuumView
  bunnies: number
  grime: number
  crumbs: number
  web: boolean
  spider: boolean
  stench: number
  flies: number
  rug: 'dull' | 'stripe' | 'bright'
  burst: number
  raised: boolean
  mood: Mood
}

export const MAX_BUNNIES = 9

const GRIME_AT = [0.2, 0.5, 0.8] as const
const CRUMBS_AT = [0.1, 0.3, 0.55] as const
const STENCH_AT = [0.6, 0.85] as const
const FLIES_AT = [0.7, 0.92] as const
const BURST_AT = [0.25, 0.6] as const
const FULL_FLIES_AT = [0.6, 0.9] as const

export function vacuumParts(scene: SceneView): VacuumParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const grime = reached(stink, GRIME_AT)
  const base = {
    bunnies: 0,
    grime,
    crumbs: 0,
    web: false,
    spider: false,
    stench: 0,
    flies: 0,
    burst: 0,
    raised: false,
  }
  if (state === 'clean') {
    return { ...base, view: 'shine', grime: 0, rug: 'bright', mood: 'happy' }
  }
  if (state === 'running') {
    return {
      ...base,
      view: 'suck',
      bunnies: 2,
      stench: reached(stink, STENCH_AT),
      rug: 'stripe',
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...base,
      view: 'full',
      grime: 0,
      burst: reached(stink, BURST_AT),
      stench: reached(stink, STENCH_AT),
      flies: reached(stink, FULL_FLIES_AT),
      rug: 'bright',
      mood: stink >= 0.6 ? 'sick' : 'worried',
    }
  }
  const decay = {
    crumbs: reached(stink, CRUMBS_AT),
    web: stink >= 0.4,
    spider: stink >= 0.65,
    stench: reached(stink, STENCH_AT),
    flies: reached(stink, FLIES_AT),
  }
  if (state === 'due') {
    return {
      ...base,
      ...decay,
      view: 'hunt',
      bunnies: MAX_BUNNIES,
      raised: true,
      rug: 'dull',
      mood: stink >= 0.5 ? 'sick' : 'pleading',
    }
  }
  if (state === 'accumulating') {
    const count = Math.min(MAX_BUNNIES - 2, 1 + Math.floor(fill * (MAX_BUNNIES - 2)))
    return {
      ...base,
      ...decay,
      view: 'hunt',
      bunnies: count,
      rug: 'dull',
      mood: stink >= 0.5 ? 'sick' : count >= 5 ? 'worried' : 'calm',
    }
  }
  return { ...base, ...decay, view: 'sleep', rug: 'dull', mood: 'sleepy' }
}

const RUG = { top: 144, bottom: 186, topL: 32, topR: 168, bottomL: 15, bottomR: 185 } as const

function rugPoint(s: number, t: number): string {
  const y = RUG.top + (RUG.bottom - RUG.top) * t
  const left = RUG.topL + (RUG.bottomL - RUG.topL) * t
  const right = RUG.topR + (RUG.bottomR - RUG.topR) * t
  return `${round(left + (right - left) * s)} ${round(y)}`
}

function quad(s0: number, s1: number, t0: number, t1: number): string {
  return `M${rugPoint(s0, t0)}L${rugPoint(s1, t0)}L${rugPoint(s1, t1)}L${rugPoint(s0, t1)}Z`
}

function diamond(s: number, t: number, ds: number, dt: number): string {
  return `M${rugPoint(s - ds, t)}L${rugPoint(s, t - dt)}L${rugPoint(s + ds, t)}L${rugPoint(s, t + dt)}Z`
}

function fringe(color: string): Art {
  const lines = [0.08, 0.26, 0.44, 0.62, 0.8, 0.96].map((t) => {
    const y = RUG.top + (RUG.bottom - RUG.top) * t
    const inset = (RUG.topL - RUG.bottomL) * t
    return `M${round(RUG.topL - inset)} ${round(y)}h-6M${round(RUG.topR + inset)} ${round(y)}h6`
  })
  return svg`<path d=${lines.join('')} stroke=${color} stroke-width="2.4" stroke-linecap="round" />`
}

function rug(parts: VacuumParts): Art {
  const bright = parts.rug === 'bright'
  const stain = parts.grime / 3
  const field = bright ? C.lilac : mix('#6a5ca3', '#55553f', stain)
  const edge = bright ? C.cream : mix('#8e8aa8', '#6b6c52', stain)
  const accent = bright ? C.sun : mix('#57508a', '#47472f', stain)
  const line = mix(C.lilac, '#fff', 0.45)
  const fresh = [0.3, 0.44, 0.58, 0.72].map((s) => 0.5 + (s - 0.5) * 1.9)
  return part('rug', [
    fringe(edge),
    svg`<path d=${quad(0, 1, 0, 1)} fill=${edge} stroke=${edge} stroke-width="4" stroke-linejoin="round" />`,
    svg`<path d=${quad(0.035, 0.965, 0.1, 0.9)} fill=${accent} />`,
    svg`<path d=${quad(0.05, 0.95, 0.15, 0.85)} fill=${field} />`,
    when(bright, () => [
      part(
        'vacuum-lines',
        [
          [0.15, 0.26],
          [0.37, 0.49],
          [0.61, 0.73],
        ].map(([from = 0, to = 0]) => svg`<path d=${quad(0.05, 0.95, from, to)} fill=${line} />`),
      ),
      fresh.map(
        (s, i) => svg`<path d=${diamond(s, 0.95, 0.018, 0.03)} fill=${i % 2 ? C.pink : C.sky} />`,
      ),
    ]),
    when(parts.rug === 'stripe', () =>
      part('clean-stripe', [
        svg`<path d=${quad(0.3, 0.95, 0.56, 0.85)} fill=${C.lilac} />`,
        svg`<path d=${quad(0.3, 0.95, 0.62, 0.68)} fill=${line} />`,
        svg`<path d=${quad(0.3, 0.95, 0.74, 0.8)} fill=${line} />`,
      ]),
    ),
  ])
}

function tube(d: string): Art {
  const tone = C.metalDark
  const rib = mix(C.metalDark, C.glass, 0.42)
  return [
    svg`<path d=${d} fill="none" stroke=${tone} stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d=${d} fill="none" stroke=${rib} stroke-width="11" stroke-dasharray="2.4 6" />`,
  ]
}

function nozzle(x: number, y: number, rotate = 0): Art {
  return part(
    'nozzle',
    at(
      x,
      y,
      [
        svg`<path d="M-24 6H24V9Q24 11 21 11H-21Q-24 11-24 9Z" fill=${C.glass} />`,
        svg`<rect x="-25" y="-7" width="50" height="14" rx="7" fill=${C.sun} />`,
        svg`<path d="M-17-2H10" stroke=${C.spark} stroke-width="3" stroke-linecap="round" />`,
      ],
      rotate,
    ),
  )
}

function wand(from: readonly [number, number], to: readonly [number, number]): Art {
  return svg`<path d=${`M${from[0]} ${from[1]}L${to[0]} ${to[1]}`} stroke=${C.metalMid} stroke-width="8" stroke-linecap="round" />`
}

interface BodyOptions {
  mood: Mood
  lookLeft?: boolean
  cap?: boolean
  dust?: number
  blush?: boolean
}

function body(options: BodyOptions): Art {
  const dust = (options.dust ?? 0) / 3
  const shell = mix(C.coral, '#a58a78', dust * 0.8)
  const dark = mix(C.coralDark, '#7d6a5c', dust * 0.8)
  const light = mix('#ffa79b', '#c0a999', dust * 0.8)
  const faceX = options.lookLeft === true ? -9 : 0
  return part('vacuum', [
    svg`<circle cx="-36" cy="-9" r="11" fill=${C.glass} /><circle cx="36" cy="-9" r="11" fill=${C.glass} />`,
    svg`<circle cx="-36" cy="-9" r="4.5" fill=${C.metalMid} /><circle cx="36" cy="-9" r="4.5" fill=${C.metalMid} />`,
    svg`<path d="M-54-20V-52C-54-84-30-98 0-98C30-98 54-84 54-52V-20Q54-8 42-8H-42Q-54-8-54-20Z" fill=${shell} />`,
    svg`<path d="M-54-30H54V-20Q54-8 42-8H-42Q-54-8-54-20Z" fill=${dark} />`,
    svg`<path d="M-44-54C-44-68-37-78-26-84" fill="none" stroke=${light} stroke-width="5.5" stroke-linecap="round" />`,
    when(options.cap !== false, () => cap()),
    svg`<circle cx="-30" cy="-19" r="4" fill=${C.mint} /><rect x="-18" y="-22" width="48" height="6" rx="3" fill=${mix(dark, INK, 0.3)} />`,
    when(
      options.blush === true,
      () =>
        svg`<ellipse cx="-30" cy="-44" rx="7" ry="4.5" fill=${C.pink} opacity=".75" /><ellipse cx="30" cy="-44" rx="7" ry="4.5" fill=${C.pink} opacity=".75" />`,
    ),
    face(faceX, -53, options.mood, '#5b1e18', 1.2),
  ])
}

function cap(): Art {
  return part('cap', [
    svg`<path d="M-42-78C-34-92-18-100 0-100C18-100 34-92 42-78Q43-74 38-74H-38Q-43-74-42-78Z" fill=${C.cream} />`,
    svg`<path d="M-42-78Q-43-74-38-74H38Q43-74 42-78L40.5-81H-40.5Z" fill=${C.creamDark} />`,
    svg`<rect x="-11" y="-108" width="22" height="11" rx="5.5" fill=${C.sun} />`,
  ])
}

function port(x: number, y: number): Art {
  return svg`<circle cx=${x} cy=${y} r="9.5" fill=${C.metalDark} /><circle cx=${x} cy=${y} r="5" fill=${C.glass} />`
}

const BUNNY_SPOTS = [
  [72, 184, 1.05],
  [116, 186, 0.9],
  [32, 184, 0.92],
  [52, 168, 0.74],
  [152, 186, 1],
  [170, 180, 0.8],
  [28, 166, 0.68],
  [94, 186, 0.72],
  [124, 62, 0.62],
] as const

const TUFTS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i * Math.PI) / 5
  return [round(Math.cos(angle) * 10.5), round(Math.sin(angle) * 10.5 - 12)] as const
})

function bunny(x: number, y: number, size: number, grime: number, index: number): Art {
  const t = grime / 3
  const fur = mix('#d8dcea', '#7c7b86', t)
  const shade = mix('#b3b9cf', '#5f5e69', t)
  const brow = grime >= 2
  return part(
    'bunny',
    at(
      x,
      y,
      motion(
        index % 2 ? 'wobble' : 'bob',
        [
          svg`<ellipse cx="-5.5" cy="-27" rx="3.6" ry="8.5" transform="rotate(-14 -5.5 -27)" fill=${fur} />`,
          svg`<ellipse cx="5.5" cy="-27" rx="3.6" ry="8.5" transform="rotate(14 5.5 -27)" fill=${fur} />`,
          svg`<ellipse cx="-5.8" cy="-26" rx="1.5" ry="5" transform="rotate(-14 -5.8 -26)" fill=${C.pink} opacity=".7" />`,
          svg`<ellipse cx="5.8" cy="-26" rx="1.5" ry="5" transform="rotate(14 5.8 -26)" fill=${C.pink} opacity=".7" />`,
          TUFTS.map(([tx, ty]) => svg`<circle cx=${tx} cy=${ty} r="4" fill=${fur} />`),
          svg`<circle cy="-12" r="11" fill=${fur} />`,
          svg`<path d="M-7-5q7 4 14 0" fill="none" stroke=${shade} stroke-width="2" stroke-linecap="round" />`,
          svg`<circle cx="-4.2" cy="-13" r="2.5" fill=${INK} /><circle cx="4.2" cy="-13" r="2.5" fill=${INK} />`,
          svg`<circle cx="-3.5" cy="-13.9" r=".8" fill="#fff" /><circle cx="4.9" cy="-13.9" r=".8" fill="#fff" />`,
          when(
            brow,
            () =>
              svg`<path d="M-8-18l6 2.4M8-18l-6 2.4" stroke=${INK} stroke-width="1.8" stroke-linecap="round" />`,
          ),
        ],
        (index % 5) + 1,
      ),
      0,
      round(size * (1 + grime * 0.2)),
    ),
    index,
  )
}

function bunnies(count: number, grime: number): Art {
  return BUNNY_SPOTS.slice(0, count)
    .map(([x, y, size], i) => ({ x, y, size, i }))
    .toSorted((a, b) => a.y - b.y)
    .map(({ x, y, size, i }) => bunny(x, y, size, grime, i))
}

function crumbs(count: number): Art {
  const spots = [
    [
      [60, 178, 2.6],
      [112, 176, 2],
      [84, 176, 1.8],
    ],
    [
      [150, 174, 2.8],
      [30, 170, 2],
      [168, 184, 2.2],
    ],
    [
      [128, 178, 3.2],
      [52, 186, 2.6],
      [20, 184, 2.2],
    ],
  ] as const
  return part(
    'crumbs',
    spots
      .slice(0, count)
      .flat()
      .map(
        ([x, y, r]) =>
          svg`<circle cx=${x} cy=${y} r=${r} fill=${C.wicker} /><circle cx=${x - r * 0.3} cy=${y - r * 0.3} r=${r * 0.35} fill=${C.wickerDark} />`,
      ),
  )
}

function cobweb(): Art {
  const d =
    'M188 16L128 16M188 16L138 40M188 16L160 58M188 16L188 76M144 16Q148 28 150 32Q159 37 165 45Q176 48 188 60M162 16Q164 22 166 24Q171 27 175 32Q181 34 188 42'
  return part(
    'cobweb',
    svg`<path d=${d} fill="none" stroke="#e7ecf7" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" opacity=".62" />`,
  )
}

function spider(): Art {
  const legs =
    'M-7-3Q-15-11-19-3M-7 0Q-16-3-21 5M-7 3Q-14 5-17 13M7-3Q15-11 19-3M7 0Q16-3 21 5M7 3Q14 5 17 13'
  return part('spider', [
    svg`<path d="M172 44V62" stroke="#e7ecf7" stroke-width="1.5" opacity=".7" />`,
    at(
      172,
      70,
      motion(
        'bob',
        [
          svg`<path d=${legs} fill="none" stroke=${C.wing} stroke-width="2.2" stroke-linecap="round" />`,
          svg`<circle r="9.5" fill=${C.fly} stroke=${C.wing} stroke-width="1.5" />`,
          svg`<circle cx="-3.4" cy="-1" r="2.9" fill="#fff" /><circle cx="3.4" cy="-1" r="2.9" fill="#fff" />`,
          svg`<circle cx="-3.8" cy="-.2" r="1.4" fill=${INK} /><circle cx="3" cy="-.2" r="1.4" fill=${INK} />`,
        ],
        2,
      ),
    ),
  ])
}

function neglect(parts: VacuumParts): Art {
  return [
    when(parts.web, cobweb),
    when(parts.spider, spider),
    stenchLines(
      (
        [
          [18, 134],
          [46, 118],
        ] as const
      ).slice(0, parts.stench),
    ),
    (
      [
        [18, 66],
        [94, 26],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([x, y], i) => fly(x, y, i)),
  ]
}

function snore(x: number, y: number, s: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'drift',
      svg`<path d="M-6-6H6L-6 6H6" fill="none" stroke=${C.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
      delay,
    ),
    0,
    s,
  )
}

function zzz(): Art {
  return part('zzz', [snore(50, 58, 0.8, 1), snore(34, 40, 1.05, 2)])
}

function cordCoil(x: number, y: number): Art {
  const loops = [0, 1, 2, 3].map(
    (i) =>
      svg`<ellipse cy=${-5 - i * 6.5} rx=${22 - i * 0.6} ry="7.5" fill="none" stroke=${i % 2 ? C.metalMid : C.metal} stroke-width="5.5" />`,
  )
  return part(
    'cord',
    at(x, y, [
      svg`<ellipse cy="-2" rx="25" ry="9" fill="#0c0f1e" opacity=".25" />`,
      loops,
      svg`<rect x="-5" y="-33" width="10" height="33" rx="3" fill=${C.sun} />`,
      svg`<path d="M-12-30q-7-5-5-13" fill="none" stroke=${C.metal} stroke-width="4.5" stroke-linecap="round" />`,
      at(
        -16,
        -49,
        [
          svg`<path d="M-3.5-7v-7M3.5-7v-7" stroke=${C.metal} stroke-width="3" stroke-linecap="round" />`,
          svg`<rect x="-8" y="-8" width="16" height="14" rx="4" fill=${C.sky} />`,
        ],
        -10,
      ),
    ]),
  )
}

function sleep(parts: VacuumParts): Art {
  const ox = 118
  return [
    rug(parts),
    shadow(ox, 169, 60),
    cordCoil(40, 174),
    at(ox, 168, body({ mood: parts.mood, dust: parts.grime })),
    part('hose', [tube('M66 108C54 38 182 38 170 108'), port(66, 108)]),
    nozzle(174, 122, 90),
    zzz(),
    crumbs(parts.crumbs),
    neglect(parts),
  ]
}

function hunt(parts: VacuumParts): Art {
  const ox = 124
  const hose = parts.raised
    ? part('hose', [
        tube('M74 104C50 96 26 74 32 50C36 34 54 32 62 42'),
        wand([62, 42], [68, 60]),
        nozzle(70, 66, 16),
      ])
    : part('hose', [
        tube('M74 104C52 92 26 92 26 118'),
        wand([26, 118], [30, 146]),
        nozzle(36, 151),
      ])
  return [
    rug(parts),
    shadow(ox, 169, 60),
    at(ox, 168, body({ mood: parts.mood, lookLeft: parts.bunnies >= 3, dust: parts.grime })),
    hose,
    port(74, 104),
    crumbs(parts.crumbs),
    bunnies(parts.bunnies, parts.grime),
    neglect(parts),
  ]
}

function dustStream(): Art {
  const specks = [
    [40, 160, 3.6, 1],
    [34, 182, 2.8, 2],
    [46, 148, 2.8, 3],
    [34, 116, 2.4, 4],
  ] as const
  const streaks = [
    ['M26 170q8-2 16 2', 1],
    ['M28 156q8 3 16 10', 2],
    ['M28 184q8-3 15-7', 3],
  ] as const
  return part('dust-stream', [
    streaks.map(([d, delay]) =>
      motion(
        'flicker',
        svg`<path d=${d} fill="none" stroke="#cdd5ea" stroke-width="3" stroke-linecap="round" />`,
        delay,
      ),
    ),
    specks.map(([x, y, r, delay]) =>
      at(x, y, motion('drift', svg`<circle r=${r} fill="#cdd5ea" />`, delay)),
    ),
  ])
}

function tumbling(grime: number, count: number): Art {
  return (
    [
      [20, 174, 0.78, 40],
      [24, 134, 0.66, 74],
    ] as const
  )
    .slice(0, count)
    .map(([x, y, size, turn], i) =>
      part('tumbling', at(x, y, bunny(0, 0, size, grime, i), turn), i),
    )
}

function suck(parts: VacuumParts): Art {
  const ox = 130
  const shake = [
    [68, 66, 'M0 0q-6 10 0 20', 1],
    [187, 60, 'M0 0q6 10 0 20', 2],
    [187, 100, 'M0 0q6 10 0 20', 1],
  ] as const
  return [
    rug(parts),
    shadow(ox, 169, 60),
    motion('rumble', [
      at(ox, 168, body({ mood: parts.mood, blush: true })),
      part('hose', [
        tube('M80 104C58 92 52 116 60 146'),
        wand([60, 146], [68, 170]),
        nozzle(70, 176),
      ]),
      port(80, 104),
    ]),
    dustStream(),
    tumbling(parts.grime, parts.bunnies),
    sparkle(176, 177, 0.7, 2),
    part(
      'shake',
      shake.map(([x, y, d, delay]) =>
        at(
          x,
          y,
          motion(
            'flicker',
            svg`<path d=${d} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,
            delay,
          ),
        ),
      ),
    ),
    stenchLines(
      (
        [
          [100, 50],
          [150, 48],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

function dustPuff(x: number, y: number, s: number, delay: number): Art {
  return part(
    'puff',
    at(
      x,
      y,
      motion(
        'drift',
        svg`<g fill="#b9bfd2"><circle cx="-7" cy="1" r="6" /><circle cx="1" cy="-4" r="8" /><circle cx="9" cy="2" r="5.5" /></g>`,
        delay,
      ),
      0,
      s,
    ),
  )
}

function bag(burst: number): Art {
  const cloth = mix(C.cream, '#b4ae97', burst / 2)
  const shade = mix(C.creamDark, '#8f8a74', burst / 2)
  const lobes = [
    [-38, -92, 26],
    [38, -92, 26],
    [-15, -106, 27],
    [17, -106, 26],
  ] as const
  return part(
    'bag',
    motion('throb', [
      lobes.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${cloth} />`),
      svg`<path d="M-62-90Q-66-68-48-66H48Q66-68 62-90Z" fill=${cloth} />`,
      svg`<path d="M-30-124Q-40-108-22-96M4-124Q-2-110 10-98M42-114Q30-104 32-90" fill="none" stroke=${shade} stroke-width="3.2" stroke-linecap="round" />`,
      svg`<path d="M-56-84C-60-96-54-104-44-108" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75" />`,
      svg`<path d="M-54-68C-30-62 30-62 54-68" fill="none" stroke=${shade} stroke-width="3.5" stroke-linecap="round" />`,
      at(
        36,
        -84,
        [
          svg`<rect x="-12" y="-10" width="24" height="20" rx="4" fill=${C.sky} />`,
          svg`<path d="M-8-6l3 3M5-6l3 3M-8 3l3 3M5 3l3 3" stroke=${C.cream} stroke-width="2" stroke-linecap="round" />`,
        ],
        9,
      ),
      when(
        burst > 0,
        () =>
          svg`<path d="M-30-86l6 4-6 4 6 4-6 4" fill="none" stroke=${shade} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ]),
  )
}

function emptyBubble(): Art {
  return part('wish', [
    svg`<circle cx="50" cy="82" r="4.5" fill=${C.cream} /><circle cx="42" cy="70" r="7" fill=${C.cream} />`,
    at(
      34,
      42,
      motion('pulse', [
        svg`<circle r="24" fill=${C.cream} />`,
        svg`<path d="M-10-4H10L7.5 13Q7 15 5 15H-5Q-7 15-7.5 13Z" fill=${C.metalDark} />`,
        svg`<rect x="-13" y="-10" width="26" height="5" rx="2.5" fill=${C.skyDark} /><rect x="-4" y="-14" width="8" height="5" rx="2" fill=${C.skyDark} />`,
        svg`<path d="M-3 0V10M3 0V10" stroke=${C.metalMid} stroke-width="2" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

function full(parts: VacuumParts): Art {
  const ox = 120
  const puffs: Array<readonly [number, number, number, number]> = [
    [176, 62, 0.8, 1],
    [168, 92, 0.6, 2],
  ]
  return [
    rug(parts),
    shadow(ox, 169, 60),
    at(ox, 168, [
      body({ mood: parts.mood, cap: false }),
      part('stowaway', bunny(30, -127, 0.66, parts.burst, 3)),
      bag(parts.burst),
      at(-20, -123, at(0, 74, cap()), -13, 0.68),
    ]),
    part('hose', [tube('M70 112C44 112 26 124 28 150'), nozzle(36, 170)]),
    port(70, 112),
    emptyBubble(),
    puffs.slice(0, parts.burst).map(([x, y, s, d]) => dustPuff(x, y, s, d)),
    stenchLines(
      (
        [
          [180, 150],
          [20, 130],
        ] as const
      ).slice(0, parts.stench),
    ),
    (
      [
        [18, 108],
        [80, 26],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([x, y], i) => fly(x, y, i)),
  ]
}

function shine(parts: VacuumParts): Art {
  return [
    rug(parts),
    shadow(124, 165, 57),
    motion('bob', at(124, 164, body({ mood: parts.mood, blush: true }), 0, 0.95)),
    part('hose', [tube('M77 103C56 90 34 96 36 122'), wand([36, 122], [40, 146]), nozzle(44, 152)]),
    port(77, 103),
    sparkle(26, 72, 1.3, 1),
    sparkle(180, 52, 1.05, 2),
    sparkle(72, 40, 0.85, 3),
    sparkle(40, 172, 0.95, 4),
    sparkle(164, 174, 1.15, 5),
  ]
}

export function vacuum(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = vacuumParts(scene)
  const views: Record<VacuumView, () => Art> = {
    sleep: () => sleep(parts),
    hunt: () => hunt(parts),
    suck: () => suck(parts),
    full: () => full(parts),
    shine: () => shine(parts),
  }
  return frame('vacuum', scene, options, views[parts.view]())
}
