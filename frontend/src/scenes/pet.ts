import { nothing, svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  clamp01,
  COLORS as C,
  drop,
  face,
  fly,
  frame,
  mix,
  motion,
  part,
  reached,
  shadeOf,
  shadow,
  sparkle,
  variantOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type PetView =
  | 'curled'
  | 'watching'
  | 'begging'
  | 'sprawled'
  | 'pouring'
  | 'eating'
  | 'purring'

export interface PetParts {
  view: PetView
  level: number
  hunger: number
  scratches: number
  cup: boolean
  shreds: boolean
  dream: number
  worry: number
  flies: number
  grime: number
  mood: Mood
}

export const MAX_LEVEL = 5

const SCRATCH_AT = [0.05, 0.3, 0.6] as const
const DREAM_AT = [0.35, 0.7] as const
const WORRY_AT = [0.25, 0.55, 0.8] as const
const FLIES_AT = [0.45, 0.7, 0.92] as const
const CUP_AT = 0.2
const SHRED_AT = 0.6
const SPRAWL_AT = 0.5

export function petParts(scene: SceneView): PetParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const mess = {
    scratches: reached(stink, SCRATCH_AT),
    cup: stink >= CUP_AT,
    shreds: stink >= SHRED_AT,
    grime: reached(stink, WORRY_AT),
  }
  const calm = { hunger: 0, dream: 0, worry: 0, flies: 0 }
  if (state === 'clean') {
    return {
      view: 'purring',
      level: 1,
      ...calm,
      scratches: 0,
      cup: false,
      shreds: false,
      grime: 0,
      mood: 'happy',
    }
  }
  if (state === 'running') {
    return { view: 'pouring', level: 3, ...mess, ...calm, mood: 'happy' }
  }
  if (state === 'waiting') {
    return {
      view: 'eating',
      level: 2,
      ...mess,
      ...calm,
      flies: Math.min(1, reached(stink, FLIES_AT)),
      mood: stink >= SPRAWL_AT ? 'calm' : 'happy',
    }
  }
  if (state === 'resting') {
    return {
      view: 'curled',
      level: MAX_LEVEL,
      ...mess,
      ...calm,
      flies: Math.min(1, reached(stink, FLIES_AT)),
      mood: stink >= 0.7 ? 'sick' : 'sleepy',
    }
  }
  const due = state === 'due'
  const hunger = due ? MAX_LEVEL : Math.min(MAX_LEVEL - 1, Math.floor(fill * MAX_LEVEL))
  const flopped = stink >= SPRAWL_AT
  const worry = reached(stink, WORRY_AT)
  const dream = reached(stink, DREAM_AT) + (due ? 1 : 0)
  let mood: Mood = due ? 'pleading' : hunger >= 3 ? 'worried' : 'calm'
  if (flopped) mood = stink >= 0.75 ? 'sick' : 'worried'
  return {
    view: flopped ? 'sprawled' : due ? 'begging' : 'watching',
    level: MAX_LEVEL - hunger,
    hunger,
    ...mess,
    dream,
    worry,
    flies: reached(stink, FLIES_AT),
    mood,
  }
}

const FUR = '#f9a94e'
const FUR_DARK = '#dd8430'
const EAR = '#ff9fb0'
const NOSE = '#f0708a'
const INK_BROWN = '#43240f'
const KIBBLE = ['#c98345', '#a9652f', '#e3a767'] as const
const KIBBLE_BED = '#8a5226'
const BOWL_INSIDE = '#7a2f56'

const FLOOR_Y = 178

interface Coat {
  fur: string
  dark: string
}

interface Dish {
  body: string
  rim: string
  inside: string
  emblem: Art
}

function coatFor(grime: number): Coat {
  const t = grime * 0.13
  return { fur: mix(FUR, '#a89070', t), dark: mix(FUR_DARK, '#7d6a4f', t) }
}

function stroke(d: string, color: string, width: number): Art {
  return svg`<path d=${d} fill="none" stroke=${color} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`
}

const PILE: ReadonlyArray<readonly [number, ReadonlyArray<readonly [number, number]>]> = [
  [
    1,
    [
      [-15, -33],
      [-2, -32],
      [13, -33],
      [-8, -37],
      [6, -37],
    ],
  ],
  [
    2,
    [
      [-22, -36],
      [21, -36],
      [-14, -41],
      [0, -42],
      [14, -41],
    ],
  ],
  [
    3,
    [
      [-19, -45],
      [-7, -47],
      [7, -47],
      [19, -45],
    ],
  ],
  [
    4,
    [
      [-12, -52],
      [1, -53],
      [13, -51],
    ],
  ],
  [
    5,
    [
      [-6, -58],
      [6, -58],
      [0, -63],
    ],
  ],
]

function kibble(level: number): Art {
  if (level <= 0) return nothing
  const rx = 20 + Math.min(level, 3) * 2.8
  const ry = 3 + level * 6.2
  return part('kibble', [
    svg`<path d=${`M${-rx}-31A${rx} ${ry} 0 0 1 ${rx}-31Z`} fill=${KIBBLE_BED} />`,
    PILE.filter(([min]) => level >= min).map(([min, pieces]) =>
      part(
        'kibble-step',
        pieces.map(
          ([x, y], i) =>
            svg`<circle cx=${x} cy=${y} r="5.4" fill=${KIBBLE[(i + min) % KIBBLE.length]} />`,
        ),
        min,
      ),
    ),
  ])
}

function bowlBack(level: number, dish: Dish): Art {
  return [
    svg`<ellipse cx="0" cy="-32" rx="37" ry="9.5" fill=${dish.rim} />`,
    svg`<ellipse cx="0" cy="-32" rx="31" ry="6.5" fill=${dish.inside} />`,
    when(level === 0, () =>
      part('empty', [
        stroke('M-17-32q7-3 13-3', '#fff', 2.2),
        svg`<circle cx="9" cy="-30" r="1.8" fill=${KIBBLE[0]} /><circle cx="15" cy="-33" r="1.4" fill=${KIBBLE[1]} />`,
      ]),
    ),
    kibble(level),
  ]
}

function fishShape(color: string, shade: string): Art {
  return [
    svg`<path d="M-16 0C-8-11 8-11 14-2L24-10C26-3 26 3 24 10L14 2C8 11-8 11-16 0Z" fill=${color} />`,
    stroke('M-4-6q4 6 0 12', shade, 2.4),
    svg`<circle cx="-9" cy="-1.6" r="2.3" fill=${C.glass} />`,
  ]
}

function bowlFront(dish: Dish): Art {
  return [
    svg`<path d="M-37-32A37 9.5 0 0 0 37-32L30-5Q29 0 23 0H-23Q-29 0-30-5Z" fill=${dish.body} />`,
    stroke('M-35-29.5A36 9 0 0 0 35-29.5', dish.rim, 3.5),
    dish.emblem,
  ]
}

function bowl(level: number, dish: Dish): Art {
  return part('bowl', [bowlBack(level, dish), bowlFront(dish)], level)
}

function headShape(coat: Coat): Art {
  const ear = (flip: number): Art =>
    svg`<g transform=${`scale(${flip} 1)`}><path d="M12-22L33-46Q37-49 38-44L37-6Z" fill=${coat.fur} /><path d="M21-23L33-38Q34-39 34.5-37L34-15Z" fill=${EAR} /></g>`
  return [
    ear(-1),
    ear(1),
    svg`<ellipse rx="38" ry="30" fill=${coat.fur} />`,
    svg`<path d="M-34 0L-47 8L-38 10L-43 18L-26 22ZM34 0L47 8L38 10L43 18L26 22Z" fill=${coat.fur} />`,
  ]
}

