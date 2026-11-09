import { nothing, svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  blobPath,
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
  round,
  shadeOf,
  shadow,
  sparkle,
  stenchLines,
  when,
  bubble,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type TeethView = 'sleeping' | 'dirty' | 'pleading' | 'scrubbing' | 'rinsing' | 'gleaming'

export interface TeethParts {
  view: TeethView
  specks: number
  film: number
  plaque: number
  germs: number
  stench: number
  flies: number
  mood: Mood
}

export const MAX_SPECKS = 6
export const MAX_FILM = 5

const PLAQUE_AT = [0.08, 0.35, 0.6] as const
const STENCH_AT = [0.05, 0.4, 0.7] as const
const GERMS_AT = [0.25, 0.5, 0.8] as const
const FLIES_AT = [0.6, 0.9] as const
const RINSE_GERMS_AT = [0.5, 0.85] as const

export function teethParts(scene: SceneView): TeethParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = clamp01(scene.stink)
  if (state === 'clean') {
    return {
      view: 'gleaming',
      specks: 0,
      film: 0,
      plaque: 0,
      germs: 0,
      stench: 0,
      flies: 0,
      mood: 'happy',
    }
  }
  const plaque = reached(stink, PLAQUE_AT)
  const stench = reached(stink, STENCH_AT)
  const germs = reached(stink, GERMS_AT)
  const flies = reached(stink, FLIES_AT)
  const queasy = stink >= 0.5
  if (state === 'running') {
    return {
      view: 'scrubbing',
      specks: 0,
      film: 1,
      plaque,
      germs: Math.min(1, germs),
      stench,
      flies: 0,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      view: 'rinsing',
      specks: 0,
      film: 0,
      plaque: Math.max(0, plaque - 1),
      germs: reached(stink, RINSE_GERMS_AT),
      stench,
      flies: 0,
      mood: queasy ? 'worried' : 'calm',
    }
  }
  if (state === 'due') {
    return {
      view: 'pleading',
      specks: MAX_SPECKS,
      film: MAX_FILM,
      plaque,
      germs,
      stench,
      flies,
      mood: queasy ? 'sick' : 'pleading',
    }
  }
  if (state === 'resting') {
    return {
      view: 'sleeping',
      specks: 0,
      film: 0,
      plaque,
      germs,
      stench,
      flies,
      mood: queasy ? 'sick' : 'sleepy',
    }
  }
  const specks = Math.min(MAX_SPECKS, Math.floor(fill * (MAX_SPECKS + 1)))
  const film = Math.min(MAX_FILM, Math.floor(fill * (MAX_FILM + 1)))
  let mood: Mood = specks >= 4 ? 'worried' : 'calm'
  if (queasy) mood = 'sick'
  return { view: 'dirty', specks, film, plaque, germs, stench, flies, mood }
}

const CROWN_TOP =
  'M-57-34C-61.5-60-34-72-18-66C-9-63-4.5-59 0-59C4.5-59 9-63 18-66C34-72 61.5-60 57-34'
const TOOTH = `${CROWN_TOP}C54.7-14 52.4-2 47.9 18C43.3 40 41 66 25 66C11.4 66 13.7 34 0 34C-13.7 34-11.4 66-25 66C-41 66-43.3 40-47.9 18C-52.4-2-54.7-14-57-34Z`
const CRESCENT =
  'M34.5-66.65C47.8-63.5 60.2-52.2 57-34C54.7-14 52.4-2 47.9 18C43.3 40 41 66 25 66C17.7 66 14.8 56 12.5 47C27.4 56 33 32 37.6 12C42.2-8 47.9-24 45.6-42C44.5-54 41-62 34.5-66.65Z'
const FILM_SHALLOW = `${CROWN_TOP}q-12 12-23 3t-23 2t-22-1t-23 2t-23-6Z`
const FILM_DEEP = `${CROWN_TOP}q-8 16-20 8t-22 4t-24-2t-24 4t-24-14Z`

const INK_FACE = '#4a3a5c'
const WHITE = '#fdfbf2'
const YELLOW = '#e9ca72'
const STAINED = '#b8ab60'
const FOAM = '#ffffff'
const FOAM_SHADE = '#cfeaff'

