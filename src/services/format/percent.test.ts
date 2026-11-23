import { describe, expect, it } from 'vitest'
import { formatPercent } from './percent'

describe('formatPercent', () => {
  it('formata com vírgula e no máximo uma casa decimal', () => {
    expect(formatPercent(0.4313)).toBe('43,1%')
    expect(formatPercent(0.18)).toBe('18%')
    expect(formatPercent(1)).toBe('100%')
  })

  it('formata valores negativos', () => {
    expect(formatPercent(-0.25)).toBe('-25%')
  })
})
