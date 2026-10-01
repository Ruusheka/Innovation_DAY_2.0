import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buildclub.ssn.edu.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/departments', '/projects', '/projects/*'],
        disallow: ['/admin', '/admin/*', '/api/*', '/_next/*'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
