# Validaciones de Entrada

Este documento describe las validaciones de datos y reglas de acceso aplicadas en los endpoints relacionados con entradas dentro de la API.

- Las entradas se generan de forma automática al crear un tipo de entrada.
- Cada entrada posee un token único utilizado para identificación por QR y codigo.
- El sistema garantiza unicidad del token para cada entrada individual.
- Las entradas pueden ser:
  - agregadas
  - canceladas parcialmente
  - canceladas totalmente

  siempre que el concierto no haya comenzado ni esté finalizado o cancelado.

## Listar entradas

#### Cliente

- Un cliente solo puede ver sus propias entradas.
- Las entradas solo pueden consultarse si el concierto se encuentra programado, agotado o en curso.

#### Administrador

- Un administrador puede ver todas las entradas de los clientes.
- Las entradas pueden consultarse si el concierto se encuentra programado, agotado, en curso o cancelado.
