import type { Cents } from './money'

export type GoalMetric = 'revenue' | 'profit'

export interface Goal {
  metric: GoalMetric
  dailyTarget: Cents
  monthlyTarget: Cents
}
