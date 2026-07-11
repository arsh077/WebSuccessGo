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

function sanitizeString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

const ALLOWED_PACKAGES = new Set(['Starter', 'Business', 'Premium']);
const ALLOWED_PAYMENT_METHODS = new Set(['UPI QR', 'Razorpay']);

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

    let queryRef: any = db.collection('orders');

    if (user.role !== 'admin') {
      // Query Firestore for orders matching customer email or ID
      queryRef = queryRef.where('customerId', '==', user.uid);
    }

    const snapshot = await queryRef.orderBy('createdAt', 'desc').get();
    const orders: any[] = [];
    snapshot.forEach((doc: any) => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Fetch Orders error:', error.message);
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();

    const customerEmail = sanitizeString(body.customerEmail, 254);
    const packageName = sanitizeString(body.packageName, 20);
    const businessName = sanitizeString(body.businessName, 200);
    const ownerName = sanitizeString(body.ownerName, 100);
    const businessDescription = sanitizeString(body.businessDescription, 2000);
    const requiredPages = sanitizeString(body.requiredPages, 500);
    const paymentMethod = sanitizeString(body.paymentMethod, 20);
    const customerName = sanitizeString(body.customerName, 100);
    const customerPhone = sanitizeString(body.customerPhone, 15);
    const templateId = sanitizeString(body.templateId, 64);
    const templateName = sanitizeString(body.templateName, 200);
    const logoUrl = sanitizeString(body.logoUrl, 2000);
    const contentUrl = sanitizeString(body.contentUrl, 2000);

    if (!customerEmail || !packageName || !businessName || !ownerName) {
      return NextResponse.json(
        { error: 'Required fields are missing: customerEmail, packageName, businessName, ownerName.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/.test(customerEmail)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    if (!ALLOWED_PACKAGES.has(packageName)) {
      return NextResponse.json({ error: 'Invalid package.' }, { status: 400 });
    }

    if (paymentMethod && !ALLOWED_PAYMENT_METHODS.has(paymentMethod)) {
      return NextResponse.json({ error: 'Invalid payment method.' }, { status: 400 });
    }

    // Customer can only place orders for themselves
    if (user.role !== 'admin' && customerEmail.toLowerCase() !== user.email?.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let totalAmount = Number(body.amount);
    if (!Number.isFinite(totalAmount) || totalAmount < 0) {
      if (packageName === 'Starter') totalAmount = 4999;
      else if (packageName === 'Business') totalAmount = 9999;
      else if (packageName === 'Premium') totalAmount = 19999;
      else totalAmount = 4999;
    }
    totalAmount = Math.min(totalAmount, 1_000_000);

    const advancePaid = Math.round(totalAmount / 2);

    // Create unique order number
    const countSnapshot = await db.collection('orders').count().get();
    const orderCount = countSnapshot.data().count + 1;
    const orderNumber = `WSG-2026-${String(orderCount).padStart(4, '0')}`;

    const newOrder = {
      orderNumber,
      customerId: user.uid,
      customerName: customerName || ownerName,
      customerEmail,
      customerPhone: customerPhone || '',
      templateId: templateId || 'tpl-custom',
      templateName: templateName || 'Custom Website Solution',
      package: packageName,
      amount: totalAmount,
      advancePaid,
      paymentStatus: 'Partial Paid',
      projectStatus: 'Payment Received',
      businessName,
      ownerName,
      businessDescription,
      requiredPages: requiredPages || 'Home, About, Services, Contact',
      logoUrl,
      contentUrl,
      developerAssigned: 'Pending',
      adminNotes: 'Order automatically provisioned. Awaiting requirements review.',
      uploadedFiles: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('orders').add(newOrder);

    const transactionId = `TXN-${paymentMethod === 'UPI QR' ? 'UPI' : 'RZP'}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;

    const newPayment = {
      orderId: docRef.id,
      orderNumber,
      transactionId,
      amount: advancePaid,
      status: 'Partial Paid',
      method: paymentMethod || 'Razorpay',
      date: new Date().toISOString(),
    };

    await db.collection('payments').add(newPayment);

    return NextResponse.json({
      success: true,
      order: { id: docRef.id, ...newOrder },
      payment: newPayment,
      advancePaid,
      totalAmount,
    });
  } catch (error: any) {
    console.error('Create Order error:', error.message);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
