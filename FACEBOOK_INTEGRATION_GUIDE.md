# 📚 Documentación Completa: Facebook Graph API para Dashboard de Agentes RE/MAX

## 🎯 Objetivo del Sistema

Crear un dashboard donde:
- **Cada agente** conecta su página de Facebook/Instagram
- **El sistema** obtiene métricas de engagement de cada agente
- **El jefe** ve un resumen consolidado de todos los agentes
- **Cada agente** solo ve sus propias métricas

---

# 🎯 Estrategia de Sincronización: Diaria con Histórico en BD

## 📊 **Arquitectura del Sistema**

```
Day 1 (Connection) → Save initial snapshot
Day 2 → Cron job saves daily data
Day 3 → Cron job saves daily data
...
Dashboard → Read everything from DB (no API calls)
```

### **Key Principles:**
1. **Historical data starts from connection date** - No retroactive data
2. **Daily sync at scheduled time** - Consistent data collection
3. **Dashboard reads from DB only** - No real-time API calls
4. **One sync per day per page** - Efficient and respects rate limits

---

## 🗄️ **Database Structure**

### **Table 1: `facebook_pages`** (Page Information)
```sql
CREATE TABLE facebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  page_id VARCHAR(255) UNIQUE NOT NULL,
  page_name VARCHAR(255),
  page_access_token TEXT NOT NULL, -- Encrypted
  category VARCHAR(255),
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_facebook_pages_agent_id ON facebook_pages(agent_id);
CREATE INDEX idx_facebook_pages_page_id ON facebook_pages(page_id);
```

### **Table 2: `page_daily_metrics`** (Daily Page Metrics)
```sql
CREATE TABLE page_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id VARCHAR(255) REFERENCES facebook_pages(page_id),
  date DATE NOT NULL,

  -- Followers
  fan_count INTEGER,           -- Total followers on that day
  fan_count_change INTEGER,    -- Change vs previous day

  -- Reach
  reach_unique INTEGER,        -- People reached that day
  impressions_total INTEGER,   -- Total impressions

  -- Engagement
  posts_count INTEGER,         -- Posts published that day
  total_likes INTEGER,         -- Likes received on that day's posts
  total_comments INTEGER,      -- Comments received
  total_shares INTEGER,        -- Shares
  engagement_total INTEGER,    -- Total sum

  synced_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(page_id, date)
);

CREATE INDEX idx_page_daily_metrics_page_date ON page_daily_metrics(page_id, date);
CREATE INDEX idx_page_daily_metrics_date ON page_daily_metrics(date);
```

### **Table 3: `posts_daily`** (Daily Posts with Reach)
```sql
CREATE TABLE posts_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id VARCHAR(255) REFERENCES facebook_pages(page_id),
  post_id VARCHAR(255) UNIQUE NOT NULL,

  -- Content
  message TEXT,
  created_time TIMESTAMP NOT NULL,
  post_date DATE NOT NULL, -- Post date (without time)

  -- Engagement
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  engagement_total INTEGER DEFAULT 0,

  -- Reach (if available)
  reach_unique INTEGER,
  impressions_total INTEGER,

  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_posts_daily_page_id ON posts_daily(page_id);
CREATE INDEX idx_posts_daily_post_date ON posts_daily(post_date);
CREATE INDEX idx_posts_daily_page_date ON posts_daily(page_id, post_date);
```

---

## 🔄 **Complete System Flow**

### **1️⃣ Connection Day (Initial Snapshot)**

When an agent connects their page for the first time:

