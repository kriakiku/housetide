import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
  COLORS as C,
  clamp01,
  face,
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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type DustView = 'shelf' | 'sweep' | 'cloth'

export interface DustParts {
  view: DustView
  step: number
  finger: boolean
  spider: boolean
  clouds: number
  sneeze: boolean
  itchy: boolean
  wilted: boolean
  falling: boolean
  bunnies: number
  wish: boolean
  asleep: boolean
  shiny: boolean
  mood: Mood
  vaseMood: Mood
}

export const MAX_STEP = 5

const FINGER_AT = 0.08
const SPIDER_AT = 0.3
const CLOUDS_AT = [0.55, 0.72, 0.9] as const
const SNEEZE_AT = 0.8
const ITCH_AT = 0.5
const SICK_AT = 0.55
const WAITING_DUST_AT = [0.08, 0.3, 0.6] as const

const CALM = {
  step: 0,
  finger: false,
  spider: false,
  clouds: 0,
  sneeze: false,
  itchy: false,
  wilted: false,
  falling: false,
  bunnies: 0,
  wish: false,
  asleep: false,
  shiny: false,
} as const

export function dustParts(scene: SceneView): DustParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return { ...CALM, view: 'shelf', shiny: true, mood: 'happy', vaseMood: 'happy' }
  }
  const neglect = {
    finger: stink >= FINGER_AT,
    spider: stink >= SPIDER_AT,
    clouds: reached(stink, CLOUDS_AT),
    sneeze: stink >= SNEEZE_AT,
    itchy: stink >= ITCH_AT,
    wilted: stink >= SPIDER_AT,
  }
  const sick = stink >= SICK_AT
  const vaseMood: Mood = neglect.itchy ? 'worried' : 'calm'
  if (state === 'running') {
    return {
      ...CALM,
      ...neglect,
      finger: false,
      view: 'sweep',
      step: 3,
      mood: sick ? 'worried' : 'happy',
      vaseMood,
    }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      ...neglect,
      view: 'cloth',
      step: reached(stink, WAITING_DUST_AT),
      mood: sick ? 'sick' : 'calm',
      vaseMood,
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const step = due ? MAX_STEP : resting ? 0 : Math.min(MAX_STEP - 1, Math.ceil(fill * 4))
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...CALM,
    ...neglect,
    view: 'shelf',
    step,
    falling: step >= 4,
    bunnies: Math.max(0, step - 3),
    wish: due && !neglect.itchy,
    asleep: resting,
    mood,
    vaseMood: resting ? 'sleepy' : vaseMood,
  }
}

const SHELF_TOP = 134
const SHELF_LEFT = 12
const SHELF_RIGHT = 188
const DUSTER_X = 108
const VASE_X = 160

const WOOD = '#a96d3c'
const WOOD_DARK = '#83502a'
const WOOD_TOP = '#c98d55'
const DUST = '#ded7c6'
const DUST_DARK = '#aaa18c'
const DUST_DEEP = '#857c69'
const WEB = '#e6ebf5'
const SPIDER = '#8a5fa8'
const SPIDER_DARK = '#6b4489'
const PAPER = '#fbf7ec'
const DRIED = '#a58a5a'
const DRIED_DARK = '#7a6238'
const SKIN = '#ffcfa8'
const HAIR = '#6d4f28'
const FEATHER_FACE = '#5b1f3f'
const CLOTH = C.lilac
const CLOTH_DARK = C.lilacDark

const HEIGHTS = [0, 2.5, 5, 8, 11.5, 15] as const
const VEILS = [0, 0.14, 0.3, 0.48, 0.66, 0.82] as const

function heightOf(step: number): number {
  return HEIGHTS[step] ?? 0
}

function veilOf(step: number): number {
  return VEILS[step] ?? 0
}

