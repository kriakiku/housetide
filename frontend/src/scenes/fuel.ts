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

export type FuelDisplay = 'off' | 'idle' | 'low' | 'pumping' | 'done' | 'paid'

export interface FuelParts {
  lit: number
  angle: number
  lamp: boolean
  alarm: boolean
  display: FuelDisplay
  pumping: boolean
  capOff: boolean
  receipt: boolean
  shiny: boolean
  asleep: boolean
  sweat: boolean
  puffs: number
  dust: number
  rust: boolean
  flat: boolean
  tumbleweed: boolean
  vulture: boolean
  mood: Mood
}

export const MAX_STEP = 4
export const SEGMENTS = 5

const SWEEP = 108
const EMPTY_ANGLE = -SWEEP - 10
const PUFFS_AT = [0.08, 0.3, 0.5, 0.8] as const
const DUST_AT = [0.15, 0.4, 0.7] as const
const RUST_AT = 0.45
const FLAT_AT = 0.5
const TUMBLEWEED_AT = 0.65
const VULTURE_AT = 0.8
const SICK_AT = 0.5

const QUIET = {
  lamp: false,
  alarm: false,
  pumping: false,
  capOff: false,
  receipt: false,
  shiny: false,
  asleep: false,
  sweat: false,
  puffs: 0,
  dust: 0,
  rust: false,
  flat: false,
  tumbleweed: false,
  vulture: false,
} as const

function needle(level: number): number {
  return round(-SWEEP + 2 * SWEEP * clamp01(level))
}

export function fuelParts(scene: SceneView): FuelParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...QUIET,
      lit: SEGMENTS,
      angle: needle(1),
      display: 'paid',
      shiny: true,
      mood: 'happy',
    }
  }
  const neglect = {
    puffs: reached(stink, PUFFS_AT),
    dust: reached(stink, DUST_AT),
    rust: stink >= RUST_AT,
    tumbleweed: stink >= TUMBLEWEED_AT,
    vulture: stink >= VULTURE_AT,
  }
  const sick = stink >= SICK_AT
  if (state === 'running') {
    const lit = Math.min(SEGMENTS - 1, Math.floor(clamp01(scene.progress) * 4) + 1)
    return {
      ...QUIET,
      lit,
      angle: needle((lit - 0.5) / SEGMENTS),
      display: 'pumping',
      pumping: true,
      capOff: true,
      puffs: Math.min(1, neglect.puffs),
      dust: Math.min(1, neglect.dust),
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...QUIET,
      ...neglect,
      lit: SEGMENTS,
      angle: needle(0.97),
      display: 'done',
      capOff: true,
      receipt: true,
      mood: sick ? 'sick' : 'calm',
    }
  }
  const due = state === 'due'
  const resting = state === 'resting'
  const step = due ? SEGMENTS : resting ? 0 : Math.min(MAX_STEP, Math.floor(fill * SEGMENTS))
  const lit = SEGMENTS - step
  let mood: Mood = resting ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...QUIET,
    ...neglect,
    lit,
    angle: due ? EMPTY_ANGLE : needle((lit - 0.15) / SEGMENTS),
    lamp: due || step === MAX_STEP,
    alarm: due,
    display: resting ? 'off' : due ? 'low' : 'idle',
    asleep: resting,
    sweat: due || step === MAX_STEP,
    flat: stink >= FLAT_AT,
    mood,
  }
}

const GLASS = '#26355f'
const GLASS_LIGHT = '#3f5288'
const SOOT = '#14172a'
const SOOT_LIGHT = '#454b68'
const TYRE = '#1a1d30'
const RUST = '#9c5a2c'
const RUST_DARK = '#7a4320'
const DUST = '#a8946d'
const PAPER = '#fbf7ec'
const HOSE = '#7a84a4'
const WEED = '#dcb878'
const FEATHER = '#6a5872'
const FEATHER_DARK = '#4e4058'

const BODY =
  'M62 165V136C62 128 66 124 74 124L98 125C103 106 110 90 124 90H140C150 90 154 106 160 124L176 127C184 129 187 137 187 147V166Q187 171 182 171H67Q62 171 62 165Z'
