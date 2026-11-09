import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test'

import {
  activeGestures,
  commitThreshold,
  defaultGesture,
  GestureController,
  haptic,
  resisted,
  SPRING_MS,
} from './gestures.ts'
import type { ActiveGestures, GestureOptions, TaskAction } from './gestures.ts'

interface Rig {
  element: HTMLElement
  host: HTMLElement
  reveal: HTMLElement
  button: HTMLElement
  runs: TaskAction[]
  blocked: Set<TaskAction>
  controller: GestureController
}

let rigs: Rig[] = []
let haptics: unknown[] = []

function onHaptic(event: Event): void {
  if (event instanceof CustomEvent) haptics.push(event.detail)
}

beforeEach(() => {
  haptics = []
  window.addEventListener('haptic', onHaptic)
})

afterEach(() => {
  window.removeEventListener('haptic', onHaptic)
  for (const rig of rigs) {
    rig.controller.detach()
    rig.host.remove()
  }
  rigs = []
})

function setup(gestures: ActiveGestures, options: Partial<GestureOptions> = {}, width = 400): Rig {
  const host = document.createElement('div')
  const reveal = document.createElement('div')
  reveal.className = 'swipe-reveal'
  const element = document.createElement('div')
  const button = document.createElement('button')
  element.append(button)
  host.append(reveal, element)
  document.body.append(host)
  element.getBoundingClientRect = (): DOMRect => new DOMRect(0, 0, width, 52)
  const runs: TaskAction[] = []
  const blocked = new Set<TaskAction>()
  const controller = new GestureController(element, {
    gestures,
    animations: false,
    available: (action) => !blocked.has(action),
    run: (action) => {
      runs.push(action)
    },
    timing: { longPress: 30, doubleTap: 30, flash: 5 },
    ...options,
  })
  controller.attach()
  const rig = { element, host, reveal, button, runs, blocked, controller }
  rigs.push(rig)
  return rig
}

function fire(target: EventTarget, type: string, x = 0, y = 0, init: PointerEventInit = {}): void {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      isPrimary: true,
      button: 0,
      ...init,
    }),
  )
}

function drag(element: HTMLElement, dx: number, dy = 0): void {
  fire(element, 'pointerdown', 200, 200)
  fire(element, 'pointermove', 200 + dx, 200 + dy)
  fire(element, 'pointerup', 200 + dx, 200 + dy)
}

function tap(element: HTMLElement, x = 200, y = 200): void {
  fire(element, 'pointerdown', x, y)
  fire(element, 'pointerup', x, y)
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

const SWIPES: ActiveGestures = { swipe_right: 'advance', swipe_left: 'skip' }

describe('config', () => {
  test('list and scenes have no gestures by default', () => {
    expect(activeGestures('list')).toEqual({})
    expect(activeGestures('scenes')).toEqual({})
  })

  for (const layout of ['picture', 'compact', 'bubbles'] as const) {
    test(`${layout} has the touch defaults`, () => {
      expect(activeGestures(layout)).toEqual({
        swipe_right: 'advance',
        swipe_left: 'skip',
        long_press: 'undo',
      })
      expect(defaultGesture(layout, 'tap')).toBe('none')
    })
  }

  test('a config value overrides and none switches off', () => {
    expect(activeGestures('picture', { swipe_right: 'none', tap: 'advance' })).toEqual({
      swipe_left: 'skip',
      long_press: 'undo',
      tap: 'advance',
    })
    expect(activeGestures('list', { swipe_up: 'undo' })).toEqual({ swipe_up: 'undo' })
  })
})

describe('thresholds', () => {
  test('the smaller of 72px and 35% of the width', () => {
    expect(commitThreshold(400)).toBe(72)
    expect(commitThreshold(100)).toBeCloseTo(35)
    expect(commitThreshold(72)).toBeCloseTo(25.2)
    expect(commitThreshold(0)).toBe(72)
  })

  test('below it springs back, at it commits', () => {
    const rig = setup(SWIPES)
    drag(rig.element, 71)
    expect(rig.runs).toEqual([])
    drag(rig.element, 72)
    expect(rig.runs).toEqual(['advance'])
  })

  test('a narrow task commits sooner', () => {
    const rig = setup(SWIPES, {}, 100)
    drag(rig.element, -34)
    expect(rig.runs).toEqual([])
    drag(rig.element, -36)
    expect(rig.runs).toEqual(['skip'])
  })

  test('the task lags behind the finger', () => {
    expect(resisted(50, 72)).toBeLessThan(50)
    expect(resisted(200, 72) - resisted(100, 72)).toBeLessThan(100)
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 50, 0)
    expect(rig.element.style.transform).toBe(`translate3d(${resisted(50, 72)}px, 0, 0)`)
    fire(rig.element, 'pointercancel', 50, 0)
  })

  test('commits where the finger lifts, not where it last moved', () => {
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 100, 0)
    fire(rig.element, 'pointerup', 20, 0)
    expect(rig.runs).toEqual([])
  })
})

