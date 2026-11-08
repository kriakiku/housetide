import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  at,
  COLORS as C,
  drop,
  face,
  fly,
  frame,
  mix,
  motion,
  part,
  reached,
  round,
  shadow,
  sparkle,
  stenchLines,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type FridgeView = 'closed' | 'stuffed' | 'wiping' | 'emptied' | 'fresh'

export interface FridgeParts {
  view: FridgeView
  stack: number
  overfull: boolean
  stench: number
  flies: number
  mould: number
  mood: Mood
}

export const MAX_STACK = 6

const STENCH_AT = [0.05, 0.35, 0.65] as const
const FLIES_AT = [0.5, 0.75, 0.92] as const
const MOULD_AT = [0.15, 0.45, 0.8] as const
const BAG_FLIES_AT = [0.6, 0.85] as const

export function fridgeParts(scene: SceneView): FridgeParts {
  const { state, fill, stink } = scene
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  const mould = reached(stink, MOULD_AT)
  if (state === 'clean') {
    return {
      view: 'fresh',
      stack: 0,
      overfull: false,
      stench: 0,
      flies: 0,
      mould: 0,
      mood: 'happy',
    }
  }
  if (state === 'running') {
    return {
      view: 'wiping',
      stack: 0,
      overfull: false,
      stench: Math.min(1, stench),
      flies: 0,
      mould: 0,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      view: 'emptied',
      stack: 0,
      overfull: false,
      stench,
      flies: reached(stink, BAG_FLIES_AT),
      mould: 0,
      mood: stink >= 0.65 ? 'worried' : 'calm',
    }
  }
  const sick = stink >= 0.45
  if (state === 'resting') {
    return {
      view: 'closed',
      stack: 0,
      overfull: false,
      stench,
      flies,
      mould,
      mood: sick ? 'sick' : 'sleepy',
    }
  }
  const overfull = state === 'due'
  const raw = Number.isFinite(fill) ? fill : 0
  const stack = overfull
    ? MAX_STACK
    : Math.max(0, Math.min(MAX_STACK - 1, Math.floor(raw * MAX_STACK)))
  let mood: Mood = stack >= 4 ? 'worried' : 'calm'
  if (overfull) mood = 'pleading'
  if (sick) mood = 'sick'
  return { view: 'stuffed', stack, overfull, stench, flies, mould, mood }
}

const BODY = '#86dcc8'
const BODY_DARK = '#57b7a3'
const BODY_LIGHT = '#aeeadb'
const ICE = '#e4f4fd'
const ICE_DARK = '#bcdff2'
const SHELF = '#8fcbea'
const ORANGE = '#ffa63d'
const MOULD = '#86b94b'
const MOULD_DARK = '#5d8a33'
const MOULD_LIGHT = '#c4e27f'
const WILT = '#a8a84a'
const WILT_DARK = '#7f7c30'
const BAG = '#68709c'
const BAG_DARK = '#4b5279'

const SHELL = 'M60 46a28 28 0 0 1 28-28H152a28 28 0 0 1 28 28V164q0 12-12 12H72q-12 0-12-12Z'
const INTERIOR_X = 69
const INTERIOR_W = 102
const TOP_FLOOR = 86
const MID_FLOOR = 121

function shell(tone: string): Art {
  return [
    svg`<rect x="74" y="172" width="20" height="12" rx="3" fill=${C.metalDark} /><rect x="146" y="172" width="20" height="12" rx="3" fill=${C.metalDark} />`,
    svg`<path d=${SHELL} fill=${tone} />`,
  ]
}

function grille(): Art {
  return [
    svg`<rect x="84" y="162" width="72" height="9" rx="4.5" fill=${C.metalMid} />`,
    svg`<path d="M96 164.5v4M108 164.5v4M120 164.5v4M132 164.5v4M144 164.5v4" stroke=${C.metalDark} stroke-width="2.6" stroke-linecap="round" />`,
  ]
}

