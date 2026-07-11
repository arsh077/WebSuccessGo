import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/lib/firebase/admin';

// ─── Rate limiting (60 req/min/IP) ───────────────────────────────────────────
const rateLimitMap = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

// Helper to extract Firebase ID token from Authorization header
async function getFirebaseUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

// GET /api/auth — retrieves the current authenticated user's profile from Firestore
export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const decodedToken = await getFirebaseUser(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // If Firestore doc doesn't exist yet but user is in Firebase Auth, return basic info
      return NextResponse.json({
        success: true,
        user: {
          id: uid,
          email: decodedToken.email,
          name: decodedToken.name || '',
          phone: '',
          role: 'customer',
        },
      });
    }

    const data = userDoc.data();
    return NextResponse.json({
      success: true,
      user: {
        id: uid,
        email: decodedToken.email,
        name: data?.name || '',
        phone: data?.phone || '',
        role: data?.role || 'customer',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/auth — updates/creates user profile in Firestore
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const decodedToken = await getFirebaseUser(req);
    if (!decodedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 50) : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 15) : '';

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    // Preserve role if already exists (e.g. admin seeding) or set default customer
    let role = 'customer';
    if (doc.exists) {
      role = doc.data()?.role || 'customer';
    } else {
      // Check if this is the designated admin email to auto-seed role
      if (decodedToken.email?.toLowerCase() === 'admin@websuccessgo.com') {
        role = 'admin';
      }
    }

    const userData = {
      name,
      phone,
      email: decodedToken.email?.toLowerCase() || '',
      role,
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(userData, { merge: true });

    return NextResponse.json({
      success: true,
      user: {
        id: uid,
        email: decodedToken.email,
        name,
        phone,
        role,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
