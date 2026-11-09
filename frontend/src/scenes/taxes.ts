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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type TaxesView = 'desk' | 'stamping' | 'sent' | 'sealed'

export interface TaxesParts {
  view: TaxesView
  pile: number
  asleep: boolean
  alarm: boolean
  blown: number
  panic: number
  smoke: number
  looming: number
  mood: Mood
}

export const MAX_PILE = 6

const BLOWN_AT = [0.08, 0.35, 0.65] as const
const PANIC_AT = [0.15, 0.4, 0.7] as const
const SMOKE_AT = [0.3, 0.55, 0.8] as const
const LOOMING_AT = [0.5, 0.8] as const
const SICK_AT = 0.6

const ALARM_RED = '#e4405a'
const PAPER = '#fffdf6'
const SMOKE = '#9a9db0'
const LETTER = '#262238'
const LETTER_FLAP = '#3a3452'

export function taxesParts(scene: SceneView): TaxesParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const trouble = {
    blown: reached(stink, BLOWN_AT),
    panic: reached(stink, PANIC_AT),
    smoke: reached(stink, SMOKE_AT),
    looming: reached(stink, LOOMING_AT),
  }
  const sick = stink >= SICK_AT
  if (state === 'clean') {
    return {
      view: 'sealed',
      pile: 0,
      asleep: false,
      alarm: false,
      blown: 0,
      panic: 0,
      smoke: 0,
      looming: 0,
      mood: 'happy',
    }
  }
  if (state === 'running') {
    return {
      view: 'stamping',
      pile: 1,
      asleep: false,
      alarm: false,
      ...trouble,
      mood: sick ? 'worried' : 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      view: 'sent',
      pile: 1,
      asleep: false,
      alarm: false,
      ...trouble,
      mood: sick ? 'sick' : stink >= 0.3 ? 'worried' : 'calm',
    }
  }
  const alarm = state === 'due'
  const pile = alarm ? MAX_PILE : Math.min(MAX_PILE - 1, Math.floor(fill * MAX_PILE))
  const base: Mood =
    state === 'resting' ? 'sleepy' : alarm ? 'pleading' : pile >= 3 ? 'worried' : 'calm'
  return {
    view: 'desk',
    pile,
    asleep: state === 'resting',
    alarm,
    ...trouble,
    mood: sick ? 'sick' : base,
  }
}

interface FolderColors {
  body: string
  dark: string
  light: string
  ink: string
}

function folderColors(scene: SceneView): FolderColors {
  const body = accentOf(scene, C.sun)
  return {
    body,
    dark: shadeOf(body, 0.26),
    light: tintOf(body, 0.34),
    ink: isDarkColor(body) ? tintOf(body, 0.82) : mix(body, INK, 0.76),
  }
}

function zigzag(width: number): string {
  const teeth = Math.max(2, Math.round(width / 5))
  const step = width / teeth
  return Array.from(
    { length: teeth },
    () => `l${round(step / 2)} -3.5l${round(step / 2)} 3.5`,
  ).join('')
}

function receipt(x: number, y: number, rotate: number, length: number, tone = 0, width = 26): Art {
  const half = width / 2
  const paper = tone === 1 ? C.cream : tone === 2 ? mix(C.cream, C.sky, 0.22) : PAPER
  const lines = Array.from({ length: Math.floor((length - 16) / 8) }, (_, i) => i)
  return at(
    x,
    y,
    [
      svg`<path d=${`M${-half} 0V${-length}${zigzag(width)}V0Z`} fill=${paper} />`,
      lines.map(
        (i) =>
          svg`<rect x=${-half + 5} y=${-length + 7 + i * 8} width=${(width - 10) * (i % 3 === 1 ? 0.56 : 0.84)} height="3" rx="1.5" fill=${C.creamDark} />`,
      ),
      svg`<rect x=${-half + 5} y=${-length + 5} width=${width - 10} height="4.5" rx="2" fill=${toneInk(tone)} />`,
    ],
    rotate,
  )
}

function toneInk(tone: number): string {
  return tone === 1 ? C.coral : tone === 2 ? C.skyDark : C.mintDark
}

type FanPiece = readonly [number, number, number, number, number]

