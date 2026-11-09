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
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export interface MusicParts {
  step: number
  slack: readonly number[]
  snapped: number
  cobweb: boolean
  sour: number
  stench: number
  flies: number
  grime: number
  tilt: number
  mood: Mood
  zeds: boolean
  plea: boolean
  playing: boolean
  tuning: boolean
  golden: boolean
}

export const MAX_STEP = 4

const SNAP_AT = [0.08, 0.42] as const
const COBWEB_AT = 0.25
const SOUR_AT = [0.5, 0.68, 0.86] as const
const STENCH_AT = [0.62, 0.82] as const
const FLIES_AT = [0.78, 0.94] as const
const SICK_AT = 0.6
const SLACK_ORDER: readonly number[] = [3, 0, 2, 1]
const SLACK_GAIN = 2

const DEFAULT_BODY = '#ee9a4a'
const FRETBOARD = '#3f2c26'
const STRING = '#f4f0e6'
const DUST = '#e6dcc4'
const DUST_DARK = '#a89a7c'
const WEB = '#eef2fa'
const STAND = '#7c86a6'
const STAND_DARK = '#5d6685'
const SOUR = '#a8d94f'
const SOUR_DARK = '#7fae34'
const CHEEK = '#ff8a7a'

function slackFor(step: number): number[] {
  return [0, 1, 2, 3].map((string) => {
    const order = SLACK_ORDER.indexOf(string)
    return Math.max(0, step - order) * SLACK_GAIN
  })
}

export function musicParts(scene: SceneView): MusicParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const snapped = reached(stink, SNAP_AT)
  const cobweb = stink >= COBWEB_AT
  const sour = reached(stink, SOUR_AT)
  const stench = reached(stink, STENCH_AT)
  const flies = reached(stink, FLIES_AT)
  const grime = reached(stink, [...SNAP_AT, COBWEB_AT, ...SOUR_AT]) / 6
  const sick = stink >= SICK_AT
  const calm = {
    step: 0,
    slack: slackFor(0),
    snapped,
    cobweb,
    sour,
    stench,
    flies,
    grime,
    tilt: -3,
    zeds: false,
    plea: false,
    playing: false,
    tuning: false,
    golden: false,
  }
  if (state === 'clean') return { ...calm, tilt: 3, mood: 'happy', golden: true }
  if (state === 'running') {
    return { ...calm, cobweb: false, flies: 0, tilt: 0, mood: 'happy', playing: true }
  }
  if (state === 'waiting') {
    return {
      ...calm,
      snapped: Math.min(1, snapped),
      slack: [SLACK_GAIN * 2, 0, 0, 0],
      tilt: -2,
      mood: sick ? 'sick' : 'calm',
      tuning: true,
    }
  }
  if (state === 'due') {
    return {
      ...calm,
      step: MAX_STEP,
      slack: slackFor(MAX_STEP),
      tilt: -8,
      mood: sick ? 'sick' : 'pleading',
      plea: true,
    }
  }
  if (state === 'resting') {
    return { ...calm, mood: sick ? 'sick' : 'sleepy', zeds: true }
  }
  const step = Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  let mood: Mood = step >= 3 ? 'worried' : 'calm'
  if (sick) mood = 'sick'
  return { ...calm, step, slack: slackFor(step), tilt: -3 - step, mood }
}

const BODY =
  'M0 0C30 0 47-12 47-33C47-51 31-54 31-67C31-75 37-79 36-88C35-101 20-106 0-106C-20-106-35-101-36-88C-37-79-31-75-31-67C-31-54-47-51-47-33C-47-12-30 0 0 0Z'
const HEAD = 'M-9-139L-12.5-160Q-13.5-168-5-168H5Q13.5-168 12.5-160L9-139Z'
const NOTE_FLAG = 'M3.4-15C5-6 15-5 12 7C11 0 8-3 3.4-4Z'
const STAR = 'M0-12L3.4-4.2L11.8-3.6L5.4 1.8L7.4 10L0 5.6L-7.4 10L-5.4 1.8L-11.8-3.6L-3.4-4.2Z'
const BUTTERFLY =
  'M-12.5 0C-12.5-8-3-6 0-2.4C3-6 12.5-8 12.5 0C12.5 8 3 6 0 2.4C-3 6-12.5 8-12.5 0Z'
