import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Key,
  Send,
  Bot,
  User,
  RefreshCw,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  Lightbulb,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Check,
  Zap,
  Mic,
  MicOff,
  Volume2,
  Code2,
} from 'lucide-react';

export type AIProvider = 'gemini' | 'claude' | 'openai' | 'deepseek' | 'offline';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isError?: boolean;
}

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  activeStrategy: string;
  openTradesCount: number;
  accountId?: string;
}

const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-2.5-flash',
  claude: 'claude-3-5-haiku-20241022',
  openai: 'gpt-4o-mini',
  deepseek: 'deepseek-chat',
  offline: 'local-quant-auditor',
};

const STORAGE_KEY = 'rocketbot_ai_copilot_config';

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  apiBase,
  activeStrategy,
  openTradesCount,
  accountId,
}) => {
  // Configuración de API
  const [config, setConfig] = useState<AIConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {
      provider: 'offline',
      apiKey: '',
      model: DEFAULT_MODELS.offline,
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  // Mensajes y chat
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '### 🎓 ¡Bienvenido a tu Auditoría Cuantitativa!\n\nSoy el **Prof. Quant Alpha**, tu auditor senior de riesgo y mentor en estrategias algorítmicas de RocketBot Pro.\n\nEstoy conectado en tiempo real a la telemetría de tu cuenta. Puedo:\n- 🔍 **Auditar tu cartera en vivo** (margen, distancias a liquidación, stop losses).\n- ⚠️ **Emitir advertencias de riesgo** preventivas ante sobre-apalancamiento.\n- 📐 **Explicar las fórmulas matemáticas** de tus estrategias (Donchian, Bollinger, ATR, FreqAI).\n\n*¿Qué deseas analizar hoy? Puedes usar los botones rápidos abajo o hacerme cualquier consulta.*',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Estados de Voz y Prompt-to-Strategy
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPromptStrategyOpen, setIsPromptStrategyOpen] = useState(false);
  const [strategyPromptInput, setStrategyPromptInput] = useState('');
  const [generatedStrategyName, setGeneratedStrategyName] = useState('MyCustomStrategyV1');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [generatedStrategyResult, setGeneratedStrategyResult] = useState<any | null>(null);

  const toggleListening = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      alert("El reconocimiento de voz no está soportado en este navegador. Usa Chrome o Edge.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    try {
      const rec = new SpeechRec();
      rec.lang = 'es-ES';
      rec.continuous = false;
      rec.interimResults = false;
      rec.onstart = () => setIsListening(true);
      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? prev + ' ' + text : text));
        setIsListening(false);
      };
      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);
      rec.start();
    } catch {
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanText = text.replace(/[*#>`]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleGenerateStrategy = async () => {
    if (!strategyPromptInput.trim()) return;
    setIsGeneratingStrategy(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/ai/generate-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: strategyPromptInput,
          strategy_name: generatedStrategyName,
          provider: config.provider === 'claude' ? 'anthropic' : config.provider,
          api_key: config.apiKey,
          model: config.model || DEFAULT_MODELS[config.provider],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setGeneratedStrategyResult(json);
      }
    } catch {
      // ignore
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  // Auditoría en vivo de cartera
  const [liveAudit, setLiveAudit] = useState<{
    risk_score: number;
    risk_level: string;
    risk_color: string;
    margin_usage_pct: number;
    alerts: Array<{ severity: string; title: string; message: string; action: string }>;
  } | null>(null);
  const [isRefreshingAudit, setIsRefreshingAudit] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Guardar configuración en localStorage
  const handleSaveConfig = (newConfig: AIConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch {
      // ignore
    }
  };

  // Scroll automático a mensajes nuevos
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Cargar auditoría en vivo al abrir
  const fetchLiveAudit = useCallback(async () => {
    setIsRefreshingAudit(true);
    try {
      const url = accountId
        ? `${apiBase}/api/v1/ai/audit?account_id=${encodeURIComponent(accountId)}`
        : `${apiBase}/api/v1/ai/audit`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLiveAudit(data);
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshingAudit(false);
    }
  }, [apiBase, accountId]);

  useEffect(() => {
    if (isOpen) {
      fetchLiveAudit();
    }
  }, [isOpen, fetchLiveAudit]);

  // Probar conexión con la API elegida
  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    try {
      const res = await fetch(`${apiBase}/api/v1/ai/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider === 'claude' ? 'anthropic' : config.provider,
          api_key: config.apiKey,
          model: config.model || DEFAULT_MODELS[config.provider],
        }),
      });
      const data = await res.json();
      setTestStatus({
        loading: false,
        success: data.success,
        message: data.message,
      });
    } catch (err: any) {
      setTestStatus({
        loading: false,
        success: false,
        message: `Error de red: ${err.message}`,
      });
    }
  };

  // Enviar consulta al Copilot
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Enviar historial relevante
      const apiMessages = [...messages.slice(-5), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${apiBase}/api/v1/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider === 'claude' ? 'anthropic' : config.provider,
          api_key: config.apiKey,
          model: config.model || DEFAULT_MODELS[config.provider],
          messages: apiMessages,
        }),
      });

      if (!res.ok) {
        throw new Error(`Servidor respondió con código ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Sin respuesta del servidor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Refrescar auditoría de fondo si se alteraron datos
      fetchLiveAudit();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `> ⚠️ **Error de Comunicación:** No se pudo completar la consulta (${err.message}).\n\nVerifica que el servidor backend esté activo o que tu API Key sea válida en el icono de configuración ⚙️.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Acciones rápidas predefinidas
  const quickActions = [
    {
      label: '🔍 Auditar Mi Cartera en Vivo',
      prompt: 'Por favor realiza una auditoría rigurosa y completa de mis posiciones abiertas actuales, margen en uso, distancias a liquidación y stop losses.',
    },
    {
      label: '⚠️ Diagnóstico de Riesgo y Volatilidad',
      prompt: 'Evalúa el nivel de riesgo global del mercado en este momento. ¿Hay sobre-apalancamiento o activos altamente correlacionados?',
    },
    {
      label: '📐 Explicar Estrategia Activa',
      prompt: `Explícame la matemática y lógica de la estrategia activa actual (${activeStrategy}). ¿Cuáles son los indicadores clave y qué condiciones busca para entrar?`,
    },
    {
      label: '💡 Sugerir Optimización Hyperopt',
      prompt: '¿Qué rangos de parámetros me recomiendas optimizar en el laboratorio de Backtest para mejorar el ratio de Sharpe sin incurrir en sobreajuste (overfitting)?',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-[9995] w-full sm:w-[480px] bg-[#0A0D14]/95 backdrop-blur-2xl border-l border-white/[0.1] shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300">
      {/* Cabecera del Copilot */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#080A10]/90">
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-[#0A7CFF]/25 to-[#00DFDF]/20 border border-[#0A7CFF]/40 shadow-[0_0_15px_rgba(10,124,255,0.3)]">
            <BrainCircuit className="w-5 h-5 text-[#00DFDF]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00DFDF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00DFDF]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-white font-heading">Prof. Quant Alpha</h2>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-[#0A7CFF]/20 text-[#0A7CFF] border border-[#0A7CFF]/30">
                AUDITOR IA
              </span>
            </div>
            <p className="text-[11px] text-[#8E95A2] flex items-center gap-1">
              <span>Modelo:</span>
              <span className="text-[#EBEEF5] font-mono font-medium">
                {config.provider === 'offline'
                  ? 'Motor Local Cuántico'
                  : `${config.provider.toUpperCase()} (${config.model || DEFAULT_MODELS[config.provider]})`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsPromptStrategyOpen(!isPromptStrategyOpen)}
            className={`p-2 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 ${
              isPromptStrategyOpen
                ? 'bg-[#A060FF]/25 text-[#A060FF] border border-[#A060FF]/50'
                : 'text-[#A060FF] hover:bg-[#A060FF]/15'
            }`}
            title="Generador Prompt-to-Strategy: Convierte ideas en código Python con IA"
          >
            <Code2 className="w-4 h-4" />
            <span className="text-[11px] font-heading font-bold hidden sm:inline">Crear Estrategia</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`p-2 rounded-lg text-xs transition cursor-pointer ${
              isSettingsOpen
                ? 'bg-[#0A7CFF]/20 text-[#0A7CFF] border border-[#0A7CFF]/40'
                : 'text-[#8E95A2] hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Configurar Proveedor de IA (Gemini, Claude, GPT, etc.)"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={fetchLiveAudit}
            disabled={isRefreshingAudit}
            className="p-2 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
            title="Refrescar Auditoría en Vivo"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingAudit ? 'animate-spin text-[#00DFDF]' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
            title="Cerrar Copilot"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel Desplegable de Configuración de IA */}
      {isSettingsOpen && (
        <div className="p-4 bg-[#0F131D] border-b border-white/[0.1] space-y-3.5 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-heading flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-[#0A7CFF]" />
              <span>Configuración de Proveedor de IA</span>
            </span>
            <span className="text-[10px] font-mono text-[#8E95A2]">Guardado local seguro</span>
          </div>

          {/* Selector de Proveedor */}
          <div>
            <label className="text-[11px] text-[#8E95A2] block mb-1 font-medium">
              Proveedor de Inteligencia Artificial:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'gemini', label: 'Gemini' },
                  { id: 'claude', label: 'Claude' },
                  { id: 'openai', label: 'OpenAI GPT' },
                  { id: 'deepseek', label: 'DeepSeek' },
                  { id: 'offline', label: 'Motor Local' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    const newCfg = {
                      ...config,
                      provider: p.id,
                      model: DEFAULT_MODELS[p.id],
                    };
                    handleSaveConfig(newCfg);
                    setTestStatus({ loading: false });
                  }}
                  className={`py-1.5 px-2 rounded-lg text-xs font-heading font-medium transition cursor-pointer border ${
                    config.provider === p.id
                      ? 'bg-[#0A7CFF]/20 text-[#0A7CFF] border-[#0A7CFF]/60 shadow-[0_0_10px_rgba(10,124,255,0.2)]'
                      : 'bg-white/[0.03] text-[#8E95A2] border-white/[0.06] hover:bg-white/[0.06]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* API Key (excepto para motor local offline) */}
          {config.provider !== 'offline' && (
            <div className="space-y-2">
              <div>
                <label className="text-[11px] text-[#8E95A2] block mb-1 font-medium">
                  API Key de {config.provider.toUpperCase()}:
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={config.apiKey}
                    onChange={(e) =>
                      handleSaveConfig({ ...config, apiKey: e.target.value.trim() })
                    }
                    placeholder={`Ingresa tu clave de ${config.provider}...`}
                    className="w-full pl-3 pr-9 py-1.5 bg-[#080A10] border border-white/[0.1] rounded-lg text-xs text-white font-mono focus:border-[#0A7CFF] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2 text-[#8E95A2] hover:text-white"
                  >
                    {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#8E95A2] block mb-1 font-medium">
                  Nombre del Modelo (Opcional):
                </label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) =>
                    handleSaveConfig({ ...config, model: e.target.value.trim() })
                  }
                  placeholder={DEFAULT_MODELS[config.provider]}
                  className="w-full px-3 py-1.5 bg-[#080A10] border border-white/[0.1] rounded-lg text-xs text-white font-mono focus:border-[#0A7CFF] outline-none"
                />
              </div>

              {/* Botón Probar Conexión */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleTestConnection}
                  disabled={testStatus.loading || !config.apiKey}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-xs font-heading font-medium text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${testStatus.loading ? 'animate-spin text-[#00DFDF]' : ''}`}
                  />
                  <span>{testStatus.loading ? 'Verificando...' : 'Probar Conexión'}</span>
                </button>

                {testStatus.message && (
                  <span
                    className={`text-[11px] font-mono font-medium ${
                      testStatus.success ? 'text-[#00DFDF]' : 'text-[#FF3B69]'
                    }`}
                  >
                    {testStatus.success ? '✓ Verificado' : '✗ Falló conexión'}
                  </span>
                )}
              </div>
            </div>
          )}

          {config.provider === 'offline' && (
            <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-[11px] text-[#8E95A2] leading-relaxed">
              💡 **Modo Educativo Local Activo:** No requiere ninguna API Key externa ni consume créditos. El motor cuantitativo audita tu cartera y responde sobre las 4 estrategias usando modelos deterministas de alta precisión.
            </div>
          )}
        </div>
      )}

      {/* Panel de Generación Prompt-to-Strategy */}
      {isPromptStrategyOpen && (
        <div className="p-4 bg-[#140F22] border-b border-[#A060FF]/30 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-heading flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A060FF]" />
              <span>Generador Prompt-to-Strategy (Python IStrategy)</span>
            </span>
            <button
              onClick={() => setIsPromptStrategyOpen(false)}
              className="text-[#8E95A2] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-[#CBD2DF] leading-relaxed">
            Describe tu idea en lenguaje natural (ej: <em>"Quiero una estrategia para Oro que compre cuando el RSI en 15m baje de 28 y rompa el canal de Donchian hacia arriba, con trailing stop dinámico"</em>).
          </p>

          <div className="space-y-2">
            <input
              type="text"
              value={generatedStrategyName}
              onChange={(e) => setGeneratedStrategyName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder="NombreClaseEstrategiaV1"
              className="w-full px-3 py-1.5 bg-[#080A10] border border-white/[0.1] rounded-lg text-xs text-white font-mono focus:border-[#A060FF] outline-none"
            />
            <textarea
              rows={2}
              value={strategyPromptInput}
              onChange={(e) => setStrategyPromptInput(e.target.value)}
              placeholder="Describe indicadores, reglas de entrada long/short y condiciones de salida..."
              className="w-full p-2.5 bg-[#080A10] border border-white/[0.1] rounded-lg text-xs text-white focus:border-[#A060FF] outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-[#8E95A2]">Se guardará en <code>user_data/strategies/</code></span>
            <button
              onClick={handleGenerateStrategy}
              disabled={isGeneratingStrategy || !strategyPromptInput.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#A060FF] to-[#0A7CFF] text-white text-xs font-heading font-bold shadow-[0_0_15px_rgba(160,96,255,0.4)] disabled:opacity-40 transition cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingStrategy ? 'animate-spin' : ''}`} />
              <span>{isGeneratingStrategy ? 'Escribiendo Python...' : 'Generar Código'}</span>
            </button>
          </div>

          {generatedStrategyResult && (
            <div className="p-2.5 rounded-lg bg-[#00DFDF]/10 border border-[#00DFDF]/30 text-xs font-mono text-[#00DFDF] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>¡Estrategia '{generatedStrategyResult.name}.py' generada y guardada!</span>
              </div>
              <p className="text-[10px] text-white/80">
                Ya está disponible en la pestaña <strong>Backtest & Hyperopt</strong> para simular y en el editor Monaco.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tarjeta de Salud de Cartera & Auditoría en Vivo */}
      {liveAudit && (
        <div className="px-4 py-2.5 bg-[#080A10]/95 border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8E95A2] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#0A7CFF]" />
              <span>Semáforo de Riesgo en Vivo</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#8E95A2]">
                Margen: <strong className="text-white">{liveAudit.margin_usage_pct}%</strong>
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border"
                style={{
                  backgroundColor: `${liveAudit.risk_color}18`,
                  color: liveAudit.risk_color,
                  borderColor: `${liveAudit.risk_color}40`,
                }}
              >
                {liveAudit.risk_level} ({liveAudit.risk_score}/100)
              </span>
            </div>
          </div>

          {/* Alerta más prioritaria en ticker */}
          {liveAudit.alerts.length > 0 && (
            <div className="text-[11px] text-[#CBD2DF] flex items-start gap-1.5 bg-white/[0.02] p-1.5 rounded-md border border-white/[0.05]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#FFB800]" />
              <span className="truncate">
                <strong>{liveAudit.alerts[0].title}:</strong> {liveAudit.alerts[0].message}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Flujo de Conversación (Scrollable) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role !== 'user' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0A7CFF]/20 to-[#00DFDF]/20 border border-[#0A7CFF]/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4 text-[#00DFDF]" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#0A7CFF] text-white rounded-tr-none font-sans font-medium'
                  : 'bg-[#121622] text-[#EBEEF5] border border-white/[0.08] rounded-tl-none font-sans shadow-lg'
              }`}
            >
              {/* Formateador simple de Markdown */}
              <div className="space-y-2 whitespace-pre-wrap">
                {m.content.split('\n\n').map((block, idx) => {
                  if (block.startsWith('### ')) {
                    return (
                      <h4 key={idx} className="font-heading font-bold text-sm text-[#00DFDF] pt-1">
                        {block.replace('### ', '')}
                      </h4>
                    );
                  }
                  if (block.startsWith('#### ')) {
                    return (
                      <h5 key={idx} className="font-heading font-bold text-xs text-white pt-1">
                        {block.replace('#### ', '')}
                      </h5>
                    );
                  }
                  if (block.startsWith('> [!')) {
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/[0.04] border border-[#00DFDF]/30 text-[#00DFDF] my-1"
                      >
                        {block}
                      </div>
                    );
                  }
                  return <p key={idx}>{block}</p>;
                })}
              </div>

              <div
                className={`text-[9px] font-mono mt-2 flex items-center justify-between ${
                  m.role === 'user' ? 'text-white/70' : 'text-[#8E95A2]'
                }`}
              >
                <span>{m.timestamp}</span>
                {m.role !== 'user' && (
                  <button
                    type="button"
                    onClick={() => speakText(m.content)}
                    className="p-1 rounded hover:bg-white/[0.08] text-[#8E95A2] hover:text-[#00DFDF] transition cursor-pointer"
                    title={isSpeaking ? 'Detener voz' : 'Escuchar respuesta por voz'}
                  >
                    <Volume2 className={`w-3 h-3 ${isSpeaking ? 'text-[#00DFDF] animate-pulse' : ''}`} />
                  </button>
                )}
              </div>
            </div>

            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-white/[0.08] border border-white/[0.12] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#0A7CFF]/20 to-[#00DFDF]/20 border border-[#0A7CFF]/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#00DFDF]" />
            </div>
            <div className="p-3 rounded-2xl bg-[#121622] border border-white/[0.08] text-xs text-[#8E95A2] flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A7CFF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0A7CFF]"></span>
              </span>
              <span>Prof. Quant Alpha auditando telemetría...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Píldoras de Acciones Rápidas */}
      <div className="px-4 py-2 border-t border-white/[0.06] bg-[#080A10]/60 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          {quickActions.map((qa) => (
            <button
              key={qa.label}
              onClick={() => handleSendMessage(qa.prompt)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-full bg-white/[0.04] hover:bg-[#0A7CFF]/15 border border-white/[0.08] hover:border-[#0A7CFF]/40 text-[#CBD2DF] hover:text-[#00DFDF] text-[11px] font-mono transition cursor-pointer disabled:opacity-30"
            >
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Área de Entrada de Texto */}
      <div className="p-3.5 border-t border-white/[0.08] bg-[#090C14]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Pregúntale al Prof. Quant Alpha sobre riesgo, estrategias..."
            disabled={isLoading}
            className="flex-1 py-2.5 pl-3.5 pr-20 bg-[#06080E] border border-white/[0.1] rounded-xl text-xs text-white placeholder-[#676D79] focus:border-[#0A7CFF] outline-none font-sans"
          />

          <div className="absolute right-12 flex items-center gap-1">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isListening
                  ? 'bg-[#FF3B69] text-white animate-pulse shadow-[0_0_10px_rgba(255,59,105,0.5)]'
                  : 'text-[#8E95A2] hover:text-[#00DFDF] hover:bg-white/[0.08]'
              }`}
              title={isListening ? 'Escuchando tu voz...' : 'Hablar por micrófono (Voice Copilot)'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="p-2.5 rounded-xl figma-btn-primary text-white transition cursor-pointer disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_12px_rgba(10,124,255,0.3)] shrink-0"
            title="Enviar consulta"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-[#676D79] mt-2 px-1 font-mono">
          <span>Inyección de telemetría: Activa (Snapshot en vivo)</span>
          <span>{config.provider.toUpperCase()} Mode</span>
        </div>
      </div>
    </div>
  );
};
