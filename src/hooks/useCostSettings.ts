import { useCallback, useEffect, useRef, useState } from 'react'
import type { Repositories } from '../db/repositories'
import {
  findUnregisteredProducts,
  type UnregisteredProduct,
} from '../services/calculations/catalog'
import type { ExtraCost, FeeSettings } from '../types/cost'
import type { Product } from '../types/product'
import { useDataMode } from './useDataMode'

export interface CostSettingsData {
  products: Product[]
  extraCosts: ExtraCost[]
  feeSettings: FeeSettings[]
  unregistered: UnregisteredProduct[]
}

async function loadCostSettings(repos: Repositories): Promise<CostSettingsData> {
  const [products, extraCosts, feeSettings, orders] = await Promise.all([
    repos.getProducts(),
    repos.getExtraCosts(),
    repos.getFeeSettings(),
    repos.getOrders(),
  ])

  return {
    products: [...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    extraCosts: [...extraCosts].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
    feeSettings: [...feeSettings].sort((a, b) =>
      b.effectiveFrom.localeCompare(a.effectiveFrom),
    ),
    unregistered: findUnregisteredProducts(orders, products),
  }
}

export function useCostSettings() {
  const { repos, mode } = useDataMode()
  const [data, setData] = useState<CostSettingsData | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const noticeTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    loadCostSettings(repos).then((loaded) => {
      if (!cancelled) setData(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [repos, mode])

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  const run = useCallback(
    async (action: () => Promise<void>) => {
      await action()
      setData(await loadCostSettings(repos))
      setNotice('Alterações salvas.')
      window.clearTimeout(noticeTimer.current)
      noticeTimer.current = window.setTimeout(() => setNotice(null), 3000)
    },
    [repos],
  )

  return {
    data,
    notice,
    saveProduct: (product: Product) => run(() => repos.saveProduct(product)),
    saveExtraCost: (cost: ExtraCost) => run(() => repos.saveExtraCost(cost)),
    deleteExtraCost: (id: string) => run(() => repos.deleteExtraCost(id)),
    saveFee: (fees: FeeSettings) => run(() => repos.saveFeeSettings(fees)),
    deleteFee: (effectiveFrom: string) =>
      run(() => repos.deleteFeeSettings(effectiveFrom)),
  }
}
