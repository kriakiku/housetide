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
  fly,
  frame,
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
import { bubble } from './laundry.ts'

export type FilterView = 'housing' | 'swap'
export type FilterFlow = 'still' | 'murky' | 'flush' | 'shine'

export interface FilterParts {
  view: FilterView
  step: number
  murk: number
  flow: FilterFlow
  sludge: number
  germs: number
  stench: number
  flies: number
  lamps: number
  depth: number
  asleep: boolean
  wish: boolean
  mood: Mood
}

export const MAX_STAIN = 4

const SLUDGE_AT = [0.08, 0.4, 0.7] as const
const GERMS_AT = [0.3, 0.5, 0.72, 0.85, 0.95] as const
const STENCH_AT = [0.15, 0.48, 0.78] as const
const FLIES_AT = [0.62, 0.9] as const
const BUCKET_GERMS_AT = [0.4, 0.75] as const
const SWAP_GERMS_AT = [0.3, 0.7] as const
const SICK_AT = 0.6

const CLEAN_WHITE = '#fdfaf0'
const MUD = '#6b4a28'
const MURK = '#a78a4f'
const CLEAR = '#bfe9fb'
const CRYSTAL = '#8fdcff'
const GERM_INK = '#26331a'

const QUIET = {
  step: 0,
  murk: 0,
  flow: 'still',
  sludge: 0,
  germs: 0,
  stench: 0,
  flies: 0,
  lamps: 0,
  depth: 0,
  asleep: false,
  wish: false,
} as const

export function filterParts(scene: SceneView): FilterParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...QUIET, view: 'housing', flow: 'shine', lamps: 3, mood: 'happy' }
  }
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...QUIET,
      view: 'swap',
      step: MAX_STAIN,
      germs: reached(stink, SWAP_GERMS_AT),
      stench: Math.min(2, stench),
      depth: Math.min(2, Math.floor(clamp01(scene.progress) * 3)),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      view: 'housing',
      murk: 0.14 + stink * 0.3,
      flow: 'flush',
      sludge: reached(stink, SLUDGE_AT),
      germs: reached(stink, BUCKET_GERMS_AT),
      stench,
      flies,
      lamps: 2,
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_STAIN - 1, Math.ceil(fill * MAX_STAIN))
  const step = due ? MAX_STAIN : resting ? 0 : raw
  const sludge = reached(stink, SLUDGE_AT)
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    view: 'housing',
    step,
    murk: clamp01(step / MAX_STAIN) * 0.72 + sludge * 0.09,
    flow: due ? 'murky' : 'still',
    sludge,
    germs: reached(stink, GERMS_AT),
    stench,
    flies,
    lamps: resting ? 0 : 3 - Math.min(2, Math.floor(step / 2)),
    asleep: resting,
    wish: due,
    mood,
  }
}

const CX = 88
const SPOUT = 74
const BOWL_TOP = 86
const BOWL_BOTTOM = 178
const BOWL_HALF = 40
const BOWL_CORNER = 18

function bowlPath(top: number, inset: number, wave = 0): string {
  const hw = BOWL_HALF - inset
  const bottom = BOWL_BOTTOM - inset
  const r = BOWL_CORNER - inset
  const head =
    wave === 0
      ? `M${-hw} ${top}H${hw}`
      : `M${-hw} ${top}Q${round(-hw / 2)} ${top - wave} 0 ${top}T${hw} ${top}`
  return `${head}V${bottom - r}Q${hw} ${bottom} ${hw - r} ${bottom}H${r - hw}Q${-hw} ${bottom} ${-hw} ${bottom - r}Z`
}

const STAIN = [0, 0.32, 0.58, 0.8, 1] as const

function stainOf(step: number): string {
  return mix(CLEAN_WHITE, MUD, STAIN[step] ?? 1)
}

const BLOTCHES = [
  [1, -11, 22, 4.5, 3],
  [2, 8, 42, 5.5, 3.5],
  [2, -6, 52, 4, 2.6],
  [3, 10, 18, 4, 3],
  [3, -12, 40, 5, 4],
  [4, 1, 30, 6, 4],
  [4, 12, 56, 3.5, 2.4],
] as const

