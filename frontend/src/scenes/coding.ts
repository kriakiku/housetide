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

export type CodingView = 'sleep' | 'editor' | 'prompt' | 'typing' | 'compile' | 'passed'

export interface CodingParts {
  view: CodingView
  rows: number
  bugs: number
  errors: number
  spill: boolean
  smoke: number
  crack: boolean
  alarm: boolean
  king: boolean
  mood: Mood
}

export const MAX_BUGS = 6
export const MAX_ROWS = 5

const ERROR_AT = [0.08, 0.3, 0.55] as const
const SWARM_AT = [0.15, 0.4, 0.6, 0.8] as const
const SMOKE_AT = [0.45, 0.65, 0.85] as const
const SPILL_AT = 0.25
const ALARM_AT = 0.5
const CRACK_AT = 0.7
const KING_AT = 0.85
const SICK_AT = 0.5

const QUIET = {
  bugs: 0,
  errors: 0,
  spill: false,
  smoke: 0,
  crack: false,
  alarm: false,
  king: false,
} as const

export function codingParts(scene: SceneView): CodingParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...QUIET, view: 'passed', rows: 0, mood: 'happy' }
  }
  const errors = reached(stink, ERROR_AT)
  const swarm = reached(stink, SWARM_AT)
  const smoke = reached(stink, SMOKE_AT)
  if (state === 'running') {
    const progress = clamp01(scene.progress)
    return {
      ...QUIET,
      view: 'typing',
      rows: Math.min(MAX_ROWS, Math.floor(progress * MAX_ROWS) + 1),
      bugs: Math.min(3, Math.max(0, 2 - Math.floor(progress * 3)) + swarm),
      errors: Math.min(1, errors),
      smoke: Math.min(1, smoke),
      mood: 'happy',
    }
  }
  const neglect = {
    errors,
    spill: stink >= SPILL_AT,
    smoke,
    crack: stink >= CRACK_AT,
    alarm: stink >= ALARM_AT,
    king: stink >= KING_AT,
  }
  const sick = stink >= SICK_AT
  if (state === 'waiting') {
    return {
      ...neglect,
      view: 'compile',
      rows: 0,
      bugs: 1 + swarm,
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const crawling = Math.min(MAX_BUGS - 1, Math.floor(fill * MAX_BUGS))
  const bugs = due ? MAX_BUGS : resting ? 0 : crawling
  let mood: Mood = resting ? 'sleepy' : bugs >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...neglect,
    view: due ? 'prompt' : resting ? 'sleep' : 'editor',
    rows: resting || due ? 0 : 4,
    bugs: bugs + swarm,
    mood,
  }
}

const LID_X = 36
const LID_Y = 32
const LID_W = 128
const LID_H = 112
const SCREEN_X = 43
const SCREEN_Y = 39
const SCREEN_W = 114
const SCREEN_H = 98
const CODE_X = 52
const ROW_TOP = 47
const ROW_STEP = 11
const BAR = 7
const FACE_Y = 113

const PANEL = '#18213f'
const PANEL_NIGHT = '#101733'
const GLOW = '#f4f7ff'
const LOG = '#37426d'
const PLEA = '#9fd4ff'
const ERROR = '#ff5a5a'
const COFFEE = '#7a4a2a'
const COFFEE_DARK = '#5a3419'
const COFFEE_LIGHT = '#a26a3f'
const SMOKE = '#aab1c4'
const SMOKE_DARK = '#858da3'
const LEG = '#252a42'
const CAP = '#23284a'

type Token = readonly [number, string]

const CODE: ReadonlyArray<readonly [number, readonly Token[]]> = [
  [
    0,
    [
      [20, C.coral],
      [30, C.sky],
      [14, C.sun],
    ],
  ],
  [
    10,
    [
      [24, C.mint],
      [36, C.pink],
    ],
  ],
  [
    10,
    [
      [14, C.sun],
      [40, C.sky],
      [12, C.coral],
    ],
  ],
  [
    20,
    [
      [34, C.lilac],
      [16, C.mint],
    ],
  ],
  [
    10,
    [
      [26, C.pink],
      [18, C.sun],
    ],
  ],
]

