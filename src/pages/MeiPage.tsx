import { DayInput, MoneyInput } from '../components/ui/fields'
import { ProgressBar } from '../components/ui/ProgressBar'
import { cardClass, inputClass, labelClass } from '../components/ui/styles'
import { useMeiData } from '../hooks/useMeiData'
import { formatCurrency } from '../services/format/currency'
import { formatDate } from '../services/format/date'
import { describeDas, describeMeiStatus } from '../services/format/meiMessages'
import { formatPercent } from '../services/format/percent'

const toneByLevel = { ok: 'ok', warning: 'warning', exceeded: 'danger', 'far-exceeded': 'danger' } as const

const bannerByLevel = {
  ok: 'bg-emerald-700 text-white',
  warning: 'bg-amber-100 text-amber-950',
  exceeded: 'bg-red-100 text-red-950',
  'far-exceeded': 'bg-red-100 text-red-950',
}

export function MeiPage() {
  const { summary, settings, saveSettings } = useMeiData()

  if (!summary) return <p className="text-slate-600">Carregando...</p>

  const needsAttention = summary.level !== 'ok'

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Controle MEI</h1>
        <p className="mt-2 max-w-prose text-slate-600">
          Acompanhe quanto você já faturou no ano em relação ao limite do MEI e não esqueça do DAS.
        </p>
      </div>

      <div
        role={needsAttention ? 'alert' : 'status'}
        className={`rounded-xl p-6 text-xl font-bold leading-snug shadow-sm md:text-2xl ${bannerByLevel[summary.level]}`}
      >
        {describeMeiStatus(summary)}
      </div>

      <div className={cardClass}>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-semibold">Limite do ano</h2>
          <span className="text-sm font-semibold text-slate-700">{formatPercent(summary.ratio)}</span>
        </div>
        <div className="mt-3">
          <ProgressBar
            ratio={summary.ratio}
            label="Faturamento do ano em relação ao limite do MEI"
            tone={toneByLevel[summary.level]}
          />
        </div>
        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-600">Faturado no ano</dt>
            <dd className="text-xl font-bold">{formatCurrency(summary.yearRevenue)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Seu limite</dt>
            <dd className="text-xl font-bold">{formatCurrency(summary.limit)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">Ainda cabe</dt>
            <dd className="text-xl font-bold">{formatCurrency(summary.remaining)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-slate-600">
          Aqui conta o que você vendeu (faturamento), e não o lucro. O alerta começa em 80% do limite.
        </p>
      </div>

      {summary.projection && (
        <div className={cardClass}>
          <h2 className="font-semibold">No ritmo de hoje</h2>
          <p className="mt-2 text-slate-700">
            Se você continuar vendendo no mesmo ritmo, termina o ano com cerca de{' '}
            <strong>{formatCurrency(summary.projection.projectedYearTotal)}</strong> faturados.
          </p>
          {summary.projection.limitReachedOn && (
            <p className="mt-2 font-medium text-amber-900">
              Nesse ritmo, você chega ao limite por volta de {formatDate(summary.projection.limitReachedOn)}.
            </p>
          )}
        </div>
      )}

      <div className={cardClass}>
        <h2 className="font-semibold">Lembrete do DAS</h2>
        <p className="mt-2 text-slate-700">{describeDas(summary.das)}</p>
        <p className="mt-1 text-slate-700">
          {settings.dasAmount === null
            ? 'Informe abaixo o valor do seu DAS para ele aparecer aqui.'
            : `Valor: ${formatCurrency(settings.dasAmount)}.`}
        </p>
        <p className="mt-2 text-sm text-slate-600">Para gerar a guia, use o PGMEI no Portal do Empreendedor.</p>
      </div>

      <div className={`${cardClass} grid gap-4 md:grid-cols-2`}>
        <h2 className="font-semibold md:col-span-2">Ajustes</h2>
        <MoneyInput
          id="mei-limite"
          label="Limite anual do MEI"
          value={settings.annualLimit}
          onCommit={(annualLimit) => saveSettings({ ...settings, annualLimit })}
        />
        <DayInput
          id="mei-dia-das"
          label="Dia de vencimento do DAS"
          value={settings.dasDueDay}
          onCommit={(dasDueDay) => saveSettings({ ...settings, dasDueDay })}
        />
        <MoneyInput
          id="mei-valor-das"
          label="Valor do DAS (0,00 se não souber)"
          value={settings.dasAmount ?? 0}
          onCommit={(amount) => saveSettings({ ...settings, dasAmount: amount === 0 ? null : amount })}
        />
        <div>
          <label htmlFor="mei-abertura" className={labelClass}>
            Abriu o MEI este ano? Data de abertura
          </label>
          <input
            id="mei-abertura"
            type="date"
            className={inputClass}
            value={settings.openingDate ?? ''}
            onChange={(event) => saveSettings({ ...settings, openingDate: event.target.value || null })}
          />
          <p className="mt-1 text-sm text-slate-600">
            Quem abriu no ano tem limite proporcional aos meses de atividade. Deixe vazio se não for o seu caso.
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-600">
        O Lucro Claro é uma ajuda de acompanhamento e não substitui um contador. Confirme limites e regras no Portal do
        Empreendedor.
      </p>
    </section>
  )
}
