import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

export interface TourStep {
  id: string;
  selector: string;
  title: string;
  badge: string;
  description: string;
  actionTip?: string;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right';
  targetTab?: 'terminal' | 'lab' | 'freqai';
}

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: 'terminal' | 'lab' | 'freqai') => void;
  onOpenDetailedManual?: () => void;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'header-controls',
    selector: '[data-tour="header-controls"]',
    title: 'Control Maestro & Modos de Mercado',
    badge: 'Paso 1 de 11 • Seguridad Primero',
    description:
      'Aquí controlas el entorno de ejecución del bot. Por seguridad, arranca en modo DRY-RUN SIMULATOR con $10,000 virtuales en tiempo real. Puedes alternar entre FUTURES (3x) o SPOT, y pausar o reanudar el escaneo cuando quieras.',
    actionTip: 'Tip: Nunca operes con capital real hasta validar al menos 50 operaciones en Dry-Run.',
    preferredPosition: 'bottom',
    targetTab: 'terminal',
  },
  {
    id: 'account-switcher',
    selector: '[data-tour="account-switcher"]',
    title: 'Sistema Multicuenta Aislado (MAM / PAMM)',
    badge: 'Paso 2 de 11 • Segregación Absoluta',
    description:
      'Gestiona múltiples cuentas y subcuentas 100% aisladas con Zero-Cross Contamination. Cada cuenta posee su propio balance, operaciones abiertas, apalancamiento y reglas de Prop Firm. Cambia entre subcuentas al instante o abre la Vista Master MAM para ver el capital total combinado.',
    actionTip: 'Haz clic en el desplegable de cuenta para alternar de subcuenta o crear una nueva.',
    preferredPosition: 'bottom',
    targetTab: 'terminal',
  },
  {
    id: 'kill-switch-btn',
    selector: '[data-tour="kill-switch-btn"]',
    title: 'Circuit Breaker & Kill-Switch de Pánico',
    badge: 'Paso 3 de 11 • Protección de Emergencia',
    description:
      'Botón de parada de emergencia institucional. Con un solo clic liquida inmediatamente todas las posiciones abiertas a precio de mercado y pausa el bot. Además, el disyuntor automático bloquea nuevas operaciones si se pierde más del 4% diario o 3 trades seguidos.',
    actionTip: 'Úsalo ante noticias macroeconómicas inesperadas o caídas violentas de mercado.',
    preferredPosition: 'bottom',
    targetTab: 'terminal',
  },
  {
    id: 'institutional-tools',
    selector: '[data-tour="institutional-tools"]',
    title: 'Suite Institucional: Correlación, Prop Firm y Alertas',
    badge: 'Paso 4 de 11 • Herramientas Avanzadas',
    description:
      'Accede en 1 clic a: 1) Matriz de Correlación cruzada (evita duplicar riesgo direccional en activos correlacionados >0.75), 2) Escudo Prop Firm (FTMO/Apex con límites de pérdida del 5% y 10%) y 3) Alertas 24/7 a tus canales de Telegram y Discord.',
    actionTip: 'Haz clic en el icono de capas (📑) para ver el mapa de calor de correlaciones.',
    preferredPosition: 'bottom',
    targetTab: 'terminal',
  },
  {
    id: 'strategy-selector',
    selector: '[data-tour="strategy-selector"]',
    title: 'Selector de Estrategia Cuantitativa',
    badge: 'Paso 5 de 11 • El Cerebro Algorítmico',
    description:
      'RocketBot Pro cuenta con 4 estrategias institucionales especializadas: Cripto Multi-Factor, Oro y Petróleo (Breakout Donchian), Divisas Forex (Reversión a la media) e Índices (S&P 500 y Nasdaq). Puedes cambiar la estrategia en caliente aquí.',
    actionTip: 'Haz clic en el menú desplegable para alternar entre mercados y estrategias.',
    preferredPosition: 'bottom',
    targetTab: 'terminal',
  },
  {
    id: 'kpi-cards',
    selector: '[data-tour="kpi-cards"]',
    title: 'Métricas Financieras & Kelly Sizing',
    badge: 'Paso 6 de 11 • Salud de Cartera & Dimensionamiento',
    description:
      'Monitorea el Equity total, PnL flotante, exposición nocional y Win Rate. Además, el bot calcula en la tarjeta 5 el Criterio de Kelly Fraccional (0.35x), recomendando el tamaño de orden matemáticamente óptimo por trade según tu historial.',
    actionTip: 'Regla de Oro: Mantén el margen comprometido siempre por debajo del 30% del balance.',
    preferredPosition: 'bottom',
    targetTab: 'terminal',
  },
  {
    id: 'chart-container',
    selector: '[data-tour="chart-container"]',
    title: 'Gráfico TradingView con Niveles Proyectados',
    badge: 'Paso 7 de 11 • Ejecución Transparente',
    description:
      'Visualiza velas OHLCV en vivo y las órdenes automáticas del bot superpuestas: Línea Cyan (Take Profit dinámico), Línea Rosa (Stop Loss por volatilidad ATR) y Línea Amarilla (Re-entrada DCA en soportes clave).',
    actionTip: 'Usa los botones superiores para cambiar de temporalidad (1m, 5m, 15m, 1h, 4h).',
    preferredPosition: 'right',
    targetTab: 'terminal',
  },
  {
    id: 'radar-panel',
    selector: '[data-tour="radar-panel"]',
    title: 'Radar de Confluencia Multi-Activo',
    badge: 'Paso 8 de 11 • Diagnóstico "¿Por qué compra?"',
    description:
      'Filtra entre Cripto, Oro/Petróleo, Divisas Forex e Índices. El radar evalúa 5 condiciones matemáticas en vivo por cada activo. Si ves una oportunidad clara, pulsa "LONG" o "SHORT" para abrir una orden manual instantánea.',
    actionTip: 'Haz clic en las pestañas "Oro & Petróleo" o "Divisas" para ver el análisis en vivo.',
    preferredPosition: 'left',
    targetTab: 'terminal',
  },
  {
    id: 'trades-panel',
    selector: '[data-tour="trades-panel"]',
    title: 'Panel de Posiciones y Micro-Ajustes SL/TP',
    badge: 'Paso 9 de 11 • Control Operativo Táctico',
    description:
      'Revisa tus operaciones activas con sus precios de entrada, distancia a liquidación y PnL. Ahora incluye botones interactivos +/- en cada fila para subir o bajar el Stop Loss y Take Profit en caliente con recálculo automático.',
    actionTip: 'Haz clic en una fila para enfocar el gráfico automáticamente en ese activo.',
    preferredPosition: 'top',
    targetTab: 'terminal',
  },
  {
    id: 'ai-copilot-btn',
    selector: '[data-tour="ai-copilot-btn"]',
    title: 'Mentor IA, Voice Copilot & Prompt-to-Strategy',
    badge: 'Paso 10 de 11 • IA Cuántica Multi-Proveedor',
    description:
      'Tu profesor de trading y auditor senior de riesgo ("Prof. Quant Alpha"). Supervisa en vivo tu margen, liquidaciones y stop losses. Incluye interacción por voz (micrófono y lectura hablada) y el generador Prompt-to-Strategy para crear código Python en lenguaje natural.',
    actionTip: 'Haz clic en "Mentor IA" o en el botón flotante inferior para auditar tu cuenta en cualquier momento.',
    preferredPosition: 'bottom',
    targetTab: 'terminal',
  },
  {
    id: 'lab-tab',
    selector: '[data-tour="lab-tab"]',
    title: 'Backtest Lab, Monte Carlo 10k & Monaco',
    badge: 'Paso 11 de 11 • Validación Científica',
    description:
      'Simula años de histórico con 0-Lookahead Bias, edita estrategias en Python con Monaco y ejecuta la nueva pestaña de Stress Testing de Monte Carlo (10,000 iteraciones estocásticas) para calcular el VaR 95%, CVaR y la probabilidad de ganancia.',
    actionTip: '¡Todo listo! Pulsa en "Finalizar Tutorial" y comienza a explorar RocketBot Pro.',
    preferredPosition: 'bottom',
    targetTab: 'terminal',
  },
];

