import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ArrowLeft, User, Building2, Layers, CheckCircle2 } from 'lucide-react';
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
    title: `${data.title} (${projectId}) — BUILD CLUB SSN I FOUND`,
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
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1 pt-[110px] sm:pt-[130px] pb-24">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
          {/* Back link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#41516B] hover:text-[#041128] mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            <span>Back to All Projects</span>
          </Link>

          {/* ── Editorial Header ── */}
          <div className="mb-10 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-[#041128] text-white font-mono font-semibold text-xs tracking-wider">
                {project.project_id}
              </span>
              {project.departments && (
                <span className="px-3 py-1 rounded-full bg-[#E8EFF7] border border-[#91A9C9]/50 text-[#041128] font-semibold text-xs tracking-wide">
                  {project.departments.code} — {project.departments.name}
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-[#041128] tracking-tight leading-[1.08]">
              {project.title}
            </h1>
          </div>

          {/* ── Main Asymmetric Two-Column Layout ── */}
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-8 space-y-8">
              {/* Featured Project Image */}
              <div className="relative w-full aspect-[16/10] rounded-[22px] overflow-hidden bg-white border border-[rgba(4,17,40,0.08)] shadow-[0_10px_30px_rgba(4,17,40,0.05)]">
                {project.image_url ? (
                  <Image
                    src={project.image_url}
                    alt={project.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#EBF1F8] to-[#DCE6F2] p-8 text-center">
                    <span className="text-[#91A9C9] font-mono font-bold text-6xl mb-2">
                      {project.project_id}
                    </span>
                    <span className="text-sm font-medium text-[#848C9B]">
                      {project.departments?.name ?? 'SSN Engineering'}
                    </span>
                  </div>
                )}
              </div>

              {/* About Project Section */}
              <div className="rounded-[22px] bg-white border border-[rgba(4,17,40,0.08)] p-8 sm:p-10 shadow-[0_4px_20px_rgba(4,17,40,0.02)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-4 h-[1.5px] bg-[#91A9C9]" />
                  <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-[#91A9C9]">
                    ABOUT THE PROJECT
                  </h2>
                </div>

                <p className="text-[#41516B] text-base sm:text-lg leading-[1.75] whitespace-pre-line">
                  {project.description ||
                    'This innovative project was conceptualized and developed by SSN engineering students as part of the BUILD CLUB SSN I FOUND Project Exhibition.'}
                </p>
              </div>
            </div>

            {/* Right Meta Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-[120px]">
              <div className="rounded-[22px] bg-white border border-[rgba(4,17,40,0.08)] p-7 sm:p-8 shadow-[0_4px_20px_rgba(4,17,40,0.03)] space-y-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#041128] pb-3 border-b border-[rgba(4,17,40,0.06)]">
                  Project Summary
                </h3>

                {/* Lead */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF1F8] flex items-center justify-center text-[#041128] shrink-0 mt-0.5">
                    <User size={17} />
                  </div>
                  <div>
                    <div className="text-xs text-[#848C9B] font-medium">Project Lead</div>
                    <div className="text-base font-semibold text-[#041128] mt-0.5">
                      {project.project_lead}
                    </div>
                  </div>
                </div>

                {/* Department */}
                {project.departments && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF1F8] flex items-center justify-center text-[#041128] shrink-0 mt-0.5">
                      <Building2 size={17} />
                    </div>
                    <div>
                      <div className="text-xs text-[#848C9B] font-medium">Department</div>
                      <div className="text-base font-semibold text-[#041128] mt-0.5">
                        {project.departments.name} ({project.departments.code})
                      </div>
                    </div>
                  </div>
                )}

                {/* Exhibition Status */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] shrink-0 mt-0.5">
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <div className="text-xs text-[#848C9B] font-medium">Exhibition Status</div>
                    <div className="text-base font-semibold text-[#041128] mt-0.5">
                      Active Exhibit
                    </div>
                  </div>
                </div>

                {/* Event info box */}
                <div className="mt-6 pt-5 border-t border-[rgba(4,17,40,0.06)]">
                  <div className="text-xs font-semibold text-[#041128]">
                    SSN I FOUND — BUILD CLUB
                  </div>
                  <div className="text-xs text-[#848C9B] mt-1">
                    Voting takes place at the physical registration desk.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
