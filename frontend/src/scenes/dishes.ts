import { svg } from 'lit'
import type { TemplateResult } from 'lit'

import type { SceneView } from '../types.ts'
import {
  accentOf,
  at,
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
  shadeOf,
  shadow,
  sparkle,
  stenchLines,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'
import { bubble, cloud } from './laundry.ts'

export type DishesView = 'sink' | 'washing' | 'rack'

export interface DishesParts {
  view: DishesView
  stack: number
  teeter: boolean
  crust: number
  mould: number
  stench: number
  flies: number
  cloud: number
  drip: boolean
  wet: boolean
  towel: boolean
  mood: Mood
}

export const MAX_STACK = 6

const STENCH_AT = [0.05, 0.3, 0.55] as const
const CRUST_AT = [0.02, 0.25, 0.5] as const
const MOULD_AT = [0.3, 0.6, 0.85] as const
const FLIES_AT = [0.4, 0.7, 0.92] as const
const CLOUD_AT = [0.02, 0.4, 0.75] as const
const WET_FLIES_AT = [0.65, 0.9] as const

export function dishesParts(scene: SceneView): DishesParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const base = {
    stack: 0,
    teeter: false,
    crust: 0,
    mould: 0,
    stench: 0,
    flies: 0,
    cloud: 0,
    drip: false,
    wet: false,
    towel: false,
  }
  if (state === 'clean') return { ...base, view: 'rack', towel: true, mood: 'happy' }
  if (state === 'running') {
    return {
      ...base,
      view: 'washing',
      crust: reached(stink, CRUST_AT),
      stench: reached(stink, STENCH_AT),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    const clouds = reached(stink, CLOUD_AT)
    return {
      ...base,
      view: 'rack',
      wet: true,
      cloud: clouds,
      flies: reached(stink, WET_FLIES_AT),
      mood: clouds >= 2 ? 'sick' : 'calm',
    }
  }
  const teeter = state === 'due'
  let stack = 0
  if (teeter) stack = MAX_STACK
  else if (state === 'accumulating') stack = Math.min(MAX_STACK - 1, 1 + Math.floor(fill * 5))
  const flies = reached(stink, FLIES_AT)
  let mood: Mood = state === 'resting' ? 'sleepy' : stack >= 4 ? 'worried' : 'calm'
  if (teeter) mood = 'pleading'
  if (flies > 0) mood = 'sick'
  return {
    ...base,
    view: 'sink',
    stack,
    teeter,
    crust: reached(stink, CRUST_AT),
    mould: reached(stink, MOULD_AT),
    stench: reached(stink, STENCH_AT),
    flies,
    drip: state === 'resting',
    mood,
  }
}

const SINK_X = 84
const SINK_Y = 107
const SPOUT_X = 118
const FACE_INK = '#124d39'
const SAUCE = '#a5472d'
const SAUCE_DARK = '#7c3120'
const FOAM = '#f4fbff'
const FOAM_SHADE = '#cfeaf9'
const GRIME = '#c2a878'

function plate(x: number, y: number, w: number, rim: string, dirt: number, tilt = 0): Art {
  const body = mix(C.cream, GRIME, (dirt / 3) * 0.75)
  const under = mix(rim, GRIME, (dirt / 3) * 0.7)
  return at(
    x,
    y,
    [
      svg`<path d=${`M${-w + 3}-6H${w - 3}L${w - 11} 0H${-w + 11}Z`} fill=${under} />`,
      svg`<rect x=${-w} y="-9" width=${2 * w} height="5.5" rx="2.75" fill=${body} />`,
    ],
    tilt,
  )
}

function pan(x: number, y: number, dirt: number): Art {
  const body = mix(C.terracotta, '#6e4a2e', dirt / 3)
  const rim = mix(C.terracottaDark, '#553722', dirt / 3)
  return at(x, y, [
    svg`<path d="M-3-10L-40-20" stroke=${C.wicker} stroke-width="7" stroke-linecap="round" />`,
    svg`<path d="M-24-12H24L21-3Q20 0 16 0H-16Q-20 0-21-3Z" fill=${body} />`,
    svg`<rect x="-26" y="-15" width="52" height="5" rx="2.5" fill=${rim} />`,
  ])
}

function bowl(x: number, y: number, tilt = 0): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-24-12H24C24-4 14 0 8 0H-8C-14 0-24-4-24-12Z" fill=${C.sun} />`,
      svg`<rect x="-26" y="-15" width="52" height="5.5" rx="2.75" fill=${C.sunDark} />`,
      svg`<path d="M-15-7q6 3 11 3" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5" />`,
    ],
    tilt,
  )
}

