import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BUILD CLUB — SSN I FOUND | Project Exhibition',
  description:
    'Explore innovative student projects from SSN College of Engineering. BUILD CLUB Project Exhibition Portal.',
  keywords: ['SSN', 'Build Club', 'I FOUND', 'Project Exhibition', 'Student Projects'],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#040411] text-[#B2B4AB]">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#041128',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#B2B4AB',
            },
          }}
        />
      </body>
    </html>
  );
}
