import { useDataMode } from '../../hooks/useDataMode'

const buttonClass =
  'font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700'

export function DataModeBar() {
  const { isDemo, setMode } = useDataMode()

  if (isDemo) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-100 px-4 py-2 text-sm text-amber-900">
        <span>Você está vendo dados de exemplo de uma loja fictícia.</span>
        <button type="button" className={buttonClass} onClick={() => setMode('real')}>
          Usar meus dados
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-slate-100 px-4 py-2 text-sm text-slate-700">
      <span>Você está usando os seus dados.</span>
      <button type="button" className={buttonClass} onClick={() => setMode('demo')}>
        Ver demonstração
      </button>
    </div>
  )
}
