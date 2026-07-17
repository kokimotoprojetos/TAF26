import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function assertSupabase() {
  if (!supabaseAdmin) {
    throw new Error('Supabase não configurado. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  }
  return supabaseAdmin;
}

async function getAllUsers(sb: any) {
  const allUsers: any[] = [];
  let page = 1;
  const perPage = 1000;
  
  while (true) {
    const { data, error } = await sb.auth.admin.listUsers({
      perPage,
      page,
    });
    
    if (error || !data?.users) break;
    
    allUsers.push(...data.users);
    
    if (data.users.length < perPage) break;
    page++;
    
    if (page > 10) break;
  }
  
  return allUsers;
}

export async function POST(req: Request) {
  try {
    const sb = assertSupabase();
    const body = await req.json();
    const { newUserId, referredBy } = body;

    const normalizedReferredBy = (referredBy || '').trim().toUpperCase();

    if (!newUserId || !normalizedReferredBy) {
      return NextResponse.json(
        { error: 'newUserId e referredBy são obrigatórios' },
        { status: 400 }
      );
    }

    const { data: { user: newUser }, error: newUserError } =
      await sb.auth.admin.getUserById(newUserId);

    if (newUserError || !newUser) {
      return NextResponse.json(
        { error: 'Novo usuário não encontrado' },
        { status: 404 }
      );
    }

    const newUserMetadata = newUser.user_metadata || {};
    if ((newUserMetadata.referred_by || '').trim().toUpperCase() !== normalizedReferredBy) {
      await sb.auth.admin.updateUserById(newUserId, {
        user_metadata: {
          ...newUserMetadata,
          referred_by: normalizedReferredBy,
        },
      });
    }

    const allUsers = await getAllUsers(sb);

    const referrer = allUsers.find(
      (u) => (u.user_metadata?.ref_code || '').trim().toUpperCase() === normalizedReferredBy
    );

    if (!referrer) {
      console.warn(`Referrer with ref_code "${referredBy}" not found in auth list.`);
      return NextResponse.json({
        success: true,
        message: 'Novo usuário registrado, mas o padrinho não foi encontrado.',
      });
    }

    const referrerMetadata = referrer.user_metadata || {};
    const oldBalance = referrerMetadata.balance !== undefined ? parseFloat(referrerMetadata.balance) : 25.00;
    const oldTotalIncome = referrerMetadata.total_income !== undefined ? parseFloat(referrerMetadata.total_income) : 25.00;
    const oldTodayEarnings = referrerMetadata.today_earnings !== undefined ? parseFloat(referrerMetadata.today_earnings) : 0.00;

    const newBalance = parseFloat((oldBalance + 2.00).toFixed(2));
    const newTotalIncome = parseFloat((oldTotalIncome + 2.00).toFixed(2));
    const newTodayEarnings = parseFloat((oldTodayEarnings + 2.00).toFixed(2));

    await sb.auth.admin.updateUserById(referrer.id, {
      user_metadata: {
        ...referrerMetadata,
        balance: newBalance,
        total_income: newTotalIncome,
        today_earnings: newTodayEarnings,
      },
    });

    console.log(`Successfully credited ${referrer.id} with R$ 2.00 for referring ${newUserId}`);

    return NextResponse.json({
      success: true,
      creditedReferrer: referrer.id,
      newBalance,
    });
  } catch (err: any) {
    console.error('Error registering referral credit:', err);
    const message = err instanceof Error ? err.message : 'Erro interno ao processar crédito de convite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
