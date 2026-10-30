import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  Zap,
  Target,
  Shield,
  TrendingUp,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export interface ForceNode {
  id: string;
  label: string;
  type: 'bull' | 'bear' | 'catalyst' | 'cluster' | 'support' | 'resist';
  weight: number; // 0.1 to 1.0
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulse?: boolean;
}

export interface ForceLink {
  source: string;
  target: string;
  strength: number;
  active: boolean;
}

interface ForceGraphProps {
  pair?: string;
  bullPct?: number;
  bearPct?: number;
  onNodeClick?: (node: ForceNode) => void;
}

export const MindforceGraph: React.FC<ForceGraphProps> = ({
  pair = 'BTC/USDT',
  bullPct = 68,
  bearPct = 32,
  onNodeClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<ForceNode | null>(null);
  const [clusterCount, setClusterCount] = useState(18);

  const nodesRef = useRef<ForceNode[]>([
    { id: '1', label: 'OB IMBALANCE', type: 'bull', weight: 0.9, x: 120, y: 110, vx: 0.2, vy: -0.1, pulse: true },
    { id: '2', label: 'CVD DIVERGENCE', type: 'bull', weight: 0.85, x: 200, y: 80, vx: -0.15, vy: 0.2 },
    { id: '3', label: 'ETF INFLOW', type: 'bull', weight: 0.75, x: 260, y: 140, vx: 0.1, vy: 0.15 },
    { id: '4', label: 'LIQUIDITY POOL', type: 'cluster', weight: 1.0, x: 380, y: 130, vx: -0.05, vy: -0.1, pulse: true },
    { id: '5', label: 'RESIST $78.4K', type: 'resist', weight: 0.8, x: 470, y: 90, vx: 0.15, vy: -0.2 },
    { id: '6', label: 'FUNDING SPIKE', type: 'bear', weight: 0.65, x: 530, y: 160, vx: -0.2, vy: 0.1 },
    { id: '7', label: 'DELTA FLIP', type: 'catalyst', weight: 0.95, x: 310, y: 190, vx: 0.05, vy: -0.15, pulse: true },
    { id: '8', label: 'SUPP $77.8K', type: 'support', weight: 0.7, x: 160, y: 220, vx: -0.1, vy: -0.1 },
    { id: '9', label: 'VOL CLUSTER', type: 'cluster', weight: 0.8, x: 420, y: 220, vx: 0.2, vy: 0.05 },
    { id: '10', label: 'LONG RATIO', type: 'bull', weight: 0.6, x: 240, y: 250, vx: 0.1, vy: 0.2 },
    { id: '11', label: 'AGGRESSIVE SELL', type: 'bear', weight: 0.55, x: 490, y: 240, vx: -0.15, vy: -0.1 },
    { id: '12', label: 'MACRO CPI', type: 'catalyst', weight: 0.7, x: 340, y: 70, vx: -0.1, vy: 0.1 },
  ]);

  const linksRef = useRef<ForceLink[]>([
    { source: '1', target: '2', strength: 0.8, active: true },
    { source: '2', target: '7', strength: 0.9, active: true },
    { source: '3', target: '4', strength: 0.7, active: true },
    { source: '4', target: '5', strength: 0.85, active: false },
    { source: '7', target: '4', strength: 0.95, active: true },
    { source: '7', target: '9', strength: 0.75, active: true },
    { source: '8', target: '1', strength: 0.6, active: true },
    { source: '8', target: '10', strength: 0.7, active: true },
    { source: '10', target: '7', strength: 0.8, active: true },
    { source: '9', target: '11', strength: 0.65, active: false },
    { source: '5', target: '6', strength: 0.7, active: false },
    { source: '12', target: '4', strength: 0.85, active: true },
    { source: '12', target: '2', strength: 0.6, active: true },
  ]);

  // Loop de renderizado del grafo interactivo con Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.02;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Fondo cibernético tenue
      ctx.fillStyle = '#05070D';
      ctx.fillRect(0, 0, width, height);

      // Cuadrícula sutil
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const grid = 30;
      for (let x = 0; x < width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      const nodes = nodesRef.current;
      const links = linksRef.current;

      // Actualizar física suave de los nodos
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        // Rebotes suaves en bordes
        if (n.x < 40 || n.x > width - 40) n.vx *= -1;
        if (n.y < 35 || n.y > height - 35) n.vy *= -1;
      });

      // Dibujar Aristas / Conexiones
      links.forEach((link) => {
        const s = nodes.find((n) => n.id === link.source);
        const tgt = nodes.find((n) => n.id === link.target);
        if (!s || !tgt) return;

        const isMagentaActive = link.active;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tgt.x, tgt.y);

        if (isMagentaActive) {
          ctx.strokeStyle = 'rgba(255, 46, 147, 0.35)';
          ctx.lineWidth = 1.4;
        } else {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 0.8;
        }
        ctx.stroke();

        // Partícula viajando sobre aristas activas (flujo de confluencia)
        if (isMagentaActive) {
          const progress = (t * 0.8 + parseInt(link.source) * 0.2) % 1;
          const px = s.x + (tgt.x - s.x) * progress;
          const py = s.y + (tgt.y - s.y) * progress;

          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#FF2E93';
          ctx.shadowColor = '#FF2E93';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // Dibujar Nodos
      nodes.forEach((n) => {
        let color = '#00FFA3'; // Bull esmeralda
        let glow = '#00FFA3';
        if (n.type === 'bear' || n.type === 'resist') {
          color = '#FF3B69'; // Bear rojo/coral
          glow = '#FF3B69';
        } else if (n.type === 'catalyst') {
          color = '#FFB800'; // Catalizador dorado
          glow = '#FFB800';
        } else if (n.type === 'cluster') {
          color = '#FF2E93'; // Cluster magenta HFT
          glow = '#FF2E93';
        }

        const radius = 6 + n.weight * 6;
        const pulseAmt = n.pulse ? Math.sin(t * 3 + parseInt(n.id)) * 3 : 0;

        // Halo de brillo
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 4 + pulseAmt, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.15;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Centro del nodo
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowColor = glow;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Borde interior blanco
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        // Texto de etiqueta pequeña estilo terminal
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y + radius + 11);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full rounded-2xl bg-[#05070D] border border-white/[0.08] overflow-hidden shadow-2xl flex flex-col">
      {/* Header del Grafo */}
      <div className="px-4 py-2.5 bg-black/60 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF2E93] animate-pulse" />
          <span className="font-mono text-xs font-bold text-white tracking-wide">
            MINDFORCE · {pair} CONFLUENCE GRAPH
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF2E93]/20 text-[#FF2E93] border border-[#FF2E93]/40">
            INFERENCIA CUÁNTICA
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#FF3B69]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B69]" />
            <span>BEAR {bearPct}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#00FFA3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            <span>BULL {bullPct}%</span>
          </div>
          <span className="text-white/40">|</span>
          <span className="text-white/60">CLUSTERS: 12 / 24</span>
        </div>
      </div>

      {/* Canvas Interactivo */}
      <div className="relative w-full h-64 sm:h-72">
        <canvas
          ref={canvasRef}
          width={640}
          height={290}
          className="w-full h-full block cursor-crosshair"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = ((e.clientX - rect.left) / rect.width) * 640;
            const clickY = ((e.clientY - rect.top) / rect.height) * 290;

            const found = nodesRef.current.find((n) => {
              const dx = n.x - clickX;
              const dy = n.y - clickY;
              return Math.sqrt(dx * dx + dy * dy) < 22;
            });

            setSelectedNode(found || null);
            if (found && onNodeClick) onNodeClick(found);
          }}
        />

        {/* Overlay flotante de nodo seleccionado */}
        {selectedNode && (
          <div className="absolute top-3 left-3 p-2.5 rounded-xl bg-black/85 border border-[#FF2E93]/40 backdrop-blur-md text-xs font-mono text-white space-y-1 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold text-[#FF2E93]">{selectedNode.label}</span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-white/40 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="text-[10px] text-white/60">
              Tipo: <strong className="text-white uppercase">{selectedNode.type}</strong> · Peso:{' '}
              <strong className="text-[#00FFA3]">{(selectedNode.weight * 100).toFixed(0)}%</strong>
            </div>
          </div>
        )}

        {/* Leyenda rápida inferior */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-mono text-white/60 bg-black/70 px-2.5 py-1 rounded-lg border border-white/5 backdrop-blur-sm">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00FFA3]" /> BULL
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF3B69]" /> BEAR
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FF2E93]" /> CLUSTER
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#FFB800]" /> CATALIZADOR
          </span>
        </div>
      </div>
    </div>
  );
};
