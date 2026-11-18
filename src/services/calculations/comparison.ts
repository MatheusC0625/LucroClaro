import type { Order } from '../../types/order'
import type { Period } from '../../types/period'
import { filterOrdersByPeriod } from './periods'
import { summarizeProfit, type CostContext, type ProfitSummary } from './profit'

export interface Difference {
  absolute: number
  percent: number | null
}

export interface PeriodComparison {
  current: ProfitSummary
  base: ProfitSummary
  revenue: Difference
  profit: Difference
  orderCount: Difference
}


export function calculateDifference(current: number, base: number): Difference {
  return {
    absolute: current - base,
    percent: base === 0 ? null : (current - base) / Math.abs(base),
  }
}

export function comparePeriods(
  orders: Order[],
  context: CostContext,
  currentPeriod: Period,
  basePeriod: Period,
): PeriodComparison {
  const current = summarizeProfit(filterOrdersByPeriod(orders, currentPeriod), context)
  const base = summarizeProfit(filterOrdersByPeriod(orders, basePeriod), context)

  return {
    current,
    base,
    revenue: calculateDifference(current.revenue, base.revenue),
    profit: calculateDifference(current.profit, base.profit),
    orderCount: calculateDifference(current.orderCount, base.orderCount),
  }
}
