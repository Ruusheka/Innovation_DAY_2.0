import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ArrowLeft, User, Building2 } from 'lucide-react';
import type { Project, Department } from '@/types';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('title, description')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .single();

  if (!data) return { title: 'Project Not Found' };
  return {
    title: `${data.title} — BUILD CLUB SSN I FOUND`,
    description: data.description ?? `View details for project ${projectId}`,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from('projects')
    .select(`
      id, project_id, title, description, project_lead, image_url,
      department_id, is_active, created_at, updated_at,
      departments(id, name, code)
    `)
    .eq('project_id', projectId)
    .eq('is_active', true)
    .single();

  if (!data) notFound();

  const project = data as unknown as Project & { departments: Department | null };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#91A9C9]/4 blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[#848C9B] hover:text-white text-sm mb-10 transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            All Projects
          </Link>

          {/* Project header */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: info */}
            <div>
              {/* Project ID + Dept */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[#91A9C9] font-mono font-bold text-sm tracking-widest uppercase">
                  {project.project_id}
                </span>
                {project.departments && (
                  <span className="text-xs text-[#848C9B] px-2.5 py-1 rounded-full glass border border-white/10">
                    {project.departments.code}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-white text-4xl sm:text-5xl font-bold leading-tight mb-6">
                {project.title}
              </h1>

              {/* Meta */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-[#848C9B] text-sm">
                  <User size={14} className="text-[#91A9C9]" />
                  <span className="text-[#848C9B]">Project Lead:</span>
                  <span className="text-white font-medium">{project.project_lead}</span>
                </div>
                {project.departments && (
                  <div className="flex items-center gap-2 text-[#848C9B] text-sm">
                    <Building2 size={14} className="text-[#91A9C9]" />
                    <span className="text-[#848C9B]">Department:</span>
                    <span className="text-white font-medium">{project.departments.name}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {project.description && (
                <div>
                  <h2 className="text-[#848C9B] text-xs font-medium uppercase tracking-widest mb-3">
                    About the Project
                  </h2>
                  <p className="text-[#B2B4AB] leading-relaxed text-base">
                    {project.description}
                  </p>
                </div>
              )}
            </div>

            {/* Right: image */}
            <div>
              {project.image_url ? (
                <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden glass border border-white/10">
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-2xl glass border border-white/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[#91A9C9]/20 font-mono font-bold text-6xl mb-2">
                      {project.project_id}
                    </div>
                    <div className="text-[#848C9B]/50 text-sm">No image available</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mt-16 pt-8 border-t border-white/5">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-[#848C9B] hover:text-[#91A9C9] text-sm transition-colors group"
            >
              <ArrowLeft size={14} />
              Browse all projects
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