const FAN: ReadonlyArray<readonly FanPiece[]> = [
  [[102, 118, -3, 74, 0]],
  [[76, 122, -15, 72, 1]],
  [[128, 122, 13, 74, 2]],
  [
    [90, 106, -6, 82, 2],
    [116, 110, 7, 76, 0],
  ],
  [
    [60, 124, -30, 74, 0],
    [146, 124, 28, 74, 1],
  ],
  [
    [104, 100, 2, 84, 1],
    [72, 106, -18, 78, 2],
    [134, 106, 18, 78, 0],
  ],
]

function fan(count: number): Art {
  return FAN.slice(0, count).map((pieces, i) =>
    part(
      'receipt-fan',
      pieces.map(([x, y, rotate, length, tone]) => receipt(x, y, rotate, length, tone)),
      i + 1,
    ),
  )
}

function slab(i: number, lean: number): Art {
  const jitter = [0, 2.5, -1.5, 1.5, -2.5, 1, -1][i % 7] ?? 0
  const x = round(14 + jitter * (1 + lean * 0.7) + i * lean * 0.7)
  const y = 175 - i * 7
  const tones = [PAPER, C.cream, mix(C.cream, C.sky, 0.24), PAPER, mix(C.cream, C.coral, 0.2)]
  const fill = tones[i % tones.length] ?? PAPER
  return [
    svg`<rect x=${x} y=${y} width="42" height="7" rx="2" fill=${fill} />`,
    svg`<rect x=${x + 1} y=${y + 5.2} width="40" height="1.8" rx=".9" fill=${C.creamDark} />`,
  ]
}

function stack(layers: number, lean: number): Art {
  return part(
    'receipt-stack',
    Array.from({ length: layers }, (_, i) => slab(i, lean)),
  )
}

function bandedStack(): Art {
  return [stack(4, 0), svg`<rect x="29" y="153" width="10" height="29" rx="2" fill=${C.coral} />`]
}

function folderBack(colors: FolderColors): Art {
  return [
    svg`<path d="M-60 0V-92q0-6 6-6H-22q4 0 6 4l3 6H54q6 0 6 6V0Z" fill=${colors.dark} />`,
    svg`<rect x="-50" y="-93" width="24" height="5" rx="2.5" fill=${colors.light} />`,
  ]
}

function folderFront(colors: FolderColors): Art {
  return [
    svg`<path d="M-61-76q0-6 6-6H55q6 0 6 6L63-6q0 6-6 6H-57q-6 0-6-6Z" fill=${colors.body} />`,
    svg`<rect x="-55" y="-82" width="110" height="6" rx="3" fill=${colors.light} />`,
    svg`<rect x="-56" y="-8" width="112" height="4" rx="2" fill=${colors.dark} opacity=".55" />`,
  ]
}

function cheeks(y: number, colors: FolderColors): Art {
  const fill = colors.body === C.sun ? C.coral : tintOf(colors.body, 0.5)
  return svg`<ellipse cx="-27" cy=${y} rx="6.5" ry="4.5" fill=${fill} opacity=".5" /><ellipse cx="27" cy=${y} rx="6.5" ry="4.5" fill=${fill} opacity=".5" />`
}

function sheet(): Art {
  return svg`<rect x="-46" y="-92" width="88" height="40" rx="3" fill=${PAPER} /><rect x="-38" y="-86" width="40" height="3.5" rx="1.7" fill=${C.creamDark} />`
}

function folderFace(mood: Mood, colors: FolderColors, y = -32): Art {
  return [cheeks(y + 9, colors), face(0, y, mood, colors.ink, 1.3)]
}

function alarmStamp(): Art {
  const mark = (x: number): Art =>
    svg`<rect x=${x - 2.6} y="-10.5" width="5.2" height="13" rx="2.6" fill=${PAPER} /><circle cx=${x} cy="7.5" r="3" fill=${PAPER} />`
  return part('alarm-stamp', [
    at(
      2,
      -62,
      motion('throb', [
        svg`<rect x="-33" y="-17" width="66" height="34" rx="7" fill=${PAPER} />`,
        svg`<rect x="-30" y="-14" width="60" height="28" rx="5" fill=${ALARM_RED} />`,
        mark(-14),
        mark(0),
        mark(14),
      ]),
      -9,
    ),
  ])
}

