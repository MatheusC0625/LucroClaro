import { describe, expect, it } from 'vitest'
import { findLosers, sortProducts } from './productSort'
import type { ProductSummary } from './ranking'

const product = (name: string, unitsSold: number, revenue: number, profit: number, margin: number | null): ProductSummary => ({
  sku: name,
  name,
  unitsSold,
  revenue,
  platformFees: 0,
  productCosts: 0,
  extraCosts: 0,
  shippingCost: 0,
  profit,
  margin,
})

const list = [
  product('B', 5, 5000, 1000, 0.2),
  product('A', 9, 3000, -200, -0.07),
  product('C', 1, 9000, 4000, null),
]

describe('sortProducts', () => {
  it('ordena do maior para o menor pelo critério escolhido', () => {
    expect(sortProducts(list, 'profit').map((p) => p.name)).toEqual(['C', 'B', 'A'])
    expect(sortProducts(list, 'unitsSold').map((p) => p.name)).toEqual(['A', 'B', 'C'])
    expect(sortProducts(list, 'revenue').map((p) => p.name)).toEqual(['C', 'B', 'A'])
  })

  it('coloca margem indisponível por último e não altera a lista original', () => {
    expect(sortProducts(list, 'margin').map((p) => p.name)).toEqual(['B', 'A', 'C'])
    expect(list.map((p) => p.name)).toEqual(['B', 'A', 'C'])
  })
})

describe('findLosers', () => {
  it('acha só os produtos com prejuízo', () => {
    expect(findLosers(list).map((p) => p.name)).toEqual(['A'])
  })
})
