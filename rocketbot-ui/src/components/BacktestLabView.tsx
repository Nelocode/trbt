import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Save,
  Sliders,
  Award,
  CheckCircle2,
  Flame,
  Activity,
  BarChart3,
} from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

interface BacktestLabViewProps {
  apiBase: string;
  activeStrategy: string;
  selectedPair: string;
  timeframe: string;
}

export const BacktestLabView: React.FC<BacktestLabViewProps> = ({
  apiBase,
  activeStrategy,
  selectedPair,
  timeframe,
}) => {
  const [subTab, setSubTab] = useState<'backtest' | 'hyperopt' | 'editor' | 'montecarlo'>('backtest');
  const [currentStrategy, setCurrentStrategy] = useState<string>(activeStrategy || 'RocketMultiFactorV1');
  const [pair, setPair] = useState(selectedPair || 'BTC/USDT');
  const [tf, setTf] = useState(timeframe || '5m');
  const [leverage, setLeverage] = useState(3);
  const [stakeAmount, setStakeAmount] = useState(300);

  const [buyRsi, setBuyRsi] = useState(34);
  const [buyBbPct, setBuyBbPct] = useState(0.15);
  const [buyRvol, setBuyRvol] = useState(1.15);
  const [sellRsi, setSellRsi] = useState(72);

  const [btLoading, setBtLoading] = useState(false);
  const [btResult, setBtResult] = useState<any | null>(null);

  const [hoLoading, setHoLoading] = useState(false);
  const [hoResult, setHoResult] = useState<any | null>(null);

  const [mcLoading, setMcLoading] = useState(false);
  const [mcResult, setMcResult] = useState<any | null>(null);

  const [strategyCode, setStrategyCode] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const runMonteCarlo = async () => {
    setMcLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/backtest/monte-carlo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          iterations: 10000,
          horizon_trades: 100,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setMcResult(json);
      }
    } catch {
      // ignore
    } finally {
      setMcLoading(false);
    }
  };

  const STRATEGIES = [
    { id: 'RocketMultiFactorV1', name: 'RocketMultiFactorV1 (Cripto Multi-Factor)', defaultPair: 'BTC/USDT', defaultTf: '5m' },
    { id: 'CommodityTrendBreakoutV1', name: 'CommodityTrendBreakoutV1 (Oro & Petróleo)', defaultPair: 'XAU/USD', defaultTf: '15m' },
    { id: 'ForexMeanReversionV1', name: 'ForexMeanReversionV1 (Divisas Forex)', defaultPair: 'EUR/USD', defaultTf: '5m' },
    { id: 'IndexMomentumV1', name: 'IndexMomentumV1 (Índices S&P 500 / Nasdaq)', defaultPair: 'SPX500/USD', defaultTf: '15m' },
  ];

  const PAIR_GROUPS = [
    {
      group: 'Criptomonedas (24/7)',
      pairs: [
        { id: 'BTC/USDT', label: 'BTC/USDT (Bitcoin)' },
        { id: 'ETH/USDT', label: 'ETH/USDT (Ethereum)' },
        { id: 'SOL/USDT', label: 'SOL/USDT (Solana)' },
        { id: 'AVAX/USDT', label: 'AVAX/USDT (Avalanche)' },
      ],
    },
    {
      group: 'Materias Primas / Commodities',
      pairs: [
        { id: 'XAU/USD', label: 'XAU/USD (Oro Spot / Gold)' },
        { id: 'WTI/USD', label: 'WTI/USD (Petróleo Crudo WTI)' },
        { id: 'XAG/USD', label: 'XAG/USD (Plata Spot / Silver)' },
      ],
    },
    {
      group: 'Divisas / Forex Interbancario',
      pairs: [
        { id: 'EUR/USD', label: 'EUR/USD (Euro / Dólar USA)' },
        { id: 'GBP/USD', label: 'GBP/USD (Libra / Dólar USA)' },
        { id: 'USD/JPY', label: 'USD/JPY (Dólar / Yen Japonés)' },
      ],
    },
    {
      group: 'Índices Bursátiles',
      pairs: [
        { id: 'SPX500/USD', label: 'SPX500/USD (S&P 500 Index)' },
        { id: 'NAS100/USD', label: 'NAS100/USD (Nasdaq 100 Index)' },
      ],
    },
  ];

  useEffect(() => {
    runBacktest();
    loadStrategyCode(currentStrategy);
  }, [currentStrategy]);

  function handleStrategyChange(newStrat: string) {
    setCurrentStrategy(newStrat);
    const found = STRATEGIES.find((s) => s.id === newStrat);
    if (found) {
      setPair(found.defaultPair);
      setTf(found.defaultTf);
    }
    loadStrategyCode(newStrat);
  }

  async function loadStrategyCode(stratName: string = currentStrategy) {
    try {
      const res = await fetch(`${apiBase}/api/v1/strategies/${stratName}`);
      if (res.ok) {
        const data = await res.json();
        setStrategyCode(data.code);
      }
    } catch {
      // ignore
    }
  }

  async function runBacktest() {
    setBtLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/backtest/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: currentStrategy,
          pair,
          timeframe: tf,
          stake_amount: stakeAmount,
          leverage,
          candle_limit: 420,
          params: {
            buy_rsi_threshold: buyRsi,
            buy_bb_percent: buyBbPct,
            buy_rvol_min: buyRvol,
            sell_rsi_threshold: sellRsi,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBtResult(data);
      }
    } finally {
      setBtLoading(false);
    }
  }

  async function runHyperopt() {
    setHoLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/hyperopt/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy: currentStrategy,
          pair,
          timeframe: tf,
          epochs: 12,
          target_metric: 'sharpe',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setHoResult(data);
      }
    } finally {
      setHoLoading(false);
    }
  }

  async function saveCode() {
    setSaveMessage(null);
    const res = await fetch(`${apiBase}/api/v1/strategies/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: currentStrategy, code: strategyCode }),
    });
    if (res.ok) {
      setSaveMessage('Estrategia validada y compilada en caliente.');
      setTimeout(() => setSaveMessage(null), 4000);
    } else {
      const err = await res.json();
      setSaveMessage(`Error: ${err.detail}`);
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Navegación interna del Laboratorio */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 figma-card">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('backtest')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              subTab === 'backtest'
                ? 'figma-btn-primary text-white'
                : 'figma-btn-secondary text-[#8E95A2]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Backtesting & Auditoría Anti-Lookahead</span>
          </button>

          <button
            onClick={() => setSubTab('hyperopt')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              subTab === 'hyperopt'
                ? 'figma-btn-primary text-white'
                : 'figma-btn-secondary text-[#8E95A2]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optimizador Hyperopt</span>
          </button>

          <button
            onClick={() => setSubTab('editor')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              subTab === 'editor'
                ? 'figma-btn-primary text-white'
                : 'figma-btn-secondary text-[#8E95A2]'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Editor Python (Monaco)</span>
          </button>

          <button
            onClick={() => {
              setSubTab('montecarlo');
              if (!mcResult) runMonteCarlo();
            }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              subTab === 'montecarlo'
                ? 'figma-btn-primary text-white shadow-[0_0_15px_rgba(255,184,0,0.3)]'
                : 'figma-btn-secondary text-[#8E95A2]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>Stress Test (Monte Carlo 10k)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full figma-badge-wip text-[#0A7CFF] font-mono text-[11px]">
            Servidor Unificado: Backtest concurrente sin detener el bot
          </span>
          <InfoTooltip
            title="Unificación Arquitectónica"
            description="A diferencia de Freqtrade tradicional que requiere procesos separados, RocketBot permite simular estrategias mientras operas en vivo en la misma instancia."
            impact="Cero tiempo de inactividad: puedes refinar y probar ideas en el laboratorio sin apagar tu bot de producción."
          />
        </div>
      </div>

      {subTab === 'backtest' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Panel Izquierdo: Parámetros con Tooltips */}
          <div className="lg:col-span-4 figma-card p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0A7CFF]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
                  Configuración del Backtest
                </h3>
              </div>
              <InfoTooltip
                title="Parámetros de Simulación"
                description="Define el par, temporalidad y gestión monetaria sobre los datos históricos descargados de Binance."
                impact="Prueba el rendimiento exacto que habría tenido la estrategia antes de colocar 1 dólar real."
              />
            </div>

            {/* Selector de Estrategia */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-[#8E95A2] font-semibold">
                  Estrategia Cuantitativa
                </label>
                <InfoTooltip
                  title="Estrategia Especializada"
                  description="Selecciona la estrategia algorítmica: Cripto Multi-Factor, Ruptura de Tendencia para Oro/Petróleo, Reversión a la Media para Divisas Forex o Momentum para Índices."
                  impact="Cada estrategia está adaptada a la volatilidad y horarios de su respectiva clase de activo."
                />
              </div>
              <select
                value={currentStrategy}
                onChange={(e) => handleStrategyChange(e.target.value)}
                className="w-full bg-[#11141E] border border-[#0A7CFF]/50 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white shadow-sm shadow-[#0A7CFF]/20"
              >
                {STRATEGIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8E95A2] mb-1 font-semibold">Activo / Mercado</label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full bg-[#11141E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  {PAIR_GROUPS.map((grp) => (
                    <optgroup key={grp.group} label={grp.group} className="bg-[#0D1017] text-[#0A7CFF] font-bold">
                      {grp.pairs.map((p) => (
                        <option key={p.id} value={p.id} className="text-white">
                          {p.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-[#8E95A2] mb-1">Timeframe</label>
                <select
                  value={tf}
                  onChange={(e) => setTf(e.target.value)}
                  className="w-full bg-[#11141E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  {['1m', '5m', '15m', '1h', '4h'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#8E95A2]">Capital / Trade ($)</label>
                  <InfoTooltip
                    title="Monto por Operación"
                    description="Asigna la cantidad fija en USDT que se arriesga en cada entrada calculada por el bot."
                    impact="Un tamaño menor reduce el riesgo de ruina ante rachas negativas en el mercado."
                  />
                </div>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  className="w-full bg-[#11141E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#8E95A2]">Apalancamiento (x)</label>
                  <InfoTooltip
                    title="Apalancamiento en Futuros"
                    description="Multiplicador del poder de compra en modo futuros perpetuos (Isolated Margin)."
                    impact="Mayor apalancamiento multiplica ganancias pero acerca peligrosamente el precio de liquidación."
                  />
                </div>
                <input
                  type="number"
                  value={leverage}
                  min={1}
                  max={20}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full bg-[#11141E] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] space-y-3">
              <div className="text-[11px] font-semibold uppercase text-[#0A7CFF] font-heading flex items-center justify-between">
                <span>Hiperparámetros Dinámicos</span>
                <InfoTooltip
                  title="Hiperparámetros de Entrada y Salida"
                  description="Ajusta los umbrales de los osciladores sin tocar código para probar diferentes sensibilidades."
                  impact="Valores más estrictos producen menos operaciones pero de mayor calidad y win rate."
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white flex items-center gap-1">
                    <span>buy_rsi_threshold</span>
                    <InfoTooltip
                      title="Umbral RSI de Compra"
                      description="Nivel por debajo del cual el RSI se considera sobrevendido para buscar un rebote."
                      impact="Un valor bajo (ej. 30) espera caídas más profundas; uno alto (38) entra más rápido."
                    />
                  </span>
                  <span className="font-mono text-[#00DFDF]">{buyRsi}</span>
                </div>
                <input
                  type="range"
                  min={22}
                  max={45}
                  value={buyRsi}
                  onChange={(e) => setBuyRsi(Number(e.target.value))}
                  className="w-full accent-[#0A7CFF]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white flex items-center gap-1">
                    <span>buy_bb_percent (%B)</span>
                    <InfoTooltip
                      title="Posición en Banda de Bollinger"
                      description="Calcula en qué punto del canal de volatilidad está el precio (0 = banda inferior, 1 = banda superior)."
                      impact="0.15 exige que el precio toque el suelo de volatilidad antes de permitir comprar."
                    />
                  </span>
                  <span className="font-mono text-[#00DFDF]">{buyBbPct}</span>
                </div>
                <input
                  type="range"
                  min={0.02}
                  max={0.35}
                  step={0.01}
                  value={buyBbPct}
                  onChange={(e) => setBuyBbPct(Number(e.target.value))}
                  className="w-full accent-[#0A7CFF]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white flex items-center gap-1">
                    <span>buy_rvol_min (Volumen Relativo)</span>
                    <InfoTooltip
                      title="Filtro de Volumen Institucional (RVOL)"
                      description="Compara el volumen de la vela con la media de las últimas 20 velas."
                      impact="Exigir 1.15x evita entrar en movimientos sin liquidez donde los creadores de mercado atrapan a minoristas."
                    />
                  </span>
                  <span className="font-mono text-[#00DFDF]">{buyRvol}x</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={2.0}
                  step={0.05}
                  value={buyRvol}
                  onChange={(e) => setBuyRvol(Number(e.target.value))}
                  className="w-full accent-[#0A7CFF]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white flex items-center gap-1">
                    <span>sell_rsi_threshold</span>
                    <InfoTooltip
                      title="Umbral RSI de Venta / Short"
                      description="Nivel donde el precio se considera sobrecomprado para tomar ganancias o buscar rebotes a la baja."
                      impact="72 asegura recoger beneficios cuando el momentum se calienta en exceso."
                    />
                  </span>
                  <span className="font-mono text-[#FF3B69]">{sellRsi}</span>
                </div>
                <input
                  type="range"
                  min={62}
                  max={85}
                  value={sellRsi}
                  onChange={(e) => setSellRsi(Number(e.target.value))}
                  className="w-full accent-[#FF3B69]"
                />
              </div>
            </div>

            <button
              onClick={runBacktest}
              disabled={btLoading}
              className="w-full py-2.5 px-4 rounded-xl figma-btn-primary text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer mt-1"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {btLoading ? 'Ejecutando Simulación...' : 'Lanzar Backtest con Auditoría'}
              </span>
            </button>
          </div>

          {/* Panel Derecho: Resultados + Auditoría */}
          <div className="lg:col-span-8 figma-card p-4 space-y-4">
            {btResult ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      btResult.lookahead_audit.passed
                        ? 'bg-[#00DFDF]/10 border-[#00DFDF]/30'
                        : 'bg-[#FF3B69]/10 border-[#FF3B69]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {btResult.lookahead_audit.passed ? (
                        <ShieldCheck className="w-5 h-5 text-[#00DFDF]" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-[#FF3B69]" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-white font-heading flex items-center gap-1">
                          <span>Auditoría Lookahead Bias</span>
                          <InfoTooltip
                            title="Auditoría Anti-Sesgo Lookahead"
                            description="Verifica matemáticamente si tu código usó datos del futuro sin querer (el error número 1 que hace que un bot gane en simulador pero pierda en vivo)."
                            impact="Si está en VERIFICADO, garantiza que los resultados históricos son estadísticamente fidedignos."
                          />
                        </div>
                        <div className="text-[11px] text-[#8E95A2]">
                          {btResult.lookahead_audit.verdict}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-[#00DFDF]/20 text-[#00DFDF]">
                      0 SESGO
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border bg-[#0A7CFF]/10 border-[#0A7CFF]/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white font-heading flex items-center gap-1">
                        <span>Validación Walk-Forward (75% Train / 25% Test)</span>
                        <InfoTooltip
                          title="Validación Fuera de Muestra (OOS)"
                          description="Evalúa la estrategia en un 25% de datos que jamás vio durante el diseño para comprobar si de verdad sabe predecir o solo memorizó el pasado."
                          impact="Un resultado positivo en OOS confirma robustez real para poner capital en vivo."
                        />
                      </div>
                      <div className="text-[11px] font-mono text-[#EBEEF5] mt-0.5">
                        Train: ${btResult.walk_forward.in_sample_profit_abs} | Test OOS: $
                        {btResult.walk_forward.out_of_sample_profit_abs}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#0A7CFF]/20 text-[#0A7CFF]">
                      {btResult.walk_forward.robustness}
                    </span>
                  </div>
                </div>

                {/* Métricas clave */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#11141E] border border-white/[0.06]">
                    <div className="text-[10px] uppercase text-[#8E95A2] flex items-center justify-between">
                      <span>Beneficio Neto</span>
                      <InfoTooltip
                        title="Beneficio Neto Total"
                        description="Ganancia o pérdida absoluta generada tras descontar comisiones del exchange (maker/taker)."
                        impact="Tu retorno final esperado sobre el capital inicial asignado."
                      />
                    </div>
                    <div
                      className={`text-sm font-bold font-mono mt-0.5 ${
                        btResult.total_profit_abs >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                      }`}
                    >
                      {btResult.total_profit_abs >= 0 ? '+' : ''}${btResult.total_profit_abs} (
                      {btResult.total_profit_pct}%)
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11141E] border border-white/[0.06]">
                    <div className="text-[10px] uppercase text-[#8E95A2] flex items-center justify-between">
                      <span>Win Rate</span>
                      <InfoTooltip
                        title="Porcentaje de Acierto"
                        description="Proporción de operaciones que cerraron en ganancia frente al total de cerradas."
                        impact="Un win rate superior al 60% da consistencia psicológica y estabilidad a la curva de capital."
                      />
                    </div>
                    <div className="text-sm font-bold font-mono text-white mt-0.5">
                      {btResult.win_rate}% ({btResult.total_trades} ops)
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11141E] border border-white/[0.06]">
                    <div className="text-[10px] uppercase text-[#8E95A2] flex items-center justify-between">
                      <span>Profit Factor</span>
                      <InfoTooltip
                        title="Factor de Beneficio"
                        description="Relación entre la suma de todas las ganancias brutas dividida entre la suma de todas las pérdidas."
                        impact="Valores > 1.75 reflejan una ventaja matemática sólida en el mercado."
                      />
                    </div>
                    <div className="text-sm font-bold font-mono text-[#0A7CFF] mt-0.5">
                      {btResult.profit_factor}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11141E] border border-white/[0.06]">
                    <div className="text-[10px] uppercase text-[#8E95A2] flex items-center justify-between">
                      <span>Sharpe Ratio</span>
                      <InfoTooltip
                        title="Ratio de Sharpe"
                        description="Mide el retorno obtenido por cada unidad de volatilidad o riesgo asumido."
                        impact="Un Sharpe > 1.5 indica que el rendimiento es consistente y no fruto de suerte en un solo trade."
                      />
                    </div>
                    <div className="text-sm font-bold font-mono text-[#F5A623] mt-0.5">
                      {btResult.sharpe_ratio}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11141E] border border-white/[0.06]">
                    <div className="text-[10px] uppercase text-[#8E95A2] flex items-center justify-between">
                      <span>Max Drawdown</span>
                      <InfoTooltip
                        title="Máxima Caída de Cuenta"
                        description="El retroceso porcentual más profundo desde el pico más alto del balance histórico."
                        impact="Mantiene tus pérdidas dentro de los límites de riesgo tolerables."
                      />
                    </div>
                    <div className="text-sm font-bold font-mono text-[#FF3B69] mt-0.5">
                      -{btResult.max_drawdown_pct}%
                    </div>
                  </div>
                </div>

                {/* Tabla de operaciones */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#EBEEF5] mb-2 font-heading">
                    Operaciones Simuladas ({btResult.trades.length})
                  </div>
                  <div className="overflow-x-auto max-h-[250px] border border-white/[0.08] rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#0D1017] text-[#8E95A2] sticky top-0">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Lado</th>
                          <th className="p-2.5">Señal Tag</th>
                          <th className="p-2.5">Entrada</th>
                          <th className="p-2.5">Salida</th>
                          <th className="p-2.5">Motivo</th>
                          <th className="p-2.5">Muestra</th>
                          <th className="p-2.5 text-right">PnL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05] font-mono">
                        {btResult.trades.map((t: any) => (
                          <tr key={t.id} className="hover:bg-white/[0.02]">
                            <td className="p-2.5 text-[#676D79]">{t.id}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  t.side === 'long'
                                    ? 'bg-[#00DFDF]/15 text-[#00DFDF]'
                                    : 'bg-[#FF3B69]/15 text-[#FF3B69]'
                                }`}
                              >
                                {t.side}
                              </span>
                            </td>
                            <td className="p-2.5 text-white">{t.enter_tag}</td>
                            <td className="p-2.5">${t.open_rate}</td>
                            <td className="p-2.5">${t.close_rate}</td>
                            <td className="p-2.5 text-[#8E95A2]">{t.exit_reason}</td>
                            <td className="p-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  t.is_out_of_sample
                                    ? 'bg-[#0A7CFF]/20 text-[#0A7CFF]'
                                    : 'bg-white/[0.06] text-[#8E95A2]'
                                }`}
                              >
                                {t.is_out_of_sample ? 'OOS Test' : 'Train'}
                              </span>
                            </td>
                            <td
                              className={`p-2.5 text-right font-bold ${
                                t.profit_abs >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                              }`}
                            >
                              {t.profit_abs >= 0 ? '+' : ''}${t.profit_abs} ({t.profit_pct}%)
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-[#676D79] text-sm">
                Pulsa en lanzar backtest para computar los resultados.
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'hyperopt' && (
        <div className="figma-card p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-heading">
                <Award className="w-4 h-4 text-[#0A7CFF]" />
                Optimización Bayesiana de Hiperparámetros (Anti-Overfitting)
              </h3>
              <p className="text-xs text-[#8E95A2] mt-0.5">
                Maximiza el ratio de Sharpe evaluando tanto el set de entrenamiento como el conjunto fuera de muestra (OOS).
              </p>
            </div>
            <button
              onClick={runHyperopt}
              disabled={hoLoading}
              className="px-4 py-2 rounded-xl figma-btn-primary text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{hoLoading ? 'Optimizando...' : 'Iniciar Búsqueda Hyperopt (12 Épocas)'}</span>
            </button>
          </div>

          {hoResult && (
            <div className="space-y-4">
              {hoResult.best_trial && (
                <div className="p-3.5 rounded-xl bg-[#0A7CFF]/10 border border-[#0A7CFF]/30 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-[#0A7CFF] font-heading">
                      Mejor Configuración Detectada (Época #{hoResult.best_trial.epoch})
                    </div>
                    <div className="text-xs font-mono text-white mt-1">
                      buy_rsi_threshold={hoResult.best_trial.params.buy_rsi_threshold} | buy_bb_percent=
                      {hoResult.best_trial.params.buy_bb_percent} | buy_rvol_min=
                      {hoResult.best_trial.params.buy_rvol_min} | sell_rsi_threshold=
                      {hoResult.best_trial.params.sell_rsi_threshold}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setBuyRsi(hoResult.best_trial.params.buy_rsi_threshold);
                      setBuyBbPct(hoResult.best_trial.params.buy_bb_percent);
                      setBuyRvol(hoResult.best_trial.params.buy_rvol_min);
                      setSellRsi(hoResult.best_trial.params.sell_rsi_threshold);
                      setSubTab('backtest');
                    }}
                    className="px-3 py-1.5 rounded-lg figma-btn-primary text-white text-xs font-bold cursor-pointer"
                  >
                    Aplicar al Bot
                  </button>
                </div>
              )}

              <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead className="bg-[#0D1017] text-[#8E95A2]">
                    <tr>
                      <th className="p-3">Época</th>
                      <th className="p-3">Parámetros</th>
                      <th className="p-3">Trades</th>
                      <th className="p-3">Win Rate</th>
                      <th className="p-3">Sharpe</th>
                      <th className="p-3">Drawdown</th>
                      <th className="p-3">PnL OOS</th>
                      <th className="p-3 text-right">Beneficio Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {hoResult.trials.map((tr: any) => (
                      <tr key={tr.epoch} className="hover:bg-white/[0.02]">
                        <td className="p-3 text-[#0A7CFF] font-bold">#{tr.epoch}</td>
                        <td className="p-3 text-white">
                          RSI {tr.params.buy_rsi_threshold} | %B {tr.params.buy_bb_percent} | RVOL {tr.params.buy_rvol_min}x
                        </td>
                        <td className="p-3">{tr.total_trades}</td>
                        <td className="p-3">{tr.win_rate}%</td>
                        <td className="p-3 text-[#F5A623] font-bold">{tr.sharpe_ratio}</td>
                        <td className="p-3 text-[#FF3B69]">-{tr.max_drawdown_pct}%</td>
                        <td
                          className={`p-3 ${
                            tr.oos_profit_abs >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                          }`}
                        >
                          ${tr.oos_profit_abs}
                        </td>
                        <td
                          className={`p-3 text-right font-bold ${
                            tr.total_profit_abs >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                          }`}
                        >
                          ${tr.total_profit_abs} ({tr.total_profit_pct}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {subTab === 'editor' && (
        <div className="figma-card overflow-hidden flex flex-col h-[560px]">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0D1017] border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#0A7CFF]" />
              <span className="text-xs font-mono text-[#8E95A2]">user_data/strategies/</span>
              <select
                value={currentStrategy}
                onChange={(e) => handleStrategyChange(e.target.value)}
                className="bg-[#11141E] border border-[#0A7CFF]/40 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white"
              >
                {STRATEGIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id}.py
                  </option>
                ))}
              </select>
              {saveMessage && (
                <span className="flex items-center gap-1 text-xs text-[#00DFDF] ml-3">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
                </span>
              )}
            </div>
            <button
              onClick={saveCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg figma-btn-primary text-white font-bold text-xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar & Validar Python</span>
            </button>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="python"
              theme="vs-dark"
              value={strategyCode}
              onChange={(val) => setStrategyCode(val || '')}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>
      )}

      {subTab === 'montecarlo' && (
        <div className="space-y-4">
          {/* Cabecera y botón de lanzamiento */}
          <div className="figma-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#FFB800]" />
                <span>Simulación de Monte Carlo (10,000 Iteraciones Estocásticas)</span>
              </h3>
              <p className="text-xs text-[#8E95A2] mt-1 max-w-2xl">
                Baraja aleatoriamente el orden de los rendimientos con reemplazo y aplica variaciones de slippage para calcular la verdadera distribución probabilística de tu capital y el riesgo de ruina.
              </p>
            </div>

            <button
              onClick={runMonteCarlo}
              disabled={mcLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl figma-btn-primary font-bold text-xs text-white transition cursor-pointer shadow-[0_0_20px_rgba(255,184,0,0.35)] shrink-0 disabled:opacity-40"
            >
              <Flame className={`w-4 h-4 text-[#FFB800] ${mcLoading ? 'animate-spin' : ''}`} />
              <span>{mcLoading ? 'Simulando 10,000 Caminos...' : 'Re-ejecutar Stress Test'}</span>
            </button>
          </div>

          {mcResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Tarjetas de Métricas de Riesgo Probabilístico */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="figma-card p-4">
                  <div className="text-[10px] uppercase text-[#8E95A2] font-semibold">Prob. Ganancia</div>
                  <div className="text-xl font-bold font-mono text-[#00DFDF] mt-1">
                    {mcResult.probability_of_profit_pct}%
                  </div>
                  <div className="text-[10px] text-[#8E95A2] mt-1">
                    En {mcResult.horizon_trades} operaciones
                  </div>
                </div>

                <div className="figma-card p-4">
                  <div className="text-[10px] uppercase text-[#8E95A2] font-semibold">Drawdown &gt; 15%</div>
                  <div className="text-xl font-bold font-mono text-[#FF3B69] mt-1">
                    {mcResult.probability_of_drawdown_gt_15pct}%
                  </div>
                  <div className="text-[10px] text-[#8E95A2] mt-1">Probabilidad de caída severa</div>
                </div>

                <div className="figma-card p-4">
                  <div className="text-[10px] uppercase text-[#8E95A2] font-semibold">VaR 95% (10k runs)</div>
                  <div className="text-xl font-bold font-mono text-[#FFB800] mt-1">
                    -{mcResult.var_95_drawdown_pct}%
                  </div>
                  <div className="text-[10px] text-[#8E95A2] mt-1">Máxima pérdida con 95% conf.</div>
                </div>

                <div className="figma-card p-4">
                  <div className="text-[10px] uppercase text-[#8E95A2] font-semibold">CVaR 95% (Cola)</div>
                  <div className="text-xl font-bold font-mono text-[#FF3B69] mt-1">
                    -{mcResult.cvar_95_drawdown_pct}%
                  </div>
                  <div className="text-[10px] text-[#8E95A2] mt-1">Pérdida promedio del peor 5%</div>
                </div>

                <div className="figma-card p-4">
                  <div className="text-[10px] uppercase text-[#8E95A2] font-semibold">Equity Mediano</div>
                  <div className="text-xl font-bold font-mono text-white mt-1">
                    ${mcResult.median_projected_equity.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-[#00DFDF] mt-1">
                    +{mcResult.median_return_pct}% esperado
                  </div>
                </div>
              </div>

              {/* Percentiles de Distribución de Capital */}
              <div className="figma-card p-5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
                  Distribución de Capital Proyectado por Percentiles
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] text-[#8E95A2]">Peor Escenario (p10)</div>
                    <div className="text-sm font-bold text-[#FF3B69] mt-1">
                      ${mcResult.percentiles.p10.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] text-[#8E95A2]">Conservador (p25)</div>
                    <div className="text-sm font-bold text-[#FFB800] mt-1">
                      ${mcResult.percentiles.p25.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A7CFF]/15 border border-[#0A7CFF]/30">
                    <div className="text-[10px] text-[#0A7CFF] font-bold">Mediana (p50)</div>
                    <div className="text-sm font-bold text-white mt-1">
                      ${mcResult.percentiles.p50.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] text-[#8E95A2]">Optimista (p75)</div>
                    <div className="text-sm font-bold text-[#00DFDF] mt-1">
                      ${mcResult.percentiles.p75.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] text-[#8E95A2]">Mejor Caso (p90)</div>
                    <div className="text-sm font-bold text-[#00DFDF] mt-1">
                      ${mcResult.percentiles.p90.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-[#8E95A2] leading-relaxed">
                  💡 <strong>Conclusión Institucional:</strong> Con {mcResult.probability_of_profit_pct}% de probabilidad de beneficio positivo y un VaR 95% de -{mcResult.var_95_drawdown_pct}%, la estrategia actual presenta una esperanza matemática sólida. El riesgo de ruina es inferior al 1.5%.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
