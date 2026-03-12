# Diseño Técnico

### Arquitectura lógica del software

El sistema adopta una arquitectura cliente-servidor, donde el frontend se implementa como una Single Page Application (SPA) desarrollada en React, y el backend se expone mediante una API REST desarrollada en Django.

- **Tipo de arquitectura:** cliente-servidor
- **Capas:**
  - **Frontend (React):**
    - Presentación y experiencia de usuario
    - Consumo de la API REST
    - Manejo de autenticación en el cliente
  - **Backend (Django):**
    - Exposición de endpoints REST
    - Lógica de negocio
    - Validaciones
    - Persistencia de datos
    - Seguridad y control de acceso

La comunicación entre ambas capas se realiza mediante HTTP/HTTPS utilizando intercambio de datos en formato JSON.

### Arquitectura del backend (Django)

El backend se estructura siguiendo una arquitectura en capas, separando responsabilidades para mejorar la mantenibilidad del código.

**Capas:**

- **Capa de presentación**
  - Views
  - Serializers
  - Endpoints REST
- **Capa de lógica de negocio**
  - Servicios
  - Validaciones
  - Orquestación de procesos (reservas, cambios de estado)
- **Capa de persistencia**
  - Modelos Django
  - ORM
  - Relaciones entre entidades

### Interfaces externas

El sistema expone una API REST que permite al frontend interactuar con los recursos del dominio, tales como usuarios, conciertos, entradas y pagos.

**Características:**

- Uso de métodos HTTP estándar (GET, POST, PUT)
- Intercambio de datos en formato JSON
- Endpoints protegidos mediante autenticación

**Algunos de los recursos:**

- `/api/conciertos/crear_concierto/`
- `/api/entradas/reservar/`
- `/api/usuarios/actualizar_password/`

### Reglas de negocio y validaciones

Estas son algunas de las reglas que el sistema controla:

- Reglas generales sobre conciertos:
  - Un concierto debe tener una fecha futura al momento de su creación y actualización.
  - Un concierto no puede ser modificado si su estado es:
    - en curso
    - cancelado
    - finalizado
  - Un concierto no puede ser cancelado si ya se encuentra en alguno de los estados anteriores.
  - Si un concierto tiene entradas vendidas, se restringe la modificación de:
    - Fecha
    - Horario del show
    - Horario de apertura de puertas
    - Lugar
    - Artista
- Reglas sobre lugares, artistas y moods:
  - Solo se pueden asociar:
    - Lugares activos
    - Artistas activos
    - Moods activos
- Reglas sobre tipos de entrada:
  - Un concierto puede tener como máximo 4 tipos de entrada activos.
  - No se permiten tipos de entrada activos con nombres duplicados dentro del mismo concierto.
  - No se pueden agregar nuevos tipos de entrada si el concierto está:
    - en curso
    - cancelado
    - finalizado
  - Un tipo de entrada cancelado:
    - No puede ser modificado
    - No puede recibir nuevas entradas
- Reglas sobre límites de reserva:
  - Cada tipo de entrada define un limite_reserva por usuario.
  - El limite_reserva_total del concierto no puede ser menor al mayor límite definido entre sus tipos de entrada activos.
  - Al crear o modificar tipos de entrada, el sistema sincroniza automáticamente el límite de reserva total del concierto.
- Reglas sobre entradas individuales:
  - Las entradas se generan de forma automática al crear un tipo de entrada.
  - Cada entrada posee un token único utilizado para identificación (QR).
  - El sistema garantiza unicidad del token dentro del tipo de entrada.
  - Las entradas pueden ser:
    - agregadas
    - canceladas parcialmente
    - canceladas totalmente

      siempre que el concierto no haya comenzado ni esté finalizado o cancelado.

- Stock disponible:
  - El estado del concierto se actualiza automáticamente en función del stock disponible de entradas activas.
  - Si no quedan entradas disponibles en ningún tipo activo → el concierto pasa a estado Agotado.
  - Si vuelven a existir entradas disponibles y el estado era Agotado → el concierto vuelve a Programado.
  - El estado no se modifica automáticamente si el concierto está en:
    - Borrador
    - En curso
    - Cancelado
    - Finalizado
- Reglas al crear una reserva:
  - Una reserva puede contener como máximo 4 tipos de entrada distintos.
  - No se puede incluir el mismo tipo de entrada más de una vez en una reserva.
  - Todos los tipos de entrada de una reserva deben pertenecer al mismo concierto.
  - Solo se pueden realizar reservas si el concierto está en estado Programado.
  - La suma total de entradas reservadas no puede superar el límite de reserva total del concierto.
  - Para cada tipo de entrada existe un límite máximo por reserva.
  - Un cliente solo puede tener una reserva activa a la vez.
- Reserva temporal de entradas:
  - Al crear una reserva:
    - Las entradas pasan a estado Reservada
    - Se agenda una tarea asíncrona para su expiración
- Expiración o cancelación de reservas:
  - Al expirar o cancelar una reserva:
    - Las entradas vuelven a estado Disponible si el tipo está activo
    - O pasan a Cancelada si el tipo fue desactivado
  - El usuario puede cancelar su reserva activa manualmente.
  - El usuario puede quitar entradas individuales de su reserva activa.
- Sincronización de estado post-operación:
  - Luego de cualquier operación que afecte stock:
    - creación de reserva
    - cancelación
    - liberación de entradas

  se recalcula el estado del concierto.

### Seguridad y control de acceso

- Autenticación basada en JWT:
  - El sistema utiliza JSON Web Tokens (JWT) mediante SimpleJWT para la autenticación de usuarios.
  - Se implementa un esquema de access token + refresh token.
  - Configuración:
    - Access token:
      - Tiempo de vida: 5 minutos
      - Utilizado para autorizar el acceso a los endpoints protegidos.
    - Refresh token:
      - Tiempo de vida: 1 día
      - Permite renovar el access token sin requerir un nuevo login.
    - Los tokens JWT se almacenan en cookies HTTP-only.
      - Las cookies no son accesibles desde JavaScript, mitigando ataques de tipo XSS.
      - El frontend no gestiona manualmente los tokens, reduciendo errores de implementación.
- Roles:
  - El acceso a endpoints se controla mediante permisos personalizados en Django Rest Framework, los cuales son:
    - EsCliente
    - EsOrganizador
    - EsAdministrador

    y también en el modelo Usuario contiene propertys en los cuales se valida su rol: es_cliente, es_organizador, es_administrador.

- Medidas de seguridad: Separación de responsabilidades frontend / backend
  - El backend es responsable de:
    - Autenticación
    - Autorización
    - Validaciones de seguridad
  - El frontend solo consume la API autenticada.
