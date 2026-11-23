import { useEffect, useState } from 'react'
import type { CostContext } from '../services/calculations/profit'
import type { Order } from '../types/order'
import { useDataMode } from './useDataMode'

interface OrdersAndCosts {
  orders: Order[]
  context: CostContext
}

export function useOrdersAndCosts(): OrdersAndCosts | null {
  const { repos, mode } = useDataMode()
  const [data, setData] = useState<OrdersAndCosts | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [orders, context] = await Promise.all([repos.getOrders(), repos.getCostContext()])
      if (!cancelled) setData({ orders, context })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [repos, mode])

  return data
}
