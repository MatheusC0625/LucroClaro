import type { ISODate } from '../../types/period'
import { isValidISODate, parseBrazilianDate } from '../format/date'
import { reaisToCents } from '../format/currency'

export function parseTextCell(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return text === '' || text === '-' ? null : text
}

function dateFromParts(year: number, month: number, day: number): ISODate | null {
  const text = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return isValidISODate(text) ? text : null
}

export function parseDateCell(value: unknown): ISODate | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return dateFromParts(value.getFullYear(), value.getMonth() + 1, value.getDate())
  }
  if (typeof value === 'number') {
    const epoch = Date.UTC(1899, 11, 30) + Math.round(value) * 86_400_000
    const date = new Date(epoch)
    return dateFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
  }

  const text = parseTextCell(value)
  if (!text) return null
  const datePart = text.slice(0, 10)
  if (isValidISODate(datePart)) return datePart
  return parseBrazilianDate(datePart)
}

export function parseAmountCell(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? reaisToCents(value) : null

  const text = parseTextCell(value)
  if (!text) return null

  const cleaned = text.replace(/R\$/g, '').replace(/\s/g, '')
  if (!/^-?[\d.,]+$/.test(cleaned)) return null

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')
  let normalized: string

  if (lastComma !== -1 && lastDot !== -1) {
    normalized =
      lastComma > lastDot
        ? cleaned.replace(/\./g, '').replace(',', '.')
        : cleaned.replace(/,/g, '')
  } else if (lastComma !== -1) {
    normalized = cleaned.replace(',', '.')
  } else if (lastDot !== -1 && /\.\d{3}$/.test(cleaned) && cleaned.indexOf('.') === lastDot) {
    normalized = cleaned.replace('.', '')
  } else {
    normalized = cleaned
  }

  const number = Number(normalized)
  return Number.isFinite(number) ? reaisToCents(number) : null
}

export function parseQuantityCell(value: unknown): number | null {
  const text = parseTextCell(value)
  if (!text || !/^\d+$/.test(text)) return null
  const quantity = Number(text)
  return quantity >= 1 ? quantity : null
}
