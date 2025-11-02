# 📊 Facebook Post Metrics - Comprehensive Guide

**Last Updated:** November 2, 2025
**Status:** ✅ Implemented
**API Version:** Graph API v23.0

---

## 📝 Overview

This document outlines all the metrics we collect from Facebook posts, what they mean, what limitations exist, and how they help track lead generation from Facebook/Instagram to WhatsApp.

---

## 🎯 Primary Objective

**Goal:** Track statistics from posts and identify potential clients, especially those who interact with posts and go to WhatsApp.

**Current Capability:** We can track engagement metrics and total clicks, but **cannot identify individual users** who click WhatsApp buttons due to Facebook API privacy limitations.

---

## 📊 Metrics We Collect

### 1. **Post Insights** (via `/post-id/insights`)

These are the **MOST IMPORTANT** metrics for tracking post performance:

| Metric | Field Name | Description | Can Track Individual Users? |
|--------|-----------|-------------|---------------------------|
| **Total Clicks** | `post_clicks` | Total clicks anywhere on the post | ❌ No - only total count |
| **Clicks by Type** | `post_clicks_by_type` | Breakdown of clicks (links, photos, videos, other) | ❌ No - only counts by category |
| **Consumptions by Type** | `post_consumptions_by_type` | Types of specific interactions | ❌ No - only counts |
| **Unique Reach** | `post_impressions_unique` | Unique people who saw the post | ❌ No - only total |
| **Total Impressions** | `post_impressions` | Total times the post was displayed | ❌ No - only total |
| **Organic Impressions** | `post_impressions_organic` | Impressions without paid promotion | ❌ No - only total |
| **Paid Impressions** | `post_impressions_paid` | Impressions from ads/promotion | ❌ No - only total |

**Example of `post_clicks_by_type`:**
```json
{
  "other clicks": 45,
  "link clicks": 23,
  "photo view": 12,
  "video play": 8
}
```

### 2. **Call to Action (CTA)** (via post fields)

```typescript
{
  type: string,      // e.g., "CALL_NOW", "MESSAGE", "WHATSAPP_MESSAGE"
  value: {
    link: string     // The actual URL/link
  }
}
```

**Key for WhatsApp Tracking:**
- ✅ We **CAN** see if a post has a WhatsApp CTA button
- ✅ We **CAN** see the WhatsApp link (e.g., `wa.me/1234567890`)
- ✅ We **CAN** see total clicks on the CTA (in `post_clicks_by_type`)
- ❌ We **CANNOT** see who specifically clicked it

### 3. **Engagement Metrics** (via post fields)

| Metric | Field Name | Can Identify Users? |
|--------|-----------|-------------------|
| Likes | `likes.summary.total_count` | ❌ Total only (need separate API call for list) |
| Comments | `comments.summary.total_count` | ✅ **YES** - via `/post-id/comments` |
| Shares | `shares.count` | ⚠️ **LIMITED** - can see some, not all |
| Reactions Total | `reactions.summary.total_count` | ❌ Total only |
| Reactions Breakdown | `reactions.data` | ✅ **YES** - can see who reacted |

**Reactions Types:**
- 👍 LIKE
- ❤️ LOVE
- 😮 WOW
- 😆 HAHA
- 😢 SAD
- 😡 ANGRY
- 🤗 CARE

### 4. **Post Metadata**

| Field | Description | Usage |
|-------|-------------|-------|
| `id` | Unique post ID | Identification |
| `message` | Text content of the post | Display/context |
| `created_time` | When the post was published | Timeline tracking |
| `permalink_url` | Direct link to the post on Facebook | Reference/navigation |

---

## ✅ What We **CAN** Track

### 1. **Users Who Engage Publicly:**
- ✅ **Who commented** (via `/post-id/comments` endpoint)
  ```typescript
  {
    id: string,
    from: { id: string, name: string },
    message: string,
    created_time: string
  }
  ```
- ✅ **Who reacted** (via `/post-id/reactions` endpoint)
  ```typescript
  {
    id: string,
    name: string,
    type: 'LIKE' | 'LOVE' | 'WOW' | ...
  }
  ```
- ⚠️ **Who shared** (limited - some shares are private)

