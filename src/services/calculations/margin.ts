export function calculateMargin(profit: number, revenue: number): number | null {
  if (revenue === 0) return null
  return profit / revenue
}
