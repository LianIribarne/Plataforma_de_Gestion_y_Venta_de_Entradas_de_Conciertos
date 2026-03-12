# Historias de usuario

### Registro de usuario #1

Como cliente quiero poder registrarme en la plataforma con mis datos personales y un correo valido, para poder acceder a la compra de entradas y gestionar mi perfil.

**Criterios de aceptación:**

- El sistema debe validar que el correo no esté previamente registrado.
- La contraseña debe tener mínimo 8 caracteres.

### Creación de concierto #2

Como organizador quiero poder crear un concierto con sus respectivos datos, para publicar el concierto y poner a la venta sus entradas.

**Criterios de aceptación:**

- Todos los campos obligatorios deben completarse para guardar el concierto.
- La cantidad de entradas disponibles debe coincidir con el número definido por el organizador.

### Reserva de entradas #3

Como cliente quiero poder reservar entradas por un tiempo limitado de 15 minutos, para asegurarme de comprarlas antes de que se agoten.

**Criterios de aceptación:**

- El sistema debe bloquear las entradas reservadas durante 15 minutos.
- Si no se completa la compra en ese tiempo, las entradas vuelven a estar disponibles.
- El cliente debe recibir una notificación visual del tiempo restante.

### Compra de entradas #4

Como cliente quiero comprar entradas y recibir el recibo y las entradas con código QR únicos.

**Criterios de aceptación:**

- El sistema debe permitir ingresar datos de pago y confirmar la transacción.
- Una vez confirmada, las entradas pasan a estar vendidas.
- El cliente puede ver su pago y sus entradas compradas en la plataforma.
