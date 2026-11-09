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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type BillsView = 'pile' | 'paying' | 'pending' | 'paid'

export interface BillsParts {
  view: BillsView
  pile: number
  sealed: boolean
  asleep: boolean
  teeth: number
  cracks: number
  sweat: number
  rage: number
  ticks: number
  mood: Mood
}

export const MAX_PILE = 6

const TEETH_AT = [0.15, 0.45, 0.75] as const
const CRACKS_AT = [0.25, 0.55, 0.85] as const
const SWEAT_AT = [0.05, 0.35, 0.65] as const
const RAGE_AT = [0.2, 0.5, 0.8] as const
const SICK_AT = 0.6

const CALM = { pile: 0, sealed: false, asleep: false, teeth: 0, cracks: 0, sweat: 0, rage: 0 }

export function billsParts(scene: SceneView): BillsParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const ticks = Math.min(3, Math.floor(clamp01(scene.progress) * 3) + 1)
  if (state === 'clean') return { ...CALM, view: 'paid', ticks: 3, mood: 'happy' }
  const trouble = {
    teeth: reached(stink, TEETH_AT),
    cracks: reached(stink, CRACKS_AT),
    sweat: reached(stink, SWEAT_AT),
    rage: reached(stink, RAGE_AT),
  }
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return { ...CALM, ...trouble, view: 'paying', teeth: 0, ticks, mood: 'happy' }
  }
  if (state === 'waiting') {
    const mood: Mood = sick ? 'sick' : stink >= 0.25 ? 'worried' : 'calm'
    return { ...CALM, ...trouble, view: 'pending', ticks, mood }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  let pile = Math.min(MAX_PILE - 1, 1 + Math.floor(fill * (MAX_PILE - 1)))
  if (due) pile = MAX_PILE
  if (resting) pile = 0
  let mood: Mood = pile >= 4 ? 'worried' : 'calm'
  if (resting) mood = 'sleepy'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return { ...CALM, ...trouble, view: 'pile', pile, sealed: due, asleep: resting, ticks, mood }
}

interface Pig {
  color: string
  shade: string
  deep: string
  tint: string
  ink: string
}

function pigOf(scene: SceneView): Pig {
  const color = accentOf(scene, C.pink)
  return {
    color,
    shade: shadeOf(color, 0.18),
    deep: shadeOf(color, 0.42),
    tint: tintOf(color, 0.45),
    ink: shadeOf(color, 0.84),
  }
}

const RED = '#e5404a'
const RED_DARK = '#b32a38'
const MAW = '#3a0d18'
const SPEED = '#a9c8f0'

interface Tone {
  body: string
  flap: string
}

const TONES: readonly Tone[] = [
  { body: C.cream, flap: C.creamDark },
  { body: mix(C.sky, '#ffffff', 0.52), flap: mix(C.sky, '#ffffff', 0.12) },
  { body: mix(C.sun, '#ffffff', 0.34), flap: C.sun },
  { body: mix(C.mint, '#ffffff', 0.48), flap: mix(C.mint, '#ffffff', 0.08) },
  { body: mix(C.lilac, '#ffffff', 0.5), flap: mix(C.lilac, '#ffffff', 0.1) },
]

function envelope(width: number, tone: Tone, dot?: string): Art {
  const hw = width / 2
  const hh = round(width * 0.34)
  const tip = round(hh * 0.3)
  return [
    svg`<rect x=${-hw} y=${-hh} width=${width} height=${hh * 2} rx="5" fill=${tone.body} />`,
    svg`<path d=${`M${round(-hw + 3)} ${hh - 3}L${round(-hw * 0.16)} ${-tip}M${round(hw - 3)} ${hh - 3}L${round(hw * 0.16)} ${-tip}`} fill="none" stroke=${tone.flap} stroke-width="2.4" stroke-linecap="round" />`,
    svg`<path d=${`M${round(-hw + 2)} ${-hh + 1}L0 ${tip}L${round(hw - 2)} ${-hh + 1}Z`} fill=${tone.flap} stroke=${tone.flap} stroke-width="3" stroke-linejoin="round" />`,
    when(
      dot !== undefined,
      () => svg`<circle cy=${tip} r=${round(width * 0.09)} fill=${dot ?? RED} />`,
    ),
  ]
}

type Piece = readonly [x: number, y: number, rotate: number, tone: number, width: number]

