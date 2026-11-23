import type { Order, OrderItem } from '../../types/order'
import type { ISODate } from '../../types/period'
import { parseAmountCell, parseDateCell, parseQuantityCell, parseTextCell } from './cells'
import type { ColumnMapping, ImportField } from './columns'

export interface NormalizeResult {
  orders: Order[]
  warnings: string[]
  skippedRows: number
  quantityAssumed: boolean
}

interface OrderDraft {
  date: ISODate
  items: OrderItem[]
  reportedNet: number | null
}

export function normalizeOrders(rows: unknown[][], mapping: ColumnMapping): NormalizeResult {
  const drafts = new Map<string, OrderDraft>()
  const warnings: string[] = []
  let skippedRows = 0

  const read = (row: unknown[], field: ImportField): unknown => {
    const index = mapping[field]
    return index === undefined ? undefined : row[index]
  }

  const hasRowType = mapping.rowType !== undefined
  const hasNet = mapping.netAmount !== undefined

  for (const row of rows) {
    const orderId = parseTextCell(read(row, 'orderId'))
    if (!orderId) continue

    if (hasRowType) {
      const type = parseTextCell(read(row, 'rowType'))?.toLowerCase()
      if (type === 'order') {
        const draft = drafts.get(orderId) ?? { date: '', items: [], reportedNet: null }
        draft.reportedNet = hasNet ? parseAmountCell(read(row, 'netAmount')) : null
        drafts.set(orderId, draft)
        continue
      }
      if (type !== 'sku') continue
    }

    const date = parseDateCell(read(row, 'createdDate'))
    const total = parseAmountCell(read(row, 'itemTotal'))
    const name = parseTextCell(read(row, 'productName'))
    if (!date || total === null || !name) {
      skippedRows += 1
      continue
    }

    const payout = hasNet ? parseAmountCell(read(row, 'netAmount')) : null
    const item: OrderItem = {
      sku: parseTextCell(read(row, 'sku')) ?? name,
      name,
      quantity: parseQuantityCell(read(row, 'quantity')) ?? 1,
      total,
    }
    if (payout !== null) item.payout = payout

    const draft = drafts.get(orderId) ?? { date, items: [], reportedNet: null }
    draft.date = draft.date || date
    draft.items.push(item)
    drafts.set(orderId, draft)
  }

  const orders: Order[] = []
  for (const [id, draft] of drafts) {
    if (draft.items.length === 0) {
      warnings.push(`O pedido ${id} não tem nenhum produto e foi ignorado.`)
      continue
    }

    const itemsNet = draft.items.reduce((sum, item) => sum + (item.payout ?? 0), 0)
    const allHavePayout = draft.items.every((item) => item.payout !== undefined)
    if (draft.reportedNet !== null && allHavePayout && Math.abs(itemsNet - draft.reportedNet) > 1) {
      warnings.push(`No pedido ${id}, a soma dos produtos não bate com o total do pedido. Confira o arquivo.`)
    }

    orders.push({
      id,
      createdDate: draft.date,
      status: 'completed',
      items: draft.items,
      shippingPaidBySeller: 0,
      source: 'spreadsheet',
    })
  }

  orders.sort((a, b) => a.createdDate.localeCompare(b.createdDate) || a.id.localeCompare(b.id))

  if (skippedRows > 0) {
    warnings.push(`${skippedRows} ${skippedRows === 1 ? 'linha foi ignorada' : 'linhas foram ignoradas'} por data, nome ou valor inválido.`)
  }

  return { orders, warnings, skippedRows, quantityAssumed: mapping.quantity === undefined }
}
