import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export function InfoTooltip({ content, side = 'top', className = '' }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          type="button"
          className={`inline-flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors ${className}`}
          onClick={(e) => e.preventDefault()}
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs bg-slate-900 text-white">
        <div className="text-xs leading-relaxed">
          {content}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
