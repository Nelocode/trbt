"""
ForexMeanReversionV1 - Estrategia Cuantitativa de Reversión a la Media para Divisas (Forex)
(Diseñada para EUR/USD, GBP/USD y USD/JPY)
==========================================================================================
Filosofía de Inversión Institucional:
1. El mercado Forex es el mercado interbancario más grande y líquido del mundo.
   A diferencia de las criptomonedas, las divisas no tienen tendencias hiper-exponenciales sino
   que oscilan alrededor de valores de equilibrio fundamental (Purchasing Power Parity).
2. Esta estrategia explota desviaciones estadísticas extremas contra las Bandas de Bollinger
   y el oscilador RSI para capturar rebotes precisos hacia la media central (SMA 20).
3. Gestión de Riesgo para Divisas:
   - Rango de Stop Loss estrecho (-0.009 / 90 pips equivalentes en 5m/15m).
   - Toma de ganancias rápida en cuanto el precio toca la banda central o superior.
   - Filtro de spread y control de volatilidad mediante ATR relativo.
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


class ForexMeanReversionV1(IStrategy):
    INTERFACE_VERSION = 3

    timeframe = "5m"
    can_short: bool = True
    process_only_new_candles = True
    use_exit_signal = True
    exit_profit_only = False
    startup_candle_count: int = 150

    # Retornos de scalping y reversión rápida típicos de divisas
    minimal_roi = {
        "0": 0.016,    # 1.6% en pips
        "15": 0.011,   # 1.1%
        "45": 0.007,   # 0.7%
        "120": 0.004,  # 0.4%
    }

    stoploss = -0.012  # Stoploss ajustado a Forex
    trailing_stop = True
    trailing_stop_positive = 0.006
    trailing_stop_positive_offset = 0.010
    trailing_only_offset_is_reached = True

    # Parámetros optimizables para Forex
    buy_rsi_threshold = IntParameter(20, 36, default=28, space="buy", optimize=True)
    buy_bb_percent = DecimalParameter(0.01, 0.20, default=0.08, space="buy", optimize=True)
    sell_rsi_threshold = IntParameter(64, 80, default=72, space="sell", optimize=True)
    sell_bb_percent = DecimalParameter(0.80, 1.05, default=0.92, space="sell", optimize=True)

    plot_config = {
        "main_plot": {
            "bb_upper": {"color": "rgba(255, 255, 255, 0.4)", "type": "line"},
            "bb_middle": {"color": "#f59e0b", "type": "line"},
            "bb_lower": {"color": "rgba(255, 255, 255, 0.4)", "type": "line"},
            "ema_200": {"color": "#a855f7", "type": "line"},
        },
        "subplots": {
            "RSI": {"rsi": {"color": "#00dfdf"}},
        },
    }

    def populate_indicators(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        close = dataframe["close"]
        high = dataframe["high"]
        low = dataframe["low"]
        vol = dataframe["volume"]

        # Medias Exponenciales de Contexto
        dataframe["ema_21"] = close.ewm(span=21, adjust=False).mean()
        dataframe["ema_50"] = close.ewm(span=50, adjust=False).mean()
        dataframe["ema_200"] = close.ewm(span=200, adjust=False).mean()

        # Bandas de Bollinger (20 períodos, 2 desviaciones estándar)
        sma20 = close.rolling(window=20).mean()
        std20 = close.rolling(window=20).std()
        dataframe["bb_middle"] = sma20
        dataframe["bb_upper"] = sma20 + (std20 * 2.0)
        dataframe["bb_lower"] = sma20 - (std20 * 2.0)
        dataframe["bb_percent"] = (close - dataframe["bb_lower"]) / (dataframe["bb_upper"] - dataframe["bb_lower"] + 1e-9)

        # RSI de 14 períodos
        delta = close.diff()
        gain = delta.clip(lower=0).rolling(window=14).mean()
        loss = (-delta.clip(upper=0)).rolling(window=14).mean()
        rs = gain / (loss + 1e-9)
        dataframe["rsi"] = 100.0 - (100.0 / (1.0 + rs))

        # ATR para calibración de volatilidad
        tr1 = high - low
        tr2 = (high - close.shift(1)).abs()
        tr3 = (low - close.shift(1)).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        dataframe["atr"] = tr.rolling(window=14).mean()
        dataframe["atr_pct"] = (dataframe["atr"] / close) * 100.0

        # RVOL
        vol_ma = vol.rolling(window=20).mean()
        dataframe["rvol"] = vol / (vol_ma + 1e-9)

        # Concurvatura MACD
        ema12 = close.ewm(span=12, adjust=False).mean()
        ema26 = close.ewm(span=26, adjust=False).mean()
        dataframe["macd"] = ema12 - ema26
        dataframe["macdsignal"] = dataframe["macd"].ewm(span=9, adjust=False).mean()
        dataframe["macdhist"] = dataframe["macd"] - dataframe["macdsignal"]

        # Puntuación de Señal en Vivo
        rsi_val = dataframe["rsi"]
        bb_pct = dataframe["bb_percent"]
        rsi_buy_thr = float(getattr(self.buy_rsi_threshold, "value", 28))

        is_oversold = rsi_val <= rsi_buy_thr
        is_at_lower_bb = bb_pct <= 0.12

        score_l = (
            (is_oversold.astype(float) * 45.0) +
            (is_at_lower_bb.astype(float) * 35.0) +
            ((dataframe["macdhist"] > dataframe["macdhist"].shift(1)).astype(float) * 20.0)
        )
        dataframe["signal_score_long"] = score_l.clip(0, 100)
        dataframe["signal_score_short"] = (100.0 - score_l).clip(0, 100)

        return dataframe

    def populate_entry_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        rsi_thr = float(getattr(self.buy_rsi_threshold, "value", 28))
        bb_thr = float(getattr(self.buy_bb_percent, "value", 0.08))

        # Entrada Long: Sobreventa en la banda inferior
        conditions_long = (
            (dataframe["rsi"] <= rsi_thr) &
            (dataframe["bb_percent"] <= bb_thr) &
            (dataframe["macdhist"] > dataframe["macdhist"].shift(1))
        )
        dataframe.loc[conditions_long, "enter_long"] = 1
        dataframe.loc[conditions_long, "enter_tag"] = "Forex_MeanReversion_Long"

        # Entrada Short: Sobrecompra en la banda superior
        sell_rsi = float(getattr(self.sell_rsi_threshold, "value", 72))
        sell_bb = float(getattr(self.sell_bb_percent, "value", 0.92))
        conditions_short = (
            (dataframe["rsi"] >= sell_rsi) &
            (dataframe["bb_percent"] >= sell_bb) &
            (dataframe["macdhist"] < dataframe["macdhist"].shift(1))
        )
        dataframe.loc[conditions_short, "enter_short"] = 1
        dataframe.loc[conditions_short, "enter_tag"] = "Forex_MeanReversion_Short"

        return dataframe

    def populate_exit_trend(self, dataframe: DataFrame, metadata: dict) -> DataFrame:
        # Cierre Long al llegar a la media central (SMA 20) o banda superior
        exit_long = (dataframe["close"] >= dataframe["bb_middle"]) | (dataframe["rsi"] >= 65)
        dataframe.loc[exit_long, "exit_long"] = 1
        dataframe.loc[exit_long, "exit_tag"] = "Forex_Exit_MiddleBand_Reversion"

        # Cierre Short al llegar a la media central o banda inferior
        exit_short = (dataframe["close"] <= dataframe["bb_middle"]) | (dataframe["rsi"] <= 35)
        dataframe.loc[exit_short, "exit_short"] = 1
        dataframe.loc[exit_short, "exit_tag"] = "Forex_Exit_MiddleBand_Short"

        return dataframe