const PICK = 'M0 11C-3 8-9.5 0-9.5-5C-9.5-9-5-10 0-10C5-10 9.5-9 9.5-5C9.5 0 3 8 0 11Z'

const BRIDGE_Y = -46
const NUT_Y = -140
const PEG_Y = [-148.5, -159.5, -159.5, -148.5] as const

function bridgeX(string: number): number {
  return -12 + string * 8
}

function nutX(string: number): number {
  return -5.4 + string * 3.6
}

function stringPath(string: number, slack: number): string {
  const x0 = bridgeX(string)
  const x1 = nutX(string)
  const midY = (BRIDGE_Y + NUT_Y) / 2
  if (slack === 0) return `M${x0} ${BRIDGE_Y}L${x1} ${NUT_Y}`
  const side = string < 2 ? -1 : 1
  const bow = (5 + slack * 2.2) * side
  return `M${x0} ${BRIDGE_Y}C${round(x0 + bow)} ${BRIDGE_Y - 22} ${round(x1 + (x0 - x1) / 2 + bow * 1.5)} ${midY + 2} ${round(x1 - bow * 0.28)} ${NUT_Y + 26}Q${round(x1 + bow * 0.2)} ${NUT_Y + 12} ${x1} ${NUT_Y}`
}

function strings(parts: MusicParts): Art {
  const missing = new Set([3, 1].slice(0, parts.snapped))
  return part(
    'strings',
    [0, 1, 2, 3]
      .filter((string) => !missing.has(string))
      .map((string) => {
        const slack = parts.slack[string] ?? 0
        return svg`<path d=${stringPath(string, slack)} fill="none" stroke=${STRING} stroke-width="1.9" stroke-linecap="round" />`
      }),
  )
}

function turnArrow(): Art {
  return svg`<path d="M-12-12A17 17 0 0 1 12-12M12-12l-.6 6.4M12-12l-6.4-.6" fill="none" stroke=${C.spark} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`
}

function peg(string: number, parts: MusicParts): Art {
  const side = string < 2 ? -1 : 1
  const x = side * 11
  const y = PEG_Y[string] ?? 0
  const droop = (parts.slack[string] ?? 0) * 7 * -side
  const turning = parts.tuning && string === 0
  if (turning) {
    return part('turning-peg', [
      svg`<rect x="-23" y=${y - 2} width="14" height="4" rx="2" fill=${C.metalMid} />`,
      at(-26, y, [
        motion(
          'spin',
          at(
            0,
            0,
            [svg`<path d=${BUTTERFLY} fill=${C.sun} />`, svg`<circle r="2.8" fill=${C.sunDark} />`],
            35,
          ),
        ),
        motion('flicker', turnArrow(), 1),
        motion('flicker', at(0, 0, turnArrow(), 180), 3),
      ]),
    ])
  }
  return at(x, y, [
    svg`<rect x=${side > 0 ? 0 : -8} y="-1.6" width="8" height="3.2" fill=${C.metalMid} />`,
    at(
      side * 9.5,
      0,
      svg`<rect x="-3.5" y="-5.2" width="7" height="10.4" rx="3" fill=${C.metal} />`,
      droop,
    ),
  ])
}

function head(accent: string, parts: MusicParts): Art {
  return part('headstock', [
    [0, 1, 2, 3].map((string) => peg(string, parts)),
    svg`<path d=${HEAD} fill=${shadeOf(accent, 0.34)} />`,
    svg`<path d="M-5.6-145L-6.8-160H-2.4V-145ZM5.6-145L6.8-160H2.4V-145Z" fill=${shadeOf(accent, 0.62)} />`,
  ])
}