function dustBank(x0: number, x1: number, base: number, h: number): string {
  const span = x1 - x0
  const count = Math.max(2, Math.round(span / 13))
  const width = span / count
  const top = base - h
  const lumps = Array.from({ length: count }, (_, i) => {
    const lift = Math.min(h * 0.55, 3.2) * (0.55 + (((i * 5) % 3) / 2) * 0.75)
    const x = x0 + width * (i + 0.5)
    return `Q${round(x)} ${round(top - lift)} ${round(x0 + width * (i + 1))} ${round(top)}`
  }).join('')
  return `M${round(x0 - 2)} ${base}Q${round(x0 - 1)} ${round(top)} ${round(x0)} ${round(top)}${lumps}Q${round(x1 + 1)} ${round(top)} ${round(x1 + 2)} ${base}Z`
}

function bank(x0: number, x1: number, base: number, h: number): Art {
  if (h <= 0) return []
  return [
    svg`<path d=${dustBank(x0, x1, base, h)} fill=${DUST} />`,
    when(
      h >= 4,
      () =>
        svg`<path d=${dustBank(x0 + 1, x1 - 1, base, Math.max(1.5, h * 0.42))} fill=${DUST_DARK} opacity=".55" />`,
    ),
  ]
}

const HEM = [
  [14, 5],
  [30, 9],
  [48, 4],
  [60, 7],
  [76, 12],
  [90, 5],
  [104, 8],
  [120, 16],
  [134, 6],
  [150, 10],
  [168, 5],
  [186, 8],
] as const

function hem(step: number): Art {
  if (step < 3) return []
  const scale = step - 2
  const base = SHELF_TOP + 3
  const lobes = HEM.slice(1).map(([x, depth], i) => {
    const prev = HEM[i]?.[0] ?? x
    const y = round(base + (depth * scale) / 2 + scale)
    return `C${prev + 1} ${y} ${x - 1} ${y} ${x} ${base}`
  })
  return part(
    'drape',
    svg`<rect x="14" y=${SHELF_TOP} width="172" height="4" fill=${DUST} /><path d=${`M14 ${base}${lobes.join('')}Z`} fill=${DUST} />`,
  )
}

function shelf(parts: DustParts): Art {
  const bracket = (x: number, side: number): Art =>
    svg`<path d=${`M${x - 5} ${SHELF_TOP + 10}H${x + 5}V${SHELF_TOP + 12}C${x + 5} ${SHELF_TOP + 22} ${x + side * 8} ${SHELF_TOP + 28} ${x + side * 12} ${SHELF_TOP + 29}C${x + side * 3} ${SHELF_TOP + 32} ${x - 5} ${SHELF_TOP + 26} ${x - 5} ${SHELF_TOP + 12}Z`} fill=${WOOD_DARK} />`
  const width = SHELF_RIGHT - SHELF_LEFT
  return part('shelf', [
    bracket(44, -1),
    bracket(156, 1),
    svg`<rect x=${SHELF_LEFT} y=${SHELF_TOP} width=${width} height="13" rx="5" fill=${WOOD} />`,
    svg`<rect x=${SHELF_LEFT} y=${SHELF_TOP} width=${width} height="5" rx="2.5" fill=${WOOD_TOP} />`,
    when(parts.shiny, () =>
      part('shine', [
        svg`<rect x="26" y=${SHELF_TOP + 1} width="44" height="2.6" rx="1.3" fill="#fff" opacity=".85" />`,
        svg`<rect x="78" y=${SHELF_TOP + 1} width="12" height="2.6" rx="1.3" fill="#fff" opacity=".85" />`,
        svg`<rect x="128" y=${SHELF_TOP + 1} width="34" height="2.6" rx="1.3" fill="#fff" opacity=".85" />`,
        svg`<path d="M58 ${SHELF_TOP + 8}h22M88 ${SHELF_TOP + 8}h8" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".32" />`,
      ]),
    ),
  ])
}

