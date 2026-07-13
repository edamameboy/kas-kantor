import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

// UBAH NAMA FUNGSI DI BAWAH INI MENJADI "proxy"
export async function proxy(req: NextRequest) {
  const sessionCookie = req.cookies.get('session')?.value;
  const parsed = sessionCookie ? await decrypt(sessionCookie) : null;
  const isAuthPage = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register';

  // Jika belum login dan mencoba akses halaman dalam
  if (!parsed && !isAuthPage && !req.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Jika sudah login tapi akses halaman login/register
  if (parsed && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Proteksi khusus halaman Admin
  if (req.nextUrl.pathname.startsWith('/admin') && parsed?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};