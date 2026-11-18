import type { GoalMetric } from '../../types/goal'
import type { Cents } from '../../types/money'
import type { ProfitSummary } from './profit'

export interface GoalProgress {
  target: Cents
  achieved: Cents
  remaining: Cents
  ratio: number
  reached: boolean
  exceededBy: Cents
}

export function calculateGoalProgress(
  achieved: Cents,
  target: Cents,
): GoalProgress | null {
  if (target <= 0) return null

  return {
    target,
    achieved,
    remaining: Math.max(0, target - achieved),
    ratio: achieved / target,
    reached: achieved >= target,
    exceededBy: Math.max(0, achieved - target),
  }
}

export function pickGoalMetric(summary: ProfitSummary, metric: GoalMetric): Cents {
  return metric === 'revenue' ? summary.revenue : summary.profit
}
