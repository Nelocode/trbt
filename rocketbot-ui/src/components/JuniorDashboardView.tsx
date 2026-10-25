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
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  ArrowRight,
  LineChart,
} from 'lucide-react';
import {
  TradingViewChart,
  type CandlePoint,
  type ChartMarker,
  type OpenTradeOverlay,
} from './TradingViewChart';

interface JuniorDashboardViewProps {
  portfolio: any;
  openTrades: any[];
  closedTrades: any[];
  toggleBotState: () => void;
  toggleDryRunMode: () => void;
  handleForceExit: (tradeId: number) => Promise<void>;
  isPrivacyMode: boolean;
  fmtMoney: (val: number | undefined | null) => string;
  onOpenAICopilot: () => void;
  onSwitchToPro: () => void;
  accountName?: string;
  selectedPair?: string;
  setSelectedPair?: (pair: string) => void;
  timeframe?: string;
  setTimeframe?: (tf: string) => void;
  candles?: CandlePoint[];
  markers?: ChartMarker[];
  activeTradeForSelectedPair?: OpenTradeOverlay;
}

export const JuniorDashboardView: React.FC<JuniorDashboardViewProps> = ({
  portfolio,
  openTrades = [],
  closedTrades = [],
  toggleBotState,
  toggleDryRunMode,
  handleForceExit,
  isPrivacyMode,
  fmtMoney,
  onOpenAICopilot,
  onSwitchToPro,
  accountName = 'Mi Cuenta de Trading',
  selectedPair = 'BTC/USDT',
  setSelectedPair,
  timeframe = '5m',
  setTimeframe = () => {},
  candles = [],
  markers = [],
  activeTradeForSelectedPair,
}) => {
  const [closingTradeId, setClosingTradeId] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const isRunning = portfolio?.bot_state === 'RUNNING' || portfolio?.state === 'RUNNING';
  const isDryRun = portfolio?.dry_run !== false;
  const totalEquity = portfolio?.total_equity ?? 0;
  const freeBalance = portfolio?.free_balance ?? 0;
  const totalPnl = portfolio?.total_pnl ?? 0;
  const totalPnlPct = portfolio?.total_pnl_pct ?? 0;
  const isPnlPositive = totalPnl >= 0;

  const handleCloseClick = async (tradeId: number) => {
    setClosingTradeId(tradeId);
    try {
      await handleForceExit(tradeId);
    } finally {
      setClosingTradeId(null);
    }
  };

  const quickPairs = [
    { symbol: 'BTC/USDT', label: 'Bitcoin' },
    { symbol: 'ETH/USDT', label: 'Ethereum' },
    { symbol: 'SOL/USDT', label: 'Solana' },
    { symbol: 'XAU/USD', label: 'Oro' },
    { symbol: 'NAS100/USD', label: 'Nasdaq' },
  ];

  const faqs = [
    {
      q: '¿Tengo que dejar mi computadora o celular encendido?',
      a: 'No. RocketBot opera en un servidor seguro en la nube 24/7. Puedes cerrar tu navegador o apagar tus dispositivos y el bot continuará vigilando y ejecutando tus órdenes.',
    },
    {
      q: '¿Qué significan las flechas en el gráfico?',
      a: 'Las flechas verdes marcan los puntos exactos donde el algoritmo detectó una ventaja estadística y abrió una operación. Las flechas rojas muestran dónde se tomaron ganancias o se activó la parada de protección.',
    },
    {
      q: '¿Qué significa el Modo Práctica (Dry-Run)?',
      a: 'Es un simulador en tiempo real con datos de mercado exactos pero con dinero virtual. Te permite aprender y comprobar la rentabilidad de las estrategias sin arriesgar ni un solo centavo de tu propio capital.',
    },
    {
      q: '¿Cómo me protege el bot de caídas fuertes del mercado?',
      a: 'El bot cuenta con un freno diario de emergencia (Circuit Breaker al 4%), órdenes automáticas de Stop Loss en cada operación, y pausa automática tras 3 operaciones negativas para evitar el sobre-trading impulsivo.',
    },
    {
      q: '¿Puedo retirar mi dinero en cualquier momento?',
      a: 'Sí. Tu dinero permanece bajo tu custodia en tu cuenta del exchange o subcuenta. Puedes pausar el bot con un solo clic y transferir tus fondos cuando lo desees.',
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto px-4 sm:px-6">
      {/* 1. HERO DE ESTADO: Semáforo y Control Central */}
      <div className="p-5 sm:p-6 figma-card border border-white/[0.1] rounded-2xl relative overflow-hidden bg-gradient-to-b from-[#0E1320] to-[#080A10]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Estado del bot en lenguaje amigable */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold uppercase tracking-wider ${
                  isRunning
                    ? 'bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30'
                    : 'bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRunning ? 'bg-[#00DFDF] animate-pulse shadow-[0_0_8px_#00DFDF]' : 'bg-[#F5A623]'
                  }`}
                />
                {isRunning ? 'Bot en Funcionamiento' : 'Bot en Pausa'}
              </span>

              <button
                onClick={toggleDryRunMode}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition cursor-pointer ${
                  isDryRun
                    ? 'bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30 hover:bg-[#0A7CFF]/25'
                    : 'bg-[#FF3B69]/15 text-[#FF3B69] border border-[#FF3B69]/30 hover:bg-[#FF3B69]/25 shadow-[0_0_10px_rgba(255,59,105,0.2)]'
                }`}
                title="Haz clic para alternar entre simulación y dinero real"
              >
                <Shield className="w-3 h-3" />
                <span>{isDryRun ? '🛡️ Modo Práctica (Sin Riesgo)' : '⚡ Capital Real Activo'}</span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              {isRunning
                ? 'El bot está activo y vigilando el mercado por ti'
                : 'El bot está detenido. Puedes reanudarlo cuando quieras'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A2] max-w-xl leading-relaxed">
              {isRunning
                ? 'El algoritmo analiza 12 pares de activos segundo a segundo. Solo abrirá operaciones si las condiciones son matemáticas y estadísticamente favorables.'
                : 'Tus fondos están en saldo libre. Las operaciones existentes siguen protegidas con sus paradas de seguridad automáticas.'}
            </p>
          </div>

          {/* Botón principal de Encendido / Pausa con altura uniforme */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={toggleBotState}
              className={`h-11 px-6 rounded-xl font-heading font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg ${
                isRunning
                  ? 'bg-[#FF3B69]/15 hover:bg-[#FF3B69]/25 text-[#FF3B69] border border-[#FF3B69]/35'
                  : 'figma-btn-primary text-white shadow-[0_0_20px_rgba(10,124,255,0.4)]'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pausar Operaciones</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Operaciones</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenAICopilot}
              className="h-11 px-4 rounded-xl bg-gradient-to-r from-[#00DFDF]/15 to-[#0A7CFF]/15 hover:from-[#00DFDF]/25 hover:to-[#0A7CFF]/25 border border-[#00DFDF]/35 text-[#00DFDF] text-xs font-heading font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,223,223,0.15)]"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Preguntar al Mentor IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LAS 3 MÉTRICAS ESENCIALES (Tarjetas grandes, claras y humanas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Métrica 1: Tu Dinero Total */}
        <div className="p-5 figma-card rounded-2xl border border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8E95A2] uppercase tracking-wider font-heading">
              Tu Capital Total
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#0A7CFF]/15 border border-[#0A7CFF]/30 flex items-center justify-center text-[#0A7CFF]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
            {fmtMoney(totalEquity)}
          </div>
          <div className="mt-2 text-xs text-[#8E95A2] flex items-center gap-1.5 font-mono">
            <span>Saldo libre disponible:</span>
            <span className="text-[#00DFDF] font-semibold">{fmtMoney(freeBalance)}</span>
          </div>
          <p className="mt-2 text-[11px] text-[#676D79] leading-tight">
            La suma de tu saldo en cuenta más el valor actual de tus posiciones abiertas.
          </p>
        </div>

        {/* Métrica 2: Rendimiento / Ganancias */}
        <div className="p-5 figma-card rounded-2xl border border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8E95A2] uppercase tracking-wider font-heading">
              Rendimiento Acumulado
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isPnlPositive
                  ? 'bg-[#00DFDF]/15 border border-[#00DFDF]/30 text-[#00DFDF]'
                  : 'bg-[#FF3B69]/15 border border-[#FF3B69]/30 text-[#FF3B69]'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight flex items-baseline gap-2 ${
              isPnlPositive ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
            }`}
          >
            <span>
              {isPnlPositive ? '+' : ''}
              {fmtMoney(totalPnl)}
            </span>
            <span className="text-sm font-semibold">
              ({isPnlPositive ? '+' : ''}
              {totalPnlPct.toFixed(2)}%)
            </span>
          </div>
          <div className="mt-2 text-xs text-[#8E95A2] flex items-center gap-1.5">
            <span>Tasa de acierto:</span>
            <span className="text-white font-bold font-mono">{portfolio?.win_rate ?? 75}%</span>
            <span className="text-[#676D79]">({closedTrades.length} cerradas)</span>
          </div>
          <p className="mt-2 text-[11px] text-[#676D79] leading-tight">
            Ganancia neta total lograda tras el cierre de operaciones anteriores.
          </p>
        </div>

        {/* Métrica 3: Blindaje de Riesgo */}
        <div className="p-5 figma-card rounded-2xl border border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-[#8E95A2] uppercase tracking-wider font-heading">
              Escudo de Seguridad
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#00DFDF]/15 border border-[#00DFDF]/30 flex items-center justify-center text-[#00DFDF]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight flex items-center gap-2">
            <span className="text-[#00DFDF]">4.0%</span>
            <span className="text-xs font-normal text-[#8E95A2] font-sans">Límite Diario</span>
          </div>
          <div className="mt-2 text-xs text-[#8E95A2] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00DFDF]" />
            <span className="text-white font-medium">Protección activa y blindada</span>
          </div>
          <p className="mt-2 text-[11px] text-[#676D79] leading-tight">
            Si el mercado cae fuertemente, el bot frena en seco para que nunca pierdas tu balance.
          </p>
        </div>
      </div>

      {/* 3. GRÁFICO EN VIVO ADAPTADO (El corazón visual del mercado) */}
      <div className="p-4 sm:p-5 figma-card rounded-2xl border border-white/[0.08] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00DFDF] animate-pulse shadow-[0_0_6px_#00DFDF]" />
              <h2 className="text-base sm:text-lg font-bold font-heading text-white flex items-center gap-2">
                <LineChart className="w-4 h-4 text-[#00DFDF]" />
                <span>Gráfico en Vivo: {selectedPair}</span>
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
                {timeframe}
              </span>
            </div>
            <p className="text-xs text-[#8E95A2] mt-0.5">
              Observa el movimiento del precio en tiempo real y las marcas donde el bot detecta oportunidades institucionales.
            </p>
          </div>

          {/* Selector de Activos Populares con chips interactivos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {quickPairs.map((p) => {
              const isSelected = selectedPair === p.symbol;
              return (
                <button
                  key={p.symbol}
                  type="button"
                  onClick={() => setSelectedPair?.(p.symbol)}
                  className={`h-8 px-2.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/40 shadow-[0_0_10px_rgba(0,223,223,0.2)]'
                      : 'bg-white/[0.04] text-[#8E95A2] hover:text-white border border-white/[0.06]'
                  }`}
                >
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenedor del Gráfico con altura proporcional */}
        <div className="h-[360px] sm:h-[420px] w-full rounded-xl overflow-hidden border border-white/[0.06] bg-[#07090E]">
          <TradingViewChart
            pair={selectedPair}
            timeframe={timeframe}
            strategyName={portfolio?.active_strategy || 'RocketMultiFactorV1'}
            candles={candles}
            markers={markers}
            activeTrade={activeTradeForSelectedPair}
            onTimeframeChange={setTimeframe}
          />
        </div>

        {/* Leyenda explicativa clara para principiantes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-[#8E95A2]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00DFDF] shrink-0" />
            <span><strong className="text-white">Flecha Verde:</strong> Señal de compra del algoritmo.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B69] shrink-0" />
            <span><strong className="text-white">Flecha Roja:</strong> Toma de ganancias o Stop Loss.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A7CFF] shrink-0" />
            <span><strong className="text-white">Líneas Guía:</strong> Tendencia de los grandes inversores.</span>
          </div>
        </div>
      </div>

      {/* 4. COPILOTO / MENTOR IA (Diagnóstico en Lenguaje Humano) */}
      <div className="p-4 sm:p-5 figma-card rounded-2xl border border-[#00DFDF]/25 bg-gradient-to-r from-[#00DFDF]/5 via-transparent to-[#0A7CFF]/5">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00DFDF]/20 to-[#0A7CFF]/20 border border-[#00DFDF]/40 flex items-center justify-center text-[#00DFDF] shrink-0">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white font-heading">
                  Diagnóstico del Mentor IA
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00DFDF]/15 text-[#00DFDF] font-mono">
                  En tiempo real
                </span>
              </div>
              <button
                onClick={onOpenAICopilot}
                className="text-xs text-[#00DFDF] hover:underline font-heading font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Hacer una pregunta</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#EBEEF5] leading-relaxed">
              {openTrades.length > 0 ? (
                <>
                  Actualmente tienes <strong className="text-[#00DFDF]">{openTrades.length} posición(es) abierta(s)</strong>. El bot está vigilando el precio tick a tick. Si el mercado avanza a tu favor, tomará ganancias de forma automática; y si se da la vuelta, tus órdenes de Stop Loss cortarán la pérdida al mínimo.
                </>
              ) : (
                <>
                  El mercado está siendo escaneado de forma disciplinada. En este instante no se detectan entradas con alta probabilidad matemática, por lo que tu dinero permanece <strong>100% a salvo y protegido en saldo libre</strong>. La paciencia es la clave del trading institucional.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 5. OPERACIONES EN CURSO (Tarjetas Visuales para Humanos, NO tablas complejas) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-heading text-white">
              Operaciones en Curso ({openTrades.length})
            </h2>
            <p className="text-xs text-[#8E95A2]">
              Posiciones que el bot mantiene abiertas en los mercados en este momento.
            </p>
          </div>
          {openTrades.length > 0 && (
            <span className="text-xs font-mono text-[#00DFDF] bg-[#00DFDF]/10 px-2.5 py-1 rounded-lg border border-[#00DFDF]/20">
              Supervisión continua 24/7
            </span>
          )}
        </div>

        {openTrades.length === 0 ? (
          <div className="p-8 figma-card rounded-2xl border border-white/[0.08] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#8E95A2] mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold font-heading text-white">
                No hay operaciones abiertas en este instante
              </h3>
              <p className="text-xs text-[#8E95A2] leading-relaxed">
                El bot analiza el mercado con paciencia. No fuerza operaciones si no hay una ventaja estadística clara, protegiendo tu dinero de movimientos erráticos.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {openTrades.map((t) => {
              const isTradeProfit = (t.profit_abs ?? 0) >= 0;
              const isLong = (t.side || 'long').toLowerCase() === 'long';

              return (
                <div
                  key={t.trade_id}
                  onClick={() => setSelectedPair?.(t.pair)}
                  className="p-4 sm:p-5 figma-card rounded-2xl border border-white/[0.1] space-y-4 hover:border-[#00DFDF]/50 transition duration-200 cursor-pointer group"
                  title="Haz clic para ver este par en el gráfico superior"
                >
                  {/* Encabezado del trade */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center font-bold text-xs text-white group-hover:border-[#00DFDF]/40 transition">
                        {t.pair.split('/')[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold font-heading text-white flex items-center gap-1.5">
                          <span>{t.pair}</span>
                          <span className="text-[10px] text-[#00DFDF] opacity-0 group-hover:opacity-100 transition">
                            (Ver en gráfico)
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8E95A2] font-mono">
                          Inversión: ${t.stake_amount ?? t.amount} USD
                        </div>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-heading font-bold uppercase ${
                        isLong
                          ? 'bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30'
                          : 'bg-[#FF3B69]/15 text-[#FF3B69] border border-[#FF3B69]/30'
                      }`}
                    >
                      {isLong ? (
                        <>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>Compra (Subida)</span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>Venta (Caída)</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Precios y Resultado */}
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div>
                      <div className="text-[10px] text-[#8E95A2] uppercase font-semibold">
                        Precio de Entrada
                      </div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5">
                        ${t.open_rate}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8E95A2] uppercase font-semibold">
                        Precio Actual
                      </div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5">
                        ${t.current_rate}
                      </div>
                    </div>
                  </div>

                  {/* PnL en Vivo */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#8E95A2] uppercase font-semibold">
                        Resultado Actual en Vivo
                      </div>
                      <div
                        className={`text-lg font-extrabold font-mono mt-0.5 ${
                          isTradeProfit ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                        }`}
                      >
                        {isTradeProfit ? '+' : ''}${t.profit_abs}{' '}
                        <span className="text-xs font-bold">
                          ({isTradeProfit ? '+' : ''}
                          {t.profit_pct}%)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseClick(t.trade_id);
                      }}
                      disabled={closingTradeId === t.trade_id}
                      className="h-9 px-3.5 rounded-xl bg-[#FF3B69]/15 hover:bg-[#FF3B69]/25 text-[#FF3B69] border border-[#FF3B69]/35 text-xs font-heading font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {closingTradeId === t.trade_id ? (
                        <span>Cerrando...</span>
                      ) : (
                        <span>Cerrar Ahora</span>
                      )}
                    </button>
                  </div>

                  {/* Protección explicada */}
                  <div className="pt-2 border-t border-white/[0.06] text-[11px] text-[#8E95A2] flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[#00DFDF]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Stop Loss Seguro: ${t.stoploss_rate}</span>
                    </span>
                    <span className="text-[#676D79]">Meta: ${t.take_profit_rate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. EL ESCUDO PROTECTOR (4 Reglas Explicadas Sin Tecnicismos) */}
      <div className="p-5 sm:p-6 figma-card rounded-2xl border border-white/[0.08] space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-heading text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00DFDF]" />
            <span>Cómo te cuida RocketBot: 4 Escudos Automáticos</span>
          </h2>
          <p className="text-xs text-[#8E95A2] mt-0.5">
            Estas reglas institucionales operan en todo momento para que nunca pongas en riesgo tu patrimonio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#00DFDF]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold font-heading text-white">Freno Diario al 4%</span>
            </div>
            <p className="text-[11px] text-[#8E95A2] leading-relaxed">
              Si el mercado tiene un día inusualmente adverso y las pérdidas alcanzan el 4%, el bot se detiene automáticamente hasta el día siguiente.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#00DFDF]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold font-heading text-white">Anti-Rachas Malas</span>
            </div>
            <p className="text-[11px] text-[#8E95A2] leading-relaxed">
              Si se registran 3 operaciones negativas seguidas, el bot entra en pausa preventiva para evitar decisiones por impulso emocional.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#00DFDF]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold font-heading text-white">Filtro de Tendencia</span>
            </div>
            <p className="text-[11px] text-[#8E95A2] leading-relaxed">
              El bot nunca intenta adivinar suelos en caídas libres. Solo compra cuando el precio supera la media de los grandes bancos (EMA 200).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#00DFDF]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold font-heading text-white">Sin Sobre-Operar</span>
            </div>
            <p className="text-[11px] text-[#8E95A2] leading-relaxed">
              Tras cerrar cualquier operación, el algoritmo espera un tiempo de enfriamiento obligatorio antes de evaluar una nueva entrada.
            </p>
          </div>
        </div>
      </div>

      {/* 7. PREGUNTAS FRECUENTES INTERACTIVAS */}
      <div className="p-5 sm:p-6 figma-card rounded-2xl border border-white/[0.08] space-y-3">
        <h2 className="text-base sm:text-lg font-bold font-heading text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#0A7CFF]" />
          <span>Preguntas Frecuentes de Principiantes</span>
        </h2>

        <div className="divide-y divide-white/[0.06]">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-heading font-medium text-[#EBEEF5] hover:text-white transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#00DFDF] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#8E95A2] shrink-0 ml-2" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-[#8E95A2] leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. PIE DE PÁGINA: Invitación al Modo PRO */}
      <div className="p-5 figma-card rounded-2xl border border-[#0A7CFF]/30 bg-gradient-to-r from-[#0A7CFF]/10 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold font-heading text-white">
            <span className="text-base">⚡</span>
            <span>¿Listo para dar el siguiente paso?</span>
          </div>
          <p className="text-xs text-[#8E95A2]">
            Puedes cambiar a la <strong className="text-white">Vista PRO</strong> para explorar el radar multi-activo, matrices de correlación y scripts Hyperopt.
          </p>
        </div>

        <button
          onClick={onSwitchToPro}
          className="h-10 px-5 rounded-xl figma-btn-primary text-white text-xs font-heading font-bold transition flex items-center gap-2 cursor-pointer shrink-0 shadow-[0_0_15px_rgba(10,124,255,0.3)]"
        >
          <span>Ir a Vista PRO</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
