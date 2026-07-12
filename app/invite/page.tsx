'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Headphones, 
  Lock, 
  Mail, 
  User, 
  Loader2, 
  AlertCircle, 
  Sparkles, 
  Music, 
  TrendingUp, 
  Coins 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function InviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ref, setRef] = useState<string | null>(null);

  // States for registration form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setRef(refParam);
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Generate random referral code for the new user
    const newUserRefCode = `user${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // 1. Sign up the user in Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            referred_by: ref || '',
            ref_code: newUserRefCode,
            balance: 25.00, // starting bonus
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

      // 2. Call the backend to process the referral reward if referred_by exists
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
          // Don't block registration if referral crediting fails, but log it.
        }
      }

      // 3. Handle successful signup redirect/confirmation
      if (data?.session) {
        router.push('/');
      } else {
        setSuccess('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta e ativar seus ganhos.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao realizar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row justify-center items-center font-sans p-4 md:p-8 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,185,84,0.2),rgba(0,0,0,1))] gap-8 max-w-6xl mx-auto">
      
      {/* Left side: Premium Landing Page content */}
      <div className="flex-1 space-y-6 text-left max-w-lg md:pr-4">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1DB954] shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bônus de Cadastro Ativo: R$ 25,00</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Ganhe Renda Extra Ouvindo Suas Músicas Favoritas
        </h1>
        
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
          O TAF26 Renda é a maior plataforma de monetização por streaming. Junte-se a nós hoje, ganhe R$ 25,00 de entrada imediatamente e seja pago para escutar hits todos os dias.
        </p>

        {ref && (
          <div className="bg-[#122319]/80 border border-[#21432f]/40 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-md shadow-lg shadow-emerald-950/10">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Convite Exclusivo</p>
              <p className="text-xs text-zinc-200 mt-0.5">
                Você foi convidado por <span className="text-[#1DB954] font-black">{ref}</span>
              </p>
            </div>
          </div>
        )}

        {/* Highlight points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-xl space-y-2 backdrop-blur-sm">
            <Music className="w-5 h-5 text-[#1DB954]" />
            <h3 className="text-xs font-black text-white">Ganhos por Ouvir</h3>
            <p className="text-[10px] text-zinc-500">Ouça músicas selecionadas diariamente.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-xl space-y-2 backdrop-blur-sm">
            <Coins className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xs font-black text-white">Indicação R$ 2,00</h3>
            <p className="text-[10px] text-zinc-500">Recomende amigos e ganhe bônus na hora.</p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-xl space-y-2 backdrop-blur-sm">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-xs font-black text-white">Saques PIX</h3>
            <p className="text-[10px] text-zinc-500">Retiradas instantâneas a partir de R$ 20,00.</p>
          </div>
        </div>
      </div>

      {/* Right side: Register Card Form */}
      <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(29,185,84,0.06)] space-y-6 backdrop-blur-md">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full overflow-hidden mx-auto shadow-lg shadow-emerald-500/10 flex items-center justify-center bg-black border border-zinc-800">
            <img src="/logo.jpeg" className="w-full h-full object-cover" alt="Logo" />
          </div>
          <h2 className="text-xl font-black tracking-tight mt-4">Criar Minha Conta</h2>
          <p className="text-xs text-zinc-400">Inscreva-se abaixo para começar a faturar</p>
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
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-black">Nome Completo</label>
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
                className="w-full bg-black/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#1DB954] transition-colors placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-black">E-mail</label>
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
                className="w-full bg-black/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#1DB954] transition-colors placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-black">Senha</label>
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
                className="w-full bg-black/60 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#1DB954] transition-colors placeholder-zinc-600"
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
              <span>Criar Conta e Receber R$ 25,00</span>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center pt-2">
          <p className="text-xs text-zinc-500">
            Já tem uma conta?{' '}
            <Link href="/sign-in" className="text-[#1DB954] hover:underline font-bold">
              Entrar
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
