import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, password, name, phone } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const users = db.getUsers();

    if (action === 'login') {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (user.password !== password) {
        return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
      }

      // Successful login - return safe user details (no password)
      const { password: _, ...safeUser } = user;
      return NextResponse.json({ success: true, user: safeUser });
    } else if (action === 'register') {
      if (!name || !password || !phone) {
        return NextResponse.json({ error: 'Name, password, and phone are required for registration' }, { status: 400 });
      }

      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
      }

      const newUser = db.addUser({
        id: `u-${Date.now()}`,
        name,
        email,
        phone,
        password,
        role: 'customer',
      });

      const { password: _, ...safeUser } = newUser;
      return NextResponse.json({ success: true, user: safeUser });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
