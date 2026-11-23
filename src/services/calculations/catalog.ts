import type { Order } from '../../types/order'
import type { Product } from '../../types/product'

export interface UnregisteredProduct {
  sku: string
  name: string
  saleCount: number
}

export function findUnregisteredProducts(
  orders: Order[],
  products: Product[],
): UnregisteredProduct[] {
  const registered = new Set(products.map((product) => product.sku))
  const found = new Map<string, UnregisteredProduct>()

  for (const order of orders) {
    if (order.status !== 'completed') continue
    for (const item of order.items) {
      if (registered.has(item.sku)) continue
      const current = found.get(item.sku)
      if (current) {
        current.saleCount += 1
      } else {
        found.set(item.sku, { sku: item.sku, name: item.name, saleCount: 1 })
      }
    }
  }

  return [...found.values()].sort(
    (a, b) => b.saleCount - a.saleCount || a.name.localeCompare(b.name, 'pt-BR'),
  )
}
