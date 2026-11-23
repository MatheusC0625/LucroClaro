import { useState } from 'react'
import { inputClass, labelClass } from './styles'

interface CommittedInputProps<T> {
  id: string
  label: string
  hideLabel?: boolean
  value: T
  format: (value: T) => string
  parse: (text: string) => T | null
  onCommit: (value: T) => void
  errorMessage: string
  prefix?: string
  suffix?: string
  inputMode?: 'text' | 'decimal'
}

export function CommittedInput<T>({
  id,
  label,
  hideLabel,
  value,
  format,
  parse,
  onCommit,
  errorMessage,
  prefix,
  suffix,
  inputMode = 'text',
}: CommittedInputProps<T>) {
  const [draft, setDraft] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)

  function commit() {
    if (draft === null) return
    const parsed = parse(draft)
    if (parsed === null) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    setDraft(null)
    if (parsed !== value) onCommit(parsed)
  }

  return (
    <div>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : labelClass}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        {prefix && (
          <span aria-hidden="true" className="text-slate-600">
            {prefix}
          </span>
        )}
        <input
          id={id}
          className={inputClass}
          inputMode={inputMode}
          value={draft ?? format(value)}
          aria-invalid={invalid}
          aria-describedby={invalid ? `${id}-erro` : undefined}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
        {suffix && (
          <span aria-hidden="true" className="text-slate-600">
            {suffix}
          </span>
        )}
      </div>
      {invalid && (
        <p id={`${id}-erro`} className="mt-1 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
