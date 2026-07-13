import { useState } from 'react'
import { Calendar } from './components/Calendar'
import { useTurnos } from './hooks/useTurnos'
import { useNotas } from './hooks/useNotas'

export default function App() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const { turnos, loading, error, toggle } = useTurnos(year, month)
  const { notas, saveNota } = useNotas(year, month)

  const goToPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const goToNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  return (
    <>
      {error && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-sm px-4 py-2 rounded-xl shadow-lg">
          {error}
        </div>
      )}
      <Calendar
        year={year}
        month={month}
        turnos={turnos}
        notas={notas}
        loading={loading}
        onPrev={goToPrev}
        onNext={goToNext}
        onToggle={toggle}
        onSaveNota={saveNota}
      />
    </>
  )
}
