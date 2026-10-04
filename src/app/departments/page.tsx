import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PageContainer } from '@/components/ui/PageContainer';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Cpu, Radio, Zap, Cog, Building2, Layers, Monitor, GraduationCap, FlaskConical, HeartPulse, Sparkles, ArrowRight } from 'lucide-react';
import { getDepartmentMeta } from '@/lib/utils/departmentColors';
import type { Department, Project } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: 'Departments — BUILD CLUB SSN Innovation Day',
  description: 'Explore all engineering departments participating in the SSN Innovation Day project exhibition.',
};

const DEPT_DESCRIPTIONS: Record<string, string> = {
  CSE: 'Computer Science & Engineering projects focusing on artificial intelligence, systems, web technologies, and computational algorithms.',
  IT: 'Information Technology projects covering full-stack development, cloud computing, data management, and enterprise software solutions.',
  MTECHCSE: 'M.Tech Computer Science & Engineering postgraduate projects exploring advanced research in AI, machine learning, and systems design.',
  ECE: 'Electronics & Communication Engineering projects exploring embedded systems, IoT architectures, signal processing, and communication protocols.',
  EEE: 'Electrical & Electronics Engineering projects showcasing smart power systems, electric vehicles, renewable energy, and power automation.',
  MECH: 'Mechanical Engineering projects highlighting robotics, CAD/CAM design, autonomous vehicles, and advanced manufacturing prototypes.',
  CIVIL: 'Civil Engineering projects focusing on smart infrastructure, structural modeling, sustainable materials, and environmental engineering.',
  CHEM: 'Chemical Engineering projects covering process optimization, green chemistry, material synthesis, and industrial chemical systems.',
  BME: 'Biomedical Engineering projects bridging medicine and technology — from biosensors and medical devices to health monitoring systems.',
  GPP: 'Grand Project Pathway (GPP Batch: 2025-26) showcasing multi-disciplinary flagship engineering innovations, creative hardware prototypes, and student-engineered solutions.',
};

function getDeptIcon(code: string) {
  const upper = code.toUpperCase().replace(/[\s.]/g, '');
  switch (upper) {
    case 'CSE':
      return Cpu;
    case 'IT':
      return Monitor;
    case 'MTECHCSE':
    case 'MTECH':
      return GraduationCap;
    case 'ECE':
      return Radio;
    case 'EEE':
      return Zap;
    case 'MECH':
      return Cog;
    case 'CIVIL':
      return Building2;
    case 'CHEM':
    case 'CHEMISTRY':
      return FlaskConical;
    case 'BME':
    case 'BIOTECH':
      return HeartPulse;
    case 'GPP':
      return Sparkles;
    default:
      return Layers;
  }
}

export default async function DepartmentsPage() {
  const supabase = await createClient();

  const [deptsRes, projectsRes] = await Promise.all([
    supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('code'),
    supabase
      .from('projects')
      .select('id, department_id')
      .eq('is_active', true),
  ]);

  const departments = (deptsRes.data ?? []) as Department[];
  const projects = (projectsRes.data ?? []) as Project[];

  // Calculate project count per department
  const counts: Record<string, number> = {};
  for (const p of projects) {
    if (p.department_id) {
      counts[p.department_id] = (counts[p.department_id] || 0) + 1;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-primary">
      <Navbar />

      <main className="flex-1 pt-[115px] sm:pt-[125px] pb-16">
        <PageContainer>
          {/* Header */}
          <div className="mb-12 sm:mb-16 max-w-2xl">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-[1.5px] bg-[#5277A8]" />
              <span className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                ENGINEERING DISCIPLINES
              </span>
            </div>
            <h1 className="font-normal text-4xl sm:text-5xl lg:text-6xl text-[#041128] tracking-tight leading-tight m-0">
              Explore by Department
            </h1>
            <p className="mt-3.5 text-[#3D5574] text-base sm:text-lg leading-relaxed font-normal">
              Discover engineering innovations developed by students across {departments.length} departments at SSN College of Engineering.
            </p>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {departments.map((dept) => {
              const Icon = getDeptIcon(dept.code);
              const count = counts[dept.id] || 0;
              const codeKey = dept.code.toUpperCase().replace(/[\s.]/g, '');
              const deptMeta = getDepartmentMeta(dept.code);

              return (
                <Link
                  key={dept.id}
                  href={`/projects`}
                  className="block group"
                >
                  <div className="card-white rounded-[22px] p-7 sm:p-8 flex flex-col justify-between h-full bg-white transition-all overflow-hidden relative shadow-[0_10px_35px_rgba(4,17,40,0.06)] hover:shadow-[0_18px_50px_rgba(4,17,40,0.12)]">
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: `linear-gradient(90deg, ${deptMeta.primary}, ${deptMeta.secondary})` }}
                    />
                    <div>
                      {/* Icon + Code */}
                      <div className="flex items-center justify-between mb-6 mt-1">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm"
                          style={{
                            backgroundColor: deptMeta.badgeBg.includes('#') ? deptMeta.badgeBg : undefined,
                          }}
                        >
                          <Icon size={24} style={{ color: deptMeta.primary }} />
                        </div>
                        <span
                          className="font-mono font-bold text-xs px-3 py-1 rounded-full border"
                          style={{
                            backgroundColor: '#FAF9F5',
                            borderColor: deptMeta.border,
                            color: deptMeta.primary,
                          }}
                        >
                          {dept.code}
                        </span>
                      </div>

                      {/* Name */}
                      <h2 className="font-semibold text-2xl text-[#041128] group-hover:text-[#5277A8] transition-colors m-0">
                        {dept.name}
                      </h2>

                      {/* Description */}
                      <p className="mt-2.5 text-sm text-[#848C9B] leading-relaxed line-clamp-3 font-normal">
                        {DEPT_DESCRIPTIONS[codeKey] ||
                          `Innovative student projects and working engineering prototypes built by ${dept.name} students.`}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-[rgba(4,17,40,0.06)] flex items-center justify-between text-xs">
                      <span className="font-medium text-[#41516B]">
                        <span className="font-bold text-[#041128]">{count}</span> project{count !== 1 ? 's' : ''} exhibited
                      </span>

                      <div className="inline-flex items-center gap-1.5 font-semibold text-[#041128] group-hover:text-[#5277A8] transition-colors">
                        <span>Browse</span>
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