function bar(x: number, y: number, w: number, color: string): Art {
  return svg`<rect x=${x} y=${y} width=${w} height=${BAR} rx="3.5" fill=${color} />`
}

function codeRow(index: number): Art {
  const [indent, tokens] = CODE[index] ?? [0, []]
  let x = CODE_X + indent
  const y = ROW_TOP + index * ROW_STEP
  return part(
    'code-row',
    tokens.map(([w, color]) => {
      const piece = bar(x, y, w, color)
      x += w + 4
      return piece
    }),
    index,
  )
}

function errorRows(count: number, top: number): Art {
  const widths = [70, 54, 84]
  return Array.from({ length: count }, (_, i) => {
    const y = top + i * ROW_STEP
    return part(
      'error-row',
      [
        svg`<circle cx=${CODE_X + 3} cy=${y + 3} r="3.6" fill=${ERROR} />`,
        motion('flicker', bar(CODE_X + 10, y, widths[i] ?? 60, ERROR), i + 1),
      ],
      i,
    )
  })
}

function cursor(x: number, y: number, w: number, h: number): Art {
  return part(
    'cursor',
    motion('flicker', svg`<rect x=${x} y=${y} width=${w} height=${h} rx="2" fill=${GLOW} />`),
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
        svg`<path d="M-7-7H7L-7 7H7" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function sleepScreen(): Art {
  return [
    part(
      'moon',
      at(64, 66, svg`<path d="M5-15A16 16 0 1 0 15 9A13 13 0 0 1 5-15Z" fill=${C.spark} />`, -8),
    ),
    svg`<circle cx="92" cy="52" r="2" fill=${C.spark} /><circle cx="84" cy="74" r="1.5" fill=${C.spark} /><circle cx="50" cy="94" r="1.6" fill=${C.spark} />`,
    zed(118, 82, 0.62, 1),
    zed(131, 66, 0.86, 2),
    zed(145, 49, 0.56, 3),
  ]
}

function promptScreen(): Art {
  return part('prompt', [
    svg`<path d="M53 50L63 58L53 66" fill="none" stroke=${C.mint} stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`,
    cursor(70, 47, 13, 22),
  ])
}

function typingScreen(rows: number): Art {
  const last = rows - 1
  const [indent, tokens] = CODE[last] ?? [0, []]
  const end = CODE_X + indent + tokens.reduce((sum, [w]) => sum + w + 4, 0)
  return [
    Array.from({ length: rows }, (_, i) =>
      i === last ? motion('pulse', codeRow(i), 1) : codeRow(i),
    ),
    cursor(end, ROW_TOP + last * ROW_STEP - 1, 6, 8),
  ]
}

function compileScreen(short: boolean, log: boolean): Art {
  const x = CODE_X
  const w = short ? 80 : 96
  const y = 49
  const done = w - 18
  const stripes = Array.from({ length: Math.floor(done / 11) }, (_, i) => x + 7 + i * 11)
  return part('compile', [
    svg`<rect x=${x} y=${y} width=${w} height="16" rx="8" fill="#0d1330" />`,
    svg`<rect x=${x + 2} y=${y + 2} width=${done} height="12" rx="6" fill=${C.check} />`,
    stripes.map(
      (sx) =>
        svg`<path d=${`M${sx} ${y + 12}l5-8`} stroke=${C.mintDark} stroke-width="3.4" stroke-linecap="round" />`,
    ),
    motion(
      'flicker',
      svg`<rect x=${x + done + 4} y=${y + 2} width="10" height="12" rx="5" fill=${C.sun} />`,
    ),
    [0, 1, 2].map((i) =>
      at(
        x + w / 2 - 7 + i * 7,
        y + 22,
        motion('twinkle', svg`<circle r="2.2" fill=${C.metalMid} />`, i + 1),
      ),
    ),
    when(log, () =>
      [
        [0, 58],
        [10, 40],
      ].map(([indent = 0, width = 0], i) => bar(x + indent, y + 34 + i * ROW_STEP, width, LOG)),
    ),
  ])
}

function passedScreen(): Art {
  return part('check', [
    motion('pulse', svg`<circle cx="100" cy="68" r="27" fill=${C.check} opacity=".2" />`),
    svg`<circle cx="100" cy="68" r="21" fill=${C.check} />`,
    svg`<path d="M89 68L97 76L112 60" fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />`,
  ])
}

function warningSign(): Art {
  return part(
    'alarm',
    at(
      140,
      122,
      motion('pulse', [
        svg`<path d="M0-12L13 10H-13Z" fill=${C.sun} stroke=${C.sun} stroke-width="3.5" stroke-linejoin="round" />`,
        svg`<rect x="-1.8" y="-6" width="3.6" height="9" rx="1.8" fill=${LEG} />`,
        svg`<circle cy="7" r="2" fill=${LEG} />`,
      ]),
    ),
  )
}

function crack(): Art {
  return part(
    'crack',
    svg`<path d="M157 40L147 49L151 55L141 66M147 49L154 50" fill="none" stroke="#dfe7f5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".85" />`,
  )
}

