const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(cents: number): string {
  return brlFormatter.format(cents / 100).replace(/ /g, ' ')
}

export function reaisToCents(reais: number): number {
  const cents = Number((Math.abs(reais) * 100).toPrecision(15))
  return Math.sign(reais) * Math.round(cents)
}

export function parseCurrencyInput(text: string): number | null {
  const cleaned = text.replace(/R\$/g, '').replace(/\s/g, '')
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(cleaned)) {
    return null
  }
  const [integerPart, decimalPart = ''] = cleaned.replace(/\./g, '').split(',')
  return Number(integerPart) * 100 + Number(decimalPart.padEnd(2, '0'))
}
