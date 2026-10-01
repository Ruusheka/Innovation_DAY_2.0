import type { MetadataRoute } from 'next';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buildclub.ssn.edu.in';

  // Base static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/departments`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  // Dynamic project routes from database
  try {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: projects } = await supabase
      .from('projects')
      .select('project_id, updated_at')
      .eq('is_active', true)
      .order('project_id', { ascending: true });

    const dynamicProjectRoutes: MetadataRoute.Sitemap = (projects ?? []).map((project) => ({
      url: `${siteUrl}/projects/${project.project_id}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...dynamicProjectRoutes];
  } catch (err) {
    console.warn('[sitemap] Failed to fetch dynamic projects for sitemap:', err);
    return staticRoutes;
  }
}
