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

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let payments: any[] = [];

    if (user.role === 'admin') {
      const snapshot = await db.collection('payments').orderBy('date', 'desc').get();
      snapshot.forEach((doc: any) => {
        payments.push({ id: doc.id, ...doc.data() });
      });
    } else {
      // Find orders for this customer to map payments
      const orderSnapshot = await db.collection('orders').where('customerId', '==', user.uid).get();
      const orderNumbers: string[] = [];
      orderSnapshot.forEach((doc: any) => {
        const orderData = doc.data();
        if (orderData.orderNumber) {
          orderNumbers.push(orderData.orderNumber);
        }
      });

      if (orderNumbers.length > 0) {
        // Query payments matching these order numbers
        const paymentSnapshot = await db.collection('payments').where('orderNumber', 'in', orderNumbers).get();
        paymentSnapshot.forEach((doc: any) => {
          payments.push({ id: doc.id, ...doc.data() });
        });
      }
    }

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Fetch Payments error:', error.message);
    return NextResponse.json({ error: 'Failed to retrieve payments.' }, { status: 500 });
  }
}
