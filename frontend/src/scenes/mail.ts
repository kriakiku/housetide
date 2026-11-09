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

export type MailParcel = 'none' | 'top' | 'floor'

export interface MailParts {
  step: number
  doorOpen: boolean
  flagUp: boolean
  fallen: boolean
  parcel: MailParcel
  hand: boolean
  bird: 'none' | 'asleep' | 'singing'
  flowers: boolean
  cloud: number
  snails: number
  notices: number
  mood: Mood
}

export const MAX_STEP = 4
const OVERFLOW = 6

const CLOUD_AT = [0.05, 0.4, 0.75] as const
const SNAIL_AT = [0.25, 0.8] as const
const NOTICE_AT = [0.5, 0.8] as const
const SICK_AT = 0.6

export function mailParts(scene: SceneView): MailParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const quiet = {
    step: 0,
    doorOpen: false,
    flagUp: false,
    fallen: false,
    parcel: 'none',
    hand: false,
    bird: 'none',
    flowers: false,
    cloud: 0,
    snails: 0,
    notices: 0,
  } as const
  if (state === 'clean') return { ...quiet, bird: 'singing', flowers: true, mood: 'happy' }
  const cloud = reached(stink, CLOUD_AT)
  const snails = reached(stink, SNAIL_AT)
  const notices = reached(stink, NOTICE_AT)
  const sick = stink >= SICK_AT
  if (state === 'running') {
    return { ...quiet, step: 0, doorOpen: true, hand: true, snails, notices, mood: 'happy' }
  }
  if (state === 'waiting') {
    return {
      ...quiet,
      parcel: 'floor',
      cloud,
      snails,
      notices,
      mood: sick ? 'sick' : stink >= 0.25 ? 'worried' : 'calm',
    }
  }
  const due = state === 'due'
  const raw = state === 'resting' ? 0 : Math.min(MAX_STEP, Math.floor(fill * (MAX_STEP + 1)))
  const step = due ? OVERFLOW : raw
  let mood: Mood = state === 'resting' ? 'sleepy' : step >= 3 ? 'worried' : 'calm'
  if (due) mood = 'pleading'
  if (sick) mood = 'sick'
  return {
    ...quiet,
    step,
    doorOpen: step > 0,
    flagUp: due,
    fallen: due,
    parcel: step >= MAX_STEP || cloud > 0 ? 'top' : 'none',
    bird: state === 'resting' && stink === 0 ? 'asleep' : 'none',
    cloud,
    snails,
    notices,
    mood,
  }
}

interface Paint {
  body: string
  dark: string
  deep: string
  light: string
  hollow: string
  face: string
  flag: string
  flagDark: string
}

