import type { ISODate, Period } from '../../types/period'
import { addDays } from '../format/date'

export interface ProductPeriodPreset {
  id: string
  label: string
  period: Period
}

export function getProductPeriodPresets(
  today: ISODate,
  firstOrderDate: ISODate | null,
): ProductPeriodPreset[] {
  const monthStart = `${today.slice(0, 7)}-01`
  const previousMonthEnd = addDays(monthStart, -1)

  return [
    { id: 'mes', label: 'Este mês', period: { start: monthStart, end: today } },
    {
      id: 'mes-passado',
      label: 'Mês passado',
      period: { start: `${previousMonthEnd.slice(0, 7)}-01`, end: previousMonthEnd },
    },
    { id: '90-dias', label: 'Últimos 90 dias', period: { start: addDays(today, -89), end: today } },
    { id: 'ano', label: 'Este ano', period: { start: `${today.slice(0, 4)}-01-01`, end: today } },
    { id: 'tudo', label: 'Tudo', period: { start: firstOrderDate ?? today, end: today } },
  ]
}
