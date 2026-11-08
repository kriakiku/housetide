import { afterEach, describe, expect, test } from 'bun:test'

import { HousetideCard } from './card.ts'
// oxlint-disable-next-line import/no-unassigned-import
import './housetide.ts'
import type { CardConfig } from './card.ts'
import { COOLDOWN_MS } from './panel/live.ts'
import { selectViews } from './panel/tile.ts'
import { FakeSocket, fakeHass, payload, settle, task, view } from './test-fixtures.ts'
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

  test('form lists known tasks and labels fields', async () => {
    await withState(payload([], [task('a', { title: 'Aye' })]))
    const form = HousetideCard.getConfigForm()
    const names = form.schema.map((field) => (field as { name: string }).name)
    expect(names).toEqual(['title', 'show', 'layout', 'tasks', 'animations'])
    expect(JSON.stringify(form.schema)).toContain('Aye')
    expect(form.computeLabel({ name: 'show' })).toBe('Show')
    expect(HousetideCard.getStubConfig().show).toBe('today')
  })
})
