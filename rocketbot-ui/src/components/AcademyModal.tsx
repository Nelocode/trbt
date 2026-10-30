import React, { useState } from 'react';
import {
  X,
  BookOpen,
  GraduationCap,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  Play,
  Award,
  Zap,
  Shield,
  HelpCircle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';

interface AcademyLesson {
  id: string;
  module: string;
  title: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  readTime: string;
  summary: string;
  keyTakeaways: string[];
  tips: string;
}

const ACADEMY_MODULES = [
  {
    id: 'intro',
    name: 'Fundamentos Cuantitativos',
    icon: '🌱',
    description: 'Aprende qué es el trading sistemático y cómo RocketBot toma decisiones con matemáticas.',
  },
  {
    id: 'risk',
    name: 'Gestión de Riesgo & Circuit Breakers',
    icon: '🛡️',
    description: 'La regla de oro de Wall Street: Proteger el capital antes de buscar ganancias.',
  },
  {
    id: 'execution',
    name: 'Confluencia & Red Neuronal',
    icon: '🧠',
    description: 'Cómo leer el Grafo de Fuerzas (Mindforce) y entender por qué el bot descarta operaciones dudosas.',
  },
  {
    id: 'prop',
    name: 'Cuentas Fondeadas (Prop Firms)',
    icon: '🏆',
    description: 'Estrategias para superar retos de FTMO y Apex Trader con apalancamiento controlado.',
  },
];

const LESSONS: AcademyLesson[] = [
  {
    id: 'lesson-1',
    module: 'intro',
    title: '1. ¿Cómo piensa un Robot Cuantitativo?',
    level: 'Principiante',
    readTime: '3 min',
    summary:
      'A diferencia de los traders manuales que operan por FOMO, miedo o intuición, RocketBot ejecuta órdenes basándose estrictamente en probabilidades y confluencia estadística multifactorial.',
    keyTakeaways: [
      'Cero emociones: las entradas y salidas están programadas.',
      'Edge Estadístico: ganar no significa acertar el 100% de las veces, sino tener un ratio riesgo/beneficio positivo a largo plazo.',
      'El rol del usuario: supervisar, calibrar riesgo y no interrumpir las rachas normales del mercado.',
    ],
    tips: 'Nunca arriesgues más del 1-2% de tu capital total por cada posición individual.',
  },
  {
    id: 'lesson-2',
    module: 'risk',
    title: '2. Stop Loss, Take Profit y Circuit Breakers',
    level: 'Principiante',
    readTime: '4 min',
    summary:
      'Los Circuit Breakers son interruptores automáticos de emergencia diseñados para detener el bot si el mercado entra en un régimen hostil o si se alcanza la pérdida máxima diaria.',
    keyTakeaways: [
      'Stop Loss Automático: Se calcula automáticamente en base a la volatilidad real (ATR).',
      'Circuit Breaker Diario: Si la cuenta pierde 4% en un solo día, el bot se pausa automáticamente para proteger tu dinero.',
      'Guardia Nocturno: Monitorea tus posiciones mientras duermes con alertas a Telegram y Discord.',
    ],
    tips: 'Si el bot activa un Circuit Breaker, déjalo pausado hasta la sesión del día siguiente. El mercado siempre da revancha con la mente fresca.',
  },
  {
    id: 'lesson-3',
    module: 'execution',
    title: '3. El Poder del "Skip": Por qué descartar es ganar',
    level: 'Intermedio',
    readTime: '3 min',
    summary:
      'Los mejores traders y fondos cuantitativos pasan el 80% de su tiempo esperando. En la terminal verás alertas como "Convergence only 48% · skip". Descartar operaciones con baja probabilidad es lo que preserva tu saldo.',
    keyTakeaways: [
      'Filtro de Confluencia: Requiere al menos 60% de convergencia entre volumen, momentum y tendencia.',
      'Evitar el Overtrading: Menos operaciones de mayor calidad superan a muchas operaciones aleatorias.',
      'Preservación de Margen: Mantener saldo libre te permite entrar cuando aparece la verdadera oportunidad.',
    ],
    tips: 'No te desesperes si el bot pasa varias horas sin abrir operaciones; significa que está protegiendo tu capital de trampas de liquidez.',
  },
  {
    id: 'lesson-4',
    module: 'prop',
    title: '4. Reglas de Oro para Cuentas Fondeadas (FTMO / Apex)',
    level: 'Avanzado',
    readTime: '5 min',
    summary:
      'Aprende a pasar desafíos de prop firms gestionando el Daily Drawdown relativo y el trailing drawdown sin violar ninguna cláusula del broker.',
    keyTakeaways: [
      'Max Daily Loss: Nunca exceder el 5% diario.',
      'Apalancamiento Moderado: En cripto o futuros, 2x o 3x es más que suficiente para alcanzar el objetivo de profit.',
      'Consistencia: Ganancias escalonadas son mejor valoradas que un golpe de suerte que arriesgó la cuenta.',
    ],
    tips: 'Usa el botón "Puesta a Punto" antes de cada sesión para calibrar el perfil Conservador o Equilibrado.',
  },
];

interface AcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteLesson?: (lessonId: string) => void;
}

