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
  stenchLines,
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type RecycleView = 'bins' | 'sorting' | 'bundle' | 'tidy'

export interface RecycleParts {
  view: RecycleView
  pile: number
  overflow: boolean
  lids: boolean
  asleep: boolean
  banana: number
  strayCan: boolean
  blush: boolean
  sweat: boolean
  stench: number
  flies: number
  soggy: boolean
  mood: Mood
}

export const MAX_PILE = 6

const BANANA_AT = [0.05, 0.6] as const
const STRAY_CAN_AT = 0.25
const SWEAT_AT = 0.45
const STENCH_AT = [0.35, 0.6, 0.85] as const
const FLIES_AT = [0.5, 0.75, 0.92] as const
const SICK_AT = 0.7

const QUIET = {
  pile: 0,
  overflow: false,
  asleep: false,
  banana: 0,
  strayCan: false,
  blush: false,
  sweat: false,
  stench: 0,
  flies: 0,
  soggy: false,
} as const

export function recycleParts(scene: SceneView): RecycleParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') return { ...QUIET, view: 'tidy', lids: true, mood: 'happy' }
  const banana = reached(stink, BANANA_AT)
  const strayCan = stink >= STRAY_CAN_AT
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  const sick = stink >= SICK_AT
  const shame = {
    banana,
    strayCan,
    blush: strayCan,
    sweat: stink >= SWEAT_AT,
    stench,
    flies,
  }
  if (state === 'running') {
    return { ...QUIET, view: 'sorting', lids: false, stench: Math.min(1, stench), mood: 'happy' }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      ...shame,
      view: 'bundle',
      lids: true,
      strayCan: false,
      soggy: stink >= STENCH_AT[0],
      mood: sick ? 'sick' : strayCan ? 'worried' : 'calm',
    }
  }
  const resting = state === 'resting'
  const due = state === 'due'
  const pile = due ? MAX_PILE : resting ? 0 : Math.min(MAX_PILE - 1, Math.floor(fill * MAX_PILE))
  let mood: Mood = resting ? 'sleepy' : pile >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (strayCan && !due) mood = 'worried'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...shame,
    view: 'bins',
    pile,
    overflow: due,
    lids: resting,
    asleep: resting,
    mood,
  }
}

const PAPER = '#fbf7ec'
const PAPER_DARK = C.creamDark
const AQUA = '#9fe8d6'
const AQUA_DARK = '#5fbfa8'
const AMBER = C.wicker
const AMBER_DARK = C.wickerDark
const TIN = C.coral
const TIN_DARK = C.coralDark
const TIN_ALT = C.lilac
const TIN_ALT_DARK = C.lilacDark
const BANANA = '#ffd84d'
const BANANA_DARK = C.sunDark
const BANANA_RIPE = '#8a6a2c'
const BOX = C.wicker
const BOX_DARK = C.wickerDark
const BOX_LIGHT = C.wickerLight
const TWINE = '#fbeed2'
const TYRE = C.fly
const SWEAT = C.water
const BLUSH = '#ff6f91'

function glassBottle(fill: string, dark: string): Art {
  return [
    svg`<rect x="-6.5" y="-62" width="13" height="8" rx="2.5" fill=${C.coral} />`,
    svg`<path d="M-5-55H5V-42C5-34 14-31 14-20V-3Q14 0 11 0H-11Q-14 0-14-3V-20C-14-31-5-34-5-42Z" fill=${fill} />`,
    svg`<rect x="-14" y="-22" width="28" height="13" fill=${PAPER} />`,
    svg`<rect x="-9" y="-17.5" width="18" height="3.6" rx="1.8" fill=${dark} />`,
    svg`<rect x="-9" y="-40" width="4" height="13" rx="2" fill="#fff" opacity=".55" transform="rotate(16 -7 -33)" />`,
  ]
}

