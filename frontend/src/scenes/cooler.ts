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
  stenchLines,
  tintOf,
  when,
  bubble,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type CoolerView = 'cooler' | 'order' | 'delivery'

export interface CoolerParts {
  view: CoolerView
  level: number
  step: number
  spares: number
  ghosts: number
  empty: boolean
  cart: boolean
  fizz: boolean
  sweat: boolean
  asleep: boolean
  ticks: number
  dust: number
  webs: number
  cupCracked: boolean
  plant: boolean
  stench: number
  flies: number
  murk: number
  mood: Mood
}

export const MAX_STEP = 4
export const MAX_SPARES = 3

const LEVELS = [30, 41, 52, 63, 73] as const
const DUE_LEVEL = 84
const FRESH_LEVEL = 24

const DUST_AT = [0.05, 0.3] as const
const WEB_AT = [0.2, 0.5] as const
const CUP_AT = 0.4
const PLANT_AT = 0.55
const STENCH_AT = [0.65, 0.85] as const
const FLIES_AT = [0.6, 0.9] as const
const SICK_AT = 0.6

const CALM = {
  ghosts: 0,
  empty: false,
  cart: false,
  fizz: false,
  sweat: false,
  asleep: false,
  ticks: 0,
  dust: 0,
  webs: 0,
  cupCracked: false,
  plant: false,
  stench: 0,
  flies: 0,
  murk: 0,
} as const

export function coolerParts(scene: SceneView): CoolerParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...CALM,
      view: 'cooler',
      level: FRESH_LEVEL,
      step: 0,
      spares: MAX_SPARES,
      fizz: true,
      mood: 'happy',
    }
  }
  const dust = reached(stink, DUST_AT)
  const webs = reached(stink, WEB_AT)
  const cupCracked = stink >= CUP_AT
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  const sick = stink >= SICK_AT
  const murk = reached(stink, [...DUST_AT, PLANT_AT, ...STENCH_AT]) / 5
  if (state === 'running') {
    return {
      ...CALM,
      view: 'order',
      level: DUE_LEVEL,
      step: MAX_STEP,
      spares: 0,
      ticks: Math.min(4, Math.floor(clamp01(scene.progress) * 4) + 1),
      dust: Math.min(1, dust),
      murk,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...CALM,
      view: 'delivery',
      level: DUE_LEVEL,
      step: MAX_STEP,
      spares: 0,
      dust,
      webs,
      cupCracked,
      stench,
      flies,
      murk,
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const raw = Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const step = due ? MAX_STEP : resting ? 0 : raw
  const plant = stink >= PLANT_AT
  const stock = Math.min(plant ? MAX_SPARES - 1 : MAX_SPARES, Math.max(0, MAX_SPARES - step))
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...CALM,
    view: 'cooler',
    level: due ? DUE_LEVEL : (LEVELS[step] ?? DUE_LEVEL),
    step,
    spares: stock,
    ghosts: due ? 0 : MAX_SPARES - stock,
    sweat: !due && step >= 3,
    empty: due,
    cart: due,
    asleep: resting,
    dust,
    webs,
    cupCracked,
    plant,
    stench,
    flies,
    murk,
    mood,
  }
}

const TOP = 14
const SHOULDER = 74
const NECK_TOP = 92
const NECK_BOTTOM = 104
const HALF = 35
const NECK = 11
const CORNER = 15
const WALL = 4.5
const RIBS = [37, 58] as const

const RIM = '#a3d8fc'
const AIR = '#d2ecfd'
const LIQUID = '#4aa8f2'
const CREST = '#a6dcff'
const SHINE = '#ffffff'
const GRIME = '#c9b98a'
const DUST = '#d8c79c'
const DUST_DARK = '#b6a477'
const WEB = '#e6ebf5'
const PAPER = '#fbf7ec'
const DRY_CUP = '#c7a878'
const DRY_CUP_DARK = '#8d6f45'
const BROWN = '#8b6a3c'
const BROWN_DARK = '#6d4f28'
const NOOK = '#27335c'
const BOX = '#d9a566'
const BOX_DARK = '#b47f43'
const BOX_LIGHT = '#eec08a'
const VAN = '#ffc857'
const VAN_DARK = '#e0a233'
const VAN_LIGHT = '#ffe09a'
const TYRE = '#20243b'
const SPEED = '#a9c8f0'
const SKIN = '#ffcfa8'

