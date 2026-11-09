import { svg } from 'lit'
import type { SVGTemplateResult, TemplateResult } from 'lit'

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
  tintOf,
  when,
} from './common.ts'
import type { Art, Mood, SceneOptions } from './common.ts'

export type LanguageView = 'sleep' | 'study' | 'plead' | 'lesson' | 'quiz' | 'party'
export type WingPose = 'tucked' | 'droop' | 'flap' | 'up'
export type CrestPose = 'proud' | 'flat' | 'ruffled' | 'bald'

export interface LanguageParts {
  view: LanguageView
  cards: number
  learned: number
  words: number
  scramble: number
  fallenCards: number
  feathers: number
  airFeathers: number
  wings: WingPose
  crest: CrestPose
  open: boolean
  grumpy: boolean
  scruff: number
  stench: number
  flies: number
  mood: Mood
}

export const MAX_CARDS = 7

const STINK_AT = [0.12, 0.4, 0.7] as const
const FALLEN_CARDS = [0, 1, 3, 4] as const
const FLOOR_FEATHERS = [0, 1, 3, 5] as const
const AIR_FEATHERS = [0, 0, 1, 3] as const

const QUIET = {
  cards: 0,
  learned: 0,
  words: 0,
  scramble: 0,
  fallenCards: 0,
  feathers: 0,
  airFeathers: 0,
  open: false,
  grumpy: false,
  scruff: 0,
  stench: 0,
  flies: 0,
} as const

function yellowish(hex: string): boolean {
  const n = Number.parseInt(hex.slice(1), 16)
  return ((n >> 16) & 255) > 200 && ((n >> 8) & 255) > 150 && (n & 255) < 150
}

function crestFor(scruff: number, calm: CrestPose): CrestPose {
  if (scruff >= 3) return 'bald'
  return scruff >= 1 ? 'ruffled' : calm
}

export function languageParts(scene: SceneView): LanguageParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const progress = clamp01(scene.progress)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  if (state === 'clean') {
    return {
      ...QUIET,
      view: 'party',
      cards: 3,
      wings: 'up',
      crest: 'proud',
      open: true,
      mood: 'happy',
    }
  }
  const scruff = reached(stink, STINK_AT)
  const mess = {
    scramble: scruff,
    feathers: FLOOR_FEATHERS[scruff] ?? 0,
    airFeathers: AIR_FEATHERS[scruff] ?? 0,
    scruff,
    stench: scruff >= 3 ? 2 : 0,
    flies: Math.max(0, scruff - 1),
  }
  if (state === 'running') {
    const done = Math.min(4, Math.floor(progress * 5))
    return {
      ...QUIET,
      view: 'lesson',
      cards: 5 - done,
      learned: done + 1,
      words: 3,
      scramble: Math.min(1, scruff),
      feathers: Math.min(1, scruff),
      scruff: Math.min(1, scruff),
      wings: 'flap',
      crest: 'proud',
      open: true,
      mood: 'happy',
    }
  }
  if (state === 'waiting') {
    let mood: Mood = 'calm'
    if (scruff >= 3) mood = 'sick'
    return {
      ...QUIET,
      ...mess,
      view: 'quiz',
      cards: 1,
      words: 3,
      wings: scruff >= 2 ? 'droop' : 'tucked',
      crest: crestFor(scruff, 'proud'),
      grumpy: scruff >= 1 && scruff < 3,
      mood,
    }
  }
  if (state === 'resting') {
    return {
      ...QUIET,
      ...mess,
      scramble: 0,
      view: 'sleep',
      wings: 'tucked',
      crest: crestFor(scruff, 'flat'),
      grumpy: false,
      mood: scruff >= 3 ? 'sick' : 'sleepy',
    }
  }
  const due = state === 'due'
  const cards = due ? MAX_CARDS : Math.min(MAX_CARDS - 1, 1 + Math.floor(fill * (MAX_CARDS - 1)))
  const grumpy = scruff === 2 || (scruff === 1 && !due)
  let mood: Mood = due ? 'pleading' : cards >= 5 ? 'worried' : 'calm'
  if (grumpy) mood = 'calm'
  if (scruff >= 3) mood = 'sick'
  return {
    ...QUIET,
    ...mess,
    view: due ? 'plead' : 'study',
    cards,
    words: due ? 0 : Math.min(3, 1 + Math.floor(fill * 3)),
    fallenCards: Math.min(cards, FALLEN_CARDS[scruff] ?? 0),
    wings: due || scruff >= 2 ? 'droop' : 'tucked',
    crest: crestFor(scruff, due ? 'flat' : 'proud'),
    grumpy,
    mood,
  }
}