function tinCan(fill: string, dark: string): Art {
  return [
    svg`<rect x="-13" y="-42" width="26" height="42" rx="4" fill=${fill} />`,
    svg`<rect x="-13" y="-30" width="26" height="14" fill=${PAPER} />`,
    svg`<rect x="-8" y="-25" width="16" height="4" rx="2" fill=${dark} />`,
    svg`<rect x="-11.5" y="-45" width="23" height="6" rx="2.5" fill=${C.metal} />`,
    svg`<rect x="-11.5" y="-3" width="23" height="5" rx="2.5" fill=${C.metalMid} />`,
    svg`<rect x="-9" y="-37" width="4" height="30" rx="2" fill="#fff" opacity=".4" />`,
  ]
}

function crushedCan(fill: string, dark: string): Art {
  return [
    svg`<path d="M-15-6L-11-14L-14-20L-9-26H10L15-21L10-15L15-8L11 0H-11Z" fill=${fill} />`,
    svg`<path d="M-11-14L0-11L10-15M-14-20L-2-19" fill="none" stroke=${dark} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<rect x="-10" y="-29" width="21" height="5" rx="2.2" fill=${C.metal} />`,
  ]
}

function newspaper(): Art {
  return [
    svg`<path d="M-18-44Q-18-48-14-48H9L18-39V-3Q18 0 15 0H-15Q-18 0-18-3Z" fill=${PAPER} />`,
    svg`<path d="M9-48V-42Q9-39 12-39H18Z" fill=${PAPER_DARK} />`,
    svg`<rect x="-13" y="-42" width="16" height="6" rx="1.5" fill=${C.fly} />`,
    svg`<path d="M-13-30H13M-13-23H13M-13-16H13" stroke=${PAPER_DARK} stroke-width="3" stroke-linecap="round" />`,
  ]
}

function paperBall(): Art {
  return [
    svg`<path d="M-15-8L-11-20L-3-26L8-23L16-13L14-3L6 2L-7 2Z" fill=${PAPER} />`,
    svg`<path d="M-11-20L-4-12L8-23M-4-12L-7 2M-4-12L14-3" fill="none" stroke=${PAPER_DARK} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`,
  ]
}

function bananaArt(ripe: boolean): Art {
  const body = ripe ? mix(BANANA, BANANA_RIPE, 0.22) : BANANA
  const edge = ripe ? BANANA_RIPE : BANANA_DARK
  return part('banana', [
    svg`<path d="M-6 2C-24-14-26-42-11-60L-5-66L0-61C-8-42-3-20 14-6C12 2 2 6-6 2Z" fill=${body} />`,
    svg`<path d="M-3-58C-13-40-9-16 8-3" fill="none" stroke=${edge} stroke-width="2.4" stroke-linecap="round" />`,
    svg`<path d="M-11-60L-6-69L-1-67L0-61Z" fill=${BANANA_RIPE} />`,
    when(
      ripe,
      () =>
        svg`<g fill=${BANANA_RIPE}><circle cx="-12" cy="-34" r="2.8" /><circle cx="-14" cy="-20" r="2.1" /><circle cx="-5" cy="-11" r="2.6" /><circle cx="-9" cy="-46" r="1.8" /></g>`,
    ),
  ])
}

interface BinTone {
  body: string
  dark: string
  light: string
}

interface BinShape {
  cx: number
  top: number
  half: number
  foot: number
  rim: number
}

const BOTTOM = 179
const LEFT: BinShape = { cx: 44, top: 108, half: 28, foot: 23, rim: 33 }
const MIDDLE: BinShape = { cx: 100, top: 96, half: 34, foot: 28, rim: 39 }
const RIGHT: BinShape = { cx: 156, top: 108, half: 28, foot: 23, rim: 33 }

const GLASS_TONE: BinTone = { body: C.mint, dark: C.mintDark, light: tintOf(C.mint, 0.35) }
const CAN_TONE: BinTone = { body: C.sun, dark: C.sunDark, light: tintOf(C.sun, 0.4) }

