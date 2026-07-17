import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    // Fetch existing user metadata
    const { data: { user }, error: getError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (getError || !user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const currentMetadata = user.user_metadata || {};
    const currentClicks = parseInt(currentMetadata.apk_clicks || '0') || 0;
    
    // Update metadata with incremented clicks
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...currentMetadata,
        apk_clicks: (currentClicks + 1).toString()
      }
    });

    if (updateError) {
      console.error('Erro ao registrar clique do APK:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro interno ao registrar clique do APK:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  // Return success dummy to prevent errors
  return NextResponse.json({ success: true, count: 0 });
}
