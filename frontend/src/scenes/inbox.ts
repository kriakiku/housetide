import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  COLORS as C,
  clamp01,
  face,
  fly,
  frame,
  INK,
  isDarkColor,
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

export type InboxView = 'desk' | 'sorting' | 'sending' | 'zen'
export type InboxArms = 'none' | 'up' | 'toss' | 'wave'

export interface InboxParts {
  view: InboxView
  asleep: boolean
  alarm: boolean
  tower: number
  badge: number
  lean: number
  flags: number
  spilled: number
  buried: boolean
  sorted: number
  stall: number
  stench: number
  flies: number
  arms: InboxArms
  mood: Mood
}

export const MAX_TOWER = 6

const LEAN_AT = [0.05, 0.3, 0.55] as const
const FLAGS_AT = [0.1, 0.35, 0.6] as const
const SPILL_AT = [0.3, 0.55, 0.75] as const
const BADGE_AT = [0.3, 0.55] as const
const BURIED_AT = 0.7
const STENCH_AT = [0.6, 0.85] as const
const FLIES_AT = [0.5, 0.8, 0.95] as const
const STALL_AT = [0.2, 0.5, 0.8] as const
const SICK_AT = 0.55
const MAX_SORTED = 3

const CALM = {
  asleep: false,
  alarm: false,
  tower: 0,
  badge: 0,
  lean: 0,
  flags: 0,
  spilled: 0,
  buried: false,
  sorted: 0,
  stall: 0,
  stench: 0,
  flies: 0,
  arms: 'none',
} as const

