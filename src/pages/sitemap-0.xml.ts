import { getCollection } from 'astro:content';

export async function GET(context) {
  // Get the site origin (http://localhost:4321 locally, production URL in production)
  const origin = context.url.origin;

  // 1. Get ALL Blog Posts
  const allPosts = await getCollection('blog');
  
  // Filter out drafts and generate URLs with clean slugs
  const blogUrls = allPosts
    .filter(post => !post.data.draft) // Only published posts
    .map(post => {
      // Extract language from post ID (e.g., "vi/my-post.md" -> "vi")
      const lang = post.id.split('/')[0];
      
      // Generate clean slug (remove language prefix and .md extension)
      const cleanSlug = post.id.replace(`${lang}/`, '').replace('.md', '');
      
      // Create URL based on language
      if (lang === 'en') {
        return `/blog/${cleanSlug}`;
      } else {
        return `/${lang}/blog/${cleanSlug}`;
      }
    });

  // 2. Blog List Pages (pagination pages)
  const blogListPages = [
    '/blog',        // English blog list
    '/vi/blog',     // Vietnamese blog list
    '/id/blog',     // Indonesian blog list
    '/ms/blog',     // Malay blog list
  ];

  // 3. Static Pages - Main Site
  const staticPagesMain = [
    '',                           // Homepage (English)
    '/about',                     // About page (English)
    '/contact',                   // Contact page (English)
    '/privacy-policy',            // Privacy policy (English)
    '/terms-of-service',          // Terms of service (English)
  ];

  // 4. Static Pages - Vietnamese
  const staticPagesVi = [
    '/vi',                        // Vietnamese homepage
    '/vi/about',                  // Vietnamese about
    '/vi/contact',                // Vietnamese contact
    '/vi/privacy-policy',         // Vietnamese privacy policy
    '/vi/terms-of-service',       // Vietnamese terms of service
  ];

  // 5. Static Pages - Indonesian
  const staticPagesId = [
    '/id',                        // Indonesian homepage
    '/id/about',                  // Indonesian about
    '/id/contact',                // Indonesian contact
    '/id/privacy-policy',         // Indonesian privacy policy
    '/id/terms-of-service',       // Indonesian terms of service
  ];

  // 6. Static Pages - Malay
  const staticPagesMs = [
    '/ms',                        // Malay homepage
    '/ms/about',                  // Malay about
    '/ms/contact',                // Malay contact
    '/ms/privacy-policy',         // Malay privacy policy
    '/ms/terms-of-service',       // Malay terms of service
  ];

  // 7. Combine all URLs and remove duplicates
  const allPaths = [...new Set([
    ...staticPagesMain,
    ...staticPagesVi,
    ...staticPagesId,
    ...staticPagesMs,
    ...blogListPages,
    ...blogUrls
  ])];

  // 8. Sort URLs for better organization (optional)
  allPaths.sort();

  // 9. Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPaths
    .map((path) => {
      // Ensure path starts with /
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      
      // Determine priority based on page type
      let priority = '0.7'; // Default priority
      if (path === '') {
        priority = '1.0'; // Homepage highest priority
      } else if (path === '/vi' || path === '/id' || path === '/ms') {
        priority = '0.9'; // Language homepages high priority
      } else if (path.endsWith('/blog')) {
        priority = '0.8'; // Blog list pages high priority
      } else if (path.includes('/blog/')) {
        priority = '0.6'; // Individual blog posts medium priority
      }
      
      // Determine change frequency based on page type
      let changefreq = 'weekly'; // Default frequency
      if (path === '' || path === '/vi' || path === '/id' || path === '/ms') {
        changefreq = 'daily'; // Homepages change daily
      } else if (path.endsWith('/blog')) {
        changefreq = 'daily'; // Blog lists change when new posts added
      } else if (path.includes('/blog/')) {
        changefreq = 'monthly'; // Blog posts don't change often
      }
      
      return `
  <url>
    <loc>${origin}${cleanPath}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}