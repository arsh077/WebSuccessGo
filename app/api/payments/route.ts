import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const requesterRole = req.headers.get('x-requester-role') || 'customer';
    const requesterEmail = req.headers.get('x-requester-email') || '';

    let payments = db.getPayments();

    if (requesterRole !== 'admin') {
      if (!requesterEmail) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      // Only return payments matching the customer's orders
      const orders = db.getOrders().filter(
        o => o.customerEmail.toLowerCase() === requesterEmail.toLowerCase()
      );
      const orderNumbers = orders.map(o => o.orderNumber);
      payments = payments.filter(p => orderNumbers.includes(p.orderNumber));
    }

    return NextResponse.json({ payments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve payments' }, { status: 500 });
  }
}
