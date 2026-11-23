import { parseCurrencyInput } from '../../services/format/currency'
import {
  formatCentsAsInput,
  formatPercentInput,
  parsePercentInput,
} from '../../services/format/input'
import type { Cents } from '../../types/money'
import { CommittedInput } from './CommittedInput'

interface BaseFieldProps<T> {
  id: string
  label: string
  hideLabel?: boolean
  value: T
  onCommit: (value: T) => void
}

export function MoneyInput(props: BaseFieldProps<Cents>) {
  return (
    <CommittedInput
      {...props}
      format={formatCentsAsInput}
      parse={parseCurrencyInput}
      errorMessage="Digite um valor como 12,50."
      prefix="R$"
      inputMode="decimal"
    />
  )
}

export function PercentInput(props: BaseFieldProps<number>) {
  return (
    <CommittedInput
      {...props}
      format={formatPercentInput}
      parse={parsePercentInput}
      errorMessage="Digite uma porcentagem de 0 a 100, como 14."
      suffix="%"
      inputMode="decimal"
    />
  )
}

export function NameInput(props: BaseFieldProps<string>) {
  return (
    <CommittedInput
      {...props}
      format={(text) => text}
      parse={(text) => text.trim() || null}
      errorMessage="O nome não pode ficar vazio."
    />
  )
}

export function DayInput(props: BaseFieldProps<number>) {
  return (
    <CommittedInput
      {...props}
      format={String}
      parse={(text) => {
        if (!/^\d{1,2}$/.test(text.trim())) return null
        const day = Number(text)
        return day >= 1 && day <= 31 ? day : null
      }}
      errorMessage="Digite um dia do mês, de 1 a 31."
      inputMode="decimal"
    />
  )
}
