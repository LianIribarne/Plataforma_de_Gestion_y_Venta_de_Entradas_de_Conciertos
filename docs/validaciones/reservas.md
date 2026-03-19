# Validaciones de Reserva

Este documento describe las validaciones de datos y reglas de acceso aplicadas en los endpoints relacionados con reservas dentro de la API.

- Los clientes son los unicos que pueden realizar reservas.
- Un cliente solo puede tener una reserva activa a la vez.

La reserva permite al cliente seleccionar y bloquear temporalmente entradas para un concierto antes de realizar el pago.

#### Liberación de entradas

Cuando una entrada deja de estar asociada a una reserva (por expiración, cancelación o eliminación):

- la entrada se libera y vuelve al estado disponible
- si el tipo de entrada asociado fue cancelado previamente, la entrada pasa al estado cancelado
- se restablece el precio definido para su tipo de entrada

## Crear reserva

Para crear una reserva deben cumplirse las siguientes condiciones:

- El cliente debe reservar al menos 1 tipo de entrada y como máximo 4 tipos diferentes de entradas para el concierto.
- Para cada tipo de entrada, la cantidad reservada debe ser mínimo 1 y máximo el límite de reserva definido para ese tipo de entrada.
- No se pueden mezclar tipos de entrada de diferentes conciertos dentro de una misma reserva.
- El concierto debe encontrarse en estado programado.
- La cantidad total de entradas reservadas no puede superar el límite máximo de reserva definido para el concierto.
- El cliente no puede tener otra reserva activa al momento de crear una nueva reserva.
- Solo se pueden reservar entradas si existe disponibilidad suficiente según la cantidad solicitada.
- No se puede incluir el mismo tipo de entrada más de una vez en una reserva.

Al crearse una reserva, las entradas pasan de estado disponible a reservado.
Simultáneamente, se programa una tarea asíncrona que establece un tiempo de expiración dinámico desde su creación, definido como el menor entre 15 minutos y el tiempo restante hasta el inicio del concierto.

Si la reserva no es confirmada mediante el pago dentro de ese período:

- se aplica la lógica de liberación de entradas

## Cancelar reserva

- El cliente solo puede cancelar su propia reserva activa.
- Si el cliente no tiene una reserva activa, no puede cancelar una reserva.

Al cancelarse la reserva:

- se aplica la lógica de liberación de entradas

## Quitar entrada de la reserva

- El cliente debe especificar el tipo de entrada del cual desea eliminar una unidad.
- El cliente debe tener una reserva activa.
- El tipo de entrada especificado debe tener al menos una entrada reservada dentro de la reserva.
- Solo se puede eliminar una entrada por operación.

Al quitarse una entrada de la reserva:

- se aplica la lógica de liberación de entradas
- si la entrada era la última de la reserva, la reserva se cancela automáticamente
