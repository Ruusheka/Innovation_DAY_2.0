import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/auth/getAdminUser';
import { AdminSidebar, AdminMobileNav } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import type { EventSettings } from '@/types';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const admin = await getAdminUser(user.id);
  if (!admin) redirect('/admin/login?error=not_admin');

  // Fetch event settings for SUPER_ADMIN controls
  let eventSettings: EventSettings | null = null;
  if (admin.role === 'SUPER_ADMIN') {
    const svc = createServiceClient();
    const { data } = await svc.from('event_settings').select('*').single();
    eventSettings = data as EventSettings | null;
  }

  return (
    <div className="min-h-screen bg-[#040411]">
      <AdminSidebar />
      <div className="lg:pl-56 flex flex-col min-h-screen">
        <AdminHeader admin={admin} eventSettings={eventSettings} />
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
