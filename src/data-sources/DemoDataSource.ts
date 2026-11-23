import { generateDemoData } from '../demo/demoData'
import type { Order } from '../types/order'
import type { ISODate } from '../types/period'
import type { OrdersDataSource } from './OrdersDataSource'

export class DemoDataSource implements OrdersDataSource {
  private readonly today: ISODate

  constructor(today: ISODate) {
    this.today = today
  }

  async getOrders(): Promise<Order[]> {
    return generateDemoData(this.today).orders
  }
}
