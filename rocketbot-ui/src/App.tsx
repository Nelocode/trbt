import React, { useEffect, useState, useCallback } from 'react';
import {
  Rocket,
  Activity,
  Shield,
  BrainCircuit,
  TrendingUp,
  Play,
  Pause,
  FlaskConical,
  Wallet,
  Zap,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  Download,
  HelpCircle,
  Sparkles,
  Eye,
  EyeOff,
  AlertOctagon,
  Layers,
  Trophy,
  Bell,
  Plus,
  Minus,
} from 'lucide-react';
import {
  TradingViewChart,
  type CandlePoint,
  type ChartMarker,
  type OpenTradeOverlay,
} from './components/TradingViewChart';
import { SignalRadarPanel, type RadarSignalItem } from './components/SignalRadarPanel';
import { BacktestLabView } from './components/BacktestLabView';
import { InfoTooltip } from './components/InfoTooltip';
import { TutorialTourModal } from './components/TutorialTourModal';
import { InteractiveTour } from './components/InteractiveTour';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { CorrelationMatrixModal } from './components/CorrelationMatrixModal';
import { PropFirmModal } from './components/PropFirmModal';
import { TelegramDiscordModal } from './components/TelegramDiscordModal';
import { AccountSwitcherDropdown, type AccountSummary } from './components/AccountSwitcherDropdown';
import { NewAccountModal } from './components/NewAccountModal';
import { MasterConsolidatedModal } from './components/MasterConsolidatedModal';
import { LoginModal, type AuthUser } from './components/LoginModal';
import { UserProfileMenu } from './components/UserProfileMenu';
import { UserManagementModal } from './components/UserManagementModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ForceChangePasswordModal } from './components/ForceChangePasswordModal';
import { ConfirmLiveCapitalModal } from './components/ConfirmLiveCapitalModal';

// Auto-detección dinámica para producción en Docker, Easypanel o desarrollo local
const getApiBase = () => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  if (typeof window !== 'undefined') {
    // Si corre en puerto de desarrollo local (3000 o 5173), apunta al backend en 8090
    if (window.location.port === '3000' || window.location.port === '5173') {
      return `http://${window.location.hostname}:8090`;
    }
    // En producción (Easypanel, Nginx o servidor unificado), usa el mismo origen del navegador
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://127.0.0.1:8090';
};

const getWsUrl = () => {
  const envWs = (import.meta as any).env?.VITE_WS_URL;
  if (envWs) return envWs;
  if (typeof window !== 'undefined') {
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    if (window.location.port === '3000' || window.location.port === '5173') {
      return `ws://${window.location.hostname}:8090/ws/stream`;
    }
    return `${wsProto}//${window.location.host}/ws/stream`;
  }
  return 'ws://127.0.0.1:8090/ws/stream';
};

const API_BASE = getApiBase();
const WS_URL = getWsUrl();

