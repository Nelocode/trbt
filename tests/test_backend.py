"""
RocketBot Pro - Institutional Test Suite
=========================================
Valida la integridad de los componentes centrales del motor cuantitativo,
autenticación RBAC, aislamiento multicuenta y persistencia de datos.
"""

import sys
import unittest
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR / "rocketbot-backend"))

import pandas as pd
import numpy as np
from server import MarketDataEngine, RocketFreqAIEngine, RocketBotOrchestrator, app
from auth_manager import AuthManager, hash_password, verify_password, create_jwt_token, verify_jwt_token
from starlette.testclient import TestClient


class TestMarketDataEngine(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.market = MarketDataEngine()

    async def asyncTearDown(self):
        if self.market.exchange:
            await self.market.exchange.close()

    async def test_pairs_metadata(self):
        self.assertIn("BTC/USDT", self.market.PAIRS)
        self.assertIn("XAU/USD", self.market.PAIRS)
        self.assertIn("EUR/USD", self.market.PAIRS)
        self.assertIn("SPX500/USD", self.market.PAIRS)
        self.assertEqual(len(self.market.PAIRS), 12)

    async def test_fetch_deterministic_ohlcv(self):
        df = await self.market.fetch_pair_ohlcv("BTC/USDT", timeframe="5m", limit=100)
        self.assertIsInstance(df, pd.DataFrame)
        self.assertEqual(len(df), 100)
        for col in ["timestamp", "open", "high", "low", "close", "volume"]:
            self.assertIn(col, df.columns)
        self.assertGreater(float(df["close"].iloc[-1]), 0)


class TestFreqAIEngine(unittest.TestCase):
    def setUp(self):
        self.freqai = RocketFreqAIEngine()
        dates = pd.date_range("2026-01-01", periods=120, freq="5min")
        close = 100.0 + np.cumsum(np.random.normal(0, 1, 120))
        self.df = pd.DataFrame({
            "timestamp": [int(d.timestamp() * 1000) for d in dates],
            "open": close * 0.999,
            "high": close * 1.002,
            "low": close * 0.998,
            "close": close,
            "volume": np.random.uniform(10, 100, 120),
            "rsi": np.random.uniform(30, 70, 120),
            "ema_21": close * 0.999,
            "ema_50": close * 0.995,
            "bb_percent": np.random.uniform(0.1, 0.9, 120),
            "rvol": np.random.uniform(0.8, 1.5, 120),
        })

    def test_freqai_prediction(self):
        pred = self.freqai.evaluate_pair("BTC/USDT", self.df)
        self.assertIn("action", pred)
        self.assertIn(pred["action"], ["BUY", "SELL", "NEUTRAL"])
        self.assertIn("confidence", pred)
        self.assertGreaterEqual(pred["confidence"], 0.0)


class TestOrchestrator(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.orchestrator = RocketBotOrchestrator()
        await self.orchestrator.initialize()

    async def asyncTearDown(self):
        if self.orchestrator.market.exchange:
            await self.orchestrator.market.exchange.close()

    async def test_orchestrator_initialization(self):
        self.assertEqual(self.orchestrator.state, "RUNNING")
        self.assertTrue(self.orchestrator.dry_run)
        summary = self.orchestrator.get_portfolio_summary()
        self.assertIn("total_equity", summary)
        self.assertIn("free_balance", summary)
        self.assertGreater(summary["total_equity"], 0)

    async def test_refresh_all_pairs_concurrency(self):
        await self.orchestrator.refresh_all_pairs()
        self.assertEqual(len(self.orchestrator.radar_signals), 12)
        for pair in self.orchestrator.market.PAIRS:
            self.assertIn(pair, self.orchestrator.radar_signals)
            sig = self.orchestrator.radar_signals[pair]
            self.assertIn("price", sig)
            self.assertIn("regime", sig)


class TestAuthAndRBAC(unittest.TestCase):
    def setUp(self):
        self.auth = AuthManager()

    def test_password_hashing(self):
        hashed = hash_password("SuperSecret2026!")
        self.assertTrue(verify_password("SuperSecret2026!", hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

    def test_jwt_token(self):
        payload = {"user_id": "test_001", "role": "trader"}
        token = create_jwt_token(payload, expires_in=3600)
        verified = verify_jwt_token(token)
        self.assertIsNotNone(verified)
        self.assertEqual(verified["user_id"], "test_001")
        self.assertEqual(verified["role"], "trader")


class TestSystemEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_check(self):
        res = self.client.get("/api/v1/system/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["server_timezone"], "UTC")
        self.assertTrue(data["storage"]["writable"])


if __name__ == "__main__":
    unittest.main()
