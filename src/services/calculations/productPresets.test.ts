import { describe, expect, it } from 'vitest'
import { getProductPeriodPresets } from './productPresets'

describe('getProductPeriodPresets', () => {
  const presets = Object.fromEntries(
    getProductPeriodPresets('2026-11-18', '2025-01-05').map((p) => [p.id, p.period]),
  )

  it('monta os períodos até hoje', () => {
    expect(presets['mes']).toEqual({ start: '2026-11-01', end: '2026-11-18' })
    expect(presets['90-dias']).toEqual({ start: '2026-08-21', end: '2026-11-18' })
    expect(presets['ano']).toEqual({ start: '2026-01-01', end: '2026-11-18' })
  })

  it('o mês passado é o mês inteiro', () => {
    expect(presets['mes-passado']).toEqual({ start: '2026-10-01', end: '2026-10-31' })
  })

  it('"tudo" começa no primeiro pedido, ou hoje se não houver pedidos', () => {
    expect(presets['tudo']).toEqual({ start: '2025-01-05', end: '2026-11-18' })
    const empty = getProductPeriodPresets('2026-11-18', null).find((p) => p.id === 'tudo')
    expect(empty?.period).toEqual({ start: '2026-11-18', end: '2026-11-18' })
  })

  it('em janeiro o mês passado é dezembro do ano anterior', () => {
    const january = getProductPeriodPresets('2026-01-10', null).find((p) => p.id === 'mes-passado')
    expect(january?.period).toEqual({ start: '2025-12-01', end: '2025-12-31' })
  })
})
