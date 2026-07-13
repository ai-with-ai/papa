import { useRef, useEffect, useState } from 'react'
import { DayCell } from './DayCell'
import { DIAS_SEMANA, MESES, type Turno, type Bloque, type Persona } from '../types'

interface Props {
  year: number
  month: number
  turnos: Turno[]
  loading: boolean
  onPrev: () => void
  onNext: () => void
  onToggle: (fecha: string, bloque: Bloque, persona: Persona) => void
}

const PERSONAS_LEGEND = [
  { label: 'Mamá',   color: 'bg-rose-400',    initial: 'Má' },
  { label: 'Marina', color: 'bg-blue-400',    initial: 'Mr' },
  { label: 'Isa',    color: 'bg-emerald-400', initial: 'Is' },
  { label: 'Carlos', color: 'bg-amber-400',   initial: 'Ca' },
]

export function Calendar({ year, month, turnos, loading, onPrev, onNext, onToggle }: Props) {
  const headerRef  = useRef<HTMLDivElement>(null)
  const daysRef    = useRef<HTMLDivElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)
  const [headerH, setHeaderH] = useState(0)

  // Mide la altura del header principal para posicionar la fila de días
  useEffect(() => {
    if (headerRef.current) setHeaderH(headerRef.current.offsetHeight)
  }, [])

  // Sincroniza el scroll horizontal de la fila de días con el grid
  const syncScroll = () => {
    if (daysRef.current && bodyRef.current) {
      daysRef.current.scrollLeft = bodyRef.current.scrollLeft
    }
  }

  // Cálculos del calendario
  const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7
  const daysInMonth    = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const today   = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() + 1 === month &&
    today.getDate() === day

  const toFecha = (day: number) =>
    `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const turnosForDay = (day: number) =>
    turnos.filter(t => t.fecha === toFecha(day))

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header principal (sticky) ── */}
      <div
        ref={headerRef}
        className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="px-4 pt-3 pb-2">

          {/* Navegación de mes */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onPrev}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-xl leading-none transition-colors"
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-800">
                {MESES[month - 1]} {year}
              </h1>
              {loading && (
                <span className="text-xs text-gray-400 animate-pulse">actualizando…</span>
              )}
            </div>
            <button
              onClick={onNext}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-xl leading-none transition-colors"
            >
              ›
            </button>
          </div>

          {/* Leyenda personas */}
          <div className="flex gap-4 justify-center">
            {PERSONAS_LEGEND.map(p => (
              <div key={p.label} className="flex items-center gap-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-semibold ${p.color}`}>
                  {p.initial}
                </span>
                <span className="text-sm text-gray-600">{p.label}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Fila de días de la semana (sticky, se mueve con scroll horizontal) ── */}
      <div
        ref={daysRef}
        className="sticky z-20 bg-gray-50 border-b border-gray-100 overflow-x-hidden"
        style={{ top: headerH }}
      >
        <div className="min-w-[700px] px-4">
          <div className="grid grid-cols-7 gap-1 py-1.5">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400">
                {d}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid del calendario (scroll horizontal) ── */}
      <div
        ref={bodyRef}
        className="overflow-x-auto px-4 py-2 pb-10"
        onScroll={syncScroll}
      >
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) =>
              day == null ? (
                <div key={`empty-${i}`} />
              ) : (
                <DayCell
                  key={day}
                  day={day}
                  fecha={toFecha(day)}
                  isToday={isToday(day)}
                  turnos={turnosForDay(day)}
                  onToggle={onToggle}
                />
              ),
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
