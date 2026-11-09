import { afterEach, beforeEach, describe, expect, setSystemTime, test } from 'bun:test'

// oxlint-disable-next-line import/no-unassigned-import
import '../housetide.ts'
import { createI18n } from '../i18n.ts'
import { HousetidePomodoroCard } from '../pomodoro-card.ts'
import {
  FakeSocket,
  fakeHass,
  NOW,
  payload,
  pomodoroState,
  SETTINGS,
  settle,
} from '../test-fixtures.ts'
import type { FakeHassOptions } from '../test-fixtures.ts'
import type { HassMessage, PomodoroState, StatePayload } from '../types.ts'
import { ERROR_MS } from './live.ts'
import type { HousetidePanel } from './panel.ts'
import {
  formatClock,
  HousetidePomodoro,
  POMODORO_TICK_MS,
  pomodoroScene,
  pomodoroStatus,
  remainingMs,
  roundDots,
} from './pomodoro.ts'

const START = Date.parse(NOW)
const en = createI18n('en', { timeZone: 'UTC', hour12: false })
const uk = createI18n('uk', { timeZone: 'UTC', hour12: false })

function iso(offsetSeconds: number): string {
  return new Date(START + offsetSeconds * 1000).toISOString()
}

function focus(override: Partial<PomodoroState> = {}): PomodoroState {
  return pomodoroState({
    phase: 'focus',
    ends_at: iso(1500),
    duration_seconds: 1500,
    ...override,
  })
}

function paused(override: Partial<PomodoroState> = {}): PomodoroState {
  return focus({ ends_at: null, paused_remaining_seconds: 83, ...override })
}

interface Interval {
  run: () => void
  delay: number
  cleared: boolean
}

const realSetInterval = globalThis.setInterval
const realClearInterval = globalThis.clearInterval
let intervals: Interval[] = []
let mounted: HTMLElement[] = []

function ticking(): Interval[] {
  return intervals.filter((item) => item.delay === POMODORO_TICK_MS && !item.cleared)
}

beforeEach(() => {
  intervals = []
  setSystemTime(new Date(START))
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  globalThis.setInterval = ((run: () => void, delay: number) => {
    const entry: Interval = { run, delay, cleared: false }
    intervals.push(entry)
    return entry
  }) as unknown as typeof setInterval
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion
  globalThis.clearInterval = ((entry?: Interval) => {
    if (entry) entry.cleared = true
  }) as unknown as typeof clearInterval
})

afterEach(() => {
  for (const element of mounted) element.remove()
  mounted = []
  globalThis.setInterval = realSetInterval
  globalThis.clearInterval = realClearInterval
  setSystemTime()
  localStorage.clear()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
})

// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
function $<T extends HTMLElement = HTMLElement>(element: HTMLElement, selector: string): T {
  const found = element.shadowRoot?.querySelector<T>(selector)
  if (!found) throw new Error(`missing ${selector}`)
  return found
}

function actions(element: HTMLElement): string[] {
  return Array.from(element.shadowRoot?.querySelectorAll<HTMLElement>('[data-action]') ?? []).map(
    (button) => button.dataset.action ?? '',
  )
}

async function widget(
  state: PomodoroState,
  options: FakeHassOptions = {},
  socket = new FakeSocket(),
): Promise<{ element: HousetidePomodoro; socket: FakeSocket }> {
  const element = new HousetidePomodoro()
  element.hass = fakeHass(socket, options)
  element.pomodoro = state
  element.settings = SETTINGS
  document.body.append(element)
  mounted.push(element)
  await settle(element)
  return { element, socket }
}

function statePayload(pomodoro: PomodoroState): StatePayload {
  return { ...payload([]), pomodoro }
}

