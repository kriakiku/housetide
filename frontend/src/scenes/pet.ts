import { nothing, svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
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
  shadow,
  sparkle,
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

function bowlBack(level: number): Art {
  return [
    svg`<ellipse cx="0" cy="-32" rx="37" ry="9.5" fill=${C.pinkDark} />`,
    svg`<ellipse cx="0" cy="-32" rx="31" ry="6.5" fill=${BOWL_INSIDE} />`,
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

function bowlFront(): Art {
  return [
    svg`<path d="M-37-32A37 9.5 0 0 0 37-32L30-5Q29 0 23 0H-23Q-29 0-30-5Z" fill=${C.pink} />`,
    stroke('M-35-29.5A36 9 0 0 0 35-29.5', C.pinkDark, 3.5),
    at(0, -11, fishShape(C.cream, C.creamDark), 0, 0.48),
  ]
}

function bowl(level: number): Art {
  return part('bowl', [bowlBack(level), bowlFront()], level)
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

function dreamBubble(x: number, y: number, step: number, tailTo: readonly [number, number]): Art {
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
        motion('pulse', [
          svg`<circle r=${r} fill=${C.cream} />`,
          at(-2, 0, fishShape(C.sky, C.skyDark), 0, r / 29),
        ]),
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

function curled(parts: PetParts, coat: Coat): Art {
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
    at(166, 182, bowl(MAX_LEVEL), 0, 0.68),
    zed(140, 96, 0.8, 1),
    zed(156, 72, 1.05, 2),
    zed(173, 44, 1.35, 3),
  ]
}

function watching(parts: PetParts, coat: Coat): Art {
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
    at(150, 182, bowl(parts.level)),
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

function begging(parts: PetParts, coat: Coat): Art {
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
          at(0, -12, bowl(0), -4, 0.9),
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

function sprawled(parts: PetParts, coat: Coat): Art {
  return [
    shadow(92, 183, 80),
    at(168, 182, bowl(0), 0, 0.62),
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

function pouring(parts: PetParts, coat: Coat): Art {
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
    at(150, 182, bowl(parts.level)),
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

function eating(parts: PetParts, coat: Coat): Art {
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
    at(148, 182, bowlBack(parts.level)),
    at(
      120,
      120,
      motion('bob', [
        stroke('M-42-6L-14 0', coat.fur, 34),
        at(0, 0, head(parts.mood, coat, 5, 1, true), 15),
      ]),
    ),
    at(148, 182, part('bowl', bowlFront())),
    part(
      'crumbs',
      CRUMBS.map(([x, y, d, r], i) =>
        at(x, y, motion('drip', svg`<circle r=${r} fill=${KIBBLE[i % KIBBLE.length]} />`, d)),
      ),
    ),
  ]
}

function purring(parts: PetParts, coat: Coat): Art {
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
    at(166, 182, bowl(parts.level), 0, 0.62),
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

export function pet(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = petParts(scene)
  const coat = coatFor(parts.grime)
  const views: Record<PetView, () => Art> = {
    curled: () => curled(parts, coat),
    watching: () => watching(parts, coat),
    begging: () => begging(parts, coat),
    sprawled: () => sprawled(parts, coat),
    pouring: () => pouring(parts, coat),
    eating: () => eating(parts, coat),
    purring: () => purring(parts, coat),
  }
  const [bubble, tip] = DREAM_SPOT[parts.view]
  const [cupX, cupY, cupFlip] = CUP_SPOT[parts.view]
  const art: Art = [
    scratchMarks(WALL_SCRATCH[parts.view], parts.scratches),
    views[parts.view](),
    when(parts.cup, () => cup(cupX, cupY, cupFlip)),
    when(parts.shreds, () => shreds(SHRED_SPOTS[parts.view])),
    dreamBubble(bubble[0], bubble[1], parts.dream, tip),
    FLY_SPOTS[parts.view].slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
  return frame('pet', scene, options, art)
}
