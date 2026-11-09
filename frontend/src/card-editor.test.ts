import { afterEach, describe, expect, test } from 'bun:test'

import { HousetideCardEditor } from './card-editor.ts'
import type { CardConfig } from './card.ts'
// oxlint-disable-next-line import/no-unassigned-import
import './housetide.ts'
import { FakeSocket, fakeHass, payload, settle, task, view } from './test-fixtures.ts'
import type { FakeHassOptions } from './test-fixtures.ts'

let mounted: HousetideCardEditor[] = []
let cleanups: Array<() => void> = []

afterEach(() => {
  for (const editor of mounted) editor.remove()
  for (const cleanup of cleanups) cleanup()
  mounted = []
  cleanups = []
})

const STATE = payload(
  [view('due', { task_id: 'b' })],
  [task('a', { title: 'Aye' }), task('b', { title: 'Bee' }), task('c', { title: 'Sea' })],
)

interface Mounted {
  editor: HousetideCardEditor
  socket: FakeSocket
  events: CustomEvent<{ config: CardConfig }>[]
}

async function mount(
  config: CardConfig = {},
  setup: (socket: FakeSocket) => void = (socket) => {
    socket.initial = STATE
  },
  options: FakeHassOptions = {},
): Promise<Mounted> {
  const socket = new FakeSocket()
  setup(socket)
  const editor = new HousetideCardEditor()
  editor.setConfig(config)
  editor.hass = fakeHass(socket, options)
  const events: Mounted['events'] = []
  const listener = (event: Event): void => {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    events.push(event as CustomEvent<{ config: CardConfig }>)
  }
  document.body.addEventListener('config-changed', listener)
  cleanups.push(() => {
    document.body.removeEventListener('config-changed', listener)
  })
  document.body.append(editor)
  mounted.push(editor)
  await settle(editor)
  return { editor, socket, events }
}

function $(editor: HousetideCardEditor, selector: string): HTMLElement {
  const found = editor.shadowRoot?.querySelector<HTMLElement>(selector)
  if (!found) throw new Error(`missing ${selector}`)
  return found
}

function field(editor: HousetideCardEditor, selector: string): HTMLInputElement {
  const found = $(editor, selector)
  if (!(found instanceof HTMLInputElement)) throw new Error(`not an input: ${selector}`)
  return found
}

function typeTitle(editor: HousetideCardEditor, value: string): void {
  const input = field(editor, '[data-field="title"]')
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
}

function setChecked(input: HTMLInputElement, checked: boolean): void {
  input.checked = checked
  input.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
}

async function tick(editor: HousetideCardEditor, id: string, checked: boolean): Promise<void> {
  setChecked(field(editor, `[data-task="${id}"] input`), checked)
  await settle(editor)
}

function last(events: Mounted['events']): CardConfig {
  const event = events.at(-1)
  if (!event) throw new Error('no event')
  return event.detail.config
}

function taskIds(editor: HousetideCardEditor): Array<string | undefined> {
  return [...(editor.shadowRoot?.querySelectorAll<HTMLElement>('[data-task]') ?? [])].map(
    (row) => row.dataset.task,
  )
}

describe('event payload', () => {
  test('bubbles and crosses shadow roots', async () => {
    const { editor, events } = await mount()
    typeTitle(editor, 'Home')
    expect(events).toHaveLength(1)
    expect(events[0]?.bubbles).toBe(true)
    expect(events[0]?.composed).toBe(true)
  })

  test('title', async () => {
    const { editor, events } = await mount()
    typeTitle(editor, 'Home')
    expect(last(events)).toEqual({ title: 'Home' })
  })

  test('layout', async () => {
    const { editor, events } = await mount()
    $(editor, '[data-layout="scenes"]').click()
    await settle(editor)
    expect(last(events)).toEqual({ layout: 'scenes' })
    expect($(editor, '[data-layout="scenes"]').getAttribute('aria-pressed')).toBe('true')
    expect($(editor, '[data-layout="list"]').getAttribute('aria-pressed')).toBe('false')
  })

  test('show', async () => {
    const { editor, events } = await mount()
    $(editor, '[data-show="all"]').click()
    await settle(editor)
    expect(last(events)).toEqual({ show: 'all' })
    expect($(editor, '[data-show="all"]').getAttribute('aria-pressed')).toBe('true')
  })

  test('tasks', async () => {
    const { editor, events } = await mount()
    await tick(editor, 'b', true)
    expect(last(events)).toEqual({ tasks: ['b'] })
  })

  test('animations', async () => {
    const { editor, events } = await mount()
    const input = field(editor, '[data-field="animations"]')
    expect(input.getAttribute('role')).toBe('switch')
    expect(input.checked).toBe(true)
    setChecked(input, false)
    await settle(editor)
    expect(last(events)).toEqual({ animations: false })
    expect(input.checked).toBe(false)
  })

  test('successive edits build on each other without a setConfig round trip', async () => {
    const { editor, events } = await mount()
    $(editor, '[data-show="all"]').click()
    $(editor, '[data-layout="scenes"]').click()
    expect(last(events)).toEqual({ show: 'all', layout: 'scenes' })
  })
})

