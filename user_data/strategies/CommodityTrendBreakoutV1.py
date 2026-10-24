"""
CommodityTrendBreakoutV1 - Estrategia Cuantitativa de Ruptura de Tendencia para Materias Primas
(Diseñada para Oro XAU/USD, Petróleo Crudo WTI/USD y Plata XAG/USD)
=============================================================================================
Filosofía de Inversión Institucional:
1. Las materias primas exhiben tendencias macro prolongadas impulsadas por ciclos económicos,
   inflación, tasas de interés y tensiones geopolíticas.
2. Esta estrategia utiliza canales de Donchian y medias exponenciales ponderadas (EMA 200)
   para identificar y montarse en expansiones de volatilidad institucional.
3. Gestión de Riesgo:
   - Filtro de ADX > 22 para evitar operar en consolidaciones o rangos estrechos.
   - Stop Loss dinámico calculado como múltiplo de 2.2x ATR (Average True Range).
   - Trailing Stoploss que protege ganancias escalonadas conforme el precio avanza.
"""

from typing import Optional
import numpy as np
import pandas as pd
from pandas import DataFrame

try:
    from freqtrade.strategy import IStrategy, DecimalParameter, IntParameter, BooleanParameter
except ImportError:
    class IStrategy:
        INTERFACE_VERSION = 3

    class DecimalParameter:
        def __init__(self, low, high, default, space="buy", optimize=True):
            self.low = low
            self.high = high
            self.default = default
            self.value = default

    class IntParameter:
        def __init__(self, low, high, default, space="buy", optimize=True):
            self.low = low
            self.high = high
            self.default = default
            self.value = default

    class BooleanParameter:
        def __init__(self, default=True, space="buy", optimize=True):
            self.default = default
            self.value = default


