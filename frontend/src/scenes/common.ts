import { html, nothing, svg } from 'lit'
import type { SVGTemplateResult, TemplateResult } from 'lit'

import type { SceneName, SceneState, SceneView } from '../types.ts'

export interface SceneOptions {
  animations?: boolean
  day?: number
  label?: string
}

export type SceneRenderer = (scene: SceneView, options?: SceneOptions) => TemplateResult
export type Art = SVGTemplateResult | typeof nothing | Art[]
export type Mood = 'happy' | 'calm' | 'sleepy' | 'worried' | 'pleading' | 'sick'

export const INK = '#1b1f33'

export const COLORS = {
  coral: '#ff7a6b',
  coralDark: '#d9574b',
  sun: '#ffc857',
  sunDark: '#e0a233',
  mint: '#5fd6a8',
  mintDark: '#3bb286',
  sky: '#5ab4ff',
  skyDark: '#3a8fdb',
  lilac: '#b79bff',
  lilacDark: '#9176e0',
  pink: '#ff8fc7',
  pinkDark: '#de6aa4',
  cream: '#f6f1e4',
  creamDark: '#d9d2bf',
  metal: '#e8ecf5',
  metalMid: '#c5cde0',
  metalDark: '#8c96b3',
  glass: '#223258',
  water: '#6cc8f5',
  waterDark: '#3f9ad6',
  wicker: '#dd9f5f',
  wickerDark: '#b97a3f',
  wickerLight: '#f0bd82',
  terracotta: '#e0784f',
  terracottaDark: '#b95a38',
  soil: '#4a3429',
  soilWet: '#2f2019',
  leaf: '#5ccf7a',
  leafDark: '#3aa65b',
  stench: '#b4e65a',
  musty: '#8a9a5e',
  mustyDark: '#6f7f49',
  fly: '#2a2d3e',
  wing: '#dfe7f5',
  spark: '#fff3c4',
  check: '#4fd18b',
} as const

export const TILES: Record<SceneState, { wall: string; floor: string }> = {
  resting: { wall: '#262c49', floor: '#1d2239' },
  accumulating: { wall: '#2b2f55', floor: '#212542' },
  due: { wall: '#43305f', floor: '#33254a' },
  running: { wall: '#1f3f6b', floor: '#183154' },
  waiting: { wall: '#2c4358', floor: '#213443' },
  clean: { wall: '#17555c', floor: '#114247' },
}

export const SWAMP = { wall: '#3e4a2b', floor: '#2d3720' }

export function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
}

export function reached(value: number, thresholds: readonly number[]): number {
  return thresholds.filter((threshold) => value >= threshold).length
}

