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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type CallView = 'desk' | 'talk' | 'offhook' | 'love'
type Handset = 'cradle' | 'lifted' | 'gone'

export interface CallParts {
  view: CallView
  dots: number
  ringing: boolean
  asleep: boolean
  tear: boolean
  webs: number
  spider: boolean
  flower: number
  cloud: number
  fade: number
  hearts: number
  mood: Mood
}

export const MAX_DOTS = 9

const WEB_AT = [0.08, 0.45] as const
const SPIDER_AT = 0.3
const FLOWER_AT = [0.25, 0.7] as const
const CLOUD_AT = [0.5, 0.85] as const
const FADE_AT = [0.08, 0.25, 0.5, 0.85] as const
const SICK_AT = 0.6

const QUIET = {
  dots: 0,
  ringing: false,
  asleep: false,
  tear: false,
  webs: 0,
  spider: false,
  flower: 0,
  cloud: 0,
  fade: 0,
  hearts: 0,
} as const

export function callParts(scene: SceneView): CallParts {
  const { state } = scene
  if (state === 'clean') return { ...QUIET, view: 'love', mood: 'happy' }
  const fill = clamp01(scene.fill)
  const stink = clamp01(scene.stink)
  const neglect = {
    webs: reached(stink, WEB_AT),
    spider: stink >= SPIDER_AT,
    flower: reached(stink, FLOWER_AT),
    cloud: reached(stink, CLOUD_AT),
    fade: reached(stink, FADE_AT) / FADE_AT.length,
  }
  const sick = stink >= SICK_AT
  if (state === 'running') {
    const hearts = 1 + Math.min(2, Math.floor(clamp01(scene.progress) * 3))
    return {
      ...QUIET,
      view: 'talk',
      ringing: true,
      webs: Math.min(1, neglect.webs),
      fade: neglect.fade * 0.4,
      hearts,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return { ...QUIET, ...neglect, view: 'offhook', mood: sick ? 'sick' : 'calm' }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const dots = due ? MAX_DOTS : resting ? 0 : Math.min(MAX_DOTS - 1, Math.ceil(fill * 8))
  let mood: Mood = resting ? 'sleepy' : dots >= 5 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...neglect,
    view: 'desk',
    dots,
    ringing: due,
    asleep: resting,
    tear: due && !sick,
    mood,
  }
}

const HANDSET =
  'M-58-16H58C74-16 80-6 80 8V20Q80 28 72 28H46Q38 28 38 20V16Q38 10 31 10H-31Q-38 10-38 16V20Q-38 28-46 28H-72Q-80 28-80 20V8C-80-6-74-16-58-16Z'
const BODY =
  'M72 88H128C148 88 157 104 163 130L172 165Q175 178 162 178H38Q25 178 28 165L37 130C43 104 52 88 72 88Z'
const CRADLE = 'M66 98V70Q66 65 71 65H81Q86 65 86 70V80H114V70Q114 65 119 65H129Q134 65 134 70V98Z'
const HEART = 'M0 11C-5 6-13 1-13-5A7 7 0 0 1 0-8A7 7 0 0 1 13-5C13 1 5 6 0 11Z'
const BASE = 181

const DIAL_X = 100
const DIAL_Y = 132
const WEB = '#e6ebf5'
const DUSTY = '#8f8c86'
const SKIN = '#ffcfa8'
const DOT_SPOTS = [
  [146, 46, 1.05],
  [58, 38, 1],
  [100, 25, 1.15],
  [172, 64, 0.9],
  [28, 62, 0.95],
  [122, 54, 0.8],
  [80, 54, 0.78],
  [181, 124, 0.8],
  [17, 128, 0.86],
] as const

function heart(x: number, y: number, color: string, size = 1, rotate = 0): Art {
  return part('heart', at(x, y, svg`<path d=${HEART} fill=${color} />`, rotate, size))
}

function handset(accent: string): Art {
  const dark = shadeOf(accent)
  return part('handset', [
    svg`<path d=${HANDSET} fill=${accent} />`,
    svg`<rect x="-76" y="21" width="34" height="7" rx="3.5" fill=${dark} /><rect x="42" y="21" width="34" height="7" rx="3.5" fill=${dark} />`,
    svg`<path d="M-66-7H-22M22-7H34" stroke=${tintOf(accent)} stroke-width="4.5" stroke-linecap="round" />`,
    svg`<circle cy="-3" r="12" fill=${C.cream} />`,
    heart(0, -2.5, C.coral, 0.62),
  ])
}

function coil(
  from: readonly [number, number],
  via: readonly [number, number],
  to: readonly [number, number],
  loops: number,
  size: number,
): string {
  const steps = loops * 12
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps
    const u = 1 - t
    const x = u * u * from[0] + 2 * u * t * via[0] + t * t * to[0]
    const y = u * u * from[1] + 2 * u * t * via[1] + t * t * to[1]
    const dx = 2 * u * (via[0] - from[0]) + 2 * t * (to[0] - via[0])
    const dy = 2 * u * (via[1] - from[1]) + 2 * t * (to[1] - via[1])
    const length = Math.hypot(dx, dy) || 1
    const phase = t * loops * Math.PI * 2
    const along = Math.cos(phase) * size * 0.75
    const across = Math.sin(phase) * size
    const px = x + (dx / length) * along - (dy / length) * across
    const py = y + (dy / length) * along + (dx / length) * across
    return `${i ? 'L' : 'M'}${round(px)} ${round(py)}`
  })
  return points.join('')
}