export const InteractiveTour: React.FC<InteractiveTourProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenDetailedManual,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [bubbleStyle, setBubbleStyle] = useState<React.CSSProperties>({});
  const [arrowClass, setArrowClass] = useState<string>('');
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const step = TOUR_STEPS[currentStepIndex];

  // Actualizar la posición del globo flotante según el elemento objetivo
  const updatePosition = useCallback(() => {
    if (!isOpen || !step) return;

    const el = document.querySelector(step.selector);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const rect = el.getBoundingClientRect();
    setTargetRect(rect);

    // Dimensiones del tooltip flotante
    const bubbleWidth = Math.min(380, window.innerWidth - 32);
    const bubbleHeight = 260; // Estimación base para cálculo
    const margin = 14;

    let top = 0;
    let left = 0;
    let position = step.preferredPosition || 'bottom';

    // Determinar la mejor posición evitando desbordes de pantalla
    if (position === 'bottom') {
      top = rect.bottom + margin;
      left = rect.left + rect.width / 2 - bubbleWidth / 2;
      if (top + bubbleHeight > window.innerHeight && rect.top - bubbleHeight - margin > 0) {
        position = 'top';
        top = rect.top - bubbleHeight - margin;
      }
    } else if (position === 'top') {
      top = rect.top - bubbleHeight - margin;
      left = rect.left + rect.width / 2 - bubbleWidth / 2;
      if (top < 10 && rect.bottom + bubbleHeight + margin < window.innerHeight) {
        position = 'bottom';
        top = rect.bottom + margin;
      }
    } else if (position === 'left') {
      left = rect.left - bubbleWidth - margin;
      top = rect.top + rect.height / 2 - 120;
      if (left < 10) {
        position = 'bottom';
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - bubbleWidth / 2;
      }
    } else if (position === 'right') {
      left = rect.right + margin;
      top = rect.top + rect.height / 2 - 120;
      if (left + bubbleWidth > window.innerWidth - 10) {
        position = 'bottom';
        top = rect.bottom + margin;
        left = rect.left + rect.width / 2 - bubbleWidth / 2;
      }
    }

    // Asegurar que quede dentro de la pantalla horizontalmente
    left = Math.max(16, Math.min(left, window.innerWidth - bubbleWidth - 16));
    top = Math.max(16, Math.min(top, window.innerHeight - 280));

    setBubbleStyle({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${bubbleWidth}px`,
      zIndex: 9999,
    });

    setArrowClass(position);
  }, [isOpen, step]);

  // Si el paso requiere una pestaña específica, cambiar a ella
  useEffect(() => {
    if (!isOpen || !step) return;

    if (step.targetTab && onSelectTab) {
      onSelectTab(step.targetTab);
    }

    // Scroll suave hacia el elemento objetivo
    const timer = setTimeout(() => {
      const el = document.querySelector(step.selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      updatePosition();
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen, currentStepIndex, step, onSelectTab, updatePosition]);

  // Escuchar redimensionamiento y scroll de ventana
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  if (!isOpen || !step) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <>
      {/* 1. Máscara de fondo con Spotlight y recorte */}
      <div className="fixed inset-0 z-[9990] pointer-events-none transition-all duration-300">
        {targetRect && (
          <div
            className="absolute rounded-xl transition-all duration-300 pointer-events-none"
            style={{
              top: `${Math.max(0, targetRect.top - 4)}px`,
              left: `${Math.max(0, targetRect.left - 4)}px`,
              width: `${targetRect.width + 8}px`,
              height: `${targetRect.height + 8}px`,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.72), 0 0 25px rgba(10, 124, 255, 0.6)',
              border: '2px solid rgba(10, 124, 255, 0.9)',
            }}
          />
        )}
      </div>

      {/* 2. Globo Flotante Interactivo (Speech Bubble) */}
      <div
        ref={tooltipRef}
        style={bubbleStyle}
        className="animate-in fade-in zoom-in-95 duration-200 pointer-events-auto select-none"
      >
        <div className="relative p-5 rounded-2xl bg-[#0C0F17]/95 backdrop-blur-xl border border-[#0A7CFF]/50 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(10,124,255,0.25)] text-white space-y-3.5">
          {/* Cabecera del globo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A7CFF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0A7CFF]"></span>
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0A7CFF] bg-[#0A7CFF]/15 px-2 py-0.5 rounded-full border border-[#0A7CFF]/30">
                {step.badge}
              </span>
            </div>

            <button
              onClick={onClose}
              className="text-[#8E95A2] hover:text-white p-1 rounded-lg hover:bg-white/[0.08] transition cursor-pointer"
              title="Saltar tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Título y Descripción */}
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white font-heading tracking-tight flex items-center gap-1.5">
              <span>{step.title}</span>
            </h3>
            <p className="text-xs text-[#CBD2DF] leading-relaxed font-sans">
              {step.description}
            </p>
          </div>

          {/* Tip / Acción recomendada */}
          {step.actionTip && (
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-start gap-2 text-[11px] text-[#00DFDF]">
              <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#00DFDF]" />
              <span className="leading-snug">{step.actionTip}</span>
            </div>
          )}

          {/* Barra de progreso */}
          <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0A7CFF] to-[#00DFDF] transition-all duration-300"
              style={{
                width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%`,
              }}
            />
          </div>

          {/* Enlace opcional a la guía detallada en el último paso */}
          {currentStepIndex === TOUR_STEPS.length - 1 && onOpenDetailedManual && (
            <button
              onClick={() => {
                onClose();
                onOpenDetailedManual();
              }}
              className="w-full py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-heading font-medium text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0A7CFF]" />
              <span>Ver Documentación y Parámetros en Modal</span>
            </button>
          )}

          {/* Botones de Navegación del Globo */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-1 text-xs text-[#8E95A2] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-mono"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="text-[11px] font-mono text-[#8E95A2] hover:text-white px-2 py-1 transition cursor-pointer"
              >
                Saltar
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg figma-btn-primary text-xs font-bold font-heading text-white transition cursor-pointer shadow-[0_0_15px_rgba(10,124,255,0.4)]"
              >
                <span>
                  {currentStepIndex === TOUR_STEPS.length - 1 ? '¡Finalizar!' : 'Siguiente'}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
