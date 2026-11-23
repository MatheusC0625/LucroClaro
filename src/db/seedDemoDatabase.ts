import { generateDemoData } from '../demo/demoData'
import type { ISODate } from '../types/period'
import type { LucroClaroDatabase } from './database'
import { GOAL_KEY, MEI_KEY } from './repositories'

export const DEMO_SEEDED_KEY = 'demoSeededOn'

export async function seedDemoDatabase(
  db: LucroClaroDatabase,
  today: ISODate,
): Promise<void> {
  const seeded = await db.settings.get(DEMO_SEEDED_KEY)
  if (seeded?.value === today) return

  const data = generateDemoData(today)

  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()))
    await db.orders.bulkPut(data.orders)
    await db.products.bulkPut(data.products)
    await db.extraCosts.bulkPut(data.extraCosts)
    await db.feeSettings.bulkPut(data.feeSettings)
    await db.settings.bulkPut([
      { key: GOAL_KEY, value: data.goal },
      { key: MEI_KEY, value: data.mei },
      { key: DEMO_SEEDED_KEY, value: today },
    ])
  })
}
