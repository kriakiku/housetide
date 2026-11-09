import { afterEach, describe, expect, test } from 'bun:test'

import { HousetideCard } from './card.ts'
// oxlint-disable-next-line import/no-unassigned-import
import './housetide.ts'
import type { CardConfig } from './card.ts'
import { COOLDOWN_MS } from './panel/live.ts'
import { selectViews } from './panel/tile.ts'
import { FakeSocket, fakeHass, payload, settle, view } from './test-fixtures.ts'
import type { FakeHassOptions } from './test-fixtures.ts'
import type { StatePayload, TaskStatus } from './types.ts'

const STATUSES: TaskStatus[] = [
  'upcoming',
  'due',
  'overdue',
  'in_progress',
  'clean',
  'done',
  'disabled',
]

let mounted: HousetideCard[] = []

afterEach(() => {
  for (const card of mounted) card.remove()
  mounted = []
})

async function mount(
  socket: FakeSocket,
  config: CardConfig = {},
  options: FakeHassOptions = {},
): Promise<HousetideCard> {
  const card = new HousetideCard()
  card.setConfig(config)
  card.hass = fakeHass(socket, options)
  document.body.append(card)
  mounted.push(card)
  await settle(card)
  return card
}

function root(card: HousetideCard): ShadowRoot {
  if (!card.shadowRoot) throw new Error('no shadow root')
  return card.shadowRoot
}

function $(card: HousetideCard, selector: string): HTMLElement {
  const found = root(card).querySelector<HTMLElement>(selector)
  if (!found) throw new Error(`missing ${selector}`)
  return found
}

async function withState(
  state: StatePayload,
  config: CardConfig = {},
  options: FakeHassOptions = {},
): Promise<{ socket: FakeSocket; card: HousetideCard }> {
  const socket = new FakeSocket()
  socket.initial = state
  const card = await mount(socket, config, options)
  return { socket, card }
}

describe('statuses', () => {
  for (const status of STATUSES) {
    test(`renders ${status}`, async () => {
      const { card } = await withState(payload([view(status)]), { show: 'all' })
      const row = $(card, `[data-status="${status}"]`)
      expect(row.querySelector('.title')?.textContent).toBe(`Task ${status}`)
      expect(row.querySelector('svg.ht-scene, svg')).not.toBeNull()
      expect(row.querySelector('.due')?.textContent?.length).toBeGreaterThan(0)
      const go = row.querySelector<HTMLButtonElement>('[data-action="advance"]')
      expect(go?.disabled).toBe(status === 'disabled' || status === 'done')
    })

    test(`renders ${status} as a tile`, async () => {
      const { card } = await withState(payload([view(status)]), { show: 'all', layout: 'scenes' })
      expect($(card, `.tile[data-status="${status}"]`)).toBeTruthy()
    })
  }

  test('automated rows say so and still advance', async () => {
    const { card, socket } = await withState(payload([view('in_progress', { automated: true })]))
    expect($(card, '[data-part="automated"]').textContent).toContain('Automatic')
    $(card, '[data-action="advance"]').click()
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(1)
  })

  test('the action label falls back sensibly', async () => {
    const start = await withState(payload([view('due', { action: null, stage_count: 2 })]))
    expect($(start.card, '.go').textContent?.trim()).toBe('Start')
    const done = await withState(payload([view('due', { action: null })]))
    expect($(done.card, '.go').textContent?.trim()).toBe('Done')
  })

  test('shows stage progress for chains only', async () => {
    const chain = await withState(payload([view('due', { stage_count: 3, stage_index: 1 })]))
    expect(root(chain.card).querySelectorAll('.dots i')).toHaveLength(3)
    expect($(chain.card, '.dots .past')).toBeTruthy()
    const single = await withState(payload([view('due')]))
    expect(root(single.card).querySelector('.dots')).toBeNull()
  })

  test('task colour reaches the row with readable text', async () => {
    const { card } = await withState(payload([view('due', { color: '#ffee00' })]))
    const row = $(card, '.row')
    expect(row.style.getPropertyValue('--ht-task')).toBe('#ffee00')
    expect(row.style.getPropertyValue('--ht-on-task')).toBe('#14182a')
  })
})

describe('icons', () => {
  test('generic scenes carry the task icon, drawn scenes do not', async () => {
    const generic = await withState(payload([view('due', { icon: 'mdi:broom' })]))
    expect(root(generic.card).querySelector('.badge ha-icon')).not.toBeNull()
    const pills = await withState(
      payload([
        view('due', {
          icon: 'mdi:pill',
          scene: { name: 'pills', state: 'due', fill: 1, stink: 0, progress: 0 },
        }),
      ]),
    )
    expect(root(pills.card).querySelector('.badge')).toBeNull()
  })
})

describe('properties Home Assistant sets on a card', () => {
  test('a layout property from the dashboard does not break the card', async () => {
    const { card } = await withState(payload([view('due')]), {
      show: 'all',
      layout: 'picture',
      columns: 3,
    })
    Object.assign(card, { layout: 'grid', preview: false })
    expect(card.getGridOptions().columns).toBe(12)
    expect(card.getCardSize()).toBeGreaterThan(0)
    card.requestUpdate()
    await card.updateComplete
    expect($(card, '.picture')).toBeTruthy()
  })
})