interface Tones {
  liquid: string
  crest: string
  cap: string
  drip: string
  badge: string
}

function tonesOf(scene: SceneView): Tones {
  const liquid = accentOf(scene, LIQUID)
  return liquid === LIQUID
    ? { liquid, crest: CREST, cap: C.skyDark, drip: C.water, badge: C.sky }
    : { liquid, crest: tintOf(liquid, 0.5), cap: shadeOf(liquid), drip: liquid, badge: liquid }
}

function halfWidth(y: number, inset: number): number {
  const t = clamp01((y - SHOULDER) / (NECK_TOP - SHOULDER))
  const taper = HALF + (NECK - HALF) * t * t * (3 - 2 * t)
  const rib = RIBS.reduce((sum, mark) => sum + 2.4 * Math.exp(-(((y - mark) / 2.6) ** 2)), 0)
  const dy = Math.max(0, y - (TOP + inset))
  const rounded = dy < CORNER ? CORNER - Math.sqrt(CORNER ** 2 - (CORNER - dy) ** 2) : 0
  return Math.max(0, taper - rib - rounded - inset)
}

function bottlePath(top: number, inset: number): string {
  const ys: number[] = []
  for (let y = top; y < NECK_BOTTOM; y += 2) ys.push(y)
  ys.push(NECK_BOTTOM)
  const right = ys.map((y) => `L${round(halfWidth(y, inset))} ${y}`)
  const left = ys.toReversed().map((y) => `L${round(-halfWidth(y, inset))} ${y}`)
  return `M${right.join('').slice(1)}${left.join('')}Z`
}

function crest(level: number, color: string): Art {
  const edge = round(Math.max(3, halfWidth(level, WALL) - 1))
  const half = round(edge / 2)
  return svg`<path d=${`M${-edge} ${level + 1}Q${-half} ${level - 3} 0 ${level + 1}T${edge} ${level + 1}`} fill="none" stroke=${color} stroke-width="4.5" stroke-linecap="round" />`
}

function ribs(color: string): Art {
  return RIBS.map((y) => {
    const edge = round(halfWidth(y, WALL) - 1)
    return svg`<path d=${`M${-edge} ${y}H${edge}`} stroke=${color} stroke-width="2.4" stroke-linecap="round" opacity=".55" />`
  })
}

function bottle(parts: CoolerParts, tones: Tones): Art {
  const liquid = mix(tones.liquid, '#8fae74', parts.murk * 0.8)
  const top = mix(tones.crest, '#c6d59a', parts.murk)
  const air = mix(AIR, GRIME, parts.dust * 0.2)
  const rim = mix(RIM, DUST, parts.dust * 0.22)
  const fizz = parts.fizz
    ? [
        at(-16, 74, bubble(0, 0, 4.2, 1)),
        at(14, 62, bubble(0, 0, 5.2, 2)),
        at(-4, 48, bubble(0, 0, 3.4, 3)),
        at(20, 42, bubble(0, 0, 3, 4)),
        at(-20, 44, bubble(0, 0, 3.6, 5)),
      ]
    : []
  return part('bottle', [
    svg`<path d=${bottlePath(TOP, 0)} fill=${rim} />`,
    svg`<path d=${bottlePath(TOP + WALL, WALL)} fill=${air} />`,
    part('water', [
      svg`<path d=${bottlePath(parts.level, WALL)} fill=${liquid} />`,
      parts.fizz ? motion('bob', crest(parts.level, top)) : crest(parts.level, top),
    ]),
    fizz,
    ribs(parts.murk > 0 ? mix(RIM, GRIME, parts.murk) : '#ffffff'),
    svg`<rect x="-26" y="24" width="6" height="42" rx="3" fill=${SHINE} opacity=".6" />`,
    svg`<circle cx="-23" cy="72" r="3" fill=${SHINE} opacity=".6" />`,
  ])
}