describe('helpers', () => {
  test('formatClock rounds up and pads', () => {
    expect(formatClock(1_500_000)).toBe('25:00')
    expect(formatClock(1_499_001)).toBe('25:00')
    expect(formatClock(1_499_000)).toBe('24:59')
    expect(formatClock(1)).toBe('00:01')
    expect(formatClock(0)).toBe('00:00')
    expect(formatClock(-5000)).toBe('00:00')
    expect(formatClock(6_000_000)).toBe('100:00')
  })

  test('remaining comes from the end, the pause or the settings', () => {
    expect(remainingMs(focus(), SETTINGS, START + 1000)).toBe(1_499_000)
    expect(remainingMs(focus(), SETTINGS, START + 2_000_000)).toBe(0)
    expect(remainingMs(paused(), SETTINGS, START + 999_000)).toBe(83_000)
    expect(remainingMs(pomodoroState(), SETTINGS, START)).toBe(1_500_000)
    expect(remainingMs(pomodoroState({ next_phase: 'long_break' }), SETTINGS, START)).toBe(900_000)
  })

  test('phases map to scene states', () => {
    const stateOf = (state: PomodoroState): string => pomodoroScene(state, SETTINGS, START).state
    expect(stateOf(pomodoroState())).toBe('resting')
    expect(stateOf(pomodoroState({ round: 2 }))).toBe('due')
    expect(stateOf(pomodoroState({ rounds_today: 1 }))).toBe('due')
    expect(stateOf(pomodoroState({ next_phase: 'short_break' }))).toBe('due')
    expect(stateOf(focus())).toBe('running')
    expect(stateOf(paused())).toBe('waiting')
    expect(stateOf(focus({ phase: 'short_break' }))).toBe('accumulating')
    expect(stateOf(focus({ phase: 'long_break' }))).toBe('clean')
    expect(pomodoroScene(focus(), SETTINGS, START).name).toBe('tomato')
  })

  test('progress follows the time gone, in dial steps', () => {
    expect(pomodoroScene(focus(), SETTINGS, START).progress).toBe(0)
    expect(pomodoroScene(focus(), SETTINGS, START + 750_000).progress).toBe(0.5)
    expect(pomodoroScene(focus(), SETTINGS, START + 760_000).progress).toBe(0.5)
    expect(pomodoroScene(focus(), SETTINGS, START + 1_500_000).progress).toBe(1)
    expect(pomodoroScene(paused(), SETTINGS, START).progress).toBeCloseTo(11 / 12)
  })

  test('progress uses the length the phase started with', () => {
    const settings = { ...SETTINGS, focus_minutes: 50 }
    expect(pomodoroScene(focus(), settings, START + 750_000).progress).toBe(0.5)
  })

  test('round dots', () => {
    expect(roundDots(pomodoroState(), SETTINGS)).toEqual(['open', 'open', 'open', 'open'])
    expect(roundDots(focus({ round: 2 }), SETTINGS)).toEqual(['done', 'now', 'open', 'open'])
    expect(roundDots(focus({ round: 2, phase: 'short_break' }), SETTINGS)).toEqual([
      'done',
      'done',
      'open',
      'open',
    ])
    expect(roundDots(pomodoroState({ round: 3 }), SETTINGS)).toEqual([
      'done',
      'done',
      'open',
      'open',
    ])
    expect(roundDots(pomodoroState({ round: 2, next_phase: 'short_break' }), SETTINGS)).toEqual([
      'done',
      'done',
      'open',
      'open',
    ])
    expect(roundDots(focus({ round: 6 }), SETTINGS)).toEqual(['done', 'done', 'done', 'now'])
  })

  test('status text in both languages', () => {
    expect(pomodoroStatus(focus(), en)).toBe('Focus')
    expect(pomodoroStatus(paused(), en)).toBe('Focus, paused')
    expect(pomodoroStatus(pomodoroState({ next_phase: 'long_break' }), en)).toBe(
      'Time for a long break',
    )
    expect(pomodoroStatus(focus(), uk)).toBe('Фокус')
    expect(pomodoroStatus(paused({ phase: 'short_break' }), uk)).toBe('Коротка перерва, пауза')
    expect(uk.plural('pomodoro_today', 3)).toBe('3 раунди сьогодні')
    expect(en.plural('pomodoro_today', 1)).toBe('1 round today')
  })
})

