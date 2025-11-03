# Supabase Setup Guide

Esta carpeta contiene las migraciones SQL y configuración para el proyecto.

## 📋 Prerequisitos

1. Cuenta de Supabase (gratis): https://supabase.com
2. Proyecto de Supabase creado

## 🚀 Setup Inicial

### 1. Crear Proyecto en Supabase

1. Ve a https://supabase.com/dashboard
2. Click en "New Project"
3. Completa los datos:
   - **Name**: Dashboard Agentes RE/MAX
   - **Database Password**: Guarda este password de forma segura
   - **Region**: Elige la más cercana a tu ubicación
   - **Plan**: Free tier es suficiente para empezar

### 2. Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys** → **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **NUNCA expongas esta key al cliente**

### 3. Configurar Variables de Entorno

1. Copia `.env.example` a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y reemplaza las variables de Supabase con tus valores

### 4. Ejecutar las Migraciones

Tienes dos opciones:

#### Opción A: Usando el SQL Editor de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase
2. Click en **SQL Editor** en el menú lateral
3. Ejecuta cada migración en orden:
   - `001_create_agents_table.sql`
   - `002_create_facebook_metrics_table.sql`
   - `003_create_sync_jobs_table.sql`
   - `004_create_api_rate_limits_table.sql`
   - `005_create_rls_policies.sql`

4. Para cada archivo:
   - Click en "New query"
   - Copia y pega el contenido del archivo
   - Click en "Run"
   - Verifica que no haya errores

#### Opción B: Usando Supabase CLI (Avanzado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link a tu proyecto
supabase link --project-ref YOUR_PROJECT_ID

# Ejecutar migraciones
supabase db push
```

### 5. Verificar la Instalación

1. Ve a **Table Editor** en Supabase
2. Deberías ver 4 tablas:
   - `agents`
   - `facebook_metrics_daily`
   - `sync_jobs`
   - `api_rate_limits`

3. Ve a **Authentication** → **Policies**
4. Deberías ver las políticas RLS configuradas

## 🔐 Configurar Autenticación

### 1. Habilitar Email Auth

1. Ve a **Authentication** → **Providers**
2. Habilita **Email**
3. Configura el template de emails si lo deseas

### 2. Crear Usuario Admin

1. Ve a **Authentication** → **Users**
2. Click en "Add user" → "Create new user"
3. Completa:
   - Email: tu email de admin
   - Password: tu contraseña
   - Auto Confirm User: ✅ SI

4. Una vez creado, click en el usuario
5. En **User Metadata**, agrega:
   ```json
   {
     "role": "admin"
   }
   ```

### 3. Crear un Agente de Prueba

En el **SQL Editor**, ejecuta:

```sql
-- Crear un agente de prueba
INSERT INTO agents (name, email, phone, status, join_date)
VALUES (
  'María González',
  'maria.gonzalez@remax.com',
  '+34 612 345 678',
  'active',
  CURRENT_DATE
);
```

## 🧪 Probar la Conexión

En tu proyecto Next.js, crea un archivo de prueba:

```typescript
// test-supabase.ts
import { createClient } from '@/lib/supabase/client'

async function testConnection() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error:', error)
  } else {
    console.log('✅ Conexión exitosa:', data)
  }
}

testConnection()
```

## 📊 Estructura de Tablas

### `agents`
Almacena información de agentes y sus conexiones de Facebook.

### `facebook_metrics_daily`
Métricas diarias de Facebook/Instagram por agente.

### `sync_jobs`
Historial de trabajos de sincronización.

### `api_rate_limits`
Control de límites de API por hora.

## 🔒 Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Agentes solo ven sus propios datos
- ✅ Admins ven todos los datos
- ✅ Service role solo para operaciones del servidor

## 🆘 Troubleshooting

### Error: "relation does not exist"
- Verifica que ejecutaste todas las migraciones en orden

### Error: "JWT expired"
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` es correcta

### Error: "new row violates row-level security"
- Verifica que el usuario tiene el role correcto en metadata

### No puedo ver datos
- Revisa que las políticas RLS estén configuradas
- Verifica que tu usuario tenga `role: "admin"` en metadata

## 📚 Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
