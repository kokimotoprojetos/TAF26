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
  Smartphone, 
  ChevronRight, 
  Clock, 
  Award, 
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


const songs: Song[] = [
  {
    id: 's-0',
    title: 'Despacito',
    artist: 'Luis Fonsi ft. Daddy Yankee',
    reward: 4.1,
    youtubeId: 'kJQP7kiw5Fk',
    coverUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    genre: 'Reggaeton'
  },
  {
    id: 's-1',
    title: 'Uptown Funk',
    artist: 'Mark Ronson ft. Bruno Mars',
    reward: 4.5,
    youtubeId: 'OPf0YbXqDm0',
    coverUrl: 'https://img.youtube.com/vi/OPf0YbXqDm0/hqdefault.jpg',
    genre: 'Funk'
  },
  {
    id: 's-3',
    title: 'Gangnam Style',
    artist: 'PSY',
    reward: 2.55,
    youtubeId: '9bZkp7q19f0',
    coverUrl: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
    genre: 'K-Pop'
  },
  {
    id: 's-4',
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    reward: 3.0,
    youtubeId: 'dQw4w9WgXcQ',
    coverUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-6',
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    reward: 2.75,
    youtubeId: 'fJ9rUzIMcZQ',
    coverUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-7',
    title: 'Hello',
    artist: 'Adele',
    reward: 3.5,
    youtubeId: 'YQHsXMglC9A',
    coverUrl: 'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-9',
    title: 'Castle On The Hill',
    artist: 'Ed Sheeran',
    reward: 4.2,
    youtubeId: 'K0ibBPhiaG0',
    coverUrl: 'https://img.youtube.com/vi/K0ibBPhiaG0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-10',
    title: 'Blank Space',
    artist: 'Taylor Swift',
    reward: 4.2,
    youtubeId: 'e-ORhEE9VVg',
    coverUrl: 'https://img.youtube.com/vi/e-ORhEE9VVg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-12',
    title: 'Counting Stars',
    artist: 'OneRepublic',
    reward: 3.8,
    youtubeId: 'hT_nvWreIhg',
    coverUrl: 'https://img.youtube.com/vi/hT_nvWreIhg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-13',
    title: 'Baby',
    artist: 'Justin Bieber ft. Ludacris',
    reward: 4.7,
    youtubeId: 'kffacxfA7G4',
    coverUrl: 'https://img.youtube.com/vi/kffacxfA7G4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-15',
    title: 'See You Again',
    artist: 'Wiz Khalifa ft. Charlie Puth',
    reward: 5.0,
    youtubeId: 'RgKAFK5djSk',
    coverUrl: 'https://img.youtube.com/vi/RgKAFK5djSk/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-16',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    reward: 3.8,
    youtubeId: 'JGwWNGJdvx8',
    coverUrl: 'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-18',
    title: 'What Do You Mean?',
    artist: 'Justin Bieber',
    reward: 3.7,
    youtubeId: 'DK_0jXPuIr0',
    coverUrl: 'https://img.youtube.com/vi/DK_0jXPuIr0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-19',
    title: 'Señorita',
    artist: 'Shawn Mendes & Camila Cabello',
    reward: 4.05,
    youtubeId: 'Pkh8UtuejGw',
    coverUrl: 'https://img.youtube.com/vi/Pkh8UtuejGw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-21',
    title: 'Sugar',
    artist: 'Maroon 5',
    reward: 3.3,
    youtubeId: '09R8_2nJtjg',
    coverUrl: 'https://img.youtube.com/vi/09R8_2nJtjg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-22',
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    reward: 4.7,
    youtubeId: 'kTJczUoc26U',
    coverUrl: 'https://img.youtube.com/vi/kTJczUoc26U/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-24',
    title: 'Watermelon Sugar',
    artist: 'Harry Styles',
    reward: 4.6,
    youtubeId: 'E07s5ZYygMg',
    coverUrl: 'https://img.youtube.com/vi/E07s5ZYygMg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-25',
    title: 'Woman',
    artist: 'Doja Cat',
    reward: 4.4,
    youtubeId: 'yxW5yuzVi8w',
    coverUrl: 'https://img.youtube.com/vi/yxW5yuzVi8w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-27',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    reward: 5.0,
    youtubeId: '4NRXx6U8ABQ',
    coverUrl: 'https://img.youtube.com/vi/4NRXx6U8ABQ/hqdefault.jpg',
    genre: 'Synthwave'
  },
  {
    id: 's-28',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 4.9,
    youtubeId: 'gdZLi9oWNZg',
    coverUrl: 'https://img.youtube.com/vi/gdZLi9oWNZg/hqdefault.jpg',
    genre: 'K-Pop'
  },
  {
    id: 's-30',
    title: 'WAP',
    artist: 'Cardi B ft. Megan Thee Stallion',
    reward: 4.85,
    youtubeId: 'hsm4poTWjMs',
    coverUrl: 'https://img.youtube.com/vi/hsm4poTWjMs/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-31',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    reward: 3.7,
    youtubeId: '5NV6Rdv1a3I',
    coverUrl: 'https://img.youtube.com/vi/5NV6Rdv1a3I/hqdefault.jpg',
    genre: 'Funk'
  },
  {
    id: 's-33',
    title: 'Lean On',
    artist: 'Major Lazer & DJ Snake',
    reward: 4.1,
    youtubeId: 'YqeW9_5kURI',
    coverUrl: 'https://img.youtube.com/vi/YqeW9_5kURI/hqdefault.jpg',
    genre: 'EDM'
  },
  {
    id: 's-34',
    title: 'Thriller',
    artist: 'Michael Jackson',
    reward: 4.3,
    youtubeId: 'sOnqjkJTMaA',
    coverUrl: 'https://img.youtube.com/vi/sOnqjkJTMaA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-36',
    title: 'Take On Me',
    artist: 'a-ha',
    reward: 3.6,
    youtubeId: 'djV11Xbc914',
    coverUrl: 'https://img.youtube.com/vi/djV11Xbc914/hqdefault.jpg',
    genre: 'Synth Pop'
  },
  {
    id: 's-37',
    title: '7 rings',
    artist: 'Ariana Grande',
    reward: 4.6,
    youtubeId: 'QYh6mYIJG2Y',
    coverUrl: 'https://img.youtube.com/vi/QYh6mYIJG2Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-39',
    title: 'Livin\' On A Prayer',
    artist: 'Bon Jovi',
    reward: 3.9,
    youtubeId: 'lDK9QqIzhwk',
    coverUrl: 'https://img.youtube.com/vi/lDK9QqIzhwk/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-40',
    title: 'Chandelier',
    artist: 'Sia',
    reward: 4.4,
    youtubeId: '2vjPBrBU-TM',
    coverUrl: 'https://img.youtube.com/vi/2vjPBrBU-TM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-42',
    title: 'Faded',
    artist: 'Alan Walker',
    reward: 4.2,
    youtubeId: '60ItHLz5WEA',
    coverUrl: 'https://img.youtube.com/vi/60ItHLz5WEA/hqdefault.jpg',
    genre: 'EDM'
  },
  {
    id: 's-43',
    title: 'Run the World',
    artist: 'Beyonce',
    reward: 4.1,
    youtubeId: 'VBmMU_iwe6U',
    coverUrl: 'https://img.youtube.com/vi/VBmMU_iwe6U/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-45',
    title: 'We Are Never Ever Getting Back Together',
    artist: 'Taylor Swift',
    reward: 3.8,
    youtubeId: 'WA4iX5D9Z64',
    coverUrl: 'https://img.youtube.com/vi/WA4iX5D9Z64/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-46',
    title: 'Payphone',
    artist: 'Maroon 5 ft. Wiz Khalifa',
    reward: 3.5,
    youtubeId: 'KRaWnd3LJfs',
    coverUrl: 'https://img.youtube.com/vi/KRaWnd3LJfs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-48',
    title: 'On The Floor',
    artist: 'Jennifer Lopez ft. Pitbull',
    reward: 3.6,
    youtubeId: 't4H_Zoh7G5A',
    coverUrl: 'https://img.youtube.com/vi/t4H_Zoh7G5A/hqdefault.jpg',
    genre: 'Dance'
  },
  {
    id: 's-49',
    title: 'Just A Dream',
    artist: 'Nelly',
    reward: 3.7,
    youtubeId: 'N6O2ncUKvlg',
    coverUrl: 'https://img.youtube.com/vi/N6O2ncUKvlg/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-51',
    title: 'Pink + White',
    artist: 'Frank Ocean',
    reward: 4.0,
    youtubeId: 'uzS3WG6__G4',
    coverUrl: 'https://img.youtube.com/vi/uzS3WG6__G4/hqdefault.jpg',
    genre: 'R&B'
  },
  {
    id: 's-52',
    title: 'Numb',
    artist: 'Linkin Park',
    reward: 4.9,
    youtubeId: 'kXYiU_JCYtU',
    coverUrl: 'https://img.youtube.com/vi/kXYiU_JCYtU/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-54',
    title: 'Crank That',
    artist: 'Soulja Boy',
    reward: 3.2,
    youtubeId: '8UFIYGkROII',
    coverUrl: 'https://img.youtube.com/vi/8UFIYGkROII/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-55',
    title: 'The Fox',
    artist: 'Ylvis',
    reward: 2.8,
    youtubeId: 'jofNR_WkoCE',
    coverUrl: 'https://img.youtube.com/vi/jofNR_WkoCE/hqdefault.jpg',
    genre: 'Comedy Pop'
  },
  {
    id: 's-57',
    title: 'bad guy',
    artist: 'Billie Eilish',
    reward: 4.4,
    youtubeId: 'DyDfgMOUjCI',
    coverUrl: 'https://img.youtube.com/vi/DyDfgMOUjCI/hqdefault.jpg',
    genre: 'Alternative'
  },
  {
    id: 's-58',
    title: 'Old Town Road',
    artist: 'Lil Nas X ft. Billy Ray Cyrus',
    reward: 2.7,
    youtubeId: 'r7qovpFAGrQ',
    coverUrl: 'https://img.youtube.com/vi/r7qovpFAGrQ/hqdefault.jpg',
    genre: 'Country Rap'
  },
  {
    id: 's-60',
    title: 'Someone Like You',
    artist: 'Adele',
    reward: 4.2,
    youtubeId: 'hLQl3WQQoQ0',
    coverUrl: 'https://img.youtube.com/vi/hLQl3WQQoQ0/hqdefault.jpg',
    genre: 'Ballad'
  },
  {
    id: 's-61',
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    reward: 2.85,
    youtubeId: 'hTWKbfoikeg',
    coverUrl: 'https://img.youtube.com/vi/hTWKbfoikeg/hqdefault.jpg',
    genre: 'Grunge'
  },
  {
    id: 's-63',
    title: 'Stairway To Heaven',
    artist: 'Led Zeppelin',
    reward: 3.4,
    youtubeId: 'QkF3oxziUI4',
    coverUrl: 'https://img.youtube.com/vi/QkF3oxziUI4/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-64',
    title: 'Roar',
    artist: 'Katy Perry',
    reward: 2.95,
    youtubeId: 'CevxZvSJLk8',
    coverUrl: 'https://img.youtube.com/vi/CevxZvSJLk8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-66',
    title: 'Finesse (Remix)',
    artist: 'Bruno Mars ft. Cardi B',
    reward: 3.65,
    youtubeId: 'LsoLEjrDogU',
    coverUrl: 'https://img.youtube.com/vi/LsoLEjrDogU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-67',
    title: 'Stitches',
    artist: 'Shawn Mendes',
    reward: 3.3,
    youtubeId: 'VbfpW0pbvaU',
    coverUrl: 'https://img.youtube.com/vi/VbfpW0pbvaU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-69',
    title: 'Somebody That I Used to Know',
    artist: 'Gotye ft. Kimbra',
    reward: 3.6,
    youtubeId: '8UVNT4wvIGY',
    coverUrl: 'https://img.youtube.com/vi/8UVNT4wvIGY/hqdefault.jpg',
    genre: 'Indie'
  },
  {
    id: 's-70',
    title: 'Let Her Go',
    artist: 'Passenger',
    reward: 3.6,
    youtubeId: 'RBumgq5yVrA',
    coverUrl: 'https://img.youtube.com/vi/RBumgq5yVrA/hqdefault.jpg',
    genre: 'Folk'
  },
  {
    id: 's-72',
    title: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    reward: 3.8,
    youtubeId: 'lp-EO5I60KA',
    coverUrl: 'https://img.youtube.com/vi/lp-EO5I60KA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-73',
    title: 'Radioactive',
    artist: 'Imagine Dragons',
    reward: 4.0,
    youtubeId: 'ktvTqknDobU',
    coverUrl: 'https://img.youtube.com/vi/ktvTqknDobU/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-75',
    title: 'Rolling in the Deep',
    artist: 'Adele',
    reward: 4.3,
    youtubeId: 'rYEDA3JcQqw',
    coverUrl: 'https://img.youtube.com/vi/rYEDA3JcQqw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-76',
    title: 'Lose Yourself',
    artist: 'Eminem',
    reward: 3.8,
    youtubeId: '_Yhyp-_hX2s',
    coverUrl: 'https://img.youtube.com/vi/_Yhyp-_hX2s/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-78',
    title: 'Bad Romance',
    artist: 'Lady Gaga',
    reward: 4.2,
    youtubeId: 'qrO4YZeyl0I',
    coverUrl: 'https://img.youtube.com/vi/qrO4YZeyl0I/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-79',
    title: 'Umbrella',
    artist: 'Rihanna ft. JAY-Z',
    reward: 3.8,
    youtubeId: 'CvBfHwUxHIk',
    coverUrl: 'https://img.youtube.com/vi/CvBfHwUxHIk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-81',
    title: 'Firework',
    artist: 'Katy Perry',
    reward: 3.7,
    youtubeId: 'QGJuMBdaqIw',
    coverUrl: 'https://img.youtube.com/vi/QGJuMBdaqIw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-82',
    title: 'Just The Way You Are',
    artist: 'Bruno Mars',
    reward: 3.8,
    youtubeId: 'LjhCEhWiKXk',
    coverUrl: 'https://img.youtube.com/vi/LjhCEhWiKXk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-84',
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    reward: 3.9,
    youtubeId: 'Zi_XLOBDo_Y',
    coverUrl: 'https://img.youtube.com/vi/Zi_XLOBDo_Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-85',
    title: 'Single Ladies',
    artist: 'Beyonce',
    reward: 3.5,
    youtubeId: '4m1EFMoRFvY',
    coverUrl: 'https://img.youtube.com/vi/4m1EFMoRFvY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-87',
    title: 'Shake It Off',
    artist: 'Taylor Swift',
    reward: 3.6,
    youtubeId: 'nfWlot6h_JM',
    coverUrl: 'https://img.youtube.com/vi/nfWlot6h_JM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-88',
    title: 'All About That Bass',
    artist: 'Meghan Trainor',
    reward: 3.4,
    youtubeId: '7PCkvCPvDXk',
    coverUrl: 'https://img.youtube.com/vi/7PCkvCPvDXk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-90',
    title: 'Wake Me Up',
    artist: 'Avicii',
    reward: 4.2,
    youtubeId: 'IcrbM1l_BoI',
    coverUrl: 'https://img.youtube.com/vi/IcrbM1l_BoI/hqdefault.jpg',
    genre: 'EDM'
  },
  {
    id: 's-91',
    title: 'I Gotta Feeling',
    artist: 'Black Eyed Peas',
    reward: 3.8,
    youtubeId: 'uSD4vsh1zDA',
    coverUrl: 'https://img.youtube.com/vi/uSD4vsh1zDA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-93',
    title: 'Hey Soul Sister',
    artist: 'Train',
    reward: 3.5,
    youtubeId: 'kVpv8-5XWOI',
    coverUrl: 'https://img.youtube.com/vi/kVpv8-5XWOI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-94',
    title: 'Moves Like Jagger',
    artist: 'Maroon 5 ft. Christina Aguilera',
    reward: 3.6,
    youtubeId: 'iEPTlhBmwRg',
    coverUrl: 'https://img.youtube.com/vi/iEPTlhBmwRg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-96',
    title: 'Party Rock Anthem',
    artist: 'LMFAO',
    reward: 3.5,
    youtubeId: 'KQ6zr6kCPj8',
    coverUrl: 'https://img.youtube.com/vi/KQ6zr6kCPj8/hqdefault.jpg',
    genre: 'Dance'
  },
  {
    id: 's-97',
    title: 'Paradise',
    artist: 'Coldplay',
    reward: 3.9,
    youtubeId: '1G4isv_Fylg',
    coverUrl: 'https://img.youtube.com/vi/1G4isv_Fylg/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-99',
    title: 'Africa',
    artist: 'Toto',
    reward: 3.8,
    youtubeId: 'FTQbiNvZqaY',
    coverUrl: 'https://img.youtube.com/vi/FTQbiNvZqaY/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-100',
    title: 'Dragostea Din Tei',
    artist: 'O-Zone',
    reward: 3.2,
    youtubeId: 'YnopHCL1Jk8',
    coverUrl: 'https://img.youtube.com/vi/YnopHCL1Jk8/hqdefault.jpg',
    genre: 'Dance'
  },
  {
    id: 's-102',
    title: 'Poker Face',
    artist: 'Lady Gaga',
    reward: 3.8,
    youtubeId: 'bESGLojNYSo',
    coverUrl: 'https://img.youtube.com/vi/bESGLojNYSo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-103',
    title: 'One Step Closer',
    artist: 'Linkin Park',
    reward: 3.1,
    youtubeId: '4qlCC1GOwFw',
    coverUrl: 'https://img.youtube.com/vi/4qlCC1GOwFw/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-105',
    title: 'Don\'t Stop Believin\'',
    artist: 'Journey',
    reward: 3.6,
    youtubeId: '1k8craCGpgs',
    coverUrl: 'https://img.youtube.com/vi/1k8craCGpgs/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-106',
    title: 'Chasing Pavements',
    artist: 'Adele',
    reward: 3.5,
    youtubeId: '08DjMT-qR9g',
    coverUrl: 'https://img.youtube.com/vi/08DjMT-qR9g/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-108',
    title: 'Stressed Out',
    artist: 'twenty one pilots',
    reward: 3.8,
    youtubeId: 'pXRviuL6vMY',
    coverUrl: 'https://img.youtube.com/vi/pXRviuL6vMY/hqdefault.jpg',
    genre: 'Alternative'
  },
  {
    id: 's-109',
    title: 'Party In The U.S.A.',
    artist: 'Miley Cyrus',
    reward: 3.3,
    youtubeId: 'M11SvDtPBhA',
    coverUrl: 'https://img.youtube.com/vi/M11SvDtPBhA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-111',
    title: 'Titanium',
    artist: 'David Guetta ft. Sia',
    reward: 4.0,
    youtubeId: 'JRfuAukYTKg',
    coverUrl: 'https://img.youtube.com/vi/JRfuAukYTKg/hqdefault.jpg',
    genre: 'EDM'
  },
  {
    id: 's-112',
    title: 'Bangarang',
    artist: 'Skrillex',
    reward: 3.3,
    youtubeId: 'YJVmu6yttiw',
    coverUrl: 'https://img.youtube.com/vi/YJVmu6yttiw/hqdefault.jpg',
    genre: 'EDM'
  },
  {
    id: 's-114',
    title: 'One More Time',
    artist: 'Daft Punk',
    reward: 3.2,
    youtubeId: 'FGBhQbmPwH8',
    coverUrl: 'https://img.youtube.com/vi/FGBhQbmPwH8/hqdefault.jpg',
    genre: 'Electronic'
  },
  {
    id: 's-115',
    title: 'Whenever, Wherever',
    artist: 'Shakira',
    reward: 3.4,
    youtubeId: 'weRHyjj34ZE',
    coverUrl: 'https://img.youtube.com/vi/weRHyjj34ZE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-117',
    title: 'Hips Don\'t Lie',
    artist: 'Shakira ft. Wyclef Jean',
    reward: 3.7,
    youtubeId: 'DUT5rEU6pqM',
    coverUrl: 'https://img.youtube.com/vi/DUT5rEU6pqM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-118',
    title: 'Space Bound',
    artist: 'Eminem',
    reward: 4.4,
    youtubeId: 'JByDbPn6A1o',
    coverUrl: 'https://img.youtube.com/vi/JByDbPn6A1o/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-120',
    title: 'Not Afraid',
    artist: 'Eminem',
    reward: 3.8,
    youtubeId: 'j5-yKhDd64s',
    coverUrl: 'https://img.youtube.com/vi/j5-yKhDd64s/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-121',
    title: 'Toxic',
    artist: 'Britney Spears',
    reward: 3.2,
    youtubeId: 'LOZuxwVk7TU',
    coverUrl: 'https://img.youtube.com/vi/LOZuxwVk7TU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-123',
    title: 'Can\'t Help Falling In Love',
    artist: 'Elvis Presley',
    reward: 3.0,
    youtubeId: 'vGJTaP6anOU',
    coverUrl: 'https://img.youtube.com/vi/vGJTaP6anOU/hqdefault.jpg',
    genre: 'Ballad'
  },
  {
    id: 's-124',
    title: 'Pompeii',
    artist: 'Bastille',
    reward: 3.6,
    youtubeId: 'F90Cw4l-8NY',
    coverUrl: 'https://img.youtube.com/vi/F90Cw4l-8NY/hqdefault.jpg',
    genre: 'Indie'
  },
  {
    id: 's-126',
    title: 'Everybody Hurts',
    artist: 'R.E.M.',
    reward: 3.8,
    youtubeId: '5rOiW_xY-kc',
    coverUrl: 'https://img.youtube.com/vi/5rOiW_xY-kc/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-127',
    title: 'Always',
    artist: 'Bon Jovi',
    reward: 4.2,
    youtubeId: '9BMwcO6_hyA',
    coverUrl: 'https://img.youtube.com/vi/9BMwcO6_hyA/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-129',
    title: 'Give Me Everything',
    artist: 'Pitbull ft. Ne-Yo',
    reward: 3.6,
    youtubeId: 'EPo5wWmKEaI',
    coverUrl: 'https://img.youtube.com/vi/EPo5wWmKEaI/hqdefault.jpg',
    genre: 'Dance'
  },
  {
    id: 's-130',
    title: 'Dancing Queen',
    artist: 'ABBA',
    reward: 3.5,
    youtubeId: 'xFrGuyw1V8s',
    coverUrl: 'https://img.youtube.com/vi/xFrGuyw1V8s/hqdefault.jpg',
    genre: 'Disco'
  },
  {
    id: 's-132',
    title: 'Sweet Child O\' Mine',
    artist: 'Guns N\' Roses',
    reward: 3.5,
    youtubeId: '1w7OgIMMRc4',
    coverUrl: 'https://img.youtube.com/vi/1w7OgIMMRc4/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-133',
    title: 'Enter Sandman',
    artist: 'Metallica',
    reward: 4.2,
    youtubeId: 'CD-E-LDc384',
    coverUrl: 'https://img.youtube.com/vi/CD-E-LDc384/hqdefault.jpg',
    genre: 'Metal'
  },
  {
    id: 's-135',
    title: 'Thunderstruck',
    artist: 'AC/DC',
    reward: 3.7,
    youtubeId: 'v2AC41dglnM',
    coverUrl: 'https://img.youtube.com/vi/v2AC41dglnM/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-136',
    title: 'Highway to Hell',
    artist: 'AC/DC',
    reward: 3.4,
    youtubeId: 'l482T0yNkeo',
    coverUrl: 'https://img.youtube.com/vi/l482T0yNkeo/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-138',
    title: 'One',
    artist: 'U2',
    reward: 3.8,
    youtubeId: 'ftjEcrrf7r0',
    coverUrl: 'https://img.youtube.com/vi/ftjEcrrf7r0/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-139',
    title: 'The Pretender',
    artist: 'Foo Fighters',
    reward: 3.9,
    youtubeId: 'SBjQ9tuuTJQ',
    coverUrl: 'https://img.youtube.com/vi/SBjQ9tuuTJQ/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-141',
    title: 'The Show Must Go On',
    artist: 'Queen',
    reward: 3.5,
    youtubeId: 't99KH0TR-J4',
    coverUrl: 'https://img.youtube.com/vi/t99KH0TR-J4/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-142',
    title: 'Bring Me To Life',
    artist: 'Evanescence',
    reward: 3.6,
    youtubeId: '3YxaaGgTQYM',
    coverUrl: 'https://img.youtube.com/vi/3YxaaGgTQYM/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-144',
    title: 'Somewhere Over The Rainbow',
    artist: 'Israel Kamakawiwo\'ole',
    reward: 3.4,
    youtubeId: 'V1bFr2SWP1I',
    coverUrl: 'https://img.youtube.com/vi/V1bFr2SWP1I/hqdefault.jpg',
    genre: 'Ballad'
  },
  {
    id: 's-145',
    title: 'Black And Yellow',
    artist: 'Wiz Khalifa',
    reward: 3.6,
    youtubeId: 'UePtoxDhJSw',
    coverUrl: 'https://img.youtube.com/vi/UePtoxDhJSw/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-147',
    title: 'Still D.R.E.',
    artist: 'Dr. Dre ft. Snoop Dogg',
    reward: 3.7,
    youtubeId: '_CL6n0FJZpk',
    coverUrl: 'https://img.youtube.com/vi/_CL6n0FJZpk/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-148',
    title: 'Super Bass',
    artist: 'Nicki Minaj',
    reward: 3.3,
    youtubeId: '4JipHEz53sU',
    coverUrl: 'https://img.youtube.com/vi/4JipHEz53sU/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-150',
    title: 'Stronger',
    artist: 'Kelly Clarkson',
    reward: 3.5,
    youtubeId: 'Xn676-fLq7I',
    coverUrl: 'https://img.youtube.com/vi/Xn676-fLq7I/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-151',
    title: 'Waka Waka',
    artist: 'Shakira',
    reward: 3.3,
    youtubeId: 'pRpeEdMmmQ0',
    coverUrl: 'https://img.youtube.com/vi/pRpeEdMmmQ0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-153',
    title: 'Love The Way You Lie',
    artist: 'Eminem ft. Rihanna',
    reward: 4.3,
    youtubeId: 'uelHwf8o7_U',
    coverUrl: 'https://img.youtube.com/vi/uelHwf8o7_U/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-154',
    title: 'Without Me',
    artist: 'Eminem',
    reward: 3.8,
    youtubeId: 'YVkUvmDQ3HY',
    coverUrl: 'https://img.youtube.com/vi/YVkUvmDQ3HY/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-156',
    title: 'White Iverson',
    artist: 'Post Malone',
    reward: 3.8,
    youtubeId: 'SLsTskih7_I',
    coverUrl: 'https://img.youtube.com/vi/SLsTskih7_I/hqdefault.jpg',
    genre: 'Hip Hop'
  },
  {
    id: 's-157',
    title: 'Crazy In Love',
    artist: 'Beyonce ft. JAY-Z',
    reward: 3.5,
    youtubeId: 'ViwtNLUqkMY',
    coverUrl: 'https://img.youtube.com/vi/ViwtNLUqkMY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-159',
    title: 'Dark Horse',
    artist: 'Katy Perry ft. Juicy J',
    reward: 3.4,
    youtubeId: '0KSOMA3QBU0',
    coverUrl: 'https://img.youtube.com/vi/0KSOMA3QBU0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-160',
    title: 'Wrecking Ball',
    artist: 'Miley Cyrus',
    reward: 3.4,
    youtubeId: 'My2FRPA3Gf8',
    coverUrl: 'https://img.youtube.com/vi/My2FRPA3Gf8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-162',
    title: 'Stay',
    artist: 'Rihanna',
    reward: 3.5,
    youtubeId: 'JF8BRvqGCNs',
    coverUrl: 'https://img.youtube.com/vi/JF8BRvqGCNs/hqdefault.jpg',
    genre: 'Ballad'
  },
  {
    id: 's-163',
    title: 'Teardrops On My Guitar',
    artist: 'Taylor Swift',
    reward: 3.0,
    youtubeId: 'xKCek6_dB0M',
    coverUrl: 'https://img.youtube.com/vi/xKCek6_dB0M/hqdefault.jpg',
    genre: 'Country Pop'
  },
  {
    id: 's-165',
    title: 'All Too Well',
    artist: 'Taylor Swift',
    reward: 4.2,
    youtubeId: 'sRxrwjOtIag',
    coverUrl: 'https://img.youtube.com/vi/sRxrwjOtIag/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-166',
    title: 'New Rules',
    artist: 'Dua Lipa',
    reward: 3.6,
    youtubeId: 'k2qgadSvNyU',
    coverUrl: 'https://img.youtube.com/vi/k2qgadSvNyU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-168',
    title: 'Lost Without U',
    artist: 'Robin Thicke',
    reward: 4.0,
    youtubeId: '0DdCoNbbRvQ',
    coverUrl: 'https://img.youtube.com/vi/0DdCoNbbRvQ/hqdefault.jpg',
    genre: 'R&B'
  },
  {
    id: 's-169',
    title: 'Born This Way',
    artist: 'Lady Gaga',
    reward: 4.2,
    youtubeId: 'wV1FrqwZyKw',
    coverUrl: 'https://img.youtube.com/vi/wV1FrqwZyKw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-171',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    reward: 3.4,
    youtubeId: 'gGdGFtwCNBE',
    coverUrl: 'https://img.youtube.com/vi/gGdGFtwCNBE/hqdefault.jpg',
    genre: 'Rock'
  },
  {
    id: 's-172',
    title: 'TOMBOY',
    artist: '(G)I-DLE',
    reward: 4.2,
    youtubeId: 'Jh4QFaPmdss',
    coverUrl: 'https://img.youtube.com/vi/Jh4QFaPmdss/hqdefault.jpg',
    genre: 'K-Pop'
  },
  {
    id: 's-174',
    title: 'Dai Dai',
    artist: 'Shakira, Burna Boy',
    reward: 3.5,
    youtubeId: 'fcnDmrtj6Sk',
    coverUrl: 'https://img.youtube.com/vi/fcnDmrtj6Sk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-175',
    title: 'Life Goes On',
    artist: 'Oliver Tree',
    reward: 3.2,
    youtubeId: '8F2s8ivKXNY',
    coverUrl: 'https://img.youtube.com/vi/8F2s8ivKXNY/hqdefault.jpg',
    genre: 'Alternative'
  },
  {
    id: 's-177',
    title: 'Miss You',
    artist: 'Oliver Tree & Robin Schulz',
    reward: 3.2,
    youtubeId: 'BX0lKSa_PTk',
    coverUrl: 'https://img.youtube.com/vi/BX0lKSa_PTk/hqdefault.jpg',
    genre: 'EDM'
  },
  {
    id: 's-178',
    title: 'Beat It',
    artist: 'Michael Jackson',
    reward: 4.1,
    youtubeId: 'oRdxUFDoQe0',
    coverUrl: 'https://img.youtube.com/vi/oRdxUFDoQe0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-180',
    title: 'Smooth Criminal',
    artist: 'Michael Jackson',
    reward: 3.8,
    youtubeId: 'h_D3VFfhvs4',
    coverUrl: 'https://img.youtube.com/vi/h_D3VFfhvs4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-181',
    title: 'Beauty And A Beat',
    artist: 'Justin Bieber ft. Nicki Minaj',
    reward: 3.5,
    youtubeId: 'Ys7-6_t7OEQ',
    coverUrl: 'https://img.youtube.com/vi/Ys7-6_t7OEQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-183',
    title: 'hate that i made you love me',
    artist: 'Ariana Grande',
    reward: 3.2,
    youtubeId: '82-jTNka3uc',
    coverUrl: 'https://img.youtube.com/vi/82-jTNka3uc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-184',
    title: 'Lemonade',
    artist: 'aespa',
    reward: 3.5,
    youtubeId: '83C3TZ4Zm_o',
    coverUrl: 'https://img.youtube.com/vi/83C3TZ4Zm_o/hqdefault.jpg',
    genre: 'K-Pop'
  },
  {
    id: 's-186',
    title: 'Choom',
    artist: 'BABYMONSTER',
    reward: 3.2,
    youtubeId: 'x3eqqoZPV_E',
    coverUrl: 'https://img.youtube.com/vi/x3eqqoZPV_E/hqdefault.jpg',
    genre: 'K-Pop'
  },
  {
    id: 's-187',
    title: 'SUGAR HONEY ICE TEA',
    artist: 'BABYMONSTER',
    reward: 3.0,
    youtubeId: 'naoGk-Zjc1s',
    coverUrl: 'https://img.youtube.com/vi/naoGk-Zjc1s/hqdefault.jpg',
    genre: 'K-Pop'
  },
  {
    id: 's-189',
    title: 'Uptown Funk',
    artist: 'Mark Ronson',
    reward: 4.8,
    youtubeId: 'tYvFa2ARD24',
    coverUrl: 'https://img.youtube.com/vi/tYvFa2ARD24/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-190',
    title: 'Axel F',
    artist: 'Crazy Frog',
    reward: 3.01,
    youtubeId: 'k85mRPqvMbE',
    coverUrl: 'https://img.youtube.com/vi/k85mRPqvMbE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-192',
    title: 'Sorry',
    artist: 'Justin Bieber',
    reward: 4.17,
    youtubeId: 'fRh_vgS2dFE',
    coverUrl: 'https://img.youtube.com/vi/fRh_vgS2dFE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-193',
    title: 'Dame Tu Cosita',
    artist: 'El Chombo',
    reward: 2.0,
    youtubeId: 'FzG4uDgje3M',
    coverUrl: 'https://img.youtube.com/vi/FzG4uDgje3M/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-195',
    title: 'Bailando',
    artist: 'Gente de Zona',
    reward: 3.17,
    youtubeId: 'b8I-7Wk_Vbc',
    coverUrl: 'https://img.youtube.com/vi/b8I-7Wk_Vbc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-196',
    title: 'Bailando',
    artist: 'Gente de Zona',
    reward: 4.51,
    youtubeId: 'NUsoVlDFqZg',
    coverUrl: 'https://img.youtube.com/vi/NUsoVlDFqZg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-198',
    title: 'Girls Like You',
    artist: 'Cardi B',
    reward: 4.51,
    youtubeId: 'aJOTlE1K90k',
    coverUrl: 'https://img.youtube.com/vi/aJOTlE1K90k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-199',
    title: 'Mi Gente',
    artist: 'Willy William',
    reward: 4.36,
    youtubeId: 'APHgDFRpCi0',
    coverUrl: 'https://img.youtube.com/vi/APHgDFRpCi0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-201',
    title: 'Mi Gente',
    artist: 'Willy William',
    reward: 2.67,
    youtubeId: 'wnJ6LuUFpMo',
    coverUrl: 'https://img.youtube.com/vi/wnJ6LuUFpMo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-202',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    reward: 4.43,
    youtubeId: '2Vv-BfVoq4g',
    coverUrl: 'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-204',
    title: 'Closer',
    artist: 'Halsey',
    reward: 2.81,
    youtubeId: 'PT2_F-1esPk',
    coverUrl: 'https://img.youtube.com/vi/PT2_F-1esPk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-205',
    title: 'Chantaje',
    artist: 'Maluma',
    reward: 3.52,
    youtubeId: '6Mgqbai3fKo',
    coverUrl: 'https://img.youtube.com/vi/6Mgqbai3fKo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-207',
    title: 'We Don\'t Talk Anymore',
    artist: 'Charlie Puth',
    reward: 2.13,
    youtubeId: '3AtDnEC4zak',
    coverUrl: 'https://img.youtube.com/vi/3AtDnEC4zak/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-208',
    title: 'Rockabye',
    artist: 'Anne-Marie',
    reward: 2.36,
    youtubeId: 'papuvlVeZg8',
    coverUrl: 'https://img.youtube.com/vi/papuvlVeZg8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-210',
    title: 'This Is What You Came For',
    artist: 'Calvin Harris',
    reward: 4.23,
    youtubeId: 'kOkQ4T5WO9E',
    coverUrl: 'https://img.youtube.com/vi/kOkQ4T5WO9E/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-211',
    title: 'Work from Home',
    artist: 'Ty Dolla Sign',
    reward: 4.85,
    youtubeId: '5GL9JoH4Sws',
    coverUrl: 'https://img.youtube.com/vi/5GL9JoH4Sws/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-213',
    title: 'Con Calma',
    artist: 'Snow',
    reward: 2.68,
    youtubeId: 'DiItGE3eAyQ',
    coverUrl: 'https://img.youtube.com/vi/DiItGE3eAyQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-214',
    title: 'Calma (Remix)',
    artist: 'Pedro Capó',
    reward: 2.71,
    youtubeId: '1_zgKRBrT0Y',
    coverUrl: 'https://img.youtube.com/vi/1_zgKRBrT0Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-216',
    title: 'Criminal',
    artist: 'Ozuna',
    reward: 2.66,
    youtubeId: 'VqEbCxg2bNI',
    coverUrl: 'https://img.youtube.com/vi/VqEbCxg2bNI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-217',
    title: 'Love Me Like You Do',
    artist: 'Ellie Goulding',
    reward: 2.35,
    youtubeId: 'AJtDXIazrMo',
    coverUrl: 'https://img.youtube.com/vi/AJtDXIazrMo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-219',
    title: 'Wake Me Up',
    artist: 'Avicii',
    reward: 2.39,
    youtubeId: '2NiyrtYegso',
    coverUrl: 'https://img.youtube.com/vi/2NiyrtYegso/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-220',
    title: 'Ddu-Du Ddu-Du',
    artist: 'Blackpink',
    reward: 4.57,
    youtubeId: 'IHNzOHi8sJs',
    coverUrl: 'https://img.youtube.com/vi/IHNzOHi8sJs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-222',
    title: 'Échame la culpa',
    artist: 'Luis Fonsi',
    reward: 3.56,
    youtubeId: 'TyHvyGVs42U',
    coverUrl: 'https://img.youtube.com/vi/TyHvyGVs42U/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-223',
    title: 'The Lazy Song',
    artist: 'Bruno Mars',
    reward: 3.29,
    youtubeId: 'fLexgOxsZu0',
    coverUrl: 'https://img.youtube.com/vi/fLexgOxsZu0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-225',
    title: 'Taki Taki',
    artist: 'Ozuna',
    reward: 2.1,
    youtubeId: 'ixkoVwKQaJg',
    coverUrl: 'https://img.youtube.com/vi/ixkoVwKQaJg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-226',
    title: 'Treat You Better',
    artist: 'Shawn Mendes',
    reward: 2.58,
    youtubeId: 'lY2yjAdbvdQ',
    coverUrl: 'https://img.youtube.com/vi/lY2yjAdbvdQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-228',
    title: 'Alone',
    artist: 'Marshmello',
    reward: 4.19,
    youtubeId: 'ALZHF5UqnU4',
    coverUrl: 'https://img.youtube.com/vi/ALZHF5UqnU4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-229',
    title: 'Rude',
    artist: 'Magic!',
    reward: 4.47,
    youtubeId: 'PIh2xe4jnpk',
    coverUrl: 'https://img.youtube.com/vi/PIh2xe4jnpk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-231',
    title: 'X',
    artist: 'Nicky Jam',
    reward: 3.12,
    youtubeId: '_I_D_8Z4sJE',
    coverUrl: 'https://img.youtube.com/vi/_I_D_8Z4sJE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-232',
    title: 'Mayores',
    artist: 'Bad Bunny',
    reward: 2.89,
    youtubeId: 'GMFewiplIbw',
    coverUrl: 'https://img.youtube.com/vi/GMFewiplIbw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-234',
    title: 'Worth It',
    artist: 'Fifth Harmony',
    reward: 3.45,
    youtubeId: 'YBHQbu5rbdQ',
    coverUrl: 'https://img.youtube.com/vi/YBHQbu5rbdQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-235',
    title: 'Side to Side',
    artist: 'Nicki Minaj',
    reward: 4.01,
    youtubeId: 'SXiSVQZLje8',
    coverUrl: 'https://img.youtube.com/vi/SXiSVQZLje8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-237',
    title: 'Sin Pijama',
    artist: 'Natti Natasha',
    reward: 3.51,
    youtubeId: 'zEf423kYfqk',
    coverUrl: 'https://img.youtube.com/vi/zEf423kYfqk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-238',
    title: 'Not Afraid',
    artist: 'Eminem',
    reward: 2.53,
    youtubeId: '-grPV-Fae6I',
    coverUrl: 'https://img.youtube.com/vi/-grPV-Fae6I/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-240',
    title: 'Starboy',
    artist: 'The Weeknd',
    reward: 4.9,
    youtubeId: '34Na4j8AVgA',
    coverUrl: 'https://img.youtube.com/vi/34Na4j8AVgA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-241',
    title: 'That\'s What I Like',
    artist: 'Bruno Mars',
    reward: 2.09,
    youtubeId: 'PMivT7MJ41M',
    coverUrl: 'https://img.youtube.com/vi/PMivT7MJ41M/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-243',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    reward: 4.98,
    youtubeId: 'rtOvBOTyX00',
    coverUrl: 'https://img.youtube.com/vi/rtOvBOTyX00/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-244',
    title: 'Watch Me (Whip/Nae Nae)',
    artist: 'Silentó',
    reward: 3.9,
    youtubeId: 'vjW8wmF5VWc',
    coverUrl: 'https://img.youtube.com/vi/vjW8wmF5VWc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-246',
    title: 'Con altura',
    artist: 'Rosalía',
    reward: 2.96,
    youtubeId: 'p7bfOZek9t4',
    coverUrl: 'https://img.youtube.com/vi/p7bfOZek9t4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-247',
    title: 'Life Is Good',
    artist: 'Future',
    reward: 4.72,
    youtubeId: 'l0U7SxXHkPY',
    coverUrl: 'https://img.youtube.com/vi/l0U7SxXHkPY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-249',
    title: 'Ay Vamos',
    artist: 'J Balvin',
    reward: 3.76,
    youtubeId: 'TapXs54Ah3E',
    coverUrl: 'https://img.youtube.com/vi/TapXs54Ah3E/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-250',
    title: 'Hotline Bling',
    artist: 'Drake',
    reward: 4.8,
    youtubeId: 'uxpDa-c-4Mc',
    coverUrl: 'https://img.youtube.com/vi/uxpDa-c-4Mc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-252',
    title: 'Propuesta Indecente',
    artist: 'Romeo Santos',
    reward: 3.95,
    youtubeId: 'QFs3PIZb3js',
    coverUrl: 'https://img.youtube.com/vi/QFs3PIZb3js/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-253',
    title: 'Cheap Thrills',
    artist: 'Sean Paul',
    reward: 3.85,
    youtubeId: '31crA53Dgu0',
    coverUrl: 'https://img.youtube.com/vi/31crA53Dgu0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-255',
    title: 'Cheap Thrills',
    artist: 'Sean Paul',
    reward: 2.4,
    youtubeId: 'nYh-n7EOtMA',
    coverUrl: 'https://img.youtube.com/vi/nYh-n7EOtMA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-256',
    title: 'Vente Pa ca',
    artist: 'Maluma',
    reward: 4.02,
    youtubeId: 'iOe6dI2JhgU',
    coverUrl: 'https://img.youtube.com/vi/iOe6dI2JhgU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-258',
    title: 'Diamonds',
    artist: 'Rihanna',
    reward: 2.84,
    youtubeId: 'lWA2pjMjpBs',
    coverUrl: 'https://img.youtube.com/vi/lWA2pjMjpBs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-259',
    title: 'Don\'t Let Me Down',
    artist: 'Daya',
    reward: 2.92,
    youtubeId: 'Io0fBr1XBUA',
    coverUrl: 'https://img.youtube.com/vi/Io0fBr1XBUA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-261',
    title: 'China',
    artist: 'Ozuna',
    reward: 3.2,
    youtubeId: '0VR3dfZf9Yg',
    coverUrl: 'https://img.youtube.com/vi/0VR3dfZf9Yg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-262',
    title: 'The Hills',
    artist: 'The Weeknd',
    reward: 3.17,
    youtubeId: 'yzTuBuRdAyA',
    coverUrl: 'https://img.youtube.com/vi/yzTuBuRdAyA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-264',
    title: 'Bang Bang',
    artist: 'Nicki Minaj',
    reward: 4.4,
    youtubeId: '0HDdjwpPM3Y',
    coverUrl: 'https://img.youtube.com/vi/0HDdjwpPM3Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-265',
    title: 'Somebody That I Used to Know',
    artist: 'Gotye',
    reward: 3.25,
    youtubeId: 'xOazTYPrt64',
    coverUrl: 'https://img.youtube.com/vi/xOazTYPrt64/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-267',
    title: 'Heathens',
    artist: 'Twenty One Pilots',
    reward: 2.85,
    youtubeId: 'UprcpdwuwCg',
    coverUrl: 'https://img.youtube.com/vi/UprcpdwuwCg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-268',
    title: 'Thunder',
    artist: 'Imagine Dragons',
    reward: 3.06,
    youtubeId: 'fKopy74weus',
    coverUrl: 'https://img.youtube.com/vi/fKopy74weus/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-270',
    title: 'Déjala Que Vuelva',
    artist: 'Piso 21',
    reward: 4.68,
    youtubeId: 'y7d9VLRO3vc',
    coverUrl: 'https://img.youtube.com/vi/y7d9VLRO3vc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-271',
    title: 'Love Yourself',
    artist: 'Justin Bieber',
    reward: 4.59,
    youtubeId: 'oyEuk8j8imI',
    coverUrl: 'https://img.youtube.com/vi/oyEuk8j8imI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-273',
    title: 'Swalla',
    artist: 'Ty Dolla Sign',
    reward: 2.38,
    youtubeId: 'NGLxoKOvzu4',
    coverUrl: 'https://img.youtube.com/vi/NGLxoKOvzu4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-274',
    title: 'Dusk Till Dawn',
    artist: 'Zayn Malik',
    reward: 4.77,
    youtubeId: 'tt2k8PGm-TI',
    coverUrl: 'https://img.youtube.com/vi/tt2k8PGm-TI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-276',
    title: 'November Rain',
    artist: 'Guns N\' Roses',
    reward: 4.39,
    youtubeId: 'rMY487y6YQI',
    coverUrl: 'https://img.youtube.com/vi/rMY487y6YQI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-277',
    title: 'El Farsante',
    artist: 'Ozuna',
    reward: 4.77,
    youtubeId: 'wfWkmURBNv8',
    coverUrl: 'https://img.youtube.com/vi/wfWkmURBNv8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-279',
    title: 'Andas en Mi Cabeza',
    artist: 'Chino & Nacho',
    reward: 2.82,
    youtubeId: 'AMTAQ-AJS4Y',
    coverUrl: 'https://img.youtube.com/vi/AMTAQ-AJS4Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-280',
    title: 'Thrift Shop',
    artist: 'Macklemore & Ryan Lewis',
    reward: 3.42,
    youtubeId: 'QK8mJJJvaes',
    coverUrl: 'https://img.youtube.com/vi/QK8mJJJvaes/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-282',
    title: 'Titanium',
    artist: 'Sia',
    reward: 4.43,
    youtubeId: 'i6jCqPvLdkU',
    coverUrl: 'https://img.youtube.com/vi/i6jCqPvLdkU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-283',
    title: 'Dance Monkey',
    artist: 'Tones and I',
    reward: 4.97,
    youtubeId: 'q0hyYWKXF0Q',
    coverUrl: 'https://img.youtube.com/vi/q0hyYWKXF0Q/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-285',
    title: 'Você Partiu Meu Coração',
    artist: 'Maluma',
    reward: 3.98,
    youtubeId: 'GmHrjFIWl6U',
    coverUrl: 'https://img.youtube.com/vi/GmHrjFIWl6U/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-286',
    title: 'I Like It',
    artist: 'Cardi B',
    reward: 3.59,
    youtubeId: 'xTlNMmZKwpA',
    coverUrl: 'https://img.youtube.com/vi/xTlNMmZKwpA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-288',
    title: 'I\'m the One',
    artist: 'Guyfour',
    reward: 4.18,
    youtubeId: 'weeI1G46q0o',
    coverUrl: 'https://img.youtube.com/vi/weeI1G46q0o/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-289',
    title: 'Animals',
    artist: 'Martin Garrix',
    reward: 2.1,
    youtubeId: 'gCYcHz2k5x0',
    coverUrl: 'https://img.youtube.com/vi/gCYcHz2k5x0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-291',
    title: 'Summer',
    artist: 'Calvin Harris',
    reward: 2.59,
    youtubeId: 'ebXbLfLACGM',
    coverUrl: 'https://img.youtube.com/vi/ebXbLfLACGM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-292',
    title: 'Me Rehúso',
    artist: 'Danny Ocean',
    reward: 4.46,
    youtubeId: 'aDCcLQto5BM',
    coverUrl: 'https://img.youtube.com/vi/aDCcLQto5BM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-294',
    title: 'Burn',
    artist: 'Ellie Goulding',
    reward: 4.94,
    youtubeId: 'CGyEd0aKWZE',
    coverUrl: 'https://img.youtube.com/vi/CGyEd0aKWZE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-295',
    title: 'Hey Mama',
    artist: 'Bebe Rexha',
    reward: 4.25,
    youtubeId: 'uO59tfQ2TbA',
    coverUrl: 'https://img.youtube.com/vi/uO59tfQ2TbA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-297',
    title: 'La bicicleta',
    artist: 'Carlos Vives',
    reward: 3.15,
    youtubeId: '-UV0QGLmYys',
    coverUrl: 'https://img.youtube.com/vi/-UV0QGLmYys/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-298',
    title: 'Hymn for the Weekend',
    artist: 'Beyoncé',
    reward: 3.84,
    youtubeId: 'YykjpeuMNEk',
    coverUrl: 'https://img.youtube.com/vi/YykjpeuMNEk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-300',
    title: 'Tusa',
    artist: 'Karol G',
    reward: 4.09,
    youtubeId: 'tbneQDc2H3I',
    coverUrl: 'https://img.youtube.com/vi/tbneQDc2H3I/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-301',
    title: 'Bad Blood',
    artist: 'Kendrick Lamar',
    reward: 3.62,
    youtubeId: 'QcIy9NiNbmo',
    coverUrl: 'https://img.youtube.com/vi/QcIy9NiNbmo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-303',
    title: 'Robarte un Beso',
    artist: 'None',
    reward: 3.14,
    youtubeId: 'Mtau4v6foHA',
    coverUrl: 'https://img.youtube.com/vi/Mtau4v6foHA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-304',
    title: 'Sunflower',
    artist: 'Swae Lee',
    reward: 3.02,
    youtubeId: 'ApXoWvfEYVU',
    coverUrl: 'https://img.youtube.com/vi/ApXoWvfEYVU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-306',
    title: 'Gentleman',
    artist: 'Psy',
    reward: 2.44,
    youtubeId: 'ASO_zypdnsQ',
    coverUrl: 'https://img.youtube.com/vi/ASO_zypdnsQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-307',
    title: '24K Magic',
    artist: 'Bruno Mars',
    reward: 2.13,
    youtubeId: 'UqyT8IEBkvY',
    coverUrl: 'https://img.youtube.com/vi/UqyT8IEBkvY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-309',
    title: 'Can\'t Stop the Feeling!',
    artist: 'Justin Timberlake',
    reward: 2.57,
    youtubeId: 'ru0K8uYEZWw',
    coverUrl: 'https://img.youtube.com/vi/ru0K8uYEZWw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-310',
    title: 'Can\'t Stop the Feeling!',
    artist: 'Justin Timberlake',
    reward: 4.53,
    youtubeId: 'QGeegGenTSw',
    coverUrl: 'https://img.youtube.com/vi/QGeegGenTSw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-312',
    title: 'Ahora dice',
    artist: 'Chris Jedi',
    reward: 3.0,
    youtubeId: 'c73Cu3TQnlg',
    coverUrl: 'https://img.youtube.com/vi/c73Cu3TQnlg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-313',
    title: 'Secreto',
    artist: 'Anuel AA',
    reward: 3.07,
    youtubeId: 'gFZfwWZV074',
    coverUrl: 'https://img.youtube.com/vi/gFZfwWZV074/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-315',
    title: 'Nothing Else Matters',
    artist: 'Metallica',
    reward: 4.38,
    youtubeId: 'tAGnKpE4NCI',
    coverUrl: 'https://img.youtube.com/vi/tAGnKpE4NCI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-316',
    title: 'I\'m Not the Only One',
    artist: 'Sam Smith',
    reward: 4.07,
    youtubeId: 'nCkpzqqog4k',
    coverUrl: 'https://img.youtube.com/vi/nCkpzqqog4k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-318',
    title: 'El Amante',
    artist: 'Nicky Jam',
    reward: 4.2,
    youtubeId: 'YG2p6XBuSKA',
    coverUrl: 'https://img.youtube.com/vi/YG2p6XBuSKA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-319',
    title: 'I Took a Pill in Ibiza',
    artist: 'SeeB',
    reward: 4.31,
    youtubeId: 'foE1mO2yM04',
    coverUrl: 'https://img.youtube.com/vi/foE1mO2yM04/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-321',
    title: 'I Took a Pill in Ibiza',
    artist: 'SeeB',
    reward: 4.13,
    youtubeId: '41GZVVcxQps',
    coverUrl: 'https://img.youtube.com/vi/41GZVVcxQps/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-322',
    title: 'El Perdón',
    artist: 'Nicky Jam',
    reward: 4.76,
    youtubeId: 'hXI8RQYC36Q',
    coverUrl: 'https://img.youtube.com/vi/hXI8RQYC36Q/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-324',
    title: 'Last Friday Night (T.G.I.F.)',
    artist: 'Katy Perry',
    reward: 4.48,
    youtubeId: 'KlyXNRrsk4A',
    coverUrl: 'https://img.youtube.com/vi/KlyXNRrsk4A/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-325',
    title: 'Súbeme La Radio',
    artist: 'Descemer Bueno',
    reward: 3.28,
    youtubeId: '9sg-A-eS6Ig',
    coverUrl: 'https://img.youtube.com/vi/9sg-A-eS6Ig/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-327',
    title: 'La Gozadera',
    artist: 'Gente de Zona',
    reward: 2.93,
    youtubeId: 'VMp55KH_3wo',
    coverUrl: 'https://img.youtube.com/vi/VMp55KH_3wo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-328',
    title: 'Can\'t Remember to Forget You',
    artist: 'Shakira',
    reward: 4.9,
    youtubeId: 'o3mP3mJDL2k',
    coverUrl: 'https://img.youtube.com/vi/o3mP3mJDL2k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-330',
    title: 'Can\'t Remember to Forget You',
    artist: 'Shakira',
    reward: 4.96,
    youtubeId: 'fWU3pEMPrHw',
    coverUrl: 'https://img.youtube.com/vi/fWU3pEMPrHw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-331',
    title: 'Timber',
    artist: 'Pitbull',
    reward: 2.43,
    youtubeId: 'hHUbLv4ThOo',
    coverUrl: 'https://img.youtube.com/vi/hHUbLv4ThOo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-333',
    title: 'Problem',
    artist: 'Iggy Azalea',
    reward: 3.22,
    youtubeId: 'iS1g8G_njx8',
    coverUrl: 'https://img.youtube.com/vi/iS1g8G_njx8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-334',
    title: 'God\'s Plan',
    artist: 'Drake',
    reward: 4.7,
    youtubeId: 'xpVfcZ0ZcFM',
    coverUrl: 'https://img.youtube.com/vi/xpVfcZ0ZcFM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-336',
    title: 'Just Give Me a Reason',
    artist: 'Nate Ruess',
    reward: 3.0,
    youtubeId: 'OpQFFLBMEPI',
    coverUrl: 'https://img.youtube.com/vi/OpQFFLBMEPI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-337',
    title: 'Human',
    artist: 'Rag\'n\'Bone Man',
    reward: 4.43,
    youtubeId: 'L3wKzyIN1yk',
    coverUrl: 'https://img.youtube.com/vi/L3wKzyIN1yk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-339',
    title: 'Say You Won\'t Let Go',
    artist: 'James Arthur',
    reward: 2.76,
    youtubeId: '0yW7w8F2TVA',
    coverUrl: 'https://img.youtube.com/vi/0yW7w8F2TVA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-340',
    title: 'Too Good at Goodbyes',
    artist: 'Sam Smith',
    reward: 2.52,
    youtubeId: 'J_ub7Etch2U',
    coverUrl: 'https://img.youtube.com/vi/J_ub7Etch2U/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-342',
    title: 'What Makes You Beautiful',
    artist: 'One Direction',
    reward: 2.43,
    youtubeId: 'QJO3ROT-A4E',
    coverUrl: 'https://img.youtube.com/vi/QJO3ROT-A4E/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-343',
    title: 'No Lie',
    artist: 'Dua Lipa',
    reward: 3.17,
    youtubeId: 'GzU8KqOY8YA',
    coverUrl: 'https://img.youtube.com/vi/GzU8KqOY8YA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-345',
    title: 'Look What You Made Me Do',
    artist: 'Taylor Swift',
    reward: 3.05,
    youtubeId: '3tmd-ClpJxA',
    coverUrl: 'https://img.youtube.com/vi/3tmd-ClpJxA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-346',
    title: 'Carmen centurion',
    artist: 'Charlie Puth',
    reward: 4.25,
    youtubeId: 'nfs8NYg7yQM',
    coverUrl: 'https://img.youtube.com/vi/nfs8NYg7yQM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-348',
    title: 'No me acuerdo',
    artist: 'Thalía',
    reward: 4.45,
    youtubeId: 'iQEVguV71sI',
    coverUrl: 'https://img.youtube.com/vi/iQEVguV71sI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-349',
    title: 'I\'m an Albatraoz',
    artist: 'AronChupa',
    reward: 2.63,
    youtubeId: 'Bznxx12Ptl0',
    coverUrl: 'https://img.youtube.com/vi/Bznxx12Ptl0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-351',
    title: 'El Perdedor',
    artist: 'Maluma',
    reward: 4.78,
    youtubeId: 'PJniSb91tvo',
    coverUrl: 'https://img.youtube.com/vi/PJniSb91tvo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-352',
    title: 'Sweet Child o\' Mine',
    artist: 'Guns N\' Roses',
    reward: 3.09,
    youtubeId: 'HlEuo9aR7Qo',
    coverUrl: 'https://img.youtube.com/vi/HlEuo9aR7Qo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-354',
    title: 'Darte un Beso',
    artist: 'Prince Royce',
    reward: 3.34,
    youtubeId: 'bdOXnTbyk0g',
    coverUrl: 'https://img.youtube.com/vi/bdOXnTbyk0g/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-355',
    title: 'Unforgettable',
    artist: 'Swae Lee',
    reward: 3.28,
    youtubeId: 'CTFtOOh47oo',
    coverUrl: 'https://img.youtube.com/vi/CTFtOOh47oo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-357',
    title: 'La Mordidita',
    artist: 'Yotuel Romero',
    reward: 4.16,
    youtubeId: 'lBztnahrOFw',
    coverUrl: 'https://img.youtube.com/vi/lBztnahrOFw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-358',
    title: 'Rap God',
    artist: 'Eminem',
    reward: 3.73,
    youtubeId: 'XbGs_qK2PQA',
    coverUrl: 'https://img.youtube.com/vi/XbGs_qK2PQA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-360',
    title: 'Lehenga',
    artist: 'Jass Manak',
    reward: 3.1,
    youtubeId: 'RKioDWlajvo',
    coverUrl: 'https://img.youtube.com/vi/RKioDWlajvo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-361',
    title: 'Boy with Luv',
    artist: 'Halsey',
    reward: 2.27,
    youtubeId: 'XsX3ATc3FbA',
    coverUrl: 'https://img.youtube.com/vi/XsX3ATc3FbA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-363',
    title: 'Boy with Luv',
    artist: 'Halsey',
    reward: 2.47,
    youtubeId: '62E_xyj_oDA',
    coverUrl: 'https://img.youtube.com/vi/62E_xyj_oDA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-364',
    title: 'Work',
    artist: 'Rihanna',
    reward: 2.18,
    youtubeId: 'HL1UzIK-flA',
    coverUrl: 'https://img.youtube.com/vi/HL1UzIK-flA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-366',
    title: 'Can\'t Feel My Face',
    artist: 'The Weeknd',
    reward: 2.58,
    youtubeId: 'KEI4qSrkPAs',
    coverUrl: 'https://img.youtube.com/vi/KEI4qSrkPAs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-367',
    title: 'In the End',
    artist: 'Linkin Park',
    reward: 3.17,
    youtubeId: 'eVTXPUF4Oz4',
    coverUrl: 'https://img.youtube.com/vi/eVTXPUF4Oz4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-369',
    title: 'Dare (La La La)',
    artist: 'Shakira',
    reward: 4.63,
    youtubeId: 'XkYAxGt-aUs',
    coverUrl: 'https://img.youtube.com/vi/XkYAxGt-aUs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-370',
    title: 'Dare (La La La)',
    artist: 'Shakira',
    reward: 3.84,
    youtubeId: '7-7knsP2n5w',
    coverUrl: 'https://img.youtube.com/vi/7-7knsP2n5w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-372',
    title: 'Adventure of a Lifetime',
    artist: 'Coldplay',
    reward: 4.83,
    youtubeId: 'QtXby3twMmI',
    coverUrl: 'https://img.youtube.com/vi/QtXby3twMmI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-373',
    title: 'Vaaste',
    artist: 'Dhvani Bhanushali',
    reward: 3.53,
    youtubeId: 'BBAyRBTfsOU',
    coverUrl: 'https://img.youtube.com/vi/BBAyRBTfsOU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-375',
    title: 'Mia',
    artist: 'Bad Bunny',
    reward: 4.4,
    youtubeId: 'OSUxrSe5GbI',
    coverUrl: 'https://img.youtube.com/vi/OSUxrSe5GbI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-376',
    title: 'Elastic Heart',
    artist: 'The Weeknd',
    reward: 3.48,
    youtubeId: 'KWZGAExj-es',
    coverUrl: 'https://img.youtube.com/vi/KWZGAExj-es/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-378',
    title: 'Taste',
    artist: 'Offset',
    reward: 4.35,
    youtubeId: 'LjxulQ1bEWg',
    coverUrl: 'https://img.youtube.com/vi/LjxulQ1bEWg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-379',
    title: 'Halo',
    artist: 'Beyoncé',
    reward: 4.86,
    youtubeId: 'bnVUHWCynig',
    coverUrl: 'https://img.youtube.com/vi/bnVUHWCynig/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-381',
    title: 'Do I Wanna Know?',
    artist: 'Arctic Monkeys',
    reward: 3.95,
    youtubeId: 'bpOSxM0rNPM',
    coverUrl: 'https://img.youtube.com/vi/bpOSxM0rNPM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-382',
    title: 'As If It\'s Your Last',
    artist: 'Blackpink',
    reward: 4.59,
    youtubeId: '9MbXeqCbS4Q',
    coverUrl: 'https://img.youtube.com/vi/9MbXeqCbS4Q/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-384',
    title: 'Kill This Love',
    artist: 'Blackpink',
    reward: 2.86,
    youtubeId: '2S24-y0Ij3Y',
    coverUrl: 'https://img.youtube.com/vi/2S24-y0Ij3Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-385',
    title: 'Lovely',
    artist: 'Billie Eilish',
    reward: 4.01,
    youtubeId: 'V1Pl8CzNzCw',
    coverUrl: 'https://img.youtube.com/vi/V1Pl8CzNzCw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-387',
    title: 'Ride',
    artist: 'Twenty One Pilots',
    reward: 4.88,
    youtubeId: 'Pw-0pbY9JeU',
    coverUrl: 'https://img.youtube.com/vi/Pw-0pbY9JeU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-388',
    title: 'Symphony',
    artist: 'Clean Bandit',
    reward: 4.9,
    youtubeId: 'aatr_2MstrI',
    coverUrl: 'https://img.youtube.com/vi/aatr_2MstrI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-390',
    title: 'Symphony',
    artist: 'Clean Bandit',
    reward: 3.72,
    youtubeId: '-SttFgyRNCI',
    coverUrl: 'https://img.youtube.com/vi/-SttFgyRNCI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-391',
    title: 'In da Club',
    artist: '50 Cent',
    reward: 4.63,
    youtubeId: '5qm8PH4xAss',
    coverUrl: 'https://img.youtube.com/vi/5qm8PH4xAss/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-393',
    title: '7 Years',
    artist: 'Lukas Graham',
    reward: 4.84,
    youtubeId: 'LHCob76kigA',
    coverUrl: 'https://img.youtube.com/vi/LHCob76kigA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-394',
    title: 'Happy',
    artist: 'Pharrell Williams',
    reward: 3.14,
    youtubeId: 'y6Sxv-sUYtM',
    coverUrl: 'https://img.youtube.com/vi/y6Sxv-sUYtM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-396',
    title: 'Bon Appétit',
    artist: 'Migos',
    reward: 3.67,
    youtubeId: 'dPI-mRFEIH0',
    coverUrl: 'https://img.youtube.com/vi/dPI-mRFEIH0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-397',
    title: 'Nena maldición',
    artist: 'Paulo Londra',
    reward: 2.82,
    youtubeId: 'bX3S-_jUauc',
    coverUrl: 'https://img.youtube.com/vi/bX3S-_jUauc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-399',
    title: 'Photograph',
    artist: 'Ed Sheeran',
    reward: 4.06,
    youtubeId: 'nSDgHBxUbVQ',
    coverUrl: 'https://img.youtube.com/vi/nSDgHBxUbVQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-400',
    title: 'Limbo',
    artist: 'Daddy Yankee',
    reward: 3.46,
    youtubeId: '6BTjG-dhf5s',
    coverUrl: 'https://img.youtube.com/vi/6BTjG-dhf5s/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-402',
    title: 'Break Free',
    artist: 'Ariana Grande',
    reward: 4.34,
    youtubeId: 'L8eRzOYhLuw',
    coverUrl: 'https://img.youtube.com/vi/L8eRzOYhLuw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-403',
    title: 'I Will Always Love You',
    artist: 'Whitney Houston',
    reward: 4.66,
    youtubeId: '3JWTaaS7LdU',
    coverUrl: 'https://img.youtube.com/vi/3JWTaaS7LdU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-405',
    title: 'Gucci Gang',
    artist: 'Lil Pump',
    reward: 3.24,
    youtubeId: '4LfJnj66HVQ',
    coverUrl: 'https://img.youtube.com/vi/4LfJnj66HVQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-406',
    title: 'Cheerleader',
    artist: 'Felix Jaehn',
    reward: 4.73,
    youtubeId: 'jGflUbPQfW8',
    coverUrl: 'https://img.youtube.com/vi/jGflUbPQfW8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-408',
    title: 'Cheerleader',
    artist: 'Felix Jaehn',
    reward: 4.72,
    youtubeId: 'I_NVUZNsh2E',
    coverUrl: 'https://img.youtube.com/vi/I_NVUZNsh2E/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-409',
    title: 'Gangsta\'s Paradise',
    artist: 'L.V.',
    reward: 2.91,
    youtubeId: '6-IRnDofg6Y',
    coverUrl: 'https://img.youtube.com/vi/6-IRnDofg6Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-411',
    title: 'Gangsta\'s Paradise',
    artist: 'L.V.',
    reward: 3.06,
    youtubeId: 'SQCSxqScSVQ',
    coverUrl: 'https://img.youtube.com/vi/SQCSxqScSVQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-412',
    title: 'Gangsta\'s Paradise',
    artist: 'L.V.',
    reward: 4.87,
    youtubeId: 'fPO76Jlnz6c',
    coverUrl: 'https://img.youtube.com/vi/fPO76Jlnz6c/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-414',
    title: 'Stay with Me',
    artist: 'Sam Smith',
    reward: 4.99,
    youtubeId: 'pB-5XG-DbAA',
    coverUrl: 'https://img.youtube.com/vi/pB-5XG-DbAA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-415',
    title: 'Rain Over Me',
    artist: 'Pitbull',
    reward: 4.42,
    youtubeId: 'SmM0653YvXU',
    coverUrl: 'https://img.youtube.com/vi/SmM0653YvXU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-417',
    title: 'Shallow',
    artist: 'Bradley Cooper',
    reward: 4.71,
    youtubeId: 'bo_efYhYU2A',
    coverUrl: 'https://img.youtube.com/vi/bo_efYhYU2A/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-418',
    title: 'Culpables',
    artist: 'Anuel AA',
    reward: 2.68,
    youtubeId: 'xfdG6vwIGGU',
    coverUrl: 'https://img.youtube.com/vi/xfdG6vwIGGU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-420',
    title: 'El Perdedor',
    artist: 'Enrique Iglesias',
    reward: 2.06,
    youtubeId: 'tLcfAnN2QgY',
    coverUrl: 'https://img.youtube.com/vi/tLcfAnN2QgY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-421',
    title: 'Don\'t Speak',
    artist: 'No Doubt',
    reward: 3.22,
    youtubeId: 'TR3Vdo5etCQ',
    coverUrl: 'https://img.youtube.com/vi/TR3Vdo5etCQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-423',
    title: 'La La La',
    artist: 'Sam Smith',
    reward: 4.71,
    youtubeId: '3O1_3zBUKM8',
    coverUrl: 'https://img.youtube.com/vi/3O1_3zBUKM8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-424',
    title: 'Vaina loca',
    artist: 'Ozuna',
    reward: 3.55,
    youtubeId: 'bx-fuY7LpSU',
    coverUrl: 'https://img.youtube.com/vi/bx-fuY7LpSU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-426',
    title: 'Loyal',
    artist: 'Tyga',
    reward: 3.68,
    youtubeId: 'JXRN_LkCa_o',
    coverUrl: 'https://img.youtube.com/vi/JXRN_LkCa_o/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-427',
    title: 'Sexy and I Know It',
    artist: 'LMFAO',
    reward: 3.75,
    youtubeId: 'w8aKNmy04Pc',
    coverUrl: 'https://img.youtube.com/vi/w8aKNmy04Pc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-429',
    title: 'Sexy and I Know It',
    artist: 'LMFAO',
    reward: 2.9,
    youtubeId: 'wyx6JDQCslE',
    coverUrl: 'https://img.youtube.com/vi/wyx6JDQCslE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-430',
    title: 'Pillowtalk',
    artist: 'Zayn Malik',
    reward: 4.28,
    youtubeId: 'C_3d6GntKbk',
    coverUrl: 'https://img.youtube.com/vi/C_3d6GntKbk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-432',
    title: 'Bad and Boujee',
    artist: 'Migos',
    reward: 2.03,
    youtubeId: 'S-sJp1FfG7Q',
    coverUrl: 'https://img.youtube.com/vi/S-sJp1FfG7Q/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-433',
    title: 'Boombayah',
    artist: 'Blackpink',
    reward: 4.25,
    youtubeId: 'bwmSjveL3Lc',
    coverUrl: 'https://img.youtube.com/vi/bwmSjveL3Lc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-435',
    title: 'Chop Suey!',
    artist: 'System of a Down',
    reward: 3.26,
    youtubeId: 'CSvFpBOe8eY',
    coverUrl: 'https://img.youtube.com/vi/CSvFpBOe8eY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-436',
    title: 'Turn Down for What',
    artist: 'DJ Snake',
    reward: 3.9,
    youtubeId: 'HMUDVMiITOU',
    coverUrl: 'https://img.youtube.com/vi/HMUDVMiITOU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-438',
    title: 'Fancy',
    artist: 'Iggy Azalea',
    reward: 2.24,
    youtubeId: 'O-zpOMYRi0w',
    coverUrl: 'https://img.youtube.com/vi/O-zpOMYRi0w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-439',
    title: 'Hot n Cold',
    artist: 'Katy Perry',
    reward: 3.02,
    youtubeId: 'kTHNpusq654',
    coverUrl: 'https://img.youtube.com/vi/kTHNpusq654/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-441',
    title: 'Sin Contrato',
    artist: 'Maluma',
    reward: 4.81,
    youtubeId: '9xByMBYDRmY',
    coverUrl: 'https://img.youtube.com/vi/9xByMBYDRmY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-442',
    title: 'Sicko Mode',
    artist: 'Travis Scott',
    reward: 2.81,
    youtubeId: '6ONRf7h3Mdk',
    coverUrl: 'https://img.youtube.com/vi/6ONRf7h3Mdk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-444',
    title: 'Duele El Corazon',
    artist: 'Enrique Iglesias',
    reward: 4.37,
    youtubeId: 'xFutjZEBTXs',
    coverUrl: 'https://img.youtube.com/vi/xFutjZEBTXs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-445',
    title: 'The Scientist',
    artist: 'Coldplay',
    reward: 2.45,
    youtubeId: 'RB-RcX5DS5A',
    coverUrl: 'https://img.youtube.com/vi/RB-RcX5DS5A/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-447',
    title: 'Grenade',
    artist: 'Bruno Mars',
    reward: 4.11,
    youtubeId: 'SR6iYWJxHqs',
    coverUrl: 'https://img.youtube.com/vi/SR6iYWJxHqs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-448',
    title: 'Cold Water',
    artist: 'MØ',
    reward: 2.17,
    youtubeId: 'a59gmGkq_pw',
    coverUrl: 'https://img.youtube.com/vi/a59gmGkq_pw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-450',
    title: 'Wild Thoughts',
    artist: 'Bryson Tiller',
    reward: 3.1,
    youtubeId: 'fyaI4-5849w',
    coverUrl: 'https://img.youtube.com/vi/fyaI4-5849w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-451',
    title: 'Anaconda',
    artist: 'Nicki Minaj',
    reward: 4.46,
    youtubeId: 'LDZX4ooRsWs',
    coverUrl: 'https://img.youtube.com/vi/LDZX4ooRsWs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-453',
    title: 'When I Was Your Man',
    artist: 'Bruno Mars',
    reward: 3.21,
    youtubeId: 'ekzHIouo8Q4',
    coverUrl: 'https://img.youtube.com/vi/ekzHIouo8Q4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-454',
    title: 'No Tears Left to Cry',
    artist: 'Ariana Grande',
    reward: 3.98,
    youtubeId: 'ffxKSjUwKdU',
    coverUrl: 'https://img.youtube.com/vi/ffxKSjUwKdU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-456',
    title: 'Locked Away',
    artist: 'R. City',
    reward: 2.06,
    youtubeId: '6GUm5g8SG4o',
    coverUrl: 'https://img.youtube.com/vi/6GUm5g8SG4o/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-457',
    title: 'Locked Away',
    artist: 'R. City',
    reward: 4.11,
    youtubeId: 'YQY9BZBrZds',
    coverUrl: 'https://img.youtube.com/vi/YQY9BZBrZds/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-459',
    title: 'How You Like That',
    artist: 'Blackpink',
    reward: 2.19,
    youtubeId: 'ioNng23DkIM',
    coverUrl: 'https://img.youtube.com/vi/ioNng23DkIM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-460',
    title: 'Borró cassette',
    artist: 'Maluma',
    reward: 4.79,
    youtubeId: 'Xk0wdDTTPA0',
    coverUrl: 'https://img.youtube.com/vi/Xk0wdDTTPA0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-462',
    title: 'Meant to Be',
    artist: 'Bebe Rexha',
    reward: 4.22,
    youtubeId: 'zDo0H8Fm7d0',
    coverUrl: 'https://img.youtube.com/vi/zDo0H8Fm7d0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-463',
    title: 'Ai Se Eu Te Pego',
    artist: 'Cangaia de Jegue',
    reward: 4.73,
    youtubeId: 'hcm55lU9knw',
    coverUrl: 'https://img.youtube.com/vi/hcm55lU9knw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-465',
    title: 'Me Voy Enamorando',
    artist: 'Chino & Nacho',
    reward: 2.43,
    youtubeId: '0yr75-gxVtM',
    coverUrl: 'https://img.youtube.com/vi/0yr75-gxVtM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-466',
    title: 'Bodak Yellow',
    artist: 'Cardi B',
    reward: 2.91,
    youtubeId: 'PEGccV-NOm8',
    coverUrl: 'https://img.youtube.com/vi/PEGccV-NOm8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-468',
    title: 'There\'s Nothing Holdin\' Me Back',
    artist: 'Shawn Mendes',
    reward: 2.66,
    youtubeId: 'dT2owtxkU8k',
    coverUrl: 'https://img.youtube.com/vi/dT2owtxkU8k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-469',
    title: 'We Found Love',
    artist: 'Calvin Harris',
    reward: 2.97,
    youtubeId: 'tg00YEETFzg',
    coverUrl: 'https://img.youtube.com/vi/tg00YEETFzg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-471',
    title: 'Havana',
    artist: 'Young Thug',
    reward: 4.39,
    youtubeId: 'BQ0mxQXmLsk',
    coverUrl: 'https://img.youtube.com/vi/BQ0mxQXmLsk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-472',
    title: 'Let Me Love You',
    artist: 'DJ Snake',
    reward: 2.37,
    youtubeId: 'euCqAq6BRa4',
    coverUrl: 'https://img.youtube.com/vi/euCqAq6BRa4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-474',
    title: 'Fefe',
    artist: '6ix9ine',
    reward: 3.77,
    youtubeId: 'V_MXGdSBbAI',
    coverUrl: 'https://img.youtube.com/vi/V_MXGdSBbAI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-475',
    title: 'Filhall',
    artist: 'B Praak',
    reward: 3.53,
    youtubeId: 'hMy5za-m5Ew',
    coverUrl: 'https://img.youtube.com/vi/hMy5za-m5Ew/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-477',
    title: 'Wide Awake',
    artist: 'Katy Perry',
    reward: 4.59,
    youtubeId: 'k0BWlvnBmIE',
    coverUrl: 'https://img.youtube.com/vi/k0BWlvnBmIE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-478',
    title: 'El makinón',
    artist: 'Mariah Angeliq',
    reward: 3.34,
    youtubeId: '2jYEz66J_J4',
    coverUrl: 'https://img.youtube.com/vi/2jYEz66J_J4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-480',
    title: 'Lahore',
    artist: 'Guru Randhawa',
    reward: 4.48,
    youtubeId: 'dZ0fwJojhrs',
    coverUrl: 'https://img.youtube.com/vi/dZ0fwJojhrs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-481',
    title: 'Boomerang',
    artist: 'JoJo Siwa',
    reward: 3.23,
    youtubeId: 'ypPSrRYOAj4',
    coverUrl: 'https://img.youtube.com/vi/ypPSrRYOAj4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-483',
    title: 'Safari (J Balvin song)',
    artist: 'J Balvin',
    reward: 3.41,
    youtubeId: 'JWESLtAKKlU',
    coverUrl: 'https://img.youtube.com/vi/JWESLtAKKlU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-484',
    title: 'Dilemma',
    artist: 'Nelly',
    reward: 4.54,
    youtubeId: '8WYHDfJDPDc',
    coverUrl: 'https://img.youtube.com/vi/8WYHDfJDPDc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-486',
    title: 'Drag Me Down',
    artist: 'One Direction',
    reward: 2.13,
    youtubeId: 'Jwgf3wmiA04',
    coverUrl: 'https://img.youtube.com/vi/Jwgf3wmiA04/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-487',
    title: 'Focus',
    artist: 'Jamie Foxx',
    reward: 3.01,
    youtubeId: 'lf_wVfwpfp8',
    coverUrl: 'https://img.youtube.com/vi/lf_wVfwpfp8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-489',
    title: 'One More Night',
    artist: 'Maroon 5',
    reward: 3.48,
    youtubeId: 'fwK7ggA3-bU',
    coverUrl: 'https://img.youtube.com/vi/fwK7ggA3-bU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-490',
    title: 'We Can\'t Stop',
    artist: 'Miley Cyrus',
    reward: 3.95,
    youtubeId: 'LrUvu1mlWco',
    coverUrl: 'https://img.youtube.com/vi/LrUvu1mlWco/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-492',
    title: '23',
    artist: 'Mike WiLL Made-It',
    reward: 3.04,
    youtubeId: 'bbEoRnaOIbs',
    coverUrl: 'https://img.youtube.com/vi/bbEoRnaOIbs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-493',
    title: 'Pink Venom',
    artist: 'Blackpink',
    reward: 2.39,
    youtubeId: '3or3dp3qNQU',
    coverUrl: 'https://img.youtube.com/vi/3or3dp3qNQU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-495',
    title: 'Pink Venom',
    artist: 'Blackpink',
    reward: 2.52,
    youtubeId: '4N15045PHEA',
    coverUrl: 'https://img.youtube.com/vi/4N15045PHEA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-496',
    title: 'Pink Venom',
    artist: 'Blackpink',
    reward: 2.65,
    youtubeId: 'gQlMMD8auMs',
    coverUrl: 'https://img.youtube.com/vi/gQlMMD8auMs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-498',
    title: 'Pink Venom',
    artist: 'Blackpink',
    reward: 2.25,
    youtubeId: 'C8YDXGL-v7w',
    coverUrl: 'https://img.youtube.com/vi/C8YDXGL-v7w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-499',
    title: 'Wiggle',
    artist: 'Jason Derulo',
    reward: 4.04,
    youtubeId: 'hiP14ED28CA',
    coverUrl: 'https://img.youtube.com/vi/hiP14ED28CA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-501',
    title: 'Fake Love',
    artist: 'None',
    reward: 3.99,
    youtubeId: '_mkeISN9vRY',
    coverUrl: 'https://img.youtube.com/vi/_mkeISN9vRY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-502',
    title: 'Fake Love',
    artist: 'None',
    reward: 2.36,
    youtubeId: 'D_6QmL6rExk',
    coverUrl: 'https://img.youtube.com/vi/D_6QmL6rExk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-504',
    title: 'Fake Love',
    artist: 'None',
    reward: 2.14,
    youtubeId: '7C2z4GqqS5E',
    coverUrl: 'https://img.youtube.com/vi/7C2z4GqqS5E/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-505',
    title: 'Rolex',
    artist: 'Ayo & Teo',
    reward: 4.89,
    youtubeId: 'lwk5OUII9Vc',
    coverUrl: 'https://img.youtube.com/vi/lwk5OUII9Vc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-507',
    title: 'Story of My Life',
    artist: 'One Direction',
    reward: 3.86,
    youtubeId: 'W-TE_Ys4iwM',
    coverUrl: 'https://img.youtube.com/vi/W-TE_Ys4iwM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-508',
    title: 'Adán y Eva',
    artist: 'Paulo Londra',
    reward: 4.83,
    youtubeId: 'aSjflT_J0Xo',
    coverUrl: 'https://img.youtube.com/vi/aSjflT_J0Xo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-510',
    title: 'Mic Drop',
    artist: 'BTS',
    reward: 2.36,
    youtubeId: '8mBHDHIb-kM',
    coverUrl: 'https://img.youtube.com/vi/8mBHDHIb-kM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-511',
    title: 'Mic Drop',
    artist: 'BTS',
    reward: 3.91,
    youtubeId: 'kTlv5_Bs8aw',
    coverUrl: 'https://img.youtube.com/vi/kTlv5_Bs8aw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-513',
    title: 'Mic Drop',
    artist: 'BTS',
    reward: 3.84,
    youtubeId: 'TxyHwwYe86Q',
    coverUrl: 'https://img.youtube.com/vi/TxyHwwYe86Q/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-514',
    title: 'The Spectre',
    artist: 'Alan Walker',
    reward: 3.02,
    youtubeId: 'wJnBTPUQS5A',
    coverUrl: 'https://img.youtube.com/vi/wJnBTPUQS5A/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-516',
    title: 'Demons',
    artist: 'Imagine Dragons',
    reward: 4.37,
    youtubeId: 'mWRsgZuwf_8',
    coverUrl: 'https://img.youtube.com/vi/mWRsgZuwf_8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-517',
    title: 'The Monster',
    artist: 'Rihanna',
    reward: 4.73,
    youtubeId: 'EHkozMIXZ8w',
    coverUrl: 'https://img.youtube.com/vi/EHkozMIXZ8w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-519',
    title: 'Idol',
    artist: 'BTS',
    reward: 2.0,
    youtubeId: 'pBuZEGYXA6E',
    coverUrl: 'https://img.youtube.com/vi/pBuZEGYXA6E/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-520',
    title: 'Idol',
    artist: 'BTS',
    reward: 4.34,
    youtubeId: 'LfgXdDaryBE',
    coverUrl: 'https://img.youtube.com/vi/LfgXdDaryBE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-522',
    title: 'Idol',
    artist: 'BTS',
    reward: 2.03,
    youtubeId: 'K1scjjbfNsk',
    coverUrl: 'https://img.youtube.com/vi/K1scjjbfNsk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-523',
    title: 'Ritmo (Bad Boys for Life)',
    artist: 'Black Eyed Peas',
    reward: 3.99,
    youtubeId: 'EzKkl64rRbM',
    coverUrl: 'https://img.youtube.com/vi/EzKkl64rRbM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-525',
    title: 'We Are Young',
    artist: 'Fun',
    reward: 2.08,
    youtubeId: 'Sv6dMFF_yts',
    coverUrl: 'https://img.youtube.com/vi/Sv6dMFF_yts/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-526',
    title: 'Can\'t Hold Us',
    artist: 'Macklemore & Ryan Lewis',
    reward: 3.93,
    youtubeId: '2zNSgSzhBfM',
    coverUrl: 'https://img.youtube.com/vi/2zNSgSzhBfM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-528',
    title: 'Part of Me',
    artist: 'Katy Perry',
    reward: 3.26,
    youtubeId: 'uuwfgXD8qV8',
    coverUrl: 'https://img.youtube.com/vi/uuwfgXD8qV8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-529',
    title: 'Ahora Me Llama',
    artist: 'Karol G',
    reward: 4.38,
    youtubeId: '4NNRy_Wz16k',
    coverUrl: 'https://img.youtube.com/vi/4NNRy_Wz16k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-531',
    title: 'The Heart Wants What It Wants',
    artist: 'Selena Gomez',
    reward: 3.2,
    youtubeId: 'ij_0p_6qTss',
    coverUrl: 'https://img.youtube.com/vi/ij_0p_6qTss/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-532',
    title: 'Solo',
    artist: 'Clean Bandit',
    reward: 4.83,
    youtubeId: '8JnfIa84TnU',
    coverUrl: 'https://img.youtube.com/vi/8JnfIa84TnU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-534',
    title: 'What\'s My Name?',
    artist: 'Drake',
    reward: 2.89,
    youtubeId: 'U0CGsw6h60k',
    coverUrl: 'https://img.youtube.com/vi/U0CGsw6h60k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-535',
    title: 'Perdón, perdón',
    artist: 'Ha*Ash',
    reward: 3.76,
    youtubeId: '_wL3Pc-EmjA',
    coverUrl: 'https://img.youtube.com/vi/_wL3Pc-EmjA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-537',
    title: 'Into You',
    artist: 'Ariana Grande',
    reward: 2.37,
    youtubeId: '1ekZEVeXwek',
    coverUrl: 'https://img.youtube.com/vi/1ekZEVeXwek/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-538',
    title: 'Psycho',
    artist: 'Post Malone',
    reward: 3.87,
    youtubeId: 'au2n7VVGv_c',
    coverUrl: 'https://img.youtube.com/vi/au2n7VVGv_c/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-540',
    title: 'Royals',
    artist: 'Lorde',
    reward: 4.09,
    youtubeId: 'LFasFq4GJYM',
    coverUrl: 'https://img.youtube.com/vi/LFasFq4GJYM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-541',
    title: 'Royals',
    artist: 'Lorde',
    reward: 3.84,
    youtubeId: 'nlcIKh6sBtc',
    coverUrl: 'https://img.youtube.com/vi/nlcIKh6sBtc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-543',
    title: 'Scream & Shout',
    artist: 'will.i.am',
    reward: 4.22,
    youtubeId: 'kYtGl1dX5qI',
    coverUrl: 'https://img.youtube.com/vi/kYtGl1dX5qI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-544',
    title: 'Scream & Shout',
    artist: 'will.i.am',
    reward: 3.0,
    youtubeId: 'lEKOWKcUxdU',
    coverUrl: 'https://img.youtube.com/vi/lEKOWKcUxdU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-546',
    title: 'Friends',
    artist: 'Marshmello',
    reward: 4.04,
    youtubeId: 'jzD_yyEcp0M',
    coverUrl: 'https://img.youtube.com/vi/jzD_yyEcp0M/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-547',
    title: 'Rockstar',
    artist: '21 Savage',
    reward: 3.52,
    youtubeId: 'UceaB4D0jpo',
    coverUrl: 'https://img.youtube.com/vi/UceaB4D0jpo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-549',
    title: 'Levitating',
    artist: 'Megan Thee Stallion',
    reward: 2.14,
    youtubeId: 'TUVcZfQe-Kw',
    coverUrl: 'https://img.youtube.com/vi/TUVcZfQe-Kw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-550',
    title: 'Levitating',
    artist: 'Megan Thee Stallion',
    reward: 2.85,
    youtubeId: 'R6I7keZgoHc',
    coverUrl: 'https://img.youtube.com/vi/R6I7keZgoHc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-552',
    title: 'Levitating',
    artist: 'Megan Thee Stallion',
    reward: 3.73,
    youtubeId: 'E3tCHMagPOY',
    coverUrl: 'https://img.youtube.com/vi/E3tCHMagPOY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-553',
    title: 'Levitating',
    artist: 'Megan Thee Stallion',
    reward: 3.66,
    youtubeId: 'WHuBW3qKm9g',
    coverUrl: 'https://img.youtube.com/vi/WHuBW3qKm9g/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-555',
    title: 'Levitating',
    artist: 'Megan Thee Stallion',
    reward: 3.58,
    youtubeId: 'N000qglmmY0',
    coverUrl: 'https://img.youtube.com/vi/N000qglmmY0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-556',
    title: 'Perro Fiel',
    artist: 'Shakira',
    reward: 3.05,
    youtubeId: 'SHq2qrFUlGY',
    coverUrl: 'https://img.youtube.com/vi/SHq2qrFUlGY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-558',
    title: 'Ginza',
    artist: 'J Balvin',
    reward: 4.41,
    youtubeId: 'zZjSX01P5dE',
    coverUrl: 'https://img.youtube.com/vi/zZjSX01P5dE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-559',
    title: 'Adrenalina',
    artist: 'Jennifer Lopez',
    reward: 2.56,
    youtubeId: 'ME2Hufquz0k',
    coverUrl: 'https://img.youtube.com/vi/ME2Hufquz0k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-561',
    title: 'Black Beatles',
    artist: 'Rae Sremmurd',
    reward: 3.32,
    youtubeId: 'b8m9zhNAgKs',
    coverUrl: 'https://img.youtube.com/vi/b8m9zhNAgKs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-562',
    title: 'Sign of the Times',
    artist: 'Harry Styles',
    reward: 3.84,
    youtubeId: 'qN4ooNx77u0',
    coverUrl: 'https://img.youtube.com/vi/qN4ooNx77u0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-564',
    title: 'Waiting for Love',
    artist: 'Avicii',
    reward: 3.58,
    youtubeId: 'cHHLHGNpCSA',
    coverUrl: 'https://img.youtube.com/vi/cHHLHGNpCSA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-565',
    title: 'Boyfriend',
    artist: 'Justin Bieber',
    reward: 3.47,
    youtubeId: '4GuqB1BQVr4',
    coverUrl: 'https://img.youtube.com/vi/4GuqB1BQVr4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-567',
    title: 'Mirrors',
    artist: 'Justin Timberlake',
    reward: 2.82,
    youtubeId: 'uuZE_IRwLNI',
    coverUrl: 'https://img.youtube.com/vi/uuZE_IRwLNI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-568',
    title: 'Don\'t Stop Me Now',
    artist: 'Queen',
    reward: 4.52,
    youtubeId: 'HgzGwKwLmgM',
    coverUrl: 'https://img.youtube.com/vi/HgzGwKwLmgM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-570',
    title: 'No Type',
    artist: 'Rae Sremmurd',
    reward: 3.04,
    youtubeId: 'wzMrK-aGCug',
    coverUrl: 'https://img.youtube.com/vi/wzMrK-aGCug/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-571',
    title: 'The One That Got Away',
    artist: 'B.o.B',
    reward: 3.09,
    youtubeId: 'Ahha3Cqe_fk',
    coverUrl: 'https://img.youtube.com/vi/Ahha3Cqe_fk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-573',
    title: 'Love Me Again',
    artist: 'John Newman',
    reward: 4.21,
    youtubeId: 'CfihYWRWRTQ',
    coverUrl: 'https://img.youtube.com/vi/CfihYWRWRTQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-574',
    title: 'Love Me Again',
    artist: 'John Newman',
    reward: 3.16,
    youtubeId: 'j4-Gt6dUVj0',
    coverUrl: 'https://img.youtube.com/vi/j4-Gt6dUVj0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-576',
    title: 'Sensualidad',
    artist: 'Bad Bunny',
    reward: 3.44,
    youtubeId: 'ovX1HloCgdA',
    coverUrl: 'https://img.youtube.com/vi/ovX1HloCgdA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-577',
    title: 'Only Girl (In the World)',
    artist: 'Rihanna',
    reward: 3.42,
    youtubeId: 'pa14VNsdSYM',
    coverUrl: 'https://img.youtube.com/vi/pa14VNsdSYM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-579',
    title: 'Losing My Religion',
    artist: 'R.E.M.',
    reward: 2.89,
    youtubeId: 'xwtdhWltSIg',
    coverUrl: 'https://img.youtube.com/vi/xwtdhWltSIg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-580',
    title: 'I Feel It Coming',
    artist: 'The Weeknd',
    reward: 4.83,
    youtubeId: 'qFLhGq0060w',
    coverUrl: 'https://img.youtube.com/vi/qFLhGq0060w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-582',
    title: 'BonBon',
    artist: 'Era Istrefi',
    reward: 2.03,
    youtubeId: 'cedoBlUvBlI',
    coverUrl: 'https://img.youtube.com/vi/cedoBlUvBlI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-583',
    title: 'Yonaguni',
    artist: 'Bad Bunny',
    reward: 3.19,
    youtubeId: 'doLMt10ytHY',
    coverUrl: 'https://img.youtube.com/vi/doLMt10ytHY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-585',
    title: 'Californication',
    artist: 'Red Hot Chili Peppers',
    reward: 2.0,
    youtubeId: 'KTxBosSzQ8U',
    coverUrl: 'https://img.youtube.com/vi/KTxBosSzQ8U/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-586',
    title: 'Californication',
    artist: 'Red Hot Chili Peppers',
    reward: 2.01,
    youtubeId: 'YlUKcNNmywk',
    coverUrl: 'https://img.youtube.com/vi/YlUKcNNmywk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-588',
    title: 'They Don\'t Care About Us',
    artist: 'Michael Jackson',
    reward: 4.88,
    youtubeId: 'QNJL6nfu__Q',
    coverUrl: 'https://img.youtube.com/vi/QNJL6nfu__Q/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-589',
    title: 'Say My Name',
    artist: 'Bebe Rexha',
    reward: 3.22,
    youtubeId: 'ft4jcPSLJfY',
    coverUrl: 'https://img.youtube.com/vi/ft4jcPSLJfY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-591',
    title: 'Say My Name',
    artist: 'Bebe Rexha',
    reward: 4.15,
    youtubeId: 'fM-7nvr1QVU',
    coverUrl: 'https://img.youtube.com/vi/fM-7nvr1QVU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-592',
    title: 'I Need Your Love',
    artist: 'Calvin Harris',
    reward: 2.55,
    youtubeId: 'AtKZKl7Bgu0',
    coverUrl: 'https://img.youtube.com/vi/AtKZKl7Bgu0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-594',
    title: 'Papaoutai',
    artist: 'Stromae',
    reward: 4.37,
    youtubeId: 'oiKj0Z_Xnjc',
    coverUrl: 'https://img.youtube.com/vi/oiKj0Z_Xnjc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-595',
    title: 'Ain\'t Your Mama',
    artist: 'Jennifer Lopez',
    reward: 2.14,
    youtubeId: 'Pgmx7z49OEk',
    coverUrl: 'https://img.youtube.com/vi/Pgmx7z49OEk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-597',
    title: 'Man Down',
    artist: 'Rihanna',
    reward: 2.52,
    youtubeId: 'sEhy-RXkNo0',
    coverUrl: 'https://img.youtube.com/vi/sEhy-RXkNo0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-598',
    title: 'Black Magic',
    artist: 'Little Mix',
    reward: 2.74,
    youtubeId: 'MkElfR_NPBI',
    coverUrl: 'https://img.youtube.com/vi/MkElfR_NPBI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-600',
    title: 'Happier',
    artist: 'Marshmello',
    reward: 4.92,
    youtubeId: 'm7Bc3pLyij0',
    coverUrl: 'https://img.youtube.com/vi/m7Bc3pLyij0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-601',
    title: 'Like a Stone',
    artist: 'Audioslave',
    reward: 4.45,
    youtubeId: '7QU1nvuxaMA',
    coverUrl: 'https://img.youtube.com/vi/7QU1nvuxaMA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-603',
    title: 'Genda Phool',
    artist: 'Badshah',
    reward: 4.04,
    youtubeId: 'SD4Z8dlZPd8',
    coverUrl: 'https://img.youtube.com/vi/SD4Z8dlZPd8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-604',
    title: 'Me Enamoré',
    artist: 'Shakira',
    reward: 2.48,
    youtubeId: 'sPTn0QEhxds',
    coverUrl: 'https://img.youtube.com/vi/sPTn0QEhxds/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-606',
    title: 'We Are One (Ole Ola)',
    artist: 'Pitbull',
    reward: 3.94,
    youtubeId: 'TGtWWb9emYI',
    coverUrl: 'https://img.youtube.com/vi/TGtWWb9emYI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-607',
    title: 'Humble',
    artist: 'Kendrick Lamar',
    reward: 4.82,
    youtubeId: 'tvTRZJ-4EyI',
    coverUrl: 'https://img.youtube.com/vi/tvTRZJ-4EyI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-609',
    title: 'Un-Break My Heart',
    artist: 'Toni Braxton',
    reward: 4.18,
    youtubeId: 'p2Rch6WvPJE',
    coverUrl: 'https://img.youtube.com/vi/p2Rch6WvPJE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-610',
    title: 'Post to Be',
    artist: 'Jhené Aiko',
    reward: 3.01,
    youtubeId: 'aPxVSCfoYnU',
    coverUrl: 'https://img.youtube.com/vi/aPxVSCfoYnU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-612',
    title: 'International Love',
    artist: 'Pitbull',
    reward: 4.39,
    youtubeId: 'CdXesX6mYUE',
    coverUrl: 'https://img.youtube.com/vi/CdXesX6mYUE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-613',
    title: 'This Is America',
    artist: 'Donald Glover',
    reward: 2.75,
    youtubeId: 'VYOjWnS4cMY',
    coverUrl: 'https://img.youtube.com/vi/VYOjWnS4cMY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-615',
    title: 'Firestone',
    artist: 'Conrad Sewell',
    reward: 4.44,
    youtubeId: '9Sc-ir2UwGU',
    coverUrl: 'https://img.youtube.com/vi/9Sc-ir2UwGU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-616',
    title: 'This Is How We Do',
    artist: 'Riff Raff',
    reward: 3.78,
    youtubeId: 'nARW7VvOlM8',
    coverUrl: 'https://img.youtube.com/vi/nARW7VvOlM8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-618',
    title: 'This Is How We Do',
    artist: 'Riff Raff',
    reward: 4.6,
    youtubeId: '7RMQksXpQSk',
    coverUrl: 'https://img.youtube.com/vi/7RMQksXpQSk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-619',
    title: 'Djadja',
    artist: 'Aya Nakamura',
    reward: 4.76,
    youtubeId: 'iPGgnzc34tY',
    coverUrl: 'https://img.youtube.com/vi/iPGgnzc34tY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-621',
    title: 'Skibidi',
    artist: 'Little Big',
    reward: 4.96,
    youtubeId: 'SIIGMA',
    coverUrl: 'https://img.youtube.com/vi/SIIGMA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-622',
    title: 'Skibidi',
    artist: 'Little Big',
    reward: 2.54,
    youtubeId: 'mDFBTdToRmw',
    coverUrl: 'https://img.youtube.com/vi/mDFBTdToRmw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-624',
    title: 'Blame',
    artist: 'John Newman',
    reward: 3.67,
    youtubeId: '6ACl8s_tBzE',
    coverUrl: 'https://img.youtube.com/vi/6ACl8s_tBzE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-625',
    title: 'Don\'t You Worry Child',
    artist: 'John Martin',
    reward: 2.73,
    youtubeId: '1y6smkh6c-0',
    coverUrl: 'https://img.youtube.com/vi/1y6smkh6c-0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-627',
    title: 'My Immortal',
    artist: 'Evanescence',
    reward: 2.95,
    youtubeId: '5anLPw0Efmo',
    coverUrl: 'https://img.youtube.com/vi/5anLPw0Efmo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-628',
    title: 'Whatever It Takes',
    artist: 'Imagine Dragons',
    reward: 4.07,
    youtubeId: 'gOsM-DYAEhY',
    coverUrl: 'https://img.youtube.com/vi/gOsM-DYAEhY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-630',
    title: 'The Reason',
    artist: 'Hoobastank',
    reward: 3.57,
    youtubeId: 'fV4DiAyExN0',
    coverUrl: 'https://img.youtube.com/vi/fV4DiAyExN0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-631',
    title: 'Wildest Dreams',
    artist: 'Taylor Swift',
    reward: 4.2,
    youtubeId: 'IdneKLhsWOQ',
    coverUrl: 'https://img.youtube.com/vi/IdneKLhsWOQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-633',
    title: 'Young Dumb & Broke',
    artist: 'Khalid',
    reward: 4.11,
    youtubeId: 'IPfJnp1guPc',
    coverUrl: 'https://img.youtube.com/vi/IPfJnp1guPc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-634',
    title: 'Price Tag',
    artist: 'B.o.B',
    reward: 2.64,
    youtubeId: 'qMxX-QOV9tI',
    coverUrl: 'https://img.youtube.com/vi/qMxX-QOV9tI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-636',
    title: 'Love You like a Love Song',
    artist: 'Selena Gomez & the Scene',
    reward: 3.11,
    youtubeId: 'EgT_us6AsDg',
    coverUrl: 'https://img.youtube.com/vi/EgT_us6AsDg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-637',
    title: 'Moonlight',
    artist: 'XXXTentacion',
    reward: 4.27,
    youtubeId: 'GX8Hg6kWQYI',
    coverUrl: 'https://img.youtube.com/vi/GX8Hg6kWQYI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-639',
    title: 'Beautiful Girls',
    artist: 'Sean Kingston',
    reward: 4.36,
    youtubeId: 'MrTz5xjmso4',
    coverUrl: 'https://img.youtube.com/vi/MrTz5xjmso4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-640',
    title: 'One Call Away',
    artist: 'Charlie Puth',
    reward: 3.24,
    youtubeId: 'BxuY9FET9Y4',
    coverUrl: 'https://img.youtube.com/vi/BxuY9FET9Y4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-642',
    title: 'You\'re Beautiful',
    artist: 'James Blunt',
    reward: 4.16,
    youtubeId: 'oofSnsGkops',
    coverUrl: 'https://img.youtube.com/vi/oofSnsGkops/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-643',
    title: 'Yagoda Malinka',
    artist: 'Xäbib',
    reward: 2.0,
    youtubeId: 'Rt2zZSaOFtw',
    coverUrl: 'https://img.youtube.com/vi/Rt2zZSaOFtw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-645',
    title: 'Blurred Lines',
    artist: 'T.I.',
    reward: 4.53,
    youtubeId: 'yyDUC1LUXSU',
    coverUrl: 'https://img.youtube.com/vi/yyDUC1LUXSU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-646',
    title: 'Dernière danse',
    artist: 'Indila',
    reward: 2.54,
    youtubeId: 'K5KAc5CoCuk',
    coverUrl: 'https://img.youtube.com/vi/K5KAc5CoCuk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-648',
    title: 'Animals',
    artist: 'Maroon 5',
    reward: 4.35,
    youtubeId: 'qpgTC9MDx1o',
    coverUrl: 'https://img.youtube.com/vi/qpgTC9MDx1o/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-649',
    title: 'Pumped Up Kicks',
    artist: 'Foster the People',
    reward: 2.44,
    youtubeId: 'SDTZ7iX4vTQ',
    coverUrl: 'https://img.youtube.com/vi/SDTZ7iX4vTQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-651',
    title: 'Sucker for Pain',
    artist: 'Ty Dolla Sign',
    reward: 3.97,
    youtubeId: '-59jGD4WrmE',
    coverUrl: 'https://img.youtube.com/vi/-59jGD4WrmE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-652',
    title: 'Back in Black',
    artist: 'AC/DC',
    reward: 2.56,
    youtubeId: 'pAgnJDJN4VA',
    coverUrl: 'https://img.youtube.com/vi/pAgnJDJN4VA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-654',
    title: 'Hot Nigga',
    artist: 'Bobby Shmurda',
    reward: 3.64,
    youtubeId: 'vJwKKKd2ZYE',
    coverUrl: 'https://img.youtube.com/vi/vJwKKKd2ZYE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-655',
    title: 'Best Song Ever',
    artist: 'One Direction',
    reward: 2.97,
    youtubeId: 'o_v9MY_FMcw',
    coverUrl: 'https://img.youtube.com/vi/o_v9MY_FMcw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-657',
    title: 'Bichota',
    artist: 'Karol G',
    reward: 4.89,
    youtubeId: 'hz7GlXTRh-M',
    coverUrl: 'https://img.youtube.com/vi/hz7GlXTRh-M/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-658',
    title: 'Bichota',
    artist: 'Karol G',
    reward: 3.3,
    youtubeId: 'QaXhVryxVBk',
    coverUrl: 'https://img.youtube.com/vi/QaXhVryxVBk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-660',
    title: 'Send My Love (To Your New Lover)',
    artist: 'Kelsea Ballerini',
    reward: 4.62,
    youtubeId: 'fk4BbF7B29w',
    coverUrl: 'https://img.youtube.com/vi/fk4BbF7B29w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-661',
    title: 'Locked Out of Heaven',
    artist: 'Mohamed Kelany',
    reward: 3.32,
    youtubeId: 'e-fA-gBCkj0',
    coverUrl: 'https://img.youtube.com/vi/e-fA-gBCkj0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-663',
    title: 'The Greatest',
    artist: 'Sia',
    reward: 2.21,
    youtubeId: 'GKSRyLdjsPA',
    coverUrl: 'https://img.youtube.com/vi/GKSRyLdjsPA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-664',
    title: 'One Kiss',
    artist: 'Dua Lipa',
    reward: 3.46,
    youtubeId: 'DkeiKbqa02g',
    coverUrl: 'https://img.youtube.com/vi/DkeiKbqa02g/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-666',
    title: 'Mi Cama',
    artist: 'Karol G',
    reward: 2.0,
    youtubeId: '8-mloCL49vs',
    coverUrl: 'https://img.youtube.com/vi/8-mloCL49vs/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-667',
    title: 'Cuando Te Besé',
    artist: 'Becky G',
    reward: 4.11,
    youtubeId: 'zAWsoFk2yVw',
    coverUrl: 'https://img.youtube.com/vi/zAWsoFk2yVw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-669',
    title: 'Sofia',
    artist: 'Alvaro Soler',
    reward: 4.78,
    youtubeId: 'qaZ0oAh4evU',
    coverUrl: 'https://img.youtube.com/vi/qaZ0oAh4evU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-670',
    title: 'Love Me Harder',
    artist: 'The Weeknd',
    reward: 3.64,
    youtubeId: 'g5qU7p7yOY8',
    coverUrl: 'https://img.youtube.com/vi/g5qU7p7yOY8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-672',
    title: 'Creep',
    artist: 'Radiohead',
    reward: 4.2,
    youtubeId: 'XFkzRNyygfk',
    coverUrl: 'https://img.youtube.com/vi/XFkzRNyygfk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-673',
    title: 'Come & Get It',
    artist: 'Selena Gomez',
    reward: 3.38,
    youtubeId: 'n-D1EB74Ckg',
    coverUrl: 'https://img.youtube.com/vi/n-D1EB74Ckg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-675',
    title: 'Memories',
    artist: 'Maroon 5',
    reward: 3.41,
    youtubeId: 'SlPhMPnQ58k',
    coverUrl: 'https://img.youtube.com/vi/SlPhMPnQ58k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-676',
    title: 'One Thing',
    artist: 'One Direction',
    reward: 3.02,
    youtubeId: 'Y1xs_xPb46M',
    coverUrl: 'https://img.youtube.com/vi/Y1xs_xPb46M/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-678',
    title: 'Old Town Road',
    artist: 'Lil Nas X',
    reward: 2.8,
    youtubeId: 'w2Ov5jzm3j8',
    coverUrl: 'https://img.youtube.com/vi/w2Ov5jzm3j8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-679',
    title: 'Old Town Road',
    artist: 'Lil Nas X',
    reward: 3.19,
    youtubeId: '9YpvNgCSaCU',
    coverUrl: 'https://img.youtube.com/vi/9YpvNgCSaCU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-681',
    title: 'Mama',
    artist: 'Jonas Blue',
    reward: 3.22,
    youtubeId: 'qPTfXwPf_HM',
    coverUrl: 'https://img.youtube.com/vi/qPTfXwPf_HM/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-682',
    title: 'Ego',
    artist: 'Willy William',
    reward: 2.11,
    youtubeId: 'iOxzG3jjFkY',
    coverUrl: 'https://img.youtube.com/vi/iOxzG3jjFkY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-684',
    title: 'Ego',
    artist: 'Willy William',
    reward: 3.21,
    youtubeId: 'lyssTScHwmk',
    coverUrl: 'https://img.youtube.com/vi/lyssTScHwmk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-685',
    title: 'Loka',
    artist: 'Simone & Simaria',
    reward: 2.85,
    youtubeId: 'UrT0zCmsN8c',
    coverUrl: 'https://img.youtube.com/vi/UrT0zCmsN8c/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-687',
    title: 'Hawái',
    artist: 'Maluma',
    reward: 3.38,
    youtubeId: 'pK060iUFWXg',
    coverUrl: 'https://img.youtube.com/vi/pK060iUFWXg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-688',
    title: 'Changes',
    artist: 'XXXTentacion',
    reward: 3.31,
    youtubeId: 'f0bbDFRYD_A',
    coverUrl: 'https://img.youtube.com/vi/f0bbDFRYD_A/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-690',
    title: 'IDGAF',
    artist: 'Dua Lipa',
    reward: 4.39,
    youtubeId: 'Mgfe5tIwOj0',
    coverUrl: 'https://img.youtube.com/vi/Mgfe5tIwOj0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-691',
    title: 'Te Amo (Piso 21 and Paulo Londra song)',
    artist: 'Piso 21',
    reward: 4.12,
    youtubeId: 'nP8ZVJxiJlU',
    coverUrl: 'https://img.youtube.com/vi/nP8ZVJxiJlU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-693',
    title: 'Live While We\'re Young',
    artist: 'One Direction',
    reward: 2.9,
    youtubeId: 'AbPED9bisSc',
    coverUrl: 'https://img.youtube.com/vi/AbPED9bisSc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-694',
    title: 'When the Party\'s Over',
    artist: 'Billie Eilish',
    reward: 3.34,
    youtubeId: 'pbMwTqkKSps',
    coverUrl: 'https://img.youtube.com/vi/pbMwTqkKSps/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-696',
    title: 'You Are the Reason',
    artist: 'Calum Scott',
    reward: 2.65,
    youtubeId: 'ShZ978fBl6Y',
    coverUrl: 'https://img.youtube.com/vi/ShZ978fBl6Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-697',
    title: 'Viva la Vida',
    artist: 'Coldplay',
    reward: 2.89,
    youtubeId: 'dvgZkm1xWPE',
    coverUrl: 'https://img.youtube.com/vi/dvgZkm1xWPE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-699',
    title: 'Dákiti',
    artist: 'Jhayco',
    reward: 2.69,
    youtubeId: 'TmKh7lAwnBI',
    coverUrl: 'https://img.youtube.com/vi/TmKh7lAwnBI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-700',
    title: 'Sweet but Psycho',
    artist: 'Ava Max',
    reward: 3.97,
    youtubeId: 'WXBHCQYxwr0',
    coverUrl: 'https://img.youtube.com/vi/WXBHCQYxwr0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-702',
    title: 'Lucid Dreams',
    artist: 'Juice WRLD',
    reward: 2.81,
    youtubeId: 'mzB1VGEGcSU',
    coverUrl: 'https://img.youtube.com/vi/mzB1VGEGcSU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-703',
    title: 'One Time',
    artist: 'Justin Bieber',
    reward: 3.42,
    youtubeId: 'CHVhwcOg6y8',
    coverUrl: 'https://img.youtube.com/vi/CHVhwcOg6y8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-705',
    title: 'Chained to the Rhythm',
    artist: 'Skip Marley',
    reward: 4.98,
    youtubeId: 'Um7pMggPnug',
    coverUrl: 'https://img.youtube.com/vi/Um7pMggPnug/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-706',
    title: 'Lonely',
    artist: 'Akon',
    reward: 2.19,
    youtubeId: '6EEW-9NDM5k',
    coverUrl: 'https://img.youtube.com/vi/6EEW-9NDM5k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-708',
    title: 'It Will Rain',
    artist: 'Bruno Mars',
    reward: 4.21,
    youtubeId: 'W-w3WfgpcGg',
    coverUrl: 'https://img.youtube.com/vi/W-w3WfgpcGg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-709',
    title: 'Lemon',
    artist: 'Kenshi Yonezu',
    reward: 3.53,
    youtubeId: 'SX_ViT4Ra7k',
    coverUrl: 'https://img.youtube.com/vi/SX_ViT4Ra7k/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-711',
    title: 'Candy Shop',
    artist: 'Olivia',
    reward: 4.43,
    youtubeId: 'SRcnnId15BA',
    coverUrl: 'https://img.youtube.com/vi/SRcnnId15BA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-712',
    title: 'Freaky Friday',
    artist: 'Lil Dicky',
    reward: 2.73,
    youtubeId: 'aZla1ttZHaw',
    coverUrl: 'https://img.youtube.com/vi/aZla1ttZHaw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-714',
    title: 'Try Everything',
    artist: 'Shakira',
    reward: 2.09,
    youtubeId: 'c6rP-YP4c5I',
    coverUrl: 'https://img.youtube.com/vi/c6rP-YP4c5I/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-715',
    title: 'Marvin Gaye',
    artist: 'Charlie Puth',
    reward: 3.77,
    youtubeId: 'igNVdlXhKcI',
    coverUrl: 'https://img.youtube.com/vi/igNVdlXhKcI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-717',
    title: 'Low Life',
    artist: 'Future',
    reward: 3.37,
    youtubeId: 'K_9tX4eHztY',
    coverUrl: 'https://img.youtube.com/vi/K_9tX4eHztY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-718',
    title: 'Stolen Dance',
    artist: 'Milky Chance',
    reward: 2.33,
    youtubeId: 'iX-QaNzd-0Y',
    coverUrl: 'https://img.youtube.com/vi/iX-QaNzd-0Y/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-720',
    title: 'Where Is the Love?',
    artist: 'Black Eyed Peas',
    reward: 2.23,
    youtubeId: 'WpYeekQkAdc',
    coverUrl: 'https://img.youtube.com/vi/WpYeekQkAdc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-721',
    title: 'Mirror',
    artist: 'Lil Wayne',
    reward: 3.28,
    youtubeId: 'OZLUa8JUR18',
    coverUrl: 'https://img.youtube.com/vi/OZLUa8JUR18/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-723',
    title: 'The Nights',
    artist: 'Avicii',
    reward: 3.82,
    youtubeId: 'UtF6Jej8yb4',
    coverUrl: 'https://img.youtube.com/vi/UtF6Jej8yb4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-724',
    title: 'Style',
    artist: 'Taylor Swift',
    reward: 4.09,
    youtubeId: '-CmadmM5cOk',
    coverUrl: 'https://img.youtube.com/vi/-CmadmM5cOk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-726',
    title: 'Call Out My Name',
    artist: 'The Weeknd',
    reward: 3.85,
    youtubeId: 'M4ZoCHID9GI',
    coverUrl: 'https://img.youtube.com/vi/M4ZoCHID9GI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-727',
    title: 'A Sky Full Of Stars',
    artist: 'Coldplay',
    reward: 3.43,
    youtubeId: 'VPRjCeoBqrI',
    coverUrl: 'https://img.youtube.com/vi/VPRjCeoBqrI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-729',
    title: 'El Efecto',
    artist: 'None',
    reward: 4.45,
    youtubeId: 'vpD_EvXiGQ4',
    coverUrl: 'https://img.youtube.com/vi/vpD_EvXiGQ4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-730',
    title: 'We Are Never Ever Getting Back Together',
    artist: 'Taylor Swift',
    reward: 2.19,
    youtubeId: 'Nhj-kJQwNYA',
    coverUrl: 'https://img.youtube.com/vi/Nhj-kJQwNYA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-732',
    title: '1, 2, 3',
    artist: 'Sofía Reyes',
    reward: 4.1,
    youtubeId: 'p03TIGqEc8o',
    coverUrl: 'https://img.youtube.com/vi/p03TIGqEc8o/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-733',
    title: 'Flashlight',
    artist: 'Jessie J',
    reward: 2.36,
    youtubeId: 'DzwkcbTQ7ZE',
    coverUrl: 'https://img.youtube.com/vi/DzwkcbTQ7ZE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-735',
    title: 'Vuelve',
    artist: 'Daddy Yankee',
    reward: 4.32,
    youtubeId: 'YxZXLWIx6ik',
    coverUrl: 'https://img.youtube.com/vi/YxZXLWIx6ik/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-736',
    title: 'Qué más pues?',
    artist: 'Marí palma',
    reward: 2.25,
    youtubeId: 'zisuhZqTeH4',
    coverUrl: 'https://img.youtube.com/vi/zisuhZqTeH4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-738',
    title: 'Todo de Ti',
    artist: 'Rauw Alejandro',
    reward: 4.32,
    youtubeId: 'CFPLIaMpGrY',
    coverUrl: 'https://img.youtube.com/vi/CFPLIaMpGrY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-739',
    title: 'Swish Swish',
    artist: 'Nicki Minaj',
    reward: 4.97,
    youtubeId: 'iGk5fR-t5AU',
    coverUrl: 'https://img.youtube.com/vi/iGk5fR-t5AU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-741',
    title: 'Sing Me to Sleep',
    artist: 'Alan Walker',
    reward: 3.49,
    youtubeId: '2i2khp_npdE',
    coverUrl: 'https://img.youtube.com/vi/2i2khp_npdE/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-742',
    title: 'Give Me Love',
    artist: 'Ed Sheeran',
    reward: 2.74,
    youtubeId: 'FOjdXSrtUxA',
    coverUrl: 'https://img.youtube.com/vi/FOjdXSrtUxA/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-744',
    title: 'Prayer in C',
    artist: 'Lilly Wood and the Prick',
    reward: 2.94,
    youtubeId: 'fiore9Z5iUg',
    coverUrl: 'https://img.youtube.com/vi/fiore9Z5iUg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-745',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 3.16,
    youtubeId: 'fgk2KxK4iAo',
    coverUrl: 'https://img.youtube.com/vi/fgk2KxK4iAo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-747',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 2.91,
    youtubeId: 'bqv8_7Parj4',
    coverUrl: 'https://img.youtube.com/vi/bqv8_7Parj4/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-748',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 4.31,
    youtubeId: '0rUO0pxJKdw',
    coverUrl: 'https://img.youtube.com/vi/0rUO0pxJKdw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-750',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 3.19,
    youtubeId: '2bfxLPBakzg',
    coverUrl: 'https://img.youtube.com/vi/2bfxLPBakzg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-751',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 3.16,
    youtubeId: 'u9FjPUjqirY',
    coverUrl: 'https://img.youtube.com/vi/u9FjPUjqirY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-753',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 2.42,
    youtubeId: 'WRoZgfjzGNQ',
    coverUrl: 'https://img.youtube.com/vi/WRoZgfjzGNQ/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-754',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 2.85,
    youtubeId: 'nQEnj84irFc',
    coverUrl: 'https://img.youtube.com/vi/nQEnj84irFc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-756',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 4.45,
    youtubeId: 'gzJBaC9P2Eg',
    coverUrl: 'https://img.youtube.com/vi/gzJBaC9P2Eg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-757',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 2.57,
    youtubeId: '7O4FqXvBgeo',
    coverUrl: 'https://img.youtube.com/vi/7O4FqXvBgeo/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-759',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 3.41,
    youtubeId: 'HBlpq7H7VIw',
    coverUrl: 'https://img.youtube.com/vi/HBlpq7H7VIw/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-760',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 4.14,
    youtubeId: 'NvK9APEhcdk',
    coverUrl: 'https://img.youtube.com/vi/NvK9APEhcdk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-762',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 2.46,
    youtubeId: 'SIsm0N18AIc',
    coverUrl: 'https://img.youtube.com/vi/SIsm0N18AIc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-763',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 2.52,
    youtubeId: 'BflFNMl_UWY',
    coverUrl: 'https://img.youtube.com/vi/BflFNMl_UWY/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-765',
    title: 'Dynamite',
    artist: 'BTS',
    reward: 2.25,
    youtubeId: 'BV2FdDmGiW0',
    coverUrl: 'https://img.youtube.com/vi/BV2FdDmGiW0/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-766',
    title: 'Girlfriend',
    artist: 'Lil Mama',
    reward: 2.33,
    youtubeId: 'Bg59q4puhmg',
    coverUrl: 'https://img.youtube.com/vi/Bg59q4puhmg/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-768',
    title: 'Girlfriend',
    artist: 'Lil Mama',
    reward: 3.29,
    youtubeId: 'EnwLrQ2ys_g',
    coverUrl: 'https://img.youtube.com/vi/EnwLrQ2ys_g/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-769',
    title: 'Dancing with a Stranger',
    artist: 'Normani',
    reward: 4.79,
    youtubeId: 'av5JD1dfj_c',
    coverUrl: 'https://img.youtube.com/vi/av5JD1dfj_c/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-771',
    title: 'Bitter Sweet Symphony',
    artist: 'The Verve',
    reward: 2.2,
    youtubeId: '1lyu1KKwC74',
    coverUrl: 'https://img.youtube.com/vi/1lyu1KKwC74/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-772',
    title: 'Don\'t Cry',
    artist: 'Guns N\' Roses',
    reward: 2.42,
    youtubeId: 'zRIbf6JqkNc',
    coverUrl: 'https://img.youtube.com/vi/zRIbf6JqkNc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-774',
    title: 'In the Name of Love',
    artist: 'Bebe Rexha',
    reward: 2.26,
    youtubeId: 'RnBT9uUYb1w',
    coverUrl: 'https://img.youtube.com/vi/RnBT9uUYb1w/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-775',
    title: 'Me Too',
    artist: 'Meghan Trainor',
    reward: 4.09,
    youtubeId: 'qDRORgoZxZU',
    coverUrl: 'https://img.youtube.com/vi/qDRORgoZxZU/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-777',
    title: 'Don\'t Wanna Know',
    artist: 'Maroon 5',
    reward: 4.44,
    youtubeId: 'ANS9sSJA9Yc',
    coverUrl: 'https://img.youtube.com/vi/ANS9sSJA9Yc/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-778',
    title: 'I\'m Yours',
    artist: 'Jason Mraz',
    reward: 4.54,
    youtubeId: 'EkHTsc9PU2A',
    coverUrl: 'https://img.youtube.com/vi/EkHTsc9PU2A/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-780',
    title: 'Back to Black',
    artist: 'Amy Winehouse',
    reward: 2.98,
    youtubeId: 'TJAfLE39ZZ8',
    coverUrl: 'https://img.youtube.com/vi/TJAfLE39ZZ8/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-781',
    title: 'Young, Wild & Free',
    artist: 'Wiz Terikiya',
    reward: 4.64,
    youtubeId: 'Wa5B22KAkEk',
    coverUrl: 'https://img.youtube.com/vi/Wa5B22KAkEk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-783',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    reward: 4.35,
    youtubeId: 'XXYlFuWEuKI',
    coverUrl: 'https://img.youtube.com/vi/XXYlFuWEuKI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-784',
    title: 'Save Your Tears',
    artist: 'The Weeknd',
    reward: 3.05,
    youtubeId: 'LIIDh-qI9oI',
    coverUrl: 'https://img.youtube.com/vi/LIIDh-qI9oI/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-786',
    title: 'Scared to Be Lonely',
    artist: 'Dua Lipa',
    reward: 3.28,
    youtubeId: 'e2vBLd5Egnk',
    coverUrl: 'https://img.youtube.com/vi/e2vBLd5Egnk/hqdefault.jpg',
    genre: 'Pop'
  },
  {
    id: 's-787',
    title: 'U Can\'t Touch This',
    artist: 'MC Hammer',
    reward: 2.89,
    youtubeId: 'otCpCn0l4Wo',
    coverUrl: 'https://img.youtube.com/vi/otCpCn0l4Wo/hqdefault.jpg',
    genre: 'Pop'
  },
];