describe('countdown', () => {
  test('counts down once a second', async () => {
    const { element } = await widget(focus())
    expect($(element, '[data-part="clock"]').textContent?.trim()).toBe('25:00')
    expect(ticking()).toHaveLength(1)
    setSystemTime(new Date(START + 61_000))
    ticking()[0]?.run()
    await settle(element)
    expect($(element, '[data-part="clock"]').textContent?.trim()).toBe('23:59')
  })

  test('stops at zero', async () => {
    const { element } = await widget(focus())
    setSystemTime(new Date(START + 1_600_000))
    ticking()[0]?.run()
    await settle(element)
    expect($(element, '[data-part="clock"]').textContent?.trim()).toBe('00:00')
  })

  test('uses the server clock', async () => {
    const element = new HousetidePomodoro()
    element.hass = fakeHass(new FakeSocket())
    element.pomodoro = focus()
    element.settings = SETTINGS
    element.clockOffset = 60_000
    document.body.append(element)
    mounted.push(element)
    await settle(element)
    expect($(element, '[data-part="clock"]').textContent?.trim()).toBe('24:00')
  })

  test('shows a paused remainder without ticking', async () => {
    const { element } = await widget(paused())
    expect($(element, '[data-part="clock"]').textContent?.trim()).toBe('01:23')
    expect(ticking()).toHaveLength(0)
  })

  test('idle shows the next phase and does not tick', async () => {
    const { element } = await widget(pomodoroState({ next_phase: 'short_break' }))
    expect($(element, '[data-part="clock"]').textContent?.trim()).toBe('05:00')
    expect(ticking()).toHaveLength(0)
  })

  test('does not tick on a hidden page and catches up when shown', async () => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    const { element } = await widget(focus())
    expect(ticking()).toHaveLength(0)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    setSystemTime(new Date(START + 10_000))
    document.dispatchEvent(new Event('visibilitychange'))
    await settle(element)
    expect(ticking()).toHaveLength(1)
    expect($(element, '[data-part="clock"]').textContent?.trim()).toBe('24:50')
  })

  test('hiding the page stops the tick', async () => {
    await widget(focus())
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(ticking()).toHaveLength(0)
  })

  test('stops when off screen and restarts when back', async () => {
    const original = globalThis.IntersectionObserver
    let report: ((visible: boolean) => void) | undefined
    class FakeObserver {
      constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
        report = (visible): void => {
          callback([{ isIntersecting: visible }])
        }
      }
      observe(): void {
        return
      }
      disconnect(): void {
        return
      }
    }
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
    try {
      await widget(focus())
      expect(ticking()).toHaveLength(1)
      report?.(false)
      expect(ticking()).toHaveLength(0)
      report?.(true)
      expect(ticking()).toHaveLength(1)
    } finally {
      globalThis.IntersectionObserver = original
    }
  })

  test('stops on disconnect and when the phase ends', async () => {
    const { element } = await widget(focus())
    element.pomodoro = pomodoroState({ round: 2 })
    await settle(element)
    expect(ticking()).toHaveLength(0)
    element.pomodoro = focus()
    await settle(element)
    expect(ticking()).toHaveLength(1)
    element.remove()
    expect(ticking()).toHaveLength(0)
  })

  test('a tick does not redraw the scene', async () => {
    const { element } = await widget(focus())
    const before = $(element, '.art svg')
    const circles = before.innerHTML
    setSystemTime(new Date(START + 1000))
    ticking()[0]?.run()
    await settle(element)
    expect($(element, '.art svg')).toBe(before)
    expect($(element, '.art svg').innerHTML).toBe(circles)
  })

  test('the dial moves with a step', async () => {
    const { element } = await widget(focus())
    const label = (): string | undefined => $(element, '.art svg').dataset.state
    expect(label()).toBe('running')
    element.pomodoro = paused()
    await settle(element)
    expect(label()).toBe('waiting')
  })
})

