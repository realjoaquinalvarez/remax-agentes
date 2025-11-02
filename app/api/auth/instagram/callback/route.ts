import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Function to fix UTF-8 encoding issues
function fixEncoding(text: string): string {
  if (!text) return text;

  try {
    // Check if text has encoding issues (contains Ã, Ã±, etc.)
    if (/Ã|ð/.test(text)) {
      // Convert string to buffer treating it as latin1, then decode as utf8
      const buffer = Buffer.from(text, 'latin1');
      return buffer.toString('utf8');
    }
    return text;
  } catch (error) {
    console.error('Error fixing encoding:', error);
    return text;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('Error de autorización:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin-panel/conexiones?error=auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin-panel/conexiones?error=no_code`);
  }

  try {
    // Intercambiar code por access token
    const tokenUrl = 'https://graph.facebook.com/v23.0/oauth/access_token';

    console.log('🔐 Attempting token exchange...');
    console.log('   Client ID:', process.env.NEXT_PUBLIC_META_APP_ID);
    console.log('   Has Secret:', !!process.env.META_APP_SECRET);
    console.log('   Redirect URI:', `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`);
    console.log('   Has Code:', !!code);

    const tokenResponse = await axios.get(tokenUrl, {
      params: {
        client_id: process.env.NEXT_PUBLIC_META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/instagram/callback`,
        code: code,
      },
    });

    const accessToken = tokenResponse.data.access_token;
    console.log('✅ Token obtained successfully');

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
          posts: [] as Array<{
            id: string;
            message: string;
            created_time: string;
            permalink_url: string;
            call_to_action: { type: string; value: { link: string } } | null;
            likes: number;
            comments: number;
            shares: number;
            reactions_total: number;
            reactions_breakdown: Record<string, number>;
            engagement: number;
            reach: number | null;
            impressions: number | null;
            impressions_organic: number | null;
            impressions_paid: number | null;
            video_views: number | null;
            video_views_organic: number | null;
            video_views_paid: number | null;
            post_clicks: number | null;
            post_clicks_by_type: Record<string, number> | null;
            post_consumptions_by_type: Record<string, number> | null;
          }>,
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
            about: fixEncoding(pageInfoResponse.data.about || ''),
            category: fixEncoding(pageInfoResponse.data.category || ''),
          };

          // Get posts from the last 60 days
          const sixtyDaysAgo = new Date();
          sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
          sixtyDaysAgo.setHours(0, 0, 0, 0);
          const sixtyDaysTimestamp = Math.floor(sixtyDaysAgo.getTime() / 1000);

          console.log(`   📅 Buscando posts desde: ${sixtyDaysAgo.toISOString()}`);

          const postsResponse = await axios.get(`https://graph.facebook.com/v23.0/${page.id}/posts`, {
            params: {
              fields: 'id,message,created_time,permalink_url,call_to_action,likes.summary(true),comments.summary(true),shares,reactions.summary(true)',
              since: sixtyDaysTimestamp,
              access_token: page.access_token,
            },
            headers: {
              'Accept-Charset': 'utf-8',
            },
          });

          const posts = postsResponse.data.data || [];
          console.log(`   📄 Posts encontrados en los últimos 60 días: ${posts.length}`);

          // Get reach for each post
          const postsWithReach = [];

          for (const post of posts) {
            const likes = post.likes?.summary?.total_count || 0;
            const comments = post.comments?.summary?.total_count || 0;
            const shares = post.shares?.count || 0;
            const reactionsTotal = post.reactions?.summary?.total_count || 0;

            // Get reactions breakdown
            const reactionsBreakdown: Record<string, number> = {};
            if (post.reactions?.data) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              post.reactions.data.forEach((reaction: any) => {
                const type = reaction.type || 'LIKE';
                reactionsBreakdown[type] = (reactionsBreakdown[type] || 0) + 1;
              });
            }

            const engagement = reactionsTotal + comments + shares;

            // Get Call to Action info
            const callToAction = post.call_to_action || null;

            let reach = null;
            let impressions = null;
            let impressionsOrganic = null;
            let impressionsPaid = null;
            let videoViews = null;
            let videoViewsOrganic = null;
            let videoViewsPaid = null;
            let postClicks = null;
            let postClicksByType = null;
            let postConsumptionsByType = null;

            try {
              // Get comprehensive insights - ALL METRICS including video
              const comprehensiveMetricsResponse = await axios.get(
                `https://graph.facebook.com/v23.0/${post.id}/insights`,
                {
                  params: {
                    metric: 'post_impressions_unique,post_impressions,post_impressions_organic,post_impressions_paid,post_video_views,post_video_views_organic,post_video_views_paid,post_clicks,post_clicks_by_type,post_consumptions_by_type',
                    access_token: page.access_token,
                  },
                }
              );

              const insights = comprehensiveMetricsResponse.data.data;

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              reach = insights.find((i: any) => i.name === 'post_impressions_unique')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              impressions = insights.find((i: any) => i.name === 'post_impressions')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              impressionsOrganic = insights.find((i: any) => i.name === 'post_impressions_organic')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              impressionsPaid = insights.find((i: any) => i.name === 'post_impressions_paid')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              videoViews = insights.find((i: any) => i.name === 'post_video_views')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              videoViewsOrganic = insights.find((i: any) => i.name === 'post_video_views_organic')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              videoViewsPaid = insights.find((i: any) => i.name === 'post_video_views_paid')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              postClicks = insights.find((i: any) => i.name === 'post_clicks')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              postClicksByType = insights.find((i: any) => i.name === 'post_clicks_by_type')?.values[0]?.value || null;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              postConsumptionsByType = insights.find((i: any) => i.name === 'post_consumptions_by_type')?.values[0]?.value || null;

              console.log(`      📊 MÉTRICAS COMPLETAS:`);
              console.log(`         Alcance único: ${reach || '-'}`);
              console.log(`         Impresiones totales: ${impressions || '-'}`);
              console.log(`         Impresiones orgánicas: ${impressionsOrganic || '-'}`);
              console.log(`         Impresiones pagadas: ${impressionsPaid || '-'}`);
              console.log(`         Visualizaciones de video: ${videoViews || '-'}`);
              console.log(`         Views orgánicas: ${videoViewsOrganic || '-'}`);
              console.log(`         Views pagadas: ${videoViewsPaid || '-'}`);
              console.log(`         Clicks totales: ${postClicks || '-'}`);
              console.log(`         Clicks por tipo:`, postClicksByType || '-');
              console.log(`         Consumo por tipo:`, postConsumptionsByType || '-');

            } catch (insightsError) {
              console.log(`      ⚠️  No se pudo obtener métricas del post ${post.id}`);
              if (axios.isAxiosError(insightsError)) {
                console.log(`         Error:`, insightsError.response?.data);
              }
            }

            const postData = {
              id: post.id,
              message: fixEncoding(post.message || ''),
              created_time: post.created_time,
              permalink_url: post.permalink_url || '',
              call_to_action: callToAction,
              likes,
              comments,
              shares,
              reactions_total: reactionsTotal,
              reactions_breakdown: reactionsBreakdown,
              engagement,
              reach,
              impressions,
              impressions_organic: impressionsOrganic,
              impressions_paid: impressionsPaid,
              video_views: videoViews,
              video_views_organic: videoViewsOrganic,
              video_views_paid: videoViewsPaid,
              post_clicks: postClicks,
              post_clicks_by_type: postClicksByType,
              post_consumptions_by_type: postConsumptionsByType,
            };

            postsWithReach.push(postData);

            console.log(`\n   📄 Post: ${post.message?.substring(0, 50)}...`);
            console.log(`      URL: ${post.permalink_url || '-'}`);
            console.log(`      CTA: ${callToAction?.type || '-'}`);
            console.log(`      Likes: ${likes} | Comentarios: ${comments} | Compartidos: ${shares}`);
            console.log(`      Reacciones totales: ${reactionsTotal}`);
            console.log(`      Engagement: ${engagement} | Alcance: ${reach || '-'} | Impresiones: ${impressions || '-'}`);
            console.log(`      Clicks: ${postClicks || '-'}`);
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
    // Use a script tag with type="application/json" to preserve UTF-8
    const dataToStore = {
      user: userResponse.data,
      pages: pagesData,
      timestamp: dataId
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Redirecting...</title>
        </head>
        <body>
          <script id="fb-data" type="application/json">
${JSON.stringify(dataToStore, null, 2)}
          </script>
          <script>
            try {
              const dataElement = document.getElementById('fb-data');
              const data = JSON.parse(dataElement.textContent);
              sessionStorage.setItem('facebook_connection_data', JSON.stringify(data));
              window.location.href = '${process.env.NEXTAUTH_URL}/admin-panel/conexiones?success=connected&pages=${totalPages}&user=${encodeURIComponent(userResponse.data.name)}';
            } catch (error) {
              console.error('Error storing data:', error);
              window.location.href = '${process.env.NEXTAUTH_URL}/admin-panel/conexiones?error=storage_failed';
            }
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('❌ Error al obtener token:');
    let errorDetail = 'unknown';

    if (axios.isAxiosError(error)) {
      console.error('   Status:', error.response?.status);
      console.error('   Error Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('   Error Message:', error.message);

      errorDetail = error.response?.data?.error?.message || error.message || 'axios_error';
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('   Error:', errorMessage);
      errorDetail = errorMessage;
    }

    // URL encode the error detail to pass it safely
    const encodedError = encodeURIComponent(errorDetail);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin-panel/conexiones?error=token_failed&detail=${encodedError}`);
  }
}
