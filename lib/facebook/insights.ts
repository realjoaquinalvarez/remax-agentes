import axios from 'axios';

/**
 * Get Facebook Page insights
 * @param pageId - Facebook Page ID
 * @param accessToken - Page Access Token
 * @param period - Time period for insights (day, week, days_28)
 */
export async function getFacebookPageInsights(
  pageId: string,
  accessToken: string,
  period: 'day' | 'week' | 'days_28' = 'day'
) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${pageId}/insights`,
      {
        params: {
          metric: [
            'page_impressions',
            'page_impressions_unique',
            'page_engaged_users',
            'page_fans',
            'page_post_engagements',
            'page_posts_impressions',
            'page_views_total',
          ].join(','),
          period,
          access_token: accessToken,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching Facebook page insights:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get Facebook Page information
 * @param pageId - Facebook Page ID
 * @param accessToken - Page Access Token
 */
export async function getFacebookPageInfo(
  pageId: string,
  accessToken: string
) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${pageId}`,
      {
        params: {
          fields: [
            'id',
            'name',
            'fan_count',
            'followers_count',
            'about',
            'category',
            'link',
            'picture',
            'website',
          ].join(','),
          access_token: accessToken,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching Facebook page info:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get Facebook Page posts
 * @param pageId - Facebook Page ID
 * @param accessToken - Page Access Token
 * @param limit - Number of posts to fetch
 */
export async function getFacebookPagePosts(
  pageId: string,
  accessToken: string,
  limit: number = 25
) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${pageId}/posts`,
      {
        params: {
          fields: [
            'id',
            'message',
            'created_time',
            'full_picture',
            'permalink_url',
            'shares',
            'reactions.summary(true)',
            'comments.summary(true)',
            'insights.metric(post_impressions,post_engaged_users,post_clicks)',
          ].join(','),
          limit,
          access_token: accessToken,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching Facebook page posts:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get Facebook Page engagement metrics
 * @param pageId - Facebook Page ID
 * @param accessToken - Page Access Token
 * @param since - Start date (YYYY-MM-DD)
 * @param until - End date (YYYY-MM-DD)
 */
export async function getFacebookPageEngagement(
  pageId: string,
  accessToken: string,
  since?: string,
  until?: string
) {
  try {
    const params: any = {
      metric: [
        'page_post_engagements',
        'page_engaged_users',
        'page_consumptions',
        'page_fans_online',
      ].join(','),
      period: 'day',
      access_token: accessToken,
    };

    if (since) params.since = since;
    if (until) params.until = until;

    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${pageId}/insights`,
      { params }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error fetching Facebook page engagement:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Exchange short-lived token for long-lived token (60 days)
 * @param shortLivedToken - Short-lived access token
 */
export async function getLongLivedToken(shortLivedToken: string) {
  try {
    const response = await axios.get(
      'https://graph.facebook.com/v23.0/oauth/access_token',
      {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.NEXT_PUBLIC_META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: shortLivedToken,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error exchanging token:', error.response?.data || error.message);
    throw error;
  }
}
