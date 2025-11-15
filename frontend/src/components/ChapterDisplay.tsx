import React from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { getChapter, getChapterProgress, THEME_COLORS } from '../lib/chapterSystem';

interface ChapterDisplayProps {
  day: number;
  showProgress?: boolean;
}

export function ChapterDisplay({ day, showProgress = true }: ChapterDisplayProps) {
  const chapter = getChapter(day);
  const progress = getChapterProgress(day);
  const theme = THEME_COLORS[chapter.theme];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] backdrop-blur-lg border-white/10 p-6 relative overflow-hidden">
        {/* Background glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.primary} opacity-10 blur-3xl`} />
        
        {/* Content */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <motion.span 
                className="text-5xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                {chapter.emoji}
              </motion.span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-sm font-semibold ${theme.accent} uppercase tracking-wider`}>
                    Chapter {chapter.number}
                  </span>
                  <span className="text-white/40 text-xs">/ 10</span>
                </div>
                <h2 className="text-white text-2xl font-bold mt-1">
                  {chapter.title}
                </h2>
                <p className="text-white/60 text-sm mt-0.5 italic">
                  {chapter.subtitle}
                </p>
              </div>
            </div>
          </div>

          {showProgress && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Journey Progress</span>
                <span className={`font-semibold ${theme.accent}`}>
                  {progress.toFixed(0)}%
                </span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-2" />
                <motion.div
                  className={`absolute inset-0 h-2 rounded-full bg-gradient-to-r ${theme.primary} opacity-20 blur-sm`}
                  animate={{
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

