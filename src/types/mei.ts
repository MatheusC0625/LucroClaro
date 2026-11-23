import type { Cents } from './money'
import type { ISODate } from './period'

export interface MeiSettings {
  annualLimit: Cents
  dasDueDay: number
  dasAmount: Cents | null
  openingDate: ISODate | null
}