function handle(): Art {
  return part('handle', [
    svg`<rect x="154" y="92" width="11" height="10" rx="3" fill=${C.metalDark} /><rect x="154" y="130" width="11" height="10" rx="3" fill=${C.metalDark} />`,
    svg`<rect x="150" y="88" width="10" height="56" rx="5" fill=${C.metal} />`,
    svg`<rect x="152.5" y="93" width="2.6" height="34" rx="1.3" fill="#fff" />`,
  ])
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'bob',
      svg`<path d="M-6-6H6L-6 6H6" fill="none" stroke=${C.spark} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
      delay,
    ),
    0,
    size,
  )
}

function magnets(): Art {
  return part('magnet', [
    svg`<rect x="78" y="106" width="36" height="42" rx="3" fill=${C.cream} transform="rotate(-5 96 127)" />`,
    svg`<path d="M85 122l22-2M85.6 130l22-2M86.3 138l13-1" stroke=${C.creamDark} stroke-width="3" stroke-linecap="round" />`,
    svg`<path d="M96 116c-7-5-9-11-5-14c3-2 5 0 5 2c0-2 3-4 6-2c3 3 1 9-6 14Z" fill=${C.coral} />`,
    svg`<circle cx="130" cy="136" r="8" fill=${C.sun} /><path d="M130 128q2-4 5-4" fill="none" stroke=${C.leafDark} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function gooDrips(tone: string, shade: string, level: number): Art {
  return part('goo', [
    svg`<path d="M84 154h62v5q0 5-5 5c-3 0-5-2-5-5c0 5-3 11-7 11s-6-5-6-10c0 3-3 5-6 5s-5-3-5-6c0 4-3 6-6 6s-5-2-6-6q-1 4-6 4t-6-4c0 7-3 12-6 12c-3 0-4-6-4-13Z" fill=${tone} />`,
    svg`<path d="M92 158h40" stroke=${shade} stroke-width="2.6" stroke-linecap="round" opacity=".6" />`,
    when(level >= 2, () => [
      svg`<path d="M66 184c-6-8 4-13 14-11c14-3 30-3 42-1c14-2 26 2 22 10c-2 4-74 6-78 2Z" fill=${tone} />`,
    ]),
  ])
}

function bump(n: number, rx: number, ry: number, depth: number): string {
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI) / n
    const k = i % 2 ? 1 - depth : 1
    return `${round(Math.cos(a) * rx * k)} ${round(Math.sin(a) * ry * k)}`
  })
  return `M${pts.join('L')}Z`
}

function eyes(x: number, y: number, r: number, gap: number): Art {
  return [
    svg`<circle cx=${x - gap} cy=${y} r=${r} fill="#fff" /><circle cx=${x + gap} cy=${y} r=${r} fill="#fff" />`,
    svg`<circle cx=${x - gap + r * 0.28} cy=${y + r * 0.2} r=${r * 0.55} fill=${C.fly} /><circle cx=${x + gap + r * 0.28} cy=${y + r * 0.2} r=${r * 0.55} fill=${C.fly} />`,
  ]
}

function mouldy(x: number, y: number, size: number): Art {
  return part(
    'mould',
    at(
      x,
      y,
      at(
        0,
        -19,
        motion('bob', [
          svg`<path d=${bump(16, 23, 20, 0.22)} fill=${MOULD} stroke=${MOULD} stroke-width="3" stroke-linejoin="round" />`,
          svg`<path d=${bump(11, 15, 11, 0.2)} transform="translate(-5 7)" fill=${MOULD_LIGHT} opacity=".55" />`,
          svg`<circle cx="15" cy="9" r="3" fill=${MOULD_DARK} /><circle cx="-16" cy="-8" r="2.4" fill=${MOULD_DARK} /><circle cx="10" cy="-13" r="2" fill=${MOULD_DARK} />`,
          eyes(0, -3, 7, 9),
          svg`<path d="M-5 10q5-5 10 0" fill="none" stroke=${MOULD_DARK} stroke-width="3" stroke-linecap="round" />`,
        ]),
      ),
      0,
      size,
    ),
  )
}

function shelves(tone: string): Art {
  return [TOP_FLOOR, MID_FLOOR].map(
    (y) =>
      svg`<rect x=${INTERIOR_X} y=${y} width=${INTERIOR_W} height="4.5" fill=${tone} /><rect x=${INTERIOR_X} y=${y} width=${INTERIOR_W} height="1.5" fill="#fff" opacity=".7" />`,
  )
}

