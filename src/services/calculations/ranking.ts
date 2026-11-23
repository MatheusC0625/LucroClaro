import type { Order } from '../../types/order'
import type { Cents } from '../../types/money'
import { calculateMargin } from './margin'
import { calculateOrderProfit, type CostContext } from './profit'

export interface ProductSummary {
  sku: string
  name: string
  unitsSold: number
  revenue: Cents
  platformFees: Cents
  productCosts: Cents
  extraCosts: Cents
  shippingCost: Cents
  profit: Cents
  margin: number | null
}

export interface Champions {
  bestSeller: ProductSummary | null
  mostProfitable: ProductSummary | null
}

export function summarizeByProduct(
  orders: Order[],
  context: CostContext,
): ProductSummary[] {
  const bySku = new Map<string, ProductSummary>()

  for (const order of orders) {
    if (order.status !== 'completed') continue
    for (const item of calculateOrderProfit(order, context).items) {
      const current = bySku.get(item.sku) ?? {
        sku: item.sku,
        name: item.name,
        unitsSold: 0,
        revenue: 0,
        platformFees: 0,
        productCosts: 0,
        extraCosts: 0,
        shippingCost: 0,
        profit: 0,
        margin: null,
      }
      current.name = item.name
      current.unitsSold += item.quantity
      current.revenue += item.revenue
      current.platformFees += item.platformFees
      current.productCosts += item.productCost
      current.extraCosts += item.extraCosts
      current.shippingCost += item.shippingCost
      current.profit += item.profit
      bySku.set(item.sku, current)
    }
  }

  return [...bySku.values()].map((summary) => ({
    ...summary,
    margin: calculateMargin(summary.profit, summary.revenue),
  }))
}

export function findChampions(products: ProductSummary[]): Champions {
  const bestSeller =
    [...products].sort((a, b) => b.unitsSold - a.unitsSold || b.profit - a.profit)[0] ?? null
  const topProfit = [...products].sort((a, b) => b.profit - a.profit)[0] ?? null

  return {
    bestSeller,
    mostProfitable: topProfit && topProfit.profit > 0 ? topProfit : null,
  }
}
