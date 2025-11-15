import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { GameStatus } from '../../lib/api';
import { STAT_CONFIG } from './stat-config';

interface StatsGridProps {
  status: GameStatus;
}

export function StatsGrid({ status }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {STAT_CONFIG.map(({ key, icon: Icon, label, color }) => (
        <Card key={key} className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-white text-sm">{label}</span>
            </div>
            <span className="text-white text-sm">{status[key]}%</span>
          </div>
          <Progress value={status[key]} className="h-1.5" />
        </Card>
      ))}
    </div>
  );
}

