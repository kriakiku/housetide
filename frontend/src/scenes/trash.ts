import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  clamp01,
  COLORS as C,
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
  stenchLines,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type TrashView = 'filling' | 'heap' | 'carrying' | 'empty' | 'fresh'

export interface TrashParts {
  view: TrashView
  pile: number
  lid: number
  stench: number
  flies: number
  grime: number
  bone: boolean
  raccoon: boolean
  mood: Mood
}

export const MAX_PILE = 4

const LID_ANGLE = [0, 14, 23, 32, 40] as const
const STENCH_AT = [0.05, 0.3, 0.55] as const
const FLIES_AT = [0.4, 0.65, 0.88] as const
const GRIME_AT = [0.15, 0.5, 0.8] as const
const EMPTY_FLIES_AT = [0.6, 0.9] as const
const BONE_AT = 0.3
const RACCOON_AT = 0.75
const SICK_AT = 0.45

export function trashParts(scene: SceneView): TrashParts {
  const { state, fill, stink } = scene
  const quiet = { pile: 0, lid: 0, stench: 0, flies: 0, grime: 0, bone: false, raccoon: false }
  if (state === 'clean') return { ...quiet, view: 'fresh', lid: 26, mood: 'happy' }
  const stench = reached(stink, STENCH_AT)
  const grime = reached(stink, GRIME_AT)
  if (state === 'running') {
    return { ...quiet, view: 'carrying', lid: 76, stench, grime, mood: 'happy' }
  }
  if (state === 'waiting') {
    return {
      ...quiet,
      view: 'empty',
      lid: 76,
      stench,
      grime,
      flies: reached(stink, EMPTY_FLIES_AT),
      mood: stink >= 0.6 ? 'sick' : 'calm',
    }
  }
  const flies = reached(stink, FLIES_AT)
  const bone = stink >= BONE_AT
  const raccoon = stink >= RACCOON_AT
  const sick = stink >= SICK_AT
  if (state === 'due') {
    const mood: Mood = sick ? 'sick' : 'pleading'
    return { view: 'heap', pile: MAX_PILE, lid: 0, stench, flies, grime, bone, raccoon, mood }
  }
  const pile =
    state === 'resting' ? 0 : Math.min(MAX_PILE, Math.floor(clamp01(fill) * (MAX_PILE + 1)))
  let mood: Mood = state === 'resting' ? 'sleepy' : pile >= 3 ? 'worried' : 'calm'
  if (sick) mood = 'sick'
  return {
    view: 'filling',
    pile,
    lid: LID_ANGLE[pile] ?? 0,
    stench,
    flies,
    grime,
    bone,
    raccoon,
    mood,
  }
}

const FACE_INK = '#124a3a'
const HOLLOW = '#171b30'
const GRIME_INK = '#4f5a2c'

function crumple(x: number, y: number, rotate = 0, scale = 1, color: string = C.cream): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-15-5L-7-15L3-11L13-14L16-3L12 8L3 14L-9 12L-16 3Z" fill=${color} stroke-linejoin="round" />`,
      svg`<path d="M-8-6L0 0L9-6M0 0L-3 9" fill="none" stroke=${C.creamDark} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`,
    ],
    rotate,
    scale,
  )
}

function can(x: number, y: number, rotate = 0, scale = 1): Art {
  return at(
    x,
    y,
    [
      svg`<rect x="-12" y="-17" width="24" height="34" rx="4" fill=${C.metalMid} />`,
      svg`<rect x="-12" y="-9" width="24" height="18" fill=${C.coral} />`,
      svg`<circle r="5" fill=${C.cream} />`,
      svg`<ellipse cy="-17" rx="12" ry="3.6" fill=${C.metal} />`,
      svg`<path d="M-5-17h7" stroke=${C.metalDark} stroke-width="2.4" stroke-linecap="round" />`,
    ],
    rotate,
    scale,
  )
}

function carton(x: number, y: number, rotate = 0, scale = 1): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-13-8L-8-22H8L13-8Z" fill=${C.skyDark} />`,
      svg`<rect x="-8" y="-27" width="16" height="6" rx="1.5" fill=${C.cream} />`,
      svg`<rect x="-13" y="-8" width="26" height="36" rx="2.5" fill=${C.sky} />`,
      svg`<path d="M-13 12q6.5-7 13 0t13 0v14h-26Z" fill=${C.cream} />`,
    ],
    rotate,
    scale,
  )
}

