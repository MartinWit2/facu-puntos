# Handoff: Unipoints — versión mobile

## Overview
Unipoints (repo `MartinWit2/facu-puntos`) es una app personal donde un estudiante carga sus notas de parciales y finales, gana puntos según las horas cátedra de cada materia, y canjea esos puntos por premios que él mismo define. Hoy existe como app web React + Vite + Supabase. Este handoff describe la **versión mobile** de las cuatro pantallas principales: Materias, Detalle de materia, Progreso y Premios.

El objetivo del rediseño no es agregar features nuevas, sino adaptar los mismos flujos a una pantalla de teléfono: header fijo con el saldo, navegación por tabs abajo, y hojas inferiores (bottom sheets) en lugar de inputs y paneles expandibles.

## About the Design Files
Los archivos de este bundle son **referencias de diseño hechas en HTML** — prototipos que muestran el aspecto y el comportamiento buscados, no código para copiar a producción.

La tarea es **recrear estos diseños en el entorno del codebase existente**: React 19 + Vite + React Router + Supabase, con CSS plano por página (`src/pages/*.css`, `src/components/*.css`) y variables en `src/index.css`. Seguí esos patrones. El prototipo usa estilos inline por razones propias de la herramienta de diseño; en el codebase corresponden clases CSS como las que ya existen.

Importante: la lógica de negocio **ya está implementada** en el repo y no hay que reescribirla. El prototipo reimplementa las reglas solo para poder demostrarlas. Usá los módulos reales:

- `src/utils/cursada.js` — `evaluarCursada(materia, reglas)` → estado de la materia
- `src/utils/reglasMateria.js` — `calcularReglasEfectivas(materia, reglasCarrera)`
- `src/utils/puntos.js`, `src/utils/puntosMateria.js` — cálculo de puntos y disponibles por materia
- `src/utils/canjes.js` — puntos usados por materia
- `src/utils/filtrosMaterias.js` — `FILTROS_VACIOS`, `RANGOS_HORAS`, `materiaCoincideFiltros`
- `src/utils/anio.js` — `nombreAnio`
- `src/constants.js` — cantidades default y umbrales de rangos de horas
- `docs/SPEC.md` — el modelo completo de materias, parciales, puntos y premios

Si algo del prototipo contradice a `docs/SPEC.md` o a esos utils, **gana el repo**.

## Fidelity
**Alta fidelidad.** Colores, tipografía, espaciados, radios y sombras son finales y salen de `src/index.css` del repo. Recrear pixel-perfect usando las variables CSS que ya existen. Los datos que se ven en el prototipo son de ejemplo (plan de Ing. en Sistemas de la UTN, con nombres de 3° a 5° año inventados) — en la app real vienen de Supabase.

## Screens / Views

### Chrome común (header + tabs)

El chrome (header + tabs) **se oculta** en dos casos: la pantalla de login/registro, y la selección de carrera de primera vez (cuando el usuario todavía no tiene ninguna). En el resto está siempre.

**Header** — fijo arriba, no scrollea.
- Fondo `#ffffff`, borde inferior `1px solid #e5e4e7`, padding `56px 18px 12px` (los 56px superiores son el safe area del status bar de iOS; en la app real usar `env(safe-area-inset-top)`).
- Layout: `flex`, `align-items:center`, `justify-content:space-between`, `gap:12px`.
- Izquierda, columna: "Unipoints" en Baloo 2 800, 19px, `#9a329d`, `line-height:1.1`; debajo la carrera activa en 11px `#6b6375`, derivada del perfil — `"UTN · Ingeniería en Sistemas de Información"`, o "Sin carrera elegida" si no hay ninguna. Nunca hardcodeada.
- Derecha, fila con `gap:9px`:
  - **Píldora de saldo**: `border-radius:999px`, fondo `rgba(198,64,201,.14)`, padding `8px 14px`, `gap:7px`. Contiene un círculo de 14px `#ffc800` con `box-shadow: inset 0 -2px 0 rgba(224,172,0,.9)` (la moneda) y el saldo en Baloo 2 800, 16px, `#9a329d`.
  - **Avatar**: 40×40, `border-radius:999px`, fondo `#c640c9` (`#9a329d` cuando el menú está abierto), `box-shadow:0 3px 0 #9a329d`, inicial del usuario en Baloo 2 800, 15px, `#fff`. Al presionar: `transform:translateY(2px)` y sombra a `0 1px 0`.

**Tabs** — fijos abajo, `flex`, `gap:6px`, padding `8px 10px 30px` (los 30px son el home indicator; usar `env(safe-area-inset-bottom)`), fondo `#ffffff`, borde superior `1px solid #e5e4e7`.
- Tres tabs de igual ancho (`flex:1`), `min-height:46px`, columna centrada con `gap:3px`, `border-radius:14px`.
- Activo: fondo `rgba(198,64,201,.14)`, color `#9a329d`. Inactivo: fondo transparente, color `#6b6375`.
- Label en Baloo 2 600, 12px. Los iconos del prototipo son placeholders (un cuadrado de 16px con borde de 2px y distinto radio por tab) — **reemplazar por iconos reales** del set que use el proyecto.
- Tabs: Materias, Progreso, Premios. El detalle de materia mantiene "Materias" activo.

### 1. Materias

Lista completa de las materias de la carrera, agrupadas por año.

