# Procesos asíncronos del sistema

## iniciar_concierto

Se ejecuta cuando llega fecha_inicio.

1. Bloquea el concierto (select_for_update)
2. Ignora si la task es vieja (control con task_id)
3. No hace nada si:
   - ya terminó
   - no está en estado válido
4. Cambia estado a en_curso
5. Cancela todas las reservas activas:
   - cancela su tarea async (revoke)
   - libera la reserva (liberar_reserva)

Cuando empieza el concierto no puede haber reservas activas.

**Directorio:** `src\backend\conciertos\tasks.py`

## finalizar_concierto

Se ejecuta cuando llega fecha_fin.

1. Bloqueo del concierto
2. Ignora si la task es vieja
3. Valida estado
4. Cambia estado a finalizado
5. Cancela reservas activas

Cuando termina todo queda cerrado y limpio.

**Directorio:** `src\backend\conciertos\tasks.py`

## expirar_reserva

Esta tarea se encarga de expirar automáticamente una reserva cuando se cumple su tiempo límite.

1. Obtener la reserva
2. Validar que la task sea válida
3. Verificar si realmente ya venció
4. Expirar reserva (liberar_reserva)
5. Sincronizar el estado del concierto

**Directorio:** `src\backend\entradas\tasks.py`

## sync_conciertos.py

Este comando se ejecuta al iniciar el proyecto para reprogramar todas las tareas pendientes.

Esto es necesario porque, si el sistema se detiene, las tareas programadas en memoria pueden perderse.
Al reiniciar, el comando vuelve a agendar automáticamente las tareas de conciertos y reservas en función de sus fechas.

**Directorio:** `src\backend\conciertos\management\commands\sync_conciertos.py`

#### Funcionalidad

El comando realiza las siguientes acciones:

- recorre todos los conciertos
- agenda automáticamente tareas asíncronas utilizando Celery

#### Para cada concierto

- agenda `iniciar_concierto` en la fecha de inicio (`fecha_inicio`)
- agenda `finalizar_concierto` en la fecha de finalización (`fecha_fin`)

#### Para cada reserva activa

- agenda `expirar_reserva` en el tiempo límite de la reserva (`reservar_hasta`)
