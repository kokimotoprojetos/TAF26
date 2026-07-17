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

export async function POST(req: Request) {
  const sb = getSupabaseAdmin();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId } = body;

    const { data: { user }, error } = await sb.auth.admin.getUserById(userId);
    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const meta = user.user_metadata || {};
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: meta.full_name,
      ref_code: meta.ref_code || '',
      referred_by: meta.referred_by || '',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}