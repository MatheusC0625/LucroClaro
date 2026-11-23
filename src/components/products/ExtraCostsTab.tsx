import { useState, type FormEvent } from 'react'
import { formatCurrency, parseCurrencyInput } from '../../services/format/currency'
import type { ExtraCost } from '../../types/cost'
import { MoneyInput, NameInput } from '../ui/fields'
import {
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from '../ui/styles'

interface ExtraCostsTabProps {
  extraCosts: ExtraCost[]
  onSave: (cost: ExtraCost) => void
  onDelete: (id: string) => void
}

function AddExtraCostForm({ onSave }: { onSave: (cost: ExtraCost) => void }) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cleanName = name.trim()
    const cents = parseCurrencyInput(amount)

    if (!cleanName) {
      setError('Dê um nome ao custo, como "Sacola".')
    } else if (cents === null) {
      setError('Digite o valor como 0,80.')
    } else {
      onSave({ id: crypto.randomUUID(), name: cleanName, amount: cents, active: true })
      setName('')
      setAmount('')
      setError(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} grid gap-3 md:grid-cols-3 md:items-end`}>
      <h3 className="font-semibold md:col-span-3">Adicionar custo extra</h3>
      <div>
        <label htmlFor="extra-nome" className={labelClass}>
          Nome
        </label>
        <input id="extra-nome" className={inputClass} placeholder="Sacola" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="extra-valor" className={labelClass}>
          Valor por pedido
        </label>
        <input
          id="extra-valor"
          className={inputClass}
          inputMode="decimal"
          placeholder="0,80"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div>
        <button type="submit" className={primaryButtonClass}>
          Adicionar custo
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700 md:col-span-3">
          {error}
        </p>
      )}
    </form>
  )
}

export function ExtraCostsTab({ extraCosts, onSave, onDelete }: ExtraCostsTabProps) {
  const totalPerOrder = extraCosts
    .filter((cost) => cost.active)
    .reduce((sum, cost) => sum + cost.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-prose text-slate-700">
        São os gastos que se repetem em todo pedido, como sacola, etiqueta,
        impressão e fita. Cada custo ligado é descontado uma vez em cada venda.
        Desligue um custo para parar de contá-lo sem perder o cadastro.
      </p>

      <p className={`${cardClass} text-lg`}>
        Custos extras ligados:{' '}
        <strong>{formatCurrency(totalPerOrder)}</strong> por pedido
      </p>

      {extraCosts.length === 0 ? (
        <p className="text-slate-600">Nenhum custo extra cadastrado ainda.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {extraCosts.map((cost) => (
            <li
              key={cost.id}
              className={`${cardClass} flex flex-col gap-3 md:flex-row md:items-end`}
            >
              <div className="min-w-0 flex-1">
                <NameInput
                  id={`extra-nome-${cost.id}`}
                  label="Nome"
                  value={cost.name}
                  onCommit={(name) => onSave({ ...cost, name })}
                />
              </div>
              <div className="md:w-48">
                <MoneyInput
                  id={`extra-valor-${cost.id}`}
                  label="Valor por pedido"
                  value={cost.amount}
                  onCommit={(amount) => onSave({ ...cost, amount })}
                />
              </div>
              <label className="flex items-center gap-2 py-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-emerald-700"
                  checked={cost.active}
                  onChange={(event) => onSave({ ...cost, active: event.target.checked })}
                />
                Ligado
              </label>
              <button
                type="button"
                className={dangerButtonClass}
                onClick={() => {
                  if (window.confirm(`Remover o custo "${cost.name}"?`)) onDelete(cost.id)
                }}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddExtraCostForm onSave={onSave} />
    </div>
  )
}
