import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const portfolio = db.getPortfolio();
    return NextResponse.json({ portfolio });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve portfolio' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, title, category, image, description, demoURL, technology, deliveryTime } = body;

    const requesterRole = req.headers.get('x-requester-role') || 'customer';
    if (requesterRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    if (action === 'create') {
      if (!title || !category || !description) {
        return NextResponse.json({ error: 'Title, Category, and Description are required' }, { status: 400 });
      }
      const newItem = db.addPortfolioItem({
        title,
        category,
        image: image || 'https://picsum.photos/seed/default/800/600',
        description,
        demoURL: demoURL || 'https://demo.websuccessgo.com',
        technology: technology || 'Next.js, Tailwind',
        deliveryTime: deliveryTime || '7 Days',
      });
      return NextResponse.json({ success: true, item: newItem });
    }

    if (action === 'update') {
      if (!id) {
        return NextResponse.json({ error: 'Portfolio ID is required for updates' }, { status: 400 });
      }
      const updated = db.updatePortfolioItem(id, {
        title,
        category,
        image,
        description,
        demoURL,
        technology,
        deliveryTime,
      });
      if (!updated) {
        return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, item: updated });
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Portfolio ID is required for deletion' }, { status: 400 });
      }
      db.deletePortfolioItem(id);
      return NextResponse.json({ success: true, message: 'Portfolio item deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Portfolio API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
