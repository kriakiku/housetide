import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  blob,
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
  shadeOf,
  shadow,
  shirt,
  sock,
  sparkle,
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type WardrobeView = 'closed' | 'open' | 'donate'

export interface WardrobeParts {
  view: WardrobeView
  step: number
  belted: boolean
  snapped: boolean
  asleep: boolean
  gap: number
  bow: number
  hung: number
  flying: boolean
  sparkles: boolean
  avalanche: number
  lostSock: boolean
  moths: number
  stench: number
  dumped: boolean
  mood: Mood
}

export const MAX_STEP = 4
export const MAX_HUNG = 7

const GAPS = [0, 2.5, 5.5, 9.5, 13] as const
const BOWS = [0, 0, 1.5, 3.5, 6] as const
const DUE_GAP = 15
const DUE_BOW = 8
const SNAP_GAP = 25
const SNAP_BOW = 10

const AVALANCHE_AT = [0.12, 0.4, 0.75] as const
const MOTHS_AT = [0.25, 0.6, 0.85] as const
const STENCH_AT = [0.7, 0.92] as const
const RUN_MOTHS_AT = [0.4, 0.8] as const
const RUN_STENCH_AT = [0.7] as const
const BOX_MOTHS_AT = [0.2, 0.5, 0.8] as const
const BOX_STENCH_AT = [0.6, 0.85] as const
const SOCK_AT = 0.55
const BOX_SOCK_AT = 0.35
const DUMP_AT = 0.5
const SNAP_AT = 0.9
const SICK_AT = 0.6

const CALM = {
  step: 0,
  belted: false,
  snapped: false,
  asleep: false,
  gap: 0,
  bow: 0,
  hung: 0,
  flying: false,
  sparkles: false,
  avalanche: 0,
  lostSock: false,
  moths: 0,
  stench: 0,
  dumped: false,
} as const

