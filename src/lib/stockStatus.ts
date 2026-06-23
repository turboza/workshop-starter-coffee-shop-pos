import { StockStatus } from '@/src/types'

export function getStockStatus(count: number, par: number): StockStatus {
  if (count < par) return 'below'
  if (count < par * 1.2) return 'approaching'
  return 'ok'
}
