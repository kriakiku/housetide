import type { ReactiveController, ReactiveControllerHost } from 'lit'

import { advanceTask, skipTask, subscribeState, undoTask } from '../api.ts'
import { i18nFromHass } from '../i18n.ts'
import type { I18n } from '../i18n.ts'
import type {
  HassConnection,
  HomeAssistant,
  StatePayload,
  TaskView,
  Unsubscribe,
} from '../types.ts'
import { browserZone } from './model.ts'

export const TICK_MS = 30_000
export const UNDO_WINDOW_MS = 12_000
export const COOLDOWN_MS = 700
export const CELEBRATE_MS = 900
export const ERROR_MS = 6000
export const ARM_MS = 4000

export function hassChanged(next?: HomeAssistant, prev?: HomeAssistant): boolean {
  if (!next || !prev) return next !== prev
  return (
    next.connection !== prev.connection ||
    next.connected !== prev.connected ||
    next.language !== prev.language ||
    next.locale !== prev.locale ||
    next.config?.time_zone !== prev.config?.time_zone ||
    next.user?.is_admin !== prev.user?.is_admin
  )
}

export function isHass(value: unknown): value is HomeAssistant {
  return typeof value === 'object' && value !== null && 'connection' in value && 'states' in value
}

let memo: { key: string; i18n: I18n } | undefined

export function localeOf(hass: HomeAssistant): I18n {
  const key = [
    hass.locale?.language ?? hass.language,
    hass.locale?.time_format,
    hass.config?.time_zone,
  ].join('|')
  if (memo?.key !== key) memo = { key, i18n: i18nFromHass(hass) }
  return memo.i18n
}

export function zoneOf(hass: HomeAssistant): string {
  return hass.config?.time_zone ?? browserZone()
}

export function isOffline(hass: HomeAssistant | undefined): boolean {
  return hass?.connected === false
}

export function pageHidden(): boolean {
  return document.hidden
}

export class StateController implements ReactiveController {
  state: StatePayload | null = null
  failed = false
  now = new Date()

  private readonly host: ReactiveControllerHost
  private readonly hass: () => HomeAssistant | undefined
  private connected = false
  private connection: HassConnection | undefined
  private unsubscribe: Unsubscribe | undefined
  private generation = 0
  private timer: ReturnType<typeof setInterval> | undefined
  private clockOffset = 0

  constructor(host: ReactiveControllerHost, hass: () => HomeAssistant | undefined) {
    this.host = host
    this.hass = hass
    host.addController(this)
  }

  hostConnected(): void {
    this.connected = true
    this.timer = setInterval(this.tick, TICK_MS)
    document.addEventListener('visibilitychange', this.onVisibility)
    this.sync()
  }

  hostDisconnected(): void {
    this.connected = false
    clearInterval(this.timer)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.stop()
  }

  sync(): void {
    const hass = this.hass()
    if (!this.connected || !hass || hass.connection === this.connection) return
    this.stop()
    this.connection = hass.connection
    void this.start(hass)
  }

  retry(): void {
    this.stop()
    this.failed = false
    this.host.requestUpdate()
    this.sync()
  }

  private async start(hass: HomeAssistant): Promise<void> {
    this.generation += 1
    const { generation } = this
    try {
      const unsubscribe = await subscribeState(hass, (state) => {
        if (generation === this.generation) this.receive(state)
      })
      if (generation === this.generation) this.unsubscribe = unsubscribe
      else await unsubscribe()
    } catch {
      if (generation !== this.generation) return
      this.connection = undefined
      this.failed = true
      this.host.requestUpdate()
    }
  }

  private stop(): void {
    this.generation += 1
    this.connection = undefined
    const { unsubscribe } = this
    this.unsubscribe = undefined
    if (!unsubscribe) return
    void Promise.resolve()
      .then(() => unsubscribe())
      .catch(() => undefined)
  }

  private receive(state: StatePayload): void {
    this.state = state
    this.failed = false
    const server = Date.parse(state.now)
    this.clockOffset = Number.isNaN(server) ? 0 : server - Date.now()
    this.refreshClock()
    this.host.requestUpdate()
  }

  private refreshClock(): void {
    this.now = new Date(Date.now() + this.clockOffset)
  }

  private readonly tick = (): void => {
    this.refreshClock()
    if (this.failed) this.sync()
    this.host.requestUpdate()
  }

  private readonly onVisibility = (): void => {
    if (!document.hidden) this.refreshClock()
    this.host.requestUpdate()
  }
}

export type OrderKey = readonly [number, number, string]

const RANK: Record<TaskView['status'], number> = {
  overdue: 0,
  due: 0,
  in_progress: 0,
  upcoming: 1,
  clean: 2,
  done: 3,
  disabled: 4,
}

export function orderKey(view: TaskView): OrderKey {
  const due = Date.parse(view.due_at ?? view.next_due_at ?? '')
  return [RANK[view.status], Number.isNaN(due) ? Number.MAX_SAFE_INTEGER : due, view.title]
}

export function compareKeys(a: OrderKey, b: OrderKey): number {
  return a[0] - b[0] || a[1] - b[1] || a[2].localeCompare(b[2])
}

export function isEarly(view: TaskView): boolean {
  if (view.anytime && view.is_today) return false
  return view.status === 'upcoming' || view.status === 'clean'
}