function tear(): Art {
  return part('tear', at(126, 121, motion('drip', drop(0, 0, C.water, 0.72), 2)))
}

function faceColor(mood: Mood): string {
  return mood === 'pleading' ? PLEA : GLOW
}

function screen(parts: CodingParts): Art {
  const night = parts.view === 'sleep'
  const passed = parts.view === 'passed'
  const fill = night ? PANEL_NIGHT : passed ? '#123a4a' : PANEL
  const typing = parts.view === 'typing'
  const rows = Math.max(typing ? 1 : 0, parts.rows - parts.errors)
  const errorTop =
    parts.view === 'compile' || parts.view === 'prompt' ? ROW_TOP + 29 : ROW_TOP + rows * ROW_STEP
  const size =
    parts.view === 'passed' ? 1.25 : parts.view === 'prompt' && !parts.errors ? 1.55 : 1.2
  const faceY =
    parts.view === 'passed' ? 116 : parts.view === 'prompt' && !parts.errors ? 103 : FACE_Y + 4
  return part('screen', [
    svg`<rect x=${SCREEN_X} y=${SCREEN_Y} width=${SCREEN_W} height=${SCREEN_H} rx="7" fill=${fill} />`,
    when(night && parts.errors === 0, sleepScreen),
    when(parts.view === 'editor', () => Array.from({ length: rows }, (_, i) => codeRow(i))),
    when(parts.view === 'prompt', promptScreen),
    when(typing, () => typingScreen(rows)),
    when(parts.view === 'compile', () => compileScreen(parts.crack, parts.errors === 0)),
    when(passed, passedScreen),
    errorRows(parts.errors, errorTop),
    face(100, faceY, parts.mood, faceColor(parts.mood), size),
    when(parts.crack, crack),
    when(parts.alarm, warningSign),
    when(parts.view === 'prompt' && parts.errors === 0, tear),
  ])
}

function deckEdge(y: number): number {
  return 60 + (y - 146) * 0.57
}

function keyRow(y: number, count: number, key: string, hot: boolean): Art {
  const half = deckEdge(y) - 12
  const pitch = (half * 2) / count
  return Array.from({ length: count }, (_, i) => {
    const x = round(100 - half + i * pitch + 0.8)
    const w = round(pitch - 1.6)
    const cap = svg`<rect x=${x} y=${y} width=${w} height="4.8" rx="1.5" fill=${key} />`
    if (!hot || (i * 7 + count) % 3 !== 0) return cap
    return [
      cap,
      motion(
        'flicker',
        svg`<rect x=${x} y=${y} width=${w} height="4.8" rx="1.5" fill=${C.sun} />`,
        (i % 5) + 1,
      ),
    ]
  })
}

function spaceRow(key: string): Art {
  return svg`<rect x="78" y="165.4" width="44" height="4.8" rx="1.5" fill=${key} />`
}

