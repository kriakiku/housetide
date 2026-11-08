import { describe, expect, spyOn, test } from 'bun:test'

import { createI18n } from '../i18n.ts'
import { entity, task } from '../test-fixtures.ts'
import type { TaskDraft } from '../types.ts'
import {
  addStage,
  dayGrid,
  entityOf,
  formFromDraft,
  isoToLocalInput,
  liveMatch,
  localInputToIso,
  localizeTemplate,
  middayOf,
  moveStage,
  removeStage,
  suggestEntities,
  taskFromForm,
  triggerSentence,
  validateForm,
  weekdayIndex,
} from './model.ts'
import type { StageForm } from './model.ts'

const ZONE = 'Europe/Kyiv'
const NOW = new Date('2026-11-04T10:00:00Z')
const i18n = createI18n('en', { timeZone: ZONE, hour12: false })

function stage(override: Partial<StageForm> = {}): StageForm {
  return {
    id: 's',
    title: 'S',
    action: '',
    role: 'todo',
    stale: '',
    condition: 'above',
    entity: 'sensor.power',
    value: '10',
    hold: '60',
    ...override,
  }
}

describe('zone conversion', () => {
  test('uses the Home Assistant zone offset on both sides of DST', () => {
    expect(localInputToIso('2026-01-15T09:30', ZONE)).toBe('2026-01-15T09:30:00+02:00')
    expect(localInputToIso('2026-07-15T09:30', ZONE)).toBe('2026-07-15T09:30:00+03:00')
    expect(localInputToIso('2026-07-15T09:30', 'America/New_York')).toBe(
      '2026-07-15T09:30:00-04:00',
    )
  })

  test('survives the nonexistent spring hour', () => {
    const iso = localInputToIso('2026-03-29T03:30', ZONE)
    expect(iso).not.toBeNull()
    expect(Number.isNaN(Date.parse(iso ?? ''))).toBe(false)
  })

  test('rejects garbage and round trips', () => {
    expect(localInputToIso('nope', ZONE)).toBeNull()
    expect(isoToLocalInput('2026-07-15T06:30:00+00:00', ZONE)).toBe('2026-07-15T09:30')
    expect(isoToLocalInput('bad', ZONE)).toBe('')
  })

  test('finds the weekday in the zone', () => {
    expect(weekdayIndex(new Date('2026-11-01T23:30:00Z'), ZONE)).toBe(0)
    expect(weekdayIndex(new Date('2026-11-01T21:00:00Z'), ZONE)).toBe(6)
  })
})

describe('form round trip', () => {
  test('keeps every task field', () => {
    const source: TaskDraft = task('a', {
      icon: 'mdi:pill',
      color: '#ff0000',
      notes: 'n',
      assignee: 'person.me',
      enabled: false,
      on_missed: 'carry',
      scene: 'laundry',
      clean_for_minutes: 5,
      grace_hours: 2,
      schedule: { type: 'interval', every_days: 3, time: '07:15', anchor: 'schedule' },
      stages: [
        {
          id: 'a',
          title: 'A',
          action: 'Go',
          role: 'running',
          complete_when: {
            entity_id: 'sensor.x',
            above: null,
            below: 4.5,
            state: null,
            for_seconds: 30,
          },
          stale_after_minutes: 9,
        },
      ],
    })
    expect(taskFromForm(formFromDraft(source, ZONE, NOW), ZONE)).toEqual(source)
  })

  test('new tasks have no id and blank optionals become null', () => {
    const { id: _id, ...draft } = task('x')
    const form = { ...formFromDraft(draft, ZONE, NOW), icon: '  ', notes: '' }
    const out = taskFromForm(form, ZONE)
    expect('id' in out).toBe(false)
    expect(out.icon).toBeNull()
    expect(out.notes).toBeNull()
  })

  test('a state trigger carries only the state', () => {
    const form = {
      ...formFromDraft(task('x'), ZONE, NOW),
      stages: [stage({ condition: 'state', value: 'on' })],
    }
    expect(taskFromForm(form, ZONE).stages[0]?.complete_when).toEqual({
      entity_id: 'sensor.power',
      above: null,
      below: null,
      state: 'on',
      for_seconds: 60,
    })
  })

  test('accepts a decimal comma', () => {
    const form = { ...formFromDraft(task('x'), ZONE, NOW), stages: [stage({ value: '2,5' })] }
    expect(taskFromForm(form, ZONE).stages[0]?.complete_when?.above).toBe(2.5)
  })
})