function cartridge(step: number): Art {
  const body = stainOf(step)
  const pleat = mix(C.metalMid, mix(body, MUD, 0.42), step / 2)
  const side = mix(mix(CLEAN_WHITE, C.metalMid, 0.45), mix(body, MUD, 0.2), step / 2)
  const cap = mix(C.metalMid, MUD, step * 0.12)
  const capDark = mix(C.metalDark, MUD, step * 0.12)
  return part('cartridge', [
    svg`<rect x="-21" y="5" width="42" height="58" fill=${body} />`,
    svg`<rect x="11" y="5" width="10" height="58" fill=${side} />`,
    svg`<path d="M-14 12V56M-7 12V56M0 12V56M7 12V56M14 12V56" stroke=${pleat} stroke-width="2.8" stroke-linecap="round" />`,
    BLOTCHES.filter(([min]) => step >= min).map(
      ([, x, y, rx, ry]) =>
        svg`<ellipse cx=${x} cy=${y} rx=${rx} ry=${ry} fill=${mix(body, '#3f2a14', 0.42)} />`,
    ),
    svg`<rect x="-25" y="0" width="50" height="10" rx="4.5" fill=${cap} />`,
    svg`<rect x="-25" y="58" width="50" height="10" rx="4.5" fill=${capDark} />`,
    svg`<rect x="-9" y="-5" width="18" height="7" rx="2.5" fill=${capDark} />`,
  ])
}

function headArt(
  accent: string,
  mood: Mood,
  lamps: number,
  pendingLamp: boolean,
  joy = false,
): Art {
  const dark = shadeOf(accent)
  const light = tintOf(accent, 0.45)
  const ink = shadeOf(accent, 0.8)
  const shell: Art = [
    svg`<rect x="-15" y="17" width="30" height="16" rx="6" fill=${dark} />`,
    svg`<rect x="-48" y="28" width="96" height="56" rx="18" fill=${accent} />`,
    svg`<path d="M-48 66H48a18 18 0 0 1-18 18H-30A18 18 0 0 1-48 66Z" fill=${dark} />`,
    svg`<path d="M-38 54V47A9 9 0 0 1-29 38H-16" fill="none" stroke=${light} stroke-width="5.5" stroke-linecap="round" />`,
    svg`<path d="M-37 71v7M-28 72v8M28 72v8M37 71v7" stroke=${accent} stroke-width="3.4" stroke-linecap="round" />`,
    [0, 1, 2].map((i) => {
      const lit = i < lamps
      const dot = svg`<circle cx=${-11 + i * 11} cy="75" r="3.6" fill=${lit ? C.mint : shadeOf(accent, 0.5)} />`
      return pendingLamp && i === lamps
        ? motion('flicker', svg`<circle cx=${-11 + i * 11} cy="75" r="3.6" fill=${C.sun} />`)
        : dot
    }),
    face(0, 50, mood, ink, 1.3),
  ]
  return part('head', joy ? motion('bob', shell) : shell)
}

function waterIn(color: string, moving: boolean): Art {
  const crest = mix(color, '#ffffff', 0.5)
  const line = svg`<path d="M-34 97Q-17 92 0 97T34 97" fill="none" stroke=${crest} stroke-width="4.5" stroke-linecap="round" />`
  return part('water', [
    svg`<path d=${bowlPath(96, 5, 4)} fill=${color} />`,
    moving ? motion('bob', line) : line,
  ])
}

function slime(stage: number): Art {
  const runs = [
    [1, -29, 22],
    [1, 15, 15],
    [2, 29, 36],
    [2, -12, 12],
    [3, 3, 28],
    [3, -35, 40],
  ] as const
  return part(
    'slime',
    runs
      .filter(([min]) => stage >= min)
      .map(
        ([, x, length]) =>
          svg`<rect x=${x - 3.5} y="88" width="7" height=${length} rx="3.5" fill=${C.mustyDark} />`,
      ),
  )
}

