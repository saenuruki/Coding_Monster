import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  GraduationCap, 
  Briefcase, 
  Users, 
  Gamepad2, 
  BookOpen, 
  DollarSign,
  Clock,
  Heart,
  Film,
  Music,
  Dumbbell,
  Coffee,
  PartyPopper,
  Cat,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { GameStatus } from '../lib/api';

// Impact type with only numeric fields
export interface ActionImpact {
  health?: number;
  mood?: number;
  money?: number;
}

export interface ActionItem {
  id: string;
  name: string;
  type: 'education' | 'work' | 'social' | 'hobby';
  impact: ActionImpact;
  description: string;
  cost?: number;
  time_cost: number; // Time allocation cost in hours
  duration?: string;
  icon?: React.ElementType;
}

const ACTIONS: ActionItem[] = [
  // Education Actions
  {
    id: 'edu-study-30',
    name: 'Study 30 mins',
    type: 'education',
    impact: { money: 5, health: -5, mood: -2 },
    description: 'Focus on your studies for half an hour. Boosts career prospects.',
    time_cost: 0.5,
    duration: '30min',
    icon: BookOpen
  },
  {
    id: 'edu-group-study',
    name: 'Group Study',
    type: 'education',
    impact: { money: 7, health: -10, mood: 8 },
    description: 'Study with classmates for 2 hours. Great for learning and socializing.',
    time_cost: 2,
    duration: '2hrs',
    icon: Users
  },
  {
    id: 'edu-hire-tutor',
    name: 'Hire a Tutor',
    type: 'education',
    impact: { money: -30, mood: 5 },
    description: 'Get personalized help from a professional tutor.',
    cost: 30,
    time_cost: 1.5,
    duration: '1.5hrs',
    icon: GraduationCap
  },
  {
    id: 'edu-learning-service',
    name: 'Subscribe to Learning Service',
    type: 'education',
    impact: { money: -30, mood: 3 },
    description: 'Access online courses and learning materials.',
    cost: 30,
    time_cost: 0,
    duration: 'Instant',
    icon: GraduationCap
  },
  
  // Work Actions
  {
    id: 'work-gig',
    name: 'Do a Quick Gig',
    type: 'work',
    impact: { money: 15, health: -15, mood: -5 },
    description: 'Take on a short task like washing a car or delivering food.',
    time_cost: 1.5,
    duration: '1-2hrs',
    icon: DollarSign
  },
  {
    id: 'work-find-job',
    name: 'Find a Job',
    type: 'work',
    impact: { money: 10, health: -5 },
    description: 'Search for part-time employment opportunities. 3-4 options available.',
    time_cost: 1,
    duration: '1hr',
    icon: Briefcase
  },
  {
    id: 'work-manage-job',
    name: 'Manage Current Job',
    type: 'work',
    impact: { money: 8, mood: 2 },
    description: 'View your current job, adjust hours, or quit if needed.',
    time_cost: 0.5,
    duration: '30min',
    icon: Clock
  },
  
  // Social Actions
  {
    id: 'social-parents',
    name: 'Visit Parents',
    type: 'social',
    impact: { mood: 18, money: 20 },
    description: 'Spend quality time with family. They might help with expenses!',
    time_cost: 3,
    duration: '3hrs',
    icon: Heart
  },
  {
    id: 'social-date',
    name: 'Go on a Date',
    type: 'social',
    impact: { mood: 27, money: -25 },
    description: 'Enjoy a romantic evening with someone special.',
    cost: 25,
    time_cost: 2.5,
    duration: '2-3hrs',
    icon: Heart
  },
  {
    id: 'social-cinema',
    name: 'Go to Cinema',
    type: 'social',
    impact: { mood: 18, money: -15 },
    description: 'Watch a movie with friends and relax.',
    cost: 15,
    time_cost: 2.5,
    duration: '2-3hrs',
    icon: Film
  },
  {
    id: 'social-party',
    name: 'Attend a Party',
    type: 'social',
    impact: { mood: 35, health: -20, money: -20 },
    description: 'Let loose and have fun with friends all night!',
    cost: 20,
    time_cost: 4,
    duration: '4hrs',
    icon: PartyPopper
  },
  {
    id: 'social-bowling',
    name: 'Go Bowling',
    type: 'social',
    impact: { mood: 22, money: -18 },
    description: 'Strike up some fun with friends at the bowling alley.',
    cost: 18,
    time_cost: 2,
    duration: '2hrs',
    icon: Gamepad2
  },
  {
    id: 'social-eat-out',
    name: 'Eat Out',
    type: 'social',
    impact: { mood: 18, money: -20 },
    description: 'Enjoy a meal at a restaurant with friends.',
    cost: 20,
    time_cost: 1.5,
    duration: '1-2hrs',
    icon: Coffee
  },
  {
    id: 'social-gaming',
    name: 'Gaming Session',
    type: 'social',
    impact: { mood: 20, health: -5 },
    description: 'Play online games with friends and have a blast.',
    time_cost: 2,
    duration: '2hrs',
    icon: Gamepad2
  },
  
  // Hobby Actions
  {
    id: 'hobby-gym-once',
    name: 'Gym (One-time)',
    type: 'hobby',
    impact: { health: 10, mood: 5, money: -10 },
    description: 'Get a day pass and work out to stay fit.',
    cost: 10,
    time_cost: 1.5,
    duration: '1-2hrs',
    icon: Dumbbell
  },
  {
    id: 'hobby-gym-sub',
    name: 'Gym Subscription',
    type: 'hobby',
    impact: { health: 15, mood: 8, money: -30 },
    description: 'Subscribe for unlimited gym access this month.',
    cost: 30,
    time_cost: 0,
    duration: 'Instant',
    icon: Dumbbell
  },
  {
    id: 'hobby-music',
    name: 'Listen to Music',
    type: 'hobby',
    impact: { mood: 8, health: 5 },
    description: 'Relax and enjoy your favorite tunes.',
    time_cost: 1,
    duration: '1hr',
    icon: Music
  },
  {
    id: 'hobby-film',
    name: 'Watch a Film',
    type: 'hobby',
    impact: { mood: 10, health: 3 },
    description: 'Enjoy a movie at home and unwind.',
    time_cost: 2,
    duration: '2hrs',
    icon: Film
  },
  {
    id: 'hobby-gaming-solo',
    name: 'Gaming (Solo)',
    type: 'hobby',
    impact: { mood: 12, health: -5 },
    description: 'Play your favorite video games alone.',
    time_cost: 2,
    duration: '2hrs',
    icon: Gamepad2
  },
  {
    id: 'hobby-book',
    name: 'Read a Book',
    type: 'hobby',
    impact: { mood: 8, money: 5, health: 3 },
    description: 'Get lost in a good book and expand your mind.',
    time_cost: 1,
    duration: '1hr',
    icon: BookOpen
  },
  {
    id: 'hobby-walk',
    name: 'Take a Walk',
    type: 'hobby',
    impact: { health: 8, mood: 10 },
    description: 'Go for a refreshing walk outside.',
    time_cost: 0.5,
    duration: '30min',
    icon: Heart
  },
  {
    id: 'hobby-pet-cat',
    name: 'Pet a Cat',
    type: 'hobby',
    impact: { mood: 15, health: 8 },
    description: 'Spend time with a furry friend. Instant mood booster!',
    time_cost: 0.5,
    duration: '30min',
    icon: Cat
  }
];