describe('direction lock', () => {
  test('a vertical drag in a horizontal setup does nothing', () => {
    const rig = setup(SWIPES)
    drag(rig.element, 0, 120)
    expect(rig.runs).toEqual([])
    expect(rig.element.style.transform).toBe('')
  })

  test('stays locked after it has decided', () => {
    const rig = setup({ ...SWIPES, swipe_down: 'undo' })
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 20, 2)
    fire(rig.element, 'pointermove', 22, 200)
    expect(rig.element.style.transform).toContain('translate3d(19')
    fire(rig.element, 'pointerup', 22, 200)
    expect(rig.runs).toEqual([])
  })

  test('vertical swipes move vertically', () => {
    const rig = setup({ swipe_up: 'skip', swipe_down: 'undo' })
    fire(rig.element, 'pointerdown', 0, 200)
    fire(rig.element, 'pointermove', 0, 150)
    expect(rig.element.style.transform).toBe(`translate3d(0, ${-resisted(50, 72)}px, 0)`)
    expect(rig.reveal.dataset.dir).toBe('up')
    fire(rig.element, 'pointerup', 0, 100)
    expect(rig.runs).toEqual(['skip'])
    drag(rig.element, 0, 90)
    expect(rig.runs).toEqual(['skip', 'undo'])
  })

  test('a horizontal drag in a vertical setup does nothing', () => {
    const rig = setup({ swipe_up: 'skip' })
    drag(rig.element, 120)
    expect(rig.runs).toEqual([])
  })

  test('touch action depends on vertical swipes', () => {
    expect(setup(SWIPES).element.style.touchAction).toBe('pan-y')
    expect(setup({ long_press: 'undo' }).element.style.touchAction).toBe('pan-y')
    expect(setup({ swipe_up: 'skip' }).element.style.touchAction).toBe('none')
    expect(setup({ swipe_down: 'skip' }).element.style.touchAction).toBe('none')
  })

  test('an updated map updates touch action', () => {
    const rig = setup(SWIPES)
    rig.controller.update({
      gestures: { swipe_up: 'skip' },
      animations: false,
      available: () => true,
      run: () => undefined,
    })
    expect(rig.element.style.touchAction).toBe('none')
  })

  test('a direction with no action does not move', () => {
    const rig = setup({ swipe_right: 'advance' })
    fire(rig.element, 'pointerdown', 200, 0)
    fire(rig.element, 'pointermove', 100, 0)
    expect(rig.element.style.transform).toBe('')
    expect(rig.reveal.hasAttribute('data-action')).toBe(false)
    fire(rig.element, 'pointerup', 100, 0)
    expect(rig.runs).toEqual([])
  })
})

