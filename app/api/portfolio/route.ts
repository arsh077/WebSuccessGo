import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/lib/firebase/admin';

// ─── Rate limiting ───────────────────────────────────────────────────────────
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

// ─── Input helpers ────────────────────────────────────────────────────────────
function sanitize(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

const ALLOWED_CATEGORIES = new Set([
  'Restaurant',
  'Clinic',
  'Law Firm',
  'E-commerce',
  'Startup',
]);

// GET is public — no auth required
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip, true)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const snapshot = await db.collection('portfolio').orderBy('createdAt', 'desc').get();
    const portfolio: any[] = [];
    snapshot.forEach((doc: any) => {
      portfolio.push({ id: doc.id, ...doc.data() });
    });
    return NextResponse.json({ portfolio });
  } catch (error: any) {
    console.error('Fetch portfolio error:', error.message);
    return NextResponse.json({ error: 'Failed to retrieve portfolio.' }, { status: 500 });
  }
}

// POST — admin only
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

    const id = sanitize(body.id, 64);
    const title = sanitize(body.title, 200);
    const category = sanitize(body.category, 60);
    const image = sanitize(body.image, 2000);
    const description = sanitize(body.description, 2000);
    const demoURL = sanitize(body.demoURL, 2000);
    const technology = sanitize(body.technology, 200);
    const deliveryTime = sanitize(body.deliveryTime, 50);

    if (action === 'create') {
      if (!title || !category || !description) {
        return NextResponse.json(
          { error: 'Title, category, and description are required.' },
          { status: 400 }
        );
      }
      if (!ALLOWED_CATEGORIES.has(category)) {
        return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
      }
      if (image && !/^https?:\/\/.+/.test(image)) {
        return NextResponse.json({ error: 'Image must be a valid URL.' }, { status: 400 });
      }
      if (demoURL && !/^https?:\/\/.+/.test(demoURL)) {
        return NextResponse.json({ error: 'Demo URL must be a valid URL.' }, { status: 400 });
      }

      const newItem = {
        title,
        category,
        image: image || 'https://picsum.photos/seed/default/800/600',
        description,
        demoURL: demoURL || 'https://demo.websuccessgo.com',
        technology: technology || 'Next.js, Tailwind',
        deliveryTime: deliveryTime || '7 Days',
        createdAt: new Date().toISOString(),
      };

      const docRef = await db.collection('portfolio').add(newItem);
      return NextResponse.json({ success: true, item: { id: docRef.id, ...newItem } });
    }

    if (action === 'update') {
      if (!id) {
        return NextResponse.json(
          { error: 'Portfolio ID is required for updates.' },
          { status: 400 }
        );
      }
      if (category && !ALLOWED_CATEGORIES.has(category)) {
        return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
      }

      const portfolioRef = db.collection('portfolio').doc(id);
      const doc = await portfolioRef.get();
      if (!doc.exists) {
        return NextResponse.json({ error: 'Portfolio item not found.' }, { status: 404 });
      }

      const updateData: Record<string, any> = {};
      if (title) updateData.title = title;
      if (category) updateData.category = category;
      if (image) updateData.image = image;
      if (description) updateData.description = description;
      if (demoURL) updateData.demoURL = demoURL;
      if (technology) updateData.technology = technology;
      if (deliveryTime) updateData.deliveryTime = deliveryTime;
      updateData.updatedAt = new Date().toISOString();

      await portfolioRef.update(updateData);
      const updatedDoc = await portfolioRef.get();

      return NextResponse.json({ success: true, item: { id, ...updatedDoc.data() } });
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json(
          { error: 'Portfolio ID is required for deletion.' },
          { status: 400 }
        );
      }
      await db.collection('portfolio').doc(id).delete();
      return NextResponse.json({ success: true, message: 'Portfolio item deleted.' });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Portfolio API error:', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
