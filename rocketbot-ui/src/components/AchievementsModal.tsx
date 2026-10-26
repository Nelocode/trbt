import React, { useState, useMemo } from 'react';
import {
  ACHIEVEMENTS_DATA,
  AchievementCategory,
  AchievementItem,
  CATEGORY_METADATA,
} from '../data/achievementsData';
import { achievementsService } from '../utils/achievementsService';
import { AchievementIcon } from './AchievementIcon';
import { audioFeedback } from '../utils/audioFeedback';
import {
  Trophy,
  X,
  Search,
  Sparkles,
  Award,
  Shield,
  Zap,
  TrendingUp,
  Globe2,
  BrainCircuit,
  Heart,
  Crown,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(audioFeedback.getSoundEnabled());

  // Forzar actualización cuando se desbloquea un logro
  const [, setTick] = useState(0);

  const stats = useMemo(() => achievementsService.getStats(), [isOpen]);
  const allAchievements = useMemo(() => achievementsService.getAll(), [isOpen]);

  // Filtrado reactivo de logros
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter((item) => {
      const isUnlocked = achievementsService.isUnlocked(item.id);

      // Filtro de categoría
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Filtro de estado
      if (statusFilter === 'unlocked' && !isUnlocked) return false;
      if (statusFilter === 'locked' && isUnlocked) return false;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesId) return false;
      }

      return true;
    });
  }, [allAchievements, selectedCategory, statusFilter, searchQuery]);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const newState = audioFeedback.toggleSound();
    setSoundEnabled(newState);
  };

  const handleTestNotification = () => {
    achievementsService.unlockDemoBatch();
    setTick((prev) => prev + 1);
  };

  const handleReset = () => {
    if (window.confirm('¿Reiniciar todos tus logros y comenzar de cero?')) {
      achievementsService.resetAll();
      setTick((prev) => prev + 1);
    }
  };

  const categoryIcons: Record<AchievementCategory, any> = {
    academia: Award,
    riesgo: Shield,
    ejecucion: Zap,
    rendimiento: TrendingUp,
    multiactivo: Globe2,
    ia_mentor: BrainCircuit,
    disciplina: Heart,
    legendario: Crown,
  };

  return (
    <div
      className="fixed inset-0 z-[99998] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-6xl max-h-[92vh] bg-slate-900/95 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ENCABEZADO GAMING INSTITUCIONAL */}
        <div className="relative p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shrink-0">
          {/* Luz de fondo ambiental */}
          <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-slate-800 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
                <Trophy className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    Sala de Trofeos Cuántica
                  </h2>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> 200 Logros Activos
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    Rango: {stats.rank}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Desbloquea hitos institucionales mientras dominas el análisis, la gestión de riesgo y la IA.
                </p>
              </div>
            </div>

            {/* Barra de progreso global y controles */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col min-w-[200px]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Progreso Global</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {stats.unlockedCount} / {stats.total} ({stats.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-400 h-full transition-all duration-700 ease-out"
                    style={{ width: `${stats.percent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>XP Acumulada</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {stats.earnedXp.toLocaleString()} / {stats.totalXp.toLocaleString()} XP
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestNotification}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center gap-1.5 shadow-sm"
                  title="Desbloquear logros demo de prueba para ver la notificación"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Probar Notificación</span>
                </button>

                <button
                  onClick={handleToggleSound}
                  className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
                  title={soundEnabled ? 'Silenciar sonidos de logros' : 'Activar sonido fanfare'}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                </button>

                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Reiniciar logros"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={onClose}
                  className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                  title="Cerrar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* FILTRO DE CATEGORÍAS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-4 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Todos (200)
            </button>

            {(Object.keys(CATEGORY_METADATA) as AchievementCategory[]).map((cat) => {
              const meta = CATEGORY_METADATA[cat];
              const IconComp = categoryIcons[cat] || Award;
              const catStats = stats.byCategory[cat];
              const isSelected = selectedCategory === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  {meta.name}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-700/50 text-slate-300'
                    }`}
                  >
                    {catStats?.unlocked ?? 0}/25
                  </span>
                </button>
              );
            })}
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTRO DE ESTADO */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/60">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar logro por nombre, descripción o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/70 border border-slate-700/60 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todos ({allAchievements.length})
              </button>
              <button
                onClick={() => setStatusFilter('unlocked')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  statusFilter === 'unlocked'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Desbloqueados ({stats.unlockedCount})
              </button>
              <button
                onClick={() => setStatusFilter('locked')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 ${
                  statusFilter === 'locked'
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3 h-3 text-slate-500" />
                Bloqueados ({stats.total - stats.unlockedCount})
              </button>
            </div>
          </div>
        </div>

        {/* CONTENEDOR DE CUADRÍCULA DE LOGROS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-600" />
              <p className="text-sm font-semibold">No se encontraron logros con los filtros seleccionados.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-emerald-400 hover:underline"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredAchievements.map((item) => {
                const isUnlocked = achievementsService.isUnlocked(item.id);

                const cardBorder = isUnlocked
                  ? {
                      common: 'border-emerald-500/30 hover:border-emerald-500/50 bg-slate-900/80',
                      rare: 'border-cyan-500/40 hover:border-cyan-500/60 bg-slate-900/80',
                      epic: 'border-purple-500/50 hover:border-purple-500/70 bg-slate-900/80',
                      legendary: 'border-amber-400/60 hover:border-amber-400/80 bg-gradient-to-br from-amber-950/20 via-slate-900/90 to-slate-900/90',
                    }[item.rarity]
                  : 'border-slate-800/80 bg-slate-950/50 opacity-60 hover:opacity-80';

                const xpBadge = {
                  common: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  rare: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
                  epic: 'text-purple-300 bg-purple-500/10 border-purple-500/20',
                  legendary: 'text-amber-300 bg-amber-500/20 border-amber-400/30',
                }[item.rarity];

                return (
                  <div
                    key={item.id}
                    className={`relative p-3.5 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 group ${cardBorder}`}
                  >
                    {/* Icono con badge */}
                    <div className="shrink-0 mt-0.5">
                      <AchievementIcon
                        iconName={item.iconName}
                        rarity={item.rarity}
                        size="md"
                        isUnlocked={isUnlocked}
                      />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                          {item.id}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${xpBadge}`}>
                          +{item.xp} XP
                        </span>
                      </div>

                      <h4
                        className={`text-xs font-bold leading-tight ${
                          isUnlocked ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 capitalize">
                          {CATEGORY_METADATA[item.category]?.name}
                        </span>
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Desbloqueado
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PIE DE SALA DE TROFEOS */}
        <div className="p-3.5 px-6 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Común (25 XP)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Raro (50 XP)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Épico (100 XP)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Legendario (250-500 XP)
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Cerrar Sala de Trofeos
          </button>
        </div>
      </div>
    </div>
  );
};
