import type { ColumnMapping } from '../services/import/columns'
import { normalizeOrders } from '../services/import/normalizeOrders'
import type { Order } from '../types/order'
import type { OrdersDataSource } from './OrdersDataSource'

export class SpreadsheetDataSource implements OrdersDataSource {
  private readonly rows: unknown[][]
  private readonly mapping: ColumnMapping

  constructor(rows: unknown[][], mapping: ColumnMapping) {
    this.rows = rows
    this.mapping = mapping
  }

  async getOrders(): Promise<Order[]> {
    return normalizeOrders(this.rows, this.mapping).orders
  }
}
