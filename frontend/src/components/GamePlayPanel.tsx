import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Activity, Heart, Wallet, Zap, Users, Briefcase, Calendar, Loader2 } from 'lucide-react';
import { GameEvent, GameState, GameStatus } from '../lib/api';
import { ActionsPanel, ActionItem } from './ActionsPanel';
import { ManageFinancePanel } from './ManageFinancePanel';

const STAT_CONFIG = [
  { key: 'health' as keyof GameStatus, icon: Activity, label: 'Health', color: 'text-red-400', max: 100 },
  { key: 'mood' as keyof GameStatus, icon: Heart, label: 'Mood', color: 'text-rose-400', max: 100 },
  { key: 'money' as keyof GameStatus, icon: Wallet, label: 'Money', color: 'text-emerald-400', max: 1000 },
];

interface GamePlayPanelProps {
  gameState: GameState;
  apiSource: 'api' | 'mock';
  errorMessage: string | null;
  currentEvent: GameEvent | null;
  loading: boolean;
  showResult: boolean;
  statChanges: Partial<GameStatus>;
  resultText: string;
  onChooseOption: (choiceId: number) => void;
  onActionSelected?: (action: ActionItem) => void;
}

export function GamePlayPanel({
  gameState,
  apiSource,
  errorMessage,
  currentEvent,
  loading,
  showResult,
  statChanges,
  resultText,
  onChooseOption,
  onActionSelected,
}: GamePlayPanelProps) {
  const [selectedTab, setSelectedTab] = React.useState<'actions' | 'finance' | null>(null);
  const hasPositiveChange = Object.values(statChanges).some(value => 
    typeof value === 'number' && value > 0
  );

  return (
    <div className="w-full max-w-2xl space-y-4">
      {apiSource === 'mock' && (
        <Card className="bg-yellow-500/10 border-yellow-500/40 text-yellow-100 text-sm p-3">
          Live API unreachable. Showing built-in demo data so play can continue.
        </Card>
      )}

      {errorMessage && (
        <Card className="bg-red-500/10 border-red-500/40 text-red-100 text-sm p-3">
          {errorMessage}
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STAT_CONFIG.map(({ key, icon: Icon, label, color, max }) => {
          const value = gameState.status[key] as number;
          const percentage = (value / max) * 100;
          const displayValue = key === 'money' ? `$${value}` : `${value}%`;
          
          return (
            <Card key={key} className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-white text-sm">{label}</span>
                </div>
                <span className="text-white text-sm">{displayValue}</span>
              </div>
              <Progress value={percentage} className="h-1.5" />
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            className={`flex-1 border border-white/10 transition-colors text-white ${
              selectedTab === 'actions'
                ? 'bg-black hover:bg-black'
                : 'bg-[#2b2b2b] hover:bg-[#4a4a4a]'
            }`}
            onClick={() => {
              setSelectedTab(selectedTab === 'actions' ? null : 'actions');
            }}
          >
            Actions
          </Button>
          <Button
            type="button"
            className={`flex-1 border border-white/10 transition-colors text-white ${
              selectedTab === 'finance'
                ? 'bg-black hover:bg-black'
                : 'bg-[#2b2b2b] hover:bg-[#4a4a4a]'
            }`}
            onClick={() => {
              setSelectedTab(selectedTab === 'finance' ? null : 'finance');
            }}
          >
            Manage Finance
          </Button>
        </div>

        {selectedTab === 'actions' && (
          <ActionsPanel 
            onSelectAction={onActionSelected}
            currentMoney={gameState.status.money}
            timeAllocation={gameState.time_allocation}
          />
        )}
        {selectedTab === 'finance' && <ManageFinancePanel />}

        <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-4">
          <div className="flex items-center justify-center gap-2 text-white">
            <Calendar className="h-5 w-5" />
            <span>Day {gameState.day} / 10</span>
          </div>
        </Card>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </Card>
        ) : !showResult && currentEvent ? (
          <motion.div
            key="event"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-6 space-y-6">
              <div>
                <p className="text-white/90 leading-relaxed text-lg">{currentEvent.event_message}</p>
              </div>

              <div className="space-y-3">
                {currentEvent.choices?.map((choice) => (
                  <Button
                    key={choice.id}
                    type="button"
                    onClick={() => onChooseOption(choice.id)}
                    className="w-full h-auto py-4 px-4 bg-[#2b2b2b] hover:bg-[#4a4a4a] border border-white/10 text-left"
                    variant="outline"
                    disabled={loading}
                  >
                    <span className="text-white">{choice.text}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </motion.div>
        ) : showResult ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-8 text-center space-y-6">
              <div className="space-y-3">
                <div className="text-4xl">{hasPositiveChange ? '✨' : '💭'}</div>
                <p className="text-white text-lg leading-relaxed">{resultText}</p>
              </div>

              {Object.keys(statChanges).length > 0 && (
                <div className="flex gap-2 justify-center flex-wrap">
                  {STAT_CONFIG.map(({ key, icon: Icon, label }) => {
                    const change = statChanges[key];
                    if (!change || change === 0 || typeof change !== 'number') return null;

                    return (
                      <Badge
                        key={key}
                        className={`${
                          change > 0
                            ? 'bg-orange-500/30 text-orange-200 border-orange-500/50'
                            : 'bg-red-500/30 text-red-200 border-red-500/50'
                        } px-3 py-2`}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {change > 0 ? '+' : ''}
                        {change} {label}
                      </Badge>
                    );
                  })}
                </div>
              )}

              <div className="text-white/50 text-sm pt-4">Moving to day {gameState.day + 1}...</div>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