function mug(x: number, y: number, color: string, shade: string, tilt = 0, scale = 1): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M10-15h3a6 6 0 0 1 0 12h-3" fill="none" stroke=${shade} stroke-width="4" />`,
      svg`<path d="M-11-19H11V-5Q11 0 6 0H-6Q-11 0-11-5Z" fill=${color} />`,
      svg`<rect x="-12" y="-21" width="24" height="4.5" rx="2.25" fill=${shade} />`,
    ],
    tilt,
    scale,
  )
}

function sauce(x: number, y: number, scale = 1): Art {
  return at(
    x,
    y,
    [
      svg`<path d="M-11-2Q0-5 11-2C12 3 8 3 7 5S4 12 2 11 0 5-2 6-5 9-7 7-12 3-11-2Z" fill=${SAUCE} />`,
      svg`<circle cx="4" cy="1" r="1.8" fill=${SAUCE_DARK} />`,
    ],
    0,
    scale,
  )
}

function sauceOn(crust: number, step: number, spots: ReadonlyArray<readonly number[]>): Art {
  return spots
    .filter(([level = 1]) => crust >= level)
    .map(([, x = 0, y = 0, scale = 1]) => part('crust', sauce(x, y, scale), step))
}

function towerBase(parts: DishesParts): Art {
  const { stack, crust } = parts
  const x = SINK_X
  const tiers: ReadonlyArray<readonly [number, Art]> = [
    [
      1,
      [
        plate(x, 110, 32, C.sky, crust),
        plate(x + 2, 102, 32, C.skyDark, crust),
        plate(x - 1, 94, 32, C.sky, crust),
        sauceOn(crust, 1, [
          [1, x + 19, 87, 0.75],
          [3, x - 20, 95, 0.7],
        ]),
      ],
    ],
    [2, [pan(x + 1, 87, crust), sauceOn(crust, 2, [[2, x - 10, 74, 0.7]])]],
    [3, [bowl(x - 2, 72), sauceOn(crust, 3, [[1, x + 8, 59, 0.8]])]],
    [
      4,
      [
        plate(x + 1, 59, 25, C.lilac, crust),
        plate(x - 2, 51, 25, C.lilacDark, crust),
        sauceOn(crust, 4, [[2, x - 12, 44, 0.65]]),
      ],
    ],
    [5, [part('side-mug', mug(124, 110, C.coral, C.coralDark))]],
  ]
  return tiers.filter(([min]) => stack >= min).map(([min, art]) => part('stack-step', art, min))
}

function towerTop(parts: DishesParts): Art {
  const x = SINK_X
  const pieces: Art = [
    plate(x + 4, 44, 22, C.pink, parts.crust, 5),
    mug(x + 7, 36, C.sky, C.skyDark, -8, 0.82),
    sauceOn(parts.crust, 6, [[1, x + 19, 37, 0.55]]),
  ]
  return part('stack-step', at(x, 46, motion('wobble', at(-x, -46, pieces))), MAX_STACK)
}

function shakes(): Art {
  return part(
    'teeter',
    (
      [
        [58, 20, 'M0 0q-6 9 0 18', 1],
        [46, 26, 'M0 0q-5 7 0 14', 2],
        [118, 16, 'M0 0q6 9 0 18', 1],
        [130, 20, 'M0 0q5 7 0 14', 2],
      ] as const
    ).map(([sx, y, d, delay]) =>
      at(
        sx,
        y,
        motion(
          'flicker',
          svg`<path d=${d} fill="none" stroke="#e6d9ff" stroke-width="3.6" stroke-linecap="round" />`,
          delay,
        ),
      ),
    ),
  )
}

