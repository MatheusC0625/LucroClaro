import { describe, expect, it } from 'vitest'
import type { Order } from '../../types/order'
import { findChampions, summarizeByProduct } from './ranking'
import type { CostContext } from './profit'

const context: CostContext = {
  products: [
    { sku: 'A', name: 'Produto A', unitCost: 1000 },
    { sku: 'B', name: 'Produto B', unitCost: 500 },
    { sku: 'C', name: 'Produto C', unitCost: 3000 },
  ],
  extraCosts: [],
  feeSettings: [],
}

const sale = (
  id: string,
  sku: string,
  total: number,
  quantity = 1,
  status: Order['status'] = 'completed',
): Order => ({
  id,
  createdDate: '2026-11-10',
  status,
  items: [{ sku, name: `Produto ${sku}`, quantity, total }],
  shippingPaidBySeller: 0,
  source: 'demo',
})

describe('summarizeByProduct', () => {
  it('soma vendas, faturamento, custo e lucro de cada produto', () => {
    const orders = [sale('1', 'A', 2000), sale('2', 'A', 2000, 2), sale('3', 'B', 1500)]
    const result = summarizeByProduct(orders, context)
    const a = result.find((p) => p.sku === 'A')!

    expect(a.unitsSold).toBe(3)
    expect(a.revenue).toBe(4000)
    expect(a.productCosts).toBe(3000)
    expect(a.profit).toBe(1000)
    expect(a.margin).toBe(0.25)
  })

  it('ignora pedidos cancelados e devolvidos', () => {
    const orders = [sale('1', 'A', 2000), sale('2', 'A', 2000, 1, 'cancelled')]
    expect(summarizeByProduct(orders, context)[0].unitsSold).toBe(1)
  })

  it('mostra prejuízo como lucro negativo e margem negativa', () => {
    const [c] = summarizeByProduct([sale('1', 'C', 2000)], context)
    expect(c.profit).toBe(-1000)
    expect(c.margin).toBe(-0.5)
  })

  it('sem pedidos devolve lista vazia', () => {
    expect(summarizeByProduct([], context)).toEqual([])
  })
})

describe('findChampions', () => {
  it('o mais vendido e o mais lucrativo podem ser produtos diferentes', () => {
    const orders = [
      sale('1', 'B', 800, 1),
      sale('2', 'B', 800, 1),
      sale('3', 'B', 800, 1),
      sale('4', 'A', 5000, 1),
    ]
    const champions = findChampions(summarizeByProduct(orders, context))

    expect(champions.bestSeller?.sku).toBe('B')
    expect(champions.mostProfitable?.sku).toBe('A')
  })

  it('desempata o mais vendido pelo lucro', () => {
    const orders = [sale('1', 'A', 2000), sale('2', 'B', 2000)]
    const champions = findChampions(summarizeByProduct(orders, context))
    expect(champions.bestSeller?.sku).toBe('B')
  })

  it('não coroa como mais lucrativo um produto que só dá prejuízo', () => {
    const champions = findChampions(summarizeByProduct([sale('1', 'C', 2000)], context))
    expect(champions.bestSeller?.sku).toBe('C')
    expect(champions.mostProfitable).toBeNull()
  })

  it('sem produtos não há campeões', () => {
    expect(findChampions([])).toEqual({ bestSeller: null, mostProfitable: null })
  })
})
