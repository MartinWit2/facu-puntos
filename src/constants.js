export const DEFAULT_CANTIDAD_PARCIALES = 2
export const DEFAULT_CANTIDAD_RECUPERATORIOS = 2
export const DEFAULT_CANTIDAD_INSTANCIAS_FINAL = 4

// Mismos defaults que la columna de `carreras` en la base (ver migración
// 0001) — se usan para precargar el formulario de reglas propias de quien
// arranca (o cambia a) sin una carrera fija.
export const DEFAULT_NOTA_APROBACION = 6
export const DEFAULT_NOTA_PROMOCION = 8
export const DEFAULT_PERMITE_PROMOCION = true
export const DEFAULT_PROMOCION_POR_PROMEDIO = false
export const DEFAULT_PUNTOS_POR_HORA = 1

// Cortes de los rangos del filtro de horas cátedra en la pantalla de
// Materias. Default, ajustables acá si hiciera falta cambiar los rangos.
export const RANGO_HORAS_UMBRAL_1 = 100 // horas < este valor => rango "bajo"
export const RANGO_HORAS_UMBRAL_2 = 160 // horas >= este valor => rango "alto" (entre medio => "medio")

// Ventanas de los recordatorios de notificaciones push (sección "4.3" del
// prompt de notificaciones, ajustada por el parche de "parcial/final
// próximo") — usadas por la Edge Function enviar-recordatorios, no por el
// frontend. De mayor a menor: cada umbral es un aviso independiente,
// trackeado por separado en notificaciones_enviadas.
export const RECORDATORIOS_PROXIMO_DIAS_ANTES = [14, 7, 1] // avisar cuando faltan <= N días para la fecha, uno por umbral
export const RECORDATORIO_NOTA_PENDIENTE_DIAS = 7 // primer aviso N días después de pasada la fecha; se repite cada N días
