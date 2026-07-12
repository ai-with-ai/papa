import { useState } from 'react'
import { Calendar } from './components/Calendar'
import { useTurnos } from './hooks/useTurnos'

export default function App() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const { turnos, loading, toggle } = useTurnos(year, month)

  const goToPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const goToNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  return (
    <Calendar
      year={year}
      month={month}
      turnos={turnos}
      loading={loading}
      onPrev={goToPrev}
      onNext={goToNext}
      onToggle={toggle}
    />
  )
}