describe('stage editing', () => {
  const form = addStage(addStage(formFromDraft(task('x'), ZONE, NOW)))

  test('adds with unique ids', () => {
    expect(new Set(form.stages.map((item) => item.id)).size).toBe(3)
    const after = addStage(removeStage(form, 1))
    expect(new Set(after.stages.map((item) => item.id)).size).toBe(3)
  })

  test('moves within bounds', () => {
    const ids = form.stages.map((item) => item.id)
    expect(moveStage(form, 2, -1).stages.map((item) => item.id)).toEqual([
      ids[0] ?? '',
      ids[2] ?? '',
      ids[1] ?? '',
    ])
    expect(moveStage(form, 0, -1)).toBe(form)
  })

  test('never removes the last stage', () => {
    const one = formFromDraft(task('x'), ZONE, NOW)
    expect(removeStage(one, 0)).toBe(one)
  })
})

describe('validation', () => {
  const base = formFromDraft(task('x'), ZONE, NOW)

  test('a good form has no errors', () => {
    expect(validateForm(base, ZONE)).toEqual({})
  })

  test.each([
    [{ title: ' ' }, 'title', 'error_required'],
    [{ clean_for: '-1' }, 'clean_for', 'error_whole'],
    [{ grace: '1.5' }, 'grace', 'error_whole'],
    [{ time: '' }, 'time', 'error_time'],
    [{ schedule: 'once' as const, due: '' }, 'due', 'error_datetime'],
    [{ schedule: 'weekly' as const, weekdays: [] }, 'weekdays', 'error_weekdays'],
    [{ schedule: 'interval' as const, every_days: '0' }, 'every_days', 'error_min'],
  ])('%j', (change, path, key) => {
    expect(validateForm({ ...base, ...change }, ZONE)[path]?.key as string).toBe(key)
  })

  test.each([
    [{ title: '' }, 'title', 'error_required'],
    [{ entity: '' }, 'entity', 'error_entity'],
    [{ entity: 'Not Valid' }, 'entity', 'error_entity_format'],
    [{ value: 'abc' }, 'value', 'error_number'],
    [{ value: '' }, 'value', 'error_number'],
    [{ condition: 'state' as const, value: 'unknown' }, 'value', 'error_state'],
    [{ condition: 'state' as const, value: ' ' }, 'value', 'error_required'],
    [{ hold: 'x' }, 'hold', 'error_whole'],
    [{ stale: '0' }, 'stale', 'error_min'],
  ])('stage %j', (change, field, key) => {
    const errors = validateForm({ ...base, stages: [stage(change)] }, ZONE)
    expect(errors[`stages.0.${field}`]?.key as string).toBe(key)
  })

  test('by hand ignores the trigger fields', () => {
    const errors = validateForm(
      { ...base, stages: [stage({ condition: 'none', entity: '', value: '' })] },
      ZONE,
    )
    expect(errors).toEqual({})
  })
})

