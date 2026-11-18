import { describe, expect, it } from 'vitest'
import type { Order } from '../../types/order'
import { calculateMargin } from './margin'
import {
  calculateOrderProfit,
  pickFeeSettings,
  summarizeProfit,
  type CostContext,
} from './profit'

const context: CostContext = {
  products: [
    { sku: 'BABUCHE', name: 'Babuche', unitCost: 1200 },
    { sku: 'GLOSS', name: 'Kit Lip Gloss', unitCost: 500 },
  ],
  extraCosts: [
    { id: '1', name: 'Sacola', amount: 80, active: true },
    { id: '2', name: 'Etiqueta', amount: 30, active: true },
    { id: '3', name: 'Brinde', amount: 500, active: false },
  ],
  feeSettings: [
    { effectiveFrom: '2026-01-01', commissionPercent: 14, fixedFeePerItem: 400 },
  ],
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'PEDIDO-1',
    createdDate: '2026-11-10',
    status: 'completed',
    items: [{ sku: 'BABUCHE', name: 'Babuche', quantity: 1, total: 3990 }],
    shippingPaidBySeller: 0,
    source: 'demo',
    ...overrides,
  }
}

describe('calculateOrderProfit (modo estimado)', () => {
  it('bate com o exemplo do planejamento: R$ 39,90 vira R$ 17,21 de lucro', () => {
    const result = calculateOrderProfit(makeOrder(), context)

    expect(result.mode).toBe('estimated')
    expect(result.revenue).toBe(3990)
    expect(result.platformFees).toBe(959) 
    expect(result.productCosts).toBe(1200)
    expect(result.extraCosts).toBe(110) 
    expect(result.profit).toBe(1721)
  })

  it('multiplica a taxa fixa e o custo pela quantidade', () => {
    const order = makeOrder({
      items: [{ sku: 'BABUCHE', name: 'Babuche', quantity: 2, total: 7980 }],
    })
    const result = calculateOrderProfit(order, context)

    expect(result.platformFees).toBe(1917) 
    expect(result.productCosts).toBe(2400)
    expect(result.profit).toBe(3553)
  })

  it('desconta o frete pago pelo vendedor', () => {
    const result = calculateOrderProfit(makeOrder({ shippingPaidBySeller: 500 }), context)
    expect(result.shippingCost).toBe(500)
    expect(result.profit).toBe(1221)
  })

  it('usa a taxa que valia na data do pedido', () => {
    const withHistory: CostContext = {
      ...context,
      feeSettings: [
        { effectiveFrom: '2026-01-01', commissionPercent: 14, fixedFeePerItem: 400 },
        { effectiveFrom: '2026-10-01', commissionPercent: 14, fixedFeePerItem: 450 },
      ],
    }
    const old = calculateOrderProfit(makeOrder({ createdDate: '2026-09-30' }), withHistory)
    const recent = calculateOrderProfit(makeOrder({ createdDate: '2026-10-14' }), withHistory)

    expect(recent.platformFees - old.platformFees).toBe(50)
  })

  it('avisa quando falta o custo do produto, em vez de esconder', () => {
    const order = makeOrder({
      items: [{ sku: 'SEM-CUSTO', name: 'Novo', quantity: 1, total: 2000 }],
    })
    const result = calculateOrderProfit(order, context)

    expect(result.unknownCostSkus).toEqual(['SEM-CUSTO'])
    expect(result.productCosts).toBe(0)
  })

  it('reparte custos do pedido entre os itens e a soma continua batendo', () => {
    const order = makeOrder({
      items: [
        { sku: 'BABUCHE', name: 'Babuche', quantity: 1, total: 1000 },
        { sku: 'GLOSS', name: 'Gloss', quantity: 1, total: 3000 },
      ],
      shippingPaidBySeller: 333,
    })
    const result = calculateOrderProfit(order, context)

    const sum = (pick: (i: (typeof result.items)[number]) => number) =>
      result.items.reduce((total, item) => total + pick(item), 0)

    expect(sum((i) => i.extraCosts)).toBe(110)
    expect(sum((i) => i.shippingCost)).toBe(333)
    expect(sum((i) => i.profit)).toBe(result.profit)
  })

  it('sem taxas cadastradas, não inventa taxa nenhuma', () => {
    const result = calculateOrderProfit(makeOrder(), { ...context, feeSettings: [] })
    expect(result.platformFees).toBe(0)
  })
})