const SKIRT = 'M62 156H187V166Q187 171 182 171H67Q62 171 62 165Z'
const REAR_GLASS = 'M108 124C111 107 116 97 125 97H130V124Z'
const FRONT_GLASS = 'M135 97H140C146 97 149 108 153 124H135Z'

const REAR_AXLE = 94
const FRONT_AXLE = 160
const AXLE_Y = 169
const FILLER_X = 81
const FILLER_Y = 139

const HOSE_ARC = [48, 122, 50, 68, 80, 68, 80, 108] as const

function hosePoint(t: number): readonly [number, number] {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = HOSE_ARC
  const u = 1 - t
  const blend = (a: number, b: number, c: number, d: number): number =>
    u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
  return [blend(x0, x1, x2, x3), blend(y0, y1, y2, y3)]
}

function polar(radius: number, degrees: number): string {
  const a = (degrees * Math.PI) / 180
  return `${round(Math.sin(a) * radius)} ${round(-Math.cos(a) * radius)}`
}

function segment(index: number, color: string): Art {
  const span = (2 * SWEEP) / SEGMENTS
  const start = -SWEEP + index * span + 3
  const end = start + span - 6
  return svg`<path d=${`M${polar(23, start)}A23 23 0 0 1 ${polar(23, end)}`} fill="none" stroke=${color} stroke-width="8.5" />`
}

function segmentColor(lit: number): string {
  if (lit <= 1) return C.coral
  return lit === 2 ? C.sun : C.mint
}

function pumpGlyph(color: string): Art {
  return svg`<rect x="-4.6" y="-5.4" width="6.6" height="10.8" rx="1.4" fill=${color} /><path d="M2.2-3.4L4.6-1V2.4Q4.6 4 5.6 4" fill="none" stroke=${color} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />`
}

function gaugeLamp(parts: FuelParts): Art {
  if (parts.alarm) {
    return at(0, 14, [
      motion('pulse', [
        svg`<circle r="14" fill=${C.coral} opacity=".38" />`,
        svg`<circle r="9.5" fill=${C.coral} />`,
      ]),
      at(0, 0, pumpGlyph(PAPER), 0, 1.15),
    ])
  }
  return at(0, 14, [
    svg`<circle r="7" fill=${parts.lamp ? C.sun : C.creamDark} />`,
    at(0, 0, pumpGlyph(parts.lamp ? C.sunDark : C.metalMid), 0, 0.8),
  ])
}

function gauge(parts: FuelParts): Art {
  const dim = parts.asleep
  const dial = dim ? mix(C.cream, GLASS, 0.3) : C.cream
  const on = segmentColor(parts.lit)
  const off = dim ? mix(C.creamDark, GLASS, 0.3) : C.creamDark
  const blade = svg`<path d="M-3.2 0L0-22.5L3.2 0Z" fill=${INK} stroke=${INK} stroke-width="1.6" stroke-linejoin="round" />`
  return part(
    'gauge',
    at(150, 48, [
      svg`<circle r="32" fill=${C.metalDark} />`,
      svg`<circle r="28.5" fill=${dial} />`,
      Array.from({ length: SEGMENTS }, (_, i) =>
        segment(i, i < parts.lit ? (dim ? mix(on, GLASS, 0.3) : on) : off),
      ),
      gaugeLamp(parts),
      part(
        'needle',
        at(
          0,
          2,
          parts.alarm ? motion('wobble', at(0, 0, blade, parts.angle / 8)) : blade,
          parts.alarm ? parts.angle * 0.875 : parts.angle,
        ),
      ),
      svg`<circle cy="2" r="5" fill=${INK} /><circle cy="2" r="1.8" fill=${C.metalMid} />`,
      when(parts.rust, () =>
        part(
          'gauge-crack',
          svg`<path d="M12-23l-5 7 6 3-6 8" fill="none" stroke=${C.metalDark} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />`,
        ),
      ),
      when(
        !dim,
        () =>
          svg`<path d="M-19-14a24 24 0 0 1 9-7" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55" />`,
      ),
    ]),
  )
}

