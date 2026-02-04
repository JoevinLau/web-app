import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // 1. Check if user exists
    const users: any = await query({
      query: "SELECT * FROM users WHERE email = ? OR username = ?",
      values: [email, username],
    });

    if (users.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 2. Insert New User
    const result: any = await query({
      query: "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      values: [username, email, password],
    });

    const newUserId = result.insertId;

    // 3. Create a Wallet with $500 Welcome Bonus
    await query({
      query: "INSERT INTO wallets (user_id, balance) VALUES (?, ?)",
      values: [newUserId, 500.00], 
    });

    return NextResponse.json({ 
        message: "User created successfully",
        user: {
            id: newUserId,    
            username: username,
            email: email
        }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}