function mouldyCup(level: number): Art {
  const x = 41
  return part('mouldy-cup', [
    when(level >= 3, () =>
      part('mushroom', [
        at(x - 7, 86, [
          svg`<rect x="-2" y="-12" width="4" height="13" rx="2" fill=${C.cream} />`,
          svg`<path d="M-9-11A9 8 0 0 1 9-11Z" fill=${C.coral} />`,
          svg`<circle cx="-3" cy="-14" r="1.6" fill=${C.cream} /><circle cx="3" cy="-15" r="1.3" fill=${C.cream} />`,
        ]),
      ]),
    ),
    svg`<path d="M-13-16h-3a6 6 0 0 0 0 12h3" transform=${`translate(${x} 110)`} fill="none" stroke=${C.mustyDark} stroke-width="4" />`,
    at(x, 110, [
      svg`<path d="M-13-23H13V-5Q13 0 8 0H-8Q-13 0-13-5Z" fill=${C.musty} />`,
      svg`<circle cx="-4" cy="-14" r="3" fill=${C.mustyDark} /><circle cx="6" cy="-9" r="2.2" fill=${C.mustyDark} />`,
    ]),
    at(x, 87, [
      svg`<g fill=${C.stench}><circle cx="-9" cy="-1" r="6" /><circle cx="0" cy="-3" r="7" /><circle cx="9" cy="-1" r="6" /><rect x="-14" y="-2" width="28" height="6" rx="3" /></g>`,
      when(level >= 2, () => [
        svg`<circle cx="-11" cy="7" r="3.2" fill=${C.stench} /><rect x="-13.5" y="2" width="5" height="12" rx="2.5" fill=${C.stench} />`,
        svg`<rect x="7" y="2" width="4.6" height="9" rx="2.3" fill=${C.stench} />`,
        svg`<circle cx="-2" cy="-7" r="5" fill=${C.leafDark} /><circle cx="7" cy="-5" r="3.2" fill=${C.leafDark} />`,
      ]),
    ]),
  ])
}

function tap(): Art {
  return part('tap', [
    svg`<path d=${`M150 104V60a16 16 0 0 0-32 0V68`} fill="none" stroke=${C.metalMid} stroke-width="10" stroke-linecap="round" />`,
    svg`<path d="M146.6 70V60a12.6 12.6 0 0 0-8-11.7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".7" />`,
    svg`<rect x=${SPOUT_X - 8} y="66" width="16" height="8" rx="3" fill=${C.metalDark} />`,
    svg`<rect x="141" y="96" width="18" height="11" rx="3" fill=${C.metalDark} />`,
    svg`<path d="M157 90L173 82" stroke=${C.metalMid} stroke-width="6" stroke-linecap="round" />`,
    svg`<circle cx="152" cy="91" r="7" fill=${C.metalDark} />`,
    svg`<circle cx="174" cy="81.5" r="4.5" fill=${C.coral} />`,
  ])
}

function sinkHole(): Art {
  return part('sink', [
    svg`<ellipse cx=${SINK_X} cy=${SINK_Y} rx="56" ry="10" fill=${C.metalMid} />`,
    svg`<ellipse cx=${SINK_X} cy=${SINK_Y} rx="50" ry="7" fill="#59648a" />`,
  ])
}

interface Cabinet {
  body: string
  shade: string
  ink: string
}

function cabinetOf(scene: SceneView): Cabinet {
  const body = accentOf(scene, C.mint)
  return body === C.mint
    ? { body, shade: C.mintDark, ink: FACE_INK }
    : { body, shade: shadeOf(body), ink: shadeOf(body, 0.8) }
}

