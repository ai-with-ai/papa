# CLAUDE.md

## Proyecto

Calendario familiar para organizar turnos de cuidado. Cada día se divide en 3 bloques horarios (mañana, tarde, noche) y en cada bloque se puede asignar hasta 4 personas.

**Personas:** mamá, Marina, Isa, Carlos (exactamente estas 4, no hay más).  
**Audiencia:** uso interno, 4-5 usuarios, sin registro ni autenticación compleja.

## Dominio

- **Bloque** = uno de los tres turnos del día: `mañana | tarde | noche`
- **Turno** = asignación de una persona a un bloque en una fecha concreta
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
  App.tsx              # componente raíz
  main.tsx             # punto de entrada
  types.ts             # tipos y constantes del dominio
  assets/              # imágenes y SVGs estáticos
  components/
    Calendar.tsx       # grid mensual + navegación
    DayCell.tsx        # celda de día con popover por bloque
  hooks/
    useTurnos.ts       # fetch + toggle optimista contra Supabase
  lib/
    supabase.ts        # cliente Supabase
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

### Modelo de datos

Una única tabla `turnos`:

| columna   | tipo                              | notas                        |
|-----------|-----------------------------------|------------------------------|
| `id`      | uuid (PK, auto)                   |                              |
| `fecha`   | date                              | formato `YYYY-MM-DD`         |
| `bloque`  | text — `mañana \| tarde \| noche` |                              |
| `persona` | text — `mama \| marina \| isa \| carlos` |                   |

Restricción `UNIQUE (fecha, bloque, persona)` — una persona no puede estar dos veces en el mismo bloque del mismo día.

Cada fila = una persona asignada a un bloque en una fecha. Para saber quién trabaja el martes por la tarde: `SELECT persona FROM turnos WHERE fecha = '2026-07-14' AND bloque = 'tarde'`.

## Lo que aún no está decidido

- Routing (probablemente no hace falta router; todo cabe en una sola vista de calendario)
- Estado global: Context de React es suficiente para este tamaño; no añadir Zustand salvo que haya problema real
