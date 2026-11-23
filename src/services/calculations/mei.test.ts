import { describe, expect, it } from 'vitest'
import { DEFAULT_MEI_SETTINGS } from '../../config/defaults'
import type { Order } from '../../types/order'
import {
  buildMeiSummary,
  calculateYearRevenue,
  getEffectiveLimit,
  getMeiLevel,
  getNextDasDueDate,
  projectYear,
} from './mei'

const sale = (id: string, createdDate: string, total: number, status: Order['status'] = 'completed'): Order => ({
  id,
  createdDate,
  status,
  items: [{ sku: 'A', name: 'A', quantity: 1, total }],
  shippingPaidBySeller: 0,
  source: 'demo',
})

describe('getMeiLevel', () => {
  it('muda de nível em 80%, 100% e 120%', () => {
    expect(getMeiLevel(0.79)).toBe('ok')
    expect(getMeiLevel(0.8)).toBe('warning')
    expect(getMeiLevel(1)).toBe('warning')
    expect(getMeiLevel(1.01)).toBe('exceeded')
    expect(getMeiLevel(1.2)).toBe('exceeded')
    expect(getMeiLevel(1.21)).toBe('far-exceeded')
  })
})

describe('getEffectiveLimit', () => {
  it('usa o limite cheio para quem já era MEI antes do ano', () => {
    expect(getEffectiveLimit(DEFAULT_MEI_SETTINGS, '2026-11-18')).toBe(8_100_000)
    expect(getEffectiveLimit({ ...DEFAULT_MEI_SETTINGS, openingDate: '2025-05-10' }, '2026-11-18')).toBe(8_100_000)
  })

  it('proporcional aos meses de atividade para quem abriu no ano', () => {
    const settings = { ...DEFAULT_MEI_SETTINGS, openingDate: '2026-07-15' }
    expect(getEffectiveLimit(settings, '2026-11-18')).toBe(4_050_000)
  })
})

describe('calculateYearRevenue', () => {
  it('soma só pedidos concluídos do ano atual, até hoje', () => {
    const orders = [
      sale('1', '2026-01-02', 10000),
      sale('2', '2026-11-18', 5000),
      sale('3', '2025-12-31', 99999),
      sale('4', '2026-05-05', 7000, 'cancelled'),
      sale('5', '2026-12-01', 3000),
    ]
    expect(calculateYearRevenue(orders, '2026-11-18')).toBe(15000)
  })
})

describe('projectYear', () => {
  it('projeta o ano pelo ritmo e acha quando o limite seria atingido', () => {
    const projection = projectYear(1_000_000, 2_000_000, '2026-01-01', '2026-01-10')
    expect(projection?.projectedYearTotal).toBe(36_500_000)
    expect(projection?.limitReachedOn).toBe('2026-01-20')
  })

  it('não marca data de limite se o ritmo não chega lá no ano', () => {
    expect(projectYear(100_000, 8_100_000, '2026-01-01', '2026-11-18')?.limitReachedOn).toBeNull()
  })

  it('sem faturamento não há projeção', () => {
    expect(projectYear(0, 8_100_000, '2026-01-01', '2026-11-18')).toBeNull()
  })
})

describe('getNextDasDueDate', () => {
  it('usa o vencimento deste mês se ainda não passou', () => {
    expect(getNextDasDueDate('2026-11-18', 20)).toBe('2026-11-20')
    expect(getNextDasDueDate('2026-11-20', 20)).toBe('2026-11-20')
  })

  it('passa para o mês seguinte depois do vencimento', () => {
    expect(getNextDasDueDate('2026-11-21', 20)).toBe('2026-12-20')
    expect(getNextDasDueDate('2026-12-28', 20)).toBe('2027-01-20')
  })

  it('ajusta dia 31 para meses curtos', () => {
    expect(getNextDasDueDate('2026-02-10', 31)).toBe('2026-02-28')
  })
})

describe('buildMeiSummary', () => {
  it('junta tudo: faturado, restante, nível e lembrete do DAS', () => {
    const summary = buildMeiSummary([sale('1', '2026-03-01', 6_480_000)], DEFAULT_MEI_SETTINGS, '2026-11-18')

    expect(summary.ratio).toBe(0.8)
    expect(summary.level).toBe('warning')
    expect(summary.remaining).toBe(1_620_000)
    expect(summary.exceededBy).toBe(0)
    expect(summary.das).toEqual({ dueDate: '2026-11-20', daysUntil: 2 })
  })

  it('mostra quanto passou do limite', () => {
    const summary = buildMeiSummary([sale('1', '2026-03-01', 9_000_000)], DEFAULT_MEI_SETTINGS, '2026-11-18')
    expect(summary.level).toBe('exceeded')
    expect(summary.exceededBy).toBe(900_000)
    expect(summary.remaining).toBe(0)
  })
})
