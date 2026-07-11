'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, SkipForward, 
  Pause, 
  Volume2, 
  VolumeX, 
  Share2, 
  DollarSign, 
  ArrowUpRight, 
  User, 
  Check, 
  Copy, 
  Users, 
  Compass, 
  TrendingUp, 
  Headphones, 
  Smartphone, 
  ChevronRight, 
  Clock, 
  Award, 
  Send, 
  HelpCircle, 
  RotateCcw,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  Loader2,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// Interfaces
interface Song {
  id: string;
  title: string;
  artist: string;
  reward: number; // in BRL, between 2 and 5
  coverUrl: string;
  genre: string;
  youtubeId: string;
  duration?: number; // placeholder duration in seconds
}

interface Referral {
  id: string;
  name: string;
  date: string;
  status: 'Ativo' | 'Pendente';
  reward: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  pixKey: string;
  keyType: string;
  date: string;
  status: 'Concluído' | 'Processando' | 'Pendente';
}

interface VIPPlan {
  id: number;
  name: string;
  price: number;
  multiplier: number;
  description: string;
  earningsEstimate: string;
  color: string;
  badgeColor: string;
  icon: string;
}

export default function Taf26RendaPage() {
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        window.location.href = '/sign-in';
      }
      setIsUserLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        window.location.href = '/sign-in';
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- STATE ---
  const [balance, setBalance] = useState<number>(25.00);
  const [todayEarnings, setTodayEarnings] = useState<number>(0.00);
  const [totalIncome, setTotalIncome] = useState<number>(25.00);
  const [vipLevel, setVipLevel] = useState<number>(0); // 0 = Free, 1 = VIP Bronze, 2 = VIP Gold, 3 = VIP Diamond
  const [isAppDownloaded, setIsAppDownloaded] = useState<boolean>(false);
  const [isDownloadingApp, setIsDownloadingApp] = useState<boolean>(false);
  
  // Navigation & Tabs
  const [activeTab, setActiveTab] = useState<'player' | 'vip' | 'history'>('player');
  const [activeFooterTab, setActiveFooterTab] = useState<'home' | 'team' | 'missions' | 'mine'>('home');
  
  // Music Player
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [songProgress, setSongProgress] = useState<number>(30); // percentage
  const [secondsElapsed, setSecondsElapsed] = useState<number>(45);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Reward state for current video
  const [rewarded, setRewarded] = useState<boolean>(false);

  // Day tracking: which day (1-30) and which videos completed today
  const dayNumber = (Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % 30) + 1;
  const dailyVideos: Song[] = songs.slice((dayNumber - 1) * 5, dayNumber * 5);
  const [videoCompleted, setVideoCompleted] = useState<boolean[]>(Array(5).fill(false));
  const currentDaySongIndex = currentSongIndex % 5;
  
  // Modals & Flows
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isRechargeOpen, setIsRechargeOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // PIX Withdrawal Form
  const [pixKey, setPixKey] = useState<string>('');
  const [pixKeyType, setPixKeyType] = useState<string>('CPF');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isWithdrawingAnimation, setIsWithdrawingAnimation] = useState<boolean>(false);
  const [withdrawStep, setWithdrawStep] = useState<number>(0); // 0: input, 1: processing, 2: success

  // Referral State
  const [referrals, setReferrals] = useState<Referral[]>([
    { id: 'ref-1', name: 'Ana Clara Souza', date: '09/07/2026', status: 'Ativo', reward: 2.00 },
    { id: 'ref-2', name: 'Matheus Pereira', date: '08/07/2026', status: 'Ativo', reward: 2.00 },
  ]);
  const [newReferralName, setNewReferralName] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Deposit/Recharge State
  const [rechargeAmount, setRechargeAmount] = useState<string>('20');
  const [rechargeStep, setRechargeStep] = useState<number>(0); // 0: amount, 1: QR Code, 2: success

  // Support Chat State
  const [supportMessages, setSupportMessages] = useState<{ sender: 'user' | 'support'; text: string; time: string }[]>([
    { sender: 'support', text: 'Olá! Sou o assistente da TAF26 RENDA. Como posso te ajudar hoje?', time: '18:51' },
    { sender: 'support', text: 'Temos saques instantâneos via PIX a partir de R$ 20,00 e bônus de convites de R$ 2,00 na hora!', time: '18:51' },
  ]);
  const [supportInput, setSupportInput] = useState<string>('');

  // Daily Missions
  const [missions, setMissions] = useState([
    { id: 'm-1', title: 'Ouvir música por 5 minutos', description: 'Ouça qualquer faixa para ganhar bônus.', progress: 120, target: 300, reward: 5.00, completed: false },
    { id: 'm-2', title: 'Convidar 3 amigos', description: 'Convide amigos usando seu link.', progress: 2, target: 3, reward: 10.00, completed: false },
    { id: 'm-3', title: 'Ativar qualquer VIP', description: 'Aumente sua taxa de ganhos diários.', progress: 0, target: 1, reward: 15.00, completed: false },
  ]);

  // Withdrawal History
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([
    { id: 'w-1', amount: 15.00, pixKey: '***.482.118-**', keyType: 'CPF', date: '08/07/2026 14:15', status: 'Concluído' },
  ]);

  // --- AUDIO REFERENCING & ENGINE ---
  const playerRef = useRef<any>(null);

  // Playlist data
  const songs: Song[] = [
    {
      id: 's-1',
      title: 'Never Gonna Give You Up',
      artist: 'Rick Astley',
      reward: 3.00,
      youtubeId: 'dQw4w9WgXcQ',
      coverUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-2',
      title: 'Uptown Funk',
      artist: 'Mark Ronson ft. Bruno Mars',
      reward: 4.50,
      youtubeId: '3JZ_D3ELwOQ',
      coverUrl: 'https://img.youtube.com/vi/3JZ_D3ELwOQ/hqdefault.jpg',
      genre: 'Funk'
    },
    {
      id: 's-3',
      title: 'Bohemian Rhapsody',
      artist: 'Queen',
      reward: 2.75,
      youtubeId: 'fJ9rUzIMcZQ',
      coverUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
      genre: 'Rock'
    },
    {
      id: 's-4',
      title: 'Hello',
      artist: 'Adele',
      reward: 3.50,
      youtubeId: 'YQHsXMglC9A',
      coverUrl: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-5',
      title: 'Viva La Vida',
      artist: 'Coldplay',
      reward: 4.20,
      youtubeId: 'K0ibBPhiaG0',
      coverUrl: 'https://img.youtube.com/vi/K0ibBPhiaG0/hqdefault.jpg',
      genre: 'Alternative'
    },
    {
      id: 's-6',
      title: 'Shake It Off',
      artist: 'Taylor Swift',
      reward: 2.90,
      youtubeId: 'e-ORhEE9VVg',
      coverUrl: 'https://img.youtube.com/vi/e-ORhEE9VVg/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-7',
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      reward: 3.80,
      youtubeId: 'OPCtLsK3LDw',
      coverUrl: 'https://img.youtube.com/vi/OPCtLsK3LDw/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-8',
      title: 'Gangnam Style',
      artist: 'PSY',
      reward: 2.55,
      youtubeId: '9bZkp7q19f0',
      coverUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
      genre: 'K-Pop'
    },
    {
      id: 's-9',
      title: 'Believer',
      artist: 'Imagine Dragons',
      reward: 4.00,
      youtubeId: 'LsoLEjrDogU',
      coverUrl: 'https://img.youtube.com/vi/LsoLEjrDogU/hqdefault.jpg',
      genre: 'Rock'
    },
    {
      id: 's-10',
      title: 'Sugar',
      artist: 'Maroon 5',
      reward: 3.30,
      youtubeId: 'VbfpW0pbvaU',
      coverUrl: 'https://img.youtube.com/vi/VbfpW0pbvaU/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-11',
      title: 'Despacito',
      artist: 'Luis Fonsi ft. Daddy Yankee',
      reward: 4.10,
      youtubeId: '6JYIGclVQdw',
      coverUrl: 'https://img.youtube.com/vi/6JYIGclVQdw/hqdefault.jpg',
      genre: 'Reggaeton'
    },
    {
      id: 's-12',
      title: 'Get Lucky',
      artist: 'Daft Punk ft. Pharrell',
      reward: 3.70,
      youtubeId: 'TMn5vBDNSpk',
      coverUrl: 'https://img.youtube.com/vi/TMn5vBDNSpk/hqdefault.jpg',
      genre: 'Funk'
    },
    {
      id: 's-13',
      title: 'All of Me',
      artist: 'John Legend',
      reward: 2.80,
      youtubeId: 'O9UesCqsVJc',
      coverUrl: 'https://img.youtube.com/vi/O9UesCqsVJc/hqdefault.jpg',
      genre: 'Ballad'
    },
    {
      id: 's-14',
      title: 'Faded',
      artist: 'Alan Walker',
      reward: 3.20,
      youtubeId: 'iXZbKYyyb3U',
      coverUrl: 'https://img.youtube.com/vi/iXZbKYyyb3U/hqdefault.jpg',
      genre: 'EDM'
    },
    {
      id: 's-15',
      title: 'Perfect',
      artist: 'Ed Sheeran',
      reward: 4.30,
      youtubeId: 'JGwWNGJdvx8',
      coverUrl: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-16',
      title: 'Beat It',
      artist: 'Michael Jackson',
      reward: 2.65,
      youtubeId: '8UVNT4wvIGY',
      coverUrl: 'https://img.youtube.com/vi/8UVNT4wvIGY/hqdefault.jpg',
      genre: 'Rock'
    },
    {
      id: 's-17',
      title: 'Sunflower',
      artist: 'Post Malone & Swae Lee',
      reward: 3.95,
      youtubeId: 'qslZ2et5fzc',
      coverUrl: 'https://img.youtube.com/vi/qslZ2et5fzc/hqdefault.jpg',
      genre: 'Hip Hop'
    },
    {
      id: 's-18',
      title: 'Señorita',
      artist: 'Shawn Mendes & Camila Cabello',
      reward: 4.05,
      youtubeId: 'Pkh8UtuejGw',
      coverUrl: 'https://img.youtube.com/vi/Pkh8UtuejGw/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-19',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      reward: 5.00,
      youtubeId: 'e1iU2ClU6-I',
      coverUrl: 'https://img.youtube.com/vi/e1iU2ClU6-I/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-20',
      title: 'Levitating',
      artist: 'Dua Lipa',
      reward: 3.60,
      youtubeId: 'TUVcZfQe-K8',
      coverUrl: 'https://img.youtube.com/vi/TUVcZfQe-K8/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-21',
      title: 'Bad Guy',
      artist: 'Billie Eilish',
      reward: 4.40,
      youtubeId: 'DyDfgMOUjCI',
      coverUrl: 'https://img.youtube.com/vi/DyDfgMOUjCI/hqdefault.jpg',
      genre: 'Alternative'
    },
    {
      id: 's-22',
      title: 'Old Town Road',
      artist: 'Lil Nas X',
      reward: 2.70,
      youtubeId: 'r7qovpFAGrQ',
      coverUrl: 'https://img.youtube.com/vi/r7qovpFAGrQ/hqdefault.jpg',
      genre: 'Country Rap'
    },
    {
      id: 's-23',
      title: 'Senorita',
      artist: 'Shawn Mendes & Camila Cabello',
      reward: 3.10,
      youtubeId: 'Pkh8UtuejGw',
      coverUrl: 'https://img.youtube.com/vi/Pkh8UtuejGw/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-24',
      title: 'Roar',
      artist: 'Katy Perry',
      reward: 2.95,
      youtubeId: 'CevxZvSJLk8',
      coverUrl: 'https://img.youtube.com/vi/CevxZvSJLk8/hqdefault.jpg',
      genre: 'Pop'
    },
    {
      id: 's-25',
      title: 'WAP',
      artist: 'Cardi B ft. Megan Thee Stallion',
      reward: 4.85,
      youtubeId: 'KyaGL4KU-FI',
      coverUrl: 'https://img.youtube.com/vi/KyaGL4KU-FI/hqdefault.jpg',
      genre: 'Hip Hop'
    },
    {
      id: 's-26',
      title: 'Stairway to Heaven',
      artist: 'Led Zeppelin',
      reward: 3.40,
      youtubeId: 'QkF3oxziUI4',
      coverUrl: 'https://img.youtube.com/vi/QkF3oxziUI4/hqdefault.jpg',
      genre: 'Rock'
    },
    {
      id: 's-27',
      title: 'Smells Like Teen Spirit',
      artist: 'Nirvana',
      reward: 2.85,
      youtubeId: 'hTWKbfoikeg',
      coverUrl: 'https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg',
      genre: 'Grunge'
    },
    {
      id: 's-28',
      title: 'Someone Like You',
      artist: 'Adele',
      reward: 4.20,
      youtubeId: 'hLQl3WQQoQ0',
      coverUrl: 'https://img.youtube.com/vi/hLQl3WQQoQ0/hqdefault.jpg',
      genre: 'Ballad'
    },
    {
      id: 's-29',
      title: 'Blues Brothers',
      artist: 'The Blues Brothers',
      reward: 3.15,
      youtubeId: 'gUL2U1ZVKpM',
      coverUrl: 'https://img.youtube.com/vi/gUL2U1ZVKpM/hqdefault.jpg',
      genre: 'Blues'
    },
    {
      id: 's-30',
      title: 'Havana',
      artist: 'Camila Cabello',
      reward: 3.95,
      youtubeId: 'HCjNJDNzw8Y',
      coverUrl: 'https://img.youtube.com/vi/HCjNJDNzw8Y/hqdefault.jpg',
      genre: 'Pop'
    }
  ];

  const currentSong = dailyVideos[currentDaySongIndex] || songs[0];

  // VIP Plans (Matches Starbucks cards logic)
  const vipPlans: VIPPlan[] = [
    { 
      id: 1, 
      name: 'VIP 1 - Bronze Player', 
      price: 25.00, 
      multiplier: 2.5, 
      description: 'Aumenta em 250% os seus ganhos por música escutada.', 
      earningsEstimate: 'Média de R$ 50,00 por dia',
      color: 'from-amber-600 to-amber-800 border-amber-500/30',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: 'Headphones' 
    },
    { 
      id: 2, 
      name: 'VIP 2 - Gold Player', 
      price: 60.00, 
      multiplier: 5.0, 
      description: 'Aumenta em 500% os seus ganhos por música escutada.', 
      earningsEstimate: 'Média de R$ 150,00 por dia',
      color: 'from-yellow-500 to-yellow-700 border-yellow-500/30',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      icon: 'Zap' 
    },
    { 
      id: 3, 
      name: 'VIP 3 - Diamond Studio', 
      price: 150.00, 
      multiplier: 10.0, 
      description: 'Aumenta em 1000% os seus ganhos por música escutada.', 
      earningsEstimate: 'Média de R$ 450,00 por dia',
      color: 'from-cyan-500 to-blue-700 border-cyan-400/30',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/40',
      icon: 'Sparkles' 
    }
  ];

  // Current VIP Multiplier
  const getMultiplier = () => {
    if (vipLevel === 1) return 2.5;
    if (vipLevel === 2) return 5.0;
    if (vipLevel === 3) return 10.0;
    return 1.0; // Free
  };

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load YouTube IFrame API script once on mount
  useEffect(() => {
    if ((window as any).YT || document.querySelector('script[src*="youtube.com/iframe_api"]')) return;

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      if (playerRef.current) playerRef.current.destroy();
      playerRef.current = new (window as any).YT.Player('yt-player', {
        videoId: currentSong.youtubeId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            setSongProgress(0);
            setSecondsElapsed(0);
          },
          onStateChange: (event: any) => {
            const YT = (window as any).YT;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            } else if (event.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
              setTimeout(() => {
                setCurrentSongIndex((prev) => (prev + 1) % dailyVideos.length);
                setSecondsElapsed(0);
                setSongProgress(0);
              }, 500);
            }
          },
        },
      });
    };

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Load new video when current song changes
  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById) {
      playerRef.current.loadVideoById(currentSong.youtubeId);
      playerRef.current.pauseVideo();
      setSecondsElapsed(0);
      setSongProgress(0);
      setIsPlaying(false);
    }
  }, [currentSongIndex]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      showToast('Vídeo pausado. Ganhos suspensos.', 'info');
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
      showToast('Vídeo tocando! Ganhando saldo em tempo real 💸', 'success');
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
    }
    setIsMuted(!isMuted);
    showToast(!isMuted ? 'Áudio mutado' : 'Áudio ativado', 'info');
  };

  // Real-time ticking logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        // Update track progress
        setSecondsElapsed((prev) => {
          const nextSec = prev + 1;
          const songDuration = currentSong.duration || 180;
          if (nextSec >= songDuration) {
            // Next song
            setTimeout(() => {
              setCurrentSongIndex((prevIndex) => (prevIndex + 1) % dailyVideos.length);
              setSecondsElapsed(0);
              showToast('Próxima música da playlist iniciada!', 'success');
            }, 500);
            return songDuration;
          }
          setSongProgress(Math.min(100, (nextSec / 30) * 100));
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSongIndex, vipLevel]);

  // Handle rewards and mission tracking based on elapsed seconds
  useEffect(() => {
    if (!isPlaying || secondsElapsed === 0) return;

    // Increment mission 1 progress every second
    setMissions((prevMissions) => 
      prevMissions.map((m) => {
        if (m.id === 'm-1' && m.progress < m.target) {
          const newProgress = m.progress + 1;
          const completed = newProgress >= m.target;
          if (completed && !m.completed) {
            showToast(`Missão Concluída! Ganhou R$ ${m.reward.toFixed(2)}`, 'success');
            setBalance((b) => b + m.reward);
            setTodayEarnings((t) => t + m.reward);
            return { ...m, progress: newProgress, completed: true };
          }
          return { ...m, progress: newProgress };
        }
        return m;
      })
    );

    // Award reward after 30 seconds of watch if not yet rewarded
    if (secondsElapsed >= 30 && !rewarded) {
      setBalance((prev) => parseFloat((prev + currentSong.reward).toFixed(2)));
      setTodayEarnings((prev) => parseFloat((prev + currentSong.reward).toFixed(2)));
      setTotalIncome((prev) => parseFloat((prev + currentSong.reward).toFixed(2)));
      setRewarded(true);
      showToast(`Recompensa de R$ ${currentSong.reward.toFixed(2)} recebida!`, 'success');

      // Mark current video as completed
      setVideoCompleted((prev) => {
        const next = [...prev];
        next[currentDaySongIndex] = true;
        return next;
      });

      // Increment video mission progress (m-4)
      setMissions((prevMissions) =>
        prevMissions.map((m) => {
          if (m.id === 'm-4' && m.progress < m.target) {
            const newProgress = m.progress + 1;
            const completed = newProgress >= m.target;
            if (completed && !m.completed) {
              showToast(`Missão de Vídeos concluída! Ganhou R$ ${m.reward.toFixed(2)}`, 'success');
              setBalance((b) => b + m.reward);
              setTodayEarnings((t) => t + m.reward);
            }
            return { ...m, progress: newProgress, completed };
          }
          return m;
        })
      );
    }
  }, [secondsElapsed, isPlaying, rewarded, currentSong]);

  // Reset rewarded flag on song change
  useEffect(() => {
    setRewarded(false);
  }, [currentSongIndex]);

  // Handle invitation simulation
  const handleAddReferral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReferralName.trim()) {
      showToast('Digite o nome do amigo!', 'error');
      return;
    }

    const newRef: Referral = {
      id: `ref-${Date.now()}`,
      name: newReferralName,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativo',
      reward: 2.00
    };

    setReferrals([newRef, ...referrals]);
    setBalance((prev) => prev + 2.00);
    setTodayEarnings((prev) => prev + 2.00);
    setTotalIncome((prev) => prev + 2.00);
    showToast(`Parabéns! ${newReferralName} entrou. Você ganhou +R$ 2,00 via PIX!`, 'success');
    setNewReferralName('');

    // Update mission 2
    setMissions((prevMissions) => 
      prevMissions.map((m) => {
        if (m.id === 'm-2' && m.progress < m.target) {
          const newProgress = m.progress + 1;
          const completed = newProgress >= m.target;
          if (completed && !m.completed) {
            setTimeout(() => {
              showToast(`Missão de Convites Concluída! Ganhou R$ ${m.reward.toFixed(2)}`, 'success');
              setBalance((b) => b + m.reward);
              setTodayEarnings((t) => t + m.reward);
            }, 1000);
            return { ...m, progress: newProgress, completed: true };
          }
          return { ...m, progress: newProgress };
        }
        return m;
      })
    );
  };

  // Copy referral link
  const copyReferralLink = () => {
    const link = `https://taf26.site/invite?ref=user${Math.floor(1000 + Math.random() * 9000)}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      showToast('Link de convite copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch(() => {
      showToast('Falha ao copiar link', 'error');
    });
  };

  // Handle VIP Boost Purchase
  const handleBuyVIP = (plan: VIPPlan) => {
    if (vipLevel >= plan.id) {
      showToast('Você já possui este plano VIP ou um superior ativo!', 'info');
      return;
    }

    if (balance < plan.price) {
      showToast(`Saldo insuficiente! Você precisa de R$ ${plan.price.toFixed(2)} para ativar o ${plan.name}.`, 'error');
      // Propose recharge
      setTimeout(() => {
        setIsRechargeOpen(true);
      }, 800);
      return;
    }

    // Deduct balance and apply VIP
    setBalance((prev) => parseFloat((prev - plan.price).toFixed(2)));
    setVipLevel(plan.id);
    showToast(`Parabéns! ${plan.name} ativado com sucesso! Multiplicador ${plan.multiplier}x Ativo ⚡`, 'success');

    // Update mission 3
    setMissions((prevMissions) => 
      prevMissions.map((m) => {
        if (m.id === 'm-3' && m.progress < m.target) {
          const newProgress = 1;
          const completed = true;
          setTimeout(() => {
            showToast(`Missão VIP Concluída! Ganhou R$ ${m.reward.toFixed(2)}`, 'success');
            setBalance((b) => b + m.reward);
            setTodayEarnings((t) => t + m.reward);
          }, 1000);
          return { ...m, progress: newProgress, completed };
        }
        return m;
      })
    );
  };

  // Simulate App Download
  const handleDownloadApp = () => {
    setIsDownloadingApp(true);
    setTimeout(() => {
      setIsDownloadingApp(false);
      setIsAppDownloaded(true);
      showToast('Aplicativo oficial instalado com sucesso! Requisito concluído 📱', 'success');
    }, 2500);
  };

  // Handle Withdrawal (PIX)
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      showToast('Por favor, insira um valor válido de saque.', 'error');
      return;
    }

    if (amount < 20.00) {
      showToast('O valor mínimo para saques via PIX é de R$ 20,00.', 'error');
      return;
    }

    const activeReferralsCount = referrals.filter(r => r.status === 'Ativo').length;
    if (activeReferralsCount < 3) {
      showToast('Requisito mínimo: Você precisa de pelo menos 3 amigos ativos cadastrados pelo seu link para poder solicitar saques.', 'error');
      return;
    }

    if (!isAppDownloaded) {
      showToast('Requisito mínimo: Você precisa baixar e instalar o nosso aplicativo oficial para liberar saques.', 'error');
      return;
    }

    if (amount > balance) {
      showToast('Saldo insuficiente para realizar este saque.', 'error');
      return;
    }

    if (!pixKey.trim()) {
      showToast('Por favor, informe a chave PIX.', 'error');
      return;
    }

    // Start animated payout process
    setWithdrawStep(1); // Show loader
    
    // Step-by-step progress simulation
    setTimeout(() => {
      // 1. Validate key
      showToast('Chave PIX encontrada e validada!', 'info');
      
      setTimeout(() => {
        // 2. Transact
        showToast('Enviando fundos via Banco Central...', 'info');
        
        setTimeout(() => {
          // 3. Complete
          setBalance((prev) => parseFloat((prev - amount).toFixed(2)));
          
          const newWithdrawal: Withdrawal = {
            id: `w-${Date.now()}`,
            amount: amount,
            pixKey: pixKey.length > 8 ? `${pixKey.substring(0, 4)}...${pixKey.slice(-4)}` : pixKey,
            keyType: pixKeyType,
            date: new Date().toLocaleString('pt-BR'),
            status: 'Concluído'
          };
          
          setWithdrawals([newWithdrawal, ...withdrawals]);
          setWithdrawStep(2); // Success screen
          showToast(`Saque de R$ ${amount.toFixed(2)} efetuado com sucesso via PIX!`, 'success');
        }, 1500);

      }, 1500);

    }, 1200);
  };

  // Reset withdrawal modal
  const closeWithdrawModal = () => {
    setIsWithdrawOpen(false);
    // Reset steps after modal animation finishes
    setTimeout(() => {
      setWithdrawStep(0);
      setWithdrawAmount('');
    }, 300);
  };

  // Handle recharge (Simulated Deposit)
  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Insira um valor válido para depósito.', 'error');
      return;
    }
    
    setRechargeStep(1); // Show QR Code
    showToast('QR Code PIX Gerado! Pague para ativar o saldo.', 'info');
  };

  // Simulate QR Code Payment detection
  const simulatePaymentSuccess = () => {
    const amount = parseFloat(rechargeAmount);
    setBalance((prev) => parseFloat((prev + amount).toFixed(2)));
    setTotalIncome((prev) => parseFloat((prev + amount).toFixed(2)));
    setRechargeStep(2); // Success step
    showToast(`Depósito de R$ ${amount.toFixed(2)} confirmado! Saldo creditado ⚡`, 'success');
  };

  const closeRechargeModal = () => {
    setIsRechargeOpen(false);
    setTimeout(() => {
      setRechargeStep(0);
      setRechargeAmount('20');
    }, 300);
  };

  // Support chatbot simulation
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportInput.trim()) return;

    const userMsg = { sender: 'user' as const, text: supportInput, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
    setSupportMessages(prev => [...prev, userMsg]);
    const question = supportInput.toLowerCase();
    setSupportInput('');

    // Simulate agent typing
    setTimeout(() => {
      let replyText = 'Entendi! Estou verificando com a nossa central financeira. Por favor, aguarde um momento.';
      
      if (question.includes('saque') || question.includes('sacar') || question.includes('pix')) {
        replyText = 'Para realizar um saque, o seu saldo deve ser de pelo menos R$ 20,00, você precisa ter convidado no mínimo 3 amigos ativos cadastrados pelo seu link de indicação, e ter baixado o nosso aplicativo oficial. Vá na opção "Sacar" na tela inicial para ver as instruções!';
      } else if (question.includes('convite') || question.includes('convidar') || question.includes('amigo') || question.includes('ganhar')) {
        replyText = 'Você ganha R$ 2,00 para cada amigo que se cadastrar através do seu link de indicação! Você pode pegar o link na aba "Equipe" ou clicando em "Compartilhar".';
      } else if (question.includes('vip') || question.includes('recarregar') || question.includes('depósito') || question.includes('ajuda')) {
        replyText = 'Ativando os planos VIP (Bronze, Gold ou Diamond), você multiplica os seus ganhos por música em até 10x! Clique em "Impulsionar" ou acesse a aba "Planos VIP" para ativar.';
      } else if (question.includes('música') || question.includes('ouvir') || question.includes('tocar')) {
        replyText = 'Para começar a ganhar, vá na tela inicial, clique no botão Play do reprodutor de música. Enquanto a música toca, o seu saldo vai aumentando a cada segundo! Você pode trocar de faixa quando quiser.';
      }

      setSupportMessages(prev => [...prev, { sender: 'support' as const, text: replyText, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
    }, 1000);
  };

  // Force page reload look
  const handleReload = () => {
    showToast('Sincronizando saldo com os servidores da TAF26...', 'info');
    setIsPlaying(false);
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    setTimeout(() => {
      showToast('Dados atualizados com sucesso!', 'success');
    }, 1000);
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1DB954] animate-spin" />
          <p className="text-xs text-zinc-400">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center font-sans sm:py-6 md:py-8 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,185,84,0.15),rgba(0,0,0,1))]">
      {/* Container simulating a sleek smartphone or container centered layout */}
      <div className="w-full sm:max-w-md bg-zinc-950 h-screen sm:h-[850px] relative flex flex-col sm:shadow-[0_0_50px_rgba(29,185,84,0.08)] overflow-hidden sm:border sm:border-zinc-800/80 rounded-none sm:rounded-3xl">
        
        {/* --- HEADER BAR (Directly from the photo design layout) --- */}
        <header className="fixed top-0 left-0 right-0 sm:absolute sm:top-0 sm:inset-x-0 z-40 bg-[#072415]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#143e26]">
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm tracking-wide">
            <img src="/logo.jpeg" className="w-4 h-4 rounded-full object-cover animate-pulse" alt="Logo" />
            <span>Home | @TAF26_RENDA</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              id="header-reload-btn"
              onClick={handleReload} 
              className="p-1.5 hover:bg-emerald-950/50 rounded-full transition-colors active:scale-95 text-emerald-400"
              title="Recarregar dados"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button 
              id="header-help-btn"
              onClick={() => setIsSupportOpen(true)} 
              className="p-1.5 hover:bg-emerald-950/50 rounded-full transition-colors active:scale-95 text-emerald-400"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button 
              id="header-logout-btn"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/sign-in';
              }}
              className="p-1.5 hover:bg-emerald-950/50 rounded-full transition-colors active:scale-95 text-emerald-400 flex items-center justify-center cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* --- TOAST NOTIFICATIONS --- */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`absolute top-16 left-4 right-4 z-50 p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center gap-3 border backdrop-blur-md ${
                toast.type === 'success' 
                  ? 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/25' 
                  : toast.type === 'error' 
                  ? 'bg-rose-950/40 text-rose-300 border-rose-500/20' 
                  : 'bg-zinc-900/40 text-zinc-300 border-zinc-700/20'
              }`}
            >
              <div className="p-1 rounded-full bg-black/20">
                {toast.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}
              </div>
              <p className="text-xs font-medium flex-1">{toast.message}</p>
              <button onClick={() => setToast(null)} className="text-white/40 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MAIN PAGE VIEW CONTENT (SCROLLABLE AREA) --- */}
        <main className="flex-1 overflow-y-auto pt-16 pb-24">
          {activeFooterTab === 'home' && (
          <div className="flex-1">
            
            {/* --- HERO BANNER (Matches Starbucks outdoor photo but in dark music theme) --- */}
            <div className="relative h-44 w-full bg-gradient-to-b from-[#143e26] to-[#121212] overflow-hidden">
              {/* Decorative soundwaves / record studio graphic */}
              <div className="absolute inset-0 opacity-20 flex items-center justify-around">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="w-1.5 bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ 
                      height: `${((i * 7) % 60) + 30}%`,
                      animation: isPlaying ? `bounce 1.2s ease-in-out infinite alternate` : 'none',
                      animationDelay: `${i * 0.15}s`
                    }}
                  />
                ))}
              </div>
              {/* Text elements inside banner */}
              <div className="absolute inset-x-4 top-6 flex flex-col">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest bg-emerald-900/40 px-2 py-0.5 rounded-md w-fit backdrop-blur-sm">
                  TAF26 Premium Partner
                </span>
                <h1 className="text-xl font-bold tracking-tight text-white mt-1">
                  Ganhe Ouvindo Música
                </h1>
                <p className="text-xs text-zinc-300 mt-1 max-w-[70%]">
                  Renda diária imediata. Quanto mais você escuta, mais o seu PIX aumenta.
                </p>
              </div>

              {/* Glowing decorative badge */}
              <div className="absolute right-4 top-4 bg-[#1DB954] text-black font-extrabold text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-lg animate-bounce">
                <Zap className="w-2.5 h-2.5 fill-current" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* --- PROFILE BADGE OVERLAP (Exact copy of Starbucks design alignment) --- */}
            <div className="px-4 relative -mt-8 z-10">
              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                {/* Profile circular avatar overlapping on the left */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-green-300 p-0.5 shadow-md flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-[#121212] flex items-center justify-center overflow-hidden">
                      <img src="/logo.jpeg" className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                  </div>
                  {/* Active Green dot status */}
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#181818] flex items-center justify-center" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <span>Membro TAF26 Cash</span>
                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-bold uppercase tracking-wider">
                      {vipLevel > 0 ? `VIP ${vipLevel}` : 'Conta Grátis'}
                    </span>
                  </div>
                   <h3 className="text-base font-bold text-white mt-0.5 flex items-center gap-1.5 truncate max-w-[200px]">
                    {user?.user_metadata?.full_name || user?.email || 'Membro TAF26'}
                  </h3>
                  <p className="text-[10px] text-zinc-500">Aproveitando ganhos instantâneos</p>
                </div>
              </div>
            </div>

            {/* --- THREE CORE FINANCIAL METRIC CARDS (Direct design copy of Starbucks statistics box) --- */}
            <div className="px-4 mt-4">
              <div className="grid grid-cols-3 bg-[#181818] border border-[#282828] rounded-2xl p-3.5 text-center shadow-lg divide-x divide-zinc-800">
                
                {/* Column 1: Balance */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Saldo</span>
                  <span className="text-sm font-black text-emerald-400 mt-1">
                    R$ {balance.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Disponível</span>
                </div>

                {/* Column 2: Recharge (Or Daily Profit) */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Ganhos Hoje</span>
                  <span className="text-sm font-black text-white mt-1">
                    R$ {todayEarnings.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Atividade</span>
                </div>

                {/* Column 3: Total Income */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Rend. Total</span>
                  <span className="text-sm font-black text-emerald-400 mt-1">
                    R$ {totalIncome.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">Acumulado</span>
                </div>

              </div>
            </div>

            {/* --- FOUR QUICK ACTION BUTTONS (Matching Starbucks button grid) --- */}
            <div className="px-4 mt-5">
              <div className="grid grid-cols-4 gap-2">
                
                {/* Button 1: Boost VIP */}
                <button 
                  id="action-vip-btn"
                  onClick={() => setActiveTab('vip')}
                  className="bg-[#181818] border border-[#282828] hover:border-emerald-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-[#1DB954] group-hover:text-black transition-all">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300">VIP</span>
                </button>

                {/* Button 2: Withdraw (Sacar) */}
                <button 
                  id="action-withdraw-btn"
                  onClick={() => setIsWithdrawOpen(true)}
                  className="bg-[#181818] border border-[#282828] hover:border-emerald-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-[#1DB954] group-hover:text-black transition-all">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300">Sacar</span>
                </button>

                {/* Button 3: Share (Convidar) */}
                <button 
                  id="action-share-btn"
                  onClick={() => setIsShareOpen(true)}
                  className="bg-[#181818] border border-[#282828] hover:border-emerald-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-[#1DB954] group-hover:text-black transition-all">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300">Convidar</span>
                </button>

                {/* Button 4: Support Online */}
                <button 
                  id="action-support-btn"
                  onClick={() => setIsSupportOpen(true)}
                  className="bg-[#181818] border border-[#282828] hover:border-emerald-500/30 rounded-2xl p-3.5 flex flex-col items-center justify-center text-center gap-1.5 transition-all active:scale-95 group"
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-[#1DB954] group-hover:text-black transition-all">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-300">Suporte</span>
                </button>

              </div>
            </div>

            {/* --- THREE MAIN TAB SELECTORS (Recreates Starbucks "Fixed Fund", "Welfare Fund", "Yearly Fund") --- */}
            <div className="px-4 mt-5">
              <div className="flex bg-[#181818] p-1 rounded-xl border border-[#282828]">
                
                {/* Tab 1: Player console */}
                <button
                  id="tab-player-btn"
                  onClick={() => setActiveTab('player')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'player' 
                      ? 'bg-[#1DB954] text-black shadow-md font-black' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Play className={`w-3.5 h-3.5 ${activeTab === 'player' ? 'fill-current' : ''}`} />
                  <span>Tocador MP3</span>
                </button>

                {/* Tab 2: Welfare plans */}
                <button
                  id="tab-vip-btn"
                  onClick={() => setActiveTab('vip')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'vip' 
                      ? 'bg-[#1DB954] text-black shadow-md font-black' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${activeTab === 'vip' ? 'fill-current' : ''}`} />
                  <span>Planos VIP</span>
                </button>

                {/* Tab 3: History */}
                <button
                  id="tab-history-btn"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'history' 
                      ? 'bg-[#1DB954] text-black shadow-md font-black' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Histórico</span>
                </button>

              </div>
            </div>

            {/* --- TAB VIEW CONTENTS (Replacing products section with high-fidelity components) --- */}
            <div className="px-4 mt-4 pb-6">
              
              {/* === TAB 1: PLAYER CONSOLE === */}
              {activeTab === 'player' && (
                <div className="space-y-4">
                  
                  {/* Core Music Player Console Card */}
                  <div className="bg-gradient-to-br from-[#1c2c22] to-[#141414] border border-[#21432f]/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                    
                    {/* Active listening green blur indicator */}
                    {isPlaying && (
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#1db954]/15 rounded-full blur-2xl animate-pulse" />
                    )}

                    {/* Header info */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#1DB954] tracking-widest uppercase flex items-center gap-1">
                        <span className="w-2 h-2 bg-[#1DB954] rounded-full animate-ping" />
                        Tocando Agora
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full">
                        {currentSong.genre}
                      </span>
                    </div>

                    {/* Album Art & Details */}
                    <div className="flex items-center gap-4 mt-4">
                        <div className="relative w-48 h-32 sm:w-64 sm:h-36 bg-black rounded-xl overflow-hidden">
                          <div id="yt-player" className="w-full h-full" />
                        </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{currentSong.title}</h4>
                        <p className="text-xs text-zinc-400 truncate mt-0.5">{currentSong.artist}</p>
                        
                        {/* Earnings notification bar */}
                        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#1db954] font-medium bg-[#1db954]/5 px-2 py-0.5 rounded-md w-fit">
                          <DollarSign className="w-3 h-3" />
                          <span>Recompensa: R$ {currentSong.reward.toFixed(2)} após 30s</span>
                        </div>
                      </div>
                    </div>

                    {/* Song Waveform Audio Visualizer (Interactive animation) */}
                    <div className="h-8 flex items-end justify-center gap-[3px] mt-5 px-4">
                      {[...Array(20)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-[#1DB954] rounded-full transition-all duration-150"
                          style={{ 
                            height: isPlaying ? `${((i * 11) % 70) + 20}%` : '15%',
                            opacity: isPlaying ? 0.9 : 0.4,
                            animation: isPlaying ? `bounce 0.8s ease-in-out infinite alternate` : 'none',
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>

                    {/* Progress Slider Bar */}
                    <div className="mt-4">
                      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden cursor-pointer relative">
                        <div 
                          className="h-full bg-[#1DB954] rounded-full transition-all duration-1000"
                          style={{ width: `${songProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 mt-1.5">
                        <span>
                          {Math.floor(secondsElapsed / 60)}:{(secondsElapsed % 60).toString().padStart(2, '0')}
                        </span>
                        <span>
                          {Math.floor((currentSong.duration || 180) / 60)}:{((currentSong.duration || 180) % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Play & Mute Controls */}
                    <div className="flex items-center justify-between mt-4 pt-1">
                      {/* Earning Speed Badge */}
                      <div className="flex flex-col">
                        <span className="text-[9px] text-zinc-500 uppercase font-bold">Modo VIP</span>
                        <span className="text-xs font-bold text-white">VIP {vipLevel} Ativo</span>
                      </div>

                      {/* Main Play Action Button */}
                      <button 
                        id="player-play-toggle-btn"
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-[#1DB954] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-lg hover:bg-emerald-400 transition-all cursor-pointer"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Audio mute toggle */}
                      <button 
                        id="player-mute-btn"
                        onClick={toggleMute}
                        className="p-2 hover:bg-zinc-800 rounded-full text-zinc-300 transition-colors"
                        title={isMuted ? "Desmutar áudio" : "Mutar áudio"}
                      >
                        {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
                      </button>
                      {/* Next video button (available after reward) */}
                      <button
                        id="player-next-btn"
                        onClick={handleNextVideo}
                        disabled={!rewarded}
                        className={`ml-2 px-3 py-2 rounded-full ${!rewarded ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#1DB954] hover:bg-[#1ED760]'} transition-colors text-white`}
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>

                  </div>

                  {/* Playlist Queue (Matches product display structure from photo) */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1 mb-2">
                      Playlist de Renda Diária
                    </h3>
                    <div className="space-y-2">
                      {songs.map((song, idx) => (
                        <div 
                          key={song.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            currentSongIndex === idx 
                              ? 'bg-emerald-950/20 border-emerald-500/40' 
                              : 'bg-[#181818] border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                              <Image 
                                src={song.coverUrl} 
                                alt={song.title} 
                                fill 
                                sizes="40px"
                                referrerPolicy="no-referrer"
                                className="object-cover" 
                              />
                              {currentSongIndex === idx && isPlaying && (
                                <div className="absolute inset-0 bg-[#1db954]/20 flex items-center justify-center">
                                  <span className="w-2.5 h-2.5 bg-[#1db954] rounded-full animate-ping" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-white truncate">{song.title}</h4>
                              <p className="text-[10px] text-zinc-400 truncate">{song.artist}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-400 bg-[#1db954]/10 px-2 py-1 rounded-full whitespace-nowrap">
                              R$ {song.reward.toFixed(2)}
                            </span>
                            
                            <button
                              id={`select-song-btn-${song.id}`}
                              onClick={() => {
                                if (currentSongIndex === idx) {
                                  togglePlay();
                                } else {
                                  setCurrentSongIndex(idx);
                                  setSecondsElapsed(0);
                                  setSongProgress(0);
                                  setIsPlaying(true);
setTimeout(() => {
                                      if (playerRef.current) {
                                        playerRef.current.playVideo();
                                      }
                                    }, 100);
                                  showToast(`Iniciando ${song.title}`, 'success');
                                }
                              }}
                              className={`p-2 rounded-full cursor-pointer transition-all ${
                                currentSongIndex === idx && isPlaying 
                                  ? 'bg-[#1DB954] text-black' 
                                  : 'bg-zinc-800 text-white hover:bg-zinc-700'
                              }`}
                            >
                              {currentSongIndex === idx && isPlaying ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* === TAB 2: VIP PLANS (WELFARE FUND) === */}
              {activeTab === 'vip' && (
                <div className="space-y-4">
                  <div className="bg-[#181818] border border-zinc-800 rounded-2xl p-4 text-center">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto fill-current animate-pulse" />
                    <h3 className="text-sm font-bold text-white mt-2">
                      Multiplique seus ganhos diários
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Adquira planos VIP para acelerar a taxa de ganhos de cada música. Seu plano atual é: 
                      <strong className="text-emerald-400 block mt-1 uppercase font-black text-xs">
                        {vipLevel > 0 ? `VIP ${vipLevel} - ATIVO (${getMultiplier()}x Ganhos!)` : 'PLANO GRÁTIS (1.0x Ganhos)'}
                      </strong>
                    </p>
                  </div>

                  {/* VIP Plan cards grid (Matches exact layout from Starbucks screenshot item buy list) */}
                  <div className="space-y-3">
                    {vipPlans.map((plan) => {
                      const isActive = vipLevel === plan.id;
                      const isAcquired = vipLevel >= plan.id;

                      return (
                        <div 
                          key={plan.id}
                          className={`bg-gradient-to-r ${plan.color} border p-4 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden`}
                        >
                          <div className="absolute right-0 top-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6 rotate-45 pointer-events-none" />
                          
                          <div>
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-black border px-2 py-0.5 rounded-full uppercase tracking-wider ${plan.badgeColor}`}>
                                {plan.multiplier}x Rentabilidade
                              </span>
                              {isActive && (
                                <span className="bg-emerald-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                                  <Check className="w-2.5 h-2.5 stroke-[3px]" /> ATIVO
                                </span>
                              )}
                            </div>
                            <h4 className="text-base font-extrabold text-white mt-2 flex items-center gap-1.5">
                              {plan.name}
                            </h4>
                            <p className="text-xs text-zinc-100/90 mt-1 leading-relaxed">
                              {plan.description}
                            </p>
                            <p className="text-xs text-emerald-200 font-bold mt-2 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              <span>{plan.earningsEstimate}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                            <div>
                              <span className="text-[10px] text-zinc-200 block uppercase">Preço de Ativação</span>
                              <span className="text-base font-black text-white">R$ {plan.price.toFixed(2)}</span>
                            </div>

                            <button
                              id={`buy-vip-btn-${plan.id}`}
                              onClick={() => handleBuyVIP(plan)}
                              className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer ${
                                isAcquired 
                                  ? 'bg-white/20 text-white border border-white/20' 
                                  : 'bg-white text-black hover:bg-emerald-400 hover:text-black'
                              }`}
                            >
                              {isAcquired ? 'Ativo' : 'Ativar Agora'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add simulated deposit help option */}
                  <div className="bg-[#181818] border border-[#282828] rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Falta saldo para o VIP?</span>
                    <button 
                      id="prompt-recharge-btn"
                      onClick={() => setIsRechargeOpen(true)}
                      className="text-[#1DB954] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Depositar Simulado</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* === TAB 3: TRANSACTION & INVITE HISTORY === */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  
                  {/* Earnings Log list */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1 mb-2">
                      Histórico Recente de Saques
                    </h3>
                    {withdrawals.length === 0 ? (
                      <div className="bg-[#181818] border border-zinc-800 rounded-xl p-6 text-center text-xs text-zinc-500">
                        Nenhum saque realizado ainda. Acumule R$ 20,00 e faça seu primeiro PIX!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {withdrawals.map((w) => (
                          <div key={w.id} className="bg-[#181818] border border-zinc-800 p-3 rounded-xl flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white">Saque via PIX ({w.keyType})</span>
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold uppercase">
                                  {w.status}
                                </span>
                              </div>
                              <span className="text-[10px] text-zinc-400 block mt-1">{w.date}</span>
                              <span className="text-[9px] text-zinc-500 block">Chave: {w.pixKey}</span>
                            </div>
                            <span className="text-xs font-black text-rose-400">
                              - R$ {w.amount.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ref earnings log */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1 mb-2">
                      Histórico de Convites
                    </h3>
                    <div className="bg-[#181818] border border-zinc-800 rounded-xl p-3 divide-y divide-zinc-800">
                      {referrals.map((ref) => (
                        <div key={ref.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">{ref.name}</span>
                            <span className="text-[9px] text-zinc-500">{ref.date} • Cadastro Concluído</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-400">
                            + R$ {ref.reward.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* --- TEAM TAB (Direct referrals screen) --- */}
        {activeFooterTab === 'team' && (
          <div className="flex-1 p-4 space-y-4">
            <div className="bg-gradient-to-br from-[#122319] to-[#121212] border border-[#21432f]/40 p-5 rounded-2xl shadow-xl text-center">
              <Users className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h2 className="text-lg font-bold text-white">Sistema de Convite TAF26</h2>
              <p className="text-xs text-zinc-300 mt-1.5 max-w-xs mx-auto">
                Ganhe <span className="text-[#1DB954] font-bold">R$ 2,00 na hora</span> a cada amigo cadastrado no seu link de indicação! Não há limite de convites.
              </p>
              
              {/* Copyable referral Link Box */}
              <div className="mt-4 bg-black/40 border border-zinc-800 rounded-xl p-2 flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-400 truncate text-left flex-1 max-w-[70%]">
                  https://taf26.site/invite?ref=user5589
                </span>
                <button
                  id="copy-link-btn"
                  onClick={copyReferralLink}
                  className="bg-[#1DB954] text-black px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            {/* Quick Simulate Invite Tool */}
            <div className="bg-[#181818] border border-[#282828] p-4 rounded-2xl shadow-md">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                <span>Simulador de Cadastro de Convite</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                Quer testar o sistema de indicação e ver o saldo de R$ 2,00 subir instantaneamente? Simule o cadastro de um amigo agora!
              </p>
              <form onSubmit={handleAddReferral} className="flex gap-2">
                <input 
                  id="sim-ref-name-input"
                  type="text" 
                  value={newReferralName}
                  onChange={(e) => setNewReferralName(e.target.value)}
                  placeholder="Nome do amigo (ex: Pedro Souza)"
                  className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-base sm:text-xs flex-1 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  id="sim-ref-submit-btn"
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1 active:scale-95 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Convidar</span>
                </button>
              </form>
            </div>

            {/* Invited friends stats */}
            <div className="bg-[#181818] border border-[#282828] p-4 rounded-2xl shadow-md">
              <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800 mb-3">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Meus Convidados</span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {referrals.length} Cadastros
                </span>
              </div>

              <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                {referrals.map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between bg-black/20 p-2.5 rounded-xl border border-zinc-900">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-emerald-400 font-extrabold">
                        {ref.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">{ref.name}</span>
                        <span className="text-[9px] text-zinc-500">{ref.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 block">+ R$ {ref.reward.toFixed(2)}</span>
                      <span className="text-[8px] uppercase tracking-wider text-emerald-500 font-bold bg-emerald-500/10 px-1 py-0.1 rounded-md">Ativo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- MISSIONS TAB (Missions and Challenges) --- */}
        {activeFooterTab === 'missions' && (
          <div className="flex-1 p-4 space-y-4">
            <div className="bg-[#181818] border border-zinc-800 p-4 rounded-2xl text-center">
              <Award className="w-9 h-9 text-yellow-400 mx-auto mb-2 animate-bounce" />
              <h2 className="text-base font-bold text-white">Desafios Diários de Escuta</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Complete as missões diárias sugeridas pela TAF26 RENDA para obter recompensas gordas em dinheiro diretamente no seu saldo!
              </p>
            </div>

            {/* Missions List */}
            <div className="space-y-3">
              {missions.map((mission) => {
                const percentage = Math.min(100, Math.floor((mission.progress / mission.target) * 100));
                return (
                  <div key={mission.id} className="bg-[#181818] border border-[#282828] p-4 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-white">{mission.title}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{mission.description}</p>
                      </div>
                      <span className="text-[11px] font-black text-[#1DB954] bg-[#1db954]/10 px-2 py-1 rounded-lg">
                        + R$ {mission.reward.toFixed(2)}
                      </span>
                    </div>

                    {/* Progress Slider */}
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                        <span>Progresso: {mission.progress} / {mission.target} {mission.id === 'm-1' ? 'seg' : ''}</span>
                        <span className="font-bold text-[#1DB954]">{percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${mission.completed ? 'bg-[#1DB954]' : 'bg-emerald-500/60'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      {mission.completed ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <Check className="w-3 h-3 stroke-[3px]" /> Recompensa Paga
                        </span>
                      ) : (
                        <button
                          id={`go-mission-btn-${mission.id}`}
                          onClick={() => {
                            if (mission.id === 'm-1') {
                              setActiveFooterTab('home');
                              setActiveTab('player');
                              showToast('Dê Play na música para começar a progredir!', 'info');
                            } else if (mission.id === 'm-2') {
                              setActiveFooterTab('team');
                            } else if (mission.id === 'm-3') {
                              setActiveFooterTab('home');
                              setActiveTab('vip');
                            }
                          }}
                          className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                        >
                          Ir para tarefa
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- USER PROFILE TAB (Mine Section) --- */}
        {activeFooterTab === 'mine' && (
          <div className="flex-1 p-4 space-y-4">
            {/* Main stats profile header card */}
            <div className="bg-[#181818] border border-[#282828] p-5 rounded-2xl flex flex-col items-center text-center shadow-lg">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-[#1DB954] overflow-hidden">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  <img src="/logo.jpeg" className="object-cover w-full h-full" alt="Avatar" />
                )}
              </div>
              <h3 className="text-base font-black text-white mt-3">
                {user?.user_metadata?.full_name || user?.email || 'Membro TAF26'}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                ID da Conta: {user?.id ? `USR-${user.id.substring(user.id.length - 6).toUpperCase()}` : 'SPC-55248'}
              </p>

              <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-800">
                <div className="bg-black/30 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-[10px] text-zinc-400 block uppercase">Saldo Atual</span>
                  <span className="text-sm font-black text-emerald-400">R$ {balance.toFixed(2)}</span>
                </div>
                <div className="bg-black/30 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-[10px] text-zinc-400 block uppercase">Membro Desde</span>
                  <span className="text-sm font-black text-white">Hoje</span>
                </div>
              </div>
            </div>

            {/* Quick account actions list */}
            <div className="bg-[#181818] border border-[#282828] rounded-2xl overflow-hidden divide-y divide-zinc-800 shadow-md text-xs">
              
              <button 
                onClick={() => setIsWithdrawOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Realizar Saque PIX</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Pagamento instantâneo via chave PIX</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              <button 
                onClick={() => setIsRechargeOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Simular Depósito de Teste</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Adicione saldo fictício para comprar VIP</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              <button 
                onClick={() => setIsSupportOpen(true)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Suporte ao Cliente</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Fale com nossa equipe online</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>

              <button 
                onClick={() => {
                  setBalance(25.00);
                  setTodayEarnings(0.00);
                  setTotalIncome(25.00);
                  setVipLevel(0);
                  setIsAppDownloaded(false);
                  setIsDownloadingApp(false);
                  showToast('Seus dados foram resetados com sucesso!', 'info');
                }}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-800/30 transition-colors text-rose-400 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Resetar Aplicativo</span>
                    <span className="text-[10px] text-zinc-500 mt-0.5">Apaga saldo e histórico de simulações</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </button>

            </div>

            {/* Verification / Security seal block */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Garantia TAF26 Partners</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed mt-0.5">
                  Esta plataforma é totalmente protegida via criptografia SSL. Os repasses são homologados e intermediados pela rede autorizada TAF26 Inc.
                </p>
              </div>
            </div>
            </div>
          )}
        </main>

        {/* --- WITHDRAWAL PIX DRAWER MODAL --- */}
        <AnimatePresence>
          {isWithdrawOpen && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-end justify-center">
              
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25 }}
                className="w-full bg-[#181818] border-t border-zinc-800 rounded-t-3xl p-5 max-w-md space-y-4"
              >
                {/* Header of Drawer */}
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span>Sacar via PIX</span>
                  </h3>
                  <button 
                    id="close-withdraw-modal-btn"
                    onClick={closeWithdrawModal} 
                    className="p-1 hover:bg-zinc-800 rounded-full cursor-pointer text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* --- Step 0: Input Form --- */}
                {withdrawStep === 0 && (
                  <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                    
                    {/* Instructions */}
                    <div className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800 space-y-2.5">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-left">Requisitos de Liberação</h4>
                      
                      {/* Rule 1: Min Balance */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300">1. Saldo mínimo (R$ 20,00):</span>
                        {balance >= 20 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">✓ OK</span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">✗ Falta saldo</span>
                        )}
                      </div>

                      {/* Rule 2: 3 referrals */}
                      <div className="flex items-center justify-between text-xs border-t border-zinc-800/40 pt-1.5">
                        <span className="text-zinc-300">2. Convidar 3 amigos ativos:</span>
                        {referrals.filter(r => r.status === 'Ativo').length >= 3 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">✓ OK ({referrals.filter(r => r.status === 'Ativo').length}/3)</span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">✗ Convidou {referrals.filter(r => r.status === 'Ativo').length}/3</span>
                        )}
                      </div>

                      {/* Rule 3: Download App */}
                      <div className="flex items-center justify-between text-xs border-t border-zinc-800/40 pt-1.5">
                        <span className="text-zinc-300">3. Baixar o Aplicativo Oficial:</span>
                        {isAppDownloaded ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">✓ Instalado</span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1">✗ Não instalado</span>
                        )}
                      </div>

                      {/* Download Button if not installed */}
                      {!isAppDownloaded && (
                        <button
                          type="button"
                          onClick={handleDownloadApp}
                          disabled={isDownloadingApp}
                          className="w-full mt-2 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-700/50 text-black rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          {isDownloadingApp ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Instalando Aplicativo...</span>
                            </>
                          ) : (
                            <>
                              <Smartphone className="w-3 h-3" />
                              <span>Baixar Aplicativo Oficial 📱</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Balance reference bar */}
                    <div className="flex justify-between items-center text-xs bg-black/40 px-3 py-2.5 rounded-xl">
                      <span className="text-zinc-400">Seu saldo de saque:</span>
                      <strong className="text-[#1DB954] text-sm">R$ {balance.toFixed(2)}</strong>
                    </div>

                    {/* Key type select */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">Tipo de Chave PIX</label>
                      <div className="grid grid-cols-4 gap-1">
                        {['CPF', 'Celular', 'Email', 'Aleatória'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setPixKeyType(type)}
                            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                              pixKeyType === type 
                                ? 'bg-emerald-500 text-black border-emerald-500 font-black' 
                                : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Key Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">Insera sua Chave PIX</label>
                      <input 
                        id="pix-key-input"
                        type="text"
                        value={pixKey}
                        onChange={(e) => setPixKey(e.target.value)}
                        placeholder={
                          pixKeyType === 'CPF' ? '000.000.000-00' :
                          pixKeyType === 'Celular' ? '(11) 99999-9999' :
                          pixKeyType === 'Email' ? 'email@exemplo.com' : 'Chave aleatória'
                        }
                        className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-3 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-bold">Valor do Saque (R$)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-black">R$</span>
                        <input 
                          id="pix-amount-input"
                          type="number"
                          step="0.01"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0,00"
                          className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-20 py-3 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
                          min="20"
                          required
                        />
                        <button
                          id="withdraw-max-btn"
                          type="button"
                          onClick={() => setWithdrawAmount(balance.toFixed(2))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg active:scale-95 transition-all"
                        >
                          Limite Máx
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      id="submit-withdraw-btn"
                      type="submit"
                      disabled={parseFloat(withdrawAmount) > balance || parseFloat(withdrawAmount) < 20}
                      className={`w-full py-3 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                        parseFloat(withdrawAmount) > balance || parseFloat(withdrawAmount) < 20 || !pixKey
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-[#1DB954] text-black font-black hover:bg-emerald-400'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Confirmar Saque PIX</span>
                    </button>

                  </form>
                )}

                {/* --- Step 1: Processing Loader Screen --- */}
                {withdrawStep === 1 && (
                  <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      {/* Rotating glow ring */}
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-[#1DB954] animate-spin" />
                      <DollarSign className="w-6 h-6 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Processando Solicitação</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 max-w-xs leading-relaxed">
                        Entrando em contato com o Banco Central para liberar a transferência instantânea...
                      </p>
                    </div>
                  </div>
                )}

                {/* --- Step 2: Success Screen --- */}
                {withdrawStep === 2 && (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-[bounce_0.6s_ease-out]">
                      <CheckCircle2 className="w-10 h-10 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">PIX Enviado com Sucesso!</h4>
                      <p className="text-[11px] text-zinc-400 mt-1 max-w-xs leading-relaxed">
                        A transferência de <strong className="text-emerald-400">R$ {parseFloat(withdrawAmount).toFixed(2)}</strong> foi concluída e deve aparecer no extrato do seu banco em até 2 minutos!
                      </p>
                    </div>
                    <button
                      id="finish-withdraw-btn"
                      onClick={closeWithdrawModal}
                      className="w-full bg-white text-black py-2.5 rounded-xl text-xs font-black active:scale-95 shadow-md cursor-pointer mt-2"
                    >
                      Fechar Extrato
                    </button>
                  </div>
                )}

              </motion.div>

            </div>
          )}
        </AnimatePresence>

        {/* --- SIMULATED DEPOSIT/RECHARGE MODAL --- */}
        <AnimatePresence>
          {isRechargeOpen && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-end justify-center">
              
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="w-full bg-[#181818] border-t border-zinc-800 rounded-t-3xl p-5 max-w-md space-y-4"
              >
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Recarga Simulada de Saldo</span>
                  </h3>
                  <button 
                    id="close-recharge-modal-btn"
                    onClick={closeRechargeModal} 
                    className="p-1 hover:bg-zinc-800 rounded-full cursor-pointer text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {rechargeStep === 0 && (
                  <form onSubmit={handleRechargeSubmit} className="space-y-4">
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Adicione saldo para conseguir ativar os planos VIP de maiores rendimentos! Escolha ou insira um valor fictício para simulação de recarga PIX.
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                      {['25', '50', '100', '150'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRechargeAmount(val)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                            rechargeAmount === val 
                              ? 'bg-emerald-500 text-black border-emerald-500 font-black' 
                              : 'bg-black text-zinc-400 border-zinc-800'
                          }`}
                        >
                          R$ {val}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">R$</span>
                      <input 
                        id="recharge-amount-input"
                        type="number"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="Outro valor"
                        className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>

                    <button
                      id="submit-recharge-btn"
                      type="submit"
                      className="w-full py-3 bg-[#1DB954] hover:bg-emerald-400 text-black rounded-xl text-xs font-black shadow-md cursor-pointer active:scale-95"
                    >
                      Gerar QR Code Copia e Cola
                    </button>
                  </form>
                )}

                {rechargeStep === 1 && (
                  <div className="text-center space-y-4 py-2">
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Escaneie ou clique no botão abaixo para confirmar o recebimento simulado de <strong className="text-emerald-400">R$ {parseFloat(rechargeAmount).toFixed(2)}</strong>!
                    </p>

                    <div className="bg-white p-3 w-32 h-32 mx-auto rounded-xl flex items-center justify-center shadow-lg">
                      <QrCode className="w-28 h-28 text-black" />
                    </div>

                    <div className="bg-black/40 border border-zinc-800 p-2 rounded-xl text-[10px] text-zinc-400 text-left font-mono truncate">
                      00020101021226870014br.gov.bcb.pix25894taf26rendatestesficticios
                    </div>

                    <div className="space-y-2">
                      <button
                        id="confirm-recharge-sim-btn"
                        onClick={simulatePaymentSuccess}
                        className="w-full bg-[#1DB954] text-black font-black py-2.5 rounded-xl text-xs active:scale-95 cursor-pointer shadow-md"
                      >
                        Simular Confirmação de Pagamento
                      </button>
                      <button
                        id="back-recharge-btn"
                        onClick={() => setRechargeStep(0)}
                        className="w-full bg-zinc-800 text-white font-bold py-2 rounded-xl text-xs active:scale-95 cursor-pointer"
                      >
                        Mudar Valor
                      </button>
                    </div>
                  </div>
                )}

                {rechargeStep === 2 && (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                      <Check className="w-6 h-6 stroke-[3px]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Depósito de Teste Concluído!</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        O saldo de <strong className="text-[#1DB954]">R$ {parseFloat(rechargeAmount).toFixed(2)}</strong> já foi creditado em sua carteira. Divirta-se comprando boosters VIP!
                      </p>
                    </div>
                    <button
                      id="finish-recharge-btn"
                      onClick={closeRechargeModal}
                      className="w-full bg-white text-black py-2 rounded-xl text-xs font-black active:scale-95 cursor-pointer"
                    >
                      Voltar ao Painel
                    </button>
                  </div>
                )}

              </motion.div>

            </div>
          )}
        </AnimatePresence>

        {/* --- INTERACTIVE CUSTOMER SUPPORT MODAL/CHAT --- */}
        <AnimatePresence>
          {isSupportOpen && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-end justify-center">
              
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="w-full bg-[#181818] border-t border-zinc-800 rounded-t-3xl p-0 max-w-md flex flex-col h-[520px] shadow-2xl"
              >
                {/* Chat Header */}
                <div className="bg-[#072415] border-b border-[#143e26] p-4 flex items-center justify-between rounded-t-3xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-500/20 bg-emerald-950/20 flex items-center justify-center">
                      <img src="/logo.jpeg" className="w-full h-full object-cover" alt="Suporte" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white">Suporte TAF26 RENDA</h4>
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        Atendentes Online
                      </span>
                    </div>
                  </div>
                  <button 
                    id="close-support-modal-btn"
                    onClick={() => setIsSupportOpen(false)} 
                    className="p-1 hover:bg-emerald-950/40 rounded-full cursor-pointer text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Chat Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#121212]">
                  {supportMessages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                    >
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-[#1DB954] text-black rounded-tr-none font-medium' 
                          : 'bg-[#181818] border border-zinc-800 text-zinc-100 rounded-tl-none'
                      }`}>
                        <p>{msg.text}</p>
                      </div>
                      <span className="text-[8px] text-zinc-500 mt-1 px-1">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSupportSubmit} className="p-3 border-t border-zinc-800 bg-[#181818] flex gap-2">
                  <input 
                    id="support-message-input"
                    type="text" 
                    value={supportInput}
                    onChange={(e) => setSupportInput(e.target.value)}
                    placeholder="Faça uma pergunta sobre saques ou convites..."
                    className="bg-black border border-zinc-800 rounded-xl px-3 py-2.5 text-base sm:text-xs flex-1 text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    id="send-support-btn"
                    type="submit"
                    className="bg-[#1DB954] hover:bg-emerald-400 text-black p-2.5 rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </motion.div>

            </div>
          )}
        </AnimatePresence>

        {/* --- BOTTOM NAVIGATION BAR (Exact replica of photo footer nav bar layout) --- */}
        <footer className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-0 sm:inset-x-0 bg-[#121212] border-t border-zinc-800 h-20 flex items-center justify-around px-2 z-30">
          
          {/* Tab 1: Home page */}
          <button
            id="footer-home-btn"
            onClick={() => {
              setActiveFooterTab('home');
              // Auto restore to player layout
              setActiveTab('player');
            }}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeFooterTab === 'home' ? 'scale-105' : ''
            }`}
          >
            <Compass className={`w-5 h-5 mb-1 ${activeFooterTab === 'home' ? 'text-[#1DB954]' : 'text-zinc-500'}`} />
            <span className={`text-[10px] font-bold ${activeFooterTab === 'home' ? 'text-[#1DB954]' : 'text-zinc-500'}`}>Início</span>
          </button>

          {/* Tab 2: Referral (Team) */}
          <button
            id="footer-team-btn"
            onClick={() => setActiveFooterTab('team')}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeFooterTab === 'team' ? 'scale-105' : ''
            }`}
          >
            <Users className={`w-5 h-5 mb-1 ${activeFooterTab === 'team' ? 'text-[#1DB954]' : 'text-zinc-500'}`} />
            <span className={`text-[10px] font-bold ${activeFooterTab === 'team' ? 'text-[#1DB954]' : 'text-zinc-500'}`}>Equipe</span>
          </button>

          {/* Tab 3: Daily Missions (Blog) */}
          <button
            id="footer-missions-btn"
            onClick={() => setActiveFooterTab('missions')}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeFooterTab === 'missions' ? 'scale-105' : ''
            }`}
          >
            <TrendingUp className={`w-5 h-5 mb-1 ${activeFooterTab === 'missions' ? 'text-[#1DB954]' : 'text-zinc-500'}`} />
            <span className={`text-[10px] font-bold ${activeFooterTab === 'missions' ? 'text-[#1DB954]' : 'text-zinc-500'}`}>Missões</span>
          </button>

          {/* Tab 4: Mine (User Details) */}
          <button
            id="footer-mine-btn"
            onClick={() => setActiveFooterTab('mine')}
            className={`flex flex-col items-center justify-center w-16 h-12 transition-all cursor-pointer ${
              activeFooterTab === 'mine' ? 'scale-105' : ''
            }`}
          >
            <User className={`w-5 h-5 mb-1 ${activeFooterTab === 'mine' ? 'text-[#1DB954]' : 'text-zinc-500'}`} />
            <span className={`text-[10px] font-bold ${activeFooterTab === 'mine' ? 'text-[#1DB954]' : 'text-zinc-500'}`}>Minha Conta</span>
          </button>

        </footer>

      </div>
    </div>
  );
}