describe('reveal', () => {
  test('names the action and marks when it would fire', () => {
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 200, 0)
    fire(rig.element, 'pointermove', 230, 0)
    expect(rig.reveal.dataset.action).toBe('advance')
    expect(rig.reveal.dataset.dir).toBe('right')
    expect(rig.reveal.hasAttribute('data-armed')).toBe(false)
    expect(Number(rig.reveal.style.opacity)).toBeGreaterThan(0)
    expect(rig.host.hasAttribute('data-active')).toBe(true)
    fire(rig.element, 'pointermove', 290, 0)
    expect(rig.reveal.hasAttribute('data-armed')).toBe(true)
    fire(rig.element, 'pointermove', 150, 0)
    expect(rig.reveal.dataset.action).toBe('skip')
    expect(rig.reveal.dataset.dir).toBe('left')
    fire(rig.element, 'pointerup', 200, 0)
    expect(rig.runs).toEqual([])
  })

  test('fades the task where the layer is too small to see around', () => {
    const rig = setup(SWIPES, { fade: true })
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 80, 0)
    expect(Number(rig.element.style.opacity)).toBeCloseTo(0.25)
    fire(rig.element, 'pointerup', 0, 0)
    expect(rig.element.style.opacity).toBe('')
  })

  test('is cleaned up after a snap', () => {
    const rig = setup(SWIPES)
    drag(rig.element, 100)
    expect(rig.element.style.transform).toBe('')
    expect(rig.element.style.willChange).toBe('')
    expect(rig.reveal.hasAttribute('data-action')).toBe(false)
    expect(rig.reveal.hasAttribute('data-armed')).toBe(false)
    expect(rig.host.hasAttribute('data-active')).toBe(false)
  })
})

describe('motion', () => {
  test('springs when animations are on, then clears', async () => {
    const rig = setup(SWIPES, { animations: true })
    drag(rig.element, 100)
    expect(rig.element.style.transition).toContain('transform')
    expect(rig.element.style.transform).toBe('')
    expect(rig.reveal.style.opacity).toBe('0')
    await wait(SPRING_MS + 30)
    expect(rig.element.style.transition).toBe('')
    expect(rig.reveal.hasAttribute('data-action')).toBe(false)
  })

  test('snaps with animations off', () => {
    const rig = setup(SWIPES, { animations: false })
    drag(rig.element, 100)
    expect(rig.element.style.transition).toBe('')
  })

  test('snaps with reduced motion', () => {
    const spy = spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({ matches: query.includes('reduce'), media: query }) as unknown as MediaQueryList,
    )
    const rig = setup(SWIPES, { animations: true })
    drag(rig.element, 100)
    expect(rig.element.style.transition).toBe('')
    spy.mockRestore()
  })

  test('a new press during the spring starts clean', () => {
    const rig = setup(SWIPES, { animations: true })
    drag(rig.element, 100)
    fire(rig.element, 'pointerdown', 0, 0)
    expect(rig.element.style.transition).toBe('')
    fire(rig.element, 'pointerup', 0, 0)
  })
})

