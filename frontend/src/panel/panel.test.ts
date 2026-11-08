import { afterEach, describe, expect, test } from 'bun:test'

// oxlint-disable-next-line import/no-unassigned-import
import '../housetide.ts'
import {
  entity,
  FakeSocket,
  fakeHass,
  historyEvent,
  payload,
  settle,
  stats,
  task,
  view,
} from '../test-fixtures.ts'
import type { FakeHassOptions } from '../test-fixtures.ts'
import type { HassMessage, HistoryEvent, Stage, StatePayload, TaskDraft } from '../types.ts'
import type { HousetideHistory } from './history.ts'
import { tabFromPath } from './panel.ts'
import type { HousetidePanel } from './panel.ts'

const LAUNDRY: TaskDraft = {
  title: 'Laundry',
  icon: 'mdi:washing-machine',
  color: null,
  notes: null,
  assignee: null,
  enabled: true,
  schedule: { type: 'interval', every_days: 7, time: '10:00', anchor: 'completion' },
  on_missed: 'carry',
  scene: 'laundry',
  stages: [
    {
      id: 'load',
      title: 'Collect/load',
      action: 'Loaded',
      role: 'todo',
      complete_when: { entity_id: '', above: 10, below: null, state: null, for_seconds: 60 },
      stale_after_minutes: null,
    },
    {
      id: 'wash',
      title: 'Washing',
      action: 'Finished',
      role: 'running',
      complete_when: { entity_id: '', above: null, below: 5, state: null, for_seconds: 300 },
      stale_after_minutes: null,
    },
    {
      id: 'hang',
      title: 'Hang it up',
      action: 'Hung up',
      role: 'waiting',
      complete_when: null,
      stale_after_minutes: 180,
    },
  ],
  clean_for_minutes: 720,
  grace_hours: 24,
}

const ONE_OFF: TaskDraft = {
  ...LAUNDRY,
  title: 'One-off task',
  scene: 'generic',
  schedule: { type: 'once', due: '2026-11-05T09:00:00+02:00' },
  on_missed: 'carry',
  stages: [
    {
      id: 'do',
      title: 'Do it',
      action: 'Done',
      role: 'todo',
      complete_when: null,
      stale_after_minutes: null,
    },
  ],
}

const STATES = {
  'sensor.washer_power': entity('sensor.washer_power', '3.2', {
    friendly_name: 'Washer power',
    device_class: 'power',
    unit_of_measurement: 'W',
  }),
  'light.hall': entity('light.hall', 'on', { friendly_name: 'Hall' }),
}

let mounted: HousetidePanel[] = []

afterEach(() => {
  for (const panel of mounted) panel.remove()
  mounted = []
})

async function mount(
  socket: FakeSocket,
  path = '/today',
  options: FakeHassOptions = {},
): Promise<HousetidePanel> {
  const panel = document.createElement('housetide-panel') as HousetidePanel
  panel.hass = fakeHass(socket, { states: STATES, ...options })
  panel.narrow = false
  panel.route = { prefix: '/housetide', path }
  document.body.append(panel)
  mounted.push(panel)
  await settle(panel)
  return panel
}

function deepRoot(host: Element, selector: string): ShadowRoot {
  const element = host.shadowRoot?.querySelector(selector)
  if (!element?.shadowRoot) throw new Error(`no ${selector}`)
  return element.shadowRoot
}

function today(panel: HousetidePanel): ShadowRoot {
  return deepRoot(panel, 'housetide-today')
}

function tasks(panel: HousetidePanel): ShadowRoot {
  return deepRoot(panel, 'housetide-tasks')
}

function history(panel: HousetidePanel): ShadowRoot {
  return deepRoot(panel, 'housetide-history')
}

function editor(panel: HousetidePanel): ShadowRoot {
  const host = tasks(panel).querySelector('housetide-editor')
  if (!host?.shadowRoot) throw new Error('no editor')
  return host.shadowRoot
}

// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
function one<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const found = root.querySelector<T>(selector)
  if (!found) throw new Error(`missing ${selector}`)
  return found
}

function click(root: ParentNode, selector: string): void {
  one(root, selector).click()
}

function type(root: ParentNode, field: string, value: string): void {
  const input = one<HTMLInputElement>(root, `[data-field="${field}"]`)
  input.value = value
  input.dispatchEvent(new Event('input'))
}