```javascript
// /app/api/auth/facebook/callback/route.ts

export async function GET(request: Request) {
  // ... OAuth code ...

  for (const page of pages) {
    // 1. Save page
    await savePageToDatabase({
      agentId: user.id,
      pageId: page.id,
      pageName: page.name,
      pageAccessToken: encryptToken(page.access_token),
      category: page.category,
      connectedAt: new Date()
    });

    // 2. Get and save TODAY's initial snapshot
    await captureInitialSnapshot(page.id, page.access_token);
  }
}

async function captureInitialSnapshot(pageId: string, pageToken: string) {
  const today = new Date().toISOString().split('T')[0]; // "2025-10-07"

  try {
    // A. Page info (current followers)
    const pageInfo = await axios.get(
      `https://graph.facebook.com/v23.0/${pageId}`,
      {
        params: {
          fields: 'fan_count,followers_count',
          access_token: pageToken
        }
      }
    );

    // B. TODAY's reach
    const todayReach = await axios.get(
      `https://graph.facebook.com/v23.0/${pageId}/insights`,
      {
        params: {
          metric: 'page_impressions_unique',
          period: 'day',
          since: Math.floor(new Date(today).getTime() / 1000),
          access_token: pageToken
        }
      }
    );

    // C. TODAY's posts
    const todayPosts = await axios.get(
      `https://graph.facebook.com/v23.0/${pageId}/posts`,
      {
        params: {
          fields: 'message,created_time,likes.summary(true),comments.summary(true),shares',
          since: Math.floor(new Date(today).getTime() / 1000),
          access_token: pageToken
        }
      }
    );

    // D. Save to DB
    const reach = todayReach.data.data[0]?.values[0]?.value || 0;

    await savePageDailyMetrics({
      pageId: pageId,
      date: today,
      fanCount: pageInfo.data.fan_count,
      fanCountChange: 0, // First time, no comparison
      reachUnique: reach,
      postsCount: todayPosts.data.data.length,
      totalLikes: todayPosts.data.data.reduce((sum, p) => sum + (p.likes?.summary?.total_count || 0), 0),
      totalComments: todayPosts.data.data.reduce((sum, p) => sum + (p.comments?.summary?.total_count || 0), 0),
      totalShares: todayPosts.data.data.reduce((sum, p) => sum + (p.shares?.count || 0), 0)
    });

    // E. Save each post
    for (const post of todayPosts.data.data) {
      // Optionally get individual post reach
      let postReach = null;
      try {
        const postInsights = await axios.get(
          `https://graph.facebook.com/v23.0/${post.id}/insights`,
          {
            params: {
              metric: 'post_impressions_unique',
              access_token: pageToken
            }
          }
        );
        postReach = postInsights.data.data[0]?.values[0]?.value;
      } catch (error) {
        console.log(`Could not get reach for post ${post.id}`);
      }

      await savePostDaily({
        pageId: pageId,
        postId: post.id,
        message: post.message || '',
        createdTime: new Date(post.created_time),
        postDate: today,
        likesCount: post.likes?.summary?.total_count || 0,
        commentsCount: post.comments?.summary?.total_count || 0,
        sharesCount: post.shares?.count || 0,
        reachUnique: postReach
      });
    }

    console.log(`✅ Initial snapshot saved for page ${pageId}`);

  } catch (error) {
    console.error(`❌ Error in initial snapshot:`, error);
  }
}
```

---

### **2️⃣ Daily Automatic Sync (Cron Job)**

```javascript
// /app/api/cron/sync-daily-metrics/route.ts

export async function GET(request: Request) {
  // Verify cron authentication
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    // Get all connected pages
    const pages = await getAllConnectedPages();

    console.log(`🔄 Starting daily sync for ${pages.length} pages...`);

    for (const page of pages) {
      await syncDailyMetrics(page, today, yesterday);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${pages.length} pages`,
      date: today
    });

  } catch (error) {
    console.error('❌ Error in daily sync:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

async function syncDailyMetrics(page: any, today: string, yesterday: string) {
  const pageToken = decryptToken(page.page_access_token);

  try {
    // 1. Current page info
    const pageInfo = await axios.get(
      `https://graph.facebook.com/v23.0/${page.page_id}`,
      {
        params: {
          fields: 'fan_count,followers_count',
          access_token: pageToken
        }
      }
    );

    // 2. Get yesterday's followers to calculate change
    const yesterdayMetrics = await getPageMetricsByDate(page.page_id, yesterday);
    const fanCountChange = pageInfo.data.fan_count - (yesterdayMetrics?.fan_count || pageInfo.data.fan_count);

    // 3. TODAY's reach
    const todayReach = await axios.get(
      `https://graph.facebook.com/v23.0/${page.page_id}/insights`,
      {
        params: {
          metric: 'page_impressions_unique',
          period: 'day',
          since: Math.floor(new Date(today).getTime() / 1000),
          access_token: pageToken
        }
      }
    );

    // 4. TODAY's posts
    const todayPosts = await axios.get(
      `https://graph.facebook.com/v23.0/${page.page_id}/posts`,
      {
        params: {
          fields: 'message,created_time,likes.summary(true),comments.summary(true),shares',
          since: Math.floor(new Date(today).getTime() / 1000),
          access_token: pageToken
        }
      }
    );

    const posts = todayPosts.data.data || [];

    // 5. Calculate aggregated metrics
    const metrics = {
      pageId: page.page_id,
      date: today,
      fanCount: pageInfo.data.fan_count,
      fanCountChange: fanCountChange,
      reachUnique: todayReach.data.data[0]?.values[0]?.value || 0,
      postsCount: posts.length,
      totalLikes: posts.reduce((sum, p) => sum + (p.likes?.summary?.total_count || 0), 0),
      totalComments: posts.reduce((sum, p) => sum + (p.comments?.summary?.total_count || 0), 0),
      totalShares: posts.reduce((sum, p) => sum + (p.shares?.count || 0), 0)
    };

    metrics.engagementTotal = metrics.totalLikes + metrics.totalComments + metrics.totalShares;

    // 6. Save daily metrics
    await savePageDailyMetrics(metrics);

    // 7. Save each individual post
    for (const post of posts) {
      await savePostDaily({
        pageId: page.page_id,
        postId: post.id,
        message: post.message || '',
        createdTime: new Date(post.created_time),
        postDate: today,
        likesCount: post.likes?.summary?.total_count || 0,
        commentsCount: post.comments?.summary?.total_count || 0,
        sharesCount: post.shares?.count || 0,
        engagementTotal: (post.likes?.summary?.total_count || 0) +
                        (post.comments?.summary?.total_count || 0) +
                        (post.shares?.count || 0)
      });
    }

    // 8. Update last_sync_at
    await updatePageLastSync(page.page_id, new Date());

    console.log(`✅ Successful sync for ${page.page_name} - ${today}`);

  } catch (error) {
    console.error(`❌ Error syncing page ${page.page_name}:`, error);
  }
}
```

---

### **3️⃣ Configure Vercel Cron**

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/sync-daily-metrics",
    "schedule": "0 1 * * *"  // Daily at 1 AM
  }]
}
```

