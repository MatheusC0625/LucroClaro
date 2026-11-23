export function formatCentsAsInput(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const absolute = Math.abs(cents)
  const reais = Math.floor(absolute / 100)
  const centsPart = String(absolute % 100).padStart(2, '0')
  return `${sign}${reais},${centsPart}`
}

export function formatPercentInput(percent: number): string {
  return String(percent).replace('.', ',')
}

export function parsePercentInput(text: string): number | null {
  const cleaned = text.replace(/%/g, '').replace(/\s/g, '')
  if (!/^\d{1,3}(,\d{1,2})?$/.test(cleaned)) return null
  const value = Number(cleaned.replace(',', '.'))
  return value <= 100 ? value : null
}