function choose(root: ParentNode, field: string, value: string): void {
  const select = one<HTMLSelectElement>(root, `[data-field="${field}"]`)
  select.value = value
  select.dispatchEvent(new Event('change'))
}

function toggle(root: ParentNode, field: string, checked: boolean): void {
  const input = one<HTMLInputElement>(root, `[data-field="${field}"]`)
  input.checked = checked
  input.dispatchEvent(new Event('change'))
}

function socketWith(state: StatePayload): FakeSocket {
  const socket = new FakeSocket()
  socket.initial = state
  socket.replies.set('housetide/templates', { laundry: LAUNDRY, one_off: ONE_OFF })
  socket.replies.set('housetide/history', { events: [] })
  socket.replies.set('housetide/stats', stats())
  return socket
}

async function openTemplate(name: string, options: FakeHassOptions = {}) {
  const socket = socketWith(payload([]))
  const panel = await mount(socket, '/tasks', options)
  click(tasks(panel), `[data-template="${name}"]`)
  await settle(panel)
  return { socket, panel, form: editor(panel) }
}

async function save(panel: HousetidePanel, form: ShadowRoot): Promise<void> {
  click(form, '[data-action="save"]')
  await settle(panel)
}

function created(socket: FakeSocket): TaskDraft {
  const [message] = socket.of('housetide/task/create')
  if (!message) throw new Error('nothing created')
  return message.task as TaskDraft
}

