import { listAlgos, listBlogPosts, listCourses, listWebinars } from '@/lib/data/platform';

const BASE_URL = 'https://www.ifxtrades.com';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/\'/g, '&apos;');
}

function toUrlNode(url: string, changefreq: string, priority: number) {
  return `<url><loc>${escapeXml(url)}</loc><changefreq>${changefreq}</changefreq><priority>${priority.toFixed(
    1,
  )}</priority></url>`;
}

export async function GET() {
  try {
    const [webinars, algos, courses, posts] = await Promise.all([
      listWebinars(),
      listAlgos(),
      listCourses(),
      listBlogPosts('all'),
    ]);

    const staticRoutes = [
      toUrlNode(`${BASE_URL}/`, 'weekly', 1.0),
      toUrlNode(`${BASE_URL}/webinars`, 'daily', 0.9),
      toUrlNode(`${BASE_URL}/algos`, 'daily', 0.9),
      toUrlNode(`${BASE_URL}/university`, 'weekly', 0.8),
      toUrlNode(`${BASE_URL}/blog`, 'daily', 0.9),
      toUrlNode(`${BASE_URL}/reviews`, 'weekly', 0.8),
      toUrlNode(`${BASE_URL}/login`, 'monthly', 0.5),
      toUrlNode(`${BASE_URL}/signup`, 'monthly', 0.5),
    ];

    const dynamicRoutes = [
      ...webinars.map((webinar) => toUrlNode(`${BASE_URL}/webinars/${webinar.slug}`, 'daily', 0.8)),
      ...algos.map((algo) => toUrlNode(`${BASE_URL}/algos/${algo.slug}`, 'weekly', 0.7)),
      ...courses.map((course) => toUrlNode(`${BASE_URL}/university/${course.slug}`, 'weekly', 0.7)),
      ...posts.map((post) => toUrlNode(`${BASE_URL}/blog/${post.slug}`, 'weekly', 0.8)),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
      ...staticRoutes,
      ...dynamicRoutes,
    ].join('')}</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${toUrlNode(
      `${BASE_URL}/`,
      'weekly',
      1.0,
    )}</urlset>`;

    return new Response(fallbackXml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
}