function head(mood: Mood, coat: Coat, look = 0, size = 1, rim = false): Art {
  return part('head', [
    when(
      rim,
      () =>
        svg`<g opacity=".55">${at(-2, 2, svg`<ellipse rx="42" ry="34" fill=${coat.dark} /><path d="M-41-4L-37-49L-6-30ZM41-4L37-49L6-30Z" fill=${coat.dark} />`)}</g>`,
    ),
    headShape(coat),
    at(look * 0.5, 0, stroke('M-9-29V-20M0-30V-18M9-29V-20', coat.dark, 4.4)),
    at(look, 0, [
      svg`<ellipse cx="-24" cy="10" rx="6.5" ry="4" fill=${C.pink} opacity=".55" /><ellipse cx="24" cy="10" rx="6.5" ry="4" fill=${C.pink} opacity=".55" />`,
      stroke('M-28 4L-47 0M-28 11L-46 13M28 4L47 0M28 11L46 13', C.cream, 2),
      face(0, -3, mood, INK_BROWN, size),
      svg`<path d="M-3.2 3H3.2Q4.2 3 3.6 3.9L.8 6.6Q0 7.2-.8 6.6L-3.6 3.9Q-4.2 3-3.2 3Z" fill=${NOSE} />`,
    ]),
  ])
}

function tail(
  coat: Coat,
  d: string,
  bands: ReadonlyArray<readonly [number, number]>,
  tip: string,
  across = false,
): Art {
  const band = ([x, y]: readonly [number, number]): string =>
    across ? `M${x} ${y - 4.5}v9` : `M${x - 4.5} ${y}h9`
  return part('tail', [
    stroke(d, coat.fur, 13),
    stroke(bands.map(band).join(''), coat.dark, 4.6),
    stroke(tip, coat.dark, 13),
  ])
}

function sittingBody(coat: Coat, wide = false): Art {
  const shape = wide
    ? 'M-48-4C-60-42-32-74 0-74C32-74 60-42 48-4Q46 0 38 0H-38Q-46 0-48-4Z'
    : 'M-36-4C-44-36-26-74 0-74C26-74 44-36 36-4Q34 0 28 0H-28Q-34 0-36-4Z'
  return [
    svg`<path d=${shape} fill=${coat.fur} />`,
    svg`<ellipse cx="0" cy=${wide ? -30 : -28} rx=${wide ? 35 : 21} ry=${wide ? 27 : 25} fill=${C.cream} />`,
    svg`<ellipse cx="0" cy="-60" rx="27" ry="6.5" fill=${coat.dark} opacity=".5" />`,
    stroke(
      wide ? 'M-49-34h7M-52-22h8M49-34h-7M52-22h-8' : 'M-35-34h6M-37-22h7M35-34h-6M37-22h-7',
      coat.dark,
      4,
    ),
  ]
}

function pawPair(coat: Coat, spread = 12): Art {
  const paw = (x: number): Art => [
    svg`<rect x=${x - 9.5} y="-15" width="19" height="16" rx="8" fill=${coat.fur} />`,
    stroke(`M${x - 3}-4v-4M${x + 3}-4v-4`, coat.dark, 2),
  ]
  return part('paws', [paw(-spread), paw(spread)])
}

function dreamBubble(
  x: number,
  y: number,
  step: number,
  tailTo: readonly [number, number],
  wish: Art,
): Art {
  if (step <= 0) return nothing
  const r = [0, 17, 22, 28][step] ?? 28
  const [tx, ty] = tailTo
  const dots = [
    [tx, ty, 3.5],
    [tx + (x - tx) * 0.38, ty + (y - ty) * 0.38, 5.5],
  ] as const
  return part(
    'dream',
    [
      dots.map(([dx, dy, dr]) => svg`<circle cx=${dx} cy=${dy} r=${dr} fill=${C.cream} />`),
      at(
        x,
        y,
        motion('pulse', [svg`<circle r=${r} fill=${C.cream} />`, at(-2, 0, wish, 0, r / 29)]),
      ),
    ],
    step,
  )
}

function claws(x: number, y: number, rotate: number, scale: number, index: number): Art {
  return part(
    'scratch',
    at(x, y, stroke('M0 0L5 30M10-4L16 34M21-2L26 28M31 3L35 24', C.cream, 3.4), rotate, scale),
    index,
  )
}

function scratchMarks(
  spots: ReadonlyArray<readonly [number, number, number, number]>,
  n: number,
): Art {
  return spots
    .slice(0, n)
    .map(([x, y, r, s], i) => svg`<g opacity=".42">${claws(x, y, r, s, i)}</g>`)
}

function cup(x: number, y: number, flip = 1): Art {
  return part(
    'cup',
    at(x, y, [
      svg`<ellipse cx=${flip * 20} cy="5" rx="18" ry="4.2" fill=${C.cream} />`,
      at(
        0,
        -7,
        [
          svg`<path d="M-11-10H11V6Q11 11 6 11H-6Q-11 11-11 6Z" fill=${C.lilac} />`,
          stroke('M11-5Q19-5 18 1T11 6', C.lilacDark, 3.6),
          svg`<ellipse cx="0" cy="-10" rx="11" ry="3" fill=${C.lilacDark} />`,
        ],
        flip * 96,
      ),
    ]),
  )
}

function shreds(spots: ReadonlyArray<readonly [number, number, number]>): Art {
  const colors = [C.cream, C.coral, C.creamDark, C.sun] as const
  return part(
    'shreds',
    spots.map(([x, y, r], i) =>
      at(
        x,
        y,
        svg`<path d="M-7-3L-2-5L1-2L7-4L5 3L0 2L-5 5Z" fill=${colors[i % colors.length]} />`,
        r,
      ),
    ),
  )
}

function worryMarks(spots: ReadonlyArray<readonly [number, number, number]>, n: number): Art {
  return spots
    .slice(0, n)
    .map(([x, y, r], i) =>
      part('worry', at(x, y, motion('drip', drop(0, 0, C.water, 1.05), i + 1), r), i),
    )
}

function scribble(x: number, y: number): Art {
  return part(
    'scribble',
    at(
      x,
      y,
      motion(
        'wobble',
        stroke('M-13 0C-13-11 10-13 12-3C14 8-9 10-8 0C-7-8 7-8 6 0C5 5-3 5-2 0', C.glass, 3.2),
      ),
    ),
  )
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return part('zzz', at(x, y, motion('rise', stroke('M-7-7H7L-7 7H7', C.cream, 4), delay), 0, size))
}

