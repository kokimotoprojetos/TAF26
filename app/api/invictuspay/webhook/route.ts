import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const data = await req.json();

    console.log('InvictusPay webhook received:', JSON.stringify(data, null, 2));

    if (data.status !== 'paid') {
      return NextResponse.json({ received: true });
    }

    const transactionHash = data.transaction_hash;
    const amount = data.amount || 0;

    let vipLevel = 0;
    if (amount >= 15000) {
      vipLevel = 3;
    } else if (amount >= 6000) {
      vipLevel = 2;
    } else if (amount >= 2500) {
      vipLevel = 1;
    }

    let customerEmail = null;
    if (transactionHash && process.env.INVICTUSPAY_API_URL && process.env.INVICTUSPAY_API_TOKEN) {
      try {
        const txResponse = await fetch(
          `${process.env.INVICTUSPAY_API_URL}/transactions/${transactionHash}?api_token=${process.env.INVICTUSPAY_API_TOKEN}`,
          { headers: { 'Accept': 'application/json' } }
        );
        const txData = await txResponse.json();
        if (txData.success && txData.data?.customer?.email) {
          customerEmail = txData.data.customer.email;
        }
      } catch (e) {
        console.error('Error fetching transaction details:', e);
      }
    }

    if (!supabaseAdmin) {
      console.warn('Supabase não configurado no webhook');
      return NextResponse.json({ received: true });
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
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ received: true });
  }
}
