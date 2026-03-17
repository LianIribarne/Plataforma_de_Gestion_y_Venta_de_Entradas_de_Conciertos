# Validaciones de Concierto

Este documento describe las validaciones de datos y reglas de acceso aplicadas en los endpoints relacionados con conciertos dentro de la API.

- Un concierto puede tener como máximo 4 tipos de entrada activos.
- No se permiten tipos de entrada activos con nombres duplicados dentro del mismo concierto.
- El estado del concierto se actualiza automáticamente en función del stock disponible de entradas activas.
- Si no quedan entradas disponibles en ningún tipo activo, el concierto pasa a estado agotado.
- Si vuelven a existir entradas disponibles y el estado era agotado, el concierto vuelve a programado.
- El estado no se modifica automáticamente si el concierto está en:
  - Borrador
  - En curso
  - Cancelado
  - Finalizado

## Permisos de acceso

#### Cliente

- Un cliente puede ver todos los conciertos que se encuentren en estado programado, en curso, finalizado o cancelado.

#### Organizador

- Un organizador puede crear sus propios conciertos.
- Un organizador puede ver sus propios conciertos.
- Un organizador puede modificar sus propios conciertos.
- Un organizador puede cancelar sus propios conciertos.

#### Administrador

- Un administrador puede ver todos los conciertos del sistema.
- Un administrador puede modificar cualquier concierto del sistema.
- Un administrador puede cancelar cualquier concierto del sistema.

## Crear concierto

Para crear un concierto deben cumplirse las siguientes condiciones:

- La fecha del concierto debe ser futura al momento de su creación.
- Solo se pueden asociar lugares, artistas y moods que se encuentren en estado activo.
- El concierto debe tener al menos 1 tipo de entrada y como máximo 4 tipos de entrada.
- No se pueden repetir los nombres de los tipos de entrada dentro del mismo concierto.
- El límite de reserva total del concierto no puede ser menor que el límite de reserva definido para cualquiera de los tipos de entrada.
- La imagen del concierto no es obligatoria. Si no se proporciona una imagen, se asignará automáticamente la imagen asociada al artista.

Cuando se crea un concierto, también se crean automáticamente sus tipos de entrada y las entradas correspondientes.
El concierto se crea inicialmente en estado borrador.

## Modificar concierto

- Solo se puede modificar si su estado se encuentra en borrador, programado o agotado.
- Si el concierto tiene entradas vendidas, se restringe la modificacion de:
  - la fecha
  - el horario
  - el lugar
  - el artista
- La fecha del concierto debe ser futura al momento de su creación.
- El límite de reserva total del concierto no puede ser menor que el límite de reserva definido para cualquiera de los tipos de entrada.
- Solo se pueden asociar lugares, artistas y moods que se encuentren en estado activo.

## Cancelar concierto

- Solo se puede cancelar el concierto si su estado se encuentra en borrador, programado o agotado.

Cuando un concierto se cancela, también se cancelan automáticamente:

- sus tipos de entrada
- todas las entradas asociadas (disponibles, reservadas y vendidas)
- todas las reservas realizadas

## Sincronización de estado del concierto

Luego de cualquier operación que afecte la disponibilidad de entradas:

- creación de una reserva
- cancelación de una reserva
- liberación de entradas

se recalcula automáticamente el estado del concierto en función de la disponibilidad actual de entradas.