function ringing(): Art {
  const rays = [
    [-36, -74, 'M0 0l-10-5'],
    [-37, -60, 'M0 0h-11'],
    [39, -80, 'M0 0l9-6'],
  ] as const
  return part(
    'alarm-rays',
    rays.map(([x, y, d], i) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} stroke=${ALARM_RED} stroke-width="5" stroke-linecap="round" />`,
          i + 1,
        ),
      ),
    ),
  )
}

type ScreenMode = 'off' | 'sum' | 'running' | 'error' | 'panic'

function screen(mode: ScreenMode, digits: number): Art {
  const glass = mode === 'error' || mode === 'panic' ? '#7f1f35' : C.glass
  const lit = mode === 'error' ? C.coral : C.mint
  const cells = Array.from({ length: Math.min(5, digits) }, (_, i) => {
    const cell = svg`<rect x=${11 - i * 7} y="-59" width="5" height="11" rx="1.4" fill=${lit} />`
    return mode === 'running' ? motion('flicker', cell, (i % 5) + 1) : cell
  })
  return [
    svg`<rect x="-20" y="-64" width="40" height="21" rx="4" fill=${glass} />`,
    when(mode !== 'off' && mode !== 'panic', () => cells),
    when(
      mode === 'panic',
      () =>
        svg`<circle cx="-8.5" cy="-55" r="5.4" fill=${PAPER} /><circle cx="8.5" cy="-55" r="5.4" fill=${PAPER} /><circle cx="-8" cy="-55" r="1.7" fill=${INK} /><circle cx="8" cy="-55" r="1.7" fill=${INK} /><path d="M-5-46.5l2.5-2 2.5 2 2.5-2 2.5 2" fill="none" stroke=${PAPER} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
  ]
}

const KEY_ROWS = [-37, -28, -19, -10] as const
const KEY_COLUMNS = [-19, -6.5, 6] as const

function keys(flashing: boolean, missing: number): Art {
  const gone = [
    [2, 0],
    [0, 2],
    [1, 3],
  ].slice(0, missing)
  return KEY_ROWS.map((y, row) =>
    KEY_COLUMNS.map((x, column) => {
      if (gone.some(([c, r]) => c === column && r === row)) {
        return svg`<rect x=${x} y=${y} width="13" height="6.5" rx="2" fill=${C.lilacDark} />`
      }
      const operator = column === 2
      const fill = operator ? (row === 3 ? C.coral : C.sun) : PAPER
      const key = svg`<rect x=${x} y=${y} width="13" height="6.5" rx="2" fill=${fill} />`
      if (!flashing || (row + column) % 2 === 1) return key
      return [
        svg`<rect x=${x} y=${y} width="13" height="6.5" rx="2" fill=${C.lilacDark} />`,
        motion('flicker', key, ((row * 2 + column) % 5) + 1),
      ]
    }),
  )
}

function calculatorBody(mode: ScreenMode, digits: number, flashing: boolean, missing: number): Art {
  return [
    svg`<rect x="-27" y="-72" width="54" height="74" rx="10" fill=${C.lilacDark} />`,
    svg`<rect x="-27" y="-72" width="54" height="69" rx="10" fill=${C.lilac} />`,
    screen(mode, digits),
    keys(flashing, missing),
  ]
}

function modeFor(panic: number, fallback: ScreenMode): ScreenMode {
  if (panic >= 2) return 'panic'
  return panic === 1 ? 'error' : fallback
}

function calculator(
  parts: TaxesParts,
  fallback: ScreenMode,
  digits: number,
  flashing: boolean,
): Art {
  const mode = modeFor(parts.panic, fallback)
  const missing = Math.max(0, parts.panic - 1)
  const body = calculatorBody(mode, mode === 'error' ? 5 : digits, flashing, missing)
  const rotate = parts.panic >= 3 ? 7 : parts.panic === 2 ? 3 : 0
  return part(
    'calculator',
    at(161 - rotate, 180, parts.panic >= 2 ? motion('rumble', body) : body, rotate),
  )
}

function puff(x: number, y: number, scale: number, delay: number): Art {
  return part(
    'smoke',
    at(
      x,
      y,
      motion(
        'waft',
        svg`<g fill=${SMOKE}><circle cx="-9" cy="3" r="9" /><circle cx="4" cy="-5" r="12" /><circle cx="13" cy="5" r="8" /></g>`,
        delay,
      ),
      0,
      scale,
    ),
  )
}