interface Paint {
  body: string
  dark: string
  light: string
  beak: string
  beakDark: string
}

const PERCH_Y = 134
const BIRD_SCALE = 0.9
const HEAD_Y = -84
const SHOULDER_Y = -66

const PAPER = '#fbf7ec'
const GLYPH = '#3a3f66'
const BARE = '#ffe3d6'
const BUMP = '#e0a48f'
const FOOT = '#8a93b4'
const THROAT = '#6b2a3c'
const TONGUE = '#ff9fa8'
const SOUR = '#c9c49a'
const SOUR_DARK = '#a6a173'
const PATCH = '#fff6e8'
const CARD_COLORS = [PAPER, C.sun, C.mint, C.sky, C.pink, C.lilac, C.coral] as const

const WING_ANGLE: Record<WingPose, number> = { tucked: 5, droop: 26, flap: 58, up: 122 }

function leaf(length: number, width: number, color: string): SVGTemplateResult {
  const w = round(width)
  const bulge = round(width * 1.14)
  const belly = round(length * 0.56)
  return svg`<path d=${`M0-4C${w}-4 ${bulge} ${belly} 0 ${length}C${-bulge} ${belly} ${-w}-4 0-4Z`} fill=${color} />`
}

function spikes(rx: number, ry: number, count: number): string {
  const points = Array.from({ length: count * 2 }, (_, i) => {
    const angle = (i * Math.PI) / count
    const k = i % 2 ? 0.78 : 1
    return `${round(Math.cos(angle) * rx * k)} ${round(Math.sin(angle) * ry * k)}`
  })
  return `M${points.join('L')}Z`
}

type Glyph = 'dot' | 'tri' | 'block' | 'ring' | 'wave' | 'hook' | 'gem'

function glyph(kind: Glyph, x: number, y: number, size: number, color: string, turn = 0): Art {
  const line = (d: string): SVGTemplateResult =>
    svg`<path d=${d} fill="none" stroke=${color} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`
  const shapes: Record<Glyph, Art> = {
    dot: svg`<circle r="6" fill=${color} />`,
    tri: svg`<path d="M0-6.5L6.8 5.2H-6.8Z" fill=${color} stroke=${color} stroke-width="1.6" stroke-linejoin="round" />`,
    block: svg`<rect x="-5.6" y="-5.6" width="11.2" height="11.2" rx="2.4" fill=${color} />`,
    ring: svg`<circle r="4.8" fill="none" stroke=${color} stroke-width="3.6" />`,
    wave: line('M-7 2Q-3.5-6 0 0T7-2'),
    hook: line('M-5-5H4Q6-5 6-3V5'),
    gem: svg`<path d="M0-7L6.6 0L0 7L-6.6 0Z" fill=${color} stroke=${color} stroke-width="1.2" stroke-linejoin="round" />`,
  }
  return at(x, y, shapes[kind], turn, size)
}

function word(count: number, palette: readonly string[], jumble: boolean): Art {
  const kinds: readonly Glyph[] = ['dot', 'tri', 'wave']
  const shown = kinds.slice(0, count)
  const gap = 19
  const left = (-(shown.length - 1) * gap) / 2
  return shown.map((kind, i) =>
    glyph(
      kind,
      left + i * gap + (jumble ? ([4, -3, -5][i] ?? 0) : 0),
      jumble ? ([-5, 6, -3][i] ?? 0) : 0,
      1,
      palette[i % palette.length] ?? GLYPH,
      jumble ? ([28, -40, 160][i] ?? 0) : 0,
    ),
  )
}

function questionShape(color: string): Art {
  return [
    svg`<path d="M-9.5-8.5A10 10 0 1 1 6.2-.6C2.2 2.2 0 4 0 8" fill="none" stroke=${color} stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round" />`,
    svg`<circle cy="17" r="4.1" fill=${color} />`,
  ]
}

