import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_GOAL, DEFAULT_MEI_SETTINGS } from '../config/defaults'
import type { Order } from '../types/order'
import { LucroClaroDatabase } from './database'
import { createRepositories, type Repositories } from './repositories'

const order = (id: string, createdDate: string): Order => ({
  id,
  createdDate,
  status: 'completed',
  items: [{ sku: 'P', name: 'Produto', quantity: 1, total: 1000 }],
  shippingPaidBySeller: 0,
  source: 'spreadsheet',
})

let repos: Repositories
let testNumber = 0

beforeEach(() => {
  testNumber += 1
  repos = createRepositories(new LucroClaroDatabase(`teste-${testNumber}`))
})

describe('pedidos', () => {
  it('reimportar o mesmo pedido atualiza em vez de duplicar', async () => {
    const first = await repos.saveOrders([order('A', '2026-11-01'), order('B', '2026-11-02')])
    const second = await repos.saveOrders([order('B', '2026-11-02'), order('C', '2026-11-03')])

    expect(first).toEqual({ added: 2, updated: 0 })
    expect(second).toEqual({ added: 1, updated: 1 })
    expect(await repos.getOrders()).toHaveLength(3)
  })

  it('busca pedidos por período, incluindo as duas pontas', async () => {
    await repos.saveOrders([
      order('A', '2026-10-31'),
      order('B', '2026-11-01'),
      order('C', '2026-11-30'),
      order('D', '2026-12-01'),
    ])
    const found = await repos.getOrdersInPeriod({ start: '2026-11-01', end: '2026-11-30' })
    expect(found.map((o) => o.id).sort()).toEqual(['B', 'C'])
  })
})

describe('custos e taxas', () => {
  it('monta o contexto de cálculo com tudo que foi cadastrado', async () => {
    await repos.saveProduct({ sku: 'P', name: 'Produto', unitCost: 1200 })
    await repos.saveExtraCost({ id: '1', name: 'Sacola', amount: 80, active: true })
    await repos.saveFeeSettings({
      effectiveFrom: '2026-01-01',
      commissionPercent: 14,
      fixedFeePerItem: 400,
    })

    const context = await repos.getCostContext()
    expect(context.products).toHaveLength(1)
    expect(context.extraCosts).toHaveLength(1)
    expect(context.feeSettings[0].commissionPercent).toBe(14)
  })

  it('apagar um custo extra remove só ele', async () => {
    await repos.saveExtraCost({ id: '1', name: 'Sacola', amount: 80, active: true })
    await repos.saveExtraCost({ id: '2', name: 'Etiqueta', amount: 30, active: true })
    await repos.deleteExtraCost('1')
    expect((await repos.getExtraCosts()).map((c) => c.id)).toEqual(['2'])
  })
})

describe('configurações', () => {
  it('devolve os valores padrão antes de o usuário configurar', async () => {
    expect(await repos.getGoal()).toEqual(DEFAULT_GOAL)
    expect(await repos.getMeiSettings()).toEqual(DEFAULT_MEI_SETTINGS)
    expect((await repos.getMeiSettings()).annualLimit).toBe(8_100_000)
  })

  it('guarda a meta e o limite do MEI', async () => {
    await repos.saveGoal({ metric: 'profit', dailyTarget: 5000, monthlyTarget: 150000 })
    await repos.saveMeiSettings({ annualLimit: 8_100_000, dasDueDay: 20, dasAmount: 8205 })

    expect((await repos.getGoal()).monthlyTarget).toBe(150000)
    expect((await repos.getMeiSettings()).dasAmount).toBe(8205)
  })
})

describe('clearAll', () => {
  it('apaga todos os dados do banco', async () => {
    await repos.saveOrders([order('A', '2026-11-01')])
    await repos.saveProduct({ sku: 'P', name: 'Produto', unitCost: 1200 })
    await repos.clearAll()
    expect(await repos.getOrders()).toEqual([])
    expect(await repos.getProducts()).toEqual([])
  })
})
