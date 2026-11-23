import type { ProductSummary } from '../../services/calculations/ranking'
import { formatCurrency } from '../../services/format/currency'
import { formatPercent } from '../../services/format/percent'

interface ProfitTableProps {
  products: ProductSummary[]
  registeredSkus: Set<string>
}

const headerClass = 'px-3 py-2 text-right font-semibold'

export function ProfitTable({ products, registeredSkus }: ProfitTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[44rem] text-sm">
        <caption className="sr-only">Vendas, custos, lucro e margem de cada produto no período</caption>
        <thead className="border-b border-slate-200 text-slate-700">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-semibold">Produto</th>
            <th scope="col" className={headerClass}>Vendidos</th>
            <th scope="col" className={headerClass}>Faturamento</th>
            <th scope="col" className={headerClass}>Custos</th>
            <th scope="col" className={headerClass}>Taxas e frete</th>
            <th scope="col" className={headerClass}>Lucro</th>
            <th scope="col" className={headerClass}>Margem</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const loss = product.profit < 0
            return (
              <tr key={product.sku} className={`border-b border-slate-100 last:border-0 ${loss ? 'bg-red-50' : ''}`}>
                <th scope="row" className="px-3 py-3 text-left font-medium">
                  {product.name}
                  {loss && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800">
                      Prejuízo
                    </span>
                  )}
                  {!registeredSkus.has(product.sku) && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">
                      Sem custo cadastrado
                    </span>
                  )}
                </th>
                <td className="px-3 py-3 text-right">{product.unitsSold}</td>
                <td className="px-3 py-3 text-right">{formatCurrency(product.revenue)}</td>
                <td className="px-3 py-3 text-right">
                  {formatCurrency(product.productCosts + product.extraCosts)}
                </td>
                <td className="px-3 py-3 text-right">
                  {formatCurrency(product.platformFees + product.shippingCost)}
                </td>
                <td className={`px-3 py-3 text-right font-bold ${loss ? 'text-red-700' : 'text-emerald-800'}`}>
                  {formatCurrency(product.profit)}
                </td>
                <td className={`px-3 py-3 text-right ${loss ? 'font-semibold text-red-700' : ''}`}>
                  {product.margin === null ? '—' : formatPercent(product.margin)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
