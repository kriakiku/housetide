import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  blobPath,
  COLORS as C,
  clamp01,
  drop,
  face,
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

export type PoolView = 'float' | 'swim' | 'dry'
export type PoolTone = 'night' | 'stale' | 'fresh' | 'wet' | 'sparkle'
export type PoolArms = 'none' | 'plead' | 'cheer'

export interface PoolParts {
  view: PoolView
  tone: PoolTone
  step: number
  ripples: number
  towel: boolean
  goggles: boolean
  waving: boolean
  arms: PoolArms
  dust: number
  webs: number
  tally: number
  asleep: boolean
  party: boolean
  algae: number
  leaves: number
  mosquitoes: number
  sag: number
  frog: boolean
  stench: number
  murk: number
  mood: Mood
}

export const MAX_STEP = 4

const ALGAE_AT = [0.05, 0.3, 0.6] as const
const LEAF_AT = [0.2, 0.5] as const
const MOSQUITO_AT = [0.4, 0.75] as const
const SAG_AT = [0.55, 0.8] as const
const STENCH_AT = [0.7, 0.9] as const
const FROG_AT = 0.9
const SICK_AT = 0.55

const QUIET = {
  step: 0,
  ripples: 0,
  towel: false,
  goggles: false,
  waving: false,
  arms: 'none',
  dust: 0,
  webs: 0,
  tally: 0,
  asleep: false,
  party: false,
  algae: 0,
  leaves: 0,
  mosquitoes: 0,
  sag: 0,
  frog: false,
  stench: 0,
  murk: 0,
} as const

export function poolParts(scene: SceneView): PoolParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...QUIET,
      view: 'float',
      tone: 'sparkle',
      ripples: 4,
      towel: true,
      goggles: true,
      arms: 'cheer',
      party: true,
      mood: 'happy',
    }
  }
  const decay = {
    algae: reached(stink, ALGAE_AT),
    leaves: reached(stink, LEAF_AT),
    mosquitoes: reached(stink, MOSQUITO_AT),
    sag: reached(stink, SAG_AT),
    stench: reached(stink, STENCH_AT),
    frog: stink >= FROG_AT,
    murk: reached(stink, [...ALGAE_AT, ...STENCH_AT]) / 5,
  }
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return {
      ...QUIET,
      ...decay,
      view: 'swim',
      tone: 'fresh',
      sag: 0,
      frog: false,
      arms: 'cheer',
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return { ...QUIET, ...decay, view: 'dry', tone: 'wet', mood: sick ? 'sick' : 'calm' }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const step = due ? MAX_STEP : resting ? 0 : raw
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...decay,
    view: 'float',
    tone: resting ? 'night' : 'stale',
    step,
    ripples: resting ? 1 : Math.max(0, 3 - step),
    towel: !resting,
    goggles: !resting && !due && step >= 1,
    waving: due,
    arms: due && decay.sag < 2 ? 'plead' : 'none',
    dust: step >= 4 ? 2 : step >= 2 ? 1 : 0,
    webs: step >= 4 ? 2 : step >= 3 ? 1 : 0,
    tally: resting || due ? 0 : step,
    asleep: resting,
    mood,
  }
}

const BACK_Y = 103
const FRONT_Y = 164
const BACK_X = 40
const FRONT_X = 26

const RX = 52
const RY = 33
const HOLE_RX = 23
const HOLE_RY = 10
const HOLE_CY = -9
const DEPTH = 7
const RING_SCALE = 0.88
const STRIPES = [35, 145, 225, 315] as const

const SKIN = '#ffcfa8'
const SKIN_DARK = '#eaa981'
const SPRAY = '#e6f7ff'

function poolEdge(y: number): number {
  return BACK_X + ((y - BACK_Y) * (FRONT_X - BACK_X)) / (FRONT_Y - BACK_Y)
}

function waterTone(parts: PoolParts): string {
  const stale = mix(C.waterDark, C.metalDark, 0.5)
  const swamp = mix(C.musty, C.leafDark, 0.25)
  const tones: Record<PoolTone, string> = {
    night: mix(C.waterDark, C.glass, 0.55),
    stale: mix(C.water, stale, 0.25 + (parts.step / MAX_STEP) * 0.75),
    fresh: C.water,
    wet: mix(C.water, C.waterDark, 0.4),
    sparkle: mix(C.water, C.mint, 0.55),
  }
  return mix(tones[parts.tone], swamp, parts.murk * 0.9)
}