function sludgePool(stage: number): Art {
  const top = 174 - stage * 11
  return part('sludge', [
    svg`<path d=${bowlPath(top, 5, 6)} fill=${C.mustyDark} />`,
    svg`<path d=${`M-30 ${top + 7}q6-3 12 0M6 ${top + 9}q6-3 12 0`} fill="none" stroke=${C.musty} stroke-width="3" stroke-linecap="round" />`,
  ])
}

function bowlArt(accent: string, water: Art, inner: Art, front: Art): Art {
  const collar = shadeOf(accent, 0.42)
  return part('bowl', [
    svg`<rect x="-30" y="174" width="60" height="10" rx="4" fill=${collar} />`,
    svg`<path d=${bowlPath(BOWL_TOP, 0)} fill=${tintOf(accent, 0.68)} />`,
    svg`<path d=${bowlPath(BOWL_TOP, 5)} fill=${mix(CLEAR, '#ffffff', 0.35)} />`,
    water,
    inner,
    front,
    svg`<path d="M-32 106V150" stroke="#fff" stroke-width="5.5" stroke-linecap="round" opacity=".7" />`,
    svg`<circle cx="-32" cy="160" r="2.8" fill="#fff" opacity=".7" />`,
    collarArt(accent),
  ])
}

function collarArt(accent: string): Art {
  return [
    svg`<rect x="-44" y="80" width="88" height="12" rx="5" fill=${shadeOf(accent)} />`,
    svg`<path d="M-36 86H36" stroke=${shadeOf(accent, 0.42)} stroke-width="2.4" stroke-linecap="round" stroke-dasharray="4 5" />`,
  ]
}

