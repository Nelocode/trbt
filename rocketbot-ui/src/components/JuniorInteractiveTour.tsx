import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Shield,
  BrainCircuit,
  Award,
} from 'lucide-react';
import { audioFeedback } from '../utils/audioFeedback';
import { achievementsService } from '../utils/achievementsService';

export interface JuniorTourStep {
  id: string;
  selector: string;
  title: string;
  badge: string;
  description: string;
  tip?: string;
  preferredPosition?: 'top' | 'bottom' | 'left' | 'right';
}

export const JUNIOR_TOUR_STEPS: JuniorTourStep[] = [
  {
    id: 'junior-hero',
    selector: '[data-junior-tour="hero"]',
    title: '¡Bienvenido a RocketBot!',
    badge: 'Paso 1 de 8 • Tu Centro de Mando',
    description:
      'Aquí respondes la pregunta más importante: ¿Qué está haciendo mi bot ahora mismo? El semáforo verde indica que está activo y cuidando tu dinero; el amarillo indica pausa. Con el botón principal puedes iniciar o pausar las operaciones cuando quieras.',
    tip: 'Consejo: El bot analiza el mercado segundo a segundo y solo opera cuando hay una ventaja matemática clara.',
    preferredPosition: 'bottom',
  },
  {
    id: 'junior-practice-mode',
    selector: '[data-junior-tour="practice-mode"]',
    title: 'Modo Práctica (Sin Riesgo Real)',
    badge: 'Paso 2 de 8 • Aprende Seguro',
    description:
      'Por seguridad, RocketBot inicia siempre en Modo Práctica (Dry-Run). Cuentas con un saldo virtual de práctica pero conectado a precios de mercado 100% reales. Puedes practicar, familiarizarte y comprobar resultados sin arriesgar ni un solo dólar.',
    tip: 'Recomendación: Opera al menos 3 a 5 días en Modo Práctica antes de considerar conectar capital real.',
    preferredPosition: 'bottom',
  },
  {
    id: 'junior-metrics',
    selector: '[data-junior-tour="metrics"]',
    title: 'Tus 3 Métricas Esenciales',
    badge: 'Paso 3 de 8 • Tu Dinero de un Vistazo',
    description:
      'Olvídate de pantallas confusas con cientos de números. Aquí ves lo que de verdad importa: 1) Tu Capital Total, 2) Tus Ganancias de Hoy con tu Meta Diaria configurable, y 3) Tu Perfil de Riesgo activo.',
    tip: 'Toca el icono (?) en cualquier tarjeta para ver una explicación sencilla de cada cifra.',
    preferredPosition: 'bottom',
  },
  {
    id: 'junior-risk-slider',
    selector: '[data-junior-tour="risk-slider"]',
    title: 'Selector de Perfil de Riesgo',
    badge: 'Paso 4 de 8 • Tú Tienes el Control',
    description:
      'Elige cómo quieres que opere el bot con 1 solo clic: Conservador (solo compras al contado con riesgo mínimo), Equilibrado (nuestra recomendación para empezar) o Crecimiento (buscando mayores rendimientos con protección institucional).',
    tip: 'Puedes cambiar de perfil en cualquier momento según tu nivel de comodidad.',
    preferredPosition: 'bottom',
  },
  {
    id: 'junior-chart',
    selector: '[data-junior-tour="chart"]',
    title: 'Gráfico en Vivo con Velas o Línea Suave',
    badge: 'Paso 5 de 8 • Transparencia Total',
    description:
      'Observa el precio en tiempo real. Si las velas japonesas te resultan complicadas, toca el botón "Línea Suave" para ver una curva limpia con degradado. Usa los chips superiores para cambiar entre Bitcoin, Ethereum, Solana, Oro o el índice Nasdaq.',
    tip: 'Las flechas verdes marcan las compras del bot y las rojas las tomas de ganancias.',
    preferredPosition: 'top',
  },
  {
    id: 'junior-diary',
    selector: '[data-junior-tour="diary"]',
    title: 'El Diario del Bot en Español Claro',
    badge: 'Paso 6 de 8 • Cero Cajas Negras',
    description:
      'Una bitácora en vivo que te cuenta qué está haciendo el algoritmo en cada momento. Sabrás cuándo está analizando con paciencia, cuándo detecta una tendencia favorable y cómo verifica las protecciones en segundo plano.',
    tip: 'Así nunca tendrás dudas de qué ocurre con tus operaciones.',
    preferredPosition: 'top',
  },
  {
    id: 'junior-trades',
    selector: '[data-junior-tour="trades"]',
    title: 'Operaciones en Curso y "¿Por qué compraste?"',
    badge: 'Paso 7 de 8 • Comprensión Inmediata',
    description:
      'Aquí ves tus operaciones activas explicadas para personas reales. Cada tarjeta tiene el botón "¿Por qué compraste?" donde el Mentor IA te explica la lógica matemática exacta de la entrada. También puedes cerrar cualquier trade con un solo clic.',
    tip: 'Al tocar una operación, el gráfico superior se enfoca automáticamente en esa moneda.',
    preferredPosition: 'top',
  },
  {
    id: 'junior-shields',
    selector: '[data-junior-tour="shields"]',
    title: 'Los 4 Escudos Automáticos',
    badge: 'Paso 8 de 8 • Máxima Seguridad',
    description:
      'RocketBot cuenta con 4 capas de protección institucional: Freno Diario al 4% (evita pérdidas grandes en días malos), Pausa Anti-Rachas (tras 3 pérdidas consecutivas), Filtro de Tendencia (solo compra a favor del mercado) y Enfriamiento Anti-Sobreoperar.',
    tip: '¡Felicidades! Has completado el tour. Ahora estás listo para explorar tu cuenta con total tranquilidad.',
    preferredPosition: 'top',
  },
];

