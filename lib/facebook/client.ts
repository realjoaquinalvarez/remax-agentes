/**
 * Facebook Graph API Client
 * Handles all interactions with Facebook Graph API for fetching page and Instagram metrics
 */

export interface FacebookPageMetrics {
  page_id: string
  followers_count: number
  page_impressions: number
  page_engaged_users: number
  page_post_engagements: number
  page_views_total: number
  fetched_at: Date
}

export interface FacebookPostMetrics {
  post_id: string
  created_time: string
  message?: string
  type: string
  likes: number
  comments: number
  shares: number
  reactions: number
  reach: number
  impressions: number
  engagement: number
}

export interface InstagramMetrics {
  account_id: string
  followers_count: number
  media_count: number
  impressions: number
  reach: number
  profile_views: number
  website_clicks: number
  fetched_at: Date
}

export interface InstagramMediaMetrics {
  media_id: string
  media_type: string
  caption?: string
  timestamp: string
  like_count: number
  comments_count: number
  impressions: number
  reach: number
  engagement: number
  saved: number
}

interface GraphAPIError {
  message: string
  type: string
  code: number
  fbtrace_id: string
}

/**
 * Facebook Graph API Client
 */
export class FacebookGraphClient {
  private baseUrl = 'https://graph.facebook.com/v21.0'