describe('buttons', () => {
  const press = async (
    state: PomodoroState,
    action: string,
    reply: unknown = state,
  ): Promise<HassMessage[]> => {
    const socket = new FakeSocket()
    socket.replies.set(`housetide/pomodoro/${action}`, reply)
    const { element } = await widget(state, {}, socket)
    $(element, `[data-action="pomodoro-${action}"]`).click()
    await settle(element)
    return socket.of(`housetide/pomodoro/${action}`)
  }

  test('offered by state', async () => {
    const cases: Array<[PomodoroState, string[]]> = [
      [pomodoroState(), ['pomodoro-start']],
      [pomodoroState({ round: 2 }), ['pomodoro-start', 'pomodoro-reset']],
      [
        pomodoroState({ next_phase: 'short_break', rounds_today: 1 }),
        ['pomodoro-start', 'pomodoro-skip', 'pomodoro-reset'],
      ],
      [
        pomodoroState({ next_phase: 'short_break' }),
        ['pomodoro-start', 'pomodoro-skip', 'pomodoro-reset'],
      ],
      [focus(), ['pomodoro-pause', 'pomodoro-skip', 'pomodoro-stop']],
      [paused(), ['pomodoro-resume', 'pomodoro-skip', 'pomodoro-stop']],
    ]
    for (const [state, expected] of cases) {
      // oxlint-disable-next-line eslint/no-await-in-loop
      const { element } = await widget(state)
      expect(actions(element)).toEqual(expected)
    }
  })

  for (const [action, state] of [
    ['start', pomodoroState()],
    ['pause', focus()],
    ['resume', paused()],
    ['skip', focus()],
    ['stop', focus()],
    ['reset', pomodoroState({ round: 3 })],
  ] as const) {
    test(`${action} sends its command`, async () => {
      expect(await press(state, action)).toEqual([{ type: `housetide/pomodoro/${action}` }])
    })
  }

  test('labels are translated', async () => {
    const { element } = await widget(focus(), { language: 'uk' })
    expect($(element, '[data-action="pomodoro-pause"]').textContent?.trim()).toBe('Пауза')
    expect($(element, '[data-part="today"]').textContent).toBe('0 раундів сьогодні')
  })

  test('disabled while offline', async () => {
    const { element } = await widget(focus(), { connected: false })
    expect($<HTMLButtonElement>(element, '[data-action="pomodoro-pause"]').disabled).toBe(true)
  })

  test('a second press while pending is ignored', async () => {
    const socket = new FakeSocket()
    let release: (() => void) | undefined
    socket.replies.set(
      'housetide/pomodoro/start',
      async () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    )
    const { element } = await widget(pomodoroState(), {}, socket)
    const button = $(element, '[data-action="pomodoro-start"]')
    button.click()
    await settle(element)
    expect(button.hasAttribute('disabled')).toBe(true)
    button.click()
    release?.()
    await settle(element)
    expect(socket.of('housetide/pomodoro/start')).toHaveLength(1)
    expect(button.hasAttribute('disabled')).toBe(false)
  })

  test('a failure is shown', async () => {
    const socket = new FakeSocket()
    socket.replies.set('housetide/pomodoro/start', async () => {
      throw new Error('nope')
    })
    const { element } = await widget(pomodoroState(), {}, socket)
    $(element, '[data-action="pomodoro-start"]').click()
    await settle(element)
    expect($(element, '[role="alert"]').textContent).toContain('nope')
  })

  describe('after a failed command', () => {
    const realSetTimeout = globalThis.setTimeout
    const expiring: Array<() => void> = []

    function failedStart(): Promise<{ element: HousetidePomodoro }> {
      const socket = new FakeSocket()
      socket.replies.set('housetide/pomodoro/start', async () => {
        throw new Error('nope')
      })
      return widget(pomodoroState({ round: 2 }), {}, socket)
    }

    function holdErrorTimers(): void {
      globalThis.setTimeout = ((callback: () => void, delay?: number) => {
        if (delay === ERROR_MS) {
          expiring.push(callback)
          return 0
        }
        return realSetTimeout(callback, delay)
      }) as typeof setTimeout
    }

    afterEach(() => {
      globalThis.setTimeout = realSetTimeout
      expiring.length = 0
    })

    test('the rounds come back when the error expires', async () => {
      holdErrorTimers()
      const { element } = await failedStart()
      $(element, '[data-action="pomodoro-start"]').click()
      await settle(element)
      expect(element.shadowRoot?.querySelector('[data-part="rounds"]')).toBeNull()
      expect(expiring).toHaveLength(1)
      expiring[0]?.()
      await settle(element)
      expect(element.shadowRoot?.querySelector('[role="alert"]')).toBeNull()
      expect(element.shadowRoot?.querySelector('[data-part="rounds"]')).not.toBeNull()
    })

    test('leaving the page clears the error', async () => {
      holdErrorTimers()
      const { element } = await failedStart()
      $(element, '[data-action="pomodoro-start"]').click()
      await settle(element)
      element.remove()
      expect(element.error).toBeNull()
    })
  })

  test('rounds and the day total', async () => {
    const { element } = await widget(focus({ round: 2, rounds_today: 5 }))
    expect(element.shadowRoot?.querySelectorAll('[data-part="rounds"] i')).toHaveLength(4)
    expect($(element, '[data-part="rounds"]').getAttribute('aria-label')).toBe('Round 2 of 4')
    expect($(element, '[data-part="today"]').textContent).toBe('5 rounds today')
  })
})

describe('styles', () => {
  test('every rounded corner other than a circle has a corner shape', () => {
    const rules = [...HousetidePomodoro.styles, ...HousetidePomodoroCard.styles]
      .map((sheet) => sheet.toString())
      .join('\n')
      .split('}')
    for (const rule of rules) {
      const radius = /border-radius:\s*([^;]+);/.exec(rule)
      if (radius && radius[1] !== '50%') expect(rule).toContain('corner-shape: var(--ht-corner)')
    }
  })
})

