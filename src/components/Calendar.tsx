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

export function Calendar({ year, month, turnos, loading, onPrev, onNext, onToggle }: Props) {
  const firstDayOfWeek = (new Date(year, month - 1, 1).getDay() + 6) % 7 // 0=Lun
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const today = new Date()
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
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onPrev}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 transition-all"
          >
            ‹
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-800">
              {MESES[month - 1]} {year}
            </h1>
            {loading && (
              <span className="text-sm text-gray-400 animate-pulse">actualizando…</span>
            )}
          </div>
          <button
            onClick={onNext}
            className="p-2 rounded-lg hover:bg-white hover:shadow-sm text-gray-500 transition-all"
          >
            ›
          </button>
        </div>

        {/* Leyenda personas */}
        <div className="flex gap-3 mb-4 flex-wrap">
          {[
            { label: 'Mamá',   color: 'bg-rose-400',    initial: 'Má' },
            { label: 'Marina', color: 'bg-blue-400',    initial: 'Mr' },
            { label: 'Isa',    color: 'bg-emerald-400', initial: 'Is' },
            { label: 'Carlos', color: 'bg-amber-400',   initial: 'Ca' },
          ].map(p => (
            <div key={p.label} className="flex items-center gap-1.5">
              <span className={`text-xs px-1.5 py-0.5 rounded-full text-white font-medium ${p.color}`}>
                {p.initial}
              </span>
              <span className="text-sm text-gray-600">{p.label}</span>
            </div>
          ))}
        </div>

        {/* Scroll horizontal — cabecera + grid van juntos */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[700px]">

            {/* Cabecera días semana */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DIAS_SEMANA.map(d => (
                <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid calendario */}
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
    </div>
  )
}