const PILE: ReadonlyArray<readonly [number, readonly Piece[]]> = [
  [1, [[100, 92, -5, 0, 66]]],
  [
    2,
    [
      [54, 112, -20, 1, 58],
      [147, 108, 16, 2, 58],
    ],
  ],
  [
    3,
    [
      [76, 76, 12, 3, 60],
      [130, 80, -12, 4, 58],
    ],
  ],
  [
    4,
    [
      [48, 76, -24, 2, 52],
      [153, 72, 22, 0, 54],
      [104, 58, -4, 1, 62],
    ],
  ],
  [
    5,
    [
      [74, 44, -14, 0, 56],
      [134, 44, 14, 3, 56],
    ],
  ],
  [
    6,
    [
      [104, 37, 6, 4, 54],
      [44, 44, -30, 3, 46],
      [160, 40, 26, 1, 46],
    ],
  ],
]

function redden(tone: Tone, rage: number): Tone {
  const t = rage * 0.17
  return { body: mix(tone.body, '#ff9a94', t), flap: mix(tone.flap, RED, t) }
}

function pileArt(parts: BillsParts): Art {
  return PILE.filter(([min]) => parts.pile >= min).map(([min, pieces]) =>
    part(
      'pile-step',
      pieces.map(([x, y, rotate, tone, width], i) => {
        const base = TONES[tone] ?? { body: C.cream, flap: C.creamDark }
        const dot = (min + i) % 3 < parts.rage ? RED : undefined
        return at(x, y, envelope(width, redden(base, parts.rage), dot), rotate)
      }),
      min,
    ),
  )
}

function sealPath(r: number): string {
  const points = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * Math.PI) / 12
    const radius = i % 2 ? r * 0.86 : r
    return `${round(Math.cos(angle) * radius)} ${round(Math.sin(angle) * radius)}`
  })
  return `M${points.join('L')}Z`
}

function waxSeal(r: number): Art {
  return part('seal', [
    svg`<path d=${sealPath(r)} fill=${RED} stroke=${RED} stroke-width="2.4" stroke-linejoin="round" />`,
    svg`<circle r=${round(r * 0.68)} fill=${RED_DARK} />`,
    svg`<rect x="-2.4" y=${round(-r * 0.46)} width="4.8" height=${round(r * 0.54)} rx="2.4" fill=${C.cream} />`,
    svg`<circle cy=${round(r * 0.36)} r="2.7" fill=${C.cream} />`,
  ])
}

function dueEnvelope(): Art {
  const tip = round(88 * 0.34 * 0.3)
  return part(
    'due-envelope',
    at(
      100,
      52,
      motion('sway', [
        envelope(92, { body: C.cream, flap: C.creamDark }),
        at(0, tip + 1, waxSeal(17)),
      ]),
      -5,
    ),
  )
}

function spilled(): Art {
  return part('spilled', [
    at(30, 174, envelope(38, TONES[3] ?? { body: C.cream, flap: C.creamDark }), -10),
    at(168, 176, envelope(40, TONES[1] ?? { body: C.cream, flap: C.creamDark }), 12),
  ])
}

