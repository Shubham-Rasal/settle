import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { checkout } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/checkouts/[slug] - Fetch checkout by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const checkoutData = await db
      .select()
      .from(checkout)
      .where(eq(checkout.slug, slug))
      .limit(1);

    if (checkoutData.length === 0) {
      return NextResponse.json({ error: 'Checkout not found' }, { status: 404 });
    }

    return NextResponse.json({ checkout: checkoutData[0] });
  } catch (error) {
    console.error('Failed to fetch checkout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}