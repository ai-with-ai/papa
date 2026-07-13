import { useState } from 'react'
import type { Nota } from '../types'

const KEY = 'papa-notas-seen'

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function useSeenNotas(notas: Nota[]) {
  const [seenIds, setSeenIds] = useState<Set<string>>(loadSeen)

  const hasUnread = notas.some(n => !n.id.startsWith('temp-') && !seenIds.has(n.id))

  const markAllSeen = () => {
    setSeenIds(prev => {
      const next = new Set([...prev, ...notas.map(n => n.id)])
      localStorage.setItem(KEY, JSON.stringify([...next]))
      return next
    })
  }

  return { hasUnread, markAllSeen }
}
