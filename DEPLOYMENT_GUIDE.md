# 🚀 Deployment Guide - Dashboard Agentes RE/MAX

## ✅ Deployment Status: SUCCESSFULLY DEPLOYED

**Production URL:** https://dashboard-agentes-kappa.vercel.app

---

## 📝 Pre-Deployment Checklist

Your application has been successfully deployed with all critical checks passing:

- ✅ Build successful (`npm run build`)
- ✅ No hardcoded localhost URLs in code
- ✅ All environment variables properly configured
- ✅ TypeScript compilation successful
- ✅ Facebook OAuth working correctly
- ✅ Permanent domain alias configured

---

## 🔑 Environment Variables Configuration

### Critical: Use `printf` instead of `echo`

When setting environment variables in Vercel CLI, **ALWAYS use `printf`** to avoid adding unwanted newlines:

```bash
# ❌ WRONG - Adds newline character
echo "value" | vercel env add VAR_NAME production

# ✅ CORRECT - No newline added
printf "value" | vercel env add VAR_NAME production
```

### Required Environment Variables

```bash
# Facebook/Instagram API Configuration
NEXT_PUBLIC_META_APP_ID=2806983572834618
META_APP_SECRET=daf7ecfaf23ad48f8dd5e602c16e3c30

# Application URL (Production)
NEXTAUTH_URL=https://dashboard-agentes-kappa.vercel.app

# Auth Secret
NEXTAUTH_SECRET=5kf25szFfzXpOFj1Qd5skYisM96Ovc7c7BTdd6ZWTU0=
```

---

## 🎯 Step-by-Step Deployment Process

### 1. Initial Deployment

```bash
# Deploy to Vercel
vercel --prod --yes
```

This creates a unique URL like:
```
https://dashboard-agentes-xyz123-joaquins-projects-f3711830.vercel.app
```

### 2. Create Permanent Alias

```bash
# Create a permanent, friendly URL
vercel alias dashboard-agentes-xyz123-joaquins-projects-f3711830.vercel.app dashboard-agentes-kappa.vercel.app
```

### 3. Configure Environment Variables

**IMPORTANT:** Use `printf` to avoid newline issues:

```bash
# Remove old variables (if needed)
echo "y" | vercel env rm VARIABLE_NAME production

# Add new variables (CORRECT METHOD)
printf "2806983572834618" | vercel env add NEXT_PUBLIC_META_APP_ID production
printf "daf7ecfaf23ad48f8dd5e602c16e3c30" | vercel env add META_APP_SECRET production
printf "https://dashboard-agentes-kappa.vercel.app" | vercel env add NEXTAUTH_URL production
printf "5kf25szFfzXpOFj1Qd5skYisM96Ovc7c7BTdd6ZWTU0=" | vercel env add NEXTAUTH_SECRET production
```

### 4. Redeploy with New Variables

```bash
# Deploy again to apply environment variables
vercel --prod --yes

# Update alias to point to new deployment
vercel alias dashboard-agentes-NEWID-joaquins-projects-f3711830.vercel.app dashboard-agentes-kappa.vercel.app
```

---

## 🔧 Facebook App Configuration

### 1. Navigate to Facebook Developer Console

Go to: https://developers.facebook.com/apps/2806983572834618

### 2. Configure App Domain

**Settings → Basic:**
- **App Domains:** `dashboard-agentes-kappa.vercel.app`

### 3. Configure Facebook Login

**Products → Facebook Login → Settings:**

Add to **"Valid OAuth Redirect URIs"**:
```
https://dashboard-agentes-kappa.vercel.app/api/auth/instagram/callback
```

**Domains allowed for JavaScript SDK:**
```
dashboard-agentes-kappa.vercel.app
```

(Note: No `https://` prefix and no trailing slash)

### 4. Required Permissions

Your app requests these permissions (defined in `app/api/auth/instagram/route.ts`):

```javascript
const scope = [
  'public_profile',              // Basic profile info
  'email',                       // User email
  'pages_read_engagement',       // Read page engagement
  'pages_manage_engagement',     // Manage page engagement
  'read_insights',              // Read insights/metrics
  'instagram_basic',            // Instagram basic access
  'instagram_manage_insights'   // Instagram insights
].join(',');
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "URL domain not included in app domains"

**Error Message:**
```
No se puede cargar la URL
El dominio de esta URL no está incluido en los dominios de la app
```

**Solution:**
1. Go to Facebook App Settings → Basic
2. Add domain: `dashboard-agentes-kappa.vercel.app`
3. Save changes
4. Try OAuth again

### Issue 2: "Redirect URI Mismatch"

**Error in URL:**
```
redirect_uri=https%3A%2F%2Fdashboard-agentes-kappa.vercel.app%0A%2Fapi%2F...
                                                          ^^^ Newline character!
```

**Cause:** Used `echo` instead of `printf` when setting `NEXTAUTH_URL`

**Solution:**
```bash
# Remove old variable
echo "y" | vercel env rm NEXTAUTH_URL production

