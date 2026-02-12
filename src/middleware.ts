// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

const supportedLocales = ['vi', 'id', 'ms'] as const;
const allLocales = ['en', 'vi', 'id', 'ms'] as const;
const defaultLocale = 'en';

function getLocaleFromCountry(countryCode: string | null): string | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();
  if (code === 'VN') return 'vi';
  if (code === 'ID') return 'id';
  if (code === 'MY') return 'ms';
  return null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const { pathname } = url;

  // 1. Skip static assets/APIs
  if (pathname.includes('.') || pathname.startsWith('/api/') || pathname.startsWith('/_')) {
    return next();
  }

  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const isLocalized = supportedLocales.includes(firstSegment as any);

  // 2. Auto-Redirect Logic
  if (!isLocalized && pathname === '/') {
    const localeCookie = context.cookies.get('user-locale')?.value;
    const countryHeader = context.request.headers.get('x-vercel-ip-country');
    const detectedGeoLocale = getLocaleFromCountry(countryHeader);

    const targetLocale = (localeCookie && allLocales.includes(localeCookie as any)) 
      ? localeCookie 
      : detectedGeoLocale;

    if (targetLocale && targetLocale !== defaultLocale) {
      return context.redirect(`/${targetLocale}${pathname === '/' ? '' : pathname}`, 302);
    }
  }

  // 3. Handle 404s for Localized Routes
  const response = await next();
  if (response.status === 404) {
    const locale = isLocalized ? firstSegment : defaultLocale;
    // Redirect to /vi/404 or /404
    return context.redirect(locale === 'en' ? '/404' : `/${locale}/404`);
  }

  return response;
});