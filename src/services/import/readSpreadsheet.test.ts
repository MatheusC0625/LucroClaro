import * as XLSX from 'xlsx'
import { describe, expect, it } from 'vitest'
import { detectHeaderRow, parseWorkbookBuffer } from './readSpreadsheet'

const dataRows = [
  ['Order', 'PED-A', '-', '-', '2026-11-02', 20.08, 30.72],
  ['Sku', 'PED-A', '111', 'Babuche Teste', '2026-11-02', 20.08, 30.72],
]
const header = [
  'Ver',
  'ID do pedido',
  'SKU',
  'Nome do produto',
  'Data de criação do pedido',
  'Quantia total lançada (R$)',
  'Preço do produto',
]

function toBuffer(workbook: XLSX.WorkBook): ArrayBuffer {
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer
}

describe('parseWorkbookBuffer', () => {
  it('acha a aba certa e o cabeçalho real, ignorando linhas de título e outras abas', () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['Resumo'], ['dado sem importância']]), 'Summary')
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([['Informações do pedido', '', ''], ['Renda do pedido'], header, ...dataRows, ['', '', '']]),
      'Renda',
    )

    const parsed = parseWorkbookBuffer(toBuffer(workbook))

    expect(parsed.sheetName).toBe('Renda')
    expect(parsed.headers[1]).toBe('ID do pedido')
    expect(parsed.rows).toHaveLength(2)
    expect(parsed.rows[1][3]).toBe('Babuche Teste')
  })

  it('lê um arquivo CSV', () => {
    const csv = [header, ...dataRows].map((row) => row.join(',')).join('\n')
    const parsed = parseWorkbookBuffer(new TextEncoder().encode(csv).buffer as ArrayBuffer)

    expect(parsed.headers).toContain('Preço do produto')
    expect(parsed.rows).toHaveLength(2)
  })

  it('devolve um erro claro para arquivo vazio', () => {
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([]), 'Vazia')
    expect(() => parseWorkbookBuffer(toBuffer(workbook))).toThrow('vazia')
  })
})

describe('detectHeaderRow', () => {
  it('usa a primeira linha quando nada é reconhecido, para o mapeamento manual', () => {
    expect(detectHeaderRow([['A', 'B'], ['1', '2']])).toBe(0)
  })

  it('acha o cabeçalho depois de linhas de título', () => {
    expect(detectHeaderRow([['Título'], [], header])).toBe(2)
  })
})