function bodyPath({ cx, top, half, foot }: BinShape): string {
  const low = BOTTOM - 7
  return `M${cx - half} ${top}H${cx + half}L${cx + foot} ${low}Q${cx + foot - 1} ${BOTTOM} ${cx + foot - 7} ${BOTTOM}H${cx - foot + 7}Q${cx - foot + 1} ${BOTTOM} ${cx - foot} ${low}Z`
}

function sidePanel({ cx, top, half, foot }: BinShape): string {
  const inset = half * 0.32
  const low = BOTTOM - 7
  return `M${cx + half - inset} ${top}H${cx + half}L${cx + foot} ${low}Q${cx + foot - 1} ${BOTTOM} ${cx + foot - 7} ${BOTTOM}H${cx + foot - inset - 2}Z`
}

function wheels({ cx, foot }: BinShape): Art {
  return [-1, 1].map((side) => {
    const x = cx + side * (foot - 8)
    return svg`<circle cx=${x} cy=${BOTTOM + 1} r="5.5" fill=${TYRE} /><circle cx=${x} cy=${BOTTOM + 1} r="2" fill=${C.metalMid} />`
  })
}

function backOpen({ cx, top, rim }: BinShape, tone: BinTone): Art {
  return [
    svg`<rect x=${cx - rim + 4} y=${top - 22} width=${(rim - 4) * 2} height="26" rx="9" fill=${shadeOf(tone.dark, 0.25)} />`,
    svg`<rect x=${cx - 11} y=${top - 19} width="22" height="5" rx="2.5" fill=${tone.dark} />`,
    svg`<ellipse cx=${cx} cy=${top - 1} rx=${rim - 4} ry="8" fill=${shadeOf(tone.dark, 0.6)} />`,
  ]
}

function closedLid({ cx, top, rim }: BinShape, tone: BinTone): Art {
  return [
    svg`<rect x=${cx - 12} y=${top - 23} width="24" height="10" rx="5" fill=${tone.light} />`,
    svg`<path d=${`M${cx - rim} ${top}Q${cx - rim} ${top - 18} ${cx - rim + 16} ${top - 18}H${cx + rim - 16}Q${cx + rim} ${top - 18} ${cx + rim} ${top}Z`} fill=${tone.dark} />`,
  ]
}

function bin(
  name: string,
  shape: BinShape,
  tone: BinTone,
  lids: boolean,
  inside: Art,
  front: Art,
): Art {
  const { cx, top, rim } = shape
  return part(name, [
    wheels(shape),
    when(!lids, () => backOpen(shape, tone)),
    inside,
    svg`<path d=${bodyPath(shape)} fill=${tone.body} />`,
    svg`<path d=${sidePanel(shape)} fill=${tone.dark} opacity=".55" />`,
    when(lids, () => closedLid(shape, tone)),
    svg`<rect x=${cx - rim} y=${top - 6} width=${rim * 2} height="13" rx="6.5" fill=${tone.light} />`,
    front,
  ])
}

function badge(cx: number, glyph: Art): Art {
  return at(cx, 147, [svg`<circle r="16" fill=${PAPER} />`, glyph])
}

function glassGlyph(): Art {
  return at(0, 13, glassBottle(C.mintDark, C.mintDark), 0, 0.43)
}

function canGlyph(): Art {
  return at(0, 10.5, tinCan(C.sunDark, C.sunDark), 0, 0.48)
}

function paperGlyph(color: string): Art {
  return [
    svg`<rect x="-5.5" y="-7" width="11" height="14" rx="1.6" fill=${color} />`,
    svg`<path d="M-3-3H3M-3 0H3M-3 3H3" stroke=${PAPER} stroke-width="1.5" stroke-linecap="round" />`,
  ]
}

function faceColor(body: string): string {
  return isDarkColor(body) ? tintOf(body, 0.82) : mix(body, INK, 0.74)
}

