import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  LineSeries,
  HistogramSeries,
  createSeriesMarkers,
  ColorType,
  CrosshairMode,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { Layers, Eye, EyeOff, Target, ShieldAlert, TrendingUp } from 'lucide-react';
import { InfoTooltip } from './InfoTooltip';

export interface CandlePoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ema_21?: number | null;
  ema_50?: number | null;
  ema_200?: number | null;
  bb_upper?: number | null;
  bb_lower?: number | null;
  rsi?: number;
}

export interface ChartMarker {
  time: number;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle' | 'square';
  text: string;
}

export interface OpenTradeOverlay {
  trade_id: number;
  pair: string;
  side: 'long' | 'short';
  open_rate: number;
  current_rate: number;
  stoploss_rate: number;
  take_profit_rate: number;
  liquidation_rate: number;
  dca_next_rate: number;
  profit_pct: number;
  profit_abs: number;
}

interface TradingViewChartProps {
  pair: string;
  timeframe: string;
  strategyName: string;
  candles: CandlePoint[];
  markers: ChartMarker[];
  activeTrade?: OpenTradeOverlay;
  onTimeframeChange: (tf: string) => void;
  displayMode?: 'candles' | 'area';
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  pair,
  timeframe,
  strategyName,
  candles,
  markers,
  activeTrade,
  onTimeframeChange,
  displayMode = 'candles',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const ema21Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const ema200Ref = useRef<ISeriesApi<'Line'> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const markersPluginRef = useRef<any>(null);
  const priceLinesRef = useRef<any[]>([]);

