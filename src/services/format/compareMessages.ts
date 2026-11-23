import type { Difference, PeriodComparison } from '../calculations/comparison'
import { formatCurrency } from './currency'
import { formatPercent } from './percent'

export type ChangeDirection = 'up' | 'down' | 'same'

export interface ChangeDescription {
  direction: ChangeDirection
  text: string
}

export function describeChange(
  difference: Difference,
  baseValue: number,
  format: (value: number) => string,
): ChangeDescription {
  if (difference.absolute === 0) return { direction: 'same', text: 'Igual' }

  const direction = difference.absolute > 0 ? 'up' : 'down'
  const size = format(Math.abs(difference.absolute))
  const word = direction === 'up' ? 'a mais' : 'a menos'
  const percent =
    difference.percent !== null && baseValue > 0
      ? ` (${formatPercent(Math.abs(difference.percent))})`
      : ''
  return { direction, text: `${size} ${word}${percent}` }
}

export function describeMarginChange(
  current: number | null,
  base: number | null,
): ChangeDescription | null {
  if (current === null || base === null) return null

  const points = Math.round((current - base) * 1000) / 10
  if (points === 0) return { direction: 'same', text: 'Igual' }

  const size = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(Math.abs(points))
  return {
    direction: points > 0 ? 'up' : 'down',
    text: `${size} pontos percentuais ${points > 0 ? 'a mais' : 'a menos'}`,
  }
}

export function describeComparison(comparison: PeriodComparison): string[] {
  const { current, base } = comparison

  if (current.orderCount === 0 && base.orderCount === 0) {
    return ['Não houve vendas em nenhum dos dois períodos.']
  }
  if (base.orderCount === 0) {
    return ['No período de comparação não houve vendas, então não dá para ver a diferença.']
  }
  if (current.orderCount === 0) {
    return [
      `Não houve vendas no período atual. No de comparação você lucrou ${formatCurrency(base.profit)}.`,
    ]
  }

  const profit = describeChange(comparison.profit, base.profit, formatCurrency)
  const revenue = describeChange(comparison.revenue, base.revenue, formatCurrency)

  return [
    profit.direction === 'same'
      ? 'O lucro foi o mesmo nos dois períodos.'
      : `Você lucrou ${profit.text} no período atual.`,
    revenue.direction === 'same'
      ? 'As vendas foram as mesmas nos dois períodos.'
      : `Você vendeu ${revenue.text} no período atual.`,
  ]
}