interface JuniorInteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JuniorInteractiveTour: React.FC<JuniorInteractiveTourProps> = ({ isOpen, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const currentStep = JUNIOR_TOUR_STEPS[currentStepIndex];

  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const element = document.querySelector(currentStep.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll suave hacia el elemento si está fuera de pantalla
      const isVisibleInViewport =
        rect.top >= 80 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 40;

      if (!isVisibleInViewport) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetRect(null);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setTargetRect(null);
      return;
    }

    updateTargetPosition();
    const handleResizeOrScroll = () => updateTargetPosition();
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    const timer = setTimeout(updateTargetPosition, 300);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen, currentStepIndex, updateTargetPosition]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNext = () => {
    audioFeedback.playClickTick();
    if (currentStepIndex < JUNIOR_TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      audioFeedback.playChimeSuccess();
      achievementsService.unlock('acad_02');
      onClose();
    }
  };

  const handlePrev = () => {
    audioFeedback.playClickTick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  if (!isOpen || !currentStep) return null;

  // Cálculo de coordenadas flotantes centradas
  let tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 99999,
  };

  const tooltipWidth = 360;
  const padding = 16;

  if (targetRect) {
    let top = targetRect.bottom + 12;
    let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

    if (currentStep.preferredPosition === 'top' || top + 260 > window.innerHeight) {
      top = Math.max(70, targetRect.top - 240);
    }

    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }

    tooltipStyle = {
      ...tooltipStyle,
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    };
  } else {
    // Si no encuentra el elemento en pantalla, centrar en viewport
    tooltipStyle = {
      ...tooltipStyle,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: `${tooltipWidth}px`,
    };
  }

  return (
    <>
      {/* Fondo difuso oscurecido */}
      <div
        className="fixed inset-0 z-[9990] bg-black/75 backdrop-blur-[2px] transition-all duration-300"
        onClick={onClose}
      />

      {/* Recuadro de Enfoque (Spotlight) alrededor del elemento activo */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top: `${Math.max(0, targetRect.top - 6)}px`,
            left: `${Math.max(0, targetRect.left - 6)}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            borderRadius: '20px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 25px rgba(0, 223, 223, 0.5)',
            border: '2px solid rgba(0, 223, 223, 0.8)',
            pointerEvents: 'none',
            zIndex: 9995,
            transition: 'all 0.3s ease-out',
          }}
        />
      )}

      {/* Globo Flotante del Tour */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="figma-card rounded-2xl border border-[#00DFDF]/40 bg-[#0C101A] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,223,223,0.25)] space-y-4 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Cabecera del paso */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#00DFDF] font-heading flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tour Principiante</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#8E95A2] bg-white/[0.06] px-2 py-0.5 rounded-full">
              {currentStepIndex + 1} / {JUNIOR_TOUR_STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-lg bg-white/[0.06] text-[#8E95A2] hover:text-white flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Título y descripción */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00DFDF] font-heading block">
            {currentStep.badge}
          </span>
          <h3 className="text-sm sm:text-base font-bold font-heading text-white">{currentStep.title}</h3>
          <p className="text-xs text-[#CBD2DF] leading-relaxed">{currentStep.description}</p>
        </div>

        {/* Consejo amigable */}
        {currentStep.tip && (
          <div className="p-2.5 rounded-xl bg-[#00DFDF]/10 border border-[#00DFDF]/25 text-[11px] text-[#00DFDF] flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{currentStep.tip}</span>
          </div>
        )}

        {/* Puntos de progreso y botones de acción */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
          <div className="flex items-center gap-1">
            {JUNIOR_TOUR_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === currentStepIndex ? 'w-5 bg-[#00DFDF]' : 'w-1.5 bg-white/[0.15]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="h-8 px-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-heading font-medium text-white flex items-center gap-1 transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Atrás</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="h-8 px-3.5 rounded-xl figma-btn-primary text-white text-xs font-heading font-bold flex items-center gap-1 shadow-md transition cursor-pointer"
            >
              <span>{currentStepIndex === JUNIOR_TOUR_STEPS.length - 1 ? '¡Listo, Empezar!' : 'Siguiente'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
