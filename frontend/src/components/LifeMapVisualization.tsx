import React from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { GameStatus } from '../lib/api';
import { Activity, Heart, Wallet, Zap, Users, Briefcase } from 'lucide-react';
import { THEME_COLORS } from '../lib/chapterSystem';

interface LifeMapVisualizationProps {
  status: GameStatus;
  theme: keyof typeof THEME_COLORS;
}

const STAT_CONFIG = [
  { key: 'health' as keyof GameStatus, icon: Activity, label: 'Health', emoji: '🏥', position: { top: '10%', left: '15%' } },
  { key: 'happiness' as keyof GameStatus, icon: Heart, label: 'Happiness', emoji: '😊', position: { top: '25%', right: '15%' } },
  { key: 'money' as keyof GameStatus, icon: Wallet, label: 'Money', emoji: '💰', position: { top: '45%', left: '10%' } },
  { key: 'energy' as keyof GameStatus, icon: Zap, label: 'Energy', emoji: '⚡', position: { top: '40%', right: '20%' } },
  { key: 'social' as keyof GameStatus, icon: Users, label: 'Social', emoji: '👥', position: { bottom: '25%', left: '20%' } },
  { key: 'career' as keyof GameStatus, icon: Briefcase, label: 'Career', emoji: '💼', position: { bottom: '15%', right: '15%' } },
];

function getStatusColor(value: number): string {
  if (value >= 70) return 'from-emerald-400 to-teal-500';
  if (value >= 40) return 'from-yellow-400 to-orange-500';
  return 'from-red-400 to-rose-600';
}

function getWeatherCondition(status: GameStatus): string {
  const avgStatus = (status.health + status.happiness + status.money + status.energy + status.social + status.career) / 6;
  
  if (avgStatus >= 70) return '☀️';
  if (avgStatus >= 50) return '⛅';
  if (avgStatus >= 30) return '🌧️';
  return '⛈️';
}

function getIslandStatus(status: GameStatus): { visible: number; total: number } {
  const statuses = [status.health, status.happiness, status.money, status.energy, status.social, status.career];
  const visibleIslands = statuses.filter(s => s >= 30).length;
  return { visible: visibleIslands, total: 6 };
}

export function LifeMapVisualization({ status, theme }: LifeMapVisualizationProps) {
  const themeColors = THEME_COLORS[theme];
  const weather = getWeatherCondition(status);
  const islands = getIslandStatus(status);

  return (
    <Card className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] backdrop-blur-lg border-white/10 p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        {/* Animated waves */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/30 to-transparent"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cyan-500/20 to-transparent"
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>

      {/* Weather indicator */}
      <div className="absolute top-4 left-4 z-20">
        <motion.div
          className="text-4xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          {weather}
        </motion.div>
      </div>

      {/* Island counter */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏝️</span>
            <span className="text-white text-sm font-semibold">
              {islands.visible}/{islands.total}
            </span>
          </div>
          <p className="text-white/60 text-xs mt-0.5">Islands Discovered</p>
        </div>
      </div>

      {/* Main content - Life Map with status orbs */}
      <div className="relative h-96 mt-8">
        {/* Central path/journey line */}
        <svg className="absolute inset-0 w-full h-full opacity-20" style={{ zIndex: 1 }}>
          <motion.path
            d="M 50 350 Q 150 280, 200 200 T 400 50"
            stroke="url(#pathGradient)"
            strokeWidth="3"
            fill="none"
            strokeDasharray="10,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>

        {/* Status orbs positioned like islands */}
        {STAT_CONFIG.map(({ key, icon: Icon, label, emoji, position }, index) => {
          const value = status[key];
          const statusColor = getStatusColor(value);
          const isLow = value < 30;
          
          return (
            <motion.div
              key={key}
              className="absolute"
              style={position}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isLow ? 0.4 : 1, 
                scale: 1,
                y: isLow ? [0, 10, 0] : 0
              }}
              transition={{ 
                delay: index * 0.1,
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <div className="relative">
                {/* Glow effect */}
                <motion.div
                  className={`absolute inset-0 rounded-full bg-gradient-to-r ${statusColor} opacity-30 blur-xl`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                />
                
                {/* Main orb */}
                <div className={`relative bg-gradient-to-br ${statusColor} rounded-full p-4 border-2 border-white/30 shadow-lg`}>
                  <div className="text-center">
                    <div className="text-3xl mb-1">{emoji}</div>
                    <div className="text-white text-xs font-bold">{value}%</div>
                  </div>
                </div>

                {/* Label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <div className="bg-black/60 backdrop-blur-sm rounded px-2 py-1 border border-white/20">
                    <p className="text-white text-xs font-semibold">{label}</p>
                  </div>
                </div>

                {/* Warning indicator for low values */}
                {isLow && (
                  <motion.div
                    className="absolute -top-2 -right-2 text-xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  >
                    ⚠️
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Ship/Player indicator */}
        <motion.div
          className="absolute"
          style={{ 
            bottom: '10%', 
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [-2, 2, -2]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className={`text-6xl drop-shadow-2xl`}>
            ⛵
          </div>
        </motion.div>
      </div>

      {/* Bottom info */}
      <div className="mt-4 text-center">
        <p className="text-white/60 text-sm italic">
          Navigate your life's journey through the seas of choices
        </p>
      </div>
    </Card>
  );
}

