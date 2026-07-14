import { useRef, useEffect, useState } from 'react'
import { DayCell } from './DayCell'
import { NotasPanel } from './NotasPanel'
import { useSeenNotas } from '../hooks/useSeenNotas'
import { DIAS_SEMANA, MESES, type Turno, type Nota, type Bloque, type Persona } from '../types'

interface Props {
  year: number
  month: number
  turnos: Turno[]
  notas: Nota[]
  loading: boolean
  onPrev: () => void
  onNext: () => void
  onToggle: (fecha: string, bloque: Bloque, persona: Persona) => void
  onSaveNota: (fecha: string, bloque: Bloque, texto: string) => void
}

const PERSONAS_LEGEND = [
  { label: 'Mamá',   color: 'bg-rose-400',    initial: 'MAM' },
  { label: 'Marina', color: 'bg-blue-400',    initial: 'MAR' },
  { label: 'Isa',    color: 'bg-emerald-400', initial: 'ISA' },
  { label: 'Carlos', color: 'bg-amber-400',   initial: 'CAR' },
]

export function Calendar({ year, month, turnos, notas, loading, onPrev, onNext, onToggle, onSaveNota }: Props) {
  const headerRef  = useRef<HTMLDivElement>(null)
  const daysRef    = useRef<HTMLDivElement>(null)
  const bodyRef    = useRef<HTMLDivElement>(null)
  const [headerH, setHeaderH] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const { hasUnread, markAllSeen } = useSeenNotas(notas)

  const openPanel = () => {
    setPanelOpen(true)
    markAllSeen()
  }

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

  const notasForDay = (day: number) =>
    notas.filter(n => n.fecha === toFecha(day))

  return (
    <>
    <div className="min-h-screen bg-gray-50">

      {/* ── Header principal (sticky) ── */}
      <div
        ref={headerRef}
        className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm"
      >
        <div className="px-4 pt-3 pb-2">

          {/* Navegación de mes */}
          <div className="grid grid-cols-3 items-center mb-2">
            <button
              onClick={onPrev}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-xl leading-none transition-colors justify-self-start"
            >
              ‹
            </button>
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-semibold text-gray-800">
                {MESES[month - 1]} {year}
              </h1>
              {loading && (
                <span className="text-xs text-gray-400 animate-pulse">actualizando…</span>
              )}
            </div>
            <div className="flex items-center justify-end gap-1">
              {/* Icono de notas global */}
              <button
                onClick={openPanel}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Ver todas las notas"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-500">
                  <rect x="3" y="1" width="14" height="18" rx="2" />
                  <rect x="5.5" y="5" width="9" height="1.5" rx="0.75" fill="white" />
                  <rect x="5.5" y="9" width="9" height="1.5" rx="0.75" fill="white" />
                  <rect x="5.5" y="13" width="5" height="1.5" rx="0.75" fill="white" />
                </svg>
                {hasUnread && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              <button
                onClick={onNext}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-xl leading-none transition-colors"
              >
                ›
              </button>
            </div>
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

          {/* Leyenda bloques horarios */}
          <div className="flex gap-4 justify-center mt-1.5">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>🌅</span>
              <span className="hidden sm:inline">Mañana</span>
              <span className="font-medium text-gray-500">9h–15h</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>☀️</span>
              <span className="hidden sm:inline">Tarde</span>
              <span className="font-medium text-gray-500">15h–21h</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>🌙</span>
              <span className="hidden sm:inline">Noche</span>
              <span className="font-medium text-gray-500">21h–+</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Fila de días de la semana (sticky, se mueve con scroll horizontal) ── */}
      <div
        ref={daysRef}
        className="sticky z-20 bg-gray-50 border-b border-gray-100 overflow-x-hidden"
        style={{ top: headerH }}
      >
        <div className="min-w-[896px] px-4">
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
        <div className="min-w-[896px]">
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
                  notas={notasForDay(day)}
                  onToggle={onToggle}
                  onSaveNota={onSaveNota}
                />
              ),
            )}
          </div>
        </div>
      </div>

    </div>

    {panelOpen && (
      <NotasPanel notas={notas} onClose={() => setPanelOpen(false)} />
    )}
    </>
  )
}