function cord(
  from: readonly [number, number],
  via: readonly [number, number],
  to: readonly [number, number],
  color: string,
  loops = 11,
): Art {
  return part(
    'cord',
    svg`<path d=${coil(from, via, to, loops, 4.4)} fill="none" stroke=${color} stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />`,
  )
}

function dial(accent: string, mood: Mood, spinning: boolean): Art {
  const holes = Array.from({ length: 10 }, (_, i) => {
    const angle = ((78 + i * 30.5) * Math.PI) / 180
    return svg`<circle cx=${round(Math.cos(angle) * 30)} cy=${round(Math.sin(angle) * 30)} r="4.4" fill=${C.cream} />`
  })
  const ring = spinning ? motion('slosh', holes) : holes
  return part(
    'dial',
    at(DIAL_X, DIAL_Y, [
      svg`<circle r="38" fill=${shadeOf(accent, 0.34)} />`,
      ring,
      svg`<path d="M23 18L34 28" stroke=${C.metal} stroke-width="4.5" stroke-linecap="round" />`,
      svg`<circle r="23.5" fill=${C.cream} />`,
      face(0, -1, mood, INK, 0.98),
    ]),
  )
}

function web(angles: readonly number[], lengths: readonly number[]): Art {
  const tips = angles.map((deg, i) => {
    const a = (deg * Math.PI) / 180
    const length = lengths[i] ?? 40
    return [Math.cos(a) * length, Math.sin(a) * length] as const
  })
  const ring = (k: number): string =>
    tips
      .map(([x, y], i) => {
        const px = round(x * k)
        const py = round(y * k)
        if (i === 0) return `M${px} ${py}`
        const prev = tips[i - 1] ?? [x, y]
        return `Q${round(((x + prev[0]) / 2) * k * 0.82)} ${round(((y + prev[1]) / 2) * k * 0.82)} ${px} ${py}`
      })
      .join('')
  return svg`<g fill="none" stroke=${WEB} stroke-width="2.2" stroke-linecap="round" opacity=".92">
    ${tips.map(([x, y]) => svg`<path d=${`M0 0L${round(x)} ${round(y)}`} />`)}
    ${[0.4, 0.7, 1].map((k) => svg`<path d=${ring(k)} />`)}
  </g>`
}