function grawlix(): Art {
  return [
    at(
      -21,
      0,
      svg`<path d="M-9-9L8-11L-10-3L10-4L-9 4L9 3L-6 10L6 10" fill="none" stroke=${GLYPH} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,
    ),
    at(1, 0, svg`<path d="M4-13L-7 2H-1L-4 13L7-3H1Z" fill=${C.coralDark} />`, 8),
    at(
      22,
      -2,
      svg`<path d=${spikes(10, 10, 5)} fill=${GLYPH} stroke=${GLYPH} stroke-width="1.4" stroke-linejoin="round" />`,
      12,
    ),
  ]
}

function balloon(w: number, h: number, pointer: number, color: string, inner: Art): Art {
  const base = round(pointer * w * 0.2)
  const tip = round(pointer * w * 0.46)
  const low = round(h / 2)
  return [
    when(
      pointer !== 0,
      () =>
        svg`<path d=${`M${base - 8} ${low - 3}L${tip} ${low + 13}L${base + 8} ${low - 3}Z`} fill=${color} stroke=${color} stroke-width="3" stroke-linejoin="round" />`,
    ),
    svg`<rect x=${round(-w / 2)} y=${-low} width=${w} height=${h} rx=${round(Math.min(w, h) * 0.42)} fill=${color} />`,
    inner,
  ]
}

function angryBalloon(w: number, h: number, pointer: number, inner: Art): Art {
  const tip = round(pointer * w * 0.5)
  const low = round(h / 2)
  return [
    svg`<path d=${`M${round(pointer * w * 0.12)} ${low - 6}L${tip} ${low + 12}L${round(pointer * w * 0.34)} ${low - 8}Z`} fill=${SOUR} stroke=${SOUR} stroke-width="3" stroke-linejoin="round" />`,
    svg`<path d=${spikes(w * 0.6, h * 0.66, 11)} fill=${SOUR} stroke=${SOUR} stroke-width="3" stroke-linejoin="round" />`,
    inner,
  ]
}

function perch(x: number, half: number): Art {
  return part('perch', [
    shadow(x, 183, 44),
    svg`<rect x=${x - 5.5} y=${PERCH_Y + 4} width="11" height=${176 - PERCH_Y} rx="3" fill=${C.wickerDark} />`,
    svg`<rect x=${x - 34} y="174" width="68" height="11" rx="5.5" fill=${C.wickerDark} />`,
    svg`<rect x=${x - 34} y="174" width="68" height="5" rx="2.5" fill=${C.wicker} />`,
    svg`<rect x=${x - half} y=${PERCH_Y} width=${half * 2} height="11" rx="5.5" fill=${C.wicker} />`,
    svg`<rect x=${x - half + 3} y=${PERCH_Y + 1.6} width=${half * 2 - 6} height="3" rx="1.5" fill=${C.wickerLight} />`,
    svg`<circle cx=${x - half + 5.5} cy=${PERCH_Y + 5.5} r="3" fill=${C.wickerDark} /><circle cx=${x + half - 5.5} cy=${PERCH_Y + 5.5} r="3" fill=${C.wickerDark} />`,
  ])
}

function tail(paint: Paint): Art {
  return part('tail', [
    at(-14, -16, leaf(70, 11, C.sky), 58),
    at(-10, -14, leaf(78, 12, C.sun), 40),
    at(-5, -14, leaf(70, 12, paint.dark), 22),
  ])
}

function wing(side: number, pose: WingPose, paint: Paint, flap: number): Art {
  const layers = [leaf(62, 15, C.sky), leaf(50, 16, C.sun), leaf(37, 16, paint.dark)]
  const scales = svg`<path d="M-8 12q4 5 8 0q4 5 8 0M-6 22q3 4 6 0q3 4 6 0" fill="none" stroke=${paint.body} stroke-width="2.4" stroke-linecap="round" />`
  const art: Art = [layers, scales]
  const angle = -side * WING_ANGLE[pose]
  return part(
    'wing',
    at(
      side * 27,
      SHOULDER_Y,
      pose === 'flap' ? at(0, 0, motion('wobble', art, flap), angle) : art,
      pose === 'flap' ? 0 : angle,
    ),
  )
}

function plume(rotate: number, color: string, size: number): Art {
  return at(0, -28, at(0, 0, leaf(26, 8, color), 180 + rotate), 0, size)
}

function crest(pose: CrestPose, paint: Paint): Art {
  const sets: Record<CrestPose, Art> = {
    proud: [
      plume(-34, paint.dark, 1),
      plume(34, paint.dark, 1),
      plume(-12, C.sun, 1.08),
      plume(14, paint.light, 1.14),
    ],
    flat: [
      plume(-78, paint.dark, 0.9),
      plume(76, paint.dark, 0.9),
      plume(-54, C.sun, 0.94),
      plume(52, paint.light, 0.98),
    ],
    ruffled: [
      plume(-62, paint.dark, 0.72),
      plume(44, paint.dark, 1.02),
      plume(-18, C.sun, 0.66),
      plume(88, paint.light, 0.84),
    ],
    bald: [plume(112, paint.dark, 0.86)],
  }
  return part('crest', sets[pose])
}

function beak(open: boolean, paint: Paint): Art {
  const upper = [
    svg`<path d="M-14 0C-10-9 10-9 14 0C17 12 8 22 0 28C-8 22-17 12-14 0Z" fill=${paint.beak} />`,
    svg`<path d="M-9 1Q0-5 9 1" fill="none" stroke=${tintOf(paint.beak, 0.55)} stroke-width="3" stroke-linecap="round" />`,
    svg`<circle cx="-4.4" cy="5.5" r="1.5" fill=${paint.beakDark} /><circle cx="4.4" cy="5.5" r="1.5" fill=${paint.beakDark} />`,
  ]
  if (!open) {
    return part('beak', [svg`<path d="M-8 18C-7 29 7 29 8 18Z" fill=${paint.beakDark} />`, upper])
  }
  return part('beak', [
    svg`<path d="M-12 11C-12 34 12 34 12 11Z" fill=${paint.beakDark} />`,
    svg`<path d="M-8.6 11C-8.6 29 8.6 29 8.6 11Z" fill=${THROAT} />`,
    svg`<ellipse cy="23.5" rx="5.4" ry="3.6" fill=${TONGUE} />`,
    at(0, -2, upper, 0, 0.84),
  ])
}

function brows(): Art {
  return part(
    'brows',
    svg`<path d="M-27-17L-9-9M27-17L9-9" fill="none" stroke=${INK} stroke-width="4.6" stroke-linecap="round" />`,
  )
}

function head(parts: LanguageParts, paint: Paint): Art {
  return [
    crest(parts.crest, paint),
    svg`<circle r="33" fill=${paint.body} />`,
    svg`<ellipse cx="-16" cy="-3" rx="13.5" ry="14.5" fill=${PATCH} /><ellipse cx="16" cy="-3" rx="13.5" ry="14.5" fill=${PATCH} />`,
    face(0, -4, parts.mood, INK, 1.36),
    when(parts.grumpy, brows),
    at(0, 5, beak(parts.open, paint), 0, 0.9),
  ]
}

function scruffs(level: number, paint: Paint): Art {
  return part('scruff', [
    when(
      level >= 1,
      () =>
        svg`<path d="M-37-46l-9-3 6 8-8 3 9 5M37-30l9-4-6 8 8 3-9 5" fill=${paint.dark} stroke=${paint.dark} stroke-width="2" stroke-linejoin="round" />`,
    ),
    when(level >= 3, () => [
      svg`<ellipse cx="8" cy="-30" rx="12" ry="10" fill=${BARE} />`,
      svg`<ellipse cx="-14" cy="-19" rx="6.5" ry="5.5" fill=${BARE} />`,
      svg`<g fill=${BUMP}><circle cx="3" cy="-33" r="1.5" /><circle cx="10" cy="-35" r="1.5" /><circle cx="14" cy="-28" r="1.5" /><circle cx="6" cy="-25" r="1.5" /><circle cx="-15" cy="-20" r="1.3" /></g>`,
    ]),
  ])
}

function toes(x: number): Art {
  return svg`<path d=${`M${x - 6}-2v9M${x} -2v11M${x + 6}-2v9`} fill="none" stroke=${FOOT} stroke-width="5" stroke-linecap="round" />`
}

function feet(): Art {
  return part('feet', [toes(-14), toes(14)])
}

function bird(parts: LanguageParts, paint: Paint, tilt: number): Art {
  const raised = parts.wings === 'up' || parts.wings === 'flap'
  const wings: Art = [wing(-1, parts.wings, paint, 1), wing(1, parts.wings, paint, 3)]
  return part('parrot', [
    when(raised, () => wings),
    svg`<path d="M-30-90C-46-54-40-6 0-6C40-6 46-54 30-90Z" fill=${paint.body} />`,
    svg`<path d="M-22-46C-24-20-13-10 0-10C13-10 24-20 22-46C14-58-14-58-22-46Z" fill=${paint.light} />`,
    svg`<path d="M-12-40q4 5 8 0q4 5 8 0q4 5 8 0M-8-27q4 5 8 0q4 5 8 0" fill="none" stroke=${paint.body} stroke-width="2.6" stroke-linecap="round" opacity=".7" />`,
    scruffs(parts.scruff, paint),
    when(!raised, () => wings),
    at(0, HEAD_Y, head(parts, paint), tilt),
    feet(),
  ])
}

function perched(x: number, parts: LanguageParts, paint: Paint, tilt = 0, lively = false): Art {
  const back = at(x, PERCH_Y, tail(paint), 0, BIRD_SCALE)
  const front = at(x, PERCH_Y, bird(parts, paint, tilt), 0, BIRD_SCALE)
  return [back, perch(x, 44), lively ? motion('bob', front) : front]
}

const CARD_W = 54
const CARD_H = 38
const CARD_TILT = [0, -5, 4, -3, 6, -6, 3] as const
const CARD_NUDGE = [0, -3, 3, -2, 4, -4, 2] as const

function cardBase(color: string): Art {
  const ink = mix(color, GLYPH, 0.55)
  return [
    svg`<rect x=${-CARD_W / 2} y=${-CARD_H / 2} width=${CARD_W} height=${CARD_H} rx="6" fill=${color} />`,
    svg`<circle cx="-18" cy="-13" r="3" fill=${ink} /><rect x="-12" y="-14.6" width="20" height="3.2" rx="1.6" fill=${ink} />`,
  ]
}

function frontCard(mark: Art): Art {
  return [
    svg`<rect x=${-CARD_W / 2} y=${-CARD_H / 2} width=${CARD_W} height=${CARD_H} rx="6" fill=${PAPER} />`,
    mark,
  ]
}

function studyMark(): Art {
  return [
    glyph('gem', -12, -3, 1.3, C.skyDark),
    svg`<rect x="2" y="-10" width="18" height="4.4" rx="2.2" fill=${C.creamDark} /><rect x="2" y="-1.5" width="13" height="4.4" rx="2.2" fill=${C.creamDark} />`,
    svg`<rect x="-20" y="10" width="40" height="3.6" rx="1.8" fill=${C.creamDark} />`,
  ]
}

function checkMark(): Art {
  return [
    svg`<circle r="12.5" fill=${C.check} />`,
    svg`<path d="M-6 0L-1.6 4.8L6.6-4.6" fill="none" stroke="#fff" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />`,
  ]
}

function stack(x: number, count: number, mark: Art, scale = 1, teeter = 0): Art {
  if (count <= 0) return []
  const floor = 182
  const step = 10.5 * scale
  const lift = (CARD_H / 2) * scale
  const cards = Array.from({ length: count }, (_, i) => count - 1 - i).map((i) => {
    const y = floor - lift - i * step
    const lean = (CARD_TILT[i] ?? 0) + teeter * i * 1.6
    const nudge = ((CARD_NUDGE[i] ?? 0) + teeter * i * 2.2) * scale
    const color = CARD_COLORS[i % CARD_COLORS.length] ?? PAPER
    return part(
      'card',
      at(x + nudge, y, i === 0 ? frontCard(mark) : cardBase(color), lean, scale),
      i,
    )
  })
  return part('stack', [shadow(x, 183, round(32 * scale), 0.26), cards])
}

const SPILLED = [
  [32, 172, -22, 2],
  [120, 180, 16, 3],
  [170, 150, 74, 1],
  [34, 148, 38, 4],
] as const

function spilled(count: number): Art {
  const lying = SPILLED.slice(0, count).map(([x, y, turn, tone], i) =>
    part('spilled-card', at(x, y, cardBase(CARD_COLORS[tone] ?? PAPER), turn, 0.62), i),
  )
  return [
    lying,
    when(count >= 3, () =>
      part('falling-card', at(120, 112, motion('fall', at(0, 0, cardBase(C.pink), 24, 0.6), 2))),
    ),
  ]
}

const LOOSE_COLORS = ['body', 'sky', 'sun'] as const

function loose(x: number, y: number, turn: number, index: number, paint: Paint, size: number): Art {
  const tone = LOOSE_COLORS[index % LOOSE_COLORS.length] ?? 'body'
  const color = tone === 'body' ? paint.body : C[tone]
  return at(
    x,
    y,
    [
      svg`<path d="M0 0C8 2 9 12 7 18L2.6 16.4L5.4 22C3.4 27 1.4 30 0 31C-6 25-9 12-7 5C-5 1-2 0 0 0Z" fill=${color} />`,
      svg`<path d="M0-6V27" fill="none" stroke=${tintOf(color, 0.55)} stroke-width="2" stroke-linecap="round" />`,
    ],
    turn,
    size,
  )
}

const FLOOR_SPOTS = [
  [62, 180, 74, 0.72],
  [118, 172, -70, 0.66],
  [36, 182, 84, 0.62],
  [110, 184, 100, 0.6],
  [156, 183, -84, 0.66],
] as const

type Spot = readonly [number, number, number, number]

const AIR_SPOTS: readonly Spot[] = [
  [108, 146, 34, 1],
  [16, 22, -26, 3],
  [52, 22, 40, 5],
]

function feathers(parts: LanguageParts, paint: Paint, air: readonly Spot[] = AIR_SPOTS): Art {
  return [
    part(
      'feathers',
      FLOOR_SPOTS.slice(0, parts.feathers).map(([x, y, turn, size], i) =>
        loose(x, y, turn, i, paint, size),
      ),
    ),
    part(
      'falling-feathers',
      air
        .slice(0, parts.airFeathers)
        .map(([x, y, turn, delay], i) =>
          at(x, y, motion('fall', loose(0, 0, turn, i + 1, paint, 0.74), delay)),
        ),
    ),
  ]
}

function bubbleFor(parts: LanguageParts, x: number, y: number, w: number, h: number): Art {
  const palette = [C.coral, C.skyDark, C.mintDark]
  const angry = parts.scramble >= 2
  const inner = angry ? grawlix() : word(parts.words, palette, parts.scramble === 1)
  return part(
    'speech',
    at(
      x,
      y,
      angry ? motion('rumble', angryBalloon(w, h, -1, inner)) : balloon(w, h, -1, C.cream, inner),
      parts.scramble === 1 ? 6 : 0,
    ),
  )
}

function neglect(
  parts: LanguageParts,
  lines: ReadonlyArray<readonly [number, number]>,
  spots: ReadonlyArray<readonly [number, number]>,
): Art {
  return [
    stenchLines(lines.slice(0, parts.stench)),
    spots.slice(0, parts.flies).map(([x, y], i) => fly(x, y, i)),
  ]
}

function zed(x: number, y: number, size: number, delay: number): Art {
  return part(
    'zed',
    at(
      x,
      y,
      motion(
        'drift',
        svg`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${C.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function moon(): Art {
  return part(
    'moon',
    at(
      36,
      48,
      [
        svg`<path d="M6-20A21 21 0 1 0 20 12A17 17 0 0 1 6-20Z" fill=${C.spark} />`,
        svg`<circle cx="30" cy="-18" r="2.4" fill=${C.spark} /><circle cx="-14" cy="-28" r="1.8" fill=${C.spark} />`,
      ],
      -8,
      0.9,
    ),
  )
}

const SLEEP_AIR: readonly Spot[] = [
  [146, 112, 30, 1],
  [24, 92, -26, 3],
  [172, 130, 40, 5],
]

function sleepView(parts: LanguageParts, paint: Paint): Art {
  return [
    moon(),
    perched(100, parts, paint, 7),
    zed(150, 62, 0.72, 1),
    zed(164, 42, 1, 2),
    zed(180, 26, 0.62, 3),
    feathers(parts, paint, SLEEP_AIR),
    neglect(parts, [[28, 130]], [[168, 96]]),
  ]
}

function studyView(parts: LanguageParts, paint: Paint): Art {
  return [
    perched(76, parts, paint),
    stack(150, parts.cards, studyMark(), 1, parts.scruff >= 2 ? 1 : 0),
    when(parts.words > 0, () => bubbleFor(parts, 150, 42, 68, 42)),
    spilled(parts.fallenCards),
    feathers(parts, paint),
    neglect(
      parts,
      [
        [18, 104],
        [186, 86],
      ],
      [
        [30, 60],
        [116, 24],
      ],
    ),
  ]
}

function pleadBubble(parts: LanguageParts): Art {
  if (parts.scramble >= 2) {
    return part('speech', at(146, 44, motion('rumble', angryBalloon(72, 46, -1, grawlix()))))
  }
  const shape = at(0, -4, questionShape(C.coralDark), parts.scramble === 1 ? 16 : 0)
  return part('speech', at(146, 44, motion('pulse', balloon(70, 52, -1, C.cream, shape))))
}

function pleadView(parts: LanguageParts, paint: Paint): Art {
  return [
    perched(74, parts, paint, -7),
    stack(150, parts.cards, studyMark(), 1, parts.scruff >= 2 ? 1 : 0.35),
    pleadBubble(parts),
    when(parts.scruff < 2, () =>
      part('sweat', at(42, 44, motion('drip', drop(0, 0, C.water, 0.85), 2))),
    ),
    spilled(parts.fallenCards),
    feathers(parts, paint),
    neglect(
      parts,
      [
        [18, 104],
        [186, 104],
      ],
      [
        [28, 60],
        [108, 22],
      ],
    ),
  ]
}

function lessonView(parts: LanguageParts, paint: Paint, accent: string): Art {
  const jumble = parts.scramble === 1
  return [
    stack(34, parts.learned, checkMark(), 0.6),
    stack(166, parts.cards, studyMark(), 0.6),
    perched(100, parts, paint, 0, true),
    part('flying-bubbles', [
      at(
        40,
        40,
        motion(
          'drift',
          balloon(58, 40, 1, C.cream, word(3, [C.coral, C.skyDark, C.mintDark], jumble)),
          1,
        ),
      ),
      at(
        160,
        34,
        motion(
          'drift',
          balloon(
            58,
            40,
            -1,
            tintOf(accent, 0.72),
            word(2, [shadeOf(accent, 0.45), GLYPH], jumble),
          ),
          4,
        ),
      ),
      at(24, 118, motion('rise', balloon(26, 26, 0, C.sky, glyph('ring', 0, 0, 0.8, PAPER)), 2)),
      at(176, 112, motion('rise', balloon(26, 26, 0, C.sun, glyph('tri', 0, 0, 0.8, GLYPH)), 4)),
    ]),
    feathers(parts, paint),
  ]
}

function quizRow(y: number, done: boolean): Art {
  const box = done
    ? [
        svg`<circle r="7.5" fill=${C.check} />`,
        svg`<path d="M-3.6 0L-1 2.8L3.8-2.6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`,
      ]
    : [
        motion('pulse', svg`<circle r="12" fill=${C.sun} opacity=".42" />`),
        svg`<circle r="7.5" fill=${PAPER} stroke=${C.sunDark} stroke-width="3" />`,
      ]
  return at(-20, y, [
    box,
    svg`<rect x="13" y="-3.2" width=${done ? 30 : 36} height="6.4" rx="3.2" fill=${done ? C.metalDark : GLYPH} opacity=${done ? 0.5 : 1} />`,
  ])
}

function quizCard(stale: number): Art {
  const sheet = mix(PAPER, SOUR, stale / 6)
  return part(
    'quiz-card',
    at(146, 130, [
      svg`<path d="M-24 44L-36 54M24 44L36 54" stroke=${C.wickerDark} stroke-width="6" stroke-linecap="round" />`,
      at(
        0,
        0,
        [
          svg`<rect x="-42" y="-54" width="84" height="104" rx="9" fill=${sheet} />`,
          svg`<path d="M-42-30V-45a9 9 0 0 1 9-9H33a9 9 0 0 1 9 9V-30Z" fill=${C.sky} />`,
          at(0, -42, [
            glyph('dot', -19, 0, 0.74, PAPER),
            glyph('tri', 0, 0, 0.74, PAPER),
            glyph('gem', 19, 0, 0.74, PAPER),
          ]),
          quizRow(-14, true),
          quizRow(9, true),
          quizRow(32, false),
        ],
        4,
      ),
    ]),
  )
}

const QUIZ_AIR: readonly Spot[] = [
  [111, 53, 30, 1],
  [16, 22, -26, 3],
  [14, 146, 20, 5],
]

function quizView(parts: LanguageParts, paint: Paint): Art {
  return [
    perched(64, parts, paint, 9),
    shadow(146, 184, 42),
    feathers(parts, paint, QUIZ_AIR),
    quizCard(parts.scramble),
    part(
      'pointer',
      at(
        146,
        44,
        motion(
          'bob',
          parts.scramble >= 2
            ? angryBalloon(52, 32, -1, at(0, 0, grawlix(), 0, 0.66))
            : balloon(54, 34, -1, C.cream, [
                svg`<circle cx="-13" r="4.2" fill=${GLYPH} /><circle r="4.2" fill=${GLYPH} /><circle cx="13" r="4.2" fill=${GLYPH} />`,
              ]),
        ),
      ),
    ),
    neglect(
      parts,
      [
        [14, 100],
        [188, 64],
      ],
      [
        [66, 16],
        [116, 18],
      ],
    ),
  ]
}

function pennant(accent: string): Art {
  const flag = yellowish(accent) ? C.coral : C.sun
  return part(
    'pennant',
    at(
      142,
      76,
      motion(
        'sway',
        at(
          0,
          0,
          [
            svg`<rect x="-2.6" y="-56" width="5.2" height="62" rx="2.6" fill=${C.cream} />`,
            svg`<circle cy="-57" r="4.4" fill=${C.sunDark} />`,
            svg`<path d="M2-53L38-40L2-25Z" fill=${flag} stroke=${flag} stroke-width="2.4" stroke-linejoin="round" />`,
            svg`<path d="M2-43L12.5-39.8L2-36Z" fill=${C.mint} stroke=${C.mint} stroke-width="1.6" stroke-linejoin="round" />`,
          ],
          10,
        ),
      ),
    ),
  )
}

function confetti(): Art {
  const bits = [
    [50, 26, C.mint, 20, 1],
    [116, 22, C.pink, -30, 2],
    [18, 74, C.sun, 40, 3],
    [176, 100, C.sky, -14, 4],
    [24, 124, C.lilac, 60, 5],
  ] as const
  return part(
    'confetti',
    bits.map(([x, y, color, turn, delay]) =>
      at(
        x,
        y,
        motion(
          'fall',
          svg`<rect x="-5" y="-2.6" width="10" height="5.2" rx="1.6" fill=${color} transform=${`rotate(${turn})`} />`,
          delay,
        ),
      ),
    ),
  )
}

function partyView(parts: LanguageParts, paint: Paint, accent: string): Art {
  return [
    pennant(accent),
    perched(84, parts, paint, 0, true),
    stack(156, parts.cards, checkMark(), 0.82),
    confetti(),
    sparkle(26, 42, 1.25, 1),
    sparkle(176, 128, 0.9, 2),
    sparkle(126, 118, 0.7, 3),
    sparkle(20, 150, 0.8, 4),
  ]
}

export function language(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = languageParts(scene)
  const accent = accentOf(scene, C.coral)
  const tired = mix(accent, C.musty, (parts.scruff / 3) * 0.3)
  const base = yellowish(accent) ? C.coral : C.sun
  const paint: Paint = {
    body: tired,
    dark: shadeOf(tired),
    light: tintOf(tired, 0.5),
    beak: mix(base, SOUR_DARK, parts.scruff / 6),
    beakDark: shadeOf(base, 0.3),
  }
  const views: Record<LanguageView, () => Art> = {
    sleep: () => sleepView(parts, paint),
    study: () => studyView(parts, paint),
    plead: () => pleadView(parts, paint),
    lesson: () => lessonView(parts, paint, accent),
    quiz: () => quizView(parts, paint),
    party: () => partyView(parts, paint, accent),
  }
  return frame('language', scene, options, views[parts.view]())
}
