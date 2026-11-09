import { describe, expect, spyOn, test } from 'bun:test'

import { createI18n } from '../i18n.ts'
import { entity, task } from '../test-fixtures.ts'
import type { TaskDraft } from '../types.ts'
import {
  addStage,
  dayGrid,
  entityOf,
  DEFAULT_DEADLINE,
  formFromDraft,
  isAnytimeForm,
  withAnytime,
  isoToLocalInput,
  liveMatch,
  localInputToIso,
  localizeTemplate,
  matchesFilter,
  middayOf,
  moveStage,
  PICKER_GROUPS,
  removeStage,
  suggestEntities,
  taskFromForm,
  templateOf,
  templateTitle,
  triggerSentence,
  validateForm,
  weekdayIndex,
  withScene,
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

describe('look in the form', () => {
  const draft = (look: TaskDraft['look'], scene: TaskDraft['scene'] = 'pet'): TaskDraft => ({
    ...task('t', { scene }),
    ...(look === undefined ? {} : { look }),
  })

  test('survives the round trip', () => {
    const look = { accent: '#123456', variant: 'dog' }
    expect(taskFromForm(formFromDraft(draft(look), ZONE, NOW), ZONE).look).toEqual(look)
  })

  test('is left out when nothing is set', () => {
    const form = formFromDraft(draft(null), ZONE, NOW)
    expect([form.accent, form.variant]).toEqual(['', ''])
    expect(taskFromForm(form, ZONE)).not.toHaveProperty('look')
  })

  test('lowercases the accent so a swatch can match it', () => {
    expect(formFromDraft(draft({ accent: '#ABCDEF' }), ZONE, NOW).accent).toBe('#abcdef')
  })

  test('changing scene drops a variant the new scene does not have', () => {
    const form = formFromDraft(draft({ accent: '#123456', variant: 'dog' }), ZONE, NOW)
    expect(withScene(form, 'pet').variant).toBe('dog')
    const moved = withScene(form, 'laundry')
    expect(moved.scene).toBe('laundry')
    expect(moved.variant).toBe('')
    expect(moved.accent).toBe('#123456')
  })

  test('keeps the variant while the scene still draws it', () => {
    const form = formFromDraft(draft({ variant: 'white' }, 'laundry'), ZONE, NOW)
    expect(withScene(form, 'laundry').variant).toBe('white')
    expect(withScene(form, 'gym').variant).toBe('')
  })
})

describe('pickers', () => {
  const uk = createI18n('uk', { timeZone: ZONE, hour12: false })

  test('every grouped scene has a template title and a scene label', () => {
    for (const group of PICKER_GROUPS) {
      expect(i18n.t(group.label)).not.toBe(uk.t(group.label))
      for (const scene of group.scenes) {
        expect(templateTitle(templateOf(scene), i18n)).toBeString()
        expect(templateTitle(templateOf(scene), uk)).toBeString()
        expect(uk.t(`scene_${scene}`)).toBeString()
      }
    }
  })

  test('the tide scene belongs to the one-off template', () => {
    expect(templateOf('generic')).toBe('one_off')
    expect(templateOf('gym')).toBe('gym')
  })

  test('filter matches every word, ignoring case', () => {
    expect(matchesFilter('', 'anything')).toBe(true)
    expect(matchesFilter('  ', 'anything')).toBe(true)
    expect(matchesFilter('WASH car', 'Wash the', 'car')).toBe(true)
    expect(matchesFilter('wash bike', 'Wash the car')).toBe(false)
    expect(matchesFilter('АВТО', 'Помити авто')).toBe(true)
  })

  test('filter treats every apostrophe as the same character', () => {
    const backup = 'Зробити резервну копію компʼютера'
    expect(matchesFilter("комп'ютер", backup)).toBe(true)
    expect(matchesFilter('комп’ютер', backup)).toBe(true)
    expect(matchesFilter('компʼютер', "комп'ютера")).toBe(true)
    expect(matchesFilter("здоров'я", 'Здоровʼя')).toBe(true)
    expect(matchesFilter("комп'ютер", 'Комп ютер')).toBe(false)
  })

  test('new stages are localised', () => {
    const source: TaskDraft = {
      ...task('ev', { scene: 'ev' }),
      stages: [
        { ...task('ev').stages[0]!, id: 'plug_in', role: 'todo' },
        { ...task('ev').stages[0]!, id: 'charge_ev', role: 'running' },
      ],
    }
    const { title, stages } = localizeTemplate('ev', source, uk)
    expect(title).toBe('Зарядити авто')
    expect(stages.map((item) => [item.title, item.action])).toEqual([
      ['Підключити', 'Підключено'],
      ['Заряджається', 'Заряджено'],
    ])
  })
})

describe('any-time form', () => {
  const schedules = [
    { type: 'daily', time: '20:00', anytime: true },
    { type: 'weekly', weekdays: [1, 3], time: '20:00', anytime: true },
    { type: 'interval', every_days: 3, time: '20:00', anchor: 'schedule', anytime: true },
  ] as const

  for (const schedule of schedules) {
    test(`${schedule.type} round-trips`, () => {
      const source: TaskDraft = { ...task('x'), schedule: { ...schedule } as TaskDraft['schedule'] }
      const form = formFromDraft(source, ZONE, NOW)
      expect(form.anytime).toBe(true)
      expect(taskFromForm(form, ZONE).schedule).toEqual(source.schedule)
    })
  }

  test('a timed schedule has no flag', () => {
    const source: TaskDraft = { ...task('x'), schedule: { type: 'daily', time: '08:00' } }
    const form = formFromDraft(source, ZONE, NOW)
    expect(form.anytime).toBe(false)
    expect(taskFromForm(form, ZONE).schedule).toEqual({ type: 'daily', time: '08:00' })
  })

  test('turning on defaults the deadline, turning off puts a time back', () => {
    const form = {
      ...formFromDraft(task('x'), ZONE, NOW),
      schedule: 'daily' as const,
      time: '10:00',
    }
    const on = withAnytime(form, true)
    expect(on).toMatchObject({ anytime: true, time: DEFAULT_DEADLINE })
    expect(withAnytime(on, false)).toMatchObject({ anytime: false, time: '09:00' })
    expect(withAnytime({ ...on, time: '18:00' }, false).time).toBe('18:00')
  })

  test('turning on swaps the untouched grace for a daytime window and back', () => {
    const form = {
      ...formFromDraft(task('x'), ZONE, NOW),
      schedule: 'daily' as const,
      grace: '24',
    }
    const on = withAnytime(form, true)
    expect(on.grace).toBe('6')
    expect(withAnytime(on, false).grace).toBe('24')
    const custom = withAnytime({ ...form, grace: '3' }, true)
    expect(custom.grace).toBe('3')
    expect(withAnytime(custom, false).grace).toBe('3')
  })

  test('an empty deadline is valid and saved as the default', () => {
    const form = {
      ...formFromDraft(task('x'), ZONE, NOW),
      schedule: 'daily' as const,
      anytime: true,
      time: '',
    }
    expect(validateForm(form, ZONE).time).toBeUndefined()
    expect(taskFromForm(form, ZONE).schedule).toEqual({
      type: 'daily',
      time: DEFAULT_DEADLINE,
      anytime: true,
    })
    expect(validateForm({ ...form, anytime: false }, ZONE).time).toBeDefined()
  })

  test('a one-off drops the flag', () => {
    const form = {
      ...formFromDraft(task('x'), ZONE, NOW),
      schedule: 'once' as const,
      anytime: true,
      due: '2026-12-24T18:30',
    }
    expect(isAnytimeForm(form)).toBe(false)
    expect('anytime' in taskFromForm(form, ZONE).schedule).toBe(false)
  })
})
