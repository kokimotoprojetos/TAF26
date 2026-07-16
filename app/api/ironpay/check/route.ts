import { NextResponse } from 'next/server';

const IRONPAY_API = process.env.IRONPAY_API_URL || '';
const TOKEN = process.env.IRONPAY_API_TOKEN || '';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const hash = searchParams.get('hash');

  if (!hash) {
    return NextResponse.json({ error: 'Hash da transação é obrigatório' }, { status: 400 });
  }

  if (!IRONPAY_API || !TOKEN) {
    return NextResponse.json({ error: 'IronPay não configurado. Variáveis de ambiente faltando.' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `${IRONPAY_API}/transactions/${hash}?api_token=${TOKEN}`,
      {
        headers: { 'Accept': 'application/json' },
      }
    );

    const data = await response.json();

    if (!response.ok) {
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
