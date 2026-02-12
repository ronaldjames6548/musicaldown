// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';

const supportedLocales = ['vi', 'id', 'ms'] as const; // Non-default locales
const allLocales = ['en', 'vi', 'id', 'ms'] as const;
const defaultLocale = 'en';

function getLocaleFromCountry(countryCode: string | null): string | null {
  if (!countryCode) return null;
  const code = countryCode.toUpperCase();

  if (code === 'VN') return 'vi';
  if (code === 'ID') return 'id';
  if (code === 'MY') return 'ms';

  return null; // Fallback to default (en)
}

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // 1. Skip assets, API, and admin routes
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/_') ||
    pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|ico|json|xml|txt|avif|woff|woff2|ttf|eot)$/) ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.includes('/rss.xml')
  ) {
    return next();
  }

  // 2. Check if the URL already has a locale prefix
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const hasLocalePrefix = supportedLocales.includes(firstSegment as any);

  // 3. Logic for root path or non-prefixed paths
  if (!hasLocalePrefix) {
    // Priority A: User manual preference (Cookie)
    const localeCookie = context.cookies.get('user-locale')?.value;
    
    // Priority B: GeoIP Detection (Vercel)
    const countryHeader = context.request.headers.get('x-vercel-ip-country');
    const detectedGeoLocale = getLocaleFromCountry(countryHeader);

    // Determine target locale
    let targetLocale = defaultLocale;
    if (localeCookie && allLocales.includes(localeCookie as any)) {
        targetLocale = localeCookie;
    } else if (detectedGeoLocale) {
        targetLocale = detectedGeoLocale;
    }

    // 4. Perform Redirect if target is not English (since English is at /)
    if (targetLocale !== defaultLocale) {
      // Prevent infinite redirect: only redirect if we aren't already looking at a prefixed version
      // and if the current path doesn't already start with the target locale
      const newPath = `/${targetLocale}${pathname === '/' ? '' : pathname}${url.search}`;
      return context.redirect(newPath, 302);
    }
  }

  return next();
});