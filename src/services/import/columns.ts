export type ImportField =
  | 'orderId'
  | 'rowType'
  | 'sku'
  | 'productName'
  | 'createdDate'
  | 'itemTotal'
  | 'netAmount'
  | 'quantity'

export type ColumnMapping = Partial<Record<ImportField, number>>

export interface FieldInfo {
  field: ImportField
  label: string
  help: string
  required: boolean
  aliases: string[]
}

export const importFields: FieldInfo[] = [
  {
    field: 'orderId',
    label: 'Número do pedido',
    help: 'Identifica cada pedido. Evita duplicar vendas se você importar o mesmo arquivo de novo.',
    required: true,
    aliases: ['id do pedido', 'numero do pedido', 'order id'],
  },
  {
    field: 'productName',
    label: 'Nome do produto',
    help: 'Nome que aparece nas telas.',
    required: true,
    aliases: ['nome do produto'],
  },
  {
    field: 'createdDate',
    label: 'Data do pedido',
    help: 'Dia em que o pedido foi criado.',
    required: true,
    aliases: ['data de criacao do pedido', 'data do pedido'],
  },
  {
    field: 'itemTotal',
    label: 'Preço de venda do produto',
    help: 'Quanto o produto foi vendido, já com os descontos do vendedor.',
    required: true,
    aliases: ['preco do produto'],
  },
  {
    field: 'netAmount',
    label: 'Valor que caiu na carteira',
    help: 'Valor líquido, já sem comissão, taxas e frete. Com ele o lucro usa números reais.',
    required: false,
    aliases: ['quantia total lancada (r$)', 'quantia total lancada'],
  },
  {
    field: 'sku',
    label: 'Código do produto (SKU)',
    help: 'Usado para ligar a venda ao custo do produto. Se faltar, usamos o nome.',
    required: false,
    aliases: ['sku'],
  },
  {
    field: 'rowType',
    label: 'Tipo da linha (pedido ou produto)',
    help: 'Alguns relatórios têm uma linha com o total do pedido e outra para cada produto.',
    required: false,
    aliases: ['ver'],
  },
  {
    field: 'quantity',
    label: 'Quantidade',
    help: 'Se o relatório não tiver, contamos 1 unidade por produto.',
    required: false,
    aliases: ['quantidade'],
  },
]

export function normalizeHeader(text: unknown): string {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function suggestMapping(headers: unknown[]): ColumnMapping {
  const normalized = headers.map(normalizeHeader)
  const mapping: ColumnMapping = {}

  for (const info of importFields) {
    const index = normalized.findIndex((header) => info.aliases.includes(header))
    if (index !== -1) mapping[info.field] = index
  }
  return mapping
}

export function missingRequiredFields(mapping: ColumnMapping): ImportField[] {
  return importFields
    .filter((info) => info.required && mapping[info.field] === undefined)
    .map((info) => info.field)
}
