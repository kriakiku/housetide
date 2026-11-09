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
  shadeOf,
  shadow,
  sparkle,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type IronView = 'board' | 'pressing' | 'cooling' | 'crisp'

export interface IronParts {
  view: IronView
  heap: number
  overflow: boolean
  drape: boolean
  neglect: number
  fallen: boolean
  flies: number
  lamp: boolean
  mood: Mood
}

export const MAX_HEAP = 6

const NEGLECT_AT = [0.05, 0.3, 0.55, 0.8] as const
const FLIES_AT = [0.75, 0.92] as const
const SICK_AT = 0.55

const CALM = {
  heap: 0,
  overflow: false,
  drape: false,
  neglect: 0,
  fallen: false,
  flies: 0,
  lamp: false,
} as const

export function ironParts(scene: SceneView): IronParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const neglect = reached(stink, NEGLECT_AT)
  const sick = stink >= SICK_AT
  if (state === 'clean') return { ...CALM, view: 'crisp', mood: 'happy' }
  if (state === 'running') {
    return { ...CALM, view: 'pressing', neglect, lamp: true, mood: sick ? 'worried' : 'happy' }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      view: 'cooling',
      neglect,
      fallen: neglect >= 3,
      flies: reached(stink, FLIES_AT),
      mood: sick ? 'sick' : neglect >= 1 ? 'worried' : 'calm',
    }
  }
  if (state === 'resting') {
    return { ...CALM, view: 'board', neglect, drape: neglect >= 2, mood: 'sleepy' }
  }
  if (state === 'due') {
    return {
      ...CALM,
      view: 'board',
      heap: MAX_HEAP,
      overflow: true,
      drape: true,
      neglect,
      flies: reached(stink, FLIES_AT),
      lamp: true,
      mood: sick ? 'sick' : 'pleading',
    }
  }
  const heap = Math.max(1, Math.min(MAX_HEAP - 1, Math.floor(fill * MAX_HEAP)))
  let mood: Mood = heap >= 4 ? 'worried' : 'calm'
  if (sick) mood = 'sick'
  return {
    ...CALM,
    view: 'board',
    heap,
    drape: neglect >= 2,
    neglect,
    flies: reached(stink, FLIES_AT),
    mood,
  }
}

interface IronColors {
  body: string
  dark: string
  light: string
  face: string
}

function ironColors(scene: SceneView): IronColors {
  const body = accentOf(scene, C.coral)
  return {
    body,
    dark: shadeOf(body, 0.3),
    light: tintOf(body, 0.42),
    face: isDarkColor(body) ? tintOf(body, 0.82) : mix(body, INK, 0.76),
  }
}

const BOARD_TOP = 118
const WHITE = mix(C.cream, '#ffffff', 0.55)
const SCORCH = '#8a5a33'
const CHAR = '#3f2a1e'
const SMOKE = '#d9dce6'
const WOOD = C.wicker