---

## 📊 **Dashboard Endpoints (Read from DB)**

### **Endpoint 1: Agent Metrics**

```javascript
// /app/api/metrics/agent/route.ts

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  // Get agent's pages
  const pages = await getPagesForAgent(user.id);

  const metrics = {
    summary: {
      totalPages: pages.length,
      currentFollowers: 0,
      totalFollowersChange: 0,
      totalReach: 0,
      totalPosts: 0,
      totalEngagement: 0
    },
    pages: [],
    trend: []
  };

  for (const page of pages) {
    // Get daily metrics for last N days
    const dailyMetrics = await getPageDailyMetrics(page.page_id, days);

    // Latest metric (today or last synced day)
    const latest = dailyMetrics[dailyMetrics.length - 1];

    // Calculate totals
    const pageMetrics = {
      pageId: page.page_id,
      pageName: page.page_name,
      currentFollowers: latest?.fan_count || 0,
      followersChange: dailyMetrics.reduce((sum, m) => sum + (m.fan_count_change || 0), 0),
      totalReach: dailyMetrics.reduce((sum, m) => sum + (m.reach_unique || 0), 0),
      totalPosts: dailyMetrics.reduce((sum, m) => sum + (m.posts_count || 0), 0),
      totalEngagement: dailyMetrics.reduce((sum, m) => sum + (m.engagement_total || 0), 0),
      avgEngagementPerPost: 0,
      trend: dailyMetrics.map(m => ({
        date: m.date,
        reach: m.reach_unique,
        engagement: m.engagement_total,
        posts: m.posts_count
      }))
    };

    pageMetrics.avgEngagementPerPost = pageMetrics.totalPosts > 0
      ? pageMetrics.totalEngagement / pageMetrics.totalPosts
      : 0;

    metrics.summary.currentFollowers += pageMetrics.currentFollowers;
    metrics.summary.totalFollowersChange += pageMetrics.followersChange;
    metrics.summary.totalReach += pageMetrics.totalReach;
    metrics.summary.totalPosts += pageMetrics.totalPosts;
    metrics.summary.totalEngagement += pageMetrics.totalEngagement;

    metrics.pages.push(pageMetrics);
  }

  return NextResponse.json(metrics);
}
```

### **Endpoint 2: Admin Metrics**

```javascript
// /app/api/metrics/admin/route.ts

export async function GET(request: Request) {
  const user = await getCurrentUser(request);

  // Verify admin role
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');

  // Get ALL pages from ALL agents
  const allPages = await getAllPagesWithAgents();

  const metrics = {
    summary: {
      totalAgents: new Set(allPages.map(p => p.agent_id)).size,
      totalPages: allPages.length,
      totalFollowers: 0,
      totalReach: 0,
      totalPosts: 0,
      totalEngagement: 0
    },
    topAgents: [],
    topPosts: [],
    trend: []
  };

  const agentMetrics = new Map();

  for (const page of allPages) {
    const dailyMetrics = await getPageDailyMetrics(page.page_id, days);
    const latest = dailyMetrics[dailyMetrics.length - 1];

    const pageData = {
      reach: dailyMetrics.reduce((sum, m) => sum + (m.reach_unique || 0), 0),
      posts: dailyMetrics.reduce((sum, m) => sum + (m.posts_count || 0), 0),
      engagement: dailyMetrics.reduce((sum, m) => sum + (m.engagement_total || 0), 0),
      followers: latest?.fan_count || 0
    };

    // Add to totals
    metrics.summary.totalFollowers += pageData.followers;
    metrics.summary.totalReach += pageData.reach;
    metrics.summary.totalPosts += pageData.posts;
    metrics.summary.totalEngagement += pageData.engagement;

    // Add to agent metrics
    if (!agentMetrics.has(page.agent_id)) {
      agentMetrics.set(page.agent_id, {
        agentId: page.agent_id,
        agentName: page.agent_name,
        agentEmail: page.agent_email,
        reach: 0,
        posts: 0,
        engagement: 0
      });
    }

    const agentData = agentMetrics.get(page.agent_id);
    agentData.reach += pageData.reach;
    agentData.posts += pageData.posts;
    agentData.engagement += pageData.engagement;
  }

  // Top 10 agents by engagement
  metrics.topAgents = Array.from(agentMetrics.values())
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 10);

  // Top 10 posts from all agents
  const allPosts = await getTopPostsAllPages(days, 10);
  metrics.topPosts = allPosts;

  return NextResponse.json(metrics);
}
```

---

