import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { userId, action, amount } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // 1. Get Wallet
    const wallets: any = await query({
      query: "SELECT * FROM wallets WHERE user_id = ?",
      values: [userId],
    });

    if (wallets.length === 0) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    const wallet = wallets[0];
    const currentBalance = parseFloat(wallet.balance);
    const val = parseFloat(amount);

    // 2. Handle Actions
    let newBalance = currentBalance;

    if (action === 'balance') {
        // Just return current balance
    } 
    else if (action === 'deposit') {
        newBalance += val;
        await query({ query: "UPDATE wallets SET balance = ? WHERE wallet_id = ?", values: [newBalance, wallet.wallet_id] });
    } 
    else if (action === 'withdraw') {
        newBalance = 0;
        await query({ query: "UPDATE wallets SET balance = 0 WHERE wallet_id = ?", values: [wallet.wallet_id] });
    }
    else if (action === 'bet') {
        if (currentBalance < val) return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        newBalance -= val;
        await query({ query: "UPDATE wallets SET balance = ? WHERE wallet_id = ?", values: [newBalance, wallet.wallet_id] });
    }
    else if (action === 'payout') {
        newBalance += val;
        await query({ query: "UPDATE wallets SET balance = ? WHERE wallet_id = ?", values: [newBalance, wallet.wallet_id] });
    }

    return NextResponse.json({ balance: newBalance, message: "Success" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}