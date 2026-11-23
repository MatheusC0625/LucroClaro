import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PeriodComparison } from '../../services/calculations/comparison'
import type { ProfitSummary } from '../../services/calculations/profit'
import { formatCurrency } from '../../services/format/currency'
import { cardClass } from '../ui/styles'

const CURRENT_COLOR = '#047857'
const BASE_COLOR = '#64748b'

const toReais = (cents: number) => cents / 100
const formatReais = (value: unknown) => formatCurrency(Math.round(Number(value) * 100))
const formatAxis = (value: number) =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

function breakdown(summary: ProfitSummary) {
  return {
    vendas: summary.revenue,
    taxas: summary.platformFees + summary.shippingCost,
    produtos: summary.productCosts,
    extras: summary.extraCosts,
    lucro: summary.profit,
  }
}

interface ComparisonChartsProps {
  comparison: PeriodComparison
  currentSeries: number[]
  baseSeries: number[]
}

export function ComparisonCharts({ comparison, currentSeries, baseSeries }: ComparisonChartsProps) {
  const current = breakdown(comparison.current)
  const base = breakdown(comparison.base)

  const barData = [
    { name: 'Vendas', atual: toReais(current.vendas), comparacao: toReais(base.vendas) },
    { name: 'Taxas', atual: toReais(current.taxas), comparacao: toReais(base.taxas) },
    { name: 'Produtos', atual: toReais(current.produtos), comparacao: toReais(base.produtos) },
    { name: 'Extras', atual: toReais(current.extras), comparacao: toReais(base.extras) },
    { name: 'Lucro', atual: toReais(current.lucro), comparacao: toReais(base.lucro) },
  ]

  const days = Math.max(currentSeries.length, baseSeries.length)
  const lineData = Array.from({ length: days }, (_, index) => ({
    dia: index + 1,
    atual: currentSeries[index] === undefined ? undefined : toReais(currentSeries[index]),
    comparacao: baseSeries[index] === undefined ? undefined : toReais(baseSeries[index]),
  }))

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className={cardClass}>
        <h3 className="font-semibold">Para onde foi o dinheiro</h3>
        <p className="text-sm text-slate-600">Taxas incluem o frete pago por você. Produtos é o custo do que você vendeu.</p>
        <div
          role="img"
          aria-label="Gráfico de barras com vendas, taxas, custos e lucro nos dois períodos. Os mesmos números estão nos cartões acima."
          className="mt-3 h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
              <YAxis tickFormatter={formatAxis} width={48} tick={{ fontSize: 12 }} />
              <Tooltip formatter={formatReais} />
              <Legend />
              <Bar dataKey="atual" name="Período atual" fill={CURRENT_COLOR} />
              <Bar dataKey="comparacao" name="Comparação" fill={BASE_COLOR} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={cardClass}>
        <h3 className="font-semibold">Lucro acumulado dia a dia</h3>
        <p className="text-sm text-slate-600">Quanto de lucro já tinha entrado a cada dia de cada período.</p>
        <div
          role="img"
          aria-label="Gráfico de linhas com o lucro acumulado dia a dia nos dois períodos. O total final está nos cartões acima."
          className="mt-3 h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={formatAxis} width={48} tick={{ fontSize: 12 }} />
              <Tooltip formatter={formatReais} labelFormatter={(dia) => `Dia ${dia}`} />
              <Legend />
              <Line type="monotone" dataKey="atual" name="Período atual" stroke={CURRENT_COLOR} strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="comparacao" name="Comparação" stroke={BASE_COLOR} strokeWidth={2.5} strokeDasharray="6 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
