import type { DataMode } from '../types/dataMode'
import {
  DEMO_DATABASE_NAME,
  LucroClaroDatabase,
  REAL_DATABASE_NAME,
} from './database'

const databases: Record<DataMode, LucroClaroDatabase> = {
  demo: new LucroClaroDatabase(DEMO_DATABASE_NAME),
  real: new LucroClaroDatabase(REAL_DATABASE_NAME),
}

export function getDatabase(mode: DataMode): LucroClaroDatabase {
  return databases[mode]
}