const PUFFS = [
  [164, 92, 0.72, 1],
  [150, 66, 1, 2],
  [158, 42, 1.3, 3],
] as const

function smoke(level: number): Art {
  return PUFFS.slice(0, level).map(([x, y, scale, delay]) => puff(x, y, scale, delay))
}

function sparks(level: number): Art {
  return when(level >= 3, () =>
    part('sparks', [
      at(
        136,
        104,
        motion(
          'flicker',
          svg`<path d="M0-9l2.5 6.5L9 0 2.5 2.5 0 9-2.5 2.5-9 0-2.5-2.5Z" fill=${C.sun} />`,
          1,
        ),
      ),
      at(
        180,
        108,
        motion('flicker', svg`<path d="M0-7l2 5L7 0 2 2 0 7-2 2-7 0-2-2Z" fill=${C.sun} />`, 3),
      ),
    ]),
  )
}

function sweat(active: boolean): Art {
  return when(active, () =>
    part('sweat', [
      at(133, 112, motion('drip', drop(0, 0, C.water, 0.8), 1)),
      at(190, 134, motion('drip', drop(0, 0, C.water, 0.7), 3)),
    ]),
  )
}

type LooseSpot = readonly [number, number, number, number]

const LOOSE: readonly LooseSpot[] = [
  [38, 66, -40, 1],
  [126, 48, 34, 2],
  [72, 30, 66, 3],
  [30, 118, -72, 5],
  [108, 34, -22, 4],
]

const LOOSE_STAMPING: readonly LooseSpot[] = [
  [40, 66, -40, 1],
  [146, 34, 30, 2],
  [30, 118, -72, 5],
  [48, 30, 66, 3],
]

const LOOSE_SENT: readonly LooseSpot[] = [
  [150, 34, 30, 2],
  [32, 134, -60, 4],
  [50, 116, 30, 1],
]

function loose(count: number, spots: readonly LooseSpot[] = LOOSE): Art {
  return spots
    .slice(0, count)
    .map(([x, y, rotate, delay], i) =>
      part(
        'blown-receipt',
        at(x, y, motion('drift', at(0, 0, receipt(0, 17, 0, 34, i % 3, 21), rotate), delay)),
        i,
      ),
    )
}

function gusts(level: number, count = 3): Art {
  return when(level >= 2, () =>
    part(
      'gust',
      (
        [
          [14, 92, 1],
          [152, 80, 2],
          [38, 46, 3],
        ] as const
      )
        .slice(0, count)
        .map(([x, y, delay]) =>
          at(
            x,
            y,
            motion(
              'flicker',
              svg`<path d="M0 0h24q8 0 8-6t-7-6q-5 0-6 4" fill="none" stroke="#dfe7f5" stroke-width="3.5" stroke-linecap="round" opacity=".6" />`,
              delay,
            ),
          ),
        ),
    ),
  )
}

function looming(level: number): Art {
  if (level === 0) return []
  const large = level >= 2
  return part(
    'looming-envelope',
    at(
      100,
      large ? 64 : 72,
      [
        svg`<rect x="-76" y="-50" width="152" height="100" rx="12" fill=${LETTER} />`,
        svg`<path d="M-73-44Q-74-50-64-50H64Q74-50 73-44L9 7Q0 14-9 7Z" fill=${LETTER_FLAP} />`,
        when(large, () =>
          at(
            0,
            8,
            motion('pulse', [
              svg`<circle r="13" fill=${ALARM_RED} />`,
              svg`<circle r="8" fill="none" stroke=${mix(ALARM_RED, INK, 0.3)} stroke-width="2.4" />`,
            ]),
          ),
        ),
      ],
      0,
      large ? 1 : 0.76,
    ),
  )
}