describe('columns', () => {
  test('a fixed count sets the tile grid', async () => {
    const { card } = await withState(payload([view('due')]), {
      show: 'all',
      layout: 'scenes',
      columns: 2,
    })
    expect($(card, '.tiles').className).toContain('columns-2')
  })

  test('an unsupported count is rejected', () => {
    expect(() => {
      new HousetideCard().setConfig({ columns: 7 })
    }).toThrow()
  })
})

const LOOKS = ['picture', 'compact', 'bubbles'] as const
const SELECTORS = { picture: '.picture', compact: '.compact', bubbles: '.bubble' } as const

function pointer(element: HTMLElement, type: string, x: number, y = 0): void {
  element.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      clientX: x,
      clientY: y,
      pointerId: 1,
      isPrimary: true,
      button: 0,
    }),
  )
}

function swipe(element: HTMLElement, distance: number): void {
  pointer(element, 'pointerdown', 100)
  pointer(element, 'pointermove', 100 + distance / 2)
  pointer(element, 'pointermove', 100 + distance)
  pointer(element, 'pointerup', 100 + distance)
}

describe('new layouts', () => {
  for (const layout of LOOKS) {
    test(`${layout} draws one scene per task with its status`, async () => {
      const { card } = await withState(payload([view('due'), view('clean')]), { layout })
      const task = $(card, `${SELECTORS[layout]}[data-status="due"]`)
      expect(task.querySelector('svg.ht-scene')).not.toBeNull()
      expect(root(card).querySelectorAll('[data-task]')).toHaveLength(2)
    })

    test(`${layout} has skeletons, an empty state and a failed state`, async () => {
      const loading = await mount(new FakeSocket(), { layout })
      expect(root(loading).querySelectorAll(`${SELECTORS[layout]}.skeleton`)).toHaveLength(2)
      const empty = await withState(payload([]), { layout })
      expect($(empty.card, '[data-part="empty"]').textContent).toContain('All clear')
      const socket = new FakeSocket()
      socket.subscribeError = new Error('unknown_command')
      const failed = await mount(socket, { layout })
      expect($(failed, '[role="alert"]').textContent).toContain('Housetide is not available')
    })

    test(`${layout} keeps the full text for screen readers`, async () => {
      const { card } = await withState(payload([view('due')]), { layout })
      const label = $(card, '[data-task]').getAttribute('aria-label') ?? ''
      expect(label).toContain('Task due')
      expect(label).toContain('Stage')
      expect($(card, '[data-task]').getAttribute('role')).toBe('group')
    })
  }

  for (const layout of ['picture', 'bubbles'] as const) {
    test(`${layout} has no text and no button`, async () => {
      const { card } = await withState(payload([view('due', { can_undo: true })]), { layout })
      const task = $(card, '[data-task]')
      expect(task.querySelector('.title, .stage, .due, button')).toBeNull()
    })

    test(`${layout} cannot be given its text back`, async () => {
      const { card } = await withState(payload([view('due')]), { layout, hide: [] })
      expect($(card, '[data-task]').querySelector('.title, button')).toBeNull()
    })

    test(`${layout} pulses for due and overdue only`, async () => {
      const { card } = await withState(
        payload([view('due'), view('overdue'), view('upcoming'), view('in_progress')]),
        { layout, show: 'all' },
      )
      expect($(card, '[data-status="due"]').className).toContain('ring-pulse')
      expect($(card, '[data-status="overdue"]').className).toContain('ring-pulse')
      expect($(card, '[data-status="upcoming"]').className).not.toContain('ring')
      expect($(card, '[data-status="in_progress"]').className).not.toContain('ring')
    })

    test(`${layout} keeps a still ring with animations off`, async () => {
      const { card } = await withState(payload([view('due')]), { layout, animations: false })
      expect($(card, '[data-task]').className).toContain('ring')
      expect($(card, '[data-task]').className).not.toContain('ring-pulse')
    })

    test(`${layout} shows a failed action`, async () => {
      const socket = new FakeSocket()
      socket.initial = payload([view('due')])
      socket.replies.set('housetide/advance', () => {
        throw new Error('nope')
      })
      const card = await mount(socket, { layout })
      swipe($(card, '[data-task]'), 120)
      await settle(card)
      expect($(card, '.alert-badge').getAttribute('aria-label')).toContain('nope')
    })

    test(`${layout} still celebrates`, async () => {
      const socket = new FakeSocket()
      socket.initial = payload([view('due')])
      socket.replies.set(
        'housetide/advance',
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 40)
          }),
      )
      const card = await mount(socket, { layout })
      swipe($(card, '[data-task]'), 120)
      await settle(card)
      expect(root(card).querySelector('.burst')).not.toBeNull()
      await new Promise((resolve) => {
        setTimeout(resolve, 60)
      })
    })
  }

  test('compact shows the title and an icon-only button', async () => {
    const { card, socket } = await withState(payload([view('due')]), { layout: 'compact' })
    const task = $(card, '.compact')
    expect(task.querySelector('.title')?.textContent).toBe('Task due')
    expect(task.querySelector('.stage, .due')).toBeNull()
    const go = $(card, '.go.icon-only')
    expect(go.querySelector('span')).toBeNull()
    expect(go.getAttribute('aria-label')).toContain('Task due')
    go.click()
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(1)
  })

  test('compact shows the reason an action failed', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due')])
    socket.replies.set('housetide/advance', () => {
      throw new Error('nope')
    })
    const card = await mount(socket, { layout: 'compact' })
    $(card, '.go').click()
    await settle(card)
    expect($(card, '.due.failed').textContent).toContain('nope')
  })

  test('compact keeps the undo inline after an advance', async () => {
    const { card, socket } = await withState(payload([view('due', { task_id: 'a' })]), {
      layout: 'compact',
    })
    $(card, '.go').click()
    await settle(card)
    socket.push(payload([view('clean', { task_id: 'a', can_undo: true })]))
    await settle(card)
    expect($(card, '.actions [data-action="undo"]')).toBeTruthy()
  })

  test('picture uses the columns option', async () => {
    const { card } = await withState(payload([view('due')]), { layout: 'picture', columns: 5 })
    expect($(card, '.tiles.pictures').className).toContain('columns-5')
    const auto = await withState(payload([view('due')]), { layout: 'picture', columns: 'auto' })
    expect($(auto.card, '.tiles.pictures').className).not.toContain('columns-')
  })

  test('bubbles use the columns option, compact ignores it', async () => {
    const bubbles = await withState(payload([view('due')]), { layout: 'bubbles', columns: 6 })
    expect($(bubbles.card, '.bubbles').className).toContain('columns-6')
    const compact = await withState(payload([view('due')]), { layout: 'compact', columns: 3 })
    expect($(compact.card, '.compact-list').className).not.toContain('columns-')
  })

  test('sizes suit each layout', async () => {
    const views = [view('due'), view('overdue'), view('in_progress')]
    const compact = await withState(payload(views), { layout: 'compact' })
    expect(compact.card.getCardSize()).toBe(5)
    expect(compact.card.getGridOptions().min_rows).toBe(1)
    const bare = await withState(payload(views), {
      layout: 'bubbles',
      columns: 3,
      hide: ['header'],
    })
    expect(bare.card.getCardSize()).toBe(2)
    expect(bare.card.getGridOptions().min_columns).toBe(5)
    const picture = await withState(payload(views), { layout: 'picture', columns: 3 })
    expect(picture.card.getCardSize()).toBe(5)
    expect(picture.card.getGridOptions().min_rows).toBe(2)
  })

  test('a numeric columns value widens the grid minimum of picture and bubbles only', async () => {
    const views = [view('due')]
    const minimum = async (config: CardConfig): Promise<number> =>
      (await withState(payload(views), config)).card.getGridOptions().min_columns
    expect(await minimum({ layout: 'picture' })).toBe(3)
    expect(await minimum({ layout: 'picture', columns: 'auto' })).toBe(3)
    expect(await minimum({ layout: 'picture', columns: 2 })).toBe(3)
    expect(await minimum({ layout: 'picture', columns: 6 })).toBe(9)
    expect(await minimum({ layout: 'bubbles', columns: 6 })).toBe(9)
    expect(await minimum({ layout: 'scenes', columns: 6 })).toBe(6)
    expect(await minimum({ layout: 'compact', columns: 6 })).toBe(4)
  })

  test('a stage advance pops the scene where there are no dots', async () => {
    const text = HousetideCard.styles.map((sheet) => sheet.cssText).join('')
    expect(text).toContain('.pop-stage.no-stage .art svg')
    expect(text).toContain('.pop-stage.no-stage .thumb svg')
    for (const layout of ['picture', 'compact', 'bubbles'] as const) {
      const { card } = await withState(payload([view('in_progress', { stage_count: 3 })]), {
        layout,
      })
      swipe($(card, '[data-task]'), 120)
      await settle(card)
      const { classList } = $(card, '[data-task]')
      expect(classList.contains('pop-stage')).toBe(true)
      expect(classList.contains('no-stage')).toBe(true)
    }
    const shown = await withState(payload([view('due')]), { layout: 'list' })
    expect($(shown.card, '.row').classList.contains('no-stage')).toBe(false)
    const hidden = await withState(payload([view('due')]), { layout: 'list', hide: ['stage'] })
    expect($(hidden.card, '.row').classList.contains('no-stage')).toBe(true)
  })

  test('the icon badge scales with the cell in picture and bubbles', () => {
    const text = HousetideCard.styles.map((sheet) => sheet.cssText).join('')
    expect(text).toMatch(/\.picture \.badge \{[^}]*width: min\(40px, 40cqi\)/)
    expect(text).toMatch(/\.bubble \.badge \{[^}]*width: min\(32px, 45cqi\)/)
  })

  test('every new radius keeps the corner shape', () => {
    const text = HousetideCard.styles.map((sheet) => sheet.cssText).join('')
    for (const rule of text.match(/border-radius: [^;]+;\s*[^;]+;/g) ?? []) {
      if (!rule.includes('50%')) expect(rule).toContain('corner-shape')
    }
    expect(text).toMatch(/\.compact \{[^}]*height: 52px/)
    expect(text).toMatch(/\.bubble \{[^}]*width: 72px/)
    expect(text).toMatch(/prefers-reduced-motion: no-preference[\s\S]*\.ring-pulse::after/)
  })
})