function counter(parts: DishesParts, stinkTint: number, cabinet: Cabinet): Art {
  const body = mix(cabinet.body, C.musty, stinkTint)
  const shade = mix(cabinet.shade, C.mustyDark, stinkTint)
  return [
    svg`<rect x="38" y="172" width="18" height="10" rx="3" fill=${C.metalDark} /><rect x="144" y="172" width="18" height="10" rx="3" fill=${C.metalDark} />`,
    part('cabinet', [
      svg`<rect x="24" y="116" width="152" height="60" rx="9" fill=${body} />`,
      svg`<rect x="84" y="124" width="32" height="6.5" rx="3.25" fill=${shade} />`,
      svg`<path d="M24 136H176" stroke=${shade} stroke-width="3" />`,
    ]),
    part('counter', [
      svg`<rect x="12" y="105" width="176" height="15" rx="7" fill=${C.cream} />`,
      svg`<path d="M20 116.5H180" stroke=${C.creamDark} stroke-width="3" stroke-linecap="round" />`,
    ]),
    face(100, 157, parts.mood, cabinet.ink, 1.05),
  ]
}

function counterStains(crust: number): Art {
  return (
    [
      [1, 26, 106, 0.7],
      [2, 170, 106, 0.6],
      [3, 104, 107, 0.8],
    ] as const
  )
    .filter(([level]) => crust >= level)
    .map(([, x, y, scale]) => part('crust', sauce(x, y, scale)))
}

