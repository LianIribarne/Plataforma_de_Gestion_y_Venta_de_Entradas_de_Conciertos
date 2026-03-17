# Validaciones de Usuario

En este documento describe las validaciones de datos y reglas de permisos aplicadas en los endpoints relacionados con usuarios dentro de la API.

### Registro de cliente

- El email debe ser único en el sistema.
- La contraseña debe tener al menos 8 caracteres.
- El usuario debe ser mayor de 18 años.
- Todos los campos obligatorios deben estar completos.

### Inicio de sesión

- Todos los campos obligatorios deben estar completos.
- El email debe estar registrado.
- La contraseña debe ser correcta.

### Actualizar perfil

- El email debe ser único.
- El usuario debe ser mayor de 18 años.

### Actualizar contraseña

- La contraseña actual debe ser correcta.
- La contraseña nueva debe tener al menos 8 caracteres.
- La nueva contraseña debe ser diferente de la actual.

## Permisos de administrador

### Registro de usuario

- El email debe ser único en el sistema.
- La contraseña debe tener al menos 8 caracteres.
- El usuario debe ser mayor de 18 años.
- Todos los campos obligatorios deben estar completos.

### Modificar usuario

- Solo un administrador puede modificar usuarios.
- Un administrador no puede modificar a otro administrador.
- Un administrador no puede modificarse a sí mismo desde este endpoint.
- Si se modifica la contraseña:
  - Debe tener al menos 8 caracteres.
  - Debe ser diferente de la contraseña actual.
- El email debe ser único.
- El usuario debe ser mayor de 18 años.

### Listar usuarios

- Solo los administradores pueden listar usuarios.
- Los administradores no pueden ver otros administradores en el listado.

### Detalles de usuarios

- Solo los administradores pueden acceder a los detalles de usuarios.
- No se pueden consultar los detalles de otros administradores.

## Conciertos de organizadores

### Ver detalles de conciertos por organizador

- Solo administradores y organizadores pueden acceder a este endpoint.
- Un organizador solo puede ver sus propios conciertos.
- Un organizador no puede ver los conciertos de otros organizadores.
