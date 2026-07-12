import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const refCode = searchParams.get('refCode');

  if (!refCode) {
    return NextResponse.json({ error: 'refCode é obrigatório' }, { status: 400 });
  }

  try {
    // List all users from auth to find referrals
    // Note: listUsers defaults to pagination (usually 50 users, max 1000). 
    // In a production app, we would query a PostgreSQL table 'profiles' or 'referrals' instead.
    // However, since this codebase relies entirely on Auth metadata, we list users.
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000
    });

    if (error) {
      throw error;
    }

    const referralUsers = (data?.users || []).filter(
      (u) => u.user_metadata?.referred_by === refCode
    );

    // Map to Referral interface
    const referrals = referralUsers.map((u) => {
      const name = u.user_metadata?.full_name || u.email || 'Usuário';
      // Mask email or name slightly for privacy
      let displayName = name;
      if (name.includes('@')) {
        const [parts, domain] = name.split('@');
        displayName = parts.substring(0, 3) + '***@' + domain;
      }

      return {
        id: u.id,
        name: displayName,
        date: new Date(u.created_at).toLocaleDateString('pt-BR'),
        status: 'Ativo',
        reward: 2.00,
      };
    });

    return NextResponse.json({
      success: true,
      referrals,
    });
  } catch (err: any) {
    console.error('Error fetching referrals:', err);
    return NextResponse.json({ error: 'Erro interno ao buscar convidados' }, { status: 500 });
  }
}