function zzz(): Art {
  const z = 'M-6-6H6L-6 6H6'
  return part(
    'zzz',
    (
      [
        [76, 84, 0.65, 1],
        [60, 64, 0.95, 2],
        [40, 40, 1.3, 3],
      ] as const
    ).map(([x, y, s, delay]) =>
      at(
        x,
        y,
        motion(
          'drift',
          svg`<path d=${z} fill="none" stroke=${C.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
          delay,
        ),
        0,
        s,
      ),
    ),
  )
}

function sinkView(parts: DishesParts, stinkTint: number, cabinet: Cabinet): Art {
  const lines: Array<readonly [number, number]> = [
    [20, 98],
    [178, 76],
    [38, 58],
  ]
  const flySpots: Array<readonly [number, number]> = [
    [22, 34],
    [138, 26],
    [172, 22],
  ]
  return [
    shadow(100, 183, 80),
    tap(),
    sinkHole(),
    when(parts.drip, () =>
      part('tap-drop', [
        drop(SPOUT_X, 80, C.water, 0.8),
        at(SPOUT_X, 97, motion('drip', drop(0, 0, C.water, 0.8), 2)),
      ]),
    ),
    towerBase(parts),
    when(parts.mould > 0, () => mouldyCup(parts.mould)),
    when(parts.teeter, () => towerTop(parts)),
    when(parts.teeter && parts.stench < 2, shakes),
    counter(parts, stinkTint, cabinet),
    counterStains(parts.crust),
    when(parts.drip && parts.stench === 0, zzz),
    stenchLines(lines.slice(0, parts.stench)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function sponge(): Art {
  return part('sponge', [
    svg`<rect x="-20" y="-12" width="40" height="24" rx="7" fill=${C.sun} />`,
    svg`<path d="M-20-3V-5a7 7 0 0 1 7-7H13a7 7 0 0 1 7 7V-3Z" fill=${C.leafDark} />`,
    svg`<circle cx="-8" cy="5" r="2" fill=${C.sunDark} /><circle cx="3" cy="7" r="1.6" fill=${C.sunDark} /><circle cx="11" cy="3" r="2" fill=${C.sunDark} />`,
  ])
}

function facePlate(crust: number): Art {
  return part('washing-plate', [
    svg`<circle cx="74" cy="64" r="36" fill=${C.cream} />`,
    svg`<circle cx="74" cy="64" r="36" fill="none" stroke=${C.sky} stroke-width="4" />`,
    svg`<circle cx="74" cy="64" r="23" fill=${C.creamDark} opacity=".55" />`,
    (
      [
        [0, 52, 56, 1.25],
        [1, 62, 80, 0.9],
        [2, 58, 36, 0.9],
        [3, 88, 88, 0.8],
      ] as const
    )
      .filter(([level]) => crust >= level)
      .map(([, x, y, scale]) => part('crust', sauce(x, y, scale))),
  ])
}

function foam(): Art {
  const puffs = [
    [36, 100, 11],
    [52, 94, 15],
    [72, 98, 15],
    [92, 94, 14],
    [110, 98, 12],
    [126, 100, 10],
  ] as const
  return part('foam', [
    puffs.map(([x, y, r]) => svg`<circle cx=${x + 1} cy=${y + 3} r=${r} fill=${FOAM_SHADE} />`),
    puffs.map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r - 1} fill=${FOAM} />`),
  ])
}

function waterStream(): Art {
  return part('water', [
    svg`<path d=${`M${SPOUT_X - 4} 74H${SPOUT_X + 4}L${SPOUT_X + 3} 100H${SPOUT_X - 3}Z`} fill=${C.water} />`,
    motion(
      'flicker',
      svg`<path d=${`M${SPOUT_X - 1} 76V98`} stroke="#d6f2ff" stroke-width="2.4" stroke-linecap="round" />`,
    ),
    (
      [
        [130, 90, 1],
        [136, 96, 3],
        [108, 84, 2],
      ] as const
    ).map(([x, y, delay]) => at(x, y, motion('fall', drop(0, 0, C.water, 0.65), delay))),
  ])
}

function washingView(parts: DishesParts, stinkTint: number, cabinet: Cabinet): Art {
  return [
    shadow(100, 183, 80),
    tap(),
    sinkHole(),
    facePlate(parts.crust),
    waterStream(),
    at(90, 62, motion('bob', at(0, 0, sponge(), -18))),
    foam(),
    counter(parts, stinkTint, cabinet),
    counterStains(parts.crust),
    bubble(26, 50, 10, 1),
    bubble(24, 30, 7, 2),
    bubble(122, 28, 8, 3),
    bubble(160, 30, 10, 4),
    bubble(74, 21, 6, 5),
    stenchLines(
      (
        [
          [20, 100],
          [178, 76],
        ] as const
      ).slice(0, parts.stench),
    ),
  ]
}

const WET_PLATES = ['#dfe9ee', '#c8def0', '#dfe9ee', '#c8def0'] as const
const SHINY_PLATES = [C.coral, C.sun, C.mint, C.cream] as const
const RACK_X = [36, 50, 64, 78] as const

function uprightPlate(x: number, color: string, wet: boolean, index: number): Art {
  const rim = wet ? '#9fb9cf' : mix(color, '#000000', 0.14)
  return part(
    'rack-plate',
    [
      svg`<circle cx=${x} cy="68" r="25" fill=${color} />`,
      svg`<circle cx=${x} cy="68" r="25" fill="none" stroke=${rim} stroke-width="3" />`,
      svg`<circle cx=${x} cy="68" r="15" fill=${rim} opacity=".35" />`,
      when(
        !wet,
        () =>
          svg`<path d=${`M${x - 15} 58a19 19 0 0 1 11-9`} fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85" />`,
      ),
    ],
    index,
  )
}

function dryingRack(wet: boolean, tint: number): Art {
  const colors = wet ? WET_PLATES.map((c) => mix(c, C.musty, tint)) : SHINY_PLATES
  const wire = C.metalMid
  const cupColor = wet ? mix('#c8def0', C.musty, tint) : C.sky
  const cupShade = wet ? mix('#9fb9cf', C.mustyDark, tint) : C.skyDark
  return part('rack', [
    RACK_X.map((x, i) => uprightPlate(x, colors[i] ?? C.cream, wet, i)),
    at(102, 94, [
      svg`<path d="M10-14h3a5 5 0 0 1 0 10h-3" fill="none" stroke=${cupShade} stroke-width="4" />`,
      svg`<path d="M-11 0H11V-16Q11-21 6-21H-6Q-11-21-11-16Z" fill=${cupColor} />`,
      svg`<rect x="-12" y="-3" width="24" height="4.5" rx="2.25" fill=${cupShade} />`,
    ]),
    svg`<path d="M20 96V106M118 96V106" stroke=${C.metalDark} stroke-width="5" stroke-linecap="round" />`,
    Array.from({ length: 8 }, (_, i) => 26 + i * 13).map(
      (x) =>
        svg`<path d=${`M${x} 82V96`} stroke=${wire} stroke-width="3" stroke-linecap="round" />`,
    ),
    svg`<rect x="14" y="80" width="110" height="5" rx="2.5" fill=${wire} />`,
    svg`<rect x="14" y="93" width="110" height="6" rx="3" fill=${C.metal} />`,
  ])
}

function rackDrips(): Art {
  return part(
    'drip',
    (
      [
        [38, 104, 1],
        [66, 106, 2],
        [94, 104, 3],
      ] as const
    ).map(([x, y, delay]) => at(x, y, motion('drip', drop(0, 0, C.water, 0.85), delay))),
  )
}

function clingingDrops(): Art {
  return part(
    'wet',
    (
      [
        [30, 62],
        [48, 50],
        [78, 58],
        [90, 72],
        [66, 70],
      ] as const
    ).map(([x, y]) => drop(x, y, C.waterDark, 0.62)),
  )
}

function towelWish(): Art {
  return part('wish', [
    svg`<circle cx="151" cy="36" r="3.6" fill=${C.cream} /><circle cx="143" cy="42" r="2.4" fill=${C.cream} />`,
    at(
      170,
      33,
      motion('pulse', [
        svg`<circle r="17" fill=${C.cream} />`,
        svg`<rect x="-9" y="-9" width="18" height="18" rx="3" fill=${C.coral} />`,
        svg`<rect x="-9" y="2" width="18" height="3.4" fill=${C.cream} />`,
      ]),
    ),
  ])
}

function towel(): Art {
  return part('towel', [
    svg`<rect x="36" y="102" width="34" height="46" rx="5" fill=${C.pinkDark} />`,
    svg`<rect x="39" y="102" width="34" height="42" rx="5" fill=${C.pink} />`,
    svg`<rect x="39" y="130" width="34" height="4.5" fill=${C.cream} />`,
    svg`<rect x="39" y="137" width="34" height="2.6" fill=${C.cream} />`,
    svg`<path d="M39 106H73" stroke=${C.pinkDark} stroke-width="2.4" stroke-linecap="round" />`,
  ])
}

function rackView(parts: DishesParts, stinkTint: number, cabinet: Cabinet): Art {
  const clouds: Array<readonly [number, number, number]> = [
    [58, 30, 0.75],
    [112, 26, 0.6],
    [22, 28, 0.55],
  ]
  const flySpots: Array<readonly [number, number]> = [
    [180, 68],
    [136, 88],
  ]
  return [
    shadow(100, 183, 80),
    tap(),
    sinkHole(),
    when(parts.wet, rackDrips),
    counter(parts, stinkTint, cabinet),
    dryingRack(parts.wet, stinkTint),
    when(parts.wet, clingingDrops),
    when(parts.wet, towelWish),
    when(parts.towel, towel),
    when(parts.towel, () => [
      sparkle(160, 34, 1.15, 1),
      sparkle(24, 32, 0.95, 2),
      sparkle(104, 30, 0.8, 3),
      sparkle(178, 62, 0.7, 4),
    ]),
    clouds.slice(0, parts.cloud).map(([x, y, s], i) => cloud(x, y, s, i + 1)),
    flySpots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

export function dishes(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = dishesParts(scene)
  const tint = scene.state === 'clean' ? 0 : clamp01(scene.stink) * 0.55
  const cabinet = cabinetOf(scene)
  const views: Record<DishesView, () => Art> = {
    sink: () => sinkView(parts, tint, cabinet),
    washing: () => washingView(parts, tint, cabinet),
    rack: () => rackView(parts, tint, cabinet),
  }
  return frame('dishes', scene, options, views[parts.view]())
}