function alarmLines(): Art {
  const lines = [
    [38, 27, 'M0 0l-7-9', 1],
    [26, 42, 'M0 0l-11-3', 2],
    [162, 27, 'M0 0l7-9', 2],
    [174, 42, 'M0 0l11-3', 3],
  ] as const
  return part(
    'alarm',
    lines.map(([x, y, d, delay]) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} stroke=${C.coral} stroke-width="5" stroke-linecap="round" />`,
          delay,
        ),
      ),
    ),
  )
}

function toothRow(y: number, height: number): string {
  const count = 5
  const width = 30 / count
  const zig = Array.from(
    { length: count },
    (_, i) =>
      `L${round(-15 + (i + 0.5) * width)} ${y + height}L${round(-15 + (i + 1) * width)} ${y}`,
  ).join('')
  return `M-15 ${y}${zig}Z`
}

function angryBody(): Art {
  return [
    svg`<path d="M-24-6C-35-20-43-11-39 0C-35-2-30-1-24 4Z" fill=${C.cream} /><path d="M24-6C35-20 43-11 39 0C35-2 30-1 24 4Z" fill=${C.cream} />`,
    svg`<rect x="-26" y="-18" width="52" height="38" rx="6" fill=${RED} />`,
    svg`<path d="M-24-17L0 3L24-17Z" fill=${RED_DARK} stroke=${RED_DARK} stroke-width="3" stroke-linejoin="round" />`,
    svg`<circle cx="-7.5" cy="-9" r="4.4" fill="#fff" /><circle cx="7.5" cy="-9" r="4.4" fill="#fff" />`,
    svg`<circle cx="-6.5" cy="-8" r="2.2" fill=${MAW} /><circle cx="6.5" cy="-8" r="2.2" fill=${MAW} />`,
    svg`<path d="M-14-16L-3-10.5M14-16L3-10.5" stroke=${MAW} stroke-width="3.2" stroke-linecap="round" />`,
    svg`<rect x="-18" y="5" width="36" height="13" rx="5" fill=${MAW} />`,
    svg`<path d=${toothRow(5, 6)} fill="#fff" stroke="#fff" stroke-width=".8" stroke-linejoin="round" />`,
    svg`<g transform="translate(3 0)"><path d=${toothRow(18, -5)} fill="#fff" stroke="#fff" stroke-width=".8" stroke-linejoin="round" /></g>`,
  ]
}

type Spot = readonly [x: number, y: number, rotate: number, scale: number]

const ANGRY_SPOTS: readonly Spot[] = [
  [46, 54, -14, 0.8],
  [154, 46, 13, 0.8],
  [156, 118, -9, 0.7],
]

function angryLetters(count: number, spots: readonly Spot[] = ANGRY_SPOTS): Art {
  return spots
    .slice(0, count)
    .map(([x, y, rotate, scale], i) =>
      part(
        'angry-letter',
        at(x, y, at(0, 0, motion('buzz', angryBody(), (i % 3) + 1), rotate, scale)),
        i,
      ),
    )
}

const CRACK_PATHS = [
  'M-45-79l7 7-5 5 8 6-3 6',
  'M38-83l-5 8 6 4-7 8 4 7',
  'M28-13l-3-8 7-5-5-9 6-6',
] as const

function cracks(count: number, pig: Pig): Art {
  if (count === 0) return []
  return part('cracks', [
    CRACK_PATHS.slice(0, count).map(
      (d) =>
        svg`<path d=${d} fill="none" stroke=${pig.ink} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
    when(count >= 3, () => [
      svg`<path d="M-55-41l7-2 3-7 5 5 7-1-2 7 5 6-7 2-3 7-6-5-7 1 1-7Z" fill=${pig.ink} stroke=${pig.ink} stroke-width="1.5" stroke-linejoin="round" />`,
      at(-44, -35, coin(5.5)),
    ]),
  ])
}

function sweat(count: number): Art {
  const spots = [
    [-60, -88, 1],
    [66, -84, 2],
    [-2, -101, 3],
  ] as const
  return part(
    'sweat',
    spots
      .slice(0, count)
      .map(([x, y, delay]) => at(x, y, motion('drip', drop(0, 0, C.water), delay))),
  )
}

function piggy(pig: Pig, parts: BillsParts): Art {
  const pleading = parts.mood === 'pleading'
  return part('piggy', [
    svg`<rect x="-36" y="-22" width="22" height="22" rx="7" fill=${pig.shade} /><rect x="14" y="-22" width="22" height="22" rx="7" fill=${pig.shade} />`,
    svg`<rect x="-36" y="-8" width="22" height="8" rx="4" fill=${pig.deep} /><rect x="14" y="-8" width="22" height="8" rx="4" fill=${pig.deep} />`,
    svg`<path d="M53-56c10 3 21-3 18-12c-3-8-14-4-11 4" fill="none" stroke=${pig.shade} stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d="M-50-68C-58-90-52-102-44-101C-34-99-24-92-19-84Z" fill=${pig.shade} /><path d="M50-68C58-90 52-102 44-101C34-99 24-92 19-84Z" fill=${pig.shade} />`,
    svg`<path d="M-45-75C-49-88-46-95-42-94C-37-92-32-88-29-83Z" fill=${pig.tint} /><path d="M45-75C49-88 46-95 42-94C37-92 32-88 29-83Z" fill=${pig.tint} />`,
    svg`<ellipse cy="-50" rx="58" ry="41" fill=${pig.color} />`,
    svg`<path d="M-58-50A58 41 0 0 0 58-50A58 31 0 0 1-58-50Z" fill=${pig.shade} />`,
    svg`<path d="M-47-60A50 34 0 0 1-27-80" fill="none" stroke=${pig.tint} stroke-width="6.5" stroke-linecap="round" />`,
    part('slot', [
      svg`<rect x="-18" y="-89" width="36" height="11" rx="5.5" fill=${pig.shade} />`,
      svg`<rect x="-14" y="-86" width="28" height="5" rx="2.5" fill=${pig.ink} />`,
    ]),
    svg`<ellipse cx="-36" cy="-39" rx="8.5" ry="5.5" fill=${pig.tint} opacity=".8" /><ellipse cx="36" cy="-39" rx="8.5" ry="5.5" fill=${pig.tint} opacity=".8" />`,
    part('snout', [
      svg`<ellipse cy="-52" rx="8.5" ry="6.5" fill=${pig.shade} />`,
      svg`<ellipse cy="-54" rx="8.5" ry="6.5" fill=${pig.tint} />`,
      svg`<ellipse cx="-3.2" cy="-54" rx="1.7" ry="2.6" fill=${pig.deep} /><ellipse cx="3.2" cy="-54" rx="1.7" ry="2.6" fill=${pig.deep} />`,
    ]),
    face(0, -50, parts.mood, pig.ink, 1.6),
    cracks(parts.cracks, pig),
    when(pleading, () => [
      at(-24, -41, motion('drip', drop(0, 0, C.water, 0.8), 2)),
      part(
        'trotters',
        svg`<ellipse cx="-8" cy="-22" rx="9" ry="10" fill=${pig.tint} /><ellipse cx="8" cy="-22" rx="9" ry="10" fill=${pig.tint} /><path d="M0-30V-15" stroke=${pig.shade} stroke-width="2.4" stroke-linecap="round" />`,
      ),
    ]),
    sweat(parts.sweat),
  ])
}

