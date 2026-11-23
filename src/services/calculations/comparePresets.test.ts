import { describe, expect, it } from 'vitest'
import { getComparePresets } from './comparePresets'
import { shiftPeriodByDays } from './periods'

describe('getComparePresets', () => {
  const presets = Object.fromEntries(getComparePresets('2026-11-18').map((p) => [p.id, p]))

  it('compara o mês até hoje com o mesmo trecho do mês passado', () => {
    expect(presets['mes-passado'].current).toEqual({ start: '2026-11-01', end: '2026-11-18' })
    expect(presets['mes-passado'].base).toEqual({ start: '2026-10-01', end: '2026-10-18' })
  })

  it('compara com o mesmo trecho do ano passado', () => {
    expect(presets['mes-ano-passado'].base).toEqual({ start: '2025-11-01', end: '2025-11-18' })
  })

  it('compara a semana até hoje com os mesmos dias da semana passada', () => {
    expect(presets['semana-passada'].current).toEqual({ start: '2026-11-16', end: '2026-11-18' })
    expect(presets['semana-passada'].base).toEqual({ start: '2026-11-09', end: '2026-11-11' })
  })

  it('compara hoje com ontem', () => {
    expect(presets['ontem'].base).toEqual({ start: '2026-11-17', end: '2026-11-17' })
  })
})

describe('shiftPeriodByDays', () => {
  it('desloca o período inteiro', () => {
    expect(shiftPeriodByDays({ start: '2026-11-01', end: '2026-11-03' }, -7)).toEqual({
      start: '2026-10-25',
      end: '2026-10-27',
    })
  })
})
