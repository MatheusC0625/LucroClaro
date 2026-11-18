import Dexie, { type EntityTable } from 'dexie'
import type { ExtraCost, FeeSettings } from '../types/cost'
import type { Order } from '../types/order'
import type { Product } from '../types/product'

export interface SettingRecord {
  key: string
  value: unknown
}

export const REAL_DATABASE_NAME = 'lucro-claro'
export const DEMO_DATABASE_NAME = 'lucro-claro-demo'

export class LucroClaroDatabase extends Dexie {
  orders!: EntityTable<Order, 'id'>
  products!: EntityTable<Product, 'sku'>
  extraCosts!: EntityTable<ExtraCost, 'id'>
  feeSettings!: EntityTable<FeeSettings, 'effectiveFrom'>
  settings!: EntityTable<SettingRecord, 'key'>

  constructor(name: string = REAL_DATABASE_NAME) {
    super(name)
    this.version(1).stores({
      orders: 'id, createdDate, status',
      products: 'sku',
      extraCosts: 'id',
      feeSettings: 'effectiveFrom',
      settings: 'key',
    })
  }
}