function looseWebs(count: number): Art {
  return part('cobweb', [
    when(count >= 1, () => at(61, 92, web([172, 196, 220, 244], [40, 44, 44, 42]))),
    when(count >= 2, () => at(139, 92, web([8, -16, -40, -64], [26, 30, 30, 26]))),
  ])
}

function neckWeb(): Art {
  return part('cobweb', at(62, 94, web([179, 160, 142, 124], [36, 40, 42, 40])))
}

function receiverWeb(): Art {
  return part('cobweb', at(21, 52, web([2, 28, 54, 80], [46, 42, 42, 44])))
}

function spider(): Art {
  return part('spider', [
    at(
      36,
      94,
      motion(
        'sway',
        at(0, 30, [
          svg`<path d="M0-30V0" stroke=${WEB} stroke-width="1.6" />`,
          svg`<path d="M-9-5L-5-1M-10 1L-5 1M-9 7L-5 3M9-5L5-1M10 1L5 1M9 7L5 3" stroke=${C.fly} stroke-width="1.8" stroke-linecap="round" />`,
          svg`<circle r="6.5" fill=${C.fly} />`,
          svg`<circle cx="-2.4" cy="-1" r="1.6" fill="#fff" /><circle cx="2.4" cy="-1" r="1.6" fill="#fff" />`,
        ]),
      ),
    ),
  ])
}

function phone(accent: string, mood: Mood, set: Handset, parts: CallParts): Art {
  const color = mix(accent, DUSTY, parts.fade * 0.5)
  const dark = shadeOf(color)
  const light = tintOf(color)
  const hookOff = set !== 'cradle'
  const start: readonly [number, number] = set === 'lifted' ? [166, 86] : [168, 92]
  return part('phone', [
    svg`<rect x="42" y="174" width="22" height="9" rx="3" fill=${shadeOf(color, 0.5)} /><rect x="136" y="174" width="22" height="9" rx="3" fill=${shadeOf(color, 0.5)} />`,
    when(hookOff, () => looseWebs(parts.webs)),
    when(set !== 'gone', () => cord(start, [204, 132], [166, 160], dark)),
    when(hookOff, () =>
      part(
        'hook-switch',
        svg`<rect x="93" y="70" width="14" height="14" rx="4" fill=${C.metal} />`,
      ),
    ),
    svg`<path d=${CRADLE} fill=${dark} />`,
    svg`<path d=${BODY} fill=${color} />`,
    svg`<path d="M28 165Q25 178 38 178H162Q175 178 172 165L170 158H30Z" fill=${dark} />`,
    svg`<path d="M72 96C60 97 53 106 49 120" fill="none" stroke=${light} stroke-width="5.5" stroke-linecap="round" />`,
    dial(color, mood, set === 'lifted'),
    when(set === 'cradle' && parts.webs >= 1, neckWeb),
    when(set === 'cradle' && parts.spider, spider),
    when(set === 'cradle', () => at(100, 66, handset(color))),
    when(set === 'cradle' && parts.webs >= 2, receiverWeb),
    when(set === 'lifted', () => at(100, 54, motion('slosh', at(0, 0, handset(color), -5)))),
  ])
}

function posed(x: number, scale: number, art: Art): Art {
  return at(x, BASE, at(-100, -BASE, art), 0, scale)
}

function missed(x: number, y: number, size: number, index: number, latest: boolean): Art {
  const dot = [
    svg`<circle r="9" fill=${C.coral} />`,
    svg`<path d="M4.5-4.5L-3.5 3.5M-3.5-2V3.5H2" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`,
  ]
  return part('missed', at(x, y, latest ? motion('pulse', dot) : dot, 0, size), index)
}

function arcs(side: number, color: string, delay: number): Art {
  return motion(
    'flicker',
    svg`<g transform=${`scale(${side} 1)`} fill="none" stroke=${color} stroke-width="4.5" stroke-linecap="round"><path d="M0-9Q6 0 0 9" /><path d="M9-15Q19 0 9 15" /></g>`,
    delay,
  )
}