function interior(back: string, side: string, lamp: string): Art {
  return [
    svg`<rect x=${INTERIOR_X} y="52" width=${INTERIOR_W} height="106" rx="7" fill=${back} />`,
    svg`<path d="M69 59a7 7 0 0 1 7-7h2v106h-2a7 7 0 0 1-7-7ZM171 59a7 7 0 0 0-7-7h-2v106h2a7 7 0 0 0 7-7Z" fill=${side} />`,
    svg`<rect x="104" y="52" width="32" height="6" rx="3" fill=${lamp} />`,
  ]
}

function drawer(tone: string, under: Art): Art {
  return part('drawer', [
    under,
    svg`<rect x="75" y="142" width="90" height="16" rx="4" fill=${tone} />`,
    svg`<rect x="75" y="142" width="90" height="3" rx="1.5" fill="#fff" opacity=".85" />`,
    svg`<rect x="106" y="148.5" width="28" height="5" rx="2.5" fill="#fff" opacity=".9" />`,
  ])
}

function headerGloss(tone: string): Art {
  return svg`<path d="M72 44a18 18 0 0 1 16-16H110" fill="none" stroke=${tone} stroke-width="4" stroke-linecap="round" />`
}

function doorShell(tone: string, shade: string, liner: string): Art {
  return [
    svg`<path d="M62 26L30 16Q18 14 18 27V171Q18 184 30 183L62 174Z" fill=${shade} />`,
    svg`<path d="M60 31L33 23Q25 22 25 31V167Q25 176 33 175L60 169Z" fill=${liner} />`,
    svg`<path d="M18 27Q18 14 30 16L34 17Q24 17 24 29V169Q24 182 34 182L30 183Q18 184 18 171Z" fill=${tone} />`,
  ]
}

function bins(tone: string): Art {
  return [
    svg`<path d="M25 72L60 76V100L25 104Z" fill=${tone} opacity=".85" />`,
    svg`<path d="M25 132L60 130V156L25 162Z" fill=${tone} opacity=".85" />`,
    svg`<path d="M25 72L60 76M25 132L60 130" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85" />`,
  ]
}

function milk(x: number, y: number): Art {
  return part(
    'milk',
    at(x, y, [
      svg`<path d="M-8 0V-24L-4-34V-42H4V-34L8-24V0Z" fill="#fff" />`,
      svg`<rect x="-5" y="-47" width="10" height="7" rx="2" fill=${C.sky} />`,
      svg`<rect x="-8" y="-20" width="16" height="10" fill=${C.sky} />`,
    ]),
  )
}

function bottle(x: number, y: number, color: string, shade: string): Art {
  return at(x, y, [
    svg`<path d="M-6 0V-16Q-6-22-3-25V-32H3V-25Q6-22 6-16V0Z" fill=${color} />`,
    svg`<rect x="-3.5" y="-37" width="7" height="6" rx="1.5" fill=${shade} />`,
    svg`<rect x="-6" y="-14" width="12" height="7" fill="#fff" opacity=".75" />`,
  ])
}

function doorStock(): Art {
  return part('door-stock', [
    milk(43, 92),
    bottle(35, 152, C.coral, C.coralDark),
    bottle(50, 150, C.sun, C.sunDark),
  ])
}

function tub(
  x: number,
  y: number,
  lid: string,
  shade: string,
  food: string,
  rotate = 0,
  scale = 0.86,
): Art {
  return at(
    x,
    y,
    [
      svg`<rect x="-19" y="-14" width="38" height="14" rx="4" fill="#fff" opacity=".9" />`,
      svg`<path d="M-13-3q2-8 8-5q4-3 8 0q5-2 7 2q3 0 3 3Z" fill=${food} />`,
      svg`<rect x="-21" y="-18" width="42" height="6.5" rx="3.25" fill=${lid} />`,
      svg`<rect x="-5" y="-21" width="10" height="4" rx="2" fill=${shade} />`,
    ],
    rotate,
    scale,
  )
}

