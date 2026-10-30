import React, { useState } from 'react';
import {
  X,
  Terminal,
  Activity,
  Zap,
  Shield,
  Layers,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from 'lucide-react';

export interface ExecutionLogItem {
  id: string;
  time: string;
  type: 'IN' | 'WIN' | 'LOSS' | 'SKIP' | 'CANCEL' | 'AUDIT';
  pair: string;
  side: 'UP' | 'DOWN' | 'LONG' | 'SHORT';
  size: string;
  confidencePct: number;
  message: string;
  pnl?: string;
}

interface ExecutionLogProps {
  logs?: ExecutionLogItem[];
  isLive?: boolean;
}

const DEFAULT_LOGS: ExecutionLogItem[] = [
  {
    id: '1',
    time: '18:16:09',
    type: 'IN',
    pair: 'BTC/USDT',
    side: 'UP',
    size: '$0.01',
    confidencePct: 56.6,
    message: '5M reject Binance · Polymarket UP still 0.51 edge',
  },
  {
    id: '2',
    time: '18:16:08',
    type: 'WIN',
    pair: 'BTC/USDT',
    side: 'DOWN',
    size: '$0.01',
    confidencePct: 62.4,
    pnl: '+$0.05',
    message: '5M close confirmed · TP hit +0.71% · Balance $1.19',
  },
  {
    id: '3',
    time: '18:16:08',
    type: 'SKIP',
    pair: 'ETH/USDT',
    side: 'UP',
    size: '$0.00',
    confidencePct: 48.0,
    message: 'Convergence only 48% · Delta flip pending · skip',
  },
  {
    id: '4',
    time: '18:16:07',
    type: 'IN',
    pair: 'BTC/USDT',
    side: 'DOWN',
    size: '$0.01',
    confidencePct: 58.7,
    message: 'CryptoQuant +312 BTC outflow · Polymarket lag +0.42%',
  },
  {
    id: '5',
    time: '18:16:07',
    type: 'WIN',
    pair: 'BTC/USDT',
    side: 'DOWN',
    size: '$0.01',
    confidencePct: 65.1,
    pnl: '+$0.05',
    message: 'Polymarket caught up · exit 0.514 · clean fill $1.14',
  },
  {
    id: '6',
    time: '18:16:06',
    type: 'SKIP',
    pair: 'SOL/USDT',
    side: 'UP',
    size: '$0.00',
    confidencePct: 44.5,
    message: 'Funding rate spike detected · High slippage risk · skip',
  },
];

export const ExecutionLogConsole: React.FC<ExecutionLogProps> = ({
  logs = DEFAULT_LOGS,
  isLive = true,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = logs.filter((item) => {
    if (filterType === 'all') return true;
    if (filterType === 'trades') return item.type === 'IN' || item.type === 'WIN' || item.type === 'LOSS';
    if (filterType === 'skips') return item.type === 'SKIP';
    return true;
  });

  return (
    <div className="w-full rounded-2xl bg-[#05070D] border border-white/[0.08] overflow-hidden shadow-2xl flex flex-col font-mono text-xs">
      {/* Console Header */}
      <div className="px-4 py-2.5 bg-black/60 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#00FFA3]" />
          <span className="font-bold text-white tracking-wider text-[11px] uppercase">
            Execution Log · Transparent Engine
          </span>
          {isLive && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE STREAM
            </span>
          )}
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-1 text-[10px]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'all' ? 'bg-white/15 text-white font-bold' : 'text-white/40 hover:text-white'
            }`}
          >
            TODOS ({logs.length})
          </button>
          <button
            onClick={() => setFilterType('trades')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'trades' ? 'bg-[#00FFA3]/20 text-[#00FFA3] font-bold' : 'text-white/40 hover:text-white'
            }`}
          >
            TRADES
          </button>
          <button
            onClick={() => setFilterType('skips')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'skips' ? 'bg-[#FFB800]/20 text-[#FFB800] font-bold' : 'text-white/40 hover:text-white'
            }`}
          >
            DESCARTADOS (SKIPS)
          </button>
        </div>
      </div>

      {/* Console Rows */}
      <div className="p-3 space-y-1.5 max-h-52 overflow-y-auto divide-y divide-white/[0.03]">
        {filtered.map((item) => {
          let badgeColor = 'bg-white/10 text-white';
          if (item.type === 'IN') badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40';
          if (item.type === 'WIN') badgeColor = 'bg-[#00FFA3]/20 text-[#00FFA3] border border-[#00FFA3]/40';
          if (item.type === 'LOSS') badgeColor = 'bg-[#FF3B69]/20 text-[#FF3B69] border border-[#FF3B69]/40';
          if (item.type === 'SKIP') badgeColor = 'bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40';

          return (
            <div
              key={item.id}
              className="pt-1.5 first:pt-0 flex items-center justify-between gap-3 text-[11px] leading-relaxed hover:bg-white/[0.02] px-1 rounded transition"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-white/30 text-[10px] shrink-0">{item.time}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${badgeColor}`}>
                  {item.type}
                </span>
                <span className="text-white/70 font-bold shrink-0">{item.side}</span>
                <span className="text-white/50 text-[10px] shrink-0">sz {item.size}</span>
                <span className="text-[#FF2E93] text-[10px] shrink-0 font-bold">
                  {item.confidencePct}%
                </span>
                <span className="text-white/80 truncate text-[11px]">{item.message}</span>
              </div>

              {item.pnl && (
                <span className="font-bold text-[#00FFA3] text-xs shrink-0">{item.pnl}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
