import { useEffect, useState } from 'react'
import { useDataMode } from '../hooks/useDataMode'
import { filterOrdersByPeriod, getMonthPeriod } from '../services/calculations/periods'
import { summarizeProfit, type ProfitSummary } from '../services/calculations/profit'
import { formatCurrency } from '../services/format/currency'
import { formatDate, todayISO } from '../services/format/date'
import { formatPercent } from '../services/format/percent'

interface StoredDataInfo {
  orderCount: number
  firstDate: string
  lastDate: string
  month: ProfitSummary
}

export function HomePage() {
  const { repos, mode } = useDataMode()
  const [info, setInfo] = useState<StoredDataInfo | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [orders, context] = await Promise.all([
        repos.getOrders(),
        repos.getCostContext(),
      ])
      if (cancelled) return

      if (orders.length === 0) {
        setInfo(null)
        return
      }

      const dates = orders.map((order) => order.createdDate).sort()
      const month = summarizeProfit(
        filterOrdersByPeriod(orders, getMonthPeriod(todayISO())),
        context,
      )
      setInfo({
        orderCount: orders.length,
        firstDate: dates[0],
        lastDate: dates[dates.length - 1],
        month,
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [repos, mode])

  return (
    <section>
      <h1 className="text-2xl font-bold">Início</h1>
      <p className="mt-2 max-w-prose text-slate-600">
        Tela provisória: o resumo completo da loja chega na etapa da visão
        geral.
      </p>

      {info === null && (
        <p className="mt-6 max-w-prose rounded-lg bg-white p-4 text-slate-700 shadow-sm">
          Ainda não há vendas guardadas. Importe um relatório da Central do
          Vendedor ou veja a demonstração.
        </p>
      )}

      {info && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Pedidos guardados</p>
            <p className="mt-1 text-3xl font-bold">{info.orderCount}</p>
            <p className="mt-1 text-sm text-slate-600">
              de {formatDate(info.firstDate)} a {formatDate(info.lastDate)}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Este mês, até agora</p>
            <p className="mt-1 text-3xl font-bold">
              {formatCurrency(info.month.profit)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              de lucro, sobre {formatCurrency(info.month.revenue)} vendidos
              {info.month.margin !== null &&
                ` (margem de ${formatPercent(info.month.margin)})`}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
