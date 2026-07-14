import { useState, useRef, useEffect } from 'react'
import {
  BLOQUES, PERSONAS,
  PERSONA_LABEL, PERSONA_INITIAL, PERSONA_COLOR, PERSONA_COLOR_MUTED,
  BLOQUE_ICON, BLOQUE_LABEL, BLOQUE_HORA,
  type Turno, type Nota, type Bloque, type Persona,
} from '../types'

interface Props {
  day: number
  fecha: string
  isToday: boolean
  turnos: Turno[]
  notas: Nota[]
  onToggle: (fecha: string, bloque: Bloque, persona: Persona) => void
  onSetHora: (fecha: string, bloque: Bloque, persona: Persona, hora: number) => void
  onSaveNota: (fecha: string, bloque: Bloque, texto: string) => void
}

type OpenPanel =
  | { kind: 'personas'; bloque: Bloque }
  | { kind: 'nota'; bloque: Bloque; draft: string }
  | null

function NotaIcon({ hasNota }: { hasNota: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`w-3.5 h-3.5 transition-colors ${hasNota ? 'text-yellow-400' : 'text-gray-300'}`}
      fill="currentColor"
      aria-hidden
    >
      <rect x="2" y="1" width="12" height="14" rx="1.5" />
      <rect x="4.5" y="4.5" width="7" height="1" rx="0.5" fill="white" />
      <rect x="4.5" y="7.5" width="7" height="1" rx="0.5" fill="white" />
      <rect x="4.5" y="10.5" width="4" height="1" rx="0.5" fill="white" />
    </svg>
  )
}