### 2. **Aggregate Metrics:**
- ✅ Total clicks on the post
- ✅ Click breakdown by type (links, photos, videos)
- ✅ How many people saw it (reach)
- ✅ How many times it was shown (impressions)
- ✅ Organic vs Paid traffic
- ✅ Total engagement (reactions + comments + shares)

### 3. **CTA Information:**
- ✅ If the post has a Call-to-Action button
- ✅ What type of CTA (WhatsApp, Call, Message, etc.)
- ✅ The destination URL/number
- ✅ Total clicks on the CTA

---

## ❌ What We **CANNOT** Track

### ⚠️ **Critical Limitation for WhatsApp Tracking:**

**We CANNOT identify individual users who:**
- Clicked on a link in the post
- Clicked on a WhatsApp CTA button
- Clicked on any other clickable element
- Viewed photos or videos (without liking/commenting)

**Why?**
Facebook's API **does not provide user-level click data** for privacy reasons. We only get aggregate counts.

**Example:**
- Post has WhatsApp CTA button
- 50 people clicked it
- ❌ We **cannot** see the names/IDs of those 50 people
- ✅ We **can** see that there were 50 clicks

---

## 🔄 Correlation Strategy

Since we can't directly track who clicked WhatsApp buttons, here's our **correlation strategy**:

### Option 1: **Comment/Reaction Correlation**
```
IF user commented on post AND within 24 hours contacted WhatsApp
  → Likely came from this post
```

### Option 2: **UTM Parameter Tracking**
```
Instead of: wa.me/1234567890
Use: wa.me/1234567890?text=Hi%20I%20saw%20your%20post%20POST_ID_ABC123

Then track which POST_ID appears in WhatsApp conversations
```

### Option 3: **Time-based Correlation**
```
Post published: 2025-11-02 10:00 AM
Post got 15 clicks on WhatsApp CTA between 10:00-11:00 AM
WhatsApp received 12 new contacts between 10:00-11:00 AM
→ Likely correlation
```

### Option 4: **Click-to-WhatsApp Ads** (Future)
Facebook's Click-to-WhatsApp Ads provide slightly more data:
- ✅ Can see if conversion happened
- ✅ Can see cost per message
- ❌ Still cannot identify specific users

---

## 📱 Implementation in Dashboard

### Backend (API Callback)

**File:** `app/api/auth/instagram/callback/route.ts`

**What we fetch:**
1. Basic post data with extended fields:
   ```typescript
   fields: 'id,message,created_time,permalink_url,call_to_action,
            likes.summary(true),comments.summary(true),shares,
            reactions.summary(true)'
   ```

2. Comprehensive insights:
   ```typescript
   metric: 'post_impressions_unique,post_impressions,
            post_impressions_organic,post_impressions_paid,
            post_clicks,post_clicks_by_type,
            post_consumptions_by_type'
   ```

3. Reactions breakdown from reactions data

**Fallback behavior:**
- If any metric is unavailable → show `-`
- Always attempt to fetch all metrics
- Log errors but continue processing

### Frontend (Dashboard Display)

**File:** `app/dashboard/conexiones/page.tsx`

**Display sections:**

1. **Basic Engagement:**
   - ❤️ Likes
   - 💬 Comments
   - 🔄 Shares
   - Total engagement with tooltip breakdown

2. **Reach & Impressions:**
   - 👁️ Unique Reach
   - 📊 Total Impressions
   - 🌱 Organic Impressions
   - 💰 Paid Impressions

3. **Click Metrics:**
   - 🖱️ Total Clicks
   - 🔍 Clicks by Type (grid layout with breakdown)

4. **Reactions Detail:**
   - Visual breakdown with emoji indicators
   - Hover tooltips for reaction types

5. **Call to Action:**
   - 📞 CTA Type display
   - Link preview
   - ⚠️ Warning badge explaining WhatsApp limitation

6. **Post Link:**
   - 🔗 Direct link to view post on Facebook

---

## 🚀 Future Enhancements

### Short Term:
1. **Database Implementation**
   - Store posts and metrics in database
   - Track metrics over time
   - Compare performance across posts

2. **Comments/Reactions Endpoint**
   - Fetch actual users who commented
   - Fetch users who reacted
   - Store for lead correlation

