import React, { useEffect, useState } from 'react';
import { X, RefreshCw, AlertTriangle, ShieldCheck, Layers } from 'lucide-react';

interface CorrelationMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

export const CorrelationMatrixModal: React.FC<CorrelationMatrixModalProps> = ({
  isOpen,
  onClose,
  apiBase,
}) => {
  const [data, setData] = useState<{
    pairs: string[];
    matrix: Array<{ pair: string; correlations: number[] }>;
    high_correlation_pairs: Array<{
      pair_a: string;
      pair_b: string;
      correlation: number;
      risk_warning: string;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMatrix = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/v1/analytics/correlation-matrix`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMatrix();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getColor = (val: number) => {
    if (val === 1) return 'bg-[#0A7CFF]/30 text-white font-bold';
    if (val >= 0.75) return 'bg-[#FF3B69]/30 text-[#FF3B69] font-bold';
    if (val >= 0.4) return 'bg-[#FFB800]/20 text-[#FFB800]';
    if (val <= -0.4) return 'bg-[#00DFDF]/20 text-[#00DFDF]';
    return 'bg-white/[0.03] text-[#8E95A2]';
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0C101A] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#080A10]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                <span>Matriz de Correlación Cruzada Rolling (12 Activos)</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30">
                  30 Periodos
                </span>
              </h2>
              <p className="text-xs text-[#8E95A2]">
                Monitorea el riesgo de covarianza para evitar abrir posiciones en activos altamente correlacionados (&gt;0.75).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMatrix}
              disabled={isLoading}
              className="p-2 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
              title="Recalcular matriz"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00DFDF]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Alertas de alta correlación peligrosa */}
          {data && data.high_correlation_pairs && data.high_correlation_pairs.length > 0 && (
            <div className="p-3.5 rounded-xl bg-[#FF3B69]/10 border border-[#FF3B69]/30 text-xs text-[#FF3B69] space-y-2">
              <div className="font-bold flex items-center gap-1.5 font-heading">
                <AlertTriangle className="w-4 h-4 text-[#FF3B69]" />
                <span>Pares con Correlación Crítica Detectada ({data.high_correlation_pairs.length})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                {data.high_correlation_pairs.map((hc, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-black/40 border border-[#FF3B69]/20 flex items-center justify-between">
                    <span>{hc.pair_a} ↔ {hc.pair_b}</span>
                    <span className="font-bold text-[#FF3B69]">r = {hc.correlation} ({hc.risk_warning})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla de Matriz */}
          {data && data.pairs && (
            <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
              <table className="w-full text-center border-collapse text-xs font-mono">
                <thead className="bg-[#080A10] text-[#8E95A2]">
                  <tr>
                    <th className="p-2.5 text-left font-sans font-semibold">Par</th>
                    {data.pairs.map((p) => (
                      <th key={p} className="p-2 text-[10px] font-bold text-white whitespace-nowrap">
                        {p.split('/')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {data.matrix.map((row) => (
                    <tr key={row.pair} className="hover:bg-white/[0.02]">
                      <td className="p-2.5 text-left font-bold text-white text-[11px] whitespace-nowrap bg-[#080A10]/50">
                        {row.pair}
                      </td>
                      {row.correlations.map((val, idx) => (
                        <td key={idx} className={`p-2 text-[10px] ${getColor(val)}`}>
                          {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Leyenda explicativa */}
          <div className="flex items-center justify-between text-[11px] text-[#8E95A2] pt-2 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#FF3B69]/30 border border-[#FF3B69]/50" />
              <span>&gt; +0.75: Alta Correlación (Riesgo duplicado)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#00DFDF]/20 border border-[#00DFDF]/40" />
              <span>&lt; -0.40: Correlación Inversa (Cobertura natural)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-white/[0.05] border border-white/[0.1]" />
              <span>-0.30 a +0.30: Descorrelacionado (Diversificación ideal)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
