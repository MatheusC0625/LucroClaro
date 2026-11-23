import { describe, expect, it } from 'vitest'
import { parseAmountCell, parseDateCell, parseQuantityCell, parseTextCell } from './cells'

describe('parseTextCell', () => {
  it('limpa espaços e trata "-" e vazio como ausente', () => {
    expect(parseTextCell('  abc ')).toBe('abc')
    expect(parseTextCell('-')).toBeNull()
    expect(parseTextCell('')).toBeNull()
    expect(parseTextCell(null)).toBeNull()
    expect(parseTextCell(58270858372)).toBe('58270858372')
  })
})

describe('parseDateCell', () => {
  it('lê data em texto aaaa-mm-dd, com ou sem hora', () => {
    expect(parseDateCell('2026-11-02')).toBe('2026-11-02')
    expect(parseDateCell('2026-11-02 14:30:00')).toBe('2026-11-02')
  })

  it('lê dd/mm/aaaa', () => {
    expect(parseDateCell('02/11/2026')).toBe('2026-11-02')
  })

  it('lê objeto Date e número de série do Excel', () => {
    expect(parseDateCell(new Date(2026, 10, 2))).toBe('2026-11-02')
    expect(parseDateCell(46328)).toBe('2026-11-02')
  })

  it('rejeita o que não é data', () => {
    expect(parseDateCell('')).toBeNull()
    expect(parseDateCell('ontem')).toBeNull()
    expect(parseDateCell('2026-13-40')).toBeNull()
    expect(parseDateCell(new Date('x'))).toBeNull()
  })
})

describe('parseAmountCell', () => {
  it('converte números da planilha em centavos', () => {
    expect(parseAmountCell(30.72)).toBe(3072)
    expect(parseAmountCell(-4.5)).toBe(-450)
    expect(parseAmountCell(0)).toBe(0)
  })

  it('lê textos com ponto ou vírgula decimal', () => {
    expect(parseAmountCell('0.00')).toBe(0)
    expect(parseAmountCell('22.90')).toBe(2290)
    expect(parseAmountCell('22,90')).toBe(2290)
    expect(parseAmountCell('R$ 1.234,56')).toBe(123456)
    expect(parseAmountCell('1,234.56')).toBe(123456)
    expect(parseAmountCell('1.234')).toBe(123400)
  })

  it('trata "-" e lixo como ausente', () => {
    expect(parseAmountCell('-')).toBeNull()
    expect(parseAmountCell('abc')).toBeNull()
    expect(parseAmountCell('')).toBeNull()
    expect(parseAmountCell(Number.NaN)).toBeNull()
  })
})

describe('parseQuantityCell', () => {
  it('aceita inteiros positivos', () => {
    expect(parseQuantityCell(2)).toBe(2)
    expect(parseQuantityCell('3')).toBe(3)
  })

  it('rejeita zero, decimais e vazio', () => {
    expect(parseQuantityCell(0)).toBeNull()
    expect(parseQuantityCell('1,5')).toBeNull()
    expect(parseQuantityCell('')).toBeNull()
  })
})