describe('hide', () => {
  test('nothing changes by default', async () => {
    const { card } = await withState(payload([view('due')]))
    const row = $(card, '.row')
    expect(row.hasAttribute('aria-label')).toBe(false)
    expect(row.hasAttribute('role')).toBe(false)
    expect(row.className).not.toContain('no-')
    expect(root(card).querySelector('header')).not.toBeNull()
  })

  for (const [key, selector] of [
    ['title', '.title'],
    ['stage', '.stage'],
    ['due', '.due'],
    ['button', '.go'],
  ] as const) {
    for (const layout of ['list', 'scenes'] as const) {
      test(`${layout} can hide ${key} and still names it`, async () => {
        const { card } = await withState(payload([view('due')]), { layout, hide: [key] })
        const task = $(card, '[data-task]')
        expect(task.querySelector(selector)).toBeNull()
        if (key === 'button') expect(task.hasAttribute('aria-label')).toBe(false)
        else expect(task.getAttribute('aria-label')).toContain('Task due')
      })
    }
  }

  test('hiding the header leaves only the tasks', async () => {
    const { card } = await withState(payload([view('due')]), { hide: ['header'] })
    expect(root(card).querySelector('header')).toBeNull()
    expect(root(card).querySelector('h2')).toBeNull()
  })

  test('without the header an offline card still says so', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due')])
    const card = await mount(socket, { hide: ['header'] }, { connected: false })
    expect($(card, '.offline').textContent).toContain('Reconnecting')
  })

  test('no text and no button reflow', async () => {
    const { card } = await withState(payload([view('upcoming')]), {
      show: 'all',
      hide: ['title', 'stage', 'due', 'button'],
    })
    const row = $(card, '.row')
    expect(row.className).toContain('no-text')
    expect(row.className).toContain('no-button')
    expect(row.querySelector('.text, .actions')).toBeNull()
  })

  test('a list with all its text hidden gets the ring too', async () => {
    const { card } = await withState(payload([view('due')]), {
      hide: ['title', 'stage', 'due'],
    })
    expect($(card, '.row').className).toContain('ring')
  })

  test('hiding the timing still shows a failed action', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due')])
    socket.replies.set('housetide/advance', () => {
      throw new Error('nope')
    })
    const card = await mount(socket, { hide: ['due'] })
    $(card, '[data-action="advance"]').click()
    await settle(card)
    expect($(card, '.due.failed').textContent).toContain('nope')
  })

  test('hiding the button also hides the undo', async () => {
    const { card, socket } = await withState(payload([view('due', { task_id: 'a' })]), {
      hide: ['button'],
      gestures: { swipe_right: 'advance' },
    })
    swipe($(card, '[data-task]'), 120)
    await settle(card)
    socket.push(payload([view('clean', { task_id: 'a', can_undo: true })]))
    await settle(card)
    expect(root(card).querySelector('[data-action="undo"]')).toBeNull()
  })
})

