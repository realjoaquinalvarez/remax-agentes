/**
 * GET /api/auth/facebook/callback
 * Handles Facebook OAuth callback
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin-panel/conexiones?error=${error}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin-panel/conexiones?error=no_code`
    )
  }

  try {
    const appId = process.env.NEXT_PUBLIC_META_APP_ID
    const appSecret = process.env.META_APP_SECRET
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/facebook/callback`

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${code}`

    const tokenResponse = await fetch(tokenUrl)
    const tokenData = await tokenResponse.json() as {
      access_token?: string
      error?: { message: string }
    }

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error?.message || 'Failed to get access token')
    }

    const accessToken = tokenData.access_token

    // Get user info
    const userUrl = `https://graph.facebook.com/v21.0/me?fields=id,name,email&access_token=${accessToken}`
    const userResponse = await fetch(userUrl)
    const userData = await userResponse.json() as {
      id: string
      name: string
      email?: string
      error?: { message: string }
    }

    if (!userResponse.ok) {
      throw new Error(userData.error?.message || 'Failed to get user info')
    }

    // Get user's Facebook pages
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
    const pagesResponse = await fetch(pagesUrl)
    const pagesData = await pagesResponse.json() as {
      data?: Array<{
        id: string
        name: string
        access_token: string
      }>
      error?: { message: string }
    }

    if (!pagesResponse.ok || !pagesData.data || pagesData.data.length === 0) {
      throw new Error('No Facebook pages found. You need to have a Facebook page to use this feature.')
    }

    // Use the first page
    const page = pagesData.data[0]

    // Try to get Instagram account connected to the page
    let instagramAccountId = null
    let instagramUsername = null

    try {
      const igUrl = `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
      const igResponse = await fetch(igUrl)
      const igData = await igResponse.json() as {
        instagram_business_account?: { id: string }
      }

      if (igData.instagram_business_account) {
        instagramAccountId = igData.instagram_business_account.id

        // Get Instagram username
        const igProfileUrl = `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=username&access_token=${page.access_token}`
        const igProfileResponse = await fetch(igProfileUrl)
        const igProfileData = await igProfileResponse.json() as {
          username?: string
        }

        instagramUsername = igProfileData.username || null
      }
    } catch (igError) {
      console.log('Instagram account not found or not accessible:', igError)
    }

    // Save to database
    const supabase = createAdminClient()

    const { data: agent, error: dbError } = await supabase
      .from('agents')
      .upsert({
        email: userData.email || `${userData.id}@facebook.com`,
        name: userData.name,
        facebook_page_id: page.id,
        facebook_page_name: page.name,
        facebook_access_token: page.access_token,
        instagram_account_id: instagramAccountId,
        instagram_username: instagramUsername,
        is_facebook_connected: true,
        facebook_connected_at: new Date().toISOString(),
        status: 'active',
      }, {
        onConflict: 'email'
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin-panel/conexiones?success=true&agent_id=${agent.id}`
    )
  } catch (error) {
    console.error('Facebook OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin-panel/conexiones?error=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`
    )
  }
}
