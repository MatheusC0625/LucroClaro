import type { ProductSummary } from './ranking'

export type ProductSortKey = 'profit' | 'unitsSold' | 'revenue' | 'margin'

export function sortProducts(products: ProductSummary[], key: ProductSortKey): ProductSummary[] {
  const value = (product: ProductSummary) => product[key] ?? Number.NEGATIVE_INFINITY
  return [...products].sort((a, b) => value(b) - value(a) || a.name.localeCompare(b.name, 'pt-BR'))
}

export function findLosers(products: ProductSummary[]): ProductSummary[] {
  return products.filter((product) => product.profit < 0)
}