describe('gestures on the card', () => {
  for (const layout of ['list', 'scenes'] as const) {
    test(`${layout} has none by default`, async () => {
      const { card } = await withState(payload([view('due')]), { layout })
      const task = $(card, '[data-task]')
      expect(root(card).querySelector('.swipe')).toBeNull()
      expect(task.hasAttribute('tabindex')).toBe(false)
      expect(task.style.touchAction).toBe('')
    })
  }

  test('a list opts in through config', async () => {
    const { card, socket } = await withState(payload([view('due', { task_id: 'a' })]), {
      gestures: { swipe_left: 'skip' },
    })
    expect($(card, '.swipe .swipe-reveal [data-face="skip"]')).toBeTruthy()
    swipe($(card, '[data-task]'), -120)
    await settle(card)
    expect(socket.of('housetide/skip')).toEqual([{ type: 'housetide/skip', task_id: 'a' }])
  })

  for (const layout of LOOKS) {
    test(`${layout} advances on a right swipe and skips on a left one`, async () => {
      const a = view('due', { task_id: 'a' })
      const b = view('due', { task_id: 'b' })
      const { card, socket } = await withState(payload([a, b]), { layout })
      swipe($(card, '[data-task="a"]'), 120)
      swipe($(card, '[data-task="b"]'), -120)
      await settle(card)
      expect(socket.of('housetide/advance')).toEqual([{ type: 'housetide/advance', task_id: 'a' }])
      expect(socket.of('housetide/skip')).toEqual([{ type: 'housetide/skip', task_id: 'b' }])
    })

    test(`${layout} is focusable and pans vertically`, async () => {
      const { card } = await withState(payload([view('due')]), { layout })
      const task = $(card, '[data-task]')
      expect(task.getAttribute('tabindex')).toBe('0')
      expect(task.style.touchAction).toBe('pan-y')
    })

    test(`${layout} moves no Lit render during a drag`, async () => {
      const { card } = await withState(payload([view('due')]), { layout })
      const task = $(card, '[data-task]')
      let renders = 0
      const original = card.requestUpdate.bind(card)
      card.requestUpdate = (...args): void => {
        renders += 1
        original(...args)
      }
      pointer(task, 'pointerdown', 100)
      pointer(task, 'pointermove', 140)
      pointer(task, 'pointermove', 170)
      expect(task.style.transform).toContain('translate3d')
      expect(renders).toBe(0)
      pointer(task, 'pointercancel', 170)
    })
  }

  test('a tall swipe keeps the page from scrolling only when vertical is mapped', async () => {
    const { card } = await withState(payload([view('due')]), {
      layout: 'picture',
      gestures: { swipe_up: 'skip' },
    })
    expect($(card, '[data-task]').style.touchAction).toBe('none')
  })

  test('none switches a default off', async () => {
    const { card, socket } = await withState(payload([view('due')]), {
      layout: 'picture',
      gestures: { swipe_right: 'none' },
    })
    swipe($(card, '[data-task]'), 120)
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(0)
  })

  test('all none leaves a plain task', async () => {
    const { card } = await withState(payload([view('due')]), {
      layout: 'picture',
      gestures: { swipe_right: 'none', swipe_left: 'none', long_press: 'none' },
    })
    expect($(card, '[data-task]').hasAttribute('tabindex')).toBe(false)
    expect(root(card).querySelector('.swipe')).toBeNull()
  })

  for (const status of ['upcoming', 'clean'] as const) {
    test(`a ${status} task needs no second touch by gesture`, async () => {
      const { card, socket } = await withState(payload([view(status, { task_id: 'a' })]), {
        layout: 'compact',
        show: 'all',
      })
      swipe($(card, '[data-task]'), 120)
      await settle(card)
      expect(socket.of('housetide/advance')).toHaveLength(1)
    })
  }

  test('advance by gesture is refused while it is not available', async () => {
    const { card, socket } = await withState(payload([view('disabled')]), {
      layout: 'picture',
      show: 'all',
    })
    const task = $(card, '[data-task]')
    pointer(task, 'pointerdown', 100)
    pointer(task, 'pointermove', 200)
    expect($(card, '.swipe-reveal').hasAttribute('data-disabled')).toBe(true)
    pointer(task, 'pointerup', 200)
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(0)
  })

  test('a repeated swipe does not complete a task twice', async () => {
    const { card, socket } = await withState(payload([view('due')]), { layout: 'picture' })
    const task = $(card, '[data-task]')
    swipe(task, 120)
    await settle(card)
    swipe(task, 120)
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(1)
  })

  test('skip respects can_skip', async () => {
    const { card, socket } = await withState(payload([view('due', { can_skip: false })]), {
      layout: 'picture',
    })
    swipe($(card, '[data-task]'), -120)
    await settle(card)
    expect(socket.of('housetide/skip')).toHaveLength(0)
  })

  test('undo by gesture needs can_undo but not the recent window', async () => {
    const { card, socket } = await withState(payload([view('clean', { can_undo: true })]), {
      layout: 'bubbles',
      gestures: { swipe_up: 'undo' },
    })
    const task = $(card, '[data-task]')
    pointer(task, 'pointerdown', 0, 200)
    pointer(task, 'pointermove', 0, 100)
    pointer(task, 'pointerup', 0, 100)
    await settle(card)
    expect(socket.of('housetide/undo')).toHaveLength(1)
    const off = await withState(payload([view('clean', { can_undo: false })]), {
      layout: 'bubbles',
      gestures: { swipe_up: 'undo' },
    })
    const other = $(off.card, '[data-task]')
    pointer(other, 'pointerdown', 0, 200)
    pointer(other, 'pointermove', 0, 100)
    pointer(other, 'pointerup', 0, 100)
    await settle(off.card)
    expect(off.socket.of('housetide/undo')).toHaveLength(0)
  })

  test('offline refuses every gesture', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due')])
    const card = await mount(socket, { layout: 'picture' }, { connected: false })
    swipe($(card, '[data-task]'), 120)
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(0)
  })

  test('a swipe while the task is pending is refused', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('in_progress', { stage_count: 3 })])
    let release = (): void => undefined
    socket.replies.set(
      'housetide/advance',
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    )
    const card = await mount(socket, { layout: 'compact' })
    const task = $(card, '[data-task]')
    swipe(task, 120)
    await settle(card)
    swipe(task, -120)
    await settle(card)
    expect(socket.of('housetide/skip')).toHaveLength(0)
    release()
    await settle(card)
  })

  test('the button on a compact strip does not start a swipe', async () => {
    const { card, socket } = await withState(payload([view('due')]), { layout: 'compact' })
    swipe($(card, '.go'), 120)
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(0)
    expect($(card, '[data-task]').style.transform).toBe('')
  })

  test('the keyboard follows the layout defaults', async () => {
    const { card, socket } = await withState(payload([view('due', { can_undo: true })]), {
      layout: 'picture',
    })
    const task = $(card, '[data-task]')
    task.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }))
    await settle(card)
    expect(socket.of('housetide/skip')).toHaveLength(1)
    task.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
    await settle(card)
    expect(socket.of('housetide/undo')).toHaveLength(1)
  })

  test('the card stops listening when removed', async () => {
    const { card, socket } = await withState(payload([view('due')]), { layout: 'picture' })
    const task = $(card, '[data-task]')
    card.remove()
    await settle()
    swipe(task, 120)
    await settle()
    expect(socket.of('housetide/advance')).toHaveLength(0)
  })
})

