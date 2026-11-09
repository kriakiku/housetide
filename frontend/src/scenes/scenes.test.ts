import { describe, expect, test } from 'bun:test'

import { render } from 'lit'

import { PICKER_GROUPS } from '../panel/model.ts'
import { sceneStyles } from '../styles.ts'
import type { PillSlot, SceneName, SceneState, SceneView } from '../types.ts'
import { COLORS, superellipsePath, tintOf } from './common.ts'
import { genericParts } from './generic.ts'
import { renderScene, sceneFor, generic, laundry, pills, plant } from './index.ts'
import type { SceneOptions } from './index.ts'
import { laundryParts, MAX_PILE } from './laundry.ts'
import { ACCENTS, variantsFor } from './looks.ts'
import { pillsParts } from './pills.ts'
import { MAX_DROOP, plantParts } from './plant.ts'

const NAMES: SceneName[] = [
  'generic',
  'pills',
  'laundry',
  'plant',
  'teeth',
  'bed',
  'dishes',
  'trash',
  'vacuum',
  'pet',
  'bathroom',
  'fridge',
  'window',
  'water',
  'cooler',
  'gym',
  'pool',
  'ev',
  'fuel',
  'study',
  'language',
  'coding',
  'slides',
  'book',
  'filter',
  'bills',
  'yoga',
  'run',
  'groceries',
  'cooking',
  'call',
  'journal',
  'lawn',
  'music',
  'backup',
  'carwash',
  'owl',
]
const STATES: SceneState[] = ['resting', 'accumulating', 'due', 'running', 'waiting', 'clean']

function view(name: SceneName, state: SceneState, fill = 0, stink = 0, progress = 0.5): SceneView {
  return { name, state, fill, stink, progress }
}

function draw(scene: SceneView, options?: SceneOptions): Element {
  const host = document.createElement('div')
  render(renderScene(scene, options), host)
  const root = host.querySelector('svg')
  if (!root) throw new Error('scene did not render an svg')
  return root
}

function count(root: Element, name: string): number {
  return root.querySelectorAll(`[data-part="${name}"]`).length
}

describe('picking a scene', () => {
  test('finds each scene by name', () => {
    expect(sceneFor('laundry')).toBe(laundry)
    expect(sceneFor('pills')).toBe(pills)
    expect(sceneFor('plant')).toBe(plant)
    expect(sceneFor('generic')).toBe(generic)
  })

  test('falls back to generic for unknown names', () => {
    expect(sceneFor('toString')).toBe(generic)
    expect(sceneFor('nope')).toBe(generic)
  })
})

describe('every scene in every state', () => {
  for (const name of NAMES) {
    for (const state of STATES) {
      for (const [fill, stink] of [
        [0, 0],
        [0.5, 0.5],
        [1, 1],
        [Number.NaN, 7],
      ] as const) {
        test(`${name}/${state} at fill ${fill}, stink ${stink}`, () => {
          const root = draw(view(name, state, fill, stink))
          expect(root.getAttribute('viewBox')).toBe('0 0 200 200')
          expect(root.getAttribute('data-state')).toBe(state)
          expect(root.outerHTML).not.toContain('undefined')
          expect(root.outerHTML).not.toContain('NaN')
          for (const element of root.querySelectorAll('[class*="ht-a-"]')) {
            expect(element.hasAttribute('transform')).toBe(false)
          }
          expect(root.querySelectorAll('[id]').length).toBe(0)
        })
      }
    }
  }

  test('is deterministic', () => {
    expect(draw(view('laundry', 'due', 1, 0.7)).outerHTML).toBe(
      draw(view('laundry', 'due', 1, 0.7)).outerHTML,
    )
  })
})

