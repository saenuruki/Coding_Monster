import { ReactNode } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

interface TermTooltipProps {
  term: string;
  definition: string;
  children: ReactNode;
}

export function TermTooltip({ term, definition, children }: TermTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-slate-900 border-slate-700">
          <p className="font-medium mb-1">{term}</p>
          <p className="text-sm text-slate-300">{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