function shard(pig: Pig, x: number, y: number): Art {
  return part(
    'shard',
    at(
      x,
      y,
      svg`<path d="M-8 0L-4-8L5-9L9 0Z" fill=${pig.shade} stroke=${pig.shade} stroke-width="1.5" stroke-linejoin="round" />`,
    ),
  )
}

function shaken(parts: BillsParts, art: Art): Art {
  return parts.cracks >= 2 ? motion('rumble', art) : art
}

function placed(x: number, scale: number, art: Art): Art {
  return at(x, 184, art, 0, scale)
}

function coin(r: number, squish = 1): Art {
  const rx = round(r * squish)
  return [
    svg`<ellipse rx=${rx} ry=${r} fill=${C.sunDark} />`,
    svg`<ellipse cx=${round(-r * 0.1 * squish)} rx=${round(rx * 0.86)} ry=${round(r * 0.9)} fill=${C.sun} />`,
    svg`<rect x=${round(-rx * 0.17)} y=${round(-r * 0.5)} width=${round(rx * 0.3)} height=${r} rx=${round(rx * 0.15)} fill=${C.sunDark} />`,
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
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function pileView(parts: BillsParts, pig: Pig): Art {
  return [
    shadow(100, 184, 74),
    pileArt(parts),
    when(parts.sealed, spilled),
    when(parts.sealed, dueEnvelope),
    when(parts.sealed && parts.teeth === 0, alarmLines),
    placed(100, 0.96, shaken(parts, piggy(pig, parts))),
    when(parts.cracks >= 3, () => shard(pig, 53, 186)),
    when(parts.asleep, () => [
      zed(142, 76, 0.72, 1),
      zed(158, 54, 1, 2),
      zed(176, 36, 0.62, 3),
      at(46, 176, coin(9)),
    ]),
    angryLetters(parts.teeth),
  ]
}

function terminal(ticks: number): Art {
  const keys = [0, 1, 2].flatMap((row) =>
    [0, 1, 2].map((col) => {
      const accents = [C.coral, C.sun, C.mint]
      const fill = row === 2 ? (accents[col] ?? C.metalMid) : C.metalMid
      return svg`<rect x=${-21 + col * 15} y=${-48 + row * 12} width="12" height="8" rx="3" fill=${fill} />`
    }),
  )
  const bars = [0, 1, 2].map(
    (i) =>
      svg`<rect x=${-16 + i * 11.5} y="-66" width="9" height="5" rx="2.5" fill=${i < ticks ? C.mint : '#3b4d78'} />`,
  )
  return part('terminal', [
    svg`<rect x="-35" y="-11" width="70" height="11" rx="5" fill=${C.metalDark} />`,
    svg`<rect x="-30" y="-98" width="60" height="91" rx="13" fill=${C.metal} />`,
    svg`<path d="M18-98H17a13 13 0 0 1 13 13V-20a13 13 0 0 1-13 13H20a7 7 0 0 0 3-7V-90a8 8 0 0 0-5-8Z" fill=${C.metalMid} />`,
    svg`<rect x="-23" y="-91" width="46" height="35" rx="7" fill=${C.glass} />`,
    bars,
    svg`<path d="M-7-77l5 5 9-9" fill="none" stroke=${C.mint} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
    keys,
  ])
}

function card(): Art {
  return part('card', [
    svg`<rect x="-33" y="-21" width="66" height="42" rx="7" fill=${C.lilac} />`,
    svg`<rect x="-33" y="-12" width="66" height="9" fill=${C.fly} />`,
    svg`<rect x="-25" y="4" width="14" height="10" rx="2.5" fill=${C.sun} /><path d="M-18 4V14M-25 9H-11" stroke=${C.sunDark} stroke-width="1.4" />`,
    svg`<rect x="-4" y="6" width="30" height="3.6" rx="1.8" fill=${C.lilacDark} /><rect x="-4" y="12" width="18" height="3.6" rx="1.8" fill=${C.lilacDark} />`,
  ])
}

function waves(): Art {
  return part(
    'contactless',
    (
      [
        [83, 'M-9 0Q0-6 9 0', 1],
        [74, 'M-15 0Q0-9 15 0', 2],
      ] as const
    ).map(([y, d, delay]) =>
      at(
        150,
        y,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke=${C.mint} stroke-width="4.2" stroke-linecap="round" />`,
          delay,
        ),
      ),
    ),
  )
}

