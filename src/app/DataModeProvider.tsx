import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { getDatabase } from '../db/databases'
import { createRepositories } from '../db/repositories'
import { seedDemoDatabase } from '../db/seedDemoDatabase'
import { todayISO } from '../services/format/date'
import type { DataMode } from '../types/dataMode'
import { DataModeContext } from './dataModeContext'

const STORAGE_KEY = 'lucro-claro-mode'

function readStoredMode(): DataMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'real' ? 'real' : 'demo'
  } catch {
    return 'demo'
  }
}

function storeMode(mode: DataMode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    return
  }
}

export function DataModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<DataMode>(readStoredMode)
  const [readyMode, setReadyMode] = useState<DataMode | null>(null)
  const [storageError, setStorageError] = useState(false)

  const db = getDatabase(mode)
  const repos = useMemo(() => createRepositories(db), [db])

  useEffect(() => {
    let cancelled = false

    async function prepare() {
      try {
        if (mode === 'demo') await seedDemoDatabase(db, todayISO())
        if (!cancelled) setReadyMode(mode)
      } catch {
        if (!cancelled) setStorageError(true)
      }
    }

    prepare()
    return () => {
      cancelled = true
    }
  }, [mode, db])

  const value = useMemo(
    () => ({
      mode,
      isDemo: mode === 'demo',
      ready: readyMode === mode,
      storageError,
      repos,
      setMode: (next: DataMode) => {
        storeMode(next)
        setModeState(next)
      },
    }),
    [mode, readyMode, storageError, repos],
  )

  return (
    <DataModeContext.Provider value={value}>{children}</DataModeContext.Provider>
  )
}