function middleFront(parts: RecycleParts, tone: BinTone): Art {
  const eyes = faceColor(tone.body)
  return [
    at(100, 118, [svg`<circle r="9.5" fill=${PAPER} />`, paperGlyph(tone.dark)], 0, 1.2),
    face(100, 146, parts.mood, eyes, 1.15),
    when(
      parts.blush,
      () =>
        svg`<g data-part="blush" fill=${BLUSH} opacity=".75"><ellipse cx="80" cy="155" rx="6" ry="3.6" /><ellipse cx="120" cy="155" rx="6" ry="3.6" /></g>`,
    ),
    when(parts.sweat, () =>
      part(
        'sweat',
        at(
          126,
          128,
          motion(
            'drip',
            svg`<path d="M0-8C4-3 6 0 6 3a6 6 0 0 1-12 0C-6 0-4-3 0-8Z" fill=${SWEAT} />`,
            2,
          ),
        ),
      ),
    ),
  ]
}

type Slot = readonly [step: number, x: number, y: number, rotate: number, scale: number, art: Art]

const LEFT_PILE: readonly Slot[] = [
  [1, 42, 124, -6, 1.12, tinCan(TIN, TIN_DARK)],
  [4, 60, 118, 18, 1, tinCan(TIN_ALT, TIN_ALT_DARK)],
  [5, 26, 112, -16, 1, paperBall()],
  [6, 44, 84, 22, 1.05, crushedCan(TIN, TIN_DARK)],
]

const MIDDLE_PILE: readonly Slot[] = [
  [2, 84, 114, -10, 1.1, glassBottle(AQUA, AQUA_DARK)],
  [3, 116, 112, 14, 1.05, glassBottle(AMBER, AMBER_DARK)],
  [5, 100, 100, 3, 1, glassBottle(AQUA, AQUA_DARK)],
  [6, 80, 80, -22, 0.95, glassBottle(AMBER, AMBER_DARK)],
  [6, 120, 78, 22, 0.95, glassBottle(AQUA, AQUA_DARK)],
]

const RIGHT_PILE: readonly Slot[] = [
  [6, 160, 84, -8, 1.05, paperBall()],
  [4, 176, 112, 18, 0.95, paperBall()],
  [5, 140, 116, -14, 0.95, newspaper()],
  [3, 160, 122, 7, 1.08, newspaper()],
]

function pileOf(slots: readonly Slot[], step: number): Art {
  return slots
    .filter(([min]) => step >= min)
    .map(([min, x, y, rotate, scale, art]) => part('pile-item', at(x, y, art, rotate, scale), min))
}

function spill(): Art {
  return part('overflow', [
    at(26, 184, crushedCan(TIN_ALT, TIN_ALT_DARK), -14, 0.74),
    at(176, 184, paperBall(), 12, 0.8),
    at(116, 178, glassBottle(AQUA, AQUA_DARK), 90, 0.56),
  ])
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

function neglect(parts: RecycleParts, lines: Array<readonly [number, number]>, spots: Art): Art {
  return [stenchLines(lines.slice(0, parts.stench)), spots]
}

function flyField(parts: RecycleParts, spots: ReadonlyArray<readonly [number, number]>): Art {
  return spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i))
}

function trio(parts: RecycleParts, middle: BinTone, left: Art, mid: Art, right: Art): Art {
  return [
    shadow(100, 184, 88),
    bin('bin-glass', LEFT, GLASS_TONE, parts.lids, left, badge(LEFT.cx, glassGlyph())),
    bin('bin-cans', RIGHT, CAN_TONE, parts.lids, right, badge(RIGHT.cx, canGlyph())),
    bin('bin-paper', MIDDLE, middle, parts.lids, mid, middleFront(parts, middle)),
  ]
}

