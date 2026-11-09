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

export type BackupView = 'desk' | 'sync' | 'verify' | 'safe'

export interface BackupParts {
  view: BackupView
  files: number
  spill: boolean
  warning: boolean
  asleep: boolean
  lit: number
  gauge: string
  bar: number | null
  cracks: number
  sparks: number
  smoke: number
  bugs: number
  spring: boolean
  platter: boolean
  sweat: boolean
  mood: Mood
}

export const MAX_FILES = 6
const SEGMENTS = 5

const CRACKS_AT = [0.1, 0.35, 0.65] as const
const SPARKS_AT = [0.25, 0.5, 0.8] as const
const SMOKE_AT = [0.4, 0.6, 0.85] as const
const BUGS_AT = [0.7, 0.92] as const
const SPRING_AT = 0.55
const PLATTER_AT = 0.8
const SCARED_AT = 0.25

const DRIVE_ACCENT = mix(C.coral, C.sun, 0.32)
const SMOKE = mix(C.metalDark, C.fly, 0.45)
const SMOKE_LIGHT = mix(C.metalDark, C.fly, 0.2)
const FLOOR_Y = 178

export function backupParts(scene: SceneView): BackupParts {
  const { state } = scene
  const fill = clamp01(scene.fill)
  const stink = state === 'clean' ? 0 : clamp01(scene.stink)
  const scared = stink >= SCARED_AT
  const base = {
    files: 0,
    spill: false,
    warning: false,
    asleep: false,
    lit: 0,
    gauge: C.sun,
    bar: null,
    cracks: reached(stink, CRACKS_AT),
    sparks: reached(stink, SPARKS_AT),
    smoke: reached(stink, SMOKE_AT),
    bugs: reached(stink, BUGS_AT),
    spring: stink >= SPRING_AT,
    platter: stink >= PLATTER_AT,
    sweat: scared,
  }
  if (state === 'clean') {
    return { ...base, view: 'safe', lit: SEGMENTS, gauge: C.check, mood: 'happy' }
  }
  if (state === 'running') {
    return {
      ...base,
      view: 'sync',
      bar: clamp01(scene.progress),
      mood: stink >= SPRING_AT ? 'worried' : 'happy',
    }
  }
  if (state === 'waiting') {
    return {
      ...base,
      view: 'verify',
      lit: SEGMENTS - 1,
      gauge: C.check,
      mood: scared ? 'worried' : 'calm',
    }
  }
  if (state === 'due') {
    return {
      ...base,
      view: 'desk',
      files: MAX_FILES,
      spill: true,
      warning: true,
      lit: SEGMENTS,
      gauge: C.coral,
      sweat: true,
      mood: scared ? 'worried' : 'pleading',
    }
  }
  if (state === 'accumulating') {
    const files = Math.min(MAX_FILES - 1, Math.floor(fill * (MAX_FILES - 1)) + 1)
    return {
      ...base,
      view: 'desk',
      files,
      lit: files,
      mood: scared || files >= 4 ? 'worried' : 'calm',
    }
  }
  return { ...base, view: 'desk', asleep: true, mood: scared ? 'worried' : 'sleepy' }
}

const SHEET = 'M-11-19H6L14-11V16Q14 19 11 19H-11Q-14 19-14 16V-16Q-14-19-11-19Z'
const FOLD = 'M6-19V-13Q6-11 8-11H14Z'

function sheet(color: string, fold: string, glyph: Art): Art {
  return [svg`<path d=${SHEET} fill=${color} />`, svg`<path d=${FOLD} fill=${fold} />`, glyph]
}

function docFile(): Art {
  return sheet(
    C.cream,
    C.creamDark,
    svg`<path d="M-8-6H6M-8 1H8M-8 8H3" stroke=${C.skyDark} stroke-width="3.2" stroke-linecap="round" />`,
  )
}

function folderFile(): Art {
  return [
    svg`<path d="M-19-12Q-19-15-16-15H-6L-2-10H16Q19-10 19-7V12Q19 15 16 15H-16Q-19 15-19 12Z" fill=${C.sunDark} />`,
    svg`<rect x="-19" y="-4" width="38" height="19" rx="3" fill=${C.sun} />`,
  ]
}

