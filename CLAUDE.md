# CLAUDE.md

## Proyecto

Calendario familiar para organizar turnos de cuidado. Cada día se divide en 3 bloques horarios (mañana, tarde, noche) y en cada bloque se puede asignar hasta 4 personas.

**Personas:** mamá, Marina, Isa, Carlos (exactamente estas 4, no hay más).  
**Audiencia:** uso interno, 4-5 usuarios, sin registro ni autenticación compleja.  
**Desplegado en Vercel** — push a `master` despliega automáticamente.

## Dominio

- **Bloque** = uno de los tres turnos del día: `mañana | tarde | noche`
- **Turno** = asignación de una persona a un bloque en una fecha concreta
- **Nota** = texto libre asociado a un bloque en una fecha concreta
- Un bloque puede tener entre 0 y 4 personas asignadas (las 4 simultáneamente si hace falta)
- No hay jerarquía entre personas; todas tienen los mismos permisos

## Stack

- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS** — utility-first; no usar CSS modules ni estilos en línea salvo casos muy puntuales
- **React Compiler** activado vía `babel-plugin-react-compiler` — no usar `useMemo` / `useCallback` manualmente; el compilador los infiere
- App en `src/` (raíz del repo)

## Comandos habituales

```bash
npm run dev      # servidor de desarrollo (HMR)
npm run build    # compilar para producción (tsc + vite build)
npm run lint     # ESLint
npm run preview  # previsualizar el build
```

## Estructura

```
src/
  App.tsx              # componente raíz; orquesta useTurnos + useNotas
  main.tsx             # punto de entrada
  types.ts             # tipos y constantes del dominio
  assets/              # imágenes y SVGs estáticos
  components/
    Calendar.tsx       # grid mensual + navegación + header con icono de notas global
    DayCell.tsx        # celda de día: bloques, popovers de personas y notas por bloque
    NotasPanel.tsx     # bottom sheet con todas las notas del mes
  hooks/
    useTurnos.ts       # fetch por mes + toggle optimista con rollback contra Supabase
    useNotas.ts        # fetch por mes + upsert/delete contra Supabase
    useSeenNotas.ts    # rastrea notas vistas en localStorage (punto rojo de no leído)
  lib/
    supabase.ts        # cliente Supabase
public/
  favicon.svg          # cruz roja sobre fondo blanco
```

## Convenciones

- Componentes en PascalCase, hooks en camelCase con prefijo `use`
- Un componente por fichero; el fichero lleva el mismo nombre que el componente
- Importaciones de tipo con `import type { … }` (requerido por `verbatimModuleSyntax`)
- No dejar variables ni parámetros sin usar — TypeScript lo rechaza en build

## TypeScript — modo estricto

Flags activos en `tsconfig.app.json`:
- `noUnusedLocals` / `noUnusedParameters`
- `erasableSyntaxOnly` — no usar `const enum` ni `namespace`
- `noFallthroughCasesInSwitch`

## Persistencia

**Supabase** (free tier) — PostgreSQL gestionado, sin servidor propio, SDK JS incluido.  
RLS desactivado en ambas tablas (`ALTER TABLE … DISABLE ROW LEVEL SECURITY`).

### Modelo de datos

Tabla `turnos`:

| columna   | tipo                                     | notas                |
|-----------|------------------------------------------|----------------------|
| `id`      | uuid (PK, auto)                          |                      |
| `fecha`   | date                                     | formato `YYYY-MM-DD` |
| `bloque`  | text — `mañana \| tarde \| noche`        |                      |
| `persona` | text — `mama \| marina \| isa \| carlos` |                      |

Restricción `UNIQUE (fecha, bloque, persona)`.

Tabla `notas`:

| columna  | tipo                              | notas                |
|----------|-----------------------------------|----------------------|
| `id`     | uuid (PK, auto)                   |                      |
| `fecha`  | date                              | formato `YYYY-MM-DD` |
| `bloque` | text — `mañana \| tarde \| noche` |                      |
| `nota`   | text                              |                      |

Restricción `UNIQUE (fecha, bloque)` — máximo una nota por bloque por día.

### Lógica de guardado de notas

- Si el texto es vacío → `DELETE` la fila existente (si la hay)
- Si ya existe fila para esa fecha+bloque → `UPDATE`
- Si no existe → `INSERT`

## UI — comportamiento destacado

- **Scroll horizontal** en el grid; el header de días de la semana se sincroniza con JS (`scrollLeft`) porque `position: sticky` no funciona dentro de `overflow-x: auto`
- **Colores de cobertura**: bloque cubierto → `bg-green-200`; día entero cubierto → `border-green-200 bg-green-100`; hoy → `border-blue-400 bg-blue-50`
- **Icono de nota por bloque**: gris sin nota, `text-yellow-400` con nota
- **Panel global de notas**: icono de bloc en el header abre un bottom sheet con todas las notas del mes ordenadas por fecha y bloque; punto rojo en el icono si hay notas no vistas (estado en `localStorage`)
- **Toggle optimista**: los turnos se aplican en UI antes de confirmar con Supabase; se hace rollback si falla

## Decisiones tomadas

- Sin router — todo cabe en una sola vista de calendario
- Sin estado global (Zustand, Context) — props drilling directo; el tamaño lo permite
- `useSeenNotas` usa `localStorage` (no DB) para no añadir columnas ni timestamps a `notas`