function bodyColor(parts: TeethParts): string {
  if (parts.view === 'gleaming') return '#ffffff'
  return mix(mix(WHITE, YELLOW, (parts.film / MAX_FILM) * 0.82), STAINED, (parts.plaque / 3) * 0.6)
}

function broccoli(): Art {
  return [
    svg`<path d="M-2 2L1 12" stroke="#7fbf63" stroke-width="5" stroke-linecap="round" />`,
    svg`<g fill=${C.leafDark}><circle cx="-6" cy="-1" r="5.5" /><circle cx="5" cy="0" r="5" /><circle cx="0" cy="-6" r="6" /></g>`,
  ]
}

function cookie(): Art {
  return [
    svg`<path d=${blobPath(9, 7.5)} fill="#b9814a" />`,
    svg`<g fill="#6d4526"><circle cx="-3" cy="-1" r="1.6" /><circle cx="3" cy="1.5" r="1.6" /></g>`,
  ]
}

function tomato(): Art {
  return svg`<path d="M-9 3Q-2-11 10-4Q7 5-2 8Q-7 9-9 3Z" fill=${C.coralDark} />`
}

function carrot(): Art {
  return svg`<rect x="-8" y="-4" width="16" height="8" rx="3.2" fill="#f79a3e" /><path d="M-3-4V1M3-1V4" stroke="#d97a22" stroke-width="1.8" stroke-linecap="round" />`
}

function seeds(): Art {
  return svg`<g fill="#39304a"><ellipse cx="-6" cy="1" rx="3" ry="2" transform="rotate(-24 -6 1)" /><ellipse cx="2" cy="-3" rx="3" ry="2" transform="rotate(30 2 -3)" /><ellipse cx="5" cy="4" rx="3" ry="2" transform="rotate(-8 5 4)" /></g>`
}

function spinach(): Art {
  return svg`<path d="M0-8C9-9 14-2 11 7C9 15 2 21-1 14C-3 8-8 5-7-1C-6-6-4-7 0-8Z" fill=${C.leafDark} /><path d="M1-5Q3 3 1 12" fill="none" stroke=${C.leaf} stroke-width="2" stroke-linecap="round" />`
}

export const SPECKS: ReadonlyArray<readonly [number, number, number, () => Art]> = [
  [-33, -44, -14, broccoli],
  [32, -46, 10, cookie],
  [-35, 24, 0, tomato],
  [37, 22, -28, carrot],
  [-4, -38, 0, seeds],
  [1, -56, 0, spinach],
]

const BLOTCHES: ReadonlyArray<readonly [number, number, number, number]> = [
  [-27, -31, 13, 8],
  [33, -28, 16, 11],
  [-29, 48, 9, 10],
]

function fissure(shade: string): Art {
  return svg`<path d="M0-58q-3 9 0 15M-32-55q-5 5-6 12M32-55q5 5 6 12" fill="none" stroke=${shade} stroke-width="3.2" stroke-linecap="round" />`
}

function cheeks(): Art {
  return svg`<g fill=${C.pink} opacity=".55"><ellipse cx="-36" cy="10" rx="7.5" ry="4.8" /><ellipse cx="36" cy="10" rx="7.5" ry="4.8" /></g>`
}

function spikes(color: string): Art {
  return Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4 + 0.39
    return svg`<circle cx=${round(Math.cos(angle) * 12.5)} cy=${round(Math.sin(angle) * 12.5)} r="3.8" fill=${color} />`
  })
}

const GERM_SPOTS = [
  [-50, -22, 2, C.mintDark],
  [38, -82, 1, C.lilacDark],
  [47, 56, 3, C.coralDark],
] as const

function germ(x: number, y: number, color: string, index: number, delay: number): Art {
  return part(
    'germ',
    at(
      x,
      y,
      motion(
        'wobble',
        [
          spikes(color),
          svg`<circle r="13" fill=${color} />`,
          svg`<circle cx="-5" cy="-2.5" r="4.6" fill="#fff" /><circle cx="5" cy="-2.5" r="4.6" fill="#fff" />`,
          svg`<circle cx="-3.8" cy="-1.8" r="2.3" fill=${C.fly} /><circle cx="3.8" cy="-1.8" r="2.3" fill=${C.fly} />`,
          svg`<path d="M-9-8.5l6 2.6M9-8.5l-6 2.6" stroke=${C.fly} stroke-width="2.2" stroke-linecap="round" />`,
          svg`<path d="M-6 6l3 3l3-3l3 3l3-3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`,
        ],
        delay,
      ),
    ),
    index,
  )
}

