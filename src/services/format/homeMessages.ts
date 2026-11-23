import type { Difference } from '../calculations/comparison'
import type { GoalProgress } from '../calculations/goals'
import type { ProfitSummary } from '../calculations/profit'
import type { GoalMetric } from '../../types/goal'
import { formatCurrency } from './currency'
import { formatPercent } from './percent'

export function describeMonthHeadline(
  month: ProfitSummary,
  previous: ProfitSummary,
  difference: Difference,
): string {
  if (month.orderCount === 0) return 'Você ainda não vendeu nada este mês.'

  const base =
    month.profit >= 0
      ? `Você lucrou ${formatCurrency(month.profit)} este mês`
      : `Você teve prejuízo de ${formatCurrency(-month.profit)} este mês`

  if (month.profit < 0 || previous.profit <= 0 || difference.percent === null) {
    return `${base}.`
  }
  if (difference.absolute === 0) {
    return `${base}, o mesmo valor do mesmo período do mês passado.`
  }

  const size = formatPercent(Math.abs(difference.percent))
  const direction = difference.absolute > 0 ? 'a mais' : 'a menos'
  return `${base}, ${size} ${direction} do que no mesmo período do mês passado.`
}

export function describeGoalAchieved(progress: GoalProgress, metric: GoalMetric): string {
  const verb = metric === 'revenue' ? 'vendeu' : 'lucrou'
  return `Você ${verb} ${formatCurrency(progress.achieved)} de ${formatCurrency(progress.target)}.`
}

export function describeGoalStatus(progress: GoalProgress): string {
  if (!progress.reached) {
    return `Faltam ${formatCurrency(progress.remaining)} para bater sua meta.`
  }
  if (progress.exceededBy === 0) return 'Meta batida!'
  return `Meta batida! Você passou ${formatCurrency(progress.exceededBy)}.`
}
