import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Owner Walkthrough / Onboarding Entry Route (/list-apnastay)
 * - If user is already registered & logged in -> Redirect directly to Step 1 of property registration
 * - If user is a guest/unregistered -> Redirect to owner signup with redirect parameter back to Step 1
 */
export default async function ListApnaStayPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('apnastay_session');
  const wpCookie = cookieStore.getAll().find((c) => c.name.startsWith('wordpress_logged_in_'));

  const isAuthenticated = Boolean(
    (session && session.value && session.value !== 'deleted') ||
    (wpCookie && wpCookie.value && wpCookie.value !== 'deleted')
  );

  if (isAuthenticated) {
    redirect('/owner/dashboard/properties/new');
  } else {
    redirect('/register?role=property_owner&redirect=/owner/dashboard/properties/new');
  }
}