describe('per-task look', () => {
  const LOOK = { accent: '#123456', variant: 'x' }
  const LAID = [
    [0, 0],
    [0.7, 0.2],
    [1, 1],
  ] as const

  for (const name of NAMES) {
    for (const state of STATES) {
      test(`${name}/${state} renders with a look`, () => {
        for (const [fill, stink] of LAID) {
          const html = draw({ ...view(name, state, fill, stink), look: LOOK }).outerHTML
          expect(html).not.toContain('undefined')
          expect(html).not.toContain('NaN')
        }
      })
    }
  }

  for (const name of NAMES.filter((item) => item !== 'generic')) {
    test(`accent changes ${name}`, () => {
      const plain = draw(view(name, 'due', 0.7, 0.2)).outerHTML
      expect(draw({ ...view(name, 'due', 0.7, 0.2), look: LOOK }).outerHTML).not.toBe(plain)
    })
  }

  for (const name of ['teeth', 'laundry'] as const) {
    for (const state of STATES) {
      test(`accent changes ${name}/${state}`, () => {
        const plain = draw(view(name, state, 0.7, 0.2)).outerHTML
        expect(draw({ ...view(name, state, 0.7, 0.2), look: LOOK }).outerHTML).not.toBe(plain)
      })
    }
  }

  test('the fridge face stays readable on a dark accent', () => {
    const html = draw({
      ...view('fridge', 'accumulating', 0.2),
      look: { accent: '#20243a' },
    }).outerHTML
    expect(html).not.toContain(`stroke="${COLORS.fly}"`)
    expect(html).toContain(`stroke="${tintOf('#20243a', 0.82)}"`)
  })

  test('a variant it does not have and a bad accent change nothing', () => {
    const plain = draw(view('gym', 'due', 1)).outerHTML
    const odd = { accent: 'red', variant: 'x' }
    expect(draw({ ...view('gym', 'due', 1), look: odd }).outerHTML).toBe(plain)
  })

  test('variants draw differently', () => {
    const drawn = (name: SceneName, variant: string): string =>
      draw({ ...view(name, 'due', 1), look: { variant } }).outerHTML
    expect(drawn('pet', 'dog')).not.toBe(drawn('pet', 'cat'))
    expect(drawn('laundry', 'white')).not.toBe(drawn('laundry', 'colored'))
    expect(drawn('laundry', 'black')).not.toBe(drawn('laundry', 'white'))
  })

  test('the palette is valid and every scene is grouped once', () => {
    expect(ACCENTS.length).toBeGreaterThanOrEqual(8)
    for (const { color } of ACCENTS) expect(color).toMatch(/^#[0-9a-f]{6}$/)
    expect(new Set(ACCENTS.map(({ color }) => color)).size).toBe(ACCENTS.length)
    const grouped = PICKER_GROUPS.flatMap((group) => group.scenes)
    expect(grouped.toSorted()).toEqual(NAMES.toSorted())
  })

  test('only pet and laundry have variants', () => {
    expect(NAMES.filter((name) => variantsFor(name).length > 0).toSorted()).toEqual([
      'laundry',
      'pet',
    ])
  })
})

describe('animation switch', () => {
  test('one option removes the animated class and nothing else', () => {
    const on = draw(view('laundry', 'running', 1))
    const off = draw(view('laundry', 'running', 1), { animations: false })
    expect(on.classList.contains('ht-animated')).toBe(true)
    expect(off.classList.contains('ht-animated')).toBe(false)
    expect(on.innerHTML).toBe(off.innerHTML)
  })

  test('keyframes touch only transform and opacity', () => {
    const blocks = [...sceneStyles.cssText.matchAll(/@keyframes[^{]+\{((?:[^{}]*\{[^{}]*\})*)/g)]
    expect(blocks.length).toBeGreaterThan(10)
    for (const block of blocks) {
      for (const [, property] of (block[1] ?? '').matchAll(/([a-z-]+)\s*:/g)) {
        expect(['transform', 'opacity']).toContain(property ?? '')
      }
    }
  })

  test('every animation class used by scenes has a rule behind reduced motion', () => {
    const css = sceneStyles.cssText
    const guarded = css.slice(css.indexOf('prefers-reduced-motion: no-preference'))
    const used = new Set<string>()
    for (const name of NAMES) {
      for (const state of STATES) {
        const root = draw(view(name, state, 0.9, 0.9))
        for (const element of root.querySelectorAll('[class*="ht-a-"]')) {
          for (const cls of element.classList) used.add(cls)
        }
      }
    }
    expect(used.size).toBeGreaterThan(8)
    for (const cls of used) expect(guarded).toContain(`.ht-animated .${cls}`)
  })
})

describe('laundry', () => {
  test('the pile grows through every step', () => {
    const steps = Array.from(
      { length: 11 },
      (_, i) => laundryParts(view('laundry', 'accumulating', i / 10)).pile,
    )
    expect(new Set(steps).size).toBeGreaterThanOrEqual(6)
    expect(steps).toEqual(steps.toSorted((a, b) => a - b))
  })

  test('rendered garments increase with fill', () => {
    const counts = [0, 0.2, 0.35, 0.55, 0.7, 0.95].map((fill) =>
      count(draw(view('laundry', 'accumulating', fill)), 'pile-step'),
    )
    expect(counts).toEqual([0, 1, 2, 3, 4, 5])
  })

  test('due overflows beyond the fullest accumulating pile', () => {
    const root = draw(view('laundry', 'due', 1))
    expect(count(root, 'pile-step')).toBe(MAX_PILE)
    expect(count(root, 'overflow')).toBe(1)
    expect(count(draw(view('laundry', 'accumulating', 1)), 'overflow')).toBe(0)
  })

  test('stench comes first, then flies, both progressive', () => {
    const at = (stink: number): [number, number] => {
      const root = draw(view('laundry', 'due', 1, stink))
      return [count(root, 'stench'), count(root, 'fly')]
    }
    expect(at(0)).toEqual([0, 0])
    expect(at(0.1)).toEqual([1, 0])
    expect(at(0.35)).toEqual([2, 0])
    expect(at(0.5)).toEqual([2, 1])
    expect(at(0.6)).toEqual([3, 1])
    expect(at(0.8)).toEqual([3, 2])
    expect(at(1)).toEqual([3, 3])
  })

  test('running rumbles and turns the drum', () => {
    const root = draw(view('laundry', 'running', 1))
    expect(root.querySelector('[data-part="machine"] > .ht-a-rumble')).not.toBeNull()
    expect(root.querySelector('[data-part="drum"] .ht-a-spin')).not.toBeNull()
    expect(count(root, 'bubble')).toBeGreaterThanOrEqual(3)
    expect(count(root, 'door')).toBe(0)
  })

  test('waiting is still, with an open door and drips', () => {
    const root = draw(view('laundry', 'waiting', 1))
    expect(root.querySelector('.ht-a-rumble')).toBeNull()
    expect(root.querySelector('.ht-a-spin')).toBeNull()
    expect(count(root, 'bubble')).toBe(0)
    expect(count(root, 'door')).toBe(1)
    expect(count(root, 'wet-clothes')).toBe(1)
    expect(root.querySelectorAll('.ht-a-drip').length).toBeGreaterThanOrEqual(2)
  })

  test('stink adds a growing musty cloud while waiting', () => {
    const clouds = [0, 0.1, 0.5, 1].map((stink) =>
      count(draw(view('laundry', 'waiting', 1, stink)), 'cloud'),
    )
    expect(clouds).toEqual([0, 1, 2, 3])
  })

  test('clean hangs laundry with sparkles and no smell', () => {
    const root = draw(view('laundry', 'clean', 0, 1))
    expect(count(root, 'line')).toBe(1)
    expect(count(root, 'sparkle')).toBeGreaterThanOrEqual(3)
    expect(count(root, 'stench')).toBe(0)
    expect(count(root, 'fly')).toBe(0)
  })
})

describe('pills', () => {
  test('earlier days are popped, later days are intact', () => {
    const root = draw(view('pills', 'accumulating', 0.2), { day: 2 })
    expect(count(root, 'empty-well')).toBe(2)
    expect(count(root, 'pill')).toBe(4)
    expect(count(root, 'next-pill')).toBe(1)
  })

  test('day wraps into the week', () => {
    expect(pillsParts(view('pills', 'due', 1), 8).day).toBe(1)
    expect(pillsParts(view('pills', 'due', 1), -1).day).toBe(6)
  })

  test('due pulses the next pill', () => {
    const root = draw(view('pills', 'due', 1))
    expect(root.querySelector('[data-part="next-pill"] .ht-a-throb')).not.toBeNull()
    expect(root.querySelector('[data-part="halo"] .ht-a-pulse')).not.toBeNull()
  })

  test('clean pops that pill with a check', () => {
    const root = draw(view('pills', 'clean'), { day: 3 })
    expect(count(root, 'next-pill')).toBe(0)
    expect(count(root, 'empty-well')).toBe(4)
    expect(count(root, 'check')).toBe(1)
  })

  test('neglect builds up with stink', () => {
    const levels = [0, 0.2, 0.5, 0.8].map((stink) => pillsParts(view('pills', 'due', 1, stink)))
    expect(levels.map((level) => level.neglect)).toEqual([0, 1, 2, 3])
    expect(levels.map((level) => level.tilt)).toEqual([0, -3, -6, -10])
    expect(count(draw(view('pills', 'due', 1, 0.5)), 'cobweb')).toBe(1)
    expect(count(draw(view('pills', 'due', 1, 0.2)), 'cobweb')).toBe(0)
    expect(count(draw(view('pills', 'due', 1, 0.8)), 'spider')).toBe(1)
  })
})

describe('pills with real slots', () => {
  const CODES: Record<string, PillSlot> = { t: 'taken', m: 'missed', c: 'current', f: 'full' }
  const slots = (row: string): PillSlot[] => row.split('').map((code) => CODES[code] ?? 'full')
  const dosed = (state: SceneState, row: string, stink = 0): SceneView => ({
    ...view('pills', state, 1, stink),
    slots: slots(row),
  })
  const indexes = (root: Element, name: string): (string | null)[] =>
    [...root.querySelectorAll(`[data-part="${name}"]`)].map((el) => el.getAttribute('data-index'))

  test('taken cells are popped and empty', () => {
    const root = draw(dosed('due', 'ttcffff'))
    expect(indexes(root, 'empty-well')).toEqual(['0', '1'])
    expect(root.querySelector('[data-part="pill"][data-index="0"]')).toBeNull()
  })

  test('the current cell pulses when due', () => {
    const root = draw(dosed('due', 'ffffcff'))
    expect(indexes(root, 'next-pill')).toEqual(['4'])
    expect(root.querySelector('[data-part="next-pill"] .ht-a-throb')).not.toBeNull()
    expect(root.querySelector('[data-part="halo"] .ht-a-pulse')).not.toBeNull()
  })

  test.each(['resting', 'accumulating'] as const)('a current cell pulses while %s', (state) => {
    const root = draw(dosed(state, 'tcfffff'))
    expect(indexes(root, 'next-pill')).toEqual(['1'])
    expect(root.querySelector('[data-part="next-pill"] .ht-a-throb')).not.toBeNull()
    expect(root.querySelector('[data-part="halo"] .ht-a-pulse')).not.toBeNull()
  })

  test.each(['running', 'waiting'] as const)('a current cell pulses while %s', (state) => {
    const root = draw(dosed(state, 'tcfffff'))
    expect(root.querySelector('[data-part="halo"] .ht-a-pulse')).not.toBeNull()
  })

  test('being due is louder than being upcoming', () => {
    const ring = (state: SceneState): string | null | undefined =>
      draw(dosed(state, 'tcfffff'))
        .querySelector('[data-part="halo"] rect')
        ?.getAttribute('opacity')
    expect(ring('due')).toBe('1')
    expect(Number(ring('resting'))).toBeLessThan(1)
  })

  test('a pack with no current cell does not pulse', () => {
    const root = draw(dosed('resting', 'ttfffff'))
    expect(root.querySelector('.ht-a-throb')).toBeNull()
    expect(root.querySelector('.ht-a-pulse')).toBeNull()
  })

  test('without slots only a due pill pulses', () => {
    const root = draw(view('pills', 'accumulating', 1))
    expect(root.querySelector('.ht-a-throb')).toBeNull()
    expect(root.querySelector('.ht-a-pulse')).toBeNull()
  })

  test('missed cells keep their pill but look neglected', () => {
    const root = draw(dosed('due', 'mmcffff'))
    expect(indexes(root, 'missed-pill')).toEqual(['0', '1'])
    expect(indexes(root, 'empty-well')).toEqual([])
    const pill = root.querySelector('[data-part="pill"]')?.innerHTML
    const missed = root.querySelector('[data-part="missed-pill"]')?.innerHTML
    expect(missed).toBeDefined()
    expect(missed).not.toBe(pill)
  })

  test('missed cells stay different from full ones when the pack goes stale', () => {
    const root = draw(dosed('due', 'mfcffff', 1))
    const fill = (name: string): string | null | undefined =>
      root.querySelector(`[data-part="${name}"] g rect`)?.getAttribute('fill')
    expect(fill('missed-pill')).not.toBe(fill('pill'))
  })

  test('full cells are normal pills', () => {
    const root = draw(dosed('due', 'fffcfff'))
    expect(indexes(root, 'pill')).toEqual(['0', '1', '2', '4', '5', '6'])
  })

  test('clean puts the check on the last taken cell', () => {
    const root = draw(dosed('clean', 'tmtffff'))
    expect(pillsParts(dosed('clean', 'tmtffff')).day).toBe(2)
    expect(count(root, 'check')).toBe(1)
    expect(indexes(root, 'empty-well')).toEqual(['0', '2'])
    expect(indexes(root, 'missed-pill')).toEqual(['1'])
    expect(count(root, 'next-pill')).toBe(0)
  })

  test('nothing is singled out without a focus cell', () => {
    const resting = draw(dosed('resting', 'mffffff'))
    expect(count(resting, 'next-pill')).toBe(0)
    expect(count(resting, 'halo')).toBe(0)
    expect(count(resting, 'pill')).toBe(6)
    const clean = draw(dosed('clean', 'fffffff'))
    expect(count(clean, 'check')).toBe(0)
    expect(count(clean, 'pill')).toBe(7)
  })

  test('slots win over the day option', () => {
    expect(pillsParts(dosed('due', 'fcfffff'), 5).day).toBe(1)
  })

  test('without valid slots the fixed picture stays', () => {
    const fixed = pillsParts(view('pills', 'due', 1), 2)
    expect(fixed.day).toBe(2)
    expect(fixed.cells).toEqual(slots('ttfffff'))
    const short = { ...view('pills', 'due', 1), slots: slots('cff') }
    expect(pillsParts(short, 2).day).toBe(2)
    const root = draw(view('pills', 'due', 1), { day: 2 })
    expect(count(root, 'missed-pill')).toBe(0)
    expect(indexes(root, 'empty-well')).toEqual(['0', '1'])
    expect(indexes(root, 'next-pill')).toEqual(['2'])
  })
})

describe('plant', () => {
  test('droops with fill', () => {
    const steps = [0, 0.25, 0.45, 0.65, 0.9].map(
      (fill) => plantParts(view('plant', 'accumulating', fill)).droop,
    )
    expect(steps).toEqual([0, 1, 2, 3, 4])
    expect(plantParts(view('plant', 'due', 1)).droop).toBe(MAX_DROOP)
  })

  test('wilts with stink, losing petals', () => {
    const petals = [0, 0.2, 0.5, 0.9].map((stink) =>
      count(draw(view('plant', 'due', 1, stink)), 'petal'),
    )
    expect(petals).toEqual([8, 6, 4, 2])
    expect(count(draw(view('plant', 'due', 1, 0.9)), 'fallen-leaf')).toBe(3)
  })

  test('clean perks up with water drops', () => {
    const parts = plantParts(view('plant', 'clean', 1, 1))
    expect(parts.droop).toBe(0)
    expect(parts.wilt).toBe(0)
    expect(count(draw(view('plant', 'clean', 1, 1)), 'drops')).toBe(1)
  })

  test('running brings the watering can', () => {
    expect(count(draw(view('plant', 'running', 0.5)), 'watering-can')).toBe(1)
    expect(count(draw(view('plant', 'waiting', 0.5)), 'watering-can')).toBe(0)
  })
})

describe('generic', () => {
  test('the tide follows fill, then progress', () => {
    expect(genericParts(view('generic', 'accumulating', 0.4)).level).toBeCloseTo(0.4)
    expect(genericParts(view('generic', 'due', 0.4)).level).toBe(1)
    const running = genericParts(view('generic', 'running', 1, 0, 0.5))
    expect(running.level).toBeCloseTo(0.5)
    expect(running.arc).toBeCloseTo(0.5)
  })

  test('stink tints the water warmer', () => {
    const fillOf = (stink: number): string | null | undefined =>
      draw(view('generic', 'due', 1, stink))
        .querySelector('.ht-a-tide path')
        ?.getAttribute('fill')
    expect(fillOf(0)).not.toBe(fillOf(1))
    expect(fillOf(1)).toBe('#ff7a4f')
  })

  test('clean shows a check, not the boat', () => {
    const root = draw(view('generic', 'clean'))
    expect(count(root, 'check')).toBe(1)
    expect(count(root, 'boat')).toBe(0)
  })
})

describe('owl', () => {
  test('keeps the knife away until it has been ignored for a while', () => {
    expect(count(draw(view('owl', 'clean')), 'knife')).toBe(0)
    expect(count(draw(view('owl', 'due', 1, 0)), 'knife')).toBe(0)
    expect(count(draw(view('owl', 'due', 1, 0.9)), 'knife')).toBe(1)
  })
})

describe('superellipse corners', () => {
  test('stays inside the box and bulges past a circular corner', () => {
    const path = superellipsePath(0, 0, 100, 100, 20)
    expect(path.startsWith('M')).toBe(true)
    expect(path.endsWith('Z')).toBe(true)
    const numbers = path.match(/-?[\d.]+/g)?.map(Number) ?? []
    expect(Math.min(...numbers)).toBeGreaterThanOrEqual(0)
    expect(Math.max(...numbers)).toBeLessThanOrEqual(100)
    const points = Array.from({ length: numbers.length / 2 }, (_, i) => [
      numbers[i * 2] as number,
      numbers[i * 2 + 1] as number,
    ])
    const farthest = Math.max(...points.map(([x = 0, y = 0]) => Math.hypot(x - 80, y - 20)))
    expect(farthest).toBeGreaterThan(20)
  })
})