function strays(parts: RecycleParts): { left: Art; mid: Art } {
  return {
    left: when(parts.banana > 0, () =>
      at(60, 120 - Math.max(0, parts.pile - 2) * 8, bananaArt(parts.banana > 1), 14, 0.84),
    ),
    mid: when(parts.strayCan, () =>
      part(
        'stray-can',
        at(104, 112 - Math.max(0, parts.pile - 4) * 8, tinCan(TIN, TIN_DARK), 12, 1.12),
      ),
    ),
  }
}

function binsView(parts: RecycleParts, middle: BinTone): Art {
  const { left, mid } = strays(parts)
  return [
    trio(
      parts,
      middle,
      [pileOf(LEFT_PILE, parts.pile), left],
      [pileOf(MIDDLE_PILE, parts.pile), mid],
      pileOf(RIGHT_PILE, parts.pile),
    ),
    when(parts.overflow, spill),
    when(parts.asleep, () => [zed(132, 66, 0.72, 1), zed(150, 46, 1, 2), zed(170, 30, 0.62, 3)]),
    neglect(
      parts,
      [
        [22, 72],
        [178, 66],
        [146, 60],
      ],
      flyField(parts, [
        [38, 36],
        [170, 30],
        [100, 18],
      ]),
    ),
  ]
}

function arc(d: string): Art {
  return svg`<path d=${d} fill="none" stroke="#cfe2ff" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10" />`
}

function flying(x: number, y: number, rotate: number, delay: number, art: Art): Art {
  return part('flying', at(x, y, motion('wobble', at(0, 0, art, rotate), delay)))
}

function sortingView(parts: RecycleParts, middle: BinTone): Art {
  return [
    part('arcs', [arc('M170 98C160-2 62 0 44 74'), arc('M30 98C40 16 138 14 156 78')]),
    at(
      100,
      0,
      motion(
        'bob',
        at(
          -100,
          0,
          trio(
            parts,
            middle,
            at(44, 126, glassBottle(AQUA, AQUA_DARK), -5, 0.8),
            at(100, 124, newspaper(), 3, 1.05),
            at(156, 124, tinCan(TIN, TIN_DARK), 7),
          ),
        ),
        1,
      ),
    ),
    flying(58, 42, -128, 1, at(0, 23, glassBottle(AMBER, AMBER_DARK), 0, 0.74)),
    flying(146, 44, 128, 3, at(0, 17, tinCan(TIN_ALT, TIN_ALT_DARK), 0, 0.8)),
    part('flying', at(100, 50, motion('sway', at(0, 17, newspaper(), -10, 0.72), 2))),
    stenchLines(([[24, 118]] as const).slice(0, parts.stench)),
  ]
}

function slab(x: number, y: number, w: number, fill: string, dark: string): Art {
  return [
    svg`<rect x=${x} y=${y} width=${w} height="12" rx="3" fill=${fill} />`,
    svg`<rect x=${x} y=${y + 8.5} width=${w} height="3.5" rx="1.75" fill=${dark} />`,
    svg`<path d=${`M${x + w - 11} ${y + 2}V${y + 8}M${x + 11} ${y + 2}V${y + 8}`} stroke=${dark} stroke-width="2" stroke-linecap="round" />`,
  ]
}

function bundleArt(soggy: boolean): Art {
  const box = soggy ? mix(BOX, C.musty, 0.45) : BOX
  const dark = soggy ? mix(BOX_DARK, C.mustyDark, 0.5) : BOX_DARK
  const light = soggy ? mix(BOX_LIGHT, C.musty, 0.35) : BOX_LIGHT
  return part(
    'bundle',
    at(4, 0, [
      shadow(161, 185, 32),
      slab(133, 172, 56, box, dark),
      slab(136, 161, 54, light, dark),
      slab(132, 150, 56, box, dark),
      slab(135, 139, 54, light, dark),
      svg`<path d="M161 139V184" stroke=${TWINE} stroke-width="4.5" />`,
      svg`<path d="M133 162H190" stroke=${TWINE} stroke-width="4.5" />`,
      at(161, 137, [
        svg`<path d="M0 0C-5-13-22-14-22-5C-22 3-8 3 0 0ZM0 0C5-13 22-14 22-5C22 3 8 3 0 0Z" fill=${TWINE} />`,
        svg`<path d="M-2 2L-10 13M2 2L10 13" stroke=${TWINE} stroke-width="3.6" stroke-linecap="round" />`,
        svg`<rect x="-4.5" y="-4" width="9" height="8" rx="3" fill=${dark} />`,
      ]),
    ]),
  )
}