function channels(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function mix(from: string, to: string, amount: number): string {
  const t = clamp01(amount)
  const a = channels(from)
  const b = channels(to)
  const out = a.map((v, i) => Math.round(v + ((b[i] ?? v) - v) * t))
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function at(x: number, y: number, art: Art, rotate = 0, scale = 1): SVGTemplateResult {
  const r = rotate ? ` rotate(${round(rotate)})` : ''
  const s = scale === 1 ? '' : ` scale(${round(scale)})`
  return svg`<g transform="translate(${round(x)} ${round(y)})${r}${s}">${art}</g>`
}

export function motion(name: string, art: Art, delay = 0): SVGTemplateResult {
  const cls = delay ? `ht-a-${name} ht-d${delay}` : `ht-a-${name}`
  return svg`<g class=${cls}>${art}</g>`
}

export function part(name: string, art: Art, index?: number): SVGTemplateResult {
  return index === undefined
    ? svg`<g data-part=${name}>${art}</g>`
    : svg`<g data-part=${name} data-index=${index}>${art}</g>`
}

export function when(condition: boolean, art: () => Art): Art {
  return condition ? art() : nothing
}

export function tileFor(state: SceneState, stink: number): { wall: string; floor: string } {
  const base = TILES[state]
  const t = state === 'clean' ? 0 : clamp01(stink) * 0.85
  return { wall: mix(base.wall, SWAMP.wall, t), floor: mix(base.floor, SWAMP.floor, t) }
}

const CORNER_SHAPE = 1.6
const CORNER_STEPS = 12

function corner(cx: number, cy: number, r: number, start: number): string {
  const exponent = 2 / 2 ** CORNER_SHAPE
  const curve = (value: number) => Math.sign(value) * Math.abs(value) ** exponent
  return Array.from({ length: CORNER_STEPS + 1 }, (_, i) => {
    const angle = ((start + (i * 90) / CORNER_STEPS) * Math.PI) / 180
    return `L${round(cx + r * curve(Math.cos(angle)))} ${round(cy + r * curve(Math.sin(angle)))}`
  }).join('')
}

export function superellipsePath(x: number, y: number, w: number, h: number, r: number): string {
  const right = x + w - r
  const bottom = y + h - r
  const body = [
    corner(right, y + r, r, -90),
    corner(right, bottom, r, 0),
    corner(x + r, bottom, r, 90),
    corner(x + r, y + r, r, 180),
  ].join('')
  return `M${body.slice(1)}Z`
}

export const TILE = superellipsePath(0, 0, 200, 200, 28)
export const FLOOR = `M0 168H200V172${corner(172, 172, 28, 0)}${corner(28, 172, 28, 90)}Z`

export function frame(
  name: SceneName,
  scene: SceneView,
  options: SceneOptions | undefined,
  art: Art,
  floor = true,
): TemplateResult {
  const animated = options?.animations !== false
  const tile = tileFor(scene.state, scene.stink)
  const classes = `ht-scene ht-scene-${name}${animated ? ' ht-animated' : ''}`
  const label = options?.label ?? name
  return html`<svg
    class=${classes}
    viewBox="0 0 200 200"
    role="img"
    aria-label=${label}
    data-scene=${name}
    data-state=${scene.state}
  >
    ${svg`<path data-part="tile" d=${TILE} fill=${tile.wall} />`}
    ${
      floor
        ? svg`<circle cx="100" cy="98" r="86" fill="#fff" opacity=".05" /><path data-part="floor" d=${FLOOR} fill=${tile.floor} />`
        : nothing
    }
    ${art}
  </svg>`
}

export function shadow(x: number, y: number, rx: number, opacity = 0.28): SVGTemplateResult {
  return svg`<ellipse cx=${x} cy=${y} rx=${rx} ry="6" fill="#0c0f1e" opacity=${opacity} />`
}

export function face(x: number, y: number, mood: Mood, color: string, size = 1): SVGTemplateResult {
  const line = (d: string): SVGTemplateResult =>
    svg`<path d=${d} fill="none" stroke=${color} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`
  const dot = (cx: number, r = 3.2): SVGTemplateResult =>
    svg`<circle cx=${cx} cy="0" r=${r} fill=${color} />`
  const faces: Record<Mood, Art> = {
    happy: [line('M-15 1q4-6 8 0'), line('M7 1q4-6 8 0'), line('M-5 7q5 6 10 0')],
    calm: [dot(-11), dot(11), line('M-4 8q4 3 8 0')],
    sleepy: [line('M-15 0h8'), line('M7 0h8'), line('M-3 9h6')],
    worried: [
      dot(-11),
      dot(11),
      line('M-16-8l7-3'),
      line('M16-8l-7-3'),
      line('M-6 11q3-5 6-2t6-1'),
    ],
    pleading: [
      svg`<circle cx="-11" cy="0" r="5" fill=${color} /><circle cx="-9.4" cy="-1.8" r="1.7" fill="#fff" />`,
      svg`<circle cx="11" cy="0" r="5" fill=${color} /><circle cx="12.6" cy="-1.8" r="1.7" fill="#fff" />`,
      line('M-3 10q3-3 6 0'),
    ],
    sick: [line('M-15-4l7 7m0-7l-7 7'), line('M8-4l7 7m0-7l-7 7'), line('M-8 12q4-5 8-1t8-1')],
  }
  return part('face', at(x, y, faces[mood], 0, size))
}

export function sparkle(x: number, y: number, size: number, delay: number): SVGTemplateResult {
  const star = 'M0-10C1.2-3 3-1.2 10 0C3 1.2 1.2 3 0 10C-1.2 3-3 1.2-10 0C-3-1.2-1.2-3 0-10Z'
  return part(
    'sparkle',
    at(x, y, motion('twinkle', svg`<path d=${star} fill=${COLORS.spark} />`, delay), 0, size),
  )
}

const WAVY = 'M0 0c-9-7 9-13 0-20c-9-7 9-13 0-20'

export function stenchLines(points: ReadonlyArray<readonly [number, number]>, first = 0): Art {
  return points.map(([x, y], i) =>
    part(
      'stench',
      at(
        x,
        y,
        motion(
          'waft',
          svg`<path d=${WAVY} fill="none" stroke=${COLORS.stench} stroke-width="5.5" stroke-linecap="round" />`,
          i + first + 1,
        ),
      ),
      i + first,
    ),
  )
}

export function fly(x: number, y: number, index: number): SVGTemplateResult {
  const trail = svg`<path d="M-24 10q10 12 17-1" fill="none" stroke=${COLORS.wing} stroke-width="1.8" stroke-linecap="round" stroke-dasharray="1 5" opacity=".75" />`
  const body = svg`
    <ellipse cx="-3.5" cy="-7" rx="6" ry="3.4" transform="rotate(30 -3.5 -7)" fill=${COLORS.wing} />
    <ellipse cx="3.5" cy="-7" rx="6" ry="3.4" transform="rotate(-30 3.5 -7)" fill=${COLORS.wing} />
    <ellipse rx="5.2" ry="6.2" fill=${COLORS.fly} stroke=${COLORS.wing} stroke-width="1.4" />
  `
  return part('fly', at(x, y, motion('buzz', [trail, body], (index % 3) + 1)), index)
}

export function drop(x: number, y: number, color: string, size = 1): SVGTemplateResult {
  const path = 'M0-8C4-3 6 0 6 3a6 6 0 0 1-12 0C-6 0-4-3 0-8Z'
  return at(x, y, svg`<path d=${path} fill=${color} />`, 0, size)
}

export function blobPath(w: number, h: number): string {
  const p = (x: number, y: number): string => `${round(x * w)} ${round(y * h)}`
  return [
    `M${p(-1, 0.25)}`,
    `C${p(-1.05, -0.55)} ${p(-0.45, -1)} ${p(0.05, -0.92)}`,
    `C${p(0.75, -1)} ${p(1.08, -0.4)} ${p(1, 0.2)}`,
    `C${p(1, 0.8)} ${p(0.55, 0.96)} ${p(0, 0.92)}`,
    `C${p(-0.6, 1)} ${p(-1, 0.75)} ${p(-1, 0.25)}Z`,
  ].join('')
}

export function blob(
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  shade: string,
  rotate = 0,
): SVGTemplateResult {
  const fold = `M${round(-w * 0.45)} ${round(h * 0.05)}q${round(w * 0.35)} ${round(-h * 0.5)} ${round(w * 0.8)} ${round(h * 0.05)}`
  return at(
    x,
    y,
    svg`<path d=${blobPath(w, h)} fill=${color} /><path d=${fold} fill="none" stroke=${shade} stroke-width="3" stroke-linecap="round" />`,
    rotate,
  )
}

const SHIRT = 'M-11-24L-30-13L-24 2L-15-2V24H15V-2L24 2L30-13L11-24C8-18-8-18-11-24Z'

export function shirt(
  x: number,
  y: number,
  color: string,
  shade: string,
  rotate = 0,
  scale = 1,
): SVGTemplateResult {
  return at(
    x,
    y,
    svg`<path d=${SHIRT} fill=${color} stroke-linejoin="round" /><path d="M-15-2V8M15-2V8" stroke=${shade} stroke-width="2.6" stroke-linecap="round" /><path d="M-11-24C-8-18 8-18 11-24" fill="none" stroke=${shade} stroke-width="3" stroke-linecap="round" />`,
    rotate,
    scale,
  )
}

export function sock(
  x: number,
  y: number,
  color: string,
  stripe: string,
  rotate = 0,
  scale = 1,
): SVGTemplateResult {
  return at(
    x,
    y,
    svg`<path d="M-8-22H8V2L20 10C27 15 22 25 13 22L-4 15C-7 13-8 11-8 8Z" fill=${color} /><path d="M-8-15H8" stroke=${stripe} stroke-width="5" /><path d="M-8-22H8" stroke=${stripe} stroke-width="4" stroke-linecap="round" />`,
    rotate,
    scale,
  )
}
