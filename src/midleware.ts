import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Set max body size for audit endpoint
  if (request.nextUrl.pathname.startsWith('/api/audit')) {
    response.headers.set('x-vercel-max-duration', '120'); // 2 minutes for Vercel
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};