function flyingCoins(): Art {
  const coins = [
    [42, 94, 10, 1, 1],
    [70, 66, 12.5, 0.7, 2],
    [103, 42, 10.5, 1, 3],
    [100, 92, 9, 0.5, 4],
    [26, 62, 8.5, 0.7, 5],
  ] as const
  return part(
    'coins',
    coins.map(([x, y, r, squish, delay], i) =>
      part('coin', at(x, y, motion('rise', coin(r, squish), delay)), i),
    ),
  )
}

function coinTrail(): Art {
  return svg`<path d="M62 112C50 66 86 28 128 58" fill="none" stroke=${SPEED} stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10" opacity=".7" data-part="trail" />`
}

function payingView(parts: BillsParts, pig: Pig): Art {
  return [
    shadow(62, 184, 46),
    shadow(152, 184, 38),
    coinTrail(),
    at(152, 184, terminal(parts.ticks)),
    waves(),
    placed(62, 0.76, motion('bob', piggy(pig, parts))),
    flyingCoins(),
    at(150, 42, at(0, 0, motion('bob', card()), -12)),
    when(parts.cracks >= 3, () => shard(pig, 112, 183)),
  ]
}

function hourglass(): Art {
  const glass = 'M-27-106C-27-84-5-72-4-59C-5-46-27-34-27-12H27C27-34 5-46 4-59C5-72 27-84 27-106Z'
  return part('hourglass', [
    svg`<path d=${glass} fill="#d2ecfd" opacity=".26" />`,
    svg`<path d="M-21-90C-16-76-4-70-2.5-60H2.5C4-70 16-76 21-90Q0-82-21-90Z" fill=${C.sun} />`,
    svg`<path d="M-24-12C-19-27-8-36 0-38C8-36 19-27 24-12Z" fill=${C.sun} />`,
    svg`<path d="M-24-12C-19-27-13-32-8-34C-10-26-12-18-11-12Z" fill=${C.sunDark} opacity=".55" />`,
    motion(
      'flicker',
      svg`<rect x="-1.6" y="-60" width="3.2" height="23" rx="1.6" fill=${C.sun} />`,
    ),
    at(0, -52, motion('fall', svg`<circle r="2.3" fill=${C.spark} />`, 2)),
    svg`<path d=${glass} fill="none" stroke="#d2ecfd" stroke-width="3.2" stroke-linejoin="round" />`,
    svg`<path d="M-20-100C-20-90-16-84-12-79" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".7" />`,
    svg`<rect x="-34" y="-106" width="6.5" height="94" rx="3" fill=${C.wickerDark} /><rect x="27.5" y="-106" width="6.5" height="94" rx="3" fill=${C.wickerDark} />`,
    svg`<rect x="-39" y="-118" width="78" height="13" rx="6" fill=${C.wickerLight} />`,
    svg`<rect x="-39" y="-13" width="78" height="13" rx="6" fill=${C.wicker} />`,
  ])
}

