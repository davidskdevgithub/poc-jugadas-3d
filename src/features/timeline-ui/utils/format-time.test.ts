import { describe, expect, it } from 'vitest'
import { formatTime } from './format-time'

describe('formatTime', () => {
  it('formatea 0 como 0:00', () => {
    expect(formatTime(0)).toBe('0:00')
  })

  it('trunca los decimales (7.4 → 0:07)', () => {
    expect(formatTime(7.4)).toBe('0:07')
  })

  it('pasa a minutos con segundos con pad (62.5 → 1:02)', () => {
    expect(formatTime(62.5)).toBe('1:02')
  })
})