## 🎨 **SQL Queries for Dashboard**

```javascript
// Helper functions for queries

async function getPageDailyMetrics(pageId: string, days: number) {
  const { data, error } = await supabase
    .from('page_daily_metrics')
    .select('*')
    .eq('page_id', pageId)
    .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: true });

  return data || [];
}

async function getTopPostsAllPages(days: number, limit: number) {
  const { data, error } = await supabase
    .from('posts_daily')
    .select(`
      *,
      facebook_pages!inner(page_name, agents!inner(name, email))
    `)
    .gte('post_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('engagement_total', { ascending: false })
    .limit(limit);

  return data || [];
}

async function getAllPagesWithAgents() {
  const { data, error } = await supabase
    .from('facebook_pages')
    .select(`
      *,
      agents!inner(id, name, email)
    `);

  return data || [];
}
```

---

## 📈 **Advantages of This Approach**

✅ **Efficiency:** Dashboard loads instantly (reads from DB)
✅ **Complete history:** Data from connection day onwards
✅ **No rate limits:** Only 1 sync per day per page
✅ **Scalable:** Works with 1 or 1000 agents
✅ **Deep analysis:** Can calculate any metric from DB
✅ **Reliable:** If API fails one day, you have previous data

---

## 🚀 **Executive Summary**

```
Daily Facebook metrics synchronization system:

1. INITIAL SNAPSHOT (on connection):
   - Save current followers
   - Save TODAY's reach
   - Save TODAY's posts with engagement
   - All with connection date

2. DAILY CRON JOB (1 AM):
   - For each connected page:
     * Get current followers and calculate change vs yesterday
     * Get today's unique reach (page_impressions_unique, period: day)
     * Get today's posts with likes/comments/shares
     * Save everything to DB with today's date

3. DASHBOARD ENDPOINTS (read from DB):
   - GET /api/metrics/agent?days=30 (current agent's metrics)
   - GET /api/metrics/admin?days=30 (consolidated metrics for all)

4. TABLES:
   - facebook_pages (page info)
   - page_daily_metrics (daily aggregated metrics)
   - posts_daily (each individual post of the day)

Dashboard reads EVERYTHING from DB, NEVER calls Facebook API directly.
History starts from connection day, not before.
```

---

## 📊 Alcance (Reach) en Facebook Graph API - Estado Actual 2025

### ✅ **SÍ, puedes obtener alcance - pero con matices**

#### **Métricas de Alcance DISPONIBLES en v23.0:**

**1. Alcance de la Página (Page-level)**
```javascript
GET /v23.0/{PAGE_ID}/insights

// Métricas disponibles:
{
  metric: 'page_impressions_unique', // ← ALCANCE ÚNICO
  period: 'day'  // o 'week' o 'days_28'
}
```

**Períodos disponibles:**
- `day` - Diario
- `week` - Semanal
- `days_28` - Últimos 28 días (aproximadamente mensual)
- ❌ **NO hay período `year` (anual)**

**2. Alcance por Post Individual**
```javascript
GET /v23.0/{POST_ID}/insights

// Métricas disponibles:
{
  metric: 'post_impressions_unique', // Alcance único del post
  period: 'lifetime'
}
```

### **Ejemplo: Alcance de la Página (últimos 28 días)**

```javascript
const response = await axios.get(
  `https://graph.facebook.com/v23.0/${pageId}/insights`,
  {
    params: {
      metric: 'page_impressions_unique',
      period: 'days_28',
      access_token: pageAccessToken
    }
  }
);

// Respuesta:
{
  "data": [
    {
      "name": "page_impressions_unique",
      "period": "days_28",
      "values": [
        {
          "value": 3547,  // ← Personas únicas que vieron tu contenido
          "end_time": "2025-10-07T07:00:00+0000"
        }
      ]
    }
  ]
}
```

### **Ejemplo: Alcance Diario (últimos 7 días)**

```javascript
const since = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60); // 7 días atrás
const until = Math.floor(Date.now() / 1000); // Ahora

const response = await axios.get(
  `https://graph.facebook.com/v23.0/${pageId}/insights`,
  {
    params: {
      metric: 'page_impressions_unique',
      period: 'day',
      since: since,
      until: until,
      access_token: pageAccessToken
    }
  }
);

// Respuesta:
{
  "data": [
    {
      "name": "page_impressions_unique",
      "period": "day",
      "values": [
        { "value": 450, "end_time": "2025-10-01T07:00:00+0000" },
        { "value": 523, "end_time": "2025-10-02T07:00:00+0000" },
        { "value": 478, "end_time": "2025-10-03T07:00:00+0000" },
        { "value": 612, "end_time": "2025-10-04T07:00:00+0000" },
        { "value": 556, "end_time": "2025-10-05T07:00:00+0000" },
        { "value": 489, "end_time": "2025-10-06T07:00:00+0000" },
        { "value": 439, "end_time": "2025-10-07T07:00:00+0000" }
      ]
    }
  ]
}
```

### **Funciones Helper para Alcance**

```javascript
// 1. Alcance Mensual (últimos 28 días)
async function getMonthlyReach(pageId, pageToken) {
  const response = await axios.get(
    `https://graph.facebook.com/v23.0/${pageId}/insights`,
    {
      params: {
        metric: 'page_impressions_unique',
        period: 'days_28',
        access_token: pageToken
      }
    }
  );

  return response.data.data[0].values[0].value;
}