function keyboard(body: string, typing: boolean): Art {
  const dark = shadeOf(body, 0.42)
  const key = tintOf(body, 0.72)
  return part('keyboard', [
    svg`<path d="M50 150H150L156 172H44Z" fill=${dark} stroke=${dark} stroke-width="3" stroke-linejoin="round" />`,
    keyRow(151.2, 11, key, typing),
    keyRow(158.2, 12, key, typing),
    spaceRow(key),
  ])
}

function laptop(parts: CodingParts, body: string): Art {
  const light = tintOf(body, 0.32)
  const dark = shadeOf(body, 0.26)
  const lamp = parts.view === 'sleep' ? C.sun : parts.alarm ? ERROR : C.mint
  return part('laptop', [
    svg`<rect x=${LID_X} y=${LID_Y} width=${LID_W} height=${LID_H} rx="13" fill=${body} />`,
    svg`<path d=${`M${LID_X + 13} ${LID_Y + 2.4}H${LID_X + LID_W - 13}`} stroke=${light} stroke-width="3" stroke-linecap="round" />`,
    svg`<rect x="60" y="141" width="80" height="7" rx="3" fill=${dark} />`,
    screen(parts),
    svg`<path d="M41 146H159L177 172Q179 177 174 177H26Q21 177 23 172Z" fill=${body} stroke=${body} stroke-width="2" stroke-linejoin="round" />`,
    svg`<path d="M23 174H177V175Q177 181 170 181H30Q23 181 23 175Z" fill=${dark} />`,
    svg`<rect x="86" y="174" width="28" height="3.5" rx="1.75" fill=${shadeOf(body, 0.45)} />`,
    keyboard(body, parts.view === 'typing'),
    at(
      166,
      170,
      parts.view === 'sleep'
        ? motion('flicker', svg`<circle r="2.4" fill=${lamp} />`)
        : svg`<circle r="2.4" fill=${lamp} />`,
    ),
  ])
}

const BUG_COLORS = [C.coral, C.sun, C.mint, C.pink, C.coral, C.sky, C.sun, C.coral] as const

function critter(color: string): Art {
  const dark = shadeOf(color, 0.3)
  return [
    svg`<path d="M-8-3L-15-7M-10 2L-16 2M-8 7L-14 11M8-3L15-7M10 2L16 2M8 7L14 11" fill="none" stroke=${LEG} stroke-width="2.4" stroke-linecap="round" />`,
    svg`<path d="M-4-10Q-6-16-11-16M4-10Q6-16 11-16" fill="none" stroke=${LEG} stroke-width="2" stroke-linecap="round" />`,
    svg`<ellipse rx="10.5" ry="10" cy="1" fill=${color} />`,
    svg`<path d="M0-4V10" stroke=${dark} stroke-width="2" stroke-linecap="round" />`,
    svg`<circle cx="-6" cy="5" r="1.8" fill=${dark} /><circle cx="6" cy="5" r="1.8" fill=${dark} />`,
    svg`<circle cx="-4.2" cy="-5" r="4.2" fill="#fff" /><circle cx="4.2" cy="-5" r="4.2" fill="#fff" />`,
    svg`<circle cx="-3.6" cy="-4.2" r="2.1" fill=${LEG} /><circle cx="3.6" cy="-4.2" r="2.1" fill=${LEG} />`,
  ]
}

const BUG_SPOTS = [
  [20, 176, -6, 0.92],
  [70, 23, 4, 0.82],
  [58, 125, -16, 0.76],
  [31, 96, -82, 0.82],
  [133, 23, -5, 0.86],
  [134, 156, 8, 0.74],
  [152, 25, 12, 0.66],
  [170, 76, 84, 0.82],
  [181, 182, 4, 0.72],
  [108, 183, -3, 0.68],
] as const

function bug(index: number): Art {
  const [x, y, rotate, size] = BUG_SPOTS[index] ?? [100, 180, 0, 1]
  const color = BUG_COLORS[index % BUG_COLORS.length] ?? C.coral
  return part(
    'bug',
    at(x, y, at(0, 0, motion('wobble', critter(color), (index % 5) + 1), rotate), 0, size),
    index,
  )
}