describe('tap, double tap, long press', () => {
  test('tap fires at once when no double tap is configured', () => {
    const rig = setup({ tap: 'advance' })
    tap(rig.element)
    expect(rig.runs).toEqual(['advance'])
  })

  test('tap waits for a double tap only when one is configured', async () => {
    const rig = setup({ tap: 'advance', double_tap: 'skip' })
    tap(rig.element)
    expect(rig.runs).toEqual([])
    await wait(50)
    expect(rig.runs).toEqual(['advance'])
  })

  test('double tap replaces the tap', async () => {
    const rig = setup({ tap: 'advance', double_tap: 'skip' })
    tap(rig.element)
    tap(rig.element)
    expect(rig.runs).toEqual(['skip'])
    await wait(50)
    expect(rig.runs).toEqual(['skip'])
  })

  test('two taps far apart are two taps', () => {
    const rig = setup({ tap: 'advance', double_tap: 'skip' })
    tap(rig.element, 10, 10)
    tap(rig.element, 200, 10)
    expect(rig.runs).toEqual(['advance'])
  })

  test('double tap works with no tap', async () => {
    const rig = setup({ double_tap: 'undo' })
    tap(rig.element)
    await wait(50)
    expect(rig.runs).toEqual([])
    tap(rig.element)
    tap(rig.element)
    expect(rig.runs).toEqual(['undo'])
  })

  test('a swipe never fires a tap', async () => {
    const rig = setup({ ...SWIPES, tap: 'undo', double_tap: 'undo' })
    drag(rig.element, 100)
    await wait(50)
    expect(rig.runs).toEqual(['advance'])
  })

  test('a short drag that did not commit is no tap either', () => {
    const rig = setup({ ...SWIPES, tap: 'undo' })
    drag(rig.element, 30)
    expect(rig.runs).toEqual([])
  })

  test('a small tremble is still a tap', () => {
    const rig = setup({ ...SWIPES, tap: 'undo' })
    fire(rig.element, 'pointerdown', 100, 100)
    fire(rig.element, 'pointermove', 104, 103)
    fire(rig.element, 'pointerup', 104, 103)
    expect(rig.runs).toEqual(['undo'])
  })

  test('a vertical scroll is no tap', () => {
    const rig = setup({ ...SWIPES, tap: 'undo' })
    drag(rig.element, 0, 60)
    expect(rig.runs).toEqual([])
  })

  test('long press fires while held, once, and no tap after it', async () => {
    const rig = setup({ long_press: 'undo', tap: 'advance' })
    fire(rig.element, 'pointerdown', 100, 100)
    await wait(50)
    expect(rig.runs).toEqual(['undo'])
    expect(rig.reveal.dataset.action).toBe('undo')
    expect(rig.element.style.transform).toContain('scale')
    expect(Number(rig.element.style.opacity)).toBeCloseTo(0.25)
    fire(rig.element, 'pointermove', 200, 100)
    fire(rig.element, 'pointerup', 200, 100)
    expect(rig.runs).toEqual(['undo'])
    expect(rig.element.style.transform).toBe('')
    expect(rig.element.style.opacity).toBe('')
  })

  test('releasing early is a tap, not a long press', async () => {
    const rig = setup({ long_press: 'undo', tap: 'advance' })
    tap(rig.element)
    await wait(50)
    expect(rig.runs).toEqual(['advance'])
  })

  test('moving cancels a long press', async () => {
    const rig = setup({ long_press: 'undo', ...SWIPES })
    fire(rig.element, 'pointerdown', 100, 100)
    fire(rig.element, 'pointermove', 130, 100)
    await wait(50)
    expect(rig.runs).toEqual([])
    fire(rig.element, 'pointerup', 130, 100)
  })

  test('the second press stops the wait for a double tap', async () => {
    const rig = setup({ tap: 'advance', double_tap: 'undo' })
    tap(rig.element)
    fire(rig.element, 'pointerdown', 200, 200)
    await wait(50)
    expect(rig.runs).toEqual([])
    fire(rig.element, 'pointerup', 200, 200)
    expect(rig.runs).toEqual(['undo'])
    await wait(50)
    expect(rig.runs).toEqual(['undo'])
  })

  test('a second press that becomes a drag leaves the first tap standing', () => {
    const rig = setup({ ...SWIPES, tap: 'undo', double_tap: 'undo' })
    tap(rig.element)
    fire(rig.element, 'pointerdown', 200, 200)
    expect(rig.runs).toEqual([])
    fire(rig.element, 'pointermove', 300, 200)
    expect(rig.runs).toEqual(['undo'])
    fire(rig.element, 'pointerup', 300, 200)
    expect(rig.runs).toEqual(['undo', 'advance'])
  })

  test('a refused first tap does not disturb the drag that settles it', () => {
    const rig = setup({ ...SWIPES, tap: 'undo', double_tap: 'undo' })
    rig.blocked.add('undo')
    tap(rig.element)
    fire(rig.element, 'pointerdown', 200, 200)
    fire(rig.element, 'pointermove', 250, 200)
    expect(rig.element.style.transform).toContain('translate3d')
    expect(rig.host.hasAttribute('data-active')).toBe(true)
    expect(rig.reveal.dataset.dir).toBe('right')
    fire(rig.element, 'pointercancel', 250, 200)
  })

  test('a second press that becomes a long press leaves the first tap standing', async () => {
    const rig = setup({ tap: 'advance', double_tap: 'skip', long_press: 'undo' })
    tap(rig.element)
    fire(rig.element, 'pointerdown', 200, 200)
    await wait(50)
    expect(rig.runs).toEqual(['advance', 'undo'])
    fire(rig.element, 'pointerup', 200, 200)
    expect(rig.runs).toEqual(['advance', 'undo'])
  })

  test('a cancelled second press leaves the first tap standing', () => {
    const rig = setup({ tap: 'advance', double_tap: 'skip' })
    tap(rig.element)
    fire(rig.element, 'pointerdown', 200, 200)
    fire(rig.element, 'pointercancel', 200, 200)
    expect(rig.runs).toEqual(['advance'])
  })

  test('a press far away settles the first tap at once', async () => {
    const rig = setup({ tap: 'advance', double_tap: 'skip' })
    tap(rig.element, 10, 10)
    fire(rig.element, 'pointerdown', 200, 10)
    expect(rig.runs).toEqual(['advance'])
    await wait(50)
    expect(rig.runs).toEqual(['advance'])
    fire(rig.element, 'pointerup', 200, 10)
    await wait(50)
    expect(rig.runs).toEqual(['advance', 'advance'])
  })

  test('the context menu that comes on release is kept away until the next press', async () => {
    const rig = setup({ long_press: 'undo' })
    fire(rig.element, 'pointerdown', 0, 0)
    await wait(50)
    fire(rig.element, 'pointerup', 0, 0)
    const lifted = new Event('contextmenu', { cancelable: true })
    rig.element.dispatchEvent(lifted)
    expect(lifted.defaultPrevented).toBe(true)
    fire(rig.element, 'pointerdown', 0, 0, { button: 2 })
    fire(rig.element, 'pointerup', 0, 0, { button: 2 })
    const right = new Event('contextmenu', { cancelable: true })
    rig.element.dispatchEvent(right)
    expect(right.defaultPrevented).toBe(false)
  })

  test('the context menu stays away during a press only', () => {
    const rig = setup({ long_press: 'undo' })
    const quiet = new Event('contextmenu', { cancelable: true })
    rig.element.dispatchEvent(quiet)
    expect(quiet.defaultPrevented).toBe(false)
    fire(rig.element, 'pointerdown', 0, 0)
    const pressed = new Event('contextmenu', { cancelable: true })
    rig.element.dispatchEvent(pressed)
    expect(pressed.defaultPrevented).toBe(true)
    fire(rig.element, 'pointerup', 0, 0)
  })
})