function zee(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'bob',
      svg`<path d="M-7-8H7L-7 8H7" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
      delay,
    ),
    0,
    size,
  )
}

function folderAt(colors: FolderColors, inside: Art, front: Art, x = 100, scale = 1): Art {
  return part(
    'folder',
    at(x, 181, [folderBack(colors), inside, folderFront(colors), front], 0, scale),
  )
}

function looseCount(blown: number): number {
  return [0, 2, 4, 5][blown] ?? 0
}

function desk(parts: TaxesParts, colors: FolderColors): Art {
  const blownAway = parts.blown * 2
  const layers = parts.asleep ? 2 : Math.max(1, 1 + Math.ceil(parts.pile * 1.6) - blownAway)
  return [
    looming(parts.looming),
    shadow(100, 183, 88),
    fan(parts.pile - blownAway),
    folderAt(colors, when(parts.pile === 0, sheet), [
      folderFace(parts.mood, colors, parts.alarm ? -24 : -34),
      when(parts.mood === 'pleading', () =>
        at(-23, -12, motion('drip', drop(0, 0, C.water, 0.85))),
      ),
      when(parts.alarm, alarmStamp),
      when(parts.alarm, ringing),
    ]),
    stack(layers, parts.blown),
    calculator(parts, parts.asleep ? 'off' : 'sum', parts.pile, false),
    when(parts.asleep && parts.smoke === 0, () =>
      part('sleep', [zee(142, 78, 0.7, 1), zee(156, 58, 0.95, 2), zee(174, 34, 1.2, 3)]),
    ),
    when(parts.alarm, () => part('overflow', receipt(22, 183, 74, 36, 1, 22))),
    gusts(parts.blown),
    loose(looseCount(parts.blown)),
    sparks(parts.smoke),
    sweat(parts.panic >= 1),
    smoke(parts.smoke),
  ]
}

function rubberStamp(): Art {
  return [
    svg`<ellipse cx="0" cy="-58" rx="16" ry="14" fill=${C.coral} />`,
    svg`<ellipse cx="-5" cy="-63" rx="5" ry="3.5" fill="#fff" opacity=".45" />`,
    svg`<path d="M-7-46H7L10-24H-10Z" fill=${C.coralDark} />`,
    svg`<rect x="-28" y="-26" width="56" height="16" rx="5" fill=${C.coral} />`,
    svg`<rect x="-25" y="-11" width="50" height="9" rx="2.5" fill=${C.coralDark} />`,
  ]
}

function imprint(x: number, y: number, rotate: number): Art {
  return at(
    x,
    y,
    [
      svg`<rect x="-15" y="-11" width="30" height="22" rx="4" fill="none" stroke=${C.check} stroke-width="3.4" />`,
      svg`<path d="M-7 0l5 5 9-10" fill="none" stroke=${C.check} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
    ],
    rotate,
  )
}

function impact(): Art {
  const lines = ['M-40-10l-13-6', 'M-42 2h-14', 'M40-10l13-6', 'M42 2h14']
  return lines.map((d, i) =>
    motion(
      'flicker',
      svg`<path d=${d} stroke=${C.spark} stroke-width="4.5" stroke-linecap="round" />`,
      i + 1,
    ),
  )
}

function stamping(parts: TaxesParts, colors: FolderColors): Art {
  return [
    looming(parts.looming),
    shadow(100, 183, 88),
    folderAt(colors, sheet(), [
      imprint(-42, -58, -12),
      imprint(0, -62, 4),
      folderFace(parts.mood, colors, -28),
    ]),
    stack(3, parts.blown),
    part('tape', at(163, 116, motion('sway', receipt(0, 8, 6, 62, 0, 22)))),
    calculator(parts, 'running', 5, true),
    part('stamp', at(100, 98, [impact(), at(0, -2, motion('bob', rubberStamp()))])),
    gusts(parts.blown),
    loose(Math.min(4, looseCount(parts.blown)), LOOSE_STAMPING),
    sparks(parts.smoke),
    sweat(parts.panic >= 1),
    smoke(parts.smoke),
  ]
}

function wing(): Art {
  return svg`<path d="M0 0C-8-16-24-22-38-20C-34-14-32-12-28-10C-32-9-34-8-36-5C-29-2-24-1-20 0C-22 2-22 4-24 6C-14 8-6 6 0 0Z" fill=${PAPER} />`
}

