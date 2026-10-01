import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-[#041128] text-white py-16 border-t border-[#041128] mt-auto">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Logo */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="relative h-12 w-48 mb-4">
              <Image
                src="/logo.png"
                alt="BUILD CLUB Logo"
                fill
                className="object-contain object-left brightness-0 invert"
              />
            </div>
            <p className="text-sm text-[#848C9B] max-w-sm leading-relaxed">
              Empowering SSN students to turn innovative ideas into working technology solutions.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-4 grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#91A9C9] mb-4">
                Exhibition
              </div>
              <ul className="space-y-2.5 text-sm text-[#B2B4AB]">
                <li>
                  <Link href="/projects" className="hover:text-white transition-colors">
                    All Projects
                  </Link>
                </li>
                <li>
                  <Link href="/#departments" className="hover:text-white transition-colors">
                    Departments
                  </Link>
                </li>
                <li>
                  <Link href="/#about" className="hover:text-white transition-colors">
                    About Event
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#91A9C9] mb-4">
                Operations
              </div>
              <ul className="space-y-2.5 text-sm text-[#B2B4AB]">
                <li>
                  <Link href="/admin/login" className="hover:text-white transition-colors">
                    Admin Portal
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

          {/* Col 3: College Info */}
          <div className="md:col-span-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#91A9C9] mb-4">
              Institution
            </div>
            <p className="text-sm text-[#B2B4AB] leading-relaxed">
              SSN College of Engineering
              <br />
              Rajiv Gandhi Salai (OMR)
              <br />
              Kalavakkam, Tamil Nadu
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#848C9B]">
          <div>
            © {new Date().getFullYear()} BUILD CLUB — SSN I FOUND. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>SSN Project Exhibition</span>
            <span>•</span>
            <span>One Student = One Vote</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
