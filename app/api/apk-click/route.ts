import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  try {
    const { error } = await supabaseAdmin.from('apk_clicks').insert({});
    if (error) {
      console.error('Erro ao registrar clique do APK:', error);
      return NextResponse.json({ error: error.message, tableMissing: error.code === 'PGRST116' || error.message.includes('relation') }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro interno ao registrar clique do APK:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  try {
    const { count, error } = await supabaseAdmin
      .from('apk_clicks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Erro ao buscar cliques do APK:', error);
      const isTableMissing = error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist');
      return NextResponse.json({ success: false, error: error.message, tableMissing: isTableMissing, count: 0 });
    }

    return NextResponse.json({ success: true, count: count || 0 });
  } catch (err: any) {
    console.error('Erro interno ao buscar cliques do APK:', err);
    return NextResponse.json({ success: false, error: err.message, count: 0 });
  }
}
