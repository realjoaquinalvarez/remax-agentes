import axios from 'axios';

/**
 * Get Instagram Business Account insights
 * @param instagramId - Instagram Business Account ID
 * @param accessToken - Page Access Token
 * @param period - Time period for insights (day, week, days_28)
 */
export async function getInstagramInsights(
  instagramId: string,
  accessToken: string,
  period: 'day' | 'week' | 'days_28' = 'day'
) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${instagramId}/insights`,
      {
        params: {
          metric: [
            'impressions',
            'reach',
            'follower_count',
            'profile_views',
            'website_clicks',
          ].join(','),
          period,
          access_token: accessToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Instagram insights:', errorMessage);
    throw error;
  }
}

/**
 * Get Instagram account information
 * @param instagramId - Instagram Business Account ID
 * @param accessToken - Page Access Token
 */
export async function getInstagramAccountInfo(
  instagramId: string,
  accessToken: string
) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${instagramId}`,
      {
        params: {
          fields: [
            'id',
            'username',
            'name',
            'biography',
            'followers_count',
            'follows_count',
            'media_count',
            'profile_picture_url',
          ].join(','),
          access_token: accessToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Instagram account info:', errorMessage);
    throw error;
  }
}

/**
 * Get Instagram media (posts)
 * @param instagramId - Instagram Business Account ID
 * @param accessToken - Page Access Token
 * @param limit - Number of posts to fetch
 */
export async function getInstagramMedia(
  instagramId: string,
  accessToken: string,
  limit: number = 25
) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v23.0/${instagramId}/media`,
      {
        params: {
          fields: [
            'id',
            'caption',
            'media_type',
            'media_url',
            'permalink',
            'timestamp',
            'like_count',
            'comments_count',
            'insights.metric(impressions,reach,engagement)',
          ].join(','),
          limit,
          access_token: accessToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Instagram media:', errorMessage);
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error exchanging token:', errorMessage);
    throw error;
  }
}
