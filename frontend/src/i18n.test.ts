import { describe, expect, test } from 'bun:test'

import { createI18n, i18nFromHass, resolveLanguage } from './i18n.ts'
import type { TaskView } from './types.ts'

const NOW = '2026-11-08T12:00:00+00:00'
const en = createI18n('en', { timeZone: 'UTC', hour12: false })
const uk = createI18n('uk', { timeZone: 'UTC', hour12: false })

function task(overrides: Partial<TaskView>): TaskView {
  return {
    task_id: 't',
    title: 'T',
    icon: null,
    color: null,
    status: 'upcoming',
    stage_index: 0,
    stage_count: 1,
    stage_id: 's',
    stage_title: 'S',
    action: null,
    role: 'todo',
    due_at: null,
    next_due_at: null,
    started_at: null,
    last_completed_at: null,
    is_today: false,
    overdue_seconds: 0,
    can_advance: true,
    can_skip: true,
    can_undo: false,
    automated: false,
    scene: { name: 'generic', state: 'resting', fill: 0, stink: 0, progress: 0 },
    ...overrides,
  }
}

describe('language', () => {
  test('resolves, falling back to English', () => {
    expect(resolveLanguage('uk')).toEqual({ language: 'uk', locale: 'uk' })
    expect(resolveLanguage('en-GB')).toEqual({ language: 'en', locale: 'en-GB' })
    expect(resolveLanguage('de')).toEqual({ language: 'en', locale: 'en' })
    expect(resolveLanguage(undefined).language).toBe('en')
  })

  test('translates with variables', () => {
    expect(en.t('stage_progress', { current: 1, total: 3 })).toBe('Step 1 of 3')
    expect(uk.t('stage_progress', { current: 1, total: 3 })).toBe('Етап 1 з 3')
  })

  test('reads the Home Assistant profile', () => {
    const i18n = i18nFromHass({
      language: 'en',
      locale: { language: 'uk', time_format: '24' },
      config: { time_zone: 'Europe/Kyiv' },
    })
    expect(i18n.language).toBe('uk')
    expect(i18n.time('2026-11-08T12:00:00Z')).toBe('14:00')
  })

  test('survives an invalid time zone', () => {
    expect(createI18n('en', { timeZone: 'Mars/Base' }).t('tab_today')).toBe('Today')
  })
})

describe('plurals', () => {
  test('uses Ukrainian categories', () => {
    expect(uk.plural('days', 1)).toBe('1 день')
    expect(uk.plural('days', 3)).toBe('3 дні')
    expect(uk.plural('days', 5)).toBe('5 днів')
    expect(en.plural('days', 1)).toBe('1 day')
    expect(en.plural('days', 5)).toBe('5 days')
  })
})

describe('relative time', () => {
  test('picks a sensible unit', () => {
    expect(en.relative('2026-11-08T12:00:20Z', NOW)).toBe('now')
    expect(en.relative('2026-11-08T12:10:00Z', NOW)).toBe('in 10 minutes')
    expect(en.relative('2026-11-08T09:00:00Z', NOW)).toBe('3 hours ago')
    expect(en.relative('2026-11-09T14:00:00Z', NOW)).toBe('tomorrow')
    expect(en.relative('2026-11-12T12:00:00Z', NOW)).toBe('in 4 days')
    expect(en.relative('2026-11-29T12:00:00Z', NOW)).toBe('in 3 weeks')
  })

  test('localizes', () => {
    expect(uk.relative('2026-11-08T09:00:00Z', NOW)).toBe('3 години тому')
    expect(uk.relative('2026-11-09T14:00:00Z', NOW)).toBe('завтра')
  })

  test('counts calendar days in the configured zone', () => {
    const kyiv = createI18n('en', { timeZone: 'Europe/Kyiv' })
    expect(kyiv.relative('2026-11-08T22:30:00Z', '2026-11-07T21:00:00Z')).toBe('in 2 days')
  })
})

describe('schedule text', () => {
  test('describes each type', () => {
    expect(en.scheduleText({ type: 'daily', time: '08:00' })).toBe('Every day at 08:00')
    expect(en.scheduleText({ type: 'weekly', weekdays: [0, 3], time: '07:30' })).toBe(
      'Mon, Thu at 07:30',
    )
    expect(
      en.scheduleText({ type: 'interval', every_days: 7, time: '09:00', anchor: 'completion' }),
    ).toBe('Every 7 days at 09:00')
    expect(uk.scheduleText({ type: 'daily', time: '08:00' })).toBe('Щодня о 08:00')
  })

  test('honours the 12 hour clock', () => {
    const twelve = createI18n('en', { hour12: true })
    expect(twelve.clock('15:05').replaceAll(/\s/g, ' ')).toBe('3:05 PM')
  })
})

describe('due text', () => {
  test('overdue time follows the clock, not the last push', () => {
    const view = task({ status: 'overdue', due_at: '2026-11-08T09:00:00Z', overdue_seconds: 60 })
    expect(en.dueText(view, NOW)).toBe('Overdue · 3 hours')
    expect(en.dueText(view, '2026-11-08T15:00:00Z')).toBe('Overdue · 6 hours')
  })

  test('follows status', () => {
    expect(en.dueText(task({ status: 'due' }), NOW)).toBe('Due now')
    expect(en.dueText(task({ status: 'overdue', overdue_seconds: 7200 }), NOW)).toBe(
      'Overdue · 2 hours',
    )
    expect(en.dueText(task({ status: 'upcoming', due_at: '2026-11-09T14:00:00Z' }), NOW)).toBe(
      'Due tomorrow',
    )
    expect(en.dueText(task({ status: 'upcoming', next_due_at: '2026-11-08T14:00:00Z' }), NOW)).toBe(
      'Next in 2 hours',
    )
    expect(en.dueText(task({ status: 'upcoming' }), NOW)).toBe('Not scheduled')
    expect(
      en.dueText(task({ status: 'clean', last_completed_at: '2026-11-08T11:00:00Z' }), NOW),
    ).toBe('Done 1 hour ago')
    expect(en.dueText(task({ status: 'disabled' }), NOW)).toBe('Paused')
    expect(uk.dueText(task({ status: 'overdue', overdue_seconds: 3600 }), NOW)).toBe(
      'Прострочено · 1 година',
    )
  })
})
