# Modelo de Materias, Parciales, Puntos y Premios — facu_puntos

## Estructura general
- Cada materia tiene una cantidad configurable de parciales (default: 2).
- Cada parcial tiene una cantidad configurable de instancias de recuperatorio (default: 2).
- Nota mínima de aprobación de un parcial: **6** (fija, no configurable). De 1 a 5 no se aprueba esa instancia.
- Filosofía general del proyecto: nada queda fijo salvo excepciones explícitas (como el 6 y el 8) — todo tiene un valor por default pero se puede ajustar.

## Resultado de la cursada (por materia)
- **Promoción**: se logra si un parcial tiene 8+ en su instancia original, Y el otro parcial llega a 8+ como máximo en su **primer** recuperatorio. Si ese segundo parcial necesitó el segundo recuperatorio para llegar a 8+, no promociona por default (salvo tick manual).
- **Firma**: todos los parciales llegan a 6+ (en cualquiera de sus instancias, incluyendo recuperatorios) pero no se cumple la condición de promoción.
- **Recursada**: algún parcial no llega a 6+ en ninguna de sus instancias (agotando el original + todos los recuperatorios), o se agotan las instancias del final sin aprobarlo (ver abajo).

## Nota de la materia
- Si promocionó: nota = notas de los parciales o su promedio (editable a mano, porque los profesores ponen la nota que quieren).
- Si firmó y luego aprobó el final: nota = nota del final.
- Si recursa: la nota no importa / no aplica.

## Final (solo si firmaste)
- Cantidad de instancias configurable (default: 4).
- Se aprueba con 6+.
- Si se agotan todas las instancias sin aprobar, la materia pasa a "recursar".

## Overrides manuales
- Todas las notas son editables a mano en cualquier momento (por las dudas / criterio del profesor).
- Existe un "tick" manual independiente de la nota, que permite forzar el resultado (promocionó / aprobó parcial / firmó) para casos especiales donde el profesor decide por fuera de la regla estándar (ej: promoción sin cumplir el patrón 8+ original / 8+ primer recu, o aprobación de un parcial con menos de 6).

## Sistema de Puntos
- Cada materia tiene un **pool de puntos base**, calculado como **1 punto por cada hora cátedra** de la materia según el plan de estudio (relación 1 a 1). Ese multiplicador (hoy 1) queda como una constante global configurable, ajustable a mano.
- El pool también se puede **pisar a mano por materia individual** (útil para materias que se sienten más difíciles de lo que sus horas sugieren — ver sección de Niveles, donde se decidió no usar un bonus separado sino este mismo override).
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

## Niveles de materias
- Cada materia pertenece a un **nivel** (default: 3 niveles), calculado automáticamente dividiendo en tercios el rango de puntos/horas de las materias ya cargadas (de la más chica a la más grande).
- El nivel es **editable a mano por materia individual** sin que eso dispare un recálculo general de todos los niveles.
- Si en el futuro aparece una materia que rompe mucho el rango existente, se carga/ajusta a mano en vez de recalcular todo el sistema automáticamente (caso poco frecuente, 1 o 2 veces en toda la carrera).
- **Decisión importante**: el nivel es una **etiqueta de referencia** (para ubicarse visualmente, filtrar materias, y calibrar el valor de los premios nuevos — ej. "materia nivel 1 da entre 64 y 96 pts, nivel 2 entre 97 y 144, nivel 3 entre 145 y 200"). El nivel **no otorga puntos extra por sí solo** — si una materia se siente más difícil de lo que sus horas indican, se resuelve pisando el pool de esa materia a mano (ver Sistema de Puntos), no con un bonus de nivel aparte, para no tener dos mecanismos distintos compitiendo por representar lo mismo.

## Organización: año de cursada
- Cada materia tiene un **año de cursada** fijo, que es el año que sugiere el plan de estudio (1er año, 2do año, etc.) — no el año calendario real en que se cursó.
- Además se registran **año de aprobación** y **año de firmada** como datos reales (la fecha efectiva en que el usuario aprobó o firmó esa materia), independientes del año sugerido por el plan.

## Filtros
- Filtros disponibles: por **año de cursada** (del plan), por **horas cátedra**, por **nivel**, y por **estado** (aprobada / firmada / cursando / pendiente — no se incluye "recursando" como filtro aparte).
- Los filtros se pueden **combinar entre sí** (ej. "2do año + nivel 3 + pendiente" al mismo tiempo).

## Catálogo de premios
- La app viene con **5-6 premios de ejemplo precargados** (genéricos, con un valor sugerido) para resolver el problema de la "hoja en blanco", pero son **100% editables y borrables** desde el primer momento.
- El usuario puede agregar sus propios premios libremente, poniendo el valor en puntos que considere.
- Los premios son **repetibles**: se pueden canjear las veces que se quiera mientras haya puntos suficientes (no son de un solo uso).
- Los premios se organizan en **categorías** (ej. comida, ocio, compras, descanso), pensado para cuando la lista crezca (puede llegar a 100+ premios con el tiempo).
- Al crear un premio nuevo, la app muestra como referencia los rangos de puntos por nivel de materia (ver sección Niveles) para ayudar a calibrar el valor del premio.

## Plataforma: mobile vs. escritorio
- **Decisión**: web app responsiva (adaptable a celular y computadora desde un mismo proyecto), con posibilidad de convertirse en PWA (instalable en el celular con ícono propio, sin barra de navegador).
- Razón: hay dos momentos de uso bien distintos — carga pesada inicial del plan de estudio (más cómoda en computadora) y check-ins rápidos del día a día tras rendir un parcial/final (más cómodos en celular). Una web responsiva cubre ambos sin duplicar el desarrollo.
- **A futuro** (no ahora): se puede empaquetar para tiendas de apps sin reescribir el proyecto — Google Play es directo (Trusted Web Activity vía Bubblewrap o PWABuilder); Apple App Store requiere más trabajo (Apple exige funcionalidad nativa real además del wrapper, vía guideline 4.2 "Minimum Functionality" — se resuelve con una herramienta como Capacitor).
- **Para arrancar**: mantenerlo simple — enfocarse primero en la web app responsiva funcionando bien, sin preocuparse todavía por PWA ni por las tiendas de apps. Eso queda para una etapa posterior.