interface Loop {
  rx: number
  ry: number
  cy: number
}

const OUTER: Loop = { rx: RX, ry: RY, cy: 0 }
const HOLE: Loop = { rx: HOLE_RX, ry: HOLE_RY, cy: HOLE_CY }

function ringPoint(loop: Loop, degrees: number, sag: number): readonly [number, number] {
  const a = (degrees * Math.PI) / 180
  const lumps = 1 + sag * (0.09 * Math.sin(3 * a + 0.7) + 0.05 * Math.sin(5 * a))
  const shrink = loop === HOLE ? 1 - sag * 0.3 : 1 + sag * 0.05
  const x = Math.cos(a) * loop.rx * lumps * shrink
  const raw = Math.sin(a) * loop.ry * lumps * shrink + loop.cy
  const y = raw < 0 ? raw * (1 - sag * 0.5) : raw * (1 - sag * 0.08)
  return [round(x), round(y + sag * 5 * Math.cos(a))]
}

function arcPoints(loop: Loop, from: number, to: number, sag: number): string[] {
  const steps = Math.max(2, Math.ceil(Math.abs(to - from) / 6))
  return Array.from({ length: steps + 1 }, (_, i) => {
    const [x, y] = ringPoint(loop, from + ((to - from) * i) / steps, sag)
    return `${x} ${y}`
  })
}

function loopPath(loop: Loop, sag: number): string {
  return `M${arcPoints(loop, 0, 360, sag).join('L')}Z`
}

function wedgePath(centre: number, sag: number): string {
  const from = centre - 11
  const to = centre + 11
  return `M${[...arcPoints(OUTER, from, to, sag), ...arcPoints(HOLE, to, from, sag)].join('L')}Z`
}

function innerWater(sag: number): string {
  const inset: Loop = { rx: HOLE_RX * 0.86, ry: HOLE_RY * 0.78, cy: HOLE_CY + 2 }
  return loopPath(inset, sag * 0.9)
}

function arm(
  x: number,
  d: string,
  tip: readonly [number, number],
  tones: readonly [string, string],
  delay: number,
): Art {
  return at(
    x,
    4,
    motion(
      'wobble',
      [
        svg`<path d=${d} fill="none" stroke=${tones[0]} stroke-width="9" stroke-linecap="round" />`,
        svg`<circle cx=${tip[0]} cy=${tip[1]} r="7.5" fill=${tones[1]} />`,
      ],
      delay,
    ),
  )
}

function wavingArm(accent: string, hand: string): Art {
  return part(
    'waving-goggles',
    at(
      -46,
      6,
      motion('wobble', [
        svg`<path d="M0 0C-9-10-9-32 3-50" fill="none" stroke=${accent} stroke-width="9" stroke-linecap="round" />`,
        at(5, -68, goggles(), -8, 1.05),
        svg`<circle cx="3" cy="-51" r="7.5" fill=${hand} />`,
      ]),
    ),
  )
}

function plaster(): Art {
  return part(
    'plaster',
    at(
      -30,
      8,
      [
        svg`<rect x="-11" y="-4.5" width="22" height="9" rx="4" fill=${C.cream} />`,
        svg`<rect x="-4" y="-4.5" width="8" height="9" fill=${C.creamDark} />`,
      ],
      -32,
    ),
  )
}

function hiss(): Art {
  return part('hiss', [
    at(
      50,
      -14,
      motion(
        'drift',
        svg`<path d="M5-3q5-2 9 0M6 4q6 0 11 3M2-10q3-4 8-5" fill="none" stroke=${C.metal} stroke-width="3" stroke-linecap="round" />`,
      ),
    ),
  ])
}