describe('entity help', () => {
  const states = {
    'sensor.washer_power': entity('sensor.washer_power', '3.2', {
      friendly_name: 'Washer power',
      device_class: 'power',
      unit_of_measurement: 'W',
    }),
    'sensor.a_temp': entity('sensor.a_temp', '21'),
    'light.hall': entity('light.hall', 'on', { friendly_name: 'Hall light' }),
    'sensor.down': entity('sensor.down', 'unavailable'),
  }

  test('numeric conditions rank power first', () => {
    expect(suggestEntities(states, '', 'above').map((item) => item.entity_id)).toEqual([
      'sensor.washer_power',
      'sensor.a_temp',
      'light.hall',
      'sensor.down',
    ])
  })

  test('searches names and ids and limits', () => {
    expect(suggestEntities(states, 'hall LIGHT', 'state')).toHaveLength(1)
    expect(suggestEntities(states, 'sensor', 'above', 2)).toHaveLength(2)
    expect(suggestEntities(states, 'zzz', 'above')).toEqual([])
  })

  test('live match', () => {
    const power = states['sensor.washer_power']
    expect(liveMatch(stage({ value: '1' }), power)).toBe('met')
    expect(liveMatch(stage({ value: '5' }), power)).toBe('unmet')
    expect(liveMatch(stage({ condition: 'below', value: '5' }), power)).toBe('met')
    expect(liveMatch(stage(), undefined)).toBe('missing')
    expect(liveMatch(stage(), states['sensor.down'])).toBe('unavailable')
    expect(liveMatch(stage(), states['light.hall'])).toBe('unavailable')
    expect(liveMatch(stage({ condition: 'state', value: 'on' }), states['light.hall'])).toBe('met')
    expect(liveMatch(stage({ condition: 'none' }), power)).toBe('idle')
  })

  test('sentences read plainly', () => {
    const power = states['sensor.washer_power']
    expect(triggerSentence(stage(), power, i18n)).toBe(
      'Moves on when Washer power goes above 10 W and stays there for 60 seconds.',
    )
    expect(
      triggerSentence(stage({ condition: 'below', value: '5', hold: '300' }), power, i18n),
    ).toBe('Moves on when Washer power drops below 5 W and stays there for 5 minutes.')
    expect(
      triggerSentence(
        stage({ condition: 'state', value: 'on', hold: '0' }),
        states['light.hall'],
        i18n,
      ),
    ).toBe('Moves on when Hall light becomes “on”.')
    expect(triggerSentence(stage({ condition: 'none' }), power, i18n)).toBe(i18n.t('trigger_none'))
    expect(triggerSentence(stage({ entity: '' }), undefined, i18n)).toBe(
      i18n.t('trigger_incomplete'),
    )
  })
})

test('templates are localised by stage id', () => {
  const uk = createI18n('uk', { timeZone: ZONE })
  const draft = task('x', {
    stages: [{ ...task('x').stages[0]!, id: 'wash', title: 'Washing', action: 'Finished' }],
  })
  const out = localizeTemplate('laundry', draft, uk)
  expect(out.title).toBe('Прання')
  expect(out.stages[0]?.title).toBe('Прання')
  expect(out.stages[0]?.action).toBe('Завершено')
  expect(localizeTemplate('custom', draft, uk).title).toBe(draft.title)
})

test('day grid aligns weeks to Monday', () => {
  const days = ['2026-11-04', '2026-11-05', '2026-11-08', '2026-11-09'].map((date) => ({
    date,
    completed: 5,
    skipped: 0,
    missed: 0,
  }))
  const dense = Array.from({ length: 6 }, (_, index) => ({
    date: `2026-11-0${index + 4}`,
    completed: index,
    skipped: 0,
    missed: index === 1 ? 1 : 0,
  }))
  expect(dayGrid([]).days).toEqual([])
  const grid = dayGrid(dense)
  expect(grid.days[0]).toMatchObject({ row: 2, column: 0, level: 0 })
  expect(grid.days[5]).toMatchObject({ row: 0, column: 1, level: 3 })
  expect(grid.days[1]?.trouble).toBe(true)
  expect(grid.columns).toBe(2)
  expect(days).toHaveLength(4)
})

test('entity lookup ignores inherited names', () => {
  const states = { 'sensor.a': entity('sensor.a', '1') }
  expect(entityOf(states, 'sensor.a')?.state).toBe('1')
  expect(entityOf(states, 'constructor')).toBeUndefined()
  expect(entityOf(states, 'valueOf')).toBeUndefined()
})

test('one formatter serves every date in a zone', () => {
  const spy = spyOn(Intl, 'DateTimeFormat')
  for (let day = 1; day <= 28; day += 1) {
    middayOf(`2026-02-${String(day).padStart(2, '0')}`, 'Asia/Tokyo')
  }
  expect(spy.mock.calls.length).toBeLessThanOrEqual(1)
  spy.mockRestore()
})
