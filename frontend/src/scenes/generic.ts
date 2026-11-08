import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  at,
  clamp01,
  COLORS as C,
  frame,
  mix,
  motion,
  part,
  round,
  sparkle,
  TILES,
  when,
} from './common.ts'
import type { Art, SceneOptions } from './common.ts'

export interface GenericParts {
  level: number
  tilt: number
  arc: number
  tint: number
  pulse: boolean
  check: boolean
  idle: boolean
}

export function genericParts(scene: SceneView): GenericParts {
  const { state, fill, progress, stink } = scene
  const working = state === 'running' || state === 'waiting'
  let level = clamp01(fill)
  if (state === 'clean' || state === 'due') level = 1
  if (working) level = Math.max(0.12, clamp01(progress))
  if (state === 'resting') level = Math.min(level, 0.12)
  return {
    level,
    tilt: state === 'clean' ? 0 : Math.round(clamp01(stink) * 14),
    arc: working ? clamp01(progress) : 0,
    tint: state === 'clean' ? 0 : clamp01(stink),
    pulse: state === 'due',
    check: state === 'clean',
    idle: state === 'resting',
  }
}

const R = 66
const FRONT_RAMP = [C.water, '#a2dca0', '#ffc65c', '#ff7a4f'] as const
const BACK_RAMP = [C.waterDark, '#6fb777', '#dd9a35', '#c9502f'] as const

function ramp(stops: readonly string[], t: number): string {
  const position = clamp01(t) * (stops.length - 1)
  const index = Math.min(stops.length - 2, Math.floor(position))
  return mix(stops[index] ?? C.water, stops[index + 1] ?? C.water, position - index)
}
const WAVE_LENGTH = 66

function wave(y: number, amplitude: number): string {
  let d = `M-66 ${y}`
  for (let x = -66; x < 266; x += WAVE_LENGTH) {
    d += `q${WAVE_LENGTH / 4} ${-amplitude} ${WAVE_LENGTH / 2} 0t${WAVE_LENGTH / 2} 0`
  }
  return `${d}V172H-66Z`
}

function boat(): Art {
  return [
    svg`<path d="M-1-30V-6H-19Z" fill=${C.cream} />`,
    svg`<path d="M3-23V-6H16Z" fill=${C.coral} />`,
    svg`<path d="M-27-3H27L19 13H-19Z" fill=${C.sun} />`,
    svg`<path d="M-27-3H27L24 3H-24Z" fill=${C.sunDark} />`,
  ]
}

export function generic(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = genericParts(scene)
  const front = ramp(FRONT_RAMP, parts.tint)
  const back = ramp(BACK_RAMP, parts.tint)
  const tile = TILES[scene.state].wall
  const shown = parts.check ? 0.84 : parts.level * 0.74
  const y = round(100 + R - shown * R * 2)
  const ring = mix(C.metalMid, '#ffd29a', parts.tint)
  const circumference = 2 * Math.PI * (R + 3)
  const hole = `M0 28A28 28 0 0 1 28 0H172A28 28 0 0 1 200 28V172A28 28 0 0 1 172 200H28A28 28 0 0 1 0 172ZM${100 - R} 100a${R} ${R} 0 1 0 ${R * 2} 0a${R} ${R} 0 1 0 ${-R * 2} 0Z`
  const inner = svg`<circle cx="100" cy="100" r=${R} fill="#0e1228" opacity=".55" /><g fill=${C.spark}><circle cx="70" cy="66" r="2.2" /><circle cx="128" cy="58" r="2.8" /><circle cx="146" cy="96" r="1.9" /><circle cx="58" cy="108" r="1.7" /></g>`
  const tide: Art = [
    motion('tide-back', svg`<path d=${wave(y - 7, 7)} fill=${back} />`),
    when(!parts.check, () =>
      part('boat', at(100, y - 8, motion('bob', at(0, 0, boat(), parts.tilt, 0.8)))),
    ),
    motion('tide', svg`<path d=${wave(y, 9)} fill=${front} />`),
  ]
  const ringArt: Art = [
    svg`<circle cx="100" cy="100" r=${R + 3} fill="none" stroke=${ring} stroke-width="10" />`,
    when(parts.arc > 0, () =>
      part(
        'arc',
        svg`<circle cx="100" cy="100" r=${R + 3} fill="none" stroke=${C.sun} stroke-width="10" stroke-linecap="round" stroke-dasharray=${`${round(circumference * parts.arc)} ${round(circumference)}`} transform="rotate(-90 100 100)" />`,
      ),
    ),
  ]
  return frame(
    'generic',
    { ...scene, stink: 0 },
    options,
    [
      inner,
      part('water', tide),
      svg`<path d=${hole} fill=${tile} fill-rule="evenodd" />`,
      part('ring', parts.pulse ? at(100, 100, motion('pulse', at(-100, -100, ringArt))) : ringArt),
      when(parts.check, () =>
        part('check', [
          svg`<path d="M72 102l20 21 38-44" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />`,
          sparkle(30, 34, 1.3, 1),
          sparkle(172, 42, 1, 2),
          sparkle(170, 166, 1.15, 3),
          sparkle(30, 162, 0.85, 4),
        ]),
      ),
      when(parts.idle, () =>
        part(
          'moon',
          at(100, 92, svg`<path d="M9-24A26 26 0 1 0 24 14 21 21 0 0 1 9-24Z" fill=${C.spark} />`),
        ),
      ),
    ],
    false,
  )
}
