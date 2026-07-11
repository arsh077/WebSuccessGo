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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    if (!id || id.length > 64 || !/^[\w\-\.]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid order identifier.' }, { status: 400 });
    }

    // Try finding by doc ID first
    let doc = await db.collection('orders').doc(id).get();
    let orderData: any = doc.exists ? { id: doc.id, ...doc.data() } : null;

    if (!orderData) {
      // Find by orderNumber
      const snapshot = await db.collection('orders').where('orderNumber', '==', id.toUpperCase()).limit(1).get();
      if (!snapshot.empty) {
        const docRef = snapshot.docs[0];
        orderData = { id: docRef.id, ...docRef.data() } as any;
      }
    }

    if (!orderData) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    // Customers can only see their own orders
    if (user.role !== 'admin' && orderData.customerId !== user.uid) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    return NextResponse.json({ order: orderData });
  } catch (error: any) {
    console.error('Fetch Order Detail error:', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    // Only admins can modify order parameters
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required.' }, { status: 403 });
    }

    const { id } = await params;
    if (!id || id.length > 64 || !/^[\w\-\.]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid order identifier.' }, { status: 400 });
    }

    const body = await req.json();

    const ALLOWED_PROJECT_STATUSES = new Set([
      'Pending',
      'Payment Received',
      'Requirement Received',
      'Design Started',
      'Development Started',
      'Testing',
      'Completed',
    ]);

    const ALLOWED_PAYMENT_STATUSES = new Set([
      'Pending',
      'Partial Paid',
      'Fully Paid',
      'Refunded',
    ]);

    const projectStatus = typeof body.projectStatus === 'string' ? body.projectStatus : undefined;
    const paymentStatus = typeof body.paymentStatus === 'string' ? body.paymentStatus : undefined;
    const developerAssigned =
      typeof body.developerAssigned === 'string'
        ? body.developerAssigned.trim().slice(0, 100)
        : undefined;
    const adminNotes =
      typeof body.adminNotes === 'string'
        ? body.adminNotes.trim().slice(0, 2000)
        : undefined;

    if (projectStatus !== undefined && !ALLOWED_PROJECT_STATUSES.has(projectStatus)) {
      return NextResponse.json({ error: 'Invalid project status.' }, { status: 400 });
    }
    if (paymentStatus !== undefined && !ALLOWED_PAYMENT_STATUSES.has(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status.' }, { status: 400 });
    }

    let uploadedFileField: { name: string; url: string } | undefined;
    if (body.uploadedFile) {
      const fname = typeof body.uploadedFile.name === 'string'
        ? body.uploadedFile.name.trim().slice(0, 255)
        : '';
      const furl = typeof body.uploadedFile.url === 'string'
        ? body.uploadedFile.url.trim().slice(0, 2000)
        : '';
      if (fname && furl && /^https?:\/\/.+/.test(furl)) {
        uploadedFileField = { name: fname, url: furl };
      }
    }

    let orderDocRef = db.collection('orders').doc(id);
    let orderDoc = await orderDocRef.get();

    if (!orderDoc.exists) {
      // Try search by orderNumber
      const snapshot = await db.collection('orders').where('orderNumber', '==', id.toUpperCase()).limit(1).get();
      if (!snapshot.empty) {
        orderDocRef = snapshot.docs[0].ref;
        orderDoc = snapshot.docs[0];
      }
    }

    if (!orderDoc.exists) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const currentOrderData: any = orderDoc.data();

    const updateFields: Record<string, any> = {};
    if (projectStatus !== undefined) updateFields.projectStatus = projectStatus;
    if (paymentStatus !== undefined) updateFields.paymentStatus = paymentStatus;
    if (developerAssigned !== undefined) updateFields.developerAssigned = developerAssigned;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    updateFields.updatedAt = new Date().toISOString();

    if (uploadedFileField) {
      const files = currentOrderData.uploadedFiles || [];
      updateFields.uploadedFiles = [
        ...files,
        { ...uploadedFileField, date: new Date().toISOString() },
      ];
    }

    await orderDocRef.update(updateFields);

    // Seed supplementary payment log
    if (paymentStatus === 'Fully Paid' && currentOrderData.paymentStatus !== 'Fully Paid') {
      const remainingAmount = currentOrderData.amount - Math.round(currentOrderData.amount / 2);
      const newPayment = {
        orderId: orderDocRef.id,
        orderNumber: currentOrderData.orderNumber,
        transactionId: `TXN-BAL-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: remainingAmount,
        status: 'Fully Paid',
        method: 'Razorpay',
        date: new Date().toISOString(),
      };
      await db.collection('payments').add(newPayment);
    }

    const updatedDoc = await orderDocRef.get();
    return NextResponse.json({ success: true, order: { id: orderDocRef.id, ...updatedDoc.data() } });
  } catch (error: any) {
    console.error('Update Order API error:', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
