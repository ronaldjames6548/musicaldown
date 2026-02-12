import { getCollection } from 'astro:content';

export async function GET(context) {
  // This will be "http://localhost:4321" locally 
  // and "https://yourdomain.com" in production
  const origin = context.url.origin;

  // 1. Get Blog Posts
  const posts = await getCollection('blog');
  const blogUrls = posts.map(post => {
    const lang = post.id.split('/')[0];
    const slug = post.slug.split('/').pop();
    return `/${lang}/blog/${slug}`;
  });

  // 2. Define your static page paths
  // Since you have a complex structure, you can list them or use glob
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/tiktok-downloader',
    '/tiktok-video-downloader',
    '/id',
    '/id/about',
    '/id/snaptik-tiktok-downloader-download-video-tiktok-without-watermark',
    '/ms',
    '/ms/about',
    '/vi',
    '/vi/about'
    // Add other critical landing pages here
  ];

  const allPaths = [...new Set([...staticPages, ...blogUrls])];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPaths
    .map((path) => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `
  <url>
    <loc>${origin}${cleanPath}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${path === '' ? '1.0' : '0.7'}</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}