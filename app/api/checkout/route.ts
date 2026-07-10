import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { getCurrentUser } from '@/lib/auth-helpers';

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  // Amount in paise (₹1 = 100 paise). Configure via RAZORPAY_AMOUNT_INR.
  const amountInr = Number(process.env.RAZORPAY_AMOUNT_INR || 499);

  const order = await razorpay.orders.create({
    amount: amountInr * 100,
    currency: 'INR',
    receipt: `unlock_${Date.now()}`,
    notes: { user_id: user.id },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
}
