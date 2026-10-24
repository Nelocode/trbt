import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface ConfirmLiveCapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountName: string;
}

export const ConfirmLiveCapitalModal: React.FC<ConfirmLiveCapitalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  accountName,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!acknowledged) return;
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#14161F] border-2 border-[#FF3B69]/60 rounded-2xl shadow-2xl p-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition p-1 rounded-lg hover:bg-white/[0.05]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-5 pb-4 border-b border-white/[0.08]">
          <div className="p-3 bg-[#FF3B69]/10 border border-[#FF3B69]/30 rounded-xl text-[#FF3B69] shrink-0">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#FF3B69] bg-[#FF3B69]/10 px-2 py-0.5 rounded">
              Advertencia Crítica de Riesgo Financiero
            </span>
            <h2 className="text-lg font-bold font-heading text-white mt-1">
              ¿Activar Operaciones con CAPITAL REAL?
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Estás a punto de desactivar el simulador Dry-Run en la cuenta{' '}
              <span className="text-white font-semibold underline">{accountName}</span>.
            </p>
          </div>
        </div>

        <div className="space-y-3 bg-[#FF3B69]/5 border border-[#FF3B69]/20 rounded-xl p-4 mb-5 text-xs text-white/80">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#FF3B69] shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Ejecución en Broker/Exchange:</strong> Las órdenes de compra y venta se enviarán directamente a la API de tu exchange con dinero real.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#FF3B69] shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Riesgo de Liquidación & PnL:</strong> Si el mercado se mueve contra tus posiciones, sufrirás pérdidas reales de capital en tu cuenta.
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#FF3B69] shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">Circuit Breakers:</strong> Asegúrate de tener configurado tu stop diario y tamaño de lote (Kelly Sizing) antes de confirmar.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-start gap-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-xl cursor-pointer hover:bg-white/[0.05] transition">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 text-[#FF3B69] focus:ring-0 focus:ring-offset-0 bg-transparent cursor-pointer"
            />
            <span className="text-xs text-white/90 select-none">
              Comprendo y acepto que el bot operará con capital real y asumo la responsabilidad por las operaciones generadas en el exchange.
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-xs rounded-xl transition cursor-pointer"
          >
            Cancelar (Mantener Modo Simulado)
          </button>
          <button
            type="button"
            disabled={!acknowledged}
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 bg-[#FF3B69] hover:bg-[#FF2557] disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold font-heading text-xs rounded-xl shadow-lg shadow-[#FF3B69]/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar y Activar LIVE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