describe('config validation', () => {
  const bad: Array<[string, unknown]> = [
    ['columns', { columns: 1 }],
    ['columns', { columns: 7 }],
    ['columns', { columns: '3' }],
    ['layout', { layout: 'grid' }],
    ['hide', { hide: 'title' }],
    ['hide', { hide: null }],
    ['hide', { hide: ['title', 'nope'] }],
    ['gestures', { gestures: 'swipe' }],
    ['gestures', { gestures: [] }],
    ['gestures', { gestures: null }],
    ['swipe_sideways', { gestures: { swipe_sideways: 'advance' } }],
    ['gestures.tap', { gestures: { tap: 'explode' } }],
  ]
  for (const [message, config] of bad) {
    test(`rejects ${JSON.stringify(config)}`, () => {
      expect(() => {
        new HousetideCard().setConfig(config as CardConfig)
      }).toThrow(message)
    })
  }

  test('accepts every new value', () => {
    const card = new HousetideCard()
    for (const columns of ['auto', 2, 3, 4, 5, 6] as const) card.setConfig({ columns })
    for (const layout of [...LOOKS, 'list', 'scenes'] as const) card.setConfig({ layout })
    card.setConfig({
      hide: ['title', 'stage', 'due', 'button', 'header'],
      gestures: {
        tap: 'advance',
        double_tap: 'skip',
        long_press: 'undo',
        swipe_left: 'none',
        swipe_right: 'advance',
        swipe_up: 'skip',
        swipe_down: 'undo',
      },
    })
  })
})

