import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { SkillProgress, Skill, getSkillsByCategory } from '../lib/skillSystem';
import { Lock, Unlock } from 'lucide-react';

interface SkillTreeDisplayProps {
  skillProgresses: SkillProgress[];
}

const CATEGORY_CONFIG = {
  financial: {
    label: 'Financial',
    color: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-500/20 border-emerald-500/40',
    icon: '💰'
  },
  wellness: {
    label: 'Wellness',
    color: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-500/20 border-pink-500/40',
    icon: '🧘'
  },
  career: {
    label: 'Career',
    color: 'from-purple-400 to-indigo-500',
    bgColor: 'bg-purple-500/20 border-purple-500/40',
    icon: '🎓'
  },
  social: {
    label: 'Social',
    color: 'from-blue-400 to-cyan-500',
    bgColor: 'bg-blue-500/20 border-blue-500/40',
    icon: '🤝'
  }
};

export function SkillTreeDisplay({ skillProgresses }: SkillTreeDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<Skill['category'] | 'all'>('all');
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const filteredSkills = selectedCategory === 'all' 
    ? skillProgresses 
    : getSkillsByCategory(skillProgresses, selectedCategory);

  const unlockedCount = skillProgresses.filter(sp => sp.unlocked).length;
  const totalCount = skillProgresses.length;

  return (
    <Card className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] backdrop-blur-lg border-white/10 p-6 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white text-xl font-bold">成長の軌跡</h3>
            <p className="text-white/60 text-sm">Skill Tree</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {unlockedCount} / {totalCount}
            </div>
            <p className="text-white/60 text-xs">Skills Unlocked</p>
          </div>
        </div>
        
        <Progress value={(unlockedCount / totalCount) * 100} className="h-2" />
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          onClick={() => setSelectedCategory('all')}
          className={`flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-[#2b2b2b] text-white hover:bg-[#4a4a4a]'
          }`}
          size="sm"
        >
          All
        </Button>
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
          <Button
            key={key}
            onClick={() => setSelectedCategory(key as Skill['category'])}
            className={`flex-shrink-0 flex items-center gap-1 ${
              selectedCategory === key
                ? 'bg-white text-black hover:bg-white/90'
                : 'bg-[#2b2b2b] text-white hover:bg-[#4a4a4a]'
            }`}
            size="sm"
          >
            <span>{config.icon}</span>
            <span>{config.label}</span>
          </Button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skillProgress, index) => {
            const { skill, progress, unlocked } = skillProgress;
            const config = CATEGORY_CONFIG[skill.category];
            const isExpanded = expandedSkill === skill.id;

            return (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`${config.bgColor} border p-4 cursor-pointer transition-all ${
                    !unlocked ? 'opacity-60' : ''
                  } ${isExpanded ? 'ring-2 ring-white/40' : ''}`}
                  onClick={() => setExpandedSkill(isExpanded ? null : skill.id)}
                >
                  <div className="space-y-3">
                    {/* Skill header */}
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <motion.div
                          className={`text-4xl`}
                          animate={unlocked ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: unlocked ? Infinity : 0,
                            repeatDelay: 3
                          }}
                        >
                          {skill.icon}
                        </motion.div>
                        
                        {/* Lock/Unlock indicator */}
                        <div className="absolute -top-1 -right-1">
                          {unlocked ? (
                            <Unlock className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Lock className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm">
                          {skill.name}
                        </h4>
                        <p className="text-white/60 text-xs mt-1">
                          {skill.description}
                        </p>
                      </div>
                    </div>

                    {/* Level badges */}
                    <div className="flex items-center gap-1">
                      {[...Array(skill.maxLevel)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + i * 0.1 }}
                        >
                          <Badge
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              i < skill.level
                                ? `bg-gradient-to-br ${config.color} text-white border-white/20`
                                : 'bg-black/40 text-white/40 border-white/10'
                            }`}
                          >
                            {i < skill.level ? '✦' : '◯'}
                          </Badge>
                        </motion.div>
                      ))}
                      <span className="text-white/60 text-xs ml-2">
                        Lv {skill.level}
                      </span>
                    </div>

                    {/* Progress bar (only show if locked but making progress) */}
                    {!unlocked && progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white/60">Progress to unlock</span>
                          <span className="text-white/60">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-1" />
                      </div>
                    )}

                    {/* Expanded info */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-2 border-t border-white/10"
                      >
                        <div className="space-y-2">
                          <p className="text-white/80 text-xs">
                            <strong>Requirements:</strong>
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(skill.requirements).map(([key, value]) => (
                              <Badge
                                key={key}
                                className="bg-black/40 text-white/80 border-white/20 text-xs"
                              >
                                {key}: {value}+
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}

