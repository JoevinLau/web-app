import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Find user by email
    const users: any = await query({
      query: "SELECT * FROM users WHERE email = ?",
      values: [email],
    });

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const user = users[0];

    // 2. Check Password (Direct comparison for now, use bcrypt.compare in production)
    if (password !== user.password_hash) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // 3. Success! Return user info (excluding password)
    return NextResponse.json({ 
        message: "Login successful", 
        user: { id: user.user_id, username: user.username, email: user.email } 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}