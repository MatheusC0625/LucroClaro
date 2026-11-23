import * as XLSX from 'xlsx'
import { suggestMapping } from './columns'

export interface ParsedSheet {
  sheetName: string
  headers: string[]
  rows: unknown[][]
}

const HEADER_SEARCH_LIMIT = 20
const MIN_RECOGNIZED_COLUMNS = 3
const PREFERRED_SHEET = /renda|income|pedido|order/i

export function detectHeaderRow(rows: unknown[][]): number {
  const limit = Math.min(rows.length, HEADER_SEARCH_LIMIT)
  for (let index = 0; index < limit; index++) {
    if (Object.keys(suggestMapping(rows[index])).length >= MIN_RECOGNIZED_COLUMNS) return index
  }
  return 0
}

function sheetToRows(sheet: XLSX.WorkSheet): unknown[][] {
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: '' })
}

export function parseWorkbookBuffer(buffer: ArrayBuffer): ParsedSheet {
  let workbook: XLSX.WorkBook
  try {
    workbook = XLSX.read(buffer, { type: 'array', cellDates: true, codepage: 65001 })
  } catch {
    throw new Error('Não consegui abrir este arquivo. Use um .xlsx ou .csv exportado da Central do Vendedor.')
  }

  const names = workbook.SheetNames
  if (names.length === 0) throw new Error('O arquivo não tem nenhuma planilha dentro.')

  const chosen =
    names.find((name) => PREFERRED_SHEET.test(name)) ??
    [...names].sort(
      (a, b) =>
        (workbook.Sheets[b]['!ref'] ? XLSX.utils.decode_range(workbook.Sheets[b]['!ref'] as string).e.r : 0) -
        (workbook.Sheets[a]['!ref'] ? XLSX.utils.decode_range(workbook.Sheets[a]['!ref'] as string).e.r : 0),
    )[0]

  const allRows = sheetToRows(workbook.Sheets[chosen])
  if (allRows.length === 0) throw new Error('A planilha está vazia.')

  const headerIndex = detectHeaderRow(allRows)
  return {
    sheetName: chosen,
    headers: allRows[headerIndex].map((cell) => String(cell ?? '').trim()),
    rows: allRows.slice(headerIndex + 1).filter((row) => row.some((cell) => String(cell ?? '').trim() !== '')),
  }
}

export async function readSpreadsheetFile(file: File): Promise<ParsedSheet> {
  return parseWorkbookBuffer(await file.arrayBuffer())
}
