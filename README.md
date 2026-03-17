# Plataforma de Gestión y Venta de Entradas para Conciertos

## Autor

Desarrollado por **Lian Iribarne**

Proyecto de portfolio

![Portada](/assets/Portada.png)

## Objetivo

Desarrollar una aplicación web con frontend y backend que permita gestionar conciertos, vender entradas, gestionar usuarios en Argentina.

El sistema se utilizará en un contexto comercial online, donde los clientes podrán visualizar los conciertos con sus respectivas entradas, reservar y comprar las mismas, y gestionar su perfil. Al mismo tiempo, los organizadores tendrán control sobre la creación, gestión y visualización de conciertos, así como del proceso de ventas, y los administradores podrán gestionar conciertos, lugares, y a los propios usuarios.

### Actores y usuarios finales

| Actor / Usuario | Descripción                                                                                  | Responsabilidades                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Cliente         | Persona que ingresa a la plataforma para ver conciertos y poder adquirir entradas del mismo. | Ver conciertos, reservar y comprar entradas. Visualizar pagos realizados y entradas adquiridas.                                                  |
| Organizador     | Persona que crea y gestiona sus conciertos, y pone en venta las entradas.                    | Crear y gestionar conciertos y entradas. Visualizar ventas.                                                                                      |
| Administrador   | Persona que gestiona la plataforma, a los usuarios, y los conciertos.                        | Gestionar plataforma. Crear organizadores y/o administradores, artistas y lugares. Ver conciertos, usuarios, pagos, entradas, artistas, lugares. |

## Características

- Gestión de conciertos
- Reservas de entradas online
- Compra de entradas online
- Cambios de estados asincronicos
- Control de disponibilidad
- Entradas digitales de forma fisica

## Tecnologías

Frontend:

- React
- Chakra UI v2
- react-router-dom
- Vite

Backend:

- Django
- django REST framework
- drf simple JWT
- Cors
- Celery
- Redis

Base de datos:

- PostgreSQL

Otros:

- Docker

## Documentación

La documentación completa del sistema se encuentra en la carpeta `docs/`, incluyendo:

- Requerimientos del sistema
- Historias de usuario
- Diagramas
- Diseño tecnico
- Prototipo ui
<!-- - Documentación de la API -->
- Validaciones y reglas de negocio
- Procesos asíncronos

## Ejecutar el proyecto

### 1. Clonar repositorio

```bash
git clone https://github.com/LianIribarne/Plataforma_de_Gestion_y_Venta_de_Entradas_de_Conciertos
cd Plataforma_de_Gestion_y_Venta_de_Entradas_de_Conciertos
```

### 2. Iniciar los servicios

```bash
docker compose up --build
```

Esto iniciará:

- Backend (Django)
- Frontend (React)
- PostgreSQL
- Redis
- Celery

### 3. Cargar datos iniciales

En otra terminal ejecutar:

```bash
docker compose run --rm backend_init
```

Este comando ejecuta:

- migraciones de base de datos
- carga de fixtures
  - roles
  - usuarios
  - paises
  - categorias
  - artistas
  - provincias
  - ciudades
  - conciertoMeta
  - lugares
- seed de concierto

#### Datos de prueba

Después de ejecutar el comando de carga de datos, se crean los siguientes datos para probar la aplicación.

##### Usuarios de prueba

| Rol           | Email                   | Password |
| ------------- | ----------------------- | -------- |
| Cliente       | cliente@example.com     | 12345678 |
| Organizador   | organizador@example.com | 12345678 |
| Administrador | admin@example.com       | 12345678 |

##### Concierto de prueba

Se crea un concierto de prueba programado para comenzar 15 minutos después de la carga de los datos. Durante ese período previo es posible realizar reservas y completar el proceso de pago.

Una vez que el concierto comienza, ya no se permitirán nuevas reservas ni pagos. Posteriormente, 30 minutos después de su inicio, el concierto finalizará. A partir de ese momento, los clientes que hayan adquirido entradas ya no podrán visualizar las entradas correspondientes a ese concierto.

### 4. Acceder a la aplicación

Frontend
http://localhost:5173

Backend API
http://localhost:8000

### Detener el proyecto

```bash
docker compose down
```

Detiene y elimina los contenedores, pero mantiene los datos de la base.

### Eliminar completamente el entorno

```bash
docker compose down -v --rmi all --remove-orphans
```

Elimina:

- contenedores
- redes
- volúmenes
- imágenes generadas por Docker

## License

This project is licensed under the MIT License.

© 2026 Lian Iribarne — Proyecto de portfolio