function core(x: number, y: number, rotate = 0, scale = 1): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-12-14Q0-20 12-14Q5-6 5 0Q5 6 12 14Q0 20-12 14Q-5 6-5 0Q-5-6-12-14Z" fill=${C.spark} />`,
      svg`<path d="M-12-14Q0-20 12-14Q6-10 0-10T-12-14ZM-12 14Q0 20 12 14Q6 10 0 10T-12 14Z" fill=${C.coral} />`,
      svg`<path d="M0-16q0-6 4-9" fill="none" stroke=${C.wickerDark} stroke-width="3.2" stroke-linecap="round" />`,
    ],
    rotate,
    scale,
  )
}

function banana(x: number, y: number, rotate = 0, scale = 1): Art {
  return part(
    'banana',
    at(
      x,
      y,
      [
        svg`<path d="M-4-22H4L5-6H-5Z" fill=${C.sunDark} />`,
        svg`<path d="M-5-10C-18-11-28 2-28 20C-20 19-10 10-2 2Z" fill=${C.sun} />`,
        svg`<path d="M5-10C18-11 28 2 28 20C20 19 10 10 2 2Z" fill=${C.sun} />`,
        svg`<path d="M-6-8C-8 6-6 18 0 26C6 18 8 6 6-8Z" fill=${C.spark} />`,
        svg`<path d="M-28 20l5-1M28 20l-5-1" stroke=${C.soil} stroke-width="4" stroke-linecap="round" />`,
      ],
      rotate,
      scale,
    ),
  )
}