export function wardrobeParts(scene: SceneView): WardrobeParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...CALM, view: 'open', hung: MAX_HUNG, sparkles: true, mood: 'happy' }
  }
  if (state === 'running') {
    return {
      ...CALM,
      view: 'open',
      hung: 2 + Math.min(3, Math.floor(clamp01(scene.progress) * 4)),
      flying: true,
      moths: reached(stink, RUN_MOTHS_AT),
      stench: reached(stink, RUN_STENCH_AT),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      view: 'donate',
      lostSock: stink >= BOX_SOCK_AT,
      dumped: stink >= DUMP_AT,
      moths: reached(stink, BOX_MOTHS_AT),
      stench: reached(stink, BOX_STENCH_AT),
      mood: stink >= SICK_AT ? 'sick' : stink >= 0.2 ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const step = due ? MAX_STEP : resting ? 0 : Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const snapped = due && stink >= SNAP_AT
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (stink >= SICK_AT) mood = 'sick'
  return {
    ...CALM,
    view: 'closed',
    step,
    belted: due && !snapped,
    snapped,
    asleep: resting,
    gap: snapped ? SNAP_GAP : due ? DUE_GAP : (GAPS[step] ?? 0),
    bow: snapped ? SNAP_BOW : due ? DUE_BOW : (BOWS[step] ?? 0),
    avalanche: reached(stink, AVALANCHE_AT),
    lostSock: stink >= SOCK_AT,
    moths: reached(stink, MOTHS_AT),
    stench: reached(stink, STENCH_AT),
    mood,
  }
}

const WOOD = '#c0814f'
const HALF = 54
const DOOR_HALF = 49
const DOOR_TOP = 84
const DOOR_BOTTOM = 169
const WAIST = 126
const BELT = '#5a3a2a'
const BELT_DARK = '#3f2719'
const BOX = '#d9a566'
const BOX_DARK = '#b47f43'
const BOX_LIGHT = '#eec08a'
const BOX_INSIDE = '#7d5730'
const MOTH = '#ecdcb4'
const MOTH_DARK = '#b89c6c'
const MOTH_BODY = '#755a3b'
const MIRROR = '#bfe3f7'
const SHOE = '#7a4a34'
const SHOE_DARK = '#5d3626'

interface Wood {
  body: string
  dark: string
  light: string
  panel: string
  inside: string
  doorBack: string
  ink: string
}

function woodOf(scene: SceneView): Wood {
  const body = accentOf(scene, WOOD)
  return {
    body,
    dark: shadeOf(body, 0.3),
    light: tintOf(body, 0.3),
    panel: shadeOf(body, 0.12),
    inside: mix(shadeOf(body, 0.55), INK, 0.62),
    doorBack: shadeOf(body, 0.2),
    ink: isDarkColor(body) ? tintOf(body, 0.82) : mix(body, INK, 0.76),
  }
}

type Dye = readonly [string, string]

const CORAL: Dye = [C.coral, C.coralDark]
const SUN: Dye = [C.sun, C.sunDark]
const MINT: Dye = [C.mint, C.mintDark]
const SKY: Dye = [C.sky, C.skyDark]
const LILAC: Dye = [C.lilac, C.lilacDark]
const PINK: Dye = [C.pink, C.pinkDark]

const px = (side: number, offset: number): number => 100 + side * offset

function curve(side: number, offset: number, swell: number, from: number, to: number): string {
  const mid = (from + to) / 2
  return `Q${px(side, offset + swell * 2)} ${mid} ${px(side, offset)} ${to}`
}

function doorPath(side: number, gap: number, bow: number, belted: boolean): string {
  const seam = 2
  const outer = `M${px(side, seam)} ${DOOR_TOP}H${px(side, DOOR_HALF)}`
  const down = belted
    ? `${curve(side, DOOR_HALF - 3, bow, DOOR_TOP, WAIST)}${curve(side, DOOR_HALF, bow, WAIST, DOOR_BOTTOM)}`
    : curve(side, DOOR_HALF, bow, DOOR_TOP, DOOR_BOTTOM)
  const inner = `H${px(side, seam)}`
  const up = belted
    ? `${curve(side, seam, gap, DOOR_BOTTOM, WAIST)}${curve(side, seam, gap, WAIST, DOOR_TOP)}`
    : curve(side, seam, gap, DOOR_BOTTOM, DOOR_TOP)
  return `${outer}${down}${inner}${up}Z`
}

function carcassPath(bow: number, belted: boolean): string {
  const right = belted
    ? `${curve(1, HALF - 3, bow, 82, WAIST)}${curve(1, HALF, bow, WAIST, 172)}`
    : curve(1, HALF, bow, 82, 172)
  const left = belted
    ? `${curve(-1, HALF - 3, bow, 172, WAIST)}${curve(-1, HALF, bow, WAIST, 82)}`
    : curve(-1, HALF, bow, 172, 82)
  return `M46 42H154V82${right}V177H46V172${left}Z`
}

function feet(wood: Wood): Art {
  return svg`<path d="M56 174H76L72 183Q71.5 185 69 185H63Q60.5 185 60 183ZM124 174H144L140 183Q139.5 185 137 185H131Q128.5 185 128 183Z" fill=${wood.dark} />`
}

function top(wood: Wood, mood: Mood): Art {
  return [
    svg`<rect x="52" y="47" width="96" height="32" rx="7" fill=${wood.body} />`,
    svg`<rect x="38" y="30" width="124" height="13" rx="6.5" fill=${wood.light} />`,
    svg`<rect x="44" y="40" width="112" height="3.5" rx="1.75" fill=${wood.dark} opacity=".6" />`,
    face(100, 62, mood, wood.ink, 1.12),
  ]
}

function jam(): Art {
  const rows: ReadonlyArray<readonly [number, number, number, Dye, number]> = [
    [100, 100, 28, CORAL, -6],
    [103, 118, 30, SUN, 8],
    [97, 137, 30, MINT, -8],
    [102, 156, 30, SKY, 6],
  ]
  return part(
    'jam',
    rows.map(([x, y, w, [color, dark], rotate]) => blob(x, y, w, 12, color, dark, rotate)),
  )
}

function panels(side: number, parts: WardrobeParts, wood: Wood): Art {
  const near = Math.max(12, parts.gap + 9)
  const far = 42 + parts.bow * 0.5
  const x = side > 0 ? 100 + near : 100 - far
  const width = far - near
  const rows = parts.belted
    ? [
        [92, 21],
        [139, 22],
      ]
    : [[92, 69]]
  const slats = [99, 106, 113]
  return [
    rows.map(
      ([y, height]) =>
        svg`<rect x=${x} y=${y} width=${width} height=${height} rx="4.5" fill=${wood.panel} />`,
    ),
    when(!parts.belted, () =>
      slats.map(
        (y) =>
          svg`<rect x=${x + 4} y=${y} width=${Math.max(2, width - 8)} height="3" rx="1.5" fill=${wood.dark} opacity=".7" />`,
      ),
    ),
  ]
}

function doors(parts: WardrobeParts, wood: Wood): Art {
  const knobGap = parts.gap + 7
  return part(
    'doors',
    [-1, 1].map((side) => [
      svg`<path d=${doorPath(side, parts.gap, parts.bow, parts.belted)} fill=${wood.body} stroke=${wood.body} stroke-width="3" stroke-linejoin="round" />`,
      panels(side, parts, wood),
      when(
        !parts.belted && !parts.snapped,
        () =>
          svg`<circle cx=${px(side, knobGap)} cy="130" r="3.8" fill=${C.sun} /><circle cx=${px(side, knobGap) - 1} cy="129" r="1.3" fill="#fff" opacity=".7" />`,
      ),
    ]),
  )
}

function sleeve(x: number, y: number, side: number, [color, dark]: Dye, drape = 1): Art {
  const reach = (value: number): number => value * side
  const d = `M0 0C${reach(11)} ${2 * drape} ${reach(17)} ${13 * drape} ${reach(16)} ${34 * drape}`
  const cuff = `M${reach(16.2)} ${30 * drape}L${reach(16)} ${37 * drape}`
  return part(
    'sleeve',
    at(x, y, [
      svg`<path d=${d} fill="none" stroke=${color} stroke-width="13" stroke-linecap="round" />`,
      svg`<path d=${cuff} fill="none" stroke=${dark} stroke-width="13" stroke-linecap="round" />`,
    ]),
  )
}

function scarf(x: number, y: number, rotate: number): Art {
  return part(
    'scarf',
    at(
      x,
      y,
      motion(
        'sway',
        [
          svg`<rect x="-7.5" y="-4" width="15" height="52" rx="4" fill=${C.lilac} />`,
          svg`<path d="M-7.5 10H7.5M-7.5 24H7.5M-7.5 38H7.5" stroke=${C.cream} stroke-width="5" />`,
          svg`<path d="M-5 48V54M0 48V55M5 48V54" stroke=${C.lilacDark} stroke-width="2.6" stroke-linecap="round" />`,
        ],
        2,
      ),
      rotate,
    ),
  )
}

function hatBox(x: number): Art {
  return part(
    'hat-box',
    at(
      x,
      30,
      [
        svg`<rect x="-18" y="-16" width="36" height="16" rx="3" fill=${C.pink} />`,
        svg`<rect x="-21" y="-21" width="42" height="9" rx="3.5" fill=${C.pinkDark} />`,
        svg`<rect x="-3.5" y="-21" width="7" height="21" fill=${C.cream} />`,
      ],
      0,
      0.76,
    ),
  )
}

function folded(x: number, y: number, layers: readonly string[]): Art {
  return layers.map((color, i) => {
    const inset = i * 2
    return svg`<rect x=${x - 19 + inset} y=${y - 7 * (i + 1)} width=${38 - inset * 2} height="7.5" rx="3.5" fill=${color} />`
  })
}

function roofPile(step: number): Art {
  return part('roof-pile', [
    when(step >= 2, () => folded(70, 30, [C.sky, C.coral])),
    when(step >= 3, () => at(72, 15, sock(0, 0, C.mint, C.cream, 72, 0.42))),
    when(step >= 4, () => [
      blob(130, 23, 20, 7, C.sun, C.sunDark, 3),
      blob(103, 25, 13, 5, C.lilac, C.lilacDark, -4),
    ]),
  ])
}

function pokes(parts: WardrobeParts): Art {
  const { step, gap } = parts
  if (parts.belted) {
    return [
      sleeve(108, 95, 1, CORAL, 0.62),
      at(93, 148, motion('wobble', sock(0, 12, C.pink, C.cream, 12, 0.68), 1)),
    ]
  }
  return [
    when(step >= 1, () => sleeve(100 + gap * 0.7, 134, 1, SKY)),
    when(step >= 2, () =>
      at(100 - gap * 0.8, 146, motion('wobble', sock(0, 12, C.pink, C.cream, 16, 0.72), 1)),
    ),
    when(step >= 3, () => scarf(100 - gap * 1.1, 96, 22)),
    when(step >= 4, () => sleeve(110, 98, 1, CORAL, 0.72)),
  ]
}

function strain(): Art {
  const lines = [
    [28, 108, 'M0 0q-5 9 0 18', 1],
    [26, 134, 'M0 0q-5 9 0 18', 2],
    [172, 100, 'M0 0q5 9 0 18', 3],
    [176, 140, 'M0 0q5 9 0 18', 1],
  ] as const
  return part(
    'strain',
    lines.map(([x, y, d, delay]) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke=${C.cream} stroke-width="3.6" stroke-linecap="round" opacity=".8" />`,
          delay,
        ),
      ),
    ),
  )
}

function belt(): Art {
  const holes = [128, 136, 144]
  return part('belt', [
    svg`<rect x="41" y="118" width="118" height="16" rx="5" fill=${BELT} />`,
    svg`<path d="M41 130H159" stroke=${BELT_DARK} stroke-width="2" opacity=".7" />`,
    holes.map((x) => svg`<circle cx=${x} cy="126" r="1.9" fill=${BELT_DARK} />`),
    at(
      100,
      126,
      motion('rumble', [
        svg`<rect x="-16" y="-15" width="32" height="30" rx="7" fill=${C.sun} />`,
        svg`<rect x="-9.5" y="-8.5" width="19" height="17" rx="3" fill=${BELT} />`,
        svg`<rect x="-1.6" y="-11" width="3.2" height="22" rx="1.6" fill=${C.sunDark} />`,
        svg`<path d="M-12.5-11.5h9" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".65" />`,
      ]),
    ),
    at(
      159,
      123,
      motion(
        'sway',
        svg`<path d="M-2 0Q12 0 11 18Q10 26 4 26" fill="none" stroke=${BELT} stroke-width="11" stroke-linecap="round" />`,
      ),
    ),
  ])
}

function snappedBelt(): Art {
  return part('belt-snapped', [
    at(
      50,
      114,
      motion(
        'sway',
        svg`<path d="M0 0Q-4 22 3 42" fill="none" stroke=${BELT} stroke-width="11" stroke-linecap="round" />`,
      ),
    ),
    at(
      150,
      110,
      motion(
        'sway',
        [
          svg`<path d="M0 0Q5 16 1 30" fill="none" stroke=${BELT} stroke-width="11" stroke-linecap="round" />`,
          at(
            1,
            38,
            [
              svg`<rect x="-13" y="-12" width="26" height="24" rx="6" fill=${C.sun} />`,
              svg`<rect x="-7" y="-6.5" width="14" height="13" rx="2.5" fill=${BELT} />`,
            ],
            14,
          ),
        ],
        2,
      ),
    ),
  ])
}

function shell(parts: WardrobeParts, wood: Wood): Art {
  return part('wardrobe', [
    feet(wood),
    svg`<path d=${carcassPath(parts.bow, parts.belted)} fill=${wood.dark} stroke=${wood.dark} stroke-width="4" stroke-linejoin="round" />`,
    when(
      parts.gap > 0,
      () =>
        svg`<rect x=${100 - parts.gap * 1.2 - 4} y=${DOOR_TOP} width=${parts.gap * 2.4 + 8} height=${DOOR_BOTTOM - DOOR_TOP} fill=${wood.inside} />`,
    ),
    when(parts.gap > 0, jam),
    doors(parts, wood),
    when(
      parts.gap === 0,
      () =>
        svg`<path d=${`M100 ${DOOR_TOP}V${DOOR_BOTTOM}`} stroke=${wood.dark} stroke-width="3" stroke-linecap="round" />`,
    ),
    top(wood, parts.mood),
  ])
}

function closed(parts: WardrobeParts, wood: Wood): Art {
  const body: Art = [
    shell(parts, wood),
    when(!parts.snapped, () => pokes(parts)),
    when(parts.belted, belt),
    when(parts.snapped, snappedBelt),
  ]
  return [
    shadow(100, 183, 72),
    roofPile(parts.step),
    when(parts.step === 0, () => hatBox(70)),
    parts.belted ? motion('rumble', body) : body,
    when(parts.belted && parts.avalanche === 0, strain),
    when(parts.belted, () => [
      at(30, 96, motion('drip', drop(0, 0, C.water, 0.72), 1)),
      at(172, 92, motion('drip', drop(0, 0, C.water, 0.6), 3)),
    ]),
    when(parts.asleep, () => [zed(136, 20, 0.6, 1), zed(154, 24, 0.84, 2), zed(174, 16, 0.56, 3)]),
    avalanche(parts.avalanche),
    when(parts.lostSock, () => lostSock(158, 150, 1.25, 8)),
    neglect(parts, MOTH_SPOTS, [
      [20, 112],
      [182, 96],
    ]),
  ]
}

const MOTH_SPOTS = [
  [34, 62, 0.9, -12],
  [154, 74, 0.85, 14],
  [148, 25, 0.62, 6],
] as const

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

function avalanche(level: number): Art {
  const steps: ReadonlyArray<readonly [number, () => Art]> = [
    [
      3,
      () => [
        shirt(66, 122, C.sun, C.sunDark, -18, 1.02),
        shirt(136, 126, C.pink, C.pinkDark, 16, 0.98),
        blob(100, 134, 36, 18, C.lilac, C.lilacDark, 3),
        blob(34, 150, 22, 15, C.mint, C.mintDark, -12),
        mothHoles(),
      ],
    ],
    [
      2,
      () => [
        shirt(50, 154, C.sky, C.skyDark, -24, 0.86),
        blob(142, 158, 30, 15, C.coral, C.coralDark, 8),
        blob(92, 160, 32, 16, C.mint, C.mintDark, -5),
        sock(120, 150, C.sun, C.coral, 40, 0.86),
      ],
    ],
    [
      1,
      () => [
        blob(44, 177, 28, 9, C.coral, C.coralDark, -3),
        blob(158, 177, 28, 9, C.sky, C.skyDark, 3),
        blob(100, 178, 34, 8, C.sun, C.sunDark, 0),
        at(80, 165, sock(0, 0, C.lilac, C.cream, 74, 0.64)),
      ],
    ],
  ]
  return part(
    'avalanche',
    steps.filter(([min]) => level >= min).map(([, art]) => art()),
  )
}

function mothHoles(): Art {
  return part(
    'moth-holes',
    svg`<g fill=${INK} opacity=".62"><circle cx="58" cy="118" r="3" /><circle cx="70" cy="128" r="2.2" /><circle cx="130" cy="130" r="2.6" /><circle cx="143" cy="120" r="3.2" /></g>`,
  )
}

function lostSock(x: number, y: number, size: number, rotate: number): Art {
  return part(
    'lost-sock',
    at(
      x,
      y,
      motion('wobble', [
        sock(0, 0, C.sun, C.coral, 0, 1),
        svg`<circle cx="-3.8" cy="-5" r="5" fill="#fff" /><circle cx="4.5" cy="-5.5" r="6" fill="#fff" />`,
        svg`<circle cx="-2.8" cy="-3.8" r="2.3" fill=${INK} /><circle cx="3" cy="-3.6" r="2.8" fill=${INK} />`,
        svg`<path d="M-3 6q3-3 6 0" fill="none" stroke=${INK} stroke-width="2.2" stroke-linecap="round" />`,
      ]),
      rotate,
      size,
    ),
  )
}

function wing(side: number): Art {
  return [
    svg`<path d=${`M0-2C${side * 6}-14 ${side * 21}-17 ${side * 25}-8C${side * 27} 0 ${side * 15} 5 0 3Z`} fill=${MOTH} />`,
    svg`<path d=${`M0 2C${side * 8} 3 ${side * 18} 4 ${side * 18} 11C${side * 17} 17 ${side * 7} 15 0 7Z`} fill=${MOTH_DARK} />`,
    svg`<circle cx=${side * 16} cy="-7" r="3" fill=${MOTH_DARK} />`,
  ]
}

function moth(x: number, y: number, size: number, rotate: number, index: number): Art {
  return part(
    'moth',
    at(
      x,
      y,
      motion(
        'buzz',
        at(
          0,
          0,
          [
            wing(-1),
            wing(1),
            svg`<ellipse cy="2" rx="4" ry="10" fill=${MOTH_BODY} />`,
            svg`<path d="M-1.5-7Q-5-14-10-15M1.5-7Q5-14 10-15" fill="none" stroke=${MOTH_BODY} stroke-width="1.8" stroke-linecap="round" />`,
            svg`<circle cx="-1.8" cy="-5" r="1.5" fill="#fff" /><circle cx="1.8" cy="-5" r="1.5" fill="#fff" />`,
          ],
          rotate,
          size,
        ),
        (index % 3) + 1,
      ),
    ),
    index,
  )
}

function neglect(
  parts: WardrobeParts,
  moths: ReadonlyArray<readonly [number, number, number, number]>,
  lines: ReadonlyArray<readonly [number, number]>,
): Art {
  return [
    stenchLines(lines.slice(0, parts.stench)),
    moths.slice(0, parts.moths).map(([x, y, s, r], i) => moth(x, y, s, r, i)),
  ]
}

const RAINBOW: readonly Dye[] = [PINK, CORAL, SUN, MINT, SKY, LILAC, [C.cream, C.creamDark]]
const SLOTS = [61, 74, 87, 100, 113, 126, 139] as const
const LENGTHS = [46, 45, 43, 41, 38, 34, 30] as const
const RAIL = 93

function hook(): Art {
  return svg`<path d="M0 7V2.5C0 .5 2.8 .5 2.8-1.6A2.8 2.8 0 0 0-2.6-2.4" fill="none" stroke=${C.metalMid} stroke-width="2" stroke-linecap="round" />`
}

function garment(index: number, sway: boolean): Art {
  const x = SLOTS[index] ?? 100
  const length = LENGTHS[index] ?? 36
  const [color, dark] = RAINBOW[index] ?? CORAL
  const shape = `M-5.8 ${length + 2}V12Q-5.8 7 0 6.5Q5.8 7 5.8 12V${length + 2}Q5.8 ${length + 7} 2 ${length + 7}H-2Q-5.8 ${length + 7}-5.8 ${length + 2}Z`
  const art: Art = [
    hook(),
    svg`<path d=${shape} fill=${color} />`,
    svg`<path d=${`M2.5 10V${length + 6}`} stroke=${dark} stroke-width="2.6" stroke-linecap="round" />`,
  ]
  return part('garment', at(x, RAIL, sway ? motion('sway', art, (index % 5) + 1) : art), index)
}

function emptyHanger(index: number): Art {
  const x = SLOTS[index] ?? 100
  return part(
    'hanger',
    at(
      x,
      RAIL,
      motion(
        'sway',
        [
          hook(),
          svg`<path d="M0 7L-9 13.5H9Z" fill="none" stroke=${C.metalMid} stroke-width="2" stroke-linejoin="round" />`,
        ],
        (index % 5) + 1,
      ),
    ),
    index,
  )
}

function openDoor(side: number, wood: Wood): Art {
  const inner = px(side, HALF)
  const outer = px(side, 76)
  const points = `M${inner} 82L${outer} 72V180L${inner} 172Z`
  const glass = `M${px(side, 60)} 89L${px(side, 71)} 84V169L${px(side, 60)} 165Z`
  const glint = `M${px(side, 64)} 98V122`
  return part('open-door', [
    svg`<path d=${points} fill=${wood.doorBack} stroke=${wood.doorBack} stroke-width="3" stroke-linejoin="round" />`,
    svg`<path d=${glass} fill=${MIRROR} stroke=${MIRROR} stroke-width="1.5" stroke-linejoin="round" />`,
    svg`<path d=${glint} stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8" />`,
  ])
}

function interior(wood: Wood): Art {
  return [
    svg`<rect x="52" y="82" width="96" height="90" rx="3" fill=${wood.inside} />`,
    svg`<rect x="52" y=${RAIL - 2} width="96" height="4.5" rx="2.2" fill=${C.metalMid} />`,
    svg`<rect x="52" y="150" width="96" height="3.5" fill=${wood.body} />`,
  ]
}

function shoe(x: number): Art {
  return svg`<path d=${`M${x} 170V160Q${x} 157 ${x + 3} 157H${x + 7}Q${x + 10} 157 ${x + 10} 160Q${x + 11} 164 ${x + 15} 165Q${x + 18} 166 ${x + 18} 170Z`} fill=${SHOE} /><path d=${`M${x} 170H${x + 18}`} stroke=${SHOE_DARK} stroke-width="3" stroke-linecap="round" />`
}

function tidy(x: number, layers: readonly string[]): Art {
  return layers.map(
    (color, i) =>
      svg`<rect x=${x} y=${164.5 - i * 6} width="24" height="6" rx="2.8" fill=${color} />`,
  )
}

function shelves(): Art {
  return part('shelf', [
    tidy(56, [C.coral, C.pink, C.coralDark]),
    tidy(83, [C.sky, C.lilac, C.skyDark]),
    shoe(109),
    shoe(127),
  ])
}

function messyShelf(): Art {
  return part('shelf', [
    blob(70, 164, 18, 6, C.coral, C.coralDark, -4),
    blob(122, 165, 22, 5, C.sky, C.skyDark, 4),
  ])
}

function floorPile(): Art {
  return part('floor-pile', [
    shadow(50, 183, 32, 0.24),
    blob(33, 175, 20, 10, C.mint, C.mintDark, -6),
    blob(66, 176, 22, 9, C.coral, C.coralDark, 6),
    blob(48, 165, 21, 10, C.sun, C.sunDark, 4),
    at(51, 156, motion('wobble', sock(0, 0, C.lilac, C.cream, 18, 0.62), 2)),
  ])
}

function flyer(x: number, y: number, dye: Dye, size: number, tilt: number, delay: number): Art {
  return part(
    'flying',
    at(
      x,
      y,
      motion(
        'bob',
        at(
          0,
          0,
          [
            shirt(0, 0, dye[0], dye[1], 0, size),
            at(
              0,
              -24 * size,
              [
                hook(),
                svg`<path d="M0 7L-12 14H12Z" fill="none" stroke=${C.metal} stroke-width="2.400" stroke-linejoin="round" />`,
              ],
              0,
              1.05,
            ),
          ],
          tilt,
        ),
        delay,
      ),
    ),
    delay,
  )
}

function flightPath(): Art {
  return part('flight', [
    svg`<path d="M36 142C8 96 12 42 52 22C92 4 152 6 174 46C186 78 160 96 134 104" fill="none" stroke=${C.cream} stroke-width="3.400" stroke-linecap="round" stroke-dasharray="1 9" opacity=".75" />`,
  ])
}

function openView(parts: WardrobeParts, wood: Wood): Art {
  const slots = SLOTS.map((_, i) => i)
  const hung = slots.slice(0, parts.hung)
  const free = slots.slice(parts.hung)
  return [
    shadow(100, 183, 80),
    feet(wood),
    part('wardrobe', [
      openDoor(-1, wood),
      openDoor(1, wood),
      svg`<path d="M46 42H154V177H46Z" fill=${wood.dark} stroke=${wood.dark} stroke-width="4" stroke-linejoin="round" />`,
      interior(wood),
      parts.flying ? messyShelf() : shelves(),
      hung.map((i) => garment(i, parts.flying)),
      free.map((i) => emptyHanger(i)),
      top(wood, parts.mood),
    ]),
    when(parts.flying, () => [
      flightPath(),
      floorPile(),
      flyer(35, 106, SKY, 0.64, -16, 1),
      flyer(167, 76, LILAC, 0.66, 16, 2),
      flyer(122, 128, SUN, 0.82, 5, 3),
    ]),
    when(parts.sparkles, () => [
      sparkle(25, 50, 1.25, 1),
      sparkle(177, 46, 1.05, 2),
      sparkle(100, 20, 0.9, 3),
      sparkle(60, 21, 0.6, 4),
      sparkle(142, 21, 0.65, 5),
    ]),
    neglect(
      parts,
      [
        [168, 128, 0.7, 12],
        [32, 58, 0.72, -10],
      ],
      [[185, 150]],
    ),
  ]
}

function heart(color: string): Art {
  return svg`<path d="M0 10C-14 0-13-10-6-10C-3-10-1-8 0-5C1-8 3-10 6-10C13-10 14 0 0 10Z" fill=${color} />`
}

function donateBox(parts: WardrobeParts): Art {
  return part('donate-box', [
    shadow(150, 183, 38),
    svg`<path d="M119 146L108 133L124 128L132 141Z" fill=${BOX_DARK} />`,
    svg`<path d="M181 146L189 133L176 128L168 141Z" fill=${BOX_DARK} />`,
    svg`<path d="M122 140H178L174 148H126Z" fill=${BOX_INSIDE} />`,
    shirt(136, 125, C.coral, C.coralDark, -12, 0.72),
    blob(164, 134, 13, 9, C.mint, C.mintDark, 8),
    when(parts.lostSock, () => lostSock(160, 122, 0.9, 6)),
    sleeve(166, 141, 1, SKY, 0.5),
    svg`<rect x="120" y="144" width="60" height="41" rx="4" fill=${BOX} />`,
    svg`<path d="M116 142H184V148Q184 150 182 150H118Q116 150 116 148Z" fill=${BOX_LIGHT} />`,
    svg`<path d="M126 156V179M174 156V179" stroke=${BOX_DARK} stroke-width="2" stroke-linecap="round" opacity=".5" />`,
    at(150, 166, motion('pulse', heart(C.coral)), 0, 1.15),
  ])
}

function donateView(parts: WardrobeParts, wood: Wood): Art {
  return [
    shadow(62, 183, 48),
    at(62, 185, at(-100, -185, shell(parts, wood)), 0, 0.82),
    when(parts.dumped, () => blob(112, 178, 13, 6, C.lilac, C.lilacDark, -6)),
    donateBox(parts),
    part('wish', [
      at(
        152,
        72,
        motion(
          'bob',
          [
            svg`<circle cx="-27" cy="20" r="3.5" fill=${C.cream} />`,
            svg`<circle cx="-20" cy="13" r="5" fill=${C.cream} />`,
            svg`<circle r="19" fill=${C.cream} />`,
            at(0, 1, heart(C.coral), 0, 0.95),
          ],
          1,
        ),
      ),
    ]),
    neglect(
      parts,
      [
        [166, 31, 0.74, 12],
        [118, 32, 0.72, -8],
        [32, 38, 0.7, 10],
      ],
      [
        [112, 130],
        [190, 126],
      ],
    ),
  ]
}

export function wardrobe(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = wardrobeParts(scene)
  const wood = woodOf(scene)
  const views: Record<WardrobeView, (parts: WardrobeParts, wood: Wood) => Art> = {
    closed,
    open: openView,
    donate: donateView,
  }
  return frame('wardrobe', scene, options, views[parts.view](parts, wood))
}
