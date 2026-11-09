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
  INK,
  isDarkColor,
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
  bubble,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type SkincareView = 'shelf' | 'routine' | 'mask' | 'glow'

export interface SkincareParts {
  view: SkincareView
  spots: number
  decay: number
  look: number
  flies: number
  stench: number
  plea: boolean
  mood: Mood
  mirrorMood: Mood
}

export const MAX_SPOTS = 7

const DECAY_AT = [0.05, 0.3, 0.55, 0.85] as const
const LOOK_AT = [0.3, 0.55] as const
const STENCH_AT = [0.55, 0.75] as const
const FLIES_AT = [0.85, 0.95] as const

export function skincareParts(scene: SceneView): SkincareParts {
  const { state, stink } = scene
  const fill = clamp01(scene.fill)
  if (state === 'clean') {
    return {
      view: 'glow',
      spots: 0,
      decay: 0,
      look: 0,
      flies: 0,
      stench: 0,
      plea: false,
      mood: 'happy',
      mirrorMood: 'happy',
    }
  }
  const decay = reached(stink, DECAY_AT)
  const look = reached(stink, LOOK_AT)
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  if (state === 'running') {
    return {
      view: 'routine',
      spots: 2,
      decay,
      look: 0,
      flies: 0,
      stench: 0,
      plea: false,
      mood: 'happy',
      mirrorMood: 'happy',
    }
  }
  if (state === 'waiting') {
    let mood: Mood = 'calm'
    if (stink >= 0.3) mood = 'worried'
    if (stink >= 0.75) mood = 'sick'
    return {
      view: 'mask',
      spots: 0,
      decay,
      look,
      flies,
      stench,
      plea: false,
      mood,
      mirrorMood: 'calm',
    }
  }
  const due = state === 'due'
  const spots = due
    ? MAX_SPOTS
    : state === 'resting'
      ? 0
      : Math.min(MAX_SPOTS - 1, Math.floor(fill * MAX_SPOTS))
  let mood: Mood = state === 'resting' ? 'sleepy' : spots >= 4 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (stink >= 0.75) mood = 'sick'
  let mirrorMood: Mood = state === 'resting' ? 'sleepy' : spots >= 2 ? 'worried' : 'calm'
  if (due) mirrorMood = 'pleading'
  return {
    view: 'shelf',
    spots,
    decay,
    look,
    flies,
    stench,
    plea: due,
    mood,
    mirrorMood,
  }
}

interface JarColors {
  body: string
  dark: string
  light: string
  pale: string
  ink: string
  blush: string
}

const JAR_DEFAULT = C.pink

function jarColors(scene: SceneView, decay: number): JarColors {
  const base = accentOf(scene, JAR_DEFAULT)
  const body = mix(base, '#b7a58c', decay * 0.13)
  return {
    body,
    dark: shadeOf(body, 0.26),
    light: tintOf(body, 0.34),
    pale: tintOf(body, 0.62),
    ink: isDarkColor(body) ? tintOf(body, 0.84) : mix(body, INK, 0.74),
    blush: mix(body, C.coralDark, 0.66),
  }
}

const GLASS_R = 40
const MIRROR_X = 130
const MIRROR_Y = 72
const JAR_FACE_X = 59
const JAR_FACE_Y = 156

const SHINE = 'M17.8-35.8A40 40 0 0 0 5.6-39.6L-39.6 5.6A40 40 0 0 0-35.8 17.8Z'
const SHINE_THIN = 'M30.2-26.2A40 40 0 0 0 25.2-31L-31 25.2A40 40 0 0 0-26.2 30.2Z'
const SPIRAL = 'M0 0a3 3 0 0 1 6 0a6 6 0 0 1-12 0a9 9 0 0 1 18 0'

const SPOTS = [
  [-17, 6, 3.8],
  [16, 25, 4.2],
  [18, 5, 3],
  [-16, 26, 3.6],
  [1, 1.5, 2.8],
  [-21, 16, 2.8],
  [21, 15, 3],
] as const

