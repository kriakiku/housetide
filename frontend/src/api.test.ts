import { describe, expect, mock, test } from 'bun:test'

import {
  advanceTask,
  createTask,
  deleteTask,
  fetchHistory,
  fetchState,
  fetchStats,
  fetchTemplates,
  skipTask,
  subscribeState,
  undoTask,
  updateSettings,
  updateTask,
} from './api.ts'
import type { HomeAssistant, StatePayload, Task, TaskDraft } from './types.ts'

const draft: TaskDraft = {
  title: 'T',
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
      id: 's',
      title: 'S',
      action: null,
      role: 'todo',
      complete_when: null,
      stale_after_minutes: null,
    },
  ],
  clean_for_minutes: 720,
  grace_hours: 24,
}

function fakeHass(reply: unknown = {}): {
  hass: Pick<HomeAssistant, 'callWS'>
  sent: Array<Record<string, unknown>>
} {
  const sent: Array<Record<string, unknown>> = []
  const callWS = async (message: Record<string, unknown>): Promise<never> => {
    sent.push(message)
    return reply as never
  }
  return { hass: { callWS }, sent }
}

describe('websocket calls', () => {
  test('commands carry the expected payloads', async () => {
    const { hass, sent } = fakeHass()
    const task: Task = { ...draft, id: 'a' }
    await fetchState(hass)
    await advanceTask(hass, 'a')
    await skipTask(hass, 'a')
    await undoTask(hass, 'a')
    await fetchStats(hass, { task_id: 'a', days: 30 })
    await createTask(hass, draft)
    await updateTask(hass, task)
    await deleteTask(hass, 'a')
    await updateSettings(hass, { history_retention_days: 30 })
    expect(sent).toEqual([
      { type: 'housetide/state' },
      { type: 'housetide/advance', task_id: 'a' },
      { type: 'housetide/skip', task_id: 'a' },
      { type: 'housetide/undo', task_id: 'a' },
      { type: 'housetide/stats', task_id: 'a', days: 30 },
      { type: 'housetide/task/create', task: draft },
      { type: 'housetide/task/update', task },
      { type: 'housetide/task/delete', task_id: 'a' },
      { type: 'housetide/settings/update', settings: { history_retention_days: 30 } },
    ])
  })

  test('history omits undefined filters and accepts both reply shapes', async () => {
    const wrapped = fakeHass({ events: [{ id: '1' }] })
    expect(await fetchHistory(wrapped.hass, { limit: 5, task_id: undefined })).toEqual([
      { id: '1' },
    ] as never)
    expect(wrapped.sent).toEqual([{ type: 'housetide/history', limit: 5 }])
    const bare = fakeHass([{ id: '2' }])
    expect(await fetchHistory(bare.hass)).toEqual([{ id: '2' }] as never)
  })

  test('templates accept both reply shapes', async () => {
    expect(await fetchTemplates(fakeHass({ laundry: draft }).hass)).toEqual({ laundry: draft })
    expect(await fetchTemplates(fakeHass({ templates: { pills: draft } }).hass)).toEqual({
      pills: draft,
    })
  })

  test('subscribes and hands back the unsubscribe', async () => {
    const unsubscribe = mock(() => undefined)
    const payload = { tasks: [], views: [], settings: { history_retention_days: 1 }, now: 'x' }
    const subscribeMessage = mock(
      async (callback: (message: StatePayload) => void, message: Record<string, unknown>) => {
        expect(message).toEqual({ type: 'housetide/subscribe' })
        callback(payload)
        return unsubscribe
      },
    )
    const received: StatePayload[] = []
    const stop = await subscribeState(
      { connection: { subscribeMessage: subscribeMessage as never } },
      (state) => {
        received.push(state)
      },
    )
    expect(received).toEqual([payload])
    await stop()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
