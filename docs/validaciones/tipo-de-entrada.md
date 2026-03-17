# Validaciones de Tipo de Entrada

Este documento describe las validaciones de datos y reglas de acceso aplicadas en los endpoints relacionados con tipos de entrada dentro de la API.

## Permisos de acceso

#### Cliente

- Un cliente solo puede ver los tipos de entrada activos.
- Los datos visibles para el cliente son:
  - nombre
  - precio
  - cantidad disponible
  - cantidad reservada
  - limite de reserva

#### Organizador

- Un organizador puede ver todos los tipos de entrada de sus propios conciertos, junto con sus detalles.
- Un organizador puede:
  - crear tipos de entrada
  - modificar sus tipos de entrada
  - cancelarlos (de forma parcial o total)
  - agregarle entradas a un tipo existente

#### Administrador

- Un administrador puede ver todos los tipos de entrada del sistema, junto con sus detalles.
- Un administrador puede:
  - modificarlos
  - cancelarlos (de forma parcial o total)

## Crear tipo de entrada

Para crear un tipo de entrada deben cumplirse las siguientes condiciones:

- Solo puede crear tipos de entrada en conciertos propios que se encuentren en estado borrador, programado o agotado.
- Todos los campos obligatorios deben estar completos.
- Un concierto debe tener al menos 1 y como máximo 4 tipos de entrada activos.
- No se pueden repetir los nombres de los tipos de entrada activos dentro del mismo concierto.

Al crear un tipo de entrada, se actualiza automáticamente el límite de reserva total del concierto si este es menor que el valor definido para el tipo de entrada.

## Modificar tipo de entrada

- Los tipos de entrada debe encontrarse en estado activo.
- Solo puede modificar tipos de entrada pertenecientes a conciertos en estado borrador, programado o agotado.

Cuando se modifica el límite de reserva de un tipo de entrada, se actualiza automáticamente el límite de reserva total del concierto si este es menor que el nuevo valor definido para el tipo de entrada.

## Cancelar tipo de entrada

- Los tipos de entrada debe encontrarse en estado activo.
- Solo puede cancelar tipos de entrada pertenecientes a conciertos en estado borrador, programado o agotado.

Al realizar esta acción:

- todas las entradas disponibles asociadas al tipo de entrada pasan al estado cancelado
- se actualiza el estado del concierto en función de la disponibilidad total de entradas

## Cancelar por cantidad de entradas de un tipo de entrada

- Los tipos de entrada debe encontrarse en estado activo.
- Solo puede cancelar por cantidad en tipos de entrada pertenecientes a conciertos en estado borrador, programado o agotado.

Al realizar esta acción:

- la cantidad de entradas disponibles seleccionadas asociadas al tipo de entrada pasan al estado cancelado
- se recalcula el estado del concierto en función de la disponibilidad total de entradas

## Agregar entradas a un tipo de entrada

- Los tipos de entrada debe encontrarse en estado activo.
- Solo puede agregar entradas a tipos de entrada pertenecientes a conciertos en estado borrador, programado o agotado.

Al realizar esta acción:

- las nuevas entradas se crean utilizando los datos definidos en el tipo de entrada
- se recalcula el estado del concierto en función de la disponibilidad total de entradas
