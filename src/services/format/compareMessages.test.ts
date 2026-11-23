import { describe, expect, it } from 'vitest'
import { calculateDifference, type PeriodComparison } from '../calculations/comparison'
import type { ProfitSummary } from '../calculations/profit'
import { formatCurrency } from './currency'
import { describeChange, describeComparison, describeMarginChange } from './compareMessages'

const summary = (orderCount: number, revenue: number, profit: number) =>
  ({ orderCount, revenue, profit }) as ProfitSummary

const comparison = (current: ProfitSummary, base: ProfitSummary): PeriodComparison => ({
  current,
  base,
  revenue: calculateDifference(current.revenue, base.revenue),
  profit: calculateDifference(current.profit, base.profit),
  orderCount: calculateDifference(current.orderCount, base.orderCount),
})

describe('describeChange', () => {
  it('descreve aumento com porcentagem', () => {
    expect(describeChange(calculateDifference(11800, 10000), 10000, formatCurrency)).toEqual({
      direction: 'up',
      text: 'R$ 18,00 a mais (18%)',
    })
  })

  it('descreve queda', () => {
    expect(describeChange(calculateDifference(7500, 10000), 10000, formatCurrency)).toEqual({
      direction: 'down',
      text: 'R$ 25,00 a menos (25%)',
    })
  })

  it('não mostra porcentagem quando a base é zero ou negativa', () => {
    expect(describeChange(calculateDifference(5000, 0), 0, formatCurrency).text).toBe('R$ 50,00 a mais')
    expect(describeChange(calculateDifference(500, -1000), -1000, formatCurrency).text).toBe('R$ 15,00 a mais')
  })

  it('diz quando é igual', () => {
    expect(describeChange(calculateDifference(5, 5), 5, String).direction).toBe('same')
  })
})

describe('describeMarginChange', () => {
  it('mostra a diferença em pontos percentuais', () => {
    expect(describeMarginChange(0.35, 0.3)).toEqual({
      direction: 'up',
      text: '5 pontos percentuais a mais',
    })
    expect(describeMarginChange(0.254, 0.3)?.text).toBe('4,6 pontos percentuais a menos')
  })

  it('devolve null sem margem em um dos lados', () => {
    expect(describeMarginChange(null, 0.3)).toBeNull()
  })
})

describe('describeComparison', () => {
  it('explica lucro e vendas em frases', () => {
    const result = describeComparison(
      comparison(summary(10, 50000, 15000), summary(8, 40000, 10000)),
    )
    expect(result).toEqual([
      'Você lucrou R$ 50,00 a mais (50%) no período atual.',
      'Você vendeu R$ 100,00 a mais (25%) no período atual.',
    ])
  })

  it('avisa quando um dos períodos não tem vendas', () => {
    expect(describeComparison(comparison(summary(3, 100, 50), summary(0, 0, 0)))[0]).toContain(
      'não houve vendas',
    )
    expect(describeComparison(comparison(summary(0, 0, 0), summary(0, 0, 0)))[0]).toBe(
      'Não houve vendas em nenhum dos dois períodos.',
    )
    expect(describeComparison(comparison(summary(0, 0, 0), summary(3, 100, 50)))[0]).toContain(
      'Não houve vendas no período atual',
    )
  })
})
