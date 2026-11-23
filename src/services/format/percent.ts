const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
})

export function formatPercent(ratio: number): string {
  return percentFormatter.format(ratio)
}