function ringMarks(y: number, color: string): Art {
  return part('ring', [at(26, y, arcs(-1, color, 1)), at(174, y, arcs(1, color, 2))])
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'drift',
      at(
        0,
        0,
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        0,
        size,
      ),
      delay,
    ),
  )
}

function night(dreaming: boolean): Art {
  return [
    part(
      'moon',
      at(
        44,
        46,
        [
          svg`<path d="M6-20A21 21 0 1 0 20 12A17 17 0 0 1 6-20Z" fill=${C.spark} />`,
          svg`<circle cx="30" cy="-18" r="2.4" fill=${C.spark} /><circle cx="-24" cy="-24" r="1.8" fill=${C.spark} />`,
        ],
        -8,
      ),
    ),
    when(dreaming, () =>
      part('zzz', [zed(136, 56, 0.7, 1), zed(154, 38, 1, 2), zed(174, 24, 0.62, 3)]),
    ),
  ]
}

function wilted(stage: number): Art {
  const dead = stage >= 2
  const stem = dead ? '#7f6a35' : C.leafDark
  const petal = dead ? '#8d6d4f' : mix(C.pink, '#a98a6b', 0.35)
  const petals = dead ? [150, 215] : [60, 110, 160, 210, 260, 310]
  return part('wilted-flower', [
    shadow(30, 184, 16, 0.24),
    at(30, 184, [
      svg`<path d="M0-26C2-50-3-62-13-57" fill="none" stroke=${stem} stroke-width="3.6" stroke-linecap="round" />`,
      svg`<path d="M0-38C5-44 9-44 12-40C8-36 4-36 0-38Z" fill=${stem} />`,
      at(-14, -53, [
        petals.map(
          (a) =>
            svg`<ellipse cy="-8.5" rx="4.2" ry="6.6" transform=${`rotate(${a})`} fill=${petal} />`,
        ),
        svg`<circle r="5" fill=${dead ? '#6d4f28' : C.sunDark} />`,
      ]),
      svg`<path d="M-11-26H11L8-3Q7.5 0 5 0H-5Q-7.5 0-8-3Z" fill=${C.lilac} />`,
      svg`<rect x="-13" y="-30" width="26" height="7" rx="3.5" fill=${C.lilacDark} />`,
    ]),
    at(50, 184, svg`<ellipse rx="5" ry="2.6" transform="rotate(-12)" fill=${petal} />`),
    when(dead, () =>
      at(14, 182, svg`<ellipse rx="5" ry="2.6" transform="rotate(14)" fill=${petal} />`),
    ),
  ])
}

function sadCloud(x: number, y: number, stage: number): Art {
  const body = stage >= 2 ? '#7c839c' : '#98a2bd'
  const line = stage >= 2 ? '#454b63' : '#58607c'
  return part('sad-cloud', [
    at(
      x,
      y,
      motion('drift', [
        svg`<g fill=${body}><circle cx="-15" cy="4" r="12" /><circle cx="3" cy="-5" r="16" /><circle cx="19" cy="5" r="11" /><rect x="-26" y="3" width="54" height="13" rx="6.5" /></g>`,
        svg`<circle cx="-5" cy="1" r="2.2" fill=${line} /><circle cx="11" cy="1" r="2.2" fill=${line} />`,
        svg`<path d="M-2 10q5-5 10 0" fill="none" stroke=${line} stroke-width="2.6" stroke-linecap="round" />`,
      ]),
    ),
    when(stage >= 2, () =>
      [
        [-14, 28, 1],
        [3, 32, 2],
        [19, 27, 3],
      ].map(([dx = 0, dy = 0, d = 1]) =>
        at(x + dx, y + dy, motion('fall', drop(0, 0, C.water, 0.72), d)),
      ),
    ),
  ])
}

