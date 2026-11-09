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
  fly,
  frame,
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

export type SuitcaseView = 'idle' | 'pile' | 'stuck' | 'packing' | 'zipped' | 'proud'

export interface SuitcaseParts {
  view: SuitcaseView
  step: number
  mess: number
  packed: number
  fumes: number
  mood: Mood
}

export const MAX_PILE = 4
export const MAX_PACKED = 4

const MESS_AT = [0.15, 0.4, 0.65, 0.85] as const
const FUMES_AT = [0.5, 0.85] as const
const SICK_AT = 0.65

export function suitcaseParts(scene: SceneView): SuitcaseParts {
  const { state } = scene
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const mess = reached(stink, MESS_AT)
  const fumes = reached(stink, FUMES_AT)
  const sick = stink >= SICK_AT
  if (state === 'clean') {
    return { view: 'proud', step: 0, mess: 0, packed: MAX_PACKED, fumes: 0, mood: 'happy' }
  }
  if (state === 'waiting') {
    return {
      view: 'zipped',
      step: 0,
      mess,
      packed: MAX_PACKED,
      fumes: 0,
      mood: stink >= 0.85 ? 'sick' : stink >= 0.4 ? 'worried' : 'calm',
    }
  }
  if (state === 'running') {
    const packed = Math.min(MAX_PACKED, 1 + Math.floor(clamp01(scene.progress) * MAX_PACKED))
    return { view: 'packing', step: 0, mess: 0, packed, fumes: 0, mood: 'happy' }
  }
  if (state === 'due') {
    return {
      view: 'stuck',
      step: MAX_PILE,
      mess,
      packed: 0,
      fumes: 0,
      mood: sick ? 'sick' : 'pleading',
    }
  }
  if (state === 'resting') {
    return { view: 'idle', step: 0, mess: 0, packed: 0, fumes, mood: fumes ? 'worried' : 'sleepy' }
  }
  const step = Math.min(MAX_PILE, 1 + Math.floor(clamp01(scene.fill) * MAX_PILE))
  let mood: Mood = step >= 3 ? 'worried' : 'calm'
  if (sick) mood = 'sick'
  return { view: 'pile', step, mess: 0, packed: 0, fumes, mood }
}

const CASE = '#f2915a'
const PASSPORT = '#a63a5e'
const PASSPORT_DARK = '#7f2a48'
const GOLD = '#ffd777'
const SKIN = '#ffcfa8'
const CAT = '#a7aec8'
const CAT_DARK = '#7f88a8'
const CAT_LIGHT = '#dfe3ee'
const STAIN = '#b58a5a'
const LINING = '#3b2f63'
const DENIM = '#5b83d6'
const DENIM_DARK = '#4166b4'

interface Tones {
  body: string
  dark: string
  light: string
  lining: string
  liningDark: string
  elastic: string
  ink: string
}

