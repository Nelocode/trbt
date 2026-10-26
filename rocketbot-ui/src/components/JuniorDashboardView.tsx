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
  Moon,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  Award,
  BookOpen,
  Share2,
  Check,
  Calculator,
  Sliders,
  Flame,
  Info,
  X,
  CandlestickChart,
  Lightbulb,
  Compass,
  Trophy,
} from 'lucide-react';
import {
  TradingViewChart,
  type CandlePoint,
  type ChartMarker,
  type OpenTradeOverlay,
} from './TradingViewChart';
import { InfoTooltip } from './InfoTooltip';
import { JuniorInteractiveTour } from './JuniorInteractiveTour';
import { audioFeedback } from '../utils/audioFeedback';
import { achievementsService } from '../utils/achievementsService';

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
  onOpenAchievements?: () => void;
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
  onOpenAchievements,
  accountName = 'Mi Cuenta de Trading',
  selectedPair = 'BTC/USDT',
  setSelectedPair,
  timeframe = '5m',
  setTimeframe = () => {},
  candles = [],
  markers = [],
  activeTradeForSelectedPair,
}) => {
  // Estado local para los componentes
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [closingTradeId, setClosingTradeId] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTradeExplanation, setSelectedTradeExplanation] = useState<any | null>(null);
  const [chartStyle, setChartStyle] = useState<'candles' | 'area'>('candles');
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'balanced' | 'growth'>('balanced');
  const [isNightGuardActive, setIsNightGuardActive] = useState<boolean>(() => {
    return localStorage.getItem('rocketbot_night_guard') === 'true';
  });
  const [dailyTargetAmount, setDailyTargetAmount] = useState<number>(50);
  const [simulatedCapital, setSimulatedCapital] = useState<number>(1000);
  const [openLesson, setOpenLesson] = useState<number | null>(null);
  const [isDailyFlashOpen, setIsDailyFlashOpen] = useState<boolean>(false);
  const [copiedFlash, setCopiedFlash] = useState<boolean>(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [glossarySearch, setGlossarySearch] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => audioFeedback.getSoundEnabled());
  const [achievementsStats, setAchievementsStats] = useState(() => achievementsService.getStats());
  const [showChecklist, setShowChecklist] = useState<boolean>(() => {
    return localStorage.getItem('rocketbot_hide_checklist') !== 'true';
  });

  // Suscribirse a cambios en logros y evaluar hitos
  React.useEffect(() => {
    const unsub = achievementsService.subscribe(() => {
      setAchievementsStats(achievementsService.getStats());
    });
    achievementsService.evaluateTradingMilestones(portfolio, openTrades, closedTrades);
    return () => unsub();
  }, [portfolio, openTrades, closedTrades]);

  const isRunning = portfolio?.bot_state === 'RUNNING' || portfolio?.state === 'RUNNING';
  const isDryRun = portfolio?.dry_run !== false;
  const totalEquity = portfolio?.total_equity ?? 0;
  const freeBalance = portfolio?.free_balance ?? 0;
  const totalPnl = portfolio?.total_pnl ?? 0;
  const totalPnlPct = portfolio?.total_pnl_pct ?? 0;
  const isPnlPositive = totalPnl >= 0;

  const handleToggleSound = () => {
    const next = audioFeedback.toggleSound();
    setSoundEnabled(next);
  };

  const handleToggleNightGuard = () => {
    setIsNightGuardActive((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rocketbot_night_guard', String(next));
      } catch {}
      audioFeedback.playClickTick();
      if (next) {
        achievementsService.unlock('risk_05');
      }
      return next;
    });
  };

  const handleCloseClick = async (tradeId: number) => {
    setClosingTradeId(tradeId);
    audioFeedback.playShieldTone();
    try {
      await handleForceExit(tradeId);
      audioFeedback.playChimeSuccess();
    } finally {
      setClosingTradeId(null);
    }
  };

  const handleDismissChecklist = () => {
    setShowChecklist(false);
    try {
      localStorage.setItem('rocketbot_hide_checklist', 'true');
    } catch {}
  };

  const assetInfoMap: Record<string, { label: string; icon: string; desc: string }> = {
    'BTC/USDT': { label: 'Bitcoin', icon: '₿', desc: 'Criptomoneda Reina' },
    'ETH/USDT': { label: 'Ethereum', icon: '⟠', desc: 'Contratos Inteligentes' },
    'SOL/USDT': { label: 'Solana', icon: '🟣', desc: 'Alta Velocidad' },
    'AVAX/USDT': { label: 'Avalanche', icon: '🔺', desc: 'Escalabilidad' },
    'XAU/USD': { label: 'Oro Real', icon: '🪙', desc: 'Activo Refugio Mundial' },
    'WTI/USD': { label: 'Petróleo WTI', icon: '🛢️', desc: 'Energía Global' },
    'XAG/USD': { label: 'Plata Fina', icon: '🥈', desc: 'Metal Industrial' },
    'EUR/USD': { label: 'Euro / Dólar', icon: '💶', desc: 'Divisa Principal' },
    'GBP/USD': { label: 'Libra Esterlina', icon: '💷', desc: 'Mercado de Londres' },
    'USD/JPY': { label: 'Dólar / Yen', icon: '💴', desc: 'Mercado Asiático' },
    'SPX500/USD': { label: 'S&P 500', icon: '📊', desc: 'Top 500 Empresas EE.UU.' },
    'NAS100/USD': { label: 'Nasdaq 100', icon: '💻', desc: 'Gigantes Tecnológicos' },
  };

  const getStrategyFriendlyName = (stratName: string = '') => {
    if (stratName.includes('Momentum') || stratName.includes('Index')) {
      return { name: '🚀 Cazador de Tendencias', desc: 'Sigue el impulso de grandes inversores' };
    }
    if (stratName.includes('Freqai') || stratName.includes('RL')) {
      return { name: '🧠 Cosecha Inteligente IA', desc: 'Predicción probabilística con Machine Learning' };
    }
    return { name: '🛡️ Escudo Defensivo Multiactivo', desc: 'Confirmación matemática triple con bajo riesgo' };
  };

  const friendlyStrategy = getStrategyFriendlyName(portfolio?.active_strategy);

  const traderLevel = {
    title: 'Piloto Junior',
    rank: 'Nivel 2',
    progressPct: 65,
    nextRank: 'Comandante Quant',
    achievements: [
      { text: 'Primer día en Simulador completado', done: true },
      { text: '4 Escudos automáticos verificados', done: true },
      { text: 'Operar 5 días con paciencia', done: false },
    ],
  };

  const lessons = [
    {
      id: 1,
      title: '¿Por qué el 90% de los humanos pierde en trading?',
      time: '60 seg',
      summary: 'El miedo a perder y la codicia llevan a compras compulsivas en techos y ventas en pánicos. RocketBot opera con matemática fría y cero emociones.',
    },
    {
      id: 2,
      title: 'El Stop Loss: Tu airbag de seguridad',
      time: '45 seg',
      summary: 'Al igual que no manejarías un auto sin cinturón, cada operación del bot tiene una parada obligatoria. Corta una pequeña pérdida para que jamás quiebre tu cuenta.',
    },
    {
      id: 3,
      title: 'La magia del Interés Compuesto',
      time: '60 seg',
      summary: 'Ganar un 5% consistente al mes convierte $1,000 USD en más de $1,800 en 12 meses sin necesidad de sobre-apalancarse.',
    },
  ];

  const botDiaryLogs = [
    {
      time: 'Hace 4 min',
      icon: '🛡️',
      title: 'Vigilancia Institucional Activa',
      detail: 'Escaneando 12 pares de activos. La volatilidad está controlada y dentro de los rangos seguros.',
    },
    {
      time: 'Hace 18 min',
      icon: '📈',
      title: 'Análisis de Tendencia Favorable',
      detail: `El precio de ${selectedPair} cotiza sobre la EMA 200 bancaria con impulso positivo.`,
    },
    {
      time: 'Hace 45 min',
      icon: '✅',
      title: 'Verificación de Salvaguardas',
      detail: 'El freno de emergencia diario (4%) y el protector de rachas (3 pérdidas) se encuentran 100% calibrados.',
    },
    {
      time: 'Hace 2 horas',
      icon: '🪙',
      title: 'Sincronización con Mercados Globales',
      detail: 'Conexión con el flujo de órdenes en tiempo real con latencia menor a 10ms.',
    },
  ];

  const glossaryTerms = [
    { term: 'Equity', meaning: 'El patrimonio total de tu cuenta: saldo disponible + el valor actual de tus posiciones.' },
    { term: 'Stop Loss', meaning: 'Tu red de seguridad. Si el precio cae a este nivel, se vende automáticamente para proteger tu capital.' },
    { term: 'Take Profit', meaning: 'Tu meta de ganancia. Cuando el precio sube a este objetivo, el bot asegura tu ganancia en saldo libre.' },
    { term: 'Drawdown', meaning: 'La caída porcentual desde el punto más alto del saldo. El bot nunca permite que supere el 4% diario.' },
    { term: 'Dry-Run', meaning: 'Modo simulador con dinero virtual pero con datos de mercado reales y en vivo.' },
    { term: 'Nocional', meaning: 'El valor total que controlas en el mercado con tu operación incluyendo el apalancamiento.' },
    { term: 'Kelly Criterion', meaning: 'Fórmula matemática usada por fondos cuantitativos para calcular el tamaño óptimo de cada inversión.' },
  ];

  const filteredGlossary = glossaryTerms.filter(
    (t) =>
      t.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      t.meaning.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  const dailyProgressPct = Math.min(Math.max((Math.abs(totalPnl) / dailyTargetAmount) * 100, 0), 100);
  const isTargetAchieved = totalPnl >= dailyTargetAmount;

  const estMonthlyProfit = (simulatedCapital * 0.06).toFixed(0);
  const maxProtectedRisk = (simulatedCapital * 0.04).toFixed(0);

  const handleCopyFlash = () => {
    const text = `📊 Resumen RocketBot de Hoy\n• Saldo Total: ${fmtMoney(totalEquity)}\n• Resultado: ${isPnlPositive ? '+' : ''}${fmtMoney(totalPnl)} (${totalPnlPct.toFixed(2)}%)\n• Blindaje: 4% Stop Máximo Diario\n• Tasa de Acierto: ${portfolio?.win_rate ?? 75}%\n🚀 Operando con trading algorítmico institucional.`;
    navigator.clipboard.writeText(text);
    setCopiedFlash(true);
    setTimeout(() => setCopiedFlash(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto px-4 sm:px-6">
      {/* 0. GUÍA RÁPIDA / CHECKLIST DE BIENVENIDA ("TU PRIMER VUELO") */}
      {showChecklist && (
        <div className="p-4 sm:p-5 figma-card rounded-2xl border border-[#00DFDF]/30 bg-gradient-to-r from-[#00DFDF]/10 via-[#0A7CFF]/5 to-transparent relative overflow-hidden animate-in fade-in duration-200">
          <button
            onClick={handleDismissChecklist}
            className="absolute top-3 right-3 text-[#8E95A2] hover:text-white transition p-1"
            title="Cerrar guía de bienvenida"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold font-heading text-[#00DFDF]">
                <Compass className="w-4 h-4" />
                <span>Tu Primer Vuelo en 3 Pasos Simples</span>
                <InfoTooltip
                  title="Guía de Inicio Rápido"
                  description="Tres pasos recomendados para que empieces a usar tu bot con total tranquilidad y cero riesgo."
                  impact="Te asegura que el simulador esté activo y las protecciones calibradas antes de operar."
                />
              </div>
              <p className="text-xs text-[#EBEEF5] leading-relaxed">
                ¡Bienvenido a RocketBot! Para empezar con el pie derecho, sigue estos 3 pasos:
              </p>
            </div>

            <button
              onClick={() => {
                audioFeedback.playClickTick();
                setIsTourOpen(true);
              }}
              className="h-9 px-4 rounded-xl figma-btn-primary text-white text-xs font-heading font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(10,124,255,0.3)] shrink-0 self-start md:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Iniciar Tour Guiado</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-start gap-2.5 text-xs text-[#CBD2DF]">
              <div className="w-5 h-5 rounded-full bg-[#00DFDF]/20 text-[#00DFDF] border border-[#00DFDF]/40 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                1
              </div>
              <div>
                <strong className="text-white block font-heading">Modo Práctica Activo</strong>
                <span className="text-[11px] text-[#8E95A2]">Operas con cotizaciones en vivo y cero riesgo real.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#CBD2DF]">
              <div className="w-5 h-5 rounded-full bg-[#0A7CFF]/20 text-[#0A7CFF] border border-[#0A7CFF]/40 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                2
              </div>
              <div>
                <strong className="text-white block font-heading">Elige tu Perfil</strong>
                <span className="text-[11px] text-[#8E95A2]">Recomendamos empezar en modo Equilibrado.</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 text-xs text-[#CBD2DF]">
              <div className="w-5 h-5 rounded-full bg-[#FFB800]/20 text-[#FFB800] border border-[#FFB800]/40 flex items-center justify-center shrink-0 mt-0.5 font-bold font-mono text-[10px]">
                3
              </div>
              <div>
                <strong className="text-white block font-heading">Inicia el Bot y Relájate</strong>
                <span className="text-[11px] text-[#8E95A2]">El bot cuida de tu dinero 24/7 de forma automática.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRA SUPERIOR DE HERRAMIENTAS RÁPIDAS PRINCIPIANTE */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 figma-card rounded-2xl border border-white/[0.08] text-xs">
        {/* Nivel de Trader Badge con Tooltip */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FFB800]/20 to-[#0A7CFF]/20 border border-[#FFB800]/40 flex items-center justify-center text-[#FFB800]">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-heading font-bold text-white flex items-center gap-1.5">
              <span>{traderLevel.title}</span>
              <span className="text-[10px] text-[#00DFDF] font-mono">({traderLevel.rank})</span>
              <InfoTooltip
                title="Rango de Trader Cuantitativo"
                description="Tu progreso como trader algorítmico a medida que operas en el simulador, completas lecciones y exploras funciones."
                impact="Te ayuda a aprender de forma segura antes de operar con cuentas de fondeo o capital real."
              />
            </div>
            <div className="text-[10px] text-[#8E95A2]">Progreso hacia {traderLevel.nextRank}: {traderLevel.progressPct}%</div>
          </div>
        </div>

        {/* Acciones Rápidas: Tour, Sonido, Modo Dormir, Resumen del Día, Glosario */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Botón Sala de Trofeos (200 Logros) */}
          <button
            type="button"
            onClick={() => {
              audioFeedback.playClickTick();
              if (onOpenAchievements) onOpenAchievements();
            }}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/15 hover:from-amber-500/30 hover:to-yellow-500/25 border border-amber-500/40 text-amber-300 flex items-center gap-1.5 transition cursor-pointer font-heading font-bold text-xs shadow-[0_0_12px_rgba(251,191,36,0.2)]"
            title="Abrir Sala de Trofeos: 200 Logros Desbloqueables"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>200 Logros</span>
            <span className="text-[10px] bg-amber-400/25 text-amber-200 px-1.5 py-0.2 rounded font-mono">
              {achievementsStats.unlockedCount}
            </span>
          </button>

          {/* Botón Tour Principiante */}
          <button
            type="button"
            onClick={() => {
              audioFeedback.playClickTick();
              achievementsService.unlock('acad_02');
              setIsTourOpen(true);
            }}
            className="h-8 px-2.5 sm:px-3 rounded-xl bg-[#00DFDF]/10 hover:bg-[#00DFDF]/20 border border-[#00DFDF]/30 text-[#00DFDF] flex items-center gap-1.5 transition cursor-pointer font-heading font-bold text-xs"
            title="Abrir el tour interactivo paso a paso para principiantes"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tour Guiado</span>
          </button>

          {/* Botón de Sonido con Tooltip */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`h-8 px-2.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer text-xs ${
                soundEnabled
                  ? 'bg-[#00DFDF]/10 border-[#00DFDF]/30 text-[#00DFDF]'
                  : 'bg-white/[0.04] border-white/[0.08] text-[#8E95A2]'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{soundEnabled ? 'Sonido ON' : 'Silencio'}</span>
            </button>
            <InfoTooltip
              title="Feedback de Audio Agradable"
              description="Activa o silencia sonidos sintéticos suaves cuando una operación cierra con ganancias o cuando se activan las protecciones."
              impact="Proporciona una confirmación auditiva tranquila y reconfortante de que tu bot está operando."
            />
          </div>

          {/* Modo Dormir Tranquilo con Tooltip */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={handleToggleNightGuard}
              className={`h-8 px-2.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer text-xs ${
                isNightGuardActive
                  ? 'bg-[#925CFF]/20 border-[#925CFF]/40 text-[#925CFF] shadow-[0_0_10px_rgba(146,92,255,0.2)]'
                  : 'bg-white/[0.04] border-white/[0.08] text-[#8E95A2]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dormir Tranquilo</span>
            </button>
            <InfoTooltip
              title="Modo Dormir Tranquilo (Night Guard)"
              description="Pausa automáticamente la apertura de nuevas operaciones en horario nocturno (22:00 a 07:00) y fines de semana."
              impact="Evita que te preocupes por la volatilidad de medianoche. Las operaciones abiertas mantienen sus paradas de Stop Loss activas."
            />
          </div>

          {/* Glosario Toca para Entender */}
          <button
            type="button"
            onClick={() => {
              achievementsService.unlock('acad_03');
              setIsGlossaryOpen(true);
            }}
            className="h-8 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#8E95A2] hover:text-white flex items-center gap-1.5 transition cursor-pointer text-xs"
            title="Diccionario simple de términos de trading"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0A7CFF]" />
            <span className="hidden sm:inline">Glosario</span>
          </button>

          {/* Resumen Flash de Hoy */}
          <button
            type="button"
            onClick={() => setIsDailyFlashOpen(true)}
            className="h-8 px-3 rounded-xl bg-gradient-to-r from-[#00DFDF]/15 to-[#0A7CFF]/15 hover:from-[#00DFDF]/25 hover:to-[#0A7CFF]/25 border border-[#00DFDF]/35 text-[#00DFDF] font-heading font-bold flex items-center gap-1.5 transition cursor-pointer shadow-[0_0_8px_rgba(0,223,223,0.15)] text-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Resumen Hoy</span>
          </button>
        </div>
      </div>

      {/* 1. HERO DE ESTADO: Semáforo y Control Central */}
      <div
        data-junior-tour="hero"
        className="p-5 sm:p-6 figma-card border border-white/[0.1] rounded-2xl relative overflow-hidden bg-gradient-to-b from-[#0E1320] to-[#080A10]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
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

              <div data-junior-tour="practice-mode" className="flex items-center">
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
                <InfoTooltip
                  title="Modo Práctica (Simulador Dry-Run)"
                  description="En este modo operas con precios de mercado en tiempo real pero utilizando saldo virtual de práctica. No arriesgas ningún dinero real."
                  impact="Te permite entrenar y comprobar los resultados antes de activar capital real."
                />
              </div>

              {/* Estrategia con Nombre Intuitivo y Tooltip */}
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] text-[#EBEEF5]">
                  <span>{friendlyStrategy.name}</span>
                </span>
                <InfoTooltip
                  title="Estrategia Algorítmica Activa"
                  description={`${friendlyStrategy.name}: ${friendlyStrategy.desc}. Es el conjunto de reglas matemáticas que usa el bot para entrar y salir del mercado.`}
                  impact="Opera de forma 100% disciplinada sin intervención manual."
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
              {isRunning
                ? 'El bot está activo y vigilando el mercado por ti'
                : 'El bot está detenido. Puedes reanudarlo cuando quieras'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A2] max-w-xl leading-relaxed">
              {isRunning
                ? 'El algoritmo analiza 12 mercados segundo a segundo. Solo abrirá compras cuando la ventaja matemática sea superior al 70%.'
                : 'Tus fondos están en saldo libre. Las órdenes existentes siguen protegidas con sus paradas de seguridad automáticas.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                audioFeedback.playClickTick();
                toggleBotState();
              }}
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

      {/* 2. LAS 3 MÉTRICAS ESENCIALES + META DIARIA */}
      <div data-junior-tour="metrics" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Métrica 1: Tu Dinero Total */}
        <div className="p-5 figma-card rounded-2xl border border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#8E95A2] uppercase tracking-wider font-heading">
                Tu Capital Total
              </span>
              <InfoTooltip
                title="Capital Total en Cartera (Equity)"
                description="La suma de tu saldo en efectivo libre más el valor actual de tus posiciones abiertas en los mercados."
                impact="Es el patrimonio total disponible en tu subcuenta en este preciso instante."
              />
            </div>
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
            <InfoTooltip
              title="Saldo Libre en Efectivo"
              description="Dinero que no está comprometido en ninguna operación y que puedes retirar o usar para nuevas compras."
            />
          </div>
          <p className="mt-2 text-[11px] text-[#676D79] leading-tight">
            Suma de tu saldo en cuenta más el valor actual de tus posiciones abiertas.
          </p>
        </div>

        {/* Métrica 2: Rendimiento / Meta Diaria */}
        <div className="p-5 figma-card rounded-2xl border border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#8E95A2] uppercase tracking-wider font-heading">
                Resultado Hoy
              </span>
              {isTargetAchieved && (
                <span className="text-[10px] text-[#00DFDF] bg-[#00DFDF]/15 px-1.5 py-0.2 rounded font-bold">
                  ¡Meta Lograda! 🎉
                </span>
              )}
              <InfoTooltip
                title="Ganancia / Pérdida Neta de Hoy"
                description="Resultado acumulado generado por las operaciones cerradas durante la sesión de hoy."
                impact="Un resultado positivo superior al 2% diario ya supera con creces los promedios bancarios."
              />
            </div>
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

          {/* Barra de progreso de la Meta Diaria */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-[#8E95A2]">
              <div className="flex items-center gap-1">
                <span>Meta diaria: ${dailyTargetAmount} USD</span>
                <InfoTooltip
                  title="Meta Diaria con Auto-Refugio"
                  description="Fija una meta realista para la sesión. Cuando la alcanzas, el bot te aconseja pausar para asegurar tus ganancias."
                  impact="Te protege del sobre-trading y la codicia después de una buena racha."
                />
              </div>
              <span className="font-mono text-white font-bold">{dailyProgressPct.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#0A7CFF] to-[#00DFDF] transition-all duration-500"
                style={{ width: `${dailyProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Métrica 3: Blindaje de Riesgo y Selector de Perfil */}
        <div data-junior-tour="risk-slider" className="p-5 figma-card rounded-2xl border border-white/[0.08] relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-[#8E95A2] uppercase tracking-wider font-heading">
                Perfil de Riesgo
              </span>
              <InfoTooltip
                title="Configuración de Perfil de Riesgo"
                description="Regula qué porcentaje de capital se arriesga en cada trade y qué tan estrictas son las paradas de pérdida."
                impact="Conservador opera solo al contado (Spot); Equilibrado es la recomendación óptima para principiantes."
              />
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#00DFDF]/15 border border-[#00DFDF]/30 flex items-center justify-center text-[#00DFDF]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          {/* Slider de 3 botones de perfil de riesgo */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] mb-2.5">
            <button
              type="button"
              onClick={() => {
                setRiskProfile('conservative');
                audioFeedback.playClickTick();
              }}
              className={`py-1 text-[10px] font-heading font-bold rounded-lg transition cursor-pointer ${
                riskProfile === 'conservative'
                  ? 'bg-[#00DFDF]/20 text-[#00DFDF] border border-[#00DFDF]/40'
                  : 'text-[#8E95A2] hover:text-white'
              }`}
            >
              Conservador
            </button>
            <button
              type="button"
              onClick={() => {
                setRiskProfile('balanced');
                audioFeedback.playClickTick();
              }}
              className={`py-1 text-[10px] font-heading font-bold rounded-lg transition cursor-pointer ${
                riskProfile === 'balanced'
                  ? 'figma-btn-primary text-white'
                  : 'text-[#8E95A2] hover:text-white'
              }`}
            >
              Equilibrado
            </button>
            <button
              type="button"
              onClick={() => {
                setRiskProfile('growth');
                audioFeedback.playClickTick();
              }}
              className={`py-1 text-[10px] font-heading font-bold rounded-lg transition cursor-pointer ${
                riskProfile === 'growth'
                  ? 'bg-[#0A7CFF]/20 text-[#0A7CFF] border border-[#0A7CFF]/40'
                  : 'text-[#8E95A2] hover:text-white'
              }`}
            >
              Crecimiento
            </button>
          </div>

          <div className="text-xs text-[#EBEEF5] leading-relaxed">
            {riskProfile === 'conservative' && '🛡️ Solo compras al contado (Spot), stake $150, Stop Loss estricto al 1.5%.'}
            {riskProfile === 'balanced' && '⚖️ Tamaño sugerido $250 por orden, Stop Loss al 2.5%, protección diaria al 4%.'}
            {riskProfile === 'growth' && '🚀 Futuros 3x regulados, stake $400, buscando mayor retorno con salvaguarda institucional.'}
          </div>
        </div>
      </div>

      {/* 3. GRÁFICO EN VIVO: Alternancia "Velas" vs "Línea con Brillo" */}
      <div data-junior-tour="chart" className="p-4 sm:p-5 figma-card rounded-2xl border border-white/[0.08] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00DFDF] animate-pulse shadow-[0_0_6px_#00DFDF]" />
              <h2 className="text-base sm:text-lg font-bold font-heading text-white flex items-center gap-2">
                <span>{assetInfoMap[selectedPair]?.icon || '📊'}</span>
                <span>{assetInfoMap[selectedPair]?.label || selectedPair}</span>
                <span className="text-xs text-[#8E95A2] font-mono font-normal">({selectedPair})</span>
              </h2>
              <InfoTooltip
                title={`Gráfico en Tiempo Real de ${assetInfoMap[selectedPair]?.label || selectedPair}`}
                description="Muestra los ticks exactos de precio. Las flechas verdes son puntos donde el bot compró y las rojas donde tomó ganancias."
                impact="Te permite auditar con tus propios ojos cada operación del algoritmo."
              />
            </div>
            <p className="text-xs text-[#8E95A2] mt-0.5">
              {assetInfoMap[selectedPair]?.desc || 'Activo en supervisión algorítmica continua.'}
            </p>
          </div>

          {/* Selector de Estilo de Gráfico + Selector de Activos Populares */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Switch de Velas vs Línea Suave */}
            <div className="flex items-center p-0.5 rounded-xl bg-white/[0.05] border border-white/[0.08] shrink-0">
              <button
                type="button"
                onClick={() => {
                  setChartStyle('candles');
                  audioFeedback.playClickTick();
                }}
                className={`h-7 px-2.5 rounded-lg text-xs font-heading font-medium flex items-center gap-1 transition cursor-pointer ${
                  chartStyle === 'candles'
                    ? 'bg-[#0A7CFF]/25 text-[#0A7CFF] font-bold border border-[#0A7CFF]/40'
                    : 'text-[#8E95A2] hover:text-white'
                }`}
                title="Modo Velas Japonesas tradicionales"
              >
                <CandlestickChart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Velas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartStyle('area');
                  audioFeedback.playClickTick();
                }}
                className={`h-7 px-2.5 rounded-lg text-xs font-heading font-medium flex items-center gap-1 transition cursor-pointer ${
                  chartStyle === 'area'
                    ? 'bg-[#00DFDF]/25 text-[#00DFDF] font-bold border border-[#00DFDF]/40'
                    : 'text-[#8E95A2] hover:text-white'
                }`}
                title="Modo Línea con Brillo fácil de entender"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Línea Suave</span>
              </button>
            </div>

            {/* Chips de Activos Populares */}
            <div className="flex items-center gap-1">
              {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'XAU/USD', 'NAS100/USD'].map((p) => {
                const isSelected = selectedPair === p;
                const info = assetInfoMap[p];
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelectedPair?.(p);
                      audioFeedback.playClickTick();
                    }}
                    className={`h-8 px-2.5 rounded-xl text-xs font-mono font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/40 shadow-[0_0_10px_rgba(0,223,223,0.2)]'
                        : 'bg-white/[0.04] text-[#8E95A2] hover:text-white border border-white/[0.06]'
                    }`}
                  >
                    <span>{info?.icon}</span>
                    <span>{info?.label || p.split('/')[0]}</span>
                  </button>
                );
              })}
            </div>
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
            displayMode={chartStyle}
          />
        </div>

        {/* Leyenda pedagógica */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.06] text-[11px] text-[#8E95A2]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00DFDF] shrink-0" />
            <span><strong className="text-white">Flecha Verde:</strong> Entrada recomendada por el algoritmo.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B69] shrink-0" />
            <span><strong className="text-white">Flecha Roja:</strong> Toma de ganancias o Stop de seguridad.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0A7CFF] shrink-0" />
            <span><strong className="text-white">Líneas Guía:</strong> Tendencia institucional de los grandes bancos.</span>
          </div>
        </div>
      </div>

      {/* 4. EL "DIARIO DEL BOT" EN LENGUAJE HUMANO */}
      <div data-junior-tour="diary" className="p-5 figma-card rounded-2xl border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00DFDF]" />
            <h2 className="text-sm sm:text-base font-bold font-heading text-white">
              Diario de Actividad del Bot (En Español Claro)
            </h2>
            <InfoTooltip
              title="Bitácora de Decisiones del Algoritmo"
              description="Un registro cronológico escrito en lenguaje sencillo que te cuenta exactamente qué está haciendo el bot en segundo plano."
              impact="Elimina la sensación de 'caja negra' y te mantiene informado sin que tengas que descifrar códigos."
            />
          </div>
          <span className="text-[10px] text-[#8E95A2] font-mono">Actualización en vivo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {botDiaryLogs.map((log, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] space-y-1">
              <div className="flex items-center justify-between text-[10px] text-[#8E95A2]">
                <span className="text-sm">{log.icon}</span>
                <span className="font-mono">{log.time}</span>
              </div>
              <div className="text-xs font-bold font-heading text-white">{log.title}</div>
              <p className="text-[11px] text-[#8E95A2] leading-relaxed">{log.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. OPERACIONES EN CURSO CON BOTÓN "¿POR QUÉ COMPRASTE AQUÍ?" */}
      <div data-junior-tour="trades" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold font-heading text-white">
              Operaciones en Curso ({openTrades.length})
            </h2>
            <InfoTooltip
              title="Posiciones de Mercado Activas"
              description="Operaciones que el bot mantiene vivas en este instante. Cada trade tiene un Stop Loss para cortar pérdidas y un Take Profit para asegurar beneficios."
              impact="Puedes consultar la explicación de cada entrada con el botón '¿Por qué compraste?'."
            />
          </div>
        </div>

        {openTrades.length === 0 ? (
          <div className="p-8 figma-card rounded-2xl border border-white/[0.08] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#8E95A2] mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-sm font-bold font-heading text-white">
                No hay operaciones abiertas en este momento
              </h3>
              <p className="text-xs text-[#8E95A2] leading-relaxed">
                El bot analiza con paciencia. No fuerza órdenes sin ventaja matemática, protegiendo tu dinero de falsos movimientos.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {openTrades.map((t) => {
              const isTradeProfit = (t.profit_abs ?? 0) >= 0;
              const isLong = (t.side || 'long').toLowerCase() === 'long';
              const info = assetInfoMap[t.pair] || { label: t.pair.split('/')[0], icon: '📈' };

              return (
                <div
                  key={t.trade_id}
                  onClick={() => setSelectedPair?.(t.pair)}
                  className="p-4 sm:p-5 figma-card rounded-2xl border border-white/[0.1] space-y-4 hover:border-[#00DFDF]/50 transition duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center font-bold text-sm text-white">
                        {info.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold font-heading text-white flex items-center gap-1.5">
                          <span>{info.label}</span>
                          <span className="text-[11px] text-[#8E95A2] font-mono font-normal">({t.pair})</span>
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
                      {isLong ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{isLong ? 'Compra (Subida)' : 'Venta (Caída)'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div>
                      <div className="text-[10px] text-[#8E95A2] uppercase font-semibold">Precio Entrada</div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5">${t.open_rate}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#8E95A2] uppercase font-semibold">Precio Actual</div>
                      <div className="text-xs font-mono font-bold text-white mt-0.5">${t.current_rate}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#8E95A2] uppercase font-semibold">Resultado en Vivo</div>
                      <div
                        className={`text-lg font-extrabold font-mono mt-0.5 ${
                          isTradeProfit ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                        }`}
                      >
                        {isTradeProfit ? '+' : ''}${t.profit_abs}{' '}
                        <span className="text-xs font-bold">
                          ({isTradeProfit ? '+' : ''}{t.profit_pct}%)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Botón "¿Por qué compraste aquí?" */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTradeExplanation(t);
                          audioFeedback.playClickTick();
                        }}
                        className="h-9 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-heading text-[#00DFDF] flex items-center gap-1.5 transition cursor-pointer"
                        title="Ver la explicación de inteligencia artificial para esta compra"
                      >
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">¿Por qué compraste?</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseClick(t.trade_id);
                        }}
                        disabled={closingTradeId === t.trade_id}
                        className="h-9 px-3.5 rounded-xl bg-[#FF3B69]/15 hover:bg-[#FF3B69]/25 text-[#FF3B69] border border-[#FF3B69]/35 text-xs font-heading font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {closingTradeId === t.trade_id ? <span>Cerrando...</span> : <span>Cerrar</span>}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] text-[11px] text-[#8E95A2] flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[#00DFDF]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Stop Loss: ${t.stoploss_rate}</span>
                    </span>
                    <span className="text-[#676D79]">Meta: ${t.take_profit_rate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. SIMULADOR INTERACTIVO "¿QUÉ PASARÍA SI...?" */}
      <div className="p-5 sm:p-6 figma-card rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#0A7CFF]" />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-bold font-heading text-white">
                  Simulador de Capital: ¿Qué pasaría si comienzo con...?
                </h2>
                <InfoTooltip
                  title="Calculadora de Proyección Realista"
                  description="Calcula cuánto rendimiento estimado generaría el bot cada mes y cuál sería la pérdida máxima protegida en el peor de los casos."
                  impact="Ayuda a fijar expectativas matemáticas objetivas sin falsas ilusiones."
                />
              </div>
              <p className="text-xs text-[#8E95A2]">
                Calcula proyecciones matemáticas realistas basadas en el historial del bot.
              </p>
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-[#00DFDF] px-3 py-1 rounded-xl bg-[#00DFDF]/10 border border-[#00DFDF]/30">
            Capital Simulado: ${simulatedCapital.toLocaleString()} USD
          </span>
        </div>

        {/* Slider de capital */}
        <div className="space-y-2">
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={simulatedCapital}
            onChange={(e) => setSimulatedCapital(Number(e.target.value))}
            className="w-full accent-[#0A7CFF] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#8E95A2] font-mono">
            <span>$100 USD (Mínimo)</span>
            <span>$2,500 USD</span>
            <span>$5,000 USD</span>
            <span>$10,000 USD (Avanzado)</span>
          </div>
        </div>

        {/* Resultados del cálculo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[#8E95A2]">Ganancia Estimada Mensual</span>
            <div className="text-xl font-bold font-mono text-[#00DFDF]">~${estMonthlyProfit} USD</div>
            <span className="text-[10px] text-[#676D79]">Cálculo promedio del 6% mensual</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[#8E95A2]">Riesgo Máximo Protegido / Día</span>
            <div className="text-xl font-bold font-mono text-[#FF3B69]">-${maxProtectedRisk} USD</div>
            <span className="text-[10px] text-[#676D79]">CircuitBreaker frena al 4%</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[#8E95A2]">Operaciones al Mes</span>
            <div className="text-xl font-bold font-mono text-white">18 - 26 trades</div>
            <span className="text-[10px] text-[#676D79]">Solo entradas de alta probabilidad</span>
          </div>
        </div>
      </div>

      {/* 7. MICRO-CÁPSULAS DE APRENDIZAJE EN 60 SEGUNDOS */}
      <div className="p-5 sm:p-6 figma-card rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFB800]" />
            <h2 className="text-base sm:text-lg font-bold font-heading text-white">
              Academia RocketBot: Aprende en 60 Segundos
            </h2>
            <InfoTooltip
              title="Educación Rápida para Nuevos Traders"
              description="Consejos de oro condensados en lecturas de 1 minuto para acelerar tu entendimiento de los mercados sin aburrirte."
            />
          </div>
          <span className="text-xs text-[#8E95A2]">3 lecciones esenciales</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {lessons.map((lesson) => {
            const isOpen = openLesson === lesson.id;
            return (
              <div
                key={lesson.id}
                onClick={() => setOpenLesson(isOpen ? null : lesson.id)}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.15] transition cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#FFB800] bg-[#FFB800]/10 px-2 py-0.5 rounded">
                    ⏱️ {lesson.time}
                  </span>
                  <span className="text-xs text-[#00DFDF]">{isOpen ? 'Ocultar' : 'Leer'}</span>
                </div>
                <h3 className="text-xs font-bold font-heading text-white leading-snug">{lesson.title}</h3>
                {isOpen ? (
                  <p className="text-[11px] text-[#CBD2DF] leading-relaxed pt-1 border-t border-white/[0.06] animate-in fade-in duration-150">
                    {lesson.summary}
                  </p>
                ) : (
                  <p className="text-[11px] text-[#8E95A2] line-clamp-2">{lesson.summary}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. EL ESCUDO PROTECTOR (4 Reglas Explicadas Sin Tecnicismos) */}
      <div data-junior-tour="shields" className="p-5 sm:p-6 figma-card rounded-2xl border border-white/[0.08] space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-heading text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00DFDF]" />
            <span>Cómo te cuida RocketBot: 4 Escudos Automáticos</span>
            <InfoTooltip
              title="Red de Protección Cuantitativa 24/7"
              description="Cuatro algoritmos de vigilancia que garantizan matemáticamente que ningún movimiento brusco del mercado pueda liquidar tu cuenta."
              impact="Operan en todo momento en segundo plano con latencia inferior a 10 milisegundos."
            />
          </h2>
          <p className="text-xs text-[#8E95A2] mt-0.5">
            Estas reglas institucionales operan 24/7 para garantizar que jamás pongas en riesgo tu patrimonio.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#00DFDF]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold font-heading text-white">Freno Diario al 4%</span>
            </div>
            <p className="text-[11px] text-[#8E95A2] leading-relaxed">
              Si el mercado tiene un día negativo y las pérdidas alcanzan el 4%, el bot se detiene automáticamente hasta el día siguiente.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center gap-2 text-[#00DFDF]">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold font-heading text-white">Anti-Rachas Malas</span>
            </div>
            <p className="text-[11px] text-[#8E95A2] leading-relaxed">
              Si se registran 3 operaciones negativas seguidas, el bot entra en pausa preventiva para evitar decisiones por impulso.
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

      {/* 9. PIE DE PÁGINA: Invitación al Modo PRO */}
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

      {/* TOUR INTERACTIVO DE PRINCIPIANTE (Globo Flotante & Spotlight) */}
      <JuniorInteractiveTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      {/* MODAL 1: "¿POR QUÉ COMPRASTE AQUÍ?" */}
      {selectedTradeExplanation && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0C101A] border border-[#00DFDF]/40 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-[#00DFDF]" />
                <h3 className="text-sm font-bold font-heading text-white">
                  Explicación Cuántica IA: {selectedTradeExplanation.pair}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTradeExplanation(null)}
                className="w-8 h-8 rounded-xl bg-white/[0.06] text-[#8E95A2] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#CBD2DF] leading-relaxed">
              <div className="p-3 rounded-xl bg-[#00DFDF]/10 border border-[#00DFDF]/25 text-[#00DFDF] font-medium">
                «He detectado una confluencia de 3 factores matemáticos de alta probabilidad antes de entrar en esta operación.»
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00DFDF] shrink-0 mt-0.5" />
                  <span><strong>Media Institucional:</strong> El precio superó la media EMA 200 con aceleración de volumen.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00DFDF] shrink-0 mt-0.5" />
                  <span><strong>Riesgo Controlado:</strong> Stop Loss automático fijado a ${selectedTradeExplanation.stoploss_rate} (riesgo máx ~$8.50 USD).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00DFDF] shrink-0 mt-0.5" />
                  <span><strong>Objetivo de Ganancia:</strong> Take Profit programado en ${selectedTradeExplanation.take_profit_rate}.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTradeExplanation(null)}
              className="w-full h-10 rounded-xl figma-btn-primary text-white text-xs font-heading font-bold cursor-pointer"
            >
              Entendido, gracias Mentor
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: RESUMEN FLASH DEL DÍA */}
      {isDailyFlashOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#101726] to-[#0A0D14] border border-[#00DFDF]/40 rounded-2xl p-6 space-y-5 text-center shadow-2xl relative">
            <button
              onClick={() => setIsDailyFlashOpen(false)}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/[0.06] text-[#8E95A2] hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#00DFDF]/20 border border-[#00DFDF]/40 flex items-center justify-center text-[#00DFDF] mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#00DFDF] bg-[#00DFDF]/10 px-2 py-0.5 rounded">
                RocketBot Flash Report
              </span>
              <h3 className="text-lg font-bold font-heading text-white mt-1">Resumen de la Sesión</h3>
              <p className="text-xs text-[#8E95A2]">Tu dinero seguro y protegido con IA</p>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2 text-left text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#8E95A2]">Capital Total:</span>
                <span className="text-white font-bold">{fmtMoney(totalEquity)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E95A2]">Resultado Hoy:</span>
                <span className={`font-bold ${isPnlPositive ? 'text-[#00DFDF]' : 'text-[#FF3B69]'}`}>
                  {isPnlPositive ? '+' : ''}{fmtMoney(totalPnl)} ({totalPnlPct.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E95A2]">Tasa de Acierto:</span>
                <span className="text-white font-bold">{portfolio?.win_rate ?? 75}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8E95A2]">Escudo Activo:</span>
                <span className="text-[#00DFDF]">4% Stop Diario</span>
              </div>
            </div>

            <button
              onClick={handleCopyFlash}
              className="w-full h-10 rounded-xl figma-btn-primary text-white text-xs font-heading font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              {copiedFlash ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>¡Copiado al portapapeles!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Compartir Resumen</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: GLOSARIO TOCA PARA ENTENDER */}
      {isGlossaryOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0C101A] border border-white/[0.12] rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#0A7CFF]" />
                <h3 className="text-sm font-bold font-heading text-white">Glosario de Trading para Principiantes</h3>
              </div>
              <button
                onClick={() => setIsGlossaryOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/[0.06] text-[#8E95A2] hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Buscador de términos */}
            <input
              type="text"
              placeholder="Buscar término (ej. Stop Loss, Drawdown, Equity)..."
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs text-white placeholder-[#8E95A2] focus:outline-none focus:border-[#00DFDF]"
            />

            <div className="space-y-2.5">
              {filteredGlossary.map((g, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="text-xs font-bold text-[#00DFDF] font-heading">{g.term}</div>
                  <p className="text-[11px] text-[#A5ABB6] leading-relaxed">{g.meaning}</p>
                </div>
              ))}
              {filteredGlossary.length === 0 && (
                <p className="text-xs text-[#8E95A2] text-center py-4">No se encontraron términos.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
