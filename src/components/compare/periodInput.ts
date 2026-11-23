import { isValidPeriod } from '../../services/calculations/periods'
import { isValidISODate } from '../../services/format/date'
import type { Period } from '../../types/period'

export interface PeriodInput {
  start: string
  end: string
}

export function toPeriod(input: PeriodInput): Period | null {
  if (!isValidISODate(input.start) || !isValidISODate(input.end)) return null
  const period = { start: input.start, end: input.end }
  return isValidPeriod(period) ? period : null
}
