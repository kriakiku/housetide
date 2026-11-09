import { nothing, svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  blob,
  COLORS as C,
  drop,
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
  shirt,
  sock,
  sparkle,
  stenchLines,
  tintOf,
  variantOf,
  when,
  bubble,
  cloud,
  ding,
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

interface Dye {
  fill: string
  shade: string
  band: string
}

export interface LaundryColors {
  sky: Dye
  coral: Dye
  sun: Dye
  mint: Dye
  lilac: Dye
  pink: Dye
  wet: readonly [Dye, Dye, Dye]
  towel: readonly [string, string]
  folded: readonly [string, string, string]
  crease: readonly [string, string]
  edge?: readonly [string, string]
}

export type LaundryLoad = 'colored' | 'white' | 'black'

function dye(fill: string, shade: string, band = fill): Dye {
  return { fill, shade, band }
}

const COLORED: LaundryColors = {
  sky: dye(C.sky, C.skyDark, C.cream),
  coral: dye(C.coral, C.coralDark, C.cream),
  sun: dye(C.sun, C.sunDark, C.coral),
  mint: dye(C.mint, C.mintDark, C.sun),
  lilac: dye(C.lilac, C.lilacDark, C.cream),
  pink: dye(C.pink, C.pinkDark, C.cream),
  wet: [dye('#3b6f93', '#2b5473'), dye('#a55a55', '#7f413e'), dye('#3f8f76', '#2e6e5a')],
  towel: [C.sun, C.coral],
  folded: [C.lilac, C.mint, C.cream],
  crease: ['#000', '.12'],
}

const SNOW = '#ffffff'
const PALE_BLUE = '#b5cbec'
const whiteDye = (fill: string): Dye => dye(fill, PALE_BLUE, PALE_BLUE)

const WHITE: LaundryColors = {
  sky: whiteDye(SNOW),
  coral: whiteDye(C.cream),
  sun: whiteDye(mix(C.cream, SNOW, 0.55)),
  mint: whiteDye(mix(SNOW, PALE_BLUE, 0.16)),
  lilac: whiteDye(mix(SNOW, PALE_BLUE, 0.28)),
  pink: whiteDye(mix(C.cream, PALE_BLUE, 0.14)),
  wet: [
    dye(mix(SNOW, PALE_BLUE, 0.42), mix(PALE_BLUE, C.glass, 0.25)),
    dye(mix(C.cream, PALE_BLUE, 0.48), mix(PALE_BLUE, C.glass, 0.25)),
    dye(mix(SNOW, PALE_BLUE, 0.62), mix(PALE_BLUE, C.glass, 0.25)),
  ],
  towel: [SNOW, PALE_BLUE],
  folded: [mix(SNOW, PALE_BLUE, 0.22), C.cream, SNOW],
  crease: [PALE_BLUE, '1'],
  edge: [PALE_BLUE, '2'],
}

const charcoal = (amount: number): string => mix(C.fly, C.metalDark, amount)
const blackDye = (amount: number): Dye =>
  dye(charcoal(amount), mix(C.fly, C.metal, 0.38), mix(C.fly, C.metal, 0.62))

const BLACK: LaundryColors = {
  sky: blackDye(0.12),
  coral: blackDye(0.28),
  sun: blackDye(0.04),
  mint: blackDye(0.2),
  lilac: blackDye(0.08),
  pink: blackDye(0.38),
  wet: [
    dye(charcoal(0.02), mix(C.fly, C.metal, 0.34)),
    dye(charcoal(0.16), mix(C.fly, C.metal, 0.34)),
    dye(charcoal(0.09), mix(C.fly, C.metal, 0.34)),
  ],
  towel: [charcoal(0.14), mix(C.fly, C.metal, 0.5)],
  folded: [charcoal(0.06), charcoal(0.2), charcoal(0.36)],
  crease: [mix(C.fly, C.metal, 0.4), '1'],
  edge: [mix(C.fly, C.metal, 0.46), '2.4'],
}

const LOADS: Record<LaundryLoad, LaundryColors> = {
  colored: COLORED,
  white: WHITE,
  black: BLACK,
}

const LOAD_NAMES = ['colored', 'white', 'black'] as const

function edged(colors: LaundryColors, art: Art): Art {
  if (!colors.edge) return art
  const [stroke, width] = colors.edge
  return svg`<g stroke=${stroke} stroke-width=${width} stroke-linejoin="round">${art}</g>`
}

type PileStep = readonly [number, readonly PilePiece[]]

function pileOf(colors: LaundryColors): readonly PileStep[] {
  const { sky, coral, sun, mint, lilac, pink } = colors
  const piece = (x: number, y: number, art: () => Art): PilePiece => [
    x,
    y,
    () => edged(colors, art()),
  ]
  return [
    [1, [piece(100, 106, () => blob(100, 106, 54, 15, sky.fill, sky.shade, -3))]],
    [
      2,
      [
        piece(70, 98, () => blob(70, 98, 26, 19, coral.fill, coral.shade, -12)),
        piece(135, 92, () => sock(135, 92, sun.fill, sun.band, 24)),
      ],
    ],
    [
      3,
      [
        piece(112, 86, () => blob(112, 86, 36, 21, mint.fill, mint.shade, 8)),
        piece(74, 80, () => blob(74, 80, 22, 16, pink.fill, pink.shade, -10)),
      ],
    ],
    [
      4,
      [
        piece(96, 66, () => shirt(96, 66, sun.fill, sun.shade, -14, 0.98)),
        piece(138, 70, () => sock(138, 70, lilac.fill, lilac.band, 34)),
      ],
    ],
    [
      5,
      [
        piece(122, 52, () => blob(122, 52, 26, 18, lilac.fill, lilac.shade, 14)),
        piece(74, 48, () => blob(74, 48, 25, 17, sky.fill, sky.shade, -18)),
      ],
    ],
    [
      6,
      [
        piece(100, 32, () => shirt(100, 32, coral.fill, coral.shade, 10, 0.9)),
        piece(142, 42, () => blob(142, 42, 16, 13, mint.fill, mint.shade, 20)),
        piece(58, 40, () => sock(58, 40, pink.fill, pink.band, -38, 0.9)),
      ],
    ],
  ]
}

export const PILE = pileOf(COLORED)

export const BASKET_FACE = '#5b3413'

export interface WickerColors {
  body: string
  dark: string
  light: string
  face: string
}

const WICKER: WickerColors = {
  body: C.wicker,
  dark: C.wickerDark,
  light: C.wickerLight,
  face: BASKET_FACE,
}

function wickerOf(scene: SceneView): WickerColors {
  const body = accentOf(scene, C.wicker)
  if (body === C.wicker) return WICKER
  return {
    body,
    dark: shadeOf(body, 0.26),
    light: tintOf(body, 0.3),
    face: isDarkColor(body) ? tintOf(body, 0.82) : mix(body, INK, 0.74),
  }
}

export function basketShell(wicker: WickerColors = WICKER): Art {
  const slats = [132, 148, 164]
  return [
    svg`<path d="M36 114H164L154 174Q153 180 146 180H54Q47 180 46 174Z" fill=${wicker.body} />`,
    slats.map(
      (y) =>
        svg`<rect x=${42 + (y - 132) * 0.14} y=${y} width=${116 - (y - 132) * 0.28} height="5" rx="2.5" fill=${wicker.dark} opacity=".55" />`,
    ),
    svg`<rect x="29" y="108" width="142" height="17" rx="8.5" fill=${wicker.light} />`,
    svg`<rect x="86" y="112.5" width="28" height="8" rx="4" fill=${wicker.dark} />`,
  ]
}

function basket(mood: Mood, wicker: WickerColors): Art {
  return [basketShell(wicker), face(100, 150, mood, wicker.face, 1.05)]
}

function pileArt(step: number, colors: LaundryColors): Art {
  return pileOf(colors)
    .filter(([min]) => step >= min)
    .map(([min, pieces]) =>
      part(
        'pile-step',
        pieces.map(([, , art]) => art()),
        min,
      ),
    )
}

export function spill(colors: LaundryColors = COLORED): Art {
  const { sky, coral, mint } = colors
  return part('overflow', [
    edged(colors, sock(34, 164, sky.fill, sky.band, 62, 0.82)),
    edged(colors, blob(170, 172, 20, 10, coral.fill, coral.shade, 6)),
    at(160, 106, motion('wobble', edged(colors, sock(0, 22, mint.fill, mint.band, -18, 0.92)))),
  ])
}

function basketView(parts: LaundryParts, colors: LaundryColors, wicker: WickerColors): Art {
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
    svg`<ellipse cx="100" cy="112" rx="62" ry="9" fill=${wicker.dark} />`,
    pileArt(parts.pile, colors),
    when(parts.overflow, () => spill(colors)),
    basket(parts.mood, wicker),
    stenchLines(lines.slice(0, parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

export function machineShell(ring: string = C.metalMid): Art {
  return [
    svg`<rect x="42" y="172" width="20" height="9" rx="3" fill=${C.metalDark} /><rect x="138" y="172" width="20" height="9" rx="3" fill=${C.metalDark} />`,
    svg`<rect x="32" y="22" width="136" height="154" rx="16" fill=${C.metal} />`,
    svg`<path d="M32 66V38a16 16 0 0 1 16-16H152a16 16 0 0 1 16 16V66Z" fill=${C.metalMid} />`,
    svg`<circle cx="56" cy="44" r="11.5" fill=${C.metal} /><rect x="54" y="33" width="4" height="12" rx="2" fill=${C.metalDark} />`,
    svg`<circle cx="100" cy="118" r="47" fill=${ring} />`,
  ]
}

function lamp(x: number, on: boolean): Art {
  return svg`<circle cx=${x} cy="44" r="4.5" fill=${on ? C.mint : C.metalDark} />`
}

function machineBody(mood: Mood, leds: number, ring: string): Art {
  return [
    machineShell(ring),
    [0, 1, 2].map((i) => lamp(132 + i * 14, i < leds)),
    face(100, 42, mood, C.fly, 0.85),
  ]
}

function machineFrame(art: Art): Art {
  return at(100, 181, at(-100, -181, art), 0, 0.84)
}

export function drumLoad(colors: LaundryColors = COLORED): Art {
  const { coral, sun, mint } = colors
  const clothes = edged(colors, [
    blob(0, -18, 15, 12, coral.fill, coral.shade, 20),
    blob(16, 11, 14, 11, sun.fill, sun.shade, 140),
    blob(-16, 10, 14, 12, mint.fill, mint.shade, 250),
  ])
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

function washing(parts: LaundryParts, colors: LaundryColors, ring: string): Art {
  return [
    shadow(100, 183, 76),
    part(
      'machine',
      motion(
        'rumble',
        machineFrame([
          machineBody(parts.mood, 2, ring),
          svg`<circle cx="100" cy="118" r="39" fill=${C.glass} />`,
          drumLoad(colors),
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

export function wetLoad(colors: LaundryColors = COLORED): Art {
  const [main, left, right] = colors.wet
  const lumps = [
    blob(100, 120, 26, 20, main.fill, main.shade, -6),
    blob(84, 136, 18, 13, left.fill, left.shade, 12),
    blob(114, 139, 19, 13, right.fill, right.shade, -10),
  ]
  const drapes = [
    svg`<path d="M70 139Q71 164 80 172Q88 164 86 142Z" fill=${left.fill} />`,
    svg`<path d="M112 142Q112 160 120 166Q128 160 128 139Z" fill=${right.fill} />`,
  ]
  return part('wet-clothes', edged(colors, colors.edge ? [drapes, lumps] : [lumps, drapes]))
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

export function puddle(): Art {
  return svg`<ellipse cx="94" cy="184" rx="30" ry="6" fill=${C.water} opacity=".65" data-part="puddle" />`
}

function wet(parts: LaundryParts, colors: LaundryColors, ring: string): Art {
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
        machineBody(parts.mood, 3, ring),
        svg`<circle cx="100" cy="118" r="39" fill="#141a33" />`,
        wetLoad(colors),
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

function hungOf(colors: LaundryColors): readonly HungItem[] {
  const { sky, coral } = colors
  const [towel, stripe] = colors.towel
  return [
    {
      x: 50,
      y: 77,
      pegs: [
        [38, 50],
        [62, 53],
      ],
      art: () => motion('sway', edged(colors, shirt(0, 0, sky.fill, sky.shade, 0, 1.12)), 1),
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
          edged(colors, [
            sock(-13, 25, coral.fill, coral.band, 0, 0.92),
            sock(13, 25, coral.fill, coral.band, 0, 0.92),
          ]),
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
          [
            edged(colors, svg`<rect x="-20" y="0" width="40" height="66" rx="5" fill=${towel} />`),
            svg`<rect x="-20" y="44" width="40" height="8" fill=${stripe} /><rect x="-20" y="55" width="40" height="4" fill=${stripe} />`,
          ],
          3,
        ),
    },
  ]
}

export const HUNG = hungOf(COLORED)

export function washingLine(): Art {
  return svg`<path d="M-4 44Q100 66 204 44" fill="none" stroke="#bfe8e0" stroke-width="4" />`
}

export function foldedStack(colors: LaundryColors = COLORED): Art {
  const [bottom, middle, top] = colors.folded
  const [crease, creaseOpacity] = colors.crease
  return part('folded', [
    shadow(100, 181, 54),
    edged(colors, [
      svg`<rect x="58" y="162" width="84" height="16" rx="7" fill=${bottom} />`,
      svg`<rect x="63" y="147" width="74" height="16" rx="7" fill=${middle} />`,
      svg`<rect x="68" y="132" width="64" height="16" rx="7" fill=${top} />`,
    ]),
    svg`<path d="M66 170h68M71 155h58M76 140h48" stroke=${crease} stroke-opacity=${creaseOpacity} stroke-width="3" stroke-linecap="round" />`,
  ])
}

export const DRY_SPARKLES = [
  [30, 134, 1.3, 1],
  [168, 138, 1.05, 2],
  [100, 112, 0.9, 3],
  [180, 26, 0.8, 4],
] as const

function tray(wicker: WickerColors): Art {
  return part('tray', [
    svg`<rect x="48" y="172" width="104" height="11" rx="5.5" fill=${wicker.body} />`,
    svg`<rect x="56" y="176" width="88" height="3" rx="1.5" fill=${wicker.dark} opacity=".55" />`,
  ])
}

function drying(colors: LaundryColors, wicker: WickerColors): Art {
  const hung = hungOf(colors)
  return [
    washingLine(),
    part('line', [
      hung.map((item) => at(item.x, item.y, item.art())),
      hung.flatMap((item) => item.pegs.map(([x, y]) => peg(x, y))),
    ]),
    foldedStack(colors),
    tray(wicker),
    DRY_SPARKLES.map(([x, y, size, delay]) => sparkle(x, y, size, delay)),
  ]
}

export function laundry(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = laundryParts(scene)
  const colors = LOADS[variantOf(scene, LOAD_NAMES, 'colored')]
  const wicker = wickerOf(scene)
  const ring = accentOf(scene, C.metalMid)
  const views: Record<LaundryView, () => Art> = {
    basket: () => basketView(parts, colors, wicker),
    washing: () => washing(parts, colors, ring),
    wet: () => wet(parts, colors, ring),
    drying: () => drying(colors, wicker),
  }
  return frame('laundry', scene, options, views[parts.view]() ?? nothing)
}
