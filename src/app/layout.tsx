import type { Metadata } from 'next';
import { Manrope, DM_Serif_Display } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-dm-serif',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'BUILD CLUB — SSN I FOUND | Project Exhibition',
  description:
    'Explore innovative student projects from SSN College of Engineering. BUILD CLUB Project Exhibition Portal.',
  keywords: ['SSN', 'Build Club', 'I FOUND', 'Project Exhibition', 'Student Projects', 'Engineering'],
  openGraph: {
    title: 'BUILD CLUB — SSN I FOUND',
    description: 'Explore what SSN students build.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F5] text-[#041128] font-sans">
        {children}
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid #D9E1EA',
              color: '#041128',
              boxShadow: '0 10px 30px rgba(4, 17, 40, 0.08)',
              fontFamily: 'var(--font-manrope), sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
