export type Bloque = 'mañana' | 'tarde' | 'noche'
export type Persona = 'mama' | 'marina' | 'isa' | 'carlos'

export interface Turno {
  id: string
  fecha: string
  bloque: Bloque
  persona: Persona
}

export const BLOQUES: Bloque[] = ['mañana', 'tarde', 'noche']
export const PERSONAS: Persona[] = ['mama', 'marina', 'isa', 'carlos']

export const PERSONA_LABEL: Record<Persona, string> = {
  mama: 'Mamá',
  marina: 'Marina',
  isa: 'Isa',
  carlos: 'Carlos',
}

export const PERSONA_INITIAL: Record<Persona, string> = {
  mama: 'Má',
  marina: 'Mr',
  isa: 'Is',
  carlos: 'Ca',
}

export const PERSONA_COLOR: Record<Persona, string> = {
  mama: 'bg-rose-400 text-white',
  marina: 'bg-blue-400 text-white',
  isa: 'bg-emerald-400 text-white',
  carlos: 'bg-amber-400 text-white',
}

export const PERSONA_COLOR_MUTED: Record<Persona, string> = {
  mama: 'bg-rose-100 text-rose-700',
  marina: 'bg-blue-100 text-blue-700',
  isa: 'bg-emerald-100 text-emerald-700',
  carlos: 'bg-amber-100 text-amber-700',
}

export const BLOQUE_LABEL: Record<Bloque, string> = {
  mañana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
}

export const BLOQUE_ICON: Record<Bloque, string> = {
  mañana: '🌅',
  tarde: '☀️',
  noche: '🌙',
}

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
