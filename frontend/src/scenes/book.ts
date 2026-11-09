import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  COLORS as C,
  clamp01,
  face,
  frame,
  INK,
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

export type BookView = 'open' | 'closed'
export type BookRibbon = 'rest' | 'wave' | 'none' | 'star'

export interface BookParts {
  view: BookView
  stack: number
  spill: boolean
  ribbon: BookRibbon
  flipping: boolean
  folded: boolean
  card: boolean
  turned: number
  asleep: boolean
  plea: boolean
  steam: boolean
  hearts: boolean
  dust: number
  holes: number
  webs: number
  moths: number
  spider: boolean
  puffs: number
  decay: number
  mood: Mood
}

export const MAX_STACK = 7

const STACK_STEPS = 5
const DUST_AT = [0.05, 0.3, 0.55] as const
const HOLES_AT = [0.25, 0.45, 0.7] as const
const WEBS_AT = [0.4, 0.75] as const
const MOTHS_AT = [0.3, 0.6, 0.85] as const
const PUFFS_AT = [0.8, 0.95] as const
const SPIDER_AT = 0.55
const SICK_AT = 0.6

const QUIET = {
  stack: 0,
  spill: false,
  ribbon: 'rest',
  flipping: false,
  folded: false,
  card: false,
  turned: 1,
  asleep: false,
  plea: false,
  steam: false,
  hearts: false,
  dust: 0,
  holes: 0,
  webs: 0,
  moths: 0,
  spider: false,
  puffs: 0,
  decay: 0,
} as const

export function bookParts(scene: SceneView): BookParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...QUIET, view: 'closed', ribbon: 'star', hearts: true, mood: 'happy' }
  }
  const dust = reached(stink, DUST_AT)
  const neglect = {
    dust,
    holes: reached(stink, HOLES_AT),
    webs: reached(stink, WEBS_AT),
    moths: reached(stink, MOTHS_AT),
    spider: stink >= SPIDER_AT,
    puffs: reached(stink, PUFFS_AT),
    decay: stink,
  }
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...QUIET,
      view: 'open',
      flipping: true,
      steam: true,
      ribbon: 'rest',
      turned: Math.min(3, Math.floor(clamp01(scene.progress) * 4)),
      dust: Math.min(1, dust),
      decay: Math.min(0.25, stink),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      ...neglect,
      view: 'open',
      ribbon: 'none',
      folded: true,
      card: true,
      turned: 3,
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const stack = due ? MAX_STACK : resting ? 0 : Math.min(STACK_STEPS, Math.floor(fill * 6))
  let mood: Mood = resting ? 'sleepy' : stack >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...neglect,
    view: 'open',
    stack,
    spill: due,
    ribbon: due ? 'wave' : 'rest',
    asleep: resting,
    plea: due,
    mood,
  }
}

const PAPER = '#fbf7ec'
const PAPER_OLD = '#d8c598'
const LEATHER = '#a5683f'
const LEATHER_DARK = '#7f4b2e'
const LEATHER_LIGHT = '#bd7f52'
const LEATHER_OLD = '#7d7458'
const WOOD = '#4d3226'
const TEA = '#a9622f'
const TEA_OLD = '#6f7f49'
const DUST = '#d8c79c'
const DUST_DARK = '#a8966b'
const WEB = '#737a94'
const FACE_INK = '#4a3a50'

const RIGHT_PAGE = 'M100 78C112 70 134 66 152 71V140C134 135 112 137 100 146Z'
const LEFT_PAGE = 'M100 78C88 70 66 66 48 71V140C66 135 88 137 100 146Z'
const COVER =
  'M100 84C112 73 138 62 165 67Q170 68 170 73V151Q170 157 164 156C138 151 116 153 100 163C84 153 62 151 36 156Q30 157 30 151V73Q30 68 35 67C62 62 88 73 100 84Z'
const STAR = Array.from({ length: 10 }, (_, i) => {
  const radius = i % 2 ? 6.2 : 14
  const angle = (i * Math.PI) / 5 - Math.PI / 2
  return `${i ? 'L' : 'M'}${round(Math.cos(angle) * radius)} ${round(Math.sin(angle) * radius)}`
})
  .join('')
  .concat('Z')

