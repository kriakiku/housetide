import type { I18n, MessageKey } from '../i18n.ts'
import type {
  HassEntityState,
  IntervalAnchor,
  OnMissed,
  SceneName,
  Schedule,
  Stage,
  StageRole,
  TaskDraft,
  Trigger,
} from '../types.ts'

export type ScheduleType = Schedule['type']
export type Condition = 'none' | 'above' | 'below' | 'state'

export interface StageForm {
  id: string
  title: string
  action: string
  role: StageRole
  stale: string
  condition: Condition
  entity: string
  value: string
  hold: string
}

export interface TaskForm {
  id: string | null
  title: string
  icon: string
  color: string
  notes: string
  assignee: string
  enabled: boolean
  scene: SceneName
  on_missed: OnMissed
  clean_for: string
  grace: string
  schedule: ScheduleType
  due: string
  time: string
  weekdays: number[]
  every_days: string
  anchor: IntervalAnchor
  stages: StageForm[]
}

export interface FormError {
  key: MessageKey
  vars?: Record<string, string | number>
}

export type FormErrors = Record<string, FormError>

const ENTITY_RE = /^[a-z0-9_]+\.[a-z0-9_]+$/
const TIME_RE = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const WHOLE_RE = /^\d+$/
const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/
const DEAD_STATES = new Set(['unknown', 'unavailable'])

interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

export function browserZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

const zoneFormats = new Map<string, Intl.DateTimeFormat>()

function zoneFormat(timeZone: string): Intl.DateTimeFormat {
  const cached = zoneFormats.get(timeZone)
  if (cached) return cached
  const format = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  zoneFormats.set(timeZone, format)
  return format
}

function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = zoneFormat(timeZone).formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0)
  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour'),
    minute: pick('minute'),
    second: pick('second'),
  }
}