export function DayCell({ day, fecha, isToday, turnos, notas, onToggle, onSetHora, onSaveNota }: Props) {
  const [panel, setPanel] = useState<OpenPanel>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!panel) return
    const activePanel = panel
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (activePanel.kind === 'nota') {
          onSaveNota(fecha, activePanel.bloque, activePanel.draft)
        }
        setPanel(null)
        e.stopPropagation()
      }
    }
    document.addEventListener('click', onDocClick, true)
    return () => document.removeEventListener('click', onDocClick, true)
  }, [panel, fecha, onSaveNota])

  const personasOf = (bloque: Bloque): Persona[] =>
    turnos.filter(t => t.bloque === bloque).map(t => t.persona)

  const isAssigned = (bloque: Bloque, persona: Persona) =>
    turnos.some(t => t.bloque === bloque && t.persona === persona)

  const horaOf = (bloque: Bloque, persona: Persona): number => {
    const t = turnos.find(t => t.bloque === bloque && t.persona === persona)
    return t?.hora ?? BLOQUE_HORA[bloque]
  }

  const notaOf = (bloque: Bloque) =>
    notas.find(n => n.bloque === bloque)?.nota ?? ''

  const bloqueCubierto = (bloque: Bloque) => personasOf(bloque).length > 0
  const diaCubierto = BLOQUES.every(bloqueCubierto)

  const openPersonas = (bloque: Bloque) =>
    setPanel(p => p?.kind === 'personas' && p.bloque === bloque ? null : { kind: 'personas', bloque })

  const openNota = (bloque: Bloque) =>
    setPanel(p => p?.kind === 'nota' && p.bloque === bloque ? null : { kind: 'nota', bloque, draft: notaOf(bloque) })

  const handleGuardar = () => {
    if (panel?.kind === 'nota') {
      onSaveNota(fecha, panel.bloque, panel.draft)
      setPanel(null)
    }
  }

  return (
    <div
      ref={ref}
      className={`relative rounded-lg border p-2 min-h-[120px] min-w-[128px] transition-colors ${
        isToday
          ? 'border-blue-400 bg-blue-50'
          : diaCubierto
            ? 'border-green-200 bg-green-100'
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
          const isPersonasOpen = panel?.kind === 'personas' && panel.bloque === bloque
          const isNotaOpen = panel?.kind === 'nota' && panel.bloque === bloque
          const hasNota = notaOf(bloque).length > 0

          return (
            <div key={bloque} className="relative">
              <div className="flex items-center gap-0.5">

                {/* Botón del bloque (personas) */}
                <button
                  onClick={() => openPersonas(bloque)}
                  className={`flex-1 text-left rounded-md px-1.5 py-1 flex items-center gap-1.5 transition-colors min-h-[32px] ${
                    isPersonasOpen
                      ? 'bg-gray-100'
                      : bloqueCubierto(bloque)
                        ? 'bg-green-200 hover:bg-green-300'
                        : 'hover:bg-gray-50 active:bg-gray-100'
                  }`}
                >
                  <span className="text-sm leading-none shrink-0">{BLOQUE_ICON[bloque]}</span>
                  <div className="flex flex-col gap-0.5">
                    {personas.length === 0 ? (
                      <span className="text-xs text-gray-300 leading-none">—</span>
                    ) : (
                      personas.map(p => {
                        const hora = horaOf(bloque, p)
                        const custom = hora !== BLOQUE_HORA[bloque]
                        return (
                          <span
                            key={p}
                            className={`text-xs leading-none px-1.5 py-0.5 rounded-full font-medium ${PERSONA_COLOR[p]}`}
                          >
                            {PERSONA_INITIAL[p]}{custom ? ` ${hora}h` : ''}
                          </span>
                        )
                      })
                    )}
                  </div>
                </button>

                {/* Icono de nota */}
                <button
                  onClick={() => openNota(bloque)}
                  className="shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  aria-label="Notas"
                >
                  <NotaIcon hasNota={hasNota} />
                </button>
              </div>

              {/* Popover personas */}
              {isPersonasOpen && (
                <div className="absolute left-0 z-50 mt-0.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                    {BLOQUE_ICON[bloque]} {BLOQUE_LABEL[bloque]}
                  </p>
                  <div className="flex flex-col gap-1">
                    {PERSONAS.map(persona => {
                      const assigned = isAssigned(bloque, persona)
                      const hora = horaOf(bloque, persona)
                      return (
                        <div key={persona} className="flex items-center gap-1">
                          <button
                            onClick={() => onToggle(fecha, bloque, persona)}
                            className={`flex-1 text-sm rounded-lg px-2 py-1.5 text-left font-medium transition-colors ${
                              assigned ? PERSONA_COLOR[persona] : PERSONA_COLOR_MUTED[persona]
                            }`}
                          >
                            {assigned ? '✓ ' : ''}{PERSONA_LABEL[persona]}
                          </button>
                          {assigned && (
                            <div className="flex items-center shrink-0">
                              <button
                                onClick={() => onSetHora(fecha, bloque, persona, hora - 1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-sm leading-none"
                              >
                                −
                              </button>
                              <span className="text-xs font-medium w-7 text-center text-gray-700">
                                {hora}h
                              </span>
                              <button
                                onClick={() => onSetHora(fecha, bloque, persona, hora + 1)}
                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-sm leading-none"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Popover nota */}
              {isNotaOpen && (
                <div className="absolute left-0 z-50 mt-0.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
                  <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                    📝 Nota — {BLOQUE_LABEL[bloque]}
                  </p>
                  <textarea
                    autoFocus
                    rows={3}
                    value={panel.draft}
                    onChange={e => setPanel({ kind: 'nota', bloque, draft: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Escribe una nota…"
                  />
                  <div className="flex gap-1 mt-1.5">
                    <button
                      onClick={handleGuardar}
                      className="flex-1 text-xs bg-blue-500 text-white rounded-lg py-1.5 font-medium hover:bg-blue-600 transition-colors"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setPanel(null)}
                      className="text-xs text-gray-400 px-2 hover:text-gray-600"
                    >
                      Cancelar
                    </button>
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
