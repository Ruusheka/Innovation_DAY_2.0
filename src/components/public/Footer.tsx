import Link from 'next/link';
import Image from 'next/image';
import { PageContainer } from '@/components/ui/PageContainer';

export function Footer() {
  return (
    <footer className="bg-[#041128] text-white py-14 sm:py-16 border-t border-[#041128] mt-auto">
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-white/10">
          {/* Col 1: Brand & Logo */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="relative h-11 w-44 mb-3.5">
              <Image
                src="/logo.png"
                alt="BUILD CLUB — SSN I FOUND"
                fill
                className="object-contain object-left brightness-0 invert"
                sizes="176px"
              />
            </div>
            <p className="font-sans text-sm text-[#848C9B] max-w-sm leading-relaxed">
              Empowering SSN engineering students to transform bold ideas into working prototypes and real-world technology solutions.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <div className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8] mb-3.5">
                Exhibition
              </div>
              <ul className="space-y-2.5 text-sm font-sans text-[#B2B4AB]">
                <li>
                  <Link href="/projects" className="hover:text-white transition-colors">
                    All Projects
                  </Link>
                </li>
                <li>
                  <Link href="/departments" className="hover:text-white transition-colors">
                    Departments
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Exhibition
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8] mb-3.5">
                Desk Portal
              </div>
              <ul className="space-y-2.5 text-sm font-sans text-[#B2B4AB]">
                <li>
                  <Link href="/admin/login" className="hover:text-white transition-colors">
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link href="/admin/vote" className="hover:text-white transition-colors">
                    Registration Desk
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: Institutional Information */}
          <div className="md:col-span-3">
            <div className="text-[11.5px] font-sans font-semibold uppercase tracking-[0.25em] text-[#5277A8] mb-3.5">
              Institution
            </div>
            <p className="font-sans text-sm text-[#B2B4AB] leading-relaxed">
              SSN College of Engineering
              <br />
              Rajiv Gandhi Salai (OMR)
              <br />
              Kalavakkam, Tamil Nadu 603110
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#848C9B]">
          <div>
            © {new Date().getFullYear()} BUILD CLUB — SSN I FOUND. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>SSN Project Exhibition</span>
            <span>•</span>
            <span>One Student = One Vote</span>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