describe('disabled actions', () => {
  test('a swipe shows it disabled and does not fire', () => {
    const rig = setup(SWIPES)
    rig.blocked.add('skip')
    fire(rig.element, 'pointerdown', 200, 0)
    fire(rig.element, 'pointermove', 100, 0)
    expect(rig.reveal.dataset.action).toBe('skip')
    expect(rig.reveal.hasAttribute('data-disabled')).toBe(true)
    fire(rig.element, 'pointerup', 100, 0)
    expect(rig.runs).toEqual([])
    expect(rig.element.style.transform).toBe('')
    expect(haptics).toEqual(['failure'])
  })

  test('availability is checked again on release', () => {
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 100, 0)
    rig.blocked.add('advance')
    fire(rig.element, 'pointerup', 100, 0)
    expect(rig.runs).toEqual([])
  })

  test('a tap flashes it and settles', async () => {
    const rig = setup({ tap: 'skip' })
    rig.blocked.add('skip')
    tap(rig.element)
    expect(rig.runs).toEqual([])
    expect(rig.reveal.hasAttribute('data-disabled')).toBe(true)
    expect(Number(rig.element.style.opacity)).toBeCloseTo(0.25)
    await wait(20)
    expect(rig.reveal.hasAttribute('data-disabled')).toBe(false)
    expect(rig.element.style.opacity).toBe('')
  })

  test('a long press does not fire', async () => {
    const rig = setup({ long_press: 'undo' })
    rig.blocked.add('undo')
    fire(rig.element, 'pointerdown', 0, 0)
    await wait(50)
    expect(rig.runs).toEqual([])
    expect(rig.reveal.hasAttribute('data-disabled')).toBe(true)
    fire(rig.element, 'pointerup', 0, 0)
    expect(rig.reveal.hasAttribute('data-disabled')).toBe(false)
  })
})

