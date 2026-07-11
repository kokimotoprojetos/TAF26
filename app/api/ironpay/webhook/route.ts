import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Skip DB insert if table doesn't exist yet
const SAFE_DB = false; // flip to true after creating ironpay_transactions table

export async function POST(req: Request) {
  try {
    const data = await req.json();

    console.log('IronPay webhook received:', JSON.stringify(data, null, 2));

    if (data.event !== 'transaction' || data.payment_status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    const transactionHash = data.hash;
    const customerEmail = data.customer?.email;
    const customerName = data.customer?.name;
    const offerTitle = data.offer?.title || '';
    const amount = data.amount || 0;

    let vipLevel = 0;
    if (offerTitle.includes('VIP 3') || offerTitle.includes('Diamond') || amount >= 15000) {
      vipLevel = 3;
    } else if (offerTitle.includes('VIP 2') || offerTitle.includes('Gold') || amount >= 6000) {
      vipLevel = 2;
    } else if (offerTitle.includes('VIP 1') || offerTitle.includes('Bronze') || amount >= 2500) {
      vipLevel = 1;
    }

    if (vipLevel > 0 && customerEmail) {
      const { data: users } = await supabaseAdmin.auth.admin.listUsers();
      const user = users?.users.find(u => u.email === customerEmail);

      if (user) {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            vip_level: vipLevel,
            vip_expires_at: expiresAt.toISOString(),
            vip_activated_at: new Date().toISOString(),
          },
        });

        console.log(`VIP ${vipLevel} activated for user ${user.id} until ${expiresAt.toISOString()}`);
      }

      // Optional: save to ironpay_transactions table (uncomment after creating the table)
      // const { error: upsertError } = await supabaseAdmin
      //   .from('ironpay_transactions')
      //   .insert({
      //     transaction_hash: transactionHash,
      //     amount,
      //     status: 'paid',
      //     vip_level: vipLevel,
      //     customer_email: customerEmail,
      //     customer_name: customerName,
      //     raw_data: data,
      //   });
      // if (upsertError) {
      //   console.error('Error saving transaction:', upsertError);
      // }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ received: true });
  }
}