function germCrew(count: number): Art {
  return GERM_SPOTS.slice(0, count).map(([x, y, delay, color], i) => germ(x, y, color, i, delay))
}

function foamBlob(x: number, y: number, r: number): Art {
  return svg`<circle cx=${x} cy=${y + 2.4} r=${r} fill=${FOAM_SHADE} /><circle cx=${x} cy=${y} r=${r} fill=${FOAM} />`
}

function foamCap(): Art {
  const puffs = [
    [-46, -56, 11],
    [-30, -68, 13],
    [-9, -63, 12],
    [12, -69, 13],
    [33, -65, 12],
    [49, -51, 9.5],
    [-52, -42, 7.5],
    [-24, -52, 9],
    [16, -51, 8.5],
  ] as const
  return part('foam', [
    puffs.map(([x, y, r]) => foamBlob(x, y, r)),
    svg`<path d="M-50-30v8M54-38v12" stroke=${FOAM} stroke-width="8" stroke-linecap="round" />`,
    svg`<circle cx="-33" cy="-71" r="2.8" fill=${FOAM_SHADE} /><circle cx="11" cy="-72" r="2.4" fill=${FOAM_SHADE} />`,
  ])
}

function nightcap(): Art {
  return part(
    'nightcap',
    at(
      -2,
      -56,
      [
        svg`<path d="M-41 2C-40-34-14-58 14-54C38-50 58-32 64-6C66 2 58 8 53 1C47-12 40-14 36 2Z" fill=${C.lilac} />`,
        svg`<path d="M-30-24Q2-20 36 2L43-8Q8-34-20-38ZM2-52Q28-34 47-11L56-20Q38-44 16-54Z" fill=${C.lilacDark} />`,
        svg`<rect x="-46" y="-6" width="88" height="15" rx="7.5" fill=${C.cream} />`,
        svg`<circle cx="58" cy="9" r="10" fill=${C.cream} />`,
      ],
      -7,
      1.12,
    ),
  )
}

function arms(color: string): Art {
  return part('arms', [
    svg`<path d="M-52-6Q-70-10-76-30" fill="none" stroke=${color} stroke-width="9" stroke-linecap="round" />`,
    svg`<path d="M52-6Q70-10 76-30" fill="none" stroke=${color} stroke-width="9" stroke-linecap="round" />`,
  ])
}

function tooth(parts: TeethParts, extra: { before?: Art; after?: Art } = {}): Art {
  const body = bodyColor(parts)
  const shade = mix(body, '#7f7795', 0.26)
  const gleaming = parts.view === 'gleaming'
  const faceY = -2
  return [
    extra.before ?? nothing,
    part('tooth', svg`<path d=${TOOTH} fill=${body} />`),
    when(parts.film >= 2, () =>
      part(
        'film',
        svg`<path d=${parts.film >= 4 ? FILM_DEEP : FILM_SHALLOW} fill=${mix(YELLOW, C.sunDark, (parts.film / MAX_FILM) * 0.7)} opacity=".7" />`,
      ),
    ),
    svg`<path d=${CRESCENT} fill=${shade} opacity=${gleaming ? 0.35 : 0.55} />`,
    fissure(gleaming ? '#dbe9f5' : shade),
    BLOTCHES.slice(0, parts.plaque).map(([x, y, w, h], i) =>
      part(
        'plaque',
        at(x, y, [
          svg`<path d=${blobPath(w, h)} fill="#8f9a45" />`,
          svg`<path d=${blobPath(w * 0.5, h * 0.45)} fill="#6f7a32" />`,
        ]),
        i,
      ),
    ),
    gleaming
      ? part(
          'shine',
          svg`<path d="M-42-22L-28-54" stroke="#bfe4ff" stroke-width="9" stroke-linecap="round" /><path d="M-46-5L-43-13" stroke="#bfe4ff" stroke-width="9" stroke-linecap="round" />`,
        )
      : svg`<path d="M-45-30Q-43-46-33-53" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" opacity=".75" />`,
    SPECKS.slice(0, parts.specks).map(([x, y, r, art], i) => part('speck', at(x, y, art(), r), i)),
    cheeks(),
    face(0, faceY, parts.mood, INK_FACE, 1.3),
    germCrew(parts.germs),
    extra.after ?? nothing,
  ]
}

