import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server-side protected layout for Tenant Route Group: (tenant)
 * Prevents client-side flash of unauthenticated UI.
 */
export default async function TenantLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('apnastay_session');
  const wpCookie = cookieStore.getAll().find(c => c.name.startsWith('wordpress_logged_in_'));

  const isAuthenticated = Boolean(
    (session && session.value && session.value !== 'deleted') ||
    (wpCookie && wpCookie.value && wpCookie.value !== 'deleted')
  );

  if (!isAuthenticated) {
    redirect('/login?redirect=/dashboard');
  }

  return <>{children}</>;
}
