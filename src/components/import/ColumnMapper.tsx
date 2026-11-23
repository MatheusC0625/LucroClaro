import { importFields, type ColumnMapping, type ImportField } from '../../services/import/columns'
import { cardClass, inputClass } from '../ui/styles'

interface ColumnMapperProps {
  headers: string[]
  mapping: ColumnMapping
  onChange: (field: ImportField, columnIndex: number | undefined) => void
}

function columnLabel(header: string, index: number): string {
  return `${header || 'Coluna sem título'} (coluna ${index + 1})`
}

export function ColumnMapper({ headers, mapping, onChange }: ColumnMapperProps) {
  return (
    <section className={cardClass} aria-labelledby="titulo-colunas">
      <h2 id="titulo-colunas" className="font-semibold">
        Confira as colunas
      </h2>
      <p className="mt-1 max-w-prose text-sm text-slate-600">
        Reconhecemos {Object.keys(mapping).length} colunas automaticamente. Se a Shopee mudar o formato do relatório,
        corrija aqui qual coluna tem cada informação.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {importFields.map((info) => {
          const id = `coluna-${info.field}`
          const missing = info.required && mapping[info.field] === undefined
          return (
            <div key={info.field}>
              <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
                {info.label}
                {info.required && <span className="text-red-700"> (obrigatório)</span>}
              </label>
              <select
                id={id}
                className={inputClass}
                value={mapping[info.field] ?? ''}
                aria-invalid={missing}
                aria-describedby={`${id}-ajuda`}
                onChange={(event) =>
                  onChange(info.field, event.target.value === '' ? undefined : Number(event.target.value))
                }
              >
                <option value="">Não usar</option>
                {headers.map((header, index) => (
                  <option key={index} value={index}>
                    {columnLabel(header, index)}
                  </option>
                ))}
              </select>
              <p id={`${id}-ajuda`} className="mt-1 text-xs text-slate-600">
                {info.help}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
