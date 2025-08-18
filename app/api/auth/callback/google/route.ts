// app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  
  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=oauth_error`);
  }
  
  if (!code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=no_code`);
  }
  
  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (tokens.error) {
      throw new Error(tokens.error_description || tokens.error);
    }
    
    // Store tokens securely (consider using session/cookies)
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}?auth=success`);
    
    // Set secure cookies with tokens
    response.cookies.set('google_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600
    });
    
    if (tokens.refresh_token) {
      response.cookies.set('google_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }
    
    return response;
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}?error=token_exchange_failed`);
  }
}
