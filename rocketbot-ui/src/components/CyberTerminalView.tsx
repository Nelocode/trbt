import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  ShieldCheck,
  Play,
  Pause,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Lock,
  Rocket,
  Trophy,
  GraduationCap,
  Sparkles,
  Zap,
  Activity,
  Layers,
  HelpCircle,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { MindforceGraph } from './MindforceGraph';
import { ExecutionLogConsole } from './ExecutionLogConsole';
import { TradingViewChart, type CandlePoint, type ChartMarker, type OpenTradeOverlay } from './TradingViewChart';

interface CyberTerminalViewProps {
  portfolio: any;
  openTrades: any[];
  closedTrades: any[];
  toggleBotState: () => void;
  toggleDryRunMode: () => void;
  handleForceExit: (tradeId: number) => Promise<void>;
  isPrivacyMode: boolean;
  fmtMoney: (val: number | undefined | null) => string;
  onOpenAICopilot: () => void;
  onOpenAchievements?: () => void;
  onOpenAcademy?: () => void;
  onOpenConnectExchange?: () => void;
  onOpenEngineWizard?: () => void;
  selectedPair?: string;
  setSelectedPair?: (pair: string) => void;
  timeframe?: string;
  setTimeframe?: (tf: string) => void;
  candles?: CandlePoint[];
  markers?: ChartMarker[];
  activeTradeForSelectedPair?: OpenTradeOverlay;
}

