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
