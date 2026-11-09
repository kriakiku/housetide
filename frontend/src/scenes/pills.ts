import { nothing, svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { PillSlot, SceneView } from '../types.ts'
import {
  accentOf,
  at,
  clamp01,
  COLORS as C,
  face,
  frame,
  mix,
  motion,
  part,
  reached,
  shadow,
  sparkle,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type PillPhase = 'quiet' | 'ready' | 'lifted' | 'taken-pending' | 'popped'

export interface PillsParts {
  day: number
  cells: readonly PillSlot[]
  phase: PillPhase
  pulse: boolean
  glow: number
  neglect: number
  fade: number
  tilt: number
  mood: Mood
}

const SLOTS: ReadonlyArray<readonly [number, number]> = [
  [52, 72],
  [84, 72],
  [116, 72],
  [148, 72],
  [52, 124],
  [84, 124],
  [116, 124],
]

const STALE_TOP = '#8f8a84'
const STALE_BOTTOM = '#aaa497'
const missedTop = (accent: string): string => mix(accent, STALE_TOP, 0.5)
export const MISSED_TOP = missedTop(C.coral)
export const MISSED_BOTTOM = mix(C.cream, STALE_BOTTOM, 0.5)
export const MISSED_SHINE = 0.35
const NEGLECT_AT = [0.15, 0.45, 0.75] as const
const GLOW_AT = [0.25, 0.5, 0.75] as const

export function pillsParts(scene: SceneView, day = 3): PillsParts {
  const { state, stink, fill } = scene
  const fallback = Number.isFinite(day) ? ((Math.trunc(day) % 7) + 7) % 7 : 3
  const given = scene.slots?.length === SLOTS.length ? scene.slots : undefined
  const cells = given ?? SLOTS.map((_, i): PillSlot => (i < fallback ? 'taken' : 'full'))
  let focus = fallback
  if (given) focus = state === 'clean' ? given.lastIndexOf('taken') : given.indexOf('current')
  const current = given?.[focus] === 'current'
  const neglect = state === 'clean' ? 0 : reached(stink, NEGLECT_AT)
  const phases: Record<SceneView['state'], PillPhase> = {
    resting: 'quiet',
    accumulating: 'quiet',
    due: 'ready',
    running: 'lifted',
    waiting: 'taken-pending',
    clean: 'popped',
  }
  const phase = phases[state]
  let mood: Mood = state === 'resting' ? 'sleepy' : 'calm'
  if (state === 'due') mood = 'pleading'
  if (state === 'clean' || state === 'running') mood = 'happy'
  if (neglect >= 1) mood = 'worried'
  if (neglect >= 2) mood = 'sick'
  return {
    day: focus,
    cells,
    phase,
    pulse: state === 'due' || current,
    glow: state === 'accumulating' ? reached(fill, GLOW_AT) : 0,
    neglect,
    fade: state === 'clean' ? 0 : clamp01(stink) * 0.7,
    tilt: [0, -3, -6, -10][neglect] ?? 0,
    mood,
  }
}

function capsule(top: string, bottom: string, shine = 0.6): Art {
  return svg`
    <rect x="-10" y="-22" width="20" height="44" rx="10" fill=${top} />
    <path d="M-10 0H10V12A10 10 0 0 1-10 12Z" fill=${bottom} />
    <rect x="-5.5" y="-16" width="4" height="13" rx="2" fill="#fff" opacity=${shine} />
  `
}

function well(x: number, y: number, popped: boolean): Art {
  return popped
    ? svg`<rect x=${x - 13} y=${y - 25} width="26" height="50" rx="13" fill="#545c78" /><path d=${`M${x - 8} ${y + 8}a8 11 0 0 0 16 0`} fill="none" stroke="#7d86a3" stroke-width="3.4" stroke-linecap="round" />`
    : svg`<rect x=${x - 13.5} y=${y - 25.5} width="27" height="51" rx="13.5" fill=${C.metal} />`
}

function missed(x: number, y: number, top: string, fade: number): Art {
  return at(
    x,
    y,
    capsule(mix(top, STALE_TOP, fade), mix(MISSED_BOTTOM, STALE_BOTTOM, fade), MISSED_SHINE),
  )
}

function glass(x: number, y: number): Art {
  return part(
    'glass',
    at(x, y, [
      svg`<path d="M-17-30H17L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill="#cfe8ff" opacity=".35" />`,
      svg`<path d="M-15.5-10H15.5L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill=${C.water} />`,
      svg`<path d="M-9-2L-7 22" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />`,
    ]),
  )
}

function check(x: number, y: number): Art {
  return part(
    'check',
    at(x, y, [
      svg`<circle r="19" fill=${C.check} /><path d="M-9 0l6.5 7L9.5-7" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`,
    ]),
  )
}

function dust(level: number): Art {
  const specks: ReadonlyArray<readonly [number, number, number]> = [
    [44, 46, 2.6],
    [132, 104, 2.2],
    [150, 134, 3],
    [66, 100, 2],
    [104, 46, 2.4],
    [36, 148, 2.2],
    [128, 150, 2.8],
    [92, 98, 2.2],
  ]
  return part(
    'dust',
    specks
      .slice(0, level * 3)
      .map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill="#b9b3a3" opacity=".85" />`),
  )
}

function cobweb(): Art {
  const thread = '#d7dce8'
  return part(
    'cobweb',
    svg`<g fill="none" stroke=${thread} stroke-width="2" stroke-linecap="round" opacity=".8">
      <path d="M200 28L146 34M200 28L154 8M172 0L166 22" />
      <path d="M178 2Q180 14 200 16M162 6Q164 24 200 40M150 18Q156 34 170 28" />
    </g>`,
  )
}

function spider(): Art {
  return part('spider', [
    svg`<path d="M160 24V66" stroke="#d7dce8" stroke-width="1.8" />`,
    at(
      160,
      70,
      motion(
        'bob',
        svg`<g fill="none" stroke=${C.fly} stroke-width="2.6" stroke-linecap="round">
            <path d="M-6-3L-15-9M-6 0L-16 0M-6 3L-15 9M6-3L15-9M6 0L16 0M6 3L15 9" />
          </g><circle r="9" fill=${C.fly} stroke=${C.wing} stroke-width="1.4" /><circle cx="-3.2" cy="-1.5" r="2.1" fill="#fff" /><circle cx="3.2" cy="-1.5" r="2.1" fill="#fff" />`,
      ),
    ),
  ])
}

export function pills(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = pillsParts(scene, options?.day)
  const pack = mix(C.metalMid, '#8c8a80', parts.fade)
  const accent = accentOf(scene, C.coral)
  const pillTop = mix(accent, '#a59a90', parts.fade)
  const pillBottom = mix(C.cream, '#b3ad9e', parts.fade)
  const nextTop = mix(C.sun, '#a59a90', parts.fade)
  const slot = SLOTS[parts.day] ?? SLOTS[3] ?? ([84, 72] as const)
  const [nx, ny] = slot

  const others = SLOTS.flatMap(([x, y], i) => {
    if (i === parts.day) return []
    const cell = parts.cells[i]
    if (cell === 'taken') return [part('empty-well', well(x, y, true), i)]
    if (cell === 'missed')
      return [
        part('missed-pill', [well(x, y, false), missed(x, y, missedTop(accent), parts.fade)], i),
      ]
    return [part('pill', [well(x, y, false), at(x, y, capsule(pillTop, pillBottom))], i)]
  })

  const focused = parts.day >= 0
  const halo = (art: Art): Art => at(nx, ny, parts.pulse ? motion('pulse', art) : art)

  const haloOpacity =
    parts.phase === 'ready' ? 1 : Math.max(parts.glow * 0.3, parts.pulse ? 0.45 : 0)
  const ring = when(parts.pulse || parts.glow > 0, () =>
    part(
      'halo',
      halo(
        svg`<rect x="-18.5" y="-30.5" width="37" height="61" rx="18.5" fill="none" stroke=${C.sun} stroke-width="5" opacity=${haloOpacity} />`,
      ),
    ),
  )

  let next: Art
  if (!focused) {
    next = nothing
  } else if (parts.phase === 'popped' || parts.phase === 'taken-pending') {
    next = [ring, part('empty-well', well(nx, ny, true), parts.day)]
  } else if (parts.phase === 'lifted') {
    next = [
      ring,
      part('empty-well', well(nx, ny, true), parts.day),
      part(
        'next-pill',
        at(nx, ny - 16, motion('bob', capsule(nextTop, pillBottom)), 18),
        parts.day,
      ),
    ]
  } else {
    next = [
      ring,
      well(nx, ny, false),
      part(
        'next-pill',
        at(
          nx,
          ny,
          parts.pulse
            ? motion('throb', capsule(nextTop, pillBottom))
            : capsule(nextTop, pillBottom),
        ),
        parts.day,
      ),
    ]
  }

  const withGlass = parts.phase === 'popped' || parts.phase === 'taken-pending'
  const ox = withGlass ? 86 : 100
  const oy = withGlass ? 90 : 100
  const packArt = at(
    ox,
    oy,
    at(-100, -100, [
      svg`<rect x="30" y="36" width="140" height="124" rx="16" fill=${pack} />`,
      svg`<path d="M30 92H170" stroke=${mix(C.metalDark, '#6d6b62', parts.fade)} stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round" />`,
      others,
      next,
      face(148, 124, parts.mood, mix(C.fly, '#4d4b45', parts.fade), 0.82),
      when(parts.neglect > 0, () => dust(parts.neglect)),
      when(focused && parts.phase === 'popped', () => check(nx, ny)),
    ]),
    parts.tilt,
    withGlass ? 0.84 : 1,
  )

  const extras: Art[] = []
  if (parts.phase === 'popped') {
    extras.push(
      glass(168, 146),
      sparkle(26, 30, 1.2, 1),
      sparkle(178, 34, 0.95, 2),
      sparkle(24, 130, 0.85, 3),
    )
  }
  if (parts.phase === 'taken-pending') {
    extras.push(glass(168, 146))
  }
  if (parts.neglect >= 2) extras.push(cobweb())
  if (parts.neglect >= 3) extras.push(spider())

  return frame('pills', scene, options, [shadow(100, 176, 72), packArt, extras])
}
