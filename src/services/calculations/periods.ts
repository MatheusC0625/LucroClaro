import type { Order } from '../../types/order'
import type { ISODate, Period } from '../../types/period'
import {
  addDays,
  daysBetween,
  getWeekday,
  lastDayOfMonth,
  shiftYears,
} from '../format/date'

export function isDateInPeriod(date: ISODate, period: Period): boolean {
  return date >= period.start && date <= period.end
}

export function filterOrdersByPeriod(orders: Order[], period: Period): Order[] {
  return orders.filter((order) => isDateInPeriod(order.createdDate, period))
}

export function getDayPeriod(date: ISODate): Period {
  return { start: date, end: date }
}

/** Semana de segunda a domingo que contém a data. */
export function getWeekPeriod(date: ISODate): Period {
  const daysSinceMonday = (getWeekday(date) + 6) % 7
  const start = addDays(date, -daysSinceMonday)
  return { start, end: addDays(start, 6) }
}

export function getMonthPeriod(date: ISODate): Period {
  return { start: `${date.slice(0, 7)}-01`, end: lastDayOfMonth(date) }
}

export function getYearPeriod(date: ISODate): Period {
  const year = date.slice(0, 4)
  return { start: `${year}-01-01`, end: `${year}-12-31` }
}

/** O mesmo período, só que alguns anos antes (ou depois, com número positivo). */
export function shiftPeriodByYears(period: Period, years: number): Period {
  return {
    start: shiftYears(period.start, years),
    end: shiftYears(period.end, years),
  }
}

/** Quantidade de dias do período, contando o primeiro e o último. */
export function getPeriodLengthInDays(period: Period): number {
  return daysBetween(period.start, period.end) + 1
}

/** O período de mesmo tamanho que termina um dia antes de este começar. */
export function getPreviousPeriod(period: Period): Period {
  const length = getPeriodLengthInDays(period)
  const end = addDays(period.start, -1)
  return { start: addDays(end, -(length - 1)), end }
}

export function getPreviousMonthToDate(date: ISODate): Period {
  const previousEnd = addDays(`${date.slice(0, 7)}-01`, -1)
  const previousMonth = previousEnd.slice(0, 7)
  const day = Math.min(Number(date.slice(8, 10)), Number(previousEnd.slice(8, 10)))
  return {
    start: `${previousMonth}-01`,
    end: `${previousMonth}-${String(day).padStart(2, '0')}`,
  }
}

/** Um período é válido se o início não for depois do fim. */
export function isValidPeriod(period: Period): boolean {
  return period.start <= period.end
}