function lastEnvelope(): Art {
  const dots = [0, 1, 2].map((i) =>
    at(-12 + i * 12, 0, motion('pulse', svg`<circle r="4.2" fill=${C.skyDark} />`, i + 1)),
  )
  return part('last-envelope', [
    svg`<circle cx="130" cy="84" r="3.6" fill=${C.cream} /><circle cx="122" cy="74" r="5.6" fill=${C.cream} />`,
    at(146, 44, [
      svg`<path d=${'M-29-27H29Q37-27 37-19V19Q37 27 29 27H-29Q-37 27-37 19V-19Q-37-27-29-27Z'} fill=${C.cream} />`,
      at(0, -7, envelope(46, { body: mix(C.sky, '#ffffff', 0.52), flap: C.sky })),
      at(0, 16, dots),
    ]),
  ])
}

const WAITING_SPOTS: readonly Spot[] = [
  [162, 94, 8, 0.6],
  [38, 28, -12, 0.6],
  [108, 112, -8, 0.6],
]

function pendingView(parts: BillsParts, pig: Pig): Art {
  return [
    shadow(58, 184, 46),
    shadow(136, 184, 38),
    at(58, 184, hourglass(), 0, 1.2),
    lastEnvelope(),
    placed(136, 0.7, shaken(parts, piggy(pig, parts))),
    when(parts.cracks >= 3, () => shard(pig, 112, 183)),
    angryLetters(parts.teeth, WAITING_SPOTS),
  ]
}

function coinStack(x: number, count: number): Art {
  const layers = Array.from({ length: count }, (_, i) => {
    const shift = i % 2 ? 2 : -1
    return svg`<rect x=${-15 + shift} y=${-8.5 - i * 8} width="30" height="8.5" rx="4" fill=${i % 2 ? C.sunDark : C.sun} />`
  })
  return part('coin-stack', [
    shadow(x, 184, 19, 0.24),
    at(x, 184, [
      layers,
      svg`<rect x="-11" y=${-6 - (count - 1) * 8} width="10" height="2.4" rx="1.2" fill=${C.spark} />`,
    ]),
  ])
}

function paidStamp(): Art {
  return part('stamp', [
    svg`<circle r="38" fill="none" stroke=${C.mintDark} stroke-width="7" />`,
    svg`<circle r="29.5" fill="none" stroke=${C.mintDark} stroke-width="2.4" stroke-dasharray="1 7" stroke-linecap="round" />`,
    svg`<path d="M-17 1L-5 14L20-13" fill="none" stroke=${C.mintDark} stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />`,
  ])
}

function bill(): Art {
  const bars = [
    [-47, -37, 16],
    [-47, -29, 10],
  ] as const
  return part(
    'bill',
    at(
      100,
      62,
      [
        svg`<path d="M-54-40Q-54-44-50-44H50Q54-44 54-40V66H-54Z" fill=${C.cream} />`,
        bars.map(
          ([x, y, w]) =>
            svg`<rect x=${x} y=${y} width=${w} height="4.4" rx="2.2" fill=${C.creamDark} />`,
        ),
        at(2, -4, motion('throb', paidStamp()), -14),
      ],
      -3,
    ),
  )
}

const PAID_SPARKLES = [
  [26, 42, 1.3, 1],
  [176, 30, 1.1, 2],
  [24, 112, 0.8, 3],
  [180, 118, 0.85, 4],
] as const

const TOSSED_COINS = [
  [38, 84, 10, 1, 2],
  [164, 78, 11, 0.7, 3],
] as const

function paidView(parts: BillsParts, pig: Pig): Art {
  return [
    shadow(100, 184, 62),
    bill(),
    coinStack(29, 5),
    coinStack(171, 3),
    placed(100, 0.96, motion('bob', piggy(pig, parts))),
    TOSSED_COINS.map(([x, y, r, squish, delay]) =>
      part('coin', at(x, y, motion('bob', coin(r, squish), delay))),
    ),
    PAID_SPARKLES.map(([x, y, size, delay]) => sparkle(x, y, size, delay)),
  ]
}

export function bills(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = billsParts(scene)
  const pig = pigOf(scene)
  const views: Record<BillsView, () => Art> = {
    pile: () => pileView(parts, pig),
    paying: () => payingView(parts, pig),
    pending: () => pendingView(parts, pig),
    paid: () => paidView(parts, pig),
  }
  return frame('bills', scene, options, views[parts.view]())
}