function glint(x: number, y: number, w: number, h: number): Art {
  const slant = h * 0.5
  return svg`<path d=${`M${x + slant} ${y}h${w}l${-slant} ${h}h${-w}Z`} fill="#fff" opacity=".55" />`
}

function fingerFace(): Art {
  return part(
    'finger-face',
    at(
      0,
      -36,
      svg`<g fill="none" stroke=${C.glass} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-9-8h.01M9-8h.01" stroke-width="5.4" />
        <path d="M-10 11Q0-2 10 11" />
      </g>`,
    ),
  )
}

function bigFrame(parts: DustParts): Art {
  const veil = parts.finger ? Math.max(veilOf(parts.step), 0.76) : veilOf(parts.step)
  const tilt = parts.step >= MAX_STEP ? -3 : 0
  return part(
    'frame',
    at(
      42,
      SHELF_TOP,
      [
        svg`<rect x="-26" y="-74" width="52" height="74" rx="5" fill=${C.sun} />`,
        svg`<rect x="-26" y="-6" width="52" height="6" rx="3" fill=${C.sunDark} />`,
        svg`<rect x="-20" y="-68" width="40" height="60" rx="2" fill=${PAPER} />`,
        svg`<rect x="-17" y="-65" width="34" height="54" rx="1.5" fill=${C.sky} />`,
        svg`<circle cx="7" cy="-52" r="7.5" fill=${C.spark} />`,
        svg`<path d="M-17-11V-30Q-8-46 2-33Q10-42 17-30V-11Z" fill=${C.leaf} />`,
        svg`<path d="M-17-11V-20Q-4-30 17-17V-11Z" fill=${C.leafDark} />`,
        when(
          veil > 0,
          () =>
            svg`<rect x="-20" y="-68" width="40" height="60" rx="2" fill=${DUST} opacity=${veil} data-part="veil" />`,
        ),
        when(parts.finger, fingerFace),
        when(parts.shiny, () => [glint(-14, -62, 9, 28), glint(-1, -62, 4, 28)]),
        at(0, -74, bank(-25, 25, 1, heightOf(parts.step) * 0.8)),
      ],
      tilt,
    ),
  )
}

function smallFrame(parts: DustParts): Art {
  const veil = veilOf(parts.step)
  return part(
    'frame',
    at(
      80,
      SHELF_TOP,
      [
        svg`<rect x="-16" y="-40" width="32" height="40" rx="4" fill=${C.coral} />`,
        svg`<rect x="-16" y="-5" width="32" height="5" rx="2.5" fill=${C.coralDark} />`,
        svg`<rect x="-11.5" y="-35.5" width="23" height="30" rx="1.5" fill=${C.lilac} />`,
        svg`<path d="M-9-5.5C-9-14-5-17 0-17S9-14 9-5.5Z" fill=${C.mint} />`,
        svg`<circle cy="-23" r="6.4" fill=${SKIN} />`,
        svg`<path d="M-6.8-23A6.8 6.8 0 0 1 6.8-23Q2-27-6.8-23Z" fill=${HAIR} />`,
        when(
          veil > 0,
          () =>
            svg`<rect x="-11.5" y="-35.5" width="23" height="30" rx="1.5" fill=${DUST} opacity=${veil} data-part="veil" />`,
        ),
        when(parts.shiny, () => glint(-9, -33, 5, 16)),
        at(0, -40, bank(-15, 15, 1, heightOf(parts.step) * 0.62)),
      ],
      parts.step >= 4 ? 2 : 0,
    ),
  )
}

function bloom(x: number, y: number, angle: number, petal: string, heart: string): Art {
  return at(
    x,
    y,
    [
      [0, 72, 144, 216, 288].map(
        (r) => svg`<ellipse cy="-7.5" rx="5" ry="7" transform=${`rotate(${r})`} fill=${petal} />`,
      ),
      svg`<circle r="4.6" fill=${heart} />`,
    ],
    angle,
  )
}

