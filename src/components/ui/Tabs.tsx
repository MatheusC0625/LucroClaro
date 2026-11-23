import { useState, type KeyboardEvent, type ReactNode } from 'react'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
}

export function Tabs({ tabs, label }: { tabs: TabItem[]; label: string }) {
  const [activeId, setActiveId] = useState(tabs[0].id)
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeId),
  )

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (step === 0) return
    event.preventDefault()
    const next = tabs[(activeIndex + step + tabs.length) % tabs.length]
    setActiveId(next.id)
    document.getElementById(`aba-${next.id}`)?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={label}
        className="flex gap-1 overflow-x-auto border-b border-slate-200"
      >
        {tabs.map((tab) => {
          const selected = tab.id === tabs[activeIndex].id
          return (
            <button
              key={tab.id}
              id={`aba-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`painel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={handleKeyDown}
              className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700 ${
                selected
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`painel-${tabs[activeIndex].id}`}
        aria-labelledby={`aba-${tabs[activeIndex].id}`}
        className="pt-5"
      >
        {tabs[activeIndex].content}
      </div>
    </div>
  )
}
