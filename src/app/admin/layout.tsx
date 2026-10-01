import type { Metadata } from 'next';

// ============================================================
// Admin Root Layout
// Guarantees all admin pages (including login) are never indexed
// ============================================================
export const metadata: Metadata = {
  title: 'Admin Portal | Build Club Innovation Day',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