describe('cancel and exclusions', () => {
  test('pointercancel fires nothing and cleans up', () => {
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 100, 0)
    fire(rig.element, 'pointercancel', 100, 0)
    expect(rig.runs).toEqual([])
    expect(rig.element.style.transform).toBe('')
    expect(rig.reveal.hasAttribute('data-action')).toBe(false)
  })

  test('pointercancel stops a long press and a tap', async () => {
    const rig = setup({ long_press: 'undo', tap: 'advance' })
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointercancel', 0, 0)
    await wait(50)
    fire(rig.element, 'pointerup', 0, 0)
    expect(rig.runs).toEqual([])
  })

  test('losing the capture while pressed stops the long press and the tap', async () => {
    const rig = setup({ long_press: 'undo', tap: 'advance' })
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'lostpointercapture', 0, 0)
    await wait(50)
    fire(rig.element, 'pointerup', 0, 0)
    expect(rig.runs).toEqual([])
  })

  test('losing the capture during a drag springs back without an action', () => {
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 100, 0)
    expect(rig.host.hasAttribute('data-active')).toBe(true)
    fire(rig.element, 'lostpointercapture', 100, 0)
    expect(rig.runs).toEqual([])
    expect(rig.element.style.transform).toBe('')
    expect(rig.host.hasAttribute('data-active')).toBe(false)
    expect(rig.reveal.hasAttribute('data-action')).toBe(false)
  })

  test('losing the capture while held clears the press', async () => {
    const rig = setup({ long_press: 'undo' })
    fire(rig.element, 'pointerdown', 0, 0)
    await wait(50)
    expect(rig.runs).toEqual(['undo'])
    expect(rig.element.style.transform).toContain('scale')
    fire(rig.element, 'lostpointercapture', 0, 0)
    expect(rig.element.style.transform).toBe('')
    expect(rig.element.style.opacity).toBe('')
    expect(rig.reveal.hasAttribute('data-action')).toBe(false)
  })

  test('the capture lost after a normal release changes nothing', () => {
    const rig = setup({ tap: 'advance' })
    tap(rig.element)
    fire(rig.element, 'lostpointercapture', 200, 200)
    expect(rig.runs).toEqual(['advance'])
  })

  test('a capture lost by another pointer is ignored', async () => {
    const rig = setup({ long_press: 'undo' })
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'lostpointercapture', 0, 0, { pointerId: 9 })
    await wait(50)
    expect(rig.runs).toEqual(['undo'])
    fire(rig.element, 'pointerup', 0, 0)
  })

  test('a gesture starting on a button does not count', async () => {
    const rig = setup({ ...SWIPES, tap: 'undo', long_press: 'skip' })
    fire(rig.button, 'pointerdown', 0, 0)
    await wait(50)
    fire(rig.button, 'pointermove', 100, 0)
    fire(rig.button, 'pointerup', 100, 0)
    expect(rig.runs).toEqual([])
    expect(rig.element.style.transform).toBe('')
  })

  test('other mouse buttons and other fingers do not count', () => {
    const rig = setup({ ...SWIPES, tap: 'undo' })
    fire(rig.element, 'pointerdown', 0, 0, { button: 2 })
    fire(rig.element, 'pointerup', 0, 0, { button: 2 })
    fire(rig.element, 'pointerdown', 0, 0, { isPrimary: false, pointerId: 2 })
    fire(rig.element, 'pointerup', 0, 0, { isPrimary: false, pointerId: 2 })
    expect(rig.runs).toEqual([])
  })

  test('another pointer cannot steer a drag', () => {
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 200, 0, { pointerId: 9 })
    fire(rig.element, 'pointerup', 200, 0, { pointerId: 9 })
    expect(rig.runs).toEqual([])
    fire(rig.element, 'pointerup', 0, 0)
  })

  test('detach stops timers and restores the element', async () => {
    const rig = setup({ long_press: 'undo', tap: 'advance', double_tap: 'skip' })
    tap(rig.element)
    fire(rig.element, 'pointerdown', 200, 200)
    rig.controller.detach()
    await wait(50)
    expect(rig.runs).toEqual([])
    expect(rig.element.hasAttribute('tabindex')).toBe(false)
    expect(rig.element.style.touchAction).toBe('')
    rig.controller.attach()
    expect(rig.element.getAttribute('tabindex')).toBe('0')
  })

  test('works without a reveal layer', () => {
    const rig = setup(SWIPES)
    rig.reveal.remove()
    drag(rig.element, 100)
    expect(rig.runs).toEqual(['advance'])
  })
})

