# Emergency Center

Hub central de información y ayuda durante emergencias nacionales en Venezuela. Creado por **StartupVen**.

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

## API interna

- `POST /api/volunteers` — registro de voluntarios (Prisma)
- `POST /api/companies` — registro de empresas (Prisma)
- `/api/auth/*` — login/logout (Supabase Auth)