  const [showEMAs, setShowEMAs] = useState(true);
  const [showBollinger, setShowBollinger] = useState(true);
  const [showTradeLines, setShowTradeLines] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<CandlePoint | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0A0D14' },
        textColor: '#8E95A2',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#0A7CFF',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0A7CFF',
        },
        horzLine: {
          color: '#0A7CFF',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#0A7CFF',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = displayMode === 'area'
      ? chart.addSeries(AreaSeries, {
          topColor: 'rgba(0, 223, 223, 0.35)',
          bottomColor: 'rgba(0, 223, 223, 0.01)',
          lineColor: '#00DFDF',
          lineWidth: 2,
        })
      : chart.addSeries(CandlestickSeries, {
          upColor: '#00DFDF',
          downColor: '#FF3B69',
          borderUpColor: '#00DFDF',
          borderDownColor: '#FF3B69',
          wickUpColor: '#00DFDF',
          wickDownColor: '#FF3B69',
        });

    try {
      markersPluginRef.current = createSeriesMarkers(candleSeries, []);
    } catch {
      markersPluginRef.current = null;
    }

    const ema21 = chart.addSeries(LineSeries, {
      color: '#0A7CFF',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const ema50 = chart.addSeries(LineSeries, {
      color: '#F5A623',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const ema200 = chart.addSeries(LineSeries, {
      color: '#925CFF',
      lineWidth: 2,
      lineStyle: LineStyle.Solid,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const bbUpper = chart.addSeries(LineSeries, {
      color: 'rgba(255, 255, 255, 0.22)',
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const bbLower = chart.addSeries(LineSeries, {
      color: 'rgba(255, 255, 255, 0.22)',
      lineWidth: 1,
      lineStyle: LineStyle.Dotted,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    ema21Ref.current = ema21;
    ema50Ref.current = ema50;
    ema200Ref.current = ema200;
    bbUpperRef.current = bbUpper;
    bbLowerRef.current = bbLower;
    volumeRef.current = volumeSeries;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries.length || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      try {
        chart.remove();
      } catch {}
      chartRef.current = null;
      candleSeriesRef.current = null;
      markersPluginRef.current = null;
      ema21Ref.current = null;
      ema50Ref.current = null;
      ema200Ref.current = null;
      bbUpperRef.current = null;
      bbLowerRef.current = null;
      volumeRef.current = null;
      priceLinesRef.current = [];
    };
  }, [displayMode]);

  useEffect(() => {
    if (!candleSeriesRef.current || !Array.isArray(candles) || candles.length === 0) return;

    try {
      // Filtrar y ordenar estrictamente por timestamp único para evitar errores en Lightweight Charts
      const timeMap = new Map<number, CandlePoint>();
      for (const c of candles) {
        if (
          c &&
          typeof c.time === 'number' &&
          !isNaN(c.time) &&
          typeof c.open === 'number' &&
          !isNaN(c.open) &&
          typeof c.close === 'number' &&
          !isNaN(c.close)
        ) {
          timeMap.set(c.time, c);
        }
      }
      const sortedCandles = Array.from(timeMap.values()).sort((a, b) => a.time - b.time);
      if (sortedCandles.length === 0) return;

      if (displayMode === 'area') {
        const areaData = sortedCandles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.close,
        }));
        candleSeriesRef.current.setData(areaData);
      } else {
        const formattedCandles = sortedCandles.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: typeof c.high === 'number' && !isNaN(c.high) ? c.high : Math.max(c.open, c.close),
          low: typeof c.low === 'number' && !isNaN(c.low) ? c.low : Math.min(c.open, c.close),
          close: c.close,
        }));
        candleSeriesRef.current.setData(formattedCandles);
      }
      setHoveredCandle(sortedCandles[sortedCandles.length - 1]);

      if (volumeRef.current) {
        volumeRef.current.setData(
          sortedCandles.map((c) => ({
            time: c.time as UTCTimestamp,
            value: typeof c.volume === 'number' && !isNaN(c.volume) ? c.volume : 0,
            color: c.close >= c.open ? 'rgba(0, 223, 223, 0.25)' : 'rgba(255, 59, 105, 0.25)',
          })),
        );
      }

      if (ema21Ref.current && ema50Ref.current && ema200Ref.current) {
        ema21Ref.current.setData(
          showEMAs
            ? sortedCandles
                .filter((c) => typeof c.ema_21 === 'number' && !isNaN(c.ema_21))
                .map((c) => ({ time: c.time as UTCTimestamp, value: c.ema_21! }))
            : [],
        );
        ema50Ref.current.setData(
          showEMAs
            ? sortedCandles
                .filter((c) => typeof c.ema_50 === 'number' && !isNaN(c.ema_50))
                .map((c) => ({ time: c.time as UTCTimestamp, value: c.ema_50! }))
            : [],
        );
        ema200Ref.current.setData(
          showEMAs
            ? sortedCandles
                .filter((c) => typeof c.ema_200 === 'number' && !isNaN(c.ema_200))
                .map((c) => ({ time: c.time as UTCTimestamp, value: c.ema_200! }))
            : [],
        );
      }

      if (bbUpperRef.current && bbLowerRef.current) {
        bbUpperRef.current.setData(
          showBollinger
            ? sortedCandles
                .filter((c) => typeof c.bb_upper === 'number' && !isNaN(c.bb_upper))
                .map((c) => ({ time: c.time as UTCTimestamp, value: c.bb_upper! }))
            : [],
        );
        bbLowerRef.current.setData(
          showBollinger
            ? sortedCandles
                .filter((c) => typeof c.bb_lower === 'number' && !isNaN(c.bb_lower))
                .map((c) => ({ time: c.time as UTCTimestamp, value: c.bb_lower! }))
            : [],
        );
      }

      if (markersPluginRef.current && Array.isArray(markers)) {
        try {
          const validMarkers = markers
            .filter((m) => m && typeof m.time === 'number' && timeMap.has(m.time))
            .map((m) => ({
              time: m.time as UTCTimestamp,
              position: m.position || 'aboveBar',
              color: m.color || '#00DFDF',
              shape: m.shape || 'circle',
              text: m.text || '',
            }));
          markersPluginRef.current.setMarkers(validMarkers);
        } catch {
          // ignore
        }
      }

      priceLinesRef.current.forEach((line) => {
        try {
          candleSeriesRef.current?.removePriceLine(line);
        } catch {
          // ignore
        }
      });
      priceLinesRef.current = [];

      if (
        activeTrade &&
        showTradeLines &&
        candleSeriesRef.current &&
        typeof activeTrade.open_rate === 'number' &&
        !isNaN(activeTrade.open_rate)
      ) {
        try {
          const entryLine = candleSeriesRef.current.createPriceLine({
            price: activeTrade.open_rate,
            color: '#0A7CFF',
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            axisLabelVisible: true,
            title: `ENTRY ${String(activeTrade.side || 'LONG').toUpperCase()} (${(activeTrade.profit_pct ?? 0) >= 0 ? '+' : ''}${activeTrade.profit_pct ?? 0}%)`,
          });
          const tpLine = candleSeriesRef.current.createPriceLine({
            price: activeTrade.take_profit_rate,
            color: '#00DFDF',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'TP (TARGET)',
          });
          const slLine = candleSeriesRef.current.createPriceLine({
            price: activeTrade.stoploss_rate,
            color: '#FF3B69',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'SL (ATR)',
          });
          const dcaLine = candleSeriesRef.current.createPriceLine({
            price: activeTrade.dca_next_rate,
            color: '#F5A623',
            lineWidth: 1,
            lineStyle: LineStyle.Dotted,
            axisLabelVisible: true,
            title: 'DCA RE-ENTRY',
          });
          priceLinesRef.current.push(entryLine, tpLine, slLine, dcaLine);
        } catch (err) {
          console.warn('Price line creation error:', err);
        }
      }
    } catch (err) {
      console.warn('TradingView data sync error:', err);
    }
  }, [candles, markers, activeTrade, showEMAs, showBollinger, showTradeLines]);

  const latest = hoveredCandle || candles[candles.length - 1];

  return (
    <div className="flex flex-col h-full figma-card overflow-hidden">
      {/* Barra superior con controles y descripciones explicativas */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#0D1017] border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold font-heading tracking-tight text-white">{pair}</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded-md bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
              {strategyName}
            </span>
            <InfoTooltip
              title="Gráfico Financiero Nativo"
              description="Visualiza las velas en tiempo real calculadas a partir del libro de órdenes y operaciones del exchange."
              impact="Permite inspeccionar la acción del precio y contrastarla con las decisiones automáticas que toma el bot."
            />
          </div>

          <div className="flex items-center bg-[#131722] p-0.5 rounded-lg border border-white/[0.08]">
            {['1m', '5m', '15m', '1h', '4h'].map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#0A7CFF] text-white shadow-sm shadow-[#0A7CFF]/30'
                    : 'text-[#8E95A2] hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {latest && (
            <div className="hidden xl:flex items-center gap-3 text-xs font-mono text-[#8E95A2] border-l border-white/[0.08] pl-3">
              <span>
                O <strong className="text-white">{latest.open}</strong>
              </span>
              <span>
                H <strong className="text-[#00DFDF]">{latest.high}</strong>
              </span>
              <span>
                L <strong className="text-[#FF3B69]">{latest.low}</strong>
              </span>
              <span>
                C <strong className="text-white">{latest.close}</strong>
              </span>
              {latest.rsi !== undefined && (
                <span>
                  RSI <strong className="text-[#0A7CFF]">{latest.rsi}</strong>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Controles de Capas con Tooltips Explicativos */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowEMAs(!showEMAs)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                showEMAs ? 'bg-[#0A7CFF]/20 text-[#0A7CFF] border border-[#0A7CFF]/40' : 'bg-white/[0.04] text-[#8E95A2] border border-white/[0.08]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>EMAs</span>
            </button>
            <InfoTooltip
              title="Medias Móviles Exponenciales (21, 50, 200)"
              description="La EMA 21 marca la velocidad rápida, la EMA 50 la tendencia intermedia y la EMA 200 el régimen macro."
              impact="Si el precio está por debajo de la EMA 200, el bot bloquea compras Long para evitar operar contra la marea del mercado."
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                showBollinger ? 'bg-[#925CFF]/20 text-[#925CFF] border border-[#925CFF]/40' : 'bg-white/[0.04] text-[#8E95A2] border border-white/[0.08]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bollinger</span>
            </button>
            <InfoTooltip
              title="Bandas de Bollinger (20, 2.0)"
              description="Miden la volatilidad estadística y determinan si el precio se ha estirado a extremos de sobrecompra o sobreventa."
              impact="Un %B < 0.15 indica rebote inminente para Long, mientras que %B > 0.85 indica agotamiento para toma de ganancias."
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowTradeLines(!showTradeLines)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                showTradeLines ? 'bg-[#00DFDF]/20 text-[#00DFDF] border border-[#00DFDF]/40' : 'bg-white/[0.04] text-[#8E95A2] border border-white/[0.08]'
              }`}
            >
              {showTradeLines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Líneas TP/SL/DCA</span>
            </button>
            <InfoTooltip
              title="Líneas de Ejecución en el Gráfico"
              description="Proyecta en el gráfico el precio exacto de Entrada (azul), Take Profit (cyan), Stoploss adaptativo (rojo) y Recompra DCA (amarillo)."
              impact="Permite auditar visualmente dónde cerrará la posición el bot antes de que el mercado alcance el nivel."
            />
          </div>
        </div>
      </div>

      {/* Leyenda y Niveles de Operación */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#080A10] border-b border-white/[0.05] text-[11px]">
        <div className="flex items-center gap-4 text-[#8E95A2]">
          <span className="flex items-center gap-1.5 text-[#0A7CFF]">
            <span className="w-2.5 h-0.5 bg-[#0A7CFF] inline-block"></span> EMA 21
          </span>
          <span className="flex items-center gap-1.5 text-[#F5A623]">
            <span className="w-2.5 h-0.5 bg-[#F5A623] inline-block"></span> EMA 50
          </span>
          <span className="flex items-center gap-1.5 text-[#925CFF]">
            <span className="w-2.5 h-0.5 bg-[#925CFF] inline-block"></span> EMA 200 (Filtro Macro)
          </span>
        </div>

        {activeTrade && (
          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1 text-[#00DFDF]">
              <Target className="w-3 h-3" /> TP: ${activeTrade.take_profit_rate}
            </span>
            <span className="flex items-center gap-1 text-[#FF3B69]">
              <ShieldAlert className="w-3 h-3" /> SL: ${activeTrade.stoploss_rate}
            </span>
            <span className="text-[#F5A623]">DCA: ${activeTrade.dca_next_rate}</span>
          </div>
        )}
      </div>

      <div ref={containerRef} className="w-full flex-1 min-h-[390px]" />
    </div>
  );
};
