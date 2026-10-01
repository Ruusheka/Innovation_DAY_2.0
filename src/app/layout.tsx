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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F5] text-[#041128]">
        {children}
        <Toaster
          theme="light"
          position="top-right"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              border: '1px solid rgba(4, 17, 40, 0.12)',
              color: '#041128',
              boxShadow: '0 10px 30px rgba(4, 17, 40, 0.08)',
            },
          }}
        />
      </body>
    </html>
  );
}