function pictureFile(): Art {
  return sheet(C.metal, C.metalMid, [
    svg`<rect x="-10" y="-7" width="20" height="20" rx="2.5" fill=${C.sky} />`,
    svg`<circle cx="4.5" cy="-2" r="3" fill=${C.sun} />`,
    svg`<path d="M-10 13V9L-4 1L1 7L4 4L10 11V13Z" fill=${C.leafDark} />`,
  ])
}

function musicFile(): Art {
  return sheet(
    C.lilac,
    C.lilacDark,
    svg`<path d="M-3 9V-7L7-9V6" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" /><circle cx="-6.5" cy="9" r="4" fill="#fff" /><circle cx="3.5" cy="6" r="4" fill="#fff" />`,
  )
}

function videoFile(): Art {
  return sheet(
    C.pink,
    C.pinkDark,
    svg`<path d="M-6-7L9 2L-6 11Z" fill="#fff" stroke="#fff" stroke-width="2.4" stroke-linejoin="round" />`,
  )
}

function codeFile(): Art {
  return sheet(
    C.mint,
    C.mintDark,
    svg`<path d="M-5-5L-11 2L-5 9M5-5L11 2L5 9" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,
  )
}

const PILE = [
  [58, 80, -7, 0.96, docFile],
  [97, 84, 4, 1, folderFile],
  [130, 78, 9, 0.96, pictureFile],
  [66, 52, 9, 0.96, musicFile],
  [103, 54, -8, 0.96, videoFile],
  [80, 31, -4, 0.9, codeFile],
] as const

function pile(count: number): Art {
  return PILE.slice(0, count).map(([x, y, rotate, scale, art], i) =>
    part('file', at(x, y, art(), rotate, scale), i),
  )
}

function spilled(): Art {
  return part('spill', at(171, 171, docFile(), 78, 0.86))
}

function cloudShape(fill: string): Art {
  return svg`<g fill=${fill}><circle cx="-23" cy="6" r="16" /><circle cx="1" cy="-6" r="22" /><circle cx="25" cy="7" r="14.5" /><rect x="-39" y="3" width="78" height="18.5" rx="9.25" /></g>`
}

function cloud(x: number, y: number, scale: number, art?: Art): Art {
  return part(
    'cloud',
    at(x, y, [at(0, 3.5, cloudShape(C.metalMid)), cloudShape(C.metal), art ?? []], 0, scale),
  )
}

function cable(d: string, core: string): Art {
  return part('cable', [
    svg`<path d=${d} fill="none" stroke=${C.metalDark} stroke-width="8" stroke-linecap="round" />`,
    svg`<path d=${d} fill="none" stroke=${core} stroke-width="3.4" stroke-linecap="round" />`,
  ])
}

function gaugeArt(parts: BackupParts, track: string): Art {
  if (parts.bar !== null) {
    const width = round(Math.max(9, 73 * parts.bar))
    return part('progress', [
      svg`<rect x="-36.5" y="-27" width="73" height="9" rx="4.5" fill=${track} />`,
      svg`<rect x="-36.5" y="-27" width=${width} height="9" rx="4.5" fill=${C.mintDark} />`,
    ])
  }
  const cell = (i: number): Art => {
    const x = -36.5 + i * 15
    const on = i < parts.lit
    const pending = parts.view === 'verify' && i === parts.lit
    const art = svg`<rect x=${x} y="-27" width="13" height="9" rx="3" fill=${on ? parts.gauge : pending ? C.sun : track} />`
    return pending ? motion('flicker', art) : art
  }
  return part(
    'gauge',
    Array.from({ length: SEGMENTS }, (_, i) => cell(i)),
  )
}

function stroke(d: string, width: number): Art {
  return svg`<path d=${d} fill="none" stroke=${C.fly} stroke-width=${width} stroke-linecap="round" stroke-linejoin="round" />`
}

function crackArt(step: number): Art {
  if (step === 0) return []
  return part('crack', [
    stroke('M36-80L30-70L38-64L33-54', 3),
    when(step >= 2, () => [
      stroke('M33-54L40-46L34-37L41-28', 3.4),
      stroke('M38-64L47-61', 2.4),
      stroke('M-62-44L-50-40L-46-31L-38-29', 3.2),
    ]),
    when(step >= 3, () => [
      svg`<path d="M26-80L33-68L29-60L44-80Z" fill=${C.fly} />`,
      stroke('M41-28L36-18L43-4', 3.6),
      stroke('M-40-80L-34-69L-42-62', 3),
      stroke('M34-37L25-33', 2.4),
    ]),
  ])
}

function plaster(): Art {
  return part(
    'plaster',
    at(
      -46,
      -68,
      [
        svg`<rect x="-14" y="-5.5" width="28" height="11" rx="5.5" fill=${C.cream} />`,
        svg`<rect x="-5" y="-5.5" width="10" height="11" fill=${C.creamDark} />`,
      ],
      -32,
    ),
  )
}

function driveBody(parts: BackupParts, color: string): Art {
  const dark = shadeOf(color, 0.34)
  const deep = shadeOf(color, 0.5)
  const light = tintOf(color, 0.32)
  const plate = C.metal
  const track = C.metalMid
  const corner = shadeOf(color, 0.2)
  const led = parts.asleep ? mix(plate, deep, 0.4) : parts.warning ? C.coralDark : C.check
  return [
    svg`<rect x="-48" y="-4" width="24" height="6" rx="2" fill=${deep} /><rect x="24" y="-4" width="24" height="6" rx="2" fill=${deep} />`,
    svg`<rect x="-62" y="-80" width="124" height="79" rx="19" fill=${corner} />`,
    svg`<rect x="-38" y="-80" width="76" height="79" fill=${dark} />`,
    svg`<rect x="-38" y="-80" width="76" height="71" fill=${light} />`,
    svg`<rect x="-62" y="-57" width="124" height="33" fill=${color} />`,
    svg`<rect x="-38" y="-73" width="76" height="64" fill=${color} />`,
    svg`<rect x="-57.5" y="-55" width="5" height="29" rx="2.5" fill=${dark} /><rect x="52.5" y="-55" width="5" height="29" rx="2.5" fill=${dark} />`,
    svg`<rect x="-45" y="-67" width="90" height="55" rx="12" fill=${plate} />`,
    svg`<circle cx="38" cy="-60" r="3.4" fill=${led} />`,
    svg`<circle cx="-37" cy="-59.5" r="5" fill="none" stroke=${track} stroke-width="2.4" /><circle cx="-37" cy="-59.5" r="1.4" fill=${track} />`,
    gaugeArt(parts, track),
    face(0, -49, parts.mood, C.fly, 1.08),
    crackArt(parts.cracks),
    when(parts.cracks >= 2, plaster),
  ]
}

function bolt(x: number, y: number, size: number, delay: number, rotate = 0): Art {
  return part(
    'spark',
    at(
      x,
      y,
      motion(
        'flicker',
        svg`<path d="M3-15L-8 2H-1L-4 15L9-4H2Z" fill=${C.sun} stroke=${C.spark} stroke-width="1.6" stroke-linejoin="round" />`,
        delay,
      ),
      rotate,
      size,
    ),
  )
}

function puff(x: number, y: number, size: number, delay: number): Art {
  return part(
    'smoke',
    at(
      x,
      y,
      motion(
        'waft',
        [
          svg`<g fill=${SMOKE}><circle cx="-10" cy="3" r="10" /><circle cx="3" cy="-5" r="13" /><circle cx="13" cy="5" r="9" /></g>`,
          svg`<circle cx="0" cy="-8" r="6" fill=${SMOKE_LIGHT} />`,
        ],
        delay,
      ),
      0,
      size,
    ),
  )
}

function springArt(): Art {
  return part(
    'spring',
    at(
      33,
      -78,
      motion('wobble', [
        svg`<path d="M0 0L-7-4L8-9L-8-14L8-19L0-24" fill="none" stroke=${C.metalMid} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,
        svg`<circle cy="-27" r="4.6" fill=${C.metalDark} />`,
      ]),
    ),
  )
}

