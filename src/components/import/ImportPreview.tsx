import { formatCurrency } from '../../services/format/currency'
import { formatDate } from '../../services/format/date'
import type { NormalizeResult } from '../../services/import/normalizeOrders'
import { cardClass, primaryButtonClass } from '../ui/styles'

interface ImportPreviewProps {
  result: NormalizeResult
  saving: boolean
  onImport: () => void
}

const PREVIEW_ROWS = 5

export function ImportPreview({ result, saving, onImport }: ImportPreviewProps) {
  const { orders, warnings, quantityAssumed } = result
  const sample = orders.slice(0, PREVIEW_ROWS)
  const itemCount = orders.reduce((sum, order) => sum + order.items.length, 0)

  return (
    <section className={cardClass} aria-labelledby="titulo-previa">
      <h2 id="titulo-previa" className="font-semibold">
        Pré-visualização
      </h2>

      {orders.length === 0 ? (
        <p role="alert" className="mt-3 text-red-800">
          Com essas colunas não encontramos nenhum pedido. Confira o mapeamento acima.
        </p>
      ) : (
        <>
          <p className="mt-2 text-slate-700">
            Encontramos <strong>{orders.length}</strong> {orders.length === 1 ? 'pedido' : 'pedidos'} com{' '}
            <strong>{itemCount}</strong> {itemCount === 1 ? 'produto' : 'produtos'}, de {formatDate(orders[0].createdDate)}{' '}
            a {formatDate(orders[orders.length - 1].createdDate)}.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <caption className="sr-only">Primeiros pedidos encontrados no arquivo</caption>
              <thead className="border-b border-slate-200 text-left text-slate-700">
                <tr>
                  <th scope="col" className="py-2 pr-3 font-semibold">Pedido</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Data</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Produtos</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Vendido</th>
                  <th scope="col" className="py-2 text-right font-semibold">Caiu na carteira</th>
                </tr>
              </thead>
              <tbody>
                {sample.map((order) => {
                  const sold = order.items.reduce((sum, item) => sum + item.total, 0)
                  const hasPayout = order.items.every((item) => item.payout !== undefined)
                  const payout = order.items.reduce((sum, item) => sum + (item.payout ?? 0), 0)
                  return (
                    <tr key={order.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 font-mono text-xs">{order.id}</td>
                      <td className="py-2 pr-3">{formatDate(order.createdDate)}</td>
                      <td className="py-2 pr-3">{order.items.map((item) => item.name).join(', ')}</td>
                      <td className="py-2 pr-3 text-right">{formatCurrency(sold)}</td>
                      <td className="py-2 text-right">{hasPayout ? formatCurrency(payout) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {orders.length > PREVIEW_ROWS && (
            <p className="mt-2 text-sm text-slate-600">Mostrando os {PREVIEW_ROWS} primeiros de {orders.length}.</p>
          )}
        </>
      )}

      {quantityAssumed && orders.length > 0 && (
        <p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Este arquivo não informa a quantidade vendida, então contamos 1 unidade por produto. Se você vendeu 2 ou mais
          unidades de algum produto, o custo do produto ficará menor do que o real e o lucro, maior.
        </p>
      )}

      {warnings.length > 0 && (
        <ul className="mt-4 list-disc rounded-lg bg-amber-50 p-3 pl-7 text-sm text-amber-900">
          {warnings.slice(0, 5).map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
          {warnings.length > 5 && <li>E mais {warnings.length - 5} avisos.</li>}
        </ul>
      )}

      <div className="mt-5">
        <button type="button" className={primaryButtonClass} disabled={orders.length === 0 || saving} onClick={onImport}>
          {saving ? 'Importando...' : `Importar ${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'}`}
        </button>
      </div>
    </section>
  )
}
