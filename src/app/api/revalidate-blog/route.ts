import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('x-apnastay-webhook-key');
    const secret = process.env.WP_WEBHOOK_SECRET || 'apnastay-wp-cms-secret-key-2026';

    if (!authHeader || authHeader !== secret) {
      return NextResponse.json({ error: 'Unauthorized secret key' }, { status: 401 });
    }

    // Clear Next.js cache for the journal listing and post pages
    revalidatePath('/journal', 'page');
    revalidatePath('/journal/[slug]', 'page');

    return NextResponse.json({ revalidated: true, now: Date.now() }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