function platterArt(): Art {
  return part(
    'platter',
    at(-66, -7, [
      svg`<ellipse rx="13" ry="5.5" fill=${C.metalDark} />`,
      svg`<ellipse cy="-1.6" rx="13" ry="5.5" fill=${C.metal} />`,
      svg`<ellipse cy="-1.6" rx="3.6" ry="1.5" fill=${C.metalDark} />`,
    ]),
  )
}

const BOLTS = [
  [-72, -74, 1.05, 1, -14],
  [72, -64, 0.95, 2, 16],
  [-71, -26, 0.8, 3, 24],
] as const

const PUFFS: Record<'desk' | 'centre', ReadonlyArray<readonly [number, number, number, number]>> = {
  desk: [
    [-64, -102, 0.95, 1],
    [76, -86, 0.72, 2],
    [-66, -142, 1.05, 3],
  ],
  centre: [
    [-74, -146, 0.9, 1],
    [74, -144, 1, 2],
    [-78, -118, 0.7, 3],
  ],
}

const BUG_SPOTS = [
  [82, -118],
  [72, -24],
] as const

function damage(parts: BackupParts): Art {
  const puffs = parts.view === 'desk' ? PUFFS.desk : PUFFS.centre
  return [
    when(parts.platter, platterArt),
    puffs.slice(0, parts.smoke).map(([x, y, s, d]) => puff(x, y, s, d)),
    BOLTS.slice(0, parts.sparks).map(([x, y, s, d, r]) => bolt(x, y, s, d, r)),
    BUG_SPOTS.slice(0, parts.bugs).map(([x, y], i) => fly(x, y, i)),
    when(parts.sweat, () => [
      at(-27, -60, motion('drip', drop(0, 0, C.water, 0.72), 1)),
      at(26, -62, motion('drip', drop(0, 0, C.water, 0.6), 3)),
    ]),
  ]
}

