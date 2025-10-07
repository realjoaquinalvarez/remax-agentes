import { NextResponse } from 'next/server';

export async function GET() {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`;

  // Include Facebook Pages and Instagram permissions
  const scope = [
    'public_profile',
    'email',
    'pages_read_engagement',
    'pages_manage_engagement',
    'read_insights',
    'instagram_basic',
    'instagram_manage_insights'
  ].join(',');

  // URL de autorización de Facebook
  const authUrl = `https://www.facebook.com/v23.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;

  return NextResponse.redirect(authUrl);
}
