import { describe, expect, it } from 'vitest'
import type { Order, OrderStatus } from '../../types/order'
import { findUnregisteredProducts } from './catalog'

const order = (id: string, skus: string[], status: OrderStatus = 'completed'): Order => ({
  id,
  createdDate: '2026-11-10',
  status,
  items: skus.map((sku) => ({ sku, name: `Produto ${sku}`, quantity: 1, total: 1000 })),
  shippingPaidBySeller: 0,
  source: 'spreadsheet',
})

describe('findUnregisteredProducts', () => {
  const products = [{ sku: 'A', name: 'Produto A', unitCost: 500 }]

  it('lista só os produtos vendidos que ainda não têm custo cadastrado', () => {
    const result = findUnregisteredProducts([order('1', ['A', 'B'])], products)
    expect(result).toEqual([{ sku: 'B', name: 'Produto B', saleCount: 1 }])
  })

  it('conta quantas vezes cada um foi vendido e mostra o mais vendido primeiro', () => {
    const orders = [order('1', ['B']), order('2', ['C']), order('3', ['C']), order('4', ['C', 'B'])]
    const result = findUnregisteredProducts(orders, products)
    expect(result.map((p) => [p.sku, p.saleCount])).toEqual([
      ['C', 3],
      ['B', 2],
    ])
  })

  it('ignora pedidos cancelados e devolvidos', () => {
    const orders = [order('1', ['B'], 'cancelled'), order('2', ['C'], 'returned')]
    expect(findUnregisteredProducts(orders, products)).toEqual([])
  })

  it('não devolve nada quando tudo está cadastrado', () => {
    expect(findUnregisteredProducts([order('1', ['A'])], products)).toEqual([])
  })
})
