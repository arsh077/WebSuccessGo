import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const templates = db.getTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve templates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, id, name, category, image, price, features, demoURL } = body;

    // Check basic headers or role parameter for simple authorization (MVP context)
    const requesterRole = req.headers.get('x-requester-role') || 'customer';
    if (requesterRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    if (action === 'create') {
      if (!name || !category || !price) {
        return NextResponse.json({ error: 'Name, Category, and Price are required' }, { status: 400 });
      }
      const newTpl = db.addTemplate({
        name,
        category,
        image: image || 'https://picsum.photos/seed/default/800/600',
        price: Number(price),
        features: Array.isArray(features) ? features : [],
        demoURL: demoURL || 'https://demo.websuccessgo.com',
      });
      return NextResponse.json({ success: true, template: newTpl });
    }

    if (action === 'update') {
      if (!id) {
        return NextResponse.json({ error: 'Template ID is required for updates' }, { status: 400 });
      }
      const updated = db.updateTemplate(id, {
        name,
        category,
        image,
        price: price ? Number(price) : undefined,
        features,
        demoURL,
      });
      if (!updated) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, template: updated });
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Template ID is required for deletion' }, { status: 400 });
      }
      db.deleteTemplate(id);
      return NextResponse.json({ success: true, message: 'Template deleted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Templates API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
