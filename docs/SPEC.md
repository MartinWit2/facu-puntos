# Modelo de Materias, Parciales, Puntos y Premios — facu_puntos

## Estructura general
- Cada materia tiene una cantidad configurable de parciales (default: 2).
- Cada parcial tiene una cantidad configurable de instancias de recuperatorio (default: 2).
- Nota mínima de aprobación de un parcial: **6 por default**, pero es un valor de la **carrera** del usuario (columna `nota_aprobacion` en `carreras`), no una constante fija de la app — carreras distintas pueden tener otro criterio. De 1 a 5 no se aprueba esa instancia. También se puede pisar puntualmente por materia (ver "Carreras y facultades").
- Filosofía general del proyecto: nada queda fijo salvo excepciones explícitas — todo tiene un valor por default (hoy 6/8, heredados de UTN) pero se puede ajustar, ya sea por carrera o por materia puntual.

## Resultado de la cursada (por materia)
- **Pendiente**: la materia todavía no tiene ningún parcial cargado y el usuario no la marcó manualmente como "empezada". Es el estado inicial de toda materia nueva (tanto al clonar el plan de estudio de una carrera como al cargarla a mano).
- **Cursando**: el usuario marcó manualmente que empezó a cursar la materia (botón "Empezar a cursar" / "Volver a pendiente" en Materias y en el detalle de la materia), pero todavía no se cumple ninguna condición de promoción, firma o recursada. Este cambio es **manual y bidireccional**: nunca se dispara solo porque se carga una nota de un parcial, y se puede deshacer si se marcó por error. Es la única distinción manual entre estados que no está ya cubierta por el "tick" de promoción/firma descrito más abajo.
- **Promoción**: se logra si un parcial tiene la nota de promoción de la carrera (8+ por default) en su instancia original, Y el otro parcial llega a esa misma nota como máximo en su **primer** recuperatorio. Si ese segundo parcial necesitó el segundo recuperatorio para llegarla, no promociona por default (salvo tick manual).
  - Generalización a materias con 3+ parciales (configurable): promociona si **todos** los parciales llegan a la nota de promoción, y **ninguno** necesitó más que el primer recuperatorio para lograrlo.
  - Si la carrera tiene `permite_promocion = false`, ninguna materia de esa carrera promociona automáticamente por notas — van directo al camino de firma + final (el tick manual de promoción tampoco debería usarse en ese caso, aunque técnicamente siga existiendo el campo).
- **Firma**: todos los parciales llegan a la nota de aprobación de la carrera (6+ por default, en cualquiera de sus instancias, incluyendo recuperatorios) pero no se cumple la condición de promoción.
- **Recursada**: algún parcial no llega a la nota de aprobación en ninguna de sus instancias (agotando el original + todos los recuperatorios), o se agotan las instancias del final sin aprobarlo (ver abajo).

## Nota de la materia
- Si promocionó: nota = notas de los parciales o su promedio (editable a mano, porque los profesores ponen la nota que quieren).
- Si firmó y luego aprobó el final: nota = nota del final.
- Si recursa: la nota no importa / no aplica.

## Final (solo si firmaste)
- Cantidad de instancias configurable (default: 4).
- Se aprueba con la nota de aprobación de la carrera (6+ por default), igual que un parcial.
- Si se agotan todas las instancias sin aprobar, la materia pasa a "recursar".

## Overrides manuales
- Todas las notas son editables a mano en cualquier momento (por las dudas / criterio del profesor).
- Existe un "tick" manual independiente de la nota, a nivel de toda la cursada (no por parcial individual), que permite forzar el resultado de la cursada (promocionó / firmó) para casos especiales donde el profesor decide por fuera de la regla estándar (ej: promoción sin cumplir el patrón 8+ original / 8+ primer recu).

## Sistema de Puntos
- Cada materia tiene un **pool de puntos base**, calculado como horas cátedra × el multiplicador `puntos_por_hora` de la **carrera** del usuario (default 1, o sea 1 punto por hora cátedra). Ya no es una constante global de la app: cada carrera puede tener su propio multiplicador.
- El pool también se puede **pisar a mano por materia individual** (útil para materias que se sienten más difíciles de lo que sus horas sugieren).
- Fórmula validada con ejemplos reales (asumiendo 2 parciales, el default):

  | Materia | Horas cátedra | Pool | Punto x parcial | Total si promocionás (+50%) | Total si aprobás por final (+25%) |
  |---|---|---|---|---|---|
  | Inglés / Ingeniería en Sociedad | 64 | 64 | 32 | 96 | 80 |
  | Sistemas Operativos | 128 | 128 | 64 | 192 | 160 |
  | Sintaxis | 128 | 128 | 64 | 192 | 160 |
  | AM2 | 160 | 160 | 80 | 240 | 200 |

- El pool se reparte en **partes iguales** entre la cantidad de parciales de la materia.
- Aprobar cada parcial —sin importar si fue en la instancia original o en cualquier recuperatorio— otorga su parte proporcional del pool. Todas las instancias valen lo mismo (no hay penalización por haber necesitado recuperatorio).
- Al aprobar la materia completa se suma un **bonus** extra sobre el pool:
  - +50% del pool si fue por **promoción**.
  - +25% del pool si fue por **firma + final aprobado** (mismo valor sin importar en qué instancia del final se aprobó).
- El bonus se aplica igual si el resultado (promocionó/firmó) se logró por la regla automática de notas o por el tick manual.

## Recursada y puntos
- Si una materia se recursa, se **descuenta** todo lo que ya se había cobrado de ella. El saldo total de puntos del usuario puede quedar en **negativo**.
- Al volver a cursar esa materia, se puede volver a cobrar todo de cero con normalidad (parciales + bonus).
- Los **premios ya canjeados no se ven afectados** por un saldo negativo posterior — "lo canjeado, canjeado está". El saldo negativo solo bloquea poder canjear premios nuevos hasta volver a positivo.