function zigzag(d: string, color: string, width = 2.6): Art {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`
}

function ironShell(colors: IronColors, lamp: boolean): Art {
  return [
    svg`<path d="M-14-37C-15-56-2-64 12-64H38Q49-64 49-53V-39" fill="none" stroke=${colors.dark} stroke-width="9" stroke-linecap="round" />`,
    svg`<path d="M4-64H38" stroke=${colors.light} stroke-width="9" stroke-linecap="round" />`,
    svg`<path d="M-54 0C-52-5-47-9-40-9H46Q53-9 53-3V0Z" fill=${C.metal} />`,
    svg`<path d="M-54 0C-53-2-52-3-50-4H53V0Z" fill=${C.metalDark} />`,
    svg`<path d="M-46-9C-36-29-14-41 12-41H38Q53-41 53-26V-9Z" fill=${colors.body} />`,
    svg`<path d="M-46-9C-45-11-44-13-43-15H53V-9Z" fill=${colors.dark} />`,
    svg`<path d="M-29-20C-22-29-11-34 0-36" fill="none" stroke=${colors.light} stroke-width="4.5" stroke-linecap="round" />`,
    part(
      'lamp',
      at(
        43,
        -33,
        lamp
          ? motion('pulse', svg`<circle r="3.4" fill=${C.sun} />`)
          : svg`<circle r="3.4" fill=${colors.dark} />`,
      ),
    ),
  ]
}

function ironFlat(x: number, scale: number, colors: IronColors, mood: Mood, lamp: boolean): Art {
  return part(
    'iron',
    at(x, BOARD_TOP, [ironShell(colors, lamp), face(13, -26, mood, colors.face, 0.92)], 0, scale),
  )
}

function ironUpright(x: number, scale: number, colors: IronColors, mood: Mood, lamp: boolean): Art {
  const y = BOARD_TOP - 53 * scale
  return part('iron', [
    at(x, y, ironShell(colors, lamp), 90, scale),
    face(x + 25 * scale, y + 22 * scale, mood, colors.face, 0.76 * scale),
  ])
}

function cord(from: number, colors: IronColors, y: number): Art {
  return part('cord', [
    svg`<path d=${`M${from} ${y}C${from + 12} ${y} 192 ${y + 14} 186 136S165 158 174 174`} fill="none" stroke=${colors.dark} stroke-width="3.6" stroke-linecap="round" />`,
    svg`<rect x="168" y="172" width="14" height="10" rx="3" fill=${C.metalDark} /><path d="M171 182v4M179 182v4" stroke=${C.metalMid} stroke-width="2.4" stroke-linecap="round" />`,
  ])
}

function board(neglect: number): Art {
  const flecks = [24, 46, 68, 90, 112, 134, 156]
  return part('board', [
    shadow(100, 183, 76),
    svg`<path d="M58 132L146 180M142 132L54 180" stroke=${C.metalDark} stroke-width="6.5" stroke-linecap="round" />`,
    svg`<circle cx="100" cy="156" r="5" fill=${C.metalMid} />`,
    svg`<rect x="44" y="176" width="22" height="7" rx="3.5" fill=${C.fly} /><rect x="134" y="176" width="22" height="7" rx="3.5" fill=${C.fly} />`,
    svg`<rect x="20" y="127" width="160" height="7" rx="3.5" fill=${C.metalMid} />`,
    svg`<rect x="10" y=${BOARD_TOP} width="180" height="13" rx="6.5" fill=${C.cream} />`,
    flecks.map(
      (x) =>
        svg`<rect x=${x} y=${BOARD_TOP + 5} width="12" height="3.4" rx="1.7" fill=${C.creamDark} />`,
    ),
    when(neglect >= 1, () =>
      fold('M178 120q3 2 0 4t0 5M150 120q-3 2 0 4t0 5M118 120q3 2 0 4t0 5', C.metalDark),
    ),
  ])
}

const RUMPLE_BODY =
  'M-28-10C-22-20-12-18-10-20L10-20C14-17 24-20 29-10C33-2 31 6 30 12C26 20 16 16 10 20C2 24-8 18-14 21C-22 23-29 18-30 10C-31 2-31-4-28-10Z'
const RUMPLE_LEFT = 'M-25-11L-49-5Q-54-1-51 5L-46 10L-24 6Z'
const RUMPLE_RIGHT = 'M25-7L45 8Q49 13 45 17L39 21L22 10Z'

function fold(d: string, color: string): Art {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width="2.8" stroke-linecap="round" />`
}

function rumple(
  x: number,
  y: number,
  color: string,
  rotate: number,
  scale: number,
  neglect: number,
): Art {
  const shade = shadeOf(color, 0.26)
  const light = tintOf(color, 0.62)
  return at(
    x,
    y,
    [
      svg`<path d=${RUMPLE_LEFT} fill=${shade} /><path d=${RUMPLE_RIGHT} fill=${shade} />`,
      svg`<path d="M-50-4L-45 10" stroke=${light} stroke-width="3.4" stroke-linecap="round" /><path d="M46 8L39 20" stroke=${light} stroke-width="3.4" stroke-linecap="round" />`,
      svg`<path d=${RUMPLE_BODY} fill=${color} />`,
      fold('M0-11C3-2-3 8 1 20', shade),
      [-3, 6, 14].map(
        (cy, i) => svg`<circle cx=${i === 1 ? 2.5 : 4.5} cy=${cy} r="1.8" fill=${light} />`,
      ),
      svg`<path d="M0-11L-12-23L-16-14L-6-4Z" fill=${light} /><path d="M0-11L12-23L16-14L6-4Z" fill=${light} />`,
      fold('M-23-5C-17-3-15 3-17 10', shade),
      fold('M23-7C16-4 13 2 15 9', shade),
      when(neglect >= 1, () => [
        zigzag('M-24 10l5-4 3 5 5-3', shade),
        zigzag('M23 11l-5-3-3 4-5-2', shade),
        zigzag('M-12-9l4 3-4 3', shade),
      ]),
    ],
    rotate,
    scale,
  )
}

type HeapPiece = readonly [number, number, string, number, number]

