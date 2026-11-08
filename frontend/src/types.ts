export type SceneName = 'generic' | 'pills' | 'laundry' | 'plant'
export type SceneState = 'resting' | 'accumulating' | 'due' | 'running' | 'waiting' | 'clean'
export type PillSlot = 'taken' | 'missed' | 'current' | 'full'
export type OnMissed = 'carry' | 'skip'
export type StageRole = 'todo' | 'running' | 'waiting'
export type IntervalAnchor = 'completion' | 'schedule'
export type TaskStatus =
  | 'upcoming'
  | 'due'
  | 'overdue'
  | 'in_progress'
  | 'clean'
  | 'done'
  | 'disabled'
export type HistoryEventType =
  | 'started'
  | 'advanced'
  | 'completed'
  | 'skipped'
  | 'missed'
  | 'undone'
  | 'created'
  | 'deleted'
export type HistorySource = 'manual' | 'trigger' | 'service' | 'schedule' | 'todo'

export interface OnceSchedule {
  type: 'once'
  due: string
}

export interface DailySchedule {
  type: 'daily'
  time: string
}

export interface WeeklySchedule {
  type: 'weekly'
  weekdays: number[]
  time: string
}

export interface IntervalSchedule {
  type: 'interval'
  every_days: number
  time: string
  anchor: IntervalAnchor
}

export type Schedule = OnceSchedule | DailySchedule | WeeklySchedule | IntervalSchedule

export interface Trigger {
  entity_id: string
  above: number | null
  below: number | null
  state: string | null
  for_seconds: number
}

export interface Stage {
  id: string
  title: string
  action: string | null
  role: StageRole
  complete_when: Trigger | null
  stale_after_minutes: number | null
}

export interface Task {
  id: string
  title: string
  icon: string | null
  color: string | null
  notes: string | null
  assignee: string | null
  enabled: boolean
  schedule: Schedule
  on_missed: OnMissed
  scene: SceneName
  stages: Stage[]
  clean_for_minutes: number
  grace_hours: number
}

export type TaskDraft = Omit<Task, 'id'> & { id?: string }

export interface Pack {
  cycle: number
  taken: number[]
  missed: number[]
}

export interface Runtime {
  task_id: string
  occurrence_id: string
  due_at: string | null
  stage_index: number
  stage_entered_at: string | null
  started_at: string | null
  last_completed_at: string | null
  next_due_at: string | null
  clean_until: string | null
  pack: Pack | null
  undo: Runtime | null
}

export interface SceneView {
  name: SceneName
  state: SceneState
  fill: number
  stink: number
  progress: number
  slots?: PillSlot[]
}

export interface TaskView {
  task_id: string
  title: string
  icon: string | null
  color: string | null
  status: TaskStatus
  stage_index: number
  stage_count: number
  stage_id: string
  stage_title: string
  action: string | null
  role: StageRole
  due_at: string | null
  next_due_at: string | null
  started_at: string | null
  last_completed_at: string | null
  is_today: boolean
  overdue_seconds: number
  can_advance: boolean
  can_skip: boolean
  can_undo: boolean
  automated: boolean
  scene: SceneView
}

export interface HistoryEvent {
  id: string
  ts: string
  task_id: string
  task_title: string
  occurrence_id: string
  type: HistoryEventType
  stage_id: string | null
  stage_title: string | null
  source: HistorySource
  user_id: string | null
  on_time: boolean | null
}

export interface DayStats {
  date: string
  completed: number
  skipped: number
  missed: number
}

export interface Stats {
  current_streak: number
  best_streak: number
  completed: number
  skipped: number
  missed: number
  on_time_rate: number | null
  per_day: DayStats[]
}

export interface Settings {
  history_retention_days: number
}

export interface StatePayload {
  tasks: Task[]
  views: TaskView[]
  settings: Settings
  now: string
}

export interface HassEntityState {
  entity_id: string
  state: string
  attributes: Record<string, unknown>
}

export type HassMessage = Record<string, unknown> & { type: string }
export type Unsubscribe = () => void | Promise<void>

export interface HassConnection {
  // oxlint-disable-next-line typescript/no-unnecessary-type-parameters
  subscribeMessage<T>(callback: (message: T) => void, message: HassMessage): Promise<Unsubscribe>
}

export interface HassLocale {
  language: string
  time_format?: 'language' | 'system' | '12' | '24'
}

export interface HomeAssistant {
  connection: HassConnection
  callWS<T>(message: HassMessage): Promise<T>
  language?: string
  locale?: HassLocale
  config?: { time_zone?: string }
  states: Record<string, HassEntityState>
  connected?: boolean
  dockedSidebar?: string
  user?: { id: string; name?: string; is_admin: boolean }
}
