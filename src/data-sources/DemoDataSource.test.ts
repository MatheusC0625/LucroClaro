import { describe, expect, it } from 'vitest'
import { DemoDataSource } from './DemoDataSource'
import type { OrdersDataSource } from './OrdersDataSource'

describe('DemoDataSource', () => {
  it('entrega pedidos pela mesma interface que a planilha e a API usarão', async () => {
    const source: OrdersDataSource = new DemoDataSource('2026-11-18')
    const orders = await source.getOrders()

    expect(orders.length).toBeGreaterThan(1000)
    expect(orders.every((order) => order.source === 'demo')).toBe(true)
  })
})