function kingBug(): Art {
  return part(
    'king-bug',
    at(100, 161, [
      motion('bob', [
        critter(ERROR),
        svg`<path d="M-9-11L-11-23L-4.5-17L0-25L4.5-17L11-23L9-11Z" fill=${C.sun} stroke=${C.sun} stroke-width="1.5" stroke-linejoin="round" />`,
        svg`<circle cy="-14.5" r="2" fill=${C.coralDark} />`,
      ]),
    ]),
  )
}

function mugShape(): Art {
  return [
    svg`<path d="M-9-14a7 7 0 0 0 0 13" fill="none" stroke=${C.creamDark} stroke-width="4" stroke-linecap="round" />`,
    svg`<path d="M-10-20H10V-3Q10 0 6 0H-6Q-10 0-10-3Z" fill=${C.cream} />`,
    svg`<rect x="-10" y="-12.5" width="20" height="4" fill=${C.coral} />`,
  ]
}

function mug(steam: boolean): Art {
  const curl = 'M0 0c-4-4 4-7 0-11'
  return part(
    'mug',
    at(
      179,
      171,
      [
        svg`<ellipse rx="10" cy="-20" ry="2.8" fill=${COFFEE} />`,
        mugShape(),
        when(steam, () =>
          [-4, 4].map((x, i) =>
            at(
              x,
              -25,
              motion(
                'waft',
                svg`<path d=${curl} fill="none" stroke=${C.metalMid} stroke-width="3" stroke-linecap="round" />`,
                i + 1,
              ),
            ),
          ),
        ),
      ],
      0,
      0.9,
    ),
  )
}

function spilled(): Art {
  return part('spill', [
    svg`<path d="M151 164C144 162 136 166 128 165C119 164 110 165 106 169C101 173 104 177 111 177C118 178 124 176 131 177C139 178 147 177 151 174C155 171 155 166 151 164Z" fill=${COFFEE} />`,
    svg`<path d="M113 171C119 169 125 169 131 170" fill="none" stroke=${COFFEE_LIGHT} stroke-width="2.4" stroke-linecap="round" />`,
    svg`<path d="M122 176V182M143 176V179" stroke=${COFFEE} stroke-width="4" stroke-linecap="round" />`,
    svg`<ellipse cx="124" cy="184" rx="20" ry="2.6" fill=${COFFEE} />`,
    at(133, 181, motion('drip', drop(0, 0, COFFEE, 0.55), 2)),
    part('tipped-mug', [
      svg`<path d="M163 149a7.5 7.5 0 0 0-14 0" fill="none" stroke=${C.creamDark} stroke-width="4" stroke-linecap="round" />`,
      svg`<path d="M148 150H169Q173 150 173 154V168Q173 172 169 172H148Z" fill=${C.cream} />`,
      svg`<rect x="158" y="150" width="4" height="22" fill=${C.coral} />`,
      svg`<ellipse cx="148" cy="161" rx="3.6" ry="11" fill=${C.creamDark} />`,
      svg`<ellipse cx="148" cy="164" rx="2.2" ry="7.4" fill=${COFFEE_DARK} />`,
    ]),
  ])
}

function wisp(): Art {
  return part(
    'smoke-wisp',
    at(
      74,
      151,
      motion(
        'waft',
        svg`<path d="M0 0c-5-5 5-9 0-14c-5-5 5-9 0-14" fill="none" stroke=${SMOKE} stroke-width="5" stroke-linecap="round" />`,
        3,
      ),
    ),
  )
}

function zap(): Art {
  return part(
    'zap',
    at(
      84,
      163,
      motion(
        'flicker',
        svg`<path d="M3-12L-6 2H0L-3 12L7-3H1Z" fill=${C.sun} stroke=${C.sun} stroke-width="1.5" stroke-linejoin="round" />`,
      ),
    ),
  )
}

