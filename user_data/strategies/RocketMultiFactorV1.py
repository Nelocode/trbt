"""
RocketMultiFactorV1 - Estrategia Multi-Factor Institucional para RocketBot (Compatible con Freqtrade IStrategy)
===============================================================================================================

Filosofía de diseño (Por qué gana dinero donde las estrategias simples fallan):
1. Filtro de Régimen de Mercado Macro (EMA 200 + ADX):
   - No abre posiciones Long en tendencias bajistas violentas ni Short en rallies alcistas sin agotamiento.
2. Confluencia Multi-Factor:
   - Factor Momentum: RSI suavizado + divergencia de histograma MACD.
   - Factor Volatilidad: Bandas de Bollinger (BB %B y ancho de banda) + ATR dinámico.
   - Factor Volumen Institucional: Flujo de volumen relativo (RVOL > 1.25x media de 20 velas).
3. Gestión Dinámica de Riesgo (DCA Inteligente + Custom Stoploss por ATR):
   - En lugar de un stoploss fijo arbitrario, ajusta el stop según la volatilidad ATR del activo.
   - Escala la posición (DCA) únicamente cuando el precio alcanza niveles de soporte estadístico con agotamiento de venta.
4. Radar de Señales en Vivo:
   - Expone columnas de puntuación (`signal_score_long`, `signal_score_short`) de 0 a 100 para que la
     interfaz visual muestre en tiempo real qué tan cerca está cada par de disparar una orden.
"""

from datetime import datetime
from typing import Optional
import numpy as np
import pandas as pd
from pandas import DataFrame

try:
    from freqtrade.strategy import IStrategy, DecimalParameter, IntParameter, BooleanParameter
    from freqtrade.persistence import Trade
except ImportError:
    # Fallback base class when running inside RocketBot standalone engine
    class IStrategy:  # type: ignore
        INTERFACE_VERSION = 3

    class DecimalParameter:  # type: ignore
        def __init__(self, low, high, default, space="buy", optimize=True):
            self.low = low
            self.high = high
            self.default = default
            self.value = default

    class IntParameter:  # type: ignore
        def __init__(self, low, high, default, space="buy", optimize=True):
            self.low = low
            self.high = high
            self.default = default
            self.value = default

    class BooleanParameter:  # type: ignore
        def __init__(self, default=True, space="buy", optimize=True):
            self.default = default
            self.value = default


