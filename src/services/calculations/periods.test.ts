import { describe, expect, it } from 'vitest'
import type { Order } from '../../types/order'
import {
  filterOrdersByPeriod,
  getDayPeriod,
  getMonthPeriod,
  getPeriodLengthInDays,
  getPreviousPeriod,
  getWeekPeriod,
  getYearPeriod,
  isDateInPeriod,
  isValidPeriod,
  shiftPeriodByYears,
} from './periods'

const order = (id: string, createdDate: string): Order => ({
  id,
  createdDate,
  status: 'completed',
  items: [],
  shippingPaidBySeller: 0,
  source: 'demo',
})

describe('períodos', () => {
  it('o dia é um período de um dia só', () => {
    expect(getDayPeriod('2026-11-18')).toEqual({ start: '2026-11-18', end: '2026-11-18' })
  })

  it('a semana vai de segunda a domingo', () => {
    expect(getWeekPeriod('2026-11-18')).toEqual({ start: '2026-11-16', end: '2026-11-22' })
    expect(getWeekPeriod('2026-11-22')).toEqual({ start: '2026-11-16', end: '2026-11-22' })
    expect(getWeekPeriod('2026-11-16')).toEqual({ start: '2026-11-16', end: '2026-11-22' })
  })

  it('a semana pode atravessar o fim do ano', () => {
    expect(getWeekPeriod('2026-12-31')).toEqual({ start: '2026-12-28', end: '2027-01-03' })
  })

  it('o mês vai do dia 1 ao último dia', () => {
    expect(getMonthPeriod('2026-11-18')).toEqual({ start: '2026-11-01', end: '2026-11-30' })
    expect(getMonthPeriod('2028-02-10')).toEqual({ start: '2028-02-01', end: '2028-02-29' })
  })

  it('o ano vai de 1º de janeiro a 31 de dezembro', () => {
    expect(getYearPeriod('2026-11-18')).toEqual({ start: '2026-01-01', end: '2026-12-31' })
  })
})

describe('isDateInPeriod / filterOrdersByPeriod', () => {
  const period = { start: '2026-11-01', end: '2026-11-30' }

  it('inclui o primeiro e o último dia', () => {
    expect(isDateInPeriod('2026-11-01', period)).toBe(true)
    expect(isDateInPeriod('2026-11-30', period)).toBe(true)
    expect(isDateInPeriod('2026-10-31', period)).toBe(false)
    expect(isDateInPeriod('2026-12-01', period)).toBe(false)
  })

  it('filtra pedidos pela data de criação', () => {
    const orders = [order('A', '2026-10-31'), order('B', '2026-11-01'), order('C', '2026-11-30')]
    expect(filterOrdersByPeriod(orders, period).map((o) => o.id)).toEqual(['B', 'C'])
  })
})

describe('comparação entre períodos', () => {
  it('desloca para o mesmo período no ano passado', () => {
    expect(shiftPeriodByYears({ start: '2026-11-01', end: '2026-11-18' }, -1)).toEqual({
      start: '2025-11-01',
      end: '2025-11-18',
    })
  })

  it('conta os dias do período incluindo as duas pontas', () => {
    expect(getPeriodLengthInDays({ start: '2026-11-01', end: '2026-11-18' })).toBe(18)
    expect(getPeriodLengthInDays({ start: '2026-11-18', end: '2026-11-18' })).toBe(1)
  })

  it('acha o período anterior de mesmo tamanho', () => {
    expect(getPreviousPeriod({ start: '2026-11-11', end: '2026-11-17' })).toEqual({
      start: '2026-11-04',
      end: '2026-11-10',
    })
    expect(getPreviousPeriod({ start: '2026-11-18', end: '2026-11-18' })).toEqual({
      start: '2026-11-17',
      end: '2026-11-17',
    })
  })

  it('valida que o início não é depois do fim', () => {
    expect(isValidPeriod({ start: '2026-11-01', end: '2026-11-01' })).toBe(true)
    expect(isValidPeriod({ start: '2026-11-02', end: '2026-11-01' })).toBe(false)
  })
})
