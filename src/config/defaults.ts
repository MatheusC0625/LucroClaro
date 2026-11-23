import type { Goal } from '../types/goal'
import type { MeiSettings } from '../types/mei'

export const DEFAULT_GOAL: Goal = {
  metric: 'revenue',
  dailyTarget: 0,
  monthlyTarget: 0,
}

export const DEFAULT_MEI_SETTINGS: MeiSettings = {
  annualLimit: 8_100_000, // R$ 81.000,00
  dasDueDay: 20,
  dasAmount: null,
  openingDate: null,
}
