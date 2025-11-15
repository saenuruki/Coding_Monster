import { Activity, Heart, Wallet, Zap, Users, Briefcase } from 'lucide-react';
import { GameStatus } from '../../lib/api';

export const STAT_CONFIG = [
  { key: 'health' as keyof GameStatus, icon: Activity, label: 'Health', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
  { key: 'happiness' as keyof GameStatus, icon: Heart, label: 'Happiness', color: 'text-rose-400', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/30' },
  { key: 'money' as keyof GameStatus, icon: Wallet, label: 'Money', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30' },
  { key: 'energy' as keyof GameStatus, icon: Zap, label: 'Energy', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
  { key: 'social' as keyof GameStatus, icon: Users, label: 'Social', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
  { key: 'career' as keyof GameStatus, icon: Briefcase, label: 'Career', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
];