function displayBars(mode: FuelDisplay): Art {
  const xs = [21.4, 27, 32.6, 38.2]
  const heights: Record<FuelDisplay, readonly number[]> = {
    off: [],
    idle: [3, 3, 3, 3],
    low: [3],
    pumping: [10, 16, 8, 13],
    done: [16, 16, 16, 16],
    paid: [],
  }
  const color = mode === 'low' ? C.coral : mode === 'done' ? C.mint : C.sun
  if (mode === 'paid') {
    return part(
      'display',
      svg`<path d="M24 85L29.5 90.5L38.5 79" fill="none" stroke=${C.mint} stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" />`,
    )
  }
  return part(
    'display',
    heights[mode].map((h, i) => {
      const bar = svg`<rect x=${xs[i]} y=${95 - h} width="4.2" height=${h} rx="1.2" fill=${color} />`
      return mode === 'pumping' ? motion('flicker', bar, i + 1) : bar
    }),
  )
}

function nozzle(): Art {
  return [
    svg`<path d="M-2 4L3 22" stroke=${C.metalMid} stroke-width="5.5" stroke-linecap="round" />`,
    svg`<path d="M-9 4q0 9 9 9" fill="none" stroke=${C.sunDark} stroke-width="2.8" stroke-linecap="round" />`,
    svg`<rect x="-11" y="-8" width="21" height="13" rx="4.5" fill=${C.sun} />`,
    svg`<rect x="-11" y="-1" width="21" height="6" rx="3" fill=${C.sunDark} />`,
  ]
}

function hungNozzle(): Art {
  return part('holster', [
    svg`<path d="M41 134C42 170 20 170 20 134" fill="none" stroke=${HOSE} stroke-width="5" stroke-linecap="round" />`,
    svg`<rect x="35" y="112" width="12" height="5" rx="2" fill=${C.mintDark} />`,
    at(41, 122, nozzle(), 180, 0.78),
  ])
}

function receipt(): Art {
  const rows = [118, 124, 130, 136].map(
    (y, i) =>
      svg`<rect x="-7" y=${y - 106} width=${i % 2 ? 9 : 14} height="2.6" rx="1.3" fill=${C.creamDark} />`,
  )
  return part(
    'receipt',
    at(
      25,
      106,
      motion('sway', [
        svg`<path d="M-10 0H10V56L6.7 60L3.3 56L0 60L-3.3 56L-6.7 60L-10 56Z" fill=${PAPER} />`,
        rows,
        svg`<rect x="-7" y="39" width="14" height="6" rx="2" fill=${C.coral} />`,
      ]),
    ),
  )
}

function pump(parts: FuelParts): Art {
  const lit = parts.display !== 'off'
  return part('pump', [
    shadow(31, 183, 24, 0.26),
    svg`<rect x="10" y="172" width="42" height="11" rx="3.5" fill=${C.metalDark} />`,
    svg`<rect x="25" y="56" width="12" height="10" fill=${C.metalMid} />`,
    svg`<circle cx="31" cy="48" r="12.5" fill=${lit ? C.cream : C.creamDark} />`,
    svg`<rect x="18.5" y="46" width="25" height="4.5" fill=${lit ? C.sun : C.metalDark} />`,
    svg`<rect x="13" y="62" width="36" height="114" rx="10" fill=${C.mint} />`,
    svg`<path d="M41 62h-2a10 10 0 0 1 3 7V176h-3h0h0a10 10 0 0 0 10-10V72A10 10 0 0 0 39 62Z" fill=${C.mintDark} />`,
    svg`<rect x="17" y="70" width="28" height="29" rx="5" fill=${C.cream} />`,
    svg`<rect x="19.5" y="72.5" width="23" height="24" rx="3" fill=${GLASS} />`,
    displayBars(parts.display),
    when(!parts.pumping, hungNozzle),
    when(parts.receipt, () => [
      svg`<rect x="13" y="102" width="24" height="6" rx="3" fill=${INK} />`,
      receipt(),
    ]),
    when(
      parts.pumping,
      () => svg`<rect x="44" y="116" width="9" height="11" rx="3" fill=${C.mintDark} />`,
    ),
  ])
}

function arch(x: number, color: string): Art {
  return svg`<path d=${`M${x - 19.5} 171A19.5 19.5 0 0 1 ${x + 19.5} 171Z`} fill=${color} />`
}

