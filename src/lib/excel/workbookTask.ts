import type { item } from '../../components/interface'
import { generateWorkbook } from './generateWorkbooks'

// Share one task across StrictMode subscriptions and revisits.
// Cache at most one result and never use it for a different product list.
let latest: { key: string; promise: Promise<Blob> } | undefined

export function getWorkbookTask(items: readonly item[]): Promise<Blob> {
  const snapshot = items.map(({ name, price }) => ({ name, price }))
  const key = JSON.stringify(snapshot)
  if (latest?.key === key) return latest.promise
  const promise = generateWorkbook(snapshot)
  latest = { key, promise }
  void promise.catch(() => {
    if (latest?.promise === promise) latest = undefined
  })
  return promise
}
