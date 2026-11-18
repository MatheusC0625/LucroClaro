import { describe, expect, it } from 'vitest'
import { calculateGoalProgress, pickGoalMetric } from './goals'
import type { ProfitSummary } from './profit'

describe('calculateGoalProgress', () => {
  it('mostra quanto falta para bater a meta', () => {
    const progress = calculateGoalProgress(7000, 10000)
    expect(progress).toMatchObject({
      remaining: 3000,
      ratio: 0.7,
      reached: false,
      exceededBy: 0,
    })
  })

  it('marca como batida e mostra quanto passou', () => {
    const progress = calculateGoalProgress(12000, 10000)
    expect(progress).toMatchObject({
      remaining: 0,
      ratio: 1.2,
      reached: true,
      exceededBy: 2000,
    })
  })

  it('meta batida exatamente conta como batida', () => {
    expect(calculateGoalProgress(10000, 10000)?.reached).toBe(true)
  })

  it('retorna null quando não há meta definida', () => {
    expect(calculateGoalProgress(5000, 0)).toBeNull()
  })

  it('com prejuízo, o progresso fica negativo mas o que falta nunca passa da meta', () => {
    const progress = calculateGoalProgress(-1000, 10000)
    expect(progress?.remaining).toBe(11000)
    expect(progress?.reached).toBe(false)
  })
})

describe('pickGoalMetric', () => {
  const summary = { revenue: 9000, profit: 3000 } as ProfitSummary

  it('escolhe faturamento ou lucro', () => {
    expect(pickGoalMetric(summary, 'revenue')).toBe(9000)
    expect(pickGoalMetric(summary, 'profit')).toBe(3000)
  })
})