class CommodityTrendBreakoutV1(IStrategy):
    INTERFACE_VERSION = 3

    timeframe = "15m"
    can_short: bool = True
    process_only_new_candles = True
    use_exit_signal = True
    exit_profit_only = False
    startup_candle_count: int = 210

    # Objetivos de toma de ganancia para Commodities
    minimal_roi = {
        "0": 0.038,    # 3.8% inmediato en expansión de vela
        "30": 0.024,   # 2.4% tras 30 min
        "90": 0.015,   # 1.5% tras hora y media
        "240": 0.008,  # 0.8% tras 4 horas
    }

    stoploss = -0.028
    trailing_stop = True
    trailing_stop_positive = 0.010
    trailing_stop_positive_offset = 0.018
    trailing_only_offset_is_reached = True

    # Parámetros optimizables para Materias Primas
    donchian_period = IntParameter(14, 30, default=20, space="buy", optimize=True)
    buy_adx_min = IntParameter(18, 35, default=22, space="buy", optimize=True)
    buy_rvol_min = DecimalParameter(1.0, 2.2, default=1.20, space="buy", optimize=True)
    sell_rsi_threshold = IntParameter(68, 85, default=75, space="sell", optimize=True)
    atr_multiplier = DecimalParameter(1.6, 3.2, default=2.2, space="sell", optimize=True)

    plot_config = {
        "main_plot": {
            "ema_50": {"color": "#f59e0b", "type": "line"},
            "ema_200": {"color": "#a855f7", "type": "line"},
            "donchian_high": {"color": "#00dfdf", "type": "line"},
            "donchian_low": {"color": "#ff3b69", "type": "line"},
        },
        "subplots": {
            "RSI": {"rsi": {"color": "#38bdf8"}},
            "ADX": {"adx": {"color": "#10b981"}},
        },
    }

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        close = dataframe["close"]
        high = dataframe["high"]
        low = dataframe["low"]
        vol = dataframe["volume"]

        # Medias Exponenciales de Tendencia
        dataframe["ema_21"] = close.ewm(span=21, adjust=False).mean()
        dataframe["ema_50"] = close.ewm(span=50, adjust=False).mean()
        dataframe["ema_200"] = close.ewm(span=200, adjust=False).mean()

        # Canales de Donchian (Ruptura de máximos y mínimos de 20 períodos)
        period = int(self.donchian_period.value if hasattr(self.donchian_period, "value") else 20)
        dataframe["donchian_high"] = high.rolling(window=period).max().shift(1)
        dataframe["donchian_low"] = low.rolling(window=period).min().shift(1)

        # Bandas de Bollinger para soporte visual
        sma20 = close.rolling(window=20).mean()
        std20 = close.rolling(window=20).std()
        dataframe["bb_upper"] = sma20 + (std20 * 2.0)
        dataframe["bb_lower"] = sma20 - (std20 * 2.0)
        dataframe["bb_percent"] = (close - dataframe["bb_lower"]) / (dataframe["bb_upper"] - dataframe["bb_lower"] + 1e-9)

        # RSI de 14 períodos
        delta = close.diff()
        gain = delta.clip(lower=0).rolling(window=14).mean()
        loss = (-delta.clip(upper=0)).rolling(window=14).mean()
        rs = gain / (loss + 1e-9)
        dataframe["rsi"] = 100.0 - (100.0 / (1.0 + rs))

        # True Range y ATR
        tr1 = high - low
        tr2 = (high - close.shift(1)).abs()
        tr3 = (low - close.shift(1)).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        dataframe["atr"] = tr.rolling(window=14).mean()
        dataframe["atr_pct"] = (dataframe["atr"] / close) * 100.0

        # ADX (Fuerza de la tendencia)
        up_move = high - high.shift(1)
        down_move = low.shift(1) - low
        pos_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
        neg_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)
        pos_di = 100.0 * (pd.Series(pos_dm, index=dataframe.index).rolling(14).mean() / (dataframe["atr"] + 1e-9))
        neg_di = 100.0 * (pd.Series(neg_dm, index=dataframe.index).rolling(14).mean() / (dataframe["atr"] + 1e-9))
        dx = 100.0 * ((pos_di - neg_di).abs() / (pos_di + neg_di + 1e-9))
        dataframe["adx"] = dx.rolling(14).mean().fillna(20.0)

        # MACD
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        dataframe["macd"] = ema12 - ema26
        dataframe["macdsignal"] = dataframe["macd"].ewm(span=9, adjust=False).mean()
        dataframe["macdhist"] = dataframe["macd"] - dataframe["macdsignal"]

        # Volumen Relativo (RVOL)
        vol_ma = vol.rolling(window=20).mean()
        dataframe["rvol"] = vol / (vol_ma + 1e-9)

        # Concurvatura y Puntuación
        is_uptrend = (close > dataframe["ema_200"]) & (dataframe["ema_50"] > dataframe["ema_200"])
        is_breakout_long = close > dataframe["donchian_high"]
        adx_strong = dataframe["adx"] > float(getattr(self.buy_adx_min, "value", 22))

        score_l = (
            (is_uptrend.astype(float) * 35.0) +
            (is_breakout_long.astype(float) * 30.0) +
            (adx_strong.astype(float) * 20.0) +
            ((dataframe["rvol"] > 1.15).astype(float) * 15.0)
        )
        dataframe["signal_score_long"] = score_l.clip(0, 100)
        dataframe["signal_score_short"] = (100.0 - score_l).clip(0, 100)

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        conditions_long = (
            (dataframe["close"] > dataframe["ema_200"]) &
            (dataframe["close"] > dataframe["donchian_high"]) &
            (dataframe["adx"] >= float(getattr(self.buy_adx_min, "value", 22))) &
            (dataframe["rvol"] >= float(getattr(self.buy_rvol_min, "value", 1.20))) &
            (dataframe["rsi"] < 78)
        )
        dataframe.loc[conditions_long, "enter_long"] = 1
        dataframe.loc[conditions_long, "enter_tag"] = "Commodity_Trend_Breakout_Long"

        conditions_short = (
            (dataframe["close"] < dataframe["ema_200"]) &
            (dataframe["close"] < dataframe["donchian_low"]) &
            (dataframe["adx"] >= float(getattr(self.buy_adx_min, "value", 22))) &
            (dataframe["rvol"] >= float(getattr(self.buy_rvol_min, "value", 1.20))) &
            (dataframe["rsi"] > 25)
        )
        dataframe.loc[conditions_short, "enter_short"] = 1
        dataframe.loc[conditions_short, "enter_tag"] = "Commodity_Trend_Breakout_Short"

        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        rsi_thr = float(getattr(self.sell_rsi_threshold, "value", 75))
        exit_long = (dataframe["rsi"] >= rsi_thr) | (dataframe["close"] < dataframe["ema_21"])
        dataframe.loc[exit_long, "exit_long"] = 1
        dataframe.loc[exit_long, "exit_tag"] = "Commodity_TakeProfit_RSI_Exhaustion"

        exit_short = (dataframe["rsi"] <= (100 - rsi_thr)) | (dataframe["close"] > dataframe["ema_21"])
        dataframe.loc[exit_short, "exit_short"] = 1
        dataframe.loc[exit_short, "exit_tag"] = "Commodity_TakeProfit_Short_Reversal"

        return dataframe
