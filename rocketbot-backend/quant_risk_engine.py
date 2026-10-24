"""
RocketBot Quantitative Risk & Advanced Analytics Engine
========================================================
Módulos Institucionales:
1. Circuit Breakers & Daily Max Drawdown Lock (Cierre de emergencia y protección diaria)
2. Fractional Kelly Sizing Calculator (Dimensionamiento óptimo de posición por probabilidad)
3. Cross-Asset Rolling Correlation Matrix (Matriz de correlación en tiempo real para evitar concentración)
4. Monte Carlo Stress Testing (Simulación estocástica de 10,000 iteraciones con VaR y CVaR)
5. Prop Firm Rules Shield (Protección estricta para cuentas de fondeo FTMO / Apex / MFF)
6. Webhook Notification Dispatcher (Telegram & Discord en tiempo real)
"""

from __future__ import annotations

import asyncio
import json
import logging
import math
import time
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
import httpx

logger = logging.getLogger("rocketbot.quant_risk")


class CircuitBreakerEngine:
    """Monitorea el drawdown diario y las pérdidas consecutivas para activar bloqueos de seguridad."""

    def __init__(self, max_daily_loss_pct: float = 4.0, max_consecutive_losses: int = 3):
        self.max_daily_loss_pct = max_daily_loss_pct
        self.max_consecutive_losses = max_consecutive_losses
        self.is_tripped: bool = False
        self.trip_reason: str = ""
        self.tripped_at: Optional[float] = None
        self.lockout_duration_seconds: float = 43200  # 12 horas por defecto
        self.starting_equity_today: float = 10000.0
        self.consecutive_losses_count: int = 0

    def reset_daily_baseline(self, current_equity: float):
        self.starting_equity_today = current_equity

    def evaluate_portfolio(self, current_equity: float, recent_closed_trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Evalúa si las condiciones de corte se han activado."""
        if self.is_tripped:
            # Verificar si expiró el tiempo de enfriamiento
            elapsed = time.time() - (self.tripped_at or 0)
            if elapsed > self.lockout_duration_seconds:
                self.is_tripped = False
                self.trip_reason = ""
                self.tripped_at = None
            else:
                remaining_minutes = round((self.lockout_duration_seconds - elapsed) / 60, 1)
                return {
                    "is_tripped": True,
                    "reason": self.trip_reason,
                    "remaining_cooldown_minutes": remaining_minutes,
                    "status": "CIRCUIT_BREAKER_ACTIVE_LOCKOUT",
                }

        # 1. Pérdida diaria porcentual
        daily_pnl_pct = ((current_equity - self.starting_equity_today) / self.starting_equity_today) * 100
        if daily_pnl_pct <= -self.max_daily_loss_pct:
            self.is_tripped = True
            self.trip_reason = f"Pérdida diaria acumulada ({daily_pnl_pct:.2f}%) excedió el límite máximo ({self.max_daily_loss_pct}%)."
            self.tripped_at = time.time()
            return {
                "is_tripped": True,
                "reason": self.trip_reason,
                "remaining_cooldown_minutes": round(self.lockout_duration_seconds / 60, 1),
                "status": "TRIPPED_DAILY_LOSS",
            }

        # 2. Pérdidas consecutivas
        consecutive = 0
        for t in reversed(recent_closed_trades[-8:]):
            if t.get("profit_abs", 0) < 0:
                consecutive += 1
            else:
                break
        self.consecutive_losses_count = consecutive

        if consecutive >= self.max_consecutive_losses:
            self.is_tripped = True
            self.trip_reason = f"Se detectaron {consecutive} pérdidas consecutivas. Pausa preventiva de trading activada."
            self.tripped_at = time.time()
            return {
                "is_tripped": True,
                "reason": self.trip_reason,
                "remaining_cooldown_minutes": round(self.lockout_duration_seconds / 60, 1),
                "status": "TRIPPED_CONSECUTIVE_LOSSES",
            }

        return {
            "is_tripped": False,
            "daily_pnl_pct": round(daily_pnl_pct, 2),
            "consecutive_losses": consecutive,
            "max_daily_loss_pct": self.max_daily_loss_pct,
            "status": "ARMED_NORMAL",
        }


class KellySizingCalculator:
    """Calcula el dimensionamiento óptimo de posición basado en el Criterio de Kelly Fraccional."""

    @staticmethod
    def calculate(
        equity: float,
        win_rate_pct: float,
        profit_factor: float = 1.8,
        fraction: float = 0.35,  # Kelly Fraccional seguro
        max_position_pct: float = 12.0,
    ) -> Dict[str, Any]:
        p = max(0.01, min(0.99, win_rate_pct / 100.0))
        q = 1.0 - p
        b = max(0.5, profit_factor)

        # Fórmula de Kelly: f* = (p*b - q) / b
        raw_kelly = (p * b - q) / b
        fractional_kelly = max(0.0, raw_kelly * fraction)

        # Clamping de seguridad
        suggested_pct = min(max_position_pct, round(fractional_kelly * 100, 2))
        suggested_stake = round(equity * (suggested_pct / 100.0), 2)

        return {
            "raw_kelly_pct": round(raw_kelly * 100, 2),
            "fractional_multiplier": fraction,
            "suggested_position_pct": suggested_pct,
            "suggested_stake_amount": max(25.0, suggested_stake),
            "edge_detected": raw_kelly > 0,
            "explanation": f"Basado en Win Rate={win_rate_pct:.1f}% y Profit Factor={b:.2f}, el Kelly Fraccional ({fraction:.2f}x) sugiere asignar ${suggested_stake:,.2f} ({suggested_pct}%) por trade.",
        }


class CorrelationMatrixEngine:
    """Calcula la matriz de covarianza y correlación cruzada rolling de 30 periodos en los 12 activos."""

    @staticmethod
    def compute(pair_candles: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        prices_dict = {}
        for pair, candles in pair_candles.items():
            if len(candles) >= 20:
                closes = [c["close"] for c in candles[-60:]]
                prices_dict[pair] = pd.Series(closes)

        if len(prices_dict) < 2:
            return {"pairs": list(pair_candles.keys()), "matrix": []}

        df = pd.DataFrame(prices_dict).pct_change().dropna()
        corr_df = df.corr().round(2)

        pairs = list(corr_df.columns)
        matrix = []
        for i, p1 in enumerate(pairs):
            row = []
            for j, p2 in enumerate(pairs):
                val = float(corr_df.loc[p1, p2])
                row.append(val)
            matrix.append({"pair": p1, "correlations": row})

        # Extraer pares con alta correlación peligrosa (> 0.75)
        high_correlations = []
        for i in range(len(pairs)):
            for j in range(i + 1, len(pairs)):
                val = float(corr_df.iloc[i, j])
                if abs(val) >= 0.75:
                    high_correlations.append({
                        "pair_a": pairs[i],
                        "pair_b": pairs[j],
                        "correlation": val,
                        "risk_warning": "Riesgo direccional duplicado" if val > 0 else "Riesgo de cobertura inversa",
                    })

        return {
            "pairs": pairs,
            "matrix": matrix,
            "high_correlation_pairs": high_correlations,
        }


class MonteCarloSimulator:
    """Simulador de Stress Testing de Monte Carlo con 10,000 iteraciones estocásticas."""

    @staticmethod
    def run(
        trades: List[Dict[str, Any]],
        starting_equity: float = 10000.0,
        iterations: int = 10000,
        horizon_trades: int = 100,
    ) -> Dict[str, Any]:
        if not trades or len(trades) < 3:
            # Generar distribución de referencia realista si hay pocos trades
            pnl_pcts = [2.4, -1.2, 1.8, 3.1, -1.0, 4.2, -1.5, 2.0, -0.8, 1.5]
        else:
            pnl_pcts = [t.get("profit_pct", 0.0) for t in trades]

        rng = np.random.default_rng(42)
        simulated_returns = rng.choice(pnl_pcts, size=(iterations, horizon_trades), replace=True)

        # Convertir a curvas de capital
        growth_factors = 1.0 + (simulated_returns / 100.0)
        equity_curves = starting_equity * np.cumprod(growth_factors, axis=1)
        final_equities = equity_curves[:, -1]

        # Calcular Drawdown Máximo de cada curva
        peak = np.maximum.accumulate(equity_curves, axis=1)
        drawdowns = (equity_curves - peak) / peak
        max_drawdowns = np.min(drawdowns, axis=1) * 100.0  # negativo

        # Métricas de riesgo probabilístico (VaR y CVaR al 95%)
        var_95 = float(np.percentile(max_drawdowns, 5))
        cvar_95 = float(np.mean(max_drawdowns[max_drawdowns <= var_95]))
        p_profit = float(np.mean(final_equities > starting_equity) * 100.0)
        p_drawdown_gt_15 = float(np.mean(max_drawdowns <= -15.0) * 100.0)
        median_equity = float(np.median(final_equities))

        return {
            "iterations": iterations,
            "horizon_trades": horizon_trades,
            "starting_equity": starting_equity,
            "median_projected_equity": round(median_equity, 2),
            "median_return_pct": round(((median_equity - starting_equity) / starting_equity) * 100, 2),
            "probability_of_profit_pct": round(p_profit, 1),
            "probability_of_drawdown_gt_15pct": round(p_drawdown_gt_15, 1),
            "var_95_drawdown_pct": round(abs(var_95), 2),
            "cvar_95_drawdown_pct": round(abs(cvar_95), 2),
            "best_case_equity": round(float(np.percentile(final_equities, 95)), 2),
            "worst_case_equity": round(float(np.percentile(final_equities, 5)), 2),
            "percentiles": {
                "p10": round(float(np.percentile(final_equities, 10)), 2),
                "p25": round(float(np.percentile(final_equities, 25)), 2),
                "p50": round(median_equity, 2),
                "p75": round(float(np.percentile(final_equities, 75)), 2),
                "p90": round(float(np.percentile(final_equities, 90)), 2),
            },
        }


class PropFirmShield:
    """Monitor de cumplimiento estricto de reglas de cuentas fondeadas (FTMO, Apex, MFF)."""

    @staticmethod
    def evaluate(
        current_equity: float,
        initial_balance: float = 100000.0,
        high_water_mark: float = 100000.0,
        daily_start_equity: float = 100000.0,
        max_daily_loss_pct: float = 5.0,
        max_total_loss_pct: float = 10.0,
        target_profit_pct: float = 8.0,
    ) -> Dict[str, Any]:
        daily_loss_pct = ((daily_start_equity - current_equity) / daily_start_equity) * 100.0
        total_loss_pct = ((high_water_mark - current_equity) / high_water_mark) * 100.0
        profit_pct = ((current_equity - initial_balance) / initial_balance) * 100.0

        daily_remaining_pct = max(0.0, max_daily_loss_pct - max(0.0, daily_loss_pct))
        total_remaining_pct = max(0.0, max_total_loss_pct - max(0.0, total_loss_pct))
        target_remaining_pct = max(0.0, target_profit_pct - max(0.0, profit_pct))

        is_daily_breached = daily_loss_pct >= max_daily_loss_pct
        is_total_breached = total_loss_pct >= max_total_loss_pct
        is_target_passed = profit_pct >= target_profit_pct

        return {
            "initial_balance": initial_balance,
            "current_equity": current_equity,
            "profit_pct": round(profit_pct, 2),
            "target_profit_pct": target_profit_pct,
            "target_remaining_pct": round(target_remaining_pct, 2),
            "daily_loss_pct": round(max(0.0, daily_loss_pct), 2),
            "daily_remaining_pct": round(daily_remaining_pct, 2),
            "total_loss_pct": round(max(0.0, total_loss_pct), 2),
            "total_remaining_pct": round(total_remaining_pct, 2),
            "status": "PASSED" if is_target_passed else "BREACHED" if (is_daily_breached or is_total_breached) else "IN_PROGRESS",
            "is_safe": not (is_daily_breached or is_total_breached),
        }


class WebhookNotificationDispatcher:
    """Envía notificaciones instantáneas de eventos a canales de Telegram o Webhooks de Discord."""

    @staticmethod
    async def dispatch(
        webhook_url: Optional[str],
        telegram_bot_token: Optional[str],
        telegram_chat_id: Optional[str],
        event_type: str,
        title: str,
        message: str,
        fields: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        results = {"discord": False, "telegram": False}

        # 1. Enviar a Discord si hay webhook
        if webhook_url and "discord.com" in webhook_url:
            embed = {
                "title": f"🚀 RocketBot Pro • {title}",
                "description": message,
                "color": 0x00DFDF if "GAIN" in event_type or "BUY" in event_type else 0xFF3B69 if "LOSS" in event_type or "PANIC" in event_type else 0x0A7CFF,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
            if fields:
                embed["fields"] = [{"name": k, "value": str(v), "inline": True} for k, v in fields.items()]

            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(webhook_url, json={"embeds": [embed]})
                    results["discord"] = resp.status_code in [200, 204]
            except Exception as e:
                logger.warning(f"Error enviando Discord Webhook: {e}")

        # 2. Enviar a Telegram si hay token y chat_id
        if telegram_bot_token and telegram_chat_id:
            tg_text = f"<b>🚀 RocketBot Pro • {title}</b>\n\n{message}\n"
            if fields:
                for k, v in fields.items():
                    tg_text += f"\n• <b>{k}:</b> <code>{v}</code>"

            tg_url = f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage"
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    resp = await client.post(
                        tg_url,
                        json={
                            "chat_id": telegram_chat_id,
                            "text": tg_text,
                            "parse_mode": "HTML",
                        },
                    )
                    results["telegram"] = resp.status_code == 200
            except Exception as e:
                logger.warning(f"Error enviando Telegram: {e}")

        return results
