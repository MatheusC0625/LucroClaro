import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_MEI_SETTINGS } from '../config/defaults'
import { buildMeiSummary } from '../services/calculations/mei'
import { todayISO } from '../services/format/date'
import type { MeiSettings } from '../types/mei'
import type { Order } from '../types/order'
import { useDataMode } from './useDataMode'

interface RawMeiData {
  orders: Order[]
  settings: MeiSettings
}

export function useMeiData() {
  const { repos, mode } = useDataMode()
  const [raw, setRaw] = useState<RawMeiData | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [orders, settings] = await Promise.all([repos.getOrders(), repos.getMeiSettings()])
      if (!cancelled) setRaw({ orders, settings })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [repos, mode])

  const today = todayISO()
  const summary = useMemo(() => (raw ? buildMeiSummary(raw.orders, raw.settings, today) : null), [raw, today])

  async function saveSettings(settings: MeiSettings) {
    await repos.saveMeiSettings(settings)
    setRaw((current) => (current ? { ...current, settings } : current))
  }

  return { today, summary, settings: raw?.settings ?? DEFAULT_MEI_SETTINGS, saveSettings }
}