function bouquet(parts: DustParts): Art {
  const stem = parts.wilted ? DRIED_DARK : C.leafDark
  const stroke = (d: string): Art =>
    svg`<path d=${d} fill="none" stroke=${stem} stroke-width="3.2" stroke-linecap="round" />`
  if (parts.shiny) {
    return part('bouquet', [
      stroke('M0-54C0-68 0-80 1-96'),
      stroke('M-3-54C-5-66-9-74-11-82'),
      stroke('M3-54C8-64 14-68 17-76'),
      bloom(1, -102, 0, C.coral, C.sun),
      bloom(-13, -86, -14, C.lilac, C.sun),
      bloom(19, -82, 18, C.pink, C.sun),
    ])
  }
  if (parts.wilted) {
    return part('bouquet', [
      stroke('M0-54C1-68 4-78 14-78'),
      at(14, -78, [
        svg`<path d="M0-3C6-5 11 0 9 8C3 8-2 4 0-3Z" fill=${DRIED} />`,
        svg`<path d="M4 8C4 12 3 14 1 16" fill="none" stroke=${DRIED_DARK} stroke-width="2" stroke-linecap="round" />`,
      ]),
    ])
  }
  return part('bouquet', [stroke('M0-54C0-68 1-74 2-80'), bloom(2, -86, 8, C.coral, C.sun)])
}

function sneezeBlast(): Art {
  return part(
    'sneeze',
    at(-26, -24, [
      motion(
        'flicker',
        svg`<g fill="none" stroke=${C.cream} stroke-width="3.6" stroke-linecap="round">
          <path d="M-14-18l-6-7M-26-8l-9-4M-28 8l-9 3M-14 18l-6 7" />
        </g>`,
        1,
      ),
      motion(
        'throb',
        svg`<g fill=${DUST_DARK}><circle cx="-8" cy="1" r="12" /><circle cx="-20" cy="-6" r="8.5" /><circle cx="-20" cy="9" r="8" /></g><g fill=${DUST}><circle cx="-8" cy="-1" r="10" /><circle cx="-20" cy="-8" r="7" /><circle cx="-20" cy="7" r="6.5" /></g>`,
      ),
    ]),
  )
}

function sneezeFace(color: string): Art {
  return part(
    'vase-sneeze',
    at(
      0,
      -22,
      svg`<g fill="none" stroke=${color} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-12-6l5 3-5 3M12-6l-5 3 5 3" />
      </g><ellipse cy="8" rx="5" ry="6" fill=${color} />`,
    ),
  )
}

function vase(parts: DustParts): Art {
  const body = C.sky
  const dark = C.skyDark
  const ink = shadeOf(dark, 0.62)
  const shape: Art = [
    bouquet(parts),
    svg`<path d="M-9-52C-9-42-25-38-25-20C-25-8-17 0-13 0H13C17 0 25-8 25-20C25-38 9-42 9-52Z" fill=${body} />`,
    svg`<path d="M25-20C25-8 17 0 13 0H-13C-16 0-20-5-23-11C-14-5 6-4 24-13C25-15 25-18 25-20Z" fill=${dark} />`,
    svg`<rect x="-13.5" y="-57" width="27" height="7" rx="3.5" fill=${dark} />`,
    parts.sneeze ? sneezeFace(ink) : at(0, -22, face(0, 0, parts.vaseMood, ink, 0.56)),
    when(
      parts.shiny,
      () =>
        svg`<path d="M-18-30Q-20-22-17-15" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".7" />`,
    ),
    at(0, -57, bank(-12, 12, 1, heightOf(parts.step) * 0.5)),
    when(
      parts.step >= 3,
      () =>
        svg`<path d="M-21-32Q-13-36-8-42L-11-34Q-16-30-21-32ZM21-32Q13-36 8-42L11-34Q16-30 21-32Z" fill=${DUST} />`,
    ),
  ]
  return part('vase', at(VASE_X, SHELF_TOP, parts.sneeze ? motion('rumble', shape) : shape))
}