- Contenedor scrolleable, padding `18px 16px 28px`, columna con `gap:18px`.
- **Encabezado**: h1 "Materias" en Baloo 2 800, 27px, `#2b2438`, margen 0. A la derecha, 12px `#6b6375`, con el conteo: `"N de M aprobadas"` sin filtros activos, o `"N de M materias"` cuando hay filtros.
- **Botón "+ Agregar materia"**: botón primario de ancho completo, `min-height:48px`, radio 14px, fondo `#c640c9`, `box-shadow:0 4px 0 #9a329d`, contenido centrado con `gap:8px` — un "+" en Baloo 2 800 20px y el label en Baloo 2 700 15px, ambos `#fff`. Al presionar baja `translateY(3px)` y la sombra pasa a `0 1px 0`. Va entre el encabezado y la barra de filtros. Abre la hoja de nueva materia.
- **Barra de filtros**: fila horizontal scrolleable con `gap:8px`, tres chips (Año, Horas, Estado) más "Limpiar" cuando hay alguno activo.
  - Chip: `min-height:38px`, padding `0 14px`, `border-radius:999px`, `font-size:13px`, `font-weight:600`. Sin selección: borde `1.5px solid #e5e4e7`, fondo `#fff`, texto `#3f3b46`. Con selección: borde y fondo `#c640c9`, texto `#fff`, y un contador circular de 18px con el número de opciones elegidas.
  - Tocar un chip abre una **hoja inferior** con las opciones como filas tildables (ver "Hojas inferiores"). En la web esto es un dropdown (`MateriaFiltros.jsx`); en mobile es una hoja, porque los dropdowns anclados no funcionan bien con el teclado y el scroll del teléfono.
  - Opciones por categoría: **Año**, derivado de los años presentes en los datos (`nombreAnio`), nunca hardcodeado. **Horas**, los rangos de `RANGOS_HORAS` (`Menos de 100`, `100 a 159`, `160 o más`, según `RANGO_HORAS_UMBRAL_1 = 100` y `_2 = 160`). **Estado**, las cuatro opciones agrupadas de `filtrosMaterias.js`: Aprobada (incluye `promocion` y `aprobada`), Firmada (`firma`), Cursando (`cursando`), Pendiente (`pendiente` y `recursa`).
  - Combinación: OR dentro de cada categoría, AND entre categorías. Usar `materiaCoincideFiltros` tal cual.
  - Si el filtro no deja ninguna materia: tarjeta vacía centrada, `border-radius:18px`, fondo `#fff`, borde `1px solid #e5e4e7`, con el texto "Ninguna materia coincide con los filtros" en 13.5px `#6b6375` y un botón de texto "Limpiar filtros".
- **Tarjeta por año** (una por año, colapsable): fondo `#fff`, borde `1px solid #e5e4e7`, `border-radius:18px`, `box-shadow:0 3px 12px rgba(43,36,56,.08)`, `overflow:hidden`. Con filtros activos, un año sin materias visibles se oculta por completo.
  - **Cabecera** clickeable: padding `15px 16px`, `min-height:44px`, `gap:12px`. Título "`1er año`" en Baloo 2 700, 17px, `#2b2438`; al lado, 12px `#6b6375` con `"N/M aprobadas"`. Debajo, **barra de avance**: alto 6px, `border-radius:999px`, riel `#eeecf1`, relleno `#c640c9` al porcentaje de aprobadas, `transition:width .3s ease`. A la derecha un chevron `▾` que rota 180° al abrir, `transition:transform .2s ease`.
  - Por defecto: 1° cerrado, 2° abierto (en la app real, abrir el año de cursada actual).
  - **Fila de materia**: padding `13px 16px`, borde inferior `1px solid #f2f0f5`, `gap:12px`. Nombre en 14.5px 600 `#2b2438`, `line-height:1.25`. Debajo, badge de estado y meta (`"128 hs · pool 128"`) en 11.5px `#6b6375`. A la derecha, los puntos ganados como `"+128"` en Baloo 2 700, 14px, `#9a329d` (vacío si son 0) y un chevron `›` en 12px `#c3bfc9`. Toda la fila navega al detalle.

**Badges de estado** — `border-radius:999px`, padding `3px 9px`, 10.5px, `font-weight:700`. Mismos pares que `MateriaBadge.css`:

| Estado | Texto | Fondo | Color |
| --- | --- | --- | --- |
| `pendiente` | Pendiente | `#e5e4e7` | `#6b6375` |
| `cursando` | Cursando | `rgba(255,200,0,.22)` | `#a66a00` |
| `promocion` | Promocionó | `rgba(88,204,2,.18)` | `#2f7a00` |
| `firma` | Firmó | `rgba(28,176,246,.18)` | `#0f7ab0` |
| `aprobada` | Aprobada | `rgba(88,204,2,.18)` | `#2f7a00` |
| `recursa` | Recursa | `rgba(255,75,75,.16)` | `#c22a2f` |

### 2. Detalle de materia

Padding `16px 16px 28px`, columna con `gap:16px`.

- **Volver**: "‹ Materias", 13.5px `#6b6375`, `min-height:44px`.
- **Título**: nombre en Baloo 2 800, 25px, `#2b2438`, `line-height:1.15`. Debajo, badge de estado (padding `4px 11px`, 11px) y meta en 12px `#6b6375`: `"128 hs cátedra · 2 parciales"`.
- **Tarjeta de puntos**: borde `2px solid #c640c9`, fondo `rgba(198,64,201,.10)`, `border-radius:18px`, padding `14px 16px`. Label "Puntos de esta materia" en 11px `#6b6375`; valor en Baloo 2 800, 28px, `#9a329d`; y detalle en 11px `#6b6375`: `"Pool base 128"`, con `" · +50% por promoción"` o `" · +25% por final"` cuando corresponde.
- **Botón "Empezar a cursar"**, solo si el estado es `pendiente`: ancho completo, `min-height:48px`, fondo `#c640c9`, texto `#fff` Baloo 2 700 16px, `border-radius:14px`, `box-shadow:0 4px 0 #9a329d`. Al presionar: `translateY(3px)` y sombra `0 1px 0`.
- **Parciales**: sección con label "PARCIALES" (11px, 600, `letter-spacing:.08em`, mayúsculas, `#6b6375`). Una tarjeta por parcial (`#fff`, borde `1px solid #e5e4e7`, radio 18px, sombra `0 3px 12px rgba(43,36,56,.08)`, padding `14px 16px`, `gap:11px`).
  - Cabecera: "Parcial 1" en 14px 700 `#2b2438`; a la derecha el estado en 12px 700 — "Aprobado con 8" / "Aprobado" en `#2f7a00`, "Sin aprobar" en `#c22a2f`, "Sin rendir" en `#6b6375`.
  - **Chips de nota**: una fila (`gap:9px`) con una instancia por columna (`flex:1`): original, recu 1, recu 2 (cantidad según `DEFAULT_CANTIDAD_RECUPERATORIOS`, configurable por materia). Cada chip: alto 46px, `border-radius:13px`, borde `1.5px`, nota en Baloo 2 800, 19px, y label debajo en 10px `#6b6375` ("Original", "Recu 1"…).
    - Vacío: `–`, borde `#e5e4e7`, fondo `#fbfafc`, texto `#c3bfc9`.
    - Aprobado (nota ≥ nota de aprobación): borde `rgba(88,204,2,.5)`, fondo `rgba(88,204,2,.14)`, texto `#2f7a00`.
    - Desaprobado: borde `rgba(255,75,75,.45)`, fondo `rgba(255,75,75,.12)`, texto `#c22a2f`.
  - **Tocar un chip abre la hoja de notas** — este es el cambio más importante respecto de la web: no hay inputs numéricos ni teclado. Ver "Hojas inferiores".
