import type { Cents } from './money'

export interface MeiSettings {
  annualLimit: Cents
  dasDueDay: number
  dasAmount: Cents | null
}