// 2. Alcance Semanal (última semana)
async function getWeeklyReach(pageId, pageToken) {
  const response = await axios.get(
    `https://graph.facebook.com/v23.0/${pageId}/insights`,
    {
      params: {
        metric: 'page_impressions_unique',
        period: 'week',
        access_token: pageToken
      }
    }
  );

  return response.data.data[0].values[0].value;
}

// 3. Alcance Diario con tendencia
async function getDailyReachTrend(pageId, pageToken, days = 30) {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);

  const response = await axios.get(
    `https://graph.facebook.com/v23.0/${pageId}/insights`,
    {
      params: {
        metric: 'page_impressions_unique',
        period: 'day',
        since: since,
        access_token: pageToken
      }
    }
  );

  return response.data.data[0].values.map(item => ({
    fecha: item.end_time,
    alcance: item.value
  }));
}
```

### ⚠️ **Limitaciones de Alcance:**

1. **No hay alcance anual directo** - Debes calcularlo acumulando datos históricos en tu base de datos
2. **Métricas son estimadas** - Facebook las marca como "Estimated metric"
3. **Requiere permisos:** `read_insights` y `pages_read_engagement`
4. **Rate limits:** ~200 llamadas/hora por página

### **Solución para Alcance Anual:**

Guarda datos diarios en tu base de datos:

```sql
CREATE TABLE reach_history (
  id UUID PRIMARY KEY,
  page_id VARCHAR(255) REFERENCES facebook_pages(page_id),
  date DATE NOT NULL,
  reach_unique INTEGER,
  synced_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_id, date)
);

-- Calcular alcance anual:
SELECT SUM(reach_unique) as yearly_reach
FROM reach_history
WHERE page_id = '218029751909916'
  AND date >= CURRENT_DATE - INTERVAL '365 days';
