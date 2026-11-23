import { describe, expect, it } from 'vitest'
import type { ProductSummary } from '../calculations/ranking'
import { describeProductOverview } from './productMessages'

const product = (name: string, profit: number) => ({ name, profit }) as ProductSummary

describe('describeProductOverview', () => {
  it('trata período sem vendas', () => {
    expect(describeProductOverview([], [])).toBe('Nenhuma venda neste período.')
  })

  it('comemora quando todos dão lucro', () => {
    expect(describeProductOverview([product('A', 100)], [])).toBe(
      'Todos os produtos deram lucro neste período.',
    )
  })

  it('avisa de um produto com prejuízo', () => {
    const loser = product('Kit', -1500)
    expect(describeProductOverview([product('A', 100), loser], [loser])).toBe(
      'O produto "Kit" está dando prejuízo: perdeu R$ 15,00 no período. Vale rever o preço ou o custo.',
    )
  })

  it('soma o prejuízo de vários produtos', () => {
    const losers = [product('X', -1000), product('Y', -500)]
    expect(describeProductOverview(losers, losers)).toBe(
      '2 produtos estão dando prejuízo: "X", "Y". Juntos eles perderam R$ 15,00 no período. Vale rever o preço ou o custo.',
    )
  })
})
