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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type EvCable = 'holstered' | 'reaching' | 'plugged'
export type EvGauge = 'asleep' | 'normal' | 'low' | 'charging' | 'full'

export interface EvParts {
  cells: number
  gauge: EvGauge
  cable: EvCable
  bolts: boolean
  unplug: boolean
  asleep: boolean
  shiny: boolean
  sweat: boolean
  dust: number
  webs: number
  flat: boolean
  tumbleweed: boolean
  spider: boolean
  flies: number
  mood: Mood
}

export const MAX_CELLS = 5

const DUST_AT = [0.05, 0.3] as const
const WEB_AT = [0.15, 0.5] as const
const FLAT_AT = 0.4
const TUMBLEWEED_AT = 0.65
const SPIDER_AT = 0.8
const FLIES_AT = [0.6, 0.9] as const
const SICK_AT = 0.6

const CALM = {
  bolts: false,
  unplug: false,
  asleep: false,
  shiny: false,
  sweat: false,
  dust: 0,
  webs: 0,
  flat: false,
  tumbleweed: false,
  spider: false,
  flies: 0,
} as const

export function evParts(scene: SceneView): EvParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...CALM,
      cells: MAX_CELLS,
      gauge: 'full',
      cable: 'holstered',
      shiny: true,
      mood: 'happy',
    }
  }
  const dust = reached(stink, DUST_AT)
  const webs = reached(stink, WEB_AT)
  const flat = stink >= FLAT_AT
  const sick = stink >= SICK_AT
  const neglect = {
    dust,
    webs,
    flat,
    tumbleweed: stink >= TUMBLEWEED_AT,
    spider: stink >= SPIDER_AT,
    flies: reached(stink, FLIES_AT),
  }
  if (state === 'running') {
    const cells = Math.min(MAX_CELLS, Math.floor(clamp01(scene.progress) * MAX_CELLS) + 1)
    return {
      ...CALM,
      cells,
      gauge: 'charging',
      cable: 'plugged',
      bolts: true,
      dust: Math.min(1, dust),
      webs: Math.min(1, webs),
      flat,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      ...neglect,
      cells: MAX_CELLS,
      gauge: 'full',
      cable: 'plugged',
      unplug: true,
      mood: sick ? 'sick' : 'calm',
    }
  }
  if (state === 'due') {
    return {
      ...CALM,
      ...neglect,
      cells: 0,
      gauge: 'low',
      cable: 'reaching',
      sweat: true,
      mood: sick ? 'sick' : 'pleading',
    }
  }
  const resting = state === 'resting'
  const step = resting ? 0 : Math.min(MAX_CELLS - 1, Math.floor(fill * MAX_CELLS))
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (sick) mood = 'sick'
  return {
    ...CALM,
    ...neglect,
    cells: MAX_CELLS - step,
    gauge: resting ? 'asleep' : 'normal',
    cable: 'holstered',
    asleep: resting,
    sweat: step >= 4,
    mood,
  }
}

const TYRE = '#20243b'
const HUB = '#c5cde0'
const CASE = '#eef1f8'
const SCREEN = '#1c2442'
const CELL_EMPTY = '#2c3556'
const WEB = '#e6ebf5'
const DUST = '#d8c79c'
const DUST_DARK = '#b6a477'
const BOLT = 'M2.5-10L-6.5 2H-.5L-2.5 10L6.5-2H.5Z'

const CENTRE_X = 120
const CENTRE_Y = 43
const PORT_X = 63
const PORT_Y = 128

interface Colours {
  body: string
  side: string
  deep: string
  light: string
  plate: string
}

function coloursOf(scene: SceneView, dust: number): Colours {
  const base = accentOf(scene, C.coral)
  const body = mix(base, DUST_DARK, dust * 0.16)
  return {
    body,
    side: shadeOf(body, 0.2),
    deep: shadeOf(body, 0.42),
    light: tintOf(body, 0.32),
    plate: tintOf(body, 0.78),
  }
}

function cellColour(parts: EvParts): string {
  if (parts.gauge === 'asleep') return mix(C.mintDark, CELL_EMPTY, 0.35)
  if (parts.gauge === 'charging' || parts.gauge === 'full') return C.mint
  if (parts.cells >= 4) return C.mint
  if (parts.cells >= 2) return C.sun
  return C.coral
}

