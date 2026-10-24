import React, { useState } from 'react';
import {
  X,
  Plus,
  Shield,
  FlaskConical,
  Building2,
  Zap,
  CheckCircle,
  HelpCircle,
  Sliders,
} from 'lucide-react';
import { AccountSummary } from './AccountSwitcherDropdown';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  onAccountCreated: (account: AccountSummary) => void;
}

export const NewAccountModal: React.FC<NewAccountModalProps> = ({
  isOpen,
  onClose,
  apiBase,
  onAccountCreated,
}) => {
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<'dry_run' | 'prop_firm' | 'live_exchange' | 'client_fund'>('dry_run');
  const [exchange, setExchange] = useState('binance');
  const [tradingMode, setTradingMode] = useState<'futures' | 'spot'>('futures');
  const [startingBalance, setStartingBalance] = useState(10000);
  const [leverage, setLeverage] = useState(3.0);
  const [maxOpenTrades, setMaxOpenTrades] = useState(5);
  const [stakeAmount, setStakeAmount] = useState(250);
  const [strategy, setStrategy] = useState('RocketMultiFactorV1');
  const [timeframe, setTimeframe] = useState('5m');

  // Reglas Prop Firm
  const [maxDailyLoss, setMaxDailyLoss] = useState(5.0);
  const [maxTotalLoss, setMaxTotalLoss] = useState(10.0);
  const [profitTarget, setProfitTarget] = useState(8.0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Por favor ingresa un nombre para la cuenta.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const payload = {
        name: name.trim(),
        account_type: accountType,
        exchange,
        trading_mode: tradingMode,
        dry_run: accountType !== 'live_exchange',
        starting_balance: Number(startingBalance),
        leverage: Number(leverage),
        max_open_trades: Number(maxOpenTrades),
        stake_amount: Number(stakeAmount),
        active_strategy: strategy,
        timeframe,
        prop_firm_rules:
          accountType === 'prop_firm'
            ? {
                max_daily_loss_pct: Number(maxDailyLoss),
                max_total_loss_pct: Number(maxTotalLoss),
                profit_target_pct: Number(profitTarget),
              }
            : undefined,
      };

      const res = await fetch(`${apiBase}/api/v1/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al crear la cuenta');
      }

      const json = await res.json();
      onAccountCreated(json.account);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const accountTypePresets = [
    {
      id: 'dry_run',
      title: 'Simulador Dry-Run',
      desc: 'Prueba estrategias con dinero virtual sobre precios en vivo.',
      icon: <FlaskConical className="w-4 h-4 text-[#0A7CFF]" />,
      defaultBal: 10000,
    },
    {
      id: 'prop_firm',
      title: 'Desafío Prop Firm',
      desc: 'Evaluación FTMO / Apex con escudos de drawdown diario y total.',
      icon: <Shield className="w-4 h-4 text-[#00DFDF]" />,
      defaultBal: 100000,
    },
    {
      id: 'client_fund',
      title: 'Fondo MAM / Cliente',
      desc: 'Subcuenta segregada institucional para inversionistas independientes.',
      icon: <Building2 className="w-4 h-4 text-[#FFB800]" />,
      defaultBal: 50000,
    },
    {
      id: 'live_exchange',
      title: 'Cuenta Real Exchange',
      desc: 'Ejecución real con API Keys y fondos propios del exchange.',
      icon: <Zap className="w-4 h-4 text-[#FF3B69]" />,
      defaultBal: 5000,
    },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0B0E17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#070910] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Crear Nueva Cuenta Aislada
              </h2>
              <p className="text-[11px] text-[#8E95A2] font-mono">
                Aislamiento 100% individualizado de balance, trades y riesgo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleCreate} className="p-5 overflow-y-auto space-y-4 figma-scrollbar flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF3B69]/15 border border-[#FF3B69]/40 text-[#FF3B69] text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {/* Selector de Tipo de Cuenta */}
          <div>
            <label className="text-xs font-bold text-white font-heading block mb-2">
              Tipo de Subcuenta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {accountTypePresets.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => {
                    setAccountType(preset.id as any);
                    setStartingBalance(preset.defaultBal);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    accountType === preset.id
                      ? 'bg-[#0A7CFF]/15 border-[#0A7CFF] shadow-[0_0_12px_rgba(10,124,255,0.2)]'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {preset.icon}
                    <span className="text-xs font-bold text-white font-heading">
                      {preset.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#8E95A2] line-clamp-2 leading-relaxed">
                    {preset.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Nombre de la Cuenta */}
          <div>
            <label className="text-xs font-bold text-white font-heading block mb-1.5">
              Nombre o Etiqueta de la Cuenta
            </label>
            <input
              type="text"
              placeholder="Ej: Desafío FTMO $100k, Scalping Cripto, Fondo Alpha..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.12] focus:border-[#0A7CFF] text-white text-xs font-mono outline-none transition"
              required
            />
          </div>

          {/* Exchange y Modo de Mercado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-white font-heading block mb-1.5">
                Exchange / Broker
              </label>
              <select
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0C101A] border border-white/[0.12] text-white text-xs font-mono outline-none"
              >
                <option value="binance">Binance (Cripto)</option>
                <option value="bybit">Bybit (Cripto & Futuros)</option>
                <option value="okx">OKX (Derivados)</option>
                <option value="oanda">Oanda (Forex & Metales)</option>
                <option value="interactive_brokers">Interactive Brokers (Índices & Stocks)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white font-heading block mb-1.5">
                Modo de Ejecución
              </label>
              <select
                value={tradingMode}
                onChange={(e) => setTradingMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#0C101A] border border-white/[0.12] text-white text-xs font-mono outline-none"
              >
                <option value="futures">Futuros Perpetuos (Long & Short)</option>
                <option value="spot">Spot Market (Solo Compras)</option>
              </select>
            </div>
          </div>

          {/* Balance Inicial y Apalancamiento */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-white font-heading block mb-1.5">
                Balance Inicial ($)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={startingBalance}
                onChange={(e) => setStartingBalance(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white font-heading block mb-1.5">
                Apalancamiento
              </label>
              <select
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0C101A] border border-white/[0.12] text-white text-xs font-mono outline-none"
              >
                <option value="1">1x (Sin Apalancar)</option>
                <option value="2">2x (Moderado)</option>
                <option value="3">3x (Recomendado)</option>
                <option value="5">5x (Agresivo)</option>
                <option value="10">10x (Alta Volatilidad)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white font-heading block mb-1.5">
                Trades Máximos
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={maxOpenTrades}
                onChange={(e) => setMaxOpenTrades(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.12] text-white text-xs font-mono outline-none"
              />
            </div>
          </div>

          {/* Estrategia y Timeframe */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-white font-heading block mb-1.5">
                Estrategia Cuantitativa
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0C101A] border border-white/[0.12] text-white text-xs font-mono outline-none"
              >
                <option value="RocketMultiFactorV1">RocketMultiFactorV1 (Cripto Trend)</option>
                <option value="CommodityTrendBreakoutV1">CommodityTrendBreakoutV1 (Oro & Petróleo)</option>
                <option value="ForexMeanReversionV1">ForexMeanReversionV1 (Forex Bollinger)</option>
                <option value="IndexMomentumV1">IndexMomentumV1 (S&P500 & Nasdaq)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-white font-heading block mb-1.5">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0C101A] border border-white/[0.12] text-white text-xs font-mono outline-none"
              >
                <option value="1m">1m (Scalping Intradía)</option>
                <option value="5m">5m (Predeterminado Recomendado)</option>
                <option value="15m">15m (Swing Breakout)</option>
                <option value="1h">1h (Tendencial)</option>
              </select>
            </div>
          </div>

          {/* Parámetros Específicos Prop Firm */}
          {accountType === 'prop_firm' && (
            <div className="p-3.5 rounded-xl bg-[#00DFDF]/5 border border-[#00DFDF]/20 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#00DFDF]" />
                <span className="text-xs font-bold font-heading text-white">
                  Reglas de Prop Firm (FTMO / Apex)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">
                    Pérdida Diaria Máx (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxDailyLoss}
                    onChange={(e) => setMaxDailyLoss(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C101A] border border-white/[0.1] text-xs font-mono text-[#FF3B69]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">
                    Drawdown Total (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={maxTotalLoss}
                    onChange={(e) => setMaxTotalLoss(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C101A] border border-white/[0.1] text-xs font-mono text-[#FF3B69]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">
                    Objetivo Ganancia (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={profitTarget}
                    onChange={(e) => setProfitTarget(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#0C101A] border border-white/[0.1] text-xs font-mono text-[#00DFDF]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-[#00DFDF] shrink-0" />
            <p className="text-[11px] text-[#8E95A2] font-mono">
              Esta cuenta creará una carpeta independiente en <span className="text-white">user_data/accounts/</span> con su propio historial y sin interferir con las demás.
            </p>
          </div>

          {/* Botones */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-bold font-heading transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl figma-btn-primary text-white text-xs font-bold font-heading flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Creando...' : 'Crear e Inicializar Cuenta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