describe('rows are stable', () => {
  test('height is fixed in css', () => {
    const text = HousetideCard.styles.map((sheet) => sheet.cssText).join('')
    expect(text).toMatch(/\.row \{[^}]*height: 68px/)
  })

  test('all touch targets are large enough', () => {
    const text = HousetideCard.styles.map((sheet) => sheet.cssText).join('')
    expect(text).toMatch(/\.undo,\s*\.skip \{[^}]*width: 44px;[^}]*height: 44px/)
    expect(text).toMatch(/\.go \{[^}]*height: 48px/)
  })

  test('order holds when the first task starts', async () => {
    const a = view('due', { task_id: 'a', title: 'A', due_at: '2026-11-04T08:00:00+00:00' })
    const b = view('due', { task_id: 'b', title: 'B', due_at: '2026-11-04T09:00:00+00:00' })
    const { card, socket } = await withState(payload([b, a]))
    const order = (): Array<string | undefined> =>
      [...root(card).querySelectorAll<HTMLElement>('.row')].map((row) => row.dataset.task)
    expect(order()).toEqual(['a', 'b'])
    socket.push(payload([b, { ...a, status: 'in_progress', stage_index: 1 }]))
    await settle(card)
    expect(order()).toEqual(['a', 'b'])
  })

  test('configured ids set the order', async () => {
    const a = view('due', { task_id: 'a' })
    const b = view('due', { task_id: 'b' })
    const { card } = await withState(payload([a, b]), { tasks: ['b', 'a'] })
    expect(
      [...root(card).querySelectorAll<HTMLElement>('.row')].map((r) => r.dataset.task),
    ).toEqual(['b', 'a'])
  })
})

describe('filtering', () => {
  const later = view('upcoming', { task_id: 'later', is_today: false })
  const today = view('due', { task_id: 'today' })
  const fresh = view('clean', { task_id: 'fresh', is_today: false })

  test('today hides later tasks but keeps freshly clean ones', async () => {
    const { card } = await withState(payload([later, today, fresh]))
    expect(root(card).querySelector('[data-task="later"]')).toBeNull()
    expect(root(card).querySelector('[data-task="today"]')).not.toBeNull()
    expect(root(card).querySelector('[data-task="fresh"]')).not.toBeNull()
  })

  test('all shows everything', async () => {
    const { card } = await withState(payload([later, today]), { show: 'all' })
    expect(root(card).querySelectorAll('.row')).toHaveLength(2)
  })

  test('task ids narrow the list', async () => {
    const { card } = await withState(payload([later, today]), { show: 'all', tasks: ['later'] })
    expect(root(card).querySelectorAll('.row')).toHaveLength(1)
  })

  test('an empty id list means all tasks', async () => {
    const { card } = await withState(payload([today]), { tasks: [] })
    expect(root(card).querySelector('[data-task="today"]')).not.toBeNull()
    expect(selectViews([today], { show: 'today', ids: [] })).toEqual([today])
  })

  test('counts what needs attention', async () => {
    const { card } = await withState(payload([today, fresh]))
    expect($(card, '.count').textContent).toBe('1 task due')
  })
})

