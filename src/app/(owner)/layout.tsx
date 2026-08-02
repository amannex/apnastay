import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server-side protected layout for Owner Route Group: (owner)
 * Prevents client-side flash of unauthenticated UI.
 */
export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get('ownstay_session');
  const wpCookie = cookieStore.getAll().find(c => c.name.startsWith('wordpress_logged_in_'));

  if (!session && !wpCookie) {
    redirect('/login?redirect=/owner');
  }

  return <>{children}</>;
}