function wheel(x: number, rim: string, flat: boolean): Art {
  return at(x, AXLE_Y, [
    flat
      ? svg`<path d="M-15 0A15 15 0 0 1 15 0L20 8Q21 11.5 17 11.5H-17Q-21 11.5-20 8Z" fill=${TYRE} />`
      : svg`<circle r="15" fill=${TYRE} />`,
    svg`<circle r="10" fill=${PAPER} />`,
    svg`<circle r="7" fill=${rim} />`,
    svg`<circle r="2.6" fill=${C.metalDark} />`,
  ])
}

function dustSpecks(level: number): Art {
  return when(level > 0, () =>
    part(
      'car-dust',
      [
        [134, 90.5, 11, 2.2],
        [170, 126.5, 9, 2],
        [80, 124, 7, 1.8],
      ]
        .slice(0, level)
        .map(
          ([x, y, rx, ry]) =>
            svg`<ellipse cx=${x} cy=${y} rx=${rx} ry=${ry} fill=${DUST} opacity=".85" />`,
        ),
    ),
  )
}

function rustPatches(): Art {
  return part('rust', [
    svg`<path d="M104 156C108 152 116 153 118 157C120 160 113 164 107 162C103 161 102 158 104 156Z" fill=${RUST} />`,
    svg`<path d="M108 158c2-2 5-2 7 0" fill="none" stroke=${RUST_DARK} stroke-width="1.8" stroke-linecap="round" />`,
    svg`<path d="M172 137C176 133 183 135 184 139C185 143 179 146 174 144C171 142 170 139 172 137Z" fill=${RUST} />`,
    svg`<path d="M70 144C73 141 77 142 78 145C78 148 74 150 71 149C69 148 69 146 70 144Z" fill=${RUST} />`,
  ])
}

function filler(parts: FuelParts, paint: string, deep: string): Art {
  if (!parts.capOff) {
    return part('filler', [
      svg`<circle cx=${FILLER_X} cy=${FILLER_Y} r="7" fill=${deep} />`,
      svg`<circle cx=${FILLER_X} cy=${FILLER_Y} r="4.8" fill=${paint} />`,
    ])
  }
  const ridges = [0, 60, 120].map(
    (a) =>
      svg`<path d="M0-8.6V8.6" transform=${`rotate(${a})`} stroke=${C.metalDark} stroke-width="1.8" />`,
  )
  return part('filler', [
    svg`<circle cx=${FILLER_X} cy=${FILLER_Y} r="8" fill=${deep} />`,
    svg`<circle cx=${FILLER_X} cy=${FILLER_Y} r="5.6" fill=${INK} />`,
    svg`<path d=${`M${FILLER_X - 4} ${FILLER_Y + 3}Q${FILLER_X - 8} ${FILLER_Y + 8} ${FILLER_X - 11} ${FILLER_Y + 7}`} fill="none" stroke=${C.metalMid} stroke-width="2" stroke-linecap="round" />`,
    part(
      'cap',
      at(
        FILLER_X - 12,
        FILLER_Y + 9,
        motion('wobble', [
          ridges,
          svg`<circle r="7.4" fill=${C.metal} />`,
          svg`<rect x="-4" y="-1.4" width="8" height="2.8" rx="1.4" fill=${C.metalDark} />`,
        ]),
      ),
    ),
  ])
}