function fishbone(x: number, y: number, rotate = 0, scale = 1): Art {
  return part(
    'fishbone',
    at(
      x,
      y,
      [
        svg`<path d="M-24 0H18M-32-9L-24 0L-32 9M-14-9V9M-5-12V12M4-12V12M12-10V10" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        svg`<path d="M14-14Q32-13 37 0Q32 13 14 14Q18 0 14-14Z" fill=${C.cream} />`,
        svg`<path d="M23-5l5 5m0-5l-5 5" stroke=${HOLLOW} stroke-width="2.4" stroke-linecap="round" />`,
      ],
      rotate,
      scale,
    ),
  )
}

const PILE: ReadonlyArray<readonly [number, () => Art]> = [
  [1, () => crumple(66, 84, -8, 0.95)],
  [2, () => carton(92, 74, -8, 0.92)],
  [3, () => can(62, 62, -26, 1)],
  [4, () => [core(118, 73, 16, 0.85), crumple(44, 86, 20, 0.72, '#fff')]],
]

function pileArt(step: number): Art {
  return PILE.filter(([min]) => step >= min).map(([min, art]) => part('pile-step', art(), min))
}

function heap(bone: boolean): Art {
  return part('heap', [
    svg`<path d="M46 98C38 74 52 62 66 58C76 42 124 42 134 58C150 62 162 76 154 98Z" fill=${C.lilac} />`,
    svg`<path d="M58 84q10-12 24-10M122 66q16 2 22 16" fill="none" stroke=${C.lilacDark} stroke-width="4" stroke-linecap="round" />`,
    carton(66, 72, -24, 1),
    crumple(108, 62, 12, 1.05),
    can(138, 76, 24, 1.1),
    core(88, 60, -22, 0.9),
    crumple(44, 90, -14, 0.8, '#fff'),
    when(bone, () => fishbone(114, 84, -14, 0.82)),
  ])
}

function lidArt(color: string): Art {
  return [
    svg`<rect x="-55.5" y="-46" width="15" height="8.5" rx="4.2" fill=${C.metalDark} />`,
    svg`<rect x="-51" y="-40" width="6" height="8" fill=${C.metalDark} />`,
    svg`<path d="M-100-6C-98-46-6-46-4-6Z" fill=${color} />`,
    svg`<path d="M-86-14Q-78-29-58-31" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".5" />`,
    svg`<rect x="-106" y="-8" width="110" height="9.5" rx="4.7" fill=${C.metal} />`,
  ]
}

function hingedLid(angle: number, color: string): Art {
  return part('lid', at(152, 92, lidArt(color), angle))
}

function grimeArt(level: number): Art {
  return part('grime', [
    when(level >= 1, () => [
      svg`<path d="M60 102H78V116a4.5 4.5 0 0 1-9 0V110a3 3 0 0 0-6 0V122a3.5 3.5 0 0 1-3.5 3.5L60 102Z" fill=${GRIME_INK} />`,
    ]),
    when(level >= 2, () => [
      svg`<path d="M118 102H142L141 128a4 4 0 0 1-8 0V114a3 3 0 0 0-6 0V118a4.5 4.5 0 0 1-9 0Z" fill=${GRIME_INK} />`,
      svg`<ellipse cx="74" cy="154" rx="7" ry="5" fill=${GRIME_INK} opacity=".75" />`,
    ]),
    when(level >= 3, () => [
      svg`<ellipse cx="126" cy="152" rx="10" ry="7" fill=${GRIME_INK} opacity=".75" /><circle cx="114" cy="161" r="3" fill=${GRIME_INK} opacity=".75" /><circle cx="86" cy="164" r="2.6" fill=${GRIME_INK} opacity=".75" />`,
    ]),
  ])
}

function ooze(level: number): Art {
  return when(level >= 2, () =>
    part(
      'ooze',
      svg`<path d=${level >= 3 ? 'M34 184C30 176 56 174 72 178C96 174 132 174 160 179C176 178 176 188 160 188H46C38 188 36 187 34 184Z' : 'M46 185C42 178 66 176 84 180C96 178 112 180 112 185C112 189 54 190 46 185Z'} fill=${C.mustyDark} />`,
    ),
  )
}

interface BinTone {
  body: string
  shade: string
  ink: string
}

function binToneOf(scene: SceneView): BinTone {
  const body = accentOf(scene, C.mint)
  return body === C.mint
    ? { body, shade: C.mintDark, ink: FACE_INK }
    : { body, shade: shadeOf(body), ink: shadeOf(body, 0.8) }
}

interface BinOptions {
  tone: BinTone
  mood: Mood
  grime: number
  shine?: boolean
  draped?: boolean
}

function binBody({ tone, mood, grime, shine = false, draped = false }: BinOptions): Art {
  const decay = (grime / 3) * 0.72
  const body = mix(tone.body, C.musty, decay)
  const shade = mix(tone.shade, C.mustyDark, decay)
  return [
    part('body', [
      svg`<path d="M53 98H147L140 173Q139 180 132 180H68Q61 180 60 173Z" fill=${body} />`,
      svg`<path d="M128 98H147L140 173Q139 180 132 180H118Q126 180 126.5 172Z" fill=${shade} opacity=".55" />`,
      svg`<path d="M59.3 164H140.700L140 173Q139 180 132 180H68Q61 180 60 173Z" fill=${shade} />`,
      svg`<path d="M66 110L71 158" fill="none" stroke="#fff" stroke-width=${shine ? 7 : 5} stroke-linecap="round" opacity=${shine ? 0.75 : 0.34} />`,
      when(
        shine,
        () =>
          svg`<path d="M81 110L82.5 124" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6" />`,
      ),
    ]),
    when(grime > 0, () => grimeArt(grime)),
    part('pedal', [
      svg`<rect x="93" y="170" width="14" height="9" rx="2" fill=${C.metalDark} />`,
      svg`<path d="M84 176H116L124 183Q126 187 121 187H79Q74 187 76 183Z" fill=${C.metalMid} />`,
      svg`<path d="M84 181H116" stroke=${C.metal} stroke-width="2.6" stroke-linecap="round" />`,
    ]),
    svg`<rect x="46" y="92" width="108" height="11" rx="5.5" fill=${C.metalMid} data-part="rim" />`,
    when(draped, () =>
      part('new-bag', [
        svg`<path d="M45 90H155V104Q148 113 139 105Q131 114 121 105Q111 114 100 105Q89 114 79 105Q69 114 61 105Q52 113 45 104Z" fill=${C.lilac} />`,
        svg`<path d="M56 96H104" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".5" />`,
      ]),
    ),
    face(100, 136, mood, tone.ink, 1.16),
  ]
}

function opening(color: string = HOLLOW): Art {
  return svg`<ellipse cx="100" cy="93" rx="50" ry="10" fill=${color} data-part="opening" />`
}

function placed(cx: number, scale: number, art: Art): Art {
  return at(cx, 181, at(-100, -181, art), 0, scale)
}

function lidColor(grime: number, tone: BinTone): string {
  return mix(tone.body, C.musty, (grime / 3) * 0.72)
}

