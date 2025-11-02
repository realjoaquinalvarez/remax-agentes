import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`;

  // Include Facebook Pages and Instagram permissions
  const scope = [
    'public_profile',
    'email',
    'pages_show_list',              // Required to list pages
    'pages_read_engagement',        // Read engagement data
    'pages_read_user_content',      // Required for post_clicks_by_type and detailed metrics
    'read_insights',                // Read page insights
    'instagram_basic',              // Basic Instagram access
    'instagram_manage_insights'     // Instagram insights
  ].join(',');

  // URL de autorización de Facebook
  const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;

  return NextResponse.redirect(authUrl);
}
