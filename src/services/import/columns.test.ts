import { describe, expect, it } from 'vitest'
import { missingRequiredFields, normalizeHeader, suggestMapping } from './columns'

describe('normalizeHeader', () => {
  it('ignora acentos, maiúsculas e espaços extras', () => {
    expect(normalizeHeader('  Data de Criação  do pedido ')).toBe('data de criacao do pedido')
    expect(normalizeHeader(null)).toBe('')
  })
})

describe('suggestMapping', () => {
  const headers = [
    'Número da sequência',
    'Ver',
    'ID do pedido',
    'SKU',
    'Nome do produto',
    'Data de criação do pedido',
    'Quantia total lançada (R$)',
    'Preço do produto',
  ]

  it('reconhece as colunas do relatório Minha Renda', () => {
    expect(suggestMapping(headers)).toEqual({
      rowType: 1,
      orderId: 2,
      sku: 3,
      productName: 4,
      createdDate: 5,
      netAmount: 6,
      itemTotal: 7,
    })
  })

  it('deixa sem sugestão o que não encontra', () => {
    const mapping = suggestMapping(['Coluna A', 'Coluna B'])
    expect(mapping).toEqual({})
    expect(missingRequiredFields(mapping)).toEqual(['orderId', 'productName', 'createdDate', 'itemTotal'])
  })
})

describe('missingRequiredFields', () => {
  it('não reclama de campos opcionais', () => {
    expect(missingRequiredFields({ orderId: 0, productName: 1, createdDate: 2, itemTotal: 3 })).toEqual([])
  })
})
