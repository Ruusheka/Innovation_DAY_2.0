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
            <div className="flex items-center gap-2.5 mb-4">
              <div className="relative h-10 w-[54px]">
                <Image
                  src="/logo-white.png"
                  alt="BUILD CLUB"
                  fill
                  className="object-contain"
                  sizes="60px"
                />
              </div>
              <span aria-hidden="true" className="font-serif italic font-light text-[17px] text-[#E5A83B] select-none opacity-90">×</span>
              <div className="relative h-[38px] w-[38px]"><Image src="/LakLogo.png" alt="Lakshya" fill sizes="40px" className="object-contain" /></div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/85">Lakshya</span>
            </div>
            <p className="text-sm text-[#848C9B] max-w-sm leading-relaxed">
              Empowering SSN engineering students to transform bold ideas into working prototypes and real-world technology solutions.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8] mb-3.5">
                Exhibition
              </div>
              <ul className="space-y-2.5 text-sm text-[#B2B4AB]">
                <li>
                  <Link href="/#hero" className="hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="hover:text-white transition-colors">
                    About Exhibition
                  </Link>
                </li>
                <li>
                  <Link href="/#projects" className="hover:text-white transition-colors">
                    Department Showcase
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-white transition-colors">
                    All Projects
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8] mb-3.5">
                Desk Operations
              </div>
              <ul className="space-y-2.5 text-sm text-[#B2B4AB]">
                <li>
                  <Link href="/admin/vote" className="hover:text-white transition-colors">
                    Registration Desk
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center gap-1.5 text-xs text-[#848C9B] hover:text-[#91A9C9] transition-colors mt-1"
                  >
                    <span>Admin Access</span>
                    <span>&rarr;</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 3: Institutional Information */}
          <div className="md:col-span-3">
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.25em] text-[#5277A8] mb-3.5">
              Institution
            </div>
            <p className="text-sm text-[#B2B4AB] leading-relaxed">
              SSN College of Engineering
              <br />
              Rajiv Gandhi Salai (OMR)
              <br />
              Kalavakkam, Tamil Nadu 603110
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#848C9B]">
          <div>
            &copy; {new Date().getFullYear()} BUILD CLUB &mdash; SSN I FOUND. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>SSN Project Exhibition</span>
            <span>&bull;</span>
            <span>One Student = One Vote</span>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}