function drive(x: number, parts: BackupParts, color: string, shaking: boolean): Art {
  const body = driveBody(parts, color)
  return at(x, FLOOR_Y, [
    when(parts.spring, springArt),
    part('drive', shaking ? motion('rumble', body) : body),
    damage(parts),
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

function warningSign(): Art {
  return part(
    'warning',
    at(
      150,
      40,
      motion(
        'pulse',
        at(
          0,
          0,
          [
            svg`<path d="M0-23L27 21H-27Z" fill=${C.sunDark} stroke=${C.sunDark} stroke-width="11" stroke-linejoin="round" transform="translate(0 3)" />`,
            svg`<path d="M0-23L27 21H-27Z" fill=${C.sun} stroke=${C.sun} stroke-width="11" stroke-linejoin="round" />`,
            svg`<rect x="-4" y="-11" width="8" height="20" rx="4" fill=${C.fly} />`,
            svg`<circle cy="17" r="4.6" fill=${C.fly} />`,
          ],
          0,
          0.84,
        ),
      ),
    ),
  )
}

function deskView(parts: BackupParts, color: string): Art {
  const line = 'M152 138C186 138 192 96 168 58'
  return [
    shadow(90, 183, 72),
    cable(line, parts.asleep ? C.metalMid : C.metal),
    svg`<rect x="150" y="131" width="13" height="14" rx="3" fill=${C.metalDark} />`,
    cloud(146, 40, 1, []),
    pile(parts.files),
    when(parts.spill, spilled),
    drive(90, parts, color, parts.cracks >= 3),
    when(parts.warning, warningSign),
    when(parts.asleep, () => [zed(50, 80, 0.72, 1), zed(68, 58, 1, 2), zed(48, 34, 0.62, 3)]),
  ]
}

function chevron(x: number, y: number, delay: number, size = 1): Art {
  return part(
    'data',
    at(
      x,
      y,
      motion(
        'rise',
        svg`<path d="M-13 7L0-7L13 7" fill="none" stroke=${C.mint} stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" />`,
        delay,
      ),
      0,
      size,
    ),
  )
}

function flyingFile(x: number, y: number, art: () => Art, rotate: number, delay: number): Art {
  return part('flying-file', at(x, y, motion('rise', at(0, 0, art(), rotate, 0.82), delay)))
}

function syncView(parts: BackupParts, color: string): Art {
  return [
    shadow(100, 183, 72),
    cable('M100 100V60', C.mint),
    cloud(100, 42, 1.3),
    at(
      100,
      40,
      motion(
        'throb',
        svg`<path d="M0-17V12M-13-4L0-17L13-4" fill="none" stroke=${C.skyDark} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`,
      ),
    ),
    chevron(62, 88, 1),
    chevron(100, 82, 3),
    chevron(138, 88, 2),
    flyingFile(26, 104, docFile, -8, 2),
    flyingFile(174, 100, pictureFile, 8, 4),
    drive(100, parts, color, true),
  ]
}

function badge(x: number, y: number, pending: boolean): Art {
  if (pending) {
    return at(
      x,
      y,
      motion(
        'pulse',
        svg`<circle r="10" fill=${C.sun} /><circle cx="-4.4" r="1.9" fill=${C.fly} /><circle r="1.9" fill=${C.fly} /><circle cx="4.4" r="1.9" fill=${C.fly} />`,
      ),
    )
  }
  return at(x, y, [
    svg`<circle r="10" fill=${C.check} />`,
    svg`<path d="M-4.8 0.4L-1.2 4.2L5 -3.4" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,
  ])
}

function spinner(): Art {
  const r = 15
  return part('spinner', [
    svg`<circle r=${r} fill="none" stroke=${C.metalMid} stroke-width="7" />`,
    motion(
      'spin',
      svg`<path d=${`M0 ${-r}A${r} ${r} 0 0 1 ${r} 0`} fill="none" stroke=${C.skyDark} stroke-width="7" stroke-linecap="round" />`,
    ),
  ])
}

function verifyView(parts: BackupParts, color: string): Art {
  return [
    shadow(100, 183, 72),
    cable('M100 100V60', C.metal),
    cloud(100, 42, 1.3, at(0, -1, spinner(), 0, 0.92)),
    part('verified', [at(38, 74, docFile(), -8, 0.92), badge(50, 90, false)]),
    part('pending', [at(162, 74, pictureFile(), 8, 0.92), badge(174, 90, true)]),
    drive(100, parts, color, parts.cracks >= 3),
  ]
}

const SHIELD = 'M0-37C10-29 21-26 32-26C32 8 25 26 0 40C-25 26-32 8-32-26C-21-26-10-29 0-37Z'

function shield(): Art {
  return part(
    'shield',
    at(
      100,
      54,
      motion('throb', [
        svg`<path d=${SHIELD} fill=${C.mintDark} transform="translate(0 3)" />`,
        svg`<path d=${SHIELD} fill="#fff" />`,
        at(0, 0, svg`<path d=${SHIELD} fill=${C.check} />`, 0, 0.82),
        svg`<path d="M-14 1L-4 12L15-10" fill="none" stroke="#fff" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round" />`,
      ]),
    ),
  )
}

const SAFE_SPARKLES = [
  [28, 66, 1.35, 1],
  [172, 60, 1.15, 2],
  [24, 124, 0.8, 3],
  [176, 128, 0.95, 4],
  [150, 22, 0.7, 5],
] as const

function safeView(parts: BackupParts, color: string): Art {
  return [
    shadow(100, 183, 72),
    cloud(100, 58, 1.42),
    shield(),
    drive(100, parts, color, false),
    SAFE_SPARKLES.map(([x, y, s, d]) => sparkle(x, y, s, d)),
  ]
}

export function backup(scene: SceneView, options?: SceneOptions): TemplateResult {
  const parts = backupParts(scene)
  const color = accentOf(scene, DRIVE_ACCENT)
  const views: Record<BackupView, (parts: BackupParts, color: string) => Art> = {
    desk: deskView,
    sync: syncView,
    verify: verifyView,
    safe: safeView,
  }
  const art = views[parts.view](parts, color)
  return frame('backup', scene, options, art)
}
