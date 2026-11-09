import { svg } from 'lit'
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
  INK,
  mix,
  motion,
  part,
  reached,
  round,
  shadeOf,
  shadow,
  sparkle,
  stenchLines,
  superellipsePath,
  tintOf,
  when,
  bubble,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type WindowSky = 'night' | 'day' | 'bright'
export type WindowDrape = 'half' | 'tied' | 'open'

export interface WindowParts {
  sky: WindowSky
  drape: WindowDrape
  smudges: number
  haze: number
  web: boolean
  runs: number
  deadFlies: number
  flies: number
  stench: number
  droop: number
  bucket: boolean
  scrubbing: boolean
  droplets: boolean
  cloth: boolean
  dazzle: boolean
  mood: Mood
}

export const MAX_SMUDGES = 6

const WEB_AT = [0.1] as const
const RUNS_AT = [0.25, 0.5, 0.75] as const
const DEAD_AT = [0.3, 0.55, 0.8] as const
const DROOP_AT = [0.4, 0.7] as const
const FLIES_AT = [0.65, 0.9] as const
const STENCH_AT = [0.8, 0.92] as const
const HAZE = [0, 0.08, 0.14, 0.2, 0.27, 0.34, 0.44] as const

export function windowParts(scene: SceneView): WindowParts {
  const { state, fill, stink } = scene
  const quiet = {
    web: false,
    runs: 0,
    deadFlies: 0,
    flies: 0,
    stench: 0,
    droop: 0,
    bucket: false,
    scrubbing: false,
    droplets: false,
    cloth: false,
    dazzle: false,
  }
  if (state === 'clean') {
    return {
      ...quiet,
      sky: 'bright',
      drape: 'open',
      smudges: 0,
      haze: 0,
      dazzle: true,
      mood: 'happy',
    }
  }
  const neglect = {
    web: reached(stink, WEB_AT) > 0,
    deadFlies: reached(stink, DEAD_AT),
    droop: reached(stink, DROOP_AT),
  }
  if (state === 'running') {
    return {
      ...quiet,
      ...neglect,
      sky: 'day',
      drape: 'open',
      smudges: 0,
      haze: 0,
      scrubbing: true,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...quiet,
      ...neglect,
      flies: reached(stink, FLIES_AT),
      sky: 'day',
      drape: 'open',
      smudges: 0,
      haze: 0,
      droplets: true,
      cloth: true,
      mood: stink >= 0.55 ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const raw = Math.min(MAX_SMUDGES - 1, Math.floor(clamp01(fill) * MAX_SMUDGES))
  const smudges = state === 'resting' ? 0 : due ? MAX_SMUDGES : raw
  const runs = reached(stink, RUNS_AT)
  let mood: Mood = state === 'resting' ? 'sleepy' : smudges >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (stink >= 0.55) mood = 'sick'
  return {
    ...quiet,
    ...neglect,
    sky: state === 'resting' ? 'night' : 'day',
    drape: state === 'resting' ? 'half' : 'tied',
    smudges,
    haze: round((HAZE[smudges] ?? 0) + runs * 0.11),
    runs,
    flies: reached(stink, FLIES_AT),
    stench: reached(stink, STENCH_AT),
    bucket: due,
    mood,
  }
}

const FRAME_RING = `${superellipsePath(26, 24, 148, 104, 14)}${superellipsePath(38, 34, 124, 88, 7)}`

const PALETTE: Record<WindowSky, { sky: string; back: string; front: string }> = {
  night: { sky: '#16204d', back: '#26366b', front: '#1c2a58' },
  day: { sky: '#8ed2fb', back: C.leaf, front: C.leafDark },
  bright: { sky: '#b4e8ff', back: '#7fe8a0', front: C.leaf },
}

function sun(x: number, y: number, r: number, rays: boolean): Art {
  const spokes = Array.from({ length: 8 }, (_, i) => i * 45)
  return part('sun', [
    when(rays, () =>
      at(
        x,
        y,
        motion(
          'spin',
          spokes.map(
            (angle) =>
              svg`<rect x="-2.5" y=${-r - 10} width="5" height="7" rx="2.5" transform=${`rotate(${angle})`} fill=${C.sun} />`,
          ),
        ),
      ),
    ),
    svg`<circle cx=${x} cy=${y} r=${r} fill=${C.sun} />`,
  ])
}

function puff(x: number, y: number, s: number, delay: number): Art {
  return part(
    'cloud',
    at(
      x,
      y,
      motion(
        'drift',
        svg`<g fill="#fff"><circle cx="-9" cy="1" r="6.5" /><circle cx="1" cy="-3" r="9" /><circle cx="11" cy="2" r="6" /><rect x="-15" y="1" width="31" height="7" rx="3.5" /></g>`,
        delay,
      ),
      0,
      s,
    ),
  )
}

function moon(): Art {
  return part('moon', [
    svg`<circle cx="118" cy="52" r="20" fill=${C.spark} opacity=".12" />`,
    svg`<path d="M124 39a14 14 0 1 0 7 24a12 12 0 0 1-7-24Z" fill=${C.spark} />`,
  ])
}

function stars(): Art {
  const spots = [
    [78, 48, 2.2, 1],
    [90, 64, 1.5, 2],
    [84, 86, 1.8, 3],
    [106, 42, 1.6, 4],
    [128, 84, 1.8, 5],
    [112, 80, 1.3, 2],
  ] as const
  return spots.map(([x, y, r, d], i) =>
    part('star', at(x, y, motion('twinkle', svg`<circle r=${r} fill="#fff" />`, d)), i),
  )
}

function rainbow(): Art {
  const bands = [C.coral, C.sun, C.mint, C.sky, C.lilac]
  return part(
    'rainbow',
    bands.map((color, i) => {
      const r = 54 - i * 6
      return svg`<path d=${`M${106 - r} 104A${r} ${r} 0 0 1 ${106 + r} 104`} fill="none" stroke=${color} stroke-width="6.4" />`
    }),
  )
}

function cottage(glow: boolean): Art {
  const house = [
    svg`<rect x="124" y="80" width="17" height="14" fill=${glow ? '#33427a' : C.cream} />`,
    svg`<path d="M120.5 81L132.5 70L144.5 81Z" fill=${glow ? '#26366b' : C.coralDark} />`,
    glow
      ? motion(
          'flicker',
          svg`<rect x="129" y="83.5" width="7" height="6.5" rx="1" fill=${C.sun} />`,
        )
      : svg`<rect x="129" y="83.5" width="7" height="6.5" rx="1" fill=${C.skyDark} />`,
  ]
  return part('cottage', glow ? at(-20, 7, house) : house)
}

function view(parts: WindowParts): Art {
  const tone = PALETTE[parts.sky]
  const night = parts.sky === 'night'
  const bright = parts.sky === 'bright'
  return part('view', [
    svg`<rect x="32" y="30" width="136" height="96" fill=${tone.sky} data-part="sky" />`,
    night ? [stars(), moon()] : sun(bright ? 68 : 118, bright ? 48 : 56, bright ? 9 : 13, bright),
    when(bright, rainbow),
    when(!night && !bright, () => [puff(82, 54, 1, 1), puff(134, 72, 0.6, 3)]),
    svg`<path d="M32 104Q66 70 104 96T168 90V128H32Z" fill=${tone.back} data-part="hill" />`,
    cottage(night),
    svg`<path d="M32 116Q78 92 122 112T168 106V128H32Z" fill=${tone.front} data-part="hill" />`,
  ])
}

const SMUDGES = [
  [84, 54, 15, 10, 14],
  [124, 92, 13, 11, -12],
  [76, 100, 14, 9, 10],
  [126, 46, 13, 9, -8],
  [110, 66, 10, 8, 30],
  [66, 76, 8, 12, 5],
] as const

function handprint(x: number, y: number, color: string): Art {
  const fingers = [
    [-7, -7, -10, -16],
    [-2.5, -9, -3.5, -20],
    [2.5, -9, 3.5, -20],
    [7, -7, 10, -15],
    [8, 1, 15, -3],
  ] as const
  return part(
    'handprint',
    at(x, y, [
      svg`<ellipse rx="9.5" ry="9" fill=${color} />`,
      fingers.map(
        ([x1, y1, x2, y2]) =>
          svg`<path d=${`M${x1} ${y1}L${x2} ${y2}`} stroke=${color} stroke-width="4.6" stroke-linecap="round" />`,
      ),
    ]),
  )
}

function grime(parts: WindowParts): Art {
  const smear = mix('#6d5b3c', '#4c3f28', parts.runs / 3)
  const runs = [
    'M68 34q2 22-1 40',
    'M116 34q-2 26 1 54',
    'M92 34q2 16 0 30',
    'M136 34q-1 20 1 34',
    'M78 34q-2 12 0 20',
    'M104 34q1 14 0 24',
  ]
  return [
    when(parts.haze > 0, () =>
      part(
        'haze',
        svg`<rect x="32" y="30" width="136" height="96" fill="#94815a" opacity=${parts.haze} />`,
      ),
    ),
    SMUDGES.slice(0, parts.smudges).map(([x, y, w, h, r], i) =>
      part(
        'smudge',
        at(
          x,
          y,
          [
            svg`<path d=${blobPath(w, h)} fill=${smear} opacity=".6" />`,
            svg`<circle cx=${round(w * 1.25)} cy=${round(-h * 0.7)} r="2.6" fill=${smear} opacity=".6" />`,
            svg`<circle cx=${round(-w * 1.2)} cy=${round(h * 0.8)} r="2" fill=${smear} opacity=".6" />`,
          ],
          r,
        ),
        i,
      ),
    ),
    when(parts.smudges >= 4, () => handprint(112, 104, mix(smear, '#000000', 0.08))),
    when(parts.runs > 0, () =>
      part(
        'runs',
        svg`<path d=${runs.slice(0, parts.runs * 2).join('')} fill="none" stroke=${smear} stroke-width="4.2" stroke-linecap="round" opacity=".75" />`,
      ),
    ),
  ]
}

const SOAP = '#ecf7ff'

function suds(): Art {
  const film = 'M32 30H168V126H32ZM72 30H128V88Q100 94 72 88Z'
  return part('suds', svg`<path d=${film} fill=${SOAP} fill-rule="evenodd" opacity=".8" />`)
}

const FOAM = [
  [40, 96, 9],
  [52, 110, 8],
  [62, 92, 6],
  [66, 72, 7.5],
  [64, 48, 6.5],
  [50, 62, 5],
  [78, 104, 8],
  [94, 110, 9.5],
  [108, 102, 7],
  [124, 110, 8.5],
  [146, 100, 8],
  [156, 112, 8],
  [136, 88, 6.5],
  [136, 58, 7],
  [137, 40, 5.5],
  [152, 66, 6],
] as const

function foam(): Art {
  return part(
    'foam',
    FOAM.map(([x, y, r], i) =>
      at(
        x,
        y,
        motion(
          'pulse',
          [
            svg`<circle r=${r} fill="#fff" />`,
            svg`<path d=${`M${round(-r * 0.5)} ${round(-r * 0.15)}a${round(r * 0.55)} ${round(r * 0.55)} 0 0 1 ${round(r * 0.5)}-${round(r * 0.42)}`} fill="none" stroke=${C.water} stroke-width="1.8" stroke-linecap="round" />`,
          ],
          (i % 5) + 1,
        ),
      ),
    ),
  )
}

function muntins(): Art {
  return part(
    'muntins',
    svg`<rect x="97.5" y="30" width="5" height="96" fill=${C.cream} /><rect x="32" y="74" width="136" height="5" fill=${C.cream} />`,
  )
}

interface DrapeShape {
  top: number
  waist: number
  waistY: number
  hem: number
  hemY: number
  sag: number
  tie: boolean
  ragged: boolean
}

function drapeShape(drape: WindowDrape, droop: number): DrapeShape {
  if (drape === 'half') {
    return { top: 72, waist: 70, waistY: 72, hem: 72, hemY: 122, sag: 0, tie: false, ragged: false }
  }
  if (droop >= 2) {
    return { top: 54, waist: 50, waistY: 90, hem: 54, hemY: 146, sag: 12, tie: false, ragged: true }
  }
  if (droop === 1) {
    return { top: 56, waist: 47, waistY: 100, hem: 52, hemY: 122, sag: 6, tie: true, ragged: false }
  }
  if (drape === 'open') {
    return { top: 52, waist: 41, waistY: 76, hem: 50, hemY: 122, sag: 0, tie: true, ragged: false }
  }
  return { top: 60, waist: 46, waistY: 78, hem: 56, hemY: 122, sag: 0, tie: true, ragged: false }
}

function drapePath(s: DrapeShape): string {
  const mid = round((22 + s.top) / 2)
  const head = `M22 21Q${mid} ${21 + s.sag} ${s.top} 21`
  const upper = `C${s.top} ${s.waistY - 30} ${s.waist + 3} ${s.waistY - 14} ${s.waist} ${s.waistY}`
  const lower = `C${s.waist + 3} ${s.waistY + 14} ${s.hem} ${s.hemY - 16} ${s.hem} ${s.hemY}`
  const foot = s.ragged
    ? `L${s.hem - 6} ${s.hemY - 9}L${s.hem - 12} ${s.hemY + 2}L${s.hem - 18} ${s.hemY - 7}L${s.hem - 23} ${s.hemY + 3}L22 ${s.hemY - 6}Z`
    : `H22Z`
  return `${head}${upper}${lower}${foot}`
}

function curtain(parts: WindowParts, s: DrapeShape, color: string, fold: string, tie: string): Art {
  const inner = round((22 + s.waist) / 2)
  const folds =
    parts.drape === 'half'
      ? `M36 24V120M50 24V120M62 24V120`
      : `M33 ${21 + s.sag}Q34 ${s.waistY - 24} ${inner - 2} ${s.waistY}M${inner + 8} ${21 + s.sag}Q${inner + 8} ${s.waistY - 24} ${inner + 6} ${s.waistY}M${inner - 2} ${s.waistY}Q32 ${s.waistY + 18} 33 ${s.hemY - 6}M${inner + 6} ${s.waistY}Q${inner + 8} ${s.waistY + 18} ${inner + 8} ${s.hemY - 6}`
  return part('curtain', [
    svg`<path d=${drapePath(s)} fill=${color} />`,
    svg`<path d=${folds} fill="none" stroke=${fold} stroke-width="3" stroke-linecap="round" />`,
    when(
      s.tie,
      () =>
        svg`<rect x="20" y=${s.waistY - 5} width=${s.waist - 16} height="10" rx="5" fill=${tie} data-part="tie" />`,
    ),
  ])
}

function mirrored(art: Art): Art {
  return svg`<g transform="translate(200 0) scale(-1 1)">${art}</g>`
}

interface DrapeTone {
  main: string
  dark: string
  tie: string
}

function drapeTone(scene: SceneView): DrapeTone {
  const main = accentOf(scene, C.coral)
  if (main === C.coral) return { main, dark: C.coralDark, tie: C.sun }
  return { main, dark: shadeOf(main), tie: tintOf(main, 0.55) }
}

function drapes(parts: WindowParts, tone: DrapeTone): Art {
  const s = drapeShape(parts.drape, parts.droop)
  const decay = parts.droop / 2
  const night = parts.drape === 'half' ? 0.28 : 0
  const color = mix(mix(tone.main, '#16204d', night), '#8d7a5c', decay * 0.85)
  const fold = mix(mix(tone.dark, '#16204d', night), '#6d5c44', decay * 0.85)
  const tie = mix(tone.tie, '#8d7a5c', decay)
  const left = curtain(parts, s, color, fold, tie)
  const right = mirrored(curtain(parts, { ...s, sag: s.sag * 0.6 }, color, fold, tie))
  const sway = parts.drape === 'open' && parts.droop === 0
  return sway ? [motion('sway', left, 1), motion('sway', right, 2)] : [left, right]
}

function rod(): Art {
  return part('rod', [
    svg`<rect x="16" y="16" width="168" height="6" rx="3" fill=${C.wickerDark} />`,
    svg`<circle cx="17" cy="19" r="6" fill=${C.wicker} /><circle cx="183" cy="19" r="6" fill=${C.wicker} />`,
  ])
}

function web(): Art {
  const cx = 172
  const cy = 26
  const angles = [98, 118, 138, 158, 176].map((a) => (a * Math.PI) / 180)
  const point = (a: number, r: number): string =>
    `${round(cx + Math.cos(a) * r)} ${round(cy + Math.sin(a) * r)}`
  const spokes = angles.map((a) => `M${cx} ${cy}L${point(a, 54)}`).join('')
  const strands = [18, 33, 48]
    .map((r) =>
      angles
        .slice(1)
        .map((a, i) => {
          const from = angles[i] ?? a
          const mid = (from + a) / 2
          return `M${point(from, r)}Q${point(mid, r * 0.8)} ${point(a, r)}`
        })
        .join(''),
    )
    .join('')
  return part('web', [
    svg`<path d=${`${spokes}${strands}`} fill="none" stroke="#f1f4fb" stroke-width="2" stroke-linecap="round" opacity=".92" />`,
    part('spider', [
      svg`<path d="M148 42V68" stroke="#f1f4fb" stroke-width="1.6" />`,
      at(
        148,
        72,
        motion('bob', [
          svg`<path d="M-5-2L-12-8M-5 0L-13-1M-5 2L-12 7M-4 4L-9 11M5-2L12-8M5 0L13-1M5 2L12 7M4 4L9 11" stroke=${INK} stroke-width="2" stroke-linecap="round" />`,
          svg`<circle r="7" fill=${INK} />`,
          svg`<circle cx="-2.6" cy="-1" r="1.7" fill="#fff" /><circle cx="2.6" cy="-1" r="1.7" fill="#fff" />`,
        ]),
      ),
    ]),
  ])
}

function deadFly(x: number, r: number, index: number): Art {
  return part(
    'dead-fly',
    at(
      x,
      115,
      [
        svg`<path d="M-4-3L-7-10M0-4V-11M4-3L7-10" stroke=${C.fly} stroke-width="2" stroke-linecap="round" />`,
        svg`<ellipse cx="-7" cy="3" rx="6" ry="2.8" fill=${C.wing} transform="rotate(-14 -7 3)" />`,
        svg`<ellipse cx="7" cy="3" rx="6" ry="2.8" fill=${C.wing} transform="rotate(14 7 3)" />`,
        svg`<ellipse rx="6.4" ry="5" fill=${C.fly} />`,
      ],
      r,
    ),
    index,
  )
}

function squeegee(lean: number, reach: number): Art {
  return part('squeegee', [
    svg`<path d=${`M0 6L${lean} ${reach}`} stroke=${C.sun} stroke-width="7" stroke-linecap="round" />`,
    svg`<path d=${`M${round(lean * 0.72)} ${round(reach * 0.72)}L${lean} ${reach}`} stroke=${C.coral} stroke-width="8.5" stroke-linecap="round" />`,
    svg`<rect x="-32" y="-7" width="64" height="5" rx="2.5" fill=${C.fly} />`,
    svg`<rect x="-30" y="-3" width="60" height="9" rx="4" fill=${C.metalMid} />`,
  ])
}

function bucket(withTool: boolean): Art {
  return part('bucket', [
    when(withTool, () => at(40, 100, squeegee(-4, 62), -6, 0.8)),
    svg`<g fill="#fff"><circle cx="26" cy="141" r="7" /><circle cx="39" cy="138" r="9" /><circle cx="52" cy="141" r="6.5" /></g>`,
    svg`<path d="M17 147H63L58 178Q57 184 51 184H29Q23 184 22 178Z" fill=${C.sky} />`,
    svg`<rect x="13" y="142" width="54" height="9" rx="4.5" fill=${C.skyDark} />`,
    svg`<path d="M20 152Q40 176 60 152" fill="none" stroke=${C.metal} stroke-width="3.4" stroke-linecap="round" />`,
  ])
}

function scrub(): Art {
  const drips = [
    [84, 112, 1],
    [116, 104, 2],
    [100, 118, 3],
  ] as const
  return [
    drips.map(([x, y, d]) => at(x, y, motion('drip', drop(0, 0, C.water, 0.85), d))),
    at(100, 92, motion('wobble', squeegee(40, 56))),
    bucket(false),
    bubble(26, 128, 6, 1),
    bubble(56, 124, 4.5, 3),
    bubble(176, 150, 7, 2),
    bubble(170, 120, 4.5, 4),
  ]
}

function dryDroplets(): Art {
  const spots = [
    [70, 46, 0.8, 0],
    [88, 66, 0.6, 1],
    [120, 48, 0.75, 0],
    [134, 66, 0.6, 2],
    [66, 92, 0.65, 3],
    [90, 98, 0.85, 0],
    [116, 88, 0.7, 4],
    [138, 104, 0.8, 0],
  ] as const
  return part(
    'droplets',
    spots.map(([x, y, s, d]) => {
      const bead = drop(0, 0, '#e8f7ff', s)
      return at(x, y, d ? motion('drip', bead, d) : bead)
    }),
  )
}

function cloth(): Art {
  return part('cloth', [
    at(
      146,
      118,
      motion('sway', [
        svg`<path d="M-20 0H20Q23 0 23 4L25 44Q25 48 21 47L13 44L5 48L-4 44L-12 48L-20 45Q-24 44-23 40L-23 4Q-23 0-20 0Z" fill=${C.lilac} />`,
        svg`<path d="M-23 10H24M-23 36H25" stroke=${C.cream} stroke-width="4" />`,
        svg`<path d="M-22 16q22 5 46 0" fill="none" stroke=${C.lilacDark} stroke-width="3" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

function glints(): Art {
  return part('glint', [
    svg`<path d="M62 122L108 34H128L82 122Z" fill="#fff" opacity=".2" />`,
    svg`<path d="M92 122L138 34H146L100 122Z" fill="#fff" opacity=".28" />`,
  ])
}

function bird(): Art {
  return part('bird', [
    at(
      136,
      108,
      motion('bob', [
        svg`<path d="M12-1L24-7L21 3Z" fill=${C.sunDark} />`,
        svg`<ellipse rx="12.5" ry="11" fill=${C.sun} />`,
        svg`<path d="M-4 0Q5-4 11 2Q6 8-1 6Z" fill=${C.sunDark} />`,
        svg`<path d="M-12-4L-21-1L-12 2Z" fill=${C.coral} />`,
        svg`<circle cx="-6" cy="-4" r="2.2" fill=${INK} />`,
        svg`<path d="M-4 11V13M3 11V13" stroke=${C.coralDark} stroke-width="2.4" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

export function window(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = windowParts(scene)
  const fliesAt = [
    [34, 78],
    [172, 106],
  ] as const
  const deadSpots = [
    [76, -8],
    [124, 8],
    [100, -3],
  ] as const
  return frame('window', scene, options, [
    shadow(100, 184, 78),
    svg`<rect x="36" y="124" width="128" height="56" rx="10" fill=${C.wicker} data-part="panel" />`,
    svg`<rect x="46" y="136" width="108" height="36" rx="7" fill=${C.wickerLight} opacity=".55" />`,
    view(parts),
    grime(parts),
    when(
      parts.droplets,
      () => svg`<rect x="32" y="30" width="136" height="96" fill="#fff" opacity=".08" />`,
    ),
    when(parts.dazzle, glints),
    when(parts.scrubbing, suds),
    muntins(),
    when(parts.scrubbing, foam),
    when(parts.droplets, dryDroplets),
    part('window-frame', svg`<path d=${FRAME_RING} fill=${C.cream} fill-rule="evenodd" />`),
    svg`<rect x="18" y="120" width="164" height="13" rx="5" fill=${C.wickerLight} data-part="sill" />`,
    svg`<rect x="26" y="130" width="148" height="3" fill=${C.wickerDark} opacity=".55" />`,
    deadSpots.slice(0, parts.deadFlies).map(([x, r], i) => deadFly(x, r, i)),
    drapes(parts, drapeTone(scene)),
    rod(),
    when(parts.dazzle, bird),
    when(parts.cloth, cloth),
    face(100, 153, parts.mood, '#5b3413', 1),
    when(parts.web, web),
    when(parts.bucket, () => bucket(true)),
    when(parts.scrubbing, scrub),
    stenchLines(
      (
        [
          [178, 112],
          [22, 118],
        ] as const
      ).slice(0, parts.stench),
    ),
    fliesAt.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
    when(parts.dazzle, () => [
      sparkle(20, 60, 1, 1),
      sparkle(179, 48, 1, 2),
      sparkle(128, 46, 0.85, 3),
      sparkle(176, 146, 0.8, 4),
      sparkle(22, 150, 0.9, 5),
    ]),
  ])
}
