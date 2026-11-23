import { ExtraCostsTab } from '../components/products/ExtraCostsTab'
import { FeesTab } from '../components/products/FeesTab'
import { ProductsTab } from '../components/products/ProductsTab'
import { Tabs } from '../components/ui/Tabs'
import { useCostSettings } from '../hooks/useCostSettings'

export function ProductsPage() {
  const { data, notice, saveProduct, saveExtraCost, deleteExtraCost, saveFee, deleteFee } =
    useCostSettings()

  return (
    <section>
      <h1 className="text-2xl font-bold">Produtos e custos</h1>
      <p className="mt-2 max-w-prose text-slate-600">
        Quanto mais certos estes números, mais verdadeiro é o seu lucro.
      </p>

      <p role="status" className="mt-3 h-6 text-sm font-medium text-emerald-800">
        {notice}
      </p>

      {data ? (
        <Tabs
          label="Custos e taxas"
          tabs={[
            {
              id: 'produtos',
              label:
                data.unregistered.length > 0
                  ? `Produtos (${data.unregistered.length} sem custo)`
                  : 'Produtos',
              content: (
                <ProductsTab
                  products={data.products}
                  unregistered={data.unregistered}
                  onSave={saveProduct}
                />
              ),
            },
            {
              id: 'extras',
              label: 'Custos extras',
              content: (
                <ExtraCostsTab
                  extraCosts={data.extraCosts}
                  onSave={saveExtraCost}
                  onDelete={deleteExtraCost}
                />
              ),
            },
            {
              id: 'taxas',
              label: 'Taxas',
              content: (
                <FeesTab
                  feeSettings={data.feeSettings}
                  onSave={saveFee}
                  onDelete={deleteFee}
                />
              ),
            },
          ]}
        />
      ) : (
        <p className="text-slate-600">Carregando...</p>
      )}
    </section>
  )
}