function takeout(x: number, y: number, rotate = 0, scale = 0.76): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-14-30Q0-48 14-30" fill="none" stroke=${C.metalDark} stroke-width="2.2" />`,
      svg`<path d="M-15-30H15L11-1Q11 0 9 0H-9Q-11 0-11-1Z" fill="#fff" />`,
      svg`<path d="M-15-30L-8-36H8L15-30Z" fill=${C.creamDark} />`,
      svg`<circle cy="-15" r="6.5" fill=${C.coral} />`,
    ],
    rotate,
    scale,
  )
}

function pot(x: number, y: number): Art {
  return at(
    x,
    y,
    [
      svg`<rect x="-26" y="-18" width="52" height="5" rx="2.5" fill=${C.coralDark} />`,
      svg`<path d="M-20-20H20V-5Q20 0 15 0H-15Q-20 0-20-5Z" fill=${C.coral} />`,
      svg`<path d="M-21-20Q0-33 21-20Z" fill=${C.coralDark} />`,
      svg`<circle cy="-29" r="3.6" fill=${C.fly} />`,
      svg`<rect x="-14" y="-13" width="4" height="9" rx="2" fill="#fff" opacity=".5" />`,
    ],
    0,
    0.88,
  )
}

function jar(x: number, y: number): Art {
  return at(x, y, [
    svg`<rect x="-12" y="-27" width="24" height="27" rx="5" fill=${C.mint} />`,
    svg`<circle cx="-4" cy="-16" r="4.4" fill=${C.mintDark} /><circle cx="5" cy="-8" r="4" fill=${C.mintDark} /><circle cx="5" cy="-20" r="2.8" fill=${C.mintDark} />`,
    svg`<rect x="-13" y="-33" width="26" height="8" rx="2.5" fill=${C.sun} />`,
    svg`<rect x="-9" y="-23" width="3" height="16" rx="1.5" fill="#fff" opacity=".55" />`,
  ])
}

function foil(x: number, y: number, rotate = 0): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-17-5C-18-20-8-27 0-26C8-27 18-20 17-5Z" fill=${C.metalMid} />`,
      svg`<path d="M-10-12l6-7l4 8l6-9M6-8l5-7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`,
      svg`<rect x="-23" y="-6" width="46" height="6" rx="3" fill=${C.lilac} />`,
    ],
    rotate,
  )
}

const STACK: ReadonlyArray<readonly [number, () => Art]> = [
  [1, () => tub(94, MID_FLOOR, C.coral, C.coralDark, C.sun)],
  [2, () => takeout(147, TOP_FLOOR)],
  [3, () => pot(143, MID_FLOOR)],
  [4, () => jar(87, TOP_FLOOR)],
  [5, () => [tub(94, MID_FLOOR - 13.5, C.lilac, C.lilacDark, C.coral), foil(117, TOP_FLOOR)]],
]

function apple(x: number, y: number, size = 1): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M0-22C-8-26-16-22-16-12C-16-3-9 0-5 0C-3 0-2-1 0-1C2-1 3 0 5 0C9 0 16-3 16-12C16-22 8-26 0-22Z" fill=${C.coral} />`,
      svg`<path d="M0-22Q0-28 3-31" fill="none" stroke=${C.soil} stroke-width="2.6" stroke-linecap="round" />`,
      svg`<path d="M2-26C6-33 13-32 15-29C11-24 6-24 2-26Z" fill=${C.leaf} />`,
      svg`<path d="M-10-15q0-5 4-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" />`,
    ],
    0,
    size,
  )
}

function orange(x: number, y: number): Art {
  return at(x, y, [
    svg`<circle cy="-13" r="13.5" fill=${ORANGE} />`,
    svg`<path d="M-3-24q3 3 6 0" fill="none" stroke=${C.leafDark} stroke-width="3" stroke-linecap="round" />`,
    svg`<path d="M-8-15q0-5 4-6" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".7" />`,
  ])
}

function pear(x: number, y: number): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M0-30C-6-30-7-24-8-19C-9-14-14-12-14-7C-14-2-8 0 0 0C8 0 14-2 14-7C14-12 9-14 8-19C7-24 6-30 0-30Z" fill=${C.sun} />`,
      svg`<path d="M0-30Q0-34 3-36" fill="none" stroke=${C.soil} stroke-width="2.6" stroke-linecap="round" />`,
      svg`<path d="M-8-9q0-4 3-5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".7" />`,
    ],
    0,
    0.88,
  )
}

