import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { motion } from 'motion/react';
import { Trophy, Activity, Heart, Wallet, Zap, Users, Briefcase, Award, TrendingUp } from 'lucide-react';
import { GameState, GameStatus } from '../lib/api';

interface EndingScreenProps {
  gameState: GameState;
}

const STAT_CONFIG = [
  { key: 'health' as keyof GameStatus, icon: Activity, label: 'Health', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/30' },
  { key: 'happiness' as keyof GameStatus, icon: Heart, label: 'Happiness', color: 'text-rose-400', bgColor: 'bg-rose-500/20', borderColor: 'border-rose-500/30' },
  { key: 'money' as keyof GameStatus, icon: Wallet, label: 'Money', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20', borderColor: 'border-emerald-500/30' },
  { key: 'energy' as keyof GameStatus, icon: Zap, label: 'Energy', color: 'text-amber-400', bgColor: 'bg-amber-500/20', borderColor: 'border-amber-500/30' },
  { key: 'social' as keyof GameStatus, icon: Users, label: 'Social', color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
  { key: 'career' as keyof GameStatus, icon: Briefcase, label: 'Career', color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
];

export function EndingScreen({ gameState }: EndingScreenProps) {
  const totalScore = Object.values(gameState.status).reduce((sum, val) => sum + val, 0);
  const averageScore = totalScore / 6;
  
  let grade = '';
  let message = '';
  let color = '';
  
  if (averageScore >= 80) {
    grade = 'S';
    message = 'Perfect Balance Master!';
    color = 'from-orange-400 to-orange-600';
  } else if (averageScore >= 70) {
    grade = 'A';
    message = 'Excellent Balance!';
    color = 'from-orange-500 to-orange-700';
  } else if (averageScore >= 60) {
    grade = 'B';
    message = 'Good Balance!';
    color = 'from-orange-600 to-red-600';
  } else if (averageScore >= 50) {
    grade = 'C';
    message = 'Room for Improvement';
    color = 'from-gray-500 to-gray-600';
  } else {
    grade = 'D';
    message = 'Keep Learning!';
    color = 'from-gray-600 to-gray-700';
  }

  const insights: string[] = [];
  
  // Analyze balance
  const scores = Object.values(gameState.status);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const variance = maxScore - minScore;
  
  if (variance < 20) {
    insights.push('Excellent balance! You maintained all aspects of your life equally.');
  } else if (variance > 40) {
    insights.push('Your life is unbalanced. Some areas need more attention.');
  }
  
  // Analyze specific stats
  const highStats = STAT_CONFIG.filter(({ key }) => gameState.status[key] >= 80);
  const lowStats = STAT_CONFIG.filter(({ key }) => gameState.status[key] < 40);
  
  if (highStats.length > 0) {
    insights.push(`Strong in: ${highStats.map(s => s.label).join(', ')}. Keep it up!`);
  }
  
  if (lowStats.length > 0) {
    insights.push(`Needs attention: ${lowStats.map(s => s.label).join(', ')}. Focus on these areas.`);
  }
  
  // Work-life balance
  if (gameState.status.career > 80 && gameState.status.health < 50) {
    insights.push('You\'re a workaholic! Don\'t sacrifice your health for your career.');
  }
  
  if (gameState.status.social > 80 && gameState.status.money < 50) {
    insights.push('You\'re very social, but watch your spending! Balance fun with financial stability.');
  }
  
  if (gameState.status.money > 80 && gameState.status.happiness < 60) {
    insights.push('You\'re financially secure but remember - money isn\'t everything. Enjoy life!');
  }

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-4"
      >
        {/* Grade Card */}
        <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-8 text-center space-y-6">
          <div className="space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="flex justify-center"
            >
              <div className={`bg-gradient-to-br ${color} p-6 rounded-full`}>
                <Trophy className="h-16 w-16 text-white" />
              </div>
            </motion.div>
            
            <div>
              <div className="text-white text-5xl mb-2">Grade: {grade}</div>
              <div className="text-white/80 text-2xl">{message}</div>
            </div>
            
            <div className="text-white/60">
              You completed your 10-day journey!
            </div>
            
            <div className="text-white text-lg">
              Average Score: {Math.round(averageScore)}%
            </div>
          </div>
        </Card>

        {/* Final Stats */}
        <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-6 space-y-4">
          <h3 className="text-white text-lg">Final Status</h3>
          <div className="grid grid-cols-2 gap-4">
            {STAT_CONFIG.map(({ key, icon: Icon, label, color, bgColor, borderColor }) => (
              <div key={key} className="bg-[#2b2b2b] border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <span className="text-white">{label}</span>
                </div>
                <div className="space-y-2">
                  <div className="text-white text-2xl">{gameState.status[key]}%</div>
                  <Progress value={gameState.status[key]} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insights Card */}
        {insights.length > 0 && (
          <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-6 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg">Your Journey Analysis</h3>
            </div>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-start gap-3 bg-white/5 rounded-lg p-3"
                >
                  <TrendingUp className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-white/80 text-sm">{insight}</p>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Key Lessons */}
        <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-6 space-y-4">
          <h3 className="text-white text-lg">Key Life Lessons</h3>
          <div className="space-y-2 text-white/80 text-sm">
            <p>• Life is about balance - no single metric defines success</p>
            <p>• Short-term sacrifices can lead to long-term benefits</p>
            <p>• Your choices create trade-offs - choose wisely</p>
            <p>• Health and relationships are foundations for everything else</p>
            <p>• Financial stability enables freedom, but doesn't guarantee happiness</p>
            <p>• Energy management is as important as time management</p>
          </div>
        </Card>

        <Button
          onClick={handleRestart}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12"
        >
          Play Again
        </Button>
      </motion.div>
    </div>
  );
}