interface Palette {
  accent: string
  dark: string
  light: string
  paper: string
  edge: string
  lines: string
  leather: string
  leatherDark: string
  leatherLight: string
}

function palette(scene: SceneView, parts: BookParts): Palette {
  const base = accentOf(scene, C.coral)
  const accent = mix(base, DUST_DARK, parts.decay * 0.35)
  const age = parts.decay * 0.8
  const paper = mix(PAPER, PAPER_OLD, age)
  const worn = parts.decay * 0.35
  return {
    accent,
    dark: shadeOf(accent, 0.3),
    light: tintOf(accent, 0.45),
    paper,
    edge: mix(C.creamDark, DUST_DARK, age),
    lines: mix(mix(C.creamDark, accent, 0.28), DUST_DARK, age),
    leather: mix(LEATHER, LEATHER_OLD, worn),
    leatherDark: mix(LEATHER_DARK, LEATHER_OLD, worn * 0.7),
    leatherLight: mix(LEATHER_LIGHT, LEATHER_OLD, worn),
  }
}

function chair(p: Palette): Art {
  return part('armchair', [
    svg`<path d="M36 176H50L47 186H39ZM150 176H164L161 186H153Z" fill=${WOOD} />`,
    svg`<path d="M48 158V62Q48 32 78 32H122Q152 32 152 62V158Z" fill=${p.leather} />`,
    svg`<path d="M58 158V66Q58 42 80 42H120Q142 42 142 66V158Z" fill=${p.leatherDark} />`,
    svg`<g fill=${p.leather}><circle cx="78" cy="56" r="3" /><circle cx="100" cy="53" r="3" /><circle cx="122" cy="56" r="3" /></g>`,
    svg`<rect x="14" y="106" width="40" height="72" rx="17" fill=${p.leather} />`,
    svg`<rect x="146" y="106" width="40" height="72" rx="17" fill=${p.leather} />`,
    svg`<rect x="14" y="106" width="40" height="17" rx="8.5" fill=${p.leatherLight} />`,
    svg`<rect x="146" y="106" width="40" height="17" rx="8.5" fill=${p.leatherLight} />`,
    svg`<rect x="42" y="158" width="116" height="22" rx="8" fill=${p.leatherDark} />`,
    svg`<rect x="46" y="146" width="108" height="20" rx="10" fill=${p.leatherLight} />`,
  ])
}

function cup(parts: BookParts): Art {
  const stale = parts.dust >= 2
  const tea = stale ? mix(TEA, TEA_OLD, 0.75) : TEA
  return part(
    'cup',
    at(27, 106, [
      svg`<rect x="-16" y="-3" width="32" height="4.5" rx="2.25" fill=${C.metalMid} />`,
      svg`<path d="M-9.5-16a7 7 0 0 0 0 11" fill="none" stroke=${C.metal} stroke-width="3.6" stroke-linecap="round" />`,
      svg`<path d="M-11-22H11V-10Q11-2 3-2H-3Q-11-2-11-10Z" fill=${C.metal} />`,
      svg`<path d="M-10.8-13H10.8L10.5-9.5H-10.5Z" fill=${C.sky} />`,
      svg`<ellipse cy="-22" rx="11" ry="3.2" fill=${C.metalMid} /><ellipse cy="-21.6" rx="8.8" ry="2.3" fill=${tea} />`,
      when(
        !stale,
        () =>
          svg`<path d="M7-22Q12-16 11.5-8" fill="none" stroke=${C.coralDark} stroke-width="1.3" stroke-linecap="round" /><rect x="8.8" y="-8.6" width="6" height="7" rx="1.2" fill=${C.coral} />`,
      ),
      when(
        stale,
        () =>
          svg`<g fill=${C.mustyDark}><circle cx="-6" cy="-23" r="3" /><circle cx="-1" cy="-24" r="3.6" /><circle cx="5" cy="-23" r="3" /></g><path d="M-9-21q0 7 2 7t1-6M4-21q0 4 1.6 4t1.4-4" fill=${C.musty} />`,
      ),
    ]),
  )
}

