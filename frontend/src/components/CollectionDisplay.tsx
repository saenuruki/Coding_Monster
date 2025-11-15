import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Collection, LifeCard, FinancialBadge, LIFE_CARDS, FINANCIAL_BADGES } from '../lib/collectionSystem';
import { Trophy, BookOpen, Sparkles } from 'lucide-react';

interface CollectionDisplayProps {
  collection: Collection;
}

const RARITY_CONFIG = {
  common: { color: 'from-gray-400 to-gray-500', label: 'Common', glow: 'shadow-gray-500/50' },
  rare: { color: 'from-blue-400 to-blue-600', label: 'Rare', glow: 'shadow-blue-500/50' },
  epic: { color: 'from-purple-400 to-purple-600', label: 'Epic', glow: 'shadow-purple-500/50' },
  legendary: { color: 'from-amber-400 to-orange-600', label: 'Legendary', glow: 'shadow-amber-500/50' }
};

const TIER_CONFIG = {
  bronze: { color: 'from-amber-700 to-amber-900', label: 'Bronze', glow: 'shadow-amber-700/50' },
  silver: { color: 'from-gray-300 to-gray-500', label: 'Silver', glow: 'shadow-gray-400/50' },
  gold: { color: 'from-yellow-400 to-yellow-600', label: 'Gold', glow: 'shadow-yellow-500/50' },
  platinum: { color: 'from-cyan-300 to-blue-500', label: 'Platinum', glow: 'shadow-cyan-400/50' }
};

const CATEGORY_ICONS = {
  milestone: '🏆',
  achievement: '⭐',
  wisdom: '📚'
};

function LifeCardComponent({ card, unlocked }: { card: LifeCard; unlocked: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rarity = RARITY_CONFIG[card.rarity];

  return (
    <motion.div
      className="relative perspective-1000"
      whileHover={{ scale: unlocked ? 1.05 : 1 }}
      onClick={() => unlocked && setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-48 cursor-pointer preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Front of card */}
        <Card
          className={`absolute inset-0 backface-hidden ${
            unlocked ? `bg-gradient-to-br ${rarity.color}` : 'bg-gradient-to-br from-gray-700 to-gray-800'
          } border-white/20 p-4 flex flex-col items-center justify-center ${unlocked ? rarity.glow : ''}`}
        >
          <motion.div
            className="text-6xl mb-3"
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
            {unlocked ? card.icon : '🔒'}
          </motion.div>
          
          {unlocked ? (
            <>
              <h4 className="text-white font-bold text-center mb-1">{card.title}</h4>
              <Badge className="bg-black/30 text-white/80 text-xs">
                {rarity.label}
              </Badge>
              <p className="text-white/60 text-xs mt-2 text-center">
                {CATEGORY_ICONS[card.category]} {card.category}
              </p>
            </>
          ) : (
            <>
              <h4 className="text-white/40 font-bold text-center">???</h4>
              <p className="text-white/30 text-xs text-center mt-2">Locked</p>
            </>
          )}
        </Card>

        {/* Back of card */}
        {unlocked && (
          <Card
            className={`absolute inset-0 backface-hidden bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-white/20 p-4 rotate-y-180`}
          >
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="text-3xl mb-2">{card.icon}</div>
                <h4 className="text-white font-bold text-sm mb-2">{card.title}</h4>
                <p className="text-white/70 text-xs leading-relaxed">{card.description}</p>
              </div>
              
              {card.unlockedAt && (
                <p className="text-white/40 text-xs mt-2">
                  Unlocked: {new Date(card.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}

function FinancialBadgeComponent({ badge, unlocked }: { badge: FinancialBadge; unlocked: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const tier = TIER_CONFIG[badge.tier];

  return (
    <motion.div
      layout
      whileHover={{ scale: unlocked ? 1.03 : 1 }}
    >
      <Card
        className={`${
          unlocked ? `bg-gradient-to-br ${tier.color}` : 'bg-gradient-to-br from-gray-700 to-gray-800'
        } border-white/20 p-4 cursor-pointer ${unlocked ? tier.glow : ''}`}
        onClick={() => unlocked && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <motion.div
            className="text-4xl flex-shrink-0"
            animate={unlocked ? {
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            } : {}}
            transition={{
              duration: 2,
              repeat: unlocked ? Infinity : 0,
              repeatDelay: 5
            }}
          >
            {unlocked ? badge.icon : '🔒'}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-white/40'}`}>
                {unlocked ? badge.title : '???'}
              </h4>
              {unlocked && (
                <Badge className="bg-black/30 text-white/80 text-xs">
                  {tier.label}
                </Badge>
              )}
            </div>
            
            {unlocked ? (
              <>
                <p className="text-white/70 text-xs mb-2">{badge.description}</p>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-white/20"
                    >
                      <div className="bg-black/30 rounded p-2">
                        <p className="text-white/60 text-xs font-semibold mb-1">
                          💡 Financial Concept:
                        </p>
                        <p className="text-white/80 text-xs">
                          {badge.concept}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <p className="text-white/30 text-xs">Locked</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function CollectionDisplay({ collection }: CollectionDisplayProps) {
  const unlockedCards = collection.lifeCards.length;
  const totalCards = LIFE_CARDS.length;
  const unlockedBadges = collection.financialBadges.length;
  const totalBadges = FINANCIAL_BADGES.length;

  const allCards = LIFE_CARDS.map(card => ({
    ...card,
    unlocked: collection.lifeCards.some(c => c.id === card.id)
  }));

  const allBadges = FINANCIAL_BADGES.map(badge => ({
    ...badge,
    unlocked: collection.financialBadges.some(b => b.id === badge.id)
  }));

  return (
    <Card className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] backdrop-blur-lg border-white/10 p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-white text-2xl font-bold">コレクション</h2>
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-white/60 text-sm">Your Journey's Treasures</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-black/20 border-white/10 p-3 text-center">
            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{unlockedCards}/{totalCards}</div>
            <p className="text-white/60 text-xs">Life Cards</p>
          </Card>
          <Card className="bg-black/20 border-white/10 p-3 text-center">
            <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{unlockedBadges}/{totalBadges}</div>
            <p className="text-white/60 text-xs">Financial Badges</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/20">
            <TabsTrigger value="cards" className="data-[state=active]:bg-white/10">
              Life Cards
            </TabsTrigger>
            <TabsTrigger value="badges" className="data-[state=active]:bg-white/10">
              Financial Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-3 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
              {allCards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LifeCardComponent 
                    card={card} 
                    unlocked={card.unlocked || false}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="badges" className="space-y-3 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
              {allBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <FinancialBadgeComponent 
                    badge={badge} 
                    unlocked={badge.unlocked || false}
                  />
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}

