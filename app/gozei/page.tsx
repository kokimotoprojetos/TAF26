'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Smartphone, 
  DollarSign, 
  Search, 
  Edit3, 
  Save, 
  X, 
  Lock, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Copy, 
  LogOut,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  balance: number;
  todayEarnings: number;
  totalIncome: number;
  vipLevel: number;
  referredBy: string;
  referralCode: string;
}

interface Stats {
  totalUsers: number;
  apkClicks: number;
  tableMissing: boolean;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, apkClicks: 0, tableMissing: false });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  // Edit modal state
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editTodayEarnings, setEditTodayEarnings] = useState('');
  const [editTotalIncome, setEditTotalIncome] = useState('');
  const [editVipLevel, setEditVipLevel] = useState(0);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Persist session locally
  useEffect(() => {
    const savedPass = localStorage.getItem('admin_pass');
    if (savedPass) {
      setPassword(savedPass);
      verifySavedPassword(savedPass);
    }
  }, []);

  const verifySavedPassword = async (pass: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-password': pass }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setStats(data.stats || { totalUsers: 0, apkClicks: 0, tableMissing: false });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_pass');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-password': password }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setStats(data.stats || { totalUsers: 0, apkClicks: 0, tableMissing: false });
        setIsAuthenticated(true);
        localStorage.setItem('admin_pass', password);
        showToast('Login realizado com sucesso!', 'success');
      } else {
        const data = await res.json();
        setLoginError(data.error || 'Senha incorreta');
      }
    } catch (err: any) {
      setLoginError('Erro de conexão com o servidor');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    localStorage.removeItem('admin_pass');
    setUsers([]);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setStats(data.stats || { totalUsers: 0, apkClicks: 0, tableMissing: false });
        showToast('Dados atualizados!');
      } else {
        showToast('Erro ao atualizar dados', 'error');
      }
    } catch (e) {
      showToast('Erro de rede', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setEditBalance(user.balance.toString());
    setEditTodayEarnings(user.todayEarnings.toString());
    setEditTotalIncome(user.totalIncome.toString());
    setEditVipLevel(user.vipLevel);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify({
          userId: editingUser.id,
          balance: parseFloat(editBalance) || 0,
          todayEarnings: parseFloat(editTodayEarnings) || 0,
          totalIncome: parseFloat(editTotalIncome) || 0,
          vipLevel: editVipLevel
        })
      });

      if (res.ok) {
        showToast('Usuário atualizado com sucesso!', 'success');
        setEditingUser(null);
        handleRefresh();
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao salvar alterações', 'error');
      }
    } catch (err) {
      showToast('Erro de conexão ao salvar', 'error');
    } finally {
      setIsSavingUser(false);
    }
  };

  const copySqlToClipboard = () => {
    const sql = `CREATE TABLE IF NOT EXISTS apk_clicks (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    showToast('SQL copiado para a área de transferência!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Filter users based on query
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getVipBadge = (level: number) => {
    switch (level) {
      case 1:
        return <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-amber-600 to-amber-800 text-amber-100 border border-amber-500/20">VIP 1</span>;
      case 2:
        return <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-zinc-300 to-zinc-500 text-zinc-950 border border-zinc-200/30">VIP 2</span>;
      case 3:
        return <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-950 border border-yellow-300/30 animate-pulse">VIP 3</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-800 text-zinc-400">Membro</span>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-[#1DB954] selection:text-black">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border text-xs font-black backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-zinc-900/90 text-[#1DB954] border-[#1DB954]/30' 
                : 'bg-red-950/90 text-red-400 border-red-500/30'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {!isAuthenticated ? (
        // Login Screen
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-radial-[circle_at_center,rgba(29,185,84,0.08)_0%,rgba(0,0,0,0)_70%]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1DB954]/5 rounded-full blur-[120px] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl shadow-2xl relative z-10"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-[#1DB954]">
                <Lock className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Painel Admin - TAF26</h2>
              <p className="text-xs text-zinc-500 mt-1">Acesso exclusivo para administradores da plataforma</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">Senha de Acesso</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-[#1DB954]/50 focus:ring-1 focus:ring-[#1DB954]/50 rounded-2xl py-3.5 px-4 text-sm text-white placeholder-zinc-700 outline-none transition-all font-mono"
                    autoFocus
                  />
                </div>
                {loginError && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> {loginError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-zinc-800 disabled:text-zinc-600 text-black py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>Acessar Painel <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      ) : (
        // Main Admin Dashboard
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#1DB954] animate-pulse" />
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Painel de Controle</h1>
              </div>
              <p className="text-xs text-zinc-500 mt-1">Gerencie usuários cadastrados e monitore downloads do APK</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-3 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:border-zinc-750 text-zinc-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>

              <button
                onClick={handleLogout}
                className="p-3 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 text-red-400 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Users */}
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-900 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Total de Usuários</p>
                <h3 className="text-2xl font-black text-white">{stats.totalUsers}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-center text-[#1DB954]">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* APK Clicks */}
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-900 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Cliques em Baixar APK</p>
                <h3 className="text-2xl font-black text-white">
                  {stats.tableMissing ? (
                    <span className="text-amber-500 flex items-center gap-1 text-sm font-bold">
                      <AlertTriangle className="w-4 h-4" /> Pendente
                    </span>
                  ) : (
                    stats.apkClicks
                  )}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-center text-blue-400">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>

            {/* Simulated VIP Deposits */}
            <div className="p-6 rounded-3xl bg-zinc-900/30 border border-zinc-900 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Usuários VIP Ativos</p>
                <h3 className="text-2xl font-black text-white">
                  {users.filter(u => u.vipLevel > 0).length}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-950/80 border border-zinc-850 flex items-center justify-center text-yellow-400">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Database Setup Alert if Table is Missing */}
          {stats.tableMissing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-amber-950/15 border border-amber-900/40 text-amber-200/90 space-y-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white">Ação Necessária: Crie a tabela de cliques no Supabase</h4>
                  <p className="text-xs text-amber-300/80">
                    A tabela para monitoramento dos cliques no APK (`apk_clicks`) ainda não foi criada no banco de dados. 
                    Siga o passo a passo abaixo para configurá-la em 10 segundos:
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <ol className="text-xs list-decimal list-inside pl-1 text-zinc-400 space-y-1">
                  <li>Acesse o <a href="https://supabase.com/dashboard/project/zzpmdwwzfmfktkmhxxhd" target="_blank" rel="noopener noreferrer" className="text-amber-400 font-bold hover:underline">Painel do Supabase</a>.</li>
                  <li>Clique na aba **SQL Editor** no menu lateral esquerdo.</li>
                  <li>Cole o código SQL abaixo e clique em **Run**:</li>
                </ol>

                <div className="relative bg-zinc-950/80 rounded-2xl border border-zinc-850 p-4 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                  <pre>{`CREATE TABLE IF NOT EXISTS apk_clicks (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`}</pre>
                  <button
                    onClick={copySqlToClipboard}
                    className="absolute top-3 right-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold border border-zinc-800 flex items-center gap-1 transition-all"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-[#1DB954]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Management Area */}
          <div className="rounded-3xl bg-zinc-900/10 border border-zinc-900 overflow-hidden backdrop-blur-sm">
            <div className="p-6 border-b border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-black text-white tracking-tight">Gerenciamento de Usuários</h3>
              
              {/* Search */}
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-650 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-850 focus:border-[#1DB954]/50 focus:ring-1 focus:ring-[#1DB954]/50 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-650 outline-none transition-all"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900/80 text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/20">
                    <th className="py-4 px-6">Usuário</th>
                    <th className="py-4 px-6 text-center">Nível</th>
                    <th className="py-4 px-6">Saldo</th>
                    <th className="py-4 px-6">Ganhos Hoje</th>
                    <th className="py-4 px-6">Ganhos Totais</th>
                    <th className="py-4 px-6">Cadastro</th>
                    <th className="py-4 px-6 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-xs">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#1DB954]" />
                        Carregando banco de dados...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-zinc-900/20 transition-all">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-[10px] text-zinc-500">{user.email}</div>
                          {user.referredBy && (
                            <div className="text-[9px] text-[#1DB954] mt-0.5">
                              Indicação de: <span className="font-mono">{user.referredBy}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {getVipBadge(user.vipLevel)}
                        </td>
                        <td className="py-4 px-6 font-bold text-white font-mono">
                          R$ {user.balance.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-zinc-400 font-mono">
                          R$ {user.todayEarnings.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-zinc-400 font-mono">
                          R$ {user.totalIncome.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-zinc-500">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-[#1DB954]/10 hover:text-[#1DB954] text-zinc-400 rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-850 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">Editar Dados Financeiros</h3>
                  <p className="text-[10px] text-zinc-500 truncate max-w-[280px]">{editingUser.name} ({editingUser.email})</p>
                </div>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                {/* Balance */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Saldo Atual (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-[#1DB954]/50 focus:ring-1 focus:ring-[#1DB954]/50 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white font-mono outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Today Earnings */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ganhos de Hoje (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editTodayEarnings}
                      onChange={(e) => setEditTodayEarnings(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-[#1DB954]/50 focus:ring-1 focus:ring-[#1DB954]/50 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white font-mono outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Total Income */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Ganhos Totais (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-bold text-xs">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={editTotalIncome}
                      onChange={(e) => setEditTotalIncome(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 focus:border-[#1DB954]/50 focus:ring-1 focus:ring-[#1DB954]/50 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white font-mono outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* VIP Level */}
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nível de VIP</label>
                  <select
                    value={editVipLevel}
                    onChange={(e) => setEditVipLevel(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-[#1DB954]/50 focus:ring-1 focus:ring-[#1DB954]/50 rounded-xl py-2.5 px-4 text-sm text-white outline-none transition-all cursor-pointer"
                  >
                    <option value={0}>Membro Comum (Sem VIP)</option>
                    <option value={1}>VIP 1</option>
                    <option value={2}>VIP 2</option>
                    <option value={3}>VIP 3</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-all border border-zinc-850 active:scale-95 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingUser}
                    className="flex-1 py-3 bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-zinc-800 disabled:text-zinc-650 text-black rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                  >
                    {isSavingUser ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