- **Final**: se muestra solo si el estado es `firma` o `aprobada`. Misma tarjeta, con 4 chips (`DEFAULT_CANTIDAD_INSTANCIAS_FINAL`) etiquetados "Inst. 1"…"Inst. 4". Arriba, en 12px `#6b6375`: "Final aprobado." o "Firmaste: te quedan N instancias de final."
- **Nota final de la materia**: sección propia después del final. Label de sección a la izquierda y a la derecha, en 11.5px `#6b6375`, "Sin cargar" o "Cargada". Dentro de una tarjeta (`#fff`, borde `1px solid #e5e4e7`, radio 18px, sombra de tarjeta, padding `14px 16px`), una **grilla de 4 columnas** con `gap:8px` y ocho celdas de 50px de alto y radio 13px: las notas 4 a 10 en Baloo 2 800 19px, más una celda "Sin nota" en 13px para limpiarla. Elegida: fondo y borde `#c640c9`, texto `#fff`. Sin elegir: borde `1.5px solid #e5e4e7`, fondo `#fff`, texto `#3f3b46` (`#a9a4b0` en "Sin nota"). Es la nota de la materia, distinta de las instancias de final: se guarda como dato y no interviene en el cálculo de puntos. Cuando está cargada, se suma a la línea de meta del título: `" · nota final 7"`.

### 2b. Editar materia (hoja)

Botón **Editar materia** en el detalle, entre el título y la tarjeta de puntos: fila de `min-height:48px`, padding `0 15px`, radio 14px, borde `1.5px solid #e5e4e7`, fondo `#fff`. Icono placeholder de 16px con borde `2px solid #9a329d`, label "Editar materia" en 14px 600 `#2b2438`, y a la derecha un resumen de las reglas vigentes en 11.5px `#6b6375` (`"Aprueba 6 · promo 8"`, o `"Aprueba 6 · promo no"` si no permite) más un chevron `›`. Al presionar baja `translateY(2px)`.

Abre una hoja inferior (`max-height:88%`, padding `20px 18px 30px`, `gap:14px`) titulada "Editar materia" con el nombre de la materia debajo en 12px `#6b6375` con elipsis. El cuerpo scrollea con `gap:16px`; el botón "Listo" queda fijo al pie (mismo botón primario de siempre). Contenido, en orden:

1. **Nombre** — label 14px 600 y un `<input>` de ancho completo, `min-height:48px`, padding `0 14px`, radio 14px, borde `1.5px solid #e5e4e7` que pasa a `#c640c9` en foco, texto 14.5px 600 `#2b2438`, sin outline. Edita en vivo.
2. **Steppers numéricos** — cuatro filas con label 14px 600, ayuda dinámica en 11.5px `#6b6375`, y a la derecha un control de −/valor/+ (botones de 44×44 con radio 13px y borde `1.5px solid #e5e4e7`, fondo `#f2f0f5` al presionar; valor centrado en Baloo 2 800 17px con `min-width:56px`):
   - Horas cátedra, de a 16, entre 32 y 320. Ayuda: "Definen el pool: 128 pts".
   - Parciales, 1 a 4. Ayuda: "Cada uno vale 64 pts". Agregar o quitar preserva las notas de los parciales que quedan.
   - Recuperatorios por parcial, 1 a 4 (sin contar el original). Aplica a todos los parciales por igual.
   - Instancias de final, 1 a 6.
3. **Permite promoción** — fila clickeable con label, ayuda ("La materia puede promocionar sin final." / "La materia siempre va a final.") y un switch de 52×31, radio 999px, padding 3px, con perilla blanca de 25px y sombra `0 1px 3px rgba(43,36,56,.3)`. Encendido `#c640c9`, apagado `#d8d4dd`, `transition:background .2s ease`. Apagarlo oculta la fila de nota de promoción.
4. **Nota de aprobación** (4 a 8) y, solo si permite promoción, **nota de promoción** (6 a 10) — cada una con label, ayuda y una fila de cinco celdas de 46px, radio 13px, Baloo 2 800 18px. Elegida: fondo y borde `#c640c9`, texto `#fff`.
5. **Forzar resultado** — separado por un borde superior `1px solid #f2f0f5` con `padding-top:14px`. Label, ayuda ("Si el profesor decide por fuera de la regla, marcalo acá.") y dos toggles en fila de `min-height:46px`, radio 13px, 13.5px 600: "Promocionó" y "Firmó". Apagado: borde `1.5px solid #e5e4e7`, transparente, texto `#3f3b46`. Encendido: fondo y borde `#c640c9`, texto `#fff`.
6. **"Volver a las reglas de la carrera"** — aparece solo si la materia tiene overrides. `min-height:44px`, borde `1.5px solid #e5e4e7`, texto 13.5px `#6b6375`. Borra los overrides y devuelve la materia a las reglas de la carrera.

**Reglas por materia.** Los valores de nota de aprobación, nota de promoción y permite-promoción son **overrides por materia** que pisan a los de la carrera, exactamente como `calcularReglasEfectivas(materia, reglasCarrera)` en el repo. Guardar solo las claves que el usuario tocó; las demás se resuelven contra la carrera. Todo lo derivado recalcula en vivo al cambiar cualquiera de estos valores: badge de estado, puntos de la materia, saldo del header, barra de avance del año y disponibles en el canje. La ayuda de la hoja de notas también refleja las reglas de esa materia ("Se aprueba con 6 o más. Con 8 en el original o el primer recu, promociona." / "...Esta materia no permite promoción.").

**Forzar resultado, semántica.** El tick es un override duro: se aplica aunque falten parciales por cargar, no requiere que la evaluación normal ya dé ese resultado. `tick === 'promocion'` devuelve `promocion` sin más; `tick === 'firma'` devuelve `aprobada` si hay un final aprobado, y `firma` si no. En ambos casos los puntos parten del **pool completo** (no de la suma por parcial aprobado), más el +50% de promoción o el +25% de final según corresponda. Sin esto el control es un no-op en el caso común, que es justamente cuando el usuario lo necesita.

### 2c. Nueva materia (hoja)

Se abre desde "+ Agregar materia" en la pantalla de Materias. Misma estructura de hoja que Editar materia (`max-height:88%`, padding `20px 18px 30px`, `gap:14px`, cuerpo scrolleable con `gap:16px`, botón fijo al pie). Título "Nueva materia" en Baloo 2 700 18px y "Cerrar" a la derecha. Cubre los mismos campos que `MateriaForm.jsx`:

