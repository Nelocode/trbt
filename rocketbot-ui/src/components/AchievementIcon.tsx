import React from 'react';
import * as LucideIcons from 'lucide-react';
import { AchievementRarity } from '../data/achievementsData';

interface AchievementIconProps {
  iconName: string;
  rarity?: AchievementRarity;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isUnlocked?: boolean;
  className?: string;
}

export const AchievementIcon: React.FC<AchievementIconProps> = ({
  iconName,
  rarity = 'common',
  size = 'md',
  isUnlocked = true,
  className = '',
}) => {
  // Obtener componente dinámico de Lucide o fallback Trophy
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Trophy;

  // Tamaños de contenedor e icono
  const sizeMap = {
    sm: { box: 'w-7 h-7 rounded-lg', icon: 'w-3.5 h-3.5' },
    md: { box: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5' },
    lg: { box: 'w-13 h-13 rounded-2xl', icon: 'w-6 h-6' },
    xl: { box: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Estilos de rareza institucional con acentos gaming
  const rarityStyles: Record<
    AchievementRarity,
    {
      border: string;
      bg: string;
      iconColor: string;
      glow: string;
      badgeText: string;
    }
  > = {
    common: {
      border: 'border-emerald-500/40',
      bg: 'bg-gradient-to-br from-emerald-950/60 to-slate-900/90',
      iconColor: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
      badgeText: 'Común',
    },
    rare: {
      border: 'border-cyan-500/50',
      bg: 'bg-gradient-to-br from-cyan-950/60 to-slate-900/90',
      iconColor: 'text-cyan-300',
      glow: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]',
      badgeText: 'Raro',
    },
    epic: {
      border: 'border-purple-500/60',
      bg: 'bg-gradient-to-br from-purple-950/70 to-slate-900/90',
      iconColor: 'text-purple-300',
      glow: 'shadow-[0_0_25px_rgba(168,85,247,0.45)]',
      badgeText: 'Épico',
    },
    legendary: {
      border: 'border-amber-400/80',
      bg: 'bg-gradient-to-br from-amber-950/80 via-yellow-950/50 to-slate-950/95',
      iconColor: 'text-amber-300',
      glow: 'shadow-[0_0_30px_rgba(251,191,36,0.55)] ring-1 ring-amber-400/30',
      badgeText: 'Legendario',
    },
  };

  const currentRarity = rarityStyles[rarity] || rarityStyles.common;

  if (!isUnlocked) {
    return (
      <div
        className={`relative flex items-center justify-center shrink-0 border border-slate-700/50 bg-slate-900/60 text-slate-500 ${currentSize.box} ${className}`}
        title="Bloqueado"
      >
        <LucideIcons.Lock className={currentSize.icon} />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 border transition-all duration-300 ${currentRarity.border} ${currentRarity.bg} ${currentRarity.glow} ${currentSize.box} ${className}`}
    >
      <IconComponent className={`${currentSize.icon} ${currentRarity.iconColor}`} />
      {rarity === 'legendary' && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping opacity-75" />
      )}
    </div>
  );
};
