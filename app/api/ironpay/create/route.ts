import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

const PRICES: Record<number, number> = {
  1: 2500,
  2: 6000,
  3: 15000,
};

const CPF = '43444695772';
const NAME = 'angela maria cardoso vieira';

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Variável de ambiente ${name} não configurada no servidor`);
  }
  return val;
}

export async function POST(req: Request) {
  try {
    const IRONPAY_API = requireEnv('IRONPAY_API_URL');
    const TOKEN = requireEnv('IRONPAY_API_TOKEN');

    const OFFERS: Record<number, string> = {
      1: requireEnv('IRONPAY_OFFER_VIP1'),
      2: requireEnv('IRONPAY_OFFER_VIP2'),
      3: requireEnv('IRONPAY_OFFER_VIP3'),
    };

    const PRODUCT_HASHES: Record<number, string> = {
      1: requireEnv('IRONPAY_PRODUCT_VIP1'),
      2: requireEnv('IRONPAY_PRODUCT_VIP2'),
      3: requireEnv('IRONPAY_PRODUCT_VIP3'),
    };

    const body = await req.json();
    const { vipPlan, userId, email } = body;

    if (!vipPlan || ![1, 2, 3].includes(vipPlan)) {
      return NextResponse.json({ error: 'Plano VIP inválido' }, { status: 400 });
    }

    const offerHash = OFFERS[vipPlan];
    const productHash = PRODUCT_HASHES[vipPlan];
    const amount = PRICES[vipPlan];
    const fullOfferHash = `${productHash}_${offerHash}`;

    const payload = {
      api_token: TOKEN,
      amount,
      payment_method: 'pix',
      offer_hash: fullOfferHash,
      installments: 1,
      cart: [
        {
          product_hash: productHash,
          title: `VIP ${vipPlan} - Plano`,
          price: amount,
          quantity: 1,
          operation_type: 1,
        },
      ],
      customer: {
        name: NAME,
        email: email || 'angela@taf26.site',
        phone_number: '11999999999',
        document: CPF,
      },
      postback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.taf26.site'}/api/ironpay/webhook`,
    };

    const response = await fetch(`${IRONPAY_API}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.payment_status === 'refused') {
      console.error('IronPay error:', JSON.stringify(data));
      return NextResponse.json({ error: data.message || 'Erro ao criar transação' }, { status: 500 });
    }

    const pixCode = data.pix?.pix_qr_code || null;

    let pixQrImage = null;
    if (pixCode) {
      try {
        pixQrImage = await QRCode.toDataURL(pixCode, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' },
        });
      } catch (qrErr) {
        console.error('QR code generation error:', qrErr);
      }
    }

    return NextResponse.json({
      success: true,
      transaction: data,
      pixCode,
      pixQrImage,
      transactionHash: data.hash,
    });
  } catch (err) {
    console.error('IronPay create error:', err);
    const message = err instanceof Error ? err.message : 'Erro interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
