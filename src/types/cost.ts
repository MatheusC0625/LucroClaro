import type { Cents } from './money'
import type { ISODate } from './period'

export interface ExtraCost {
  id: string
  name: string
  amount: Cents
  active: boolean
}

export interface FeeSettings {
  effectiveFrom: ISODate
  commissionPercent: number
  fixedFeePerItem: Cents
}