export function inboxParts(scene: SceneView): InboxParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const sick = stink >= SICK_AT
  if (state === 'clean') return { ...CALM, view: 'zen', mood: 'happy' }
  if (state === 'running') {
    return {
      ...CALM,
      view: 'sorting',
      sorted: Math.min(MAX_SORTED, Math.floor(clamp01(scene.progress) * MAX_SORTED) + 1),
      flags: reached(stink, [0.3, 0.6]),
      stench: reached(stink, [0.5, 0.85]),
      flies: reached(stink, [0.7, 0.95]),
      arms: 'toss',
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    const stall = reached(stink, STALL_AT)
    return {
      ...CALM,
      view: 'sending',
      stall,
      stench: stall >= 3 ? 2 : 0,
      flies: reached(stink, [0.65, 0.9]),
      arms: 'wave',
      mood: sick ? 'sick' : stall >= 1 ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const height = due
    ? MAX_TOWER
    : resting
      ? 0
      : Math.min(MAX_TOWER - 1, Math.floor(fill * MAX_TOWER))
  const piled = height >= MAX_TOWER - 1
  let mood: Mood = resting ? 'sleepy' : height >= 4 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...CALM,
    view: 'desk',
    asleep: resting,
    alarm: due,
    tower: height,
    badge: height === 0 ? 0 : height + reached(stink, BADGE_AT),
    lean: reached(stink, LEAN_AT),
    flags: reached(stink, FLAGS_AT),
    spilled: piled ? reached(stink, SPILL_AT) : 0,
    buried: height >= 4 && stink >= BURIED_AT,
    stench: reached(stink, STENCH_AT),
    flies: reached(stink, FLIES_AT),
    arms: due ? 'up' : 'none',
    mood,
  }
}

interface Hero {
  body: string
  dark: string
  light: string
  ink: string
}

function heroOf(scene: SceneView): Hero {
  const body = accentOf(scene, C.sun)
  return {
    body,
    dark: shadeOf(body, 0.22),
    light: tintOf(body, 0.38),
    ink: isDarkColor(body) ? tintOf(body, 0.84) : mix(body, INK, 0.78),
  }
}

function letter(color: string, scale = 1): Art {
  const flap = mix(color, '#ffffff', 0.45)
  const line = mix(color, INK, 0.2)
  return at(
    0,
    0,
    [
      svg`<rect x="-33" y="-22" width="66" height="44" rx="6" fill=${color} />`,
      svg`<path d="M-30 18L-9-1M30 18L9-1" fill="none" stroke=${line} stroke-width="2.4" stroke-linecap="round" />`,
      svg`<path d="M-33-17Q-33-22-27-22H27Q33-22 33-17L4 4Q0 7-4 4Z" fill=${line} />`,
      svg`<path d="M-33-19Q-33-22-27-22H27Q33-22 33-19L4 1Q0 4-4 1Z" fill=${flap} />`,
    ],
    0,
    scale,
  )
}

function flag(): Art {
  return part('urgent-flag', [
    svg`<path d="M0 0V-24" stroke=${C.metal} stroke-width="3.4" stroke-linecap="round" />`,
    motion('sway', svg`<path d="M1.5-25L20-18.5L1.5-11Z" fill=${C.coral} />`),
  ])
}

const SHEETS = [C.cream, C.pink, C.sky, C.mint, C.lilac, C.cream] as const
const LEVELS = [
  [100, 91, -3],
  [116, 79, 7],
  [84, 68, -8],
  [111, 56, 6],
  [90, 46, -6],
  [103, 39, 4],
] as const
const LEANS = [0, 1.6, 3.4, 5.6] as const

function placeOf(level: number, lean: number): readonly [number, number, number] {
  const [x, y, r] = LEVELS[level] ?? LEVELS[0]
  const push = LEANS[lean] ?? 0
  return [x + push * level, y + push * level * 0.5, r + push * level * 0.6]
}

function buriedEyes(x: number, y: number): Art {
  return part(
    'buried-eyes',
    at(x, y, [
      svg`<rect x="-24" y="-11" width="48" height="23" rx="11" fill=${INK} />`,
      svg`<circle cx="-10" cy="-1" r="7" fill="#fff" /><circle cx="10" cy="-1" r="7" fill="#fff" />`,
      motion(
        'drift',
        svg`<circle cx="-9" cy="-1" r="3.2" fill=${INK} /><circle cx="11" cy="-1" r="3.2" fill=${INK} />`,
      ),
    ]),
  )
}

function tower(parts: InboxParts): Art {
  const levels = Array.from({ length: parts.tower }, (_, i) => parts.tower - 1 - i)
  const sheets = levels.map((level): Art => {
    const [x, y, r] = placeOf(level, parts.lean)
    return [
      when(parts.buried && level === 2, () => buriedEyes(x, y - 27)),
      part('sheet', at(x, y, letter(SHEETS[level] ?? C.cream), r), level),
    ]
  })
  const flagged = [parts.tower - 1, parts.tower - 3, parts.tower - 5]
    .slice(0, parts.flags)
    .filter((level) => level >= 0)
    .map((level, i) => {
      const [x, y, r] = placeOf(level, parts.lean)
      const side = i === 0 ? -4 : 26
      return at(x + side, y - 7, flag(), r * 0.5, 0.85)
    })
  const pile: Art = [sheets, flagged]
  if (parts.lean === 0) return part('tower', pile)
  const dance = parts.lean >= 2 ? 'wobble' : 'sway'
  return part('tower', at(100, 112, motion(dance, at(-100, -112, pile))))
}

function spill(count: number): Art {
  const spots = [
    [30, 172, -16, C.pink, 0.72],
    [170, 173, 13, C.mint, 0.72],
    [52, 178, 8, C.sky, 0.56],
  ] as const
  return part(
    'spill',
    spots.slice(0, count).map(([x, y, r, color, size]) => at(x, y, letter(color, size), r)),
  )
}

function falling(lean: number): Art {
  if (lean < 3) return []
  return part('falling', at(164, 92, motion('bob', at(0, 0, letter(C.lilac, 0.68), 38), 2)))
}

const ROWS = [66, 80, 94, 108, 122, 136] as const

function rows(lit: number, dot: string, bar: string, idle: string): Art {
  return part(
    'rows',
    ROWS.map((y, i) => {
      const on = i < lit
      return svg`<circle cx="38" cy=${y} r="3.6" fill=${on ? dot : idle} /><rect x="47" y=${y - 3} width="118" height="6" rx="3" fill=${on ? bar : idle} />`
    }),
  )
}

function moon(): Art {
  return part('moon', [
    at(148, 78, svg`<path d="M6-15A15 15 0 1 0 15 7A12.5 12.5 0 0 1 6-15Z" fill=${C.spark} />`),
    at(46, 74, motion('twinkle', svg`<circle r="2.6" fill=${C.spark} />`, 1)),
    at(72, 86, motion('twinkle', svg`<circle r="2" fill=${C.spark} />`, 2)),
    at(110, 70, motion('twinkle', svg`<circle r="2.2" fill=${C.spark} />`, 3)),
  ])
}

function keyRow(y: number, from: number, shift: number): Art {
  return [0, 1, 2].flatMap((i) => [
    svg`<rect x=${from + i * 8 - shift} y=${y} width="6" height="4.5" rx="1.4" fill=${C.metalMid} />`,
    svg`<rect x=${200 - from - 6 - i * 8 + shift} y=${y} width="6" height="4.5" rx="1.4" fill=${C.metalMid} />`,
  ])
}

function laptop(screen: string, glow: Art): Art {
  return part('laptop', [
    svg`<rect x="16" y="50" width="168" height="112" rx="11" fill=${C.metalDark} />`,
    svg`<rect x="23" y="57" width="154" height="100" rx="6" fill=${screen} />`,
    glow,
    svg`<path d="M24 157H176L189 175Q190 178 186 178H14Q10 178 11 175Z" fill=${C.metal} />`,
    keyRow(161, 26, 0),
    keyRow(168, 22, 2),
    svg`<rect x="80" y="170.5" width="40" height="6" rx="2.5" fill=${C.metalMid} />`,
    svg`<rect x="10" y="176" width="180" height="9" rx="4.5" fill=${C.metalMid} />`,
    svg`<rect x="82" y="176" width="36" height="3.6" rx="1.8" fill=${C.metalDark} />`,
  ])
}

function arms(pose: InboxArms, hero: Hero): Art {
  const stroke = (d: string): Art =>
    svg`<path d=${d} fill="none" stroke=${hero.dark} stroke-width="8" stroke-linecap="round" />`
  if (pose === 'up')
    return part('arms', [
      at(-50, 4, motion('sway', stroke('M0 0Q-15-3-16-25'), 1)),
      at(50, 4, motion('sway', stroke('M0 0Q15-3 16-25'), 2)),
    ])
  if (pose === 'toss')
    return part('arms', [
      stroke('M-50 12Q-62 16-61 28'),
      at(50, 6, motion('sway', stroke('M0 0Q18-6 20-32'))),
    ])
  if (pose === 'wave')
    return part('arms', [
      stroke('M-50 12Q-62 16-61 28'),
      at(50, 6, motion('wobble', stroke('M0 0Q17-2 21-23'))),
    ])
  return []
}

function heroBody(hero: Hero, open: boolean): Art {
  const fold = hero.dark
  const closed = [
    svg`<path d="M-52-29Q-52-34-46-34H46Q52-34 52-29L7 5Q0 10-7 5Z" fill=${fold} />`,
    svg`<path d="M-52-32Q-52-34-46-34H46Q52-34 52-32L6 1Q0 5.5-6 1Z" fill=${hero.light} />`,
  ]
  const opened = [
    svg`<path d="M-50-32H50L5 3Q0 7-5 3Z" fill=${shadeOf(hero.body, 0.55)} />`,
    svg`<path d="M-50-32H50" stroke=${hero.dark} stroke-width="3" stroke-linecap="round" />`,
  ]
  return [
    when(open, () =>
      part('flap', svg`<path d="M-50-33L-7-66Q0-71 7-66L50-33Z" fill=${hero.light} />`),
    ),
    svg`<rect x="-52" y="-34" width="104" height="68" rx="11" fill=${hero.body} />`,
    svg`<path d="M-47 28L-22 8M47 28L22 8" fill="none" stroke=${hero.dark} stroke-width="3.4" stroke-linecap="round" />`,
    open ? opened : closed,
  ]
}

function envelope(hero: Hero, mood: Mood, pose: InboxArms, open: boolean): Art {
  return part('envelope', [arms(pose, hero), heroBody(hero, open), face(0, 16, mood, hero.ink, 1)])
}

function badge(count: number, pulse: boolean): Art {
  if (count === 0) return []
  const w = count * 8 + 10
  const cx = 168 - w / 2
  const dots = Array.from(
    { length: count },
    (_, i) => svg`<circle cx=${round(-((count - 1) * 4) + i * 8)} cy="0" r="2.5" fill="#fff" />`,
  )
  const pill = [
    svg`<rect x=${-w / 2} y="-10" width=${w} height="20" rx="10" fill=${C.coral} stroke=${C.cream} stroke-width="3" />`,
    dots,
  ]
  return part('badge', at(cx, 104, pulse ? motion('throb', pill) : pill))
}

function desk(parts: InboxParts, hero: Hero): Art {
  const screen = parts.asleep ? mix(C.glass, INK, 0.45) : parts.alarm ? '#4b2a4a' : C.glass
  const idle = mix(screen, '#ffffff', 0.1)
  const bar = mix(screen, '#ffffff', 0.32)
  const dot = parts.alarm ? C.coral : C.sky
  const glow = parts.asleep ? moon() : rows(parts.alarm ? 6 : parts.tower, dot, bar, idle)
  const lines: ReadonlyArray<readonly [number, number]> = [
    [22, 104],
    [184, 64],
  ]
  const flySpots: ReadonlyArray<readonly [number, number]> = [
    [36, 34],
    [64, 22],
    [160, 150],
  ]
  return [
    shadow(100, 186, 90),
    laptop(screen, glow),
    tower(parts),
    falling(parts.lean),
    shadow(100, 170, 56, 0.2),
    at(100, 134, envelope(hero, parts.mood, parts.arms, false)),
    badge(parts.badge, parts.alarm || parts.lean >= 2),
    spill(parts.spilled),
    stenchLines(lines.slice(0, parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function folder(color: string, count: number): Art {
  const dark = shadeOf(color, 0.26)
  const peeks = [
    [-12, -15, -8, C.cream],
    [10, -18, 7, C.pink],
    [-1, -24, -2, C.sun],
  ] as const
  return part('folder', [
    svg`<path d="M-30-22Q-30-27-25-27H-10Q-6-27-4-23L-2-20H25Q30-20 30-15V20Q30 25 25 25H-25Q-30 25-30 20Z" fill=${dark} />`,
    peeks.slice(0, count).map(([x, y, r, tone]) => at(x, y, letter(tone, 0.56), r)),
    svg`<rect x="-30" y="-8" width="60" height="33" rx="5.5" fill=${color} />`,
    svg`<rect x="-16" y="4" width="32" height="5" rx="2.5" fill=${dark} />`,
  ])
}

function sorting(parts: InboxParts, hero: Hero): Art {
  const screen = mix(C.glass, C.sky, 0.28)
  const idle = mix(screen, '#ffffff', 0.12)
  const flyers = [
    [72, 44, -22, C.cream, 1],
    [128, 42, 20, C.pink, 2],
    [100, 31, -6, C.mint, 3],
  ] as const
  return [
    shadow(100, 186, 90),
    laptop(screen, rows(0, C.mint, idle, idle)),
    part(
      'trails',
      svg`<path d="M90 66Q72 28 54 44M110 66Q132 22 148 42" fill="none" stroke="#d6e6ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 8" />`,
    ),
    at(38, 78, folder(C.sky, parts.sorted), -7, 0.86),
    at(162, 76, folder(C.mint, parts.sorted), 7, 0.86),
    shadow(100, 170, 56, 0.2),
    at(100, 134, motion('rumble', envelope(hero, parts.mood, parts.arms, true))),
    flyers.map(([x, y, r, tone, delay], i) =>
      part(
        'flyer',
        at(
          x,
          y,
          motion(
            'bob',
            at(
              0,
              0,
              [when(i < parts.flags, () => at(13, -5, flag(), 0, 0.7)), letter(tone, 0.62)],
              r,
            ),
            delay,
          ),
        ),
        i,
      ),
    ),
    stenchLines(
      (
        [
          [20, 150],
          [182, 150],
        ] as const
      ).slice(0, parts.stench),
    ),
    (
      [
        [24, 26],
        [176, 30],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([x, y], i) => fly(x, y, i)),
  ]
}

function wings(): Art {
  return [
    svg`<path d="M-6-8C-16-30-36-34-46-26C-40-14-24-4-6 0Z" fill=${C.wing} />`,
    svg`<path d="M-8-5C-20-14-32-18-41-20" fill="none" stroke=${C.metalMid} stroke-width="2.4" stroke-linecap="round" />`,
    svg`<path d="M6-8C16-30 36-34 46-26C40-14 24-4 6 0Z" fill=${C.wing} />`,
    svg`<path d="M8-5C20-14 32-18 41-20" fill="none" stroke=${C.metalMid} stroke-width="2.4" stroke-linecap="round" />`,
  ]
}

function reply(color: string): Art {
  return svg`<path d="M9 9V6Q9-1 1-1H-9M-4-7L-10-1L-4 5" fill="none" stroke=${color} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`
}

function outgoing(stall: number): Art {
  const sagging = stall >= 2
  const [x, y, r] = sagging ? ([136, 54, 15] as const) : ([134, 44, -11] as const)
  const plane: Art = [
    wings(),
    when(stall >= 1, () => at(-2, -12, flag(), 0, 0.8)),
    svg`<rect x="-24" y="-16" width="48" height="33" rx="5" fill=${C.cream} />`,
    svg`<path d="M-24-12Q-24-16-20-16H20Q24-16 24-12L3 3Q0 5-3 3Z" fill=${C.creamDark} />`,
    at(0, 9, reply(C.skyDark), 0, 0.72),
  ]
  return part('reply', at(x, y, motion('bob', at(0, 0, plane, r, 0.85))))
}

function sending(parts: InboxParts, hero: Hero): Art {
  const screen = mix(C.glass, C.mint, 0.1)
  const idle = mix(screen, '#ffffff', 0.12)
  const tone = parts.stall >= 2 ? C.coral : parts.stall === 1 ? C.sun : C.mint
  const width = parts.stall >= 2 ? 96 : 110
  const glow = part('progress', [
    svg`<rect x="36" y="70" width="128" height="16" rx="8" fill=${idle} />`,
    svg`<rect x="39" y="73" width=${width} height="10" rx="5" fill=${tone} />`,
    at(39 + width + 5, 78, motion('pulse', svg`<circle r="4.5" fill=${C.spark} />`)),
  ])
  return [
    shadow(100, 186, 90),
    laptop(screen, glow),
    part(
      'trail',
      svg`<path d="M72 98C58 60 80 48 94 ${parts.stall >= 2 ? 54 : 48}" fill="none" stroke="#d6e6ff" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 8" />`,
    ),
    shadow(100, 170, 56, 0.2),
    at(100, 134, envelope(hero, parts.mood, parts.arms, false)),
    outgoing(parts.stall),
    stenchLines(
      (
        [
          [20, 116],
          [182, 118],
        ] as const
      ).slice(0, parts.stench),
    ),
    (
      [
        [38, 34],
        [86, 22],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([x, y], i) => fly(x, y, i)),
  ]
}

function palm(): Art {
  const right = 'M0 0C14-20 42-20 58 6C42-5 20-6 0 0Z'
  const left = 'M0 0C-14-20-42-20-58 6C-42-5-20-6 0 0Z'
  const leaves = [
    [left, 24, C.leafDark, 0.82],
    [right, -22, C.leafDark, 0.82],
    [left, -14, C.leaf, 0.9],
    [right, 16, C.leaf, 0.86],
    [left, -52, C.leaf, 0.62],
    [right, 44, C.leafDark, 0.7],
  ] as const
  const trunk = 'M120 170C122 136 124 104 132 72L141 74C134 106 136 138 138 170Z'
  const rings = [84, 100, 116, 132, 150].map((y) => {
    const t = (170 - y) / 98
    const x = 129 + t ** 3 * 7
    const half = 8 - t * 4
    return svg`<path d=${`M${round(x - half)} ${y}q${round(half)} 4 ${round(half * 2)} 0`} fill="none" stroke=${C.wickerDark} stroke-width="2.8" stroke-linecap="round" />`
  })
  return part('palm', [
    svg`<path d=${trunk} fill=${C.wicker} />`,
    rings,
    at(
      136,
      70,
      motion('sway', [
        leaves.map(([d, r, color, size]) => at(0, 0, svg`<path d=${d} fill=${color} />`, r, size)),
        svg`<circle cx="-6" cy="5" r="6" fill=${C.terracottaDark} /><circle cx="6" cy="6" r="6" fill=${C.terracotta} />`,
      ]),
    ),
  ])
}

function checkBadge(): Art {
  return part(
    'all-clear',
    at(94, 123, [
      svg`<circle r="11" fill=${C.check} stroke=${C.cream} stroke-width="3" />`,
      svg`<path d="M-5 .5L-1.5 4.5L5.5-4" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
    ]),
  )
}

function zen(parts: InboxParts, hero: Hero): Art {
  const glow = [
    svg`<rect x="23" y="57" width="154" height="100" rx="6" fill="#2a8c8f" />`,
    svg`<circle cx="74" cy="104" r="30" fill=${C.sun} />`,
    svg`<circle cx="74" cy="104" r="38" fill=${C.spark} opacity=".16" />`,
    svg`<path d="M23 122H177V151Q177 157 171 157H29Q23 157 23 151Z" fill="#1d6f78" />`,
    motion(
      'drift',
      svg`<path d="M108 132h14M150 130h18M152 144h14" stroke="#7fd4cf" stroke-width="3" stroke-linecap="round" />`,
    ),
  ]
  return [
    shadow(100, 186, 90),
    laptop('#2a8c8f', glow),
    svg`<path d="M92 176Q100 156 134 154Q170 154 180 176Z" fill=${C.cream} data-part="sand" />`,
    palm(),
    shadow(58, 172, 40, 0.2),
    at(58, 170, motion('sway', at(0, -24.5, envelope(hero, parts.mood, 'none', false), 0, 0.72))),
    checkBadge(),
    sparkle(26, 34, 1.15, 1),
    sparkle(72, 26, 0.75, 2),
    sparkle(112, 44, 0.6, 3),
    sparkle(182, 128, 0.7, 4),
  ]
}

export function inbox(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = inboxParts(scene)
  const hero = heroOf(scene)
  const views: Record<InboxView, () => Art> = {
    desk: () => desk(parts, hero),
    sorting: () => sorting(parts, hero),
    sending: () => sending(parts, hero),
    zen: () => zen(parts, hero),
  }
  return frame('inbox', scene, options, views[parts.view]())
}
