import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const requesterRole = req.headers.get('x-requester-role') || 'customer';
    const requesterEmail = req.headers.get('x-requester-email') || '';

    let orders = db.getOrders();

    if (requesterRole !== 'admin') {
      if (!requesterEmail) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      // Filter orders belonging to this customer email
      orders = orders.filter(
        o => o.customerEmail.toLowerCase() === requesterEmail.toLowerCase()
      );
    }

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      templateId,
      templateName,
      packageName, // 'Starter' | 'Business' | 'Premium'
      amount,
      paymentMethod, // 'UPI QR' | 'Razorpay'
      businessName,
      ownerName,
      businessDescription,
      requiredPages,
      logoUrl,
      contentUrl,
    } = body;

    if (!customerEmail || !packageName || !businessName || !ownerName) {
      return NextResponse.json({ error: 'Required fields are missing' }, { status: 400 });
    }

    // Determine numerical pricing based on package if not provided
    let totalAmount = Number(amount);
    if (!totalAmount) {
      if (packageName === 'Starter') totalAmount = 4999;
      else if (packageName === 'Business') totalAmount = 9999;
      else if (packageName === 'Premium') totalAmount = 19999;
      else totalAmount = 4999;
    }

    // Since it's a 50% advance model, we collect 50% now
    const advancePaid = Math.round(totalAmount / 2);

    // Create the order using db helper
    const newOrder = db.addOrder({
      customerId: customerId || `u-anon-${Date.now()}`,
      customerName: customerName || ownerName,
      customerEmail,
      customerPhone: customerPhone || '9999999999',
      templateId: templateId || 'tpl-custom',
      templateName: templateName || 'Custom Website Solution',
      package: packageName,
      amount: totalAmount,
      paymentStatus: 'Partial Paid', // Starts as 50% partial advance payment
      projectStatus: 'Payment Received', // Initial status after payment is completed
      businessName,
      ownerName,
      businessDescription,
      requiredPages: requiredPages || 'Home, About, Services, Contact',
      logoUrl: logoUrl || '',
      contentUrl: contentUrl || '',
      developerAssigned: 'Pending',
      adminNotes: 'Order automatically provisioned. Awaiting requirements review.',
      uploadedFiles: [],
    });

    // Record the payment log
    const transactionId = `TXN-${paymentMethod === 'UPI QR' ? 'UPI' : 'RZP'}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPayment = db.addPayment({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      transactionId,
      amount: advancePaid,
      status: 'Partial Paid',
      method: paymentMethod || 'Razorpay',
    });

    // Trigger mock email / WhatsApp notifications log (this simulates the automated background features)
    console.log(`Notification sent for order ${newOrder.orderNumber}: Email to ${customerEmail}, WhatsApp to ${customerPhone}`);

    return NextResponse.json({
      success: true,
      order: newOrder,
      payment: newPayment,
      advancePaid,
      totalAmount,
    });
  } catch (error: any) {
    console.error('Create Order API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