3. **Automated Updates**
   - CRON job to refresh metrics daily
   - Real-time updates when user opens dashboard

### Long Term:
1. **WhatsApp Business API Integration**
   - Capture incoming WhatsApp messages
   - Match timestamps with post click times
   - Correlate using UTM parameters

2. **Lead Scoring**
   - Score leads based on engagement level
   - Comment + WhatsApp contact = high score
   - Just viewed = low score

3. **Analytics Dashboard**
   - Charts showing clicks over time
   - Conversion funnel: Views → Clicks → WhatsApp → Sale
   - Best performing posts

---

## 📚 Facebook API References

### Primary Endpoints:

1. **Post Object:**
   - https://developers.facebook.com/docs/graph-api/reference/post

2. **Post Insights:**
   - https://developers.facebook.com/docs/graph-api/reference/post/insights

3. **Comments:**
   - https://developers.facebook.com/docs/graph-api/reference/post/comments

4. **Reactions:**
   - https://developers.facebook.com/docs/graph-api/reference/post/reactions

### Available Insights Metrics:

**Impressions:**
- `post_impressions` - Total impressions
- `post_impressions_unique` - Unique reach
- `post_impressions_paid` - Paid impressions
- `post_impressions_organic` - Organic impressions
- `post_impressions_viral` - Viral impressions
- `post_impressions_nonviral` - Non-viral impressions

**Engagement:**
- `post_engaged_users` - People who engaged
- `post_clicks` - Total clicks
- `post_clicks_by_type` - Clicks breakdown
- `post_reactions_by_type_total` - Reactions breakdown

**Video (if applicable):**
- `post_video_views` - Video views
- `post_video_views_organic` - Organic video views
- `post_video_views_paid` - Paid video views
- `post_video_avg_time_watched` - Average watch time

---

## ⚠️ Important Limitations

### Privacy Restrictions:
1. **User-level click data is NOT available** via API
2. **Private shares are NOT visible** in the API
3. **Reactions/comments may be hidden** based on user privacy settings

### Data Availability:
1. **Insights only available for 28 days** after post creation for some metrics
2. **Organic/Paid breakdown might not be available** for very recent posts
3. **Some metrics require Page Public Content Access** feature permission

### Rate Limits:
- **200 calls per hour** per Page Access Token
- **Each post insights call counts** toward the limit
- **Plan accordingly** for pages with many posts

---

## 🎯 Best Practices

### For Maximum Tracking:

1. **Use UTM Parameters in WhatsApp Links:**
   ```
   wa.me/1234567890?text=Hola,%20vengo%20del%20post%20sobre%20[TOPIC]
   ```

2. **Encourage Comments:**
   - Ask questions in posts
   - Comments are the ONLY trackable user action for clicks

3. **Monitor Engagement Patterns:**
   - High clicks but low comments = people clicking links
   - Use time correlation with WhatsApp traffic

4. **Regular Data Collection:**
   - Fetch insights daily
   - Some metrics only available for limited time

---

## 🔐 Required Permissions

To access all these metrics, your app needs:

```javascript
[
  'public_profile',              // Basic profile info
  'email',                       // User email
  'pages_read_engagement',       // Read page engagement
  'pages_manage_engagement',     // Manage page engagement
  'read_insights',              // Read insights/metrics
  'instagram_basic',            // Instagram basic access
  'instagram_manage_insights'   // Instagram insights
]
```

---

## ✅ Summary

**What this implementation gives you:**

✅ Complete visibility into post performance
✅ Total clicks on WhatsApp CTAs (but not who clicked)
✅ List of users who commented/reacted (potential leads)
✅ Organic vs Paid traffic breakdown
✅ All data displayed with `-` fallback when unavailable
✅ 60-day historical data
✅ Real-time data on reconnection

**What you need to build next for full lead tracking:**

🔨 Database to store metrics over time
🔨 WhatsApp Business API integration
🔨 Correlation logic between Facebook engagement and WhatsApp contacts
🔨 Lead scoring based on engagement level

---

**Questions or need clarification?**
Check the Facebook Graph API documentation or review the implementation in:
- `app/api/auth/instagram/callback/route.ts` (data fetching)
- `app/dashboard/conexiones/page.tsx` (data display)