function placed(x: number, scale: number, art: Art, name?: string): Art {
  const inner = at(0, -66, art)
  const moved = name ? motion(name, inner) : inner
  return at(x, 182, moved, 0, scale)
}

function brushOf(scene: SceneView, color: string, shade: string): readonly [string, string] {
  const accent = accentOf(scene, color)
  return accent === color ? [color, shade] : [accent, shadeOf(accent)]
}

function toothbrush([color, shade]: readonly [string, string], paste: boolean): Art {
  const tufts = [0, 1, 2, 3, 4]
  return part('toothbrush', [
    svg`<path d="M-5.5-2Q-6.5-44-4-74H4Q6.5-44 5.5-2A5.5 5.5 0 0 1-5.5-2Z" fill=${color} />`,
    svg`<path d="M1.5-6Q2.6-44 1-72" fill="none" stroke=${shade} stroke-width="3" stroke-linecap="round" />`,
    svg`<rect x="-7.5" y="-122" width="15" height="52" rx="7.5" fill=${color} />`,
    tufts.map(
      (i) =>
        svg`<rect x="-23" y=${-119 + i * 9.2} width="17" height="8" rx="2.6" fill=${i % 2 ? '#a8dcff' : '#ffffff'} />`,
    ),
    when(paste, () =>
      part(
        'paste',
        svg`<path d="M-24-116q-8 5-1 10t0 10t0 10t1 9" fill="none" stroke=${C.mint} stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /><path d="M-24-116q-8 5-1 10t0 10t0 10t1 9" fill="none" stroke="#c9f5e2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
  ])
}

function tumbler(color: string, shade: string, art: Art): Art {
  return [
    art,
    svg`<path d="M-24-52H24L20-6Q19.5 0 13 0H-13Q-19.5 0-20-6Z" fill=${color} />`,
    svg`<path d="M-24-52H24L23.2-43H-23.2Z" fill=${shade} />`,
    svg`<path d="M-15-36L-13-12" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5" />`,
  ]
}

function zee(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'pulse',
      svg`<path d="M-6-6H6L-6 6H6" fill="none" stroke=${C.cream} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
      delay,
    ),
    -10,
    size,
  )
}

function restingBrush(scene: SceneView): Art {
  return at(4, -32, toothbrush(brushOf(scene, C.coral, C.coralDark), false), 12, 0.78)
}

function brushCup(x: number, scene: SceneView): Art {
  return part('cup', at(x, 182, tumbler(C.sky, C.skyDark, restingBrush(scene))))
}

function sleepingView(parts: TeethParts, scene: SceneView): Art {
  return [
    shadow(72, 184, 50),
    shadow(158, 184, 28),
    placed(72, 0.86, tooth(parts, { after: nightcap() }), 'sway'),
    brushCup(158, scene),
    part('zzz', [zee(140, 58, 1, 3), zee(154, 44, 1.3, 2), zee(174, 26, 1.6, 1)]),
    stenchLines(
      (
        [
          [20, 162],
          [126, 152],
          [20, 68],
        ] as const
      ).slice(0, parts.stench),
    ),
    flySpots(parts, [
      [128, 24],
      [44, 22],
    ]),
  ]
}

function flySpots(parts: TeethParts, spots: ReadonlyArray<readonly [number, number]>): Art {
  return spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i))
}

function dirtyView(parts: TeethParts, scene: SceneView): Art {
  return [
    shadow(76, 184, 54),
    shadow(162, 184, 28),
    placed(76, 0.95, tooth(parts)),
    brushCup(162, scene),
    stenchLines(
      (
        [
          [16, 164],
          [140, 66],
          [16, 58],
        ] as const
      ).slice(0, parts.stench),
    ),
    flySpots(parts, [
      [40, 30],
      [168, 22],
    ]),
  ]
}

function pleadingView(parts: TeethParts, scene: SceneView): Art {
  return [
    shadow(76, 184, 52),
    shadow(178, 184, 14),
    placed(76, 0.95, tooth(parts)),
    at(53, 130, motion('drip', drop(0, 0, C.water, 0.8))),
    part(
      'waiting-brush',
      at(178, 180, motion('sway', toothbrush(brushOf(scene, C.sky, C.skyDark), true)), -3),
    ),
    stenchLines(
      (
        [
          [20, 150],
          [146, 158],
          [168, 54],
        ] as const
      ).slice(0, parts.stench),
    ),
    flySpots(parts, [
      [32, 36],
      [86, 24],
    ]),
  ]
}

function scrubbingView(parts: TeethParts, scene: SceneView): Art {
  return [
    shadow(84, 184, 54),
    placed(
      84,
      0.95,
      tooth(
        { ...parts, germs: 0 },
        {
          after: part('foam', [
            foamBlob(-36, -60, 11),
            foamBlob(-15, -66, 13),
            foamBlob(9, -62, 12),
            foamBlob(32, -60, 11),
            foamBlob(-24, -48, 8),
            foamBlob(20, -47, 8),
          ]),
        },
      ),
      'rumble',
    ),
    at(
      186,
      44,
      motion('slosh', at(0, 0, toothbrush(brushOf(scene, C.coral, C.coralDark), false), -99, 0.98)),
    ),
    bubble(20, 74, 9, 1),
    bubble(166, 92, 8, 2),
    bubble(146, 112, 6, 3),
    bubble(52, 40, 6.5, 4),
    bubble(18, 104, 6, 5),
    when(parts.germs > 0, () => at(20, 168, germ(0, 0, C.mintDark, 0, 2), 0, 0.72)),
    stenchLines(
      (
        [
          [176, 164],
          [18, 132],
          [150, 158],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

function rinseCup(scene: SceneView): Art {
  return part(
    'rinse-cup',
    at(
      162,
      182,
      motion('throb', [
        restingBrush(scene),
        svg`<path d="M-25-62H25L20-6Q19.5 0 13 0H-13Q-19.5 0-20-6Z" fill="#dff3ff" opacity=".42" />`,
        svg`<path d="M-22.6-40Q-14-46-6-40T9-40T22.6-40L20-6Q19.5 0 13 0H-13Q-19.5 0-20-6Z" fill=${C.water} />`,
        svg`<path d="M-14-30L-12-11" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />`,
        svg`<path d="M-25-62H25" stroke="#eaf8ff" stroke-width="5" stroke-linecap="round" />`,
      ]),
    ),
  )
}

function rinsingView(parts: TeethParts, scene: SceneView): Art {
  return [
    shadow(76, 184, 54),
    shadow(162, 184, 28),
    placed(
      76,
      0.95,
      tooth(parts, {
        after: foamCap(),
      }),
    ),
    rinseCup(scene),
    when(parts.germs === 0, () => at(28, 110, motion('drip', drop(0, 0, FOAM_SHADE, 0.8), 1))),
    at(127, 106, motion('drip', drop(0, 0, FOAM_SHADE, 0.7), 3)),
    bubble(152, 96, 6.5, 1),
    bubble(174, 86, 5, 3),
    stenchLines(
      (
        [
          [16, 164],
          [140, 66],
          [16, 58],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

function gleamingView(parts: TeethParts, scene: SceneView): Art {
  const raised = at(76, -20, toothbrush(brushOf(scene, C.coral, C.coralDark), false), 8, 0.62)
  return [
    shadow(100, 184, 54),
    placed(100, 0.96, tooth(parts, { before: [raised, arms('#ffffff')] }), 'bob'),
    sparkle(140, 50, 1.9, 1),
    sparkle(34, 66, 1.5, 2),
    sparkle(172, 118, 1.15, 3),
    sparkle(26, 134, 0.95, 4),
    sparkle(92, 22, 1, 5),
  ]
}

export function teeth(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = teethParts(scene)
  const views: Record<TeethView, () => Art> = {
    sleeping: () => sleepingView(parts, scene),
    dirty: () => dirtyView(parts, scene),
    pleading: () => pleadingView(parts, scene),
    scrubbing: () => scrubbingView(parts, scene),
    rinsing: () => rinsingView(parts, scene),
    gleaming: () => gleamingView(parts, scene),
  }
  return frame('teeth', scene, options, views[parts.view]())
}