function envelope(): Art {
  return [
    svg`<g transform="translate(4 -18) rotate(-16) scale(-.72 .72)">${wing()}</g>`,
    svg`<rect x="-34" y="-23" width="68" height="46" rx="6" fill=${C.cream} />`,
    svg`<path d="M-32-20L0 5L32-20" fill=${C.creamDark} />`,
    svg`<path d="M-34 20L-6-2M34 20L6-2" stroke=${C.creamDark} stroke-width="2.4" stroke-linecap="round" />`,
    svg`<rect x="-29" y="-19" width="12" height="14" rx="2" fill=${C.coral} />`,
    part(
      'tracking-code',
      [10, 14, 19, 22, 26].map(
        (x, i) => svg`<rect x=${x} y="10" width=${i % 2 ? 2 : 3} height="9" fill=${INK} />`,
      ),
    ),
  ]
}

function pin(x: number, y: number): Art {
  return part(
    'tracking-pin',
    at(
      x,
      y,
      motion('bob', [
        svg`<path d="M0 22C-10 9-14 3-14-6a14 14 0 0 1 28 0C14 3 10 9 0 22Z" fill=${C.coral} />`,
        svg`<circle cx="0" cy="-6" r="5.5" fill=${PAPER} />`,
      ]),
      0,
      0.72,
    ),
  )
}

function sent(parts: TaxesParts, colors: FolderColors): Art {
  const nodes = [
    [127, 80],
    [122, 56],
    [102, 44],
  ] as const
  return [
    shadow(108, 183, 76),
    part('route', [
      svg`<path d="M126 96C132 62 122 40 94 46" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-dasharray="1 9" />`,
      nodes.map(
        ([x, y], i) =>
          svg`<circle cx=${x} cy=${y} r=${i === 2 ? 6.5 : 5} fill=${i === 2 ? C.sun : C.mint} />`,
      ),
    ]),
    part('envelope', at(56, 62, motion('bob', envelope()), 8)),
    pin(102, 29),
    folderAt(colors, [], folderFace(parts.mood, colors, -34), 98, 0.84),
    stack(2, 0),
    calculator(parts, 'sum', 2, false),
    gusts(parts.blown, 2),
    loose(parts.blown, LOOSE_SENT),
    sparks(parts.smoke),
    sweat(parts.panic >= 1),
    smoke(parts.smoke),
  ]
}

function bigCheck(): Art {
  return part(
    'big-check',
    at(
      100,
      56,
      motion('throb', [
        svg`<circle r="40" fill=${C.check} />`,
        svg`<circle r="32" fill="none" stroke="#fff" stroke-width="3" opacity=".45" />`,
        svg`<path d="M-19 1L-5 15L21-14" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />`,
      ]),
    ),
  )
}

function coin(x: number, y: number, r: number, delay?: number): Art {
  const art = [
    svg`<circle r=${r} fill=${C.sunDark} />`,
    svg`<circle r=${r * 0.76} fill=${C.sun} />`,
    svg`<rect x=${-r * 0.13} y=${-r * 0.44} width=${r * 0.26} height=${r * 0.88} rx=${r * 0.13} fill=${C.sunDark} />`,
    svg`<path d=${`M${-r * 0.56} ${-r * 0.1}a${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.42} ${-r * 0.46}`} fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".7" />`,
  ]
  return part('coin', at(x, y, delay === undefined ? art : motion('bob', art, delay)))
}

function sealed(parts: TaxesParts, colors: FolderColors): Art {
  return [
    bigCheck(),
    shadow(100, 183, 80),
    folderAt(
      colors,
      [],
      [
        svg`<rect x="-62" y="-70" width="124" height="13" fill=${colors.dark} />`,
        svg`<circle cx="0" cy="-63" r="14" fill=${ALARM_RED} />`,
        svg`<circle cx="0" cy="-63" r="9" fill="none" stroke=${mix(ALARM_RED, INK, 0.3)} stroke-width="2.4" />`,
        folderFace(parts.mood, colors, -30),
      ],
    ),
    coin(162, 96, 22, 2),
    bandedStack(),
    coin(35, 143, 11),
    sparkle(36, 76, 1.2, 1),
    sparkle(170, 42, 1, 3),
    sparkle(26, 30, 0.8, 4),
    sparkle(148, 20, 0.7, 2),
  ]
}

export function taxes(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = taxesParts(scene)
  const colors = folderColors(scene)
  const views: Record<TaxesView, () => Art> = {
    desk: () => desk(parts, colors),
    stamping: () => stamping(parts, colors),
    sent: () => sent(parts, colors),
    sealed: () => sealed(parts, colors),
  }
  const art = views[parts.view]()
  return frame('taxes', scene, options, art)
}
