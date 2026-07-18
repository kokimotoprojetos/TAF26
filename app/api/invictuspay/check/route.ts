import { NextResponse } from 'next/server';

const API_URL = process.env.INVICTUSPAY_API_URL || '';
const TOKEN = process.env.INVICTUSPAY_API_TOKEN || '';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'Hash da transação é obrigatório' }, { status: 400 });
  }

  if (!API_URL || !TOKEN) {
    return NextResponse.json({ error: 'InvictusPay não configurado. Variáveis de ambiente faltando.' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${API_URL}/transactions/${hash}?api_token=${TOKEN}`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return NextResponse.json({ error: 'Erro ao consultar transação' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: data.payment_status,
      transaction: data,
    });
  } catch (err) {
    console.error('Check transaction error:', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
