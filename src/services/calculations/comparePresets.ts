import { addDays } from '../format/date'
import type { ISODate, Period } from '../../types/period'
import {
  getDayPeriod,
  getPreviousMonthToDate,
  getWeekPeriod,
  shiftPeriodByDays,
  shiftPeriodByYears,
} from './periods'

export interface ComparePreset {
  id: string
  label: string
  current: Period
  base: Period
}

export function getComparePresets(today: ISODate): ComparePreset[] {
  const monthSoFar = { start: `${today.slice(0, 7)}-01`, end: today }
  const weekSoFar = { start: getWeekPeriod(today).start, end: today }

  return [
    {
      id: 'mes-passado',
      label: 'Este mês × mês passado',
      current: monthSoFar,
      base: getPreviousMonthToDate(today),
    },
    {
      id: 'mes-ano-passado',
      label: 'Este mês × mesmo mês do ano passado',
      current: monthSoFar,
      base: shiftPeriodByYears(monthSoFar, -1),
    },
    {
      id: 'semana-passada',
      label: 'Esta semana × semana passada',
      current: weekSoFar,
      base: shiftPeriodByDays(weekSoFar, -7),
    },
    {
      id: 'ontem',
      label: 'Hoje × ontem',
      current: getDayPeriod(today),
      base: getDayPeriod(addDays(today, -1)),
    },
  ]
}
