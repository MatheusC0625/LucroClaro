import type { ExtraCost, FeeSettings } from '../../types/cost'
import type { Cents } from '../../types/money'
import type { Order } from '../../types/order'
import type { ISODate } from '../../types/period'
import type { Product } from '../../types/product'
import { allocateProportionally } from './allocate'
import { calculateMargin } from './margin'

export interface CostContext {
  products: Product[]
  extraCosts: ExtraCost[]
  feeSettings: FeeSettings[]
}


export type CalculationMode = 'real' | 'estimated'

export interface ItemProfit {
  sku: string
  name: string
  quantity: number
  revenue: Cents
  platformFees: Cents
  productCost: Cents
  extraCosts: Cents
  shippingCost: Cents
  profit: Cents
}

export interface OrderProfit {
  orderId: string
  date: ISODate
  mode: CalculationMode
  revenue: Cents
  platformFees: Cents
  productCosts: Cents
  extraCosts: Cents
  shippingCost: Cents
  profit: Cents
  items: ItemProfit[]
  unknownCostSkus: string[]
}

export interface ProfitSummary {
  orderCount: number
  itemCount: number
  revenue: Cents
  platformFees: Cents
  productCosts: Cents
  extraCosts: Cents
  shippingCost: Cents
  profit: Cents
  margin: number | null
  estimatedOrderCount: number
  unknownCostSkus: string[]
}


export function pickFeeSettings(
  feeSettings: FeeSettings[],
  date: ISODate,
): FeeSettings | undefined {
  let best: FeeSettings | undefined
  for (const fees of feeSettings) {
    if (fees.effectiveFrom <= date && (!best || fees.effectiveFrom > best.effectiveFrom)) {
      best = fees
    }
  }
  return best
}


export function calculateOrderProfit(order: Order, context: CostContext): OrderProfit {
  const costBySku = new Map(context.products.map((p) => [p.sku, p.unitCost]))
  const extraCostPerOrder = context.extraCosts
    .filter((cost) => cost.active)
    .reduce((sum, cost) => sum + cost.amount, 0)

  const isReal =
    order.items.length > 0 && order.items.every((item) => item.payout !== undefined)
  const fees = isReal ? undefined : pickFeeSettings(context.feeSettings, order.createdDate)

  const weights = order.items.map((item) => item.total)
  const extraShares = allocateProportionally(extraCostPerOrder, weights)
  const shippingShares = isReal
    ? order.items.map(() => 0)
    : allocateProportionally(order.shippingPaidBySeller, weights)

  const unknownCostSkus: string[] = []

  const items: ItemProfit[] = order.items.map((item, index) => {
    const unitCost = costBySku.get(item.sku)
    if (unitCost === undefined) unknownCostSkus.push(item.sku)

    const platformFees = isReal
      ? item.total - (item.payout as Cents)
      : fees
        ? Math.round((item.total * fees.commissionPercent) / 100) +
          fees.fixedFeePerItem * item.quantity
        : 0
    const productCost = (unitCost ?? 0) * item.quantity
    const extraCosts = extraShares[index]
    const shippingCost = shippingShares[index]

    return {
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      revenue: item.total,
      platformFees,
      productCost,
      extraCosts,
      shippingCost,
      profit: item.total - platformFees - productCost - extraCosts - shippingCost,
    }
  })

  const total = (pick: (item: ItemProfit) => number) =>
    items.reduce((sum, item) => sum + pick(item), 0)

  return {
    orderId: order.id,
    date: order.createdDate,
    mode: isReal ? 'real' : 'estimated',
    revenue: total((i) => i.revenue),
    platformFees: total((i) => i.platformFees),
    productCosts: total((i) => i.productCost),
    extraCosts: total((i) => i.extraCosts),
    shippingCost: total((i) => i.shippingCost),
    profit: total((i) => i.profit),
    items,
    unknownCostSkus,
  }
}

export function summarizeProfit(orders: Order[], context: CostContext): ProfitSummary {
  const results = orders
    .filter((order) => order.status === 'completed')
    .map((order) => calculateOrderProfit(order, context))

  const total = (pick: (result: OrderProfit) => number) =>
    results.reduce((sum, result) => sum + pick(result), 0)

  const revenue = total((r) => r.revenue)
  const profit = total((r) => r.profit)

  return {
    orderCount: results.length,
    itemCount: results.reduce(
      (sum, result) => sum + result.items.reduce((s, item) => s + item.quantity, 0),
      0,
    ),
    revenue,
    platformFees: total((r) => r.platformFees),
    productCosts: total((r) => r.productCosts),
    extraCosts: total((r) => r.extraCosts),
    shippingCost: total((r) => r.shippingCost),
    profit,
    margin: calculateMargin(profit, revenue),
    estimatedOrderCount: results.filter((r) => r.mode === 'estimated').length,
    unknownCostSkus: [...new Set(results.flatMap((r) => r.unknownCostSkus))],
  }
}