function puff(x: number, y: number, s: number, delay: number): Art {
  return part(
    'smoke',
    at(
      x,
      y,
      motion(
        'waft',
        svg`<g fill=${SMOKE}><circle cx="-11" cy="3" r="9" /><circle cx="2" cy="-4" r="12" /><circle cx="14" cy="4" r="8" /><rect x="-19" y="3" width="40" height="9" rx="4.5" /></g><path d="M-8 3q3 3 6 0M5 2q3 3 6 0" fill="none" stroke=${SMOKE_DARK} stroke-width="2.4" stroke-linecap="round" />`,
        delay,
      ),
      0,
      s,
    ),
  )
}

const PUFFS = [
  [52, 147, 0.74, 1],
  [23, 128, 0.9, 2],
  [173, 124, 0.98, 3],
] as const

function bracket(x: number, y: number, d: string, color: string, delay: number): Art {
  return part(
    'bracket',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<path d=${d} fill="none" stroke=${color} stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
    ),
  )
}

const LEFT = 'M5-9L-5 0L5 9'
const RIGHT = 'M-5-9L5 0L-5 9'

function brackets(): Art {
  return [
    bracket(20, 118, LEFT, C.mint, 1),
    bracket(182, 104, RIGHT, C.sun, 2),
    bracket(19, 62, RIGHT, C.pink, 3),
    bracket(181, 50, LEFT, C.sky, 4),
  ]
}

function gradCap(): Art {
  return part(
    'grad-cap',
    at(
      62,
      28,
      [
        svg`<path d="M-15-2V8Q0 15 15 8V-2Z" fill=${shadeOf(CAP, 0.2)} />`,
        svg`<path d="M0-13L29-3L0 7L-29-3Z" fill=${CAP} stroke=${CAP} stroke-width="2.5" stroke-linejoin="round" />`,
        svg`<path d="M0-3L20 3V15" fill="none" stroke=${C.sun} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`,
        at(
          20,
          18,
          motion('sway', svg`<rect x="-3" y="-3" width="6" height="11" rx="2.4" fill=${C.sun} />`),
        ),
      ],
      -12,
    ),
  )
}

const CONFETTI = [
  [24, 112, 16, C.coral, -24, 1],
  [178, 138, 14, C.sun, 30, 2],
  [18, 60, 14, C.sky, 22, 3],
  [184, 88, 12, C.pink, -18, 4],
  [152, 20, 15, C.mint, 14, 5],
] as const

function confetti(): Art {
  return part(
    'confetti',
    CONFETTI.map(([x, y, w, color, rotate, delay]) =>
      at(
        x,
        y,
        motion(
          'fall',
          at(
            0,
            0,
            svg`<rect x=${-w / 2} y="-3" width=${w} height="6" rx="3" fill=${color} />`,
            rotate,
          ),
          delay,
        ),
      ),
    ),
  )
}

const JOY = [
  [24, 150, 1.1, 1],
  [178, 34, 1.2, 2],
  [26, 32, 0.8, 3],
  [183, 118, 0.85, 4],
] as const

export function coding(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = codingParts(scene)
  const body = accentOf(scene, C.lilac)
  const passed = parts.view === 'passed'
  const machine: Art = [laptop(parts, body), when(passed, gradCap)]
  const bugCount = Math.min(parts.bugs, BUG_SPOTS.length)
  const art: Art = [
    shadow(100, 183, 82),
    when(!parts.spill && !passed, () => mug(parts.view === 'typing' || parts.view === 'editor')),
    passed || parts.view === 'typing' ? motion('bob', machine) : machine,
    when(parts.spill, spilled),
    when(parts.view === 'typing', brackets),
    when(parts.smoke >= 1, wisp),
    PUFFS.slice(0, parts.smoke).map(([x, y, s, d]) => puff(x, y, s, d)),
    Array.from({ length: bugCount }, (_, i) => bug(i)),
    when(parts.smoke >= 3, zap),
    when(parts.king, kingBug),
    when(passed, confetti),
    when(passed, () => JOY.map(([x, y, s, d]) => sparkle(x, y, s, d))),
  ]
  return frame('coding', scene, options, art)
}
