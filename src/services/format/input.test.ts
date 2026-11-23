import { describe, expect, it } from 'vitest'
import { formatCentsAsInput, formatPercentInput, parsePercentInput } from './input'
import { parseCurrencyInput } from './currency'

describe('formatCentsAsInput', () => {
  it('mostra o valor como o usuário digitaria, sem R$', () => {
    expect(formatCentsAsInput(1200)).toBe('12,00')
    expect(formatCentsAsInput(5)).toBe('0,05')
    expect(formatCentsAsInput(123456)).toBe('1234,56')
    expect(formatCentsAsInput(0)).toBe('0,00')
  })

  it('o texto mostrado pode ser lido de volta sem perder nada', () => {
    for (const cents of [0, 5, 80, 1200, 99999, 8100000]) {
      expect(parseCurrencyInput(formatCentsAsInput(cents))).toBe(cents)
    }
  })
})

describe('parsePercentInput', () => {
  it('lê porcentagens digitadas', () => {
    expect(parsePercentInput('14')).toBe(14)
    expect(parsePercentInput('14,5')).toBe(14.5)
    expect(parsePercentInput('14%')).toBe(14)
    expect(parsePercentInput('100')).toBe(100)
    expect(parsePercentInput('0')).toBe(0)
  })

  it('rejeita o que não é uma porcentagem válida', () => {
    expect(parsePercentInput('')).toBeNull()
    expect(parsePercentInput('abc')).toBeNull()
    expect(parsePercentInput('101')).toBeNull()
    expect(parsePercentInput('14,555')).toBeNull()
    expect(parsePercentInput('-3')).toBeNull()
  })
})

describe('formatPercentInput', () => {
  it('usa vírgula como separador', () => {
    expect(formatPercentInput(14)).toBe('14')
    expect(formatPercentInput(14.5)).toBe('14,5')
  })
})
