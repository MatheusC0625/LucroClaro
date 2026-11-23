import { DEFAULT_GOAL, DEFAULT_MEI_SETTINGS } from '../config/defaults'
import type { CostContext } from '../services/calculations/profit'
import type { ExtraCost, FeeSettings } from '../types/cost'
import type { Goal } from '../types/goal'
import type { MeiSettings } from '../types/mei'
import type { Order } from '../types/order'
import type { Period } from '../types/period'
import type { Product } from '../types/product'
import type { LucroClaroDatabase } from './database'

export const GOAL_KEY = 'goal'
export const MEI_KEY = 'mei'

export interface SaveOrdersResult {
  added: number
  updated: number
}


export function createRepositories(db: LucroClaroDatabase) {
  return {
    async saveOrders(orders: Order[]): Promise<SaveOrdersResult> {
      const existing = await db.orders.bulkGet(orders.map((order) => order.id))
      const updated = existing.filter((order) => order !== undefined).length
      await db.orders.bulkPut(orders)
      return { added: orders.length - updated, updated }
    },

    getOrders(): Promise<Order[]> {
      return db.orders.toArray()
    },

    getOrdersInPeriod(period: Period): Promise<Order[]> {
      return db.orders
        .where('createdDate')
        .between(period.start, period.end, true, true)
        .toArray()
    },

    getProducts(): Promise<Product[]> {
      return db.products.toArray()
    },

    async saveProduct(product: Product): Promise<void> {
      await db.products.put(product)
    },

    getExtraCosts(): Promise<ExtraCost[]> {
      return db.extraCosts.toArray()
    },

    async saveExtraCost(cost: ExtraCost): Promise<void> {
      await db.extraCosts.put(cost)
    },

    async deleteExtraCost(id: string): Promise<void> {
      await db.extraCosts.delete(id)
    },

    getFeeSettings(): Promise<FeeSettings[]> {
      return db.feeSettings.orderBy('effectiveFrom').toArray()
    },

    async saveFeeSettings(fees: FeeSettings): Promise<void> {
      await db.feeSettings.put(fees)
    },

    async deleteFeeSettings(effectiveFrom: string): Promise<void> {
      await db.feeSettings.delete(effectiveFrom)
    },

    async getGoal(): Promise<Goal> {
      const record = await db.settings.get(GOAL_KEY)
      return (record?.value as Goal | undefined) ?? DEFAULT_GOAL
    },

    async saveGoal(goal: Goal): Promise<void> {
      await db.settings.put({ key: GOAL_KEY, value: goal })
    },

    async getMeiSettings(): Promise<MeiSettings> {
      const record = await db.settings.get(MEI_KEY)
      return (record?.value as MeiSettings | undefined) ?? DEFAULT_MEI_SETTINGS
    },

    async saveMeiSettings(settings: MeiSettings): Promise<void> {
      await db.settings.put({ key: MEI_KEY, value: settings })
    },

    async getCostContext(): Promise<CostContext> {
      const [products, extraCosts, feeSettings] = await Promise.all([
        db.products.toArray(),
        db.extraCosts.toArray(),
        db.feeSettings.toArray(),
      ])
      return { products, extraCosts, feeSettings }
    },

    async clearAll(): Promise<void> {
      await Promise.all(db.tables.map((table) => table.clear()))
    },
  }
}

export type Repositories = ReturnType<typeof createRepositories>