function broccoli(x: number, y: number): Art {
  return at(x, y, [
    svg`<path d="M-5 0L-4-13H4L5 0Z" fill=${C.leaf} />`,
    svg`<g fill=${C.leafDark}><circle cx="-10" cy="-15" r="7.5" /><circle cx="10" cy="-15" r="7.5" /><circle cy="-21" r="9" /></g>`,
    svg`<circle cx="-3" cy="-23" r="2.4" fill=${C.leaf} /><circle cx="7" cy="-17" r="2" fill=${C.leaf} />`,
  ])
}

function cheese(x: number, y: number): Art {
  return at(x, y, [
    svg`<path d="M-17 0V-14L14-26Q17-26 17-22V0Z" fill=${C.sun} />`,
    svg`<path d="M-17-14L14-26Q17-26 17-22L-17-14Z" fill=${C.spark} />`,
    svg`<circle cx="-6" cy="-7" r="3.4" fill=${C.sunDark} /><circle cx="8" cy="-10" r="4.2" fill=${C.sunDark} /><circle cx="6" cy="-3" r="1.8" fill=${C.sunDark} />`,
  ])
}

function tomato(x: number, y: number): Art {
  return at(x, y, [
    svg`<ellipse cy="-11" rx="13" ry="11" fill=${C.coralDark} />`,
    svg`<path d="M0-22l-7-1l4 4l-4 4l6-3l2 4l2-4l6 3l-4-4l4-4Z" fill=${C.leafDark} />`,
    svg`<path d="M-8-12q0-3 2-4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".6" />`,
  ])
}

function carrot(x: number, y: number, rotate: number, scale = 0.72): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M0-30q-7-9-9-5q2 6 7 8M0-30q0-11 3-10q3 4-1 11M0-30q6-8 9-6q-1 6-7 9" fill=${C.leaf} stroke=${C.leaf} stroke-width="2" stroke-linejoin="round" />`,
      svg`<path d="M-7-30H7L2 8Q0 11-2 8Z" fill=${ORANGE} />`,
      svg`<path d="M-5-21h4M2-13h3M-3-5h3" stroke=${C.terracottaDark} stroke-width="2" stroke-linecap="round" />`,
    ],
    rotate,
    scale,
  )
}