function ring(parts: PoolParts, accent: string): Art {
  const { sag: level, arms, waving } = parts
  const sag = level / 2
  const shade = shadeOf(accent)
  const tint = tintOf(accent, 0.45)
  const hand = tintOf(accent, 0.2)
  const body = loopPath(OUTER, sag)
  const bottom = ringPoint(OUTER, 90, sag)[1]
  const holeBottom = ringPoint(HOLE, 90, sag)[1]
  const inner = mix(waterTone(parts), C.glass, 0.25)
  const a = arcPoints({ rx: (RX + HOLE_RX) / 2 + 2, ry: RY * 0.68, cy: -3 }, 196, 246, sag)
  return part('ring', [
    when(waving, () => wavingArm(shade, hand)),
    when(arms === 'plead', () => arm(47, 'M0 0C9-6 11-18 3-30', [3, -30], [shade, hand], 2)),
    when(arms === 'cheer', () => [
      arm(-46, 'M0 0C-10-8-16-20-11-34', [-11, -35], [shade, hand], 1),
      arm(46, 'M0 0C10-8 16-20 11-34', [11, -35], [shade, hand], 2),
    ]),
    at(0, DEPTH, [
      svg`<path d=${body} fill=${shade} />`,
      STRIPES.filter((s) => s < 180).map(
        (s) => svg`<path d=${wedgePath(s, sag)} fill=${C.creamDark} />`,
      ),
    ]),
    svg`<path d=${body} fill=${accent} />`,
    STRIPES.map((s) => svg`<path d=${wedgePath(s, sag)} fill=${C.cream} />`),
    svg`<path d=${loopPath(HOLE, sag)} fill=${shade} />`,
    svg`<path d=${innerWater(sag)} fill=${inner} />`,
    svg`<path d=${`M${a.join('L')}`} fill="none" stroke=${tint} stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" opacity=".85" />`,
    svg`<rect x="35" y=${round(-27 + sag * 16)} width="9" height="9" rx="3" transform="rotate(32 40 -22)" fill=${shade} />`,
    when(level >= 1, () =>
      part(
        'wrinkles',
        svg`<path d="M-40 2q6 4 11 0M26 16q6 3 11-2M-14-2q5 3 9 1" fill="none" stroke=${shade} stroke-width="2.6" stroke-linecap="round" />`,
      ),
    ),
    when(level >= 2, plaster),
    when(level >= 1, hiss),
    face(0, round((bottom + holeBottom) / 2 + 1), parts.mood, shadeOf(accent, 0.82), 1 - sag * 0.1),
  ])
}

function scallops(start: number, end: number): string {
  const width = round((end - start) / 8)
  return `q${round(width / 2)}-5 ${width} 0`.repeat(8)
}

function lap(y: number, color: string, crest: string): Art {
  const left = poolEdge(y)
  const right = 200 - left
  const low = poolEdge(FRONT_Y)
  return [
    svg`<path d=${`M${round(left)} ${y}${scallops(left, right)}L${200 - low} ${FRONT_Y}H${low}Z`} fill=${color} />`,
    svg`<path d=${`M${round(left + 3)} ${y}${scallops(left + 3, right - 3)}`} fill="none" stroke=${crest} stroke-width="2.6" stroke-linecap="round" opacity=".55" />`,
  ]
}

function basin(parts: PoolParts): Art {
  const water = waterTone(parts)
  const edge = mix(water, C.glass, 0.34)
  const joints = Array.from({ length: 9 }, (_, i) => 20 + i * 20)
  return part('pool', [
    shadow(100, 184, 92, 0.3),
    svg`<path d="M10 168H190V177Q190 186 181 186H19Q10 186 10 177Z" fill=${C.creamDark} />`,
    joints.map(
      (x) =>
        svg`<path d=${`M${x} 178V186`} stroke=${C.metalDark} stroke-width="1.8" opacity=".55" />`,
    ),
    svg`<path d="M38 94H162Q170 94 172 102L189 168Q191 178 181 178H19Q9 178 11 168L28 102Q30 94 38 94Z" fill=${C.cream} />`,
    part('water', [
      svg`<path d=${`M${BACK_X} ${BACK_Y}H${200 - BACK_X}L${200 - FRONT_X} ${FRONT_Y}H${FRONT_X}Z`} fill=${water} />`,
      svg`<path d=${`M${BACK_X} ${BACK_Y}H${200 - BACK_X}L${200 - poolEdge(109)} 109H${poolEdge(109)}Z`} fill=${edge} />`,
    ]),
  ])
}

function rope(y: number, r: number): Art {
  const left = poolEdge(y) + 3
  const right = 200 - left
  const count = Math.round((right - left) / (r * 2.25))
  const gap = (right - left) / count
  return part('lane-rope', [
    svg`<path d=${`M${round(left)} ${y}H${round(right)}`} stroke=${C.fly} stroke-width="2" />`,
    Array.from({ length: count + 1 }, (_, i) => {
      const color = Math.floor(i / 2) % 2 === 0 ? C.sun : C.cream
      return svg`<ellipse cx=${round(left + i * gap)} cy=${y} rx=${round(r * 0.92)} ry=${r} fill=${color} />`
    }),
  ])
}