# Add with printf (no newline)
printf "https://dashboard-agentes-kappa.vercel.app" | vercel env add NEXTAUTH_URL production

# Redeploy
vercel --prod --yes
vercel alias NEW_DEPLOYMENT_URL dashboard-agentes-kappa.vercel.app
```

### Issue 3: "Error validating client secret"

**Error Detail:** `Error validating client secret`

**Cause:** `META_APP_SECRET` has trailing newline or incorrect value

**Solution:**
```bash
# Remove old secret
echo "y" | vercel env rm META_APP_SECRET production

# Add correct secret with printf
printf "daf7ecfaf23ad48f8dd5e602c16e3c30" | vercel env add META_APP_SECRET production

# Redeploy
vercel --prod --yes
vercel alias NEW_DEPLOYMENT_URL dashboard-agentes-kappa.vercel.app
```

### Issue 4: Can't Find OAuth Settings in Facebook

**Problem:** OAuth Redirect URI setting not visible

**Solution:**
1. Go to **Products** section in left sidebar
2. Click **"Add Product"**
3. Select **"Facebook Login"**
4. After adding, it appears in the sidebar
5. Click **"Facebook Login" → "Settings"**
6. Now you can see the OAuth settings

---

## 🔍 Debugging Tips

### Check Environment Variables in Production

Create a temporary debug endpoint:

```typescript
// app/api/debug-env/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasClientId: !!process.env.NEXT_PUBLIC_META_APP_ID,
    clientIdLength: process.env.NEXT_PUBLIC_META_APP_ID?.length || 0,
    hasSecret: !!process.env.META_APP_SECRET,
    secretLength: process.env.META_APP_SECRET?.length || 0,
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });
}
```

Then check: `https://dashboard-agentes-kappa.vercel.app/api/debug-env`

**Expected output:**
```json
{
  "hasClientId": true,
  "clientIdLength": 16,
  "hasSecret": true,
  "secretLength": 32,
  "hasNextAuthUrl": true,
  "nextAuthUrl": "https://dashboard-agentes-kappa.vercel.app"
}
```

**⚠️ Remember to delete this endpoint after debugging!**

### View Production Logs

```bash
# Real-time logs (limited)
vercel logs dashboard-agentes-kappa.vercel.app

# Or view in Vercel dashboard
https://vercel.com/joaquins-projects-f3711830/dashboard-agentes/logs
```

### Test Facebook Token Exchange

```bash
# Test with a fake code (should return error but confirm endpoint works)
curl "https://graph.facebook.com/v23.0/oauth/access_token?client_id=YOUR_APP_ID&client_secret=YOUR_SECRET&redirect_uri=YOUR_REDIRECT_URI&code=test123"
```

Expected error response:
```json
{
  "error": {
    "message": "Invalid verification code format.",
    "type": "OAuthException",
    "code": 100
  }
}
```

This confirms the endpoint is reachable and credentials are valid format.

---

## 📊 Post-Deployment Verification

After deploying, test these URLs:

1. ✅ **Homepage:** https://dashboard-agentes-kappa.vercel.app
2. ✅ **Login:** https://dashboard-agentes-kappa.vercel.app/login
3. ✅ **Dashboard:** https://dashboard-agentes-kappa.vercel.app/dashboard
4. ✅ **Connections:** https://dashboard-agentes-kappa.vercel.app/dashboard/conexiones
5. ✅ **Facebook OAuth Flow:**
   - Click "Conectar Facebook"
   - Should redirect to Facebook
   - Authorize permissions
   - Should redirect back with success message
   - Should see connected pages with metrics

---

## 🔄 Updating After Changes

When you make code changes:

```bash
# 1. Commit changes
git add .
git commit -m "Your changes"
git push

# 2. Deploy to production
vercel --prod --yes

# 3. Update alias to new deployment
vercel alias NEW_DEPLOYMENT_URL dashboard-agentes-kappa.vercel.app
```

**Note:** If you have automatic deployments configured in Vercel dashboard, steps 2-3 happen automatically on git push.

---

## 🎉 Current Production Status

**Deployment Status:** ✅ **LIVE AND WORKING**

**Production URL:** https://dashboard-agentes-kappa.vercel.app

**Features Working:**
- ✅ Dashboard loads correctly
- ✅ Facebook OAuth flow working
- ✅ Instagram Business account detection
- ✅ Posts from last 60 days displayed
- ✅ Metrics: engagement, reach, impressions
- ✅ Organic vs Paid impressions breakdown

**Vercel Project:**
- Dashboard: https://vercel.com/joaquins-projects-f3711830/dashboard-agentes
- Settings: https://vercel.com/joaquins-projects-f3711830/dashboard-agentes/settings
- Logs: https://vercel.com/joaquins-projects-f3711830/dashboard-agentes/logs

---

## 📞 Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Facebook Graph API:** https://developers.facebook.com/docs/graph-api
- **Facebook Login:** https://developers.facebook.com/docs/facebook-login

---

**Last Updated:** November 1, 2025
**Deployment Method:** Vercel CLI
**Node Version:** 20+
**Next.js Version:** 15.5.4
