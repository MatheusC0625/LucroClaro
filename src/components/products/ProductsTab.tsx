import { useState, type FormEvent } from 'react'
import type { UnregisteredProduct } from '../../services/calculations/catalog'
import { parseCurrencyInput } from '../../services/format/currency'
import type { Product } from '../../types/product'
import { MoneyInput, NameInput } from '../ui/fields'
import {
  cardClass,
  inputClass,
  labelClass,
  primaryButtonClass,
} from '../ui/styles'

interface ProductsTabProps {
  products: Product[]
  unregistered: UnregisteredProduct[]
  onSave: (product: Product) => void
}

function UnregisteredRow({
  item,
  onSave,
}: {
  item: UnregisteredProduct
  onSave: (product: Product) => void
}) {
  const [cost, setCost] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cents = parseCurrencyInput(cost)
    if (cents === null) {
      setError(true)
      return
    }
    onSave({ sku: item.sku, name: item.name, unitCost: cents })
  }

  return (
    <li>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 rounded-xl bg-amber-50 p-4 md:flex-row md:items-end"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-slate-600">
            Código {item.sku} · {item.saleCount}{' '}
            {item.saleCount === 1 ? 'venda' : 'vendas'}
          </p>
        </div>
        <div>
          <label htmlFor={`custo-novo-${item.sku}`} className={labelClass}>
            Custo de 1 unidade
          </label>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-slate-600">
              R$
            </span>
            <input
              id={`custo-novo-${item.sku}`}
              className={inputClass}
              inputMode="decimal"
              value={cost}
              aria-invalid={error}
              onChange={(event) => {
                setCost(event.target.value)
                setError(false)
              }}
            />
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-700">Digite um valor como 12,50.</p>
          )}
        </div>
        <button type="submit" className={primaryButtonClass}>
          Salvar custo
        </button>
      </form>
    </li>
  )
}

function AddProductForm({
  products,
  onSave,
}: {
  products: Product[]
  onSave: (product: Product) => void
}) {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const cleanSku = sku.trim()
    const cleanName = name.trim()
    const cents = parseCurrencyInput(cost)

    if (!cleanSku || !cleanName) {
      setError('Preencha o código e o nome do produto.')
    } else if (cents === null) {
      setError('Digite o custo como 12,50.')
    } else if (products.some((product) => product.sku === cleanSku)) {
      setError('Já existe um produto com esse código.')
    } else {
      onSave({ sku: cleanSku, name: cleanName, unitCost: cents })
      setSku('')
      setName('')
      setCost('')
      setError(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`${cardClass} grid gap-3 md:grid-cols-4 md:items-end`}>
      <h3 className="font-semibold md:col-span-4">Adicionar produto</h3>
      <div>
        <label htmlFor="novo-sku" className={labelClass}>
          Código (SKU)
        </label>
        <input id="novo-sku" className={inputClass} value={sku} onChange={(e) => setSku(e.target.value)} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="novo-nome" className={labelClass}>
          Nome do produto
        </label>
        <input id="novo-nome" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label htmlFor="novo-custo" className={labelClass}>
          Custo de 1 unidade
        </label>
        <input
          id="novo-custo"
          className={inputClass}
          inputMode="decimal"
          placeholder="12,00"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700 md:col-span-4">
          {error}
        </p>
      )}
      <div className="md:col-span-4">
        <button type="submit" className={primaryButtonClass}>
          Adicionar produto
        </button>
      </div>
    </form>
  )
}

export function ProductsTab({ products, unregistered, onSave }: ProductsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-prose text-slate-700">
        Informe quanto você paga por 1 unidade de cada produto. É com esse valor
        que o Lucro Claro descobre quanto sobrou de verdade em cada venda.
      </p>

      {unregistered.length > 0 && (
        <section aria-labelledby="sem-custo">
          <h2 id="sem-custo" className="text-lg font-semibold">
            Falta o custo destes produtos
          </h2>
          <p className="mt-1 max-w-prose text-sm text-slate-700">
            Você vendeu estes produtos, mas ainda não disse quanto custam. Até lá
            o lucro deles é calculado com custo zero e aparece maior do que é.
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {unregistered.map((item) => (
              <UnregisteredRow key={item.sku} item={item} onSave={onSave} />
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="meus-produtos">
        <h2 id="meus-produtos" className="text-lg font-semibold">
          Meus produtos
        </h2>
        {products.length === 0 ? (
          <p className="mt-2 text-slate-600">Nenhum produto cadastrado ainda.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {products.map((product) => (
              <li
                key={product.sku}
                className={`${cardClass} flex flex-col gap-3 md:flex-row md:items-end`}
              >
                <div className="min-w-0 flex-1">
                  <NameInput
                    id={`nome-${product.sku}`}
                    label="Nome do produto"
                    value={product.name}
                    onCommit={(name) => onSave({ ...product, name })}
                  />
                  <p className="mt-1 text-sm text-slate-600">Código {product.sku}</p>
                </div>
                <div className="md:w-48">
                  <MoneyInput
                    id={`custo-${product.sku}`}
                    label="Custo de 1 unidade"
                    value={product.unitCost}
                    onCommit={(unitCost) => onSave({ ...product, unitCost })}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddProductForm products={products} onSave={onSave} />
    </div>
  )
}