1. **Nombre** — input de ancho completo (mismo estilo que en Editar materia), placeholder "Sistemas Operativos".
2. **Año de cursada** — fila de cinco celdas de 48px, radio 13px, Baloo 2 800 17px, con "1°" a "5°". Elegida: fondo y borde `#c640c9`, texto `#fff`. Default 1°. En la app real, si el plan tiene más años que 5, esto debe derivarse del plan y no quedar fijo en cinco opciones.
3. **Steppers** — Horas cátedra (default 128, de a 16, entre 32 y 320; ayuda "Pool de puntos: 128"), Parciales (default 2, 1 a 4), Recuperatorios (default 2, 0 a 4), Instancias de final (default 4, 0 a 6). Mismos controles de −/valor/+ de 44×44 que en Editar materia.
4. **No sumar puntos** — separado por un borde superior `1px solid #f2f0f5` con `padding-top:14px`. Switch de 52×31 con la ayuda "Ya la tenía aprobada antes de usar la app." Equivale a `poolOverride: 0`: la materia existe y muestra su estado, pero su pool es 0 y no aporta puntos. Cuando está encendido, la ayuda del stepper de horas pasa a "No va a sumar puntos".
5. **Botón de submit** — "Agregar materia" habilitado, o "Ponele un nombre" en gris (`#f2f0f5` / `#a9a4b0`, sin sombra) mientras el nombre esté vacío. El único campo obligatorio es el nombre; el resto tiene defaults válidos. En la app real, validar además horas > 0 como hace `MateriaForm`.

Al confirmar, la materia se agrega y **el año donde cayó se abre** en la lista, para que se vea el resultado sin buscarlo.

### 2d. Nuevo premio (hoja)

Se abre desde "+ Agregar premio" en la pantalla de Premios (mismo botón primario de ancho completo, entre el h1 y la primera categoría). Título "Nuevo premio". Campos, equivalentes a `PremioForm.jsx`:

1. **Nombre** — input de ancho completo, placeholder "Salir a comer afuera".
2. **Categoría** — label con ayuda "Elegí una o escribí una nueva.", y dos controles:
   - Un **acordeón**: contenedor con borde `1.5px solid #e5e4e7`, radio 14px, `overflow:hidden`. Fila cerrada de `min-height:48px`, padding `0 14px`, que muestra la categoría elegida en 14.5px 600 `#2b2438` (o "Elegir categoría" en `#a9a4b0` si no hay ninguna) con elipsis, más un chevron `▾` que rota 180° al abrir. Abierto, despliega la lista con un borde superior `1px solid #f2f0f5` y **`max-height:184px` con scroll propio** — así el alto de la hoja no crece con la cantidad de categorías. Cada opción: `min-height:46px`, padding `0 14px`, borde inferior `1px solid #f2f0f5`, un círculo de 22px a la izquierda (elegida: fondo y borde `#c640c9` con un `✓` blanco de 12px; sin elegir: borde `1.5px solid #d8d4dd`) y el nombre en 14px 600. La fila elegida además lleva fondo `rgba(198,64,201,.08)`. Elegir una opción la escribe en el campo y **cierra el acordeón**.
   - Un **input libre** debajo, placeholder "O escribí una nueva". Escribir ahí y elegir del acordeón son el mismo dato: el input es la fuente de verdad, y el acordeón solo lo setea. Es el patrón de `ComboboxCategoria`, adaptado para que no empuje la pantalla cuando hay muchas categorías.
3. **Costo en puntos** — separado por borde superior, con stepper de a 10 entre 10 y 2000 (default 120). Ayuda con la referencia real: "Tus materias van de 64 a 240 pts." (mín y máx de los puntos ya ganados), o "Todavía no tenés puntos cargados." si no hay ninguno. Equivale al `rangoPool` de `PremioForm`.
4. **Botón de submit** — "Agregar premio", o "Completá nombre y categoría" en gris mientras falte alguno de los dos. Costo debe ser > 0.

### 3. Progreso

Padding `18px 16px 28px`, `gap:16px`.

- h1 "Progreso" (Baloo 2 800, 27px, `#2b2438`).
- **Tarjeta de saldo**: borde `2px solid #c640c9`, fondo `rgba(198,64,201,.10)`, `border-radius:20px`, padding 18px, fila con `gap:14px`. Círculo-moneda de 44px `#ffc800` con `inset 0 -4px 0 rgba(224,172,0,.9)`. Al lado: "Saldo disponible" en 12px `#6b6375`, el saldo en Baloo 2 800, 40px, `#9a329d`, `line-height:1.05`, y "N pts ya canjeados" en 12px `#6b6375`.
- **Dos tarjetas chicas** en fila (`gap:10px`): "Ganados" y "Canjeados", cada una `#fff`, borde `1px solid #e5e4e7`, radio 16px, padding `13px 15px`, label 11px `#6b6375` y valor Baloo 2 700 21px `#2b2438`.
- **"DE DÓNDE VIENEN"**: una fila por materia con puntos, `#fff`, borde `1px solid #e5e4e7`, radio 16px, sombra `0 3px 12px rgba(43,36,56,.08)`, padding `12px 15px`. Nombre en 14px 600, badge de estado y pool en 11px `#6b6375`; a la derecha, los puntos en Baloo 2 800 16px `#9a329d` y una nota de 10.5px `#6b6375`.

### 4. Premios

Padding `18px 16px 28px`, `gap:18px`.

- h1 "Premios".
- **Agrupado por categoría** (`ComboboxCategoria` en el repo): título de categoría en Baloo 2 700 16px `#2b2438`, y a la derecha el conteo en 11px `#6b6375`.
- **Fila de premio**: `#fff`, borde `1px solid #e5e4e7`, radio 18px, sombra `0 3px 12px rgba(43,36,56,.08)`, padding `13px 15px`, `gap:12px`. Nombre en 14.5px 600 `#2b2438`; debajo, "Podés canjearlo" en `#2f7a00` o "Te faltan N pts" en `#6b6375`, 11.5px.
  - **Botón de costo** a la derecha, `min-height:40px`, padding `0 16px`, radio 12px, Baloo 2 700 14px, con el costo ("250 pts"). Alcanza: fondo y borde `#c640c9`, texto `#fff`, `box-shadow:0 4px 0 #9a329d`. No alcanza: transparente, borde `#e5e4e7`, texto `#a9a4b0`, sin sombra, no clickeable.