const HEAP: ReadonlyArray<readonly HeapPiece[]> = [
  [[62, 98, C.sky, -4, 0.9]],
  [[92, 102, C.sun, 4, 0.66]],
  [[56, 74, C.mint, 12, 0.8]],
  [[92, 72, C.pink, -10, 0.84]],
  [[60, 50, WHITE, -14, 0.82]],
  [[98, 44, C.lilac, 16, 0.74]],
]

function heapArt(step: number, neglect: number): Art {
  return HEAP.slice(0, step).map((pieces, i) =>
    part(
      'heap-step',
      pieces.map(([x, y, color, rotate, scale]) => rumple(x, y, color, rotate, scale, neglect)),
      i + 1,
    ),
  )
}

function topShirt(neglect: number): Art {
  return part('heap-top', at(70, 40, motion('wobble', rumple(0, -8, C.sun, -6, 0.68, neglect))))
}

const FOOTPRINT = 'M0-22C10-12 15 2 15 16Q15 20 11 20H-11Q-15 20-15 16C-15 2-10-12 0-22Z'

function scorchMark(x: number, y: number, rotate: number, deep: boolean, size = 1): Art {
  return part(
    'scorch',
    at(
      x,
      y,
      [
        svg`<path d=${FOOTPRINT} fill=${deep ? CHAR : SCORCH} />`,
        when(deep, () => svg`<path d=${FOOTPRINT} fill=${SCORCH} transform="scale(.74)" />`),
        [
          [0, -9],
          [-5, 0],
          [5, 0],
          [-6, 9],
          [6, 9],
          [0, 5],
        ].map(
          ([cx, cy]) =>
            svg`<circle cx=${cx} cy=${cy} r="1.7" fill=${deep ? CHAR : mix(SCORCH, WHITE, 0.45)} />`,
        ),
      ],
      rotate,
      size,
    ),
  )
}

function smokeCurl(x: number, y: number, scale: number, delay: number): Art {
  const d = 'M0 0c-9-6 9-12 0-19c-8-6 7-11 1-18c-4-4-10-1-7 4'
  return part(
    'smoke',
    at(
      x,
      y,
      motion(
        'waft',
        [
          svg`<path d=${d} fill="none" stroke=${INK} stroke-opacity=".55" stroke-width="8" stroke-linecap="round" />`,
          svg`<path d=${d} fill="none" stroke=${SMOKE} stroke-width="4.6" stroke-linecap="round" />`,
        ],
        delay,
      ),
      0,
      scale,
    ),
  )
}

function alarm(): Art {
  return part('alarm', [
    at(158, 28, [
      svg`<circle r="15" fill=${C.cream} /><circle r="10" fill=${C.creamDark} />`,
      motion('pulse', svg`<circle r="5" fill=${C.coralDark} />`),
    ]),
    (
      [
        [134, 28, 'M0-10q-6 10 0 20', 1],
        [182, 28, 'M0-10q6 10 0 20', 2],
      ] as const
    ).map(([x, y, d, delay]) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke=${C.coral} stroke-width="4" stroke-linecap="round" />`,
          delay,
        ),
      ),
    ),
  ])
}

function drape(neglect: number): Art {
  return part(
    'drape',
    at(60, 111, [
      at(0, 0, pressedShirt(WHITE, Math.min(2, neglect), false), 0, 0.82),
      when(neglect >= 2, () => scorchMark(0, 37, 10, neglect >= 4, 0.84)),
    ]),
  )
}

function neglectFx(smokeAt: readonly [number, number], neglect: number): Art {
  const [x, y] = smokeAt
  return [
    when(neglect >= 3, () => smokeCurl(x, y, 0.92, 1)),
    when(neglect >= 4, () => [smokeCurl(x + 20, y + 4, 0.7, 3), alarm()]),
  ]
}

const FLY_SPOTS = [
  [36, 26],
  [122, 28],
] as const

function flies(count: number): Art {
  return FLY_SPOTS.slice(0, count).map(([x, y], i) => fly(x, y, i))
}

function restBubbles(): Art {
  return part(
    'snooze',
    (
      [
        [146, 54, 4, 1],
        [156, 40, 6, 2],
        [170, 24, 8.5, 3],
      ] as const
    ).map(([x, y, r, delay]) =>
      at(x, y, motion('rise', svg`<circle r=${r} fill=${C.metalMid} opacity=".75" />`, delay)),
    ),
  )
}

function boardView(parts: IronParts, colors: IronColors): Art {
  const empty = parts.heap === 0
  const x = empty ? 96 : 128
  const scale = empty ? 1.12 : 1.02
  return [
    when(!empty || parts.drape, () => cord(x + 53 * scale, colors, BOARD_TOP - 20 * scale)),
    board(parts.neglect),
    heapArt(parts.heap, parts.neglect),
    when(parts.overflow, () => topShirt(parts.neglect)),
    ironFlat(x, scale, colors, parts.mood, parts.lamp),
    when(parts.drape, () => drape(parts.neglect)),
    when(parts.overflow, () =>
      part('spill', [
        rumple(134, 172, C.lilac, 6, 0.6, parts.neglect),
        rumple(100, 177, C.mint, -8, 0.46, parts.neglect),
      ]),
    ),
    when(parts.drape, () => neglectFx([62, 138], parts.neglect)),
    when(empty && !parts.drape, restBubbles),
    flies(parts.flies),
  ]
}

function puff(x: number, y: number, scale: number, delay: number, color: string): Art {
  return part(
    'steam',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<g fill=${color}><circle cx="-9" cy="3" r="8" /><circle cx="2" cy="-4" r="11" /><circle cx="12" cy="4" r="7.5" /><rect x="-16" y="3" width="34" height="9" rx="4.5" /></g>`,
        delay,
      ),
      0,
      scale,
    ),
  )
}