function pipe(d: string): Art {
  return [
    svg`<path d=${d} fill="none" stroke=${C.metalDark} stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d=${d} fill="none" stroke=${C.metalMid} stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
  ]
}

function plumbing(accent: string): Art {
  const dark = shadeOf(accent)
  return part('plumbing', [
    pipe('M-48 66H-60Q-70 66-70 76V174'),
    svg`<rect x="-78" y="172" width="16" height="11" rx="3" fill=${C.metalDark} />`,
    svg`<rect x="-77" y="146" width="14" height="16" rx="4" fill=${C.metalDark} />`,
    svg`<rect x="-66" y="149.5" width="20" height="9" rx="4.5" fill=${C.coral} />`,
    svg`<rect x="-56" y="59" width="10" height="16" rx="3" fill=${dark} />`,
    pipe(`M48 66H${SPOUT - 11}Q${SPOUT} 66 ${SPOUT} 77V90`),
    svg`<rect x="46" y="59" width="10" height="16" rx="3" fill=${dark} />`,
    svg`<rect x=${SPOUT - 9} y="90" width="18" height="11" rx="3.5" fill=${dark} />`,
  ])
}

function tumblerEdge(y: number): number {
  return round(19.5 - ((y + 46) / 46) * 3.5)
}

function tumbler(level: number, liquid: string, extra: Art): Art {
  const surface = -46 + level
  const w = tumblerEdge(surface)
  return part(
    'glass',
    at(CX + SPOUT, 182, [
      svg`<path d="M-22-50H22L18-3Q17.5 0 14 0H-14Q-17.5 0-18-3Z" fill="#fff" opacity=".28" />`,
      svg`<path d=${`M${-w} ${surface}H${w}L16-5Q15.5-3 13-3H-13Q-15.5-3-16-5Z`} fill=${liquid} />`,
      svg`<path d=${`M${-w + 1} ${surface + 1}H${w - 1}`} stroke=${mix(liquid, '#ffffff', 0.5)} stroke-width="3.6" stroke-linecap="round" />`,
      extra,
      svg`<path d="M-15-40L-12.5-12" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".6" />`,
    ]),
  )
}

function germ(x: number, y: number, size: number, color: string, delay: number): Art {
  const dark = mix(color, GERM_INK, 0.4)
  const nubs = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    return svg`<circle cx=${round(Math.cos(a) * 10.5)} cy=${round(Math.sin(a) * 10.5)} r="2.8" fill=${dark} />`
  })
  const eye = (cx: number, look: number): Art =>
    svg`<circle cx=${cx} cy="-2" r="4" fill="#fff" /><circle cx=${cx + look} cy="-1.4" r="2" fill=${GERM_INK} />`
  return part(
    'germ',
    at(
      x,
      y,
      motion(
        'wobble',
        at(
          0,
          0,
          [
            nubs,
            svg`<circle r="10" fill=${color} />`,
            eye(-4, 1),
            eye(4, -1),
            svg`<path d="M-4 5q2-2 4 0t4 0" fill="none" stroke=${GERM_INK} stroke-width="1.8" stroke-linecap="round" />`,
          ],
          0,
          size,
        ),
        delay,
      ),
    ),
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
        at(
          0,
          0,
          svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
          0,
          size,
        ),
        delay,
      ),
    ),
  )
}

function wish(accent: string): Art {
  return part('wish', [
    svg`<circle cx="139" cy="46" r="3.5" fill=${C.cream} />`,
    at(
      165,
      38,
      motion('pulse', [
        svg`<circle r="23" fill=${C.cream} />`,
        at(
          0,
          -15,
          [
            cartridge(0),
            svg`<rect x="-25" y="0" width="50" height="10" rx="4.5" fill=${accent} />`,
          ],
          0,
          0.46,
        ),
        at(
          14,
          -13,
          svg`<path d="M0-6C.8-2 2-.8 6 0C2 .8.8 2 0 6C-.8 2-2 .8-6 0C-2-.8-.8-2 0-6Z" fill=${C.sunDark} />`,
        ),
      ]),
    ),
  ])
}

const SPOUT_X = CX + SPOUT

function flow(parts: FilterParts): Art {
  if (parts.flow === 'murky') {
    return part(
      'murky-drops',
      (
        [
          [SPOUT_X, 114, 1, 1.05],
          [SPOUT_X, 124, 3, 0.8],
        ] as const
      ).map(([x, y, d, s]) => at(x, y, motion('fall', drop(0, 0, mix(MURK, MUD, 0.45), s), d))),
    )
  }
  if (parts.flow === 'flush') {
    const d = `M${SPOUT_X} 100V150`
    return part('flush', [
      svg`<path d=${d} stroke=${C.water} stroke-width="11" stroke-linecap="round" />`,
      motion(
        'flicker',
        svg`<path d=${d} stroke="#e6f7ff" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="8 11" />`,
      ),
    ])
  }
  return []
}

function bucket(parts: FilterParts, accent: string): Art {
  const water = mix(C.water, MURK, 0.2 + parts.sludge * 0.2)
  return part(
    'bucket',
    at(SPOUT_X, 182, [
      svg`<path d="M-27-30C-27-62 27-62 27-30" fill="none" stroke=${C.metalDark} stroke-width="3" />`,
      svg`<path d="M-27-40H27L22-4Q21.5 0 17 0H-17Q-21.5 0-22-4Z" fill=${C.metalDark} />`,
      svg`<ellipse cy="-40" rx="27" ry="7" fill=${shadeOf(C.metalDark, 0.4)} />`,
      svg`<ellipse cy="-38" rx="23" ry="5" fill=${water} />`,
      parts.germs >= 1 ? germ(-16, -46, 0.72, C.stench, 1) : [],
      parts.germs >= 2 ? germ(17, -47, 0.62, C.pink, 2) : [],
      svg`<path d="M-27-40H27L26-33H-26Z" fill=${C.metalMid} />`,
      svg`<path d="M-20-24L-17-6" stroke=${tintOf(accent, 0.75)} stroke-width="3.6" stroke-linecap="round" opacity=".55" />`,
    ]),
  )
}

function hourglass(): Art {
  return part(
    'pending',
    at(
      166,
      40,
      motion('pulse', [
        svg`<circle r="20" fill=${C.cream} />`,
        svg`<path d="M-8-11H8C8-4 3-2 3 0C3 2 8 4 8 11H-8C-8 4-3 2-3 0C-3-2-8-4-8-11Z" fill=${C.sun} />`,
        svg`<path d="M-10-12H10M-10 12H10" stroke=${C.sunDark} stroke-width="4" stroke-linecap="round" />`,
        svg`<path d="M-5 9.5H5L0 3Z" fill=${C.sunDark} />`,
      ]),
    ),
  )
}

function splashes(): Art {
  return part(
    'splash',
    (
      [
        [SPOUT_X - 22, 116, 1, 0.72],
        [SPOUT_X + 22, 114, 2, 0.82],
        [SPOUT_X - 31, 130, 3, 0.5],
        [SPOUT_X + 31, 128, 4, 0.5],
      ] as const
    ).map(([x, y, d, s]) => at(x, y, motion('drip', drop(0, 0, '#dff5ff', s), d))),
  )
}

function shiningDrop(): Art {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4
    const x1 = round(Math.cos(a) * 21)
    const y1 = round(Math.sin(a) * 21)
    const x2 = round(Math.cos(a) * (i % 2 ? 27 : 30))
    const y2 = round(Math.sin(a) * (i % 2 ? 27 : 30))
    return svg`<path d=${`M${x1} ${y1}L${x2} ${y2}`} stroke=${C.spark} stroke-width="4" stroke-linecap="round" />`
  })
  return part(
    'shining-drop',
    at(SPOUT_X, 124, [
      motion('throb', rays),
      motion('bob', [
        drop(0, 1, C.sky, 2),
        drop(0, 1, CRYSTAL, 1.5),
        svg`<path d="M-6 4A6.5 6.5 0 0 0-1 10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" />`,
      ]),
    ]),
  )
}

const GERM_SPOTS = [
  [-9, 122, 0.82, C.stench, 1],
  [11, 148, 0.72, C.pink, 2],
  [10, 112, 0.6, C.lilac, 3],
  [-34, 22, 0.86, C.stench, 2],
  [74, 158, 0.7, C.sun, 3],
] as const

function housingView(parts: FilterParts, accent: string): Art {
  const flush = parts.flow === 'flush'
  const shine = parts.flow === 'shine'
  const water = shine ? CRYSTAL : mix(CLEAR, MURK, parts.murk)
  const glassMurk = parts.flow === 'murky' ? 0.8 : parts.step * 0.14
  const liquid = shine ? CRYSTAL : mix(C.water, MURK, glassMurk)
  const glassLevel = shine ? 6 : parts.flow === 'murky' ? 16 : 24
  const inBowl = flush ? 0 : parts.sludge
  const lively = flush || shine
  const inner: Art = [
    when(inBowl > 0, () => sludgePool(inBowl)),
    at(0, 100, cartridge(parts.step)),
    when(lively, () => [
      bubble(-30, 164, 4.5, 1),
      bubble(30, 150, 5.5, 2),
      bubble(31, 120, 3.5, 3),
      bubble(-30, 126, 3.5, 4),
    ]),
  ]
  const onBowl = flush ? [] : GERM_SPOTS.slice(0, parts.germs).filter(([, y]) => y > 60)
  const onHead = flush ? [] : GERM_SPOTS.slice(0, parts.germs).filter(([, y]) => y <= 60)
  const front: Art = [
    when(inBowl > 0, () => slime(inBowl)),
    onBowl.map(([x, y, s, c, d]) => germ(x, y, s, c, d)),
  ]
  const body: Art = [
    plumbing(accent),
    headArt(accent, parts.mood, parts.lamps, flush, shine),
    bowlArt(accent, waterIn(water, lively), inner, front),
    onHead.map(([x, y, s, c, d]) => germ(x, y, s, c, d)),
  ]
  return [
    shadow(CX, 184, 54),
    when(inBowl >= 2, () =>
      part(
        'puddle',
        svg`<ellipse cx=${CX - 14} cy="186" rx=${26 + inBowl * 8} ry="5" fill=${C.mustyDark} />`,
      ),
    ),
    shadow(SPOUT_X, 184, 26, 0.24),
    when(!flush, () =>
      tumbler(
        glassLevel,
        liquid,
        when(shine, () => [bubble(-7, -16, 3, 1), bubble(8, -22, 3.5, 3)]),
      ),
    ),
    when(flush, () => bucket(parts, accent)),
    at(CX, 0, body),
    flow(parts),
    when(flush, splashes),
    when(flush, hourglass),
    when(parts.step >= 2 && parts.flow === 'still', () =>
      at(SPOUT_X, 110, motion('drip', drop(0, 0, mix(C.water, MURK, parts.step * 0.2), 0.8), 2)),
    ),
    when(shine, () => [
      shiningDrop(),
      sparkle(30, 44, 1.25, 1),
      sparkle(146, 28, 1, 2),
      sparkle(186, 76, 0.7, 3),
      sparkle(26, 118, 0.75, 4),
      sparkle(136, 170, 0.6, 5),
    ]),
    when(parts.asleep, () => [zed(146, 42, 0.72, 1), zed(162, 26, 1, 2), zed(180, 16, 0.62, 3)]),
    when(parts.wish, () => wish(accent)),
    stenchLines(
      (
        [
          [34, 140],
          [136, 128],
          [24, 58],
        ] as const
      ).slice(0, parts.stench),
    ),
    (
      [
        [20, 28],
        [118, 16],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([x, y], i) => fly(x, y, i)),
  ]
}

function chevron(x: number, y: number, up: boolean, color: string): Art {
  const d = up ? 'M0 10V-8M-9 1L0-9L9 1' : 'M0-10V8M-9-1L0 9L9-1'
  return at(
    x,
    y,
    motion(
      'bob',
      svg`<path d=${d} fill="none" stroke=${color} stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
  )
}