function neck(accent: string): Art {
  return part('neck', [
    svg`<rect x="-10.5" y="-142" width="21" height="46" fill=${shadeOf(accent, 0.34)} />`,
    svg`<path d="M-8.4-140H8.4L9.6-94Q9.6-92 7.6-92H-7.6Q-9.6-92-9.6-94Z" fill=${FRETBOARD} />`,
    [-132, -122, -113, -105, -98].map(
      (y) => svg`<rect x="-9" y=${y} width="18" height="1.8" fill=${C.metalDark} opacity=".85" />`,
    ),
    svg`<rect x="-8.4" y="-142.5" width="16.8" height="4" rx="1.4" fill=${C.cream} />`,
  ])
}

function body(accent: string, parts: MusicParts): Art {
  const dull = mix(accent, DUST_DARK, parts.step * 0.07 + parts.grime * 0.25)
  const rim = shadeOf(dull, 0.34)
  const glow = tintOf(dull, 0.2)
  const shine = tintOf(dull, 0.62)
  return part('body', [
    svg`<path d=${BODY} fill=${rim} />`,
    at(0, -53, at(0, 53, svg`<path d=${BODY} fill=${dull} />`), 0, 0.93),
    at(0, -36, at(0, 53, svg`<path d=${BODY} fill=${glow} opacity=".42" />`), 0, 0.68),
    svg`<path d="M-39-38C-39-26-33-16-24-11" fill="none" stroke=${shine} stroke-width="4.6" stroke-linecap="round" opacity=".85" />`,
    svg`<path d="M-29-92C-27-96-23-98-18-99.5" fill="none" stroke=${shine} stroke-width="3.8" stroke-linecap="round" opacity=".85" />`,
    svg`<circle cy="-74" r="18.5" fill=${C.cream} />`,
    svg`<circle cy="-74" r="16.4" fill=${rim} />`,
    svg`<circle cy="-74" r="14" fill=${shadeOf(dull, 0.84)} />`,
    svg`<rect x="-23" y="-51" width="46" height="8.6" rx="4" fill=${FRETBOARD} />`,
    [0, 1, 2, 3].map(
      (string) =>
        svg`<circle cx=${bridgeX(string)} cy=${BRIDGE_Y - 0.6} r="1.7" fill=${C.cream} />`,
    ),
  ])
}

function dustSpecks(step: number): Art {
  if (step === 0) return []
  const specks = [
    [-30, -46, 1.9],
    [33, -30, 2.1],
    [-26, -62, 1.5],
    [24, -91, 1.8],
    [-34, -19, 1.7],
    [20, -14, 1.5],
    [-22, -88, 1.6],
    [29, -50, 1.5],
  ] as const
  return part(
    'dust',
    specks
      .slice(0, step * 2)
      .map(([x, y, r]) => svg`<circle cx=${x} cy=${y} r=${r} fill=${DUST} opacity=".85" />`),
  )
}

const SHOULDER =
  'M-10-105C-22-108-36-103-38.5-87C-34-92-31-90-27-91C-23-96-19-93-16-95C-13-99-11-97-10-98Z'

function dustBlanket(step: number): Art {
  return part('dust-blanket', [
    when(step >= 2, () => [
      svg`<path d=${SHOULDER} fill=${DUST} />`,
      svg`<g transform="scale(-1 1)"><path d=${SHOULDER} fill=${DUST} /></g>`,
    ]),
    when(
      step >= 3,
      () =>
        svg`<path d="M-14.5-162Q-15-172-5-172Q0-175 5-172Q15-172 14.5-162Q10-165 6-163Q2-167-3-163Q-9-166-14.5-162Z" fill=${DUST} />`,
    ),
    when(step >= 4, () => [
      svg`<path d="M-33-55C-41-53-48-44-48.5-34C-44-40-41-37-38-41C-35-46-32-44-30-48Z" fill=${DUST} />`,
      svg`<path d="M33-55C41-53 48-44 48.5-34C44-40 41-37 38-41C35-46 32-44 30-48Z" fill=${DUST} />`,
    ]),
  ])
}