- **Historial (acordeón de dos niveles)** — separado por un borde superior `1px solid #e5e4e7` con `padding-top:16px`. Se colapsa entero para que la pantalla no crezca con la cantidad de canjes.
  - **Cabecera**: fila clickeable de `min-height:48px` con "Historial" en Baloo 2 700 16px `#2b2438`, a la derecha un resumen en 11.5px `#6b6375` (`"2 canjes · 370 pts"`, singular "1 canje") y un chevron `▾` que rota 180° al abrir. Cerrado por defecto.
  - **Fila de canje** (abierta la cabecera): tarjeta `#fff`, borde `1px solid #e5e4e7`, radio 16px, `overflow:hidden`, con `gap:8px` entre tarjetas. Fila clickeable de `min-height:44px`, padding `12px 14px`: nombre en 13.5px 600 `#2b2438`, fecha debajo en 11px `#6b6375`, el costo `"−250 pts"` en Baloo 2 700 14px `#c22a2f`, y su propio chevron.
  - **Detalle** (al abrir un canje): borde superior `1px solid #f2f0f5`, padding `12px 14px`, label "DE DÓNDE SALIERON" en 10.5px 600 mayúsculas `#6b6375`, y una fila por materia con el nombre completo en 13px `#3f3b46` y los puntos aportados en Baloo 2 700 13.5px `#9a329d`. Si la materia ya no existe, "Materia borrada".
  - Solo un canje abierto a la vez (abrir otro cierra el anterior).

## Pantallas de acceso y carrera

### A. Login / Registro

Pantalla **sin header ni tabs** — el chrome se oculta por completo. Fondo `#fff`, padding `76px 26px 40px`, columna.

- **Marca**: círculo-moneda de 76px `#ffc800` con `inset 0 -6px 0 rgba(224,172,0,.9)`, "Unipoints" en Baloo 2 800 34px `#9a329d`, y una bajada centrada en 14px `#6b6375`, `max-width:250px`: "Cargá tus notas, ganá puntos y canjealos por lo que quieras." en login, "Armá tu cuenta y elegí tu carrera para empezar." en registro.
- **Switch de modo**: control segmentado de dos opciones, `margin-top:34px`, fondo `#f2f0f5`, radio 14px, padding 4px. Cada opción `flex:1`, `min-height:42px`, radio 11px, Baloo 2 700 14.5px. Activa: fondo `#fff`, texto `#9a329d`, `box-shadow:0 1px 3px rgba(43,36,56,.14)`. Inactiva: transparente, `#6b6375`. Etiquetas "Iniciar sesión" y "Registrarme". Reemplaza al `auth-toggle` de texto de `Auth.jsx`, que en mobile es un target muy chico.
- **Email**: label 13px 600 y un `<input type="email">` de `min-height:50px`, padding `0 15px`, radio 14px, borde `1.5px solid #e5e4e7` → `#c640c9` en foco, texto 15px. Placeholder "tunombre@mail.com".
- **Contraseña**: el input va dentro de un contenedor que lleva el borde (para que el foco lo pinte entero, vía `:focus-within`), y a la derecha un botón de texto "Ver" / "Ocultar" en 12.5px 600 `#9a329d` que alterna `type` entre `password` y `text`. Placeholder "Tu contraseña" en login, "Elegí una contraseña" en registro. En registro, ayuda debajo: "Mínimo 6 caracteres."
- **"Olvidé mi contraseña"** — solo en login, alineado a la derecha, 12.5px 600 `#9a329d`. Dispara el aviso informativo "Te vamos a mandar un mail para recuperarla. Revisá tu casilla." En la app real, `supabase.auth.resetPasswordForEmail`.
- **Aviso**: un único bloque para errores y mensajes, padding `12px 14px`, radio 14px, texto 12.5px `line-height:1.45`. Error: fondo `rgba(255,75,75,.10)`, borde `rgba(255,75,75,.35)`, texto `#c22a2f`. Info: fondo `rgba(28,176,246,.10)`, borde `rgba(28,176,246,.35)`, texto `#0f7ab0`. Reemplaza a `auth-error` y `auth-mensaje`. Se limpia al tipear o cambiar de modo.
- **Submit**: `min-height:52px`, radio 15px, Baloo 2 700 16.5px, "Iniciar sesión" o "Crear cuenta". Habilitado solo con email con forma válida y contraseña de largo suficiente (1 en login, 6 en registro); deshabilitado en `#f2f0f5` / `#a9a4b0` sin sombra. En la app real agregar el estado de carga "Un momento…" y `disabled` mientras responde Supabase.
- **Pie**: "¿No tenés cuenta? Registrate" / "¿Ya tenés cuenta? Iniciá sesión" en 13.5px `#6b6375`, centrado, `margin-top:26px`. Hace lo mismo que el switch.
- **Errores de validación**: si el email no tiene forma de email, "Revisá el email: parece incompleto."; si falta la contraseña, "Poné tu contraseña." o "La contraseña necesita al menos 6 caracteres." Los errores de Supabase van en el mismo bloque de aviso.
- **Después del submit**: login entra a Materias; registro va a la selección de carrera de primera vez. En la app real, el signup sin sesión muestra "Te enviamos un email para confirmar la cuenta." y vuelve a login, como hoy hace `Auth.jsx`.

### B. Elegir / cambiar de carrera

Una sola pantalla que cubre los dos casos del repo — `SeleccionCarrera` (primera vez) y `CambiarCarrera` — en dos pasos: elegir y confirmar. Padding `16px 16px 28px`, `gap:16px`.

**Chrome.** En el caso de **primera vez no hay header ni tabs**: es una pantalla bloqueante, y la única salida es elegir una carrera (o volver al registro). Sin eso el onboarding se puede saltear tocando un tab. En el caso de cambio, el chrome se mantiene.

**Paso 1 — elegir**
- "‹ Materias" arriba, o "‹ Volver al registro" en primera vez.
- h1 "Cambiar de carrera", o "¿Qué carrera estás cursando?" en primera vez.
- **Tarjeta de carrera actual** (solo si hay una): borde `1.5px solid #e5e4e7`, fondo `#fff`, radio 18px, padding `14px 16px`. Label "Tu carrera actual" en 11px `#6b6375`, el nombre en Baloo 2 700 16px `#2b2438`, y debajo `"UTN — FRBA · 22 materias"` en 12px `#6b6375`.
- **Buscador**: `<input type="search">` de `min-height:48px`, radio 14px, mismo borde y foco que el resto. Placeholder "Buscar universidad o carrera". Filtra por nombre y por universidad, igual que `coincide()` en `SelectorCarreras.jsx`.
- **Lista agrupada por universidad**: label de grupo en 11px 600 mayúsculas `letter-spacing:.08em` `#6b6375`, y una tarjeta por carrera (`#fff`, borde `1px solid #e5e4e7`, radio 18px, sombra de tarjeta, padding `14px 16px`, `min-height:44px`) con el nombre en 14.5px 600, la meta `"34 materias en el plan"` en 11.5px `#6b6375`, y un chevron `›`. El agrupado es un cambio respecto de la lista plana de la web: en mobile ayuda a escanear cuando hay varias carreras por facultad.
- La carrera actual se excluye de la lista. Vacío: tarjeta centrada con `Ninguna carrera coincide con "…".` o "Todavía no hay carreras cargadas."