describe('navigation', () => {
  test('picks the tab from the route', () => {
    expect(tabFromPath('/history')).toBe('history')
    expect(tabFromPath('/tasks/x')).toBe('tasks')
    expect(tabFromPath('')).toBe('today')
    expect(tabFromPath('/nope')).toBe('today')
  })

  test('switches tabs and keeps one subscription', async () => {
    const socket = socketWith(payload([view('due')]))
    const panel = await mount(socket)
    expect(one(today(panel), '.tile')).toBeTruthy()
    click(panel.shadowRoot!, '[data-tab="history"]')
    await settle(panel)
    expect(panel.shadowRoot?.querySelector('housetide-today')?.hasAttribute('hidden')).toBe(true)
    expect(one(panel.shadowRoot!, '[data-tab="history"]').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(socket.subscribes).toBe(1)
    expect(location.pathname).toBe('/housetide/history')
  })

  test('unsubscribes when removed', async () => {
    const socket = socketWith(payload([]))
    const panel = await mount(socket)
    panel.remove()
    await settle()
    expect(socket.unsubscribes).toBe(1)
  })

  test('narrow shows the menu button that toggles the sidebar', async () => {
    const panel = await mount(socketWith(payload([])))
    expect(panel.shadowRoot?.querySelector('[data-action="menu"]')).toBeNull()
    panel.narrow = true
    await settle(panel)
    let toggled = 0
    panel.addEventListener('hass-toggle-menu', () => {
      toggled += 1
    })
    click(panel.shadowRoot!, '[data-action="menu"]')
    expect(toggled).toBe(1)
  })

  test('tasks in progress keep the editor across tabs', async () => {
    const { panel, form } = await openTemplate('laundry')
    type(form, 'title', 'Keep me')
    click(panel.shadowRoot!, '[data-tab="today"]')
    await settle(panel)
    click(panel.shadowRoot!, '[data-tab="tasks"]')
    await settle(panel)
    expect(one<HTMLInputElement>(editor(panel), '[data-field="title"]').value).toBe('Keep me')
  })
})

describe('states', () => {
  test('loading shows skeletons', async () => {
    const panel = await mount(new FakeSocket())
    expect(today(panel).querySelectorAll('.tile.skeleton').length).toBeGreaterThan(0)
  })

  test('failure offers a retry that works', async () => {
    const socket = new FakeSocket()
    socket.subscribeError = new Error('x')
    const panel = await mount(socket)
    one(panel.shadowRoot!, '[data-part="error"]')
    socket.subscribeError = null
    socket.initial = payload([view('due')])
    click(panel.shadowRoot!, '[data-action="retry"]')
    await settle(panel)
    expect(panel.shadowRoot?.querySelector('[data-part="error"]')).toBeNull()
    one(today(panel), '.tile')
  })

  test('offline notice disables acting', async () => {
    const panel = await mount(socketWith(payload([view('due')])), '/today', { connected: false })
    one(panel.shadowRoot!, '[data-part="offline"]')
    expect(one(today(panel), '[data-action="advance"]').hasAttribute('disabled')).toBe(true)
  })
})

describe('today', () => {
  test('clear state', async () => {
    const panel = await mount(socketWith(payload([])))
    expect(one(today(panel), '[data-part="clear"]').textContent).toContain('All clear')
  })

  test('large scenes with advance, skip, undo', async () => {
    const socket = socketWith(payload([view('due', { task_id: 'a' })]))
    const panel = await mount(socket)
    const root = today(panel)
    one(root, '.tile .art svg')
    click(root, '[data-action="skip"]')
    await settle(panel)
    expect(socket.of('housetide/skip')).toEqual([{ type: 'housetide/skip', task_id: 'a' }])
    socket.push(payload([view('upcoming', { task_id: 'a', can_undo: true, is_today: false })]))
    await settle(panel)
    one(root, '.tile[data-status="upcoming"]')
    click(root, '[data-action="undo"]')
    await settle(panel)
    expect(socket.of('housetide/undo')).toHaveLength(1)
  })

  test('advance from a tile', async () => {
    const socket = socketWith(payload([view('due', { task_id: 'a' })]))
    const panel = await mount(socket)
    click(today(panel), '[data-action="advance"]')
    await settle(panel)
    expect(socket.of('housetide/advance')).toEqual([{ type: 'housetide/advance', task_id: 'a' }])
  })

  test('undo survives a trip to another tab', async () => {
    const socket = socketWith(payload([view('due', { task_id: 'a' })]))
    const panel = await mount(socket)
    click(today(panel), '[data-action="advance"]')
    await settle(panel)
    socket.push(payload([view('clean', { task_id: 'a', can_undo: true, is_today: false })]))
    await settle(panel)
    await settle(today(panel).host as HousetidePanel)
    one(today(panel), '[data-action="undo"]')
    click(panel.shadowRoot!, '[data-tab="history"]')
    await settle(panel)
    click(panel.shadowRoot!, '[data-tab="today"]')
    await settle(panel)
    await settle(today(panel).host as HousetidePanel)
    one(today(panel), '[data-action="undo"]')
  })

  test('lists what is coming up', async () => {
    const socket = socketWith(
      payload([view('due'), view('upcoming', { task_id: 'later', is_today: false })]),
    )
    const panel = await mount(socket)
    one(today(panel), '[data-later="later"]')
  })

  test('a stale hass reference does not break rendering of pushes', async () => {
    const socket = socketWith(payload([view('due', { title: 'One' })]))
    const panel = await mount(socket)
    socket.push(payload([view('due', { title: 'Two' })]))
    await settle(panel)
    expect(one(today(panel), '.title').textContent).toBe('Two')
  })
})

describe('tasks list', () => {
  test('empty state with templates for admins', async () => {
    const panel = await mount(socketWith(payload([])), '/tasks')
    expect(one(tasks(panel), '[data-part="empty"]').textContent).toContain('No tasks yet')
    one(tasks(panel), '[data-template="laundry"]')
  })

  test('opening a template asks for fresh dates', async () => {
    const socket = socketWith(payload([]))
    const panel = await mount(socket, '/tasks')
    socket.replies.set('housetide/templates', {
      one_off: { ...ONE_OFF, schedule: { type: 'once', due: '2026-12-01T09:00:00+02:00' } },
    })
    click(tasks(panel), '[data-template="one_off"]')
    await settle(panel)
    expect(one<HTMLInputElement>(editor(panel), '[data-field="due"]').value).toBe(
      '2026-12-01T09:00',
    )
    expect(socket.of('housetide/templates')).toHaveLength(2)
  })

  test('templates failing offers a retry', async () => {
    const socket = socketWith(payload([]))
    socket.replies.set('housetide/templates', () => {
      throw new Error('x')
    })
    const panel = await mount(socket, '/tasks')
    expect(tasks(panel).textContent).toContain('Could not load the templates.')
    socket.replies.set('housetide/templates', { laundry: LAUNDRY })
    click(tasks(panel), '[data-action="retry-templates"]')
    await settle(panel)
    one(tasks(panel), '[data-template="laundry"]')
  })

  test('shows the schedule in words and status', async () => {
    const t = task('a')
    const panel = await mount(socketWith(payload([view('due', { task_id: 'a' })], [t])), '/tasks')
    const row = one(tasks(panel), '[data-task="a"]')
    expect(row.textContent).toContain('Every day at 08:00')
    expect(row.textContent).toContain('Due')
  })

  test('settings save for admins', async () => {
    const socket = socketWith(payload([]))
    const panel = await mount(socket, '/tasks')
    const root = tasks(panel)
    expect(one<HTMLButtonElement>(root, '[data-action="save-settings"]').disabled).toBe(true)
    type(root, 'retention', '0')
    await settle(panel)
    expect(root.textContent).toContain('Must be at least 1')
    type(root, 'retention', '30')
    await settle(panel)
    click(root, '[data-action="save-settings"]')
    await settle(panel)
    expect(socket.of('housetide/settings/update')).toEqual([
      { type: 'housetide/settings/update', settings: { history_retention_days: 30 } },
    ])
  })

  test('retention has an upper limit', async () => {
    const panel = await mount(socketWith(payload([])), '/tasks')
    const root = tasks(panel)
    type(root, 'retention', '800000')
    await settle(panel)
    expect(root.textContent).toContain('Must be at most 36500')
    expect(one<HTMLButtonElement>(root, '[data-action="save-settings"]').disabled).toBe(true)
  })
})

describe('non admins', () => {
  const state = payload([view('due', { task_id: 'a' })], [task('a')])

  test('see read-only with no template calls', async () => {
    const socket = socketWith(state)
    const panel = await mount(socket, '/tasks', { admin: false })
    const root = tasks(panel)
    one(root, '[data-part="read-only"]')
    expect(root.querySelector('[data-template]')).toBeNull()
    expect(socket.of('housetide/templates')).toHaveLength(0)
    expect(root.querySelector('[data-action="save-settings"]')).toBeNull()
    expect(one<HTMLInputElement>(root, '[data-field="retention"]').disabled).toBe(true)
  })

  test('open the editor read-only', async () => {
    const socket = socketWith(state)
    const panel = await mount(socket, '/tasks', { admin: false })
    click(tasks(panel), '[data-task="a"]')
    await settle(panel)
    const form = editor(panel)
    expect(one<HTMLInputElement>(form, '[data-field="title"]').disabled).toBe(true)
    expect(form.querySelector('[data-action="save"]')).toBeNull()
    expect(form.querySelector('[data-action="delete"]')).toBeNull()
    expect(form.querySelector('[data-action="add-stage"]')).toBeNull()
    click(form, '[data-action="cancel"]')
    await settle(panel)
    expect(tasks(panel).querySelector('housetide-editor')).toBeNull()
  })

  test('can still advance from today', async () => {
    const socket = socketWith(state)
    const panel = await mount(socket, '/today', { admin: false })
    click(today(panel), '[data-action="advance"]')
    await settle(panel)
    expect(socket.of('housetide/advance')).toHaveLength(1)
  })
})

describe('editor payloads', () => {
  test('laundry chain with power sensors', async () => {
    const { socket, panel, form } = await openTemplate('laundry')
    type(form, 'stages.0.entity', 'sensor.washer_power')
    type(form, 'stages.1.entity', 'sensor.washer_power')
    await settle(panel)
    await save(panel, form)
    const draft = created(socket)
    expect(draft.scene).toBe('laundry')
    expect(draft.schedule).toEqual({
      type: 'interval',
      every_days: 7,
      time: '10:00',
      anchor: 'completion',
    })
    expect('id' in draft).toBe(false)
    const [load, wash, hang] = draft.stages as [Stage, Stage, Stage]
    expect(load.complete_when).toEqual({
      entity_id: 'sensor.washer_power',
      above: 10,
      below: null,
      state: null,
      for_seconds: 60,
    })
    expect(wash.complete_when?.below).toBe(5)
    expect(wash.complete_when?.for_seconds).toBe(300)
    expect(wash.role).toBe('running')
    expect(hang.complete_when).toBeNull()
    expect(hang.stale_after_minutes).toBe(180)
    expect(hang.role).toBe('waiting')
    expect(tasks(panel).querySelector('housetide-editor')).toBeNull()
  })

  test('an unconfigured sensor blocks saving with a message', async () => {
    const { socket, panel, form } = await openTemplate('laundry')
    await save(panel, form)
    expect(socket.of('housetide/task/create')).toHaveLength(0)
    expect(form.textContent).toContain('Pick an entity')
    expect(form.textContent).toContain('Some fields need attention.')
  })

  test('switching a stage to by hand removes the rule', async () => {
    const { socket, panel, form } = await openTemplate('laundry')
    toggle(form, 'stages.0.auto', false)
    toggle(form, 'stages.1.auto', false)
    await settle(panel)
    await save(panel, form)
    expect(created(socket).stages.map((stage) => stage.complete_when)).toEqual([null, null, null])
  })

  test('once', async () => {
    const { socket, panel, form } = await openTemplate('one_off')
    type(form, 'due', '2026-12-24T18:30')
    await settle(panel)
    await save(panel, form)
    expect(created(socket).schedule).toEqual({
      type: 'once',
      due: '2026-12-24T18:30:00+02:00',
    })
  })

  test('daily', async () => {
    const { socket, panel, form } = await openTemplate('one_off')
    click(form, '[data-schedule="daily"]')
    await settle(panel)
    type(form, 'time', '07:45')
    await settle(panel)
    await save(panel, form)
    expect(created(socket).schedule).toEqual({ type: 'daily', time: '07:45' })
  })

  test('weekly', async () => {
    const { socket, panel, form } = await openTemplate('one_off')
    click(form, '[data-schedule="weekly"]')
    await settle(panel)
    for (const day of form.querySelectorAll<HTMLElement>('[data-weekday][aria-pressed="true"]')) {
      day.click()
    }
    await settle(panel)
    await save(panel, form)
    expect(form.textContent).toContain('Pick at least one day')
    click(form, '[data-weekday="4"]')
    await settle(panel)
    click(form, '[data-weekday="0"]')
    await settle(panel)
    await save(panel, form)
    expect(created(socket).schedule).toEqual({ type: 'weekly', weekdays: [0, 4], time: '09:00' })
  })

  test('interval', async () => {
    const { socket, panel, form } = await openTemplate('one_off')
    click(form, '[data-schedule="interval"]')
    await settle(panel)
    type(form, 'every_days', '3')
    choose(form, 'anchor', 'schedule')
    await settle(panel)
    await save(panel, form)
    expect(created(socket).schedule).toEqual({
      type: 'interval',
      every_days: 3,
      time: '09:00',
      anchor: 'schedule',
    })
  })

  test('every top level field reaches the payload', async () => {
    const { socket, panel, form } = await openTemplate('one_off')
    type(form, 'title', '  Bins  ')
    type(form, 'icon', 'mdi:trash-can')
    type(form, 'notes', 'green one')
    type(form, 'assignee', 'person.me')
    type(form, 'clean_for', '60')
    type(form, 'grace', '2')
    choose(form, 'on_missed', 'skip')
    click(form, '[data-scene="plant"]')
    const color = one<HTMLInputElement>(form, '[data-field="color"]')
    color.value = '#123456'
    color.dispatchEvent(new Event('input'))
    toggle(form, 'enabled', false)
    type(form, 'stages.0.action', 'Dragged out')
    type(form, 'stages.0.stale', '15')
    choose(form, 'stages.0.role', 'waiting')
    await settle(panel)
    await save(panel, form)
    expect(created(socket)).toMatchObject({
      title: 'Bins',
      icon: 'mdi:trash-can',
      color: '#123456',
      notes: 'green one',
      assignee: 'person.me',
      enabled: false,
      on_missed: 'skip',
      scene: 'plant',
      clean_for_minutes: 60,
      grace_hours: 2,
      stages: [{ action: 'Dragged out', stale_after_minutes: 15, role: 'waiting' }],
    })
  })

  test('adding, removing and reordering stages', async () => {
    const { socket, panel, form } = await openTemplate('one_off')
    expect(one<HTMLButtonElement>(form, '[data-action="remove-stage"]').disabled).toBe(true)
    click(form, '[data-action="add-stage"]')
    await settle(panel)
    type(form, 'stages.1.title', 'Second')
    await settle(panel)
    click(form, '[data-stage="1"] [aria-label="Move up"]')
    await settle(panel)
    await save(panel, form)
    const draft = created(socket)
    expect(draft.stages.map((stage) => stage.title)).toEqual(['Second', 'Do it'])
    expect(new Set(draft.stages.map((stage) => stage.id)).size).toBe(2)
  })

  test('backend errors are shown and keep the form open', async () => {
    const { socket, panel, form } = await openTemplate('one_off')
    socket.replies.set('housetide/task/create', () => {
      throw new Error('schedule.due: bad')
    })
    await save(panel, form)
    expect(form.textContent).toContain('schedule.due: bad')
    expect(tasks(panel).querySelector('housetide-editor')).not.toBeNull()
  })

  test('editing updates with the id, deleting asks first', async () => {
    const socket = socketWith(payload([view('due', { task_id: 'a' })], [task('a')]))
    const panel = await mount(socket, '/tasks')
    click(tasks(panel), '[data-task="a"]')
    await settle(panel)
    let form = editor(panel)
    type(form, 'title', 'Renamed')
    await settle(panel)
    await save(panel, form)
    expect(socket.of('housetide/task/update')[0]?.task).toMatchObject({ id: 'a', title: 'Renamed' })

    click(tasks(panel), '[data-task="a"]')
    await settle(panel)
    form = editor(panel)
    click(form, '[data-action="delete"]')
    await settle(panel)
    expect(socket.of('housetide/task/delete')).toHaveLength(0)
    expect(form.textContent).toContain('History is kept')
    click(form, '[data-action="confirm-delete"]')
    await settle(panel)
    expect(socket.of('housetide/task/delete')).toEqual([
      { type: 'housetide/task/delete', task_id: 'a' },
    ])
  })
})

describe('trigger builder', () => {
  test('suggests from hass.states and fills on tap', async () => {
    const { panel, form } = await openTemplate('laundry')
    const input = one<HTMLInputElement>(form, '[data-field="stages.0.entity"]')
    input.dispatchEvent(new Event('focus'))
    await settle(panel)
    const first = one(form, '.suggestion')
    expect(first.dataset.entity).toBe('sensor.washer_power')
    expect(first.textContent).toContain('Washer power')
    first.click()
    await settle(panel)
    expect(form.querySelector('.suggestion')).toBeNull()
    expect(one<HTMLInputElement>(form, '[data-field="stages.0.entity"]').value).toBe(
      'sensor.washer_power',
    )
  })

  test('filters as you type and says when nothing matches', async () => {
    const { panel, form } = await openTemplate('laundry')
    one<HTMLInputElement>(form, '[data-field="stages.0.entity"]').dispatchEvent(new Event('focus'))
    await settle(panel)
    type(form, 'stages.0.entity', 'zzz')
    await settle(panel)
    expect(one(form, '.no-match').textContent).toContain('No matching')
  })

  test('shows the live value and updates with hass', async () => {
    const { panel, form } = await openTemplate('laundry')
    type(form, 'stages.0.entity', 'sensor.washer_power')
    await settle(panel)
    const live = (): string => one(form, '[data-stage="0"] [data-part="live"]').textContent ?? ''
    expect(live()).toContain('3.2 W')
    expect(live()).toContain('Not true right now')
    const sentence = one(form, '[data-stage="0"] [data-part="sentence"]').textContent
    expect(sentence).toContain('Washer power goes above 10 W')
    panel.hass = {
      ...panel.hass!,
      states: {
        ...STATES,
        'sensor.washer_power': entity('sensor.washer_power', '420', {
          unit_of_measurement: 'W',
        }),
      },
    }
    await settle(panel)
    await settle(tasks(panel).host as HousetidePanel)
    await settle(panel)
    expect(live()).toContain('420 W')
    expect(live()).toContain('True right now')
  })

  test('flags an entity that does not exist', async () => {
    const { panel, form } = await openTemplate('laundry')
    type(form, 'stages.0.entity', 'sensor.ghost')
    await settle(panel)
    expect(one(form, '[data-match="missing"]').textContent).toContain('does not exist')
  })

  test('inherited object names are not entities', async () => {
    const { panel, form } = await openTemplate('laundry')
    type(form, 'stages.0.entity', 'constructor')
    await settle(panel)
    expect(one(form, '[data-match="missing"]').textContent).toContain('does not exist')
  })

  test('by hand shows no entity field', async () => {
    const { panel, form } = await openTemplate('laundry')
    expect(form.querySelector('[data-field="stages.2.entity"]')).toBeNull()
    toggle(form, 'stages.2.auto', true)
    await settle(panel)
    one(form, '[data-field="stages.2.entity"]')
    choose(form, 'stages.2.condition', 'state')
    await settle(panel)
    expect(one<HTMLSelectElement>(form, '[data-field="stages.2.condition"]').value).toBe('state')
  })
})

describe('history', () => {
  async function openHistory(
    events = [
      historyEvent('e1'),
      historyEvent('e2', { type: 'missed', on_time: null, stage_title: null }),
    ],
    extra?: (socket: FakeSocket) => void,
  ) {
    const socket = socketWith(payload([], [task('t1', { title: 'Laundry' })]))
    socket.replies.set('housetide/history', { events })
    extra?.(socket)
    const panel = await mount(socket, '/history')
    return { socket, panel, root: history(panel) }
  }

  test('requests 90 days and shows the numbers', async () => {
    const { socket, root } = await openHistory()
    expect(socket.of('housetide/stats')[0]).toEqual({ type: 'housetide/stats', days: 90 })
    expect(one(root, '[data-stat="current"]').textContent).toContain('4')
    expect(one(root, '[data-stat="best"]').textContent).toContain('9')
    expect(one(root, '[data-stat="on-time"]').textContent).toContain('75')
  })

  test('on-time without data is a dash', async () => {
    const { root } = await openHistory([], (socket) => {
      socket.replies.set('housetide/stats', stats({ on_time_rate: null }))
    })
    expect(one(root, '[data-stat="on-time"] b').textContent).toBe('—')
  })

  test('draws a timeline', async () => {
    const { root } = await openHistory()
    const first = one(root, '[data-event="e1"]')
    expect(first.textContent).toContain('Laundry')
    expect(first.textContent).toContain('Completed · Hang it up')
    expect(first.textContent).toContain('By hand')
    expect(first.textContent).toContain('10:00')
    expect(first.textContent).toContain('On time')
    expect(one(root, '[data-event="e2"]').textContent).toContain('Missed')
  })

  test('filter refetches both', async () => {
    const { socket, panel, root } = await openHistory()
    choose(root, 'filter', 't1')
    await settle(panel)
    await settle(root.host as HousetidePanel)
    expect(socket.of('housetide/history').at(-1)).toMatchObject({ task_id: 't1' })
    expect(socket.of('housetide/stats').at(-1)).toMatchObject({ task_id: 't1', days: 90 })
  })

  test('grid has 90 tappable days', async () => {
    const { panel, root } = await openHistory()
    expect(root.querySelectorAll('[data-day]')).toHaveLength(90)
    const last = stats().per_day.at(-1)
    click(root, `[data-day="${last?.date}"]`)
    await settle(root.host as HousetidePanel)
    await settle(panel)
    expect(one(root, '[data-part="caption"]').textContent).toContain('2 done')
    expect(one(root, `[data-day="${last?.date}"]`).getAttribute('aria-pressed')).toBe('true')
  })

  test('colours success and trouble', async () => {
    const { root } = await openHistory()
    const days = stats().per_day
    expect(one(root, `[data-day="${days.at(-1)?.date}"]`).classList.contains('l2')).toBe(true)
    expect(one(root, `[data-day="${days.at(-2)?.date}"]`).classList.contains('bad')).toBe(true)
  })

  test('empty and failure', async () => {
    const empty = await openHistory([])
    expect(one(empty.root, '[data-part="empty"]').textContent).toContain('Nothing has happened')
    const failed = await openHistory([], (socket) => {
      socket.replies.set('housetide/history', () => {
        throw new Error('boom')
      })
    })
    expect(one(failed.root, '[role="alert"]').textContent).toContain('boom')
  })

  test('load more pages from the last event', async () => {
    const page = Array.from({ length: 40 }, (_, index) =>
      historyEvent(`e${index}`, {
        ts: new Date(Date.UTC(2026, 10, 4, 8) - index * 60_000).toISOString(),
      }),
    )
    const { socket, panel, root } = await openHistory(page)
    socket.replies.set('housetide/history', {
      events: [historyEvent('older', { ts: '2026-10-01T08:00:00Z' })],
    })
    click(root, '[data-action="more"]')
    await settle(root.host as HousetidePanel)
    await settle(panel)
    expect(socket.of('housetide/history').at(-1)).toMatchObject({
      before: page.at(-1)?.ts,
      limit: 40,
    })
    one(root, '[data-event="older"]')
    expect(root.querySelector('[data-action="more"]')).toBeNull()
  })

  test('a change refreshes the numbers without losing pages', async () => {
    const { socket, panel, root } = await openHistory()
    const before = socket.of('housetide/stats').length
    socket.replies.set('housetide/history', {
      events: [historyEvent('new', { ts: '2026-11-04T09:30:00Z' })],
    })
    socket.push(payload([view('clean', { task_id: 't1', can_undo: true })], [task('t1')]))
    await settle(panel)
    await settle(root.host as HousetidePanel)
    await settle(panel)
    expect(socket.of('housetide/stats').length).toBe(before + 1)
    one(root, '[data-event="new"]')
    one(root, '[data-event="e1"]')
  })

  test('a new occurrence with the same stage refreshes', async () => {
    const { socket, panel } = await openHistory()
    const occurrence = (due_at: string) =>
      payload([view('upcoming', { task_id: 't1', can_undo: true, due_at })], [task('t1')])
    socket.push(occurrence('2026-11-05T08:00:00Z'))
    await settle(panel)
    const before = socket.of('housetide/stats').length
    socket.push(occurrence('2026-11-06T08:00:00Z'))
    await settle(panel)
    expect(socket.of('housetide/stats').length).toBe(before + 1)
  })

  function gated(socket: FakeSocket, filtered: HistoryEvent[]): () => void {
    let release = (): void => undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    socket.replies.set('housetide/history', async (message: HassMessage) => {
      if (message.task_id === 't1') await gate
      return { events: message.task_id === 't1' ? filtered : [historyEvent('all-new')] }
    })
    return release
  }

  test('a push during a filter change does not mix lists', async () => {
    const { socket, panel, root } = await openHistory([historyEvent('all-1')])
    const release = gated(socket, [historyEvent('only-t1')])
    choose(root, 'filter', 't1')
    await settle(root.host as HousetidePanel)
    socket.push(payload([view('due', { task_id: 'x', can_undo: true })], [task('t1')]))
    await settle(panel)
    await settle(root.host as HousetidePanel)
    release()
    await settle(root.host as HousetidePanel)
    await settle(root.host as HousetidePanel)
    expect(root.querySelector('[data-event="all-1"]')).toBeNull()
    expect(root.querySelector('[data-event="all-new"]')).toBeNull()
    one(root, '[data-event="only-t1"]')
    expect(socket.of('housetide/history').at(-1)).toMatchObject({ task_id: 't1' })
  })

  test('load more cannot strand a filter change', async () => {
    const page = Array.from({ length: 40 }, (_, index) =>
      historyEvent(`e${index}`, {
        ts: new Date(Date.UTC(2026, 10, 4, 8) - index * 60_000).toISOString(),
      }),
    )
    const { socket, root } = await openHistory(page)
    const release = gated(socket, [historyEvent('only-t1')])
    const more = one(root, '[data-action="more"]')
    choose(root, 'filter', 't1')
    await settle(root.host as HousetidePanel)
    more.click()
    await settle(root.host as HousetidePanel)
    release()
    await settle(root.host as HousetidePanel)
    expect(root.querySelectorAll('.event')).toHaveLength(1)
    one(root, '[data-event="only-t1"]')
    expect((root.host as HousetideHistory).loading).toBe(false)
  })

  test('a tick with no change does not refetch', async () => {
    const { socket, panel } = await openHistory()
    const before = socket.of('housetide/stats').length
    socket.push(payload([], [task('t1', { title: 'Laundry' })]))
    await settle(panel)
    expect(socket.of('housetide/stats').length).toBe(before)
  })
})

describe('hidden pages', () => {
  test('today stops animating and resumes', async () => {
    const panel = await mount(socketWith(payload([view('due')])))
    const animated = (): boolean => today(panel).querySelector('.ht-animated') !== null
    expect(animated()).toBe(true)
    Object.defineProperty(document, 'hidden', { configurable: true, value: true })
    document.dispatchEvent(new Event('visibilitychange'))
    await settle(panel)
    await settle(today(panel).host as HousetidePanel)
    expect(animated()).toBe(false)
    Object.defineProperty(document, 'hidden', { configurable: true, value: false })
    document.dispatchEvent(new Event('visibilitychange'))
    await settle(panel)
    await settle(today(panel).host as HousetidePanel)
    expect(animated()).toBe(true)
  })
})
