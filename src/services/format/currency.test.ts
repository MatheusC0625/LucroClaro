import { describe, expect, it } from 'vitest'
import { formatCurrency, parseCurrencyInput, reaisToCents } from './currency'

describe('formatCurrency', () => {
  it('formata no padrão brasileiro', () => {
    expect(formatCurrency(123456)).toBe('R$ 1.234,56')
  })

  it('formata zero e centavos soltos', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
    expect(formatCurrency(5)).toBe('R$ 0,05')
  })

  it('formata valores negativos (prejuízo)', () => {
    expect(formatCurrency(-500)).toBe('-R$ 5,00')
  })

  it('formata milhões com separador de milhar', () => {
    expect(formatCurrency(8100000)).toBe('R$ 81.000,00')
  })
})

describe('reaisToCents', () => {
  it('converte valores da planilha sem erro de ponto flutuante', () => {
    expect(reaisToCents(30.72)).toBe(3072)
    expect(reaisToCents(1.005)).toBe(101)
    expect(reaisToCents(-4.5)).toBe(-450)
    expect(reaisToCents(-1.005)).toBe(-101)
    expect(reaisToCents(0)).toBe(0)
  })
})

describe('parseCurrencyInput', () => {
  it('lê valores digitados pelo usuário', () => {
    expect(parseCurrencyInput('12')).toBe(1200)
    expect(parseCurrencyInput('12,5')).toBe(1250)
    expect(parseCurrencyInput('12,50')).toBe(1250)
    expect(parseCurrencyInput('1.234,56')).toBe(123456)
    expect(parseCurrencyInput('R$ 12,00')).toBe(1200)
  })

  it('rejeita textos inválidos', () => {
    expect(parseCurrencyInput('')).toBeNull()
    expect(parseCurrencyInput('abc')).toBeNull()
    expect(parseCurrencyInput('12,345')).toBeNull()
    expect(parseCurrencyInput('-5')).toBeNull()
  })
})