describe('actions', () => {
  test('advance then undo', async () => {
    const before = view('due', { task_id: 'a' })
    const { card, socket } = await withState(payload([before]))
    expect(root(card).querySelector('[data-action="undo"]')).toBeNull()
    $(card, '[data-action="advance"]').click()
    await settle(card)
    expect(socket.of('housetide/advance')).toEqual([{ type: 'housetide/advance', task_id: 'a' }])
    socket.push(payload([view('clean', { task_id: 'a', is_today: false, can_undo: true })]))
    await settle(card)
    expect($(card, '[data-task="a"]').dataset.status).toBe('clean')
    expect($(card, '.go.finished')).toBeTruthy()
    $(card, '[data-action="undo"]').click()
    await settle(card)
    expect(socket.of('housetide/undo')).toEqual([{ type: 'housetide/undo', task_id: 'a' }])
  })

  test('undo is only offered after an advance from here', async () => {
    const { card } = await withState(payload([view('due', { can_undo: true })]))
    expect(root(card).querySelector('[data-action="undo"]')).toBeNull()
  })

  test('a double tap sends one advance', async () => {
    const { card, socket } = await withState(payload([view('in_progress', { stage_count: 3 })]))
    const go = $(card, '[data-action="advance"]')
    go.click()
    go.click()
    await settle(card)
    go.click()
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(1)
    await new Promise((resolve) => {
      setTimeout(resolve, COOLDOWN_MS + 20)
    })
    go.click()
    await settle(card)
    expect(socket.of('housetide/advance')).toHaveLength(2)
  })

  for (const status of ['clean', 'upcoming'] as const) {
    test(`a ${status} task needs a deliberate second tap`, async () => {
      const { card, socket } = await withState(payload([view(status)]), { show: 'all' })
      const go = $(card, '[data-action="advance"]')
      expect(go.textContent?.trim()).toBe('Do early')
      go.click()
      go.click()
      await settle(card)
      expect(socket.of('housetide/advance')).toHaveLength(0)
      expect(go.textContent?.trim()).toBe('Sure?')
      await new Promise((resolve) => {
        setTimeout(resolve, COOLDOWN_MS + 20)
      })
      go.click()
      await settle(card)
      expect(socket.of('housetide/advance')).toHaveLength(1)
    })
  }

  test('a push ahead of the result keeps the row in place', async () => {
    const one = view('due', { task_id: 'one', title: 'A', action: 'Go' })
    const other = view('due', { task_id: 'other', title: 'B' })
    const socket = new FakeSocket()
    socket.initial = payload([one, other])
    const finished = view('done', {
      task_id: 'one',
      title: 'A',
      is_today: false,
      can_undo: true,
      due_at: null,
    })
    let during: string[] = []
    let card: HousetideCard | undefined
    socket.replies.set('housetide/advance', async () => {
      socket.push(payload([finished, other]))
      await settle(card)
      during = [...root(card!).querySelectorAll<HTMLElement>('.row')].map((r) => r.dataset.task!)
    })
    card = await mount(socket)
    const node = $(card, '[data-task="one"]')
    node.querySelector<HTMLElement>('[data-action="advance"]')?.click()
    await settle(card)
    expect(during).toEqual(['one', 'other'])
    expect($(card, '[data-task="one"]')).toBe(node)
  })

  test('a failed advance forgets the row it held', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due', { task_id: 'a' })])
    socket.replies.set('housetide/advance', () => {
      throw new Error('nope')
    })
    const card = await mount(socket)
    $(card, '[data-action="advance"]').click()
    await settle(card)
    expect(root(card).querySelector('.go.finished')).toBeNull()
    socket.push(payload([view('upcoming', { task_id: 'a', is_today: false })]))
    await settle(card)
    expect(root(card).querySelector('[data-task="a"]')).toBeNull()
  })

  test('a failed advance shows the reason in place', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due')])
    socket.replies.set('housetide/advance', () => {
      throw new Error('nope')
    })
    const card = await mount(socket)
    $(card, '[data-action="advance"]').click()
    await settle(card)
    expect($(card, '.due.failed').textContent).toContain('nope')
    expect(root(card).querySelector('[data-action="undo"]')).toBeNull()
  })

  test('completing a task celebrates, a mid chain step does not burst', async () => {
    const socket = new FakeSocket()
    let release = (): void => undefined
    socket.replies.set(
      'housetide/advance',
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    )
    socket.initial = payload([view('due')])
    const card = await mount(socket)
    $(card, '[data-action="advance"]').click()
    await settle(card)
    expect(root(card).querySelector('.burst')).not.toBeNull()
    expect($(card, '.go').hasAttribute('data-pending')).toBe(true)
    release()
    await settle(card)

    const chain = await withState(payload([view('in_progress', { stage_count: 3 })]))
    $(chain.card, '[data-action="advance"]').click()
    await settle(chain.card)
    expect(root(chain.card).querySelector('.burst')).toBeNull()
  })
})

