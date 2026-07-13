import { useState, useRef, useEffect } from 'react'
import {
  BLOQUES, PERSONAS,
  PERSONA_LABEL, PERSONA_INITIAL, PERSONA_COLOR, PERSONA_COLOR_MUTED,
  BLOQUE_ICON, BLOQUE_LABEL,
  type Turno, type Bloque, type Persona,
} from '../types'

interface Props {
  day: number
  fecha: string
  isToday: boolean
  turnos: Turno[]
  onToggle: (fecha: string, bloque: Bloque, persona: Persona) => void
}

export function DayCell({ day, fecha, isToday, turnos, onToggle }: Props) {
  const [openBloque, setOpenBloque] = useState<Bloque | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenBloque(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const personasOf = (bloque: Bloque): Persona[] =>
    turnos.filter(t => t.bloque === bloque).map(t => t.persona)

  const isAssigned = (bloque: Bloque, persona: Persona) =>
    turnos.some(t => t.bloque === bloque && t.persona === persona)

  return (
    <div
      ref={ref}
      className={`relative rounded-lg border p-2 min-h-[120px] ${
        isToday
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Número del día */}
      <div className={`text-xs font-bold text-right mb-1 ${
        isToday ? 'text-blue-600' : 'text-gray-400'
      }`}>
        {day}
      </div>

      {/* Bloques */}
      <div className="flex flex-col gap-1">
        {BLOQUES.map(bloque => {
          const personas = personasOf(bloque)
          const isOpen = openBloque === bloque

          return (
            <div key={bloque} className="relative">
              <button
                onClick={() => setOpenBloque(isOpen ? null : bloque)}
                className={`w-full text-left rounded-md px-1.5 py-1 flex items-center gap-1.5 transition-colors min-h-[32px] ${
                  isOpen ? 'bg-gray-100' : 'hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <span className="text-sm leading-none shrink-0">{BLOQUE_ICON[bloque]}</span>
                <div className="flex gap-0.5 flex-wrap">
                  {personas.length === 0 ? (
                    <span className="text-xs text-gray-300 leading-none">—</span>
                  ) : (
                    personas.map(p => (
                      <span
                        key={p}
                        className={`text-xs leading-none px-1.5 py-0.5 rounded-full font-medium ${PERSONA_COLOR[p]}`}
                      >
                        {PERSONA_INITIAL[p]}
                      </span>
                    ))
                  )}
                </div>
              </button>

              {/* Popover */}
              {isOpen && (
                <div className="absolute left-0 z-50 mt-0.5 w-36 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                    {BLOQUE_ICON[bloque]} {BLOQUE_LABEL[bloque]}
                  </p>
                  <div className="flex flex-col gap-1">
                    {PERSONAS.map(persona => {
                      const assigned = isAssigned(bloque, persona)
                      return (
                        <button
                          key={persona}
                          onClick={() => onToggle(fecha, bloque, persona)}
                          className={`text-sm rounded-lg px-3 py-2 text-left font-medium transition-colors ${
                            assigned
                              ? PERSONA_COLOR[persona]
                              : PERSONA_COLOR_MUTED[persona]
                          }`}
                        >
                          {assigned ? '✓ ' : ''}{PERSONA_LABEL[persona]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