const BACK_FEATHERS = [
  [-48, 54],
  [-38, 60],
  [-28, 65],
  [-19, 69],
  [-9, 71],
  [0, 72],
  [9, 71],
  [19, 69],
  [28, 65],
  [38, 60],
  [48, 54],
] as const

const MID_FEATHERS = [
  [-29, 49],
  [-19, 55],
  [-10, 58],
  [0, 60],
  [10, 58],
  [19, 55],
  [29, 49],
] as const

const FRONT_FEATHERS = [
  [-21, 44],
  [-11, 48],
  [0, 50],
  [11, 48],
  [21, 44],
] as const

function featherPath(length: number, width: number): string {
  const y = (share: number): number => round(-length * share)
  const w = (share: number): number => round(width * share)
  return `M0 0C${w(-0.25)} ${y(0.3)} ${w(-1)} ${y(0.55)} ${w(-0.95)} ${y(0.82)}C${w(-0.9)} ${y(0.98)} ${w(-0.45)} ${y(1.06)} 0 ${y(1.06)}C${w(0.45)} ${y(1.06)} ${w(0.9)} ${y(0.98)} ${w(0.95)} ${y(0.82)}C${w(1)} ${y(0.55)} ${w(0.25)} ${y(0.3)} 0 0Z`
}

function feather(angle: number, length: number, width: number, color: string, vein?: string): Art {
  const tip = round(-length * 0.98)
  const low = round(-length * 0.62)
  return at(
    0,
    0,
    [
      svg`<path d=${featherPath(length, width)} fill=${color} />`,
      when(
        vein !== undefined,
        () =>
          svg`<path d=${`M0 ${low}V${tip}M-${round(width * 0.45)} ${round(-length * 0.8)}L0 ${round(-length * 0.72)}M${round(width * 0.45)} ${round(-length * 0.84)}L0 ${round(-length * 0.76)}`} fill="none" stroke=${vein} stroke-width="1.8" stroke-linecap="round" opacity=".55" />`,
      ),
    ],
    angle,
  )
}

interface DusterTones {
  handle: string
  dark: string
  light: string
  feather: string
  mid: string
  back: string
}

function tonesOf(scene: SceneView, parts: DustParts): DusterTones {
  const handle = accentOf(scene, C.mint)
  const grime = parts.step * 0.03
  return {
    handle,
    dark: shadeOf(handle, 0.3),
    light: tintOf(handle, 0.5),
    feather: mix('#ffb0d6', DUST, grime),
    mid: mix(C.pink, DUST, grime),
    back: mix(C.pinkDark, DUST, grime),
  }
}

function duster(
  parts: DustParts,
  tones: DusterTones,
  stick: number,
  foot: boolean,
  lean = 0,
  faceTilt = 0,
): Art {
  const head: Art = [
    BACK_FEATHERS.map(([a, l]) => feather(a, l, 12, tones.back, shadeOf(C.pinkDark, 0.3))),
    MID_FEATHERS.map(([a, l]) => feather(a, l, 11, tones.mid, C.pinkDark)),
    FRONT_FEATHERS.map(([a, l]) => feather(a, l, 13, tones.feather)),
    at(0, -30, face(0, 0, parts.mood, FEATHER_FACE, 0.86), faceTilt),
  ]
  const seam = isDarkColor(tones.handle) ? tintOf(tones.handle, 0.6) : shadeOf(tones.handle, 0.5)
  return part('duster', [
    when(foot, () => svg`<rect x="-16" y="-8" width="32" height="8" rx="4" fill=${tones.dark} />`),
    svg`<rect x="-8" y=${-stick} width="16" height=${stick - 3} rx="5" fill=${tones.handle} />`,
    svg`<rect x="-4.6" y=${-stick + 8} width="3.6" height=${stick - 18} rx="1.8" fill=${tones.light} opacity=".85" />`,
    svg`<path d=${`M-8 ${round(-stick * 0.42)}h16`} stroke=${seam} stroke-width="2.4" opacity=".4" />`,
    at(0, -stick, [
      at(0, 0, head, lean, 0.9),
      svg`<rect x="-12" y="-7" width="24" height="12" rx="4" fill=${tones.dark} />`,
      svg`<rect x="-8" y="-4.4" width="10" height="2.6" rx="1.3" fill=${tones.light} opacity=".8" />`,
    ]),
  ])
}

