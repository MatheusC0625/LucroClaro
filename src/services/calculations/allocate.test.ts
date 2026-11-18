import { describe, expect, it } from 'vitest'
import { allocateProportionally } from './allocate'

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

describe('allocateProportionally', () => {
  it('divide proporcionalmente quando a conta fecha certinho', () => {
    expect(allocateProportionally(100, [1, 3])).toEqual([25, 75])
  })

  it('não perde centavos quando a divisão não fecha', () => {
    const parts = allocateProportionally(110, [1000, 3000])
    expect(parts).toEqual([28, 82])
    expect(sum(parts)).toBe(110)
  })

  it('divide 1 centavo entre três itens iguais sem inventar dinheiro', () => {
    const parts = allocateProportionally(100, [1, 1, 1])
    expect(sum(parts)).toBe(100)
    expect(parts).toEqual([34, 33, 33])
  })

  it('divide igualmente quando todos os pesos são zero', () => {
    expect(allocateProportionally(10, [0, 0])).toEqual([5, 5])
  })

  it('funciona com valor negativo e lista vazia', () => {
    expect(sum(allocateProportionally(-110, [1000, 3000]))).toBe(-110)
    expect(allocateProportionally(50, [])).toEqual([])
  })

  it('devolve zeros quando o total é zero', () => {
    expect(allocateProportionally(0, [5, 7])).toEqual([0, 0])
  })
})