function steam(): Art {
  const wisp = 'M0 0c-6-5 6-10 0-15c-6-5 6-10 0-15'
  return part(
    'steam',
    (
      [
        [20, 78, 1],
        [33, 76, 3],
      ] as const
    ).map(([x, y, d]) =>
      at(
        x,
        y,
        motion(
          'waft',
          svg`<path d=${wisp} fill="none" stroke=${C.cream} stroke-width="4.5" stroke-linecap="round" opacity=".8" />`,
          d,
        ),
      ),
    ),
  )
}

function heart(x: number, y: number, size: number, delay: number): Art {
  return part(
    'heart',
    at(
      x,
      y,
      motion(
        'rise',
        at(0, 0, svg`<path d="M0 9C-14-1-9-11 0-5C9-11 14-1 0 9Z" fill=${C.pink} />`, 0, size),
        delay,
      ),
    ),
  )
}

function layers(side: number, count: number, p: Palette): Art {
  const page = side > 0 ? RIGHT_PAGE : LEFT_PAGE
  return Array.from({ length: count }, (_, i) => count - i).map(
    (n) =>
      svg`<g transform=${`translate(${round(side * n * 2.2)} ${round(n * 3.1)})`}><path d=${page} fill=${n % 2 ? p.edge : p.paper} /></g>`,
  )
}

function textLines(p: Palette, folded: boolean): Art {
  const bars = [
    [58, 85, 30],
    [58, 94, 22],
    [114, 85, folded ? 14 : 28],
    [120, 94, folded ? 10 : 22],
    [58, 126, 22],
    [122, 126, 22],
  ] as const
  return part(
    'text',
    bars.map(
      ([x, y, w]) => svg`<rect x=${x} y=${y} width=${w} height="4" rx="2" fill=${p.lines} />`,
    ),
  )
}

function dogEar(p: Palette): Art {
  return part('dog-ear', [
    svg`<path d="M129 67.8L153 70V93Z" fill=${p.dark} />`,
    svg`<path d="M129 67.8L152.5 93L131 92Q128 92 128 89Z" fill=${tintOf(p.edge, 0.3)} />`,
  ])
}

function cheeks(): Art {
  return svg`<g fill=${C.pink} opacity=".55"><ellipse cx="72" cy="115" rx="7" ry="4.2" /><ellipse cx="128" cy="115" rx="7" ry="4.2" /></g>`
}

function ribbon(x: number, y: number): Art {
  return part(
    'bookmark',
    at(x, y, [
      svg`<path d="M-7-2H7V30L0 23L-7 30Z" fill=${C.sun} />`,
      svg`<path d="M-7-2H7V5H-7Z" fill=${C.sunDark} />`,
    ]),
  )
}

function wavingRibbon(): Art {
  return part('bookmark', [
    at(
      100,
      80,
      motion('wobble', [
        svg`<path d="M-7 8C-8-4-16-14-11-28C-8-38-6-44-9-54L-1-47L7-57C9-44 5-36 3-28C-1-15 6-4 7 8Z" fill=${C.sun} />`,
        svg`<path d="M-7 8C-8 2-11-4-13-11L1-14C2-7 6 0 7 8Z" fill=${C.sunDark} />`,
      ]),
    ),
    (
      [
        ['M68 34q-5-6-3-14', 1],
        ['M124 42q7-6 6-16', 2],
      ] as const
    ).map(([d, delay]) =>
      motion(
        'flicker',
        svg`<path d=${d} fill="none" stroke=${C.sun} stroke-width="4" stroke-linecap="round" />`,
        delay,
      ),
    ),
  ])
}

function progressCard(): Art {
  return part(
    'pending',
    at(
      36,
      42,
      motion('pulse', [
        svg`<circle r="22" fill=${C.cream} />`,
        svg`<path d="M-9-12H9C9-4 3-2 3 0C3 2 9 4 9 12H-9C-9 4-3 2-3 0C-3-2-9-4-9-12Z" fill=${C.sun} />`,
        svg`<path d="M-11-13H11M-11 13H11" stroke=${C.sunDark} stroke-width="4.4" stroke-linecap="round" />`,
        svg`<path d="M-5.5 10.5H5.5L0 3.5Z" fill=${C.sunDark} />`,
      ]),
    ),
  )
}

