import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/lib/firebase/admin';

// ─── Rate limiting (20 req/min/IP for public GET, 60 for authenticated) ──────
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const PUBLIC_MAX = 20;
const AUTH_MAX = 60;

function isRateLimited(ip: string, isPublic: boolean): boolean {
  const key = isPublic ? `pub:${ip}` : `auth:${ip}`;
  const max = isPublic ? PUBLIC_MAX : AUTH_MAX;
  const now = Date.now();
  const timestamps = (rateLimitMap.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  rateLimitMap.set(key, timestamps);
  return timestamps.length > max;
}

// Helper to authenticate user via Firebase ID token and fetch Firestore user role
async function getAuthenticatedUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const role = userDoc.exists ? userDoc.data()?.role : 'customer';
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: role || 'customer',
    };
  } catch (error) {
    return null;
  }
}

// ─── Input validation ─────────────────────────────────────────────────────────
const ALLOWED_CATEGORIES = new Set([
  'Restaurant Website Templates',
  'Clinic Website Templates',
  'Law Firm Website Templates',
  'Salon Website Templates',
  'E-commerce Website Templates',
  'Startup Website Templates',
  'Bike Website Templates',
]);

function sanitizeString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

// GET is public — no auth required
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip, true)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const snapshot = await db.collection('templates').orderBy('createdAt', 'desc').get();
    const templates: any[] = [];
    snapshot.forEach((doc: any) => {
      templates.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json({ templates });
  } catch (error: any) {
    console.error('Fetch templates error:', error.message);
    return NextResponse.json({ error: 'Failed to retrieve templates.' }, { status: 500 });
  }
}

// POST — admin only, requires server-side auth
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip, false)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (!['create', 'update', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    const name = sanitizeString(body.name, 100);
    const category = sanitizeString(body.category, 60);
    const image = sanitizeString(body.image, 2000);
    const price = typeof body.price === 'number' || typeof body.price === 'string'
      ? Number(body.price)
      : NaN;
    const demoURL = sanitizeString(body.demoURL, 2000);
    const id = sanitizeString(body.id, 64);
    const features: string[] = Array.isArray(body.features)
      ? body.features.slice(0, 20).map((f: unknown) => String(f).slice(0, 200))
      : [];

    if (action === 'create') {
      if (!name || !category || isNaN(price)) {
        return NextResponse.json(
          { error: 'Name, category, and price are required.' },
          { status: 400 }
        );
      }
      if (!ALLOWED_CATEGORIES.has(category)) {
        return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
      }
      if (price < 0 || price > 1_000_000) {
        return NextResponse.json({ error: 'Price must be between 0 and 1,000,000.' }, { status: 400 });
      }
      if (image && !/^https?:\/\/.+/.test(image)) {
        return NextResponse.json({ error: 'Image must be a valid URL.' }, { status: 400 });
      }
      if (demoURL && !/^https?:\/\/.+/.test(demoURL)) {
        return NextResponse.json({ error: 'Demo URL must be a valid URL.' }, { status: 400 });
      }

      const newTpl = {
        name,
        category,
        image: image || 'https://picsum.photos/seed/default/800/600',
        price,
        features,
        demoURL: demoURL || 'https://demo.websuccessgo.com',
        createdAt: new Date().toISOString(),
      };

      const docRef = await db.collection('templates').add(newTpl);
      return NextResponse.json({ success: true, template: { id: docRef.id, ...newTpl } });
    }

    if (action === 'update') {
      if (!id) {
        return NextResponse.json(
          { error: 'Template ID is required for updates.' },
          { status: 400 }
        );
      }
      if (category && !ALLOWED_CATEGORIES.has(category)) {
        return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
      }
      if (!isNaN(price) && (price < 0 || price > 1_000_000)) {
        return NextResponse.json({ error: 'Price must be between 0 and 1,000,000.' }, { status: 400 });
      }

      const templateRef = db.collection('templates').doc(id);
      const doc = await templateRef.get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
      }

      const updateData: Record<string, any> = {};
      if (name) updateData.name = name;
      if (category) updateData.category = category;
      if (image) updateData.image = image;
      if (!isNaN(price)) updateData.price = price;
      if (demoURL) updateData.demoURL = demoURL;
      if (features.length > 0) updateData.features = features;
      updateData.updatedAt = new Date().toISOString();

      await templateRef.update(updateData);
      const updatedDoc = await templateRef.get();

      return NextResponse.json({ success: true, template: { id, ...updatedDoc.data() } });
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json(
          { error: 'Template ID is required for deletion.' },
          { status: 400 }
        );
      }
      await db.collection('templates').doc(id).delete();
      return NextResponse.json({ success: true, message: 'Template deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Templates API error:', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