const ACTION_TYPE_CONFIG = {
  education: { label: 'Education', color: 'bg-blue-500/20 border-blue-500/40', icon: GraduationCap },
  work: { label: 'Work', color: 'bg-emerald-500/20 border-emerald-500/40', icon: Briefcase },
  social: { label: 'Social', color: 'bg-pink-500/20 border-pink-500/40', icon: Users },
  hobby: { label: 'Hobby', color: 'bg-purple-500/20 border-purple-500/40', icon: Gamepad2 }
};

interface ActionsPanelProps {
  onSelectAction?: (action: ActionItem) => void;
  currentMoney?: number;
  timeAllocation?: number;
}

export function ActionsPanel({ onSelectAction, currentMoney = 0, timeAllocation = 8 }: ActionsPanelProps) {
  const [selectedType, setSelectedType] = useState<'education' | 'work' | 'social' | 'hobby'>('education');
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const filteredActions = ACTIONS.filter(action => action.type === selectedType);

  const handleActionClick = (action: ActionItem) => {
    if (expandedAction === action.id) {
      setExpandedAction(null);
    } else {
      setExpandedAction(action.id);
    }
  };

  const handleConfirmAction = (action: ActionItem) => {
    if (action.cost && currentMoney < action.cost) {
      alert(`Not enough money! You need €${action.cost} but only have €${currentMoney}.`);
      return;
    }
    if (action.time_cost > timeAllocation) {
      alert(`Not enough time! This action requires ${action.time_cost} hours but you only have ${timeAllocation.toFixed(1)} hours left today.`);
      return;
    }
    onSelectAction?.(action);
    setExpandedAction(null);
  };

  const renderImpact = (impact: ActionImpact) => {
    const impacts = Object.entries(impact).map(([key, value]) => {
      if (!value || value === 0) return null;
      
      const isPositive = value > 0;
      const Icon = isPositive ? TrendingUp : TrendingDown;
      const color = isPositive ? 'text-emerald-400' : 'text-red-400';
      
      return (
        <Badge 
          key={key}
          className={`${isPositive ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-red-500/20 border-red-500/40'} px-2 py-1`}
        >
          <Icon className={`h-3 w-3 ${color} mr-1`} />
          <span className={color}>
            {isPositive ? '+' : ''}{value} {key}
          </span>
        </Badge>
      );
    });
    
    return <div className="flex flex-wrap gap-1">{impacts}</div>;
  };

  return (
    <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-6 space-y-4">
      <div>
        <p className="text-white text-lg font-semibold">Actions</p>
        <p className="text-white/60 text-sm">Plan your next move.</p>
      </div>

      {/* Time Allocation Display */}
      <Card className="bg-black/20 border-white/10 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <span className="text-white text-sm font-semibold">Time Left Today</span>
          </div>
          <span className={`text-lg font-bold ${timeAllocation > 4 ? 'text-emerald-400' : timeAllocation > 2 ? 'text-yellow-400' : 'text-red-400'}`}>
            {timeAllocation.toFixed(1)} / 8 hrs
          </span>
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(ACTION_TYPE_CONFIG) as Array<keyof typeof ACTION_TYPE_CONFIG>).map((type) => {
          const config = ACTION_TYPE_CONFIG[type];
          const Icon = config.icon;
          return (
            <Button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 ${
                selectedType === type 
                  ? 'bg-black hover:bg-black text-white' 
                  : 'bg-[#2b2b2b] hover:bg-[#4a4a4a] text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {config.label}
            </Button>
          );
        })}
      </div>

      {/* Actions List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredActions.map((action) => {
          const isExpanded = expandedAction === action.id;
          const Icon = action.icon || BookOpen;
          const canAfford = !action.cost || currentMoney >= action.cost;
          const hasEnoughTime = action.time_cost <= timeAllocation;
          const canPerform = canAfford && hasEnoughTime;
          
          return (
            <Card 
              key={action.id} 
              className={`${ACTION_TYPE_CONFIG[action.type].color} border p-3 cursor-pointer transition-all ${
                isExpanded ? 'ring-2 ring-white/20' : ''
              } ${!canPerform ? 'opacity-50' : ''}`}
              onClick={() => handleActionClick(action)}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-semibold text-sm">{action.name}</p>
                      <p className="text-white/60 text-xs mt-1">{action.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {action.duration && (
                      <Badge className="bg-white/10 text-white border-white/20">
                        <Clock className="h-3 w-3 mr-1" />
                        {action.duration}
                      </Badge>
                    )}
                    {action.cost && (
                      <Badge className={`${canAfford ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-red-500/20 border-red-500/40 text-red-300'}`}>
                        <DollarSign className="h-3 w-3 mr-1" />
                        €{action.cost}
                      </Badge>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-white/10">
                      <div>
                        <p className="text-white/60 text-xs mb-2">Impact:</p>
                        {renderImpact(action.impact)}
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmAction(action);
                        }}
                        className="w-full bg-white hover:bg-white/90 text-black font-semibold"
                        disabled={!canPerform}
                      >
                        {!canAfford ? 'Cannot Afford' : !hasEnoughTime ? 'Not Enough Time' : 'Take This Action'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}
