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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
  }

  try {
    const sb = assertSupabase();
    const { data: { user }, error } = await sb.auth.admin.getUserById(userId);

    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const metadata = user.user_metadata || {};
    const vipLevel = metadata.vip_level || 0;
    const vipExpiresAt = metadata.vip_expires_at;
    const isExpired = vipExpiresAt && new Date(vipExpiresAt) < new Date();

    return NextResponse.json({
      vipLevel: isExpired ? 0 : vipLevel,
      vipExpiresAt: isExpired ? null : vipExpiresAt,
      multiplier: vipLevel === 3 ? 10 : vipLevel === 2 ? 5 : vipLevel === 1 ? 2.5 : 1,
    });
  } catch (err) {
    console.error('VIP check error:', err);
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sb = assertSupabase();
    const body = await req.json();
    const { userId, vipLevel } = body;

    if (!userId || !vipLevel) {
      return NextResponse.json({ error: 'userId e vipLevel são obrigatórios' }, { status: 400 });
    }

    const { data: { user }, error } = await sb.auth.admin.getUserById(userId);

    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await sb.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user_metadata,
        vip_level: vipLevel,
        vip_expires_at: expiresAt.toISOString(),
        vip_activated_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      vipLevel,
      vipExpiresAt: expiresAt.toISOString(),
      multiplier: vipLevel === 3 ? 10 : vipLevel === 2 ? 5 : vipLevel === 1 ? 2.5 : 1,
    });
  } catch (err) {
    console.error('VIP update error:', err);
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
