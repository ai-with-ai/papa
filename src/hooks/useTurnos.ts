import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Turno, Bloque, Persona } from '../types'

export function useTurnos(year: number, month: number) {
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTurnos = useCallback(async () => {
    setLoading(true)
    setError(null)
    const mm = String(month).padStart(2, '0')
    const lastDay = new Date(year, month, 0).getDate()
    const { data, error: err } = await supabase
      .from('turnos')
      .select('*')
      .gte('fecha', `${year}-${mm}-01`)
      .lte('fecha', `${year}-${mm}-${lastDay}`)
    if (err) {
      setError('Error al cargar los turnos')
      console.error(err)
    } else {
      setTurnos(data ?? [])
    }
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchTurnos() }, [fetchTurnos])

  const toggle = async (fecha: string, bloque: Bloque, persona: Persona) => {
    const existing = turnos.find(
      t => t.fecha === fecha && t.bloque === bloque && t.persona === persona,
    )

    if (existing) {
      setTurnos(prev => prev.filter(t => t.id !== existing.id))
      const { error: err } = await supabase.from('turnos').delete().eq('id', existing.id)
      if (err) {
        setTurnos(prev => [...prev, existing]) // rollback
        setError('No se pudo eliminar el turno')
        console.error(err)
      }
    } else {
      const tempId = `temp-${fecha}-${bloque}-${persona}`
      const tempTurno: Turno = { id: tempId, fecha, bloque, persona }
      setTurnos(prev => [...prev, tempTurno])
      const { data, error: err } = await supabase
        .from('turnos')
        .insert({ fecha, bloque, persona })
        .select()
        .single()
      if (err || !data) {
        setTurnos(prev => prev.filter(t => t.id !== tempId)) // rollback
        setError('No se pudo guardar el turno')
        console.error(err)
      } else {
        setTurnos(prev => prev.map(t => (t.id === tempId ? data : t)))
      }
    }
  }

  return { turnos, loading, error, toggle }
}
