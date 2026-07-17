'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Headphones, Lock, Mail, User, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const newUserRefCode = `u${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            ref_code: newUserRefCode,
            ...(ref ? { referred_by: ref } : {}),
            balance: 25.00,
            today_earnings: 0.00,
            total_income: 25.00,
            vip_level: 0,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      const signedUpUser = data?.user;

      // Call the backend to process the referral reward if referred_by exists
      if (signedUpUser && ref) {
        try {
          await fetch('/api/user/register-referral', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              newUserId: signedUpUser.id,
              referredBy: ref,
            }),
          });
        } catch (apiErr) {
          console.error('Error calling register-referral endpoint:', apiErr);
        }
      }

      // Check if email confirmation is required
      if (data?.session) {
        router.push('/');
      } else {
        setSuccess('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao realizar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center font-sans p-4 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,185,84,0.15),rgba(0,0,0,1))]">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800/80 rounded-3xl p-8 shadow-[0_0_50px_rgba(29,185,84,0.05)] space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto shadow-lg shadow-emerald-500/10 flex items-center justify-center bg-black border border-zinc-800">
            <img src="/logo.jpeg" className="w-full h-full object-cover" alt="Logo" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-4">Criar Conta</h1>
          <p className="text-xs text-zinc-400">Cadastre-se para começar a ganhar ouvindo música</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/20 text-rose-300 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-emerald-400 text-xs font-bold">✓</span>
            </div>
            <p className="font-medium">{success}</p>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">Nome Completo</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#1DB954] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">E-mail</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#1DB954] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">Senha</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#1DB954] transition-colors"
                minLength={6}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1DB954] hover:bg-emerald-400 disabled:bg-emerald-800/50 text-black disabled:text-zinc-400 rounded-xl text-sm font-black shadow-md cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando Conta...</span>
              </>
            ) : (
              <span>Criar Nova Conta</span>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500">
            Já tem uma conta?{' '}
            <Link href="/sign-in" className="text-[#1DB954] hover:underline font-bold">
              Entre por aqui
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
