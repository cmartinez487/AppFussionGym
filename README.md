# Fussion Gym — App de Gestión

Aplicación web para la gestión de un gimnasio: usuarios, planes de entrenamiento,
entrenadores, rutinas, pagos y control de días disponibles (con cambio automático
a estado **"En mora"**).

## Stack

| Capa       | Tecnología                          | Ejecución |
|------------|-------------------------------------|-----------|
| Frontend   | React + Vite + TypeScript + Tailwind| Docker    |
| Backend    | ASP.NET Core Web API (.NET 10, C#)  | Docker    |
| Base de datos | PostgreSQL 16                     | Docker    |

## Requisitos

- Docker y Docker Compose

## Puesta en marcha (todo en contenedores)

1. Crea tu archivo de secretos a partir de la plantilla:

```bash
cp .env.example .env
```

2. Edita `.env` con tus valores reales (contraseña de la base de datos, clave JWT y
   usuario/contraseña del administrador).

3. Levanta los contenedores:

```bash
docker compose up --build
```

Esto levanta:

- **Frontend**: http://localhost:8080
- **Backend (API)**: http://localhost:5000/api
- **OpenAPI**: http://localhost:5000/openapi/v1.json
- **PostgreSQL**: `localhost:5433` (los datos se definen en `.env`)

### Credenciales iniciales

Las credenciales de acceso se definen en `.env` (variables `ADMIN_USERNAME` y
`ADMIN_PASSWORD`). Con los valores por defecto de `.env.example`:

- Usuario: `admin`
- Contraseña: `cambia_esta_password`

> El backend crea la base de datos y los datos semilla (3 planes, 2 entrenadores y
> el usuario admin) automáticamente al arrancar.

## Secretos y control de versiones

Las **conexiones a la base de datos** y las **credenciales de login** NO se versionan:

- `.env` contiene los valores reales y está excluido en `.gitignore`.
- `.env.example` es una plantilla con placeholders (sí se versiona).
- `appsettings.json` no contiene secretos reales; los valores se inyectan por
  variables de entorno desde `docker-compose.yml`.

## Funcionalidades

1. **Usuarios**: registro, edición y eliminación.
2. **Planes de entrenamiento** y **entrenadores**: CRUD.
3. **Asignación de entrenador**: solo a usuarios que tengan un plan de entrenamiento
   asignado (regla validada en el backend y reflejada en la interfaz).
4. **Rutinas**: registro de rutinas por usuario con ejercicios (series, repeticiones, peso).
5. **Pagos**: registro de la mensualidad; cada pago suma días disponibles (30 por defecto).
6. **Conteo de días**: un trabajo en segundo plano descuenta 1 día cada 24 horas a los
   usuarios activos. Al llegar a **0 días**, el estado cambia de `Activo` a `EnMora`.

### Probar el cambio a "En mora" sin esperar 24 horas

Hay un endpoint de mantenimiento que ejecuta el descuento diario manualmente:

```bash
curl -X POST http://localhost:5000/api/mantenimiento/decrementar-dias \
  -H "Authorization: Bearer <TOKEN>"
```

(El token se obtiene al iniciar sesión en `POST /api/auth/login`.)

## Desarrollo local (frontend fuera de Docker)

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173 (hace proxy de /api hacia localhost:5000)
```

## Estructura

```
AppFussionGym/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   └── AppFussionGym.Api/
│       ├── Controllers/   # API REST
│       ├── Entities/      # Modelo de datos
│       ├── Enums/
│       ├── Data/          # DbContext (EF Core)
│       └── Services/      # JWT, seeder, trabajo diario
└── frontend/
    ├── Dockerfile
    ├── nginx.conf         # sirve la app y proxifica /api al backend
    └── src/
        ├── pages/         # Dashboard, Usuarios, Planes, Entrenadores, Rutinas, Pagos
        └── components/
```

## Paleta de colores (extraída del logo)

- Negro `#0A0A0C`
- Amarillo `#F9FE02`
- Cian `#01FFFF`
- Gris plata `#D5D5D7`

## Notas

- El esquema de base de datos se crea con `EnsureCreated` (adecuado para una primera
  versión). Para producción, migra a migraciones de EF Core.
- Cambia la contraseña de la base de datos y la clave JWT en el archivo `.env`
  antes de usarlo en producción.
