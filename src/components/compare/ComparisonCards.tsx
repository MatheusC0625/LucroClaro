import type { PeriodComparison } from '../../services/calculations/comparison'
import { formatCurrency } from '../../services/format/currency'
import {
  describeChange,
  describeMarginChange,
  type ChangeDescription,
} from '../../services/format/compareMessages'
import { formatPercent } from '../../services/format/percent'
import { cardClass } from '../ui/styles'

interface MetricCardProps {
  title: string
  current: string
  base: string
  change: ChangeDescription | null
}

const directionStyle = {
  up: { symbol: '▲', className: 'text-emerald-800' },
  down: { symbol: '▼', className: 'text-red-700' },
  same: { symbol: '=', className: 'text-slate-700' },
}

function MetricCard({ title, current, base, change }: MetricCardProps) {
  const style = change ? directionStyle[change.direction] : null

  return (
    <div className={cardClass}>
      <h3 className="font-semibold">{title}</h3>
      <dl className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <dt className="text-sm text-slate-600">Período atual</dt>
          <dd className="text-xl font-bold">{current}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-600">Comparação</dt>
          <dd className="text-xl font-bold text-slate-600">{base}</dd>
        </div>
      </dl>
      {change && style && (
        <p className={`mt-3 text-sm font-semibold ${style.className}`}>
          <span aria-hidden="true">{style.symbol} </span>
          {change.text}
        </p>
      )}
    </div>
  )
}

const countText = (value: number) => `${value} ${value === 1 ? 'pedido' : 'pedidos'}`

export function ComparisonCards({ comparison }: { comparison: PeriodComparison }) {
  const { current, base } = comparison

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Vendas"
        current={formatCurrency(current.revenue)}
        base={formatCurrency(base.revenue)}
        change={describeChange(comparison.revenue, base.revenue, formatCurrency)}
      />
      <MetricCard
        title="Lucro"
        current={formatCurrency(current.profit)}
        base={formatCurrency(base.profit)}
        change={describeChange(comparison.profit, base.profit, formatCurrency)}
      />
      <MetricCard
        title="Pedidos"
        current={countText(current.orderCount)}
        base={countText(base.orderCount)}
        change={describeChange(comparison.orderCount, base.orderCount, countText)}
      />
      <MetricCard
        title="Quanto virou lucro"
        current={current.margin === null ? '—' : formatPercent(current.margin)}
        base={base.margin === null ? '—' : formatPercent(base.margin)}
        change={describeMarginChange(current.margin, base.margin)}
      />
    </div>
  )
}
