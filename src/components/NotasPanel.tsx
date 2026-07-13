import { BLOQUE_ICON, BLOQUE_LABEL, BLOQUES, type Nota } from '../types'

interface Props {
  notas: Nota[]
  onClose: () => void
}

function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function NotasPanel({ notas, onClose }: Props) {
  const sorted = [...notas].sort((a, b) => {
    const fechaCmp = a.fecha.localeCompare(b.fecha)
    if (fechaCmp !== 0) return fechaCmp
    return BLOQUES.indexOf(a.bloque) - BLOQUES.indexOf(b.bloque)
  })

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end"
      onMouseDown={onClose}
    >
      {/* Panel (bottom sheet) */}
      <div
        className="w-full bg-white rounded-t-2xl max-h-[80vh] flex flex-col shadow-2xl"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Cabecera del panel */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h2 className="font-semibold text-gray-800">Notas del mes</h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {notas.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
          >
            ×
          </button>
        </div>

        {/* Lista de notas */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {sorted.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              No hay notas este mes
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map(nota => (
                <div
                  key={nota.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{BLOQUE_ICON[nota.bloque]}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {BLOQUE_LABEL[nota.bloque]}
                    </span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {formatFecha(nota.fecha)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {nota.nota}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