describe('tidy yaml', () => {
  test('defaults are not written when absent', async () => {
    const { editor, events } = await mount()
    $(editor, '[data-show="today"]').click()
    $(editor, '[data-layout="list"]').click()
    setChecked(field(editor, '[data-field="animations"]'), true)
    await settle(editor)
    expect(events).toHaveLength(0)
  })

  test('a default is written when the key was already present', async () => {
    const { editor, events } = await mount({ show: 'all', layout: 'scenes', animations: false })
    $(editor, '[data-show="today"]').click()
    $(editor, '[data-layout="list"]').click()
    setChecked(field(editor, '[data-field="animations"]'), true)
    expect(last(events)).toEqual({ show: 'today', layout: 'list', animations: true })
  })

  test('changing one field leaves absent defaults absent', async () => {
    const { editor, events } = await mount()
    typeTitle(editor, 'Home')
    expect(Object.keys(last(events))).toEqual(['title'])
  })

  test('an emptied title is deleted', async () => {
    const { editor, events } = await mount({ title: 'Home' })
    typeTitle(editor, '')
    expect(events).toHaveLength(1)
    expect(Object.hasOwn(last(events), 'title')).toBe(false)
  })

  test('a blank title is not written', async () => {
    const { editor, events } = await mount()
    typeTitle(editor, '   ')
    expect(events).toHaveLength(0)
  })

  test('unticking the last task removes the key', async () => {
    const { editor, events } = await mount({ tasks: ['a'] })
    await tick(editor, 'a', false)
    expect(Object.hasOwn(last(events), 'tasks')).toBe(false)
  })
})

describe('unknown keys', () => {
  test('survive every control', async () => {
    const original: CardConfig & { custom: number } = {
      type: 'custom:housetide-card',
      custom: 7,
    }
    const { editor, events } = await mount(original)
    typeTitle(editor, 'Home')
    $(editor, '[data-layout="scenes"]').click()
    $(editor, '[data-show="all"]').click()
    await tick(editor, 'a', true)
    setChecked(field(editor, '[data-field="animations"]'), false)
    typeTitle(editor, '')
    await tick(editor, 'a', false)
    expect(events).toHaveLength(7)
    for (const event of events) {
      expect(event.detail.config).toMatchObject({ type: 'custom:housetide-card', custom: 7 })
    }
  })

  test('the incoming config is not mutated', async () => {
    const original: CardConfig = Object.freeze({ title: 'Home', tasks: ['a'] })
    const { editor } = await mount(original)
    typeTitle(editor, '')
    await tick(editor, 'a', false)
    expect(original).toEqual({ title: 'Home', tasks: ['a'] })
  })
})

describe('tasks', () => {
  test('lists every task with its scene, today or not', async () => {
    const { editor } = await mount()
    expect(taskIds(editor)).toEqual(['a', 'b', 'c'])
    expect($(editor, '[data-task="a"]').textContent).toContain('Aye')
    expect($(editor, '[data-task="a"] svg').dataset.scene).toBe('pills')
    expect($(editor, '[data-task="b"] svg').dataset.scene).toBe('generic')
    expect(editor.shadowRoot?.querySelector('[data-task] .ht-animated')).toBeNull()
  })

  test('says that nothing ticked means all tasks', async () => {
    const { editor } = await mount()
    expect($(editor, '[data-part="tasks-hint"]').textContent).toContain(
      'Nothing ticked means all tasks',
    )
  })

  test('keeps tick order, not list order', async () => {
    const { editor, events } = await mount()
    await tick(editor, 'c', true)
    await tick(editor, 'a', true)
    await tick(editor, 'b', true)
    expect(last(events).tasks).toEqual(['c', 'a', 'b'])
    await tick(editor, 'a', false)
    await tick(editor, 'a', true)
    expect(last(events).tasks).toEqual(['c', 'b', 'a'])
    expect(taskIds(editor)).toEqual(['a', 'b', 'c'])
  })

  test('reflects the ticked ids', async () => {
    const { editor } = await mount({ tasks: ['b'] })
    expect(field(editor, '[data-task="a"] input').checked).toBe(false)
    expect(field(editor, '[data-task="b"] input').checked).toBe(true)
  })

  test('unknown ids are shown and kept in place', async () => {
    const { editor, events } = await mount({ tasks: ['gone', 'a'] })
    expect(taskIds(editor)).toEqual(['a', 'b', 'c', 'gone'])
    const row = $(editor, '[data-task="gone"]')
    expect(row.textContent).toContain('Task not found')
    expect(row.textContent).toContain('gone')
    expect(field(editor, '[data-task="gone"] input').checked).toBe(true)
    await tick(editor, 'b', true)
    expect(last(events).tasks).toEqual(['gone', 'a', 'b'])
  })

  test('an unknown id only goes when unticked', async () => {
    const { editor, events } = await mount({ tasks: ['gone', 'a'] })
    await tick(editor, 'gone', false)
    expect(last(events).tasks).toEqual(['a'])
    expect(taskIds(editor)).toEqual(['a', 'b', 'c'])
    expect(editor.shadowRoot?.activeElement).toBe($(editor, '[data-part="tasks-heading"]'))
  })

  test('picks up pushes', async () => {
    const { editor, socket } = await mount()
    socket.push(payload([], [task('z', { title: 'Zed' })]))
    await settle(editor)
    expect(taskIds(editor)).toEqual(['z'])
  })

  test('no tasks at all', async () => {
    const { editor } = await mount({}, (socket) => {
      socket.initial = payload([], [])
    })
    expect($(editor, '[data-part="empty"]').textContent).toContain('No tasks yet')
  })
})