interface RecentAction {
  completed: boolean
  until: number
  coolUntil: number
  key: OrderKey
}

export class ActionTracker implements ReactiveController {
  private readonly host: ReactiveControllerHost
  private readonly hass: () => HomeAssistant | undefined
  private readonly pending = new Set<string>()
  private readonly recent = new Map<string, RecentAction>()
  private readonly errors = new Map<string, string>()
  private readonly celebrating = new Map<string, 'stage' | 'done'>()
  private readonly armed = new Map<string, { readyAt: number }>()
  private readonly timers = new Set<ReturnType<typeof setTimeout>>()

  constructor(host: ReactiveControllerHost, hass: () => HomeAssistant | undefined) {
    this.host = host
    this.hass = hass
    host.addController(this)
  }

  hostDisconnected(): void {
    for (const timer of this.timers) clearTimeout(timer)
    this.timers.clear()
    this.recent.clear()
    this.celebrating.clear()
    this.errors.clear()
    this.armed.clear()
  }

  isPending(id: string): boolean {
    return this.pending.has(id)
  }

  error(id: string): string | undefined {
    return this.errors.get(id)
  }

  celebration(id: string): 'stage' | 'done' | undefined {
    return this.celebrating.get(id)
  }

  isRecent(id: string): boolean {
    return this.recent.has(id)
  }

  justCompleted(id: string): boolean {
    return this.recent.get(id)?.completed ?? false
  }

  frozenKey(id: string): OrderKey | undefined {
    return this.recent.get(id)?.key
  }

  isArmed(id: string): boolean {
    return this.armed.has(id)
  }

  async press(view: TaskView): Promise<void> {
    if (!isEarly(view)) {
      await this.advance(view)
      return
    }
    const id = view.task_id
    const armed = this.armed.get(id)
    if (!armed) {
      const entry = { readyAt: Date.now() + COOLDOWN_MS }
      this.armed.set(id, entry)
      this.later(ARM_MS, () => {
        if (this.armed.get(id) === entry) this.armed.delete(id)
      })
      this.host.requestUpdate()
      return
    }
    if (armed.readyAt > Date.now()) return
    this.armed.delete(id)
    await this.advance(view)
  }

  async advance(view: TaskView): Promise<void> {
    const id = view.task_id
    const previous = this.recent.get(id)
    if (this.pending.has(id) || (previous && previous.coolUntil > Date.now())) return
    const completed = view.stage_index + 1 >= view.stage_count
    this.celebrate(id, completed ? 'done' : 'stage')
    const ok = await this.track(view, completed, (hass) => advanceTask(hass, id))
    if (!ok) this.celebrating.delete(id)
    this.host.requestUpdate()
  }

  async skip(view: TaskView): Promise<void> {
    const id = view.task_id
    await this.track(view, false, (hass) => skipTask(hass, id))
    this.host.requestUpdate()
  }

  async undo(view: TaskView): Promise<void> {
    const id = view.task_id
    const ok = await this.run(id, (hass) => undoTask(hass, id))
    if (ok) this.recent.delete(id)
    this.host.requestUpdate()
  }

  private async track(
    view: TaskView,
    completed: boolean,
    action: (hass: HomeAssistant) => Promise<unknown>,
  ): Promise<boolean> {
    const id = view.task_id
    if (!this.hass() || this.pending.has(id)) return false
    const previous = this.recent.get(id)
    const entry = this.remember(view, completed)
    const ok = await this.run(id, action)
    if (ok) {
      window.dispatchEvent(new CustomEvent('haptic', { detail: completed ? 'success' : 'light' }))
    } else if (this.recent.get(id) === entry) {
      if (previous) this.recent.set(id, previous)
      else this.recent.delete(id)
    }
    return ok
  }

  private remember(view: TaskView, completed: boolean): RecentAction {
    const id = view.task_id
    const now = Date.now()
    const entry: RecentAction = {
      completed,
      until: now + UNDO_WINDOW_MS,
      coolUntil: now + COOLDOWN_MS,
      key: this.recent.get(id)?.key ?? orderKey(view),
    }
    this.recent.set(id, entry)
    this.later(UNDO_WINDOW_MS, () => {
      if (this.recent.get(id) === entry) this.recent.delete(id)
    })
    return entry
  }

  private celebrate(id: string, kind: 'stage' | 'done'): void {
    this.celebrating.set(id, kind)
    this.later(CELEBRATE_MS, () => {
      this.celebrating.delete(id)
    })
  }

  private later(delay: number, action: () => void): void {
    const timer = setTimeout(() => {
      this.timers.delete(timer)
      action()
      this.host.requestUpdate()
    }, delay)
    this.timers.add(timer)
  }

  private async run(
    id: string,
    action: (hass: HomeAssistant) => Promise<unknown>,
  ): Promise<boolean> {
    const hass = this.hass()
    if (!hass || this.pending.has(id)) return false
    this.pending.add(id)
    this.errors.delete(id)
    this.host.requestUpdate()
    try {
      await action(hass)
      return true
    } catch (error) {
      this.errors.set(id, errorMessage(error))
      this.later(ERROR_MS, () => {
        this.errors.delete(id)
      })
      return false
    } finally {
      this.pending.delete(id)
    }
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message)
  }
  return String(error)
}
