import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom';
  }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 288; // 18rem = 288px (w-72)

    // Si está cerca del borde superior (< 220px) o se especifica 'bottom', abrir hacia abajo
    let placement: 'top' | 'bottom' = side === 'bottom' ? 'bottom' : 'top';
    if (placement === 'top' && rect.top < 220) {
      placement = 'bottom';
    }

    let top = 0;
    if (placement === 'top') {
      top = rect.top - 8;
    } else {
      top = rect.bottom + 8;
    }

    // Centrar horizontalmente respecto al icono del trigger, acotado dentro de la ventana
    let left = rect.left + rect.width / 2 - tooltipWidth / 2;
    const padding = 12;
    if (left < padding) {
      left = padding;
    } else if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    setCoords({ top, left, placement });
  }, [side]);

  const handleMouseEnter = () => {
    updatePosition();
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    updatePosition();
    setVisible((prev) => !prev);
  };

  useEffect(() => {
    if (!visible) return;

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, updatePosition]);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        className="text-[#676D79] hover:text-[#0A7CFF] transition-colors p-0.5 rounded cursor-help focus:outline-none"
        aria-label={title}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: coords.placement === 'top' ? 'translateY(-100%)' : 'none',
            }}
            className="fixed z-[99999] w-72 p-3 text-left figma-card border border-white/[0.12] shadow-2xl backdrop-blur-xl pointer-events-none animate-in fade-in zoom-in-95 duration-150"
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
          </div>,
          document.body
        )}
    </div>
  );
};