describe('card', () => {
  async function card(
    state: StatePayload | null,
    config: { title?: string } = {},
    socket = new FakeSocket(),
  ): Promise<{ element: HousetidePomodoroCard; inner: HTMLElement | null; socket: FakeSocket }> {
    socket.initial = state
    const element = new HousetidePomodoroCard()
    element.setConfig(config)
    element.hass = fakeHass(socket)
    document.body.append(element)
    mounted.push(element)
    await settle(element)
    const inner = element.shadowRoot?.querySelector<HTMLElement>('housetide-pomodoro') ?? null
    if (inner instanceof HousetidePomodoro) await settle(inner)
    return { element, inner, socket }
  }

  test('is registered', () => {
    expect(customElements.get('housetide-pomodoro-card')).toBe(HousetidePomodoroCard)
    expect(window.customCards?.some((c) => c.type === 'housetide-pomodoro-card')).toBe(true)
    expect(window.customCards?.filter((c) => c.type === 'housetide-card')).toHaveLength(1)
  })

  test('stub config', () => {
    expect(HousetidePomodoroCard.getStubConfig()).toEqual({})
  })

  test('rejects a title that is not text', () => {
    const element = new HousetidePomodoroCard()
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    expect(() => {
      element.setConfig({ title: 5 } as unknown as { title: string })
    }).toThrow('title')
  })

  test('sizes', () => {
    const element = new HousetidePomodoroCard()
    expect(element.getCardSize()).toBeGreaterThan(0)
    expect(element.getGridOptions().rows).toBe('auto')
  })

  test('renders the timer from the subscription', async () => {
    const { inner } = await card(statePayload(focus()))
    if (!inner) throw new Error('no timer')
    expect($(inner, '[data-part="clock"]').textContent?.trim()).toBe('25:00')
    expect($(inner, '[data-scene="tomato"]').dataset.state).toBe('running')
    expect(inner.shadowRoot?.querySelector('.heading')).toBeNull()
  })

  test('shows the optional title', async () => {
    const { inner } = await card(statePayload(focus()), { title: 'Deep work' })
    if (!inner) throw new Error('no timer')
    expect($(inner, '.heading').textContent).toBe('Deep work')
  })

  test('paints the text and buttons on the colours of the scene', async () => {
    const { inner } = await card(statePayload(focus()))
    if (!inner) throw new Error('no timer')
    const surface = $(inner, '.pomo')
    expect(surface.getAttribute('style')).toContain('--ht-wall:#1f3f6b')
    expect(surface.getAttribute('style')).toContain('--ht-floor:#183154')
  })

  test('follows pushes', async () => {
    const { inner, socket, element } = await card(statePayload(pomodoroState()))
    if (!inner) throw new Error('no timer')
    expect(actions(inner)).toEqual(['pomodoro-start'])
    socket.push(statePayload(focus()))
    await settle(element)
    await settle(inner as HousetidePomodoro)
    expect(actions(inner)).toEqual(['pomodoro-pause', 'pomodoro-skip', 'pomodoro-stop'])
  })

  test('shows a placeholder until the first state and an error on failure', async () => {
    const { element } = await card(null)
    expect(element.shadowRoot?.querySelector('[aria-busy="true"]')).not.toBeNull()
    const socket = new FakeSocket()
    socket.subscribeError = new Error('down')
    const { element: broken } = await card(null, {}, socket)
    expect($(broken, '[role="alert"]').textContent).toContain('not available')
  })

  test('unsubscribes on disconnect', async () => {
    const { element, socket } = await card(statePayload(focus()))
    element.remove()
    await settle()
    expect(socket.unsubscribes).toBe(1)
  })
})