function gaugeCells(parts: EvParts): Art {
  const colour = cellColour(parts)
  return part(
    'battery-cells',
    Array.from({ length: MAX_CELLS }, (_, i) => i).map((i) => {
      const x = 73.5 + i * 19.4
      const lit = i < parts.cells
      const cell = svg`<rect x=${round(x)} y="26" width="17.4" height="34" rx="5" fill=${lit ? colour : CELL_EMPTY} />`
      if (lit && parts.gauge === 'charging' && i === parts.cells - 1) {
        return motion('flicker', cell)
      }
      return cell
    }),
  )
}

function gaugeBadge(parts: EvParts): Art {
  if (parts.gauge === 'low') {
    return [
      motion('flicker', svg`<rect x="73.5" y="26" width="8" height="34" rx="4" fill=${C.coral} />`),
      at(
        CENTRE_X,
        CENTRE_Y,
        svg`<rect x="-5" y="-14" width="10" height="19" rx="5" fill=${C.coral} /><circle cy="11" r="5" fill=${C.coral} />`,
      ),
    ]
  }
  if (parts.gauge === 'charging') {
    return at(
      round(Math.min(156, 73.5 + parts.cells * 19.4 - 2)),
      CENTRE_Y,
      motion('throb', [
        svg`<path d=${BOLT} fill=${SCREEN} stroke=${SCREEN} stroke-width="3.4" stroke-linejoin="round" />`,
        svg`<path d=${BOLT} fill="#fff" />`,
      ]),
      0,
      1.55,
    )
  }
  if (parts.shiny) {
    return at(CENTRE_X, CENTRE_Y, [
      svg`<path d="M-12 0L-3 9L13-9" fill="none" stroke=${SCREEN} stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />`,
      svg`<path d="M-12 0L-3 9L13-9" fill="none" stroke="#fff" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />`,
    ])
  }
  return []
}

function gauge(parts: EvParts): Art {
  const low = parts.gauge === 'low'
  const shell = low ? C.coral : parts.gauge === 'asleep' ? C.metalDark : CASE
  const art: Art = [
    svg`<rect x="172" y="32" width="13" height="22" rx="5" fill=${shell} />`,
    svg`<rect x="64" y="17" width="112" height="52" rx="13" fill=${shell} />`,
    svg`<rect x="69.5" y="22.5" width="101" height="41" rx="8" fill=${SCREEN} />`,
    gaugeCells(parts),
    gaugeBadge(parts),
  ]
  return part(
    'battery',
    low ? at(CENTRE_X, CENTRE_Y, motion('pulse', at(-CENTRE_X, -CENTRE_Y, art))) : art,
  )
}

function bolt(x: number, y: number, size: number, colour: string): Art {
  return at(x, y, svg`<path d=${BOLT} fill=${colour} />`, 0, size)
}

function plugArt(colour: string): Art {
  return [
    svg`<rect x="-18" y="-7.5" width="19" height="15" rx="5.5" fill=${colour} />`,
    svg`<rect x="0" y="-5.5" width="4" height="11" rx="1.5" fill=${C.metalDark} />`,
    svg`<rect x="3" y="-3.5" width="8" height="7" rx="2" fill=${C.metal} />`,
  ]
}

function cablePath(d: string, colour: string): Art {
  return svg`<path d=${d} fill="none" stroke=${colour} stroke-width="6" stroke-linecap="round" />`
}

const PLUGGED = [
  [20, 112],
  [6, 192],
  [46, 192],
  [50, 146.5],
] as const

function curveAt(t: number): readonly [number, number] {
  const [a, b, c, d] = PLUGGED
  const u = 1 - t
  const w = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t] as const
  return [
    w[0] * a[0] + w[1] * b[0] + w[2] * c[0] + w[3] * d[0],
    w[0] * a[1] + w[1] * b[1] + w[2] * c[1] + w[3] * d[1],
  ]
}

function pluggedCable(parts: EvParts): Art {
  const colour = parts.bolts ? C.mint : C.metalMid
  const d = `M${PLUGGED[0].join(' ')}C${PLUGGED[1].join(' ')} ${PLUGGED[2].join(' ')} ${PLUGGED[3].join(' ')}`
  return part('cable', [
    cablePath(d, colour),
    when(parts.bolts, () =>
      motion(
        'flicker',
        svg`<path d=${d} fill="none" stroke="#e8fff5" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="6 9" />`,
      ),
    ),
    at(65, 137, plugArt(parts.bolts ? C.mintDark : C.metalDark), -32),
    when(parts.bolts, () =>
      part(
        'bolts',
        [0.18, 0.5, 0.85].map((t, i) => {
          const [x, y] = curveAt(t)
          return at(
            x,
            y,
            motion(
              'twinkle',
              at(
                0,
                0,
                svg`<path d=${BOLT} fill=${C.sun} stroke=${SCREEN} stroke-width="1.6" stroke-linejoin="round" />`,
                0,
                1.15,
              ),
              3 - i,
            ),
          )
        }),
      ),
    ),
  ])
}