function heart(x: number, y: number, size: number, color: string, delay: number): Art {
  return part(
    'heart',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<path d="M0 11C-16-1-11-11-5-11C-2-11 0-8 0-6C0-8 2-11 5-11C11-11 16-1 0 11Z" fill=${color} />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function curled(parts: PetParts, coat: Coat, dish: Dish): Art {
  return [
    shadow(84, 183, 64),
    part('cushion', [
      svg`<ellipse cx="78" cy="170" rx="62" ry="13" fill=${C.lilacDark} />`,
      svg`<ellipse cx="78" cy="165" rx="60" ry="11" fill=${C.lilac} />`,
    ]),
    part('cat', [
      at(
        78,
        165,
        motion(
          'throb',
          at(-78, -165, [
            svg`<path d="M22 150C22 112 56 100 86 102C118 104 134 124 132 150C131 164 120 168 100 168H42C28 168 22 162 22 150Z" fill=${coat.fur} />`,
            stroke('M46 113q2 8 0 15M62 106q2 9 0 17', coat.dark, 5),
          ]),
        ),
      ),
    ]),
    at(100, 139, head(parts.mood, coat, 0, 0.92, true), 7, 0.86),
    part('cat-tail', [
      stroke('M30 158C42 176 88 176 104 165', coat.dark, 16),
      tail(
        coat,
        'M30 158C42 176 88 176 104 165',
        [
          [50, 170.5],
          [68, 172.5],
          [85, 171],
        ],
        'M102 166.5l2-1.5',
        true,
      ),
    ]),
    at(166, 182, bowl(MAX_LEVEL, dish), 0, 0.68),
    zed(140, 96, 0.8, 1),
    zed(156, 72, 1.05, 2),
    zed(173, 44, 1.35, 3),
  ]
}

function watching(parts: PetParts, coat: Coat, dish: Dish): Art {
  const lean = parts.hunger * 3
  const shift = parts.hunger * 2.2
  const spot = (i: number): boolean => parts.hunger >= i
  return [
    shadow(112, 183, 80),
    part(
      'cat',
      at(72, FLOOR_Y, [
        at(
          -26,
          -8,
          motion(
            'sway',
            tail(
              coat,
              'M0 2C-28 4-30-30-16-44',
              [
                [-22, -9],
                [-24, -25],
              ],
              'M-17-42l.5-1',
            ),
          ),
        ),
        sittingBody(coat),
        pawPair(coat),
        at(shift, -88, head(parts.mood, coat, 3 + parts.hunger * 1.4), lean),
      ]),
    ),
    at(150, 182, bowl(parts.level, dish)),
    when(spot(3), () =>
      part('gaze', [
        motion('flicker', stroke('M134 126l-3-7', C.spark, 4), 1),
        motion('flicker', stroke('M150 121v-8', C.spark, 4), 2),
        motion('flicker', stroke('M166 126l3-7', C.spark, 4), 3),
      ]),
    ),
    when(spot(4), () => part('drool', at(100, 109, motion('drip', drop(0, 0, C.water, 0.72), 2)))),
  ]
}

function begging(parts: PetParts, coat: Coat, dish: Dish): Art {
  return [
    shadow(100, 183, 56),
    part(
      'cat',
      motion(
        'bob',
        at(100, FLOOR_Y, [
          at(
            -28,
            -8,
            motion(
              'sway',
              tail(
                coat,
                'M0 2C-30 6-38-30-22-48',
                [
                  [-26, -9],
                  [-30, -27],
                ],
                'M-23-46l.5-1',
              ),
            ),
          ),
          sittingBody(coat),
          svg`<ellipse cx="-24" cy="-5" rx="13" ry="7" fill=${coat.fur} /><ellipse cx="24" cy="-5" rx="13" ry="7" fill=${coat.fur} />`,
          at(0, -86, head(parts.mood, coat, 0, 1.16)),
          at(0, -12, bowl(0, dish), -4, 0.9),
          part('paws', [
            svg`<ellipse cx="-33" cy="-37" rx="10" ry="12" fill=${coat.fur} /><ellipse cx="33" cy="-37" rx="10" ry="12" fill=${coat.fur} />`,
            stroke('M-36-45v5M-30-45v5M36-45v5M30-45v5', coat.dark, 2.2),
          ]),
        ]),
      ),
    ),
    part('meow', [motion('flicker', stroke('M44 92q-8 8-1 18M32 86q-12 14-2 30', C.cream, 4), 1)]),
  ]
}

function sprawled(parts: PetParts, coat: Coat, dish: Dish): Art {
  return [
    shadow(92, 183, 80),
    at(168, 182, bowl(0, dish), 0, 0.62),
    part('cat', [
      at(
        134,
        158,
        motion('wobble', [
          stroke('M0 0L14-38', coat.fur, 14),
          stroke('M14-38l.1-.1', coat.dark, 16),
        ]),
      ),
      at(
        120,
        154,
        motion(
          'wobble',
          [stroke('M0 0L4-42', coat.fur, 14), stroke('M4-42l.01-.1', coat.dark, 16)],
          2,
        ),
      ),
      svg`<path d="M60 150C62 130 96 126 122 132C146 138 152 158 142 170Q138 176 128 176H78C62 176 58 164 60 150Z" fill=${coat.fur} />`,
      svg`<ellipse cx="102" cy="150" rx="33" ry="13" fill=${C.cream} transform="rotate(5 102 150)" />`,
      tail(coat, 'M138 170C154 176 150 186 128 185', [[146, 181]], 'M129 185l-1 0', true),
      stroke('M72 168C72 176 66 180 60 183', coat.fur, 13),
      stroke('M60 183l-.1 0', coat.dark, 14),
      at(50, 141, head(parts.mood, coat, 0, 1, true), -16, 0.82),
    ]),
    worryMarks(
      [
        [90, 118, -25],
        [13, 124, 25],
        [74, 100, -12],
      ],
      parts.worry,
    ),
    when(parts.worry >= 3, () => scribble(40, 88)),
  ]
}

function scoop(): Art {
  return part('scoop', [
    at(
      165,
      60,
      [
        stroke('M26-12L46-22', C.metalDark, 10),
        svg`<path d="M-26-22H26V8Q26 18 16 18H-16Q-26 18-26 8Z" fill=${C.metal} />`,
        svg`<rect x="-30" y="-27" width="60" height="10" rx="5" fill=${C.metalMid} />`,
        stroke('M-14 6V-8', '#fff', 4),
      ],
      -48,
      0.76,
    ),
  ])
}

const POUR = [
  [136, 82, 1],
  [146, 92, 3],
  [141, 76, 2],
  [138, 112, 4],
  [152, 114, 5],
  [148, 72, 4],
] as const

function pouring(parts: PetParts, coat: Coat, dish: Dish): Art {
  return [
    shadow(72, 183, 40, 0.2),
    shadow(150, 183, 40),
    part(
      'cat',
      motion(
        'bob',
        at(70, FLOOR_Y - 20, [
          at(
            -26,
            -8,
            motion(
              'wobble',
              tail(
                coat,
                'M0 2C-26 2-34-30-20-50',
                [
                  [-21, -9],
                  [-26, -28],
                ],
                'M-21-48l.5-1',
              ),
            ),
          ),
          svg`<ellipse cx="-20" cy="0" rx="11" ry="9" fill=${coat.fur} /><ellipse cx="20" cy="0" rx="11" ry="9" fill=${coat.fur} />`,
          sittingBody(coat),
          stroke('M-27-50C-52-58-58-88-52-110', coat.fur, 14),
          stroke('M27-50C52-58 58-88 52-110', coat.fur, 14),
          stroke('M-52-110v-.1', coat.dark, 15),
          stroke('M52-110v-.1', coat.dark, 15),
          at(3, -88, head(parts.mood, coat, 4), 6),
        ]),
      ),
    ),
    part('hop', [motion('flicker', stroke('M46 175l-3 6M72 177v6M98 175l3 6', C.cream, 4), 1)]),
    at(150, 182, bowl(parts.level, dish)),
    part(
      'pour',
      POUR.map(([x, y, d], i) =>
        at(x, y, motion('fall', svg`<circle r="5.4" fill=${KIBBLE[i % KIBBLE.length]} />`, d)),
      ),
    ),
    scoop(),
  ]
}

const CRUMBS = [
  [128, 108, 1, 3.4],
  [176, 112, 3, 4],
  [186, 148, 2, 3],
  [112, 176, 4, 3.4],
  [186, 182, 5, 2.8],
  [120, 186, 2, 2.4],
] as const

function eating(parts: PetParts, coat: Coat, dish: Dish): Art {
  return [
    shadow(112, 183, 80),
    part('crumbs-floor', [
      svg`<circle cx="104" cy="181" r="3" fill=${KIBBLE[0]} /><circle cx="184" cy="178" r="3.4" fill=${KIBBLE[2]} /><circle cx="187" cy="186" r="2.6" fill=${KIBBLE[1]} />`,
    ]),
    part('cat', [
      at(
        64,
        FLOOR_Y,
        [
          at(
            -26,
            -8,
            motion(
              'sway',
              tail(
                coat,
                'M0 2C-22 4-30-26-14-46',
                [
                  [-18, -9],
                  [-22, -26],
                ],
                'M-15-44l.5-1',
              ),
            ),
          ),
          sittingBody(coat),
          pawPair(coat),
        ],
        8,
      ),
    ]),
    at(148, 182, bowlBack(parts.level, dish)),
    at(
      120,
      120,
      motion('bob', [
        stroke('M-42-6L-14 0', coat.fur, 34),
        at(0, 0, head(parts.mood, coat, 5, 1, true), 15),
      ]),
    ),
    at(148, 182, part('bowl', bowlFront(dish))),
    part(
      'crumbs',
      CRUMBS.map(([x, y, d, r], i) =>
        at(x, y, motion('drip', svg`<circle r=${r} fill=${KIBBLE[i % KIBBLE.length]} />`, d)),
      ),
    ),
  ]
}

function purring(parts: PetParts, coat: Coat, dish: Dish): Art {
  return [
    shadow(86, 183, 64),
    part('cat', [
      at(86, FLOOR_Y, [
        at(
          -40,
          -10,
          motion(
            'sway',
            tail(
              coat,
              'M0 2C-26 6-34-22-20-38',
              [
                [-20, -6],
                [-25, -21],
              ],
              'M-21-36l.5-1',
            ),
          ),
        ),
        motion('rumble', [
          sittingBody(coat, true),
          svg`<ellipse cx="-30" cy="-4" rx="14" ry="7" fill=${coat.fur} /><ellipse cx="30" cy="-4" rx="14" ry="7" fill=${coat.fur} />`,
          part('tummy-paw', [
            stroke('M38-48C30-36 20-30 8-30', coat.fur, 13),
            stroke('M4-34v8M9-35v9', coat.dark, 2.2),
          ]),
          at(0, -88, [
            head(parts.mood, coat),
            part('tongue', svg`<path d="M-1 9q5 8 9 1Z" fill=${NOSE} />`),
          ]),
        ]),
      ]),
    ]),
    part('purr', [
      motion('flicker', stroke('M32 84q-7 10 0 20M22 78q-10 16 0 32', C.cream, 3.6), 1),
    ]),
    at(166, 182, bowl(parts.level, dish), 0, 0.62),
    heart(150, 92, 1, C.coral, 1),
    heart(172, 66, 0.75, C.pink, 3),
    heart(142, 42, 0.62, C.pink, 2),
    sparkle(26, 50, 1.2, 1),
    sparkle(180, 126, 0.8, 2),
    sparkle(16, 146, 0.7, 3),
    sparkle(118, 22, 0.85, 4),
  ]
}

const WALL_SCRATCH: Record<PetView, ReadonlyArray<readonly [number, number, number, number]>> = {
  curled: [
    [28, 40, -8, 1],
    [84, 26, 6, 0.85],
    [40, 92, 10, 0.75],
  ],
  watching: [
    [134, 30, 6, 1],
    [22, 22, -8, 0.8],
    [160, 80, -10, 0.72],
  ],
  begging: [
    [14, 24, -8, 0.82],
    [150, 96, 8, 0.85],
    [160, 20, 0, 0.6],
  ],
  sprawled: [
    [16, 24, -8, 1],
    [158, 64, 8, 0.85],
    [64, 44, 4, 0.72],
  ],
  pouring: [
    [18, 28, -8, 0.8],
    [170, 104, 10, 0.72],
    [100, 22, 4, 0.62],
  ],
  eating: [
    [150, 34, 6, 1],
    [22, 22, -8, 0.8],
    [100, 26, 10, 0.72],
  ],
  purring: [],
}

const CUP_SPOT: Record<PetView, readonly [number, number, number]> = {
  curled: [120, 180, -1],
  watching: [24, 180, 1],
  begging: [160, 180, -1],
  sprawled: [26, 180, 1],
  pouring: [18, 180, 1],
  eating: [22, 180, 1],
  purring: [0, 0, 1],
}

const SHRED_SPOTS: Record<PetView, ReadonlyArray<readonly [number, number, number]>> = {
  curled: [
    [18, 178, 10],
    [150, 174, 40],
    [32, 186, 80],
  ],
  watching: [
    [108, 186, 20],
    [14, 170, -30],
    [52, 186, 60],
  ],
  begging: [
    [28, 180, 20],
    [46, 188, -30],
    [176, 170, 60],
  ],
  sprawled: [
    [104, 186, 20],
    [84, 184, -40],
    [150, 188, 70],
  ],
  pouring: [
    [104, 178, 20],
    [116, 187, 70],
    [90, 187, -30],
  ],
  eating: [
    [92, 186, 20],
    [40, 186, 70],
    [14, 168, -30],
  ],
  purring: [],
}

const FLY_SPOTS: Record<PetView, ReadonlyArray<readonly [number, number]>> = {
  curled: [[116, 84]],
  watching: [
    [178, 124],
    [126, 74],
    [176, 50],
  ],
  begging: [
    [40, 130],
    [160, 128],
    [150, 60],
  ],
  sprawled: [
    [172, 134],
    [168, 92],
    [78, 60],
  ],
  pouring: [],
  eating: [[172, 66]],
  purring: [],
}

const DREAM_SPOT: Record<PetView, readonly [readonly [number, number], readonly [number, number]]> =
  {
    curled: [
      [0, 0],
      [0, 0],
    ],
    watching: [
      [150, 58],
      [114, 76],
    ],
    begging: [
      [160, 44],
      [134, 74],
    ],
    sprawled: [
      [124, 58],
      [96, 104],
    ],
    pouring: [
      [0, 0],
      [0, 0],
    ],
    eating: [
      [0, 0],
      [0, 0],
    ],
    purring: [
      [0, 0],
      [0, 0],
    ],
  }

const DOG_FUR = '#f5e3c5'
const DOG_SHADE = '#dfc091'
const DOG_EAR = '#a9673a'
const DOG_EAR_DARK = '#8a5029'
const DOG_PATCH = '#cf9159'
const DOG_MUZZLE = '#fffaf0'
const DOG_NOSE = '#33211a'
const DOG_MOUTH = '#7a2f40'
const TONGUE = '#ff8a9e'
const MUD = '#c98a52'
const SLIPPER = C.coral
const SLIPPER_DARK = C.coralDark

interface DogCoat extends Coat {
  ear: string
  earDark: string
  patch: string
  muzzle: string
}

function dogCoatFor(grime: number): DogCoat {
  const t = grime * 0.13
  const dingy = (color: string): string => mix(color, '#a89070', t)
  return {
    fur: dingy(DOG_FUR),
    dark: dingy(DOG_SHADE),
    ear: mix(DOG_EAR, '#7d6a4f', t),
    earDark: mix(DOG_EAR_DARK, '#7d6a4f', t),
    patch: dingy(DOG_PATCH),
    muzzle: dingy(DOG_MUZZLE),
  }
}

function dogDish(paint: Omit<Dish, 'emblem'>): Dish {
  return { ...paint, emblem: at(0, -14, boneShape(C.cream, C.creamDark), -16, 0.5) }
}

function boneShape(color: string, shade: string): Art {
  const knob = (x: number, y: number): Art => svg`<circle cx=${x} cy=${y} r="7.5" fill=${color} />`
  return [
    knob(-17, -6.5),
    knob(-17, 6.5),
    knob(17, -6.5),
    knob(17, 6.5),
    svg`<rect x="-18" y="-6.5" width="36" height="13" fill=${color} />`,
    stroke('M-10-1H10', shade, 2.6),
  ]
}

function mirrored(art: Art): Art {
  return svg`<g transform="scale(-1 1)">${art}</g>`
}

function dogEyes(mood: Mood, size: number): Art {
  const ink = INK_BROWN
  const both = (art: Art): Art => [at(-15, -8, art, 0, size), at(15, -8, art, 0, size)]
  const dot = (r: number, glint: number): Art => [
    svg`<circle r=${r} fill=${ink} />`,
    svg`<circle cx=${r * 0.34} cy=${-r * 0.36} r=${glint} fill="#fff" />`,
  ]
  const eyes: Record<Mood, Art> = {
    happy: both(stroke('M-7 2.5q7-9 14 0', ink, 3.6)),
    sleepy: both(stroke('M-7-1q7 6 14 0', ink, 3.4)),
    calm: both(dot(4.4, 1.5)),
    worried: [both(dot(4.4, 1.5)), stroke('M-24-18L-11-23M24-18L11-23', ink, 3.2)],
    pleading: [both(dot(6.8, 2.5)), stroke('M-24-22L-12-26M24-22L12-26', ink, 3)],
    sick: both(stroke('M-5.5-5.5l11 11m0-11l-11 11', ink, 3.4)),
  }
  return part('eyes', eyes[mood])
}

function dogMouth(mood: Mood, pant: boolean): Art {
  const ink = INK_BROWN
  const tongue = (x: number, length: number): Art => [
    svg`<path d=${`M${x - 6} 17H${x + 6}V${17 + length}a6 6 0 0 1-12 0Z`} fill=${TONGUE} />`,
    stroke(`M${x} 18.5v${length}`, NOSE, 1.6),
  ]
  const smile = stroke('M-13 14q6.5 6.5 13 0q6.5 6.5 13 0', ink, 3)
  const mouths: Record<Mood, Art> = {
    happy: [
      svg`<path d="M-13 13.5Q0 19 13 13.5C13 30-13 30-13 13.5Z" fill=${DOG_MOUTH} />`,
      tongue(0, 11),
      stroke('M-14 13.5Q0 19 14 13.5', ink, 3),
    ],
    calm: smile,
    sleepy: stroke('M-9 15q4.5 3.5 9 0q4.5 3.5 9 0', ink, 2.8),
    worried: stroke('M-11 19q4-5 7.5-1.5t7.5 0t7-1.5', ink, 3),
    pleading: [tongue(0, 3), stroke('M-10 15q5 5.5 10 0q5 5.5 10 0', ink, 3)],
    sick: [tongue(6, 8), stroke('M-12 18q4-5 8-1.5t8-.5t8-2', ink, 3)],
  }
  const panting = pant && (mood === 'calm' || mood === 'worried')
  return panting ? [tongue(5, 8), smile] : mouths[mood]
}

const DOG_SKULL = 'M-37-5C-37-27-21-36 0-36C21-36 37-27 37-5C37 17 22 30 0 30C-22 30-37 17-37-5Z'
const DOG_FLOP = 'M16-34C35-43 53-31 57-8C60 12 54 32 45 33C34 34 33 17 32 5C31-9 27-23 16-34Z'

interface DogHeadOptions {
  look?: number
  size?: number
  pant?: boolean
  rim?: boolean
  splay?: number
}

function dogEar(coat: DogCoat, splay: number): Art {
  const tilt = splay ? ` rotate(${splay} 22 -30)` : ''
  return svg`<g transform=${`scale(1 1)${tilt}`}><path d=${DOG_FLOP} fill=${coat.ear} /><path d="M45-9C48 8 47 20 44 27" fill="none" stroke=${coat.earDark} stroke-width="4" stroke-linecap="round" /></g>`
}

function dogHead(mood: Mood, coat: DogCoat, options: DogHeadOptions = {}): Art {
  const { look = 0, size = 1, pant = false, rim = false, splay = 0 } = options
  return part('head', [
    when(
      rim,
      () =>
        svg`<g opacity=".7">${at(-1.5, 2, svg`<path d=${DOG_SKULL} fill=${coat.dark} transform="scale(1.09)" />`)}</g>`,
    ),
    svg`<path d=${DOG_SKULL} fill=${coat.fur} />`,
    svg`<path d="M7-35.4C23-34 35.5-25 36.8-8C37 2 30 8 21 8C11 8 5-3 5-15C5-23 5-31 7-35.4Z" fill=${coat.patch} />`,
    at(look, 0, [
      svg`<ellipse cy="14" rx="23" ry="15.5" fill=${coat.muzzle} />`,
      dogEyes(mood, size),
      svg`<path d="M-9 1C-9-2-5-3.4 0-3.4C5-3.4 9-2 9 1C9 5 3 9.4 0 9.4C-3 9.4-9 5-9 1Z" fill=${DOG_NOSE} />`,
      svg`<ellipse cx="-3.4" cy="-.6" rx="2.6" ry="1.4" fill="#fff" opacity=".65" />`,
      stroke('M0 9V14', INK_BROWN, 2.6),
      dogMouth(mood, pant),
    ]),
    dogEar(coat, splay),
    mirrored(dogEar(coat, splay)),
  ])
}

function dogTail(coat: DogCoat): Art {
  return part('tail', [
    svg`<path d="M7 4C-12 6-31-10-34-38C-35-47-25-49-23-40C-20-25-8-15 8-11Z" fill=${coat.fur} />`,
    svg`<path d="M-33.9-37C-35.2-47-25-49-23-40L-22-35.4Z" fill=${coat.ear} />`,
  ])
}

function wagMarks(x: number, y: number, flip = 1): Art {
  return part(
    'wag',
    at(
      x,
      y,
      motion(
        'flicker',
        stroke(
          `M${flip * -8}-16q${flip * -9} 12-2 26M${flip * -18}-24q${flip * -13} 19-3 40`,
          C.cream,
          3.6,
        ),
        2,
      ),
    ),
  )
}

function dogCollar(dish: Dish, y = 0): Art {
  return part(
    'collar',
    at(0, y, [
      stroke('M-24-67Q0-53 24-67', dish.rim, 11),
      stroke('M-24-67Q0-53 24-67', dish.body, 7.5),
      svg`<circle cy="-54" r="7" fill=${C.sunDark} />`,
      svg`<circle cy="-54.8" r="5" fill=${C.sun} />`,
    ]),
  )
}

function dogPaw(coat: DogCoat, x: number): Art {
  return [
    svg`<ellipse cx=${x} cy="-5.5" rx="12" ry="7" fill=${coat.fur} />`,
    stroke(`M${x - 3.5}-8v4M${x + 3.5}-8v4`, coat.dark, 2.2),
  ]
}

function dogSitting(coat: DogCoat): Art {
  return part('body', [
    svg`<ellipse cx="-30" cy="-22" rx="18" ry="23" fill=${coat.dark} /><ellipse cx="30" cy="-22" rx="18" ry="23" fill=${coat.dark} />`,
    svg`<ellipse cx="-36" cy="-6" rx="15" ry="7" fill=${coat.fur} /><ellipse cx="36" cy="-6" rx="15" ry="7" fill=${coat.fur} />`,
    svg`<path d="M-26-4C-33-34-27-72 0-76C27-72 33-34 26-4Q25 0 20 0H-20Q-25 0-26-4Z" fill=${coat.fur} />`,
    svg`<path d="M16-73C26-70 31-56 31-42C24-36 14-40 12-52C11-60 12-68 16-73Z" fill=${coat.ear} opacity=".92" />`,
    svg`<ellipse cy="-46" rx="14" ry="14" fill=${coat.muzzle} />`,
    stroke('M0-28V-5M-23-32C-24-24-24-16-23-9M23-32C24-24 24-16 23-9', coat.dark, 3),
    dogPaw(coat, -12),
    dogPaw(coat, 12),
  ])
}

function dogCurled(parts: PetParts, coat: DogCoat, dish: Dish): Art {
  return [
    shadow(80, 183, 66),
    part('cushion', [
      svg`<ellipse cx="74" cy="170" rx="64" ry="13" fill=${C.lilacDark} />`,
      svg`<ellipse cx="74" cy="165" rx="62" ry="11" fill=${C.lilac} />`,
    ]),
    part('dog', [
      at(
        70,
        165,
        motion(
          'throb',
          at(-70, -165, [
            svg`<path d="M20 156C16 122 46 104 76 106C106 108 122 126 122 156C122 168 110 170 92 170H42C28 170 22 166 20 156Z" fill=${coat.fur} />`,
            svg`<path d="M38 114C50 105 72 104 86 110C88 124 74 134 58 132C46 130 38 124 38 114Z" fill=${coat.ear} />`,
            svg`<ellipse cx="42" cy="152" rx="20" ry="17" fill=${coat.dark} />`,
          ]),
        ),
      ),
      part('tail', [
        stroke('M22 160C14 176 44 180 66 175', coat.fur, 11),
        stroke('M60 176.4l6-1.4', coat.ear, 11),
      ]),
      part('paws', [
        svg`<ellipse cx="86" cy="167" rx="15" ry="7.5" fill=${coat.fur} /><ellipse cx="124" cy="168" rx="15" ry="7.5" fill=${coat.fur} />`,
        stroke('M81 165v4M88 165v4M130 166v4M123 166v4', coat.dark, 2.2),
      ]),
      at(104, 137, dogHead(parts.mood, coat, { size: 0.95, rim: true }), 5, 0.86),
    ]),
    at(168, 182, bowl(MAX_LEVEL, dish), 0, 0.58),
    zed(140, 96, 0.8, 1),
    zed(156, 72, 1.05, 2),
    zed(173, 44, 1.35, 3),
  ]
}

function dogWatching(parts: PetParts, coat: DogCoat, dish: Dish): Art {
  const tilt = 6 + parts.hunger * 2.4
  const shift = parts.hunger * 1.8
  const spot = (i: number): boolean => parts.hunger >= i
  const look = 3 + parts.hunger * 1.2
  return [
    shadow(112, 183, 80),
    part(
      'dog',
      at(68, FLOOR_Y, [
        at(-24, -14, motion('wobble', dogTail(coat))),
        dogSitting(coat),
        dogCollar(dish),
        at(shift, -96, dogHead(parts.mood, coat, { look, pant: spot(2) }), tilt),
      ]),
    ),
    at(150, 182, bowl(parts.level, dish)),
    when(spot(3), () =>
      part('gaze', [
        motion('flicker', stroke('M134 126l-3-7', C.spark, 4), 1),
        motion('flicker', stroke('M150 121v-8', C.spark, 4), 2),
        motion('flicker', stroke('M166 126l3-7', C.spark, 4), 3),
      ]),
    ),
    when(spot(4), () => part('drool', at(101, 114, motion('drip', drop(0, 0, C.water, 0.72), 2)))),
  ]
}

function dogBegging(parts: PetParts, coat: DogCoat, dish: Dish): Art {
  return [
    shadow(100, 183, 60),
    part(
      'dog',
      motion(
        'bob',
        at(92, FLOOR_Y, [
          at(-24, -12, motion('wobble', dogTail(coat))),
          svg`<ellipse cx="-30" cy="-24" rx="17" ry="24" fill=${coat.dark} /><ellipse cx="30" cy="-24" rx="17" ry="24" fill=${coat.dark} />`,
          svg`<ellipse cx="-34" cy="-6" rx="17" ry="7.5" fill=${coat.fur} /><ellipse cx="34" cy="-6" rx="17" ry="7.5" fill=${coat.fur} />`,
          svg`<path d="M-27-4C-32-36-25-78 0-82C25-78 32-36 27-4Q26 0 21 0H-21Q-26 0-27-4Z" fill=${coat.fur} />`,
          svg`<ellipse cy="-40" rx="17" ry="24" fill=${coat.muzzle} />`,
          dogCollar(dish, -8),
          at(0, -104, dogHead(parts.mood, coat, { size: 1.14 })),
          part('paws', [
            stroke('M-26-60C-32-50-24-44-12-48', coat.dark, 18),
            stroke('M26-60C32-50 24-44 12-48', coat.dark, 18),
            stroke('M-26-60C-32-50-24-44-12-48', coat.fur, 14.5),
            stroke('M26-60C32-50 24-44 12-48', coat.fur, 14.5),
            stroke('M-11-51v6M-16-52v6M11-51v6M16-52v6', coat.dark, 2.2),
          ]),
        ]),
      ),
    ),
    at(92, 184, bowl(0, dish), 0, 0.72),
    part('whine', [motion('flicker', stroke('M27 60q-7 8-1 18M17 54q-10 14-2 30', C.cream, 4), 1)]),
  ]
}

function dogSprawled(parts: PetParts, coat: DogCoat, dish: Dish): Art {
  return [
    shadow(92, 183, 80),
    at(168, 182, bowl(0, dish), 0, 0.56),
    part('dog', [
      part('tail', [
        stroke('M120 168C134 170 142 176 138 183', coat.fur, 10),
        stroke('M139.5 180l-1.5 3', coat.ear, 10),
      ]),
      svg`<path d="M30 176C26 132 50 100 74 100C98 100 124 132 120 176Z" fill=${coat.fur} />`,
      svg`<path d="M54 106C64 98 90 100 100 114C100 126 84 132 70 128C60 124 52 116 54 106Z" fill=${coat.ear} />`,
      svg`<ellipse cx="30" cy="177" rx="16" ry="7" fill=${coat.dark} /><ellipse cx="118" cy="177" rx="16" ry="7" fill=${coat.dark} />`,
      at(74, 148, dogHead(parts.mood, coat, { rim: true, size: 1.05, splay: -14 }), -4, 0.86),
      part('paws', [
        svg`<ellipse cx="46" cy="179" rx="15" ry="6.5" fill=${coat.fur} /><ellipse cx="102" cy="179" rx="15" ry="6.5" fill=${coat.fur} />`,
        stroke('M42 177v3.6M49 177v3.6M99 177v3.6M106 177v3.6', coat.dark, 2.2),
      ]),
    ]),
    worryMarks(
      [
        [122, 112, -20],
        [24, 104, 25],
        [100, 88, -12],
      ],
      parts.worry,
    ),
    when(parts.worry >= 3, () => scribble(52, 84)),
  ]
}

function dogPouring(parts: PetParts, coat: DogCoat, dish: Dish): Art {
  return [
    shadow(70, 183, 40, 0.2),
    shadow(150, 183, 40),
    part(
      'dog',
      motion(
        'bob',
        at(68, FLOOR_Y - 12, [
          at(-22, -14, motion('wobble', dogTail(coat))),
          svg`<ellipse cx="-20" cy="-2" rx="13" ry="10" fill=${coat.fur} /><ellipse cx="20" cy="-2" rx="13" ry="10" fill=${coat.fur} />`,
          svg`<path d="M-26-6C-32-36-26-78 0-82C26-78 32-36 26-6Q25-2 20-2H-20Q-25-2-26-6Z" fill=${coat.fur} />`,
          svg`<ellipse cy="-36" rx="17" ry="24" fill=${coat.muzzle} />`,
          dogCollar(dish, -8),
          stroke('M-27-58C-33-48-25-42-14-46', coat.dark, 17.5),
          stroke('M-27-58C-33-48-25-42-14-46', coat.fur, 14.5),
          stroke('M-13-49v6M-18-50v6', coat.dark, 2.2),
          stroke('M26-56C42-58 56-60 62-74', coat.dark, 16.4),
          stroke('M26-56C42-58 56-60 62-74', coat.fur, 14),
          at(5, -104, dogHead(parts.mood, coat, { look: 4 }), 7),
        ]),
      ),
    ),
    part('hop', [motion('flicker', stroke('M44 175l-3 6M70 177v6M96 175l3 6', C.cream, 4), 1)]),
    at(150, 182, bowl(parts.level, dish)),
    part(
      'pour',
      POUR.map(([x, y, d], i) =>
        at(x, y, motion('fall', svg`<circle r="5.4" fill=${KIBBLE[i % KIBBLE.length]} />`, d)),
      ),
    ),
    scoop(),
  ]
}

function dogProfile(mood: Mood, coat: DogCoat): Art {
  const eye: Art =
    mood === 'happy'
      ? stroke('M2-11q6-8 12 0', INK_BROWN, 3.4)
      : svg`<circle cx="8" cy="-11" r="4" fill=${INK_BROWN} />`
  return part('head', [
    svg`<ellipse rx="26" ry="24" fill=${coat.fur} />`,
    svg`<path d="M-6-23C8-27 22-18 21-5C14 2 0 2-8-6C-12-12-12-20-6-23Z" fill=${coat.patch} />`,
    svg`<path d="M4-13C18-18 36-17 44-10C51-3 50 11 41 15C29 20 15 21 0 18Z" fill=${coat.muzzle} />`,
    svg`<ellipse cx="45" cy="-7" rx="8" ry="7" fill=${DOG_NOSE} />`,
    stroke('M47 7C40 13 30 14 21 11', INK_BROWN, 2.6),
    eye,
    svg`<path d="M-14-20C-34-20-42 4-34 26C-30 36-16 34-13 21C-11 9-6-6-14-20Z" fill=${coat.ear} />`,
    stroke('M-29 2C-32 12-31 22-27 28', coat.earDark, 3.6),
  ])
}

function dogEating(parts: PetParts, coat: DogCoat, dish: Dish): Art {
  return [
    shadow(100, 183, 86),
    part('crumbs-floor', [
      svg`<circle cx="106" cy="182" r="3" fill=${KIBBLE[0]} /><circle cx="186" cy="178" r="3.4" fill=${KIBBLE[2]} /><circle cx="184" cy="186" r="2.6" fill=${KIBBLE[1]} />`,
    ]),
    part('dog', [
      stroke('M52 140V174', coat.dark, 13),
      stroke('M106 140V174', coat.dark, 13),
      at(36, 112, motion('wobble', at(0, 0, dogTail(coat), 12, 0.9))),
      svg`<path d="M28 118C28 100 54 94 78 96C100 98 120 108 122 124C124 142 108 150 86 150H52C36 150 28 136 28 118Z" fill=${coat.fur} />`,
      svg`<path d="M46 97C60 93 84 94 94 100C96 114 82 124 66 122C52 120 42 108 46 97Z" fill=${coat.ear} />`,
      svg`<ellipse cx="46" cy="132" rx="21" ry="24" fill=${coat.fur} />`,
      stroke('M40 152V174', coat.fur, 15),
      svg`<ellipse cx="44" cy="175" rx="13" ry="6" fill=${coat.fur} />`,
      stroke('M96 140V174', coat.fur, 14),
      svg`<ellipse cx="100" cy="175" rx="13" ry="6" fill=${coat.fur} />`,
      stroke('M47 174v3.5M40 174v3.5M103 174v3.5M96 174v3.5', coat.dark, 2.2),
      stroke('M90 118L116 124', coat.fur, 30),
      stroke('M98 103L91 133', dish.rim, 11),
      stroke('M98 103L91 133', dish.body, 7.5),
      svg`<circle cx="90" cy="141" r="7" fill=${C.sunDark} />`,
      svg`<circle cx="90" cy="140.2" r="5" fill=${C.sun} />`,
    ]),
    at(150, 182, bowlBack(parts.level, dish)),
    at(122, 122, motion('bob', at(0, 0, dogProfile(parts.mood, coat), 34, 0.96))),
    at(150, 182, part('bowl', bowlFront(dish))),
    wagMarks(30, 78),
    part(
      'crumbs',
      CRUMBS.map(([x, y, d, r], i) =>
        at(x, y, motion('drip', svg`<circle r=${r} fill=${KIBBLE[i % KIBBLE.length]} />`, d)),
      ),
    ),
  ]
}

const PAW_PRINT = 'M-7.5 6C-7.5-.5-3.5-3 0-3C3.5-3 7.5-.5 7.5 6C7.5 10 3 10 0 9C-3 10-7.5 10-7.5 6Z'

function pawPrint(color: string): Art {
  return svg`<g fill=${color}><path d=${PAW_PRINT} /><circle cx="-9.5" cy="-2.5" r="3.2" /><circle cx="-3.6" cy="-8.6" r="3.4" /><circle cx="3.6" cy="-8.6" r="3.4" /><circle cx="9.5" cy="-2.5" r="3.2" /></g>`
}

function floatingPaw(x: number, y: number, size: number, color: string, delay: number): Art {
  return part('paw-print', at(x, y, motion('rise', pawPrint(color), delay), 0, size))
}

function bark(x: number, y: number, size: number, delay: number): Art {
  const star =
    'M0-20L5.5-11L16-15L13-5L22 0L13 5L16 15L5.5 11L0 20L-5.5 11L-16 15L-13 5L-22 0L-13-5L-16-15L-5.5-11Z'
  return part(
    'bark',
    at(
      x,
      y,
      motion(
        'pulse',
        [
          svg`<path d=${star} fill=${C.sun} />`,
          svg`<rect x="-2.6" y="-9" width="5.2" height="11" rx="2.6" fill=${C.coralDark} />`,
          svg`<circle cy="6.5" r="3" fill=${C.coralDark} />`,
        ],
        delay,
      ),
      0,
      size,
    ),
  )
}

function dogPurring(parts: PetParts, coat: DogCoat, dish: Dish): Art {
  return [
    shadow(84, 183, 62),
    part('dog', [
      at(82, FLOOR_Y, [
        at(-24, -14, motion('wobble', dogTail(coat))),
        motion('bob', [
          dogSitting(coat),
          dogCollar(dish),
          at(0, -96, dogHead(parts.mood, coat), -5),
        ]),
      ]),
    ]),
    wagMarks(34, 120),
    at(168, 182, bowl(parts.level, dish), 0, 0.58),
    bark(166, 96, 1, 1),
    floatingPaw(176, 50, 0.85, C.cream, 3),
    floatingPaw(146, 34, 0.65, C.sun, 2),
    sparkle(26, 50, 1.2, 1),
    sparkle(182, 130, 0.8, 2),
    sparkle(16, 146, 0.7, 3),
    sparkle(112, 24, 0.85, 4),
  ]
}

function muddyPrints(
  spots: ReadonlyArray<readonly [number, number, number, number]>,
  n: number,
): Art {
  return spots
    .slice(0, n)
    .map(([x, y, r, s], i) =>
      part(
        'muddy-prints',
        svg`<g opacity=".7">${at(
          x + 14,
          y + 12,
          [at(0, 0, pawPrint(MUD), 18), at(20, -18, pawPrint(MUD), 26, 0.86)],
          r,
          s,
        )}</g>`,
        i,
      ),
    )
}

function slipper(x: number, y: number, flip: number): Art {
  return part(
    'slipper',
    at(x, y, [
      svg`<ellipse cy="4" rx="30" ry="3.6" fill="#0c0f1e" opacity=".22" />`,
      svg`<g transform=${`scale(${flip} 1)`}>
        <ellipse cx="-13" cy="-12.5" rx="15" ry="5" fill=${SLIPPER_DARK} />
        <path d="M0-14C-5-26 8-33 13-26C21-32 30-22 24-13Z" fill=${C.cream} />
        <path d="M-30-1C-30 3-27 4-24 4H24C31 4 32-2 29-5H-28C-30-4-30-2-30-1Z" fill=${C.creamDark} />
        <path d="M-29-4C-31-12-30-20-26-20C-22-13-13-10-4-13L1-16L5-13L9-19L14-15L19-21L23-16C30-15 32-9 29-4Z" fill=${SLIPPER} />
        <path d="M-27-8C-18-5-4-5 3-9" fill="none" stroke=${SLIPPER_DARK} stroke-width="2.4" stroke-linecap="round" />
        <path d="M12-11l2 3.4M18-11l2 3.4M24-10l1.6 3" stroke=${SLIPPER_DARK} stroke-width="2.4" stroke-linecap="round" />
      </g>`,
    ]),
  )
}

function stuffing(spots: ReadonlyArray<readonly [number, number, number]>): Art {
  return part(
    'stuffing',
    spots.map(([x, y, r], i) =>
      at(
        x,
        y,
        i % 3 === 1
          ? svg`<path d="M-7-3L-2-5L1-2L7-4L5 3L0 2L-5 5Z" fill=${SLIPPER} />`
          : svg`<g fill=${C.cream}><circle cx="-5" cy="1" r="4.6" /><circle cx="1" cy="-3" r="5.4" /><circle cx="6" cy="2" r="4.4" /></g>`,
        r,
      ),
    ),
  )
}

const DOG_PRINTS: Record<PetView, ReadonlyArray<readonly [number, number, number, number]>> = {
  curled: [
    [26, 34, -8, 1],
    [84, 24, 6, 0.85],
    [20, 86, 10, 0.72],
  ],
  watching: [
    [132, 34, 6, 1],
    [14, 30, -8, 0.8],
    [150, 90, -10, 0.72],
  ],
  begging: [
    [14, 90, -8, 0.8],
    [126, 96, 8, 0.85],
    [108, 20, 0, 0.6],
  ],
  sprawled: [
    [18, 26, -8, 1],
    [158, 18, 8, 0.6],
    [62, 28, 4, 0.72],
  ],
  pouring: [
    [16, 28, -8, 0.8],
    [150, 126, 10, 0.6],
    [100, 20, 4, 0.62],
  ],
  eating: [
    [136, 34, 6, 1],
    [20, 24, -8, 0.8],
    [86, 30, 10, 0.72],
  ],
  purring: [],
}

const DOG_SLIPPER: Record<PetView, readonly [number, number, number]> = {
  curled: [134, 181, -1],
  watching: [40, 181, 1],
  begging: [158, 181, -1],
  sprawled: [120, 182, -1],
  pouring: [112, 180, -1],
  eating: [74, 182, 1],
  purring: [0, 0, 1],
}

const DOG_STUFFING: Record<PetView, ReadonlyArray<readonly [number, number, number]>> = {
  curled: [
    [22, 178, 10],
    [152, 174, 40],
    [118, 179, 80],
  ],
  watching: [
    [104, 179, 20],
    [22, 172, -30],
    [78, 179, 60],
  ],
  begging: [
    [24, 176, 20],
    [40, 182, -30],
    [176, 172, 60],
  ],
  sprawled: [
    [22, 172, 20],
    [92, 183, -40],
    [176, 179, 70],
  ],
  pouring: [
    [104, 174, 20],
    [24, 180, 70],
    [90, 179, -30],
  ],
  eating: [
    [26, 179, 20],
    [120, 183, 70],
    [24, 166, -30],
  ],
  purring: [],
}

const DOG_DREAM: typeof DREAM_SPOT = {
  ...DREAM_SPOT,
  watching: [
    [152, 58],
    [122, 72],
  ],
  begging: [
    [162, 44],
    [142, 76],
  ],
  sprawled: [
    [130, 60],
    [106, 100],
  ],
}

function dogScene(parts: PetParts, paint: Omit<Dish, 'emblem'>): Art {
  const coat = dogCoatFor(parts.grime)
  const dish = dogDish(paint)
  const views: Record<PetView, () => Art> = {
    curled: () => dogCurled(parts, coat, dish),
    watching: () => dogWatching(parts, coat, dish),
    begging: () => dogBegging(parts, coat, dish),
    sprawled: () => dogSprawled(parts, coat, dish),
    pouring: () => dogPouring(parts, coat, dish),
    eating: () => dogEating(parts, coat, dish),
    purring: () => dogPurring(parts, coat, dish),
  }
  const [bubble, tip] = DOG_DREAM[parts.view]
  const [slipperX, slipperY, slipperFlip] = DOG_SLIPPER[parts.view]
  return [
    muddyPrints(DOG_PRINTS[parts.view], parts.scratches),
    views[parts.view](),
    when(parts.cup, () => slipper(slipperX, slipperY, slipperFlip)),
    when(parts.shreds, () => stuffing(DOG_STUFFING[parts.view])),
    dreamBubble(
      bubble[0],
      bubble[1],
      parts.dream,
      tip,
      at(2, 0, boneShape(C.wickerLight, C.wicker), -22),
    ),
    FLY_SPOTS[parts.view].slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function bowlPaint(scene: SceneView): Omit<Dish, 'emblem'> {
  const body = accentOf(scene, C.pink)
  return body === C.pink
    ? { body, rim: C.pinkDark, inside: BOWL_INSIDE }
    : { body, rim: shadeOf(body, 0.22), inside: shadeOf(body, 0.62) }
}

function catScene(parts: PetParts, paint: Omit<Dish, 'emblem'>): Art {
  const coat = coatFor(parts.grime)
  const dish: Dish = { ...paint, emblem: at(0, -11, fishShape(C.cream, C.creamDark), 0, 0.48) }
  const views: Record<PetView, () => Art> = {
    curled: () => curled(parts, coat, dish),
    watching: () => watching(parts, coat, dish),
    begging: () => begging(parts, coat, dish),
    sprawled: () => sprawled(parts, coat, dish),
    pouring: () => pouring(parts, coat, dish),
    eating: () => eating(parts, coat, dish),
    purring: () => purring(parts, coat, dish),
  }
  const [bubble, tip] = DREAM_SPOT[parts.view]
  const [cupX, cupY, cupFlip] = CUP_SPOT[parts.view]
  return [
    scratchMarks(WALL_SCRATCH[parts.view], parts.scratches),
    views[parts.view](),
    when(parts.cup, () => cup(cupX, cupY, cupFlip)),
    when(parts.shreds, () => shreds(SHRED_SPOTS[parts.view])),
    dreamBubble(bubble[0], bubble[1], parts.dream, tip, fishShape(C.sky, C.skyDark)),
    FLY_SPOTS[parts.view].slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

export function pet(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = petParts(scene)
  const paint = bowlPaint(scene)
  const art =
    variantOf(scene, ['cat', 'dog'], 'cat') === 'dog'
      ? dogScene(parts, paint)
      : catScene(parts, paint)
  return frame('pet', scene, options, art)
}