function dustOn(step: number): Art {
  if (step === 0) return []
  const specks = [
    [-14, 22, 1.7],
    [8, 20, 1.5],
    [22, 30, 1.9],
    [-8, 33, 1.3],
    [14, 48, 1.5],
    [-18, 52, 1.7],
    [4, 66, 1.3],
  ] as const
  return part('dust', [
    specks.map(
      ([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST_DARK} opacity=".85" />`,
    ),
    when(
      step >= 2,
      () =>
        svg`<path d="M-27 18Q-28 10-16 11Q-8 7 2 10Q12 6 19 11Q30 11 27 18Q18 15 10 17Q0 14-8 17Q-18 15-27 18Z" fill=${DUST} />`,
    ),
  ])
}

function web(side: number): Art {
  const threads = [0, 1, 2, 3].map((i) => {
    const a = ((8 + i * 27) * Math.PI) / 180
    return [Math.cos(a) * 30, -Math.sin(a) * 30] as const
  })
  const arc = (k: number): string =>
    threads
      .map(([x, y], i) => {
        const px = round(x * k)
        const py = round(y * k)
        if (i === 0) return `M${px} ${py}`
        const prev = threads[i - 1] ?? [x, y]
        const cx = round(((x + prev[0]) / 2) * k * 0.84)
        const cy = round(((y + prev[1]) / 2) * k * 0.84)
        return `Q${cx} ${cy} ${px} ${py}`
      })
      .join('')
  return part(
    'cobweb',
    at(
      side * 15,
      104,
      svg`<g transform=${`scale(${side} 1)`} fill="none" stroke=${WEB} stroke-width="1.5" stroke-linecap="round" opacity=".85">
        ${threads.map(([x, y]) => svg`<path d=${`M0 0L${round(x)} ${round(y)}`} />`)}
        ${[0.42, 0.7, 0.96].map((k) => svg`<path d=${arc(k)} />`)}
      </g>`,
    ),
  )
}

function tap(x: number, color: string, dark: string): Art {
  return [
    svg`<rect x=${x - 7} y="139" width="14" height="9" rx="3" fill=${C.metalMid} />`,
    svg`<rect x=${x - 3} y="147" width="6" height="5" rx="1.5" fill=${C.metalDark} />`,
    svg`<rect x=${x - 5.5} y="133" width="11" height="7" rx="3" fill=${color} />`,
    svg`<rect x=${x - 5.5} y="137.5" width="11" height="2.5" rx="1.2" fill=${dark} />`,
  ]
}

function cup(cracked: boolean): Art {
  if (cracked) {
    return part(
      'dry-cup',
      at(-10, 170, [
        svg`<path d="M-9-19L-5-16L-1-19L3-15L9-19L6.5-2Q6 0 4 0H-4Q-6 0-6.5-2Z" fill=${DRY_CUP} />`,
        svg`<path d="M-3-14l3 4-3 3 3 4M5-13l-2 4 2 2" fill="none" stroke=${DRY_CUP_DARK} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />`,
      ]),
    )
  }
  return part(
    'cup',
    at(-10, 170, [
      svg`<path d="M-9-19H9L6.5-2Q6 0 4 0H-4Q-6 0-6.5-2Z" fill=${PAPER} />`,
      svg`<path d="M-8.2-12.5H8.2L7.6-8H-7.6Z" fill=${C.sky} />`,
      svg`<rect x="-10" y="-20.5" width="20" height="3.6" rx="1.8" fill=${C.creamDark} />`,
    ]),
  )
}

function dispenser(parts: CoolerParts, tones: Tones): Art {
  const lamp = parts.asleep ? C.metalDark : parts.cart ? C.coral : C.mint
  return part('cooler', [
    svg`<rect x="-30" y="176" width="14" height="7" rx="2.5" fill=${C.metalDark} /><rect x="16" y="176" width="14" height="7" rx="2.5" fill=${C.metalDark} />`,
    svg`<rect x="-37" y="103" width="74" height="76" rx="14" fill=${C.metal} />`,
    svg`<path d="M23 103H23a14 14 0 0 1 14 14V165a14 14 0 0 1-14 14H26a8 8 0 0 0 4-8V111a8 8 0 0 0-7-8Z" fill=${C.metalMid} />`,
    svg`<rect x="-26" y="131" width="52" height="42" rx="9" fill=${NOOK} />`,
    tap(-10, C.sky, C.skyDark),
    tap(11, C.coral, C.coralDark),
    svg`<rect x="-26" y="168" width="52" height="7" rx="3.5" fill=${C.metalDark} />`,
    svg`<path d="M-19 171.5h38" stroke=${C.metal} stroke-width="1.6" stroke-dasharray="3 3" stroke-linecap="round" />`,
    cup(parts.cupCracked),
    svg`<circle cx="26" cy="113" r="3" fill=${lamp} />`,
    face(0, 117, parts.mood, C.fly, 0.82),
    when(parts.fizz, () => at(-10, 150, motion('drip', drop(0, 0, tones.drip, 0.55), 2))),
    when(parts.cart, () => at(-10, 150, motion('drip', drop(0, 0, tones.drip, 0.5), 3))),
    when(parts.sweat, () => at(31, 127, motion('drip', drop(0, 0, tones.drip, 0.72), 1))),
  ])
}

function collar(): Art {
  return [
    svg`<rect x="-24" y="97" width="48" height="10" rx="5" fill=${C.metalDark} />`,
    svg`<rect x="-16" y="92" width="32" height="10" rx="4" fill=${C.metalMid} />`,
  ]
}

function machine(parts: CoolerParts, tones: Tones): Art {
  return [
    dispenser(parts, tones),
    bottle(parts, tones),
    collar(),
    dustOn(parts.dust),
    when(parts.webs >= 1, () => web(-1)),
    when(parts.webs >= 2, () => web(1)),
  ]
}

function spareShape(body: string, inner: string, water: string, shine: number): Art {
  return [
    svg`<path d="M-17-5Q-17 0-12 0H12Q17 0 17-5V-38C17-46 7-47 6.5-51V-58H-6.5V-51C-7-47-17-46-17-38Z" fill=${body} />`,
    svg`<path d="M-14-5Q-14-3-11-3H11Q14-3 14-5V-38C14-44 5-46 4-50V-56H-4V-50C-5-46-14-44-14-38Z" fill=${inner} />`,
    svg`<path d="M-14-5Q-14-3-11-3H11Q14-3 14-5V-38C14-41 11-43 8-45H-8C-11-43-14-41-14-38Z" fill=${water} />`,
    svg`<path d="M-13-16H13M-13-30H13" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".4" />`,
    svg`<rect x="-10.5" y="-38" width="3.5" height="24" rx="1.75" fill="#fff" opacity=${shine} />`,
  ]
}

function spare(x: number, y: number, index: number, tones: Tones): Art {
  return part(
    'spare',
    [
      shadow(x, y, 20, 0.24),
      at(x, y, [
        spareShape(RIM, AIR, tones.liquid, 0.6),
        svg`<rect x="-8" y="-65" width="16" height="9" rx="3" fill=${tones.cap} />`,
      ]),
    ],
    index,
  )
}

const SPARE_SPOTS = [
  [168, 184],
  [146, 176],
  [32, 180],
] as const

function spares(parts: CoolerParts, tones: Tones): Art {
  const shown = SPARE_SPOTS.slice(0, parts.spares)
    .map(([x, y], i) => [x, y, i] as const)
    .toSorted((a, b) => a[1] - b[1])
  const ghosts = SPARE_SPOTS.slice(MAX_SPARES - parts.ghosts)
  return [
    part(
      'spare-ghosts',
      ghosts.map(
        ([x, y]) =>
          svg`<ellipse cx=${x} cy=${y - 2} rx="17" ry="5" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 5" stroke-linecap="round" opacity=".16" />`,
      ),
    ),
    shown.map(([x, y, i]) => spare(x, y, i, tones)),
  ]
}

function emptyBottle(tones: Tones): Art {
  const inner = mix(AIR, GRIME, 0.2)
  return part('empty-bottle', [
    shadow(160, 183, 30, 0.24),
    at(
      160,
      166,
      at(0, 33, [
        spareShape(mix(RIM, DUST, 0.25), inner, inner, 0.5),
        svg`<path d="M7-4H11Q14-3 14-6V-38H7Z" fill=${tones.liquid} opacity=".55" />`,
        svg`<rect x="-8" y="-65" width="16" height="9" rx="3" fill=${mix(tones.cap, DUST_DARK, 0.3)} />`,
      ]),
      90,
      0.88,
    ),
  ])
}

function cartGlyph(tones: Tones): Art {
  return [
    at(5, -3, [
      svg`<rect x="-5.5" y="-16" width="11" height="5" rx="1.5" fill=${tones.cap} />`,
      svg`<path d="M-12 12V-3C-12-8-4-9-3.5-12H3.5C4-9 12-8 12-3V12Z" fill=${tones.liquid} />`,
      svg`<rect x="-8.5" y="-4" width="2.6" height="12" rx="1.3" fill="#fff" opacity=".7" />`,
    ]),
    svg`<path d="M-21-11H-15L-9 11H16" fill="none" stroke=${C.coralDark} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<path d="M-13-3H19L15 7H-10.5Z" fill=${C.coral} />`,
    svg`<path d="M-5 0V5M3 0V5M11 0V5" stroke=${C.coralDark} stroke-width="2" stroke-linecap="round" />`,
    svg`<circle cx="-6" cy="17" r="3.8" fill=${C.coralDark} /><circle cx="13" cy="17" r="3.8" fill=${C.coralDark} />`,
  ]
}

function cartBubble(tones: Tones): Art {
  return part('cart', [
    svg`<circle cx="134" cy="85" r="4" fill=${C.cream} /><circle cx="143" cy="75" r="6" fill=${C.cream} />`,
    at(
      161,
      46,
      motion('pulse', [
        svg`<circle r="28" fill=${C.cream} />`,
        at(0, 0, cartGlyph(tones), 0, 0.94),
      ]),
    ),
  ])
}

function dustBunnies(): Art {
  return part('dust-bunny', [
    svg`<ellipse cx="46" cy="182" rx="9" ry="4.5" fill=${DUST_DARK} /><ellipse cx="44" cy="180" rx="6" ry="3.5" fill=${DUST} />`,
    svg`<ellipse cx="116" cy="184" rx="7" ry="3" fill=${DUST_DARK} /><ellipse cx="115" cy="182.5" rx="4.5" ry="2.2" fill=${DUST} />`,
  ])
}

function driedPlant(): Art {
  return part(
    'dried-plant',
    at(33, 182, [
      shadow(0, 0, 20, 0.24),
      svg`<path d="M0-24C-1-44 4-54 13-52" fill="none" stroke=${BROWN} stroke-width="3.6" stroke-linecap="round" />`,
      svg`<path d="M-1-32C-6-42-12-44-15-38" fill="none" stroke=${BROWN} stroke-width="3" stroke-linecap="round" />`,
      at(13, -52, svg`<path d="M0 0C8-4 12 4 8 14C2 12-2 6 0 0Z" fill=${BROWN} />`),
      at(-15, -38, svg`<path d="M0 0C-7-2-8 6-6 13C-1 11 2 6 0 0Z" fill=${BROWN_DARK} />`),
      svg`<path d="M-15-25H15L11.5-3Q11 0 8 0H-8Q-11 0-11.5-3Z" fill=${C.terracotta} />`,
      svg`<rect x="-18" y="-30" width="36" height="8" rx="3.5" fill=${C.terracottaDark} />`,
      svg`<path d="M-8-15l4 4-3 3M7-16l-3 4 3 4" fill="none" stroke=${C.terracottaDark} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />`,
      at(26, -3, svg`<path d="M0 0C6-4 11-2 12 2C6 5 2 4 0 0Z" fill=${BROWN_DARK} />`),
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

const FRESH_SPARKLES = [
  [34, 58, 1.2, 1],
  [160, 46, 1.4, 2],
  [182, 92, 0.8, 3],
  [20, 104, 0.75, 4],
] as const

function neglect(
  parts: CoolerParts,
  lines: ReadonlyArray<readonly [number, number]>,
  spots: ReadonlyArray<readonly [number, number]>,
): Art {
  return [
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function coolerView(parts: CoolerParts, tones: Tones): Art {
  return [
    shadow(94, 184, 48),
    spares(parts, tones),
    when(parts.empty, () => emptyBottle(tones)),
    at(94, 0, machine(parts, tones)),
    when(parts.dust >= 2, dustBunnies),
    when(parts.plant, driedPlant),
    when(parts.cart, () => cartBubble(tones)),
    when(parts.asleep, () => [zed(144, 62, 0.72, 1), zed(160, 42, 1, 2), zed(178, 26, 0.62, 3)]),
    when(parts.fizz, () => FRESH_SPARKLES.map(([x, y, s, d]) => sparkle(x, y, s, d))),
    neglect(
      parts,
      [
        [40, 100],
        [176, 134],
      ],
      [
        [30, 46],
        [146, 112],
      ],
    ),
  ]
}

function phone(ticks: number): Art {
  const dots = [0, 1, 2, 3].map(
    (i) =>
      svg`<rect x=${-18 + i * 9.5} y="29" width="7.5" height="4.5" rx="2.25" fill=${i < ticks ? C.mintDark : C.creamDark} />`,
  )
  return part('phone', [
    svg`<rect x="-28" y="-50" width="56" height="100" rx="13" fill=${C.metal} />`,
    svg`<rect x="-23" y="-43" width="46" height="86" rx="8" fill=${PAPER} />`,
    svg`<rect x="-8" y="-47" width="16" height="2.6" rx="1.3" fill=${C.metalDark} />`,
    at(0, -6, [
      motion('pulse', svg`<circle r="23" fill=${C.check} opacity=".24" />`),
      svg`<circle r="17" fill=${C.check} />`,
      svg`<path d="M-8 0L-2.5 6L9-6" fill="none" stroke="#fff" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round" />`,
    ]),
    dots,
  ])
}

function parcel(tones: Tones): Art {
  return part('box', [
    shadow(156, 184, 34),
    svg`<rect x="124" y="146" width="62" height="38" rx="4" fill=${BOX} />`,
    svg`<path d="M121 141H189V151Q189 153 187 153H123Q121 153 121 151Z" fill=${BOX_LIGHT} />`,
    svg`<rect x="149" y="141" width="12" height="43" fill=${BOX_DARK} opacity=".55" />`,
    drop(137, 170, tones.badge, 1),
    svg`<path d="M169 172h9M169 178h6" stroke=${BOX_DARK} stroke-width="2.4" stroke-linecap="round" />`,
  ])
}

function orderView(parts: CoolerParts, tones: Tones): Art {
  return [
    shadow(66, 184, 46),
    at(66, 0, machine(parts, tones)),
    parcel(tones),
    at(156, 84, motion('bob', at(0, 0, phone(parts.ticks), 7, 0.98))),
    sparkle(116, 30, 0.7, 1),
    sparkle(182, 26, 0.6, 3),
  ]
}

function wheel(x: number, delay: number): Art {
  return at(x, -11, [
    svg`<circle r="12" fill=${TYRE} />`,
    svg`<circle r="6.5" fill=${C.metal} />`,
    motion(
      'spin',
      svg`<path d="M-5 0H5M0-5V5" stroke=${C.metalDark} stroke-width="2.6" stroke-linecap="round" />`,
      delay,
    ),
  ])
}

function roofBottle(x: number, tones: Tones): Art {
  return at(
    x,
    -64,
    [
      spareShape(RIM, AIR, tones.liquid, 0.6),
      svg`<rect x="-8" y="-65" width="16" height="9" rx="3" fill=${tones.cap} />`,
    ],
    0,
    0.56,
  )
}

function van(tones: Tones): Art {
  return part('van', [
    roofBottle(-14, tones),
    roofBottle(10, tones),
    roofBottle(34, tones),
    svg`<rect x="-28" y="-65.5" width="76" height="3.5" rx="1.75" fill=${VAN_DARK} />`,
    svg`<path d="M54-12V-52Q54-62 44-62H-16Q-25-62-30-54L-41-36Q-53-34-54-23V-13Q-54-8-49-8H49Q54-8 54-12Z" fill=${VAN} />`,
    svg`<path d="M-54-20H54V-13Q54-8 49-8H-49Q-54-8-54-13Z" fill=${VAN_DARK} />`,
    svg`<path d="M-17-56H-3V-36H-34L-25-51Q-22-56-17-56Z" fill=${C.glass} />`,
    at(-13, -42, [
      svg`<circle r="7.5" fill=${SKIN} />`,
      svg`<path d="M-8-1A8 8 0 0 1 8-1H-8ZM-8-3H-13Q-14-1-12 0H-6Z" fill=${C.coral} />`,
      svg`<circle cx="-3" cy="1.5" r="1.3" fill=${C.fly} />`,
    ]),
    svg`<path d="M-30-49L-19-53" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".45" />`,
    svg`<path d="M2-56V-20" stroke=${VAN_DARK} stroke-width="2" stroke-linecap="round" />`,
    svg`<rect x="-14" y="-31" width="9" height="3.4" rx="1.7" fill=${VAN_DARK} />`,
    svg`<ellipse cx="-49" cy="-29" rx="4.5" ry="3.8" fill=${VAN_LIGHT} />`,
    face(28, -39, 'happy', '#5b3413', 0.82),
    svg`<circle cx="-30" cy="-11" r="15" fill=${VAN_DARK} /><circle cx="30" cy="-11" r="15" fill=${VAN_DARK} />`,
    wheel(-30, 1),
    wheel(30, 2),
  ])
}

function speedLines(): Art {
  const lines = [
    [179, 118, 11, 1],
    [183, 134, 7, 2],
    [179, 150, 11, 3],
  ] as const
  const puffs = [
    [180, 172, 5.5, 1],
    [185, 162, 3.5, 3],
  ] as const
  return part('speed', [
    lines.map(([x, y, w, d]) =>
      at(
        x,
        y,
        motion(
          'flicker',
          svg`<path d=${`M0 0H${w}`} stroke=${SPEED} stroke-width="4" stroke-linecap="round" />`,
          d,
        ),
      ),
    ),
    puffs.map(([x, y, r, d]) =>
      at(x, y, motion('drift', svg`<circle r=${r} fill=${C.metal} opacity=".55" />`, d)),
    ),
    [
      [84, 186, 16],
      [122, 186, 16],
      [160, 186, 16],
    ].map(
      ([x, y, w]) =>
        svg`<path d=${`M${x} ${y}h${w}`} stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".22" />`,
    ),
  ])
}

function route(tones: Tones): Art {
  return part('route', [
    svg`<path d="M146 92C146 40 96 12 58 30" fill="none" stroke=${SPEED} stroke-width="4" stroke-linecap="round" stroke-dasharray="1 10" opacity=".7" />`,
    at(
      41,
      50,
      motion('bob', [
        svg`<path d="M0 0C-5-8-15-14-15-25A15 15 0 0 1 15-25C15-14 5-8 0 0Z" fill=${C.coral} />`,
        svg`<circle cy="-25" r="9.5" fill=${C.cream} />`,
        drop(0, -24.5, tones.badge, 0.82),
      ]),
    ),
  ])
}

function deliveryView(parts: CoolerParts, tones: Tones): Art {
  return [
    shadow(41, 184, 32),
    route(tones),
    at(41, 183, at(0, -183, machine(parts, tones)), 0, 0.76),
    shadow(124, 184, 58),
    at(124, 183, motion('bob', van(tones))),
    speedLines(),
    neglect(
      parts,
      [
        [78, 128],
        [92, 82],
      ],
      [
        [174, 62],
        [112, 58],
      ],
    ),
  ]
}

export function cooler(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = coolerParts(scene)
  const views: Record<CoolerView, (parts: CoolerParts, tones: Tones) => Art> = {
    cooler: coolerView,
    order: orderView,
    delivery: deliveryView,
  }
  const art = views[parts.view](parts, tonesOf(scene))
  return frame('cooler', scene, options, art)
}