describe('panel', () => {
  async function panel(
    state: StatePayload,
    options: FakeHassOptions = {},
  ): Promise<{ element: HousetidePanel; socket: FakeSocket; today: HTMLElement }> {
    const socket = new FakeSocket()
    socket.initial = state
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const element = document.createElement('housetide-panel') as HousetidePanel
    element.hass = fakeHass(socket, options)
    document.body.append(element)
    mounted.push(element)
    await settle(element)
    const today = element.shadowRoot?.querySelector<HTMLElement>('housetide-today')
    if (!today) throw new Error('no today tab')
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    await settle(today as unknown as { updateComplete: Promise<unknown> })
    return { element, socket, today }
  }

  test('the Today tab shows the timer', async () => {
    const { today } = await panel(statePayload(focus()))
    const timer = today.shadowRoot?.querySelector('housetide-pomodoro')
    expect(timer).not.toBeNull()
  })

  test('collapsing is remembered', async () => {
    const first = await panel(statePayload(focus()))
    const fold = $(first.today, '[data-action="toggle-pomodoro"]')
    expect(fold.getAttribute('aria-expanded')).toBe('true')
    fold.click()
    await settle()
    expect(first.today.shadowRoot?.querySelector('housetide-pomodoro')).toBeNull()
    expect(fold.getAttribute('aria-expanded')).toBe('false')
    expect($(first.today, '.fold-status').textContent).toBe('Focus')
    expect(localStorage.getItem('housetide.today.pomodoro')).toBe('collapsed')
    first.element.remove()

    const second = await panel(statePayload(focus()))
    expect(second.today.shadowRoot?.querySelector('housetide-pomodoro')).toBeNull()
    $(second.today, '[data-action="toggle-pomodoro"]').click()
    await settle()
    expect(second.today.shadowRoot?.querySelector('housetide-pomodoro')).not.toBeNull()
    expect(localStorage.getItem('housetide.today.pomodoro')).toBe('open')
  })

  test('a timer tick does not re-render the Today tab', async () => {
    const { today } = await panel(statePayload(focus()))
    let renders = 0
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const host = today as unknown as { render: () => unknown }
    const original = host.render.bind(today)
    host.render = (): unknown => {
      renders += 1
      return original()
    }
    setSystemTime(new Date(START + 1000))
    for (const item of ticking()) item.run()
    await settle()
    expect(renders).toBe(0)
  })

  const openTasks = async (
    options: FakeHassOptions = {},
  ): Promise<{ tasks: HTMLElement; socket: FakeSocket }> => {
    const { element, socket } = await panel(statePayload(pomodoroState()), options)
    $(element, '[data-tab="tasks"]').click()
    await settle(element)
    const tasks = element.shadowRoot?.querySelector<HTMLElement>('housetide-tasks')
    if (!tasks) throw new Error('no tasks tab')
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    await settle(tasks as unknown as { updateComplete: Promise<unknown> })
    return { tasks, socket }
  }

  const typeInto = (host: HTMLElement, field: string, value: string): void => {
    const input = $<HTMLInputElement>(host, `[data-field="${field}"]`)
    input.value = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }

  test('settings save the durations', async () => {
    const { tasks, socket } = await openTasks()
    const save = $<HTMLButtonElement>(tasks, '[data-action="save-pomodoro"]')
    expect(save.disabled).toBe(true)
    typeInto(tasks, 'focus_minutes', '50')
    await settle()
    expect(save.disabled).toBe(false)
    const auto = $<HTMLInputElement>(tasks, '[data-field="auto_start_focus"]')
    auto.checked = true
    auto.dispatchEvent(new Event('change', { bubbles: true }))
    await settle()
    save.click()
    await settle()
    expect(socket.of('housetide/settings/update')).toEqual([
      {
        type: 'housetide/settings/update',
        settings: {
          focus_minutes: 50,
          short_break_minutes: 5,
          long_break_minutes: 15,
          rounds_until_long_break: 4,
          auto_start_breaks: true,
          auto_start_focus: true,
        },
      },
    ])
  })

  test('settings are validated', async () => {
    const { tasks } = await openTasks()
    const save = $<HTMLButtonElement>(tasks, '[data-action="save-pomodoro"]')
    for (const [field, value] of [
      ['focus_minutes', '0'],
      ['short_break_minutes', '1441'],
      ['long_break_minutes', 'x'],
      ['rounds_until_long_break', '13'],
    ] as const) {
      typeInto(tasks, field, value)
      // oxlint-disable-next-line eslint/no-await-in-loop
      await settle()
      expect(save.disabled).toBe(true)
      expect(
        $(tasks, `[data-field="${field}"]`).parentElement?.querySelector('[role="alert"]'),
      ).not.toBeNull()
      typeInto(tasks, field, '10')
      // oxlint-disable-next-line eslint/no-await-in-loop
      await settle()
    }
    expect(save.disabled).toBe(false)
  })

  test('settings are read-only without admin', async () => {
    const { tasks } = await openTasks({ admin: false })
    expect(tasks.shadowRoot?.querySelector('[data-action="save-pomodoro"]')).toBeNull()
    expect($<HTMLInputElement>(tasks, '[data-field="focus_minutes"]').disabled).toBe(true)
    expect($<HTMLInputElement>(tasks, '[data-field="auto_start_breaks"]').disabled).toBe(true)
  })
})
