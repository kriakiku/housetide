import { describe, expect, test } from 'bun:test'

import { view } from '../test-fixtures.ts'
import { isEarly } from './live.ts'

describe('isEarly', () => {
  test('a timed task not due yet is early', () => {
    expect(isEarly(view('upcoming'))).toBe(true)
    expect(isEarly(view('clean'))).toBe(true)
    expect(isEarly(view('due'))).toBe(false)
  })

  test('an any-time task on its day is not early', () => {
    expect(isEarly(view('upcoming', { anytime: true, is_today: true }))).toBe(false)
    expect(isEarly(view('clean', { anytime: true, is_today: true }))).toBe(false)
  })

  test('an any-time task on a later day is early', () => {
    expect(isEarly(view('upcoming', { anytime: true, is_today: false }))).toBe(true)
  })
})
