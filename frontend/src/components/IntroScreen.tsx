import { Button } from './ui/button';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { TrendingUp, Heart, Wallet, Activity, Users, Briefcase, Zap } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-8 space-y-6">
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex justify-center"
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl">
                <TrendingUp className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-white text-4xl">Life Balance</h1>
            <p className="text-white/80 text-lg">
              A Journey Through Daily Decisions
            </p>
          </div>

          <div className="space-y-4 py-4">
            <div className="bg-black/20 rounded-lg p-4 space-y-3">
              <p className="text-white/90">
                Navigate 10 days of real-life decisions.
              </p>
              <p className="text-white/90">
                Balance health, happiness, money, energy, social life, and career.
              </p>
              <p className="text-white/90">
                Every choice creates trade-offs. Find your path to success.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-3 text-center">
                <Activity className="h-5 w-5 text-red-400 mx-auto mb-1" />
                <div className="text-white text-xs">Health</div>
              </div>
              <div className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/30 rounded-lg p-3 text-center">
                <Heart className="h-5 w-5 text-rose-400 mx-auto mb-1" />
                <div className="text-white text-xs">Happiness</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-lg p-3 text-center">
                <Wallet className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                <div className="text-white text-xs">Money</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-3 text-center">
                <Zap className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                <div className="text-white text-xs">Energy</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-center">
                <Users className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <div className="text-white text-xs">Social</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg p-3 text-center">
                <Briefcase className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                <div className="text-white text-xs">Career</div>
              </div>
            </div>
          </div>

          <Button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12"
          >
            Start Your Journey
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
