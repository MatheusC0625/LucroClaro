import { describe, expect, it } from 'vitest'
import { calculateOrderProfit } from '../services/calculations/profit'
import { addDays } from '../services/format/date'
import { DEMO_START_DATE, generateDemoData } from './demoData'

const today = '2026-11-18'

describe('generateDemoData', () => {
  const data = generateDemoData(today)

  it('gera sempre os mesmos dados para o mesmo dia', () => {
    expect(generateDemoData(today)).toEqual(data)
  })

  it('o histórico não muda quando o tempo passa, só ganha dias novos', () => {
    const later = generateDemoData(addDays(today, 7))
    const untilToday = later.orders.filter((order) => order.createdDate <= today)
    expect(untilToday).toEqual(data.orders)
  })

  it('não gera pedidos fora do intervalo nem ids repetidos', () => {
    expect(data.orders.every((o) => o.createdDate >= DEMO_START_DATE)).toBe(true)
    expect(data.orders.every((o) => o.createdDate <= today)).toBe(true)
    expect(new Set(data.orders.map((o) => o.id)).size).toBe(data.orders.length)
  })

  it('tem vendas no mesmo mês do ano passado, para a comparação funcionar', () => {
    const lastYear = data.orders.filter((o) => o.createdDate.startsWith('2025-11'))
    expect(lastYear.length).toBeGreaterThan(30)
  })

  it('mistura pedidos concluídos, cancelados e devolvidos', () => {
    const statuses = new Set(data.orders.map((o) => o.status))
    expect(statuses).toEqual(new Set(['completed', 'cancelled', 'returned']))
  })

  it('todo SKU vendido tem produto cadastrado com custo', () => {
    const costBySku = new Map(data.products.map((p) => [p.sku, p.unitCost]))
    for (const order of data.orders) {
      for (const item of order.items) {
        expect(costBySku.get(item.sku)).toBeGreaterThan(0)
      }
    }
  })

  it('o kit infantil dá prejuízo e os outros produtos dão lucro', () => {
    const context = {
      products: data.products,
      extraCosts: data.extraCosts,
      feeSettings: data.feeSettings,
    }
    const profitBySku = new Map<string, number>()
    for (const order of data.orders.filter((o) => o.status === 'completed')) {
      for (const item of calculateOrderProfit(order, context).items) {
        profitBySku.set(item.sku, (profitBySku.get(item.sku) ?? 0) + item.profit)
      }
    }

    expect(profitBySku.get('DEMO-KITINFANTIL')).toBeLessThan(0)
    expect(profitBySku.get('DEMO-BABUCHE')).toBeGreaterThan(0)
    expect(profitBySku.get('DEMO-LIPGLOSS')).toBeGreaterThan(0)
    expect(profitBySku.get('DEMO-CHINELO')).toBeGreaterThan(0)
  })

  it('o faturamento dos últimos 12 meses fica abaixo do limite do MEI', () => {
    const start = addDays(today, -364)
    const revenue = data.orders
      .filter((o) => o.status === 'completed' && o.createdDate >= start)
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.total, 0), 0)

    expect(revenue).toBeGreaterThan(1_000_000)
    expect(revenue).toBeLessThan(data.mei.annualLimit)
  })

  it('traz as taxas com histórico e um custo extra desligado', () => {
    expect(data.feeSettings).toHaveLength(2)
    expect(data.extraCosts.some((c) => !c.active)).toBe(true)
  })
})
