import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Download,
  ShieldCheck,
  TrendingUp,
  CandlestickChart,
  Target,
  FlaskConical,
  Globe2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  BrainCircuit,
  AlertOctagon,
  Layers,
  Trophy,
  Flame,
} from 'lucide-react';

interface TutorialTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: 'terminal' | 'lab' | 'freqai') => void;
  apiBase: string;
}

interface TourStep {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tabTarget?: 'terminal' | 'lab' | 'freqai';
  description: string;
  keyPoints: { label: string; text: string }[];
  impactCallout: {
    type: 'security' | 'profit' | 'architecture';
    title: string;
    text: string;
  };
}

export const TutorialTourModal: React.FC<TutorialTourModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  apiBase,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!isOpen) return null;

  const steps: TourStep[] = [
    {
      id: 1,
      badge: 'Paso 1: Seguridad & Modos',
      title: 'Control Maestro y Modos de Ejecución',
      subtitle: 'Configura el entorno de operación y protege tu patrimonio antes de comenzar',
      icon: <ShieldCheck className="w-6 h-6 text-[#0A7CFF]" />,
      tabTarget: 'terminal',
      description:
        'En la barra superior de RocketBot Pro controlas el estado global del sistema de trading con switches de alta precisión.',
      keyPoints: [
        {
          label: 'FUTURES vs SPOT',
          text: 'En Spot compras el activo subyacente sin apalancamiento (solo ganancias en subida). En Futuros (3x Isolated) puedes operar en ambas direcciones (Long para compras alcistas y Short para ventas en corto durante tendencias bajistas).',
        },
        {
          label: 'DRY-RUN SIMULATOR',
          text: 'Viene activo por defecto con $10,000 USDT virtuales. Conecta velas, libros de órdenes y latencia real de Binance/Bybit sin arriesgar ni un centavo mientras verificas la estrategia.',
        },
        {
          label: 'BOT ACTIVO / PAUSADO',
          text: 'Si pausas el bot, tus posiciones abiertas permanecen 100% protegidas por sus órdenes Stoploss y Take Profit, pero se cancela el escaneo de nuevas compras.',
        },
      ],
      impactCallout: {
        type: 'security',
        title: 'Impacto Financiero Directo',
        text: 'Nunca actives el modo "LIVE CAPITAL" hasta haber completado al menos 50 operaciones simuladas en Dry-Run y validado un Profit Factor superior a 1.5 en el Backtest Lab.',
      },
    },
    {
      id: 2,
      badge: 'Paso 2: Finanzas en Vivo',
      title: 'KPIs de Cartera y Salud Financiera',
      subtitle: 'Monitorea el estado patrimonial, flotante no realizado y exposición al riesgo en tiempo real',
      icon: <TrendingUp className="w-6 h-6 text-[#00DFDF]" />,
      tabTarget: 'terminal',
      description:
        'La fila superior de tarjetas institucionales procesa métricas consolidadas tick a tick mediante WebSockets de ultrabaja latencia (<10ms).',
      keyPoints: [
        {
          label: 'Equity Total de la Cuenta',
          text: 'Refleja la suma líquida del capital libre más el valor actualizado al segundo de todas las operaciones abiertas.',
        },
        {
          label: 'PnL No Realizado (Flotante)',
          text: 'Ganancia o pérdida potencial acumulada en las posiciones activas. Se actualiza en tiempo real según el precio "Mark" del exchange.',
        },
        {
          label: 'Margen Comprometido',
          text: 'Porcentaje del capital retenido como garantía en el exchange. Para una gestión de riesgo institucional, mantén este valor por debajo del 30%.',
        },
        {
          label: 'Win Rate & Tasa de Acierto',
          text: 'Porcentaje histórico de operaciones cerradas en beneficio sobre el total ejecutado en la sesión.',
        },
      ],
      impactCallout: {
        type: 'security',
        title: 'Regla de Riesgo del 2%',
        text: 'Cada trade individual tiene un tamaño configurado (stake amount de $250 a $300 USDT) para que ninguna pérdida individual supere el 2% del patrimonio total.',
      },
    },
    {
      id: 3,
      badge: 'Paso 3: Visualización Pro',
      title: 'Gráfico TradingView con Niveles Proyectados',
      subtitle: 'Inspecciona velas OHLCV y líneas de salida automática (TP, SL y DCA)',
      icon: <CandlestickChart className="w-6 h-6 text-[#FFB800]" />,
      tabTarget: 'terminal',
      description:
        'El gráfico nativo Lightweight Charts renderiza el historial de precios con indicadores matemáticos y las órdenes dinámicas del bot superpuestas.',
      keyPoints: [
        {
          label: 'Medias Móviles Exponenciales (EMAs)',
          text: 'Líneas rápidas y lentas (EMA 20, 50 y la línea de tendencia macro EMA 200). El bot solo busca compras si el precio navega por encima de la EMA 200.',
        },
        {
          label: 'Línea Cyan (Take Profit)',
          text: 'Nivel matemático donde el bot cerrará automáticamente la operación con ganancia (calculado dinámicamente mediante múltiplos de ATR o bandas superiores).',
        },
        {
          label: 'Línea Rosa (Stop Loss Dinámico)',
          text: 'Nivel infranqueable de protección de capital. Si el precio retrocede contra nuestra hipótesis, el bot corta la pérdida sin dudar.',
        },
        {
          label: 'Línea Amarilla (Re-entrada DCA)',
          text: 'Nivel de soporte proyectado donde el bot inyectará una segunda compra escalonada para promediar a la baja el precio de entrada si la tendencia alcista de fondo se mantiene intacta.',
        },
      ],
      impactCallout: {
        type: 'profit',
        title: 'Transparencia de Ejecución',
        text: 'Nunca tendrás dudas de qué está haciendo el bot: ves exactamente la distancia en pips y porcentaje hasta el Take Profit y el Stop Loss en pantalla.',
      },
    },
    {
      id: 4,
      badge: 'Paso 4: Confluencia Cuantitativa',
      title: 'Radar de Señales & "¿Por qué no compró?"',
      subtitle: 'Audita la matriz de 5 filtros cuantitativos antes de que se dispare una orden',
      icon: <Target className="w-6 h-6 text-[#0A7CFF]" />,
      tabTarget: 'terminal',
      description:
        'Resuelve el problema más frecuente del trader algorítmico: entender exactamente qué condición falta para entrar al mercado sin adivinar.',
      keyPoints: [
        {
          label: '1. Macro Trend (EMA 200)',
          text: 'Verifica que la estructura de orden superior sea alcista para operar a favor del viento institucional.',
        },
        {
          label: '2. Bollinger %B (< 0.20)',
          text: 'Asegura que el precio esté en la banda inferior (zona de descuento / precio barato).',
        },
        {
          label: '3. RSI 14 (30 a 48)',
          text: 'Confirma que el oscilador salió de sobreventa extrema y empieza a curvar hacia arriba.',
        },
        {
          label: '4. Concurvatura MACD',
          text: 'El histograma de aceleración de medias móviles debe estar desacelerando su caída o tornándose positivo.',
        },
        {
          label: '5. Filtro de Volumen Institucional (RVOL > 1.2x)',
          text: 'El volumen de la vela actual debe superar en 20% la media móvil de 20 períodos, evitando falsos quiebres con volumen seco.',
        },
      ],
      impactCallout: {
        type: 'profit',
        title: 'Botón Quick Long / Short',
        text: 'Si el radar muestra 4/5 o 5/5 condiciones y deseas forzar la entrada inmediata de alta convicción, haz click en "Quick Long" en el radar para abrir la posición al instante.',
      },
    },
    {
      id: 5,
      badge: 'Paso 5: Validación Científica',
      title: 'Laboratorio de Backtest, Auditoría Lookahead & Monaco',
      subtitle: 'Comprueba el rendimiento histórico sin sesgos y edita estrategias Python en vivo',
      icon: <FlaskConical className="w-6 h-6 text-[#A060FF]" />,
      tabTarget: 'lab',
      description:
        'Freqtrade tradicional te obligaba a abrir terminales de consola para hacer backtests. En RocketBot Pro dispones de una suite gráfica completa con Monaco Editor integrado.',
      keyPoints: [
        {
          label: 'Auditoría de 0-Lookahead Bias',
          text: 'El simulador avanza vela a vela estricta. Ninguna función matemática puede leer el precio de cierre de la vela actual para tomar decisiones de entrada en esa misma vela.',
        },
        {
          label: 'Validación Walk-Forward (75% In-Sample / 25% Out-Of-Sample)',
          text: 'Entrena los parámetros en el 75% del histórico y los evalúa automáticamente en el 25% restante que el modelo nunca vio. Si el profit se mantiene positivo en OOS, la estrategia es robusta y no está sobreajustada.',
        },
        {
          label: 'Monaco Code Editor & Parámetros en Caliente',
          text: 'Modifica el código de la estrategia en Python con resaltado de sintaxis profesional y ajusta sliders de RSI, Stoploss y TP con recálculo instantáneo.',
        },
        {
          label: 'Optimizador Hyperopt',
          text: 'Exploración de hiperparámetros que busca la combinación óptima de Sharpe Ratio y drawdown mínimo en cuestión de segundos.',
        },
      ],
      impactCallout: {
        type: 'architecture',
        title: 'Cero Sobrecarga de Servidor',
        text: 'A diferencia de Freqtrade, el Backtest Lab corre concurrentemente con el motor en vivo sin congelar las órdenes ni el streaming WebSocket.',
      },
    },
    {
      id: 6,
      badge: 'Paso 6: Nuevos Mercados',
      title: 'Expansión Multi-Activo: Commodities, Forex & FreqAI',
      subtitle: 'Cómo operar Oro, Petróleo, Divisas e Índices con la misma arquitectura algorítmica',
      icon: <Globe2 className="w-6 h-6 text-[#00DFDF]" />,
      tabTarget: 'freqai',
      description:
        'RocketBot Pro no está limitado a criptomonedas. La lógica cuantitativa (Pandas/NumPy) y los modelos de Machine Learning (FreqAI) son agnósticos al mercado.',
      keyPoints: [
        {
          label: 'Oro (XAU/USD) y Petróleo (WTI / Brent)',
          text: 'Las materias primas son excelentes candidatas para RocketBot debido a su alta liquidez, respeto técnico a medias móviles institucionales (EMA 200) y ciclos de volatilidad cuantificables.',
        },
        {
          label: 'Divisas Forex (EUR/USD, GBP/USD, USD/JPY)',
          text: 'Operación continua 24/5 con spreads mínimos. La estrategia Multi-Factor y los canales Bollinger funcionan de forma sobresaliente en pares mayores con reversión a la media.',
        },
        {
          label: 'Conexión Técnica de Brokers Tradicionales',
          text: 'Se integran mediante conectores estándar de mercado: OANDA REST API v20, Interactive Brokers (TWS API nativa de Python) o el puente MetaTrader 5 (MT5 Python package).',
        },
        {
          label: 'FreqAI: Inteligencia Artificial Adaptativa',
          text: 'Utiliza GradientBoostingRegressor para predecir el retorno esperado de las próximas 10 velas y filtrar señales en mercados con régimen ruidoso.',
        },
      ],
      impactCallout: {
        type: 'architecture',
        title: 'Arquitectura Universal Modular',
        text: 'La misma estrategia Python que opera SOL/USDT o BTC/USDT puede alimentarse con datos de XAU/USD (Oro) o EUR/USD simplemente cambiando el conector del broker en la configuración.',
      },
    },
    {
      id: 7,
      badge: 'Paso 7: Mentor IA & Auditor',
      title: 'Prof. Quant Alpha: Auditor de Riesgo & Mentor IA',
      subtitle: 'Auditoría en vivo, advertencias de margen y soporte multi-proveedor (Gemini, Claude, GPT o Local)',
      icon: <BrainCircuit className="w-6 h-6 text-[#00DFDF]" />,
      tabTarget: 'terminal',
      description:
        'Un asistente cuantitativo con rol de Auditor Senior de Fondos Cuantitativos y Profesor de Trading Algorítmico, conectado a la telemetría viva de tu cartera.',
      keyPoints: [
        {
          label: 'Inyección de Telemetría Real',
          text: 'A diferencia de un chat genérico, Prof. Quant Alpha analiza tus números exactos en cada consulta: Equity, margen utilizado %, flotante, stop loss fijados y distancia a liquidación de cada activo.',
        },
        {
          label: 'Semáforo de Riesgo y Alertas Tempranas',
          text: 'Evalúa la salud de tu cuenta (Score 0 a 100). Te alerta enérgicamente si comprometes más del 30% del balance en margen o si alguna posición se acerca a liquidación (<8%).',
        },
        {
          label: 'Soporte Multi-API (Tus Propias Llaves)',
          text: 'Puedes alternar en 1 clic entre Google Gemini (2.5 Flash / Pro), Anthropic Claude (3.7 Sonnet / 3.5 Haiku), OpenAI (GPT-4o), DeepSeek o usar el Motor Cuántico Local sin necesidad de API Key ni costes.',
        },
        {
          label: 'Profesor de Estrategias & Hyperopt',
          text: 'Puedes consultarle dudas matemáticas sobre Canales de Donchian, Bandas de Bollinger, ATR Trailing o pedirle sugerencias para optimizar hiperparámetros en el Backtest Lab.',
        },
      ],
      impactCallout: {
        type: 'security',
        title: 'Gestor de Riesgo Institucional',
        text: 'Garantiza disciplina matemática implacable: te ayuda a no sobreoperar por sesgos emocionales y a mantener el margen siempre bajo control.',
      },
    },
    {
      id: 8,
      badge: 'Paso 8: Control de Riesgo Extremo',
      title: 'Circuit Breakers, Kill-Switch de Pánico & Kelly Sizing',
      subtitle: 'Protección militar de capital y dimensionamiento de posición matemáticamente óptimo',
      icon: <AlertOctagon className="w-6 h-6 text-[#FF3B69]" />,
      tabTarget: 'terminal',
      description:
        'Sistemas automáticos y manuales para evitar caídas catastróficas y maximizar el crecimiento geométrico del capital.',
      keyPoints: [
        {
          label: 'Interruptor de Pánico (Kill-Switch)',
          text: 'Liquida inmediatamente todas las posiciones abiertas a mercado, cancela órdenes pendientes y detiene el bot ante caídas violentas o noticias macroeconómicas.',
        },
        {
          label: 'Disyuntor Diario Automático (Circuit Breaker)',
          text: 'Bloquea nuevas compras si la pérdida acumulada del día supera el 4% o si se registran 3 pérdidas seguidas, forzando un período de enfriamiento institucional de 12 horas.',
        },
        {
          label: 'Criterio de Kelly Fraccional (0.35x)',
          text: 'Calcula el tamaño óptimo de cada posición en función del Win Rate y Profit Factor, evitando el sobre-apalancamiento y garantizando cero riesgo de ruina matemática.',
        },
        {
          label: 'Micro-Ajustes Visuales (+/- 0.5%)',
          text: 'Permite subir o bajar el Stop Loss y Take Profit directamente en cada fila de operaciones abiertas con recálculo automático.',
        },
      ],
      impactCallout: {
        type: 'security',
        title: 'Preservación de Capital Garantizada',
        text: 'Los fondos de cobertura profesionales no se miden por cuánto ganan en días buenos, sino por qué tan rápido cortan pérdidas en días difíciles.',
      },
    },
    {
      id: 9,
      badge: 'Paso 9: Suite Institucional',
      title: 'Matriz de Correlación, Escudo Prop Firm & Alertas 24/7',
      subtitle: 'Supervisión de covarianza, reglas de evaluación FTMO/Apex y notificaciones a tu smartphone',
      icon: <Layers className="w-6 h-6 text-[#0A7CFF]" />,
      tabTarget: 'terminal',
      description:
        'Tres herramientas clave accesibles desde los nuevos botones de la barra superior para traders institucionales y cuentas fondeadas.',
      keyPoints: [
        {
          label: 'Matriz de Correlación Cruzada Rolling (12 Activos)',
          text: 'Calcula la covarianza de Pearson a 30 períodos entre Cripto, Oro, Petróleo y Divisas. Emite alertas rojas si dos posiciones tienen correlación >0.75 para evitar duplicar riesgo direccional.',
        },
        {
          label: 'Escudo Prop Firm (FTMO / Apex Shield)',
          text: 'Panel de control con medidores en vivo de pérdida máxima diaria (5%), pérdida total máxima (10%) y objetivo de beneficio para aprobar pruebas de fondeo de $100k-$200k.',
        },
        {
          label: 'Alertas Instantáneas por Telegram y Discord',
          text: 'Conecta tu bot de Telegram o Webhook de Discord para recibir capturas y notificaciones al segundo de cada orden abierta, toma de beneficios y alertas de riesgo.',
        },
        {
          label: 'Modo Privacidad (Ocultación de Balance)',
          text: 'Un botón de ojo en la cabecera enmascara instantáneamente todos los saldos y ganancias con "$••••••", ideal para grabaciones, streaming o coworking.',
        },
      ],
      impactCallout: {
        type: 'profit',
        title: 'Operativa Sin Estrés Móvil',
        text: 'Puedes apagar la computadora con la certeza de que tu smartphone te notificará cualquier movimiento y tus límites de fondeo estarán 100% resguardados.',
      },
    },
    {
      id: 10,
      badge: 'Paso 10: Validación Estocástica',
      title: 'Monte Carlo Stress Testing (10k Runs), Voice & Prompt-to-Strategy',
      subtitle: 'Simulación de 10,000 caminos estocásticos, Voice Copilot e IA generadora de código Python',
      icon: <Flame className="w-6 h-6 text-[#FFB800]" />,
      tabTarget: 'lab',
      description:
        'La máxima frontera cuantitativa: verificación probabilística de 10,000 futuros posibles y creación de estrategias en lenguaje natural.',
      keyPoints: [
        {
          label: 'Simulación de Monte Carlo con 10,000 Iteraciones',
          text: 'Baraja los rendimientos históricos con reemplazo para calcular el Value at Risk (VaR 95%), el CVaR de cola y la probabilidad matemática de rentabilidad en 100 operaciones.',
        },
        {
          label: 'Distribución de Capital por Percentiles (p10 a p90)',
          text: 'Visualiza qué pasaría en el peor 10% de los casos de mercado vs la mediana y el mejor escenario optimista.',
        },
        {
          label: 'Generador Prompt-to-Strategy',
          text: 'Pídele a la IA en español lo que buscas y te generará el script Python completo compatible con IStrategy, guardándolo automáticamente en user_data/strategies/ para simular en Backtest Lab.',
        },
        {
          label: 'Voice Copilot (Interacción Manos Libres)',
          text: 'Usa el botón de micrófono en el Copilot para hablarle al Prof. Quant Alpha y el botón de altavoz para escuchar su análisis cuantitativo por voz.',
        },
      ],
      impactCallout: {
        type: 'architecture',
        title: 'Estándar Cuantitativo Superior',
        text: 'Dejas de depender de un solo backtest determinista y pasas a verificar la esperanza matemática de tu cartera en 10,000 escenarios alternativos de mercado.',
      },
    },
    {
      id: 11,
      badge: 'Paso 11: Multicuenta MAM / PAMM',
      title: 'Sistema Multicuenta Aislado y Gestión MAM',
      subtitle: 'Segregación absoluta de cuentas con persistencia individual en disco y vista consolidada',
      icon: <Layers className="w-6 h-6 text-[#00DFDF]" />,
      tabTarget: 'terminal',
      description:
        'RocketBot Pro cuenta con un motor multi-tenant institucional (Zero-Cross Contamination) donde cada subcuenta opera de forma completamente estanca e independiente.',
      keyPoints: [
        {
          label: 'Aislamiento Estricto (Zero-Cross Contamination)',
          text: 'Las posiciones, márgenes, órdenes y saldo de la Cuenta A jamás se cruzan con la Cuenta B. Cada subcuenta almacena sus datos en disco en user_data/accounts/{account_id}/.',
        },
        {
          label: 'Subcuentas Preconfiguradas & Personalizadas',
          text: 'Viene con perfiles listos para Dry-Run ($10k), Desafío Prop Firm FTMO ($100k con límites de pérdida diaria 5% y total 10%), Bybit Scalping ($5k) y Fondos Institucionales de Índices ($50k).',
        },
        {
          label: 'Vista Master Consolidada',
          text: 'Accede a través de "Master MAM" para monitorear el capital combinado global, total de operaciones abiertas en tiempo real y el porcentaje de rendimiento acumulado.',
        },
        {
          label: 'Kill-Switch Global y por Cuenta',
          text: 'Puedes ejecutar liquidación de emergencia para una cuenta específica o detonar el Kill-Switch Maestro que cierra todas las operaciones del sistema.',
        },
      ],
      impactCallout: {
        type: 'architecture',
        title: 'Gestión Institucional Profesional',
        text: 'Permite administrar capital propio, desafíos de fondeo de múltiples firmas y carteras de clientes desde una sola interfaz sin riesgo de solapamiento.',
      },
    },
  ];

  const currentStep = steps[currentStepIndex];

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    // Disparar la descarga directa desde el endpoint del backend
    const downloadUrl = `${apiBase}/api/v1/manual/download`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'Manual_RocketBot_Pro_Estrategias_MultiAsset.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloading(false), 1500);
  };

  const handleGoToTab = (tab?: 'terminal' | 'lab' | 'freqai') => {
    if (tab && onSelectTab) {
      onSelectTab(tab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-[#0C0E14] border border-white/[0.12] rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Barra superior con Resplandor y Progreso */}
        <div className="relative px-6 py-4 border-b border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08]">
              {currentStep.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#0A7CFF] font-bold">
                  {currentStep.badge}
                </span>
                <span className="text-white/[0.3] text-xs">•</span>
                <span className="text-xs text-[#8E95A2]">
                  Paso {currentStepIndex + 1} de {steps.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white font-heading tracking-tight">
                {currentStep.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-white font-medium transition cursor-pointer"
              title="Descargar Manual Técnico Completo en PDF"
            >
              <Download className="w-3.5 h-3.5 text-[#00DFDF]" />
              <span>{isDownloading ? 'Descargando...' : 'Manual PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.08] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Indicador de pasos tipo Tabs / Dots */}
        <div className="px-6 py-2.5 bg-black/40 border-b border-white/[0.06] flex items-center justify-between overflow-x-auto gap-2">
          {steps.map((s, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  if (s.tabTarget && onSelectTab) onSelectTab(s.tabTarget);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#0A7CFF]/20 text-[#0A7CFF] border border-[#0A7CFF]/40 font-bold'
                    : isCompleted
                    ? 'text-white/80 hover:bg-white/[0.04]'
                    : 'text-[#8E95A2] hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive
                      ? 'bg-[#0A7CFF] text-white font-bold'
                      : isCompleted
                      ? 'bg-[#00DFDF]/20 text-[#00DFDF]'
                      : 'bg-white/[0.08] text-[#8E95A2]'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </span>
                <span className="hidden md:inline">{s.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Cuerpo del Diálogo con Scroll Suave */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <p className="text-xs text-[#8E95A2] font-mono leading-relaxed">
            {currentStep.subtitle}
          </p>

          <p className="text-sm text-white/90 leading-relaxed font-sans">
            {currentStep.description}
          </p>

          {/* Tarjetas de Puntos Clave */}
          <div className="space-y-2.5 pt-1">
            {currentStep.keyPoints.map((point, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.06] transition flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00DFDF] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-white block mb-0.5 font-heading">
                    {point.label}
                  </span>
                  <span className="text-[#8E95A2] leading-relaxed block font-sans">
                    {point.text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Callout de Impacto / Regla de Oro */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              currentStep.impactCallout.type === 'security'
                ? 'bg-[#FF3B69]/10 border-[#FF3B69]/30 text-white'
                : currentStep.impactCallout.type === 'profit'
                ? 'bg-[#00DFDF]/10 border-[#00DFDF]/30 text-white'
                : 'bg-[#0A7CFF]/10 border-[#0A7CFF]/30 text-white'
            }`}
          >
            {currentStep.impactCallout.type === 'security' ? (
              <AlertTriangle className="w-5 h-5 text-[#FF3B69] shrink-0 mt-0.5" />
            ) : currentStep.impactCallout.type === 'profit' ? (
              <Lightbulb className="w-5 h-5 text-[#00DFDF] shrink-0 mt-0.5" />
            ) : (
              <ExternalLink className="w-5 h-5 text-[#0A7CFF] shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <span className="font-bold block mb-1 font-heading">
                {currentStep.impactCallout.title}
              </span>
              <p className="text-[#A7AFBD] leading-relaxed">
                {currentStep.impactCallout.text}
              </p>
            </div>
          </div>
        </div>

        {/* Footer con Navegación y Descarga */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-black/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-xs text-white"
            >
              <Download className="w-3.5 h-3.5 text-[#00DFDF]" />
              <span>Manual PDF</span>
            </button>

            {currentStep.tabTarget && (
              <button
                onClick={() => {
                  handleGoToTab(currentStep.tabTarget);
                  onClose();
                }}
                className="text-xs font-mono text-[#0A7CFF] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Abrir vista en la terminal</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                if (currentStepIndex > 0) {
                  const prevIdx = currentStepIndex - 1;
                  setCurrentStepIndex(prevIdx);
                  if (steps[prevIdx].tabTarget && onSelectTab) {
                    onSelectTab(steps[prevIdx].tabTarget);
                  }
                }
              }}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-white/[0.06] transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {currentStepIndex < steps.length - 1 ? (
              <button
                onClick={() => {
                  const nextIdx = currentStepIndex + 1;
                  setCurrentStepIndex(nextIdx);
                  if (steps[nextIdx].tabTarget && onSelectTab) {
                    onSelectTab(steps[nextIdx].tabTarget);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg figma-btn-primary text-xs font-bold font-heading text-white transition cursor-pointer"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg figma-btn-primary text-xs font-bold font-heading text-white transition cursor-pointer"
              >
                <span>¡Entendido! Comenzar a Operar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
