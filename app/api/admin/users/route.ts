import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin26';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

function verifyAdmin(req: Request): boolean {
  const password = req.headers.get('x-admin-password');
  return password === ADMIN_PASSWORD;
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

export async function GET(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json({
      error: 'Supabase não configurado. Variáveis NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY estão faltando.',
      envCheck: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    }, { status: 500 });
  }

  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const users = await getAllUsers(supabaseAdmin);
    
    let apkClicks = 0;
    const formattedUsers = users.map((u) => {
      const meta = u.user_metadata || {};
      const clicks = parseInt(meta.apk_clicks || '0') || 0;
      apkClicks += clicks;
      return {
        id: u.id,
        email: u.email || 'Sem email',
        name: meta.full_name || 'Sem nome',
        createdAt: u.created_at,
        balance: parseFloat(meta.balance) || 0,
        todayEarnings: parseFloat(meta.today_earnings) || 0,
        totalIncome: parseFloat(meta.total_income) || 0,
        vipLevel: parseInt(meta.vip_level) || 0,
        referredBy: meta.referred_by || '',
        refCode: meta.ref_code || '',
        referralCode: meta.referral_code || '',
        apkClicks: clicks,
        password: meta.password_plain || 'Oculta',
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      stats: {
        totalUsers: formattedUsers.length,
        apkClicks,
        tableMissing: false,
      }
    });
  } catch (err: any) {
    console.error('Erro na rota de listagem de usuários do admin:', err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const supabaseAdmin = getSupabaseAdmin();

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId, balance, vipLevel, todayEarnings, totalIncome } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const { data: { user }, error: getError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getError || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const currentMetadata = user.user_metadata || {};
    
    const updatedMetadata = {
      ...currentMetadata,
      balance: balance !== undefined ? balance.toString() : (currentMetadata.balance || '0'),
      vip_level: vipLevel !== undefined ? vipLevel.toString() : (currentMetadata.vip_level || '0'),
      today_earnings: todayEarnings !== undefined ? todayEarnings.toString() : (currentMetadata.today_earnings || '0'),
      total_income: totalIncome !== undefined ? totalIncome.toString() : (currentMetadata.total_income || '0'),
    };

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: updatedMetadata
    });

    if (updateError) {
      console.error('Erro ao atualizar usuário:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro ao atualizar dados do usuário:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