describe('subscription lifecycle', () => {
  test('subscribes once however often hass changes', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due')])
    const card = await mount(socket)
    card.hass = fakeHass(socket)
    card.hass = fakeHass(socket)
    await settle(card)
    expect(socket.subscribes).toBe(1)
    expect(socket.of('housetide/subscribe')).toEqual([{ type: 'housetide/subscribe' }])
  })

  test('hass churn does not re-render', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due')])
    const card = await mount(socket)
    const hass = fakeHass(socket)
    card.hass = { ...card.hass!, states: hass.states }
    expect(card.isUpdatePending).toBe(false)
  })

  test('re-renders on a push', async () => {
    const { card, socket } = await withState(payload([view('due', { title: 'One' })]))
    socket.push(payload([view('due', { title: 'Two' })]))
    await settle(card)
    expect($(card, '.title').textContent).toBe('Two')
  })

  test('unsubscribes on removal and comes back', async () => {
    const { card, socket } = await withState(payload([view('due')]))
    card.remove()
    await settle()
    expect(socket.unsubscribes).toBe(1)
    document.body.append(card)
    await settle(card)
    expect(socket.subscribes).toBe(2)
  })

  test('removal while subscribing still unsubscribes', async () => {
    const socket = new FakeSocket()
    let open = (): void => undefined
    socket.gate = new Promise<void>((resolve) => {
      open = resolve
    })
    const card = await mount(socket)
    card.remove()
    open()
    await settle()
    expect(socket.unsubscribes).toBe(1)
    expect(socket.listeners).toHaveLength(0)
  })

  test('a new connection resubscribes', async () => {
    const { card, socket } = await withState(payload([view('due')]))
    const other = new FakeSocket()
    other.initial = payload([view('due', { title: 'Other' })])
    card.hass = fakeHass(other)
    await settle(card)
    expect(socket.unsubscribes).toBe(1)
    expect(other.subscribes).toBe(1)
    expect($(card, '.title').textContent).toBe('Other')
  })
})

describe('states', () => {
  test('loading keeps row shapes', async () => {
    const card = await mount(new FakeSocket())
    expect(root(card).querySelectorAll('.row.skeleton')).toHaveLength(2)
  })

  test('empty is friendly', async () => {
    const { card } = await withState(payload([]))
    expect($(card, '[data-part="empty"]').textContent).toContain('All clear')
  })

  test('failure explains itself', async () => {
    const socket = new FakeSocket()
    socket.subscribeError = new Error('unknown_command')
    const card = await mount(socket)
    expect($(card, '[role="alert"]').textContent).toContain('Housetide is not available')
  })

  test('disconnected keeps the data and disables actions', async () => {
    const socket = new FakeSocket()
    socket.initial = payload([view('due')])
    const card = await mount(socket, {}, { connected: false })
    expect($(card, '.offline').textContent).toContain('Reconnecting')
    expect($(card, '.title').textContent).toBe('Task due')
    expect($(card, '[data-action="advance"]').hasAttribute('disabled')).toBe(true)
  })

  test('speaks Ukrainian', async () => {
    const { card } = await withState(payload([]), {}, { language: 'uk' })
    expect($(card, 'h2').textContent).toBe('Сьогодні')
  })
})

describe('animations', () => {
  const animated = (card: HousetideCard): boolean =>
    root(card).querySelector('.ht-animated') !== null

  test('on by default, off by config', async () => {
    const on = await withState(payload([view('due')]))
    expect(animated(on.card)).toBe(true)
    const off = await withState(payload([view('due')]), { animations: false })
    expect(animated(off.card)).toBe(false)
  })

  test('switched off also stops the row pop and the undo entrance', async () => {
    const { card, socket } = await withState(payload([view('due', { task_id: 'a' })]), {
      animations: false,
    })
    $(card, '[data-action="advance"]').click()
    expect($(card, '.row').className).not.toContain('pop-')
    await settle(card)
    expect($(card, '.row').className).not.toContain('pop-')
    socket.push(payload([view('clean', { task_id: 'a', can_undo: true })]))
    await settle(card)
    expect($(card, '[data-action="undo"]').className).not.toContain('enter')
  })

  test('stop on hidden pages', async () => {
    const { card } = await withState(payload([view('due')]))
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await settle(card)
    expect(animated(card)).toBe(false)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    await settle(card)
    expect(animated(card)).toBe(true)
  })
})

describe('home assistant card api', () => {
  test('registers in customCards', () => {
    expect(window.customCards?.some((item) => item.type === 'housetide-card')).toBe(true)
    expect(customElements.get('housetide-card')).toBe(HousetideCard)
    expect(customElements.get('housetide-panel')).toBeDefined()
  })

  test('rejects a bad config', () => {
    expect(() => {
      new HousetideCard().setConfig({ show: 'never' } as never)
    }).toThrow()
    expect(() => {
      new HousetideCard().setConfig({ layout: 'x' } as never)
    }).toThrow()
    expect(() => {
      new HousetideCard().setConfig({ tasks: 'a' } as never)
    }).toThrow()
  })

  test('size and grid', async () => {
    const { card } = await withState(payload([view('due'), view('overdue')]))
    expect(card.getCardSize()).toBe(5)
    expect(card.getGridOptions().min_columns).toBeGreaterThan(0)
  })

  test('offers the visual editor and a stub', () => {
    const editor = HousetideCard.getConfigElement()
    expect(editor.localName).toBe('housetide-card-editor')
    expect(editor).toBeInstanceOf(customElements.get('housetide-card-editor')!)
    expect(HousetideCard.getStubConfig().show).toBe('today')
  })
})