function ladder(): Art {
  const rails = ['M140 150V68a10 10 0 0 0-20 0V96', 'M166 150V68a10 10 0 0 0-20 0V96'] as const
  return part('ladder', [
    rails.map(
      (d) =>
        svg`<path d=${d} fill="none" stroke=${C.metalDark} stroke-width="8" stroke-linecap="round" />`,
    ),
    rails.map(
      (d) =>
        svg`<path d=${d} fill="none" stroke=${C.metal} stroke-width="5" stroke-linecap="round" />`,
    ),
    [106, 122, 138].map(
      (y) => svg`<rect x="138" y=${y} width="30" height="6" rx="3" fill=${C.metalMid} />`,
    ),
    svg`<rect x="113" y="93" width="14" height="5" rx="2.5" fill=${C.metalDark} /><rect x="139" y="93" width="14" height="5" rx="2.5" fill=${C.metalDark} />`,
    svg`<ellipse cx="140" cy="151" rx="9" ry="2.6" fill="#fff" opacity=".45" /><ellipse cx="166" cy="151" rx="9" ry="2.6" fill="#fff" opacity=".45" />`,
  ])
}

function clock(spinning: boolean, step: number): Art {
  const ticks = Array.from({ length: 12 }, (_, i) => i * 30)
  const hand = svg`<path d="M0 3V-15" stroke=${C.coralDark} stroke-width="3.6" stroke-linecap="round" />`
  return part(
    'pace-clock',
    at(100, 40, [
      svg`<circle r="24" fill=${C.metalDark} />`,
      svg`<circle r="20" fill=${C.cream} />`,
      ticks.map(
        (a) =>
          svg`<rect x="-1.2" y="-18" width="2.4" height=${a % 90 === 0 ? 6 : 3.6} rx="1" fill=${C.metalDark} transform=${`rotate(${a})`} />`,
      ),
      spinning ? motion('spin', hand) : at(0, 0, hand, 72 * step),
      svg`<circle r="3.4" fill=${C.fly} />`,
    ]),
  )
}

function tally(count: number): Art {
  return part(
    'tally',
    Array.from({ length: count }, (_, i) => i).map(
      (i) => svg`<rect x=${22 + i * 11} y="44" width="6.5" height="26" rx="3.2" fill=${C.cream} />`,
    ),
  )
}

function moon(): Art {
  return part('moon', [
    at(
      52,
      46,
      [
        svg`<path d="M7-23A24 24 0 1 0 23 14A19 19 0 0 1 7-23Z" fill=${C.spark} />`,
        svg`<circle cx="32" cy="-16" r="2.4" fill=${C.spark} /><circle cx="-30" cy="-20" r="2" fill=${C.spark} /><circle cx="42" cy="14" r="1.8" fill=${C.spark} />`,
      ],
      -8,
    ),
  ])
}