function reachingCable(): Art {
  return part(
    'cable',
    at(
      24,
      112,
      motion(
        'wobble',
        at(-24, -112, [
          cablePath('M24 112C22 178 42 174 50 154', C.metalMid),
          at(54, 149, plugArt(C.coralDark), -40),
        ]),
      ),
    ),
  )
}

function holsteredCable(): Art {
  return part('cable', [
    cablePath('M22 112C14 176 46 176 42 134', C.metalMid),
    at(42, 134, plugArt(C.metalDark), -90),
  ])
}

function web(x: number, y: number, flip: number, size: number): Art {
  const threads = [0, 1, 2, 3].map((i) => {
    const a = ((6 + i * 26) * Math.PI) / 180
    return [Math.cos(a) * 30, Math.sin(a) * 30] as const
  })
  const arc = (k: number): string =>
    threads
      .map(([tx, ty], i) => {
        const px = round(tx * k)
        const py = round(ty * k)
        if (i === 0) return `M${px} ${py}`
        const prev = threads[i - 1] ?? [tx, ty]
        return `Q${round(((tx + prev[0]) / 2) * k * 0.84)} ${round(((ty + prev[1]) / 2) * k * 0.84)} ${px} ${py}`
      })
      .join('')
  return part(
    'cobweb',
    at(
      x,
      y,
      [
        [C.metalDark, 3.6],
        [WEB, 1.7],
      ].map(
        ([stroke, width]) =>
          svg`<g transform=${`scale(${flip} 1)`} fill="none" stroke=${stroke} stroke-width=${width} stroke-linecap="round">
            ${threads.map(([tx, ty]) => svg`<path d=${`M0 0L${round(tx)} ${round(ty)}`} />`)}
            ${[0.42, 0.7, 0.98].map((k) => svg`<path d=${arc(k)} />`)}
          </g>`,
      ),
      0,
      size,
    ),
  )
}

function spider(): Art {
  return part(
    'spider',
    at(
      60,
      -7,
      motion('sway', [
        svg`<path d="M0 53V82" stroke=${WEB} stroke-width="1.6" />`,
        at(0, 37, [
          svg`<path d="M-9 44l5 4M-10 53l6-3M-8 62l5-6M9 44l-5 4M10 53l-6-3M8 62l-5-6" fill="none" stroke=${C.fly} stroke-width="2" stroke-linecap="round" />`,
          svg`<circle cy="53" r="7" fill=${C.fly} />`,
          svg`<circle cx="-2.5" cy="52" r="1.5" fill="#fff" /><circle cx="2.5" cy="52" r="1.5" fill="#fff" />`,
        ]),
      ]),
    ),
  )
}

function charger(parts: EvParts): Art {
  const lamp =
    parts.gauge === 'asleep'
      ? C.metalDark
      : parts.gauge === 'low'
        ? C.coral
        : parts.unplug
          ? C.sun
          : C.mint
  const glyph = bolt(32, 66, 1.05, lamp)
  return part('charger', [
    svg`<rect x="14" y="48" width="42" height="68" rx="12" fill="#0c0f1e" opacity=".22" />`,
    svg`<rect x="11" y="44" width="42" height="68" rx="12" fill=${C.metal} />`,
    svg`<path d="M11 96V100a12 12 0 0 0 12 12H41a12 12 0 0 0 12-12V96Z" fill=${C.metalMid} />`,
    svg`<rect x="18" y="52" width="28" height="28" rx="7" fill=${SCREEN} />`,
    parts.bolts ? motion('flicker', glyph) : glyph,
    svg`<rect x="21" y="86" width="22" height="5" rx="2.5" fill=${C.metalMid} />`,
    svg`<rect x="17" y="110" width="12" height="6" rx="2" fill=${C.metalDark} /><rect x="36" y="110" width="12" height="6" rx="2" fill=${C.metalDark} />`,
  ])
}

