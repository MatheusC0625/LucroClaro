import { describe, expect, it } from 'vitest'
import { suggestMapping } from './columns'
import { normalizeOrders } from './normalizeOrders'

const headers = [
  'Ver',
  'ID do pedido',
  'SKU',
  'Nome do produto',
  'Data de criação do pedido',
  'Quantia total lançada (R$)',
  'Preço do produto',
]

const rows: unknown[][] = [
  ['Order', 'PED-A', '-', '-', '2026-11-02', 20.08, 30.72],
  ['Sku', 'PED-A', '111', 'Babuche Teste', '2026-11-02', 20.08, 30.72],
  ['Order', 'PED-B', '-', '-', '2026-10-21', 23.03, 33.82],
  ['Sku', 'PED-B', '222', 'Lip Gloss Teste', '2026-10-21', 12.24, 20.92],
  ['Sku', 'PED-B', 333, 'Blush Teste', '2026-10-21', 10.79, 12.9],
]

const mapping = suggestMapping(headers)

describe('normalizeOrders (relatório Minha Renda)', () => {
  const result = normalizeOrders(rows, mapping)

  it('cria um pedido por ID, usando só as linhas de produto como itens', () => {
    expect(result.orders.map((o) => [o.id, o.items.length])).toEqual([
      ['PED-B', 2],
      ['PED-A', 1],
    ])
  })

  it('guarda o valor real depositado e o preço de cada item, em centavos', () => {
    const order = result.orders.find((o) => o.id === 'PED-A')!
    expect(order.items[0]).toEqual({
      sku: '111',
      name: 'Babuche Teste',
      quantity: 1,
      total: 3072,
      payout: 2008,
    })
    expect(order.source).toBe('spreadsheet')
    expect(order.status).toBe('completed')
    expect(order.createdDate).toBe('2026-11-02')
  })

  it('ordena por data', () => {
    expect(result.orders.map((o) => o.createdDate)).toEqual(['2026-10-21', '2026-11-02'])
  })

  it('avisa que a quantidade foi assumida como 1', () => {
    expect(result.quantityAssumed).toBe(true)
  })

  it('não gera avisos quando tudo bate', () => {
    expect(result.warnings).toEqual([])
  })
})

describe('normalizeOrders (situações problemáticas)', () => {
  it('avisa quando a soma dos itens não bate com o total do pedido', () => {
    const broken = [rows[0], ['Sku', 'PED-A', '111', 'Babuche Teste', '2026-11-02', 19.0, 30.72]]
    const result = normalizeOrders(broken, mapping)
    expect(result.warnings[0]).toContain('PED-A')
  })

  it('ignora linhas com data ou valor inválido e conta quantas', () => {
    const bad = [
      ['Sku', 'PED-X', '1', 'Produto', 'data ruim', 10, 10],
      ['Sku', 'PED-Y', '2', 'Produto', '2026-11-02', 10, '-'],
      ['Sku', 'PED-Z', '3', 'Produto', '2026-11-02', 10, 10],
    ]
    const result = normalizeOrders(bad, mapping)
    expect(result.skippedRows).toBe(2)
    expect(result.orders.map((o) => o.id)).toEqual(['PED-Z'])
    expect(result.warnings.at(-1)).toContain('2 linhas foram ignoradas')
  })

  it('ignora pedido que só tem a linha de total, sem produtos', () => {
    const result = normalizeOrders([rows[0]], mapping)
    expect(result.orders).toEqual([])
    expect(result.warnings[0]).toContain('não tem nenhum produto')
  })

  it('sem a coluna de tipo, cada linha é um produto; sem valor líquido, o pedido é estimado', () => {
    const simpleMapping = { orderId: 0, productName: 1, createdDate: 2, itemTotal: 3, quantity: 4 }
    const result = normalizeOrders(
      [['P1', 'Produto', '02/11/2026', '39,90', 2]],
      simpleMapping,
    )
    expect(result.orders[0].items[0]).toEqual({ sku: 'Produto', name: 'Produto', quantity: 2, total: 3990 })
    expect(result.quantityAssumed).toBe(false)
  })

  it('não lê nenhuma coluna fora do mapeamento (dados pessoais ficam de fora)', () => {
    const withPersonal = [['Sku', 'PED-P', '9', 'Produto', '2026-11-02', 10, 10, 'usuario_comprador', 'Nome Banco']]
    const [order] = normalizeOrders(withPersonal, mapping).orders
    expect(JSON.stringify(order)).not.toContain('usuario_comprador')
    expect(JSON.stringify(order)).not.toContain('Nome Banco')
  })
})
