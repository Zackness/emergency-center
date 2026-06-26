# Emergency Center

Hub central de información y ayuda durante emergencias nacionales en Venezuela. Creado por **[StartupVen](https://startupven.com)**.

> **Software libre** — código abierto bajo licencia MIT.  
> Repositorio: [github.com/Zackness/emergency-center](https://github.com/Zackness/emergency-center)

## Contribuir

1. Clona el repositorio y copia `.env.example` a `.env`.
2. Rellena tus propias credenciales de Supabase (nunca subas `.env` a git).
3. `npm install` → `npm run dev`

Los secretos (`DATABASE_URL`, `SUPABASE_SECRET_KEY`, etc.) viven solo en tu `.env` local o en las variables de entorno del hosting — **no** en el repositorio público.

**Quien clone el repo desde GitHub no puede modificar la base de datos de producción** sin esas credenciales. Además:

- Las políticas RLS en Supabase **no permiten escrituras** con la clave anónima; solo lectura pública.
- Los formularios (`POST /api/*`) escriben vía el servidor (Prisma) y están **desactivados por defecto** (`ALLOW_PUBLIC_WRITES=false`). Actívalos solo en el hosting de producción si quieres aceptar registros ciudadanos.
- Los scripts `sync:*`, `admin:create` y `db:push` **bloquean escrituras** si `DATABASE_URL` apunta al proyecto de producción, salvo que exportes `CONFIRM_PRODUCTION_DB=1` de forma explícita.
- Los archivos `supabase/seed_*.sql` son datos de referencia; **no los ejecutes contra producción** salvo que seas el operador del sitio.

Para desarrollo local, crea **tu propio proyecto** en Supabase y usa sus URLs en `.env`.

## Stack

- **Astro 5** — rendimiento estático con islas React interactivas
- **React** — mapas (Leaflet) y formularios
- **TypeScript** + **Tailwind CSS**
- **Prisma** — ORM para acceso a PostgreSQL
- **Supabase** — auth, PostgreSQL (host), storage, realtime
- **OpenStreetMap** — mapas con Leaflet
- **i18n** — Español (default) e Inglés

## Arquitectura de datos

| Capa | Herramienta | Uso |
|------|-------------|-----|
| Auth | Supabase Auth (`@supabase/ssr`) | Login, sesiones, admin |
| Datos | **Prisma** | Lectura/escritura de tablas |
| DB | PostgreSQL (Supabase) | Almacenamiento |
| RLS | SQL en `supabase/migrations/` | Políticas de seguridad |

## Inicio rápido

```bash
npm install
cp .env.example .env
# Configura DATABASE_URL, DIRECT_URL, PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Abre [http://localhost:4321](http://localhost:4321) — redirige a `/es`.

## Base de datos con Prisma

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta la migración SQL en `supabase/migrations/20260625000000_initial_schema.sql` (tablas + RLS + triggers)
3. Copia las URLs de conexión a `.env`:
   - `DATABASE_URL` → pooler puerto **6543** (`?pgbouncer=true`)
   - `DIRECT_URL` → conexión directa puerto **5432**
4. Genera el cliente Prisma:

```bash
npm run db:generate
```

5. (Opcional) Sincroniza el schema si cambias la DB:

```bash
npm run db:pull    # introspecciona desde Supabase
npm run db:studio  # explorador visual
```

### Auth + Admin

1. Configura `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`
2. Crea un usuario en Supabase Auth
3. Promueve a admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu@email.com';
```

Sin `DATABASE_URL` configurado, la app funciona con **datos seed** de demostración.

## Scripts Prisma

| Comando | Descripción |
|---------|-------------|
| `npm run db:generate` | Genera `@prisma/client` |
| `npm run db:push` | Sincroniza schema → DB (dev) |
| `npm run db:pull` | Introspecciona DB → schema |
| `npm run db:studio` | UI visual de datos |
| `npm run db:migrate` | Migraciones con historial |

## Estructura

```
prisma/
└── schema.prisma     # Modelos Prisma (fuente de verdad del ORM)
src/lib/
├── prisma.ts         # Cliente singleton
├── data.ts           # Queries vía Prisma
├── mappers.ts        # Prisma → tipos de la app
└── supabase/         # Solo auth SSR
supabase/migrations/  # RLS, triggers, realtime
```

## Despliegue en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Framework: **Astro** (detectado automáticamente). Build: `npm run build`. Output: gestionado por `@astrojs/vercel`.
3. Node.js **20+** (definido en `package.json` → `engines`).
4. Configura estas variables de entorno en el proyecto de Vercel:

| Variable | Requerida | Notas |
|----------|-----------|-------|
| `PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave publicable / anon |
| `DATABASE_URL` | Sí | Pooler Supabase puerto **6543** (`?pgbouncer=true`) |
| `DIRECT_URL` | Sí | Conexión directa puerto **5432** (migraciones) |
| `SUPABASE_SECRET_KEY` | Recomendada | Solo servidor; admin y scripts |
| `SYNC_SECRET` | Recomendada | Protege `POST /api/*/sync` |
| `ALLOW_PUBLIC_WRITES` | Opcional | `true` para habilitar formularios ciudadanos |
| `PUBLIC_SITE_URL` | Opcional | Dominio final (`https://tu-dominio.com`). Si no está, usa `VERCEL_URL` |
| `TERREMOTO_VZLA_SUPABASE_KEY` | Opcional | Mapa de daños externo |

5. En **Supabase → Authentication → URL Configuration**, añade:
   - Site URL: tu dominio de Vercel o `PUBLIC_SITE_URL`
   - Redirect URLs: `https://tu-dominio.com/api/auth/callback`, `https://*.vercel.app/api/auth/callback`

6. Tras el primer deploy, crea el admin con `npm run admin:create` en local (con `.env` de producción y `CONFIRM_PRODUCTION_DB=1`) o promueve el usuario en SQL.

Las páginas estáticas se pre-renderizan; las rutas con `prerender = false` y `/api/*` corren como **Serverless Functions** en `iad1` (US East).

## API interna

- `POST /api/volunteers` — registro de voluntarios (Prisma)
- `POST /api/companies` — registro de empresas (Prisma)
- `/api/auth/*` — login/logout (Supabase Auth)
