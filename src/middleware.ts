import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUser } from './lib/services/user-service';

// This middleware runs on API routes to handle user identification and credit checking
export async function middleware(request: NextRequest) {
  // Skip middleware for non-API routes or non-chat API routes
  if (!request.nextUrl.pathname.startsWith('/api/chat')) {
    return NextResponse.next();
  }

  try {
    // Get or create user based on device fingerprint
    const { userId, credits } = await getOrCreateUser(request);
    
    // Check if user has enough credits
    if (credits <= 0) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Insufficient credits', 
          message: 'You have run out of credits. Please purchase more to continue.' 
        }),
        { 
          status: 402, // Payment Required
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Clone the request and add the user ID to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);
    
    // Continue to the API route with the modified headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  } catch (error) {
    console.error('Middleware error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Authentication error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Configure middleware to run only on API routes
export const config = {
  matcher: '/api/chat/:path*',
};