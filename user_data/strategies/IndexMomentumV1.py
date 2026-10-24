"""
IndexMomentumV1 - Estrategia Cuantitativa de Momentum y Pullback para Índices Bursátiles
(Diseñada para S&P 500 [SPX500/USD] y Nasdaq 100 [NAS100/USD])
======================================================================================
Filosofía de Inversión Institucional:
1. Los índices bursátiles representan canastas de las empresas más productivas y capitalizadas.
   Históricamente tienen un sesgo alcista secular (upward drift) interrumpido por correcciones sanas.
2. Esta estrategia no intenta adivinar techos ni hacer contra-tendencia absurda; opera
   estrictamente a favor de la tendencia macro (Close > EMA 200) comprando pullbacks clave
   a la EMA 21 o EMA 50 cuando el RSI se enfría entre 42 y 54 puntos.
3. Para operaciones en corto (Short), solo entra cuando el índice pierde la EMA 200 y el histograma
   MACD confirma aceleración a la baja.
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


class IndexMomentumV1(IStrategy):
    INTERFACE_VERSION = 3

    timeframe = "15m"
    can_short: bool = True
    process_only_new_candles = True
    use_exit_signal = True
    exit_profit_only = False
    startup_candle_count: int = 210

    # Objetivos escalonados adaptados a la volatilidad de índices
    minimal_roi = {
        "0": 0.026,    # 2.6%
        "45": 0.018,   # 1.8%
        "120": 0.012,  # 1.2%
        "360": 0.006,  # 0.6%
    }

    stoploss = -0.022
    trailing_stop = True
    trailing_stop_positive = 0.009
    trailing_stop_positive_offset = 0.015
    trailing_only_offset_is_reached = True

    # Parámetros optimizables para Índices
    pullback_rsi_max = IntParameter(42, 56, default=49, space="buy", optimize=True)
    pullback_rsi_min = IntParameter(30, 44, default=38, space="buy", optimize=True)
    buy_rvol_min = DecimalParameter(1.0, 1.8, default=1.12, space="buy", optimize=True)
    sell_rsi_target = IntParameter(68, 82, default=74, space="sell", optimize=True)

    plot_config = {
        "main_plot": {
            "ema_21": {"color": "#38bdf8", "type": "line"},
            "ema_50": {"color": "#f59e0b", "type": "line"},
            "ema_200": {"color": "#a855f7", "type": "line"},
        },
        "subplots": {
            "RSI": {"rsi": {"color": "#10b981"}},
            "MACD": {"macd": {"color": "#00dfdf"}, "macdsignal": {"color": "#ff3b69"}},
        },
    }

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        close = dataframe["close"]
        high = dataframe["high"]
        low = dataframe["low"]
        vol = dataframe["volume"]

        # Ribbon de Medias Móviles Exponenciales
        dataframe["ema_21"] = close.ewm(span=21, adjust=False).mean()
        dataframe["ema_50"] = close.ewm(span=50, adjust=False).mean()
        dataframe["ema_200"] = close.ewm(span=200, adjust=False).mean()

        # Bollinger Bands
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

        # MACD
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        dataframe["macd"] = ema12 - ema26
        dataframe["macdsignal"] = dataframe["macd"].ewm(span=9, adjust=False).mean()
        dataframe["macdhist"] = dataframe["macd"] - dataframe["macdsignal"]

        # RVOL y ATR
        vol_ma = vol.rolling(window=20).mean()
        dataframe["rvol"] = vol / (vol_ma + 1e-9)

        tr1 = high - low
        tr2 = (high - close.shift(1)).abs()
        tr3 = (low - close.shift(1)).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        dataframe["atr"] = tr.rolling(window=14).mean()
        dataframe["atr_pct"] = (dataframe["atr"] / close) * 100.0

        # Concurvatura y Puntuación de Señal
        is_bull_regime = (close > dataframe["ema_200"]) & (dataframe["ema_50"] > dataframe["ema_200"])
        near_ema21 = (close >= dataframe["ema_50"]) & (close <= dataframe["ema_21"] * 1.008)
        rsi_healthy = (dataframe["rsi"] >= float(getattr(self.pullback_rsi_min, "value", 38))) & (dataframe["rsi"] <= float(getattr(self.pullback_rsi_max, "value", 49)))

        score_l = (
            (is_bull_regime.astype(float) * 40.0) +
            (near_ema21.astype(float) * 30.0) +
            (rsi_healthy.astype(float) * 20.0) +
            ((dataframe["macdhist"] > dataframe["macdhist"].shift(1)).astype(float) * 10.0)
        )
        dataframe["signal_score_long"] = score_l.clip(0, 100)
        dataframe["signal_score_short"] = (100.0 - score_l).clip(0, 100)

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        rsi_min = float(getattr(self.pullback_rsi_min, "value", 38))
        rsi_max = float(getattr(self.pullback_rsi_max, "value", 49))
        rvol_min = float(getattr(self.buy_rvol_min, "value", 1.12))

        # Entrada Long: Pullback en tendencia alcista a soporte de media móvil con enfriamiento de RSI
        conditions_long = (
            (dataframe["close"] > dataframe["ema_200"]) &
            (dataframe["ema_50"] > dataframe["ema_200"]) &
            (dataframe["close"] >= dataframe["ema_50"] * 0.998) &
            (dataframe["close"] <= dataframe["ema_21"] * 1.006) &
            (dataframe["rsi"] >= rsi_min) &
            (dataframe["rsi"] <= rsi_max) &
            (dataframe["rvol"] >= rvol_min)
        )
        dataframe.loc[conditions_long, "enter_long"] = 1
        dataframe.loc[conditions_long, "enter_tag"] = "Index_Pullback_Long"

        # Entrada Short: Quiebre de estructura bajista
        conditions_short = (
            (dataframe["close"] < dataframe["ema_200"]) &
            (dataframe["ema_50"] < dataframe["ema_200"]) &
            (dataframe["close"] <= dataframe["ema_50"] * 1.002) &
            (dataframe["close"] >= dataframe["ema_21"] * 0.994) &
            (dataframe["rsi"] <= 55) &
            (dataframe["rsi"] >= 40)
        )
        dataframe.loc[conditions_short, "enter_short"] = 1
        dataframe.loc[conditions_short, "enter_tag"] = "Index_Breakdown_Short"

        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        target_rsi = float(getattr(self.sell_rsi_target, "value", 74))
        exit_long = (dataframe["rsi"] >= target_rsi) | (dataframe["close"] < dataframe["ema_50"] * 0.995)
        dataframe.loc[exit_long, "exit_long"] = 1
        dataframe.loc[exit_long, "exit_tag"] = "Index_Exit_Overbought_or_SupportBreak"

        exit_short = (dataframe["rsi"] <= (100 - target_rsi)) | (dataframe["close"] > dataframe["ema_50"] * 1.005)
        dataframe.loc[exit_short, "exit_short"] = 1
        dataframe.loc[exit_short, "exit_tag"] = "Index_Exit_Oversold_or_ResistanceBreak"

        return dataframe
