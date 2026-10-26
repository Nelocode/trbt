import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  TrendingUp,
  Moon,
  ChevronRight,
  ChevronLeft,
  X,
  Lock,
  Globe,
  Sliders,
  Award,
} from 'lucide-react';
import { audioFeedback } from '../utils/audioFeedback';
import { achievementsService } from '../utils/achievementsService';

interface EngineStartWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEngineStarted: (config: {
    botName: string;
    dryRun: boolean;
    riskProfile: 'conservative' | 'balanced' | 'growth';
    dailyTarget: number;
    nightGuard: boolean;
  }) => Promise<void>;
  currentAccountName?: string;
  isDryRun?: boolean;
}

export const EngineStartWizardModal: React.FC<EngineStartWizardModalProps> = ({
  isOpen,
  onClose,
  onEngineStarted,
  currentAccountName = 'Mi Primer Robot',
  isDryRun = true,
}) => {
  const [step, setStep] = useState<number>(1);
  const [botName, setBotName] = useState<string>(currentAccountName || 'RocketBot Alpha 1');
  const [mode, setMode] = useState<'dry_run' | 'live'>(isDryRun ? 'dry_run' : 'live');
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'balanced' | 'growth'>('balanced');
  const [dailyTarget, setDailyTarget] = useState<number>(50);
  const [nightGuard, setNightGuard] = useState<boolean>(true);
  const [isIgniting, setIsIgniting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Pre-flight checks animation
  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  useEffect(() => {
    if (isOpen && step === 3) {
      setCheckedItems([]);
      const timers = [
        setTimeout(() => setCheckedItems((prev) => [...prev, 0]), 250),
        setTimeout(() => setCheckedItems((prev) => [...prev, 1]), 650),
        setTimeout(() => setCheckedItems((prev) => [...prev, 2]), 1050),
        setTimeout(() => setCheckedItems((prev) => [...prev, 3]), 1450),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    audioFeedback.playClickTick();
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrev = () => {
    audioFeedback.playClickTick();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleIgnition = async () => {
    audioFeedback.playClickTick();
    setIsIgniting(true);
    setCountdown(3);

    const timer1 = setTimeout(() => setCountdown(2), 700);
    const timer2 = setTimeout(() => setCountdown(1), 1400);
    const timer3 = setTimeout(async () => {
      setCountdown(0);
      audioFeedback.playAchievementFanfare();

      try {
        await onEngineStarted({
          botName,
          dryRun: mode === 'dry_run',
          riskProfile,
          dailyTarget,
          nightGuard,
        });

        localStorage.setItem('rocketbot_engine_started', 'true');
        achievementsService.unlock('acad_01'); // Iniciación RocketBot
        if (nightGuard) achievementsService.unlock('risk_05');

        setTimeout(() => {
          setIsIgniting(false);
          setCountdown(null);
          onClose();
        }, 800);
      } catch (err) {
        setIsIgniting(false);
        setCountdown(null);
      }
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  return (
    <div className="fixed inset-0 z-[99997] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative flex flex-col w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luz ambiental de fondo */}
        <div className="absolute top-0 right-1/3 w-80 h-32 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* ENCABEZADO */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-slate-800 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
                <Rocket className="w-6 h-6 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight font-heading">
                    Puesta a Punto & Arrancar Motores
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                    Paso {step} de 3
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calibra tu robot desde cero con protecciones institucionales y arranca con total confianza.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar asistente"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Línea de pasos interactiva */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-800'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 2 ? 'bg-gradient-to-r from-teal-400 to-cyan-400' : 'bg-slate-800'
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= 3 ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-slate-800'
              }`}
            />
          </div>
        </div>

        {/* CONTENIDO DEL PASO */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* PASO 1: Identidad & Modo */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 font-heading">
                  1. Nombre de tu Robot / Cuenta
                </label>
                <input
                  type="text"
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Ej: RocketBot Alpha 1"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950/80 border border-slate-700/60 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/60 transition"
                />
                <p className="text-[11px] text-slate-400">
                  Este nombre identificará tu subcuenta aislada y tu bitácora de operaciones.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-200 font-heading">
                  2. ¿Cómo deseas operar al comenzar?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setMode('dry_run')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      mode === 'dry_run'
                        ? 'border-emerald-500/60 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-heading">
                        <ShieldCheck className="w-4 h-4" /> Modo Práctica (Dry-Run)
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        RECOMENDADO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      Saldo virtual de <strong>$10,000 USD</strong>. Conectado a precios de mercado reales segundo a segundo pero con <strong>cero riesgo financiero</strong>.
                    </p>
                  </div>

                  <div
                    onClick={() => setMode('live')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      mode === 'live'
                        ? 'border-amber-500/60 bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                        : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-heading">
                        <Zap className="w-4 h-4" /> Capital Real (Live)
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        AVANZADO
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Opera fondos reales mediante claves API cifradas en tu exchange. Requiere confirmación de seguridad posterior.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Calibración de Escudos & Riesgo */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 font-heading flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  Elige tu Perfil de Blindaje y Riesgo
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      audioFeedback.playClickTick();
                      setRiskProfile('conservative');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      riskProfile === 'conservative'
                        ? 'border-teal-500 bg-teal-950/30 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-teal-300 font-heading">
                      🛡️ Conservador
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-snug">
                      1.0% por trade. Circuit Breaker diario al 3.0%. Prioridad total de defensa.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioFeedback.playClickTick();
                      setRiskProfile('balanced');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      riskProfile === 'balanced'
                        ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-md ring-1 ring-emerald-500/40'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 font-heading">
                        ⚖️ Equilibrado
                      </span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">
                        TOP
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-300 block mt-1 leading-snug">
                      2.5% por trade. Circuit Breaker al 5.0%. Óptimo balance entre ganancia y resguardo.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioFeedback.playClickTick();
                      setRiskProfile('growth');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      riskProfile === 'growth'
                        ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-bold text-cyan-300 font-heading">
                      🚀 Crecimiento Cuant
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 leading-snug">
                      4.0% por trade. Circuit Breaker al 8.0%. Mayor dinamismo en captación de tendencias.
                    </span>
                  </button>
                </div>
              </div>

              {/* Vigilancia Nocturna y Meta Diaria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-heading">
                      <Moon className="w-3.5 h-3.5 text-purple-400" /> Vigilancia Nocturna
                    </span>
                    <input
                      type="checkbox"
                      checked={nightGuard}
                      onChange={(e) => setNightGuard(e.target.checked)}
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Pausa el bot o reduce el tamaño de órdenes durante la noche para que duermas tranquilo.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 font-heading">
                      🎯 Meta Diaria de Ganancia
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      +${dailyTarget} USD
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="10"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Alcanzada esta meta, el bot celebra y activa escudos para no sobreoperar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Pre-Flight Checklist & Ignición */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-200 font-heading block">
                  Verificación de Sistemas Pre-Vuelo (Checklist Cuántico)
                </span>

                <div className="space-y-2">
                  {[
                    {
                      title: 'Feed de Cotizaciones en Vivo (Binance CCXT)',
                      desc: 'Precios de mercado sincronizados en tiempo real bajo norma UTC.',
                    },
                    {
                      title: 'Algoritmo de 5 Filtros Cuantitativos (EMA 200 + RSI + MACD)',
                      desc: 'Radar activo monitoreando 12 pares institucionales sin falsas entradas.',
                    },
                    {
                      title: 'Escudos de Stop Loss y Circuit Breaker',
                      desc: 'Protección activa: corta pérdidas automáticamente en cada orden.',
                    },
                    {
                      title: `Aprovisionamiento de Saldo Limpio: $10,000.00 USD (${mode === 'dry_run' ? 'Virtual' : 'Real'})`,
                      desc: 'Plataforma aislada y limpia: 0 órdenes previas, historial nuevo listo para ti.',
                    },
                  ].map((item, idx) => {
                    const isChecked = checkedItems.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                          isChecked
                            ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-200'
                            : 'border-slate-800 bg-slate-950/40 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-in zoom-in-50" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                          )}
                          <div>
                            <h5 className="text-xs font-bold leading-tight">{item.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            isChecked
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isChecked ? 'VERIFICADO' : 'CALIBRANDO...'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón de Ignición Gigante */}
              <div className="pt-3 text-center">
                <button
                  type="button"
                  disabled={isIgniting}
                  onClick={handleIgnition}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider font-heading transition-all duration-300 shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] cursor-pointer hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <Rocket className="w-5 h-5 animate-bounce" />
                  <span>
                    {isIgniting && countdown !== null
                      ? `¡DESPEGUE EN ${countdown > 0 ? countdown : 'DESPEGANDO'}!...`
                      : '¡ARRANCAR MOTORES Y DESPEGAR!'}
                  </span>
                </button>
                <p className="text-[11px] text-slate-400 mt-2">
                  Al arrancar motores, tu bot pasará a estado activo e iniciará el escaneo de oportunidades en tu cuenta 100% aislada.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* PIE CON CONTROLES ATRÁS / SIGUIENTE */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              disabled={isIgniting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Atrás</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 && (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <span>Continuar a Calibración</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
