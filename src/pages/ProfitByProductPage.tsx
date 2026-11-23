import { useMemo, useState } from 'react'
import { PeriodPicker } from '../components/compare/PeriodPicker'
import { toPeriod, type PeriodInput } from '../components/compare/periodInput'
import { ProfitChart } from '../components/profit/ProfitChart'
import { ProfitTable } from '../components/profit/ProfitTable'
import { cardClass, inputClass, labelClass } from '../components/ui/styles'
import { useOrdersAndCosts } from '../hooks/useOrdersAndCosts'
import { filterOrdersByPeriod } from '../services/calculations/periods'
import { getProductPeriodPresets } from '../services/calculations/productPresets'
import { findLosers, sortProducts, type ProductSortKey } from '../services/calculations/productSort'
import { summarizeByProduct } from '../services/calculations/ranking'
import { formatDate, todayISO } from '../services/format/date'
import { describeProductOverview } from '../services/format/productMessages'

const sortOptions: { value: ProductSortKey; label: string }[] = [
  { value: 'profit', label: 'Lucro' },
  { value: 'unitsSold', label: 'Mais vendidos' },
  { value: 'revenue', label: 'Faturamento' },
  { value: 'margin', label: 'Margem' },
]

export function ProfitByProductPage() {
  const data = useOrdersAndCosts()
  const today = todayISO()

  const firstOrderDate = useMemo(() => {
    if (!data || data.orders.length === 0) return null
    return data.orders.reduce((min, order) => (order.createdDate < min ? order.createdDate : min), today)
  }, [data, today])

  const presets = useMemo(() => getProductPeriodPresets(today, firstOrderDate), [today, firstOrderDate])

  const [presetId, setPresetId] = useState('mes')
  const [custom, setCustom] = useState<PeriodInput>({ start: `${today.slice(0, 4)}-01-01`, end: today })
  const [sortKey, setSortKey] = useState<ProductSortKey>('profit')

  const period =
    presetId === 'custom' ? toPeriod(custom) : (presets.find((preset) => preset.id === presetId)?.period ?? null)

  const result = useMemo(() => {
    if (!data || !period) return null
    const products = summarizeByProduct(filterOrdersByPeriod(data.orders, period), data.context)
    return { products: sortProducts(products, sortKey), losers: findLosers(products) }
  }, [data, period, sortKey])

  const registeredSkus = useMemo(() => new Set(data?.context.products.map((product) => product.sku)), [data])

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Lucro por produto</h1>
        <p className="mt-2 max-w-prose text-slate-600">
          Descubra quais produtos deixam dinheiro no seu bolso e quais estão dando prejuízo.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {[...presets.map((preset) => ({ id: preset.id, label: preset.label })), { id: 'custom', label: 'Escolher datas' }].map(
            (option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={presetId === option.id}
                onClick={() => setPresetId(option.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                  presetId === option.id
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ),
          )}
        </div>

        {presetId === 'custom' && (
          <div className="max-w-xl">
            <PeriodPicker legend="Período" idPrefix="produto" value={custom} onChange={setCustom} />
          </div>
        )}

        {period && (
          <p className="text-sm text-slate-600">
            Mostrando de {formatDate(period.start)} a {formatDate(period.end)}.
          </p>
        )}
      </div>

      {!result ? (
        <p role="status" className={`${cardClass} text-slate-700`}>
          {data ? 'Escolha as datas para ver o lucro por produto.' : 'Carregando...'}
        </p>
      ) : (
        <>
          <p
            role="status"
            className={`rounded-xl p-5 text-lg font-semibold ${
              result.losers.length > 0 ? 'bg-red-50 text-red-900' : 'bg-emerald-700 text-white'
            }`}
          >
            {describeProductOverview(result.products, result.losers)}
          </p>

          {result.products.length > 0 && (
            <>
              <ProfitChart products={result.products} />

              <div className="max-w-xs">
                <label htmlFor="ordenar" className={labelClass}>
                  Ordenar tabela por
                </label>
                <select
                  id="ordenar"
                  className={inputClass}
                  value={sortKey}
                  onChange={(event) => setSortKey(event.target.value as ProductSortKey)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <ProfitTable products={result.products} registeredSkus={registeredSkus} />
              <p className="text-sm text-slate-600">
                "Custos" soma o custo dos produtos e os custos extras por pedido. Em pedidos estimados, "Taxas e
                frete" vem das taxas que você cadastrou; nos do relatório Minha Renda, é o valor real.
              </p>
            </>
          )}
        </>
      )}
    </section>
  )
}