## Carreras y facultades (Fase 2)
- La app soporta **múltiples carreras/facultades**, no una sola implícita. Cada usuario tiene un **perfil** que indica a qué carrera pertenece (puede estar sin elegir todavía).
- Cada carrera define sus propios **defaults**: nota de aprobación, nota de promoción, si permite promoción sin final (`permite_promocion`), y el multiplicador de puntos por hora cátedra. Estos valores viven en la carrera, no son globales de la app.
- Cualquiera de esos defaults se puede **pisar puntualmente por materia** (igual criterio que el override de pool): si el override es null, se usa el valor de la carrera; si tiene un valor, ese pisa al de la carrera para esa materia en particular.
- Existe un **catálogo de materias por carrera** (el "plan de estudio" de referencia, compartido entre todos los usuarios de esa carrera). El usuario clona una materia del catálogo hacia su propio progreso para empezar a cursarla. Si el catálogo no tiene las horas cátedra de esa materia (falta el dato para esa carrera), el usuario las completa él mismo al clonarla — hasta que las carga, no se puede calcular el pool de puntos de esa materia, pero eso no bloquea guardarla, solo avisa que falta el dato.

## Organización: año de cursada
- Cada materia tiene un **año de cursada** fijo, que es el año que sugiere el plan de estudio (1er año, 2do año, etc.) — no el año calendario real en que se cursó.
- Además se registran **año de aprobación** y **año de firmada** como datos reales (la fecha efectiva en que el usuario aprobó o firmó esa materia), independientes del año sugerido por el plan.

## Filtros
- Filtros disponibles: por **año de cursada** (del plan), por **horas cátedra**, y por **estado** (aprobada / firmada / cursando / pendiente — no se incluye "recursando" como filtro aparte). No hay filtro por nivel (concepto sacado de la app, ver más abajo).
  - Mapeo de los 6 estados reales de la cursada a estas 4 opciones: "Aprobada" incluye tanto **promocionó** como **aprobó por final** (ambas significan que la materia está terminada, solo por caminos distintos); "Firmada" = firmó con final pendiente; "Cursando" = cursando; "Pendiente" agrupa tanto **pendiente** (sin empezar) como **recursa** (una materia en "Recursa" cuenta como "Pendiente" para este filtro, aunque su tarjeta siga mostrando el badge real de "Recursa").
- La pantalla de Materias agrupa las materias por año de cursada en secciones colapsables (acordeón): al entrar, todos los años arrancan cerrados (se ve solo el nombre del año y la cantidad de materias) y se despliegan al hacer clic. Varios años pueden estar abiertos a la vez. El estado de qué años están abiertos no se persiste entre sesiones.
  - El filtro de horas cátedra es por **rango fijo** (menor a 100 / entre 100 y 159 / 160 o más), no por selección de valores exactos cargados.
- Dentro de cada filtro se pueden **seleccionar varias opciones a la vez** (ej. "1er año" + "2do año" combinan por OR entre sí). Los distintos filtros se combinan entre sí por **AND** (ej. "2do año + pendiente" al mismo tiempo).

## Niveles de materias (descartado)
- Se evaluó un concepto de "nivel" de materia (1/2/3 según el pool de puntos, con badge visual, filtro propio, y referencia para calibrar premios). Se decidió **sacarlo de la app por completo**: no aportaba lo suficiente frente a la complejidad de mantenerlo, más aún ahora que el pool varía por carrera. Si hace falta calibrar el costo de un premio, alcanza con ver el rango de puntos (mínimo/máximo) entre las materias ya cargadas — sin necesidad de una etiqueta de nivel aparte.

## Catálogo de premios
- La app viene con **5-6 premios de ejemplo precargados** (genéricos, con un valor sugerido) para resolver el problema de la "hoja en blanco", pero son **100% editables y borrables** desde el primer momento.
- El usuario puede agregar sus propios premios libremente, poniendo el valor en puntos que considere.
- Los premios son **repetibles**: se pueden canjear las veces que se quiera mientras haya puntos suficientes (no son de un solo uso).
- Los premios se organizan en **categorías** (ej. comida, ocio, compras, descanso), pensado para cuando la lista crezca (puede llegar a 100+ premios con el tiempo).
- Al crear un premio nuevo, la app muestra como referencia el rango de puntos (mínimo y máximo) entre las materias que el usuario ya tiene cargadas, para ayudar a calibrar el valor del premio.

## Plataforma: mobile vs. escritorio
- **Decisión**: web app responsiva (adaptable a celular y computadora desde un mismo proyecto), con posibilidad de convertirse en PWA (instalable en el celular con ícono propio, sin barra de navegador).
- Razón: hay dos momentos de uso bien distintos — carga pesada inicial del plan de estudio (más cómoda en computadora) y check-ins rápidos del día a día tras rendir un parcial/final (más cómodos en celular). Una web responsiva cubre ambos sin duplicar el desarrollo.
- **A futuro** (no ahora): se puede empaquetar para tiendas de apps sin reescribir el proyecto — Google Play es directo (Trusted Web Activity vía Bubblewrap o PWABuilder); Apple App Store requiere más trabajo (Apple exige funcionalidad nativa real además del wrapper, vía guideline 4.2 "Minimum Functionality" — se resuelve con una herramienta como Capacitor).
- **Para arrancar**: mantenerlo simple — enfocarse primero en la web app responsiva funcionando bien, sin preocuparse todavía por PWA ni por las tiendas de apps. Eso queda para una etapa posterior.