function wheelSide(x: number, y: number, rx: number, ry: number): Art {
  return [
    svg`<ellipse cx=${x} cy=${y} rx=${rx} ry=${ry} fill=${TYRE} />`,
    svg`<ellipse cx=${x} cy=${y} rx=${round(rx * 0.56)} ry=${round(ry * 0.58)} fill=${HUB} />`,
    svg`<ellipse cx=${x} cy=${y} rx=${round(rx * 0.2)} ry=${round(ry * 0.22)} fill=${C.metalDark} />`,
  ]
}

function flatWheel(x: number): Art {
  return part('flat-tyre', [
    svg`<path d=${`M${x - 24} 182.5Q${x - 27} 175 ${x - 15} 173Q${x - 11} 163 ${x} 163Q${x + 11} 163 ${x + 15} 173Q${x + 27} 175 ${x + 24} 182.5Z`} fill=${TYRE} />`,
    svg`<ellipse cx=${x} cy="175" rx="8" ry="6.5" fill=${HUB} />`,
    svg`<ellipse cx=${x} cy="175" rx="3" ry="2.4" fill=${C.metalDark} />`,
    svg`<path d=${`M${x - 18} 179q4-2 7 0M${x + 11} 179q4-2 7 0`} fill="none" stroke="#4a5070" stroke-width="2" stroke-linecap="round" />`,
  ])
}

