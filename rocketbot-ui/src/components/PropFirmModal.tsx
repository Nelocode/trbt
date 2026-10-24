import React, { useEffect, useState } from 'react';
import { X, RefreshCw, ShieldCheck, AlertOctagon, Trophy, Target, AlertTriangle } from 'lucide-react';

interface PropFirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  accountId?: string;
}

export const PropFirmModal: React.FC<PropFirmModalProps> = ({ isOpen, onClose, apiBase, accountId }) => {
  const [data, setData] = useState<{
    initial_balance: number;
    current_equity: number;
    profit_pct: number;
    target_profit_pct: number;
    target_remaining_pct: number;
    daily_loss_pct: number;
    daily_remaining_pct: number;
    total_loss_pct: number;
    total_remaining_pct: number;
    status: 'PASSED' | 'BREACHED' | 'IN_PROGRESS';
    is_safe: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const url = accountId
        ? `${apiBase}/api/v1/risk/prop-firm-status?account_id=${encodeURIComponent(accountId)}`
        : `${apiBase}/api/v1/risk/prop-firm-status`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0C101A] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#080A10]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <span>Escudo de Cuentas de Fondeo (Prop Firm Shield)</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#0A7CFF]/20 text-[#0A7CFF] border border-[#0A7CFF]/30">
                  Reglas FTMO / Apex
                </span>
              </h2>
              <p className="text-xs text-[#8E95A2]">
                Monitorea en tiempo real los límites de pérdida máxima diaria (5%) y total (10%) para proteger tus pruebas de fondeo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="p-2 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00DFDF]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {data && (
            <>
              {/* Tarjeta de Estado Global */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  data.status === 'PASSED'
                    ? 'bg-[#00DFDF]/10 border-[#00DFDF]/40 text-[#00DFDF]'
                    : data.status === 'BREACHED'
                    ? 'bg-[#FF3B69]/10 border-[#FF3B69]/40 text-[#FF3B69]'
                    : 'bg-[#0A7CFF]/10 border-[#0A7CFF]/30 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {data.status === 'PASSED' ? (
                    <Trophy className="w-8 h-8 text-[#00DFDF]" />
                  ) : data.status === 'BREACHED' ? (
                    <AlertOctagon className="w-8 h-8 text-[#FF3B69]" />
                  ) : (
                    <ShieldCheck className="w-8 h-8 text-[#0A7CFF]" />
                  )}
                  <div>
                    <div className="text-sm font-bold font-heading">
                      {data.status === 'PASSED'
                        ? '¡Objetivo de Fondeo Alcanzado!'
                        : data.status === 'BREACHED'
                        ? 'Alerta: Regla de Drawdown Excedida'
                        : 'Cuenta en Estado Seguro (En Progreso)'}
                    </div>
                    <div className="text-xs opacity-80">
                      Balance: ${data.current_equity.toLocaleString()} | Retorno acumulado:{' '}
                      <strong>{data.profit_pct >= 0 ? '+' : ''}{data.profit_pct}%</strong>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border bg-black/40">
                  {data.status}
                </span>
              </div>

              {/* Grid de Métricas de Cumplimiento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Pérdida Diaria */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E95A2]">Límite Pérdida Diaria</span>
                    <span className="font-mono font-bold text-white">5.0% Máx</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xs text-[#8E95A2]">Colchón restante:</span>
                    <span className="text-sm font-bold text-[#00DFDF]">{data.daily_remaining_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00DFDF]"
                      style={{ width: `${Math.min(100, (data.daily_remaining_pct / 5.0) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8E95A2]">Pérdida hoy: {data.daily_loss_pct}%</p>
                </div>

                {/* 2. Pérdida Máxima Total */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E95A2]">Drawdown Máximo Total</span>
                    <span className="font-mono font-bold text-white">10.0% Máx</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xs text-[#8E95A2]">Colchón restante:</span>
                    <span className="text-sm font-bold text-[#00DFDF]">{data.total_remaining_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00DFDF]"
                      style={{ width: `${Math.min(100, (data.total_remaining_pct / 10.0) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8E95A2]">Pérdida desde pico: {data.total_loss_pct}%</p>
                </div>

                {/* 3. Meta de Beneficio */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8E95A2]">Meta de Aprobación</span>
                    <span className="font-mono font-bold text-white">8.0% Meta</span>
                  </div>
                  <div className="flex items-baseline justify-between font-mono">
                    <span className="text-xs text-[#8E95A2]">Falta para meta:</span>
                    <span className="text-sm font-bold text-[#A060FF]">{data.target_remaining_pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#A060FF]"
                      style={{
                        width: `${Math.min(100, Math.max(0, (data.profit_pct / data.target_profit_pct) * 100))}%`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-[#8E95A2]">Progreso actual: {data.profit_pct}%</p>
                </div>
              </div>
            </>
          )}

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-2.5 text-xs text-[#8E95A2]">
            <Target className="w-4 h-4 text-[#0A7CFF] shrink-0 mt-0.5" />
            <span>
              <strong>Protección Activa de RocketBot:</strong> Si la pérdida diaria acumulada se aproxima al 4.2% (zona de peligro antes del 5%), el bot entrará automáticamente en modo "Solo Salidas" para preservar la cuenta.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
