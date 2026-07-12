import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAllUsers() {
  const allUsers: any[] = [];
  let page = 1;
  const perPage = 1000;
  
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      perPage,
      page,
    });
    
    if (error || !data?.users) break;
    
    allUsers.push(...data.users);
    
    if (data.users.length < perPage) break;
    page++;
    
    // Safety limit: max 10 pages (10,000 users)
    if (page > 10) break;
  }
  
  return allUsers;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const refCode = searchParams.get('refCode');

  if (!refCode) {
    return NextResponse.json({ error: 'refCode é obrigatório' }, { status: 400 });
  }

  try {
    const allUsers = await getAllUsers();

    const referralUsers = allUsers.filter(
      (u) => u.user_metadata?.referred_by === refCode
    );

    // Map to Referral interface
    const referrals = referralUsers.map((u) => {
      const name = u.user_metadata?.full_name || u.email || 'Usuário';
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
