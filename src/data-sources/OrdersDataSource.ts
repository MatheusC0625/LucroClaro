import type { Order } from '../types/order'

export interface OrdersDataSource {
  getOrders(): Promise<Order[]>
}
