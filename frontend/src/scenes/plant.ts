import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  at,
  COLORS as C,
  drop,
  face,
  frame,
  mix,
  motion,
  part,
  reached,
  round,
  shadow,
  sparkle,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export interface PlantParts {
  droop: number
  wilt: number
  petals: number
  fallen: number
  wet: boolean
  drops: boolean
  can: boolean
  thirst: boolean
  mood: Mood
}

export const MAX_DROOP = 4

const WILT_AT = [0.1, 0.4, 0.75] as const

export function plantParts(scene: SceneView): PlantParts {
  const { state, fill, stink } = scene
  if (state === 'clean') {
    return {
      droop: 0,
      wilt: 0,
      petals: 8,
      fallen: 0,
      wet: true,
      drops: true,
      can: false,
      thirst: false,
      mood: 'happy',
    }
  }
  const wilt = reached(stink, WILT_AT)
  if (state === 'running' || state === 'waiting') {
    return {
      droop: Math.min(1, Math.floor(fill * (MAX_DROOP + 1))),
      wilt,
      petals: 8 - wilt * 2,
      fallen: wilt,
      wet: true,
      drops: false,
      can: state === 'running',
      thirst: false,
      mood: state === 'running' ? 'happy' : 'calm',
    }
  }
  const raw = Math.min(MAX_DROOP, Math.floor(fill * (MAX_DROOP + 1)))
  const droop = state === 'due' ? MAX_DROOP : raw
  let mood: Mood = state === 'resting' ? 'sleepy' : droop >= 2 ? 'worried' : 'calm'
  if (state === 'due') mood = 'pleading'
  if (wilt >= 2) mood = 'sick'
  return {
    droop,
    wilt,
    petals: 8 - wilt * 2,
    fallen: wilt,
    wet: false,
    drops: false,
    can: false,
    thirst: state === 'due',
    mood,
  }
}

const STEM = 78
const LEAF = 'M0 0C-14-7-15-27 0-40C15-27 14-7 0 0Z'
const BEND = [0.12, 0.65, 1.3, 1.95, 2.55] as const

interface Point {
  x: number
  y: number
  angle: number
}

function along(arc: number, share: number): Point {
  const s = STEM * share
  if (Math.abs(arc) < 0.001) return { x: 0, y: -s, angle: 0 }
  const k = arc / STEM
  return { x: (1 - Math.cos(k * s)) / k, y: -Math.sin(k * s) / k, angle: k * s }
}

function degrees(rad: number): number {
  return (rad * 180) / Math.PI
}

function stemPath(arc: number): string {
  const points = Array.from({ length: 9 }, (_, i) => along(arc, i / 8))
  return points.map((p, i) => `${i ? 'L' : 'M'}${round(p.x)} ${round(p.y)}`).join('')
}

function flowerHead(petals: number, color: string, centre: string): Art {
  const shapes = Array.from({ length: 8 }, (_, i) => i)
    .filter((i) => i < petals)
    .map(
      (i) =>
        svg`<ellipse cx="0" cy="-17" rx="8" ry="12" transform=${`rotate(${i * 45})`} fill=${color} data-part="petal" />`,
    )
  return [shapes, svg`<circle r="11" fill=${centre} />`]
}

function leafAt(
  p: Point,
  side: number,
  spread: number,
  color: string,
  vein: string,
  size: number,
): Art {
  return at(
    p.x,
    p.y,
    [
      svg`<path d=${LEAF} fill=${color} />`,
      svg`<path d="M0-4V-32" stroke=${vein} stroke-width="2.6" stroke-linecap="round" />`,
    ],
    degrees(p.angle) + side * spread,
    size,
  )
}