function car(parts: FuelParts, accent: string): Art {
  const weathered = parts.dust / DUST_AT.length
  const paint = mix(accent, DUST, weathered * 0.3)
  const deep = shadeOf(paint)
  const light = tintOf(paint)
  const ink = mix(paint, INK, 0.82)
  const lit = parts.pumping || parts.shiny
  const windows = parts.asleep ? mix(GLASS, INK, 0.3) : GLASS
  const rim = parts.shiny ? PAPER : C.metalMid
  return [
    part('exhaust', [
      svg`<rect x="56" y="167" width="16" height="6" rx="2.6" fill=${C.metalDark} />`,
      svg`<ellipse cx="57" cy="170" rx="1.8" ry="3" fill=${INK} />`,
    ]),
    svg`<path d=${BODY} fill=${paint} data-part="car" />`,
    svg`<path d=${SKIRT} fill=${deep} />`,
    svg`<path d="M64.5 130V143" stroke=${C.sun} stroke-width="5" stroke-linecap="round" data-part="tail-light" />`,
    arch(REAR_AXLE, deep),
    arch(FRONT_AXLE, deep),
    wheel(REAR_AXLE, rim, parts.flat),
    wheel(FRONT_AXLE, rim, false),
    svg`<path d=${REAR_GLASS} fill=${windows} /><path d=${FRONT_GLASS} fill=${windows} />`,
    svg`<path d="M114 119C116 110 119 104 123 102" fill="none" stroke=${GLASS_LIGHT} stroke-width="4" stroke-linecap="round" />`,
    svg`<rect x="70" y="127.5" width="114" height="4" rx="2" fill=${light} />`,
    svg`<rect x="57" y="155" width="19" height="10" rx="4" fill=${C.metal} />`,
    svg`<rect x="57" y="160" width="19" height="5" rx="2.5" fill=${C.metalMid} />`,
    svg`<rect x="175" y="155" width="17" height="10" rx="4" fill=${C.metal} />`,
    svg`<rect x="175" y="160" width="17" height="5" rx="2.5" fill=${C.metalMid} />`,
    svg`<ellipse cx="181" cy="141" rx="5" ry="7" fill=${lit ? C.spark : C.creamDark} data-part="headlight" />`,
    svg`<rect x="114" y="133.5" width="10" height="3.4" rx="1.7" fill=${deep} />`,
    when(parts.rust, rustPatches),
    dustSpecks(parts.dust),
    filler(parts, paint, deep),
    face(133, 145, parts.mood, ink, 0.95),
    when(parts.shiny, () =>
      part('shine', [
        svg`<path d="M126 93L112 124M134 93L120 124" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".6" />`,
        svg`<path d="M168 131Q175 132 178 136" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75" />`,
      ]),
    ),
  ]
}

function posedCar(parts: FuelParts, accent: string): Art {
  const art = car(parts, accent)
  const tilted = parts.flat ? at(FRONT_AXLE, 184, at(-FRONT_AXLE, -184, art), -3) : art
  if (parts.pumping || parts.shiny) return motion('bob', tilted)
  return parts.puffs >= 3 ? motion('rumble', tilted) : tilted
}

function fuelHose(): Art {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = HOSE_ARC
  const d = `M${x0} ${y0}C${x1} ${y1} ${x2} ${y2} ${x3} ${y3}`
  return part('hose', [
    svg`<path d=${d} fill="none" stroke=${HOSE} stroke-width="6.5" stroke-linecap="round" />`,
    [0.2, 0.5, 0.8].map((t, i) => {
      const [x, y] = hosePoint(t)
      return at(x, y, motion('pulse', svg`<circle r="2.4" fill=${C.sun} />`, i + 1))
    }),
    at(FILLER_X - 1, 114, nozzle()),
  ])
}

function puff(x: number, y: number, size: number, delay: number): Art {
  return part(
    'puff',
    at(
      x,
      y,
      motion(
        'drift',
        at(
          0,
          0,
          [
            svg`<g fill=${SOOT}><circle cx="-10" cy="3" r="9" /><circle cx="2" cy="-4" r="12" /><circle cx="13" cy="4" r="8" /><rect x="-17" y="3" width="36" height="9" rx="4.5" /></g>`,
            svg`<path d="M-5-9a8 8 0 0 1 9-2" fill="none" stroke=${SOOT_LIGHT} stroke-width="3" stroke-linecap="round" />`,
            svg`<path d="M-15 1a5 5 0 0 1 4-3" fill="none" stroke=${SOOT_LIGHT} stroke-width="2.4" stroke-linecap="round" />`,
          ],
          0,
          size,
        ),
        delay,
      ),
    ),
  )
}

const TAIL_PUFFS: ReadonlyArray<readonly [number, number, number]> = [
  [50, 158, 0.55],
  [72, 98, 0.85],
  [100, 68, 1],
  [80, 36, 1.3],
]

const WAITING_PUFFS: ReadonlyArray<readonly [number, number, number]> = [
  [50, 158, 0.55],
  [100, 66, 0.9],
  [72, 40, 1.15],
  [112, 28, 0.8],
]

