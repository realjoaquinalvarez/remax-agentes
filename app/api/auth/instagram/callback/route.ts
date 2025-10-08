import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Error de autorización:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/conexiones?error=auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/conexiones?error=no_code`);
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

    // Get basic user information
    const userResponse = await axios.get('https://graph.facebook.com/v23.0/me', {
      params: {
        fields: 'id,name,email',
        access_token: accessToken,
      },
    });

    console.log('✅ OAuth Successful!');
    console.log('User:', userResponse.data);
    console.log('Access Token:', accessToken.substring(0, 20) + '...');

    // Fetch user's Facebook pages
    let totalPages = 0;
    const pagesData = [];

    try {
      const pagesResponse = await axios.get(`https://graph.facebook.com/v23.0/${userResponse.data.id}/accounts`, {
        params: {
          access_token: accessToken,
        },
      });

      console.log('📄 Páginas encontradas:', pagesResponse.data);

      // Count total pages
      totalPages = pagesResponse.data.data?.length || 0;

      // For each page, get basic info, insights, and check for Instagram connection
      for (const page of pagesResponse.data.data || []) {
        console.log(`\n📊 Página: ${page.name}`);
        console.log(`   ID: ${page.id}`);
        console.log(`   Access Token: ${page.access_token.substring(0, 20)}...`);

        let pageData = {
          id: page.id,
          name: page.name,
          access_token: page.access_token,
          fan_count: 0,
          followers_count: 0,
          link: '',
          about: '',
          category: '',
          posts: [],
          instagram: null as { username: string; followers_count: number; media_count: number } | null,
        };

        // Get basic page information
        try {
          const pageInfoResponse = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
            params: {
              fields: 'id,name,fan_count,followers_count,link,about,category',
              access_token: page.access_token,
            },
          });

          console.log('   📊 Info de la página:', JSON.stringify(pageInfoResponse.data, null, 2));

          pageData = {
            ...pageData,
            fan_count: pageInfoResponse.data.fan_count || 0,
            followers_count: pageInfoResponse.data.followers_count || 0,
            link: pageInfoResponse.data.link || '',
            about: pageInfoResponse.data.about || '',
            category: pageInfoResponse.data.category || '',
          };

          // Get this WEEK's posts (last 7 days)
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          oneWeekAgo.setHours(0, 0, 0, 0);
          const weekTimestamp = Math.floor(oneWeekAgo.getTime() / 1000);

          console.log(`   📅 Buscando posts desde: ${oneWeekAgo.toISOString()}`);

          const weekPostsResponse = await axios.get(`https://graph.facebook.com/v23.0/${page.id}/posts`, {
            params: {
              fields: 'id,message,created_time,likes.summary(true),comments.summary(true),shares',
              since: weekTimestamp,
              access_token: page.access_token,
            },
          });

          const posts = weekPostsResponse.data.data || [];
          console.log(`   📄 Posts encontrados esta semana: ${posts.length}`);

          // Get reach for each post
          const postsWithReach = [];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const post of posts) {
            const likes = post.likes?.summary?.total_count || 0;
            const comments = post.comments?.summary?.total_count || 0;
            const shares = post.shares?.count || 0;
            const engagement = likes + comments + shares;

            let reach = null;
            let impressions = null;

            // Try to get reach for this specific post
            try {
              const postInsightsResponse = await axios.get(
                `https://graph.facebook.com/v23.0/${post.id}/insights`,
                {
                  params: {
                    metric: 'post_impressions_unique,post_impressions',
                    access_token: page.access_token,
                  },
                }
              );

              const insights = postInsightsResponse.data.data;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              reach = insights.find((i: any) => i.name === 'post_impressions_unique')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              impressions = insights.find((i: any) => i.name === 'post_impressions')?.values[0]?.value || null;

              console.log(`      Alcance único: ${reach || 'N/A'}`);
              console.log(`      Impresiones totales: ${impressions || 'N/A'}`);
            } catch (reachError) {
              console.log(`      ⚠️  No se pudo obtener alcance del post ${post.id}`);
            }

            const postData = {
              id: post.id,
              message: post.message || '',
              created_time: post.created_time,
              likes,
              comments,
              shares,
              engagement,
              reach,
              impressions,
            };

            postsWithReach.push(postData);

            console.log(`\n   📄 Post: ${post.message?.substring(0, 50)}...`);
            console.log(`      Likes: ${likes}`);
            console.log(`      Comentarios: ${comments}`);
            console.log(`      Compartidos: ${shares}`);
            console.log(`      Engagement total: ${engagement}`);
            console.log(`      Alcance: ${reach || 'N/A'}`);
            console.log(`      Impresiones: ${impressions || 'N/A'}`);
          }

          pageData.posts = postsWithReach;

        } catch (error: unknown) {
          console.log('   ❌ Error obteniendo datos de la página:');
          if (axios.isAxiosError(error)) {
            console.log('   Status:', error.response?.status);
            console.log('   Error:', JSON.stringify(error.response?.data, null, 2));
          } else {
            console.log('   Error:', error);
          }
        }

        // Try to get Instagram Business Account connected to this page
        try {
          const igResponse = await axios.get(`https://graph.facebook.com/v23.0/${page.id}`, {
            params: {
              fields: 'instagram_business_account',
              access_token: page.access_token,
            },
          });

          if (igResponse.data.instagram_business_account) {
            console.log(`   ✅ Instagram conectado: ${igResponse.data.instagram_business_account.id}`);

            // Get Instagram account info
            const igAccountResponse = await axios.get(
              `https://graph.facebook.com/v23.0/${igResponse.data.instagram_business_account.id}`,
              {
                params: {
                  fields: 'username,followers_count,media_count',
                  access_token: page.access_token,
                },
              }
            );

            pageData.instagram = {
              username: igAccountResponse.data.username,
              followers_count: igAccountResponse.data.followers_count,
              media_count: igAccountResponse.data.media_count,
            };

            console.log(`   Instagram Username: @${igAccountResponse.data.username}`);
            console.log(`   Followers: ${igAccountResponse.data.followers_count}`);
            console.log(`   Posts: ${igAccountResponse.data.media_count}`);
          } else {
            console.log(`   ⚠️  Sin cuenta de Instagram conectada`);
          }
        } catch (igError) {
          const errorMessage = igError instanceof Error ? igError.message : 'Unknown error';
          console.log(`   ❌ Error verificando Instagram: ${errorMessage}`);
        }

        pagesData.push(pageData);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log('❌ Error obteniendo páginas:', errorMessage);
    }

    // TODO: Save user data and access token to database

    // This will be replaced with database storage, for now we'll pass summary data
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   Total páginas conectadas: ${totalPages}`);

    // Store data in a way that can be passed to the client
    // We'll use a unique ID based on timestamp
    const dataId = Date.now().toString();

    // Create HTML with embedded script to store data in sessionStorage
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Redirecting...</title>
        </head>
        <body>
          <script>
            sessionStorage.setItem('facebook_connection_data', JSON.stringify({
              user: ${JSON.stringify(userResponse.data)},
              pages: ${JSON.stringify(pagesData)},
              timestamp: ${dataId}
            }));
            window.location.href = '${process.env.NEXTAUTH_URL}/dashboard/conexiones?success=connected&pages=${totalPages}&user=${encodeURIComponent(userResponse.data.name)}';
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error al obtener token:', errorMessage);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/conexiones?error=token_failed`);
  }
}