function wrench(): Art {
  return part(
    'wrench',
    at(
      136,
      103,
      motion(
        'wobble',
        at(
          0,
          0,
          [
            svg`<rect x="10" y="-7" width="62" height="14" rx="7" fill=${C.coral} />`,
            svg`<rect x="10" y="-7" width="20" height="14" fill=${C.metalMid} />`,
            svg`<path d="M-10-13A17 17 0 1 1-10 13" fill="none" stroke=${C.metalMid} stroke-width="10" stroke-linecap="round" />`,
            svg`<circle cx="62" r="3" fill=${C.coralDark} />`,
          ],
          -42,
        ),
      ),
    ),
  )
}

function lowered(art: Art): Art {
  return at(100, 182, at(0, -184, art), 0, 0.8)
}

function swapView(parts: FilterParts, accent: string): Art {
  const water = mix(CLEAR, MURK, 0.16)
  const inset = 66 + parts.depth * 7
  const bowl = bowlArt(
    accent,
    waterIn(water, true),
    [bubble(-29, 166, 4.5, 1), bubble(30, 154, 5.5, 2), bubble(-30, 130, 3.5, 3)],
    [],
  )
  const old: Art = [
    at(0, 0, cartridge(parts.step), 0, 0.82),
    parts.germs >= 1 ? germ(-6, 26, 0.68, C.stench, 1) : [],
    parts.germs >= 2 ? germ(9, 44, 0.58, C.pink, 2) : [],
  ]
  return [
    shadow(100, 184, 44),
    lowered(bowl),
    part('lifted-head', at(100, 14, at(0, -18, headArt(accent, parts.mood, 3, false)), -5, 0.8)),
    part('new-cartridge', at(100, inset, cartridge(0), 0, 0.8)),
    lowered([
      svg`<path d=${bowlPath(96, 5, 4)} fill=${water} opacity=".38" />`,
      svg`<path d="M-32 106V150" stroke="#fff" stroke-width="5.5" stroke-linecap="round" opacity=".7" />`,
      collarArt(accent),
    ]),
    wrench(),
    part('old-cartridge', at(36, 66, motion('sway', old), -10)),
    part(
      'old-drips',
      (
        [
          [44, 136, 1, 0.8],
          [52, 146, 3, 0.6],
        ] as const
      ).map(([x, y, d, s]) => at(x, y, motion('drip', drop(0, 0, mix(MURK, MUD, 0.5), s), d))),
    ),
    chevron(30, 40, true, C.coral),
    sparkle(138, 66, 0.9, 1),
    chevron(68, 80, false, C.mint),
    stenchLines(
      (
        [
          [14, 118],
          [58, 176],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

export function filter(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = filterParts(scene)
  const accent = accentOf(scene, C.sky)
  const art = parts.view === 'swap' ? swapView(parts, accent) : housingView(parts, accent)
  return frame('filter', scene, options, art)
}