function coil(loops: number, step: number, radius: number): string {
  const count = loops * 14
  const points = Array.from({ length: count + 1 }, (_, i) => {
    const t = (i / count) * loops * Math.PI * 2
    return [(step * t) / (Math.PI * 2) - radius * Math.sin(t), radius - radius * Math.cos(t)]
  })
  return points.map(([x = 0, y = 0], i) => `${i ? 'L' : 'M'}${round(x)} ${round(y)}`).join('')
}

function spring(): Art {
  return svg`<path d=${coil(4, 8.5, 5.4)} fill="none" stroke=${STRING} stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" />`
}

function stub(d: string): Art {
  return svg`<path d=${d} fill="none" stroke=${STRING} stroke-width="2.3" stroke-linecap="round" />`
}

function snappedStrings(count: number): Art {
  return part('snapped', [
    when(count >= 1, () => [
      at(bridgeX(3), BRIDGE_Y, spring(), -14),
      stub(`M${nutX(3)} ${NUT_Y}q2 14 9 13q5-4-1-7`),
    ]),
    when(count >= 2, () => [
      at(nutX(1), NUT_Y + 4, spring(), 150),
      stub(`M${bridgeX(1)} ${BRIDGE_Y}q-8-12-1-18q7-4 6 3`),
    ]),
  ])
}

function webArt(): Art {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const angle = ((i * 45 + 12) * Math.PI) / 180
    return [Math.cos(angle) * 14.6, Math.sin(angle) * 14.6] as const
  })
  const ring = (k: number): string =>
    spokes
      .map(([x, y], i) => {
        const [nx, ny] = spokes[(i + 1) % spokes.length] ?? [x, y]
        const end = `${round(nx * k)} ${round(ny * k)}`
        const ctrl = `${round(((x + nx) / 2) * k * 0.72)} ${round(((y + ny) / 2) * k * 0.72)}`
        return `${i ? '' : `M${round(x * k)} ${round(y * k)}`}Q${ctrl} ${end}`
      })
      .join('')
  return part(
    'cobweb',
    at(0, -74, [
      svg`<g fill="none" stroke=${WEB} stroke-width="1.5" stroke-linecap="round" opacity=".95">
        ${spokes.map(([x, y]) => svg`<path d=${`M0 0L${round(x)} ${round(y)}`} />`)}
        <path d=${ring(0.45)} />
        <path d=${ring(0.8)} />
      </g>`,
      at(5, 2, [
        svg`<path d="M0-6V-16" stroke=${WEB} stroke-width="1.2" />`,
        motion('bob', [
          svg`<circle r="4.6" fill=${C.fly} stroke=${WEB} stroke-width="1" />`,
          svg`<path d="M-4-2l-4-3M-4 1l-5 1M4-2l4-3M4 1l5 1" stroke=${WEB} stroke-width="1.3" stroke-linecap="round" />`,
        ]),
      ]),
    ]),
  )
}

function guitar(accent: string, parts: MusicParts): Art {
  const ink = shadeOf(accent, 0.84)
  const cheeks =
    parts.mood === 'happy' || parts.mood === 'pleading'
      ? svg`<ellipse cx="-27" cy="-18" rx="6.5" ry="4" fill=${CHEEK} opacity=".6" /><ellipse cx="27" cy="-18" rx="6.5" ry="4" fill=${CHEEK} opacity=".6" />`
      : []
  return part('guitar', [
    head(accent, parts),
    body(accent, parts),
    neck(accent),
    dustSpecks(parts.step),
    strings(parts),
    when(parts.playing, () =>
      motion('flicker', [
        svg`<path d="M-16-48Q-23-74-8-94M16-48Q23-74 8-94" fill="none" stroke=${C.spark} stroke-width="2" stroke-linecap="round" opacity=".8" />`,
      ]),
    ),
    when(parts.cobweb, webArt),
    when(parts.snapped > 0, () => snappedStrings(parts.snapped)),
    cheeks,
    face(0, -24, parts.mood, ink, 1.2),
    when(parts.plea, () => [
      at(-19, -15, motion('drip', drop(0, 0, C.water, 0.66), 1)),
      at(19, -13, motion('drip', drop(0, 0, C.water, 0.56), 3)),
    ]),
    when(parts.playing, () =>
      part(
        'pick',
        at(
          23,
          -60,
          motion('wobble', [
            svg`<path d=${PICK} fill=${C.sky} />`,
            svg`<path d="M-5-5.5H2" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".7" />`,
          ]),
          62,
          1,
        ),
      ),
    ),
    dustBlanket(parts.step),
  ])
}

