import type { Cents } from './money'

export interface Product {
  sku: string
  name: string
  unitCost: Cents
}
