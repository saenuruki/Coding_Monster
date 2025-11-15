import { Card } from '../ui/card';
import { Calendar } from 'lucide-react';

interface DayCounterCardProps {
  day: number;
  totalDays?: number;
}

export function DayCounterCard({ day, totalDays = 10 }: DayCounterCardProps) {
  return (
    <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-4">
      <div className="flex items-center justify-center gap-2 text-white">
        <Calendar className="h-5 w-5" />
        <span>
          Day {day} / {totalDays}
        </span>
      </div>
    </Card>
  );
}