```

### **Cron Job para Sincronizar Alcance Diario:**

```javascript
// /api/cron/sync-reach/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const pages = await getAllConnectedPages();

  for (const page of pages) {
    // Obtener alcance de ayer
    const yesterday = Math.floor(Date.now() / 1000) - (24 * 60 * 60);

    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${page.page_id}/insights`,
      {
        params: {
          metric: 'page_impressions_unique',
          period: 'day',
          since: yesterday,
          until: yesterday + (24 * 60 * 60),
          access_token: page.page_access_token
        }
      }
    );

    const reach = response.data.data[0].values[0]?.value || 0;

    // Guardar en DB
    await saveReachHistory({
      pageId: page.page_id,
      date: new Date(yesterday * 1000),
      reachUnique: reach
    });
  }

  return NextResponse.json({ success: true });
}
```

```json
// vercel.json - Ejecutar diariamente a las 2 AM
{
  "crons": [{
    "path": "/api/cron/sync-reach",
    "schedule": "0 2 * * *"
  }]
}
```

### **Resumen de Disponibilidad:**

| Período | ¿Disponible? | Cómo obtenerlo |
|---------|-------------|----------------|
| **Diario** | ✅ Sí | API directa con `period: 'day'` |
| **Semanal** | ✅ Sí | API directa con `period: 'week'` |
| **Mensual** | ✅ Sí | API directa con `period: 'days_28'` |
| **Anual** | ⚠️ Indirecto | Sumar datos históricos de tu DB |

---

## 📊 Estructura de Datos de Facebook Graph API

### **1. Endpoint de Posts de una Página**

```
GET https://graph.facebook.com/v23.0/{PAGE_ID}/posts
```

**Parámetros necesarios:**
- `access_token`: Token de acceso de la página
- `fields`: Campos que queremos obtener

**Campos disponibles y útiles:**

```javascript
fields = "message,created_time,likes.summary(true),comments.summary(true),shares"
```

**Respuesta de ejemplo:**

```json
{
  "data": [
    {
      "message": "Contenido del post",
      "created_time": "2025-09-28T23:25:37+0000",
      "likes": {
        "summary": {
          "total_count": 8
        }
      },
      "comments": {
        "summary": {
          "total_count": 4
        }
      },
      "shares": {
        "count": 28
      },
      "id": "PAGE_ID_POST_ID"
    }
  ],
  "paging": {
    "next": "url_para_siguiente_pagina"
  }
}
```

### **2. Información de la Página**

```
GET https://graph.facebook.com/v23.0/{PAGE_ID}
```

**Campos útiles:**
```javascript
fields = "id,name,fan_count,followers_count,link,about,category"
```

**Respuesta:**
```json
{
  "id": "218029751909916",
  "name": "Periodico Mentor",
  "fan_count": 1250,
  "followers_count": 1300,
  "link": "https://facebook.com/periodicomentor",
  "category": "Organización sin fines de lucro"
}
```

### **3. Posts de Instagram (si está conectado)**

```
GET https://graph.facebook.com/v23.0/{IG_ACCOUNT_ID}/media
```

**Campos útiles:**
```javascript
fields = "id,caption,media_type,media_url,timestamp,like_count,comments_count"
```

---

## 🏗️ Arquitectura del Sistema Multi-Agente

### **Base de Datos - Tablas Necesarias**

#### **Tabla: `agents`**
```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  role VARCHAR(50), -- 'agent' o 'admin'
  created_at TIMESTAMP
);
```

#### **Tabla: `facebook_pages`**
```sql
CREATE TABLE facebook_pages (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES agents(id),
  page_id VARCHAR(255), -- ID de la página de Facebook
  page_name VARCHAR(255),
  page_access_token TEXT, -- Token de acceso a la página (encriptado)
  instagram_account_id VARCHAR(255), -- Si tiene Instagram conectado
  fan_count INTEGER,
  followers_count INTEGER,
  connected_at TIMESTAMP,
  last_sync_at TIMESTAMP
);
```

#### **Tabla: `posts_metrics`**
```sql
CREATE TABLE posts_metrics (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES facebook_pages(id),
  post_id VARCHAR(255), -- ID del post en Facebook
  message TEXT,
  created_time TIMESTAMP,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER,
  engagement_total INTEGER, -- likes + comments + shares
  synced_at TIMESTAMP
);
```

---

## 🔐 Flujo de Autenticación y Permisos

### **Paso 1: Agente hace login y conecta su página**

```
Usuario/Agente
   ↓
Hace clic en "Conectar Facebook"
   ↓
Redirige a Facebook OAuth
   ↓
Usuario autoriza permisos:
- pages_show_list
- pages_read_engagement
- read_insights
- instagram_basic (opcional)
   ↓
Facebook redirige de vuelta con CODE
   ↓
Backend intercambia CODE por ACCESS_TOKEN
   ↓
Backend obtiene lista de páginas del usuario
   ↓
Backend obtiene PAGE_ACCESS_TOKEN para cada página
   ↓
Guarda en base de datos:
- agent_id
- page_id
- page_access_token (encriptado)
- page_name
   ↓
Sistema está listo para sincronizar métricas
```

### **Importante sobre los tokens:**

```javascript
// USER ACCESS TOKEN (temporal, expira en ~2 horas)
const userToken = "EAAn478qZCyToBP...";

// PAGE ACCESS TOKEN (puede ser permanente si la app está aprobada)
const pageToken = "EAAn478qZCyToBPrdZAj..."; // ← Este es el que guardamos

// El PAGE_ACCESS_TOKEN nos permite acceder a:
// - Posts de la página
// - Métricas de engagement
// - Información de la página
// SIN necesidad de que el usuario esté autenticado
```

---

## 📝 Guía de Implementación Paso a Paso

### **PASO 1: Crear App de Facebook para Producción**

1. Ve a: https://developers.facebook.com/apps/create/
2. Selecciona tipo: **"Business"**
3. Completa información:
   - Nombre: "RE/MAX Social Dashboard"
   - Email de contacto
4. **Caso de uso:** "Autenticar y solicitar datos con Facebook Login"
5. Crea la app

### **PASO 2: Configurar la App**

#### **2.1 Información Básica**
Ve a: `Configuración` → `Básica`

```
App ID: [COPIA_ESTE_ID]
App Secret: [COPIA_ESTE_SECRET]
Dominios de la app: tudominio.com
URL de política de privacidad: https://tudominio.com/privacy
Categoría: Business Services
```

#### **2.2 Configurar Facebook Login**
Ve a: `Casos de uso` → `Autenticar...` → `Configurar`

```
Valid OAuth Redirect URIs:
https://tudominio.com/api/auth/facebook/callback

Client OAuth Login: Sí
Web OAuth Login: Sí
```

#### **2.3 Permisos necesarios**

En Graph API Explorer o en tu código OAuth:

```javascript
const scope = [
  'public_profile',
  'email',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_engagement',
  'read_insights',
  'instagram_basic',
  'instagram_manage_insights'
].join(',');
```

### **PASO 3: Código para el Flujo de OAuth**

#### **3.1 Ruta de inicio de OAuth** (`/api/auth/facebook`)

```javascript
export async function GET(request: Request) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/facebook/callback`;

  const scope = [
    'public_profile',
    'email',
    'pages_show_list',
    'pages_read_engagement',
    'read_insights',
    'instagram_basic',
    'instagram_manage_insights'
  ].join(',');

  const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;

  return NextResponse.redirect(authUrl);
}
```

#### **3.2 Callback de OAuth** (`/api/auth/facebook/callback`)

```javascript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=no_code`);
  }

  try {
    // 1. Intercambiar CODE por ACCESS TOKEN
    const tokenResponse = await axios.get('https://graph.facebook.com/v23.0/oauth/access_token', {
      params: {
        client_id: process.env.NEXT_PUBLIC_META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/facebook/callback`,
        code: code,
      },
    });

    const userAccessToken = tokenResponse.data.access_token;

    // 2. Obtener información del usuario
    const userResponse = await axios.get('https://graph.facebook.com/v23.0/me', {
      params: {
        fields: 'id,name,email',
        access_token: userAccessToken,
      },
    });

    const user = userResponse.data;

    // 3. Obtener páginas del usuario
    const pagesResponse = await axios.get(`https://graph.facebook.com/v23.0/${user.id}/accounts`, {
      params: {
        access_token: userAccessToken,
      },
    });

    const pages = pagesResponse.data.data;

    // 4. Para cada página, guardar información
    for (const page of pages) {
      // Obtener información completa de la página
      const pageInfo = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
        params: {
          fields: 'id,name,fan_count,followers_count,link,instagram_business_account{id,username,followers_count}',
          access_token: page.access_token,
        },
      });

      // GUARDAR EN BASE DE DATOS:
      await savePageToDatabase({
        agentEmail: user.email,
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token, // ← IMPORTANTE: Guardar encriptado
        fanCount: pageInfo.data.fan_count,
        followersCount: pageInfo.data.followers_count,
        instagramAccountId: pageInfo.data.instagram_business_account?.id,
      });
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?success=connected`);

  } catch (error) {
    console.error('Error en OAuth:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=oauth_failed`);
  }
}
```

### **PASO 4: Sincronización de Métricas**

#### **4.1 Función para sincronizar posts de una página**

```javascript
async function syncPageMetrics(pageId: string, pageAccessToken: string) {
  try {
    // Obtener posts de los últimos 30 días
    const since = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);

    const postsResponse = await axios.get(`https://graph.facebook.com/v23.0/${pageId}/posts`, {
      params: {
        fields: 'message,created_time,likes.summary(true),comments.summary(true),shares',
        since: since,
        access_token: pageAccessToken,
      },
    });

    const posts = postsResponse.data.data;

    // Guardar cada post en la base de datos
    for (const post of posts) {
      const engagement = {
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        shares: post.shares?.count || 0,
      };

      await savePostMetrics({
        pageId: pageId,
        postId: post.id,
        message: post.message || '',
        createdTime: new Date(post.created_time),
        likesCount: engagement.likes,
        commentsCount: engagement.comments,
        sharesCount: engagement.shares,
        engagementTotal: engagement.likes + engagement.comments + engagement.shares,
      });
    }

    console.log(`✅ Sincronizados ${posts.length} posts de la página ${pageId}`);

  } catch (error) {
    console.error(`❌ Error sincronizando página ${pageId}:`, error);
  }
}
```

#### **4.2 Cron Job para sincronización automática**

```javascript
// /app/api/cron/sync-metrics/route.ts

