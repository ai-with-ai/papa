import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Turno, Bloque, Persona } from '../types'

export function useTurnos(year: number, month: number) {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTurnos = useCallback(async () => {
    setLoading(true)
    const mm = String(month).padStart(2, '0')
    const lastDay = new Date(year, month, 0).getDate()
    const { data } = await supabase
      .from('turnos')
      .select('*')
      .gte('fecha', `${year}-${mm}-01`)
      .lte('fecha', `${year}-${mm}-${lastDay}`)
    setTurnos(data ?? [])
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchTurnos() }, [fetchTurnos])

  const toggle = async (fecha: string, bloque: Bloque, persona: Persona) => {
    const existing = turnos.find(
      t => t.fecha === fecha && t.bloque === bloque && t.persona === persona,
    )
    if (existing) {
      setTurnos(prev => prev.filter(t => t.id !== existing.id))
      await supabase.from('turnos').delete().eq('id', existing.id)
    } else {
      const tempId = `temp-${fecha}-${bloque}-${persona}`
      setTurnos(prev => [...prev, { id: tempId, fecha, bloque, persona }])
      const { data } = await supabase
        .from('turnos')
        .insert({ fecha, bloque, persona })
        .select()
        .single()
      if (data) {
        setTurnos(prev => prev.map(t => (t.id === tempId ? data : t)))
      }
    }
  }

  return { turnos, loading, toggle }
}
