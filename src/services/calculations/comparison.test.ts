import { describe, expect, it } from 'vitest'
import type { Order } from '../../types/order'
import { calculateDifference, comparePeriods } from './comparison'
import type { CostContext } from './profit'

const context: CostContext = {
  products: [{ sku: 'P', name: 'Produto', unitCost: 1000 }],
  extraCosts: [],
  feeSettings: [],
}

const sale = (id: string, createdDate: string, total: number): Order => ({
  id,
  createdDate,
  status: 'completed',
  items: [{ sku: 'P', name: 'Produto', quantity: 1, total }],
  shippingPaidBySeller: 0,
  source: 'demo',
})

describe('calculateDifference', () => {
  it('calcula crescimento em reais e em porcentagem', () => {
    expect(calculateDifference(11800, 10000)).toEqual({ absolute: 1800, percent: 0.18 })
  })

  it('calcula queda como número negativo', () => {
    expect(calculateDifference(7500, 10000)).toEqual({ absolute: -2500, percent: -0.25 })
  })

  it('não inventa porcentagem quando a base é zero', () => {
    expect(calculateDifference(5000, 0)).toEqual({ absolute: 5000, percent: null })
    expect(calculateDifference(0, 0)).toEqual({ absolute: 0, percent: null })
  })

  it('prejuízo que diminui conta como melhora', () => {
    const difference = calculateDifference(-500, -1000)
    expect(difference.absolute).toBe(500)
    expect(difference.percent).toBe(0.5)
  })
})

describe('comparePeriods', () => {
  const orders = [
    sale('A', '2026-11-05', 4000),
    sale('B', '2026-11-10', 4000),
    sale('C', '2025-11-05', 5000),
  ]

  it('compara este mês com o mesmo mês do ano passado', () => {
    const result = comparePeriods(
      orders,
      context,
      { start: '2026-11-01', end: '2026-11-30' },
      { start: '2025-11-01', end: '2025-11-30' },
    )

    expect(result.current.revenue).toBe(8000)
    expect(result.base.revenue).toBe(5000)
    expect(result.revenue).toEqual({ absolute: 3000, percent: 0.6 })
    expect(result.profit.absolute).toBe(2000) 
    expect(result.orderCount.absolute).toBe(1)
  })

  it('um período sem vendas fica zerado e sem porcentagem', () => {
    const result = comparePeriods(
      orders,
      context,
      { start: '2026-11-01', end: '2026-11-30' },
      { start: '2024-11-01', end: '2024-11-30' },
    )
    expect(result.base.orderCount).toBe(0)
    expect(result.revenue.percent).toBeNull()
  })
})
