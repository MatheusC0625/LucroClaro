import type { Cents } from '../../types/money'


export function allocateProportionally(
  total: Cents,
  weights: number[],
): Cents[] {
  if (weights.length === 0) return []

  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)
  const effectiveWeights = weightSum > 0 ? weights : weights.map(() => 1)
  const effectiveSum = weightSum > 0 ? weightSum : weights.length

  const sign = total < 0 ? -1 : 1
  const absoluteTotal = Math.abs(total)

  const exactShares = effectiveWeights.map(
    (weight) => (absoluteTotal * weight) / effectiveSum,
  )
  const shares = exactShares.map(Math.floor)
  const leftover = absoluteTotal - shares.reduce((sum, share) => sum + share, 0)

  const byLargestRemainder = exactShares
    .map((exact, index) => ({ index, remainder: exact - Math.floor(exact) }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index)

  for (let i = 0; i < leftover; i++) {
    shares[byLargestRemainder[i].index] += 1
  }

  return shares.map((share) => share * sign)
}