describe('calculateOrderProfit (modo real, relatório Minha Renda)', () => {
  it('usa o valor depositado: lucro = depositado − custo − extras', () => {
    const order = makeOrder({
      source: 'spreadsheet',
      items: [{ sku: 'BABUCHE', name: 'Babuche', quantity: 1, total: 3072, payout: 2008 }],
    })
    const result = calculateOrderProfit(order, context)

    expect(result.mode).toBe('real')
    expect(result.platformFees).toBe(1064)
    expect(result.profit).toBe(698) 
  })

  it('ignora a comissão cadastrada e o frete estimado', () => {
    const order = makeOrder({
      shippingPaidBySeller: 999,
      items: [{ sku: 'BABUCHE', name: 'Babuche', quantity: 1, total: 3072, payout: 2008 }],
    })
    const result = calculateOrderProfit(order, { ...context, feeSettings: [] })
    expect(result.shippingCost).toBe(0)
    expect(result.profit).toBe(698)
  })

  it('só é "real" se TODOS os itens tiverem valor depositado', () => {
    const order = makeOrder({
      items: [
        { sku: 'BABUCHE', name: 'Babuche', quantity: 1, total: 3000, payout: 2000 },
        { sku: 'GLOSS', name: 'Gloss', quantity: 1, total: 2000 },
      ],
    })
    expect(calculateOrderProfit(order, context).mode).toBe('estimated')
  })
})

describe('summarizeProfit', () => {
  it('soma pedidos concluídos e ignora cancelados e devolvidos', () => {
    const orders = [
      makeOrder({ id: 'A' }),
      makeOrder({ id: 'B' }),
      makeOrder({ id: 'C', status: 'cancelled' }),
      makeOrder({ id: 'D', status: 'returned' }),
    ]
    const summary = summarizeProfit(orders, context)

    expect(summary.orderCount).toBe(2)
    expect(summary.itemCount).toBe(2)
    expect(summary.revenue).toBe(7980)
    expect(summary.profit).toBe(3442)
    expect(summary.margin).toBeCloseTo(0.4313, 4)
    expect(summary.estimatedOrderCount).toBe(2)
  })

  it('lista cada SKU sem custo uma única vez', () => {
    const order = (id: string) =>
      makeOrder({ id, items: [{ sku: 'X', name: 'X', quantity: 1, total: 100 }] })
    expect(summarizeProfit([order('1'), order('2')], context).unknownCostSkus).toEqual(['X'])
  })

  it('lista vazia dá tudo zero e margem nula', () => {
    const summary = summarizeProfit([], context)
    expect(summary.profit).toBe(0)
    expect(summary.margin).toBeNull()
  })
})

describe('pickFeeSettings', () => {
  it('não usa taxa que ainda não começou a valer', () => {
    const fees = [{ effectiveFrom: '2026-10-01', commissionPercent: 14, fixedFeePerItem: 450 }]
    expect(pickFeeSettings(fees, '2026-09-30')).toBeUndefined()
    expect(pickFeeSettings(fees, '2026-10-01')).toBeDefined()
  })
})

describe('calculateMargin', () => {
  it('calcula a margem e mostra prejuízo como negativo', () => {
    expect(calculateMargin(1721, 3990)).toBeCloseTo(0.4313, 4)
    expect(calculateMargin(-500, 2000)).toBe(-0.25)
  })

  it('devolve null quando não há faturamento', () => {
    expect(calculateMargin(0, 0)).toBeNull()
  })
})
