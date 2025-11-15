import { GameEvent } from '../../lib/api';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

interface EventCardProps {
  event: GameEvent;
  disabled?: boolean;
  onSelect: (optionIndex: number) => void;
}

export function EventCard({ event, onSelect, disabled }: EventCardProps) {
  return (
    <Card className="bg-[#3a3a3a] backdrop-blur-lg border-white/10 p-6 space-y-6">
      <div>
        <p className="text-white/90 leading-relaxed text-lg">{event.event_message}</p>
      </div>

      <div className="space-y-3">
        {event.options.map((option, index) => (
          <Button
            key={index}
            onClick={() => onSelect(index)}
            disabled={disabled}
            className="w-full h-auto py-4 px-4 bg-[#2b2b2b] hover:bg-[#4a4a4a] border border-white/10 text-left"
            variant="outline"
          >
            <span className="text-white">{option}</span>
          </Button>
        ))}
      </div>
    </Card>
  );
}

