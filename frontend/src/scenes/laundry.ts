import { nothing, svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  at,
  blob,
  COLORS as C,
  drop,
  face,
  fly,
  frame,
  motion,
  part,
  reached,
  shadow,
  shirt,
  sock,
  sparkle,
  stenchLines,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type LaundryView = 'basket' | 'washing' | 'wet' | 'drying'

export interface LaundryParts {
  view: LaundryView
  pile: number
  overflow: boolean
  stench: number
  flies: number
  cloud: number
  mood: Mood
}

export const MAX_PILE = 6

const STENCH_AT = [0.05, 0.3, 0.55] as const
const FLIES_AT = [0.45, 0.7, 0.92] as const
const CLOUD_AT = [0.02, 0.4, 0.75] as const
const WET_FLIES_AT = [0.65, 0.9] as const

export function laundryParts(scene: SceneView): LaundryParts {
  const { state, fill, stink } = scene
  if (state === 'clean') {
    return {
      view: 'drying',
      pile: 0,
      overflow: false,
      stench: 0,
      flies: 0,
      cloud: 0,
      mood: 'happy',
    }
  }
  if (state === 'running') {
    return {
      view: 'washing',
      pile: 0,
      overflow: false,
      stench: reached(stink, STENCH_AT),
      flies: 0,
      cloud: 0,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    const clouds = reached(stink, CLOUD_AT)
    return {
      view: 'wet',
      pile: 0,
      overflow: false,
      stench: 0,
      flies: reached(stink, WET_FLIES_AT),
      cloud: clouds,
      mood: clouds >= 2 ? 'sick' : 'pleading',
    }
  }
  const overflow = state === 'due'
  const pile = overflow ? MAX_PILE : Math.min(MAX_PILE - 1, Math.floor(fill * MAX_PILE))
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  let mood: Mood = state === 'resting' ? 'sleepy' : 'calm'
  if (overflow || pile >= 4) mood = 'worried'
  if (stink >= 0.45) mood = 'sick'
  return { view: 'basket', pile, overflow, stench, flies, cloud: 0, mood }
}

export type PilePiece = readonly [number, number, () => Art]

export const PILE: ReadonlyArray<readonly [number, readonly PilePiece[]]> = [
  [1, [[100, 106, () => blob(100, 106, 54, 15, C.sky, C.skyDark, -3)]]],
  [
    2,
    [
      [70, 98, () => blob(70, 98, 26, 19, C.coral, C.coralDark, -12)],
      [135, 92, () => sock(135, 92, C.sun, C.coral, 24)],
    ],
  ],
  [
    3,
    [
      [112, 86, () => blob(112, 86, 36, 21, C.mint, C.mintDark, 8)],
      [74, 80, () => blob(74, 80, 22, 16, C.pink, C.pinkDark, -10)],
    ],
  ],
  [
    4,
    [
      [96, 66, () => shirt(96, 66, C.sun, C.sunDark, -14, 0.98)],
      [138, 70, () => sock(138, 70, C.lilac, C.cream, 34)],
    ],
  ],
  [
    5,
    [
      [122, 52, () => blob(122, 52, 26, 18, C.lilac, C.lilacDark, 14)],
      [74, 48, () => blob(74, 48, 25, 17, C.sky, C.skyDark, -18)],
    ],
  ],
  [
    6,
    [
      [100, 32, () => shirt(100, 32, C.coral, C.coralDark, 10, 0.9)],
      [142, 42, () => blob(142, 42, 16, 13, C.mint, C.mintDark, 20)],
      [58, 40, () => sock(58, 40, C.pink, C.cream, -38, 0.9)],
    ],
  ],
]

export function basketShell(): Art {
  const slats = [132, 148, 164]
  return [
    svg`<path d="M36 114H164L154 174Q153 180 146 180H54Q47 180 46 174Z" fill=${C.wicker} />`,
    slats.map(
      (y) =>
        svg`<rect x=${42 + (y - 132) * 0.14} y=${y} width=${116 - (y - 132) * 0.28} height="5" rx="2.5" fill=${C.wickerDark} opacity=".55" />`,
    ),
    svg`<rect x="29" y="108" width="142" height="17" rx="8.5" fill=${C.wickerLight} />`,
    svg`<rect x="86" y="112.5" width="28" height="8" rx="4" fill=${C.wickerDark} />`,
  ]
}

export const BASKET_FACE = '#5b3413'

function basket(mood: Mood): Art {
  return [basketShell(), face(100, 150, mood, BASKET_FACE, 1.05)]
}

function pileArt(step: number): Art {
  return PILE.filter(([min]) => step >= min).map(([min, pieces]) =>
    part(
      'pile-step',
      pieces.map(([, , art]) => art()),
      min,
    ),
  )
}

export function spill(): Art {
  return part('overflow', [
    sock(34, 164, C.sky, C.cream, 62, 0.82),
    blob(170, 172, 20, 10, C.coral, C.coralDark, 6),
    at(160, 106, motion('wobble', sock(0, 22, C.mint, C.sun, -18, 0.92))),
  ])
}

function basketView(parts: LaundryParts): Art {
  const lines: Array<readonly [number, number]> = [
    [22, 100],
    [178, 96],
    [172, 46],
  ]
  const flySpots: Array<readonly [number, number]> = [
    [34, 44],
    [146, 20],
    [58, 18],
  ]
  return [
    shadow(100, 182, 70),
    svg`<ellipse cx="100" cy="112" rx="62" ry="9" fill=${C.wickerDark} />`,
    pileArt(parts.pile),
    when(parts.overflow, spill),
    basket(parts.mood),
    stenchLines(lines.slice(0, parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

export function machineShell(): Art {
  return [
    svg`<rect x="42" y="172" width="20" height="9" rx="3" fill=${C.metalDark} /><rect x="138" y="172" width="20" height="9" rx="3" fill=${C.metalDark} />`,
    svg`<rect x="32" y="22" width="136" height="154" rx="16" fill=${C.metal} />`,
    svg`<path d="M32 66V38a16 16 0 0 1 16-16H152a16 16 0 0 1 16 16V66Z" fill=${C.metalMid} />`,
    svg`<circle cx="56" cy="44" r="11.5" fill=${C.metal} /><rect x="54" y="33" width="4" height="12" rx="2" fill=${C.metalDark} />`,
    svg`<circle cx="100" cy="118" r="47" fill=${C.metalMid} />`,
  ]
}

function lamp(x: number, on: boolean): Art {
  return svg`<circle cx=${x} cy="44" r="4.5" fill=${on ? C.mint : C.metalDark} />`
}

function machineBody(mood: Mood, leds: number): Art {
  return [
    machineShell(),
    [0, 1, 2].map((i) => lamp(132 + i * 14, i < leds)),
    face(100, 42, mood, C.fly, 0.85),
  ]
}

function machineFrame(art: Art): Art {
  return at(100, 181, at(-100, -181, art), 0, 0.84)
}

export function bubble(x: number, y: number, r: number, delay: number): Art {
  return part(
    'bubble',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<circle r=${r} fill=${C.water} opacity=".22" /><circle r=${r} fill="none" stroke="#d6f2ff" stroke-width="2.4" /><circle cx=${-r * 0.35} cy=${-r * 0.35} r=${r * 0.22} fill="#fff" />`,
        delay,
      ),
    ),
  )
}

export function drumLoad(): Art {
  const clothes = [
    blob(0, -18, 15, 12, C.coral, C.coralDark, 20),
    blob(16, 11, 14, 11, C.sun, C.sunDark, 140),
    blob(-16, 10, 14, 12, C.mint, C.mintDark, 250),
  ]
  return [
    part('drum', at(100, 118, motion('spin', clothes))),
    at(
      100,
      118,
      motion(
        'slosh',
        svg`<path d="M-37 8Q-27 1-18 7T0 7T18 7T37 8A38 38 0 0 1-37 8Z" fill=${C.water} opacity=".78" /><g fill="#eaf8ff"><circle cx="-20" cy="6" r="5" /><circle cx="-10" cy="4" r="6.5" /><circle cx="4" cy="6" r="5" /><circle cx="17" cy="4" r="6" /><circle cx="27" cy="7" r="3.5" /></g>`,
      ),
    ),
  ]
}

export function shakeLines(): Art {
  const shake = [
    [28, 102, 'M0 0q-6 12 0 24'],
    [18, 124, 'M0 0q-6 12 0 24'],
    [172, 102, 'M0 0q6 12 0 24'],
    [182, 124, 'M0 0q6 12 0 24'],
  ] as const
  return part(
    'shake',
    shake.map(([x, y, d], i) =>
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

function washing(parts: LaundryParts): Art {
  return [
    shadow(100, 183, 76),
    part(
      'machine',
      motion(
        'rumble',
        machineFrame([
          machineBody(parts.mood, 2),
          svg`<circle cx="100" cy="118" r="39" fill=${C.glass} />`,
          drumLoad(),
          svg`<circle cx="100" cy="118" r="39" fill="none" stroke=${C.metalDark} stroke-width="6" />`,
          svg`<path d="M74 100a32 32 0 0 1 22-13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />`,
        ]),
      ),
    ),
    bubble(142, 44, 11, 1),
    bubble(58, 40, 8, 2),
    bubble(174, 58, 7, 3),
    bubble(26, 62, 9, 4),
    bubble(100, 36, 6, 5),
    shakeLines(),
    stenchLines(
      (
        [
          [68, 44],
          [132, 44],
          [100, 40],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

export function cloud(x: number, y: number, s: number, delay: number): Art {
  return part(
    'cloud',
    at(
      x,
      y,
      motion(
        'drift',
        svg`<g fill=${C.musty} opacity=".9"><circle cx="-16" cy="4" r="13" /><circle cx="3" cy="-5" r="17" /><circle cx="20" cy="5" r="12" /><rect x="-27" y="3" width="56" height="14" rx="7" /></g><path d="M-14 6q3 3 6 0M4 6q3 3 6 0" fill="none" stroke=${C.mustyDark} stroke-width="3" stroke-linecap="round" />`,
        delay,
      ),
      0,
      s,
    ),
  )
}

export function wetLoad(): Art {
  return part('wet-clothes', [
    blob(100, 120, 26, 20, '#3b6f93', '#2b5473', -6),
    blob(84, 136, 18, 13, '#a55a55', '#7f413e', 12),
    blob(114, 139, 19, 13, '#3f8f76', '#2e6e5a', -10),
    svg`<path d="M70 139Q71 164 80 172Q88 164 86 142Z" fill="#a55a55" />`,
    svg`<path d="M112 142Q112 160 120 166Q128 160 128 139Z" fill="#3f8f76" />`,
  ])
}

export function openDoor(): Art {
  return part('door', [
    svg`<ellipse cx="38" cy="118" rx="17" ry="46" fill=${C.metalDark} />`,
    svg`<ellipse cx="38" cy="118" rx="11" ry="35" fill=${C.glass} />`,
    svg`<path d="M33 96q-3 12-2 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />`,
  ])
}

export function drips(): Art {
  return part(
    'drip',
    (
      [
        [84, 173, 1],
        [119, 168, 2],
        [101, 166, 3],
      ] as const
    ).map(([x, y, d]) => at(x, y, motion('drip', drop(0, 0, C.water, 0.85), d))),
  )
}

export function ding(): Art {
  return part(
    'ding',
    at(
      170,
      54,
      motion(
        'pulse',
        svg`<path d="M-14 4a14 14 0 0 1 28 0v5l5 7H-19l5-7ZM-5 19a5 5 0 0 0 10 0Z" fill=${C.sun} />`,
      ),
      -16,
    ),
  )
}

export function puddle(): Art {
  return svg`<ellipse cx="94" cy="184" rx="30" ry="6" fill=${C.water} opacity=".65" data-part="puddle" />`
}

function wet(parts: LaundryParts): Art {
  const clouds: Array<readonly [number, number, number]> = [
    [148, 30, 1],
    [50, 32, 0.9],
    [100, 18, 0.72],
  ]
  const flySpots: Array<readonly [number, number]> = [
    [176, 96],
    [20, 92],
  ]
  return [
    shadow(100, 183, 76),
    puddle(),
    part(
      'machine',
      machineFrame([
        machineBody(parts.mood, 3),
        svg`<circle cx="100" cy="118" r="39" fill="#141a33" />`,
        wetLoad(),
        openDoor(),
      ]),
    ),
    drips(),
    ding(),
    clouds.slice(0, parts.cloud).map(([x, y, s], i) => cloud(x, y, s, i + 1)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

export function peg(x: number, y: number): Art {
  return svg`<rect x=${x - 2.5} y=${y - 7} width="5" height="13" rx="2" fill=${C.sun} />`
}

export interface HungItem {
  x: number
  y: number
  pegs: ReadonlyArray<readonly [number, number]>
  art: () => Art
}

export const HUNG: readonly HungItem[] = [
  {
    x: 50,
    y: 77,
    pegs: [
      [38, 50],
      [62, 53],
    ],
    art: () => motion('sway', shirt(0, 0, C.sky, C.skyDark, 0, 1.12), 1),
  },
  {
    x: 102,
    y: 58,
    pegs: [
      [89, 55],
      [115, 55],
    ],
    art: () =>
      motion(
        'sway',
        [sock(-13, 25, C.coral, C.cream, 0, 0.92), sock(13, 25, C.coral, C.cream, 0, 0.92)],
        2,
      ),
  },
  {
    x: 164,
    y: 52,
    pegs: [
      [150, 53],
      [178, 50],
    ],
    art: () =>
      motion(
        'sway',
        svg`<rect x="-20" y="0" width="40" height="66" rx="5" fill=${C.sun} /><rect x="-20" y="44" width="40" height="8" fill=${C.coral} /><rect x="-20" y="55" width="40" height="4" fill=${C.coral} />`,
        3,
      ),
  },
]

export function washingLine(): Art {
  return svg`<path d="M-4 44Q100 66 204 44" fill="none" stroke="#bfe8e0" stroke-width="4" />`
}

export function foldedStack(): Art {
  return part('folded', [
    shadow(100, 181, 54),
    svg`<rect x="58" y="162" width="84" height="16" rx="7" fill=${C.lilac} />`,
    svg`<rect x="63" y="147" width="74" height="16" rx="7" fill=${C.mint} />`,
    svg`<rect x="68" y="132" width="64" height="16" rx="7" fill=${C.cream} />`,
    svg`<path d="M66 170h68M71 155h58M76 140h48" stroke="#000" stroke-opacity=".12" stroke-width="3" stroke-linecap="round" />`,
  ])
}

export const DRY_SPARKLES = [
  [30, 134, 1.3, 1],
  [168, 138, 1.05, 2],
  [100, 112, 0.9, 3],
  [180, 26, 0.8, 4],
] as const

function drying(): Art {
  return [
    washingLine(),
    part('line', [
      HUNG.map((item) => at(item.x, item.y, item.art())),
      HUNG.flatMap((item) => item.pegs.map(([x, y]) => peg(x, y))),
    ]),
    foldedStack(),
    DRY_SPARKLES.map(([x, y, size, delay]) => sparkle(x, y, size, delay)),
  ]
}

export function laundry(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = laundryParts(scene)
  const views: Record<LaundryView, () => Art> = {
    basket: () => basketView(parts),
    washing: () => washing(parts),
    wet: () => wet(parts),
    drying,
  }
  return frame('laundry', scene, options, views[parts.view]() ?? nothing)
}
