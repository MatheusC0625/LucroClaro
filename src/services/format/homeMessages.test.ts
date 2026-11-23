import { describe, expect, it } from 'vitest'
import { calculateDifference } from '../calculations/comparison'
import { calculateGoalProgress } from '../calculations/goals'
import type { ProfitSummary } from '../calculations/profit'
import { describeGoalAchieved, describeGoalStatus, describeMonthHeadline } from './homeMessages'

const summary = (profit: number, orderCount = 5) => ({ profit, orderCount }) as ProfitSummary

describe('describeMonthHeadline', () => {
  it('compara com o mesmo período do mês passado quando cresceu', () => {
    const text = describeMonthHeadline(summary(31200), summary(26440), calculateDifference(31200, 26440))
    expect(text).toBe(
      'Você lucrou R$ 312,00 este mês, 18% a mais do que no mesmo período do mês passado.',
    )
  })

  it('avisa quando caiu', () => {
    const text = describeMonthHeadline(summary(7500), summary(10000), calculateDifference(7500, 10000))
    expect(text).toBe(
      'Você lucrou R$ 75,00 este mês, 25% a menos do que no mesmo período do mês passado.',
    )
  })

  it('diz quando ficou igual', () => {
    const text = describeMonthHeadline(summary(5000), summary(5000), calculateDifference(5000, 5000))
    expect(text).toContain('o mesmo valor')
  })

  it('não compara quando o mês passado não teve lucro', () => {
    const text = describeMonthHeadline(summary(5000), summary(0), calculateDifference(5000, 0))
    expect(text).toBe('Você lucrou R$ 50,00 este mês.')
  })

  it('fala em prejuízo quando o lucro é negativo', () => {
    const text = describeMonthHeadline(summary(-1500), summary(10000), calculateDifference(-1500, 10000))
    expect(text).toBe('Você teve prejuízo de R$ 15,00 este mês.')
  })

  it('trata o mês sem vendas', () => {
    const text = describeMonthHeadline(summary(0, 0), summary(10000), calculateDifference(0, 10000))
    expect(text).toBe('Você ainda não vendeu nada este mês.')
  })
})

describe('mensagens de meta', () => {
  it('mostra quanto falta para a meta', () => {
    const progress = calculateGoalProgress(8200, 10000)!
    expect(describeGoalAchieved(progress, 'revenue')).toBe('Você vendeu R$ 82,00 de R$ 100,00.')
    expect(describeGoalAchieved(progress, 'profit')).toBe('Você lucrou R$ 82,00 de R$ 100,00.')
    expect(describeGoalStatus(progress)).toBe('Faltam R$ 18,00 para bater sua meta.')
  })

  it('comemora a meta batida e mostra quanto passou', () => {
    expect(describeGoalStatus(calculateGoalProgress(12000, 10000)!)).toBe(
      'Meta batida! Você passou R$ 20,00.',
    )
    expect(describeGoalStatus(calculateGoalProgress(10000, 10000)!)).toBe('Meta batida!')
  })
})
