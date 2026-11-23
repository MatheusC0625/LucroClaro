import type { Champions } from '../../services/calculations/ranking'
import { formatCurrency } from '../../services/format/currency'
import { cardClass } from '../ui/styles'

export function ChampionsCard({ champions }: { champions: Champions }) {
  const { bestSeller, mostProfitable } = champions

  return (
    <div className={cardClass}>
      <h2 className="font-semibold">Seus produtos campeões do mês</h2>

      {!bestSeller ? (
        <p className="mt-3 text-slate-600">Quando você vender, eles aparecem aqui.</p>
      ) : (
        <dl className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-600">O que mais saiu</dt>
            <dd className="mt-1 text-lg font-semibold">{bestSeller.name}</dd>
            <dd className="text-sm text-slate-700">
              {bestSeller.unitsSold} {bestSeller.unitsSold === 1 ? 'unidade vendida' : 'unidades vendidas'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600">O que mais deu lucro</dt>
            {mostProfitable ? (
              <>
                <dd className="mt-1 text-lg font-semibold">{mostProfitable.name}</dd>
                <dd className="text-sm text-slate-700">
                  {formatCurrency(mostProfitable.profit)} de lucro
                </dd>
              </>
            ) : (
              <dd className="mt-1 text-slate-700">Nenhum produto deu lucro este mês.</dd>
            )}
          </div>
        </dl>
      )}

      {bestSeller && mostProfitable && bestSeller.sku === mostProfitable.sku && (
        <p className="mt-4 text-sm text-slate-700">
          O mesmo produto lidera nos dois: vende bem e ainda sobra dinheiro.
        </p>
      )}
      {bestSeller && mostProfitable && bestSeller.sku !== mostProfitable.sku && (
        <p className="mt-4 text-sm text-slate-700">
          O que mais sai não é o que mais dá lucro. Vale olhar o custo de cada um.
        </p>
      )}
    </div>
  )
}