const CLOTH = C.sky

function clothOnBoard(neglect: number): Art {
  const shade = shadeOf(CLOTH, 0.28)
  const press = tintOf(CLOTH, 0.38)
  const light = tintOf(CLOTH, 0.68)
  return part('cloth', [
    svg`<path d="M14 122C13 112 20 104 27 110C31 100 41 100 45 110C51 103 59 105 64 113L96 114H174Q181 114 181 121V148Q181 154 174 154H70C62 160 54 150 46 156C38 162 30 152 22 156C16 158 14 152 14 146Z" fill=${CLOTH} />`,
    part('trail', svg`<path d="M66 134L96 122H181V146H96Z" fill=${press} />`),
    svg`<path d="M104 134H170" stroke=${WHITE} stroke-width="3" stroke-linecap="round" opacity=".9" />`,
    [118, 138, 158].map((x) => svg`<circle cx=${x} cy="141" r="2.4" fill=${light} />`),
    svg`<path d="M181 118L166 124L172 136L181 134Z" fill=${light} />`,
    fold('M23 117C28 122 28 128 23 134', shade),
    fold('M39 113C44 118 44 126 39 133', shade),
    fold('M55 118C60 123 60 129 55 135', shade),
    zigzag('M24 146l5-4 4 4 5-4', shade, 2.8),
    [
      [31, 137],
      [48, 142],
    ].map(([cx, cy]) => svg`<circle cx=${cx} cy=${cy} r="2.4" fill=${light} />`),
    when(neglect >= 1, () => [
      zigzag('M50 146l6-4 4 5', shade, 3),
      zigzag('M18 139l4 4-3 3', shade, 3),
    ]),
    when(neglect >= 2, () => scorchMark(38, 132, -14, neglect >= 4)),
  ])
}

function pressingView(parts: IronParts, colors: IronColors): Art {
  const steam = mix('#ffffff', C.metalDark, parts.neglect >= 3 ? 0.55 : 0)
  return [
    cord(158, colors, 96),
    board(parts.neglect),
    clothOnBoard(parts.neglect),
    motion('drift', ironFlat(110, 1.04, colors, parts.mood, true)),
    puff(50, 97, 0.72, 1, steam),
    puff(34, 72, 0.86, 2, steam),
    puff(56, 52, 0.66, 3, steam),
    puff(32, 38, 0.54, 4, steam),
    part('shine', [sparkle(172, 128, 0.62, 2), sparkle(176, 88, 0.5, 3)]),
    neglectFx([38, 118], parts.neglect),
  ]
}

const SHIRT_CUT =
  'M-10 0L-26 5Q-31 7-33 13L-42 44L-30 49L-23 27V70Q-23 74-19 74H19Q23 74 23 70V27L30 49L42 44L33 13Q31 7 26 5L10 0Z'

function pressedShirt(color: string, rumpled: number, pocket: boolean): Art {
  const shade = shadeOf(color, 0.2)
  const light = tintOf(color, 0.62)
  return [
    svg`<path d=${SHIRT_CUT} fill=${color} />`,
    svg`<path d="M-23 27V14M23 27V14" stroke=${shade} stroke-width="2.4" stroke-linecap="round" />`,
    svg`<path d="M0 10V74" stroke=${shade} stroke-width="2.4" />`,
    [22, 36, 50, 64].map((y) => svg`<circle cx="3.6" cy=${y} r="1.9" fill=${light} />`),
    when(
      pocket,
      () => svg`<path d="M-17 26H-6V37L-11.5 40L-17 37Z" fill=${shade} opacity=".55" />`,
    ),
    svg`<path d="M0 10L-11-2L-14 6L-6 15Z" fill=${light} /><path d="M0 10L11-2L14 6L6 15Z" fill=${light} />`,
    when(rumpled >= 1, () => [
      zigzag('M-17 46l6 4-5 4 6 4', shade),
      zigzag('M16 42l-6 4 5 4-6 4', shade),
    ]),
    when(rumpled >= 2, () => [
      zigzag('M-36 28l4 4-2 4', shade),
      zigzag('M36 28l-4 4 2 4', shade),
      zigzag('M9 22l5 3-4 3', shade),
    ]),
  ]
}