function offsetAt(utcMs: number, timeZone: string): number {
  const p = zonedParts(new Date(utcMs), timeZone)
  const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return wall - Math.floor(utcMs / 1000) * 1000
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function formatOffset(offsetMs: number): string {
  const minutes = Math.round(Math.abs(offsetMs) / 60_000)
  const sign = offsetMs < 0 ? '-' : '+'
  return `${sign}${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

export function localInputToIso(value: string, timeZone: string): string | null {
  const match = LOCAL_RE.exec(value)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  const wall = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute))
  if (Number.isNaN(wall)) return null
  const offset = offsetAt(wall - offsetAt(wall, timeZone), timeZone)
  return `${year}-${month}-${day}T${hour}:${minute}:00${formatOffset(offset)}`
}

export function isoToLocalInput(iso: string, timeZone: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const p = zonedParts(date, timeZone)
  return `${String(p.year).padStart(4, '0')}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`
}

export function weekdayIndex(date: Date, timeZone: string): number {
  const p = zonedParts(date, timeZone)
  return (new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() + 6) % 7
}

export function middayOf(date: string, timeZone: string): string {
  return localInputToIso(`${date}T12:00`, timeZone) ?? date
}

function tomorrowMorning(now: Date, timeZone: string): string {
  const p = zonedParts(now, timeZone)
  const next = new Date(Date.UTC(p.year, p.month - 1, p.day + 1))
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}T09:00`
}

function conditionOf(trigger: Trigger | null): Condition {
  if (!trigger) return 'none'
  if (trigger.above !== null) return 'above'
  if (trigger.below !== null) return 'below'
  return 'state'
}

function valueOf(trigger: Trigger | null): string {
  if (!trigger) return ''
  const value = trigger.above ?? trigger.below ?? trigger.state
  return value === null ? '' : String(value)
}

function stageForm(stage: Stage): StageForm {
  return {
    id: stage.id,
    title: stage.title,
    action: stage.action ?? '',
    role: stage.role,
    stale: stage.stale_after_minutes === null ? '' : String(stage.stale_after_minutes),
    condition: conditionOf(stage.complete_when),
    entity: stage.complete_when?.entity_id ?? '',
    value: valueOf(stage.complete_when),
    hold: stage.complete_when ? String(stage.complete_when.for_seconds) : '0',
  }
}

export function formFromDraft(draft: TaskDraft, timeZone: string, now: Date): TaskForm {
  const { schedule } = draft
  return {
    id: draft.id ?? null,
    title: draft.title,
    icon: draft.icon ?? '',
    color: draft.color ?? '',
    notes: draft.notes ?? '',
    assignee: draft.assignee ?? '',
    enabled: draft.enabled,
    scene: draft.scene,
    on_missed: draft.on_missed,
    clean_for: String(draft.clean_for_minutes),
    grace: String(draft.grace_hours),
    schedule: schedule.type,
    due:
      schedule.type === 'once'
        ? isoToLocalInput(schedule.due, timeZone)
        : tomorrowMorning(now, timeZone),
    time: schedule.type === 'once' ? '09:00' : schedule.time,
    weekdays: schedule.type === 'weekly' ? [...schedule.weekdays] : [weekdayIndex(now, timeZone)],
    every_days: schedule.type === 'interval' ? String(schedule.every_days) : '7',
    anchor: schedule.type === 'interval' ? schedule.anchor : 'completion',
    stages: draft.stages.map((stage) => stageForm(stage)),
  }
}

export function addStage(form: TaskForm): TaskForm {
  const used = new Set(form.stages.map((stage) => stage.id))
  let n = form.stages.length + 1
  while (used.has(`stage_${n}`)) n += 1
  const stage: StageForm = {
    id: `stage_${n}`,
    title: '',
    action: '',
    role: 'todo',
    stale: '',
    condition: 'none',
    entity: '',
    value: '',
    hold: '0',
  }
  return { ...form, stages: [...form.stages, stage] }
}

export function removeStage(form: TaskForm, index: number): TaskForm {
  if (form.stages.length <= 1) return form
  return { ...form, stages: form.stages.filter((_, i) => i !== index) }
}

export function moveStage(form: TaskForm, index: number, delta: number): TaskForm {
  const target = index + delta
  const moved = form.stages[index]
  if (!moved || target < 0 || target >= form.stages.length) return form
  const stages = form.stages.filter((_, i) => i !== index)
  stages.splice(target, 0, moved)
  return { ...form, stages }
}

function parseNumber(text: string): number | null {
  const trimmed = text.trim().replace(',', '.')
  if (trimmed === '') return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

function checkWhole(errors: FormErrors, path: string, text: string, min: number): void {
  const trimmed = text.trim()
  if (!WHOLE_RE.test(trimmed)) errors[path] = { key: 'error_whole' }
  else if (Number(trimmed) < min) errors[path] = { key: 'error_min', vars: { min } }
}

function validateStage(errors: FormErrors, stage: StageForm, index: number): void {
  const path = `stages.${index}`
  if (!stage.title.trim()) errors[`${path}.title`] = { key: 'error_required' }
  if (stage.stale.trim()) checkWhole(errors, `${path}.stale`, stage.stale, 1)
  if (stage.condition === 'none') return
  const entity = stage.entity.trim()
  if (!entity) errors[`${path}.entity`] = { key: 'error_entity' }
  else if (!ENTITY_RE.test(entity)) errors[`${path}.entity`] = { key: 'error_entity_format' }
  checkWhole(errors, `${path}.hold`, stage.hold, 0)
  if (stage.condition === 'state') {
    const state = stage.value.trim()
    if (!state) errors[`${path}.value`] = { key: 'error_required' }
    else if (DEAD_STATES.has(state)) errors[`${path}.value`] = { key: 'error_state' }
  } else if (parseNumber(stage.value) === null) {
    errors[`${path}.value`] = { key: 'error_number' }
  }
}

export function validateForm(form: TaskForm, timeZone: string): FormErrors {
  const errors: FormErrors = {}
  if (!form.title.trim()) errors.title = { key: 'error_required' }
  checkWhole(errors, 'clean_for', form.clean_for, 0)
  checkWhole(errors, 'grace', form.grace, 0)
  if (form.schedule === 'once') {
    if (!localInputToIso(form.due, timeZone)) errors.due = { key: 'error_datetime' }
  } else if (!TIME_RE.test(form.time)) {
    errors.time = { key: 'error_time' }
  }
  if (form.schedule === 'weekly' && form.weekdays.length === 0) {
    errors.weekdays = { key: 'error_weekdays' }
  }
  if (form.schedule === 'interval') checkWhole(errors, 'every_days', form.every_days, 1)
  form.stages.forEach((stage, index) => {
    validateStage(errors, stage, index)
  })
  return errors
}

function optional(text: string): string | null {
  const trimmed = text.trim()
  return trimmed === '' ? null : trimmed
}

function scheduleFromForm(form: TaskForm, timeZone: string): Schedule {
  switch (form.schedule) {
    case 'once':
      return { type: 'once', due: localInputToIso(form.due, timeZone) ?? form.due }
    case 'daily':
      return { type: 'daily', time: form.time }
    case 'weekly':
      return {
        type: 'weekly',
        weekdays: [...form.weekdays].toSorted((a, b) => a - b),
        time: form.time,
      }
    default:
      return {
        type: 'interval',
        every_days: Number(form.every_days.trim()),
        time: form.time,
        anchor: form.anchor,
      }
  }
}

function triggerFromForm(stage: StageForm): Trigger | null {
  if (stage.condition === 'none') return null
  const number = parseNumber(stage.value)
  return {
    entity_id: stage.entity.trim(),
    above: stage.condition === 'above' ? number : null,
    below: stage.condition === 'below' ? number : null,
    state: stage.condition === 'state' ? stage.value.trim() : null,
    for_seconds: Number(stage.hold.trim()),
  }
}

function stageFromForm(stage: StageForm): Stage {
  const stale = optional(stage.stale)
  return {
    id: stage.id,
    title: stage.title.trim(),
    action: optional(stage.action),
    role: stage.role,
    complete_when: triggerFromForm(stage),
    stale_after_minutes: stale === null ? null : Number(stale),
  }
}

export function taskFromForm(form: TaskForm, timeZone: string): TaskDraft {
  const draft: TaskDraft = {
    title: form.title.trim(),
    icon: optional(form.icon),
    color: optional(form.color),
    notes: optional(form.notes),
    assignee: optional(form.assignee),
    enabled: form.enabled,
    schedule: scheduleFromForm(form, timeZone),
    on_missed: form.on_missed,
    scene: form.scene,
    stages: form.stages.map((stage) => stageFromForm(stage)),
    clean_for_minutes: Number(form.clean_for.trim()),
    grace_hours: Number(form.grace.trim()),
  }
  return form.id === null ? draft : { ...draft, id: form.id }
}

export interface EntitySuggestion {
  entity_id: string
  name: string
  state: string
}

export function entityOf(
  states: Record<string, HassEntityState>,
  entityId: string,
): HassEntityState | undefined {
  return Object.hasOwn(states, entityId) ? states[entityId] : undefined
}

function friendlyName(entity: HassEntityState): string {
  const name = entity.attributes.friendly_name
  return typeof name === 'string' ? name : entity.entity_id
}

function isNumeric(state: string): boolean {
  return state.trim() !== '' && Number.isFinite(Number(state))
}

function relevance(entity: HassEntityState, condition: Condition): number {
  if (condition === 'state') return 0
  const deviceClass = entity.attributes.device_class
  if (deviceClass === 'power') return 0
  if (deviceClass === 'current' || deviceClass === 'voltage') return 1
  return isNumeric(entity.state) ? 2 : 3
}

export function suggestEntities(
  states: Record<string, HassEntityState>,
  query: string,
  condition: Condition,
  limit = 6,
): EntitySuggestion[] {
  const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const matching = Object.values(states).filter((entity) => {
    const haystack = `${entity.entity_id} ${friendlyName(entity)}`.toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
  const ranked = matching.toSorted(
    (a, b) =>
      relevance(a, condition) - relevance(b, condition) || a.entity_id.localeCompare(b.entity_id),
  )
  return ranked.slice(0, limit).map((entity) => ({
    entity_id: entity.entity_id,
    name: friendlyName(entity),
    state: entity.state,
  }))
}

export type LiveMatch = 'met' | 'unmet' | 'unavailable' | 'missing' | 'idle'

export function liveMatch(stage: StageForm, entity: HassEntityState | undefined): LiveMatch {
  if (stage.condition === 'none' || !stage.entity.trim()) return 'idle'
  if (!entity) return 'missing'
  if (DEAD_STATES.has(entity.state)) return 'unavailable'
  if (stage.condition === 'state') {
    if (!stage.value.trim()) return 'idle'
    return entity.state === stage.value.trim() ? 'met' : 'unmet'
  }
  const target = parseNumber(stage.value)
  if (target === null) return 'idle'
  if (!isNumeric(entity.state)) return 'unavailable'
  const value = Number(entity.state)
  const met = stage.condition === 'above' ? value > target : value < target
  return met ? 'met' : 'unmet'
}

function entityUnit(entity: HassEntityState | undefined): string {
  const unit = entity?.attributes.unit_of_measurement
  return typeof unit === 'string' ? unit : ''
}

export function formatEntityValue(entity: HassEntityState): string {
  const unit = entityUnit(entity)
  return unit ? `${entity.state} ${unit}` : entity.state
}

export function holdText(seconds: number, i18n: I18n): string {
  return seconds < 90 ? i18n.plural('seconds', seconds) : i18n.duration(seconds)
}

export function triggerSentence(
  stage: StageForm,
  entity: HassEntityState | undefined,
  i18n: I18n,
): string {
  if (stage.condition === 'none') return i18n.t('trigger_none')
  const value = stage.value.trim()
  if (!stage.entity.trim() || !value) return i18n.t('trigger_incomplete')
  const name = entity ? friendlyName(entity) : stage.entity.trim()
  const unit = stage.condition === 'state' ? '' : entityUnit(entity)
  const sentence = i18n.t(`trigger_${stage.condition}`, {
    entity: name,
    value: unit ? `${value} ${unit}` : value,
  })
  const hold = Number(stage.hold.trim())
  if (!Number.isInteger(hold) || hold <= 0) return i18n.t('trigger_instant', { sentence })
  return i18n.t('trigger_held', { sentence, hold: holdText(hold, i18n) })
}

const TEMPLATE_TITLES: Record<string, MessageKey> = {
  laundry: 'template_laundry',
  pills: 'template_pills',
  plant: 'template_plant',
  one_off: 'template_one_off',
}

const STAGE_TEXT: Record<string, readonly [MessageKey, MessageKey]> = {
  load: ['template_stage_load', 'template_action_load'],
  wash: ['template_stage_wash', 'template_action_wash'],
  hang: ['template_stage_hang', 'template_action_hang'],
  take: ['template_stage_take', 'template_action_take'],
  water: ['template_stage_water', 'template_action_water'],
  do: ['template_stage_do', 'template_action_do'],
}

export function templateTitle(name: string, i18n: I18n): string | null {
  const key = Object.hasOwn(TEMPLATE_TITLES, name) ? TEMPLATE_TITLES[name] : undefined
  return key ? i18n.t(key) : null
}

export function localizeTemplate(name: string, draft: TaskDraft, i18n: I18n): TaskDraft {
  return {
    ...draft,
    title: templateTitle(name, i18n) ?? draft.title,
    stages: draft.stages.map((stage) => {
      const keys = Object.hasOwn(STAGE_TEXT, stage.id) ? STAGE_TEXT[stage.id] : undefined
      return keys ? { ...stage, title: i18n.t(keys[0]), action: i18n.t(keys[1]) } : stage
    }),
  }
}

export interface GridDay {
  date: string
  completed: number
  skipped: number
  missed: number
  column: number
  row: number
  level: number
  trouble: boolean
}

export function dayGrid(
  perDay: ReadonlyArray<{ date: string; completed: number; skipped: number; missed: number }>,
): { days: GridDay[]; columns: number } {
  const first = perDay[0]
  if (!first) return { days: [], columns: 0 }
  const lead = (new Date(`${first.date}T00:00:00Z`).getUTCDay() + 6) % 7
  const days = perDay.map((day, index) => ({
    ...day,
    column: Math.floor((index + lead) / 7),
    row: (index + lead) % 7,
    level: Math.min(3, day.completed),
    trouble: day.missed + day.skipped > 0,
  }))
  return { days, columns: (days.at(-1)?.column ?? 0) + 1 }
}