function raccoonArt(): Art {
  const gray = '#7a8299'
  return part('raccoon', [
    svg`<path d="M172 140Q164 154 146 151" fill="none" stroke=${gray} stroke-width="11" stroke-linecap="round" />`,
    at(
      163,
      126,
      motion('bob', [
        svg`<path d="M-18-9L-20-24L-5-15ZM18-9L20-24L5-15Z" fill=${gray} />`,
        svg`<ellipse cy="1" rx="22" ry="18" fill=${gray} />`,
        svg`<path d="M-21-4Q-10-10 0-3Q10-10 21-4Q19 9 8 7Q2 5 0 3Q-2 5-8 7Q-19 9-21-4Z" fill=${HOLLOW} />`,
        svg`<ellipse cy="12" rx="10" ry="6.5" fill=${C.cream} />`,
        svg`<ellipse cy="9" rx="3.5" ry="2.6" fill=${HOLLOW} />`,
        svg`<circle cx="-9" cy="-1" r="4.2" fill="#fff" /><circle cx="9" cy="-1" r="4.2" fill="#fff" /><circle cx="-10.5" cy="0" r="2" fill=${HOLLOW} /><circle cx="7.5" cy="0" r="2" fill=${HOLLOW} />`,
      ]),
    ),
  ])
}

function paw(): Art {
  return svg`<g data-part="raccoon-paw"><ellipse cx="143" cy="151" rx="8.5" ry="6.5" fill="#7a8299" /><path d="M138 148.5v5M143 148v6" stroke=${HOLLOW} stroke-width="1.8" stroke-linecap="round" /></g>`
}

function snooze(): Art {
  const z = 'M-6-6H6L-6 6H6'
  return part('snooze', [
    at(
      150,
      62,
      motion(
        'pulse',
        svg`<path d=${z} fill="none" stroke=${C.cream} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
        1,
      ),
      0,
      0.75,
    ),
    at(
      168,
      40,
      motion(
        'pulse',
        svg`<path d=${z} fill="none" stroke=${C.cream} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
        3,
      ),
      0,
      1.15,
    ),
  ])
}

