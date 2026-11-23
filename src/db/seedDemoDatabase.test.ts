import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { LucroClaroDatabase } from './database'
import { seedDemoDatabase } from './seedDemoDatabase'

describe('seedDemoDatabase', () => {
  it('preenche o banco com pedidos, produtos, custos, taxas e meta', async () => {
    const db = new LucroClaroDatabase('seed-teste-1')
    await seedDemoDatabase(db, '2026-11-18')

    expect(await db.orders.count()).toBeGreaterThan(1000)
    expect(await db.products.count()).toBe(4)
    expect(await db.extraCosts.count()).toBe(4)
    expect(await db.feeSettings.count()).toBe(2)
    expect(await db.settings.get('goal')).toBeDefined()
  })

  it('no mesmo dia não recria os dados, e no dia seguinte atualiza', async () => {
    const db = new LucroClaroDatabase('seed-teste-2')
    await seedDemoDatabase(db, '2026-11-18')
    await db.orders.put({
      id: 'SENTINELA',
      createdDate: '2026-11-18',
      status: 'completed',
      items: [],
      shippingPaidBySeller: 0,
      source: 'demo',
    })

    await seedDemoDatabase(db, '2026-11-18')
    expect(await db.orders.get('SENTINELA')).toBeDefined()

    await seedDemoDatabase(db, '2026-11-19')
    expect(await db.orders.get('SENTINELA')).toBeUndefined()
  })
})
