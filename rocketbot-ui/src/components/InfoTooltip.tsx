import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  description: string;
  impact?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  title,
  description,
  impact,
  side = 'top',
}) => {
  const [visible, setVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <button
        type="button"
        className="text-[#676D79] hover:text-[#0A7CFF] transition-colors p-0.5 rounded cursor-help"
        aria-label={title}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {visible && (
        <div
          className={`absolute z-50 w-72 p-3 text-left figma-card border border-white/[0.12] shadow-2xl backdrop-blur-xl ${positionClasses} pointer-events-none animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="text-xs font-bold text-white font-heading mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A7CFF]" />
            {title}
          </div>
          <p className="text-[11px] text-[#A5ABB6] leading-relaxed mb-2 font-normal">
            {description}
          </p>
          {impact && (
            <div className="pt-2 border-t border-white/[0.08] text-[10px] text-[#EBEEF5]">
              <span className="font-semibold text-[#00DFDF] uppercase tracking-wider block mb-0.5">
                Impacto operativo:
              </span>
              <span className="text-[#A5ABB6]">{impact}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