  /**
   * Fetch page insights for a given date range
   */
  async getPageMetrics(
    pageId: string,
    accessToken: string,
    since: Date,
    until: Date
  ): Promise<FacebookPageMetrics> {
    try {
      // Get page info (followers count)
      const pageInfoUrl = `${this.baseUrl}/${pageId}?fields=followers_count,fan_count&access_token=${accessToken}`
      const pageInfoResponse = await fetch(pageInfoUrl)

      if (!pageInfoResponse.ok) {
        const error = await pageInfoResponse.json() as { error: GraphAPIError }
        throw new Error(`Facebook API Error: ${error.error.message} (${error.error.code})`)
      }

      const pageInfo = await pageInfoResponse.json() as {
        followers_count?: number
        fan_count?: number
      }

      // Get page insights
      const sinceTimestamp = Math.floor(since.getTime() / 1000)
      const untilTimestamp = Math.floor(until.getTime() / 1000)

      const insightsUrl = `${this.baseUrl}/${pageId}/insights?metric=page_impressions,page_engaged_users,page_post_engagements,page_views_total&period=day&since=${sinceTimestamp}&until=${untilTimestamp}&access_token=${accessToken}`

      const insightsResponse = await fetch(insightsUrl)

      if (!insightsResponse.ok) {
        const error = await insightsResponse.json() as { error: GraphAPIError }
        throw new Error(`Facebook API Error: ${error.error.message} (${error.error.code})`)
      }

      const insights = await insightsResponse.json() as {
        data: Array<{
          name: string
          values: Array<{ value: number }>
        }>
      }

      // Parse insights
      const metrics: Record<string, number> = {}
      insights.data.forEach((metric) => {
        // Sum all values for the period
        const total = metric.values.reduce((sum, v) => sum + (v.value || 0), 0)
        metrics[metric.name] = total
      })

      return {
        page_id: pageId,
        followers_count: pageInfo.followers_count || pageInfo.fan_count || 0,
        page_impressions: metrics.page_impressions || 0,
        page_engaged_users: metrics.page_engaged_users || 0,
        page_post_engagements: metrics.page_post_engagements || 0,
        page_views_total: metrics.page_views_total || 0,
        fetched_at: new Date(),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch page metrics: ${error.message}`)
      }
      throw new Error('Failed to fetch page metrics: Unknown error')
    }
  }

  /**
   * Fetch recent posts with their metrics
   */
  async getPagePosts(
    pageId: string,
    accessToken: string,
    limit: number = 25
  ): Promise<FacebookPostMetrics[]> {
    try {
      const postsUrl = `${this.baseUrl}/${pageId}/posts?fields=id,created_time,message,type,likes.summary(true),comments.summary(true),shares,reactions.summary(true),insights.metric(post_impressions,post_engaged_users)&limit=${limit}&access_token=${accessToken}`

      const response = await fetch(postsUrl)

      if (!response.ok) {
        const error = await response.json() as { error: GraphAPIError }
        throw new Error(`Facebook API Error: ${error.error.message} (${error.error.code})`)
      }

      const data = await response.json() as {
        data: Array<{
          id: string
          created_time: string
          message?: string
          type: string
          likes?: { summary: { total_count: number } }
          comments?: { summary: { total_count: number } }
          shares?: { count: number }
          reactions?: { summary: { total_count: number } }
          insights?: {
            data: Array<{
              name: string
              values: Array<{ value: number }>
            }>
          }
        }>
      }

      return data.data.map((post) => {
        const impressions = post.insights?.data.find((i) => i.name === 'post_impressions')?.values[0]?.value || 0
        const reach = post.insights?.data.find((i) => i.name === 'post_engaged_users')?.values[0]?.value || 0
        const likes = post.likes?.summary?.total_count || 0
        const comments = post.comments?.summary?.total_count || 0
        const shares = post.shares?.count || 0
        const reactions = post.reactions?.summary?.total_count || 0

        return {
          post_id: post.id,
          created_time: post.created_time,
          message: post.message,
          type: post.type,
          likes,
          comments,
          shares,
          reactions,
          reach,
          impressions,
          engagement: likes + comments + shares,
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch page posts: ${error.message}`)
      }
      throw new Error('Failed to fetch page posts: Unknown error')
    }
  }

  /**
   * Fetch Instagram account metrics
   */
  async getInstagramMetrics(
    instagramAccountId: string,
    accessToken: string,
    since: Date,
    until: Date
  ): Promise<InstagramMetrics> {
    try {
      // Get account info
      const accountUrl = `${this.baseUrl}/${instagramAccountId}?fields=followers_count,media_count&access_token=${accessToken}`
      const accountResponse = await fetch(accountUrl)

      if (!accountResponse.ok) {
        const error = await accountResponse.json() as { error: GraphAPIError }
        throw new Error(`Instagram API Error: ${error.error.message} (${error.error.code})`)
      }

      const accountInfo = await accountResponse.json() as {
        followers_count: number
        media_count: number
      }

      // Get insights
      const sinceTimestamp = Math.floor(since.getTime() / 1000)
      const untilTimestamp = Math.floor(until.getTime() / 1000)

      const insightsUrl = `${this.baseUrl}/${instagramAccountId}/insights?metric=impressions,reach,profile_views,website_clicks&period=day&since=${sinceTimestamp}&until=${untilTimestamp}&access_token=${accessToken}`

      const insightsResponse = await fetch(insightsUrl)

      if (!insightsResponse.ok) {
        const error = await insightsResponse.json() as { error: GraphAPIError }
        throw new Error(`Instagram API Error: ${error.error.message} (${error.error.code})`)
      }

      const insights = await insightsResponse.json() as {
        data: Array<{
          name: string
          values: Array<{ value: number }>
        }>
      }

      // Parse insights
      const metrics: Record<string, number> = {}
      insights.data.forEach((metric) => {
        const total = metric.values.reduce((sum, v) => sum + (v.value || 0), 0)
        metrics[metric.name] = total
      })

      return {
        account_id: instagramAccountId,
        followers_count: accountInfo.followers_count || 0,
        media_count: accountInfo.media_count || 0,
        impressions: metrics.impressions || 0,
        reach: metrics.reach || 0,
        profile_views: metrics.profile_views || 0,
        website_clicks: metrics.website_clicks || 0,
        fetched_at: new Date(),
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Instagram metrics: ${error.message}`)
      }
      throw new Error('Failed to fetch Instagram metrics: Unknown error')
    }
  }

  /**
   * Fetch recent Instagram media with metrics
   */
  async getInstagramMedia(
    instagramAccountId: string,
    accessToken: string,
    limit: number = 25
  ): Promise<InstagramMediaMetrics[]> {
    try {
      const mediaUrl = `${this.baseUrl}/${instagramAccountId}/media?fields=id,media_type,caption,timestamp,like_count,comments_count,insights.metric(impressions,reach,engagement,saved)&limit=${limit}&access_token=${accessToken}`

      const response = await fetch(mediaUrl)

      if (!response.ok) {
        const error = await response.json() as { error: GraphAPIError }
        throw new Error(`Instagram API Error: ${error.error.message} (${error.error.code})`)
      }

      const data = await response.json() as {
        data: Array<{
          id: string
          media_type: string
          caption?: string
          timestamp: string
          like_count?: number
          comments_count?: number
          insights?: {
            data: Array<{
              name: string
              values: Array<{ value: number }>
            }>
          }
        }>
      }

      return data.data.map((media) => {
        const impressions = media.insights?.data.find((i) => i.name === 'impressions')?.values[0]?.value || 0
        const reach = media.insights?.data.find((i) => i.name === 'reach')?.values[0]?.value || 0
        const engagement = media.insights?.data.find((i) => i.name === 'engagement')?.values[0]?.value || 0
        const saved = media.insights?.data.find((i) => i.name === 'saved')?.values[0]?.value || 0

        return {
          media_id: media.id,
          media_type: media.media_type,
          caption: media.caption,
          timestamp: media.timestamp,
          like_count: media.like_count || 0,
          comments_count: media.comments_count || 0,
          impressions,
          reach,
          engagement,
          saved,
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch Instagram media: ${error.message}`)
      }
      throw new Error('Failed to fetch Instagram media: Unknown error')
    }
  }

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/me?access_token=${accessToken}`
      const response = await fetch(url)
      return response.ok
    } catch {
      return false
    }
  }
}

/**
 * Create a singleton instance
 */
export const facebookClient = new FacebookGraphClient()