function desk(parts: CallParts, accent: string): Art {
  const seated = posed(100, 0.84, phone(accent, parts.mood, 'cradle', parts))
  const shown = DOT_SPOTS.slice(0, parts.dots)
  const cloudOn = parts.cloud > 0
  const visible = shown.filter(([x, y]) => {
    if (cloudOn && x >= 126 && y <= 90) return false
    return !(parts.flower > 0 && x < 30 && y > 90)
  })
  return [
    when(parts.asleep, () => night(!cloudOn)),
    shadow(100, 184, 76),
    part('body', parts.ringing ? at(100, BASE, motion('sway', at(-100, -BASE, seated))) : seated),
    when(parts.flower > 0, () => wilted(parts.flower)),
    visible.map(([x, y, s], i) => missed(x, y, s, i, i === visible.length - 1 && !cloudOn)),
    when(parts.ringing, () => ringMarks(92, C.cream)),
    when(parts.tear, () => at(114, 151, motion('drip', drop(0, 0, C.water, 0.62), 2))),
    when(cloudOn, () => sadCloud(150, 34, parts.cloud)),
  ]
}

function bubbleShape(w: number, h: number, tail: number, color: string): Art {
  const halfW = w / 2
  const halfH = h / 2
  return svg`<path d=${`M${-halfW + 14} ${-halfH}H${halfW - 14}Q${halfW} ${-halfH} ${halfW} ${-halfH + 14}V${halfH - 14}Q${halfW} ${halfH} ${halfW - 14} ${halfH}H${tail * 16 + 8}L${tail * 22} ${halfH + 15}L${tail * 16 - 8} ${halfH}H${-halfW + 14}Q${-halfW} ${halfH} ${-halfW} ${halfH - 14}V${-halfH + 14}Q${-halfW} ${-halfH} ${-halfW + 14} ${-halfH}Z`} fill=${color} />`
}

function chatBubbles(hearts: number): Art {
  const row = Array.from({ length: hearts }, (_, i) => (i - (hearts - 1) / 2) * 20)
  const size = hearts === 1 ? 1.5 : hearts === 2 ? 1.05 : 0.72
  return part('chat', [
    at(
      52,
      38,
      motion(
        'bob',
        [bubbleShape(70, 44, 1, C.cream), row.map((x) => heart(x, 0, C.coral, size))],
        1,
      ),
    ),
    at(
      150,
      40,
      motion(
        'bob',
        [
          bubbleShape(64, 40, -1, C.pink),
          [-15, 0, 15].map((x, i) =>
            at(x, 0, motion('pulse', svg`<circle r="5" fill="#fff" />`, i + 1)),
          ),
        ],
        3,
      ),
    ),
  ])
}

function talk(parts: CallParts, accent: string): Art {
  return [
    shadow(100, 184, 76),
    part('body', motion('rumble', posed(100, 0.84, phone(accent, parts.mood, 'lifted', parts)))),
    chatBubbles(parts.hearts),
    ringMarks(100, C.cream),
    at(30, 150, motion('rise', heart(0, 0, C.pink, 0.8), 2)),
    at(180, 160, motion('rise', heart(0, 0, C.coral, 0.65), 4)),
  ]
}

function note(): Art {
  return part(
    'call-back-note',
    at(
      146,
      54,
      motion('sway', [
        svg`<rect x="-34" y="-32" width="68" height="66" rx="5" fill=${C.cream} />`,
        svg`<path d="M34 16V29Q34 34 29 34H16Z" fill=${C.creamDark} />`,
        svg`<rect x="-13" y="-38" width="26" height="11" rx="2.5" fill=${C.sky} opacity=".9" />`,
        at(
          -11,
          -11,
          [
            svg`<path d="M-17-5H17Q21-5 21 0V5Q21 8 18 8H11Q8 8 8 5V3H-8V5Q-8 8-11 8H-18Q-21 8-21 5V0Q-21-5-17-5Z" fill=${C.coral} />`,
          ],
          0,
          0.84,
        ),
        svg`<path d="M26-17A10 10 0 1 1 18-22" fill="none" stroke=${C.skyDark} stroke-width="3.6" stroke-linecap="round" /><path d="M13-27L19-22L13-17" fill="none" stroke=${C.skyDark} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
        svg`<path d="M-24 12H24M-24 23H6" stroke=${C.creamDark} stroke-width="4.5" stroke-linecap="round" />`,
        heart(19, 23, C.coral, 0.46),
      ]),
      5,
    ),
  )
}

function hopeBubble(): Art {
  return part(
    'hope',
    at(
      56,
      56,
      motion('bob', [
        bubbleShape(66, 44, 0.7, C.cream),
        at(
          0,
          0,
          svg`<path d=${HEART} fill="none" stroke=${C.coral} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 5" />`,
          0,
          1.15,
        ),
      ]),
    ),
  )
}