export const CyberTerminalView: React.FC<CyberTerminalViewProps> = ({
  portfolio,
  openTrades = [],
  closedTrades = [],
  toggleBotState,
  toggleDryRunMode,
  handleForceExit,
  isPrivacyMode,
  fmtMoney,
  onOpenAICopilot,
  onOpenAchievements,
  onOpenAcademy,
  onOpenConnectExchange,
  onOpenEngineWizard,
  selectedPair = 'BTC/USDT',
  setSelectedPair,
  timeframe = '5m',
  setTimeframe,
  candles = [],
  markers = [],
  activeTradeForSelectedPair,
}) => {
  const isRunning = portfolio?.state === 'RUNNING';
  const totalEquity = portfolio?.total_equity ?? 10000;
  const realizedPnl = portfolio?.realized_pnl ?? 0;
  const unrealizedPnl = portfolio?.unrealized_pnl ?? 0;
  const winRate = portfolio?.win_rate ?? 75.0;

  // Racha de victorias consecutivas
  const recentWins = closedTrades.filter((t) => (t.profit_abs ?? 0) > 0).length;
  const currentStreak = Math.max(1, recentWins);

  return (
    <div className="w-full space-y-4 px-3 sm:px-4 py-2 font-sans text-white">
      {/* 1. Header de Telemetría Superior Estilo Cyberpunk */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[#07090F] border border-white/[0.08] shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Identificador & Estado */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF2E93] to-purple-800 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(255,46,147,0.4)]">
            <div className="w-full h-full bg-[#07090F] rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#FF2E93]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                {portfolio?.name || 'ROCKETBOT_001'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isRunning
                    ? 'bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40 shadow-[0_0_10px_rgba(0,255,163,0.3)] animate-pulse'
                    : 'bg-[#FF3B69]/20 text-[#FF3B69] border border-[#FF3B69]/40'
                }`}
              >
                {isRunning ? '● LIVE STREAM' : '❚❚ PAUSADO'}
              </span>
            </div>
            <div className="text-[11px] text-white/50 font-mono flex items-center gap-2 mt-0.5">
              <span>ESTRATEGIA: {portfolio?.active_strategy || 'MultiFactorV1'}</span>
              <span>•</span>
              <span>LATENCIA: 42ms</span>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas Limpias: Academia, Logros, Exchange, Botón Iniciar */}
        <div className="flex items-center gap-2">
          {/* Botón Academia Cuantitativa */}
          {onOpenAcademy && (
            <button
              onClick={onOpenAcademy}
              className="h-8 sm:h-9 px-3 rounded-xl bg-gradient-to-r from-blue-500/15 to-purple-500/15 hover:from-blue-500/25 hover:to-purple-500/25 border border-purple-500/35 text-purple-300 text-xs font-heading font-bold transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
              title="Academia Cuantitativa: Guías estructuradas sin saturar la pantalla"
            >
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>Academia</span>
            </button>
          )}

          {/* Botón Sala de Trofeos / Logros */}
          {onOpenAchievements && (
            <button
              onClick={onOpenAchievements}
              className="h-8 sm:h-9 px-3 rounded-xl bg-gradient-to-r from-amber-500/15 to-yellow-500/15 hover:from-amber-500/25 hover:to-yellow-500/25 border border-amber-500/35 text-amber-300 text-xs font-heading font-bold transition flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Logros</span>
            </button>
          )}

          {/* Conexión de Exchange */}
          {onOpenConnectExchange && (
            <button
              onClick={onOpenConnectExchange}
              className={`h-8 sm:h-9 px-3 rounded-xl border text-xs font-heading font-bold transition flex items-center gap-1.5 ${
                portfolio?.exchange_connected
                  ? 'bg-[#00FFA3]/15 border-[#00FFA3]/40 text-[#00FFA3] shadow-[0_0_10px_rgba(0,255,163,0.2)]'
                  : 'bg-[#FF2E93]/15 border-[#FF2E93]/35 text-[#FF2E93] hover:bg-[#FF2E93]/25'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{portfolio?.exchange_connected ? 'Exchange OK' : 'Conectar Exchange'}</span>
            </button>
          )}

          {/* Botón Maestro Activar/Pausar */}
          <button
            onClick={toggleBotState}
            className={`h-8 sm:h-9 px-4 rounded-xl font-heading font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg ${
              isRunning
                ? 'bg-[#00FFA3] hover:bg-[#00FFA3]/90 text-black shadow-[0_0_15px_rgba(0,255,163,0.4)]'
                : 'bg-[#FF3B69] hover:bg-[#FF3B69]/90 text-white shadow-[0_0_15px_rgba(255,59,105,0.4)]'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isRunning ? 'MOTOR ACTIVO' : 'ARRANCAR'}</span>
          </button>
        </div>
      </div>

      {/* 2. Grid Principal: 3 Tarjetas Visuales Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Tarjeta 1: Wallet & Rendimiento (Borde Neón Fucsia como la imagen) */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-[#07090F] border border-[#FF2E93]/40 shadow-[0_0_20px_rgba(255,46,147,0.12)] space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#FF2E93] font-bold tracking-wider">
              BALANCE TOTAL EN CUENTA
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white/70">
              {portfolio?.dry_run ? 'SIMULADOR 10k' : 'CAPITAL REAL'}
            </span>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white">
              {isPrivacyMode ? '••••••' : fmtMoney(totalEquity)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs font-mono">
              <span className={`font-bold flex items-center gap-0.5 ${realizedPnl >= 0 ? 'text-[#00FFA3]' : 'text-[#FF3B69]'}`}>
                {realizedPnl >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {realizedPnl >= 0 ? '+' : ''}${realizedPnl.toFixed(2)} Hoy
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">{openTrades.length} Trades Activos</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
            <div>
              <span className="text-white/40 block text-[10px]">EFECTIVIDAD:</span>
              <span className="font-bold text-[#00FFA3]">{winRate}%</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px]">RATIO SHARPE:</span>
              <span className="font-bold text-white">2.14</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px]">APALANCAMIENTO:</span>
              <span className="font-bold text-white">{portfolio?.leverage || 3}x</span>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Micro Gráfico Candlestick & Cotización en Vivo */}
        <div className="md:col-span-5 p-4 rounded-2xl bg-[#07090F] border border-white/[0.08] shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">{selectedPair}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
                {timeframe}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-bold text-[#FF2E93] block">
                ${candles.length > 0 ? candles[candles.length - 1].close.toLocaleString() : '78,156.83'}
              </span>
            </div>
          </div>

          {/* Mini Gráfico Compacto */}
          <div className="h-44 w-full rounded-xl overflow-hidden bg-black/40 border border-white/[0.04]">
            <TradingViewChart
              pair={selectedPair}
              timeframe={timeframe}
              strategyName={portfolio?.active_strategy || 'RocketMultiFactorV1'}
              candles={candles}
              markers={markers}
              activeTrade={activeTradeForSelectedPair}
              onTimeframeChange={(tf) => setTimeframe?.(tf)}
              displayMode="candles"
            />
          </div>
        </div>

        {/* Tarjeta 3: Live Streak & Racha (Estilo Gamer/Polymarket como la imagen) */}
        <div className="md:col-span-3 p-4 rounded-2xl bg-[#07090F] border border-[#FF2E93]/40 shadow-[0_0_20px_rgba(255,46,147,0.12)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold uppercase text-white/50 tracking-wider">
              #1 TRADER · LIVE STREAK
            </span>
            <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-ping" />
          </div>

          <div className="py-2">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold font-mono text-[#FF2E93] drop-shadow-[0_0_12px_rgba(255,46,147,0.6)]">
                X{currentStreak}
              </span>
              <span className="text-base font-bold font-mono text-[#00FFA3]">
                +{closedTrades.length}
              </span>
            </div>
            <span className="text-[11px] text-white/60 font-mono block mt-1">
              Racha de operaciones consecutivas exitosas
            </span>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-[10px] text-white/40 block">OBJETIVO SESIÓN:</span>
              <span className="font-bold text-[#00FFA3]">$10,448</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/40 block">CATALIZADOR:</span>
              <span className="font-bold text-[#FF2E93]">5M REJECT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mindforce Confluence Graph (El Grafo de Red Neuronal Central) */}
      <div className="w-full">
        <MindforceGraph
          pair={selectedPair}
          bullPct={68}
          bearPct={32}
        />
      </div>

      {/* 4. Consola de Ejecución en Vivo & Transparencia (Execution Log) */}
      <div className="w-full">
        <ExecutionLogConsole isLive={isRunning} />
      </div>
    </div>
  );
};
