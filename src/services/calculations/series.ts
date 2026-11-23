import type { Order } from '../../types/order'
import type { ISODate, Period } from '../../types/period'
import { addDays } from '../format/date'
import { filterOrdersByPeriod } from './periods'
import { calculateOrderProfit, type CostContext } from './profit'

export function cumulativeProfitSeries(
  orders: Order[],
  context: CostContext,
  period: Period,
  today: ISODate,
): number[] {
  const end = period.end > today ? today : period.end
  if (period.start > end) return []

  const profitByDate = new Map<ISODate, number>()
  for (const order of filterOrdersByPeriod(orders, { start: period.start, end })) {
    if (order.status !== 'completed') continue
    const profit = calculateOrderProfit(order, context).profit
    profitByDate.set(order.createdDate, (profitByDate.get(order.createdDate) ?? 0) + profit)
  }

  const series: number[] = []
  let total = 0
  for (let date = period.start; date <= end; date = addDays(date, 1)) {
    total += profitByDate.get(date) ?? 0
    series.push(total)
  }
  return series
}
