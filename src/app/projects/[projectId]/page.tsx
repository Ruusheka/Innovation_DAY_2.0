import { notFound } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PageContainer } from '@/components/ui/PageContainer';
import { BackToProjectsButton } from '@/components/public/BackButton';
import { User, Building2, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
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

  if (!data) return { title: 'Project Not Found | Build Club Innovation Day' };
  return {
    title: `${data.title} | Build Club Innovation Day`,
    description: data.description ?? `Explore ${data.title} at Build Club Innovation Day, SSN College of Engineering.`,
  };
}

function getFallbackImage(projectId: string) {
  const fallbacks = ['/img1.png', '/img2.png', '/img3.png'];
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = (hash << 5) - hash + projectId.charCodeAt(i);
    hash |= 0;
  }
  return fallbacks[Math.abs(hash) % fallbacks.length];
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
  const imageUrl = project.image_url && project.image_url.trim().length > 0
    ? project.image_url
    : getFallbackImage(project.project_id);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F3]">
      <Navbar />

      <main className="flex-1 pt-[105px] sm:pt-[118px] pb-16">
        <PageContainer>
          {/* ── 1. WORKING BACK BUTTON ── */}
          <div className="mb-6 sm:mb-8">
            <BackToProjectsButton />
          </div>

          {/* ── 2. COMPACT EDITORIAL HEADER: TITLE + DEPARTMENT ── */}
          <div className="max-w-4xl mb-6">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3.5 py-1 rounded-full bg-[#041128] text-white font-primary text-xs font-normal tracking-wider">
                {project.project_id}
              </span>
              {project.departments && (
                <span className="px-3.5 py-1 rounded-full bg-[#EDF4FC] border border-[#91A9C9]/50 text-[#041128] font-primary text-xs font-normal tracking-wide">
                  {project.departments.code} &bull; {project.departments.name}
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-primary text-xs font-normal flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Exhibition Entry</span>
              </span>
            </div>

            <h1 className="font-primary font-normal text-3xl sm:text-4xl lg:text-5xl text-[#041128] tracking-tight leading-[1.12] m-0">
              {project.title}
            </h1>
          </div>

          {/* ── 3. COMPACT MAIN SECTION: MEDIUM-SIZED IMAGE + LEAD / DETAILS SIDE-BY-SIDE ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
            
            {/* Left: Medium-Sized Controlled Image (Not giant / screen-consuming) */}
            <div className="lg:col-span-7">
              <div className="relative w-full aspect-[16/10] max-h-[380px] rounded-[24px] overflow-hidden bg-white/80 backdrop-blur-[20px] border border-white/85 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
                <Image
                  src={imageUrl}
                  alt={`${project.title} - Build Club Innovation Day exhibition project`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041128]/35 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Right: Key Details Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-[24px] bg-white/80 backdrop-blur-[20px] border border-white/85 p-6 sm:p-7 shadow-[0_12px_40px_rgba(4,17,40,0.06)] space-y-5">
                <h3 className="font-primary text-xs uppercase tracking-widest text-[#5277A8] font-normal pb-3 border-b border-[rgba(4,17,40,0.06)] m-0">
                  Project Metadata
                </h3>

                {/* Lead */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center shrink-0">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-[#848C9B] font-normal">Project Lead</div>
                    <div className="text-base text-[#041128] font-normal mt-0.5">
                      {project.project_lead}
                    </div>
                  </div>
                </div>

                {/* Department */}
                {project.departments && (
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-[#848C9B] font-normal">Department</div>
                      <div className="text-base text-[#041128] font-normal mt-0.5">
                        {project.departments.name} ({project.departments.code})
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Desk Note */}
                <div className="pt-2 flex items-center gap-2.5 text-xs text-[#848C9B] border-t border-[rgba(4,17,40,0.06)]">
                  <ShieldCheck size={15} className="text-[#5277A8] shrink-0" />
                  <span>Physical voting verified at registration desk.</span>
                </div>
              </div>
            </div>

          </div>

          {/* ── 4. CONTINUOUS READABLE PROJECT DESCRIPTION ── */}
          <div className="rounded-[26px] bg-white/80 backdrop-blur-[20px] border border-white/85 p-7 sm:p-10 shadow-[0_12px_40px_rgba(4,17,40,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-[1.5px] bg-[#5277A8]" />
              <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8] m-0 font-primary">
                PROJECT OVERVIEW &amp; TECHNICAL SPECIFICATIONS
              </h2>
            </div>

            <div className="text-[#3D5574] text-base sm:text-lg leading-[1.75] font-normal font-primary">
              <p className="whitespace-pre-line m-0">
                {project.description ||
                  'This innovative engineering project was conceptualized, designed, and developed by SSN engineering students as part of the BUILD CLUB SSN I FOUND Project Exhibition.'}
              </p>
            </div>
          </div>
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
