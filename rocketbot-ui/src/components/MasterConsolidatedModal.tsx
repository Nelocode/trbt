import React, { useEffect, useState } from 'react';
import {
  X,
  Globe,
  RefreshCw,
  Layers,
  TrendingUp,
  Shield,
  Building2,
  Zap,
  FlaskConical,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { AccountSummary } from './AccountSwitcherDropdown';

interface MasterConsolidatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  isPrivacyMode: boolean;
  token?: string;
  onSelectAccount: (accountId: string) => void;
}

interface ConsolidatedData {
  total_accounts_count: number;
  combined_equity: number;
  combined_free_balance: number;
  combined_used_margin: number;
  combined_realized_pnl: number;
  combined_unrealized_pnl: number;
  combined_total_pnl: number;
  combined_total_pnl_pct: number;
  combined_win_rate: number;
  total_open_trades: number;
  accounts_breakdown: AccountSummary[];
}

export const MasterConsolidatedModal: React.FC<MasterConsolidatedModalProps> = ({
  isOpen,
  onClose,
  apiBase,
  isPrivacyMode,
  token,
  onSelectAccount,
}) => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanicConfirming, setIsPanicConfirming] = useState(false);

  const fetchConsolidated = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${apiBase}/api/v1/accounts/master-consolidated`, { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Error fetching consolidated stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConsolidated();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGlobalPanic = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/risk/panic-close-all?all_accounts=true`, {
        method: 'POST',
      });
      if (res.ok) {
        setIsPanicConfirming(false);
        fetchConsolidated();
      }
    } catch (err) {
      console.error('Error in global panic:', err);
    }
  };

  const formatMoney = (val: number) => {
    if (isPrivacyMode) return '$••••••';
    return `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'prop_firm':
        return {
          icon: <Shield className="w-3 h-3 text-[#00DFDF]" />,
          label: 'PROP FIRM',
          color: 'text-[#00DFDF] bg-[#00DFDF]/10 border-[#00DFDF]/30',
        };
      case 'client_fund':
        return {
          icon: <Building2 className="w-3 h-3 text-[#FFB800]" />,
          label: 'FONDO MAM',
          color: 'text-[#FFB800] bg-[#FFB800]/10 border-[#FFB800]/30',
        };
      case 'live_exchange':
        return {
          icon: <Zap className="w-3 h-3 text-[#FF3B69]" />,
          label: 'REAL EXCHANGE',
          color: 'text-[#FF3B69] bg-[#FF3B69]/10 border-[#FF3B69]/30',
        };
      default:
        return {
          icon: <FlaskConical className="w-3 h-3 text-[#0A7CFF]" />,
          label: 'DRY-RUN',
          color: 'text-[#0A7CFF] bg-[#0A7CFF]/10 border-[#0A7CFF]/30',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0B0E17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="p-4 bg-[#070910] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                Panel Maestro Consolidado (MAM / PAMM Institutional)
              </h2>
              <p className="text-[11px] text-[#8E95A2] font-mono">
                Visión macroscópica agregada de todas las cuentas segregadas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchConsolidated}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#8E95A2] hover:text-white transition cursor-pointer"
              title="Recargar métricas consolidadas"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00DFDF]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="p-5 overflow-y-auto space-y-5 figma-scrollbar flex-1">
          {/* Métricas Agregadas Superiores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase text-[#8E95A2] block mb-1">
                Capital Total Combinado
              </span>
              <span className="text-lg font-bold font-mono text-white block">
                {formatMoney(data?.combined_equity || 0)}
              </span>
              <span className="text-[10px] font-mono text-[#00DFDF] flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" />
                {data?.total_accounts_count || 0} subcuentas activas
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase text-[#8E95A2] block mb-1">
                PnL Total Acumulado
              </span>
              <span
                className={`text-lg font-bold font-mono block ${
                  (data?.combined_total_pnl || 0) >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                }`}
              >
                {(data?.combined_total_pnl || 0) >= 0 ? '+' : ''}
                {formatMoney(data?.combined_total_pnl || 0)}
              </span>
              <span className="text-[10px] font-mono text-[#8E95A2] block mt-1">
                Retorno global: {(data?.combined_total_pnl_pct || 0) >= 0 ? '+' : ''}
                {data?.combined_total_pnl_pct || 0}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase text-[#8E95A2] block mb-1">
                Saldo Libre vs Margen
              </span>
              <span className="text-sm font-bold font-mono text-white block">
                {formatMoney(data?.combined_free_balance || 0)} libre
              </span>
              <span className="text-[10px] font-mono text-[#FFB800] block mt-1">
                {formatMoney(data?.combined_used_margin || 0)} en uso
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <span className="text-[10px] font-mono uppercase text-[#8E95A2] block mb-1">
                Trades Abiertos / Win Rate
              </span>
              <span className="text-lg font-bold font-mono text-white block">
                {data?.total_open_trades || 0} trades
              </span>
              <span className="text-[10px] font-mono text-[#00DFDF] block mt-1">
                Win Rate Promedio: {data?.combined_win_rate || 75}%
              </span>
            </div>
          </div>

          {/* Desglose por Cuenta */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-white font-heading flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0A7CFF]" />
                Desglose Detallado por Cuenta Segregada
              </h3>
              <span className="text-[10px] font-mono text-[#8E95A2]">
                Haz clic en una cuenta para alternar a ella
              </span>
            </div>

            <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#070910] text-[#8E95A2] uppercase text-[10px] border-b border-white/[0.08]">
                  <tr>
                    <th className="py-2.5 px-3">Cuenta</th>
                    <th className="py-2.5 px-3">Tipo / Broker</th>
                    <th className="py-2.5 px-3 text-right">Capital</th>
                    <th className="py-2.5 px-3 text-right">Saldo Libre</th>
                    <th className="py-2.5 px-3 text-right">Margen</th>
                    <th className="py-2.5 px-3 text-center">Trades</th>
                    <th className="py-2.5 px-3 text-right">PnL Total</th>
                    <th className="py-2.5 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {data?.accounts_breakdown.map((acc) => {
                    const badge = getTypeBadge(acc.account_type);
                    return (
                      <tr
                        key={acc.account_id}
                        className="hover:bg-white/[0.03] transition group"
                      >
                        <td className="py-2.5 px-3 font-bold text-white font-heading">
                          <div className="flex items-center gap-1.5">
                            {acc.is_active && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#00DFDF] shadow-[0_0_6px_#00DFDF]" />
                            )}
                            <span className="truncate max-w-[160px]">{acc.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${badge.color}`}
                          >
                            {badge.icon}
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-[#8E95A2] ml-1.5 uppercase">
                            {acc.exchange}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-white">
                          {formatMoney(acc.total_equity)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#8E95A2]">
                          {formatMoney(acc.free_balance)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#FFB800]">
                          {formatMoney(acc.used_margin)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-1.5 py-0.5 rounded bg-white/[0.05] text-white">
                            {acc.open_trades_count || 0}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          <span
                            className={
                              (acc.total_pnl || 0) >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                            }
                          >
                            {(acc.total_pnl || 0) >= 0 ? '+' : ''}
                            {formatMoney(acc.total_pnl)}
                          </span>
                          <span className="text-[10px] text-[#8E95A2] block">
                            {(acc.total_pnl_pct || 0) >= 0 ? '+' : ''}
                            {acc.total_pnl_pct}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => {
                              onSelectAccount(acc.account_id);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#0A7CFF]/15 hover:bg-[#0A7CFF]/25 border border-[#0A7CFF]/30 text-[#0A7CFF] text-[10px] font-bold font-heading inline-flex items-center gap-1 cursor-pointer transition"
                          >
                            <span>Operar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloque de Seguridad: Kill-Switch Global */}
          <div className="p-3.5 rounded-xl bg-[#FF3B69]/10 border border-[#FF3B69]/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertOctagon className="w-5 h-5 text-[#FF3B69] shrink-0" />
              <div>
                <span className="text-xs font-bold text-white font-heading block">
                  Kill-Switch Maestro Global
                </span>
                <p className="text-[10px] text-[#8E95A2] font-mono">
                  Cierra inmediatamente todas las operaciones abiertas en todas las subcuentas y pausa la ejecución.
                </p>
              </div>
            </div>

            {isPanicConfirming ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGlobalPanic}
                  className="px-3 py-1.5 rounded-lg bg-[#FF3B69] hover:bg-[#FF3B69]/90 text-white text-xs font-bold font-heading cursor-pointer shadow-lg animate-pulse"
                >
                  Confirmar Liquidación Total
                </button>
                <button
                  onClick={() => setIsPanicConfirming(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-white text-xs font-heading cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsPanicConfirming(true)}
                className="px-3 py-1.5 rounded-lg bg-[#FF3B69]/20 hover:bg-[#FF3B69]/30 border border-[#FF3B69]/50 text-[#FF3B69] text-xs font-bold font-heading cursor-pointer transition"
              >
                Activar Kill-Switch Global
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
