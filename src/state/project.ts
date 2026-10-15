import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { item } from '../components/interface'

export type Product = item & { id: string }
export type Draft = { name: string; price: string; editingId: string | null }
export type Project = { items: Product[]; draft: Draft }
export type Action =
  | { type: 'draft'; field: 'name' | 'price'; value: string }
  | { type: 'save'; product: Product }
  | { type: 'edit'; id: string }
  | { type: 'delete'; id: string }
  | { type: 'cancel' }
  | { type: 'reset' }

export const STORAGE_KEY = 'kaikeiqun.project.v1'
export const emptyDraft: Draft = { name: '', price: '', editingId: null }
export const emptyProject: Project = { items: [], draft: emptyDraft }

export function projectReducer(state: Project, action: Action): Project {
  switch (action.type) {
    case 'draft':
      return { ...state, draft: { ...state.draft, [action.field]: action.value } }
    case 'save':
      return {
        items: state.items.some((p) => p.id === action.product.id)
          ? state.items.map((p) => p.id === action.product.id ? action.product : p)
          : [...state.items, action.product],
        draft: emptyDraft,
      }
    case 'edit': {
      const product = state.items.find((p) => p.id === action.id)
      return product
        ? { ...state, draft: { name: product.name, price: String(product.price), editingId: product.id } }
        : state
    }
    case 'delete':
      return {
        items: state.items.filter((p) => p.id !== action.id),
        draft: state.draft.editingId === action.id ? emptyDraft : state.draft,
      }
    case 'cancel':
      return { ...state, draft: emptyDraft }
    case 'reset':
      return emptyProject
  }
}

// Browser storage is input too: validate before restoring it.
export function restoreProject(raw: string | null): Project {
  if (!raw) return emptyProject
  const value: unknown = JSON.parse(raw)
  if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 ||
    !('items' in value) || !Array.isArray(value.items) || !('draft' in value)) {
    throw new Error('保存データの形式が不正です')
  }
  const ids = new Set<string>()
  const items: Product[] = value.items.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || !('id' in entry) || typeof entry.id !== 'string' ||
      !entry.id || ids.has(entry.id) || !('name' in entry) || typeof entry.name !== 'string' ||
      !entry.name.trim() || !('price' in entry) || typeof entry.price !== 'number' ||
      !Number.isSafeInteger(entry.price) || entry.price < 0) {
      throw new Error('保存された商品情報が不正です')
    }
    ids.add(entry.id)
    return { id: entry.id, name: entry.name, price: entry.price }
  })
  const draft = value.draft
  if (!draft || typeof draft !== 'object' || !('name' in draft) || typeof draft.name !== 'string' ||
    !('price' in draft) || typeof draft.price !== 'string' || !('editingId' in draft) ||
    (draft.editingId !== null && (typeof draft.editingId !== 'string' || !ids.has(draft.editingId)))) {
    throw new Error('保存された入力内容が不正です')
  }
  return { items, draft: { name: draft.name, price: draft.price, editingId: draft.editingId } }
}

export const ProjectContext = createContext<{
  project: Project
  dispatch: Dispatch<Action>
  storageWarning: string
} | null>(null)

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) throw new Error('ProjectProviderが必要です')
  return context
}
