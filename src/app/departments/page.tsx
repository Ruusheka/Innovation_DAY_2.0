import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PageContainer } from '@/components/ui/PageContainer';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Cpu, Radio, Zap, Cog, Building2, Layers, ArrowRight } from 'lucide-react';
import type { Department, Project } from '@/types';

export const revalidate = 60;

export const metadata = {
  title: 'Departments — BUILD CLUB SSN I FOUND',
  description: 'Explore engineering departments participating in the SSN I FOUND project exhibition.',
};

const VALID_DEPT_CODES = ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'];

const DEPT_DESCRIPTIONS: Record<string, string> = {
  CSE: 'Computer Science & Engineering projects focusing on artificial intelligence, systems, web technologies, and computational algorithms.',
  ECE: 'Electronics & Communication Engineering projects exploring embedded systems, IoT architectures, signal processing, and communication protocols.',
  EEE: 'Electrical & Electronics Engineering projects showcasing smart power systems, electric vehicles, renewable energy, and power automation.',
  MECH: 'Mechanical Engineering projects highlighting robotics, CAD/CAM design, autonomous vehicles, and advanced manufacturing prototypes.',
  CIVIL: 'Civil Engineering projects focusing on smart infrastructure, structural modeling, sustainable materials, and environmental engineering.',
};

function getDeptIcon(code: string) {
  switch (code.toUpperCase()) {
    case 'CSE':
      return Cpu;
    case 'ECE':
      return Radio;
    case 'EEE':
      return Zap;
    case 'MECH':
      return Cog;
    case 'CIVIL':
      return Building2;
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

  const rawDepts = (deptsRes.data ?? []) as Department[];
  const projects = (projectsRes.data ?? []) as Project[];

  // Filter to the 5 valid departments
  const departments = rawDepts.filter((d) =>
    VALID_DEPT_CODES.includes(d.code.toUpperCase())
  );

  // Calculate project count per department
  const counts: Record<string, number> = {};
  for (const p of projects) {
    if (p.department_id) {
      counts[p.department_id] = (counts[p.department_id] || 0) + 1;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1 py-12 sm:py-16">
        <PageContainer>
          {/* Header */}
          <div className="mb-12 sm:mb-16 max-w-2xl">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-[1.5px] bg-[#5277A8]" />
              <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                ENGINEERING DISCIPLINES
              </span>
            </div>
            <h1 className="font-display font-normal text-4xl sm:text-5xl lg:text-6xl text-[#041128] tracking-tight leading-tight m-0">
              Explore by Department
            </h1>
            <p className="mt-3.5 font-sans text-[#3D5574] text-base sm:text-lg leading-relaxed">
              Discover engineering innovations developed by students across {departments.length} foundational engineering disciplines at SSN College of Engineering.
            </p>
          </div>

          {/* Department Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {departments.map((dept) => {
              const Icon = getDeptIcon(dept.code);
              const count = counts[dept.id] || 0;

              return (
                <Link
                  key={dept.id}
                  href={`/projects`}
                  className="block group"
                >
                  <div className="card-white rounded-[22px] p-7 sm:p-8 flex flex-col justify-between h-full bg-white transition-all">
                    <div>
                      {/* Icon + Code */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#EDF4FC] group-hover:bg-[#041128] text-[#041128] group-hover:text-white flex items-center justify-center transition-colors shadow-sm">
                          <Icon size={24} />
                        </div>
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-[#FAF9F5] border border-[#D9E1EA] text-[#5277A8]">
                          {dept.code}
                        </span>
                      </div>

                      {/* Name */}
                      <h2 className="font-sans font-semibold text-2xl text-[#041128] group-hover:text-[#5277A8] transition-colors m-0">
                        {dept.name}
                      </h2>

                      {/* Description */}
                      <p className="mt-2.5 text-sm font-sans text-[#848C9B] leading-relaxed line-clamp-3">
                        {DEPT_DESCRIPTIONS[dept.code] ||
                          `Innovative student projects and working engineering prototypes built by ${dept.name} students.`}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t border-[rgba(4,17,40,0.06)] flex items-center justify-between text-xs font-sans">
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
