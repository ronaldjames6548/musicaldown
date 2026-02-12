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

  // 1. Skip static assets and internal routes
  if (
    pathname.includes('.') || 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_') || 
    pathname.startsWith('/admin/')
  ) {
    return next();
  }

  // 2. Check if the URL already starts with a supported locale
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const isLocalized = supportedLocales.includes(firstSegment as any);

  // 3. If NOT localized and at the root or a generic path, check for redirect
  if (!isLocalized) {
    const localeCookie = context.cookies.get('user-locale')?.value;
    const countryHeader = context.request.headers.get('x-vercel-ip-country');
    const detectedGeoLocale = getLocaleFromCountry(countryHeader);

    const targetLocale = (localeCookie && allLocales.includes(localeCookie as any)) 
      ? localeCookie 
      : detectedGeoLocale;

    if (targetLocale && targetLocale !== defaultLocale) {
      return context.redirect(`/${targetLocale}${pathname === '/' ? '' : pathname}${url.search}`, 302);
    }
  }

  // 4. Handle 404s for localized routes
  const response = await next();
  
  // If we get a 404 on a /vi/something path, make sure it shows the localized 404 page
  if (response.status === 404 && isLocalized) {
      return context.redirect(`/${firstSegment}/404`);
  }

  return response;
});