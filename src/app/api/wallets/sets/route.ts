import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/server';
import { db } from '@/db';
import { walletSet } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sets = await db.query.walletSet.findMany({
      where: eq(walletSet.userId, session.user.id),
      orderBy: (walletSet, { desc }) =>[desc(walletSet.createdAt)],
    });

    return NextResponse.json(sets);
  } catch (error: any) {
    console.error('Error getting wallet sets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get wallet sets' },
      { status: 500 }
    );
  }
} 