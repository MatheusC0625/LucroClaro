import type { ProductSummary } from '../calculations/ranking'
import { formatCurrency } from './currency'

export function describeProductOverview(products: ProductSummary[], losers: ProductSummary[]): string {
  if (products.length === 0) return 'Nenhuma venda neste período.'
  if (losers.length === 0) return 'Todos os produtos deram lucro neste período.'

  const lost = formatCurrency(-losers.reduce((sum, product) => sum + product.profit, 0))

  if (losers.length === 1) {
    return `O produto "${losers[0].name}" está dando prejuízo: perdeu ${lost} no período. Vale rever o preço ou o custo.`
  }
  const names = losers.map((product) => `"${product.name}"`).join(', ')
  return `${losers.length} produtos estão dando prejuízo: ${names}. Juntos eles perderam ${lost} no período. Vale rever o preço ou o custo.`
}
