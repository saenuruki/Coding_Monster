import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { GameStatus } from '../../lib/api';
import { STAT_CONFIG } from './stat-config';

interface ResultCardProps {
  statChanges: Partial<GameStatus>;
  resultText: string;
  nextDay: number;
}

export function ResultCard({ statChanges, resultText, nextDay }: ResultCardProps) {
  const hasPositiveChange = Object.values(statChanges).some(change => change && change > 0);

  return (
    <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-8 text-center space-y-6">
      <div className="space-y-3">
        <div className="text-4xl">{hasPositiveChange ? '✨' : '💭'}</div>
        <p className="text-white text-lg leading-relaxed">{resultText}</p>
      </div>

      {Object.keys(statChanges).length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {STAT_CONFIG.map(({ key, icon: Icon, label }) => {
            const change = statChanges[key];
            if (!change || change === 0) return null;

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

      <div className="text-white/50 text-sm pt-4">Moving to day {nextDay}...</div>
    </Card>
  );
}

