import type { ISODate } from '../../types/period'

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function isValidISODate(value: string): value is ISODate {
  const match = ISO_PATTERN.exec(value)
  if (!match) return false
  return isRealDate(Number(match[1]), Number(match[2]), Number(match[3]))
}

export function formatDate(date: ISODate): string {
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

export function parseBrazilianDate(text: string): ISODate | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim())
  if (!match) return null
  const [, day, month, year] = match
  return isRealDate(Number(year), Number(month), Number(day))
    ? `${year}-${month}-${day}`
    : null
}

export function todayISO(): ISODate {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function toUTC(date: ISODate): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function fromUTC(date: Date): ISODate {
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${date.getUTCFullYear()}-${month}-${day}`
}

export function addDays(date: ISODate, days: number): ISODate {
  const result = toUTC(date)
  result.setUTCDate(result.getUTCDate() + days)
  return fromUTC(result)
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUTC(to).getTime() - toUTC(from).getTime()) / 86_400_000)
}

export function getWeekday(date: ISODate): number {
  return toUTC(date).getUTCDay()
}

/** Último dia do mês da data informada. */
export function lastDayOfMonth(date: ISODate): ISODate {
  const [year, month] = date.split('-').map(Number)
  return fromUTC(new Date(Date.UTC(year, month, 0)))
}

export function shiftYears(date: ISODate, years: number): ISODate {
  const [year, month, day] = date.split('-').map(Number)
  const targetYear = year + years
  const lastDay = new Date(Date.UTC(targetYear, month, 0)).getUTCDate()
  const monthText = String(month).padStart(2, '0')
  const dayText = String(Math.min(day, lastDay)).padStart(2, '0')
  return `${String(targetYear).padStart(4, '0')}-${monthText}-${dayText}`
}