function web(): Art {
  const spokes = [8, 32, 58, 82].map((d) => {
    const a = (d * Math.PI) / 180
    return [round(Math.cos(a) * 25), round(Math.sin(a) * 25)] as const
  })
  const ring = (k: number): string =>
    spokes
      .map(
        ([x, y], i) =>
          `${i ? 'Q' : 'M'}${i ? `${round(x * k * 0.78)} ${round(y * k * 0.78)} ` : ''}${round(x * k)} ${round(y * k)}`,
      )
      .join('')
  return part(
    'cobweb',
    at(
      158,
      SHELF_TOP + 12,
      svg`<g fill="none" stroke=${WEB} stroke-width="1.4" stroke-linecap="round" opacity=".85">
        ${spokes.map(([x, y]) => svg`<path d=${`M0 0L${x} ${y}`} />`)}
        ${[0.5, 0.78, 1].map((k) => svg`<path d=${ring(k)} />`)}
      </g>`,
    ),
  )
}

function spider(x: number, y: number): Art {
  const legs = [-1, 1].flatMap((side) =>
    [0, 1, 2, 3].map((i) => {
      const dx = side * 9
      const top = -6 + i * 3.6
      return svg`<path d=${`M${side * 5} ${round(top * 0.5)}Q${dx + side * 3} ${round(top - 5)} ${dx + side * 5} ${round(top + 3)}`} fill="none" stroke=${SPIDER_DARK} stroke-width="1.9" stroke-linecap="round" />`
    }),
  )
  return part('spider', [
    svg`<path d=${`M${x} ${SHELF_TOP + 12}V${y - 6}`} stroke=${WEB} stroke-width="1.4" opacity=".85" />`,
    at(
      x,
      y,
      motion('bob', [
        legs,
        svg`<circle r="8" fill=${SPIDER} />`,
        svg`<circle cx="-3" cy="-1" r="2.7" fill="#fff" /><circle cx="3" cy="-1" r="2.7" fill="#fff" />`,
        svg`<circle cx="-2.6" cy="-.4" r="1.3" fill=${INK} /><circle cx="3.4" cy="-.4" r="1.3" fill=${INK} />`,
        svg`<path d="M-1.8 4q1.8 1.6 3.6 0" fill="none" stroke=${INK} stroke-width="1.3" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

function dustCloud(x: number, y: number, s: number, delay: number, index: number): Art {
  return part(
    'dust-cloud',
    at(
      x,
      y,
      motion(
        'drift',
        [
          svg`<g fill=${DUST_DARK}><circle cx="-17" cy="6" r="12" /><circle cx="3" cy="-2" r="17" /><circle cx="21" cy="7" r="11" /><rect x="-29" y="6" width="60" height="13" rx="6.5" /></g>`,
          svg`<g fill=${DUST}><circle cx="-15" cy="4" r="10" /><circle cx="3" cy="-4" r="14" /><circle cx="19" cy="5" r="9" /><rect x="-25" y="3" width="52" height="11" rx="5.5" /></g>`,
          svg`<g fill=${DUST_DEEP}><circle cx="-10" cy="-2" r="1.5" /><circle cx="9" cy="-9" r="1.8" /><circle cx="14" cy="4" r="1.3" /><circle cx="-1" cy="6" r="1.3" /></g>`,
        ],
        delay,
      ),
      0,
      s,
    ),
    index,
  )
}

function puff(x: number, y: number, r: number, delay: number, name: string): Art {
  const lobes = (color: string, k: number): Art =>
    svg`<g fill=${color}><circle r=${round(r * k)} /><circle cx=${round(r * 0.95)} cy=${round(r * 0.3)} r=${round(r * 0.66 * k)} /><circle cx=${round(-r * 0.85)} cy=${round(r * 0.35)} r=${round(r * 0.58 * k)} /></g>`
  return part(
    'puff',
    at(x, y, motion(name, [lobes(DUST_DARK, 1), at(0, -1.2, lobes(DUST, 0.84))], delay)),
  )
}

function falling(): Art {
  return part(
    'falling-dust',
    (
      [
        [34, 164, 2.2, 1],
        [84, 158, 2.8, 2],
        [132, 160, 2.2, 3],
        [172, 162, 2.6, 4],
      ] as const
    ).map(([x, y, r, d]) => at(x, y, motion('fall', svg`<circle r=${r} fill=${DUST} />`, d))),
  )
}

function bunny(x: number, y: number, s: number): Art {
  return at(
    x,
    y,
    [
      svg`<g fill=${DUST_DARK}><circle cx="-8" cy="-2" r="6" /><circle cx="0" cy="-5" r="8.5" /><circle cx="8" cy="-2" r="6" /><rect x="-14" y="-3" width="28" height="6" rx="3" /></g>`,
      svg`<path d="M-11-8l-3-2M-4-13l-1.6-3.4M4-13l1.6-3.4M11-8l3-2" stroke=${DUST_DARK} stroke-width="1.8" stroke-linecap="round" />`,
      svg`<circle cx="-3.4" cy="-4" r="1.5" fill=${INK} /><circle cx="3.4" cy="-4" r="1.5" fill=${INK} />`,
    ],
    0,
    s,
  )
}

const BUNNIES = [
  [56, 183, 1],
  [150, 183, 0.82],
] as const

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

function wish(): Art {
  return part('wish', [
    svg`<circle cx="68" cy="60" r="3.8" fill=${C.cream} /><circle cx="56" cy="48" r="6" fill=${C.cream} />`,
    at(
      34,
      29,
      motion('pulse', [
        svg`<circle r="17" fill=${C.cream} />`,
        svg`<path d="M0-13C1.6-4 4-1.6 13 0C4 1.6 1.6 4 0 13C-1.6 4-4 1.6-13 0C-4-1.6-1.6-4 0-13Z" fill=${C.sunDark} />`,
      ]),
    ),
  ])
}

function clothLayer(y: number, half: number, color: string, edge: string): Art {
  return [
    svg`<rect x=${-half} y=${y} width=${half * 2} height="12.5" rx="5.5" fill=${color} />`,
    svg`<path d=${`M${-half + 8} ${y + 6.2}H${half - 8}`} stroke=${edge} stroke-width="2.2" stroke-linecap="round" />`,
  ]
}

function foldedCloth(): Art {
  return part(
    'cloth',
    at(
      58,
      SHELF_TOP,
      motion('pulse', [
        clothLayer(-12.5, 31, CLOTH_DARK, CLOTH),
        clothLayer(-24, 28, CLOTH, CLOTH_DARK),
        clothLayer(-35.5, 25, C.cream, C.lilac),
      ]),
    ),
  )
}

function clouds(count: number): Art {
  return (
    [
      [162, 38, 0.86, 1],
      [38, 32, 0.92, 2],
      [70, 20, 0.6, 3],
    ] as const
  )
    .slice(0, count)
    .map(([x, y, s, d], i) => dustCloud(x, y, s, d, i))
}

function shelfDust(parts: DustParts, from = SHELF_LEFT + 2): Art {
  if (parts.step === 0) return []
  return part('dust-layer', [
    bank(from, SHELF_RIGHT - 2, SHELF_TOP + 1, heightOf(parts.step)),
    when(from === SHELF_LEFT + 2, () => hem(parts.step)),
    when(
      parts.step >= 1 && parts.step <= 2,
      () =>
        svg`<g fill=${DUST}><circle cx="30" cy=${SHELF_TOP + 8} r="1.4" /><circle cx="96" cy=${SHELF_TOP + 9} r="1.6" /><circle cx="140" cy=${SHELF_TOP + 8} r="1.3" /></g>`,
    ),
  ])
}

function objects(parts: DustParts): Art {
  return [bigFrame(parts), smallFrame(parts), vase(parts)]
}

function shelfView(parts: DustParts, tones: DusterTones): Art {
  const lean = parts.asleep ? 8 : parts.mood === 'pleading' ? -6 : parts.mood === 'sick' ? 10 : 0
  const body = duster(parts, tones, 50, true, lean)
  return [
    shadow(100, 184, 72, 0.22),
    BUNNIES.slice(0, parts.bunnies).map(([x, y, s]) => part('dust-bunny', bunny(x, y, s))),
    shelf(parts),
    when(parts.spider, web),
    when(parts.spider, () => spider(104, 170)),
    clouds(parts.clouds),
    objects(parts),
    at(DUSTER_X, SHELF_TOP, parts.shiny ? motion('sway', body) : body),
    shelfDust(parts),
    when(parts.sneeze, () => at(VASE_X, SHELF_TOP, sneezeBlast())),
    when(parts.falling, falling),
    when(parts.wish, wish),
    when(parts.asleep, () => [zed(54, 50, 0.6, 1), zed(40, 35, 0.86, 2), zed(22, 22, 0.56, 3)]),
    when(parts.shiny, () => [
      sparkle(26, 34, 1.3, 1),
      sparkle(178, 34, 0.9, 2),
      sparkle(62, 40, 0.8, 3),
      sparkle(30, 160, 0.9, 4),
      sparkle(172, 160, 1.1, 5),
    ]),
  ]
}

function sweepView(parts: DustParts, tones: DusterTones): Art {
  return [
    shadow(100, 184, 72, 0.22),
    shelf(parts),
    when(parts.spider, web),
    when(parts.spider, () => spider(104, 170)),
    objects({ ...parts, step: 1 }),
    shelfDust(parts, 96),
    part('sweep-trail', [
      svg`<rect x="22" y=${SHELF_TOP + 1} width="64" height="2.6" rx="1.3" fill="#fff" opacity=".8" />`,
    ]),
    at(182, 180, motion('wobble', at(0, 0, duster(parts, tones, 100, false, 0, 48), -50))),
    puff(34, 62, 15, 1, 'drift'),
    puff(58, 28, 11, 2, 'rise'),
    puff(26, 112, 9, 3, 'rise'),
    puff(112, 40, 9, 4, 'drift'),
    puff(146, 22, 6.5, 5, 'rise'),
    puff(76, 152, 7, 2, 'fall'),
    puff(42, 158, 5, 4, 'fall'),
    clouds(parts.clouds),
  ]
}

function clothView(parts: DustParts, tones: DusterTones): Art {
  return [
    shadow(100, 184, 72, 0.22),
    shelf(parts),
    when(parts.spider, web),
    when(parts.spider, () => spider(104, 170)),
    objects(parts),
    at(DUSTER_X, SHELF_TOP, duster(parts, tones, 50, true, -5)),
    shelfDust(parts),
    foldedCloth(),
    clouds(parts.clouds),
  ]
}

export function dust(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = dustParts(scene)
  const tones = tonesOf(scene, parts)
  const views: Record<DustView, (parts: DustParts, tones: DusterTones) => Art> = {
    shelf: shelfView,
    sweep: sweepView,
    cloth: clothView,
  }
  return frame('dust', scene, options, views[parts.view](parts, tones))
}