function can(): Art {
  return part('watering-can', [
    at(
      150,
      42,
      [
        svg`<rect x="-20" y="-14" width="46" height="34" rx="7" fill=${C.sky} />`,
        svg`<path d="M-20-2L-48-20" stroke=${C.sky} stroke-width="8" stroke-linecap="round" />`,
        svg`<rect x="-56" y="-30" width="9" height="20" rx="3" transform="rotate(-32 -52 -20)" fill=${C.skyDark} />`,
        svg`<path d="M26-6a14 14 0 0 1 0 22" fill="none" stroke=${C.skyDark} stroke-width="6" stroke-linecap="round" />`,
      ],
      -10,
    ),
    (
      [
        [92, 60, 1],
        [104, 74, 2],
        [84, 82, 3],
        [96, 96, 4],
      ] as const
    ).map(([x, y, d]) => at(x, y, motion('fall', drop(0, 0, C.water, 0.9), d))),
  ])
}

export function plant(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = plantParts(scene)
  const decay = parts.wilt / 3
  const arc = (BEND[parts.droop] ?? 0) + parts.wilt * 0.12
  const leaf = mix(C.leaf, '#9b7a3e', decay)
  const vein = mix(C.leafDark, '#7a5d2c', decay)
  const stem = mix(C.leafDark, '#7f6a35', decay)
  const petal = mix(C.pink, '#a98a6b', decay)
  const centre = mix(C.sun, '#8d6b37', decay)
  const spread = 52 + parts.droop * 14
  const tip = along(arc, 1)
  const sway = parts.droop === 0 && parts.wilt === 0 && !parts.can

  const crown: Art = [
    svg`<path d=${stemPath(arc)} fill="none" stroke=${stem} stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" />`,
    leafAt(along(arc, 0.26), -1, spread, leaf, vein, 1.05),
    leafAt(along(arc, 0.48), 1, spread, leaf, vein, 1),
    leafAt(along(arc, 0.7), -1, spread + 8, leaf, vein, 0.82),
    part(
      'flower',
      at(tip.x, tip.y, flowerHead(parts.petals, petal, centre), degrees(tip.angle), 0.98),
    ),
  ]

  const fallen = (
    [
      [46, 172, -30],
      [158, 176, 40],
      [62, 180, 70],
    ] as const
  )
    .slice(0, parts.fallen)
    .map(([x, y, r], i) =>
      part(
        'fallen-leaf',
        at(
          x,
          y,
          [svg`<path d=${LEAF} fill=${mix('#9b7a3e', '#6d4f28', parts.wilt / 3)} />`],
          r,
          0.5,
        ),
        i,
      ),
    )

  return frame('plant', scene, options, [
    shadow(100, 183, 52),
    fallen,
    at(100, 138, part('stem', sway ? motion('sway', crown) : crown)),
    svg`<path d="M62 134H138L130 176Q129 182 122 182H78Q71 182 70 176Z" fill=${C.terracotta} />`,
    svg`<rect x="55" y="122" width="90" height="19" rx="8" fill=${C.terracottaDark} />`,
    svg`<ellipse cx="100" cy="124" rx="38" ry="4.5" fill=${parts.wet ? C.soilWet : C.soil} data-part="soil" />`,
    when(!parts.wet && parts.wilt > 0, () =>
      part(
        'cracks',
        svg`<path d="M78 124l6 2 3-2M108 123l5 2 4-2" fill="none" stroke="#7a5a44" stroke-width="2" stroke-linecap="round" />`,
      ),
    ),
    face(100, 158, parts.mood, '#5b2612', 0.95),
    when(parts.thirst, () =>
      part('thirst', [
        svg`<circle cx="64" cy="82" r="4.5" fill=${C.cream} /><circle cx="54" cy="69" r="7.5" fill=${C.cream} />`,
        at(
          42,
          40,
          motion('pulse', [svg`<circle r="24" fill=${C.cream} />`, drop(0, 1, C.waterDark, 1.7)]),
        ),
      ]),
    ),
    when(parts.can, can),
    when(parts.drops, () =>
      part(
        'drops',
        (
          [
            [52, 34, 1],
            [148, 26, 2],
            [32, 80, 3],
            [170, 74, 4],
          ] as const
        ).map(([x, y, d]) => at(x, y, motion('fall', drop(0, 0, C.water, 1.05), d))),
      ),
    ),
    when(parts.drops, () => [
      sparkle(40, 112, 1, 2),
      sparkle(164, 118, 0.85, 3),
      sparkle(100, 16, 0.9, 1),
    ]),
  ])
}
