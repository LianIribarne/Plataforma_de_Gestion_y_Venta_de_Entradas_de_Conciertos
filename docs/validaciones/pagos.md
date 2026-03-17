# Validaciones de Pago

Este documento describe las validaciones de datos y reglas de acceso aplicadas en los endpoints relacionados con pagos dentro de la API.

## Permisos de acceso

#### Cliente

- Un cliente solo puede pagar sus propias reservas.
- Un cliente solo puede ver sus propios pagos.

#### Organizador

- Un organizador puede ver los pagos asociados a sus propios conciertos.

#### Administrador

- Un administrador puede ver todos los pagos del sistema.

## Pagar reserva

Para realizar un pago deben cumplirse las siguientes condiciones:

- El usuario debe ser el propietario de la reserva.
- La reserva debe estar activa.
- La reserva debe tener al menos una entrada reservada.
- El concierto asociado debe estar programado.
- El usuario debe tener una reserva válida para el concierto.

## Listar pagos

- Los clientes solo pueden ver sus pagos.
- Los organizadores solo pueden ver los pagos relacionados con sus conciertos.
- Los administradores pueden ver todos los pagos del sistema.
