import { Link } from 'react-router-dom'
import { ChampionsCard } from '../components/home/ChampionsCard'
import { GoalsCard } from '../components/home/GoalsCard'
import { PeriodCard } from '../components/home/PeriodCard'
import { cardClass } from '../components/ui/styles'
import { useHomeData } from '../hooks/useHomeData'
import { getMonthPeriod, getWeekPeriod } from '../services/calculations/periods'
import { formatDate } from '../services/format/date'
import { describeMonthHeadline } from '../services/format/homeMessages'

export function HomePage() {
  const { today, summary, goal, hasOrders, saveGoal } = useHomeData()

  if (!summary || hasOrders === null) {
    return <p className="text-slate-600">Carregando...</p>
  }

  if (!hasOrders) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Início</h1>
        <p className={`${cardClass} mt-6 max-w-prose text-slate-700`}>
          Ainda não há vendas guardadas. Importe um relatório da Central do
          Vendedor ou veja a demonstração.
        </p>
      </section>
    )
  }

  const week = getWeekPeriod(today)
  const month = getMonthPeriod(today)

  return (
    <section className="flex flex-col gap-6">
      <h1 className="sr-only">Início</h1>

      <div className="rounded-xl bg-emerald-700 p-6 text-white shadow-sm">
        <p className="text-2xl font-bold leading-snug md:text-3xl">
          {describeMonthHeadline(summary.month, summary.previousMonthToDate, summary.monthProfitDifference)}
        </p>
      </div>

      {summary.month.unknownCostSkus.length > 0 && (
        <p role="status" className="rounded-xl bg-amber-50 p-4 text-amber-900">
          {summary.month.unknownCostSkus.length}{' '}
          {summary.month.unknownCostSkus.length === 1 ? 'produto vendido está' : 'produtos vendidos estão'}{' '}
          sem custo cadastrado, então o lucro pode estar maior do que é.{' '}
          <Link to="/produtos" className="font-semibold underline">
            Informar os custos
          </Link>
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <PeriodCard title="Hoje" subtitle={formatDate(today)} summary={summary.today} />
        <PeriodCard
          title="Esta semana"
          subtitle={`${formatDate(week.start)} a ${formatDate(week.end)}`}
          summary={summary.week}
        />
        <PeriodCard
          title="Este mês"
          subtitle={`${formatDate(month.start)} a ${formatDate(month.end)}`}
          summary={summary.month}
        />
      </div>

      <GoalsCard
        goal={goal}
        dailyGoal={summary.dailyGoal}
        monthlyGoal={summary.monthlyGoal}
        onSave={saveGoal}
      />

      <ChampionsCard champions={summary.champions} />

      {summary.month.estimatedOrderCount > 0 && (
        <p className="text-sm text-slate-600">
          O lucro de {summary.month.estimatedOrderCount} pedidos do mês é uma
          estimativa feita com as taxas que você cadastrou. Pedidos importados
          do relatório "Minha Renda" usam o valor real.
        </p>
      )}
    </section>
  )
}