function sliceArt(r: number, rot: number): Art {
  const t = clamp01(rot / 4)
  const skin = mix(C.leafDark, '#6d5a2c', t)
  const ring = mix(C.leaf, '#8f8345', t)
  const flesh = mix('#dcf6ae', '#c0ae66', t)
  const core = mix('#bfe88a', '#9c8a4a', t)
  const seed = mix('#f3fbd8', '#6f6132', t)
  const seeds = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * Math.PI) / 3 + 0.5
    return svg`<ellipse cx=${round(Math.cos(angle) * r * 0.42)} cy=${round(Math.sin(angle) * r * 0.42)} rx=${round(r * 0.14)} ry=${round(r * 0.08)} transform=${`rotate(${round((angle * 180) / Math.PI)} ${round(Math.cos(angle) * r * 0.42)} ${round(Math.sin(angle) * r * 0.42)})`} fill=${seed} />`
  })
  return [
    svg`<circle r=${r} fill=${skin} />`,
    svg`<circle r=${round(r * 0.86)} fill=${ring} />`,
    svg`<circle r=${round(r * 0.74)} fill=${flesh} />`,
    svg`<circle r=${round(r * 0.3)} fill=${core} />`,
    seeds,
  ]
}

function mould(level: number): Art {
  const fuzz = '#7fa094'
  const white = '#d9e4dc'
  return part('mould', [
    when(level >= 2, () => [
      svg`<circle cx="-6" cy="-5" r="7" fill=${fuzz} />`,
      svg`<circle cx="-10" cy="1" r="4.5" fill=${fuzz} />`,
      svg`<circle cx="-7" cy="-7" r="2.2" fill=${white} />`,
      svg`<circle cx="-11" cy="1" r="1.5" fill=${white} />`,
    ]),
    when(level >= 3, () => [
      svg`<circle cx="7" cy="6" r="6.5" fill="#5f7d70" />`,
      svg`<circle cx="2" cy="10" r="3.8" fill=${fuzz} />`,
      svg`<circle cx="8" cy="4" r="2.2" fill=${white} />`,
      svg`<path d="M-13-9l-4-5M-5-13l-1-6M3-13l3-5" stroke=${fuzz} stroke-width="2.4" stroke-linecap="round" />`,
    ]),
    when(level >= 4, () => [
      svg`<circle cx="9" cy="-8" r="5" fill="#4e6b5e" />`,
      svg`<path d="M13-13l4-5M15 8l6 3M9 13l3 6" stroke=${fuzz} stroke-width="2.4" stroke-linecap="round" />`,
    ]),
  ])
}

function saucer(): Art {
  return [
    shadow(168, 183, 24, 0.24),
    svg`<ellipse cx="168" cy="178" rx="22" ry="5.5" fill=${C.metal} />`,
    svg`<ellipse cx="168" cy="176.5" rx="15" ry="2.6" fill=${C.metalMid} />`,
  ]
}

function dishSlice(decay: number): Art {
  return part('cucumber', [
    saucer(),
    at(168, 160, [sliceArt(17, decay), mould(decay)], decay >= 3 ? 14 : -6),
  ])
}

function swirl(r: number, cream: string, groove: string, shade: string): Art {
  const lobes = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4
    return svg`<circle cx=${round(Math.cos(angle) * r * 0.74)} cy=${round(Math.sin(angle) * r * 0.74)} r=${round(r * 0.36)} fill=${cream} />`
  })
  return [
    svg`<circle r=${round(r * 1.04)} fill=${shade} opacity=".35" />`,
    lobes,
    svg`<circle r=${round(r * 0.84)} fill=${cream} />`,
    at(
      0,
      0,
      svg`<path d=${SPIRAL} fill="none" stroke=${groove} stroke-width="3.4" stroke-linecap="round" />`,
      0,
      round(r / 15),
    ),
  ]
}

