# Facebook Pages OAuth Integration

Este documento describe cómo funciona la integración de OAuth con Facebook Pages para obtener métricas de redes sociales.

## 📋 Requisitos Previos

1. **App de Facebook/Meta** creada en [developers.facebook.com](https://developers.facebook.com)
2. **Variables de entorno** configuradas en `.env`:
   ```env
   NEXT_PUBLIC_META_APP_ID=tu_app_id
   META_APP_SECRET=tu_app_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=tu_secret_key
   ```

3. **Página de Facebook** que administres

## 🔐 Permisos Solicitados

La aplicación solicita los siguientes permisos:
- `email` - Email del usuario
- `public_profile` - Perfil público
- `pages_show_list` - Lista de páginas de Facebook que administras
- `pages_read_engagement` - Leer engagement de páginas
- `pages_read_user_content` - Leer contenido de páginas
- `read_insights` - Leer insights/métricas de páginas

## 🚀 Flujo de OAuth

### 1. Inicio del flujo
```
Usuario hace clic en "Conectar Facebook"
    ↓
GET /api/auth/instagram
    ↓
Redirige a Facebook OAuth
```

### 2. Autorización en Facebook
```
Usuario autoriza la aplicación en Facebook
    ↓
Facebook redirige a /api/auth/instagram/callback?code=xxx
```

### 3. Intercambio de código
```
Recibe el código de autorización
    ↓
Intercambia el código por access_token
    ↓
Obtiene información del usuario
    ↓
Obtiene páginas de Facebook del usuario
    ↓
Para cada página, obtiene información básica e insights
    ↓
Guarda la información en la base de datos
```

## 📊 Datos Obtenidos

### Usuario
```typescript
{
  id: string
  name: string
  email: string
}
```

### Página de Facebook
```typescript
{
  pageId: string              // ID de la página de Facebook
  pageName: string            // Nombre de la página
  pageAccessToken: string     // Token de acceso de la página
  fanCount: number            // Cantidad de "Me gusta"
  followersCount: number      // Cantidad de seguidores
  link: string                // URL de la página
  picture: string             // URL de la imagen de perfil
  insights: Array             // Métricas de la página
}
```

### Métricas (Insights) Disponibles
- `page_impressions` - Impresiones totales
- `page_engaged_users` - Usuarios que interactuaron
- `page_fans` - Total de fans
- `page_post_engagements` - Engagement en posts
- `page_views_total` - Vistas totales de la página

## 🔧 Uso de las Funciones Helper

### Obtener información de la página
```typescript
import { getFacebookPageInfo } from '@/lib/facebook/insights';

const pageInfo = await getFacebookPageInfo(pageId, pageAccessToken);
// Returns: name, fan_count, followers_count, link, etc.
```

### Obtener métricas (insights)
```typescript
import { getFacebookPageInsights } from '@/lib/facebook/insights';

const insights = await getFacebookPageInsights(pageId, pageAccessToken, 'day');
// Returns: impressions, engaged_users, page_fans, etc.
```

### Obtener posts recientes
```typescript
import { getFacebookPagePosts } from '@/lib/facebook/insights';

const posts = await getFacebookPagePosts(pageId, pageAccessToken, 25);
// Returns: últimos 25 posts con métricas
```

### Obtener engagement
```typescript
import { getFacebookPageEngagement } from '@/lib/facebook/insights';

const engagement = await getFacebookPageEngagement(pageId, pageAccessToken, '2025-01-01', '2025-01-31');
// Returns: métricas de engagement del período especificado
```

### Convertir a token de larga duración
```typescript
import { getLongLivedToken } from '@/lib/facebook/insights';

const longLivedToken = await getLongLivedToken(shortLivedToken);
// Returns: token válido por 60 días
```

## 💾 Siguiente Paso: Base de Datos

Para almacenar las páginas conectadas, necesitarás:

### 1. Tabla de páginas de Facebook
```sql
create table facebook_pages (
  id uuid primary key default uuid_generate_v4(),
  agent_id uuid references agents(id),
  page_id text unique not null,
  page_name text not null,
  page_access_token text not null,
  fan_count integer,
  followers_count integer,
  page_link text,
  picture_url text,
  connected_at timestamp with time zone default now(),
  last_synced_at timestamp with time zone,
  updated_at timestamp with time zone default now()
);
```

### 2. Tabla de métricas históricas
```sql
create table facebook_page_metrics (
  id uuid primary key default uuid_generate_v4(),
  facebook_page_id uuid references facebook_pages(id),
  date date not null,
  impressions integer,
  engaged_users integer,
  page_fans integer,
  post_engagements integer,
  page_views integer,
  created_at timestamp with time zone default now(),
  unique(facebook_page_id, date)
);
```

## 🔄 Sincronización de Datos

Recomendaciones:
1. **Sincronizar métricas diariamente** usando un cron job o Vercel Cron
2. **Guardar tokens de larga duración** (60 días)
3. **Refrescar tokens** antes de que expiren
4. **Cache de datos** para reducir llamadas a la API

## 📝 Límites de la API

Facebook Graph API tiene límites de tasa:
- **200 llamadas por hora** por usuario
- **Rate limit** basado en el uso de la app

Consejos:
- Cachear datos cuando sea posible
- Usar webhooks para actualizaciones en tiempo real
- Implementar manejo de errores robusto

## 🐛 Debugging

Para ver los datos que se están recibiendo:
1. Revisa la consola del servidor después de conectar
2. Los logs mostrarán:
   ```
   Usuario: { id, name, email }
   Páginas de Facebook: [{ pageId, pageName, fanCount, followersCount, insights }]
   ```

## 🔐 Seguridad

⚠️ **IMPORTANTE**:
- Nunca expongas `META_APP_SECRET` en el frontend
- Guarda los tokens encriptados en la base de datos
- Usa HTTPS en producción
- Implementa refresh de tokens antes de expiración
- Valida todos los datos recibidos de la API

## 📚 Recursos

- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram API](https://developers.facebook.com/docs/instagram-api)
- [Instagram Insights](https://developers.facebook.com/docs/instagram-api/guides/insights)