function dustSpecks(level: number): Art {
  if (level === 0) return []
  const specks = [
    [122, 96, 1.7],
    [150, 104, 1.5],
    [164, 92, 1.9],
    [136, 88, 1.3],
    [88, 96, 1.6],
    [80, 140, 1.8],
    [120, 136, 1.6],
    [178, 148, 1.7],
  ] as const
  return part('dust', [
    specks.map(
      ([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST_DARK} opacity=".9" />`,
    ),
    when(level >= 2, () => [
      svg`<path d="M124 77Q134 72 146 75Q156 71 166 76Q172 78 170 81H122Q120 78 124 77Z" fill=${DUST} />`,
      svg`<path d="M128 106q17-14 34 0" fill="none" stroke=${tintOf(C.glass, 0.45)} stroke-width="6" stroke-linecap="round" />`,
    ]),
  ])
}

function car(parts: EvParts, c: Colours): Art {
  const glass = parts.dust >= 2 ? mix(C.glass, DUST_DARK, 0.28) : C.glass
  const lamp = parts.asleep
    ? C.metalDark
    : parts.gauge === 'low'
      ? mix(C.spark, C.metalDark, 0.5)
      : C.spark
  const portGlow =
    parts.gauge === 'low' ? C.coral : parts.bolts ? C.mint : parts.unplug ? C.sun : c.deep
  return part('car', [
    svg`<rect x="118" y="160" width="20" height="24" rx="7" fill=${TYRE} />`,
    svg`<rect x="166" y="160" width="20" height="24" rx="7" fill=${TYRE} />`,
    svg`<path d="M136 76H90Q78 76 72 87L62 114L112 120Z" fill=${c.side} />`,
    svg`<path d="M112 118L64 112Q55 112 54 122L52 152Q52 164 62 166L116 174Z" fill=${c.side} />`,
    svg`<path d="M110 88H93Q86 88 82 94L72 113L108 116Z" fill=${glass} />`,
    svg`<path d="M95 87L90 115" stroke=${c.side} stroke-width="3.5" />`,
    svg`<ellipse cx="67" cy="163" rx="14" ry="17" fill=${c.deep} />`,
    svg`<ellipse cx="100" cy="168" rx="15" ry="18" fill=${c.deep} />`,
    wheelSide(67, 166, 10.5, 14),
    parts.flat ? flatWheel(100) : wheelSide(100, 170, 11.5, 15),
    svg`<circle cx=${PORT_X} cy=${PORT_Y} r="7.5" fill=${portGlow} />`,
    svg`<circle cx=${PORT_X} cy=${PORT_Y} r="4.2" fill=${SCREEN} />`,
    svg`<path d="M110 120H82" stroke=${c.deep} stroke-width="2.5" stroke-linecap="round" opacity=".55" />`,
    svg`<rect x="84" y="126" width="11" height="3.6" rx="1.8" fill=${c.deep} />`,
    svg`<path d="M112 120L120 86Q123 74 135 74H165Q177 74 180 86L188 120Z" fill=${c.body} />`,
    svg`<path d="M120 118L127 90Q129 82 138 82H162Q171 82 173 90L180 118Z" fill=${glass} />`,
    svg`<path d="M134 110L146 88M145 112L153 96" stroke="#fff" stroke-width=${parts.shiny ? 6 : 4.5} stroke-linecap="round" opacity=".5" />`,
    svg`<ellipse cx="108" cy="110" rx="8" ry="5.5" fill=${c.body} />`,
    svg`<path d="M122 116H178Q192 116 192 130V162Q192 174 180 174H124Q112 174 112 162V130Q112 116 122 116Z" fill=${c.body} />`,
    svg`<rect x="116" y="118" width="72" height="6" rx="3" fill=${c.light} />`,
    svg`<rect x="112" y="156" width="80" height="18" rx="9" fill=${c.side} />`,
    svg`<rect x="138" y="159" width="28" height="11" rx="3" fill=${C.cream} />`,
    bolt(152, 164.5, 0.42, C.mintDark),
    svg`<rect x="128" y="127" width="48" height="27" rx="13" fill=${c.plate} />`,
    svg`<ellipse cx="120" cy="139" rx="6" ry="9" fill=${lamp} />`,
    svg`<ellipse cx="184" cy="139" rx="6" ry="9" fill=${lamp} />`,
    face(152, 139, parts.mood, C.fly, 0.95),
    dustSpecks(parts.dust),
    when(
      parts.shiny,
      () =>
        svg`<path d="M92 133L84 152M102 134L97 146M132 78H150" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".6" />`,
    ),
  ])
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return at(
    x,
    y,
    motion(
      'bob',
      svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
      delay,
    ),
    0,
    size,
  )
}

function tumbleweed(): Art {
  return part('tumbleweed', [
    shadow(32, 184, 16, 0.24),
    at(
      32,
      168,
      motion('wobble', [
        svg`<circle r="15" fill="#8a6b3f" opacity=".3" />`,
        svg`<path d="M-13-4C-5-14 7-14 13-4M-12 6C-6-3 7-4 12 7M-7 12C-11 2-7-10 1-14M7 12C12 3 9-9 0-14M-14 2C-5 7 6 8 14 1" fill="none" stroke="#c49a5c" stroke-width="2.8" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

function unplugPrompt(): Art {
  return part('unplug', [
    at(
      72,
      132,
      motion('pulse', svg`<circle r="15" fill="none" stroke=${C.sun} stroke-width="4" />`),
    ),
    at(
      44,
      127,
      motion(
        'bob',
        svg`<path d="M0 11V-9M-10 1L0-11L10 1" fill="none" stroke=${C.sun} stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
      -122,
      0.88,
    ),
  ])
}

export function ev(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = evParts(scene)
  const colours = coloursOf(scene, parts.dust)
  const carArt = car(parts, colours)
  const placed = at(190, 184, at(-192, -184, carArt), 0, 0.92)
  const leaning = parts.flat ? at(190, 184, at(-190, -184, placed), -2.4) : placed
  const posed = parts.shiny ? motion('bob', leaning, 1) : leaning
  return frame('ev', scene, options, [
    shadow(126, 184, 66),
    gauge(parts),
    charger(parts),
    when(parts.webs >= 1, () => web(53, 44, -1, 1)),
    when(parts.webs >= 2, () => web(11, 44, 1, 0.55)),
    when(parts.spider, spider),
    when(parts.cable === 'holstered', holsteredCable),
    posed,
    when(parts.cable === 'plugged', () => pluggedCable(parts)),
    when(parts.cable === 'reaching', reachingCable),
    when(parts.unplug, unplugPrompt),
    when(parts.tumbleweed, tumbleweed),
    when(parts.sweat, () =>
      part('sweat', at(183, 104, motion('drip', drop(0, 0, C.water, 0.95), 2))),
    ),
    when(parts.bolts, () =>
      part(
        'energy',
        [
          [104, 90, 1],
          [150, 80, 3],
          [184, 96, 2],
        ].map(([x = 0, y = 0, d = 1]) =>
          at(x, y, motion('rise', at(0, 0, svg`<path d=${BOLT} fill=${C.sun} />`, 0, 0.8), d)),
        ),
      ),
    ),
    when(parts.asleep, () =>
      part('zzz', [zed(30, 34, 0.6, 1), zed(44, 24, 0.8, 2), zed(56, 19, 0.55, 3)]),
    ),
    when(parts.shiny, () => [
      sparkle(36, 150, 1.05, 2),
      sparkle(82, 86, 1.1, 1),
      sparkle(184, 92, 0.85, 3),
      sparkle(150, 180, 0.6, 4),
    ]),
    [
      [178, 78],
      [106, 78],
    ]
      .slice(0, parts.flies)
      .map(([x = 0, y = 0], i) => fly(x, y, i)),
  ])
}
