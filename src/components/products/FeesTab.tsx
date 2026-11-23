import { useState, type FormEvent } from 'react'
import { pickFeeSettings } from '../../services/calculations/profit'
import { parseCurrencyInput } from '../../services/format/currency'
import { formatDate, isValidISODate, todayISO } from '../../services/format/date'
import { parsePercentInput } from '../../services/format/input'
import type { FeeSettings } from '../../types/cost'
import { MoneyInput, PercentInput } from '../ui/fields'
import {
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from '../ui/styles'

interface FeesTabProps {
  feeSettings: FeeSettings[]
  onSave: (fees: FeeSettings) => void
  onDelete: (effectiveFrom: string) => void
}

function AddFeeForm({
  feeSettings,
  onSave,
}: {
  feeSettings: FeeSettings[]
  onSave: (fees: FeeSettings) => void
}) {
  const [date, setDate] = useState(todayISO)
  const [commission, setCommission] = useState('')
  const [fixedFee, setFixedFee] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const commissionPercent = parsePercentInput(commission)
    const fixedFeePerItem = parseCurrencyInput(fixedFee)

    if (!isValidISODate(date)) {
      setError('Escolha a data em que as novas taxas começam a valer.')
    } else if (commissionPercent === null) {
      setError('Digite a comissão como 14 ou 14,5.')
    } else if (fixedFeePerItem === null) {
      setError('Digite a taxa fixa como 4,00.')
    } else if (feeSettings.some((fees) => fees.effectiveFrom === date)) {
      setError('Já existe uma taxa com essa data. Altere a que já está na lista.')
    } else {
      onSave({ effectiveFrom: date, commissionPercent, fixedFeePerItem })
      setCommission('')
      setFixedFee('')
      setError(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} grid gap-3 md:grid-cols-4 md:items-end`}>
      <h3 className="font-semibold md:col-span-4">Cadastrar novas taxas</h3>
      <div>
        <label htmlFor="taxa-data" className={labelClass}>
          Valem a partir de
        </label>
        <input id="taxa-data" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <label htmlFor="taxa-comissao" className={labelClass}>
          Comissão (%)
        </label>
        <input
          id="taxa-comissao"
          className={inputClass}
          inputMode="decimal"
          placeholder="14"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="taxa-fixa" className={labelClass}>
          Taxa fixa por item
        </label>
        <input
          id="taxa-fixa"
          className={inputClass}
          inputMode="decimal"
          placeholder="4,00"
          value={fixedFee}
          onChange={(e) => setFixedFee(e.target.value)}
        />
      </div>
      <div>
        <button type="submit" className={primaryButtonClass}>
          Cadastrar taxas
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700 md:col-span-4">
          {error}
        </p>
      )}
    </form>
  )
}

export function FeesTab({ feeSettings, onSave, onDelete }: FeesTabProps) {
  const current = pickFeeSettings(feeSettings, todayISO())

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-prose text-slate-700">
        A Shopee cobra uma comissão (uma porcentagem do preço) e uma taxa fixa
        por item vendido. Como esses valores mudam com o tempo, cada cadastro
        vale a partir de uma data: uma venda antiga continua usando as taxas
        que valiam na época.
      </p>
      <p className="max-w-prose text-sm text-slate-600">
        Pedidos que vêm do relatório "Minha Renda" já trazem as taxas reais e
        não usam estes valores. Eles servem para estimar o lucro dos demais.
      </p>

      {feeSettings.length === 0 ? (
        <p role="status" className="max-w-prose rounded-xl bg-amber-50 p-4 text-amber-900">
          Nenhuma taxa cadastrada. Sem elas, o lucro estimado não desconta a
          comissão da Shopee e aparece maior do que é.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {feeSettings.map((fees) => (
            <li
              key={fees.effectiveFrom}
              className={`${cardClass} flex flex-col gap-3 md:flex-row md:items-end`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  Valem a partir de {formatDate(fees.effectiveFrom)}
                </p>
                {current?.effectiveFrom === fees.effectiveFrom && (
                  <p className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-900">
                    Em vigor hoje
                  </p>
                )}
              </div>
              <div className="md:w-40">
                <PercentInput
                  id={`comissao-${fees.effectiveFrom}`}
                  label="Comissão"
                  value={fees.commissionPercent}
                  onCommit={(commissionPercent) => onSave({ ...fees, commissionPercent })}
                />
              </div>
              <div className="md:w-48">
                <MoneyInput
                  id={`fixa-${fees.effectiveFrom}`}
                  label="Taxa fixa por item"
                  value={fees.fixedFeePerItem}
                  onCommit={(fixedFeePerItem) => onSave({ ...fees, fixedFeePerItem })}
                />
              </div>
              <button
                type="button"
                className={dangerButtonClass}
                onClick={() => {
                  if (window.confirm(`Remover as taxas de ${formatDate(fees.effectiveFrom)}?`)) {
                    onDelete(fees.effectiveFrom)
                  }
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddFeeForm feeSettings={feeSettings} onSave={onSave} />
    </div>
  )
}
