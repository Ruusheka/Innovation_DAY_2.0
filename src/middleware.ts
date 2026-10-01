import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// ============================================================
// Next.js Middleware
// Protects all /admin/* routes except /admin/login
// Unauthenticated users are redirected to /admin/login
// ============================================================
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle /admin/login
  if (pathname === '/admin/login') {
    const { supabaseResponse, user } = await updateSession(request);
    // If user is already authenticated, redirect to /admin/vote
    if (user) {
      return NextResponse.redirect(new URL('/admin/vote', request.url));
    }
    return supabaseResponse;
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin')) {
    const { supabaseResponse, user } = await updateSession(request);

    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return supabaseResponse;
  }

  // For all other routes, refresh the session
  const { supabaseResponse } = await updateSession(request);
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