export const AcademyModal: React.FC<AcademyModalProps> = ({
  isOpen,
  onClose,
  onCompleteLesson,
}) => {
  const [activeModule, setActiveModule] = useState('intro');
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson>(LESSONS[0]);
  const [completedLessons, setCompletedLessons] = useState<string[]>(['lesson-1']);

  if (!isOpen) return null;

  const currentLessons = LESSONS.filter((l) => l.module === activeModule);

  const handleMarkComplete = (id: string) => {
    if (!completedLessons.includes(id)) {
      setCompletedLessons([...completedLessons, id]);
      if (onCompleteLesson) onCompleteLesson(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0B0D14] border border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-gradient-to-r from-[#FF2E93]/15 via-blue-950/20 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF2E93]/20 border border-[#FF2E93]/40 flex items-center justify-center text-[#FF2E93] shadow-[0_0_15px_rgba(255,46,147,0.3)]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#FF2E93]/20 text-[#FF2E93] border border-[#FF2E93]/40">
                  Academia Cuantitativa RocketBot
                </span>
                <span className="text-[10px] font-mono text-white/50">
                  {completedLessons.length} de {LESSONS.length} completadas
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-heading mt-0.5">
                Centro de Aprendizaje & Dominio Cuantitativo
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white/60 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body dividido en 2 columnas: Menú de Módulos & Contenido */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Columna Izquierda: Módulos y Lista de Lecciones */}
          <div className="md:col-span-5 border-r border-white/[0.08] p-4 overflow-y-auto space-y-4 bg-black/30">
            {/* Tabs de Módulos */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-white/40 block px-1">
                Módulos de Formación
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {ACADEMY_MODULES.map((m) => {
                  const isActive = activeModule === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveModule(m.id);
                        const first = LESSONS.find((l) => l.module === m.id);
                        if (first) setSelectedLesson(first);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition ${
                        isActive
                          ? 'bg-[#FF2E93]/15 border-[#FF2E93]/50 text-white shadow-[0_0_12px_rgba(255,46,147,0.2)]'
                          : 'bg-white/[0.02] border-white/[0.06] text-white/70 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{m.icon}</span>
                        <span className="text-xs font-bold truncate">{m.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de Lecciones del Módulo */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono uppercase text-white/40 block px-1">
                Lecciones del Módulo
              </span>

              {currentLessons.map((lesson) => {
                const isSelected = selectedLesson.id === lesson.id;
                const isDone = completedLessons.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-900/30 to-[#FF2E93]/15 border-cyan-500/50 shadow-md'
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00FFA3]" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-white/20" />
                        )}
                        <span className="text-xs font-bold text-white leading-tight">
                          {lesson.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
                        <span>{lesson.level}</span>
                        <span>•</span>
                        <span>{lesson.readTime}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 text-white/40 ${isSelected ? 'text-white' : ''}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Columna Derecha: Lectura de la Lección */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-[#080A10]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {selectedLesson.level}
                </span>
                <span className="text-[10px] font-mono text-white/40">
                  Tiempo estimado: {selectedLesson.readTime}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white font-heading">
                {selectedLesson.title}
              </h1>
            </div>

            {/* Resumen */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-white/80 leading-relaxed space-y-2">
              <span className="text-[11px] font-mono uppercase text-[#00DFDF] font-bold block">
                Concepto Central:
              </span>
              <p>{selectedLesson.summary}</p>
            </div>

            {/* Puntos Clave */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-white font-heading flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF2E93]" />
                Puntos Clave para Recordar:
              </span>
              <div className="space-y-2">
                {selectedLesson.keyTakeaways.map((point, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-white/75"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#00FFA3] shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Tip */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
              <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">Consejo del Mentor Cuantitativo:</strong>
                <span>{selectedLesson.tips}</span>
              </div>
            </div>

            {/* Footer de la lección */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs text-white/50">
                {completedLessons.includes(selectedLesson.id)
                  ? '✓ Has completado esta lección'
                  : 'Completa la lección para sumar puntos a tu perfil'}
              </span>

              <button
                onClick={() => handleMarkComplete(selectedLesson.id)}
                className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition flex items-center gap-1.5 ${
                  completedLessons.includes(selectedLesson.id)
                    ? 'bg-[#00FFA3]/20 border border-[#00FFA3]/40 text-[#00FFA3]'
                    : 'bg-[#FF2E93] hover:bg-[#FF2E93]/90 text-white shadow-[0_0_15px_rgba(255,46,147,0.4)]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {completedLessons.includes(selectedLesson.id)
                    ? 'Completada'
                    : 'Marcar como Aprendida'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
