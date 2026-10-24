import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Check,
  Plus,
  Layers,
  Shield,
  FlaskConical,
  Building2,
  Zap,
  Globe,
  Trash2,
} from 'lucide-react';

export interface AccountSummary {
  account_id: string;
  name: string;
  account_type: 'dry_run' | 'prop_firm' | 'live_exchange' | 'client_fund';
  exchange: string;
  trading_mode: 'futures' | 'spot';
  dry_run: boolean;
  state: 'RUNNING' | 'PAUSED' | 'STOPPED';
  active_strategy: string;
  timeframe: string;
  starting_balance: number;
  total_equity: number;
  free_balance: number;
  used_margin: number;
  realized_pnl: number;
  unrealized_pnl: number;
  total_pnl: number;
  total_pnl_pct: number;
  win_rate: number;
  open_trades_count: number;
  max_open_trades: number;
  leverage: number;
  stake_amount: number;
  is_active?: boolean;
}

interface AccountSwitcherDropdownProps {
  apiBase: string;
  activeAccountId: string;
  isPrivacyMode: boolean;
  onAccountSwitched: (accountId: string, accountData: AccountSummary) => void;
  onOpenNewAccountModal: () => void;
  onOpenMasterModal: () => void;
}

export const AccountSwitcherDropdown: React.FC<AccountSwitcherDropdownProps> = ({
  apiBase,
  activeAccountId,
  isPrivacyMode,
  onAccountSwitched,
  onOpenNewAccountModal,
  onOpenMasterModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/accounts`);
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(fetchAccounts, 5000);
    return () => clearInterval(interval);
  }, [apiBase]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = async (accId: string) => {
    if (accId === activeAccountId) {
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/accounts/switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: accId }),
      });
      if (res.ok) {
        const json = await res.json();
        onAccountSwitched(accId, json.account);
        setIsOpen(false);
        fetchAccounts();
      }
    } catch (err) {
      console.error('Error switching account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, accId: string) => {
    e.stopPropagation();
    if (!confirm('¿Estás seguro de eliminar esta subcuenta? Sus operaciones y saldo aislado serán archivados.')) return;
    try {
      const res = await fetch(`${apiBase}/api/v1/accounts/${accId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        fetchAccounts();
        if (json.active_account_id) {
          onAccountSwitched(json.active_account_id, json.accounts[0]);
        }
      }
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  const activeAccount = accounts.find((a) => a.account_id === activeAccountId) || accounts[0] || {
    account_id: 'acc_dryrun_master',
    name: 'Cuenta Master',
    account_type: 'dry_run',
    exchange: 'binance',
    total_equity: 10418.65,
    open_trades_count: 3,
    leverage: 3,
    total_pnl_pct: 4.19,
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

  const activeBadge = getTypeBadge(activeAccount.account_type);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Selector Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] hover:border-white/[0.25] text-white transition-all duration-150 cursor-pointer shadow-sm group"
        title="Cambiar de subcuenta o gestionar cuentas aisladas"
      >
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00DFDF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00DFDF]"></span>
          </span>
          <span className="text-xs font-bold font-heading text-white truncate max-w-[140px] xl:max-w-[200px]">
            {activeAccount.name}
          </span>
        </div>

        <span
          className={`flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${activeBadge.color}`}
        >
          {activeBadge.icon}
          {activeBadge.label}
        </span>

        <span className="text-xs font-mono font-bold text-[#00DFDF]">
          {isPrivacyMode ? '$••••••' : `$${Number(activeAccount.total_equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8E95A2] group-hover:text-white transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menú Dropdown Flotante */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-[#0B0E17] border border-white/[0.14] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header del Dropdown */}
          <div className="p-3 bg-[#070910] border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0A7CFF]" />
              <span className="text-xs font-bold font-heading text-white tracking-wide">
                SISTEMA MULTICUENTA AISLADO
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#00DFDF] bg-[#00DFDF]/10 border border-[#00DFDF]/20 px-1.5 py-0.5 rounded">
              Zero-Cross Shield
            </span>
          </div>

          {/* Lista de Cuentas */}
          <div className="max-h-72 overflow-y-auto p-2 space-y-1.5 figma-scrollbar">
            {accounts.map((acc) => {
              const badge = getTypeBadge(acc.account_type);
              const isSelected = acc.account_id === activeAccountId;

              return (
                <div
                  key={acc.account_id}
                  onClick={() => handleSwitch(acc.account_id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-[#0A7CFF]/15 border-[#0A7CFF]/50 shadow-[0_0_12px_rgba(10,124,255,0.15)]'
                      : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate font-heading">
                        {acc.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0A7CFF] shrink-0" />}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border ${badge.color}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                      <span className="text-[10px] font-mono text-[#8E95A2] uppercase">
                        {acc.exchange} • {acc.leverage}x
                      </span>
                      <span className="text-[10px] font-mono text-[#8E95A2]">
                        {acc.open_trades_count || 0} trades
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-white">
                      {isPrivacyMode
                        ? '$••••••'
                        : `$${Number(acc.total_equity || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`}
                    </div>
                    <div
                      className={`text-[10px] font-mono font-semibold ${
                        (acc.total_pnl_pct || 0) >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                      }`}
                    >
                      {(acc.total_pnl_pct || 0) >= 0 ? '+' : ''}
                      {acc.total_pnl_pct || 0}%
                    </div>
                  </div>

                  {accounts.length > 1 && !isSelected && (
                    <button
                      onClick={(e) => handleDelete(e, acc.account_id)}
                      className="p-1 rounded text-[#8E95A2] hover:text-[#FF3B69] hover:bg-[#FF3B69]/10 transition"
                      title="Eliminar esta subcuenta"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Acciones del Footer */}
          <div className="p-2.5 bg-[#070910] border-t border-white/[0.08] grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenNewAccountModal();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A7CFF]/15 hover:bg-[#0A7CFF]/25 border border-[#0A7CFF]/30 text-[#0A7CFF] text-xs font-bold font-heading transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nueva Cuenta</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenMasterModal();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-bold font-heading transition cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#00DFDF]" />
              <span>Master MAM</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
