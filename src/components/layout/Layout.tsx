import { NavLink, Outlet } from 'react-router-dom'
import { navItems } from '../../app/navigation'

function linkClass({ isActive }: { isActive: boolean }) {
  return [
    'rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700',
    isActive
      ? 'bg-emerald-100 text-emerald-900'
      : 'text-slate-700 hover:bg-slate-100',
  ].join(' ')
}

export function Layout() {
  return (
    <div className="min-h-screen md:flex">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Pular para o conteúdo
      </a>

      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <div className="mb-6 flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-sm font-bold text-white"
          >
            LC
          </span>
          <span className="text-lg font-semibold">Lucro Claro</span>
        </div>
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-900">
          Seus dados ficam só neste navegador. Nada é enviado para servidor
          nenhum.
        </p>
        <main id="conteudo" className="flex-1 p-4 pb-24 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 flex gap-1 overflow-x-auto border-t border-slate-200 bg-white p-2 md:hidden"
      >
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={(state) => `${linkClass(state)} whitespace-nowrap`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