function offhook(parts: CallParts, accent: string): Art {
  const color = mix(accent, DUSTY, parts.fade * 0.5)
  return [
    shadow(72, 184, 56),
    shadow(152, 184, 42, 0.24),
    note(),
    part('body', posed(72, 0.74, phone(accent, parts.mood, 'gone', parts))),
    cord([112, 130], [146, 116], [138, 160], color, 8),
    part('handset-off', at(150, 170, handset(color), 6, 0.54)),
    part('beep', at(178, 148, at(0, 0, arcs(1, C.cream, 1), -62, 0.62))),
    when(parts.flower > 0, () => wilted(parts.flower)),
    parts.cloud > 0 ? sadCloud(56, 40, parts.cloud) : hopeBubble(),
  ]
}

function person(x: number, y: number, size: number, body: string, hair: string): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-12 22V12A12 12 0 0 1 12 12V22Z" fill=${body} />`,
      svg`<circle r="9" fill=${SKIN} />`,
      svg`<path d="M-9-1A9 9 0 0 1 9-1Q0-7-9-1Z" fill=${hair} />`,
    ],
    0,
    size,
  )
}

function familyPicture(): Art {
  return part(
    'family-picture',
    at(
      56,
      46,
      motion('sway', [
        svg`<path d="M-11-30L0-40L11-30" fill="none" stroke=${C.creamDark} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`,
        svg`<rect x="-38" y="-31" width="76" height="62" rx="7" fill=${C.wicker} />`,
        svg`<rect x="-33" y="-26" width="66" height="52" rx="3.5" fill=${C.wickerDark} />`,
        svg`<rect x="-31" y="-24" width="62" height="48" rx="2.5" fill="#bfe6ff" />`,
        svg`<path d="M-31 24V10Q-14 3 0 9T31 8V24Z" fill=${C.leaf} />`,
        person(-14, -7, 1, C.sky, C.soil),
        person(14, -9, 1, C.lilac, C.sunDark),
        person(0, 5, 0.72, C.sun, C.terracottaDark),
        heart(0, -16, C.coral, 0.42),
        svg`<rect x="-31" y="20" width="62" height="4" fill=${C.leafDark} />`,
      ]),
      -4,
    ),
  )
}

function love(parts: CallParts, accent: string): Art {
  return [
    shadow(100, 184, 76),
    familyPicture(),
    part('body', posed(100, 0.84, phone(accent, parts.mood, 'cradle', parts))),
    at(146, 42, motion('throb', heart(0, 0, C.coral, 2.5), 1)),
    at(182, 80, motion('throb', heart(0, 0, C.pink, 1.15, 12), 2)),
    at(112, 22, motion('throb', heart(0, 0, C.pink, 0.8, -14), 3)),
    at(22, 108, motion('throb', heart(0, 0, C.coral, 0.85, -14), 4)),
    sparkle(182, 28, 1, 1),
    sparkle(18, 142, 0.95, 2),
    sparkle(180, 132, 1.1, 3),
    sparkle(108, 52, 0.55, 4),
  ]
}

export function call(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = callParts(scene)
  const accent = accentOf(scene, C.sun)
  const views: Record<CallView, (parts: CallParts, accent: string) => Art> = {
    desk,
    talk,
    offhook,
    love,
  }
  return frame('call', scene, options, views[parts.view](parts, accent))
}
