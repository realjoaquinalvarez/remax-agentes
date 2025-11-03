/**
 * GET /api/auth/facebook/connect
 * Initiates Facebook OAuth flow
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/facebook/callback`

  if (!appId) {
    return NextResponse.json(
      { error: 'Facebook App ID not configured' },
      { status: 500 }
    )
  }

  // Facebook OAuth URL with required scopes
  const scopes = [
    'public_profile',
    'email',
    'pages_show_list',
    'pages_read_engagement',
    'pages_read_user_content',
    'pages_manage_metadata',
    'instagram_basic',
    'instagram_manage_insights',
    'read_insights',
  ].join(',')

  const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&response_type=code` +
    `&state=${Math.random().toString(36).substring(7)}`

  return NextResponse.redirect(authUrl)
}
