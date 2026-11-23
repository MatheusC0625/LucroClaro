import { useMemo, useState } from 'react'
import { ComparisonCards } from '../components/compare/ComparisonCards'
import { ComparisonCharts } from '../components/compare/ComparisonCharts'
import { PeriodPicker } from '../components/compare/PeriodPicker'
import { toPeriod, type PeriodInput } from '../components/compare/periodInput'
import { cardClass } from '../components/ui/styles'
import { useOrdersAndCosts } from '../hooks/useOrdersAndCosts'
import { comparePeriods } from '../services/calculations/comparison'
import { getComparePresets } from '../services/calculations/comparePresets'
import { cumulativeProfitSeries } from '../services/calculations/series'
import { describeComparison } from '../services/format/compareMessages'
import { todayISO } from '../services/format/date'

export function ComparePage() {
  const data = useOrdersAndCosts()
  const today = todayISO()
  const presets = useMemo(() => getComparePresets(today), [today])

  const [current, setCurrent] = useState<PeriodInput>(presets[0].current)
  const [base, setBase] = useState<PeriodInput>(presets[0].base)

  const currentPeriod = toPeriod(current)
  const basePeriod = toPeriod(base)

  const result = useMemo(() => {
    if (!data || !currentPeriod || !basePeriod) return null
    return {
      comparison: comparePeriods(data.orders, data.context, currentPeriod, basePeriod),
      currentSeries: cumulativeProfitSeries(data.orders, data.context, currentPeriod, today),
      baseSeries: cumulativeProfitSeries(data.orders, data.context, basePeriod, today),
    }
  }, [data, currentPeriod, basePeriod, today])

  const same = (a: PeriodInput, b: PeriodInput) => a.start === b.start && a.end === b.end

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Comparar períodos</h1>
        <p className="mt-2 max-w-prose text-slate-600">
          Escolha dois períodos quaisquer e veja o que mudou de um para o outro.
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Comparações prontas</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => {
            const selected = same(current, preset.current) && same(base, preset.base)
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  setCurrent(preset.current)
                  setBase(preset.base)
                }}
                className={`rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                  selected
                    ? 'border-emerald-700 bg-emerald-700 text-white'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <PeriodPicker legend="Período atual" idPrefix="atual" value={current} onChange={setCurrent} />
        <PeriodPicker legend="Comparar com" idPrefix="comparacao" value={base} onChange={setBase} />
      </div>

      {!result ? (
        <p role="status" className={`${cardClass} text-slate-700`}>
          {data ? 'Escolha as datas dos dois períodos para ver a comparação.' : 'Carregando...'}
        </p>
      ) : (
        <>
          <div className="rounded-xl bg-emerald-700 p-6 text-white shadow-sm" role="status">
            {describeComparison(result.comparison).map((sentence) => (
              <p key={sentence} className="text-xl font-bold leading-snug md:text-2xl">
                {sentence}
              </p>
            ))}
          </div>
          <ComparisonCards comparison={result.comparison} />
          <ComparisonCharts
            comparison={result.comparison}
            currentSeries={result.currentSeries}
            baseSeries={result.baseSeries}
          />
        </>
      )}
    </section>
  )
}
