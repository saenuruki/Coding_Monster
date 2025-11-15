import { Button } from '../ui/button';

type PanelType = 'actions' | 'finance';

interface QuickControlsProps {
  activePanel: PanelType | null;
  onToggle: (panel: PanelType) => void;
}

export function QuickControls({ activePanel, onToggle }: QuickControlsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-white text-base font-semibold">Quick Controls</p>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onToggle('actions')}
          aria-pressed={activePanel === 'actions'}
          className={`flex-1 min-w-[140px] justify-center border-white/20 text-sm font-medium ${
            activePanel === 'actions'
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-[#2b2b2b] text-white hover:bg-[#4a4a4a]'
          }`}
        >
          Actions
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onToggle('finance')}
          aria-pressed={activePanel === 'finance'}
          className={`flex-1 min-w-[140px] justify-center border-white/20 text-sm font-medium ${
            activePanel === 'finance'
              ? 'bg-white text-black hover:bg-white/90'
              : 'bg-[#2b2b2b] text-white hover:bg-[#4a4a4a]'
          }`}
        >
          Manage Finance
        </Button>
      </div>
    </div>
  );
}

