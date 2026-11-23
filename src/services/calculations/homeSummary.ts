import type { Goal } from '../../types/goal'
import type { Order } from '../../types/order'
import type { ISODate } from '../../types/period'
import { calculateDifference, type Difference } from './comparison'
import { calculateGoalProgress, pickGoalMetric, type GoalProgress } from './goals'
import {
  filterOrdersByPeriod,
  getDayPeriod,
  getMonthPeriod,
  getPreviousMonthToDate,
  getWeekPeriod,
} from './periods'
import { summarizeProfit, type CostContext, type ProfitSummary } from './profit'
import { findChampions, summarizeByProduct, type Champions } from './ranking'

export interface HomeSummary {
  today: ProfitSummary
  week: ProfitSummary
  month: ProfitSummary
  previousMonthToDate: ProfitSummary
  monthProfitDifference: Difference
  dailyGoal: GoalProgress | null
  monthlyGoal: GoalProgress | null
  champions: Champions
}

export function buildHomeSummary(
  orders: Order[],
  context: CostContext,
  goal: Goal,
  today: ISODate,
): HomeSummary {
  const summarize = (period: { start: ISODate; end: ISODate }) =>
    summarizeProfit(filterOrdersByPeriod(orders, period), context)

  const monthPeriod = getMonthPeriod(today)
  const todaySummary = summarize(getDayPeriod(today))
  const month = summarize(monthPeriod)
  const previousMonthToDate = summarize(getPreviousMonthToDate(today))

  return {
    today: todaySummary,
    week: summarize(getWeekPeriod(today)),
    month,
    previousMonthToDate,
    monthProfitDifference: calculateDifference(month.profit, previousMonthToDate.profit),
    dailyGoal: calculateGoalProgress(
      pickGoalMetric(todaySummary, goal.metric),
      goal.dailyTarget,
    ),
    monthlyGoal: calculateGoalProgress(pickGoalMetric(month, goal.metric), goal.monthlyTarget),
    champions: findChampions(
      summarizeByProduct(filterOrdersByPeriod(orders, monthPeriod), context),
    ),
  }
}
