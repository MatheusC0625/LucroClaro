import type { Cents } from '../../types/money'
import type { MeiSettings } from '../../types/mei'
import type { Order } from '../../types/order'
import type { ISODate } from '../../types/period'
import { addDays, daysBetween, lastDayOfMonth } from '../format/date'

export type MeiLevel = 'ok' | 'warning' | 'exceeded' | 'far-exceeded'

export const MEI_ALERT_RATIO = 0.8
export const MEI_TOLERANCE_RATIO = 1.2

export interface MeiProjection {
  projectedYearTotal: Cents
  limitReachedOn: ISODate | null
}

export interface DasReminder {
  dueDate: ISODate
  daysUntil: number
}

export interface MeiSummary {
  yearRevenue: Cents
  limit: Cents
  ratio: number
  remaining: Cents
  exceededBy: Cents
  level: MeiLevel
  projection: MeiProjection | null
  das: DasReminder
}

export function getEffectiveLimit(settings: MeiSettings, today: ISODate): Cents {
  const opening = settings.openingDate
  if (opening && opening.slice(0, 4) === today.slice(0, 4)) {
    const month = Number(opening.slice(5, 7))
    return Math.round((settings.annualLimit / 12) * (13 - month))
  }
  return settings.annualLimit
}

export function getMeiLevel(ratio: number): MeiLevel {
  if (ratio > MEI_TOLERANCE_RATIO) return 'far-exceeded'
  if (ratio > 1) return 'exceeded'
  if (ratio >= MEI_ALERT_RATIO) return 'warning'
  return 'ok'
}

export function calculateYearRevenue(orders: Order[], today: ISODate): Cents {
  const year = today.slice(0, 4)
  return orders
    .filter((order) => order.status === 'completed' && order.createdDate.slice(0, 4) === year && order.createdDate <= today)
    .reduce((sum, order) => sum + order.items.reduce((s, item) => s + item.total, 0), 0)
}

export function projectYear(
  revenue: Cents,
  limit: Cents,
  yearStart: ISODate,
  today: ISODate,
): MeiProjection | null {
  const yearEnd = `${today.slice(0, 4)}-12-31`
  const daysElapsed = daysBetween(yearStart, today) + 1
  if (daysElapsed < 1 || revenue <= 0) return null

  const dailyRate = revenue / daysElapsed
  const totalDays = daysBetween(yearStart, yearEnd) + 1
  const projectedYearTotal = Math.round(dailyRate * totalDays)

  let limitReachedOn: ISODate | null = null
  if (revenue < limit) {
    const date = addDays(yearStart, Math.ceil(limit / dailyRate) - 1)
    if (date <= yearEnd) limitReachedOn = date
  }
  return { projectedYearTotal, limitReachedOn }
}

export function getNextDasDueDate(today: ISODate, dueDay: number): ISODate {
  const dueIn = (anyDateInMonth: ISODate): ISODate => {
    const lastDay = Number(lastDayOfMonth(anyDateInMonth).slice(8, 10))
    return `${anyDateInMonth.slice(0, 7)}-${String(Math.min(dueDay, lastDay)).padStart(2, '0')}`
  }

  const thisMonth = dueIn(today)
  if (thisMonth >= today) return thisMonth
  return dueIn(addDays(lastDayOfMonth(today), 1))
}

export function buildMeiSummary(orders: Order[], settings: MeiSettings, today: ISODate): MeiSummary {
  const yearRevenue = calculateYearRevenue(orders, today)
  const limit = getEffectiveLimit(settings, today)
  const ratio = limit > 0 ? yearRevenue / limit : 0

  const jan1 = `${today.slice(0, 4)}-01-01`
  const openedThisYear = settings.openingDate && settings.openingDate.slice(0, 4) === today.slice(0, 4)
  const yearStart = openedThisYear && settings.openingDate ? settings.openingDate : jan1

  const dueDate = getNextDasDueDate(today, settings.dasDueDay)

  return {
    yearRevenue,
    limit,
    ratio,
    remaining: Math.max(0, limit - yearRevenue),
    exceededBy: Math.max(0, yearRevenue - limit),
    level: getMeiLevel(ratio),
    projection: projectYear(yearRevenue, limit, yearStart, today),
    das: { dueDate, daysUntil: daysBetween(today, dueDate) },
  }
}
