import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProductSummary } from '../../services/calculations/ranking'
import { formatCurrency } from '../../services/format/currency'
import { cardClass } from '../ui/styles'

const GAIN_COLOR = '#047857'
const LOSS_COLOR = '#b91c1c'

const shorten = (name: string) => (name.length > 26 ? `${name.slice(0, 25)}…` : name)
const formatAxis = (value: number) =>
  new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(value)

export function ProfitChart({ products }: { products: ProductSummary[] }) {
  const data = products.map((product) => ({
    name: shorten(product.name),
    lucro: product.profit / 100,
  }))

  return (
    <section className={cardClass}>
      <h2 className="font-semibold">Lucro de cada produto</h2>
      <p className="text-sm text-slate-600">Barras vermelhas, à esquerda do zero, são produtos que perdem dinheiro.</p>
      <div
        role="img"
        aria-label="Gráfico de barras com o lucro de cada produto no período. Os mesmos números estão na tabela abaixo."
        className="mt-3"
        style={{ height: Math.max(200, data.length * 56 + 60) }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickFormatter={formatAxis} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => formatCurrency(Math.round(Number(value) * 100))} />
            <ReferenceLine x={0} stroke="#475569" />
            <Bar dataKey="lucro" name="Lucro">
              {data.map((row) => (
                <Cell key={row.name} fill={row.lucro < 0 ? LOSS_COLOR : GAIN_COLOR} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
