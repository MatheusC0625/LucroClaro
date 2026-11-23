import { describe, expect, it } from 'vitest'
import type { MeiSummary } from '../calculations/mei'
import { describeDas, describeMeiStatus } from './meiMessages'

const summary = (overrides: Partial<MeiSummary>): MeiSummary => ({
  yearRevenue: 4_050_000,
  limit: 8_100_000,
  ratio: 0.5,
  remaining: 4_050_000,
  exceededBy: 0,
  level: 'ok',
  projection: null,
  das: { dueDate: '2026-11-20', daysUntil: 2 },
  ...overrides,
})

describe('describeMeiStatus', () => {
  it('diz quanto ainda cabe no limite', () => {
    expect(describeMeiStatus(summary({}))).toBe(
      'Você faturou R$ 40.500,00 este ano, 50% do limite. Ainda cabem R$ 40.500,00.',
    )
  })

  it('alerta a partir de 80%', () => {
    const text = describeMeiStatus(summary({ level: 'warning', ratio: 0.85, remaining: 1_215_000 }))
    expect(text).toBe('Atenção: você já usou 85% do limite do MEI. Faltam R$ 12.150,00 para chegar nele.')
  })

  it('explica o excesso e manda confirmar com fonte oficial', () => {
    const text = describeMeiStatus(summary({ level: 'exceeded', ratio: 1.1, exceededBy: 810_000 }))
    expect(text).toContain('R$ 8.100,00')
    expect(text).toContain('Portal do Empreendedor')
  })

  it('recomenda um contador acima de 20%', () => {
    expect(describeMeiStatus(summary({ level: 'far-exceeded', ratio: 1.3, exceededBy: 2_430_000 }))).toContain('contador')
  })
})

describe('describeDas', () => {
  it('fala em hoje, amanhã ou quantos dias faltam', () => {
    expect(describeDas({ dueDate: '2026-11-20', daysUntil: 0 })).toContain('(hoje)')
    expect(describeDas({ dueDate: '2026-11-20', daysUntil: 1 })).toContain('(amanhã)')
    expect(describeDas({ dueDate: '2026-11-20', daysUntil: 5 })).toBe(
      'O próximo DAS vence em 20/11/2026 (daqui a 5 dias).',
    )
  })
})