function tumbleweed(): Art {
  return part(
    'tumbleweed',
    at(
      26,
      172,
      motion('wobble', [
        svg`<circle r="14" fill=${WEED} opacity=".35" />`,
        svg`<path d="M-12-3C-5-13 6-13 12-4M-11 6C-5-2 6-3 11 6M-6 11C-10 2-6-9 1-13M6 11C11 2 8-8 0-13M-13 2C-5 7 6 7 13 1" fill="none" stroke=${WEED} stroke-width="2.8" stroke-linecap="round" />`,
      ]),
    ),
  )
}

function vulture(): Art {
  return part(
    'vulture',
    at(
      31,
      38,
      at(
        0,
        0,
        motion('sway', [
          svg`<path d="M-5 0v3M4 0v3" stroke=${C.sunDark} stroke-width="2.4" stroke-linecap="round" />`,
          svg`<path d="M-15 1C-15-12-8-20 1-20C10-20 13-11 12 1Q0 4-15 1Z" fill=${FEATHER_DARK} />`,
          svg`<path d="M-15 1C-16-8-11-14-5-15C1-11 2-4-3 2Q-9 3-15 1Z" fill=${FEATHER} />`,
          svg`<path d="M6-18C6-25 9-27 13-26" fill="none" stroke=${C.pink} stroke-width="5" stroke-linecap="round" />`,
          svg`<ellipse cx="5" cy="-18" rx="8.5" ry="4" fill=${C.cream} />`,
          svg`<circle cx="14" cy="-26" r="5" fill=${C.pink} />`,
          svg`<path d="M18-28Q24-27 22-21Q20-24 17-24Z" fill=${C.sun} />`,
          svg`<circle cx="15" cy="-27.5" r="1.5" fill=${INK} />`,
        ]),
      ),
      0,
      0.78,
    ),
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

function plea(): Art {
  return part('plea', [
    svg`<circle cx="112" cy="84" r="3.5" fill=${C.cream} /><circle cx="104" cy="74" r="6" fill=${C.cream} />`,
    at(
      84,
      46,
      motion('pulse', [svg`<circle r="24" fill=${C.cream} />`, drop(0, 1, C.sunDark, 1.8)]),
    ),
  ])
}

function moon(): Art {
  return part(
    'moon',
    at(80, 40, svg`<path d="M5-16A17 17 0 1 0 16 10A14 14 0 0 1 5-16Z" fill=${C.spark} />`, -8),
  )
}

function arrow(): Art {
  return part(
    'put-cap-back',
    at(
      FILLER_X + 3,
      108,
      motion(
        'bob',
        svg`<path d="M0-13V3M-9-5L0 4L9-5" fill="none" stroke=${C.sun} stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
  )
}

export function fuel(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = fuelParts(scene)
  const accent = accentOf(scene, C.coral)
  const puffSpots = parts.receipt ? WAITING_PUFFS : TAIL_PUFFS
  const art: Art = [
    shadow(124, 184, 66),
    pump(parts),
    when(parts.asleep, moon),
    when(parts.alarm && parts.puffs < 2, plea),
    gauge(parts),
    part('fuel-car', posedCar(parts, accent)),
    when(parts.pumping, fuelHose),
    when(parts.receipt, arrow),
    when(parts.tumbleweed, tumbleweed),
    when(parts.vulture, vulture),
    puffSpots.slice(0, parts.puffs).map(([x, y, size], i) => puff(x, y, size, i + 1)),
    when(parts.sweat, () =>
      part('sweat', at(170, 113, motion('drip', drop(0, 0, C.water, 0.85), 2))),
    ),
    when(parts.asleep && parts.puffs < 3, () => [zed(112, 82, 0.5, 1), zed(100, 68, 0.8, 3)]),
    when(parts.shiny, () => [
      sparkle(96, 34, 1.15, 1),
      sparkle(176, 104, 1.1, 2),
      sparkle(70, 84, 0.8, 3),
      sparkle(116, 66, 0.65, 4),
      sparkle(66, 150, 0.7, 5),
    ]),
  ]
  return frame('fuel', scene, options, art)
}
