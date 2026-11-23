import { createContext } from 'react'
import type { Repositories } from '../db/repositories'
import type { DataMode } from '../types/dataMode'

export interface DataModeValue {
  mode: DataMode
  isDemo: boolean
  ready: boolean
  storageError: boolean
  repos: Repositories
  setMode: (mode: DataMode) => void
}

export const DataModeContext = createContext<DataModeValue | null>(null)
