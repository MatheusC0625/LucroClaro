import { DEFAULT_MEI_SETTINGS } from '../config/defaults'
import { addDays, daysBetween, getWeekday } from '../services/format/date'
import type { ExtraCost, FeeSettings } from '../types/cost'
import type { Goal } from '../types/goal'
import type { MeiSettings } from '../types/mei'
import type { Order, OrderItem, OrderStatus } from '../types/order'
import type { ISODate } from '../types/period'
import type { Product } from '../types/product'

export const DEMO_START_DATE: ISODate = '2025-01-01'

export interface DemoData {
  orders: Order[]
  products: Product[]
  extraCosts: ExtraCost[]
  feeSettings: FeeSettings[]
  goal: Goal
  mei: MeiSettings
}

interface CatalogItem {
  sku: string
  name: string
  price: number
  cost: number
  weight: number
}

const catalog: CatalogItem[] = [
  {
    sku: 'DEMO-BABUCHE',
    name: 'Babuche Feminina Plataforma com Pingentes',
    price: 3990,
    cost: 1200,
    weight: 4,
  },
  {
    sku: 'DEMO-LIPGLOSS',
    name: 'Kit 3 Lip Gloss Volumador',
    price: 2090,
    cost: 650,
    weight: 5,
  },
  {
    sku: 'DEMO-KITINFANTIL',
    name: 'Kit de Maquiagem Infantil',
    price: 2190,
    cost: 1650,
    weight: 3,
  },
  {
    sku: 'DEMO-CHINELO',
    name: 'Chinelo Slide Nuvem',
    price: 2490,
    cost: 900,
    weight: 3,
  },
]

const monthFactors = [0.8, 0.85, 0.9, 0.95, 1.1, 0.95, 0.9, 0.95, 1, 1.05, 1.3, 1.5]
const weekdayFactors = [1.1, 1, 0.95, 0.95, 1, 1.1, 1.15]

function createRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function drawPoisson(lambda: number, random: () => number): number {
  const limit = Math.exp(-lambda)
  let count = 0
  let product = random()
  while (product > limit) {
    count += 1
    product *= random()
  }
  return count
}

function dailyRate(date: ISODate): number {
  const daysSinceStart = daysBetween(DEMO_START_DATE, date)
  const base = 1.5 + (2.5 * Math.min(daysSinceStart, 800)) / 800
  const month = Number(date.slice(5, 7))
  return base * monthFactors[month - 1] * weekdayFactors[getWeekday(date)]
}

function drawStatus(random: () => number): OrderStatus {
  const value = random()
  if (value < 0.9) return 'completed'
  if (value < 0.96) return 'cancelled'
  return 'returned'
}

function drawItems(random: () => number): OrderItem[] {
  const roll = random()
  const itemCount = roll < 0.8 ? 1 : roll < 0.97 ? 2 : 3
  const available = [...catalog]
  const items: OrderItem[] = []

  for (let i = 0; i < itemCount; i++) {
    const totalWeight = available.reduce((sum, item) => sum + item.weight, 0)
    let target = random() * totalWeight
    let index = 0
    while (index < available.length - 1 && target >= available[index].weight) {
      target -= available[index].weight
      index += 1
    }
    const [chosen] = available.splice(index, 1)

    const quantity = random() < 0.15 ? 2 : 1
    const unitPrice =
      random() < 0.15 ? Math.round(chosen.price * 0.9) : chosen.price
    items.push({
      sku: chosen.sku,
      name: chosen.name,
      quantity,
      total: unitPrice * quantity,
    })
  }

  return items
}

export function generateDemoData(today: ISODate): DemoData {
  const random = createRandom(20261118)
  const orders: Order[] = []

  for (
    let date = DEMO_START_DATE;
    date <= today;
    date = addDays(date, 1)
  ) {
    const ordersToday = drawPoisson(dailyRate(date), random)
    for (let i = 0; i < ordersToday; i++) {
      orders.push({
        id: `DEMO-${String(orders.length + 1).padStart(5, '0')}`,
        createdDate: date,
        status: drawStatus(random),
        items: drawItems(random),
        shippingPaidBySeller: random() < 0.08 ? 600 : 0,
        source: 'demo',
      })
    }
  }

  return {
    orders,
    products: catalog.map(({ sku, name, cost }) => ({
      sku,
      name,
      unitCost: cost,
    })),
    extraCosts: [
      { id: 'demo-sacola', name: 'Sacola', amount: 80, active: true },
      { id: 'demo-etiqueta', name: 'Etiqueta', amount: 30, active: true },
      { id: 'demo-fita', name: 'Fita', amount: 20, active: true },
      { id: 'demo-brinde', name: 'Brinde', amount: 150, active: false },
    ],
    feeSettings: [
      { effectiveFrom: '2025-01-01', commissionPercent: 14, fixedFeePerItem: 400 },
      { effectiveFrom: '2026-10-01', commissionPercent: 14, fixedFeePerItem: 450 },
    ],
    goal: { metric: 'revenue', dailyTarget: 12000, monthlyTarget: 400000 },
    mei: DEFAULT_MEI_SETTINGS,
  }
}
