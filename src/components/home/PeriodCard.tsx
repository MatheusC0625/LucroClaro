import type { ProfitSummary } from '../../services/calculations/profit'
import { formatCurrency } from '../../services/format/currency'
import { formatPercent } from '../../services/format/percent'
import { cardClass } from '../ui/styles'

interface PeriodCardProps {
  title: string
  subtitle: string
  summary: ProfitSummary
}

export function PeriodCard({ title, subtitle, summary }: PeriodCardProps) {
  const lost = summary.profit < 0

  return (
    <div className={cardClass}>
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-slate-600">{subtitle}</p>

      {summary.orderCount === 0 ? (
        <p className="mt-4 text-slate-600">Nenhuma venda ainda.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-slate-600">
            {lost ? 'Prejuízo' : 'Sobrou de lucro'}
          </p>
          <p className={`text-3xl font-bold ${lost ? 'text-red-700' : 'text-emerald-800'}`}>
            {formatCurrency(Math.abs(summary.profit))}
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Você vendeu {formatCurrency(summary.revenue)} em {summary.orderCount}{' '}
            {summary.orderCount === 1 ? 'pedido' : 'pedidos'}
            {summary.margin !== null && `, e ${formatPercent(summary.margin)} virou lucro`}.
          </p>
        </>
      )}
    </div>
  )
}
