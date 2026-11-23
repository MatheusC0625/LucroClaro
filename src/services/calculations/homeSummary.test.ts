import { describe, expect, it } from 'vitest'
import type { Goal } from '../../types/goal'
import type { Order } from '../../types/order'
import { buildHomeSummary } from './homeSummary'
import type { CostContext } from './profit'

const context: CostContext = {
  products: [{ sku: 'A', name: 'Produto A', unitCost: 1000 }],
  extraCosts: [],
  feeSettings: [],
}

const sale = (id: string, createdDate: string, total: number): Order => ({
  id,
  createdDate,
  status: 'completed',
  items: [{ sku: 'A', name: 'Produto A', quantity: 1, total }],
  shippingPaidBySeller: 0,
  source: 'demo',
})

const goal: Goal = { metric: 'revenue', dailyTarget: 10000, monthlyTarget: 100000 }
const today = '2026-11-18'

describe('buildHomeSummary', () => {
  const orders = [
    sale('hoje', '2026-11-18', 4000),
    sale('semana', '2026-11-16', 3000),
    sale('mes', '2026-11-03', 5000),
    sale('mes-passado-dentro', '2026-10-10', 6000),
    sale('mes-passado-fora', '2026-10-25', 9000),
    sale('futuro-no-mes', '2026-11-25', 2000),
  ]
  const summary = buildHomeSummary(orders, context, goal, today)

  it('separa hoje, semana e mês', () => {
    expect(summary.today.revenue).toBe(4000)
    expect(summary.week.revenue).toBe(7000)
    expect(summary.month.revenue).toBe(14000)
  })

  it('compara o mês só com o mesmo trecho do mês passado', () => {
    expect(summary.previousMonthToDate.revenue).toBe(6000)
    expect(summary.monthProfitDifference.absolute).toBe(summary.month.profit - summary.previousMonthToDate.profit)
  })

  it('calcula o progresso das metas pelo faturamento', () => {
    expect(summary.dailyGoal?.remaining).toBe(6000)
    expect(summary.monthlyGoal?.remaining).toBe(86000)
  })

  it('calcula as metas pelo lucro quando é essa a escolha', () => {
    const byProfit = buildHomeSummary(orders, context, { ...goal, metric: 'profit' }, today)
    expect(byProfit.dailyGoal?.achieved).toBe(3000)
  })

  it('sem metas definidas, não devolve progresso', () => {
    const none = buildHomeSummary(orders, context, { ...goal, dailyTarget: 0, monthlyTarget: 0 }, today)
    expect(none.dailyGoal).toBeNull()
    expect(none.monthlyGoal).toBeNull()
  })

  it('traz o produto campeão do mês', () => {
    expect(summary.champions.bestSeller?.sku).toBe('A')
  })

  it('sem nenhum pedido tudo fica zerado', () => {
    const empty = buildHomeSummary([], context, goal, today)
    expect(empty.month.orderCount).toBe(0)
    expect(empty.champions.bestSeller).toBeNull()
  })
})