function nuisances(parts: TrashParts): Art {
  const lines: Array<readonly [number, number]> = [
    [22, 112],
    [178, 100],
    [24, 66],
  ]
  const flySpots: Array<readonly [number, number]> = [
    [172, 42],
    [50, 22],
    [40, 146],
  ]
  return [
    stenchLines(lines.slice(0, parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function filling(parts: TrashParts, tone: BinTone): Art {
  return [
    shadow(100, 182, 64),
    ooze(parts.grime),
    when(parts.raccoon, raccoonArt),
    opening(),
    pileArt(parts.pile),
    binBody({ tone, mood: parts.mood, grime: parts.grime }),
    when(parts.raccoon, paw),
    hingedLid(parts.lid, lidColor(parts.grime, tone)),
    when(parts.bone, () => fishbone(30, 176, 6, 0.62)),
    when(parts.mood === 'sleepy', snooze),
    nuisances(parts),
  ]
}

function heapView(parts: TrashParts, tone: BinTone): Art {
  return [
    shadow(100, 182, 70),
    ooze(parts.grime),
    when(parts.raccoon, raccoonArt),
    opening(),
    heap(parts.bone),
    binBody({ tone, mood: parts.mood, grime: parts.grime }),
    when(parts.raccoon, paw),
    at(72, 104, motion('sway', banana(0, 0, 8, 0.8))),
    part(
      'lid',
      at(103, 52, motion('sway', at(44, -2, lidArt(lidColor(parts.grime, tone)), 0, 0.84), 2), -9),
    ),
    part('spill', [crumple(30, 172, 14, 0.82), can(170, 172, 78, 0.82)]),
    nuisances(parts),
  ]
}

function trashBag(): Art {
  return part('bag', [
    svg`<path d="M-6-36C-32-30-46-4-40 20C-36 40 36 40 40 20C46-4 32-30 6-36Z" fill=${C.lilac} />`,
    svg`<path d="M12-34C32-24 44-2 40 20C37 33 14 37-6 36C22 30 32 2 12-34Z" fill=${C.lilacDark} opacity=".6" />`,
    svg`<path d="M-4-34L-9-12M3-34L6-14" fill="none" stroke=${C.lilacDark} stroke-width="3.2" stroke-linecap="round" />`,
    svg`<path d="M-27-6Q-30 8-24 20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />`,
    svg`<path d="M-5-38L-20-53C-11-55-5-53 0-45C5-53 11-55 20-53L5-38Z" fill=${C.lilac} />`,
    svg`<rect x="-9" y="-42" width="18" height="8" rx="4" fill=${C.sun} />`,
  ])
}

function glove(): Art {
  return part('glove', [
    svg`<rect x="-44" y="-11" width="34" height="22" fill=${C.sun} />`,
    svg`<rect x="-100" y="-16" width="62" height="32" fill=${C.coral} />`,
    svg`<rect x="-46" y="-18" width="11" height="36" rx="4" fill=${C.coralDark} />`,
    svg`<rect x="-20" y="-17" width="38" height="34" rx="13" fill=${C.sun} />`,
    svg`<path d="M-3-8.5H13M-3 0H14M-3 8.5H13" stroke=${C.sunDark} stroke-width="2.6" stroke-linecap="round" />`,
    svg`<path d="M-15-11Q-4-20 7-14" fill="none" stroke=${C.sunDark} stroke-width="10.5" stroke-linecap="round" />`,
    svg`<path d="M-15-11Q-4-20 7-14" fill="none" stroke=${C.sun} stroke-width="7.5" stroke-linecap="round" />`,
  ])
}

function carrying(parts: TrashParts, tone: BinTone): Art {
  const dashes = [
    [52, 135, 'M0 0V14', 1],
    [74, 140, 'M0 0V20', 2],
    [96, 135, 'M0 0V14', 3],
  ] as const
  const trail: Array<readonly [number, number]> = [
    [22, 122],
    [127, 78],
    [160, 50],
  ]
  return [
    shadow(140, 182, 42),
    placed(140, 0.66, [
      opening(),
      binBody({ tone, mood: parts.mood, grime: parts.grime }),
      hingedLid(parts.lid, lidColor(parts.grime, tone)),
    ]),
    part(
      'motion-lines',
      dashes.map(([x, y, d, delay]) =>
        at(
          x,
          y,
          motion(
            'flicker',
            svg`<path d=${d} fill="none" stroke="#a9c8f0" stroke-width="5" stroke-linecap="round" />`,
            delay,
          ),
        ),
      ),
    ),
    stenchLines(trail.slice(0, parts.stench)),
    at(74, 90, motion('bob', [trashBag(), at(0, -54, glove())])),
  ]
}

function roll(): Art {
  return part('bag-roll', [
    svg`<path d="M-16 5H-10V19H-40Q-46 19-44 14Q-30 15-16 5Z" fill=${C.lilacDark} />`,
    svg`<rect x="-26" y="-17" width="42" height="34" rx="6" fill=${C.lilac} />`,
    svg`<path d="M-14-17V17M-2-17V17" stroke=${C.lilacDark} stroke-width="2.4" stroke-dasharray="3.5 3.5" />`,
    svg`<path d="M-22-11H-18" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".6" />`,
    svg`<ellipse cx="16" rx="10" ry="17" fill=${C.lilacDark} />`,
    svg`<ellipse cx="16" rx="5.5" ry="9.5" fill=${C.wickerLight} />`,
    svg`<ellipse cx="16" rx="2.8" ry="5" fill=${HOLLOW} />`,
  ])
}

function emptyView(parts: TrashParts, tone: BinTone): Art {
  const lines: Array<readonly [number, number]> = [
    [56, 96],
    [34, 76],
    [76, 76],
  ]
  const flySpots: Array<readonly [number, number]> = [
    [40, 38],
    [84, 22],
  ]
  return [
    shadow(78, 182, 52),
    shadow(160, 182, 28),
    placed(76, 0.86, [
      opening(),
      binBody({ tone, mood: parts.mood, grime: parts.grime }),
      hingedLid(parts.lid, lidColor(parts.grime, tone)),
    ]),
    at(160, 163, roll()),
    part(
      'pending',
      at(
        160,
        116,
        motion(
          'bob',
          svg`<path d="M0 14L-13 0H-6V-14H6V0H13Z" fill=${C.sun} stroke=${C.sun} stroke-width="3" stroke-linejoin="round" />`,
        ),
      ),
    ),
    stenchLines(lines.slice(0, parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function freshView(parts: TrashParts, tone: BinTone): Art {
  return [
    shadow(100, 182, 64),
    opening(C.lilacDark),
    binBody({ tone, mood: parts.mood, grime: 0, shine: true, draped: true }),
    hingedLid(parts.lid, tone.body),
    sparkle(30, 112, 1.3, 1),
    sparkle(172, 128, 1.05, 2),
    sparkle(40, 62, 0.95, 3),
    sparkle(176, 34, 0.8, 4),
    sparkle(36, 160, 0.6, 5),
  ]
}

export function trash(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = trashParts(scene)
  const tone = binToneOf(scene)
  const views: Record<TrashView, () => Art> = {
    filling: () => filling(parts, tone),
    heap: () => heapView(parts, tone),
    carrying: () => carrying(parts, tone),
    empty: () => emptyView(parts, tone),
    fresh: () => freshView(parts, tone),
  }
  const art = views[parts.view]()
  return frame('trash', scene, options, art)
}
