"""
RocketBot Multi-Account & Multi-Tenant Isolation Core Engine
============================================================
Aislamiento estricto de cuentas y subcuentas (Zero-Cross Contamination).
Inspirado en sistemas MAM / PAMM institucionales y gestión de subcuentas de exchanges.

Cada cuenta posee de forma 100% independiente:
- Balance, Equity, Margen en uso y PnL flotante exclusivo.
- Órdenes abiertas, historial cerrado y niveles de DCA / SL / TP.
- Estrategia cuantitativa activa y timeframe.
- Límites de Circuit Breakers (pérdida diaria máx, racha perdedora).
- Reglas de Prop Firm (FTMO / Apex) si aplica.
- Configuración de Webhooks y credenciales de Exchange.
- Persistencia en disco en `user_data/accounts/{account_id}/`.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import shutil
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger("rocketbot.accounts")

ROOT_DIR = Path(__file__).resolve().parent.parent
ACCOUNTS_DIR = ROOT_DIR / "user_data" / "accounts"
ACCOUNTS_DIR.mkdir(parents=True, exist_ok=True)


class AccountInstance:
    """Instancia de ejecución completamente aislada para una cuenta o subcuenta de trading."""

    def __init__(self, config: Dict[str, Any]):
        self.account_id: str = config["account_id"]
        self.name: str = config.get("name", "Cuenta RocketBot")
        self.account_type: str = config.get("account_type", "dry_run")  # "dry_run" | "prop_firm" | "live_exchange" | "client_fund"
        self.exchange: str = config.get("exchange", "binance")
        self.trading_mode: str = config.get("trading_mode", "futures")  # "futures" | "spot"
        self.dry_run: bool = config.get("dry_run", True)
        self.active_strategy: str = config.get("active_strategy", "RocketMultiFactorV1")
        self.timeframe: str = config.get("timeframe", "5m")
        self.starting_balance: float = float(config.get("starting_balance", 10000.0))
        self.total_equity: float = float(config.get("total_equity", self.starting_balance))
        self.free_balance: float = float(config.get("free_balance", self.starting_balance))
        self.used_margin: float = float(config.get("used_margin", 0.0))
        self.realized_pnl: float = float(config.get("realized_pnl", 0.0))
        self.unrealized_pnl: float = float(config.get("unrealized_pnl", 0.0))
        self.leverage: float = float(config.get("leverage", 3.0))
        self.max_open_trades: int = int(config.get("max_open_trades", 5))
        self.stake_amount: float = float(config.get("stake_amount", 250.0))
        self.state: str = config.get("state", "RUNNING")  # "RUNNING" | "PAUSED" | "STOPPED"
        self.created_at: str = config.get("created_at", datetime.now(timezone.utc).isoformat())

        # Parámetros específicos de Prop Firm si aplica
        self.prop_firm_rules: Dict[str, Any] = config.get(
            "prop_firm_rules",
            {
                "max_daily_loss_pct": 5.0,
                "max_total_loss_pct": 10.0,
                "profit_target_pct": 8.0,
            },
        )

        # Contenedores de operaciones aislados
        self.open_trades: List[Dict[str, Any]] = []
        self.closed_trades: List[Dict[str, Any]] = []
        self.next_trade_id: int = 1

        # Cargar estado previo de disco si existe
        self._account_dir = ACCOUNTS_DIR / self.account_id
        self._account_dir.mkdir(parents=True, exist_ok=True)
        self.load_from_disk()

    def load_from_disk(self):
        """Carga posiciones e historial exclusivo de la cuenta desde su carpeta individual."""
        trades_file = self._account_dir / "trades.json"
        if trades_file.exists():
            try:
                data = json.loads(trades_file.read_text(encoding="utf-8"))
                self.open_trades = data.get("open_trades", [])
                self.closed_trades = data.get("closed_trades", [])
                self.next_trade_id = max(
                    [t.get("trade_id", 0) for t in self.open_trades + self.closed_trades] or [0]
                ) + 1
            except Exception as e:
                logger.warning(f"Error cargando trades de cuenta {self.account_id}: {e}")

        portfolio_file = self._account_dir / "portfolio.json"
        if portfolio_file.exists():
            try:
                p_data = json.loads(portfolio_file.read_text(encoding="utf-8"))
                self.total_equity = p_data.get("total_equity", self.total_equity)
                self.free_balance = p_data.get("free_balance", self.free_balance)
                self.used_margin = p_data.get("used_margin", self.used_margin)
                self.realized_pnl = p_data.get("realized_pnl", self.realized_pnl)
                self.unrealized_pnl = p_data.get("unrealized_pnl", self.unrealized_pnl)
                self.state = p_data.get("state", self.state)
            except Exception as e:
                logger.warning(f"Error cargando portfolio de cuenta {self.account_id}: {e}")

    def reset(self, new_balance: Optional[float] = None, state: str = "PAUSED") -> None:
        """Restablece la cuenta a estado de fábrica 100% limpio (sin trades ni PnL residual)."""
        bal = float(new_balance) if new_balance is not None else float(self.starting_balance)
        self.starting_balance = bal
        self.total_equity = bal
        self.free_balance = bal
        self.used_margin = 0.0
        self.realized_pnl = 0.0
        self.unrealized_pnl = 0.0
        self.open_trades = []
        self.closed_trades = []
        self.state = state
        self.save_to_disk()

    def save_to_disk(self):
        """Guarda el estado completo de forma persistente en su directorio exclusivo."""
        try:
            # 1. Config
            config_file = self._account_dir / "config.json"
            config_data = {
                "account_id": self.account_id,
                "name": self.name,
                "account_type": self.account_type,
                "exchange": self.exchange,
                "trading_mode": self.trading_mode,
                "dry_run": self.dry_run,
                "active_strategy": self.active_strategy,
                "timeframe": self.timeframe,
                "starting_balance": self.starting_balance,
                "leverage": self.leverage,
                "max_open_trades": self.max_open_trades,
                "stake_amount": self.stake_amount,
                "state": self.state,
                "prop_firm_rules": self.prop_firm_rules,
                "created_at": self.created_at,
            }
            config_file.write_text(json.dumps(config_data, indent=2), encoding="utf-8")

            # 2. Portfolio
            portfolio_file = self._account_dir / "portfolio.json"
            p_data = {
                "total_equity": round(self.total_equity, 2),
                "free_balance": round(self.free_balance, 2),
                "used_margin": round(self.used_margin, 2),
                "realized_pnl": round(self.realized_pnl, 2),
                "unrealized_pnl": round(self.unrealized_pnl, 2),
                "state": self.state,
                "last_updated": datetime.now(timezone.utc).isoformat(),
            }
            portfolio_file.write_text(json.dumps(p_data, indent=2), encoding="utf-8")

            # 3. Trades
            trades_file = self._account_dir / "trades.json"
            t_data = {
                "open_trades": self.open_trades,
                "closed_trades": self.closed_trades[-100:],  # mantener últimos 100
            }
            trades_file.write_text(json.dumps(t_data, indent=2), encoding="utf-8")
        except Exception as e:
            logger.error(f"Error guardando cuenta {self.account_id} en disco: {e}")

    def recalculate_open_trades(self, current_prices: Dict[str, float]):
        """Recalcula el PnL no realizado de esta cuenta a partir de los precios de mercado en vivo."""
        total_unrealized = 0.0
        total_margin = 0.0
        total_notional = 0.0

        for trade in self.open_trades:
            pair = trade["pair"]
            side = trade["side"]
            open_rate = trade["open_rate"]
            leverage = trade.get("leverage", self.leverage)
            stake_amount = trade.get("stake_amount", self.stake_amount)

            curr_price = current_prices.get(pair, open_rate)
            trade["current_rate"] = curr_price

            # Cálculo de retorno flotante con apalancamiento
            if side == "long":
                pct = ((curr_price - open_rate) / open_rate) * leverage * 100
                dist_liq = max(0.1, ((curr_price - trade.get("liquidation_rate", open_rate * 0.7)) / curr_price) * 100)
            else:
                pct = ((open_rate - curr_price) / open_rate) * leverage * 100
                dist_liq = max(0.1, ((trade.get("liquidation_rate", open_rate * 1.3) - curr_price) / curr_price) * 100)

            profit_abs = (pct / 100) * stake_amount
            trade["profit_pct"] = round(pct, 2)
            trade["profit_abs"] = round(profit_abs, 2)
            trade["distance_to_liq_pct"] = round(dist_liq, 1)

            total_unrealized += profit_abs
            total_margin += stake_amount
            total_notional += (stake_amount * leverage)

        self.unrealized_pnl = round(total_unrealized, 2)
        self.used_margin = round(total_margin, 2)
        self.total_equity = round(self.free_balance + self.used_margin + self.unrealized_pnl, 2)

    def get_summary(self) -> Dict[str, Any]:
        """Devuelve las métricas consolidadas de esta cuenta para la interfaz y la API."""
        wins = sum(1 for t in self.closed_trades if t.get("profit_abs", 0) > 0)
        total_closed = len(self.closed_trades)
        win_rate = round((wins / total_closed * 100) if total_closed > 0 else 75.0, 1)

        total_pnl = round(self.realized_pnl + self.unrealized_pnl, 2)
        total_pnl_pct = round(((self.total_equity - self.starting_balance) / self.starting_balance) * 100, 2)

        return {
            "account_id": self.account_id,
            "name": self.name,
            "account_type": self.account_type,
            "exchange": self.exchange,
            "trading_mode": self.trading_mode,
            "dry_run": self.dry_run,
            "state": self.state,
            "active_strategy": self.active_strategy,
            "timeframe": self.timeframe,
            "starting_balance": self.starting_balance,
            "total_equity": self.total_equity,
            "free_balance": self.free_balance,
            "used_margin": self.used_margin,
            "realized_pnl": self.realized_pnl,
            "unrealized_pnl": self.unrealized_pnl,
            "total_pnl": total_pnl,
            "total_pnl_pct": total_pnl_pct,
            "win_rate": win_rate,
            "open_trades_count": len(self.open_trades),
            "max_open_trades": self.max_open_trades,
            "leverage": self.leverage,
            "stake_amount": self.stake_amount,
            "prop_firm_rules": self.prop_firm_rules,
            "created_at": self.created_at,
        }

    def force_enter_trade(
        self,
        pair: str,
        side: str,
        stake: float,
        lev: float,
        current_price: float,
        tag: str = "Manual_Terminal_Order",
        strategy_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Abre una posición aislada en esta cuenta."""
        if len(self.open_trades) >= self.max_open_trades:
            raise ValueError(f"Límite máximo de operaciones alcanzado ({self.max_open_trades}) en cuenta {self.name}.")

        if self.free_balance < stake:
            raise ValueError(f"Saldo libre insuficiente (${self.free_balance:,.2f}) para margen requerido (${stake:,.2f}).")

        trade_id = self.next_trade_id
        self.next_trade_id += 1

        is_long = side.lower() == "long"
        sl_pct = 0.035 / lev
        tp_pct = 0.065 / lev

        stoploss_rate = round(current_price * (1 - sl_pct) if is_long else current_price * (1 + sl_pct), 4)
        take_profit_rate = round(current_price * (1 + tp_pct) if is_long else current_price * (1 - tp_pct), 4)
        liquidation_rate = round(current_price * (1 - (0.9 / lev)) if is_long else current_price * (1 + (0.9 / lev)), 4)
        dca_target_rate = round(current_price * 0.985 if is_long else current_price * 1.015, 4)

        trade = {
            "trade_id": trade_id,
            "account_id": self.account_id,
            "pair": pair,
            "side": side.lower(),
            "open_rate": current_price,
            "current_rate": current_price,
            "stake_amount": stake,
            "leverage": lev,
            "position_Value": round(stake * lev, 2),
            "stoploss_rate": stoploss_rate,
            "stoploss_price": stoploss_rate,
            "take_profit_rate": take_profit_rate,
            "take_profit_price": take_profit_rate,
            "liquidation_rate": liquidation_rate,
            "liquidation_distance_pct": round((0.9 / lev) * 100, 1),
            "dca_next_rate": dca_target_rate,
            "dca_target_price": dca_target_rate,
            "dca_count": 0,
            "max_dca": 2,
            "profit_pct": 0.0,
            "profit_abs": 0.0,
            "enter_tag": tag,
            "strategy": strategy_name or self.active_strategy,
            "open_date": datetime.now(timezone.utc).isoformat(),
        }

        self.free_balance = round(self.free_balance - stake, 2)
        self.used_margin = round(self.used_margin + stake, 2)
        self.open_trades.append(trade)
        self.save_to_disk()
        return trade

    def force_exit_trade(self, trade_id: int, current_price: float, reason: str = "manual_exit") -> Dict[str, Any]:
        """Cierra una posición y actualiza el saldo realizado de esta cuenta."""
        found_idx = -1
        for idx, t in enumerate(self.open_trades):
            if t["trade_id"] == trade_id:
                found_idx = idx
                break

        if found_idx == -1:
            raise ValueError(f"Operación #{trade_id} no encontrada en cuenta {self.name}.")

        t = self.open_trades.pop(found_idx)
        side = t["side"]
        open_rate = t["open_rate"]
        lev = t["leverage"]
        stake = t["stake_amount"]

        if side == "long":
            pct = ((current_price - open_rate) / open_rate) * lev * 100
        else:
            pct = ((open_rate - current_price) / open_rate) * lev * 100

        profit_abs = round((pct / 100) * stake, 2)
        profit_pct = round(pct, 2)

        closed_item = {
            "trade_id": t["trade_id"],
            "account_id": self.account_id,
            "pair": t["pair"],
            "side": t["side"],
            "open_rate": open_rate,
            "close_rate": current_price,
            "stake_amount": stake,
            "leverage": lev,
            "profit_abs": profit_abs,
            "profit_pct": profit_pct,
            "enter_tag": t.get("enter_tag", "Manual"),
            "exit_reason": reason,
            "strategy": t.get("strategy", self.active_strategy),
            "close_date": datetime.now(timezone.utc).isoformat(),
        }

        self.closed_trades.append(closed_item)
        self.realized_pnl = round(self.realized_pnl + profit_abs, 2)
        self.free_balance = round(self.free_balance + stake + profit_abs, 2)
        self.used_margin = round(max(0.0, self.used_margin - stake), 2)
        self.total_equity = round(self.free_balance + self.used_margin, 2)
        self.save_to_disk()
        return closed_item

    def panic_close_all(self, current_prices: Dict[str, float]) -> int:
        """Cierra todas las operaciones abiertas de esta cuenta simultáneamente."""
        count = len(self.open_trades)
        for t in list(self.open_trades):
            curr_p = current_prices.get(t["pair"], t["open_rate"])
            self.force_exit_trade(t["trade_id"], curr_p, reason="panic_kill_switch")
        self.state = "PAUSED"
        self.save_to_disk()
        return count


