import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Nota, Bloque } from '../types'

export function useNotas(year: number, month: number) {
  const [notas, setNotas] = useState<Nota[]>([])

  const fetchNotas = useCallback(async () => {
    const mm = String(month).padStart(2, '0')
    const lastDay = new Date(year, month, 0).getDate()
    const { data } = await supabase
      .from('notas')
      .select('*')
      .gte('fecha', `${year}-${mm}-01`)
      .lte('fecha', `${year}-${mm}-${lastDay}`)
    setNotas(data ?? [])
  }, [year, month])

  useEffect(() => { fetchNotas() }, [fetchNotas])

  const saveNota = async (fecha: string, bloque: Bloque, texto: string) => {
    const trimmed = texto.trim()
    const existing = notas.find(n => n.fecha === fecha && n.bloque === bloque)

    if (!trimmed) {
      // Sin texto → borrar si existía
      if (existing) {
        setNotas(prev => prev.filter(n => n.id !== existing.id))
        await supabase.from('notas').delete().eq('id', existing.id)
      }
      return
    }

    if (existing) {
      // Actualizar
      setNotas(prev => prev.map(n => n.id === existing.id ? { ...n, nota: trimmed } : n))
      await supabase.from('notas').update({ nota: trimmed }).eq('id', existing.id)
    } else {
      // Insertar
      const { data } = await supabase
        .from('notas')
        .insert({ fecha, bloque, nota: trimmed })
        .select()
        .single()
      if (data) setNotas(prev => [...prev, data])
    }
  }

  return { notas, saveNota }
}