export default function App() {
  const [activeAccountId, setActiveAccountId] = useState<string>(() => {
    try {
      return localStorage.getItem('rocketbot_active_account_id') || 'acc_dryrun_master';
    } catch {
      return 'acc_dryrun_master';
    }
  });
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState<boolean>(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState<boolean>(false);

  // Autenticación JWT y Roles RBAC
  const [authToken, setAuthToken] = useState<string>(() => {
    try {
      return localStorage.getItem('rocketbot_jwt_token') || '';
    } catch {
      return '';
    }
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('rocketbot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isUserManagementOpen, setIsUserManagementOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isConfirmLiveOpen, setIsConfirmLiveOpen] = useState<boolean>(false);

  const handleForcePasswordChanged = () => {
    if (currentUser) {
      const updated: AuthUser = { ...currentUser, must_change_password: false };
      setCurrentUser(updated);
      try {
        localStorage.setItem('rocketbot_user', JSON.stringify(updated));
      } catch {}
    }
  };

  const toggleDryRunMode = () => {
    if (portfolio.dry_run) {
      setIsConfirmLiveOpen(true);
    } else {
      handleSetDryRun(true);
    }
  };

  const handleSetDryRun = async (dryRunVal: boolean) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/bot/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ dry_run: dryRunVal }),
      });
      if (res.ok) {
        setPortfolio((prev: any) => ({ ...prev, dry_run: dryRunVal }));
      }
    } catch {}
  };

  const handleLoginSuccess = (token: string, user: AuthUser) => {
    setAuthToken(token);
    setCurrentUser(user);
    try {
      localStorage.setItem('rocketbot_jwt_token', token);
      localStorage.setItem('rocketbot_user', JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    setAuthToken('');
    setCurrentUser(null);
    try {
      localStorage.removeItem('rocketbot_jwt_token');
      localStorage.removeItem('rocketbot_user');
    } catch {}
  };

  useEffect(() => {
    if (authToken) {
      fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Unauthorized');
        })
        .then((data) => {
          setCurrentUser(data.user);
          localStorage.setItem('rocketbot_user', JSON.stringify(data.user));
        })
        .catch(() => {
          handleLogout();
        });
    }
  }, [authToken]);

  const [activeTab, setActiveTab] = useState<'terminal' | 'lab' | 'freqai'>('terminal');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState<boolean>(
    () => localStorage.getItem('rocketbot_privacy') === 'true',
  );
  const [isCorrelationOpen, setIsCorrelationOpen] = useState<boolean>(false);
  const [isPropFirmOpen, setIsPropFirmOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [isPanicConfirmOpen, setIsPanicConfirmOpen] = useState<boolean>(false);
  const [kellyData, setKellyData] = useState<any>(null);
  const [selectedPair, setSelectedPair] = useState<string>('BTC/USDT');
  const [timeframe, setTimeframe] = useState<string>('5m');

  const togglePrivacyMode = () => {
    setIsPrivacyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rocketbot_privacy', String(next));
      } catch {}
      return next;
    });
  };

  const fmtMoney = (val: number | undefined | null) => {
    if (isPrivacyMode) return '$••••••';
    if (val === undefined || val === null) return '$0.00';
    return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleAccountSwitched = (accId: string, accData?: AccountSummary) => {
    setActiveAccountId(accId);
    try {
      localStorage.setItem('rocketbot_active_account_id', accId);
    } catch {}
    if (accData) {
      setPortfolio((prev: any) => ({
        ...prev,
        ...accData,
        trading_mode: accData.trading_mode,
        dry_run: accData.dry_run,
        exchange: accData.exchange,
        active_strategy: accData.active_strategy,
      }));
    }
  };

  const handlePanicCloseAll = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/risk/panic-close-all?account_id=${encodeURIComponent(activeAccountId)}`, { method: 'POST' });
      if (res.ok) {
        await fetchOverview();
        setIsPanicConfirmOpen(false);
      }
    } catch {}
  };

  const handleAdjustLevel = async (tradeId: number, type: 'sl' | 'tp', deltaPercent: number) => {
    const trade = openTrades.find((t) => t.trade_id === tradeId);
    if (!trade) return;
    let newSl = trade.stoploss_price;
    let newTp = trade.take_profit_price;

    if (type === 'sl') {
      newSl = Math.max(0, Number((newSl * (1 + deltaPercent / 100)).toFixed(2)));
    } else {
      newTp = Math.max(0, Number((newTp * (1 + deltaPercent / 100)).toFixed(2)));
    }

    try {
      await fetch(`${API_BASE}/api/v1/trade/update-levels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: activeAccountId,
          trade_id: tradeId,
          stoploss_price: newSl,
          take_profit_price: newTp,
        }),
      });
      fetchOverview();
    } catch {}
  };

  const [portfolio, setPortfolio] = useState<any>({
    state: 'RUNNING',
    trading_mode: 'futures',
    margin_mode: 'isolated',
    dry_run: true,
    exchange: 'binance',
    data_source: 'CCXT Live',
    active_strategy: 'RocketMultiFactorV1',
    starting_balance: 10000,
    total_equity: 10418.65,
    free_balance: 8968.65,
    used_margin: 1450,
    total_notional_exposure: 3950,
    realized_pnl: 418.65,
    unrealized_pnl: 0,
    total_pnl: 418.65,
    total_pnl_pct: 4.19,
    win_rate: 80.0,
    open_trades_count: 3,
    max_open_trades: 5,
    protections: [],
  });

  const [openTrades, setOpenTrades] = useState<any[]>([]);
  const [closedTrades, setClosedTrades] = useState<any[]>([]);
  const [radarSignals, setRadarSignals] = useState<RadarSignalItem[]>([]);
  const [freqaiPredictions, setFreqaiPredictions] = useState<any[]>([]);

  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [markers, setMarkers] = useState<ChartMarker[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [bottomTab, setBottomTab] = useState<'open' | 'closed' | 'protections'>('open');

  const fallbackProtections = [
    {
      name: 'CircuitBreaker Diario',
      status: 'ACTIVO',
      detail: 'Freno automático ante pérdida diaria >= 4.0% para preservar el balance',
    },
    {
      name: 'Racha Perdedora (Streak Guard)',
      status: 'ACTIVO',
      detail: 'Pausa preventiva tras 3 operaciones perdedoras consecutivas',
    },
    {
      name: 'Filtro Macro EMA 200',
      status: 'ACTIVO',
      detail: 'Solo permite compras si el precio opera sobre la media institucional con ADX tendencial',
    },
    {
      name: 'Cooldown Anti-Overtrading',
      status: 'ACTIVO',
      detail: 'Pausa de 2 velas tras salida de posición para evitar sobre-operación impulsiva',
    },
  ];

  const protectionsList = (portfolio?.protections && Array.isArray(portfolio.protections) && portfolio.protections.length > 0)
    ? portfolio.protections
    : fallbackProtections;

  const fetchOverview = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch(`${API_BASE}/api/v1/overview?account_id=${encodeURIComponent(activeAccountId)}`, { headers });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data.portfolio);
        setOpenTrades(data.open_trades);
        setClosedTrades(data.closed_trades);
        setRadarSignals(data.radar);
        setFreqaiPredictions(data.freqai_predictions || []);
      }
      try {
        const kRes = await fetch(`${API_BASE}/api/v1/risk/kelly-sizing`, { headers });
        if (kRes.ok) setKellyData(await kRes.json());
      } catch {}
    } catch {
      // ignore
    }
  }, [activeAccountId, authToken]);

  const fetchPairCandles = useCallback(async (pair: string, tf: string) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/candles?pair=${encodeURIComponent(pair)}&timeframe=${tf}&limit=220`,
      );
      if (res.ok) {
        const data = await res.json();
        setCandles(data.candles);
        setMarkers(data.markers);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchPairCandles(selectedPair, timeframe);
    const interval = setInterval(() => {
      fetchPairCandles(selectedPair, timeframe);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedPair, timeframe, fetchPairCandles]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let retryTimer: any = null;

    function connect() {
      const url = `${WS_URL}?account_id=${encodeURIComponent(activeAccountId)}`;
      ws = new WebSocket(url);
      ws.onopen = () => setWsConnected(true);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'tick_update') {
            setPortfolio(msg.portfolio);
            setOpenTrades(msg.open_trades);
            setRadarSignals(msg.radar);
            if (msg.freqai) setFreqaiPredictions(msg.freqai);
          }
        } catch {
          // ignore
        }
      };
      ws.onclose = () => {
        setWsConnected(false);
        retryTimer = setTimeout(connect, 2500);
      };
    }

    connect();
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
      if (ws) ws.close();
    };
  }, [activeAccountId]);

  async function toggleBotState() {
    const nextState = portfolio.state === 'RUNNING' ? 'PAUSED' : 'RUNNING';
    const res = await fetch(`${API_BASE}/api/v1/bot/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: nextState }),
    });
    if (res.ok) {
      setPortfolio(await res.json());
    }
  }

  async function toggleTradingMode() {
    const nextMode = portfolio.trading_mode === 'futures' ? 'spot' : 'futures';
    const res = await fetch(`${API_BASE}/api/v1/bot/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trading_mode: nextMode }),
    });
    if (res.ok) {
      setPortfolio(await res.json());
    }
  }

  async function handleStrategyChange(newStrat: string) {
    const res = await fetch(`${API_BASE}/api/v1/bot/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active_strategy: newStrat }),
    });
    if (res.ok) {
      setPortfolio(await res.json());
      fetchPairCandles(selectedPair, timeframe);
    }
  }

  async function handleQuickOrder(pair: string, side: 'long' | 'short') {
    const res = await fetch(`${API_BASE}/api/v1/trade/force-enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: activeAccountId,
        pair,
        side,
        stake_amount: 300,
        leverage: portfolio.trading_mode === 'futures' ? 3.0 : 1.0,
        enter_tag: `Manual_${side.toUpperCase()}_Terminal`,
      }),
    });
    if (res.ok) {
      await fetchOverview();
      setSelectedPair(pair);
    }
  }

  async function handleForceExit(tradeId: number) {
    const res = await fetch(`${API_BASE}/api/v1/trade/force-exit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_id: activeAccountId,
        trade_id: tradeId,
        reason: 'manual_close_terminal',
      }),
    });
    if (res.ok) {
      await fetchOverview();
    }
  }

  const activeTradeForSelectedPair: OpenTradeOverlay | undefined = openTrades.find(
    (t) => t.pair === selectedPair,
  );

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative selection:bg-[#0A7CFF]/30 selection:text-white">
      {/* Resplandor difuso ambiental de fondo (sin desplazar contenido) */}
      <div className="ambient-glow-top" />

      {/* Header Compacto y Proporcional */}
      <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-black/85 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl figma-btn-primary p-0 flex items-center justify-center text-white">
              <Rocket className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold font-heading tracking-tight text-white text-sm">
                  ROCKETBOT <span className="text-[#0A7CFF]">PRO</span>
                </span>
                <span className="figma-badge-wip text-[10px] text-[#0A7CFF] py-0.2 px-1.5">
                  v2.0 Engine
                </span>
                <InfoTooltip
                  title="RocketBot Pro v2.0"
                  description="Plataforma de trading algorítmico institucional que unifica motor de ejecución en vivo, radar multi-factor y laboratorio de backtesting."
                  impact="Te permite monitorear y operar sin las limitaciones de modo dividido de Freqtrade tradicional."
                />
              </div>
              <div className="text-[10px] text-[#8E95A2] font-mono flex items-center gap-2">
                <span>{portfolio.data_source}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      wsConnected ? 'bg-[#00DFDF] shadow-[0_0_6px_#00DFDF]' : 'bg-[#F5A623]'
                    }`}
                  />
                  {wsConnected ? 'Stream WS (<10ms)' : 'Reconectando WS...'}
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Subcuenta Aislada */}
          <div data-tour="account-switcher" className="hidden sm:block">
            <AccountSwitcherDropdown
              apiBase={API_BASE}
              activeAccountId={activeAccountId}
              isPrivacyMode={isPrivacyMode}
              token={authToken}
              onAccountSwitched={handleAccountSwitched}
              onOpenNewAccountModal={() => setIsNewAccountModalOpen(true)}
              onOpenMasterModal={() => setIsMasterModalOpen(true)}
            />
          </div>

          {/* Menú de Navegación Centrado */}
          <nav className="flex items-center figma-tablist-pill">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`figma-tab-item ${activeTab === 'terminal' ? 'active' : ''}`}
            >
              <Activity className="w-3.5 h-3.5 inline mr-1" />
              <span>Terminal Trading</span>
            </button>

            <button
              data-tour="lab-tab"
              onClick={() => setActiveTab('lab')}
              className={`figma-tab-item ${activeTab === 'lab' ? 'active' : ''}`}
            >
              <FlaskConical className="w-3.5 h-3.5 inline mr-1" />
              <span>Backtest & Hyperopt</span>
            </button>

            <button
              onClick={() => setActiveTab('freqai')}
              className={`figma-tab-item ${activeTab === 'freqai' ? 'active' : ''}`}
            >
              <BrainCircuit className="w-3.5 h-3.5 inline mr-1" />
              <span>FreqAI ML</span>
            </button>
          </nav>
        </div>

        {/* Controles de Ejecución */}
        <div data-tour="header-controls" className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTradingMode}
              className="px-2.5 py-1.5 rounded-lg figma-btn-secondary text-xs font-mono font-medium text-white transition cursor-pointer"
            >
              {portfolio.trading_mode === 'futures' ? 'FUTURES (3x ISOLATED)' : 'SPOT MARKET'}
            </button>
            <InfoTooltip
              title="Modo de Mercado (Futuros vs Spot)"
              description="Alterna entre operaciones al contado (Spot, solo compras alcistas) y contratos perpetuos con apalancamiento (Futuros, compras Long y ventas Short)."
              impact="En Futuros puedes ganar en caídas (Short) pero existe riesgo de liquidación si el precio toca el stop extremo."
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={toggleDryRunMode}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 ${
                portfolio.dry_run
                  ? 'bg-[#0A7CFF]/15 border border-[#0A7CFF]/30 text-[#0A7CFF] hover:bg-[#0A7CFF]/25'
                  : 'bg-[#FF3B69]/20 border border-[#FF3B69]/40 text-[#FF3B69] hover:bg-[#FF3B69]/30 shadow-[0_0_15px_rgba(255,59,105,0.3)] animate-pulse'
              }`}
              title="Click para alternar entre Simulador Dry-Run y Capital Real Live (requiere confirmación)"
            >
              <span className={`w-2 h-2 rounded-full ${portfolio.dry_run ? 'bg-[#0A7CFF]' : 'bg-[#FF3B69]'}`} />
              <span>{portfolio.dry_run ? 'DRY-RUN SIMULATOR' : 'LIVE CAPITAL'}</span>
            </button>
            <InfoTooltip
              title="Modo de Ejecución (Dry-Run vs Live)"
              description="Alterna entre el simulador de latencia cero sin riesgo de balance (Dry-Run) y la ejecución con capital real directo en exchange/broker."
              impact="Para activar LIVE CAPITAL debes aceptar la confirmación de riesgo institucional en 2 pasos."
            />
          </div>

          <button
            onClick={toggleBotState}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition cursor-pointer ${
              portfolio.state === 'RUNNING'
                ? 'figma-btn-primary text-white'
                : 'bg-[#FF3B69]/20 text-[#FF3B69] border border-[#FF3B69]/40'
            }`}
          >
            {portfolio.state === 'RUNNING' ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>BOT ACTIVO</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PAUSADO (CLICK INICIAR)</span>
              </>
            )}
          </button>
          <InfoTooltip
            title="Interruptor Maestro del Bot"
            description="Pausa o reanuda el escaneo de nuevas oportunidades de compra/venta en todos los pares activos."
            impact="Al pausar, el bot mantiene y protege las posiciones abiertas actuales pero no entrará en nuevos trades."
          />

          {/* Interruptor de Pánico / Kill-Switch */}
          <button
            data-tour="kill-switch-btn"
            onClick={() => setIsPanicConfirmOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FF3B69]/15 hover:bg-[#FF3B69]/25 border border-[#FF3B69]/40 text-[#FF3B69] text-xs font-heading font-bold transition cursor-pointer shadow-[0_0_10px_rgba(255,59,105,0.2)]"
            title="Circuit Breaker: Liquidar todas las operaciones abiertas y pausar el bot de inmediato"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Kill-Switch</span>
          </button>

          {/* Modo Privacidad (Ocultación de Balance) */}
          <button
            data-tour="privacy-btn"
            onClick={togglePrivacyMode}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-mono font-medium transition cursor-pointer ${
              isPrivacyMode
                ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40'
                : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-[#8E95A2] hover:text-white'
            }`}
            title={isPrivacyMode ? 'Privacidad Activa: Ocultando saldos y cifras' : 'Modo Privacidad: Ocultar cifras para streaming/capturas'}
          >
            {isPrivacyMode ? <EyeOff className="w-3.5 h-3.5 text-[#FFB800]" /> : <Eye className="w-3.5 h-3.5" />}
          </button>

          {/* Herramientas Institucionales */}
          <div data-tour="institutional-tools" className="flex items-center gap-1">
            <button
              onClick={() => setIsCorrelationOpen(true)}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#8E95A2] hover:text-white text-xs transition cursor-pointer"
              title="Matriz de Correlación Cruzada Rolling (12 Activos)"
            >
              <Layers className="w-3.5 h-3.5 text-[#0A7CFF]" />
            </button>

            <button
              onClick={() => setIsPropFirmOpen(true)}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#8E95A2] hover:text-white text-xs transition cursor-pointer"
              title="Escudo de Reglas de Fondeo (FTMO / Apex)"
            >
              <Trophy className="w-3.5 h-3.5 text-[#FFB800]" />
            </button>

            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#8E95A2] hover:text-white text-xs transition cursor-pointer"
              title="Configurar Alertas 24/7 (Telegram & Discord)"
            >
              <Bell className="w-3.5 h-3.5 text-[#00DFDF]" />
            </button>
          </div>

          {/* Botones de IA, Documentación y Guía Interactiva */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-white/[0.08]">
            <button
              data-tour="ai-copilot-btn"
              onClick={() => setIsAIOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#00DFDF]/15 to-[#0A7CFF]/15 hover:from-[#00DFDF]/25 hover:to-[#0A7CFF]/25 border border-[#00DFDF]/35 text-[#00DFDF] text-xs font-heading font-bold transition cursor-pointer shadow-[0_0_12px_rgba(0,223,223,0.2)]"
              title="Abrir Mentor & Auditor Cuántico IA (Prof. Quant Alpha)"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-[#00DFDF]" />
              <span>Mentor IA</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00DFDF] inline-block" />
            </button>

            <button
              onClick={() => setIsTourOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0A7CFF]/15 hover:bg-[#0A7CFF]/25 border border-[#0A7CFF]/30 text-[#0A7CFF] text-xs font-heading font-bold transition cursor-pointer shadow-[0_0_12px_rgba(10,124,255,0.2)]"
              title="Abrir Tutorial Guiado con Globos Flotantes y Enfoque Visual"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tour</span>
            </button>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-[#8E95A2] hover:text-white text-xs font-heading font-medium transition cursor-pointer"
              title="Ver Manual Técnico y Resumen de Estrategias"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guía Detallada</span>
            </button>

            <a
              href={`${API_BASE}/api/v1/manual/download`}
              download="Manual_RocketBot_Pro_Estrategias_MultiAsset.pdf"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-mono font-medium transition cursor-pointer"
              title="Descargar Manual Técnico e Institucional en PDF"
            >
              <Download className="w-3.5 h-3.5 text-[#00DFDF]" />
              <span className="hidden sm:inline">Manual PDF</span>
            </a>

            {/* Menú de Usuario / Perfil RBAC */}
            {currentUser && (
              <UserProfileMenu
                user={currentUser}
                onOpenUserManagement={() => setIsUserManagementOpen(true)}
                onOpenChangePassword={() => setIsChangePasswordOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </header>

      {/* Grid de KPIs Directo y Compacto (Sin banners innecesarios) */}
      <section data-tour="kpi-cards" className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 px-4 pt-3">
        <div className="p-3 figma-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E95A2] font-heading">
                Equity Cartera
              </span>
              <InfoTooltip
                title="Equity Total de la Cuenta"
                description="Valor total de tu capital disponible sumando saldo libre en USDT y el valor de las posiciones abiertas."
                impact="Tu patrimonio total actual en el exchange."
              />
            </div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {fmtMoney(portfolio.total_equity)}
            </div>
            <div className="text-[11px] font-mono text-[#A5ABB6]">
              Libre: {fmtMoney(portfolio.free_balance)}
            </div>
          </div>
          <Wallet className="w-5 h-5 text-[#0A7CFF] opacity-90" />
        </div>

        <div className="p-3 figma-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E95A2] font-heading">
                PnL Flotante
              </span>
              <InfoTooltip
                title="Ganancia/Pérdida Flotante en Vivo"
                description="Resultado no realizado de todas las operaciones abiertas calculado al último tick de precio."
                impact="Muestra el dinero que ganarías o perderías si cerraras todas las posiciones en este instante."
              />
            </div>
            <div
              className={`text-base font-bold font-mono mt-0.5 ${
                (portfolio.unrealized_pnl ?? 0) >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
              }`}
            >
              {isPrivacyMode
                ? '$••••••'
                : `${(portfolio.unrealized_pnl ?? 0) >= 0 ? '+' : ''}$${portfolio.unrealized_pnl ?? 0}`}
            </div>
            <div className="text-[11px] font-mono text-[#8E95A2]">
              Realizado: +{fmtMoney(portfolio.realized_pnl)}
            </div>
          </div>
          <Zap className="w-5 h-5 text-[#00DFDF] opacity-90" />
        </div>

        <div className="p-3 figma-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E95A2] font-heading">
                Exposición Nocional
              </span>
              <InfoTooltip
                title="Exposición Nocional Total"
                description="El valor de mercado combinado de todas las posiciones abiertas multiplicado por el apalancamiento."
                impact="Permite vigilar que el riesgo total de la cartera no sobrepase el margen de garantía."
              />
            </div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {fmtMoney(portfolio.total_notional_exposure)}
            </div>
            <div className="text-[11px] font-mono text-[#8E95A2]">
              Margen: {fmtMoney(portfolio.used_margin)}
            </div>
          </div>
          <SlidersHorizontal className="w-5 h-5 text-[#0A7CFF] opacity-90" />
        </div>

        <div className="p-3 figma-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E95A2] font-heading">
                Win Rate
              </span>
              <InfoTooltip
                title="Tasa de Acierto Histórica"
                description="Porcentaje de operaciones que cerraron con balance positivo sobre el total de operaciones completadas."
                impact="Un win rate superior al 65% combinado con un buen ratio riesgo/beneficio genera rentabilidad sostenida."
              />
            </div>
            <div className="text-base font-bold font-mono text-[#00DFDF] mt-0.5">
              {portfolio.win_rate ?? 0}%
            </div>
            <div className="text-[11px] font-mono text-[#8E95A2]">
              {(closedTrades || []).length} cerradas
            </div>
          </div>
          <Shield className="w-5 h-5 text-[#00DFDF] opacity-90" />
        </div>

        <div className="p-3 figma-card flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E95A2] font-heading">
                Slots & Kelly Sizing
              </span>
              <InfoTooltip
                title="Dimensionamiento Óptimo de Kelly"
                description="Calcula matemáticamente el tamaño de posición óptimo para maximizar crecimiento sin riesgo de quiebra."
                impact="Regula el stake sugerido por trade según el win rate actual."
              />
            </div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {portfolio.open_trades_count ?? (openTrades || []).length} / {portfolio.max_open_trades ?? 5}
            </div>
            <div className="text-[11px] font-mono text-[#00DFDF]">
              Kelly: ${kellyData?.suggested_stake_amount ?? 250} ({kellyData?.suggested_position_pct ?? 2.5}%)
            </div>
          </div>
          <Activity className="w-5 h-5 text-[#0A7CFF] opacity-90" />
        </div>

        <div data-tour="strategy-selector" className="p-3 figma-card flex items-center justify-between">
          <div className="w-full mr-2">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E95A2] font-heading">
                Estrategia Activa
              </span>
              <InfoTooltip
                title="Estrategia en Ejecución"
                description="Selecciona la estrategia algorítmica activa para el bot: Cripto Multi-Factor, Ruptura para Oro/Petróleo, Reversión a la Media para Divisas o Momentum para Índices."
                impact="Puedes cambiar la estrategia en caliente sin detener el servidor ni perder posiciones."
              />
            </div>
            <select
              value={portfolio.active_strategy || 'RocketMultiFactorV1'}
              onChange={(e) => handleStrategyChange(e.target.value)}
              className="w-full text-[11px] font-bold font-mono text-[#0A7CFF] bg-[#11141E] border border-[#0A7CFF]/40 rounded px-1.5 py-1 mt-1 cursor-pointer focus:outline-none truncate"
            >
              <option value="RocketMultiFactorV1">RocketMultiFactor (Cripto)</option>
              <option value="CommodityTrendBreakoutV1">CommodityBreakout (Oro/Oil)</option>
              <option value="ForexMeanReversionV1">ForexReversion (EUR/GBP/JPY)</option>
              <option value="IndexMomentumV1">IndexMomentum (S&P500/Nasdaq)</option>
            </select>
            <div className="text-[10px] font-mono text-[#8E95A2] mt-0.5">
              FreqAI Multi-Asset ML
            </div>
          </div>
          <BrainCircuit className="w-5 h-5 text-[#0A7CFF] opacity-90 shrink-0" />
        </div>
      </section>

      {/* Contenido Principal con Máximo Espacio y Funcionalidad */}
      <main className="relative z-10 flex-1 p-4">
        {activeTab === 'terminal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Columna Izquierda: Gráficos de TradingView y Panel de Posiciones */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div data-tour="chart-container" className="h-[490px]">
                <TradingViewChart
                  pair={selectedPair}
                  timeframe={timeframe}
                  strategyName={portfolio.active_strategy}
                  candles={candles}
                  markers={markers}
                  activeTrade={activeTradeForSelectedPair}
                  onTimeframeChange={(tf) => setTimeframe(tf)}
                />
              </div>

              {/* Panel de Operaciones Abiertas, Historial y Protecciones */}
              <div data-tour="trades-panel" className="figma-card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D1017] border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBottomTab('open')}
                      className={`figma-tab-item ${bottomTab === 'open' ? 'active' : ''}`}
                    >
                      Posiciones Abiertas ({openTrades.length})
                    </button>
                    <button
                      onClick={() => setBottomTab('closed')}
                      className={`figma-tab-item ${bottomTab === 'closed' ? 'active' : ''}`}
                    >
                      Historial Cerrado ({closedTrades.length})
                    </button>
                    <button
                      onClick={() => setBottomTab('protections')}
                      className={`figma-tab-item ${bottomTab === 'protections' ? 'active' : ''}`}
                    >
                      Protecciones de Riesgo ({protectionsList.length})
                    </button>
                  </div>

                  <button
                    onClick={fetchOverview}
                    className="text-xs text-[#8E95A2] hover:text-white flex items-center gap-1.5 cursor-pointer font-medium"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refrescar
                  </button>
                </div>

                {bottomTab === 'open' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#080A10] text-[#8E95A2] font-semibold">
                        <tr>
                          <th className="p-3">Par / Señal</th>
                          <th className="p-3">Dirección</th>
                          <th className="p-3">Margen</th>
                          <th className="p-3">Entrada</th>
                          <th className="p-3">Precio Actual</th>
                          <th className="p-3">
                            <span className="flex items-center gap-1">
                              <span>Niveles (SL / TP / DCA)</span>
                              <InfoTooltip
                                title="Niveles de Salida y Recompra"
                                description="Stoploss (SL por volatilidad ATR), Take Profit (TP por tabla ROI) y Re-entrada (DCA para promediar a la baja)."
                                impact="Se gestionan de manera 100% automática para asegurar beneficios y mitigar caídas."
                              />
                            </span>
                          </th>
                          <th className="p-3">
                            <span className="flex items-center gap-1">
                              <span>Dist. Liq</span>
                              <InfoTooltip
                                title="Distancia al Precio de Liquidación"
                                description="Margen de seguridad porcentual antes de que el exchange cierre la posición por falta de colateral."
                                impact="Mide tu colchón de seguridad ante movimientos violentos del mercado."
                              />
                            </span>
                          </th>
                          <th className="p-3 text-right">PnL Flotante</th>
                          <th className="p-3 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05] font-mono">
                        {(openTrades || []).map((t) => (
                          <tr
                            key={t.trade_id}
                            onClick={() => setSelectedPair(t.pair)}
                            className={`cursor-pointer transition ${
                              selectedPair === t.pair
                                ? 'bg-white/[0.04]'
                                : 'hover:bg-white/[0.02]'
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white font-heading">{t.pair}</span>
                                {t.pair.startsWith('XAU') || t.pair.startsWith('WTI') || t.pair.startsWith('XAG') ? (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30">
                                    ORO/COMMODITY
                                  </span>
                                ) : t.pair.includes('EUR') || t.pair.includes('GBP') || t.pair.includes('JPY') ? (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30">
                                    FOREX
                                  </span>
                                ) : t.pair.includes('SPX') || t.pair.includes('NAS') ? (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#A060FF]/15 text-[#A060FF] border border-[#A060FF]/30">
                                    ÍNDICE
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
                                    CRIPTO
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#8E95A2]">
                                {t.enter_tag} {t.strategy && <span className="text-[#0A7CFF]">[{t.strategy.replace('V1', '')}]</span>}
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  t.side === 'long'
                                    ? 'bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30'
                                    : 'bg-[#FF3B69]/15 text-[#FF3B69] border border-[#FF3B69]/30'
                                }`}
                              >
                                {t.side === 'long' ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3" />
                                )}
                                {t.side} {t.leverage}x
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="text-white font-bold">${t.stake_amount}</div>
                              <div className="text-[10px] text-[#8E95A2]">
                                Nocional: ${t.position_Value}
                              </div>
                            </td>
                            <td className="p-3 text-[#EBEEF5]">${t.open_rate}</td>
                            <td className="p-3 text-white font-bold">${t.current_rate}</td>
                            <td className="p-3 text-[11px]">
                              <div className="text-[#FF3B69]">SL: ${t.stoploss_rate}</div>
                              <div className="text-[#00DFDF]">TP: ${t.take_profit_rate}</div>
                              <div className="text-[#F5A623]">
                                DCA ({t.dca_count}/{t.max_dca}): ${t.dca_next_rate}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-[11px] text-[#EBEEF5]">
                                ${t.liquidation_rate} ({t.liquidation_distance_pct}%)
                              </div>
                              <div className="w-20 h-1.5 bg-white/[0.08] rounded-full mt-1.5 overflow-hidden">
                                <div
                                  className="h-full bg-[#00DFDF]"
                                  style={{
                                    width: `${Math.min(t.liquidation_distance_pct * 2, 100)}%`,
                                  }}
                                />
                              </div>
                            </td>
                            <td
                              className={`p-3 text-right font-bold ${
                                t.profit_abs >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                              }`}
                            >
                              <div>
                                {t.profit_abs >= 0 ? '+' : ''}${t.profit_abs}
                              </div>
                              <div className="text-[11px]">
                                ({t.profit_pct >= 0 ? '+' : ''}
                                {t.profit_pct}%)
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleForceExit(t.trade_id);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#FF3B69]/15 hover:bg-[#FF3B69]/25 text-[#FF3B69] border border-[#FF3B69]/30 text-xs font-heading font-semibold transition cursor-pointer"
                              >
                                Cerrar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {bottomTab === 'closed' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead className="bg-[#080A10] text-[#8E95A2]">
                        <tr>
                          <th className="p-3">ID</th>
                          <th className="p-3">Par</th>
                          <th className="p-3">Lado</th>
                          <th className="p-3">Entrada / Salida</th>
                          <th className="p-3">Señal Tag</th>
                          <th className="p-3">Motivo Cierre</th>
                          <th className="p-3 text-right">Beneficio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05]">
                        {(closedTrades || []).map((t) => (
                          <tr key={t.trade_id} className="hover:bg-white/[0.02]">
                            <td className="p-3 text-[#676D79]">#{t.trade_id}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white font-heading">{t.pair}</span>
                                {t.pair.startsWith('XAU') || t.pair.startsWith('WTI') || t.pair.startsWith('XAG') ? (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30">
                                    COMMODITY
                                  </span>
                                ) : t.pair.includes('EUR') || t.pair.includes('GBP') || t.pair.includes('JPY') ? (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30">
                                    FOREX
                                  </span>
                                ) : t.pair.includes('SPX') || t.pair.includes('NAS') ? (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#A060FF]/15 text-[#A060FF] border border-[#A060FF]/30">
                                    ÍNDICE
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
                                    CRIPTO
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 uppercase text-white">
                              {t.side} {t.leverage}x
                            </td>
                            <td className="p-3">
                              ${t.open_rate} → ${t.close_rate}
                            </td>
                            <td className="p-3 text-[#0A7CFF]">{t.enter_tag}</td>
                            <td className="p-3 text-[#8E95A2]">{t.exit_reason}</td>
                            <td
                              className={`p-3 text-right font-bold ${
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
                )}

                {bottomTab === 'protections' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                    {protectionsList.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#00E599]/30 transition group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 group-hover:scale-105 transition">
                              <Shield className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold text-white font-heading">{p.name}</span>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599] animate-pulse"></span>
                            <span>{p.status || 'ACTIVO'}</span>
                          </span>
                        </div>
                        <p className="text-xs text-[#8E95A2] font-sans leading-relaxed mt-1">
                          {p.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Radar de Confluencia */}
            <div data-tour="radar-panel" className="lg:col-span-4">
              <SignalRadarPanel
                signals={radarSignals}
                selectedPair={selectedPair}
                onSelectPair={(p) => setSelectedPair(p)}
                onQuickOrder={handleQuickOrder}
              />
            </div>
          </div>
        )}

        {activeTab === 'lab' && (
          <BacktestLabView
            apiBase={API_BASE}
            activeStrategy={portfolio.active_strategy}
            selectedPair={selectedPair}
            timeframe={timeframe}
          />
        )}

        {activeTab === 'freqai' && (
          <div className="space-y-4">
            <div className="figma-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2 font-heading">
                    <BrainCircuit className="w-5 h-5 text-[#0A7CFF]" />
                    Centro Predictivo FreqAI (Gradient Boosting Adaptive Sandbox)
                  </h2>
                  <p className="text-xs text-[#8E95A2] mt-1">
                    Inferencia predictiva a 6 velas en tiempo real calculada con gradientes boosting sobre volumen relativo, bandas de volatilidad y momentum.
                  </p>
                </div>
                <span className="figma-badge-wip text-[#0A7CFF] text-xs font-mono font-bold">
                  Inferencia Activa
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {freqaiPredictions.map((pred: any) => (
                  <div
                    key={pred.pair}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white font-heading">{pred.pair}</span>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                          pred.action === 'LONG_BIAS'
                            ? 'bg-[#00DFDF]/15 text-[#00DFDF]'
                            : pred.action === 'SHORT_BIAS'
                              ? 'bg-[#FF3B69]/15 text-[#FF3B69]'
                              : 'bg-white/[0.05] text-[#8E95A2]'
                        }`}
                      >
                        {pred.action}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-xs text-[#8E95A2]">Retorno Esperado:</span>
                      <span
                        className={`text-sm font-bold ${
                          pred.predicted_return_pct >= 0 ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                        }`}
                      >
                        {pred.predicted_return_pct >= 0 ? '+' : ''}
                        {pred.predicted_return_pct}%
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-[#8E95A2] mb-1">
                        <span>Confianza del Modelo</span>
                        <span className="font-mono text-[#0A7CFF]">{pred.confidence}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0A7CFF]"
                          style={{ width: `${pred.confidence}%` }}
                        />
                      </div>
                    </div>

                    {pred.feature_importances && (
                      <div className="pt-2.5 border-t border-white/[0.06] space-y-1">
                        <div className="text-[10px] uppercase text-[#8E95A2] font-semibold">
                          Features Más Relevantes
                        </div>
                        {Object.entries(pred.feature_importances)
                          .slice(0, 3)
                          .map(([feat, imp]: [string, any]) => (
                            <div
                              key={feat}
                              className="flex items-center justify-between text-[11px] font-mono text-[#EBEEF5]"
                            >
                              <span>{feat}</span>
                              <span className="text-[#0A7CFF]">{imp}%</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Tour Guiado Interactivo con Globos Flotantes (Speech Bubbles & Spotlight) */}
      <InteractiveTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenDetailedManual={() => {
          setIsTourOpen(false);
          setIsManualModalOpen(true);
        }}
      />

      {/* Modal Completo de Documentación & Estrategias */}
      <TutorialTourModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onSelectTab={(tab) => setActiveTab(tab)}
        apiBase={API_BASE}
      />

      {/* Drawer del Mentor & Auditor IA Cuántico (Prof. Quant Alpha) */}
      <AICopilotDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        apiBase={API_BASE}
        activeStrategy={portfolio.active_strategy}
        openTradesCount={openTrades.length}
        accountId={activeAccountId}
      />

      {/* Modal de Matriz de Correlación Cruzada Rolling */}
      <CorrelationMatrixModal
        isOpen={isCorrelationOpen}
        onClose={() => setIsCorrelationOpen(false)}
        apiBase={API_BASE}
      />

      {/* Modal de Escudo de Cuentas Fondeadas (FTMO / Apex) */}
      <PropFirmModal
        isOpen={isPropFirmOpen}
        onClose={() => setIsPropFirmOpen(false)}
        apiBase={API_BASE}
        accountId={activeAccountId}
      />

      {/* Modal de Configuración de Alertas 24/7 (Telegram & Discord) */}
      <TelegramDiscordModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        apiBase={API_BASE}
      />

      {/* Modal para Crear Nueva Cuenta Aislada */}
      <NewAccountModal
        isOpen={isNewAccountModalOpen}
        onClose={() => setIsNewAccountModalOpen(false)}
        apiBase={API_BASE}
        token={authToken}
        onAccountCreated={(account) => handleAccountSwitched(account.account_id, account)}
      />

      {/* Modal Maestro Consolidado MAM / PAMM */}
      <MasterConsolidatedModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        apiBase={API_BASE}
        isPrivacyMode={isPrivacyMode}
        token={authToken}
        onSelectAccount={(accId) => handleAccountSwitched(accId)}
      />

      {/* Modal de Inicio de Sesión Institucional (Bloquea si no hay token) */}
      <LoginModal
        isOpen={!authToken || !currentUser}
        apiBase={API_BASE}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal de Gestión de Usuarios y Permisos RBAC (Solo Administradores) */}
      {currentUser && currentUser.role === 'admin' && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
          apiBase={API_BASE}
          token={authToken}
        />
      )}

      {/* Modal de Cambio de Contraseña */}
      {currentUser && (
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          apiBase={API_BASE}
          token={authToken}
        />
      )}

      {/* Modal de Confirmación de Kill-Switch de Emergencia */}
      {isPanicConfirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#140A0F] border border-[#FF3B69]/50 rounded-2xl shadow-2xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FF3B69]/20 text-[#FF3B69] flex items-center justify-center mx-auto border border-[#FF3B69]/40">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-white font-heading">
              ¿Activar Interruptor de Pánico (Kill-Switch)?
            </h3>
            <p className="text-xs text-[#CBD2DF] leading-relaxed">
              Esta acción institucional <strong>cerrará inmediatamente todas las posiciones abiertas a precio de mercado</strong>, cancelará todas las órdenes y pausará el bot preventivamente.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsPanicConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-xs font-heading font-medium text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePanicCloseAll}
                className="px-5 py-2 rounded-xl bg-[#FF3B69] hover:bg-[#FF3B69]/90 text-xs font-heading font-bold text-white shadow-[0_0_20px_rgba(255,59,105,0.4)] transition cursor-pointer"
              >
                ¡Liquidar Todo Ahora!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Obligatorio de Cambio de Contraseña de Administrador (Solo primer inicio / una única vez - Item 1) */}
      <ForceChangePasswordModal
        isOpen={Boolean(currentUser && currentUser.role === 'admin' && currentUser.must_change_password)}
        apiBase={API_BASE}
        token={authToken}
        onSuccess={handleForcePasswordChanged}
      />

      {/* Modal de Confirmación de 2 Pasos para Activar Capital Real (Item 8) */}
      <ConfirmLiveCapitalModal
        isOpen={isConfirmLiveOpen}
        onClose={() => setIsConfirmLiveOpen(false)}
        onConfirm={() => handleSetDryRun(false)}
        accountName={portfolio?.name || portfolio?.account_name || activeAccountId || 'Cuenta Activa'}
      />

      {/* Botón Flotante Permanente de Acceso Rápido al Mentor IA */}
      {!isAIOpen && (
        <button
          onClick={() => setIsAIOpen(true)}
          className="fixed bottom-5 right-5 z-[9980] flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0B0E17]/95 backdrop-blur-xl border border-[#00DFDF]/40 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,223,223,0.25)] hover:scale-105 hover:border-[#00DFDF] transition-all duration-200 cursor-pointer group"
          title="Consultar al Prof. Quant Alpha (Auditor de Riesgo IA)"
        >
          <div className="relative p-1.5 rounded-full bg-[#00DFDF]/15 text-[#00DFDF] group-hover:bg-[#00DFDF]/25 transition">
            <BrainCircuit className="w-4 h-4 text-[#00DFDF]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00DFDF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00DFDF]"></span>
            </span>
          </div>
          <div className="text-left font-heading pr-1">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Prof. Quant Alpha</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#0A7CFF]/20 text-[#0A7CFF] border border-[#0A7CFF]/30 font-mono">
                IA
              </span>
            </div>
            <div className="text-[10px] text-[#8E95A2]">Auditoría & Consultas</div>
          </div>
        </button>
      )}
    </div>
  );
}