function stand(): Art {
  return part('stand', [
    svg`<path d="M84 174L42 184M84 174L126 184" stroke=${STAND} stroke-width="6" stroke-linecap="round" />`,
    svg`<rect x="36" y="181" width="13" height="5" rx="2.5" fill=${STAND_DARK} /><rect x="119" y="181" width="13" height="5" rx="2.5" fill=${STAND_DARK} />`,
  ])
}

function cradle(): Art {
  return part(
    'cradle',
    svg`<path d="M55 165Q60 178 84 178Q108 178 113 165" fill="none" stroke=${STAND_DARK} stroke-width="6.5" stroke-linecap="round" />`,
  )
}

function metronomeArm(): Art {
  return [
    svg`<rect x="-2" y="-52" width="4" height="56" rx="2" fill=${C.metalDark} />`,
    svg`<path d="M-7.5-38H7.5L5.5-26H-5.5Z" fill=${C.sun} />`,
    svg`<rect x="-5.5" y="-33" width="11" height="2.4" fill=${C.sunDark} />`,
  ]
}

function metronome(parts: MusicParts): Art {
  const frozen = parts.step >= MAX_STEP || parts.snapped >= 2
  const ticks = [-62, -54, -46, -38, -30, -22].map(
    (y, i) =>
      svg`<rect x=${i % 2 ? -6 : -8} y=${y} width=${i % 2 ? 12 : 16} height="2" rx="1" fill=${C.creamDark} />`,
  )
  const arm = parts.playing
    ? [
        motion('wobble', metronomeArm()),
        motion(
          'flicker',
          svg`<path d="M-10-38Q-12.5-29-10-20M10-38Q12.5-29 10-20" fill="none" stroke=${C.skyDark} stroke-width="2.8" stroke-linecap="round" />`,
          2,
        ),
      ]
    : at(0, 0, metronomeArm(), frozen ? 24 : 0)
  return part(
    'metronome',
    at(162, 184, [
      svg`<path d="M-24-2L-14-76Q-13-83-6-83H6Q13-83 14-76L24-2Z" fill=${C.lilac} />`,
      svg`<path d="M9-83Q13-82 14-76L24-2H15Z" fill=${C.lilacDark} />`,
      svg`<path d="M-11-72Q-10.5-76-7-76H7Q10.5-76 11-72L15-14H-15Z" fill=${C.cream} />`,
      ticks,
      svg`<rect x="-28" y="-13" width="56" height="13" rx="4.5" fill=${C.lilacDark} />`,
      svg`<rect x="-3" y="-90" width="6" height="8" rx="2.5" fill=${C.lilacDark} />`,
      svg`<path d="M18-40H24" stroke=${C.lilacDark} stroke-width="3.4" stroke-linecap="round" /><rect x="23" y="-48" width="4.5" height="16" rx="2.2" fill=${C.sun} />`,
      at(0, -19, arm),
      svg`<circle cy="-19" r="4" fill=${C.metalDark} />`,
      when(parts.step >= 2, () => [
        svg`<path d="M-15-80Q-15-90-7-88Q0-94 7-88Q15-90 15-80Q10-83 6-81Q1-85-4-81Q-9-84-15-80Z" fill=${DUST} />`,
      ]),
    ]),
  )
}

