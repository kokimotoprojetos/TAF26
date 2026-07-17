import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateUniqueRefCode } from '@/lib/referral';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (error || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const meta = user.user_metadata || {};
    if (meta.ref_code) {
      return NextResponse.json({ success: true, refCode: meta.ref_code });
    }

    const refCode = await generateUniqueRefCode(supabaseAdmin);

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { ...meta, ref_code: refCode },
    });

    return NextResponse.json({ success: true, refCode });
  } catch (err: any) {
    console.error('Erro ao gerar ref_code:', err);
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 });
  }
}
