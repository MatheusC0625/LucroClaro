import { inputClass, labelClass } from '../ui/styles'

export interface PeriodInput {
  start: string
  end: string
}

interface PeriodPickerProps {
  legend: string
  idPrefix: string
  value: PeriodInput
  onChange: (value: PeriodInput) => void
}

export function PeriodPicker({ legend, idPrefix, value, onChange }: PeriodPickerProps) {
  const reversed = value.start !== '' && value.end !== '' && value.start > value.end

  return (
    <fieldset className="rounded-xl bg-white p-4 shadow-sm">
      <legend className="px-1 font-semibold">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-inicio`} className={labelClass}>
            De
          </label>
          <input
            id={`${idPrefix}-inicio`}
            type="date"
            className={inputClass}
            value={value.start}
            aria-invalid={reversed}
            onChange={(event) => onChange({ ...value, start: event.target.value })}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-fim`} className={labelClass}>
            Até
          </label>
          <input
            id={`${idPrefix}-fim`}
            type="date"
            className={inputClass}
            value={value.end}
            aria-invalid={reversed}
            onChange={(event) => onChange({ ...value, end: event.target.value })}
          />
        </div>
      </div>
      {reversed && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          A data inicial não pode ser depois da final.
        </p>
      )}
    </fieldset>
  )
}