export default function Taf26RendaPage() {
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // --- STATE ---
  const [balance, setBalance] = useState<number>(25.00);
  const [todayEarnings, setTodayEarnings] = useState<number>(0.00);
  const [totalIncome, setTotalIncome] = useState<number>(25.00);
  const [vipLevel, setVipLevel] = useState<number>(0); // 0 = Free, 1 = VIP Bronze, 2 = VIP Gold, 3 = VIP Diamond
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const handleUserSession = (currentUser: any) => {
      if (currentUser) {
        const meta = currentUser.user_metadata || {};
        
        // Load initial states from metadata if present
        if (meta.balance !== undefined) setBalance(parseFloat(meta.balance));
        if (meta.today_earnings !== undefined) setTodayEarnings(parseFloat(meta.today_earnings));
        if (meta.total_income !== undefined) setTotalIncome(parseFloat(meta.total_income));
        if (meta.vip_level !== undefined) setVipLevel(parseInt(meta.vip_level));

        setUser(currentUser);
        isInitializedRef.current = true;

        // Check VIP expiration from server
        fetch(`/api/user/vip?userId=${currentUser.id}`)
          .then(res => {
            if (res.ok) return res.json();
            throw new Error('Failed to fetch VIP status');
          })
          .then(vipData => {
            if (vipData.vipLevel !== undefined) {
              setVipLevel(vipData.vipLevel);
            }
          })
          .catch(err => console.error("Erro ao verificar expiração do VIP:", err));

        // Auto-generate referral code if missing
        if (!meta.ref_code) {
          const generatedRefCode = `user${Math.floor(1000 + Math.random() * 9000)}`;
          supabase.auth.updateUser({
            data: {
              ...meta,
              ref_code: generatedRefCode
            }
          }).then(({ data: updateData, error }) => {
            if (!error && updateData?.user) {
              setUser(updateData.user);
            }
          });
        }
      }
    };

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        handleUserSession(session.user);
      } else {
        window.location.href = '/sign-in';
      }
      setIsUserLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        handleUserSession(session.user);
      } else {
        window.location.href = '/sign-in';
      }
    });

    return () => subscription.unsubscribe();
  }, []);
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
  const dailyVideos: Song[] = songs.slice((dayNumber - 1) * 5, (dayNumber - 1) * 5 + 5);
  
  const getInitialVideoCompleted = () => {
    try {
      const saved = localStorage.getItem('videoCompleted');
      const savedDay = localStorage.getItem('videoCompletedDay');
      const todayStr = new Date().toLocaleDateString('pt-BR');
      if (saved && savedDay === todayStr) {
        return JSON.parse(saved);
      }
    } catch {}
    return Array(5).fill(false);
  };
  const [videoCompleted, setVideoCompleted] = useState<boolean[]>(getInitialVideoCompleted);
  const currentDaySongIndex = currentSongIndex % 5;
  
  // Modals & Flows
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // PIX Withdrawal Form
  const [pixKey, setPixKey] = useState<string>('');
  const [pixKeyType, setPixKeyType] = useState<string>('CPF');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [isWithdrawingAnimation, setIsWithdrawingAnimation] = useState<boolean>(false);
  const [withdrawStep, setWithdrawStep] = useState<number>(0); // 0: input, 1: processing, 2: success

  // Referral State
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // IronPay VIP Purchase State
  const [isVipPaymentOpen, setIsVipPaymentOpen] = useState(false);
  const [vipPaymentData, setVipPaymentData] = useState<{
    plan: VIPPlan;
    pixCode: string;
    pixQrImage: string | null;
    transactionHash: string;
  } | null>(null);
  const [vipPaymentStep, setVipPaymentStep] = useState<'creating' | 'qr' | 'polling' | 'success' | 'error'>('creating');
  const [vipPaymentError, setVipPaymentError] = useState('');

  // Daily Missions
  const getInitialMissions = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    const lastReset = typeof window !== 'undefined' ? localStorage.getItem('missionResetDate') : null;
    const savedMissions = typeof window !== 'undefined' ? localStorage.getItem('missions') : null;
    if (savedMissions && lastReset === today) {
      return JSON.parse(savedMissions);
    }
    // New day or first visit — reset
    if (typeof window !== 'undefined') {
      localStorage.setItem('missionResetDate', today);
    }
    return [
      { id: 'm-1', title: 'Ouvir música por 5 minutos', description: 'Ouça qualquer faixa para ganhar bônus.', progress: 0, target: 300, reward: 5.00, completed: false },
      { id: 'm-2', title: 'Convidar 3 amigos', description: 'Convide amigos usando seu link.', progress: 0, target: 3, reward: 10.00, completed: false },
      { id: 'm-3', title: 'Ativar qualquer VIP', description: 'Aumente sua taxa de ganhos diários.', progress: 0, target: 1, reward: 15.00, completed: false },
    ];
  };
  const [missions, setMissions] = useState<{ id: string; title: string; description: string; progress: number; target: number; reward: number; completed: boolean }[]>(getInitialMissions);

  // Withdrawal History
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  // Save balance, todayEarnings, totalIncome, and vipLevel to Supabase with debounce
  useEffect(() => {
    if (!user || !isInitializedRef.current) return;
    const saveToSupabase = async () => {
      try {
        // Fetch the latest user metadata from Supabase to avoid overwriting server-side changes
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        if (!freshUser) return;
        
        const meta = freshUser.user_metadata || {};
        
        // Sync local state if server has higher values (e.g. referral credit from admin)
        const serverBalance = parseFloat(meta.balance) || 0;
        const serverToday = parseFloat(meta.today_earnings) || 0;
        const serverTotal = parseFloat(meta.total_income) || 0;
        
        // If server value is higher, use it (never overwrite a server-side credit)
        const finalBalance = serverBalance > balance ? serverBalance : balance;
        const finalToday = serverToday > todayEarnings ? serverToday : todayEarnings;
        const finalTotal = serverTotal > totalIncome ? serverTotal : totalIncome;
        
        if (serverBalance > balance) setBalance(serverBalance);
        if (serverToday > todayEarnings) setTodayEarnings(serverToday);
        if (serverTotal > totalIncome) setTotalIncome(serverTotal);
        
        // Only save if values actually differ from what server has
        if (
          meta.balance !== finalBalance ||
          meta.today_earnings !== finalToday ||
          meta.total_income !== finalTotal ||
          meta.vip_level !== vipLevel
        ) {
          const { data: { user: updatedUser }, error } = await supabase.auth.updateUser({
            data: {
              ...meta,
              balance: finalBalance,
              today_earnings: finalToday,
              total_income: finalTotal,
              vip_level: vipLevel
            }
          });
          if (!error && updatedUser) {
            setUser(updatedUser);
          }
        }
      } catch (err) {
        console.error('Error auto-saving metadata to Supabase:', err);
      }
    };

    const timer = setTimeout(() => {
      saveToSupabase();
    }, 2000);

    return () => clearTimeout(timer);
  }, [balance, todayEarnings, totalIncome, vipLevel, user]);

  // Fetch real referrals from backend API on footer tab switch or user change
  useEffect(() => {
    if (!user) return;
    const refCode = user.user_metadata?.ref_code;
    if (!refCode) return;

    const fetchReferrals = async () => {
      try {
        const res = await fetch(`/api/user/referrals?refCode=${refCode}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.referrals) {
            setReferrals(data.referrals);
          }
        }
      } catch (err) {
        console.error('Error fetching referrals:', err);
      }
    };

    fetchReferrals();
  }, [user, activeFooterTab]);

  // --- AUDIO REFERENCING & ENGINE ---
  const playerRef = useRef<any>(null);

  // Playlist data

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
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.body.appendChild(tag);

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Create/Recreate YouTube player when player container is available
  useEffect(() => {
    const createPlayer = () => {
      const el = document.getElementById('yt-player');
      if (!el) return false;
      if (!(window as any).YT || !(window as any).YT.Player) return false;

      // Only destroy if the old player still has a valid DOM element
      if (playerRef.current && playerRef.current.destroy) {
        try {
          const oldEl = playerRef.current.getIframe && playerRef.current.getIframe();
          if (oldEl && document.body.contains(oldEl)) {
            playerRef.current.destroy();
          }
        } catch {}
        playerRef.current = null;
      }

      playerRef.current = new (window as any).YT.Player('yt-player', {
        videoId: currentSong.youtubeId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
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
          onError: (event: any) => {
            console.warn('YouTube player error:', event.data);
            setTimeout(() => {
              setCurrentSongIndex((prev) => (prev + 1) % dailyVideos.length);
              setSecondsElapsed(0);
              setSongProgress(0);
            }, 500);
          },
        },
      });
      return true;
    };

    const tryCreate = () => {
      if (createPlayer()) return;
      const check = setInterval(() => {
        if (createPlayer()) clearInterval(check);
      }, 200);
      setTimeout(() => clearInterval(check), 5000);
    };

    tryCreate();
  }, [activeTab, activeFooterTab]);

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

  // Handle next video transition
  const handleNextVideo = () => {
    if (currentDaySongIndex + 1 >= dailyVideos.length) {
      showToast('Todas as 5 músicas de hoje foram concluídas! Volte amanhã.', 'info');
      return;
    }
    setCurrentSongIndex((prevIndex) => prevIndex + 1);
    setSecondsElapsed(0);
    setSongProgress(0);
    setRewarded(false);
    showToast('Próxima música da playlist iniciada!', 'success');
  };

  // Check if all 5 daily videos are completed
  const allVideosCompleted = videoCompleted.every(Boolean);

  // Auto-advance to next uncompleted song after reward
  useEffect(() => {
    if (rewarded && !allVideosCompleted) {
      const timer = setTimeout(() => {
        const nextIndex = videoCompleted.findIndex((done) => !done);
        if (nextIndex !== -1 && nextIndex !== currentDaySongIndex) {
          setCurrentSongIndex(nextIndex);
          setSecondsElapsed(0);
          setSongProgress(0);
          setRewarded(false);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [rewarded, allVideosCompleted]);

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

  // Sync m-2 mission with real referrals
  useEffect(() => {
    const activeCount = referrals.filter(r => r.status === 'Ativo').length;
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === 'm-2') {
          const newProgress = Math.min(activeCount, m.target);
          const completed = newProgress >= m.target;
          if (completed && !m.completed) {
            setTimeout(() => {
              showToast(`Missão de Convites Concluída! Ganhou R$ ${m.reward.toFixed(2)}`, 'success');
              setBalance((b) => b + m.reward);
              setTodayEarnings((t) => t + m.reward);
            }, 500);
          }
          return { ...m, progress: newProgress, completed };
        }
        return m;
      })
    );
  }, [referrals]);

  // Persist missions to localStorage
  useEffect(() => {
    localStorage.setItem('missions', JSON.stringify(missions));
  }, [missions]);

  // Persist videoCompleted to localStorage
  useEffect(() => {
    localStorage.setItem('videoCompleted', JSON.stringify(videoCompleted));
    localStorage.setItem('videoCompletedDay', new Date().toLocaleDateString('pt-BR'));
  }, [videoCompleted]);

  // Check for day change and reset todayEarnings + videoCompleted
  useEffect(() => {
    const checkDayChange = () => {
      const today = new Date().toLocaleDateString('pt-BR');
      const lastReset = localStorage.getItem('dayChangeDate');
      if (lastReset !== today) {
        localStorage.setItem('dayChangeDate', today);
        setTodayEarnings(0.00);
        setVideoCompleted(Array(5).fill(false));
        localStorage.removeItem('videoCompleted');
        localStorage.removeItem('videoCompletedDay');
      }
    };
    checkDayChange();
    const interval = setInterval(checkDayChange, 60000);
    return () => clearInterval(interval);
  }, []);

  // Check for day change and reset missions
  useEffect(() => {
    const checkDayChange = () => {
      const today = new Date().toLocaleDateString('pt-BR');
      const lastReset = localStorage.getItem('missionResetDate');
      if (lastReset !== today) {
        localStorage.setItem('missionResetDate', today);
        setMissions([
          { id: 'm-1', title: 'Ouvir música por 5 minutos', description: 'Ouça qualquer faixa para ganhar bônus.', progress: 0, target: 300, reward: 5.00, completed: false },
          { id: 'm-2', title: 'Convidar 3 amigos', description: 'Convide amigos usando seu link.', progress: 0, target: 3, reward: 10.00, completed: false },
          { id: 'm-3', title: 'Ativar qualquer VIP', description: 'Aumente sua taxa de ganhos diários.', progress: 0, target: 1, reward: 15.00, completed: false },
        ]);
        showToast('Missões diárias resetadas! Novos desafios disponíveis.', 'info');
      }
    };
    checkDayChange();
    const interval = setInterval(checkDayChange, 60000);
    return () => clearInterval(interval);
  }, []);

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
      const multipliedReward = parseFloat((currentSong.reward * getMultiplier()).toFixed(2));
      setBalance((prev) => parseFloat((prev + multipliedReward).toFixed(2)));
      setTodayEarnings((prev) => parseFloat((prev + multipliedReward).toFixed(2)));
      setTotalIncome((prev) => parseFloat((prev + multipliedReward).toFixed(2)));
      setRewarded(true);
      showToast(`Recompensa de R$ ${multipliedReward.toFixed(2)} recebida!${vipLevel > 0 ? ` (VIP ${vipLevel} x${getMultiplier()})` : ''}`, 'success');

      // Mark current video as completed
      setVideoCompleted((prev) => {
        const next = [...prev];
        next[currentDaySongIndex] = true;
        return next;
      });

      // Pause the video and stop playing after reward
      setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
        }
        setIsPlaying(false);
        showToast('Música concluída! Próxima música disponível.', 'info');
      }, 500);

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

  // Copy referral link
  const copyReferralLink = async () => {
    let refCode = user?.user_metadata?.ref_code;
    if (!refCode) {
      // Generate and save a real ref_code before copying
      const generatedRefCode = `user${Math.floor(1000 + Math.random() * 9000)}`;
      try {
        const meta = user?.user_metadata || {};
        const { data: updateData, error } = await supabase.auth.updateUser({
          data: {
            ...meta,
            ref_code: generatedRefCode,
          }
        });
        if (!error && updateData?.user) {
          setUser(updateData.user);
          refCode = generatedRefCode;
        } else {
          showToast('Erro ao gerar código de convite. Tente novamente.', 'error');
          return;
        }
      } catch {
        showToast('Erro ao gerar código de convite. Tente novamente.', 'error');
        return;
      }
    }
    const link = `https://www.taf26.site/invite?ref=${refCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      showToast('Link de convite copiado para a área de transferência!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }).catch(() => {
      showToast('Falha ao copiar link', 'error');
    });
  };

  // Handle VIP Boost Purchase via IronPay (QR code)
  const handleBuyVIP = async (plan: VIPPlan) => {
    if (vipLevel >= plan.id) {
      showToast('Você já possui este plano VIP ou um superior ativo!', 'info');
      return;
    }

    if (!user) {
      showToast('Faça login para comprar um plano VIP.', 'error');
      return;
    }

    setVipPaymentStep('creating');
    setVipPaymentError('');
    setIsVipPaymentOpen(true);

    try {
      const res = await fetch('/api/ironpay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vipPlan: plan.id,
          userId: user.id,
          email: user.email,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao criar pagamento');
      }

      setVipPaymentData({
        plan,
        pixCode: data.pixCode,
        pixQrImage: data.pixQrImage,
        transactionHash: data.transactionHash,
      });
      setVipPaymentStep('qr');

      const txHash = data.transactionHash;

      const interval = setInterval(async () => {
        try {
          const checkRes = await fetch(`/api/ironpay/check?hash=${txHash}`);
          const checkData = await checkRes.json();
          if (checkData.success && checkData.status === 'paid') {
            clearInterval(interval);
            setVipPaymentStep('success');
            setVipLevel(plan.id);
            showToast(`Parabéns! ${plan.name} ativado com sucesso! Multiplicador ${plan.multiplier}x Ativo ⚡`, 'success');
            setMissions((prevMissions) =>
              prevMissions.map((m) => {
                if (m.id === 'm-3' && m.progress < m.target) {
                  setTimeout(() => {
                    showToast(`Missão VIP Concluída! Ganhou R$ ${m.reward.toFixed(2)}`, 'success');
                    setBalance((b) => b + m.reward);
                    setTodayEarnings((t) => t + m.reward);
                  }, 1000);
                  return { ...m, progress: 1, completed: true };
                }
                return m;
              })
            );
          }
        } catch { }
      }, 5000);

      setTimeout(() => clearInterval(interval), 300000);
    } catch (err: any) {
      setVipPaymentStep('error');
      setVipPaymentError(err.message || 'Erro ao processar pagamento');
      showToast(`Erro: ${err.message}`, 'error');
    }
  };

  // Simulate App Download
  const handleDownloadApp = () => {
    setIsDownloadingApp(true);
    
    // Trigger real download of taf26.apk
    const link = document.createElement('a');
    link.href = '/taf26.apk';
    link.download = 'taf26.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setIsDownloadingApp(false);
      setIsAppDownloaded(true);
      showToast('Aplicativo oficial baixado com sucesso! Requisito concluído 📱', 'success');
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

  // Force page reload look
  const handleReload = async () => {
    showToast('Sincronizando saldo com os servidores da TAF26...', 'info');
    setIsPlaying(false);
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
    try {
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      if (freshUser) {
        const meta = freshUser.user_metadata || {};
        if (meta.balance !== undefined) setBalance(parseFloat(meta.balance));
        if (meta.today_earnings !== undefined) setTodayEarnings(parseFloat(meta.today_earnings));
        if (meta.total_income !== undefined) setTotalIncome(parseFloat(meta.total_income));
        if (meta.vip_level !== undefined) setVipLevel(parseInt(meta.vip_level));
        setUser(freshUser);
      }
      showToast('Dados atualizados com sucesso!', 'success');
    } catch {
      showToast('Erro ao sincronizar dados.', 'error');
    }
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
                  {allVideosCompleted ? (
                    <div className="bg-gradient-to-br from-[#1c2c22] to-[#141414] border border-[#21432f]/40 rounded-2xl p-8 shadow-lg relative overflow-hidden text-center">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl" />
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-base font-bold text-white">Todas as músicas de hoje foram concluídas!</h3>
                      <p className="text-xs text-zinc-400 mt-2">Volte amanhã para nova playlist ou acesse os planos VIP para ganhar mais.</p>
                      <button
                        onClick={() => setActiveTab('vip')}
                        className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer mx-auto"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        Ganhar Mais
                      </button>
                    </div>
                  ) : (
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
                          <span>Recompensa: R$ {(currentSong.reward * getMultiplier()).toFixed(2)} após 30s{vipLevel > 0 ? ` (x${getMultiplier()})` : ''}</span>
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
                  )}

                  {/* Playlist Queue (Matches product display structure from photo) */}
                  <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1 mb-2">
                      Playlist de Renda Diária
                    </h3>
                    <div className="space-y-2">
                      {dailyVideos.map((song, idx) => (
                        <div 
                          key={song.id}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            currentDaySongIndex === idx 
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
                                className={`object-cover ${videoCompleted[idx] ? 'opacity-50' : ''}`}
                              />
                              {videoCompleted[idx] && (
                                <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                              {currentDaySongIndex === idx && isPlaying && !videoCompleted[idx] && (
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
                            {videoCompleted[idx] ? (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                                <Check className="w-3 h-3" /> Concluído
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-400 bg-[#1db954]/10 px-2 py-1 rounded-full whitespace-nowrap">
                                R$ {(song.reward * getMultiplier()).toFixed(2)}
                              </span>
                            )}
                            
                            {!videoCompleted[idx] && (
                              <button
                                id={`select-song-btn-${song.id}`}
                                onClick={() => {
                                  if (currentDaySongIndex === idx) {
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
                                  currentDaySongIndex === idx && isPlaying 
                                    ? 'bg-[#1DB954] text-black' 
                                    : 'bg-zinc-800 text-white hover:bg-zinc-700'
                                }`}
                              >
                                {currentDaySongIndex === idx && isPlaying ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ganhar Mais button - shows after all 5 clips completed */}
                  {allVideosCompleted && (
                    <div className="mt-4">
                      <button
                        id="ganhar-mais-btn"
                        onClick={() => setActiveTab('vip')}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        Ganhar Mais - Acesse Planos VIP
                      </button>
                      <p className="text-[10px] text-zinc-500 text-center mt-2">
                        Você completou todas as músicas de hoje! Multiplique seus ganhos com um plano VIP.
                      </p>
                    </div>
                  )}

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
                  {`https://www.taf26.site/invite?ref=${user?.user_metadata?.ref_code || 'carregando...'}`}
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
                              showToast('Convide amigos para ganhar!', 'info');
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

                      {/* Download Button */}
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

        {/* --- VIP PAYMENT MODAL (IronPay PIX QR Code) --- */}
        <AnimatePresence>
          {isVipPaymentOpen && vipPaymentData && (
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
                    <span>Pagamento {vipPaymentData.plan.name}</span>
                  </h3>
                  <button
                    onClick={() => {
                      setIsVipPaymentOpen(false);
                      setVipPaymentData(null);
                    }}
                    className="p-1 hover:bg-zinc-800 rounded-full cursor-pointer text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {vipPaymentStep === 'creating' && (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[11px] text-zinc-400 mt-3">Gerando QR Code...</p>
                  </div>
                )}

                {vipPaymentStep === 'qr' && (
                  <div className="text-center space-y-4 py-2">
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Escaneie o QR Code abaixo com seu banco para pagar <strong className="text-emerald-400">R$ {vipPaymentData.plan.price.toFixed(2)}</strong> via PIX e ativar o {vipPaymentData.plan.name}!
                    </p>

                    {vipPaymentData.pixQrImage ? (
                      <div className="bg-white p-3 w-48 h-48 mx-auto rounded-xl flex items-center justify-center shadow-lg">
                        <img
                          src={vipPaymentData.pixQrImage}
                          alt="PIX QR Code"
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="bg-zinc-800 p-3 w-48 h-48 mx-auto rounded-xl flex items-center justify-center">
                        <span className="text-xs text-zinc-400">QR Code indisponível</span>
                      </div>
                    )}

                    <div className="bg-black/40 border border-zinc-800 p-2 rounded-xl text-[10px] text-zinc-400 text-left font-mono truncate">
                      {vipPaymentData.pixCode}
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(vipPaymentData.pixCode);
                        showToast('Código PIX copiado!', 'success');
                      }}
                      className="w-full bg-zinc-800 text-white font-bold py-2 rounded-xl text-xs active:scale-95 cursor-pointer"
                    >
                      Copiar Código PIX
                    </button>

                    <p className="text-[10px] text-zinc-500 animate-pulse">
                      Aguardando pagamento... O VIP será ativado automaticamente.
                    </p>
                  </div>
                )}

                {vipPaymentStep === 'success' && (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                      <Check className="w-6 h-6 stroke-[3px]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Pagamento Confirmado!</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        <strong className="text-[#1DB954]">{vipPaymentData.plan.name}</strong> ativado com sucesso! Multiplicador de <strong className="text-yellow-400">{vipPaymentData.plan.multiplier}x</strong> aplicado.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsVipPaymentOpen(false);
                        setVipPaymentData(null);
                      }}
                      className="w-full bg-white text-black py-2 rounded-xl text-xs font-black active:scale-95 cursor-pointer"
                    >
                      Voltar ao Painel
                    </button>
                  </div>
                )}

                {vipPaymentStep === 'error' && (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
                      <X className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Erro no Pagamento</h4>
                      <p className="text-[11px] text-zinc-400 mt-1">{vipPaymentError || 'Tente novamente mais tarde.'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsVipPaymentOpen(false);
                        setVipPaymentData(null);
                      }}
                      className="w-full bg-zinc-800 text-white py-2 rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                    >
                      Fechar
                    </button>
                  </div>
                )}
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