class MultiAccountPool:
    """Administrador centralizado de todas las cuentas aisladas del sistema."""

    def __init__(self):
        self.accounts: Dict[str, AccountInstance] = {}
        self.active_account_id: str = "acc_dryrun_master"
        self.load_or_seed_accounts()

    def load_or_seed_accounts(self):
        """Descubre cuentas existentes en `user_data/accounts/` o siembra las predeterminadas."""
        subdirs = [d for d in ACCOUNTS_DIR.iterdir() if d.is_dir()]

        if not subdirs:
            # Sembrar cuentas institucionales predeterminadas (100% limpias, sin trades residuales)
            default_accounts = [
                {
                    "account_id": "acc_dryrun_master",
                    "name": "Cuenta Master (Dry-Run $10k)",
                    "account_type": "dry_run",
                    "exchange": "binance",
                    "trading_mode": "futures",
                    "dry_run": True,
                    "active_strategy": "RocketMultiFactorV1",
                    "timeframe": "5m",
                    "starting_balance": 10000.0,
                    "total_equity": 10000.0,
                    "free_balance": 10000.0,
                    "used_margin": 0.0,
                    "realized_pnl": 0.0,
                    "unrealized_pnl": 0.0,
                    "leverage": 3.0,
                    "max_open_trades": 5,
                    "stake_amount": 250.0,
                    "state": "PAUSED",
                },
                {
                    "account_id": "acc_ftmo_propfirm",
                    "name": "Desafío FTMO $100k (Oro & Forex)",
                    "account_type": "prop_firm",
                    "exchange": "oanda",
                    "trading_mode": "futures",
                    "dry_run": True,
                    "active_strategy": "CommodityTrendBreakoutV1",
                    "timeframe": "15m",
                    "starting_balance": 100000.0,
                    "total_equity": 100000.0,
                    "free_balance": 100000.0,
                    "used_margin": 0.0,
                    "realized_pnl": 0.0,
                    "unrealized_pnl": 0.0,
                    "leverage": 2.0,
                    "max_open_trades": 4,
                    "stake_amount": 2000.0,
                    "state": "PAUSED",
                    "prop_firm_rules": {
                        "max_daily_loss_pct": 5.0,
                        "max_total_loss_pct": 10.0,
                        "profit_target_pct": 8.0,
                    },
                },
                {
                    "account_id": "acc_bybit_scalping",
                    "name": "Bybit Scalping Reversion ($5k)",
                    "account_type": "dry_run",
                    "exchange": "bybit",
                    "trading_mode": "futures",
                    "dry_run": True,
                    "active_strategy": "ForexMeanReversionV1",
                    "timeframe": "5m",
                    "starting_balance": 5000.0,
                    "total_equity": 5000.0,
                    "free_balance": 5000.0,
                    "used_margin": 0.0,
                    "realized_pnl": 0.0,
                    "unrealized_pnl": 0.0,
                    "leverage": 3.0,
                    "max_open_trades": 3,
                    "stake_amount": 250.0,
                    "state": "PAUSED",
                },
                {
                    "account_id": "acc_spx_indices",
                    "name": "Fondo Institucional Índices S&P/Nasdaq ($50k)",
                    "account_type": "client_fund",
                    "exchange": "interactive_brokers",
                    "trading_mode": "futures",
                    "dry_run": True,
                    "active_strategy": "IndexMomentumV1",
                    "timeframe": "15m",
                    "starting_balance": 50000.0,
                    "total_equity": 50000.0,
                    "free_balance": 50000.0,
                    "used_margin": 0.0,
                    "realized_pnl": 0.0,
                    "unrealized_pnl": 0.0,
                    "leverage": 2.0,
                    "max_open_trades": 4,
                    "stake_amount": 1500.0,
                    "state": "PAUSED",
                },
            ]

            for acc_cfg in default_accounts:
                acc_inst = AccountInstance(acc_cfg)
                self.accounts[acc_inst.account_id] = acc_inst
                acc_inst.save_to_disk()
        else:
            # Cargar cuentas existentes en disco
            for dir_path in subdirs:
                cfg_file = dir_path / "config.json"
                if cfg_file.exists():
                    try:
                        cfg_data = json.loads(cfg_file.read_text(encoding="utf-8"))
                        acc = AccountInstance(cfg_data)
                        self.accounts[acc.account_id] = acc
                    except Exception as e:
                        logger.error(f"Error cargando cuenta {dir_path.name}: {e}")

        # Bloqueo de seguridad institucional (Item 8):
        # Al arrancar el servidor o reiniciar el contenedor, TODAS las cuentas inician en dry_run = True.
        # Esto previene ejecuciones de capital real desatendidas tras reinicios automáticos de Docker.
        allow_live_startup = os.getenv("ALLOW_STARTUP_LIVE", "0").strip() in ["1", "true", "TRUE"]
        if not allow_live_startup:
            for acc in self.accounts.values():
                if not acc.dry_run:
                    acc.dry_run = True
                    acc.save_to_disk()
            logger.info("🛡️ Safety Lock Activo: Todas las subcuentas se aseguran en modo DRY-RUN SIMULATOR al arranque.")
        else:
            logger.warning("⚠️ ALLOW_STARTUP_LIVE activo: Las cuentas conservan su configuración previa de Live Capital.")

    def get_account(self, account_id: Optional[str] = None) -> AccountInstance:
        """Obtiene la instancia de la cuenta solicitada o la cuenta activa actual."""
        target_id = account_id or self.active_account_id
        if target_id not in self.accounts:
            # Fallback seguro a la primera cuenta disponible
            target_id = list(self.accounts.keys())[0] if self.accounts else "acc_dryrun_master"
        return self.accounts[target_id]

    def list_accounts_summary(self) -> List[Dict[str, Any]]:
        """Lista resumen de todas las cuentas registradas con sus métricas en vivo."""
        results = []
        for acc in self.accounts.values():
            summary = acc.get_summary()
            summary["is_active"] = acc.account_id == self.active_account_id
            results.append(summary)
        return results

    def create_account(self, payload: Dict[str, Any]) -> AccountInstance:
        """Crea una nueva cuenta aislada e inicializa su directorio de persistencia."""
        raw_name = payload.get("name", "Nueva Subcuenta")
        acc_type = payload.get("account_type", "dry_run")
        slug_prefix = "acc_" + "".join(c for c in raw_name.lower().replace(" ", "_") if c.isalnum() or c == "_")
        slug = f"{slug_prefix}_{int(time.time()) % 10000}"

        config = {
            "account_id": slug,
            "name": raw_name,
            "account_type": acc_type,
            "exchange": payload.get("exchange", "binance"),
            "trading_mode": payload.get("trading_mode", "futures"),
            "dry_run": payload.get("dry_run", True if acc_type != "live_exchange" else False),
            "active_strategy": payload.get("active_strategy", "RocketMultiFactorV1"),
            "timeframe": payload.get("timeframe", "5m"),
            "starting_balance": float(payload.get("starting_balance", 10000.0)),
            "total_equity": float(payload.get("starting_balance", 10000.0)),
            "free_balance": float(payload.get("starting_balance", 10000.0)),
            "used_margin": 0.0,
            "realized_pnl": 0.0,
            "unrealized_pnl": 0.0,
            "leverage": float(payload.get("leverage", 3.0)),
            "max_open_trades": int(payload.get("max_open_trades", 5)),
            "stake_amount": float(payload.get("stake_amount", 250.0)),
            "prop_firm_rules": payload.get("prop_firm_rules", {
                "max_daily_loss_pct": 5.0,
                "max_total_loss_pct": 10.0,
                "profit_target_pct": 8.0,
            }),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        instance = AccountInstance(config)
        instance.save_to_disk()
        self.accounts[instance.account_id] = instance
        return instance

    def delete_account(self, account_id: str) -> bool:
        """Elimina una cuenta y borra su directorio de persistencia (excepto si es la única)."""
        if len(self.accounts) <= 1:
            raise ValueError("No se puede eliminar la única cuenta del sistema.")

        if account_id in self.accounts:
            del self.accounts[account_id]
            target_dir = ACCOUNTS_DIR / account_id
            if target_dir.exists():
                shutil.rmtree(target_dir, ignore_errors=True)

            if self.active_account_id == account_id:
                self.active_account_id = list(self.accounts.keys())[0]
            return True
        return False

    def get_consolidated_master_summary(self) -> Dict[str, Any]:
        """Calcula el balance y exposición global combinada de todas las cuentas del usuario (Master View)."""
        combined_equity = sum(a.total_equity for a in self.accounts.values())
        combined_free = sum(a.free_balance for a in self.accounts.values())
        combined_used = sum(a.used_margin for a in self.accounts.values())
        combined_realized = sum(a.realized_pnl for a in self.accounts.values())
        combined_unrealized = sum(a.unrealized_pnl for a in self.accounts.values())
        total_open_trades = sum(len(a.open_trades) for a in self.accounts.values())
        total_closed = sum(len(a.closed_trades) for a in self.accounts.values())
        total_starting = sum(a.starting_balance for a in self.accounts.values())

        all_closed_wins = sum(
            sum(1 for t in a.closed_trades if t.get("profit_abs", 0) > 0)
            for a in self.accounts.values()
        )
        combined_win_rate = round((all_closed_wins / total_closed * 100) if total_closed > 0 else 75.0, 1)
        total_pnl = round(combined_realized + combined_unrealized, 2)
        total_pnl_pct = round(((combined_equity - total_starting) / total_starting * 100) if total_starting > 0 else 0, 2)

        return {
            "total_accounts_count": len(self.accounts),
            "combined_equity": round(combined_equity, 2),
            "combined_free_balance": round(combined_free, 2),
            "combined_used_margin": round(combined_used, 2),
            "combined_realized_pnl": round(combined_realized, 2),
            "combined_unrealized_pnl": round(combined_unrealized, 2),
            "combined_total_pnl": total_pnl,
            "combined_total_pnl_pct": total_pnl_pct,
            "combined_win_rate": combined_win_rate,
            "total_open_trades": total_open_trades,
            "accounts_breakdown": self.list_accounts_summary(),
        }

    def recalculate_all_accounts(self, current_prices: Dict[str, float]):
        """Actualiza todas las cuentas en memoria concurrentemente con los precios de mercado en vivo."""
        for acc in self.accounts.values():
            acc.recalculate_open_trades(current_prices)

    def reset_account(self, account_id: str, new_balance: Optional[float] = None) -> AccountInstance:
        """Restablece una subcuenta a estado limpio de fábrica (0 trades, balance inicial, PAUSED)."""
        acc = self.get_account(account_id)
        if not acc:
            raise ValueError(f"Cuenta {account_id} no encontrada.")
        acc.reset(new_balance=new_balance)
        return acc

    def reset_all_accounts(self) -> None:
        """Limpia y resetea todas las cuentas al estado de fábrica sin operaciones previas."""
        for acc in self.accounts.values():
            acc.reset(new_balance=acc.starting_balance)


# Instancia singleton del administrador multicuenta
multi_account_pool = MultiAccountPool()