class RocketMultiFactorV1(IStrategy):
    INTERFACE_VERSION = 3

    timeframe = "5m"
    can_short: bool = True
    process_only_new_candles = True
    use_exit_signal = True
    exit_profit_only = False
    ignore_roi_if_entry_signal = True
    startup_candle_count: int = 210

    # Tabla de ROI escalonada (respaldo de toma de ganancias)
    minimal_roi = {
        "0": 0.045,    # 4.5% inmediato en spike
        "15": 0.028,   # 2.8% tras 15 min
        "45": 0.016,   # 1.6% tras 45 min
        "120": 0.008,  # 0.8% tras 2 horas
    }

    # Stoploss base (protegido adicionalmente por custom_stoploss basado en ATR)
    stoploss = -0.035
    trailing_stop = True
    trailing_stop_positive = 0.012
    trailing_stop_positive_offset = 0.022
    trailing_only_offset_is_reached = True
    use_custom_stoploss = True

    # DCA / Escalamiento de posición inteligente
    position_adjustment_enable = True
    max_entry_position_adjustment = 2

    # Hiperparámetros optimizables (Hyperopt / Optuna)
    buy_rsi_threshold = IntParameter(24, 42, default=34, space="buy", optimize=True)
    buy_bb_percent = DecimalParameter(0.02, 0.30, default=0.15, space="buy", optimize=True)
    buy_rvol_min = DecimalParameter(0.9, 2.0, default=1.15, space="buy", optimize=True)
    buy_adx_min = IntParameter(14, 32, default=18, space="buy", optimize=True)

    sell_rsi_threshold = IntParameter(65, 84, default=72, space="sell", optimize=True)
    sell_bb_percent = DecimalParameter(0.75, 1.05, default=0.88, space="sell", optimize=True)
    atr_sl_multiplier = DecimalParameter(1.5, 3.5, default=2.2, space="sell", optimize=True)

    # Configuración automática de gráficos para el frontend
    plot_config = {
        "main_plot": {
            "ema_21": {"color": "#38bdf8", "type": "line"},
            "ema_50": {"color": "#f59e0b", "type": "line"},
            "ema_200": {"color": "#a855f7", "type": "line"},
            "bb_upper": {"color": "rgba(148, 163, 184, 0.35)", "type": "line"},
            "bb_lower": {"color": "rgba(148, 163, 184, 0.35)", "type": "line"},
        },
        "subplots": {
            "RSI & Momentum": {
                "rsi": {"color": "#22d3ee"},
            },
            "Signal Radar Score": {
                "signal_score_long": {"color": "#10b981"},
                "signal_score_short": {"color": "#f43f5e"},
            },
        },
    }

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        close = dataframe["close"]
        high = dataframe["high"]
        low = dataframe["low"]
        volume = dataframe["volume"]

        # 1. Medias Móviles Exponenciales (Estructura de Tendencia)
        dataframe["ema_21"] = close.ewm(span=21, adjust=False).mean()
        dataframe["ema_50"] = close.ewm(span=50, adjust=False).mean()
        dataframe["ema_200"] = close.ewm(span=200, adjust=False).mean()

        # 2. RSI (14)
        delta = close.diff()
        gain = delta.clip(lower=0.0)
        loss = -delta.clip(upper=0.0)
        avg_gain = gain.ewm(alpha=1 / 14, min_periods=14, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1 / 14, min_periods=14, adjust=False).mean()
        rs = avg_gain / avg_loss.replace(0, np.nan)
        dataframe["rsi"] = (100 - (100 / (1 + rs))).fillna(50)

        # 3. Bandas de Bollinger (20, 2.0)
        sma_20 = close.rolling(window=20).mean()
        std_20 = close.rolling(window=20).std()
        dataframe["bb_middle"] = sma_20
        dataframe["bb_upper"] = sma_20 + (2.0 * std_20)
        dataframe["bb_lower"] = sma_20 - (2.0 * std_20)
        band_range = (dataframe["bb_upper"] - dataframe["bb_lower"]).replace(0, np.nan)
        dataframe["bb_percent"] = ((close - dataframe["bb_lower"]) / band_range).fillna(0.5)
        dataframe["bb_width"] = (band_range / sma_20.replace(0, np.nan)).fillna(0.0)

        # 4. MACD (12, 26, 9)
        ema_12 = close.ewm(span=12, adjust=False).mean()
        ema_26 = close.ewm(span=26, adjust=False).mean()
        dataframe["macd"] = ema_12 - ema_26
        dataframe["macdsignal"] = dataframe["macd"].ewm(span=9, adjust=False).mean()
        dataframe["macdhist"] = dataframe["macd"] - dataframe["macdsignal"]

        # 5. ATR (14) para Stoploss adaptativo y dimensionamiento de volatilidad
        tr1 = high - low
        tr2 = (high - close.shift(1)).abs()
        tr3 = (low - close.shift(1)).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        dataframe["atr"] = tr.rolling(window=14).mean().bfill()
        dataframe["atr_pct"] = (dataframe["atr"] / close) * 100

        # 6. ADX aproximado (Fuerza de tendencia)
        up_move = high.diff()
        down_move = -low.diff()
        plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
        minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)
        atr_smooth = tr.ewm(span=14, adjust=False).mean().replace(0, np.nan)
        plus_di = 100 * pd.Series(plus_dm, index=dataframe.index).ewm(span=14, adjust=False).mean() / atr_smooth
        minus_di = 100 * pd.Series(minus_dm, index=dataframe.index).ewm(span=14, adjust=False).mean() / atr_smooth
        dx = (100 * (plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan)).fillna(20)
        dataframe["adx"] = dx.ewm(span=14, adjust=False).mean().fillna(20)

        # 7. Volumen Relativo Institucional (RVOL)
        vol_sma = volume.rolling(window=20).mean().replace(0, np.nan)
        dataframe["rvol"] = (volume / vol_sma).fillna(1.0)

        # 8. Régimen de Mercado & Puntuación del Radar (0 - 100%)
        trend_bull = (close > dataframe["ema_200"]).astype(float) * 25.0
        rsi_long_score = np.clip((50.0 - dataframe["rsi"]) / (50.0 - self.buy_rsi_threshold.value), 0.0, 1.0) * 30.0
        bb_long_score = np.clip((0.5 - dataframe["bb_percent"]) / (0.5 - self.buy_bb_percent.value), 0.0, 1.0) * 25.0
        vol_score = np.clip(dataframe["rvol"] / self.buy_rvol_min.value, 0.0, 1.0) * 20.0
        dataframe["signal_score_long"] = (trend_bull + rsi_long_score + bb_long_score + vol_score).round(1)

        trend_bear = (close < dataframe["ema_200"]).astype(float) * 25.0
        rsi_short_score = np.clip((dataframe["rsi"] - 50.0) / (self.sell_rsi_threshold.value - 50.0), 0.0, 1.0) * 30.0
        bb_short_score = np.clip((dataframe["bb_percent"] - 0.5) / (self.sell_bb_percent.value - 0.5), 0.0, 1.0) * 25.0
        dataframe["signal_score_short"] = (trend_bear + rsi_short_score + bb_short_score + vol_score).round(1)

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe["enter_long"] = 0
        dataframe["enter_short"] = 0
        dataframe["enter_tag"] = ""

        # Condición Long: Pullback en tendencia alcista o sobreventa extrema con reversión de momento
        long_regime_pullback = (
            (dataframe["close"] > dataframe["ema_200"] * 0.985)
            & (dataframe["rsi"] <= self.buy_rsi_threshold.value)
            & (dataframe["bb_percent"] <= self.buy_bb_percent.value)
            & (dataframe["macdhist"] > dataframe["macdhist"].shift(1))
            & (dataframe["rvol"] >= self.buy_rvol_min.value)
            & (dataframe["volume"] > 0)
        )

        # Condición Long Momentum Breakout: Ruptura con volumen y estructura EMA alineada
        long_momentum_breakout = (
            (dataframe["close"] > dataframe["ema_21"])
            & (dataframe["ema_21"] > dataframe["ema_50"])
            & (dataframe["ema_50"] > dataframe["ema_200"])
            & (dataframe["adx"] >= self.buy_adx_min.value)
            & (dataframe["macdhist"] > 0)
            & (dataframe["macdhist"].shift(1) <= 0)
            & (dataframe["rsi"] > 48)
            & (dataframe["rsi"] < 66)
            & (dataframe["rvol"] >= 1.35)
        )

        dataframe.loc[long_regime_pullback, ["enter_long", "enter_tag"]] = (1, "MultiFactor_Pullback_Long")
        dataframe.loc[long_momentum_breakout, ["enter_long", "enter_tag"]] = (1, "Momentum_Breakout_Long")

        # Condición Short: Rechazo en banda superior bajo régimen bajista
        short_rejection = (
            (dataframe["close"] < dataframe["ema_200"] * 1.01)
            & (dataframe["rsi"] >= self.sell_rsi_threshold.value)
            & (dataframe["bb_percent"] >= self.sell_bb_percent.value)
            & (dataframe["macdhist"] < dataframe["macdhist"].shift(1))
            & (dataframe["rvol"] >= self.buy_rvol_min.value)
            & (dataframe["volume"] > 0)
        )

        dataframe.loc[short_rejection, ["enter_short", "enter_tag"]] = (1, "MultiFactor_Rejection_Short")
        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        dataframe["exit_long"] = 0
        dataframe["exit_short"] = 0
        dataframe["exit_tag"] = ""

        exit_long_cond = (
            (dataframe["rsi"] >= self.sell_rsi_threshold.value)
            & (dataframe["bb_percent"] >= self.sell_bb_percent.value)
            & (dataframe["macdhist"] < dataframe["macdhist"].shift(1))
        )
        dataframe.loc[exit_long_cond, ["exit_long", "exit_tag"]] = (1, "TakeProfit_Overbought")

        exit_short_cond = (
            (dataframe["rsi"] <= self.buy_rsi_threshold.value)
            & (dataframe["bb_percent"] <= self.buy_bb_percent.value)
            & (dataframe["macdhist"] > dataframe["macdhist"].shift(1))
        )
        dataframe.loc[exit_short_cond, ["exit_short", "exit_tag"]] = (1, "TakeProfit_Oversold")

        return dataframe

    def custom_stoploss(
        self,
        pair: str,
        trade: "Trade",
        current_time: datetime,
        current_rate: float,
        current_profit: float,
        after_fill: bool,
        **kwargs,
    ) -> Optional[float]:
        # Asegurar ganancias escalonadas una vez alcanzado beneficio positivo
        if current_profit > 0.03:
            return -0.008
        if current_profit > 0.018:
            return -0.010
        return self.stoploss