function fanPage(rotate: number, fill: string, line: string, delay: number): Art {
  return at(
    100,
    82,
    motion(
      'wobble',
      at(
        0,
        0,
        [
          svg`<path d="M-2 6C-20-12-22-36-13-58H11C21-36 19-12 2 6Z" fill=${fill} />`,
          svg`<path d="M-9-46H7M-11-37H8M-10-28H5" stroke=${line} stroke-width="3.2" stroke-linecap="round" />`,
        ],
        rotate,
      ),
      delay,
    ),
  )
}

function flippingPages(p: Palette): Art {
  return part('flipping-pages', [
    fanPage(-38, p.edge, p.lines, 1),
    fanPage(38, p.edge, p.lines, 3),
    fanPage(-12, p.paper, p.lines, 2),
    fanPage(16, p.paper, p.lines, 4),
  ])
}

function flyingWords(): Art {
  return part(
    'words',
    (
      [
        [58, 42, 16, C.sun, 1],
        [162, 40, 20, C.cream, 2],
        [176, 72, 12, C.sky, 3],
        [150, 22, 12, C.pink, 4],
        [54, 24, 10, C.mint, 5],
      ] as const
    ).map(([x, y, w, color, d]) =>
      at(
        x,
        y,
        motion(
          'rise',
          svg`<rect x=${-w / 2} y="-2.5" width=${w} height="5" rx="2.5" fill=${color} />`,
          d,
        ),
      ),
    ),
  )
}

const HOLES = [
  [64, 108, 6],
  [138, 110, 7],
  [60, 90, 4.5],
  [131, 88, 5],
  [78, 133, 3.5],
  [146, 128, 4.5],
] as const

function mothHoles(count: number, p: Palette): Art {
  const inside = shadeOf(p.accent, 0.6)
  return part(
    'moth-holes',
    HOLES.slice(0, count).map(([x, y, r]) =>
      at(x, y, [
        svg`<g fill=${p.edge}><circle r=${r + 1.6} /><circle cx=${r * 0.9} cy=${r * 0.45} r=${round(r * 0.62) + 1.6} /></g>`,
        svg`<g fill=${inside}><circle r=${r} /><circle cx=${r * 0.9} cy=${r * 0.45} r=${round(r * 0.62)} /></g>`,
      ]),
    ),
  )
}

function webAt(x: number, y: number, from: number, sweep: number, reach: number): Art {
  const threads = [0, 1, 2, 3, 4].map((i) => {
    const a = ((from + (sweep * i) / 4) * Math.PI) / 180
    return [Math.cos(a) * reach, Math.sin(a) * reach] as const
  })
  const arc = (k: number): string =>
    threads
      .map(([tx, ty], i) => {
        const px = round(tx * k)
        const py = round(ty * k)
        if (i === 0) return `M${px} ${py}`
        const prev = threads[i - 1] ?? [tx, ty]
        return `Q${round(((tx + prev[0]) / 2) * k * 0.8)} ${round(((ty + prev[1]) / 2) * k * 0.8)} ${px} ${py}`
      })
      .join('')
  return part(
    'cobweb',
    at(
      x,
      y,
      svg`<g fill="none" stroke=${WEB} stroke-width="1.7" stroke-linecap="round">
        ${threads.map(([tx, ty]) => svg`<path d=${`M0 0L${round(tx)} ${round(ty)}`} />`)}
        ${[0.38, 0.68, 0.98].map((k) => svg`<path d=${arc(k)} />`)}
      </g>`,
    ),
  )
}

