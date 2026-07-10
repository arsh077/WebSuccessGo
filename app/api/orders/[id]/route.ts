import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orders = db.getOrders();

    // Find order by ID or orderNumber
    const order = orders.find(
      o => o.id === id || o.orderNumber.toUpperCase() === id.toUpperCase()
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch Order Detail error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const requesterRole = req.headers.get('x-requester-role') || 'customer';
    if (requesterRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin privileges required.' }, { status: 403 });
    }

    const {
      projectStatus,
      paymentStatus,
      developerAssigned,
      adminNotes,
      uploadedFile, // { name: string, url: string }
    } = body;

    const orders = db.getOrders();
    const order = orders.find(o => o.id === id || o.orderNumber.toUpperCase() === id.toUpperCase());

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateFields: any = {};
    if (projectStatus) updateFields.projectStatus = projectStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (developerAssigned !== undefined) updateFields.developerAssigned = developerAssigned;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    // Handle deliverables file uploads
    if (uploadedFile && uploadedFile.name && uploadedFile.url) {
      const files = order.uploadedFiles || [];
      const newFile = {
        name: uploadedFile.name,
        url: uploadedFile.url,
        date: new Date().toISOString(),
      };
      updateFields.uploadedFiles = [...files, newFile];
    }

    const updatedOrder = db.updateOrder(order.id, updateFields);

    // If payment status is updated to fully paid, we can log a supplementary final payment
    if (paymentStatus === 'Fully Paid' && order.paymentStatus !== 'Fully Paid') {
      const remainingAmount = order.amount - Math.round(order.amount / 2);
      db.addPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        transactionId: `TXN-BAL-${Math.floor(100000 + Math.random() * 900000)}`,
        amount: remainingAmount,
        status: 'Fully Paid',
        method: 'Razorpay',
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update Order API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