function note(color: string, shade: string): Art {
  return [
    svg`<ellipse cx="-3" cy="12" rx="7.6" ry="5.8" transform="rotate(-22 -3 12)" fill=${color} />`,
    svg`<rect x="0.6" y="-15" width="4" height="27" rx="1.6" fill=${color} />`,
    svg`<path d=${NOTE_FLAG} fill=${shade} />`,
  ]
}

function beamed(color: string, shade: string): Art {
  return [
    svg`<ellipse cx="-13" cy="12" rx="7" ry="5.3" transform="rotate(-22 -13 12)" fill=${color} />`,
    svg`<ellipse cx="11" cy="8" rx="7" ry="5.3" transform="rotate(-22 11 8)" fill=${color} />`,
    svg`<rect x="-9.4" y="-12" width="3.8" height="24" rx="1.5" fill=${color} />`,
    svg`<rect x="14.6" y="-16" width="3.8" height="24" rx="1.5" fill=${color} />`,
    svg`<path d="M-9.4-15L18.4-19V-11.5L-9.4-7.5Z" fill=${shade} />`,
  ]
}

function sourNote(): Art {
  return [
    svg`<path d="M-1 12C-2 2 7-8 2-17" fill="none" stroke=${SOUR} stroke-width="4.4" stroke-linecap="round" />`,
    svg`<path d="M2-17C9-19 16-14 15-6C11-11 7-11 3.5-10Z" fill=${SOUR_DARK} />`,
    svg`<ellipse cx="-5" cy="13" rx="8" ry="6" transform="rotate(-14 -5 13)" fill=${SOUR} />`,
    svg`<path d="M-9.5 12l2.4 2.4m0-2.4l-2.4 2.4M-3 11l2.4 2.4m0-2.4L-3 13.4" stroke=${SOUR_DARK} stroke-width="1.5" stroke-linecap="round" />`,
    at(-7, 26, motion('drip', drop(0, 0, SOUR, 0.42), 2)),
  ]
}

const FLYING = [
  [26, 60, -14, 1.14, 'note', C.mint, C.mintDark, 1],
  [130, 44, 12, 1.2, 'beamed', C.sun, C.sunDark, 2],
  [174, 78, 16, 0.98, 'note', C.pink, C.pinkDark, 3],
  [28, 122, 10, 0.88, 'beamed', C.lilac, C.lilacDark, 4],
  [162, 26, -10, 0.86, 'note', C.sky, C.skyDark, 5],
] as const

function flyingNotes(sour: number): Art {
  return part(
    'notes',
    FLYING.map(([x, y, rotate, size, kind, color, shade, delay], i) => {
      const art =
        i < sour ? sourNote() : kind === 'note' ? note(color, shade) : beamed(color, shade)
      return at(x, y, motion(i < sour ? 'wobble' : 'rise', at(0, 0, art, rotate, size), delay))
    }),
  )
}

const SOUR_SPOTS = [
  [22, 98, -8, 1.04, 1],
  [112, 66, 10, 0.82, 3],
  [26, 152, 8, 0.8, 5],
] as const

function sourNotes(count: number): Art {
  return part(
    'sour-notes',
    SOUR_SPOTS.slice(0, count).map(([x, y, rotate, size, delay]) =>
      at(x, y, motion('sway', at(0, 0, sourNote(), rotate, size), delay)),
    ),
  )
}

const GOLD = [
  [24, 74, -12, 1.1, 'note', 1],
  [142, 58, 10, 1.22, 'beamed', 3],
  [176, 86, 14, 0.9, 'note', 5],
  [24, 138, 8, 0.8, 'beamed', 2],
] as const

const STARS = [
  [132, 22, 1.1, 1],
  [176, 36, 0.8, 3],
  [30, 30, 0.95, 2],
] as const

