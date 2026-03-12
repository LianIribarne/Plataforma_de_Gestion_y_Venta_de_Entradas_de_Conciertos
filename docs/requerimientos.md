# Requerimientos

### Requerimientos funcionales

| ID                 | Requisito                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **01 - usuario**   | El sistema debe permitir el registro e inicio de sesion de usuarios.                                               |
| **02 - usuario**   | Los usuarios podran tener distintos roles.                                                                         |
| **03 - concierto** | Los organizadores puedan crear conciertos.                                                                         |
| **04 - concierto** | Los conciertos deben poder actualizarse o cancelarse.                                                              |
| **05 - concierto** | Los conciertos deben visualizarse en formato de listado y detalle individual.                                      |
| **06 - entrada**   | Cada entrada debe tener un estado.                                                                                 |
| **07 - reserva**   | Los clientes puedan reservar entradas por 15 minutos, y posteriormente pagar por las mismas o cancelar la reserva. |
| **08 - entrada**   | En caso de que un concierto se cancele, todas las entradas del mismo tambien deben cancelarse.                     |
| **09 - entrada**   | El sistema debe permitir la visualizacion de las entradas adquiridas por el cliente.                               |
| **10 - pago**      | Simular proceso de pago, ingresando datos y realizando la compra.                                                  |
| **11 - pago**      | El sistema debe permitir la visualizacion de los pagos realizados por los clientes.                                |
| **12 - imagen**    | El sistema debe permitir subir y guardar imagenes.                                                                 |

### Requisitos no funcionales

| ID     | Requisito                                                                                                                               |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **01** | El proyecto seria desarrollado con: Frontend (React, Chakra UI, react-router-dom), Backend (Django, DRF, Cors, Celery), Otros (Docker). |
| **02** | El sistema va a usar como base de datos relacional a PostgreSQL.                                                                        |
