import { describe, expect, it } from 'vitest'
import {
  addDays,
  daysBetween,
  formatDate,
  getWeekday,
  isValidISODate,
  lastDayOfMonth,
  parseBrazilianDate,
  shiftYears,
} from './date'

describe('formatDate', () => {
  it('converte aaaa-mm-dd para dd/mm/aaaa', () => {
    expect(formatDate('2026-11-18')).toBe('18/11/2026')
    expect(formatDate('2026-01-05')).toBe('05/01/2026')
  })
})

describe('isValidISODate', () => {
  it('aceita datas reais, inclusive 29/02 em ano bissexto', () => {
    expect(isValidISODate('2026-11-18')).toBe(true)
    expect(isValidISODate('2028-02-29')).toBe(true)
  })

  it('rejeita datas que não existem ou estão no formato errado', () => {
    expect(isValidISODate('2026-02-29')).toBe(false)
    expect(isValidISODate('2026-13-01')).toBe(false)
    expect(isValidISODate('18/11/2026')).toBe(false)
    expect(isValidISODate('')).toBe(false)
  })
})

describe('parseBrazilianDate', () => {
  it('lê dd/mm/aaaa e devolve aaaa-mm-dd', () => {
    expect(parseBrazilianDate('18/11/2026')).toBe('2026-11-18')
    expect(parseBrazilianDate(' 05/01/2026 ')).toBe('2026-01-05')
  })

  it('rejeita datas inválidas', () => {
    expect(parseBrazilianDate('31/02/2026')).toBeNull()
    expect(parseBrazilianDate('2026-11-18')).toBeNull()
    expect(parseBrazilianDate('18/11/26')).toBeNull()
  })
})

describe('aritmética de datas', () => {
  it('soma e subtrai dias atravessando mês e ano', () => {
    expect(addDays('2026-11-18', 1)).toBe('2026-11-19')
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2026-11-18', -324)).toBe('2025-12-29')
  })

  it('calcula a diferença em dias', () => {
    expect(daysBetween('2026-11-01', '2026-11-18')).toBe(17)
    expect(daysBetween('2026-11-18', '2026-11-01')).toBe(-17)
  })

  it('descobre o dia da semana', () => {
    expect(getWeekday('2026-11-18')).toBe(3) 
    expect(getWeekday('2026-11-22')).toBe(0)
  })

  it('acha o último dia do mês, inclusive fevereiro', () => {
    expect(lastDayOfMonth('2026-11-18')).toBe('2026-11-30')
    expect(lastDayOfMonth('2026-02-10')).toBe('2026-02-28')
    expect(lastDayOfMonth('2028-02-10')).toBe('2028-02-29')
  })

  it('soma anos sem quebrar o 29/02', () => {
    expect(shiftYears('2026-11-18', -1)).toBe('2025-11-18')
    expect(shiftYears('2028-02-29', 1)).toBe('2029-02-28')
  })
})