describe('states', () => {
  const loading = (socket: FakeSocket): void => {
    socket.gate = new Promise<void>(() => undefined)
  }

  test('renders while loading, without calling configured ids unknown', async () => {
    const { editor, events } = await mount({ tasks: ['a'], title: 'Home' }, loading)
    expect($(editor, '[role="status"]').textContent).toContain('Loading tasks…')
    expect(taskIds(editor)).toEqual([])
    expect(field(editor, '[data-field="title"]').value).toBe('Home')
    typeTitle(editor, 'Flat')
    expect(last(events)).toEqual({ tasks: ['a'], title: 'Flat' })
    expect(editor.shadowRoot?.querySelectorAll('[data-layout]')).toHaveLength(2)
  })

  test('failure explains itself, keeps the selection, and can retry', async () => {
    const { editor, socket, events } = await mount({ tasks: ['a'] }, (target) => {
      target.initial = STATE
      target.subscribeError = new Error('unknown_command')
    })
    expect($(editor, '[role="alert"]').textContent).toContain('Your ticked tasks stay as they are')
    expect(taskIds(editor)).toEqual([])
    expect(events).toHaveLength(0)
    socket.subscribeError = null
    $(editor, '[data-action="retry"]').click()
    await settle(editor)
    expect(taskIds(editor)).toEqual(['a', 'b', 'c'])
    expect(editor.shadowRoot?.activeElement).toBe($(editor, '[data-part="tasks-heading"]'))
  })

  test('subscribes once and unsubscribes on removal', async () => {
    const { editor, socket } = await mount()
    editor.hass = fakeHass(socket)
    await settle(editor)
    expect(socket.subscribes).toBe(1)
    editor.remove()
    await settle()
    expect(socket.unsubscribes).toBe(1)
  })

  test('nothing renders without hass', async () => {
    const editor = new HousetideCardEditor()
    document.body.append(editor)
    mounted.push(editor)
    await settle(editor)
    expect(editor.shadowRoot?.querySelector('input')).toBeNull()
  })

  test('speaks Ukrainian', async () => {
    const { editor } = await mount({}, undefined, { language: 'uk' })
    expect($(editor, '[data-show="today"]').textContent?.trim()).toBe('Сьогодні')
    expect($(editor, '[data-part="tasks-hint"]').textContent).toContain('показуються всі задачі')
  })
})

describe('contract', () => {
  test('rejects a bad config so Home Assistant falls back to yaml', () => {
    expect(() => {
      new HousetideCardEditor().setConfig({ show: 'never' } as never)
    }).toThrow()
  })

  test('is registered', () => {
    expect(customElements.get('housetide-card-editor')).toBe(HousetideCardEditor)
  })

  test('layout choices preview real still scenes', async () => {
    const { editor } = await mount()
    for (const layout of ['scenes', 'list']) {
      const button = $(editor, `[data-layout="${layout}"]`)
      expect(button.querySelectorAll('svg.ht-scene').length).toBeGreaterThan(0)
      expect(button.querySelector('.ht-animated')).toBeNull()
    }
  })

  test('styles keep touch targets and corner shapes', () => {
    const text = HousetideCardEditor.styles.map((sheet) => sheet.cssText).join('')
    expect(text).toMatch(/\.task \{[^}]*min-height: 56px/)
    expect(text).toMatch(/\.toggle \{[^}]*min-height: 44px/)
    expect(text).toMatch(/\.switch \{[^}]*height: 44px/)
    const radii = text.match(/border-radius: [^;]+;\s*[^;]+;/g) ?? []
    for (const rule of radii) {
      if (!rule.includes('50%')) expect(rule).toContain('corner-shape')
    }
  })
})
