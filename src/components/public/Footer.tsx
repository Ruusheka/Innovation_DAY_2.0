import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#91A9C9]/10 border border-[#91A9C9]/20 flex items-center justify-center">
              <span className="text-[#91A9C9] font-bold text-xs font-mono">BC</span>
            </div>
            <div className="leading-none">
              <div className="text-white/80 font-semibold text-sm">BUILD CLUB</div>
              <div className="text-[#91A9C9] text-xs tracking-widest">SSN I FOUND</div>
            </div>
          </div>

          {/* Center text */}
          <p className="text-[#848C9B] text-xs text-center">
            SSN College of Engineering · Project Exhibition
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 text-xs text-[#848C9B]">
            <Link href="/projects" className="hover:text-[#91A9C9] transition-colors">
              Projects
            </Link>
            <span className="opacity-30">·</span>
            <Link href="/admin/login" className="hover:text-[#91A9C9] transition-colors">
              Admin
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-[#848C9B]/50">
          © {new Date().getFullYear()} Build Club SSN. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
