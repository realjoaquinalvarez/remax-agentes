import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Error de autorización:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=no_code`);
  }

  try {
    // Intercambiar code por access token
    const tokenUrl = 'https://graph.facebook.com/v23.0/oauth/access_token';
    const tokenResponse = await axios.get(tokenUrl, {
      params: {
        client_id: process.env.NEXT_PUBLIC_META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`,
        code: code,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Get basic user information (only public_profile fields)
    const userResponse = await axios.get('https://graph.facebook.com/v23.0/me', {
      params: {
        fields: 'id,name',
        access_token: accessToken,
      },
    });

    console.log('✅ OAuth Successful!');
    console.log('User:', userResponse.data);
    console.log('Access Token:', accessToken.substring(0, 20) + '...');

    // Fetch user's Facebook pages
    try {
      const pagesResponse = await axios.get(`https://graph.facebook.com/v23.0/${userResponse.data.id}/accounts`, {
        params: {
          access_token: accessToken,
        },
      });

      console.log('📄 Páginas encontradas:', pagesResponse.data);

      // For each page, log basic info
      for (const page of pagesResponse.data.data || []) {
        console.log(`\n📊 Página: ${page.name}`);
        console.log(`   ID: ${page.id}`);
        console.log(`   Access Token: ${page.access_token.substring(0, 20)}...`);
      }
    } catch (error: any) {
      console.log('❌ Error obteniendo páginas:', error.response?.data || error.message);
    }

    // TODO: Save user data and access token to database

    // Redirect to dashboard with success
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?success=connected`);

  } catch (error: any) {
    console.error('Error al obtener token:', error.response?.data || error.message);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?error=token_failed`);
  }
}