describe('keyboard', () => {
  function press(target: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      composed: true,
      cancelable: true,
      ...init,
    })
    target.dispatchEvent(event)
    return event
  }

  test('is focusable and announces its keys', () => {
    const { element } = setup({ ...SWIPES, long_press: 'undo' })
    expect(element.getAttribute('tabindex')).toBe('0')
    expect(element.getAttribute('aria-keyshortcuts')).toBe('Enter Delete Backspace')
  })

  test('Enter runs the tap action', () => {
    const rig = setup({ ...SWIPES, tap: 'undo' })
    expect(press(rig.element, 'Enter').defaultPrevented).toBe(true)
    expect(rig.runs).toEqual(['undo'])
  })

  test('Enter falls back to advance', () => {
    const rig = setup(SWIPES)
    press(rig.element, 'Enter')
    expect(rig.runs).toEqual(['advance'])
  })

  test('Delete skips and Backspace undoes', () => {
    const rig = setup({ ...SWIPES, long_press: 'undo' })
    press(rig.element, 'Delete')
    press(rig.element, 'Backspace')
    expect(rig.runs).toEqual(['skip', 'undo'])
  })

  test('actions that are not mapped have no key', () => {
    const rig = setup({ swipe_right: 'advance' })
    expect(press(rig.element, 'Delete').defaultPrevented).toBe(false)
    expect(press(rig.element, 'Backspace').defaultPrevented).toBe(false)
    expect(rig.runs).toEqual([])
    const skipOnly = setup({ swipe_left: 'skip' })
    press(skipOnly.element, 'Enter')
    expect(skipOnly.runs).toEqual([])
  })

  test('a key on a button inside belongs to the button', () => {
    const rig = setup(SWIPES)
    press(rig.button, 'Enter')
    expect(rig.runs).toEqual([])
  })

  test('modifiers and auto-repeat are ignored', () => {
    const rig = setup(SWIPES)
    press(rig.element, 'Enter', { ctrlKey: true })
    press(rig.element, 'Enter', { repeat: true })
    expect(rig.runs).toEqual([])
  })

  test('a disabled action is refused', () => {
    const rig = setup(SWIPES)
    rig.blocked.add('skip')
    press(rig.element, 'Delete')
    expect(rig.runs).toEqual([])
    expect(haptics).toEqual(['failure'])
  })
})

describe('haptics', () => {
  test('dispatches the event and vibrates', () => {
    const calls: unknown[] = []
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: (pattern: unknown) => {
        calls.push(pattern)
        return true
      },
    })
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 100, 0)
    fire(rig.element, 'pointerup', 100, 0)
    expect(haptics).toEqual(['selection', 'medium'])
    expect(calls).toHaveLength(2)
    Reflect.deleteProperty(navigator, 'vibrate')
  })

  test('crossing the threshold again does not buzz while it stays armed', () => {
    const rig = setup(SWIPES)
    fire(rig.element, 'pointerdown', 0, 0)
    fire(rig.element, 'pointermove', 100, 0)
    fire(rig.element, 'pointermove', 120, 0)
    expect(haptics).toEqual(['selection'])
    fire(rig.element, 'pointercancel', 120, 0)
  })

  test('never throws when vibrate is missing or broken', () => {
    Reflect.deleteProperty(navigator, 'vibrate')
    expect(() => {
      haptic('medium')
    }).not.toThrow()
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: () => {
        throw new Error('no')
      },
    })
    expect(() => {
      haptic('medium')
    }).not.toThrow()
    Reflect.deleteProperty(navigator, 'vibrate')
  })
})
