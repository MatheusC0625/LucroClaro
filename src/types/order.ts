import type { Cents } from './money'
import type { ISODate } from './period'

export type OrderStatus = 'completed' | 'pending' | 'cancelled' | 'returned'

export type OrderSource = 'spreadsheet' | 'demo' | 'shopee-api'

export interface OrderItem {
  sku: string
  name: string
  quantity: number
  total: Cents
  payout?: Cents
}

export interface Order {
  id: string
  createdDate: ISODate
  status: OrderStatus
  items: OrderItem[]
  shippingPaidBySeller: Cents
  source: OrderSource
}