function goldenShower(): Art {
  return part('celebrate', [
    GOLD.map(([x, y, rotate, size, kind, delay]) =>
      at(
        x,
        y,
        motion(
          'bob',
          at(
            0,
            0,
            kind === 'note' ? note(C.sun, C.sunDark) : beamed(C.sun, C.sunDark),
            rotate,
            size,
          ),
          delay,
        ),
      ),
    ),
    STARS.map(([x, y, size, delay]) =>
      at(x, y, motion('twinkle', svg`<path d=${STAR} fill=${C.sun} />`, delay), 0, size),
    ),
    sparkle(148, 96, 1, 2),
    sparkle(16, 104, 0.8, 4),
    sparkle(58, 18, 0.7, 5),
    sparkle(112, 120, 0.7, 1),
  ])
}

function tuner(): Art {
  return part('tuner', [
    svg`<path d="M100 42H118" stroke=${C.metalDark} stroke-width="6" stroke-linecap="round" />`,
    at(144, 44, [
      svg`<rect x="-30" y="-24" width="60" height="48" rx="13" fill=${C.cream} />`,
      svg`<rect x="-24" y="-18" width="48" height="36" rx="8" fill=${C.glass} />`,
      [-2, -1, 0, 1, 2].map((i) =>
        at(
          0,
          12,
          svg`<rect x="-1.4" y="-22" width="2.8" height=${i === 0 ? 8 : 5.5} rx="1.4" fill=${i === 0 ? C.mint : C.metalDark} />`,
          i * 24,
        ),
      ),
      at(
        0,
        12,
        motion(
          'sway',
          at(
            0,
            0,
            svg`<rect x="-1.5" y="-18" width="3" height="19" rx="1.5" fill=${C.coral} />`,
            -24,
          ),
        ),
      ),
      at(19, -12, [
        motion('pulse', svg`<circle r="9" fill=${C.sun} opacity=".3" />`),
        svg`<circle r="4.8" fill=${C.sun} />`,
      ]),
    ]),
  ])
}

function pleaBubble(): Art {
  return part('plea', [
    svg`<circle cx="124" cy="92" r="4" fill=${C.cream} /><circle cx="133" cy="81" r="6.4" fill=${C.cream} />`,
    at(
      156,
      48,
      motion('pulse', [
        svg`<circle r="29" fill=${C.cream} />`,
        at(1, -1, note(C.coral, C.coralDark), 8, 1.2),
      ]),
    ),
  ])
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

function floorLitter(parts: MusicParts): Art {
  return [
    when(parts.step >= 3, () =>
      part(
        'dust-bunny',
        svg`<ellipse cx="24" cy="180" rx="9" ry="4.5" fill=${DUST_DARK} /><ellipse cx="22" cy="178" rx="6" ry="3.4" fill=${DUST} />`,
      ),
    ),
  ]
}

export function music(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = musicParts(scene)
  const accent = accentOf(scene, DEFAULT_BODY)
  const instrument = at(0, 0, guitar(accent, parts), parts.tilt, 0.93)
  const art: Art = [
    shadow(100, 184, 82),
    floorLitter(parts),
    stand(),
    when(parts.tuning, tuner),
    at(84, 172, parts.playing ? motion('sway', instrument) : instrument),
    cradle(),
    metronome(parts),
    when(parts.playing, () => flyingNotes(parts.sour)),
    when(!parts.playing && !parts.golden, () => sourNotes(parts.sour)),
    when(parts.plea, pleaBubble),
    when(parts.golden, goldenShower),
    when(parts.zeds, () => [zed(128, 72, 0.72, 1), zed(146, 52, 1, 2), zed(168, 32, 0.66, 3)]),
    stenchLines(
      (
        [
          [132, 134],
          [184, 116],
        ] as const
      ).slice(0, parts.stench),
    ),
    (
      [
        [132, 28],
        [24, 34],
      ] as const
    )
      .slice(0, parts.flies)
      .map(([x, y], i) => fly(x, y, i)),
  ]
  return frame('music', scene, options, art)
}