function hanger(shirtArt: Art | null): Art {
  return [
    svg`<path d="M0 12V3C8 3 7-8 0-8C-5-8-7-4-6-1" fill="none" stroke=${C.metalMid} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d="M-33 28L0 12L33 28" fill="none" stroke=${WOOD} stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`,
    shirtArt ? at(0, 15, shirtArt) : [],
  ]
}

const RAIL_Y = 24

function rail(right = 190): Art {
  return part('rail', [
    svg`<rect x="20" y="14" width="7" height="12" rx="2" fill=${C.metalDark} /><rect x=${right - 17} y="14" width="7" height="12" rx="2" fill=${C.metalDark} />`,
    svg`<rect x="10" y=${RAIL_Y - 3} width=${right - 10} height="6" rx="3" fill=${C.metalMid} />`,
  ])
}

function hung(
  x: number,
  scale: number,
  rotate: number,
  art: Art,
  index: number,
  delay: number,
): Art {
  return part('hanger', at(x, RAIL_Y, motion('sway', at(0, 0, art, rotate, scale), delay)), index)
}

function waitBubble(): Art {
  return part('pending', [
    svg`<path d="M154 50L150 62L166 52Z" fill=${C.cream} />`,
    svg`<rect x="146" y="28" width="42" height="26" rx="12" fill=${C.cream} />`,
    [0, 1, 2].map((i) =>
      at(157 + i * 10, 41, motion('pulse', svg`<circle r="3.2" fill=${C.metalDark} />`, i + 1)),
    ),
  ])
}

function heat(x: number, y: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'waft',
      svg`<path d="M0 0c-5-5 5-9 0-15c-5-5 5-9 0-15" fill="none" stroke=${C.sun} stroke-width="3.6" stroke-linecap="round" opacity=".85" />`,
      delay,
    ),
  )
}

function coolingView(parts: IronParts, colors: IronColors): Art {
  const { neglect } = parts
  const lean = neglect >= 2 ? -9 : 0
  return [
    rail(124),
    board(neglect),
    hung(40, 0.78, lean, hanger(pressedShirt(C.sky, neglect, true)), 0, 1),
    parts.fallen
      ? hung(96, 0.78, 14, hanger(null), 1, 2)
      : hung(96, 0.78, neglect >= 2 ? 7 : 0, hanger(pressedShirt(C.sun, neglect, false)), 1, 2),
    when(neglect === 0, () =>
      part('heat', [heat(68, 112, 1), heat(16, 112, 2), heat(122, 112, 3)]),
    ),
    ironUpright(130, 0.9, colors, parts.mood, false),
    waitBubble(),
    when(parts.fallen, () => part('fallen', rumple(96, 170, C.sun, -6, 0.74, neglect))),
    flies(parts.flies),
  ]
}

const CRISP_SPARKLES = [
  [18, 104, 0.8, 1],
  [182, 104, 0.9, 2],
  [70, 62, 0.55, 3],
  [131, 62, 0.55, 2],
  [156, 158, 0.75, 4],
  [40, 156, 0.95, 5],
] as const

function crispView(colors: IronColors): Art {
  const shirts: ReadonlyArray<readonly [number, string, boolean]> = [
    [39, C.lilac, true],
    [100, C.mint, false],
    [161, C.sun, true],
  ]
  return [
    rail(),
    board(0),
    shirts.map(([x, color, pocket], i) =>
      hung(x, 0.68, 0, hanger(pressedShirt(color, 0, pocket)), i, i + 1),
    ),
    ironFlat(100, 0.8, colors, 'happy', false),
    CRISP_SPARKLES.map(([x, y, size, delay]) => sparkle(x, y, size, delay)),
  ]
}

export function iron(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = ironParts(scene)
  const colors = ironColors(scene)
  const views: Record<IronView, () => Art> = {
    board: () => boardView(parts, colors),
    pressing: () => pressingView(parts, colors),
    cooling: () => coolingView(parts, colors),
    crisp: () => crispView(colors),
  }
  return frame('iron', scene, options, views[parts.view]())
}