**Paso 2 — confirmar**
- h1 "¿Cambiar a {nombre}?" en Baloo 2 800 25px, y la universidad debajo en 12.5px `#6b6375`.
- **Bloque de aviso**: radio 18px, padding 16px, título en Baloo 2 700 15px y cuerpo en 13px `line-height:1.5` `#3f3b46`. Tres variantes, según `tieneProgresoCargado(materias)`:
  - Con progreso: "Vas a perder tu progreso" / "Las notas y los puntos que cargaste en tu carrera actual se borran. Esto no se puede deshacer." Fondo `rgba(255,75,75,.08)`, borde `rgba(255,75,75,.35)`, título `#c22a2f`.
  - Sin progreso: "No hay nada que perder" / "Todavía no cargaste notas ni puntos, así que el cambio no borra nada." Fondo `rgba(28,176,246,.08)`, borde `rgba(28,176,246,.3)`, título `#0f7ab0`.
  - Primera vez: "Arrancás de cero" / "Vamos a armar tu plan de estudio con las materias de esta carrera." Mismos colores que la variante info.
- **"LO QUE SE BORRA"** (solo con progreso): tres filas `#fff`, borde `1px solid #e5e4e7`, radio 16px, padding `12px 15px` — "Materias con notas cargadas", "Puntos ganados", "Canjes en el historial" — con el valor a la derecha en Baloo 2 700 15px. Hace concreto el costo del cambio en vez de solo advertirlo.
- **Acciones**: "Sí, cambiar de carrera", `min-height:52px`, radio 15px, Baloo 2 700 16px, texto `#fff`. Con progreso el botón es `#c22a2f` con `box-shadow:0 4px 0 #8f1f23` (destructivo); sin progreso es el violeta normal. Debajo, "Cancelar" en `min-height:48px`, borde `1.5px solid #e5e4e7`, 14px 600 `#6b6375`, que vuelve al paso 1.
- **Al confirmar, el cambio es real**: se carga el plan de la carrera nueva y se limpian notas, puntos, canjes, filtros y el detalle abierto. El repo consigue lo mismo con `window.location.assign('/')` después de `cambiarCarrera`, justamente porque las materias y reglas viejas quedan cacheadas en otros hooks — mantené ese enfoque salvo que refactorices los hooks.

## Hojas inferiores (bottom sheets)

Patrón compartido: overlay `position:absolute; inset:0` con fondo `rgba(43,36,56,.4)` (`.28` para el menú de usuario), contenido pegado abajo con `border-radius:26px 26px 0 0`, fondo `#fff`, y entrada animada `transform: translateY(100%) → 0` en `.22s ease`. Tocar el overlay cierra. Cada hoja tiene un "Cerrar" en 13px `#6b6375` arriba a la derecha.

**Hoja de nota** (padding `20px 18px 34px`, `gap:14px`). Título con el contexto ("Parcial 1 · original", "Parcial 2 · recu 1", "Final · instancia 3") en Baloo 2 700 17px. Línea de ayuda en 12px `#6b6375` que explica la regla vigente: "Se aprueba con 6 o más. Con 8 en el original o el primer recu, promociona." Grilla de 5 columnas, `gap:9px`, con las notas 1 a 10: celda de 52px, radio 14px, Baloo 2 800 20px; nota que aprueba con borde `rgba(88,204,2,.45)` / fondo `rgba(88,204,2,.10)` / texto `#2f7a00`, nota que no aprueba con borde `#e5e4e7` / fondo `#fbfafc` / texto `#6b6375`. Abajo, "Borrar nota": `min-height:44px`, borde `1.5px solid #e5e4e7`, texto 13.5px `#6b6375`. Elegir una nota la guarda y cierra la hoja de inmediato — sin botón de confirmar.

**Hoja de filtro**. Título con el nombre de la categoría. Una fila por opción, `min-height:48px`, radio 14px, con un tilde de 22px a la izquierda: sin marcar, borde `1.5px solid #d8d4dd`; marcado, fondo `#c640c9` con el check en `#fff`. Se puede marcar varias. Abajo, un botón "Ver N materias" en `#c640c9` que cierra la hoja.

**Hoja de canje** (`max-height:78%`, padding `20px 18px 30px`). Reemplaza al `CanjeOrigenSelector` expandible de la web. Encabezado con el nombre del premio en Baloo 2 700 18px y "250 pts · saldo 372" en 12px `#6b6375`. Ayuda: "Tocá las materias en el orden en que querés gastar sus puntos."
- Lista scrolleable de materias con puntos disponibles, ordenadas por nombre. Cada fila: `min-height:44px`, padding `12px 13px`, radio 15px. Sin elegir: borde `1.5px solid #e5e4e7`, fondo `#fff`. Elegida: borde `#c640c9`, fondo `rgba(198,64,201,.08)`.
- A la izquierda, un círculo de 24px con el **número de orden** de tildado (fondo `#c640c9`, texto `#fff`); vacío con borde `1.5px solid #d8d4dd` si no está elegida. Ese orden define de dónde se descuenta primero.
- A la derecha, en 12px `#6b6375`: "240 disp." si no está elegida, o "240 de 250" mostrando cuánto aporta esa materia al canje.
- Resumen en vivo, 12.5px 600: "Cubierto 240 de 250 pts · faltan 10" en `#c22a2f`, o "Cubierto: 250 de 250 pts" en `#2f7a00`.
- Botón de confirmar, `min-height:50px`, radio 15px, Baloo 2 700 16px. Habilitado: fondo `#c640c9`, texto `#fff`, sombra `0 4px 0 #9a329d`, label "Confirmar canje". Deshabilitado: fondo `#f2f0f5`, texto `#a9a4b0`, label "Elegí de dónde salen los puntos".