function sheetMask(x: number, y: number, scale: number, holes: string, decay: number): Art {
  const sheet = mix('#fbf8ef', '#d5c79b', decay * 0.14)
  const crease = mix('#d6dcea', '#a99a68', decay * 0.25)
  return part(
    'sheet-mask',
    at(
      x,
      y,
      [
        svg`<path d="M0-24C17-24 28-14 28 0C28 16 15 27 0 27C-15 27-28 16-28 0C-28-14-17-24 0-24Z" fill=${sheet} />`,
        svg`<ellipse cx="-11" cy="0" rx="8" ry="6.5" fill=${holes} /><ellipse cx="11" cy="0" rx="8" ry="6.5" fill=${holes} /><ellipse cx="0" cy="9" rx="8" ry="4.2" fill=${holes} />`,
        svg`<path d="M-24-7q4-5 8-8M24-7q-4-5-8-8M-22 12q5 7 11 9M22 12q-5 7-11 9" fill="none" stroke=${crease} stroke-width="2.2" stroke-linecap="round" />`,
        when(
          decay >= 2,
          () =>
            svg`<path d="M-3-19l3 4-3 3 3 4M16 14l-3 3 3 3" fill="none" stroke=${crease} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
        ),
      ],
      0,
      scale,
    ),
  )
}

function alarmedFace(ink: string): Art {
  return part('alarmed-eyes', [
    svg`<circle cx="-9" cy="-1" r="7" fill="#fff" /><circle cx="9" cy="-1" r="7" fill="#fff" />`,
    svg`<circle cx="-5.5" cy="-1" r="3.2" fill=${ink} /><circle cx="12.5" cy="-1" r="3.2" fill=${ink} />`,
    svg`<ellipse cx="3" cy="11" rx="3.4" ry="4.2" fill=${ink} />`,
    svg`<path d="M-15-11l8-2M6-13l8 2" fill="none" stroke=${ink} stroke-width="2.6" stroke-linecap="round" />`,
  ])
}

function reflectionFace(parts: SkincareParts, colors: JarColors): Art {
  const y = 13
  if (parts.view === 'mask') {
    return [
      sheetMask(0, y + 1, 0.76, colors.light, parts.decay),
      parts.look >= 2
        ? at(5, y - 1, alarmedFace(colors.ink), 0, 0.6)
        : mirrorFace(parts.look * 5, y, parts.mirrorMood, colors.ink),
    ]
  }
  if (parts.look >= 2) return at(8, y, alarmedFace(colors.ink), 0, 0.82)
  return mirrorFace(parts.look * 7, y, parts.look === 1 ? 'worried' : parts.mirrorMood, colors.ink)
}

function mirrorFace(x: number, y: number, mood: Mood, ink: string): Art {
  return part('reflection-face', face(x, y, mood, ink, 0.72))
}

function reflection(parts: SkincareParts, colors: JarColors): Art {
  const dryLines = parts.decay >= 2 && parts.view !== 'mask'
  return part('reflection', [
    svg`<path d="M-25-3H25V31.2A40 40 0 0 1-25 31.2Z" fill=${colors.light} />`,
    svg`<rect x="-30" y="-20" width="60" height="19" rx="6.5" fill=${colors.pale} />`,
    svg`<rect x="-30" y="-6" width="60" height="5" rx="2.5" fill=${colors.body} opacity=".55" />`,
    reflectionFace(parts, colors),
    when(parts.view === 'glow', () => [
      svg`<ellipse cx="-16" cy="19" rx="5.2" ry="3.4" fill=${colors.blush} opacity=".7" /><ellipse cx="16" cy="19" rx="5.2" ry="3.4" fill=${colors.blush} opacity=".7" />`,
    ]),
    SPOTS.slice(0, parts.spots).map(([x, y, r], i) =>
      part(
        'spot',
        svg`<circle cx=${x} cy=${y} r=${r} fill="#c23a55" /><circle cx=${x - r * 0.3} cy=${y - r * 0.32} r=${round(r * 0.26)} fill="#ffc4cf" />`,
        i,
      ),
    ),
    when(
      dryLines,
      () =>
        svg`<path d="M-20 3l4 5-3 4 3 5M20 28l-4-5 3-3" fill="none" stroke=${colors.dark} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
    when(parts.view === 'routine', () => [
      at(-10, 12, sliceArt(9.5, 0)),
      at(10, 12, sliceArt(9.5, 0)),
    ]),
  ])
}

function mirrorHead(parts: SkincareParts, colors: JarColors): Art {
  const glass = parts.view === 'glow' ? C.water : mix(C.water, '#ffffff', 0.18)
  const squeeze = parts.look >= 2 ? 0.72 : parts.look === 1 ? 0.92 : 1
  const head: Art = [
    svg`<circle r="46.5" fill=${C.sunDark} />`,
    svg`<circle r="44" fill=${C.sun} />`,
    svg`<circle r=${GLASS_R} fill=${glass} />`,
    svg`<path d=${SHINE} fill="#fff" opacity=".5" />`,
    svg`<path d=${SHINE_THIN} fill="#fff" opacity=".32" />`,
    reflection(parts, colors),
  ]
  const turned = squeeze === 1 ? head : svg`<g transform=${`scale(1 ${squeeze})`}>${head}</g>`
  return part('mirror-glass', turned)
}

function mirror(parts: SkincareParts, colors: JarColors): Art {
  const x = MIRROR_X
  const y = MIRROR_Y
  return part('mirror', [
    svg`<rect x="104" y="172" width="52" height="11" rx="5.5" fill=${C.metalDark} />`,
    svg`<rect x="112" y="169" width="36" height="7" rx="3.5" fill=${C.metalMid} />`,
    svg`<rect x="126" y="122" width="8" height="50" rx="4" fill=${C.metalMid} />`,
    svg`<path d=${`M${x - 53} ${y}A53 53 0 0 0 ${x + 53} ${y}`} fill="none" stroke=${C.metalMid} stroke-width="6.5" stroke-linecap="round" />`,
    at(x, y, mirrorHead(parts, colors)),
    svg`<circle cx=${x - 53} cy=${y} r="6" fill=${C.metalDark} /><circle cx=${x + 53} cy=${y} r="6" fill=${C.metalDark} />`,
  ])
}

function cracks(decay: number, colors: JarColors): Art {
  const lines = [
    'M30 130l5 7-4 6 5 7',
    'M90 130l-6 6 4 6-3 6',
    'M26 176l5-7-3-5 4-4',
    'M94 172l-5-5 2-5',
    'M46 130l2 5-3 4M72 176l-3-5 3-4',
  ] as const
  const shown = [0, 1, 3, 5, 5][decay] ?? 0
  return when(shown > 0, () =>
    part(
      'cracks',
      lines
        .slice(0, shown)
        .map(
          (d) =>
            svg`<path d=${d} fill="none" stroke=${colors.dark} stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />`,
        ),
    ),
  )
}

function flakes(decay: number, colors: JarColors): Art {
  return when(decay >= 3, () =>
    part('flakes', [
      svg`<path d="M10 181l6-4 5 3-2 4h-7ZM102 183l5-3 5 2-1 3h-7Z" fill=${colors.light} />`,
      when(
        decay >= 4,
        () => svg`<path d="M26 184l4-3 4 2-1 3h-6ZM78 185l4-2 3 2h-6Z" fill=${colors.dark} />`,
      ),
    ]),
  )
}

function jarBody(parts: SkincareParts, colors: JarColors): Art {
  return [
    svg`<path d="M20 124H98V168Q98 182 84 182H34Q20 182 20 168Z" fill=${colors.body} />`,
    svg`<path d="M84 182Q98 182 98 168V124H89V162Q89 174 76 182Z" fill=${colors.dark} opacity=".42" />`,
    svg`<rect x="27" y="133" width="8" height="30" rx="4" fill=${colors.pale} opacity=".8" />`,
    svg`<rect x="38" y="133" width="4.5" height="8" rx="2.25" fill=${colors.pale} opacity=".8" />`,
    cracks(parts.decay, colors),
  ]
}

function lid(colors: JarColors, tilt: number): Art {
  return part(
    'lid',
    at(
      59,
      116,
      [
        svg`<rect x="-46" y="-13" width="92" height="26" rx="9" fill=${colors.pale} />`,
        svg`<rect x="-46" y="4" width="92" height="9" rx="4.5" fill=${colors.light} />`,
        [-30, -15, 0, 15, 30].map(
          (x) =>
            svg`<rect x=${x - 1.6} y="-8" width="3.2" height="11" rx="1.6" fill=${colors.light} />`,
        ),
      ],
      tilt,
    ),
  )
}

function jarFace(parts: SkincareParts, colors: JarColors): Art {
  return face(JAR_FACE_X, JAR_FACE_Y, parts.mood, colors.ink, 1.05)
}

function plea(colors: JarColors): Art {
  return part('plea', [
    svg`<circle cx="50" cy="96" r="4" fill=${C.cream} /><circle cx="44" cy="85" r="6.5" fill=${C.cream} />`,
    at(
      42,
      50,
      motion('pulse', [
        svg`<circle r="28" fill=${C.cream} />`,
        swirl(17, colors.light, colors.dark, colors.body),
      ]),
    ),
  ])
}

function alarm(): Art {
  return part(
    'alarm',
    at(
      178,
      24,
      motion('flicker', [
        svg`<rect x="-3.5" y="-14" width="7" height="19" rx="3.5" fill=${C.coral} />`,
        svg`<circle cy="12" r="4.2" fill=${C.coral} />`,
      ]),
      14,
    ),
  )
}

function sweat(): Art {
  return part('sweat', at(80, 30, motion('drip', drop(0, 0, C.water, 1.1), 2)))
}

function nuisance(parts: SkincareParts): Art {
  const lines: Array<readonly [number, number]> = [
    [152, 152],
    [184, 136],
  ]
  const flySpots: Array<readonly [number, number]> = [
    [24, 104],
    [184, 118],
  ]
  return [
    when(parts.look >= 1, sweat),
    when(parts.look >= 2, alarm),
    stenchLines(lines.slice(0, parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function shelf(parts: SkincareParts, colors: JarColors): Art {
  return [
    shadow(66, 183, 52),
    shadow(130, 184, 30, 0.22),
    mirror(parts, colors),
    dishSlice(parts.decay),
    flakes(parts.decay, colors),
    part('jar', [
      jarBody(parts, colors),
      lid(colors, parts.decay >= 4 ? -7 : 0),
      jarFace(parts, colors),
    ]),
    when(parts.plea, () => plea(colors)),
    nuisance(parts),
  ]
}

function routine(parts: SkincareParts, colors: JarColors): Art {
  const floaters = [
    [26, 40, 12, 1],
    [98, 22, 10, 3],
    [176, 134, 11, 2],
  ] as const
  return [
    shadow(66, 183, 52),
    shadow(130, 184, 30, 0.22),
    mirror(parts, colors),
    part('lid-off', [
      shadow(168, 184, 22, 0.24),
      at(168, 174, [
        svg`<rect x="-20" y="-9" width="40" height="18" rx="7" fill=${colors.pale} />`,
        svg`<rect x="-20" y="2" width="40" height="7" rx="3.5" fill=${colors.light} />`,
      ]),
    ]),
    part('swirl', at(59, 104, motion('spin', swirl(29, '#fff7ea', colors.body, colors.dark)))),
    part('jar', [
      svg`<rect x="18" y="116" width="82" height="13" rx="6.5" fill=${colors.pale} />`,
      jarBody(parts, colors),
      svg`<rect x="18" y="116" width="82" height="13" rx="6.5" fill=${colors.pale} />`,
      jarFace(parts, colors),
      at(JAR_FACE_X - 11.5, JAR_FACE_Y - 2.5, sliceArt(9.5, 0)),
      at(JAR_FACE_X + 11.5, JAR_FACE_Y - 2.5, sliceArt(9.5, 0)),
    ]),
    floaters.map(([x, y, r, d]) => part('cucumber', at(x, y, motion('bob', sliceArt(r, 0), d)))),
    bubble(22, 96, 7, 2),
    bubble(96, 62, 6, 4),
    bubble(66, 34, 8, 1),
    bubble(184, 104, 5, 5),
  ]
}

function hourglass(): Art {
  return part(
    'hourglass',
    at(
      59,
      82,
      motion('wobble', [
        svg`<path d="M-11-16H11C11-5 4-3 2 0C4 3 11 5 11 16H-11C-11 5-4 3-2 0C-4-3-11-5-11-16Z" fill=${mix(C.water, '#ffffff', 0.55)} />`,
        svg`<path d="M-6-7H6C4-4 1-3 0 0C-1-3-4-4-6-7Z" fill=${C.sun} />`,
        svg`<path d="M-8 15C-6 8-2 6 0 5C2 6 6 8 8 15Z" fill=${C.sun} />`,
        svg`<rect x="-15" y="-21" width="30" height="6" rx="3" fill=${C.wicker} /><rect x="-15" y="15" width="30" height="6" rx="3" fill=${C.wicker} />`,
      ]),
    ),
  )
}

function maskView(parts: SkincareParts, colors: JarColors): Art {
  return [
    shadow(66, 183, 52),
    shadow(130, 184, 30, 0.22),
    mirror(parts, colors),
    dishSlice(parts.decay),
    flakes(parts.decay, colors),
    part('jar', [
      jarBody(parts, colors),
      lid(colors, 0),
      sheetMask(JAR_FACE_X, JAR_FACE_Y, 0.95, colors.body, parts.decay),
      jarFace(parts, colors),
      when(parts.decay < 2, () => at(82, 176, motion('drip', drop(0, 0, '#eef7ff', 0.7), 3))),
    ]),
    hourglass(),
    nuisance(parts),
  ]
}

function glowRays(): Art {
  return part('glow', [
    svg`<circle cx=${MIRROR_X} cy=${MIRROR_Y} r="58" fill=${C.spark} opacity=".13" />`,
    svg`<circle cx=${MIRROR_X} cy=${MIRROR_Y} r="52" fill=${C.spark} opacity=".22" />`,
    at(
      MIRROR_X,
      MIRROR_Y,
      motion(
        'flicker',
        [-66, -44, -22, 0, 22, 44, 66].map(
          (angle) =>
            svg`<rect x="-2.2" y="-58" width="4.4" height="8.5" rx="2.2" fill=${C.spark} transform=${`rotate(${angle})`} />`,
        ),
      ),
    ),
  ])
}

function glow(parts: SkincareParts, colors: JarColors): Art {
  return [
    glowRays(),
    shadow(66, 183, 52),
    shadow(130, 184, 30, 0.22),
    mirror(parts, colors),
    dishSlice(0),
    part('jar', [
      jarBody(parts, colors),
      lid(colors, 0),
      jarFace(parts, colors),
      svg`<ellipse cx="36" cy="164" rx="7" ry="4.4" fill=${colors.blush} opacity=".6" /><ellipse cx="82" cy="164" rx="7" ry="4.4" fill=${colors.blush} opacity=".6" />`,
    ]),
    sparkle(152, 50, 1.25, 1),
    sparkle(112, 96, 0.8, 3),
    sparkle(36, 78, 1.35, 2),
    sparkle(82, 36, 0.8, 4),
    sparkle(180, 144, 0.8, 5),
  ]
}

export function skincare(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = skincareParts(scene)
  const colors = jarColors(scene, parts.decay)
  const views: Record<SkincareView, () => Art> = {
    shelf: () => shelf(parts, colors),
    routine: () => routine(parts, colors),
    mask: () => maskView(parts, colors),
    glow: () => glow(parts, colors),
  }
  return frame('skincare', scene, options, views[parts.view]())
}
