import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';
import { BackgroundDecoration } from '@/components/ui/BackgroundDecoration';

export const viewport: Viewport = {
  themeColor: '#041128',
  width: 'device-width',
  initialScale: 1,
};

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  variable: '--font-dm-serif',
  weight: ['400'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://buildclub.ssn.edu.in';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Build Club Innovation Day | SSN College of Engineering',
    template: '%s | Build Club Innovation Day',
  },
  description:
    'Build Club Innovation Day showcases innovative student projects at SSN College of Engineering.',
  keywords: [
    'SSN',
    'SSN College of Engineering',
    'Build Club',
    'Innovation Day',
    'Project Exhibition',
    'Student Projects',
    'Engineering',
  ],
  authors: [{ name: 'Build Club SSN' }],
  creator: 'Build Club SSN',
  publisher: 'SSN College of Engineering',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: 'Build Club Innovation Day | SSN College of Engineering',
    description:
      'Build Club Innovation Day showcases innovative student projects at SSN College of Engineering.',
    siteName: 'Build Club Innovation Day',
    images: [
      {
        url: '/img1.png',
        width: 1200,
        height: 630,
        alt: 'Build Club Innovation Day — SSN College of Engineering',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build Club Innovation Day | SSN College of Engineering',
    description:
      'Build Club Innovation Day showcases innovative student projects at SSN College of Engineering.',
    images: ['/img1.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'EducationalOrganization',
      '@id': `${siteUrl}/#organization`,
      name: 'Build Club — SSN College of Engineering',
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: ['https://www.ssn.edu.in'],
    },
    {
      '@type': 'Event',
      '@id': `${siteUrl}/#event`,
      name: 'Build Club Innovation Day',
      description:
        'Build Club Innovation Day showcases innovative student engineering projects at SSN College of Engineering.',
      url: siteUrl,
      organizer: {
        '@id': `${siteUrl}/#organization`,
      },
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'SSN College of Engineering',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Kalavakkam',
          addressRegion: 'Tamil Nadu',
          postalCode: '603110',
          addressCountry: 'IN',
        },
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Build Club Innovation Day',
      publisher: {
        '@id': `${siteUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F5] text-[#041128] font-primary relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BackgroundDecoration />
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
              fontFamily: 'var(--font-primary), "DM Serif Display", Georgia, serif',
            },
          }}
        />
      </body>
    </html>
  );
}
