import React from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { MentorFeedback as MentorFeedbackType, getMentorName } from '../lib/mentorSystem';

interface MentorFeedbackProps {
  feedback: MentorFeedbackType;
  isVisible: boolean;
}

const EMOTION_COLORS = {
  encouraging: 'from-blue-400 to-cyan-500',
  concerned: 'from-yellow-400 to-orange-500',
  proud: 'from-emerald-400 to-teal-500',
  thoughtful: 'from-purple-400 to-indigo-500',
  warning: 'from-red-400 to-rose-500'
};

const EMOTION_BORDER_COLORS = {
  encouraging: 'border-blue-500/40',
  concerned: 'border-yellow-500/40',
  proud: 'border-emerald-500/40',
  thoughtful: 'border-purple-500/40',
  warning: 'border-red-500/40'
};

export function MentorFeedback({ feedback, isVisible }: MentorFeedbackProps) {
  if (!isVisible) return null;

  const gradientColor = EMOTION_COLORS[feedback.emotion];
  const borderColor = EMOTION_BORDER_COLORS[feedback.emotion];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className={`bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] backdrop-blur-lg border ${borderColor} p-4 relative overflow-hidden`}>
        {/* Background glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor} opacity-10 blur-2xl`} />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <motion.div
              className="flex-shrink-0"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center text-3xl border-2 border-white/20 shadow-lg`}>
                {feedback.avatar}
              </div>
            </motion.div>

            {/* Message */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">
                  {getMentorName(feedback.character)}
                </span>
                <span className="text-white/40 text-xs">からのメッセージ</span>
              </div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="bg-black/30 rounded-lg p-3 border border-white/10">
                  <p className="text-white/90 text-sm leading-relaxed">
                    {feedback.message}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative sparkles for positive emotions */}
        {(feedback.emotion === 'proud' || feedback.emotion === 'encouraging') && (
          <>
            <motion.div
              className="absolute top-2 right-2 text-xl"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity
              }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-2 left-2 text-xl"
              animate={{
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1.2, 0.8],
                rotate: [360, 180, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 1
              }}
            >
              ✨
            </motion.div>
          </>
        )}

        {/* Warning indicators */}
        {feedback.emotion === 'warning' && (
          <motion.div
            className="absolute top-2 right-2 text-2xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          >
            ⚠️
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

