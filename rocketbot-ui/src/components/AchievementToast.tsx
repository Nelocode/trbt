import React, { useEffect, useState, useRef } from 'react';
import { AchievementItem } from '../data/achievementsData';
import { achievementsService } from '../utils/achievementsService';
import { AchievementIcon } from './AchievementIcon';
import { Trophy, X, ChevronRight, Sparkles } from 'lucide-react';

interface AchievementToastProps {
  onOpenTrophyRoom?: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ onOpenTrophyRoom }) => {
  const [currentToast, setCurrentToast] = useState<AchievementItem | null>(null);
  const [queue, setQueue] = useState<AchievementItem[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Suscribirse a nuevos logros desbloqueados
    const unsubscribe = achievementsService.subscribe((item) => {
      setQueue((prev) => [...prev, item]);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Procesar cola de toasts
  useEffect(() => {
    if (!currentToast && queue.length > 0) {
      const nextItem = queue[0];
      setQueue((prev) => prev.slice(1));
      setCurrentToast(nextItem);
      setIsVisible(true);

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        // Pequeño delay de animación de salida antes del siguiente
        setTimeout(() => {
          setCurrentToast(null);
        }, 400);
      }, 5000);
    }
  }, [currentToast, queue]);

  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(() => {
      setCurrentToast(null);
    }, 400);
  };

  const handleClick = () => {
    handleDismiss();
    if (onOpenTrophyRoom) {
      onOpenTrophyRoom();
    }
  };

  if (!currentToast) return null;

  const rarityGlow = {
    common: 'shadow-[0_0_30px_rgba(16,185,129,0.35)] border-emerald-500/40 from-slate-900/95 via-emerald-950/40 to-slate-900/95',
    rare: 'shadow-[0_0_35px_rgba(6,182,212,0.4)] border-cyan-500/50 from-slate-900/95 via-cyan-950/40 to-slate-900/95',
    epic: 'shadow-[0_0_40px_rgba(168,85,247,0.45)] border-purple-500/60 from-slate-900/95 via-purple-950/40 to-slate-900/95',
    legendary: 'shadow-[0_0_50px_rgba(251,191,36,0.6)] border-amber-400/80 from-slate-900/95 via-amber-950/50 to-slate-950/95',
  }[currentToast.rarity] || 'border-emerald-500/40';

  const badgeColor = {
    common: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    rare: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30',
    epic: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
    legendary: 'text-amber-300 bg-amber-500/20 border-amber-400/40',
  }[currentToast.rarity];

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={handleClick}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100000] cursor-pointer transition-all duration-500 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}
      style={{ maxWidth: '92vw', width: '440px' }}
    >
      <div
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-r p-3.5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${rarityGlow}`}
      >
        {/* Línea de brillo superior animada */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80 animate-pulse" />

        <div className="flex items-center gap-3.5">
          {/* Icono con animación de entrada */}
          <div className="relative shrink-0 animate-bounce" style={{ animationIterationCount: 2 }}>
            <AchievementIcon
              iconName={currentToast.iconName}
              rarity={currentToast.rarity}
              size="lg"
              isUnlocked={true}
            />
            {currentToast.rarity === 'legendary' && (
              <Sparkles className="absolute -bottom-1 -right-1 w-4 h-4 text-amber-400 animate-spin" />
            )}
          </div>

          {/* Información del Logro estilo Xbox / Steam */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-emerald-400">
                <Trophy className="w-3 h-3" />
                LOGRO DESBLOQUEADO
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}>
                +{currentToast.xp} XP
              </span>
            </div>

            <h4 className="text-sm font-bold text-white tracking-tight truncate">
              {currentToast.title}
            </h4>

            <p className="text-[11px] text-slate-300/90 leading-tight line-clamp-1 mt-0.5">
              {currentToast.description}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer sutil con barra de tiempo de auto-cierre */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1.5">
          <span className="flex items-center gap-1 hover:text-emerald-300 transition-colors">
            Ver en Sala de Trofeos <ChevronRight className="w-3 h-3" />
          </span>
          {queue.length > 0 && (
            <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full font-mono">
              +{queue.length} más
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