function closeToCoral(color: string): boolean {
  const n = Number.parseInt(color.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return Math.abs(r - 255) + Math.abs(g - 122) + Math.abs(b - 107) < 150
}

function paintOf(scene: SceneView): Paint {
  const body = accentOf(scene, C.sky)
  const warm = closeToCoral(body)
  return {
    body,
    dark: shadeOf(body, 0.2),
    deep: shadeOf(body, 0.36),
    light: tintOf(body, 0.42),
    hollow: mix(body, INK, 0.8),
    face: isDarkColor(body) ? tintOf(body, 0.82) : mix(body, INK, 0.78),
    flag: warm ? C.sun : C.coral,
    flagDark: warm ? C.sunDark : C.coralDark,
  }
}

const ARCH = 'M36 144V96A27 30 0 0 1 90 96V144Z'
const SIDE = 'M63 66H150C170 66 184 80 184 100V136Q184 144 176 144H90V96A27 30 0 0 0 63 66Z'
const SIDE_SHADE = 'M90 122H184V136Q184 144 176 144H90Z'
const INNER_DOOR = 'M43 138V97A20 23 0 0 1 83 97V138Z'
const PIVOT = [63, 124] as const

const WAX = '#d83a3a'
const WAX_DARK = '#a92828'
const SKIN = '#ffcfa8'
const SKIN_DARK = '#eeb083'
const POST = mix(C.wickerDark, C.soil, 0.25)
const POST_DARK = mix(C.wickerDark, C.soil, 0.6)
const PAPER = '#fffaf0'

interface Sheet {
  paper: string
  flap: string
  ink: string
  stamp: string
}

const PLAIN: Sheet = { paper: C.cream, flap: C.creamDark, ink: C.metalDark, stamp: C.coral }

const SHEETS: readonly Sheet[] = [
  PLAIN,
  { paper: C.pink, flap: C.pinkDark, ink: C.pinkDark, stamp: C.cream },
  { paper: C.sun, flap: C.sunDark, ink: C.sunDark, stamp: C.coral },
  { paper: PAPER, flap: C.metalMid, ink: C.metalDark, stamp: C.sky },
  { paper: C.mint, flap: C.mintDark, ink: C.mintDark, stamp: C.cream },
  { paper: C.lilac, flap: C.lilacDark, ink: C.lilacDark, stamp: C.sun },
]

function sheetAt(index: number): Sheet {
  return SHEETS[index % SHEETS.length] ?? PLAIN
}

function envelope(sheet: Sheet): Art {
  return [
    svg`<rect x="-23" y="-16" width="46" height="32" rx="4" fill=${sheet.paper} />`,
    svg`<path d="M-21-14L0 3L21-14" fill="none" stroke=${sheet.flap} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
  ]
}

function postcard(sheet: Sheet): Art {
  return [
    svg`<rect x="-23" y="-16" width="46" height="32" rx="3" fill=${sheet.paper} />`,
    svg`<rect x="10" y="-11" width="9" height="11" rx="1.5" fill=${sheet.stamp} />`,
    svg`<rect x="-18" y="-8" width="20" height="3.4" rx="1.7" fill=${sheet.ink} /><rect x="-18" y="-1" width="20" height="3.4" rx="1.7" fill=${sheet.ink} /><rect x="-18" y="6" width="13" height="3.4" rx="1.7" fill=${sheet.ink} />`,
  ]
}

const FAN = [
  { min: 1, angle: -28, reach: 40, kind: 'env', sheet: 0 },
  { min: 2, angle: -8, reach: 50, kind: 'card', sheet: 4 },
  { min: 3, angle: -50, reach: 34, kind: 'env', sheet: 1 },
  { min: 4, angle: -14, reach: 64, kind: 'env', sheet: 2 },
  { min: 5, angle: -30, reach: 56, kind: 'card', sheet: 3 },
  { min: 6, angle: 2, reach: 66, kind: 'env', sheet: 5 },
] as const

function fanned(step: number): Art {
  return FAN.filter((item) => step >= item.min)
    .toReversed()
    .map((item) => {
      const rad = (item.angle * Math.PI) / 180
      const x = PIVOT[0] + item.reach * Math.sin(rad)
      const y = PIVOT[1] - item.reach * Math.cos(rad)
      const sheet = sheetAt(item.sheet)
      return part(
        'letter',
        at(
          round(x),
          round(y),
          item.kind === 'env' ? envelope(sheet) : postcard(sheet),
          item.angle + 90,
        ),
        item.min,
      )
    })
}

function postAndGround(parts: MailParts): Art {
  return [
    shadow(122, 183, 66),
    svg`<rect x="118" y="140" width="26" height="42" rx="3" fill=${POST} />`,
    svg`<rect x="136" y="140" width="8" height="42" rx="3" fill=${POST_DARK} />`,
    svg`<path d="M108 182C108 172 120 172 123 176C126 168 138 168 141 176C146 171 156 173 156 182Z" fill=${C.leafDark} />`,
    when(parts.flowers, () =>
      part('flowers', [
        flower(98, 182, 18, C.pink),
        flower(166, 182, 22, C.sun),
        flower(180, 182, 13, C.coral),
      ]),
    ),
  ]
}

function flower(x: number, y: number, height: number, color: string): Art {
  return at(x, y, [
    svg`<path d=${`M0 0V${-height}`} stroke=${C.leaf} stroke-width="3.4" stroke-linecap="round" />`,
    at(0, -height, [
      [0, 72, 144, 216, 288].map(
        (angle) =>
          svg`<circle cx="0" cy="-5.4" r="4" fill=${color} transform=${`rotate(${angle})`} />`,
      ),
      svg`<circle r="3" fill=${C.spark} />`,
    ]),
  ])
}

function archBack(paint: Paint): Art {
  return [
    svg`<path d=${ARCH} fill=${paint.deep} />`,
    svg`<path d=${INNER_DOOR} fill=${paint.hollow} />`,
  ]
}

function sidePanel(paint: Paint, parts: MailParts): Art {
  return [
    svg`<path d=${SIDE} fill=${paint.body} />`,
    svg`<path d=${SIDE_SHADE} fill=${paint.dark} />`,
    svg`<path d="M72 74H150C160 74 168 79 172 86" fill="none" stroke=${paint.light} stroke-width="5" stroke-linecap="round" />`,
    svg`<rect x="96" y="134" width="60" height="3.4" rx="1.7" fill=${paint.deep} />`,
    face(136, 102, parts.mood, paint.face, 1.15),
  ]
}

function closedDoor(paint: Paint): Art {
  return part('door', [
    svg`<path d=${ARCH} fill=${paint.light} />`,
    svg`<path d=${INNER_DOOR} fill=${tintOf(paint.body, 0.16)} />`,
    svg`<rect x="52" y="104" width="22" height="9" rx="4.5" fill=${C.cream} />`,
    svg`<rect x="52" y="108.5" width="22" height="4.5" rx="2.25" fill=${C.creamDark} />`,
  ])
}

function openDoor(paint: Paint): Art {
  return part('door', [
    svg`<path d="M36 136H90V148A27 21 0 0 1 36 148Z" fill=${paint.light} />`,
    svg`<path d="M43 142H83V148A20 15 0 0 1 43 148Z" fill=${tintOf(paint.body, 0.16)} />`,
    svg`<rect x="36" y="134" width="54" height="10" rx="3" fill=${paint.deep} />`,
    svg`<rect x="52" y="149" width="22" height="8" rx="4" fill=${C.cream} />`,
    svg`<rect x="52" y="149" width="22" height="4" rx="2" fill=${C.creamDark} />`,
  ])
}

function flag(paint: Paint, up: boolean, tilt?: number): Art {
  const angle = tilt ?? (up ? 0 : 188)
  const banner = svg`<path d="M0-54H-27L-20-44.5L-27-35H0Z" fill=${paint.flag} />`
  const fold = svg`<path d="M0-54H-27L-23.6-49.2H0Z" fill=${paint.flagDark} />`
  const arm = svg`<rect x="-2.5" y="-55" width="5.5" height="59" rx="2.6" fill=${C.metal} />`
  const hub = svg`<circle r="6" fill=${C.metalMid} /><circle r="2.4" fill=${C.metalDark} />`
  const body = [arm, banner, fold]
  return part('flag', [
    at(172, 92, at(0, 0, up ? motion('sway', body) : body, angle)),
    at(172, 92, hub),
  ])
}

function parcelBox(wet: number): Art {
  const kraft = mix(C.wicker, C.soil, wet * 0.16)
  const seam = mix(C.wickerDark, C.soil, wet * 0.16)
  const top =
    wet >= 2
      ? 'M-26-26Q-13-18 0-23T26-25V0H-26Z'
      : wet === 1
        ? 'M-26-30H26V0H-26Z'
        : 'M-26-32H26V0H-26Z'
  return [
    svg`<path d=${top} fill=${kraft} stroke=${kraft} stroke-width="3" stroke-linejoin="round" />`,
    svg`<rect x="-5" y="-30" width="10" height="30" fill=${seam} opacity=".8" />`,
    svg`<rect x="10" y="-20" width="14" height="10" rx="2" fill=${C.cream} /><rect x="12.5" y="-16.5" width="9" height="2.4" rx="1.2" fill=${C.metalDark} />`,
    when(
      wet >= 1,
      () => svg`<path d="M-27-17q7 5 13 0t13 2t13-2t15 1V2H-27Z" fill=${C.soil} opacity=".22" />`,
    ),
  ]
}

function topParcel(parts: MailParts): Art {
  return part('parcel', at(106, 70, parcelBox(Math.max(0, parts.cloud - 1))))
}

function twine(): Art {
  return [
    svg`<rect x="-34" y="-20" width="68" height="5" fill=${C.cream} /><rect x="-3" y="-44" width="6" height="44" fill=${C.cream} />`,
    svg`<path d="M0-44C-20-62-30-46-12-42L0-44C20-62 30-46 12-42Z" fill=${C.coral} />`,
    svg`<circle cx="0" cy="-44" r="5" fill=${C.coralDark} />`,
    svg`<rect x="10" y="-13" width="19" height="9" rx="2" fill=${PAPER} /><rect x="13" y="-10" width="12" height="2.6" rx="1.3" fill=${C.metalDark} />`,
  ]
}

function floorParcel(parts: MailParts): Art {
  const wet = parts.cloud
  const kraft = mix(C.wicker, C.soil, wet * 0.14)
  const lid = mix(C.wickerLight, C.soil, wet * 0.14)
  return part(
    'parcel',
    at(60, 182, [
      shadow(0, 1, 44),
      motion('bob', [
        svg`<rect x="-36" y="-44" width="72" height="44" rx="5" fill=${kraft} />`,
        svg`<rect x="-36" y="-44" width="72" height="11" rx="5" fill=${lid} />`,
        twine(),
        when(
          wet >= 2,
          () =>
            svg`<path d="M-36-22q9 6 18 0t18 2t18-2t18 1V-5q0 5-5 5h-62q-5 0-5-5Z" fill=${C.soil} opacity=".22" />`,
        ),
      ]),
    ]),
  )
}

function openMe(): Art {
  return part(
    'open-me',
    at(
      60,
      108,
      motion(
        'bob',
        svg`<path d="M-11-9L0 2L11-9" fill="none" stroke=${C.sun} stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
  )
}

function rainCloud(x: number, y: number, level: number, rain: string, boltDx: number): Art {
  const body = mix(C.metalDark, C.fly, (level - 1) * 0.3)
  const under = mix(body, C.fly, 0.32)
  const drops =
    level === 1
      ? [
          [-16, 26, 1],
          [4, 32, 2],
          [20, 24, 3],
        ]
      : [
          [-26, 26, 1],
          [-12, 34, 2],
          [2, 26, 3],
          [14, 36, 4],
          [28, 28, 5],
        ]
  return part('rain-cloud', [
    at(
      x,
      y,
      drops.map(([dx = 0, dy = 0, delay = 1]) =>
        at(dx, dy, motion('drip', drop(0, 0, rain, 0.72), delay)),
      ),
    ),
    when(level >= 3, () =>
      part(
        'bolt',
        at(
          x + boltDx,
          y + 12,
          motion('flicker', svg`<path d="M4 0L-9 19H0L-5 36L12 13H2L9 0Z" fill=${C.sun} />`),
        ),
      ),
    ),
    at(
      x,
      y,
      motion('drift', [
        svg`<g fill=${body}><circle cx="-22" cy="4" r="11" /><circle cx="-5" cy="-5" r="15" /><circle cx="15" cy="0" r="12" /><rect x="-33" y="2" width="60" height="13" rx="6.5" /></g>`,
        svg`<path d="M-18 13h34" stroke=${under} stroke-width="3.4" stroke-linecap="round" />`,
      ]),
    ),
  ])
}

function snail(x: number, y: number, size: number, index: number): Art {
  return part(
    'snail',
    at(
      x,
      y,
      svg`<g>
          <path d="M-30 0H-46" stroke=${C.spark} stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6" opacity=".55" />
          <path d="M-22 0Q-24-5-14-6H6C12-6 13-14 13-20L16-20C20-14 20-4 16 0Z" fill=${C.mint} />
          <path d="M13-20L9-29M17-20L21-29" stroke=${C.mint} stroke-width="2.6" stroke-linecap="round" />
          <circle cx="9" cy="-30" r="2.8" fill=${INK} /><circle cx="21" cy="-30" r="2.8" fill=${INK} />
          <circle cx="-6" cy="-14" r="13.5" fill=${C.terracotta} />
          <path d="M-6-14m0-8a8 8 0 1 1-8 8a5 5 0 1 1 5 5" fill="none" stroke=${C.terracottaDark} stroke-width="3" stroke-linecap="round" />
        </g>`,
      0,
      size,
    ),
    index,
  )
}

function finalNotice(x: number, y: number, rotate: number, size: number, index: number): Art {
  return part(
    'final-notice',
    at(
      x,
      y,
      [
        svg`<rect x="-24" y="-17" width="48" height="34" rx="3.5" fill=${PAPER} />`,
        svg`<path d="M-22-15L0 3L22-15" fill="none" stroke=${C.metalMid} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
        svg`<rect x="-24" y="-17" width="48" height="5.5" rx="2.5" fill=${WAX} />`,
        at(
          0,
          4,
          motion('throb', [
            svg`<circle r="11.5" fill=${WAX} /><circle r="8.2" fill=${WAX_DARK} />`,
            svg`<rect x="-1.9" y="-6" width="3.8" height="7.6" rx="1.9" fill=${PAPER} /><circle cy="4.4" r="2.1" fill=${PAPER} />`,
          ]),
        ),
      ],
      rotate,
      size,
    ),
    index,
  )
}

function birdArt(awake: boolean): Art {
  return [
    svg`<path d="M-15 0C-20-14-8-22 2-20C10-18 13-10 11-4C9 2-8 4-15 0Z" fill=${C.sun} />`,
    svg`<path d="M-16-3L-25-9L-22 1Z" fill=${C.sunDark} />`,
    svg`<path d="M-9-7C-4-2 3-3 4-9" fill=${C.sunDark} />`,
    svg`<path d="M10-14L18-11L10-8Z" fill=${C.coral} />`,
    awake
      ? svg`<circle cx="5" cy="-13" r="2.4" fill=${INK} />`
      : svg`<path d="M2-13q3 3 6 0" fill="none" stroke=${INK} stroke-width="2.2" stroke-linecap="round" />`,
    svg`<path d="M-4 1V5M3 1V5" stroke=${C.sunDark} stroke-width="2.4" stroke-linecap="round" />`,
  ]
}

function perchedBird(mode: 'asleep' | 'singing'): Art {
  if (mode === 'asleep') {
    return part('bird', [
      at(118, 61, birdArt(false)),
      at(
        160,
        36,
        motion(
          'twinkle',
          svg`<path d="M8-14A15 15 0 1 0 8 14A11.5 11.5 0 1 1 8-14Z" fill=${C.spark} />`,
        ),
      ),
    ])
  }
  return part('bird', [
    at(112, 61, motion('bob', birdArt(true))),
    at(140, 42, motion('rise', note(C.spark), 1)),
    at(90, 32, motion('rise', note(C.pink), 3)),
  ])
}

function note(color: string): Art {
  return svg`<path d="M3-13V3" stroke=${color} stroke-width="3" stroke-linecap="round" /><path d="M3-13q6 1 8 6" fill="none" stroke=${color} stroke-width="3" stroke-linecap="round" /><ellipse cx="-1" cy="3.6" rx="5" ry="4" fill=${color} />`
}

function fallenMail(): Art {
  return part('fallen', [
    at(26, 176, envelope(sheetAt(2)), -14, 0.78),
    at(88, 178, postcard(sheetAt(1)), 10, 0.72),
    at(30, 118, motion('wobble', at(0, 0, envelope(sheetAt(4)), 28, 0.72)), 0),
  ])
}

function flying(): Art {
  const items = [
    [32, 62, -24, 0, 1, 'rise'],
    [108, 34, 16, 1, 2, 'bob'],
    [70, 22, -8, 2, 3, 'rise'],
    [150, 26, 26, 3, 4, 'bob'],
    [30, 30, 14, 5, 5, 'rise'],
  ] as const
  return part(
    'flying',
    items.map(([x, y, angle, sheet, delay, name]) =>
      at(x, y, motion(name, at(0, 0, envelope(sheetAt(sheet)), angle, 0.72), delay)),
    ),
  )
}

function scoopingHand(): Art {
  return part(
    'hand',
    at(0, 122, [
      svg`<path d="M-6-14H26L34-16V18L26 16H-6Z" fill=${C.lilac} />`,
      svg`<rect x="24" y="-18" width="11" height="38" rx="4" fill=${C.cream} />`,
      motion('slosh', [
        at(58, -22, envelope(sheetAt(4)), -14, 0.96),
        at(62, -16, envelope(sheetAt(2)), -4, 0.96),
        at(60, -8, envelope(PLAIN), 6, 0.96),
        svg`<path d="M35-4C42-8 48-8 58-6L80-3C86-2 86 6 80 6L72 6C78 7 78 14 72 14L66 14C70 16 68 22 62 21L44 20C38 19 35 16 35 14Z" fill=${SKIN} />`,
        svg`<path d="M72 6H60M66 14H56" stroke=${SKIN_DARK} stroke-width="2.6" stroke-linecap="round" />`,
        svg`<path d="M40-3C42-14 52-17 58-14C62-11 60-6 55-6Z" fill=${SKIN} />`,
      ]),
    ]),
  )
}

function composition(parts: MailParts, paint: Paint): Art {
  const top = parts.parcel === 'top'
  const floor = parts.parcel === 'floor'
  const cloudAt: readonly [number, number] = floor ? [54, 95] : [116, 26]
  return [
    postAndGround(parts),
    archBack(paint),
    when(parts.doorOpen, () => fanned(parts.step)),
    sidePanel(paint, parts),
    when(parts.doorOpen, () => openDoor(paint)),
    when(!parts.doorOpen, () => closedDoor(paint)),
    flag(paint, parts.flagUp, parts.hand ? -38 : undefined),
    when(top, () => topParcel(parts)),
    when(parts.bird !== 'none', () => perchedBird(parts.bird === 'asleep' ? 'asleep' : 'singing')),
    when(parts.fallen, fallenMail),
    when(floor, () => floorParcel(parts)),
    when(floor && parts.cloud === 0, openMe),
    when(parts.cloud > 0, () =>
      rainCloud(
        cloudAt[0],
        cloudAt[1],
        parts.cloud,
        floor ? C.waterDark : C.water,
        floor ? 20 : 28,
      ),
    ),
    when(parts.snails >= 1, () =>
      parts.flagUp ? snail(102, 144, 0.72, 0) : snail(parts.hand ? 96 : 150, 66, 0.72, 0),
    ),
    when(parts.notices >= 1, () => finalNotice(128, 162, -6, 0.86, 0)),
    when(parts.notices >= 2, () => finalNotice(174, 165, 10, 0.78, 1)),
    when(parts.snails >= 2, () => snail(174, 152, 0.56, 1)),
    when(parts.hand, scoopingHand),
    when(parts.hand, flying),
    when(parts.bird === 'singing', () =>
      [
        [24, 60, 1.25, 1],
        [176, 42, 1.05, 2],
        [44, 150, 0.85, 3],
        [186, 158, 0.7, 4],
      ].map(([x = 0, y = 0, size = 1, delay = 1]) => sparkle(x, y, size, delay)),
    ),
  ]
}

export function mail(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = mailParts(scene)
  return frame('mail', scene, options, composition(parts, paintOf(scene)))
}