**Menú de usuario** — no es una hoja inferior sino un popover anclado al avatar: `position:absolute; top:104px; right:14px`, ancho 236px, `#fff`, borde `1px solid #e5e4e7`, radio 20px, `box-shadow:0 12px 32px rgba(43,36,56,.22)`.
- Cabecera: avatar de 38px `#c640c9` con la inicial, nombre en 14px 700 `#2b2438`, email en 11.5px `#6b6375` con elipsis.
- "Cambiar de carrera": `min-height:48px`, padding `0 16px`, 14px `#3f3b46`, borde inferior `1px solid #f2f0f5`. Debe navegar a `CambiarCarrera` (`src/pages/CambiarCarrera.jsx`) — en el prototipo solo cierra el menú, **esa pantalla queda pendiente de diseño**.
- "Cerrar sesión": mismas medidas, texto `#c22a2f`. Llama al `signOut` de `AuthContext`.
- Los iconos de ambas filas son placeholders (cuadrado y círculo de 14px con borde de 2px) — reemplazar por iconos reales.

**Celebración de canje** — overlay a pantalla completa, fondo `rgba(255,255,255,.94)`, centrado, `gap:16px`, padding 40px, texto centrado. Círculo-moneda de 88px `#ffc800` con `inset 0 -7px 0 rgba(224,172,0,.9)` y una animación `pop` de `.4s ease` (`scale .86 → 1.04 → 1`, opacidad 0 → 1). Título "¡Noche de cine!" en Baloo 2 800 24px `#2b2438`; subtítulo "Canjeaste 120 pts. Te quedan 252 disponibles." en 14px `#6b6375`. Botón "Listo" en `#c640c9` con sombra `0 4px 0 #9a329d`. Equivale al `Celebracion.jsx` que ya existe.

## Interactions & Behavior

- **Acceso**: login entra a Materias; registro va a la selección de carrera, que es bloqueante hasta elegir una. "Cerrar sesión" desde el menú de usuario vuelve al login.
- **Historial**: la cabecera abre la lista; cada canje abre su detalle de origen. Abrir un canje cierra el anterior.
- **Cambiar de carrera**: menú de usuario → elegir → confirmar. Cancelar en el paso 2 vuelve a la lista; confirmar reinicia todo con el plan nuevo.
- **Navegación**: tabs abajo entre Materias / Progreso / Premios. Materias → detalle de materia, y "‹ Materias" vuelve. Cambiar de tab resetea el detalle abierto. En el codebase, mantener las rutas de React Router que ya existen.
- **Cargar una nota**: tocar chip → hoja de notas → tocar la nota → se guarda y la hoja cierra. Todo lo dependiente se recalcula al instante: estado del parcial, badge de la materia, puntos de la materia, saldo del header, barra de avance del año, disponibles en el canje. Sin botón de guardar.
- **Filtrar**: tocar chip → hoja → tildar → "Ver N materias". Los años que quedan sin materias visibles se ocultan; el conteo del encabezado pasa a "N de M materias". "Limpiar" resetea las tres categorías a `FILTROS_VACIOS`.
- **Agregar materia / premio**: botón primario arriba de la lista → hoja → los campos se editan sobre un borrador local, y solo al confirmar se agrega. El submit queda deshabilitado (gris, no clickeable) hasta que estén los campos obligatorios. Cerrar descarta el borrador.
- **Editar materia**: botón en el detalle → hoja → todo se aplica en vivo, sin guardar. "Listo" solo cierra. Cambiar horas, parciales o reglas recalcula puntos y saldo al instante; achicar la cantidad de parciales o recuperatorios descarta las notas que quedan fuera.
- **Nota final de la materia**: se elige tocando una celda de la grilla en el detalle, y "Sin nota" la limpia. No afecta los puntos.
- **Colapsar años**: tocar la cabecera. Es estado local de UI; conviene conservarlo al ir y volver del detalle.
- **Canjear**: botón de costo → hoja de canje → tildar materias en orden → confirmar → overlay de celebración → "Listo". El canje se agrega al historial con el detalle de cuántos puntos salieron de cada materia.
- **Estados de presionado**: los botones con sombra sólida bajan `translateY(2–3px)` y reducen la sombra a `0 1px 0`. No hay hover — es táctil.
- **Transiciones**: hojas `translateY .22s ease`; chevron `transform .2s ease`; barra de avance `width .3s ease`; celebración `pop .4s ease`. Nada más se anima.
- **Deshabilitado**: un premio que no se puede pagar no es clickeable y se muestra en gris (`#a9a4b0` sobre transparente, sin sombra). Mismo criterio para el botón de confirmar mientras el costo no esté cubierto.

## State Management

Estado que necesita la vista mobile (el resto vive en los hooks y contexts que ya existen: `useMaterias`, `usePremios`, `useCanjes`, `PerfilContext`, `AuthContext`):

- `screen` — tab activo: `materias` | `progreso` | `premios`, más `detalle`.
- `detalleId` — id de la materia abierta, o null.
- `aniosAbiertos` — set/mapa de años colapsados.
- `filtros` — `{ anios: [], rangosHoras: [], estados: [] }`, forma de `FILTROS_VACIOS`.
- `filtroSheet` — qué categoría de filtro está abierta, o null.
- `notaSheet` — `{ materiaId, tipo: 'parcial' | 'final', parcialIdx, instanciaIdx }`, o null.
- `canjeSheet` — id del premio en curso, o null.
- `ordenOrigen` — array ordenado de ids de materia elegidos en la hoja de canje. El orden importa: define el descuento. Se limpia al cerrar.
- `editarSheet` — id de la materia que se está editando, o null.
- `nuevaMateriaSheet` — borrador de la materia nueva (`{ nombre, anio, horas, parciales, recus, finales, noSuma }`), o null.
- `nuevoPremioSheet` — borrador del premio nuevo (`{ nombre, cat, costo, catsAbierto }`), o null. `catsAbierto` es el estado del acordeón de categorías.
- `celebracion` — `{ nombre, costo }` tras confirmar, o null.
- `menuUsuario` — booleano.
- `histAbierto` — booleano, el acordeón del historial. `histItem` — id del canje expandido, o null (uno a la vez).
- `authModo` — `'login' | 'signup'`. `authEmail`, `authPass`, `authVer` (mostrar contraseña), `authAviso` — `{ tipo: 'error' | 'info', texto }` o null.
- `carreraBusqueda` — texto del buscador. `carreraElegida` — id de la carrera en confirmación, o null (null = paso 1, con valor = paso 2).

Derivados, siempre calculados con los utils del repo, nunca guardados: estado de cada materia, puntos por materia, disponibles por materia, ganados, canjeados, saldo, y la lista filtrada.

Por materia, además de lo que ya modela el repo: `noSuma` (booleano, el `poolOverride: 0` del repo), `reglas` (objeto de overrides con `aprob`, `promo`, `permite` — solo las claves tocadas), `tick` (`'promocion' | 'firma' | null`) y `notaFinal` (número o null).