function lettuce(x: number, y: number, color: string, vein: string): Art {
  return at(x, y, [
    svg`<path d="M-24 0C-29-8-24-14-20-14C-22-22-12-27-7-23C-5-29 7-29 8-23C14-27 23-21 20-14C25-14 29-7 24 0Z" fill=${color} />`,
    svg`<path d="M0 0V-20M0-6L-11-15M0-6L11-15" fill="none" stroke=${vein} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function wiltedLettuce(): Art {
  return part('wilted-lettuce', [
    svg`<path d="M135 140C143 146 147 158 142 162C136 165 134 152 126 146ZM93 142C84 146 79 156 83 160C88 163 92 152 98 148Z" fill=${WILT_DARK} />`,
    svg`<path d="M92 143C86 137 89 128 97 130C98 123 108 121 113 127C118 121 128 123 129 130C136 128 140 136 135 143C133 150 128 148 124 145C126 156 121 170 115 168C110 166 113 152 108 146C106 154 100 164 95 161C90 158 96 149 92 143Z" fill=${WILT} />`,
    svg`<circle cx="130" cy="136" r="2.2" fill=${WILT_DARK} /><circle cx="94" cy="136" r="1.8" fill=${WILT_DARK} />`,
    svg`<path d="M100 137q2-2 4 0M116 137q2-2 4 0" fill="none" stroke=${C.fly} stroke-width="2.4" stroke-linecap="round" />`,
    svg`<path d="M105 145q5-4 10 0" fill="none" stroke=${C.fly} stroke-width="2.4" stroke-linecap="round" />`,
  ])
}

function mouldSpots(): Art {
  return part('grime', [
    svg`<g fill=${MOULD}><circle cx="86" cy="108" r="4.5" /><circle cx="94" cy="114" r="2.8" /><circle cx="150" cy="78" r="4" /><circle cx="134" cy="106" r="3.4" /><circle cx="150" cy="111" r="2.4" /></g>`,
    svg`<g fill=${MOULD_LIGHT}><circle cx="85" cy="107" r="1.6" /><circle cx="150" cy="77" r="1.4" /></g>`,
  ])
}

function shelfGoo(): Art {
  return part('shelf-goo', [
    svg`<path d="M84 90.5h30v2q0 4-4 4c-3 0-4-2-4-3c0 5-2 10-5 10s-5-5-5-10c0 2-2 3-4 3s-4-2-5-4q-1 3-2 3t-1-3Z" fill=${MOULD} />`,
    at(101, 108, motion('drip', svg`<circle r="2.8" fill=${MOULD} />`, 2)),
  ])
}

function overflowPile(): Art {
  return part('overflow', [
    tub(98, MID_FLOOR - 27, C.sky, C.skyDark, C.mint, -8),
    at(162, MID_FLOOR - 4, motion('wobble', tub(-4, 2, C.mint, C.mintDark, C.pink, 18, 0.92))),
    at(164, 178, takeout(0, 0, 64, 0.72)),
  ])
}

function stuffed(parts: FridgeParts, decay: number): Art {
  const body = mix(BODY, C.musty, decay * 0.55)
  const shade = mix(BODY_DARK, C.mustyDark, decay * 0.6)
  const light = mix(BODY_LIGHT, C.musty, decay * 0.5)
  const back = mix(ICE, '#d6d39a', decay)
  const side = mix(ICE_DARK, '#b3ac70', decay)
  const lamp = mix('#fff3b0', '#c9bf6b', decay)
  const liner = mix(ICE, '#d6d39a', decay)
  const veg = parts.mould >= 2
  return [
    shadow(100, 184, 86),
    doorShell(body, shade, liner),
    bins(mix(SHELF, C.musty, decay)),
    doorStock(),
    shell(body),
    headerGloss(light),
    interior(back, side, lamp),
    shelves(mix(SHELF, C.musty, decay)),
    drawer(mix(SHELF, C.musty, decay), [
      when(parts.stack >= 1 && !veg, () => lettuce(120, 150, C.leaf, C.leafDark)),
      when(parts.stack >= 2, () => carrot(151, 151, 8)),
      when(parts.stack >= 3, () => tomato(90, 146)),
    ]),
    when(veg, wiltedLettuce),
    STACK.filter(([min]) => parts.stack >= min).map(([min, art]) => part('stack', art(), min)),
    when(parts.overfull, overflowPile),
    when(parts.overfull && parts.mould < 2, () =>
      part('sweat', at(150, 28, motion('drip', drop(0, 0, C.water, 1)))),
    ),
    when(parts.mould >= 1, mouldSpots),
    when(parts.mould >= 2, () => mouldy(119, TOP_FLOOR, parts.mould >= 3 ? 0.92 : 0.72)),
    when(parts.mould >= 3, shelfGoo),
    grille(),
    face(120, 35, parts.mood, C.fly, 0.9),
    fumes(parts),
  ]
}

function fumes(parts: FridgeParts): Art {
  const lines: ReadonlyArray<readonly [number, number]> = [
    [187, 96],
    [9, 92],
    [187, 56],
  ]
  const spots: ReadonlyArray<readonly [number, number]> = [
    [172, 142],
    [34, 44],
    [150, 28],
  ]
  return [
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function closed(parts: FridgeParts, decay: number): Art {
  const body = mix(BODY, C.musty, decay * 0.6)
  const shade = mix(BODY_DARK, C.mustyDark, decay * 0.7)
  const light = mix(BODY_LIGHT, C.musty, decay * 0.5)
  return [
    shadow(100, 184, 72),
    at(-20, 0, [
      shell(body),
      svg`<path d="M66 50a24 24 0 0 1 24-24H150a24 24 0 0 1 24 24V156H66Z" fill=${light} opacity=".35" />`,
      svg`<path d="M66 50a24 24 0 0 1 24-24H150a24 24 0 0 1 24 24V156H66Z" fill="none" stroke=${shade} stroke-width="2.6" />`,
      headerGloss('#fff'),
      svg`<rect x="102" y="34" width="36" height="9" rx="4.5" fill=${C.metal} /><rect x="108" y="37" width="24" height="3" rx="1.5" fill=${C.metalDark} />`,
      handle(),
      magnets(),
      grille(),
      when(parts.mould >= 1, () => gooDrips(MOULD, MOULD_DARK, parts.mould)),
      face(120, 72, parts.mood, C.fly, 1.15),
    ]),
    when(parts.mood === 'sleepy', () => part('snore', [zed(168, 34, 1, 1), zed(180, 19, 0.75, 2)])),
    when(parts.mould >= 3, () => mouldy(40, 184, 0.72)),
    fumes(parts),
  ]
}

function mistPuff(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'drift',
      svg`<g fill="#eaf7ff" opacity=".5"><circle cx="-11" r="10" /><circle cx="3" cy="-5" r="13" /><circle cx="15" cy="1" r="9" /><circle cx="2" cy="5" r="11" /></g>`,
      delay,
    ),
    0,
    size,
  )
}

function mist(): Art {
  return part('mist', [
    mistPuff(46, 177, 0.5, 2),
    mistPuff(168, 179, 0.5, 3),
    motion(
      'drift',
      svg`<path d="M28 188c-7-6 3-13 13-9c5-9 22-11 31-5c9-8 30-8 39 0c10-7 29-5 34 4c12-4 23 5 15 11c-3 4-12 6-21 5H46c-8 0-15-2-18-6Z" fill="#eaf7ff" opacity=".4" />`,
      1,
    ),
  ])
}

function bubble(x: number, y: number, r: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'rise',
      svg`<circle r=${r} fill="#fff" opacity=".5" /><circle r=${r} fill="none" stroke=${C.water} stroke-width="1.8" /><circle cx=${-r * 0.35} cy=${-r * 0.35} r=${r * 0.22} fill="#fff" />`,
      delay,
    ),
  )
}

function snowflake(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'twinkle',
      svg`<path d="M0-8V8M-7-4L7 4M-7 4L7-4" stroke=${C.sky} stroke-width="2.6" stroke-linecap="round" />`,
      delay,
    ),
    0,
    size,
  )
}

function cloth(): Art {
  return part(
    'cloth',
    at(
      120,
      190,
      motion(
        'slosh',
        at(0, -190 + MID_FLOOR - 1, [
          svg`<rect x="-28" y="-20" width="56" height="23" rx="6" fill=${C.sun} />`,
          svg`<path d="M-28-5H28V-3Q28 3 22 3H-22Q-28 3-28-3Z" fill=${C.mint} />`,
          svg`<circle cx="-15" cy="-13" r="2.6" fill=${C.sunDark} /><circle cx="-3" cy="-10" r="2" fill=${C.sunDark} /><circle cx="9" cy="-14" r="2.8" fill=${C.sunDark} /><circle cx="19" cy="-10" r="1.8" fill=${C.sunDark} />`,
        ]),
      ),
    ),
  )
}

function wiping(parts: FridgeParts): Art {
  return [
    shadow(100, 184, 86),
    doorShell(BODY, BODY_DARK, ICE),
    bins(SHELF),
    shell(BODY),
    headerGloss(BODY_LIGHT),
    interior(ICE, ICE_DARK, '#fff3b0'),
    shelves(SHELF),
    part('shine', [
      svg`<path d="M84 80L104 58H116L96 80ZM102 80L122 58H128L108 80Z" fill="#fff" />`,
    ]),
    drawer(SHELF, []),
    snowflake(148, 70, 1, 1),
    snowflake(130, 64, 0.65, 3),
    snowflake(152, 133, 0.7, 2),
    cloth(),
    bubble(84, 106, 6.5, 1),
    bubble(156, 104, 8, 2),
    bubble(146, 96, 4.5, 3),
    bubble(96, 132, 5, 4),
    grille(),
    face(120, 35, parts.mood, C.fly, 0.9),
    mist(),
    stenchLines(([[187, 66]] as const).slice(0, parts.stench)),
  ]
}

function binBag(): Art {
  return part(
    'bin-bag',
    at(
      46,
      184,
      motion(
        'throb',
        at(-46, -184, [
          svg`<path d="M46 126C24 130 12 150 13 168C14 182 28 184 46 184C64 184 80 182 80 168C81 150 68 130 46 126Z" fill=${BAG} />`,
          svg`<path d="M24 150q-5 12-4 24M36 146q-3 10-2 18" fill="none" stroke=${BAG_DARK} stroke-width="3.4" stroke-linecap="round" />`,
          svg`<path d="M40 110C38 118 42 124 46 127C50 124 55 118 53 110C49 114 44 114 40 110Z" fill=${BAG} />`,
          svg`<rect x="39" y="122" width="15" height="6" rx="3" fill=${C.sun} />`,
          svg`<path d="M52 152C60 146 74 148 77 156C74 164 58 166 52 160Z" fill=${BAG_DARK} />`,
          fishbone(),
        ]),
      ),
    ),
  )
}

function fishbone(): Art {
  return part(
    'fishbone',
    at(
      60,
      157,
      [
        svg`<path d="M0 0H24" stroke=${C.cream} stroke-width="3.2" stroke-linecap="round" />`,
        svg`<path d="M6-6V6M12-7V7M18-6V6" stroke=${C.cream} stroke-width="2.6" stroke-linecap="round" />`,
        svg`<path d="M24 0C26-8 36-9 40-3C41 1 40 3 38 5C33 9 26 8 24 0Z" fill=${C.cream} />`,
        svg`<circle cx="33" cy="-2" r="2" fill=${C.fly} />`,
      ],
      -8,
    ),
  )
}

function emptied(parts: FridgeParts): Art {
  const lines: ReadonlyArray<readonly [number, number]> = [
    [46, 104],
    [20, 124],
    [74, 122],
  ]
  const spots: ReadonlyArray<readonly [number, number]> = [
    [14, 106],
    [80, 104],
  ]
  return [
    shadow(100, 184, 86),
    doorShell(BODY, BODY_DARK, ICE),
    bins(SHELF),
    shell(BODY),
    headerGloss(BODY_LIGHT),
    interior(ICE, ICE_DARK, '#fff3b0'),
    shelves(SHELF),
    drawer(SHELF, []),
    grille(),
    face(120, 35, parts.mood, C.fly, 0.9),
    shadow(46, 184, 38, 0.4),
    binBag(),
    sparkle(120, 74, 1, 1),
    sparkle(146, 108, 0.75, 3),
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function fresh(parts: FridgeParts): Art {
  return [
    shadow(100, 184, 86),
    doorShell(BODY, BODY_DARK, '#f2fbff'),
    bins(SHELF),
    doorStock(),
    shell(BODY),
    headerGloss(BODY_LIGHT),
    interior('#f4fcff', ICE, '#fff7c6'),
    svg`<path d="M104 58H136L166 158H74Z" fill="#fff7c6" opacity=".4" />`,
    shelves(SHELF),
    part('fruit', [apple(90, TOP_FLOOR), orange(120, TOP_FLOOR), pear(150, TOP_FLOOR)]),
    part('veg', [broccoli(90, MID_FLOOR), cheese(121, MID_FLOOR), tomato(151, MID_FLOOR)]),
    drawer(SHELF, [
      lettuce(100, 150, C.leaf, C.leafDark),
      tomato(133, 148),
      carrot(151, 151, 6),
      carrot(160, 152, 18),
    ]),
    grille(),
    face(120, 35, parts.mood, C.fly, 0.9),
    sparkle(28, 30, 1, 1),
    sparkle(188, 34, 0.85, 2),
    sparkle(180, 130, 1.1, 3),
    sparkle(12, 100, 0.8, 4),
  ]
}

export function fridge(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = fridgeParts(scene)
  const decay = parts.mould / 3
  const views: Record<FridgeView, () => Art> = {
    closed: () => closed(parts, decay),
    stuffed: () => stuffed(parts, decay),
    wiping: () => wiping(parts),
    emptied: () => emptied(parts),
    fresh: () => fresh(parts),
  }
  return frame('fridge', scene, options, views[parts.view]())
}