function sun(): Art {
  const rays = Array.from({ length: 10 }, (_, i) => i * 36)
  return part(
    'sun',
    at(100, 42, [
      motion(
        'throb',
        rays.map(
          (a) =>
            svg`<rect x="-3" y="-34" width="6" height="11" rx="3" fill=${C.sun} transform=${`rotate(${a})`} />`,
        ),
      ),
      svg`<circle r="19" fill=${C.sun} />`,
    ]),
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
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function lens(x: number): Art {
  return [
    svg`<rect x=${x - 13} y="-10" width="26" height="20" rx="9.5" fill=${C.sky} />`,
    svg`<rect x=${x - 9} y="-6.5" width="18" height="13" rx="6" fill=${C.glass} />`,
    svg`<path d=${`M${x - 5} -2q2-3 5-3`} fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" />`,
  ]
}

function goggles(): Art {
  return part('goggles', [
    svg`<path d="M-27 0C-34 22 34 22 27 0" fill="none" stroke=${C.skyDark} stroke-width="3.6" stroke-linecap="round" />`,
    svg`<rect x="-5" y="-3.5" width="10" height="7" rx="2" fill=${C.skyDark} />`,
    lens(-15),
    lens(15),
  ])
}

function towelStack(parts: PoolParts): Art {
  const body = C.lilac
  const fold = C.lilacDark
  const dusty = parts.dust > 0 ? mix(body, C.creamDark, 0.3 * parts.dust) : body
  return part('towel', [
    shadow(44, 185, 34, 0.26),
    svg`<rect x="12" y="168" width="64" height="16" rx="7" fill=${dusty} />`,
    svg`<rect x="16" y="154" width="56" height="16" rx="7" fill=${mix(dusty, '#ffffff', 0.14)} />`,
    svg`<rect x="58" y="154" width="7" height="30" fill=${C.sun} opacity=".92" /><rect x="24" y="154" width="4" height="30" fill=${C.sun} opacity=".92" />`,
    svg`<path d="M20 176h52M24 162h44" stroke=${fold} stroke-width="2.6" stroke-linecap="round" opacity=".7" />`,
    when(parts.goggles, () => at(44, 143, goggles(), -5, 0.82)),
    when(parts.dust >= 1, () =>
      part(
        'dust',
        svg`<g fill=${C.creamDark}><circle cx="24" cy="152" r="2" /><circle cx="68" cy="152" r="2.4" /><circle cx="62" cy="166" r="1.8" /><circle cx="20" cy="166" r="1.8" /></g>`,
      ),
    ),
    when(parts.dust >= 2, () =>
      part(
        'dust-cap',
        svg`<path d="M16 155Q16 149 26 150Q36 146 46 150Q58 146 66 150Q74 149 72 155Q60 152 50 154Q36 151 16 155Z" fill=${C.creamDark} />`,
      ),
    ),
  ])
}

function towel(parts: PoolParts): Art {
  return at(110, 0, towelStack(parts))
}

function polar(a: number, r: number): readonly [number, number] {
  return [round(Math.cos(a) * r), round(Math.sin(a) * r)]
}

function web(x: number, y: number, flip: number): Art {
  const angles = [6, 34, 62, 88].map((d) => (d * Math.PI) / 180)
  const arc = (r: number): string => `M${angles.map((a) => polar(a, r).join(' ')).join('L')}`
  return part(
    'cobweb',
    at(
      x,
      y,
      svg`<g transform=${`scale(${flip} 1)`} fill="none" stroke=${C.wing} stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".9">
        ${angles.map((a) => svg`<path d=${`M0 0L${polar(a, 26).join(' ')}`} />`)}
        ${[11, 19, 26].map((r) => svg`<path d=${arc(r)} />`)}
      </g>`,
    ),
  )
}

function ripple(x: number, y: number, w: number, delay: number, color: string): Art {
  return part(
    'ripple',
    at(
      x,
      y,
      motion(
        'drift',
        svg`<path d=${`M${-w} 0q${round(w / 2)}-5 ${w} 0t${w} 0`} fill="none" stroke=${color} stroke-width="3" stroke-linecap="round" />`,
        delay,
      ),
    ),
  )
}

const RIPPLES = [
  [152, 112, 11],
  [44, 134, 9],
  [150, 156, 12],
  [76, 158, 9],
] as const

function ripples(count: number, color: string): Art {
  return RIPPLES.slice(0, count).map(([x, y, w], i) => ripple(x, y, w, i + 1, color))
}

function patch(x: number, y: number, w: number, h: number, fill: string): Art {
  return at(x, y, svg`<path d=${blobPath(w, h)} fill=${fill} />`)
}

function algae(level: number): Art {
  if (level === 0) return []
  const green = mix(C.leaf, C.musty, 0.35)
  const dark = mix(C.leafDark, C.musty, 0.45)
  return part('algae', [
    patch(52, 122, 12, 6, green),
    patch(158, 152, 15, 7, green),
    when(level >= 2, () => [
      patch(40, 150, 13, 7, dark),
      patch(150, 118, 11, 5, dark),
      svg`<path d="M40 104H160L162 111Q154 115 146 110Q134 116 120 110Q100 116 84 110Q66 116 54 110Q46 114 38 110Z" fill=${green} />`,
    ]),
    when(
      level >= 3,
      () =>
        svg`<path d="M40 164H150V170Q150 176 146 176Q142 176 142 171Q140 166 136 170V179Q136 184 131 184Q126 184 126 179V171Q122 166 118 171V174Q118 178 114 178Q110 178 110 174Q106 167 96 171V177Q96 182 91 182Q86 182 86 177V171Q80 166 72 171Q70 176 66 176Q62 176 61 171Q50 167 40 172Z" fill=${dark} data-part="slime" />`,
    ),
  ])
}

const LEAF = 'M0 0C-11-6-12-22 0-33C12-22 11-6 0 0Z'

function leaf(x: number, y: number, rotate: number, delay: number): Art {
  return part(
    'leaf',
    at(
      x,
      y,
      motion(
        'bob',
        at(
          0,
          0,
          [
            svg`<path d=${LEAF} fill=${C.wicker} />`,
            svg`<path d="M0 4V-26" stroke=${C.wickerDark} stroke-width="2.4" stroke-linecap="round" />`,
          ],
          rotate,
          0.82,
        ),
        delay,
      ),
    ),
  )
}

type LeafSpot = readonly [number, number, number, number]

const LEAVES: readonly LeafSpot[] = [
  [154, 136, 66, 1],
  [40, 124, -52, 2],
]

const DRY_LEAVES: readonly LeafSpot[] = [
  [118, 146, 66, 1],
  [36, 122, -52, 2],
]

function leaves(count: number, spots: readonly LeafSpot[]): Art {
  return spots.slice(0, count).map(([x, y, r, d]) => leaf(x, y, r, d))
}

function mosquito(x: number, y: number, index: number): Art {
  const body = [
    svg`<path d="M-26 12q10 12 18 0" fill="none" stroke=${C.wing} stroke-width="1.8" stroke-linecap="round" stroke-dasharray="1 5" opacity=".75" />`,
    svg`<path d="M-4 2L-12 13M0 3L-3 15M4 2L8 14" fill="none" stroke=${C.wing} stroke-width="1.5" stroke-linecap="round" />`,
    svg`<ellipse cx="-6" cy="-8" rx="9" ry="3.6" transform="rotate(35 -6 -8)" fill=${C.wing} opacity=".95" />`,
    svg`<ellipse cx="4" cy="-9" rx="9" ry="3.6" transform="rotate(-50 4 -9)" fill=${C.wing} opacity=".95" />`,
    svg`<path d="M10 0L24 7" stroke=${C.wing} stroke-width="1.8" stroke-linecap="round" />`,
    svg`<ellipse cx="-5" rx="11" ry="4.6" fill=${C.fly} stroke=${C.wing} stroke-width="1.4" />`,
    svg`<path d="M-9-3.5V3.5M-4-4.2V4.2" stroke=${C.wing} stroke-width="1.6" />`,
    svg`<circle cx="8" cy="0" r="4.6" fill=${C.fly} stroke=${C.wing} stroke-width="1.4" />`,
    svg`<circle cx="9.5" cy="-1" r="1.5" fill=${C.coral} />`,
  ]
  return part('mosquito', at(x, y, motion('buzz', body, index + 1), 0, 1.1), index)
}

const MOSQUITOES: ReadonlyArray<readonly [number, number]> = [
  [156, 30],
  [46, 20],
]

const SLEEP_MOSQUITOES: ReadonlyArray<readonly [number, number]> = [
  [34, 88],
  [150, 78],
]

const DRY_MOSQUITOES: ReadonlyArray<readonly [number, number]> = [
  [46, 72],
  [48, 26],
]

function frog(water: string): Art {
  return part('frog', [
    svg`<ellipse cx="40" cy="147" rx="21" ry="7.5" fill=${C.leafDark} />`,
    svg`<path d="M40 147L20 143L24 151Z" fill=${water} />`,
    at(
      40,
      141,
      motion('bob', [
        svg`<ellipse rx="14" ry="10" fill=${C.leaf} />`,
        svg`<circle cx="-7" cy="-9" r="5.5" fill=${C.leaf} /><circle cx="7" cy="-9" r="5.5" fill=${C.leaf} />`,
        svg`<circle cx="-7" cy="-9.5" r="2.6" fill=${C.fly} /><circle cx="7" cy="-9.5" r="2.6" fill=${C.fly} />`,
        svg`<path d="M-8 2q8 6 16 0" fill="none" stroke=${C.leafDark} stroke-width="2.4" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

function duck(): Art {
  return part(
    'duck',
    at(
      38,
      168,
      motion(
        'bob',
        [
          svg`<path d="M-15 0C-20-6-17-9-13-7C-8-3 4-3 8-5C14-5 15 8 3 11H-8C-13 10-14 5-15 0Z" fill=${C.sun} />`,
          svg`<circle cx="7" cy="-11" r="9" fill=${C.sun} />`,
          svg`<path d="M15-13L24-10L15-7Z" fill=${C.coral} />`,
          svg`<circle cx="10" cy="-13" r="1.8" fill=${C.fly} />`,
          svg`<path d="M-8 2q6 5 11-1" fill="none" stroke=${C.sunDark} stroke-width="2.6" stroke-linecap="round" />`,
        ],
        2,
      ),
    ),
  )
}

function glints(): Art {
  const spots = [
    [46, 130, 0.7, 2],
    [146, 118, 0.6, 4],
    [108, 156, 0.75, 3],
  ] as const
  return spots.map(([x, y, s, d]) => sparkle(x, y, s, d))
}

function neglect(parts: PoolParts, spots: ReadonlyArray<readonly [number, number]>): Art {
  return [
    spots.slice(0, parts.mosquitoes).map(([x, y], i) => mosquito(x, y, i)),
    stenchLines(
      (
        [
          [186, 96],
          [14, 132],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

function floatView(parts: PoolParts, accent: string): Art {
  const water = waterTone(parts)
  const deep = mix(water, C.glass, 0.16)
  const crest = mix(water, '#ffffff', 0.6)
  const ringY = 111 + parts.step + parts.sag * 4
  const body = at(82, ringY, ring(parts, accent), 0, RING_SCALE)
  return [
    parts.asleep ? moon() : parts.party ? sun() : clock(false, parts.step),
    tally(parts.tally),
    basin(parts),
    algae(parts.algae),
    rope(112, 4.2),
    ladder(),
    when(parts.webs >= 1, () => web(140, 76, 1)),
    ripples(parts.ripples, crest),
    parts.party || parts.asleep ? motion('bob', body) : body,
    lap(150, deep, crest),
    leaves(parts.leaves, LEAVES),
    when(parts.frog, () => frog(water)),
    when(parts.party, duck),
    when(parts.party, glints),
    rope(160, 5.4),
    when(parts.towel, () => towel(parts)),
    when(parts.webs >= 2, () => web(186, 150, -1)),
    when(parts.asleep, () => [zed(110, 56, 0.66, 1), zed(128, 38, 1, 2), zed(154, 22, 0.62, 3)]),
    when(parts.party, () => [
      sparkle(30, 58, 1.25, 1),
      sparkle(182, 74, 1.05, 2),
      sparkle(160, 22, 0.8, 3),
      sparkle(40, 24, 0.75, 4),
    ]),
    neglect(parts, parts.asleep ? SLEEP_MOSQUITOES : MOSQUITOES),
  ]
}

function swimmer(): Art {
  return part('swimmer', [
    svg`<path d="M-58 6C-36-6 8-10 34-2C26 14-20 16-58 14Z" fill=${SKIN} />`,
    svg`<path d="M-26-2C-16-5-6-6 2-6L6 12C-4 13-16 14-26 14Z" fill=${C.lilac} />`,
    at(
      16,
      -2,
      motion('wobble', [
        svg`<path d="M0 0L-9-33L20-45" fill="none" stroke=${SKIN_DARK} stroke-width="10.5" stroke-linecap="round" stroke-linejoin="round" />`,
        svg`<path d="M0 0L-9-33L20-45" fill="none" stroke=${SKIN} stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />`,
        svg`<ellipse cx="25" cy="-47" rx="8" ry="6" fill=${SKIN} transform="rotate(-20 25 -47)" />`,
      ]),
    ),
    at(42, -12, [
      svg`<circle r="17" fill=${SKIN} />`,
      svg`<path d="M-17 1A17 17 0 0 1 15-8Q4-9-3-4Q-8 0-17 1Z" fill=${C.sun} />`,
      svg`<path d="M-17 1L8-3" stroke=${C.skyDark} stroke-width="3.6" stroke-linecap="round" />`,
      svg`<rect x="4" y="-9" width="13" height="11" rx="5" fill=${C.sky} />`,
      svg`<rect x="6.5" y="-6.5" width="8.5" height="6.5" rx="3" fill=${C.glass} />`,
      svg`<path d="M6 7q5 5 10 1" fill=${C.coralDark} stroke=${C.coralDark} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`,
    ]),
  ])
}

function foam(): Art {
  const puffs = [
    [-60, 1, 9, 1],
    [-72, 6, 7, 2],
    [-48, -5, 6, 3],
    [62, 0, 8, 1],
    [72, 5, 5.5, 2],
  ] as const
  const spray = [
    [-40, -26, 0.7, 1],
    [-26, -18, 0.55, 3],
    [-52, -14, 0.5, 2],
    [72, -12, 0.7, 2],
    [62, -18, 0.55, 4],
    [78, -2, 0.6, 1],
  ] as const
  return part('splash', [
    motion(
      'throb',
      puffs.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${SPRAY} />`),
    ),
    spray.map(([x, y, s, d]) => at(x, y, motion('drip', drop(0, 0, SPRAY, s), d))),
  ])
}

function swimView(parts: PoolParts, accent: string): Art {
  const water = waterTone(parts)
  const deep = mix(water, C.glass, 0.14)
  const crest = mix(water, '#ffffff', 0.7)
  return [
    clock(true, 0),
    basin(parts),
    algae(Math.min(parts.algae, 2)),
    rope(112, 4.2),
    ladder(),
    at(48, 98, motion('bob', at(0, 0, ring(parts, accent), 0, 0.64))),
    motion('bob', lap(126, mix(water, '#ffffff', 0.14), crest), 2),
    at(106, 136, [foam(), motion('rumble', swimmer())]),
    motion('bob', lap(145, deep, crest)),
    ripple(62, 155, 13, 2, crest),
    ripple(134, 154, 15, 3, crest),
    leaves(parts.leaves, LEAVES),
    bubble(44, 148, 6, 1),
    bubble(96, 154, 4.5, 2),
    bubble(158, 148, 7, 3),
    rope(160, 5.4),
    neglect(parts, MOSQUITOES),
  ]
}

function wetTowel(parts: PoolParts): Art {
  const base = mix(C.lilac, C.skyDark, 0.28)
  const color = mix(base, C.musty, parts.murk * 0.35)
  const fold = shadeOf(color, 0.2)
  const hem =
    'M139 72C139 54 173 54 173 72L177 128Q172 135 167 130Q161 136 155 130Q149 136 143 130Q138 134 135 128Z'
  return part('wet-towel', [
    svg`<path d=${hem} fill=${color} />`,
    svg`<path d="M137.2 104H174.8L175.2 110H136.8ZM136.4 115H175.6L175.8 118H136.2Z" fill=${C.sun} opacity=".85" />`,
    svg`<path d="M148 72V94M164 70V90" stroke=${fold} stroke-width="3" stroke-linecap="round" />`,
    (
      [
        [142, 142, 1],
        [156, 144, 2],
        [170, 141, 3],
      ] as const
    ).map(([x, y, d]) => at(x, y, motion('drip', drop(0, 0, C.water, 0.95), d))),
  ])
}

function flipFlop(x: number, y: number, rotate: number): Art {
  const sole =
    'M0-22C10-22 12-13 10-5C8 3 10 12 7 18C4 23-4 23-7 18C-10 12-8 3-10-5C-12-13-10-22 0-22Z'
  return at(
    x,
    y,
    [
      at(0, 2.5, svg`<path d=${sole} fill=${C.sunDark} />`),
      svg`<path d=${sole} fill=${C.sun} />`,
      svg`<path d="M0-13L-9 3M0-13L9 3" fill="none" stroke=${C.coral} stroke-width="4" stroke-linecap="round" />`,
    ],
    rotate,
    0.74,
  )
}

function flipFlops(): Art {
  return part('flip-flops', [
    shadow(106, 185, 30, 0.22),
    flipFlop(92, 168, -14),
    flipFlop(120, 168, 12),
  ])
}

function chevron(): Art {
  return part(
    'hang-me',
    at(
      158,
      28,
      motion(
        'bob',
        svg`<path d="M0-13V5M-11-5L0 7L11-5" fill="none" stroke=${C.sun} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
  )
}

function dryView(parts: PoolParts, accent: string): Art {
  const water = waterTone(parts)
  const deep = mix(water, C.glass, 0.16)
  const crest = mix(water, '#ffffff', 0.6)
  return [
    clock(false, 1),
    basin(parts),
    algae(parts.algae),
    rope(112, 4.2),
    ladder(),
    wetTowel(parts),
    at(70, 113, ring(parts, accent), 0, 0.8),
    lap(150, deep, crest),
    leaves(parts.leaves, DRY_LEAVES),
    when(parts.frog, () => frog(water)),
    rope(160, 5.4),
    svg`<ellipse cx="150" cy="175" rx="30" ry="5" fill=${C.water} opacity=".65" data-part="puddle" />`,
    flipFlops(),
    chevron(),
    neglect(parts, DRY_MOSQUITOES),
  ]
}

export function pool(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = poolParts(scene)
  const accent = accentOf(scene, C.coral)
  const views: Record<PoolView, () => Art> = {
    float: () => floatView(parts, accent),
    swim: () => swimView(parts, accent),
    dry: () => dryView(parts, accent),
  }
  return frame('pool', scene, options, views[parts.view]())
}
