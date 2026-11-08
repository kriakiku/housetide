import type {
  HassMessage,
  HistoryEvent,
  HomeAssistant,
  Settings,
  StatePayload,
  Stats,
  Task,
  TaskDraft,
  Unsubscribe,
} from './types.ts'

const domain = 'housetide'

type WsHost = Pick<HomeAssistant, 'callWS'>
type SubscribeHost = Pick<HomeAssistant, 'connection'>

export interface HistoryQuery {
  task_id?: string
  limit?: number
  before?: string
}

export interface StatsQuery {
  task_id?: string
  days?: number
}

function message(command: string, payload: object = {}): HassMessage {
  const defined = Object.entries(payload).filter(([, value]) => value !== undefined)
  return { type: `${domain}/${command}`, ...Object.fromEntries(defined) }
}

export function fetchState(hass: WsHost): Promise<StatePayload> {
  return hass.callWS<StatePayload>(message('state'))
}

export function subscribeState(
  hass: SubscribeHost,
  callback: (state: StatePayload) => void,
): Promise<Unsubscribe> {
  return hass.connection.subscribeMessage<StatePayload>(callback, message('subscribe'))
}

export function advanceTask(hass: WsHost, taskId: string): Promise<unknown> {
  return hass.callWS(message('advance', { task_id: taskId }))
}

export function skipTask(hass: WsHost, taskId: string): Promise<unknown> {
  return hass.callWS(message('skip', { task_id: taskId }))
}

export function undoTask(hass: WsHost, taskId: string): Promise<unknown> {
  return hass.callWS(message('undo', { task_id: taskId }))
}

export async function fetchHistory(
  hass: WsHost,
  query: HistoryQuery = {},
): Promise<HistoryEvent[]> {
  const result = await hass.callWS<HistoryEvent[] | { events: HistoryEvent[] }>(
    message('history', query),
  )
  return Array.isArray(result) ? result : result.events
}

export function fetchStats(hass: WsHost, query: StatsQuery = {}): Promise<Stats> {
  return hass.callWS<Stats>(message('stats', query))
}

type TemplateMap = Record<string, TaskDraft>

function isWrappedTemplates(value: object): value is { templates: TemplateMap } {
  return 'templates' in value
}

export async function fetchTemplates(hass: WsHost): Promise<TemplateMap> {
  const result = await hass.callWS<TemplateMap | { templates: TemplateMap }>(message('templates'))
  return isWrappedTemplates(result) ? result.templates : result
}

export function createTask(hass: WsHost, task: TaskDraft): Promise<unknown> {
  return hass.callWS(message('task/create', { task }))
}

export function updateTask(hass: WsHost, task: Task): Promise<unknown> {
  return hass.callWS(message('task/update', { task }))
}

export function deleteTask(hass: WsHost, taskId: string): Promise<unknown> {
  return hass.callWS(message('task/delete', { task_id: taskId }))
}

export function updateSettings(hass: WsHost, settings: Settings): Promise<unknown> {
  return hass.callWS(message('settings/update', { settings }))
}