function tonesOf(scene: SceneView): Tones {
  const body = accentOf(scene, CASE)
  const lining = mix(shadeOf(body, 0.35), LINING, 0.74)
  return {
    body,
    dark: shadeOf(body),
    light: tintOf(body, 0.34),
    lining,
    liningDark: shadeOf(lining, 0.42),
    elastic: tintOf(body, 0.5),
    ink: isDarkColor(body) ? C.cream : '#4a2412',
  }
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

function passport(x: number, y: number, rotate = 0, scale = 1): Art {
  return part(
    'passport',
    at(
      x,
      y,
      [
        svg`<rect x="-14" y="-18" width="28" height="36" rx="3.5" fill=${PASSPORT} />`,
        svg`<rect x="-14" y="-18" width="5" height="36" rx="2.5" fill=${PASSPORT_DARK} />`,
        svg`<circle cx="2.5" cy="-4" r="7" fill="none" stroke=${GOLD} stroke-width="2.2" />`,
        svg`<path d="M-4.5-4H9.5M2.5-11C-1.6-6.5-1.6-1.5 2.5 3C6.6-1.5 6.6-6.5 2.5-11Z" fill="none" stroke=${GOLD} stroke-width="1.5" />`,
        svg`<rect x="-3.5" y="9" width="12" height="2.6" rx="1.3" fill=${GOLD} />`,
      ],
      rotate,
      scale,
    ),
  )
}

function sunglasses(x: number, y: number, rotate = 0, scale = 1): Art {
  return part(
    'sunglasses',
    at(
      x,
      y,
      [
        svg`<path d="M-3-3H3" stroke=${C.sun} stroke-width="3" stroke-linecap="round" />`,
        svg`<path d="M-20-5H-3V0C-3 5-6 7-11 7C-17 7-20 4-20 0Z" fill=${C.glass} stroke=${C.sun} stroke-width="2.6" stroke-linejoin="round" />`,
        svg`<path d="M3-5H20V0C20 4 17 7 11 7C6 7 3 5 3 0Z" fill=${C.glass} stroke=${C.sun} stroke-width="2.6" stroke-linejoin="round" />`,
        svg`<path d="M-15-1L-10-1M8-1L13-1" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".6" />`,
      ],
      rotate,
      scale,
    ),
  )
}

function flipflop(x: number, y: number, color: string, rotate = 0, scale = 1): Art {
  return part(
    'flipflop',
    at(
      x,
      y,
      [
        svg`<path d="M0-21C8-21 11-15 10-7C9 0 7 5 7 11C7 18 4 21 0 21C-4 21-7 18-7 11C-7 5-9 0-10-7C-11-15-8-21 0-21Z" fill=${color} />`,
        svg`<path d="M-9-2L-1-14L9-2" fill="none" stroke=${C.cream} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
      ],
      rotate,
      scale,
    ),
  )
}

function folded(x: number, y: number, w: number, h: number, color: string, shade: string): Art {
  return part('folded', [
    svg`<rect x=${x - w / 2} y=${y - h} width=${w} height=${h} rx="5.5" fill=${color} />`,
    svg`<path d=${`M${x - w / 2 + 5} ${y - h * 0.42}H${x + w / 2 - 5}`} stroke=${shade} stroke-width="2.4" stroke-linecap="round" />`,
  ])
}

function sunhat(x: number, y: number, rotate = 0, scale = 1): Art {
  return part(
    'sunhat',
    at(
      x,
      y,
      [
        svg`<ellipse rx="31" ry="7" fill=${C.wickerLight} />`,
        svg`<path d="M-16-1C-16-22 16-22 16-1C8 2-8 2-16-1Z" fill=${C.wicker} />`,
        svg`<path d="M-16-6C-8-2 8-2 16-6L16-1C8 2-8 2-16-1Z" fill=${C.pink} />`,
      ],
      rotate,
      scale,
    ),
  )
}

function tag(x: number, y: number, tones: Tones): Art {
  return part(
    'tag',
    at(
      x,
      y,
      motion('sway', [
        svg`<path d="M0 0C-1 5-1 8 0 12" fill="none" stroke=${tones.elastic} stroke-width="2" stroke-linecap="round" />`,
        at(0, 12, [
          svg`<path d="M0 0L7 6V27Q7 29 5 29H-5Q-7 29-7 27V6Z" fill=${C.cream} />`,
          svg`<circle cy="6" r="1.8" fill=${tones.dark} />`,
          svg`<path d="M-3.5 13H3.5M-3.5 18H3.5M-3.5 23H1" stroke=${C.creamDark} stroke-width="2" stroke-linecap="round" />`,
        ]),
      ]),
    ),
  )
}

function latch(x: number, y: number): Art {
  return [
    svg`<rect x=${x - 7} y=${y} width="14" height="11" rx="3" fill=${C.metalMid} />`,
    svg`<rect x=${x - 4} y=${y + 2.6} width="8" height="3.4" rx="1.7" fill=${C.metalDark} />`,
  ]
}

function caseFront(tones: Tones, mood: Mood): Art {
  return part('case-front', [
    svg`<rect x="-46" y="-2" width="14" height="6" rx="2.5" fill=${C.fly} /><rect x="32" y="-2" width="14" height="6" rx="2.5" fill=${C.fly} />`,
    svg`<rect x="-60" y="-42" width="120" height="42" rx="11" fill=${tones.body} />`,
    svg`<path d="M-60-11A11 11 0 0 0-49 0H49A11 11 0 0 0 60-11Z" fill=${tones.dark} />`,
    svg`<path d="M-60-20V-11A11 11 0 0 0-49 0H-40C-40-11-49-20-60-20Z" fill=${C.metalMid} />`,
    svg`<path d="M60-20V-11A11 11 0 0 1 49 0H40C40-11 49-20 60-20Z" fill=${C.metalMid} />`,
    svg`<rect x="-60" y="-42" width="120" height="8" rx="4" fill=${tones.light} />`,
    latch(-38, -39),
    latch(38, -39),
    face(0, -20, mood, tones.ink, 0.92),
  ])
}

function lidOpen(tones: Tones, elastic: boolean): Art {
  return part('lid', [
    svg`<rect x="-56" y="-126" width="112" height="90" rx="14" fill=${tones.body} />`,
    svg`<rect x="-49" y="-119" width="98" height="76" rx="8" fill=${tones.lining} />`,
    when(elastic, () => [
      svg`<path d="M-41-110L41-66M41-110L-41-66" stroke=${tones.elastic} stroke-width="4.5" stroke-linecap="round" />`,
      svg`<rect x="-6" y="-94" width="12" height="12" rx="3.5" fill=${C.metalMid} />`,
    ]),
    svg`<rect x="-34" y="-126" width="24" height="5" rx="2.5" fill=${tones.light} /><rect x="10" y="-126" width="24" height="5" rx="2.5" fill=${tones.light} />`,
  ])
}

function openCase(tones: Tones, mood: Mood, inside: Art = [], elastic = true): Art {
  return part('suitcase', [
    lidOpen(tones, elastic),
    svg`<path d="M-50-50H50L60-34H-60Z" fill=${tones.liningDark} />`,
    inside,
    caseFront(tones, mood),
    tag(-54, -42, tones),
  ])
}

function packedCubes(count: number): Art {
  const cubes: ReadonlyArray<readonly [number, number, number, string, string]> = [
    [-36, 32, 15, DENIM, DENIM_DARK],
    [-3, 32, 19, C.mint, C.mintDark],
    [30, 32, 15, C.coral, C.coralDark],
    [-3, 30, 9, C.sun, C.sunDark],
  ]
  return cubes.slice(0, count).map(([x, w, h, color, shade], i) => {
    const y = i === 3 ? -56 : -36
    return folded(x, y, w, h, color, shade)
  })
}

function idleView(parts: SuitcaseParts, tones: Tones): Art {
  return [
    shadow(100, 184, 66),
    at(100, 180, openCase(tones, parts.mood)),
    when(parts.mood === 'sleepy', () => [
      zed(150, 44, 0.66, 1),
      zed(166, 28, 0.9, 2),
      zed(182, 16, 0.5, 3),
    ]),
    stenchLines(
      (
        [
          [30, 130],
          [172, 120],
        ] as const
      ).slice(0, parts.fumes),
    ),
  ]
}

function pile(step: number, fumes: number): Art {
  return part('pile', [
    shadow(0, 2, 36, 0.24),
    when(step >= 1, () => folded(4, 0, 58, 20, DENIM, DENIM_DARK)),
    when(step >= 2, () => folded(2, -20, 52, 17, C.coral, C.coralDark)),
    when(step >= 4, () => flipflop(19, -7, C.pink, 78, 0.64)),
    when(step >= 3, () => [
      folded(6, -37, 46, 15, C.mint, C.mintDark),
      at(29, -38, sock(0, 0, C.cream, C.sky, 12, 0.62)),
    ]),
    when(step >= 4, () => [sunhat(4, -55, -5, 0.9), sunglasses(5, -67, -5, 0.56)]),
    passport(-13, -19, -9, 1),
    stenchLines(
      (
        [
          [-22, -62],
          [34, -74],
        ] as const
      ).slice(0, fumes),
    ),
  ])
}

function pileView(parts: SuitcaseParts, tones: Tones): Art {
  return [
    shadow(76, 184, 60),
    at(76, 180, openCase(tones, parts.mood), 0, 0.92),
    at(155, 182, pile(parts.step, parts.fumes)),
  ]
}

function jumper(): Art {
  return part('jumper', [
    svg`<path d="M-4-14L-10-5M4-14L10-5" stroke=${C.glass} stroke-width="5.5" stroke-linecap="round" />`,
    svg`<ellipse cx="-12" cy="-3" rx="5.5" ry="3.4" fill=${C.cream} /><ellipse cx="12" cy="-3" rx="5.5" ry="3.4" fill=${C.cream} />`,
    svg`<path d="M-8-27L-18-41M8-27L18-41" stroke=${SKIN} stroke-width="4.8" stroke-linecap="round" />`,
    svg`<rect x="-9.5" y="-33" width="19" height="21" rx="8" fill=${C.mint} />`,
    svg`<path d="M-9.5-20H9.5" stroke=${C.mintDark} stroke-width="3" />`,
    svg`<circle cy="-43" r="10.5" fill=${SKIN} />`,
    svg`<path d="M-11-44C-11-58 11-58 11-44C5-49-5-49-11-44Z" fill=${C.sun} />`,
    svg`<path d="M6-48H17" stroke=${C.sunDark} stroke-width="3.6" stroke-linecap="round" />`,
    svg`<circle cx="-4" cy="-42" r="1.6" fill=${C.fly} /><circle cx="4" cy="-42" r="1.6" fill=${C.fly} />`,
    svg`<ellipse cy="-37" rx="2.8" ry="2.2" fill=${C.coralDark} />`,
  ])
}

function burstStar(): Art {
  const points = Array.from({ length: 16 }, (_, i) => {
    const r = i % 2 ? 13 : 27
    const a = (i * Math.PI) / 8
    return `${(Math.cos(a) * r * 1.1).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`
  })
  return svg`<path d=${`M${points.join('L')}Z`} fill=${C.sun} stroke-linejoin="round" />`
}

function spring(): Art {
  return svg`<path d="M0 0L10-3L2-8L13-11L5-16L16-19L8-24" fill="none" stroke=${C.metal} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`
}

function cat(): Art {
  const body: Art = [
    svg`<path d="M-22 1C-27-12-19-26-2-26C16-26 27-15 25-3C24 2 20 3 15 3H-16C-19 3-21 3-22 1Z" fill=${CAT} />`,
    svg`<path d="M6-25L9-14M14-23L15-13M20-19L20-11" stroke=${CAT_DARK} stroke-width="3" stroke-linecap="round" />`,
    at(-13, -22, [
      svg`<path d="M-13-5L-13-22L-3-14ZM13-5L13-22L3-14Z" fill=${CAT} stroke=${CAT} stroke-width="2" stroke-linejoin="round" />`,
      svg`<path d="M-10.5-10L-10.5-17L-5.5-13ZM10.5-10L10.5-17L5.5-13Z" fill=${C.pink} />`,
      svg`<ellipse rx="15.5" ry="13" fill=${CAT} />`,
      svg`<ellipse cy="6" rx="8" ry="6" fill=${CAT_LIGHT} />`,
      svg`<path d="M-10-1Q-7-5-4-1M4-1Q7-5 10-1" fill="none" stroke=${C.fly} stroke-width="2.2" stroke-linecap="round" />`,
      svg`<path d="M-1.6 3.5H1.6L0 5.5Z" fill=${C.pinkDark} stroke=${C.pinkDark} stroke-linejoin="round" />`,
    ]),
    svg`<ellipse cx="-14" cy="1" rx="6" ry="3.4" fill=${CAT_LIGHT} />`,
    svg`<path d="M23 0C12 6 2 5-4 2" fill="none" stroke=${CAT_DARK} stroke-width="6" stroke-linecap="round" />`,
  ]
  return part('cat', [shadow(0, 3, 27, 0.26), svg`<g transform="scale(-1 1)">${body}</g>`])
}

function squeezed(): Art {
  return part('squeeze', [
    blob(-40, -58, 25, 18, DENIM, DENIM_DARK, -8),
    blob(38, -66, 28, 20, C.mint, C.mintDark, 10),
    blob(-8, -66, 32, 20, C.pink, C.pinkDark, 4),
    blob(10, -50, 30, 15, C.sun, C.sunDark, -4),
    blob(-26, -46, 24, 12, C.lilac, C.lilacDark, 6),
  ])
}

function lidSlab(tones: Tones, tilt: number): Art {
  return part(
    'lid',
    at(
      0,
      -68,
      [
        svg`<rect x="-60" y="-36" width="120" height="37" rx="11" fill=${tones.body} />`,
        svg`<rect x="-60" y="-36" width="120" height="8" rx="4" fill=${tones.light} />`,
        svg`<path d="M-60-9A11 11 0 0 0-49 1H49A11 11 0 0 0 60-9Z" fill=${tones.dark} />`,
        svg`<path d="M-60-17V-25A11 11 0 0 1-49-36H-41C-41-25-50-17-60-17Z" fill=${C.metalMid} />`,
        svg`<path d="M60-17V-25A11 11 0 0 0 49-36H41C41-25 50-17 60-17Z" fill=${C.metalMid} />`,
        svg`<path d="M-20-36V-42Q-20-47-15-47H15Q20-47 20-42V-36" fill="none" stroke=${tones.dark} stroke-width="6.5" stroke-linecap="round" />`,
      ],
      tilt,
    ),
  )
}

function straps(tones: Tones, tilt: number, snapped: boolean): Art {
  const lift = (x: number): number => -66 + x * Math.tan((tilt * Math.PI) / 180)
  const line = (d: string): Art =>
    svg`<path d=${d} fill="none" stroke=${tones.elastic} stroke-width="4.5" stroke-linecap="round" />`
  return part(
    'straps',
    [-38, 38].map((x) => {
      const top = lift(x)
      return snapped && x > 0
        ? [line(`M${x} ${top.toFixed(1)}l-3 9`), line(`M${x} -34l4-8`)]
        : line(`M${x} ${top.toFixed(1)}L${x} -34`)
    }),
  )
}

function stuckView(parts: SuitcaseParts, tones: Tones): Art {
  const { mess } = parts
  const cx = mess >= 4 ? 78 : 100
  const tilt = mess >= 3 ? -11 : -6
  const lid = lidSlab(tones, tilt)
  return [
    shadow(cx, 184, 66),
    when(mess >= 1 && mess < 4, () => at(cx + 78, 170, sock(0, 0, C.cream, C.sky, 62, 0.62))),
    at(cx, 180, [
      when(mess >= 3, () => at(70, -66, motion('throb', burstStar()))),
      squeezed(),
      at(-54, -42, shirt(0, 0, C.sky, C.skyDark, 118, 0.5)),
      caseFront(tones, parts.mood),
      at(56, -38, sock(0, 0, C.lilac, C.cream, 12, 0.6)),
      straps(tones, tilt, mess >= 3),
      mess >= 2 ? motion('rumble', lid) : lid,
      when(mess >= 3, () => at(62, -72, motion('wobble', spring()))),
      when(mess >= 2, () => [
        at(0, -108, [
          svg`<path d="M-24 0Q-30-5-30-11M24 0Q30-5 30-11" fill="none" stroke=${C.cream} stroke-width="3" stroke-linecap="round" />`,
        ]),
        at(0, -123, motion('bob', jumper()), 0, 0.88),
      ]),
      when(mess < 2, () => [
        at(-66, -100, motion('drip', drop(0, 0, C.water, 0.72), 1)),
        at(68, -106, motion('drip', drop(0, 0, C.water, 0.6), 3)),
      ]),
    ]),
    when(mess >= 1, () => flipflop(27, 178, C.pink, 72, 0.8)),
    when(mess >= 4, () => [passport(134, 168, -12, 0.92), at(162, 181, cat(), 0, 0.9)]),
    when(mess >= 3, () => [
      at(22, 80, motion('wobble', sock(0, 0, C.coral, C.cream, -38, 0.7))),
      at(30, 36, motion('bob', sunglasses(0, 0, -18, 0.8), 2)),
      at(166, 40, motion('wobble', shirt(0, 0, C.sun, C.sunDark, 22, 0.6), 3)),
    ]),
  ]
}

function arc(d: string): Art {
  return svg`<path d=${d} fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9" opacity=".55" />`
}

function packingView(parts: SuitcaseParts, tones: Tones): Art {
  return [
    shadow(100, 184, 62),
    at(
      100,
      180,
      motion('bob', openCase(tones, parts.mood, packedCubes(parts.packed), false)),
      0,
      0.92,
    ),
    part('arcs', [arc('M14 150C16 32 74 18 84 122'), arc('M186 150C184 32 126 18 116 122')]),
    at(32, 65, motion('bob', shirt(0, 0, C.sky, C.skyDark, -20, 0.62), 1)),
    at(67, 58, motion('bob', passport(0, 0, 14, 0.82), 3)),
    at(168, 62, motion('bob', sock(0, 0, C.pink, C.cream, 24, 0.72), 2)),
    at(133, 56, motion('bob', sunglasses(0, 0, 10, 0.72), 4)),
    at(100, 104, motion('bob', flipflop(0, 0, C.sun, 24, 0.92), 5)),
    sparkle(100, 30, 0.8, 2),
  ]
}

function closedCase(tones: Tones, mood: Mood, faceY: number, extras: Art = []): Art {
  const grooves = [-48, -38, 38, 48].map(
    (x) =>
      svg`<path d=${`M${x} -76V-36`} stroke=${tones.dark} stroke-width="3.2" stroke-linecap="round" opacity=".55" />`,
  )
  return part('suitcase', [
    svg`<path d="M-22-86V-94Q-22-101-15-101H15Q22-101 22-94V-86" fill="none" stroke=${tones.dark} stroke-width="8" stroke-linecap="round" />`,
    svg`<rect x="-46" y="-2" width="14" height="6" rx="2.5" fill=${C.fly} /><rect x="32" y="-2" width="14" height="6" rx="2.5" fill=${C.fly} />`,
    svg`<rect x="-60" y="-88" width="120" height="88" rx="15" fill=${tones.body} />`,
    svg`<path d="M-60-12A12 12 0 0 0-48 0H48A12 12 0 0 0 60-12Z" fill=${tones.dark} />`,
    svg`<path d="M-60-88m0 15a15 15 0 0 1 15-15H45a15 15 0 0 1 15 15v-3a11 11 0 0 0-11-7H-49a11 11 0 0 0-11 7Z" fill=${tones.light} />`,
    grooves,
    svg`<path d="M-60-20V-12A12 12 0 0 0-48 0H-40C-40-11-49-20-60-20Z" fill=${C.metalMid} />`,
    svg`<path d="M60-20V-12A12 12 0 0 1 48 0H40C40-11 49-20 60-20Z" fill=${C.metalMid} />`,
    part('zip', [
      svg`<path d="M-60-29H60" stroke=${tones.dark} stroke-width="6.5" />`,
      svg`<path d="M-58-29H58" stroke=${C.metal} stroke-width="3" stroke-dasharray="2 2.4" />`,
      svg`<rect x="34" y="-34" width="12" height="10" rx="3" fill=${C.metalMid} />`,
      svg`<rect x="37" y="-26" width="6" height="14" rx="3" fill=${C.metal} />`,
    ]),
    face(0, faceY, mood, tones.ink, 1.05),
    extras,
  ])
}

function planeGlyph(color: string): Art {
  return svg`<path d="M0-11C1.6-11 2.4-9 2.4-7V-3L11 3V6L2.4 3V8L5 10V12L0 11L-5 12V10L-2.4 8V3L-11 6V3L-2.4-3V-7C-2.4-9-1.6-11 0-11Z" fill=${color} />`
}

function boardingPass(mess: number, tones: Tones): Art {
  const barcode = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
    const w = [2.6, 1.4, 3.4, 1.4, 2.6, 3.4, 1.4, 2.6, 1.4][i] ?? 2
    return svg`<rect x=${-18 + i * 4.5} y="29" width=${w} height="15" fill=${C.fly} />`
  })
  return part('boarding-pass', [
    svg`<path d="M-26-48H26V14A4 4 0 0 0 26 22V48H-26V22A4 4 0 0 0-26 14Z" fill=${C.cream} />`,
    svg`<path d="M-26-48H26V-20H-26Z" fill=${tones.body} />`,
    at(0, -33, planeGlyph('#fff'), 90, 0.82),
    svg`<circle cy="-42" r="2.8" fill=${C.fly} opacity=".7" />`,
    svg`<rect x="-19" y="-12" width="24" height="5" rx="2.5" fill=${C.metalDark} />`,
    svg`<rect x="-19" y="-2" width="16" height="4" rx="2" fill=${C.creamDark} />`,
    svg`<rect x="-19" y="6" width="22" height="4" rx="2" fill=${C.creamDark} />`,
    at(
      14,
      -2,
      motion('pulse', [
        svg`<circle r="8" fill="none" stroke=${C.coral} stroke-width="3" stroke-dasharray="3.6 3.6" stroke-linecap="round" />`,
      ]),
    ),
    svg`<path d="M-22 18H22" stroke=${C.creamDark} stroke-width="2" stroke-dasharray="3 4" stroke-linecap="round" />`,
    barcode,
    when(mess >= 2, () => [
      svg`<circle cx="-7" cy="30" r="14" fill="none" stroke=${STAIN} stroke-width="3.4" opacity=".7" />`,
      svg`<path d="M26 48V33L11 48Z" fill=${C.creamDark} />`,
    ]),
  ])
}

function zippedView(parts: SuitcaseParts, tones: Tones): Art {
  const { mess } = parts
  const caught = mess >= 1 ? at(-22, -30, sock(0, 0, C.mint, C.cream, 196, 0.62)) : []
  return [
    shadow(74, 184, 62),
    at(72, 180, closedCase(tones, parts.mood, -56, caught)),
    part(
      'pass-string',
      svg`<path d="M90 80C110 58 138 54 151 62" fill="none" stroke=${C.cream} stroke-width="2.4" stroke-linecap="round" />`,
    ),
    at(153, 112, motion('sway', at(0, 0, boardingPass(mess, tones), 5, 0.98))),
    stenchLines(
      (
        [
          [40, 84],
          [20, 118],
        ] as const
      ).slice(0, mess >= 3 ? 2 : 0),
    ),
    when(mess >= 4, () => [fly(112, 60, 0), fly(34, 54, 1)]),
  ]
}

function sticker(x: number, y: number, rotate: number, art: Art): Art {
  return part('sticker', at(x, y, art, rotate))
}

function stickers(): Art {
  return [
    sticker(-38, -64, -12, [
      svg`<circle r="14" fill=${C.cream} />`,
      svg`<circle r="11.5" fill=${C.sky} />`,
      svg`<circle r="5" fill=${C.sun} />`,
      svg`<path d="M0-9V-7M0 7V9M-9 0H-7M7 0H9M-6.4-6.4L-5-5M5 5L6.4 6.4M-6.4 6.4L-5 5M5-5L6.4-6.4" stroke=${C.sun} stroke-width="2" stroke-linecap="round" />`,
    ]),
    sticker(40, -64, 10, [
      svg`<rect x="-14" y="-12" width="28" height="24" rx="4" fill=${C.cream} />`,
      svg`<rect x="-11.5" y="-9.5" width="23" height="19" rx="2.5" fill=${C.mint} />`,
      svg`<path d="M-11.5 9.5L-3-4L3 3L6-1L11.5 9.5Z" fill=${C.leafDark} stroke=${C.leafDark} stroke-linejoin="round" />`,
      svg`<path d="M-5.5 0L-3-4L-.5-.8Z" fill=${C.cream} />`,
    ]),
    sticker(-22, -13, 6, [
      svg`<rect x="-15" y="-9" width="30" height="18" rx="9" fill=${C.cream} />`,
      svg`<rect x="-12.5" y="-6.5" width="25" height="13" rx="6.5" fill=${C.pink} />`,
      svg`<path d="M-7 0H7" stroke=${C.cream} stroke-width="3" stroke-linecap="round" />`,
    ]),
    sticker(20, -12, -8, [
      svg`<circle r="10.5" fill=${C.cream} />`,
      svg`<circle r="8.2" fill=${C.lilac} />`,
      at(0, 0, planeGlyph('#fff'), 40, 0.55),
    ]),
  ]
}

function plane(tones: Tones): Art {
  return part('plane', [
    svg`<path d="M-24-7L-35-26H-25L-11-9Z" fill=${tones.body} />`,
    svg`<path d="M-33 0C-33-8-22-11-12-11H18C27-11 34-5 34-1C34 3 27 5 18 5H-22C-29 5-33 3-33 0Z" fill=${C.metal} />`,
    svg`<path d="M-33 1C-32 4-28 5-22 5H18C25 5 31 3 33 1Z" fill=${C.metalMid} />`,
    svg`<path d="M20-10C27-9 32-5 33-2H21Z" fill=${C.glass} />`,
    [-12, -3, 6, 13].map((x) => svg`<circle cx=${x} cy="-4" r="2.1" fill=${C.glass} />`),
    svg`<path d="M-4 0L-16 20H-7L14 1Z" fill=${tones.dark} />`,
  ])
}

function proudView(tones: Tones): Art {
  return [
    part(
      'cloud',
      at(
        40,
        44,
        motion('drift', [
          svg`<path d="M-19 8C-27 8-27-3-18-4C-16-13-4-14-1-6C7-11 17-5 13 3C19 3 19 8 14 8Z" fill=${C.cream} opacity=".92" />`,
        ]),
      ),
    ),
    svg`<path d="M66 54Q92 50 118 38" fill="none" stroke=${C.cream} stroke-width="3.4" stroke-linecap="round" stroke-dasharray="6 9" opacity=".7" />`,
    at(148, 30, motion('bob', at(0, 0, plane(tones), -14, 0.86))),
    shadow(100, 184, 72),
    at(100, 180, closedCase(tones, 'happy', -56, stickers()), 0, 1.08),
    sparkle(26, 108, 1.1, 1),
    sparkle(176, 92, 1.2, 2),
    sparkle(20, 156, 0.7, 3),
    sparkle(182, 148, 0.75, 4),
  ]
}

export function suitcase(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = suitcaseParts(scene)
  const tones = tonesOf(scene)
  const views: Record<SuitcaseView, () => Art> = {
    idle: () => idleView(parts, tones),
    pile: () => pileView(parts, tones),
    stuck: () => stuckView(parts, tones),
    packing: () => packingView(parts, tones),
    zipped: () => zippedView(parts, tones),
    proud: () => proudView(tones),
  }
  return frame('suitcase', scene, options, views[parts.view]())
}