function specks(count: number): Art {
  const spots = [
    [58, 104, 1.7],
    [76, 79, 1.5],
    [122, 78, 1.8],
    [144, 100, 1.5],
    [66, 120, 1.4],
    [132, 120, 1.7],
    [90, 136, 1.3],
    [112, 134, 1.5],
    [52, 86, 1.4],
    [148, 82, 1.3],
  ] as const
  return spots
    .slice(0, count)
    .map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST_DARK} />`)
}

function dustLayer(step: number): Art {
  if (step === 0) return []
  return part('dust', [
    specks(step * 4),
    when(
      step >= 2,
      () =>
        svg`<path d="M50 74Q54 64 64 67Q72 62 82 67Q92 66 98 76Q86 70 72 70Q60 69 50 74Z" fill=${DUST} /><path d="M104 75Q112 66 122 68Q132 63 140 67Q150 66 152 74Q140 69 128 70Q114 70 104 75Z" fill=${DUST} />`,
    ),
    when(
      step >= 3,
      () =>
        svg`<ellipse cx="28" cy="184" rx="11" ry="4" fill=${DUST_DARK} /><ellipse cx="26" cy="182" rx="7" ry="3" fill=${DUST} /><path d="M18 108Q24 102 32 104Q42 101 50 108Z" fill=${DUST} />`,
    ),
  ])
}

function moth(x: number, y: number, index: number): Art {
  return part(
    'moth',
    at(
      x,
      y,
      motion(
        'buzz',
        [
          svg`<path d="M-1-3C-9-13-20-10-18-2C-17 5-7 6-1 2Z" fill=${DUST} />`,
          svg`<path d="M1-3C9-13 20-10 18-2C17 5 7 6 1 2Z" fill=${DUST} />`,
          svg`<circle cx="-11" cy="-3" r="2.6" fill=${DUST_DARK} /><circle cx="11" cy="-3" r="2.6" fill=${DUST_DARK} />`,
          svg`<ellipse cy="0" rx="3" ry="7.5" fill=${C.wickerDark} />`,
          svg`<path d="M-1-7q-3-5-7-5M1-7q3-5 7-5" fill="none" stroke=${C.wickerDark} stroke-width="1.5" stroke-linecap="round" />`,
        ],
        (index % 3) + 1,
      ),
    ),
    index,
  )
}

function spider(): Art {
  const legs = [-1, 1].flatMap((s) => [
    `M${s * 6}-2q${s * 8}-8 ${s * 12}-2`,
    `M${s * 7} 1q${s * 9}-3 ${s * 13} 3`,
    `M${s * 6} 4q${s * 7} 2 ${s * 10} 9`,
  ])
  return part('spider', [
    svg`<path d="M150 18V58" stroke="#e6ebf5" stroke-width="1.6" />`,
    at(
      150,
      40,
      motion(
        'bob',
        at(0, 26, [
          svg`<path d=${legs.join('')} fill="none" stroke=${INK} stroke-width="2.2" stroke-linecap="round" />`,
          svg`<circle r="9" fill=${INK} />`,
          svg`<circle cx="-3.4" cy="-1.5" r="2.6" fill="#fff" /><circle cx="3.4" cy="-1.5" r="2.6" fill="#fff" /><circle cx="-3.4" cy="-1" r="1.2" fill=${INK} /><circle cx="3.4" cy="-1" r="1.2" fill=${INK} />`,
        ]),
      ),
    ),
  ])
}

function dustBunny(x: number, y: number, size: number, delay: number): Art {
  return part(
    'dust-bunny',
    at(
      x,
      y,
      motion(
        'drift',
        at(
          0,
          0,
          [
            svg`<path d="M-7-11C-13-24-5-28-3-14ZM7-11C13-24 5-28 3-14Z" fill=${DUST_DARK} />`,
            svg`<circle r="14" cy="-2" fill=${DUST} />`,
            svg`<g fill=${DUST}><circle cx="-13" cy="-7" r="3.5" /><circle cx="13" cy="-7" r="3.5" /><circle cx="-16" cy="1" r="3.5" /><circle cx="16" cy="1" r="3.5" /><circle cx="-12" cy="9" r="3.5" /><circle cx="12" cy="9" r="3.5" /><circle cx="0" cy="12" r="3.5" /></g>`,
            svg`<circle cx="-5" cy="-3" r="2.3" fill=${INK} /><circle cx="5" cy="-3" r="2.3" fill=${INK} /><path d="M-2 3q2 2 4 0" fill="none" stroke=${INK} stroke-width="1.6" stroke-linecap="round" />`,
          ],
          0,
          size,
        ),
        delay,
      ),
    ),
    delay,
  )
}

const STACK = [
  [168, 44, C.sky, C.skyDark, 1, 0],
  [165, 38, C.mint, C.mintDark, -1, -1.5],
  [170, 42, C.lilac, C.lilacDark, 1, 1.5],
  [165, 36, C.sun, C.sunDark, -1, -2],
  [169, 40, C.pink, C.pinkDark, 1, 2],
  [164, 36, C.sky, C.skyDark, -1, -3],
  [172, 34, C.mint, C.mintDark, 1, 11],
] as const

function lyingBook(w: number, color: string, dark: string, side: number): Art {
  const half = w / 2
  const inset = side > 0 ? 0 : 6
  return [
    svg`<rect x=${-half} y="-6.5" width=${w} height="13" rx="3.5" fill=${color} />`,
    svg`<rect x=${-half + inset} y="-3.6" width=${w - 6} height="7.2" fill=${PAPER} />`,
    svg`<path d=${`M${-half + inset + 3} -1.2H${half - 9 + inset}M${-half + inset + 3} 1.2H${half - 9 + inset}`} stroke=${C.creamDark} stroke-width="1" />`,
    svg`<rect x=${side > 0 ? half - 6 : -half} y="-6.5" width="6" height="13" rx="3" fill=${dark} />`,
  ]
}

function toRead(parts: BookParts): Art {
  const dusty = parts.dust > 0
  const count = parts.stack
  const top = 184 - count * 13.4
  return part('to-read', [
    when(count > 0, () => shadow(168, 184, 28, 0.3)),
    STACK.slice(0, count).map(([x, w, color, dark, side, rotate], i) =>
      part('stack-book', at(x, 177.5 - i * 13.4, lyingBook(w, color, dark, side), rotate), i),
    ),
    when(
      dusty && count > 0 && !parts.spill,
      () =>
        svg`<path d=${`M150 ${top + 1}Q156 ${top - 6} 165 ${top - 3}Q176 ${top - 7} 184 ${top + 1}Z`} fill=${DUST} />`,
    ),
  ])
}

function fallenBook(): Art {
  return part('fallen-book', [
    shadow(32, 184, 22, 0.3),
    at(32, 177, lyingBook(40, C.lilac, C.lilacDark, -1), -4),
  ])
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return part(
    'zed',
    at(
      x,
      y,
      motion(
        'drift',
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

function nightcap(): Art {
  return part('nightcap', [
    svg`<path d="M72 72C76 38 118 26 142 48C150 56 152 66 150 76C140 62 130 58 128 72Z" fill=${C.lilac} />`,
    svg`<path d="M96 44Q104 58 102 70M120 39Q126 54 122 70" fill="none" stroke=${C.lilacDark} stroke-width="5" stroke-linecap="round" />`,
    svg`<rect x="66" y="66" width="68" height="13" rx="6.5" fill=${C.cream} />`,
    svg`<circle cx="151" cy="81" r="7.5" fill=${C.cream} />`,
  ])
}

function glassesBubble(): Art {
  return part('plea', [
    svg`<circle cx="60" cy="65" r="5" fill=${C.cream} /><circle cx="69" cy="62" r="3" fill=${C.cream} />`,
    at(
      40,
      42,
      motion('pulse', [
        svg`<circle r="25" fill=${C.cream} />`,
        svg`<g fill="none" stroke=${INK} stroke-width="3.4" stroke-linecap="round"><circle cx="-9.5" r="7.5" fill="#cfe9ff" /><circle cx="9.5" r="7.5" fill="#cfe9ff" /><path d="M-2.4-1q2.4-2 4.8 0M-17-2l-3.5-4M17-2l3.5-4" /></g>`,
      ]),
    ),
  ])
}

function openBook(parts: BookParts, p: Palette): Art {
  const left = parts.flipping || parts.folded ? 1 + parts.turned : 2
  const right = parts.flipping ? 4 - parts.turned : parts.folded ? 1 : 2
  const friendly = parts.mood !== 'sick' && parts.mood !== 'worried'
  return part('book', [
    svg`<path d=${COVER} fill=${p.accent} />`,
    svg`<path d="M100 84C96 110 96 140 100 163C104 140 104 110 100 84Z" fill=${p.dark} />`,
    layers(-1, Math.min(3, left), p),
    layers(1, Math.max(1, Math.min(3, right)), p),
    svg`<path d=${LEFT_PAGE} fill=${p.paper} />`,
    svg`<path d=${RIGHT_PAGE} fill=${p.paper} />`,
    svg`<path d="M100 78C95 84 96 94 100 100C104 94 105 84 100 78ZM100 146C95 140 96 134 100 128C104 134 105 140 100 146Z" fill=${p.edge} />`,
    textLines(p, parts.folded),
    mothHoles(parts.holes * 2, p),
    when(parts.folded, () => dogEar(p)),
    when(friendly, cheeks),
    face(100, 108, parts.mood, FACE_INK, 1.3),
    dustLayer(parts.dust),
    when(parts.webs >= 1, () => webAt(49, 72, 2, 86, 34)),
    when(parts.webs >= 2, () => webAt(151, 72, 92, 86, 34)),
  ])
}

function closedBook(p: Palette): Art {
  const ink = mix(p.accent, INK, 0.82)
  return part('book', [
    at(
      0,
      0,
      motion('bob', [
        part(
          'star-bookmark',
          at(
            124,
            58,
            motion('sway', [
              svg`<path d="M-6 8V-24H6V8Z" fill=${C.sun} />`,
              svg`<path d="M-6 8V-4H6V8Z" fill=${C.sunDark} />`,
              at(
                0,
                -26,
                [
                  svg`<path d=${STAR} fill=${C.sun} stroke=${C.sun} stroke-width="5" stroke-linejoin="round" />`,
                  svg`<circle r="3" fill=${C.spark} />`,
                ],
                0,
                1.05,
              ),
            ]),
          ),
        ),
        svg`<rect x="58" y="60" width="92" height="96" rx="8" fill=${PAPER} />`,
        svg`<path d="M146 66V152M151 66V152" stroke=${C.creamDark} stroke-width="1.6" />`,
        svg`<rect x="52" y="56" width="92" height="102" rx="10" fill=${p.accent} />`,
        svg`<path d="M62 56H52Q52 56 52 56A10 10 0 0 0 52 66V148A10 10 0 0 0 62 158H66V56Z" fill=${p.dark} />`,
        svg`<rect x="73" y="63" width="64" height="88" rx="7" fill="none" stroke=${p.light} stroke-width="3" />`,
        svg`<rect x="85" y="74" width="40" height="6" rx="3" fill=${p.light} /><rect x="93" y="85" width="24" height="4.5" rx="2.25" fill=${p.light} />`,
        svg`<g fill=${C.pink} opacity=".7"><ellipse cx="85" cy="125" rx="6.5" ry="4" /><ellipse cx="125" cy="125" rx="6.5" ry="4" /></g>`,
        face(105, 118, 'happy', ink, 1.25),
      ]),
    ),
  ])
}

function openScene(parts: BookParts, p: Palette): Art {
  const body = openBook(parts, p)
  const moths: ReadonlyArray<readonly [number, number]> = [
    [168, 34],
    [78, 28],
    [124, 28],
  ]
  return [
    shadow(100, 184, 86),
    chair(p),
    when(parts.card, progressCard),
    when(parts.flipping, () => flippingPages(p)),
    parts.flipping ? at(0, 0, motion('bob', body)) : body,
    when(parts.asleep, nightcap),
    when(parts.ribbon === 'rest', () => ribbon(100, 148)),
    when(parts.ribbon === 'wave', wavingRibbon),
    cup(parts),
    when(parts.steam, steam),
    when(parts.flipping, flyingWords),
    when(parts.spill, fallenBook),
    toRead(parts),
    when(parts.plea, glassesBubble),
    when(parts.asleep && !parts.spider, () => [
      zed(156, 62, 0.7, 1),
      zed(168, 44, 1, 2),
      zed(176, 25, 0.6, 3),
    ]),
    when(parts.spider, spider),
    moths.slice(0, parts.moths).map(([x, y], i) => moth(x, y, i)),
    (
      [
        [84, 176, 1, 1],
        [126, 178, 0.8, 2],
      ] as const
    )
      .slice(0, parts.puffs)
      .map(([x, y, s, d]) => dustBunny(x, y, s, d)),
  ]
}

function closedScene(parts: BookParts, p: Palette): Art {
  return [
    shadow(100, 184, 86),
    chair(p),
    closedBook(p),
    cup(parts),
    heart(22, 76, 0.8, 1),
    heart(36, 66, 0.6, 3),
    sparkle(30, 46, 1.25, 1),
    sparkle(170, 66, 1.3, 2),
    sparkle(176, 138, 0.85, 3),
    sparkle(76, 24, 0.75, 4),
  ]
}

export function book(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = bookParts(scene)
  const p = palette(scene, parts)
  const art = parts.view === 'closed' ? closedScene(parts, p) : openScene(parts, p)
  return frame('book', scene, options, art)
}