Solo una capa modal a la vez. Z-index del prototipo: menú 34, hoja de editar 33, hoja de canje 32, hoja de nota/filtro 30, celebración 40.

## Design Tokens

Todos ya existen en `src/index.css` — usar las variables, no los hex sueltos.

**Colores**
| Uso | Valor |
| --- | --- |
| Texto | `#3f3b46` |
| Texto fuerte / títulos | `#2b2438` |
| Texto atenuado | `#6b6375` |
| Texto deshabilitado | `#a9a4b0` |
| Fondo | `#ffffff` |
| Fondo suave (pantalla) | `#f6f7fb` |
| Fondo de chip vacío | `#fbfafc` |
| Borde | `#e5e4e7` |
| Borde interno / divisor | `#f2f0f5` |
| Riel de barra | `#eeecf1` |
| Chevron inactivo | `#c3bfc9` |
| Acento (primario) | `#c640c9` |
| Acento oscuro (sombra, marca) | `#9a329d` |
| Acento suave (fondo) | `rgba(198,64,201,.14)` / `.10` / `.08` |
| Moneda | `#ffc800`, sombra interna `rgba(224,172,0,.9)` |
| Éxito (texto) | `#2f7a00` |
| Éxito (fondo / borde) | `rgba(88,204,2,.18)` / `.14` / `.10`, borde `rgba(88,204,2,.5)` |
| Error (texto) | `#c22a2f` |
| Error (fondo / borde) | `rgba(255,75,75,.16)` / `.12`, borde `rgba(255,75,75,.45)` |
| Info (firma) | texto `#0f7ab0`, fondo `rgba(28,176,246,.18)` |
| Advertencia (cursando) | texto `#a66a00`, fondo `rgba(255,200,0,.22)` |

**Tipografía**. Títulos, números y botones en **Baloo 2** (500/600/700/800), la misma del repo. Texto de interfaz en la stack del sistema (`system-ui, 'Segoe UI', Roboto, sans-serif`).

Escala: 40px/800 saldo grande · 28px/800 puntos de materia · 27px/800 h1 · 25px/800 título de detalle · 21px/700 métrica · 19–20px/800 nota en chip · 17–18px/700 título de tarjeta o hoja · 16px/700 botón · 14.5px/600 nombre de materia · 14px/600–700 fila · 13.5px/600 botón secundario · 12px/400 meta · 11px/600 label de sección (mayúsculas, `letter-spacing:.08em`) · 10.5px/700 badge · 10px/400 label de chip.

Nada por debajo de 10px. Los targets táctiles nunca bajan de 44px: filas de menú, hojas y toggles usan `min-height:44px` o más.

**Espaciado**: 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 26, 28px. Padding lateral de pantalla 16px. Gap entre secciones 16–18px, entre tarjetas 10–11px.

**Radios**: 999px píldoras y avatares · 26px hojas (arriba) · 20px popover y tarjeta de saldo · 18px tarjetas · 16px tarjetas chicas · 15px filas de canje y botón de hoja · 14px celdas de nota, tabs, botones · 13px chips de nota y toggles · 12px botón de costo · 6px barra de avance · 4–5px iconos placeholder.

**Sombras**: tarjeta `0 3px 12px rgba(43,36,56,.08)` · popover `0 12px 32px rgba(43,36,56,.22)` · botón primario `0 4px 0 #9a329d` (presionado `0 1px 0`) · avatar `0 3px 0 #9a329d` · moneda `inset 0 -Npx 0 rgba(224,172,0,.9)` con N = 2/4/7 según tamaño.

## Assets
Ninguno propio. El diseño no usa imágenes ni SVGs: la moneda es un círculo con sombra interna y los iconos de tabs y menú son **placeholders geométricos** que hay que reemplazar por el set de iconos que elija el proyecto (el repo hoy tampoco tiene librería de iconos). Baloo 2 se carga desde Google Fonts, igual que en el repo. El favicon existente es `public/favicon.svg`.

## Screenshots
En `screenshots/` están las capturas del prototipo, a 2x sobre un marco de iPhone de 402×874:

| Archivo | Qué muestra |
| --- | --- |
| `01-materias.png` | Materias con la barra de filtros y los años colapsables |
| `02-detalle-materia.png` | Detalle: botón Editar materia, puntos, parciales con chips |
| `03-nota-final.png` | Detalle scrolleado: final y la grilla de nota final de la materia |
| `04-editar-materia.png` | Hoja de editar: nombre, steppers, permite promoción, notas |
| `05-editar-forzar.png` | Hoja de editar scrolleada: notas de aprobación/promoción y forzar resultado |
| `06-nueva-materia.png` | Hoja de nueva materia |
| `07-nuevo-premio.png` | Hoja de nuevo premio con el acordeón de categorías abierto |
| `08-hoja-nota.png` | Hoja inferior para cargar la nota de un parcial |
| `09-progreso.png` | Progreso: saldo, ganados/canjeados y origen de los puntos |
| `10-premios.png` | Premios por categoría e historial |
| `11-hoja-canje.png` | Hoja de canje con selección de origen y cobertura en vivo |
| `12-menu-usuario.png` | Menú de usuario anclado al avatar |

Las tres pantallas más nuevas (historial acordeón, login/registro y cambiar de carrera) todavía no tienen captura: abrí `Unipoints Mobile.dc.html` para verlas — al login se llega con "Cerrar sesión" desde el avatar.

Son capturas con datos de ejemplo. Las medidas y colores exactos están en las secciones de arriba — no los midas sobre la imagen.

## Files
- `Unipoints Mobile.dc.html` — el prototipo completo, con las cuatro pantallas, las hojas y toda la lógica de demo. Abrilo en el navegador para ver el comportamiento.
- `ios-frame.jsx` — marco de iPhone del prototipo (status bar y home indicator). Es andamiaje de la herramienta de diseño, **no** parte del diseño: sirve solo para ver las medidas reales y los safe areas.
- `support.js` — runtime de la herramienta de diseño. Ignorar.

Referencias en el repo: `docs/SPEC.md` para el modelo, `src/index.css` para los tokens, `src/pages/*.css` y `src/components/*.css` para los estilos actuales, y los utils listados más arriba para la lógica.

## Pendiente de diseño
- **Estados vacíos** de primera vez: sin materias, sin premios, sin canjes.
- **Recuperar contraseña**: hoy solo muestra el aviso; falta la pantalla de "revisá tu mail" y la de nueva contraseña.
- **Confirmación de email** después del registro (el signup sin sesión de Supabase).
