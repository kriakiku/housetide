import type {
  HassEntityState,
  HassMessage,
  HomeAssistant,
  HistoryEvent,
  Stats,
  StatePayload,
  Task,
  TaskStatus,
  TaskView,
  Unsubscribe,
} from './types.ts'

export class FakeSocket {
  sent: HassMessage[] = []
  replies = new Map<string, unknown>()
  listeners: Array<(payload: StatePayload) => void> = []
  subscribes = 0
  unsubscribes = 0
  initial: StatePayload | null = null
  subscribeError: Error | null = null
  gate: Promise<void> | null = null

  readonly connection = {
    // oxlint-disable-next-line typescript/no-unnecessary-type-parameters
    subscribeMessage: async <T>(
      callback: (message: T) => void,
      message: HassMessage,
    ): Promise<Unsubscribe> => {
      this.sent.push(message)
      this.subscribes += 1
      if (this.gate) await this.gate
      if (this.subscribeError) throw this.subscribeError
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      const listener = callback as unknown as (payload: StatePayload) => void
      this.listeners.push(listener)
      if (this.initial) listener(this.initial)
      return () => {
        this.unsubscribes += 1
        this.listeners = this.listeners.filter((item) => item !== listener)
      }
    },
  }

  async callWS<T>(message: HassMessage): Promise<T> {
    this.sent.push(message)
    const reply = this.replies.get(message.type)
    const value = typeof reply === 'function' ? await reply(message) : reply
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    return value as T
  }

  push(state: StatePayload): void {
    for (const listener of this.listeners) listener(state)
  }

  of(type: string): HassMessage[] {
    return this.sent.filter((message) => message.type === type)
  }
}

export interface FakeHassOptions {
  admin?: boolean
  language?: string
  states?: Record<string, HassEntityState>
  connected?: boolean
}

export function fakeHass(socket: FakeSocket, options: FakeHassOptions = {}): HomeAssistant {
  return {
    connection: socket.connection,
    callWS: async <T>(message: HassMessage) => socket.callWS<T>(message),
    language: options.language ?? 'en',
    locale: { language: options.language ?? 'en', time_format: '24' },
    config: { time_zone: 'Europe/Kyiv' },
    states: options.states ?? {},
    connected: options.connected ?? true,
    user: { id: 'u1', name: 'Me', is_admin: options.admin ?? true },
  }
}

export const NOW = '2026-11-04T10:00:00+00:00'

export function entity(
  entity_id: string,
  state: string,
  attributes: Record<string, unknown> = {},
): HassEntityState {
  return { entity_id, state, attributes }
}

export function view(status: TaskStatus, override: Partial<TaskView> = {}): TaskView {
  return {
    task_id: `task-${status}`,
    title: `Task ${status}`,
    icon: null,
    color: null,
    status,
    stage_index: 0,
    stage_count: 1,
    stage_id: 's',
    stage_title: 'Stage',
    action: 'Tap',
    role: 'todo',
    due_at: '2026-11-04T09:00:00+00:00',
    next_due_at: null,
    started_at: null,
    last_completed_at: null,
    is_today: true,
    overdue_seconds: 0,
    can_advance: status !== 'disabled' && status !== 'done',
    can_skip: status !== 'disabled' && status !== 'done',
    can_undo: false,
    automated: false,
    anytime: false,
    scene: { name: 'generic', state: 'due', fill: 0.5, stink: 0, progress: 0 },
    ...override,
  }
}

export function task(id: string, override: Partial<Task> = {}): Task {
  return {
    id,
    title: `Title ${id}`,
    icon: null,
    color: null,
    notes: null,
    assignee: null,
    enabled: true,
    schedule: { type: 'daily', time: '08:00' },
    on_missed: 'skip',
    scene: 'pills',
    stages: [
      {
        id: 'take',
        title: 'Take',
        action: null,
        role: 'todo',
        complete_when: null,
        stale_after_minutes: null,
      },
    ],
    clean_for_minutes: 720,
    grace_hours: 24,
    ...override,
  }
}

export function payload(views: TaskView[], tasks: Task[] = []): StatePayload {
  return { tasks, views, settings: { history_retention_days: 365 }, now: NOW }
}

export function historyEvent(id: string, override: Partial<HistoryEvent> = {}): HistoryEvent {
  return {
    id,
    ts: '2026-11-04T08:00:00+00:00',
    task_id: 't1',
    task_title: 'Laundry',
    occurrence_id: 'o1',
    type: 'completed',
    stage_id: 'hang',
    stage_title: 'Hang it up',
    source: 'manual',
    user_id: 'u1',
    on_time: true,
    ...override,
  }
}

export function stats(override: Partial<Stats> = {}): Stats {
  const start = Date.UTC(2026, 7, 7)
  const per_day = Array.from({ length: 90 }, (_, index) => ({
    date: new Date(start + index * 86_400_000).toISOString().slice(0, 10),
    completed: index === 89 ? 2 : 0,
    skipped: index === 88 ? 1 : 0,
    missed: 0,
  }))
  return {
    current_streak: 4,
    best_streak: 9,
    completed: 30,
    skipped: 2,
    missed: 1,
    on_time_rate: 0.75,
    per_day,
    ...override,
  }
}

export async function settle(element?: { updateComplete: Promise<unknown> }): Promise<void> {
  const round = async (): Promise<void> => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
    await element?.updateComplete
  }
  await round()
  await round()
  await round()
}
