import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { newUserId, referredBy } = body;

    if (!newUserId || !referredBy) {
      return NextResponse.json(
        { error: 'newUserId e referredBy são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Fetch the newly registered user (B)
    const { data: { user: newUser }, error: newUserError } =
      await supabaseAdmin.auth.admin.getUserById(newUserId);

    if (newUserError || !newUser) {
      return NextResponse.json(
        { error: 'Novo usuário não encontrado' },
        { status: 404 }
      );
    }

    // Ensure the new user metadata has the referred_by property set
    const newUserMetadata = newUser.user_metadata || {};
    if (newUserMetadata.referred_by !== referredBy) {
      await supabaseAdmin.auth.admin.updateUserById(newUserId, {
        user_metadata: {
          ...newUserMetadata,
          referred_by: referredBy,
        },
      });
    }

    // 2. Find the referrer (A) who has user_metadata.ref_code === referredBy
    const { data: usersData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (listError || !usersData?.users) {
      throw listError || new Error('Falha ao listar usuários');
    }

    const referrer = usersData.users.find(
      (u) => u.user_metadata?.ref_code === referredBy
    );

    if (!referrer) {
      console.warn(`Referrer with ref_code "${referredBy}" not found in auth list.`);
      return NextResponse.json({
        success: true,
        message: 'Novo usuário registrado, mas o padrinho não foi encontrado.',
      });
    }

    // 3. Credit the referrer with R$ 2.00
    const referrerMetadata = referrer.user_metadata || {};
    const oldBalance = referrerMetadata.balance !== undefined ? parseFloat(referrerMetadata.balance) : 25.00;
    const oldTotalIncome = referrerMetadata.total_income !== undefined ? parseFloat(referrerMetadata.total_income) : 25.00;
    const oldTodayEarnings = referrerMetadata.today_earnings !== undefined ? parseFloat(referrerMetadata.today_earnings) : 0.00;

    const newBalance = parseFloat((oldBalance + 2.00).toFixed(2));
    const newTotalIncome = parseFloat((oldTotalIncome + 2.00).toFixed(2));
    const newTodayEarnings = parseFloat((oldTodayEarnings + 2.00).toFixed(2));

    await supabaseAdmin.auth.admin.updateUserById(referrer.id, {
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
    return NextResponse.json(
      { error: 'Erro interno ao processar crédito de convite' },
      { status: 500 }
    );
  }
}
