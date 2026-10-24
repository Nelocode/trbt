import React from 'react';
import {
  Radar,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

export interface SignalCondition {
  name: string;
  passed: boolean;
  current: string;
}

export interface RadarSignalItem {
  pair: string;
  category?: 'crypto' | 'commodity' | 'forex' | 'indices';
  asset_name?: string;
  strategy?: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  rsi: number;
  adx: number;
  bb_percent: number;
  rvol: number;
  atr_pct: number;
  regime: 'BULLISH' | 'BEARISH';
  score_long: number;
  score_short: number;
  enter_long: number;
  enter_short: number;
  enter_tag: string;
  conditions_passed: number;
  conditions_total: number;
  conditions: SignalCondition[];
  freqai?: {
    predicted_return_pct: number;
    confidence: number;
    action: string;
  };
}

interface SignalRadarPanelProps {
  signals: RadarSignalItem[];
  selectedPair: string;
  onSelectPair: (pair: string) => void;
  onQuickOrder: (pair: string, side: 'long' | 'short') => void;
}

export const SignalRadarPanel: React.FC<SignalRadarPanelProps> = ({
  signals,
  selectedPair,
  onSelectPair,
  onQuickOrder,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<
    'ALL' | 'CRYPTO' | 'COMMODITIES' | 'FOREX' | 'INDICES'
  >('ALL');

  const safeSignals = Array.isArray(signals) ? signals : [];

  const filteredSignals = safeSignals.filter((s) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'CRYPTO') return (s.category || 'crypto') === 'crypto';
    if (activeCategory === 'COMMODITIES') return s.category === 'commodity';
    if (activeCategory === 'FOREX') return s.category === 'forex';
    if (activeCategory === 'INDICES') return s.category === 'indices';
    return true;
  });

  const activeSignal =
    safeSignals.find((s) => s.pair === selectedPair) || filteredSignals[0] || safeSignals[0];

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case 'commodity':
        return (
          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30">
            ORO / PETRÓLEO
          </span>
        );
      case 'forex':
        return (
          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30">
            FOREX
          </span>
        );
      case 'indices':
        return (
          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#A060FF]/15 text-[#A060FF] border border-[#A060FF]/30">
            ÍNDICE
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
            CRIPTO
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full figma-card overflow-hidden">
      {/* Cabecera estilo Figma con Tooltip */}
      <div className="px-4 py-3 bg-[#0D1017] border-b border-white/[0.08] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-[#0A7CFF] animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              Radar Multi-Activo & Confluencia
            </h3>
            <InfoTooltip
              title="Radar Cuantitativo Multi-Mercado"
              description="Evalúa en tiempo real 5 condiciones estadísticas adaptadas a cada clase de activo: Materias Primas (Donchian/ADX), Divisas Forex (Bollinger/Reversión Media), Índices (Pullbacks a EMA200) y Cripto (Multi-Factor)."
              impact="Permite diversificar y operar activos de alta liquidez global según la mejor confluencia del momento."
            />
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono text-[#A5ABB6] figma-badge-wip">
            {filteredSignals.length} / {safeSignals.length} ACTIVOS
          </span>
        </div>

        {/* Selector de Categorías de Mercado */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {(
            [
              { key: 'ALL', label: 'Todos' },
              { key: 'CRYPTO', label: 'Cripto' },
              { key: 'COMMODITIES', label: 'Oro & Petróleo' },
              { key: 'FOREX', label: 'Divisas' },
              { key: 'INDICES', label: 'Índices' },
            ] as const
          ).map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-semibold transition cursor-pointer whitespace-nowrap ${
                activeCategory === cat.key
                  ? 'bg-[#0A7CFF] text-white shadow-sm shadow-[#0A7CFF]/40'
                  : 'bg-white/[0.04] text-[#8E95A2] hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Pares Filtrados */}
      <div className="divide-y divide-white/[0.05] overflow-y-auto max-h-[280px]">
        {filteredSignals.map((sig) => {
          const isSelected = sig.pair === selectedPair;
          const dominantScore = Math.max(sig.score_long || 0, sig.score_short || 0);
          const isLongDominant = (sig.score_long || 0) >= (sig.score_short || 0);

          return (
            <div
              key={sig.pair}
              onClick={() => onSelectPair(sig.pair)}
              className={`px-4 py-2.5 cursor-pointer transition flex items-center justify-between ${
                isSelected
                  ? 'bg-white/[0.05] border-l-2 border-l-[#0A7CFF]'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-white font-heading">{sig.pair}</span>
                  {getCategoryBadge(sig.category)}
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-mono rounded ${
                      sig.regime === 'BULLISH'
                        ? 'bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30'
                        : 'bg-[#FF3B69]/15 text-[#FF3B69] border border-[#FF3B69]/30'
                    }`}
                  >
                    {sig.regime}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono text-[#8E95A2]">
                  <span className="text-white font-medium">${sig.price}</span>
                  <span className={(sig.change_24h || 0) >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'}>
                    {(sig.change_24h || 0) >= 0 ? '+' : ''}
                    {sig.change_24h}%
                  </span>
                  <span>RSI {sig.rsi}</span>
                  {sig.strategy && (
                    <span className="text-[#0A7CFF] truncate max-w-[110px]">
                      • {sig.strategy.replace('V1', '')}
                    </span>
                  )}
                </div>
              </div>

              {/* Barra de Score */}
              <div className="flex flex-col items-end gap-1 w-24 shrink-0">
                <div className="flex items-center justify-between w-full text-[10px] font-mono">
                  <span className={isLongDominant ? 'text-[#0A7CFF] font-bold' : 'text-[#FF3B69] font-bold'}>
                    {isLongDominant ? 'LONG' : 'SHORT'} {dominantScore.toFixed(0)}%
                  </span>
                  <span className="text-[#8E95A2]">
                    {sig.conditions_passed}/{sig.conditions_total}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#1C1F26] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isLongDominant ? 'bg-[#0A7CFF]' : 'bg-[#FF3B69]'
                    }`}
                    style={{ width: `${Math.min(dominantScore, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnóstico en vivo de las 5 condiciones */}
      {activeSignal && (
        <div className="p-4 bg-[#080A10] border-t border-white/[0.08] flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A5ABB6]">
                  Auditoría: {activeSignal.pair}
                </span>
                {getCategoryBadge(activeSignal.category)}
                <span className="text-[10px] font-mono text-[#0A7CFF]">
                  [{activeSignal.strategy || 'Estrategia'}]
                </span>
                <InfoTooltip
                  title="Auditoría de Condiciones de Entrada"
                  description="Muestra exactamente qué reglas de la estrategia se están cumpliendo (verde) y cuáles impiden la compra automática (gris)."
                  impact="Si falta 1 condición, el bot esperará al cierre de vela sin arriesgar capital."
                />
              </div>
              <span className="text-[11px] font-mono text-[#0A7CFF]">
                RVOL {activeSignal.rvol}x | ATR {activeSignal.atr_pct}%
              </span>
            </div>

            <div className="space-y-1.5">
              {(activeSignal.conditions || []).map((c, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-[#11141E] border border-white/[0.06]"
                >
                  <div className="flex items-center gap-2">
                    {c.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00DFDF] shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#3F4550] shrink-0" />
                    )}
                    <span className={c.passed ? 'text-white font-medium' : 'text-[#676D79]'}>
                      {c.name}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#A5ABB6]">{c.current}</span>
                </div>
              ))}
            </div>

            {/* Predicción FreqAI con Explicación */}
            {activeSignal.freqai && (
              <div className="mt-3 p-3 rounded-xl bg-[#11141E] border border-[#0A7CFF]/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-[#0A7CFF]" />
                  <div>
                    <div className="text-[11px] font-semibold text-white font-heading flex items-center gap-1">
                      <span>FreqAI Machine Learning (6v)</span>
                      <InfoTooltip
                        title="Predicción de IA Adaptativa"
                        description="Modelo Gradient Boosting entrenado en vivo sobre volatilidad y momentum para predecir la dirección de las próximas 6 velas."
                        impact="Un retorno positivo con más de 65% de confianza refuerza la señal de compra Long del bot."
                      />
                    </div>
                    <div className="text-[10px] text-[#8E95A2]">
                      Confianza estadística: {activeSignal.freqai.confidence}%
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div
                    className={`text-xs font-bold ${
                      activeSignal.freqai.predicted_return_pct >= 0
                        ? 'text-[#00DFDF]'
                        : 'text-[#FF3B69]'
                    }`}
                  >
                    {activeSignal.freqai.predicted_return_pct >= 0 ? '+' : ''}
                    {activeSignal.freqai.predicted_return_pct}%
                  </div>
                  <div className="text-[10px] text-[#A5ABB6]">{activeSignal.freqai.action}</div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción rápida */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-white/[0.06]">
            <button
              onClick={() => onQuickOrder(activeSignal.pair, 'long')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg figma-btn-primary text-white text-xs font-bold transition cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>LONG ({activeSignal.pair.split('/')[0]})</span>
            </button>
            <button
              onClick={() => onQuickOrder(activeSignal.pair, 'short')}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg figma-btn-secondary text-white text-xs font-bold transition cursor-pointer"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>SHORT ({activeSignal.pair.split('/')[0]})</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
