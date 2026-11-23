import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ColumnMapper } from '../components/import/ColumnMapper'
import { FileDropzone } from '../components/import/FileDropzone'
import { ImportPreview } from '../components/import/ImportPreview'
import { cardClass, primaryButtonClass, secondaryButtonClass } from '../components/ui/styles'
import { useDataMode } from '../hooks/useDataMode'
import { findUnregisteredProducts } from '../services/calculations/catalog'
import {
  missingRequiredFields,
  suggestMapping,
  type ColumnMapping,
  type ImportField,
} from '../services/import/columns'
import { normalizeOrders } from '../services/import/normalizeOrders'
import { readSpreadsheetFile, type ParsedSheet } from '../services/import/readSpreadsheet'

const MAX_FILE_BYTES = 20 * 1024 * 1024

interface ImportOutcome {
  added: number
  updated: number
  unregistered: number
}

export function ImportPage() {
  const { isDemo, setMode, repos } = useDataMode()
  const [fileName, setFileName] = useState<string | null>(null)
  const [sheet, setSheet] = useState<ParsedSheet | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({})
  const [error, setError] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null)

  const missing = missingRequiredFields(mapping)
  const result = useMemo(
    () => (sheet && missing.length === 0 ? normalizeOrders(sheet.rows, mapping) : null),
    [sheet, mapping, missing.length],
  )

  function reset() {
    setFileName(null)
    setSheet(null)
    setMapping({})
    setError(null)
    setOutcome(null)
  }

  async function handleFile(file: File) {
    reset()
    if (file.size > MAX_FILE_BYTES) {
      setError('O arquivo é grande demais. Exporte um período menor na Central do Vendedor.')
      return
    }
    setReading(true)
    try {
      const parsed = await readSpreadsheetFile(file)
      setFileName(file.name)
      setSheet(parsed)
      setMapping(suggestMapping(parsed.headers))
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Não consegui ler este arquivo.')
    } finally {
      setReading(false)
    }
  }

  async function handleImport() {
    if (!result) return
    setSaving(true)
    try {
      const saved = await repos.saveOrders(result.orders)
      const [orders, products] = await Promise.all([repos.getOrders(), repos.getProducts()])
      setOutcome({ ...saved, unregistered: findUnregisteredProducts(orders, products).length })
      setSheet(null)
    } finally {
      setSaving(false)
    }
  }

  function changeMapping(field: ImportField, columnIndex: number | undefined) {
    setMapping((current) => {
      const next = { ...current }
      if (columnIndex === undefined) delete next[field]
      else next[field] = columnIndex
      return next
    })
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Importar relatórios</h1>
        <p className="mt-2 max-w-prose text-slate-600">
          Envie o relatório exportado da Central do Vendedor para o Lucro Claro ler as suas vendas.
        </p>
      </div>

      <p className="max-w-prose rounded-xl bg-emerald-50 p-4 text-sm text-emerald-950">
        O arquivo é lido aqui no seu navegador e não é enviado para lugar nenhum. Só guardamos os pedidos e os valores.
        Seu nome, os dados do banco e os usuários dos compradores não são lidos nem guardados.
      </p>

      {isDemo ? (
        <div className={cardClass}>
          <h2 className="font-semibold">Você está na demonstração</h2>
          <p className="mt-2 max-w-prose text-slate-700">
            Para importar o seu relatório, troque para os seus dados. A demonstração continua disponível depois.
          </p>
          <button type="button" className={`${primaryButtonClass} mt-4`} onClick={() => setMode('real')}>
            Usar meus dados
          </button>
        </div>
      ) : outcome ? (
        <div className={cardClass} role="status">
          <h2 className="text-lg font-semibold">Importação concluída</h2>
          <p className="mt-2 text-slate-700">
            {outcome.added} {outcome.added === 1 ? 'pedido novo' : 'pedidos novos'}
            {outcome.updated > 0 &&
              ` e ${outcome.updated} ${outcome.updated === 1 ? 'pedido atualizado' : 'pedidos atualizados'} (já estavam guardados)`}
            .
          </p>
          {outcome.unregistered > 0 && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-amber-900">
              {outcome.unregistered} {outcome.unregistered === 1 ? 'produto vendido está' : 'produtos vendidos estão'} sem
              custo cadastrado. Informe o custo para o lucro ficar certo.{' '}
              <Link to="/produtos" className="font-semibold underline">
                Informar os custos
              </Link>
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/" className={primaryButtonClass}>
              Ver o início
            </Link>
            <button type="button" className={secondaryButtonClass} onClick={reset}>
              Importar outro arquivo
            </button>
          </div>
        </div>
      ) : (
        <>
          <FileDropzone onFile={handleFile} disabled={reading} />

          {reading && (
            <p role="status" className="text-slate-600">
              Lendo o arquivo...
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-900">
              {error}
            </p>
          )}

          {sheet && (
            <>
              <p className="text-sm text-slate-600">
                Arquivo: <strong>{fileName}</strong> · aba "{sheet.sheetName}" · {sheet.rows.length} linhas de dados
              </p>
              <ColumnMapper headers={sheet.headers} mapping={mapping} onChange={changeMapping} />
              {missing.length > 0 ? (
                <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-900">
                  Escolha as colunas marcadas como obrigatórias para continuar.
                </p>
              ) : (
                result && <ImportPreview result={result} saving={saving} onImport={handleImport} />
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}
