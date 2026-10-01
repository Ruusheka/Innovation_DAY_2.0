import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { PageContainer } from '@/components/ui/PageContainer';
import Link from 'next/link';
import { ArrowRight, Lightbulb, Users, Target, Award } from 'lucide-react';

export const metadata = {
  title: 'About the Exhibition — BUILD CLUB SSN I FOUND',
  description: 'Learn about BUILD CLUB and the SSN I FOUND Project Exhibition at SSN College of Engineering.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      <Navbar />

      <main className="flex-1 py-12 sm:py-20">
        <PageContainer>
          {/* Hero Header */}
          <div className="max-w-3xl mb-16 sm:mb-20">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-[1.5px] bg-[#5277A8]" />
              <span className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8]">
                BUILD CLUB &nbsp;/&nbsp; SSN I FOUND
              </span>
            </div>
            <h1 className="font-display font-normal text-4xl sm:text-6xl lg:text-[68px] text-[#041128] tracking-tight leading-[1.02] m-0">
              About the Exhibition
            </h1>
            <p className="mt-6 font-sans text-[#3D5574] text-lg sm:text-xl leading-relaxed">
              The SSN I FOUND Project Exhibition celebrates creative engineering, hands-on fabrication, and cross-departmental collaboration among student innovators at SSN College of Engineering.
            </p>
          </div>

          {/* Grid of Exhibition Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-20">
            {/* 1. The Exhibition */}
            <div className="card-white rounded-[24px] p-8 sm:p-10">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center mb-6 shadow-sm">
                <Lightbulb size={24} />
              </div>
              <h2 className="font-display font-normal text-2xl sm:text-3xl text-[#041128] mb-3">
                The Exhibition
              </h2>
              <p className="font-sans text-[#3D5574] text-base leading-relaxed">
                Organized under the aegis of BUILD CLUB and SSN I FOUND, this exhibition serves as a physical proving ground where theoretical concepts evolve into tangible hardware and software prototypes.
              </p>
            </div>

            {/* 2. Student Innovation */}
            <div className="card-white rounded-[24px] p-8 sm:p-10">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center mb-6 shadow-sm">
                <Users size={24} />
              </div>
              <h2 className="font-display font-normal text-2xl sm:text-3xl text-[#041128] mb-3">
                Student Innovation
              </h2>
              <p className="font-sans text-[#3D5574] text-base leading-relaxed">
                Students lead every stage from problem identification and architectural design to implementation, testing, and deployment. Real peer feedback drives iterative refinement.
              </p>
            </div>

            {/* 3. Engineering Across Departments */}
            <div className="card-white rounded-[24px] p-8 sm:p-10">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center mb-6 shadow-sm">
                <Target size={24} />
              </div>
              <h2 className="font-display font-normal text-2xl sm:text-3xl text-[#041128] mb-3">
                Cross-Departmental Collaboration
              </h2>
              <p className="font-sans text-[#3D5574] text-base leading-relaxed">
                Projects span CSE, ECE, EEE, MECH, and CIVIL disciplines. Modern engineering challenges demand interdisciplinary thinking where embedded electronics, code, and mechanical structures coalesce.
              </p>
            </div>

            {/* 4. Building Real Solutions */}
            <div className="card-white rounded-[24px] p-8 sm:p-10">
              <div className="w-12 h-12 rounded-2xl bg-[#EDF4FC] text-[#5277A8] flex items-center justify-center mb-6 shadow-sm">
                <Award size={24} />
              </div>
              <h2 className="font-display font-normal text-2xl sm:text-3xl text-[#041128] mb-3">
                Building Real Solutions
              </h2>
              <p className="font-sans text-[#3D5574] text-base leading-relaxed">
                Every project is measured by its real-world impact and technical rigor. Visitors and verified student peers cast their votes through an authorized physical registration desk.
              </p>
            </div>
          </div>

          {/* Exhibition CTA Banner */}
          <div className="rounded-[24px] bg-[#041128] text-white p-8 sm:p-14 text-center flex flex-col items-center">
            <span className="text-xs font-sans font-semibold uppercase tracking-[0.25em] text-[#91A9C9] mb-3">
              EXPLORE THE SHOWCASE
            </span>
            <h2 className="font-display font-normal text-3xl sm:text-4xl lg:text-5xl max-w-xl text-white mb-6">
              Experience the Innovations Built by SSN Students.
            </h2>
            <Link
              href="/projects"
              className="btn-navy-pill !bg-white !text-[#041128] hover:!bg-[#EDF4FC]"
            >
              <span>Explore All Projects</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </PageContainer>
      </main>

      <Footer />
    </div>
  );
}
