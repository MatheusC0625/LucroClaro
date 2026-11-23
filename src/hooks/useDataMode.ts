import { useContext } from 'react'
import { DataModeContext } from '../app/dataModeContext'

export function useDataMode() {
  const value = useContext(DataModeContext)
  if (!value) {
    throw new Error('useDataMode precisa estar dentro do DataModeProvider')
  }
  return value
}
