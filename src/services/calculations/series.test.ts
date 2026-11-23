import { describe, expect, it } from 'vitest'
import type { Order } from '../../types/order'
import type { CostContext } from './profit'
import { cumulativeProfitSeries } from './series'

const context: CostContext = {
  products: [{ sku: 'A', name: 'A', unitCost: 1000 }],
  extraCosts: [],
  feeSettings: [],
}

const sale = (id: string, createdDate: string, total: number, status: Order['status'] = 'completed'): Order => ({
  id,
  createdDate,
  status,
  items: [{ sku: 'A', name: 'A', quantity: 1, total }],
  shippingPaidBySeller: 0,
  source: 'demo',
})

describe('cumulativeProfitSeries', () => {
  const orders = [
    sale('1', '2026-11-01', 3000),
    sale('2', '2026-11-01', 2000),
    sale('3', '2026-11-03', 4000),
    sale('4', '2026-11-02', 9000, 'cancelled'),
  ]

  it('acumula o lucro dia a dia, com um valor por dia do período', () => {
    const series = cumulativeProfitSeries(orders, context, { start: '2026-11-01', end: '2026-11-04' }, '2026-11-30')
    expect(series).toEqual([3000, 3000, 6000, 6000])
  })

  it('não passa de hoje', () => {
    const series = cumulativeProfitSeries(orders, context, { start: '2026-11-01', end: '2026-11-30' }, '2026-11-03')
    expect(series).toHaveLength(3)
  })

  it('período inteiro no futuro fica vazio', () => {
    expect(cumulativeProfitSeries(orders, context, { start: '2026-12-01', end: '2026-12-10' }, '2026-11-03')).toEqual([])
  })
})
