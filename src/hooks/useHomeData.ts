import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_GOAL } from '../config/defaults'
import { buildHomeSummary } from '../services/calculations/homeSummary'
import type { CostContext } from '../services/calculations/profit'
import { todayISO } from '../services/format/date'
import type { Goal } from '../types/goal'
import type { Order } from '../types/order'
import { useDataMode } from './useDataMode'

interface RawHomeData {
  orders: Order[]
  context: CostContext
  goal: Goal
}

export function useHomeData() {
  const { repos, mode } = useDataMode()
  const [raw, setRaw] = useState<RawHomeData | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [orders, context, goal] = await Promise.all([
        repos.getOrders(),
        repos.getCostContext(),
        repos.getGoal(),
      ])
      if (!cancelled) setRaw({ orders, context, goal })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [repos, mode])

  const today = todayISO()
  const summary = useMemo(
    () => (raw ? buildHomeSummary(raw.orders, raw.context, raw.goal, today) : null),
    [raw, today],
  )

  async function saveGoal(goal: Goal) {
    await repos.saveGoal(goal)
    setRaw((current) => (current ? { ...current, goal } : current))
  }

  return {
    today,
    summary,
    goal: raw?.goal ?? DEFAULT_GOAL,
    hasOrders: raw ? raw.orders.length > 0 : null,
    saveGoal,
  }
}