export async function GET(request: Request) {
  // Verificar que sea una llamada autorizada (ej: desde Vercel Cron)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Obtener todas las páginas conectadas
    const pages = await getAllConnectedPages();

    for (const page of pages) {
      await syncPageMetrics(page.page_id, page.page_access_token);
    }

    return NextResponse.json({
      success: true,
      message: `Sincronizadas ${pages.length} páginas`
    });
  } catch (error) {
    console.error('Error en sync:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

**Configurar en Vercel:**
```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/sync-metrics",
    "schedule": "0 */6 * * *" // Cada 6 horas
  }]
}
```

---

## 🔒 Control de Acceso por Roles

### **Middleware de autenticación**

```typescript
// middleware.ts o en cada ruta API

function checkRole(user: User, requiredRole: 'agent' | 'admin') {
  if (requiredRole === 'admin' && user.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return true;
}

// Endpoint para agente individual
export async function GET(request: Request) {
  const user = await getCurrentUser(request);

  // Agente solo ve sus propias métricas
  const pages = await getPagesForAgent(user.id);
  const metrics = await getMetricsForPages(pages.map(p => p.id));

  return NextResponse.json(metrics);
}

// Endpoint para admin/jefe
export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  checkRole(user, 'admin'); // ← Verifica que sea admin

  // Admin ve todas las métricas agregadas
  const allMetrics = await getAllAgentsMetrics();

  return NextResponse.json(allMetrics);
}
```

---

## 📊 Métricas Clave para el Dashboard

### **Para cada agente (vista individual):**

```javascript
{
  agent: {
    name: "Carlos Rodriguez",
    email: "carlos@remax.com"
  },
  pages: [
    {
      pageName: "Carlos Rodriguez - RE/MAX",
      metrics: {
        totalPosts: 25,
        totalLikes: 340,
        totalComments: 45,
        totalShares: 89,
        engagementTotal: 474,
        avgEngagementPerPost: 18.96,
        topPost: {
          message: "Nueva casa en venta...",
          engagement: 67
        }
      }
    }
  ],
  period: "últimos 30 días"
}
```

### **Para el jefe (vista consolidada):**

```javascript
{
  summary: {
    totalAgents: 15,
    totalPosts: 375,
    totalEngagement: 7125,
    avgEngagementPerAgent: 475
  },
  topAgents: [
    {
      name: "Carlos Rodriguez",
      engagement: 650,
      posts: 28
    },
    {
      name: "María González",
      engagement: 580,
      posts: 25
    }
  ],
  trends: {
    engagementByWeek: [
      { week: "Semana 1", engagement: 1200 },
      { week: "Semana 2", engagement: 1450 },
      { week: "Semana 3", engagement: 1680 },
      { week: "Semana 4", engagement: 1795 }
    ]
  }
}
```

---

## ✅ Checklist de Implementación

### **Fase 1: Setup Inicial**
- [ ] Crear app Business en Facebook
- [ ] Configurar OAuth y redirect URIs
- [ ] Obtener App ID y App Secret
- [ ] Configurar variables de entorno

### **Fase 2: Base de Datos**
- [ ] Crear tablas: agents, facebook_pages, posts_metrics
- [ ] Implementar funciones de guardado
- [ ] Configurar encriptación de tokens

### **Fase 3: OAuth Flow**
- [ ] Implementar ruta de inicio OAuth
- [ ] Implementar callback y guardar páginas
- [ ] Probar con cuenta de prueba

### **Fase 4: Sincronización**
- [ ] Función para obtener posts
- [ ] Función para calcular métricas
- [ ] Configurar cron job

### **Fase 5: Dashboard**
- [ ] Vista para agentes individuales
- [ ] Vista consolidada para jefe
- [ ] Control de acceso por roles

### **Fase 6: Producción**
- [ ] Solicitar App Review si es necesario
- [ ] Migrar a dominio propio
- [ ] Configurar SSL
- [ ] Onboarding de agentes

---

## 🚨 Consideraciones Importantes

### **1. Seguridad de Tokens**

```javascript
// NUNCA guardar tokens en texto plano
// Usar encriptación:

import crypto from 'crypto';

function encryptToken(token: string): string {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    process.env.ENCRYPTION_KEY,
    process.env.ENCRYPTION_IV
  );
  return cipher.update(token, 'utf8', 'hex') + cipher.final('hex');
}

function decryptToken(encryptedToken: string): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    process.env.ENCRYPTION_KEY,
    process.env.ENCRYPTION_IV
  );
  return decipher.update(encryptedToken, 'hex', 'utf8') + decipher.final('utf8');
}
```

### **2. Rate Limits de Facebook**

Facebook tiene límites de llamadas API:
- ~200 llamadas por hora por usuario
- Implementar caché y sincronización por lotes

```javascript
// Implementar rate limiting
const rateLimiter = new Map();

async function callFacebookAPI(url: string) {
  const key = 'facebook_api';
  const now = Date.now();
  const limit = rateLimiter.get(key) || { count: 0, resetAt: now + 3600000 };

  if (limit.count >= 200 && now < limit.resetAt) {
    throw new Error('Rate limit exceeded');
  }

  limit.count++;
  rateLimiter.set(key, limit);

  return await axios.get(url);
}
```

### **3. Manejo de Errores**

```javascript
// Tokens pueden expirar o ser revocados
async function safeFacebookCall(fn: () => Promise<any>, pageId: string) {
  try {
    return await fn();
  } catch (error) {
    if (error.response?.status === 190) {
      // Token inválido - notificar al agente que reconecte
      await notifyAgentToReconnect(pageId);
    }
    throw error;
  }
}
```

---

## 📞 Resumen Ejecutivo para Claude Code

**Pásale esto a Claude Code:**

```
Necesito implementar un sistema multi-agente para RE/MAX que:

1. OAUTH FLOW:
- Cada agente hace login y conecta su página de Facebook
- Sistema obtiene PAGE_ACCESS_TOKEN permanente
- Guardar en Supabase: agent_id, page_id, page_access_token (encriptado), page_name

2. SINCRONIZACIÓN DE MÉTRICAS:
- Endpoint API: GET /v23.0/{page_id}/posts?fields=message,created_time,likes.summary(true),comments.summary(true),shares&access_token={page_token}
- Guardar en tabla posts_metrics: likes_count, comments_count, shares_count, engagement_total
- Ejecutar cada 6 horas con Vercel Cron

3. DASHBOARDS:
- Vista AGENTE: Solo sus métricas (filtrar por agent_id)
- Vista JEFE: Métricas consolidadas de todos los agentes (requiere role='admin')

4. SEGURIDAD:
- Encriptar page_access_token antes de guardar
- Middleware para verificar roles
- Rate limiting en llamadas a Facebook API

Crear endpoints:
- POST /api/auth/facebook (inicia OAuth)
- GET /api/auth/facebook/callback (procesa OAuth y guarda páginas)
- GET /api/metrics/agent (métricas del agente actual)
- GET /api/metrics/admin (métricas consolidadas, solo admin)
- GET /api/cron/sync-metrics (sincronización automática)

Usa las credenciales de la app "remax-app-2":
- App ID: 2806983572834618
- App Secret: daf7ecfaf23ad48f8dd5e602c16e3c30
```

---

## 🔗 Recursos Útiles

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Facebook App Review Process](https://developers.facebook.com/docs/app-review)

---

**Última actualización:** 7 de octubre, 2025