function exitBubble(): Art {
  return part('reminder', [
    svg`<circle cx="152" cy="114" r="3.5" fill=${C.cream} /><circle cx="146" cy="104" r="5" fill=${C.cream} />`,
    at(
      160,
      72,
      motion('pulse', [
        svg`<circle r="24" fill=${C.cream} />`,
        svg`<path d="M-13 0H8" stroke=${BOX_DARK} stroke-width="6" stroke-linecap="round" />`,
        svg`<path d="M2-9L12 0L2 9" fill="none" stroke=${BOX_DARK} stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
      ]),
    ),
  ])
}

function bundleView(parts: RecycleParts, middle: BinTone): Art {
  const peel = when(parts.banana > 0, () => at(60, 106, bananaArt(parts.banana > 1), 14, 0.8))
  return [
    at(78, 184, at(-100, -184, trio(parts, middle, peel, [], [])), 0, 0.78),
    bundleArt(parts.soggy),
    exitBubble(),
    neglect(
      parts,
      [
        [30, 106],
        [120, 104],
        [186, 134],
      ],
      flyField(parts, [
        [44, 50],
        [118, 40],
        [80, 26],
      ]),
    ),
  ]
}

function sprout(): Art {
  return part(
    'sprout',
    at(
      100,
      72,
      motion(
        'sway',
        [
          svg`<path d="M0 0V-22" stroke=${C.leafDark} stroke-width="4" stroke-linecap="round" />`,
          svg`<path d="M0-18C-5-32-20-34-25-30C-23-19-9-13 0-18Z" fill=${C.leaf} />`,
          svg`<path d="M0-22C4-36 18-40 25-35C23-24 9-17 0-22Z" fill=${C.leafDark} />`,
        ],
        1,
      ),
    ),
  )
}

function checkMark(x: number, y: number, delay: number): Art {
  return part(
    'check',
    at(
      x,
      y,
      motion(
        'bob',
        [
          svg`<circle r="13" fill=${C.check} />`,
          svg`<path d="M-6 0L-1.5 5L7-5" fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />`,
        ],
        delay,
      ),
    ),
  )
}

const TIDY_SPARKLES = [
  [20, 54, 1.25, 1],
  [178, 48, 1.1, 2],
  [60, 26, 0.8, 3],
  [146, 22, 0.9, 4],
  [100, 12, 0.5, 5],
] as const

function tidyView(parts: RecycleParts, middle: BinTone): Art {
  return [
    trio(parts, middle, [], [], []),
    sprout(),
    checkMark(44, 66, 1),
    checkMark(156, 66, 3),
    TIDY_SPARKLES.map(([x, y, s, d]) => sparkle(x, y, s, d)),
  ]
}

function middleTone(scene: SceneView): BinTone {
  const body = accentOf(scene, C.sky)
  if (body === C.sky) return { body, dark: C.skyDark, light: tintOf(C.sky, 0.4) }
  return { body, dark: shadeOf(body, 0.26), light: tintOf(body, 0.38) }
}

export function recycle(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = recycleParts(scene)
  const tone = middleTone(scene)
  const views: Record<RecycleView, (parts: RecycleParts, tone: BinTone) => Art> = {
    bins: binsView,
    sorting: sortingView,
    bundle: bundleView,
    tidy: tidyView,
  }
  return frame('recycle', scene, options, views[parts.view](parts, tone))
}
