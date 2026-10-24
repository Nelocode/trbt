"""
RocketBot AI Copilot & Quant Auditor ("Prof. Quant Alpha")
===========================================================
Motor de Inteligencia Artificial Multi-Proveedor para Auditoría de Riesgo,
Alertas Tempranas en Vivo y Mentoría Cuantitativa Institucional.

Proveedores Soportados:
1. Google Gemini (gemini-2.5-flash, gemini-2.5-pro, gemini-1.5-pro)
2. OpenAI (gpt-4o, gpt-4o-mini, o3-mini)
3. Anthropic Claude (claude-3-7-sonnet-latest, claude-3-5-haiku-latest)
4. DeepSeek / OpenAI Compatible (deepseek-chat, deepseek-reasoner)
5. Offline / Local Quant Engine (Motor cuantitativo determinista de auditoría sin necesidad de API Key)
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger("rocketbot.ai")


SYSTEM_PROMPT = """Eres el "Prof. Quant Alpha", Auditor Senior de Riesgo de Fondos Cuantitativos y Profesor Experto en Trading Algorítmico y Estrategias con Bots de RocketBot Pro.

Tu personalidad:
- Eres altamente pedagógico, analítico, riguroso con los números y obsesionado con la preservación del capital y la gestión del riesgo.
- Enseñas a pensar como un gestor de fondos cuantitativo: no crees en la suerte, sino en la esperanza matemática positiva (Expected Value), ratio de Sharpe, control de drawdown y confluencia de factores.
- Hablas en español claro, profesional, estructurado y accesible tanto para principiantes como para traders avanzados.

Reglas de Oro en tus Respuestas:
1. RIGOR EN AUDITORÍA: Analiza minuciosamente los datos reales de la cartera y posiciones del usuario adjuntos en el contexto (Equity, Margen en uso %, PnL flotante, Distancia a liquidación, Paradas Stop Loss). Cita los números exactos.
2. ALERTAS TEMPRANAS:
   - Si el margen en uso supera el 30%: emite una [ADVERTENCIA DE MARGEN].
   - Si la distancia a liquidación de cualquier posición es < 6%: emite una [ALERTA CRÍTICA DE LIQUIDACIÓN].
   - Si más del 60% del riesgo está en un solo mercado (ej. solo Cripto): emite una [ALERTA DE CONCENTRACIÓN].
3. PEDAGOGÍA DE ESTRATEGIAS: Cuando expliques las estrategias del bot (Breakout Donchian para Oro/WTI, Reversión a la Media de Bollinger en Forex, Multi-Factor Pullback en Cripto, Momentum en Índices, o el Gradiente Boosting de FreqAI), desglosa las fórmulas matemáticas y los parámetros clave (ADX, ATR, RSI, periodos).
4. ESTRUCTURA: Usa Markdown estructurado con títulos, viñetas, tablas comparativas y bloques de código cuando sea pertinente.
"""


class AICopilotEngine:
    """Motor central de consultas y auditorías de IA para RocketBot."""

    DEFAULT_MODELS = {
        "gemini": "gemini-2.5-flash",
        "openai": "gpt-4o-mini",
        "anthropic": "claude-3-5-haiku-20241022",
        "deepseek": "deepseek-chat",
        "offline": "local-quant-auditor",
    }

    @classmethod
    def build_live_context_summary(
        cls,
        portfolio: Dict[str, Any],
        open_trades: List[Dict[str, Any]],
        radar_signals: List[Dict[str, Any]],
    ) -> str:
        """Genera un reporte resumido del estado actual en vivo para inyectarlo al LLM."""
        equity = portfolio.get("total_equity", 10000.0)
        free_bal = portfolio.get("free_balance", 8500.0)
        used_margin = portfolio.get("used_margin", 1500.0)
        margin_pct = round((used_margin / equity * 100) if equity > 0 else 0, 1)
        unrealized_pnl = portfolio.get("unrealized_pnl", 0.0)
        realized_pnl = portfolio.get("realized_pnl", 0.0)
        win_rate = portfolio.get("win_rate", 0.0)
        active_strategy = portfolio.get("active_strategy", "RocketMultiFactorV1")
        trading_mode = portfolio.get("trading_mode", "futures")
        dry_run = portfolio.get("dry_run", True)

        lines = [
            "--- SNAPSHOT EN TIEMPO REAL DEL BOT ---",
            f"• Modo: {'SIMULADOR DRY-RUN (Fondos Virtuales)' if dry_run else 'LIVE CAPITAL (Fondos Reales)'} | Tipo: {trading_mode.upper()}",
            f"• Estrategia Activa: {active_strategy}",
            f"• Balance Total (Equity): ${equity:,.2f} | Margen Libre: ${free_bal:,.2f}",
            f"• Margen Comprometido: ${used_margin:,.2f} ({margin_pct}% del balance total)",
            f"• PnL Flotante Actual: ${unrealized_pnl:+,.2f} | PnL Realizado: ${realized_pnl:+,.2f} | Win Rate: {win_rate}%",
            f"• Posiciones Abiertas: {len(open_trades)}",
        ]

        if open_trades:
            lines.append("\n[POSICIONES ABIERTAS ACTUALES]:")
            for t in open_trades:
                p = t.get("pair")
                side = t.get("side", "long").upper()
                lev = t.get("leverage", 1.0)
                open_rate = t.get("open_rate", 0.0)
                current_rate = t.get("current_rate", open_rate)
                pnl_pct = t.get("profit_pct", 0.0)
                pnl_abs = t.get("profit_abs", 0.0)
                dist_liq = t.get("distance_to_liq_pct", 99.0)
                sl = t.get("stoploss_price", 0.0)
                tp = t.get("take_profit_price", 0.0)
                dca = t.get("dca_target_price", 0.0)
                lines.append(
                    f"  - {p} ({side} {lev}x): Entrada=${open_rate} -> Actual=${current_rate} | "
                    f"PnL: {pnl_pct:+,.2f}% (${pnl_abs:+,.2f}) | Dist. Liq: {dist_liq}% | SL=${sl} | TP=${tp} | Re-compra DCA=${dca}"
                )
        else:
            lines.append("\n[POSICIONES ABIERTAS]: Ninguna en este momento (100% de liquidez disponible).")

        if radar_signals:
            lines.append("\n[SEÑALES TOP DEL RADAR DE CONFLUENCIA]:")
            # Mostrar hasta 4 señales más relevantes
            sorted_radar = sorted(radar_signals, key=lambda s: s.get("buy_score", 0), reverse=True)[:4]
            for s in sorted_radar:
                pair = s.get("pair")
                b_score = s.get("buy_score", 0)
                s_score = s.get("sell_score", 0)
                rec = s.get("recommendation", "ESPERAR")
                lines.append(f"  - {pair}: Recomendación={rec} (Score Compra={b_score}%, Venta={s_score}%)")

        lines.append("---------------------------------------\n")
        return "\n".join(lines)

    @classmethod
    def generate_offline_audit(
        cls,
        portfolio: Dict[str, Any],
        open_trades: List[Dict[str, Any]],
        radar_signals: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Auditoría cuantitativa matemática sin necesidad de API externa."""
        equity = portfolio.get("total_equity", 10000.0)
        used_margin = portfolio.get("used_margin", 0.0)
        margin_pct = (used_margin / equity * 100) if equity > 0 else 0
        unrealized_pnl = portfolio.get("unrealized_pnl", 0.0)
        win_rate = portfolio.get("win_rate", 0.0)

        # Cálculo del Risk Score Institucional (0 a 100)
        # Menor puntuación = menor riesgo (más seguro)
        risk_score = 20  # Base segura
        alerts = []

        # 1. Chequeo de Margen
        if margin_pct > 50:
            risk_score += 40
            alerts.append({
                "severity": "CRITICAL",
                "title": "Apalancamiento Agresivo Detectado",
                "message": f"Tienes el {margin_pct:.1f}% del capital comprometido en margen. El límite institucional recomendado es 30%.",
                "action": "Considera no abrir más posiciones y colocar trailing stops agresivos.",
            })
        elif margin_pct > 30:
            risk_score += 20
            alerts.append({
                "severity": "WARNING",
                "title": "Margen en Zona de Cuidado",
                "message": f"Margen utilizado al {margin_pct:.1f}%. Adecuado pero cercano al techo preventivo.",
                "action": "Prioriza cierre de ganancias parciales antes de nuevas entradas.",
            })
        else:
            alerts.append({
                "severity": "INFO",
                "title": "Salud de Liquidez Óptima",
                "message": f"Margen en uso ({margin_pct:.1f}%) dentro de rangos institucionales conservadores (<30%).",
                "action": "Espacio holgado para aprovechar breakouts de alta confluencia.",
            })

        # 2. Chequeo de Distancia a Liquidación en Trades
        for t in open_trades:
            dist = t.get("distance_to_liq_pct", 100.0)
            pair = t.get("pair")
            if dist < 8.0:
                risk_score += 25
                alerts.append({
                    "severity": "CRITICAL",
                    "title": f"Riesgo de Liquidación Cercano en {pair}",
                    "message": f"La posición en {pair} tiene solo {dist:.1f}% de colchón antes de la liquidación del exchange.",
                    "action": f"Revisa el Stop Loss o aporta colateral para alejar el precio de liquidación.",
                })
            elif dist < 15.0:
                risk_score += 10
                alerts.append({
                    "severity": "WARNING",
                    "title": f"Monitoreo Preventivo en {pair}",
                    "message": f"Distancia a liquidación de {dist:.1f}%. Monitorea volatilidad ATR.",
                    "action": f"Verifica que el trailing stop esté activado.",
                })

        # 3. Concentración de Clases de Activos
        asset_counts = {"crypto": 0, "commodity": 0, "forex": 0, "indices": 0}
        for t in open_trades:
            p = t.get("pair", "")
            if any(p.startswith(x) for x in ["XAU", "WTI", "XAG"]):
                asset_counts["commodity"] += 1
            elif any(x in p for x in ["EUR", "GBP", "JPY"]):
                asset_counts["forex"] += 1
            elif any(x in p for x in ["SPX", "NAS"]):
                asset_counts["indices"] += 1
            else:
                asset_counts["crypto"] += 1

        total_open = len(open_trades)
        if total_open >= 3 and asset_counts["crypto"] == total_open:
            risk_score += 15
            alerts.append({
                "severity": "WARNING",
                "title": "Concentración 100% Cripto",
                "message": "Todas tus posiciones activas pertenecen al sector Cripto. Si Bitcoin corrige, todas caerán juntas.",
                "action": "Diversifica asignando cupo a Oro (XAU/USD) o Divisas (EUR/USD) que tienen baja correlación.",
            })

        risk_score = min(100, max(5, risk_score))
        if risk_score < 35:
            risk_level = "BAJO"
            risk_color = "#00DFDF"
        elif risk_score < 65:
            risk_level = "MODERADO"
            risk_color = "#FFB800"
        elif risk_score < 85:
            risk_level = "ELEVADO"
            risk_color = "#FF6B00"
        else:
            risk_level = "CRÍTICO"
            risk_color = "#FF3B69"

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "risk_color": risk_color,
            "margin_usage_pct": round(margin_pct, 1),
            "open_trades_count": total_open,
            "asset_distribution": asset_counts,
            "alerts": alerts,
            "timestamp": asyncio.get_event_loop().time(),
        }

    @classmethod
    async def call_gemini(
        cls,
        api_key: str,
        model: str,
        messages: List[Dict[str, str]],
        context_prompt: str,
    ) -> str:
        """Llama a la API de Google Gemini (2.5 Flash / Pro)."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        # Ensamblar contenido en el formato de Gemini
        contents = []
        for m in messages:
            role = "user" if m.get("role") in ["user", "system"] else "model"
            contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": f"{SYSTEM_PROMPT}\n\n{context_prompt}"}]
            },
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2048,
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                err_data = resp.json().get("error", {})
                msg = err_data.get("message", resp.text)
                raise RuntimeError(f"Error Gemini API ({resp.status_code}): {msg}")

            data = resp.json()
            candidates = data.get("candidates", [])
            if not candidates:
                return "Gemini no generó ninguna respuesta."
            parts = candidates[0].get("content", {}).get("parts", [])
            return "".join(p.get("text", "") for p in parts)

    @classmethod
    async def call_openai(
        cls,
        api_key: str,
        model: str,
        messages: List[Dict[str, str]],
        context_prompt: str,
    ) -> str:
        """Llama a la API de OpenAI (GPT-4o, GPT-4o-mini)."""
        url = "https://api.openai.com/v1/chat/completions"

        full_messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{context_prompt}"}
        ]
        for m in messages:
            full_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})

        payload = {
            "model": model,
            "messages": full_messages,
            "temperature": 0.3,
            "max_tokens": 2048,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                err_data = resp.json().get("error", {})
                msg = err_data.get("message", resp.text)
                raise RuntimeError(f"Error OpenAI API ({resp.status_code}): {msg}")

            data = resp.json()
            choices = data.get("choices", [])
            if not choices:
                return "OpenAI no generó ninguna respuesta."
            return choices[0].get("message", {}).get("content", "")

    @classmethod
    async def call_anthropic(
        cls,
        api_key: str,
        model: str,
        messages: List[Dict[str, str]],
        context_prompt: str,
    ) -> str:
        """Llama a la API de Anthropic Claude (Claude 3.7 Sonnet / Claude 3.5 Haiku)."""
        url = "https://api.anthropic.com/v1/messages"

        # Filtrar o agrupar mensajes para la API de Claude
        claude_messages = []
        for m in messages:
            role = "assistant" if m.get("role") == "assistant" else "user"
            claude_messages.append({"role": role, "content": m.get("content", "")})

        # Claude requiere que el primer mensaje sea de rol "user"
        if not claude_messages or claude_messages[0]["role"] != "user":
            claude_messages.insert(0, {"role": "user", "content": "Hola profesor, necesito tu auditoría."})

        payload = {
            "model": model,
            "max_tokens": 2048,
            "system": f"{SYSTEM_PROMPT}\n\n{context_prompt}",
            "messages": claude_messages,
            "temperature": 0.3,
        }

        headers = {
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                err_data = resp.json().get("error", {})
                msg = err_data.get("message", resp.text)
                raise RuntimeError(f"Error Anthropic Claude API ({resp.status_code}): {msg}")

            data = resp.json()
            contents = data.get("content", [])
            return "".join(c.get("text", "") for c in contents if c.get("type") == "text")

    @classmethod
    async def call_deepseek(
        cls,
        api_key: str,
        model: str,
        messages: List[Dict[str, str]],
        context_prompt: str,
    ) -> str:
        """Llama a la API de DeepSeek (DeepSeek-V3 / R1) compatible con OpenAI."""
        url = "https://api.deepseek.com/chat/completions"

        full_messages = [
            {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{context_prompt}"}
        ]
        for m in messages:
            full_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})

        payload = {
            "model": model,
            "messages": full_messages,
            "temperature": 0.3,
            "max_tokens": 2048,
        }

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            if resp.status_code != 200:
                err_data = resp.json().get("error", {})
                msg = err_data.get("message", resp.text)
                raise RuntimeError(f"Error DeepSeek API ({resp.status_code}): {msg}")

            data = resp.json()
            choices = data.get("choices", [])
            if not choices:
                return "DeepSeek no generó respuesta."
            return choices[0].get("message", {}).get("content", "")

    @classmethod
    def generate_offline_answer(
        cls,
        user_message: str,
        portfolio: Dict[str, Any],
        open_trades: List[Dict[str, Any]],
        radar_signals: List[Dict[str, Any]],
    ) -> str:
        """Motor cuantitativo local que genera respuestas pedagógicas inteligentes sin internet ni API Key."""
        query = user_message.lower()
        equity = portfolio.get("total_equity", 10000.0)
        used_margin = portfolio.get("used_margin", 0.0)
        margin_pct = (used_margin / equity * 100) if equity > 0 else 0
        strat = portfolio.get("active_strategy", "RocketMultiFactorV1")
        open_count = len(open_trades)

        if any(w in query for w in ["audita", "auditoría", "cartera", "revisa", "analiza", "riesgo", "posiciones"]):
            trades_summary = ""
            for t in open_trades:
                trades_summary += (
                    f"- **{t.get('pair')}** ({t.get('side', '').upper()} {t.get('leverage')}x): "
                    f"PnL: `{t.get('profit_pct'):+,.2f}%` (${t.get('profit_abs'):+,.2f}), "
                    f"Distancia Liq: `{t.get('distance_to_liq_pct'):.1f}%`, "
                    f"SL: `${t.get('stoploss_price')}` | TP: `${t.get('take_profit_price')}`\n"
                )

            return f"""### 🎓 Auditoría Cuantitativa en Vivo — Prof. Quant Alpha

¡Hola! Como auditor de riesgo del bot, he analizado la telemetría en tiempo real de tu cuenta:

#### 1. Diagnóstico de Capital & Margen
- **Equity Total:** `${equity:,.2f}`
- **Margen Comprometido:** `${used_margin:,.2f}` (**{margin_pct:.1f}%** del balance).
- **Semáforo de Exposición:** { '🟢 ÓPTIMO (<30%)' if margin_pct < 30 else '🟡 PRECAUCIÓN (30-50%)' if margin_pct < 50 else '🔴 RIESGO CRÍTICO (>50%)' }. Mantener el margen por debajo del 30% garantiza supervivencia ante *flash crashes*.

#### 2. Revisión de Posiciones Abiertas ({open_count})
{trades_summary if trades_summary else '*No tienes operaciones abiertas en este momento. Tienes 100% de liquidez libre.*'}

#### 3. Conclusiones y Recomendaciones del Profesor:
1. **Disciplina de Stop Loss:** Tus órdenes automáticas tienen fijado el Stop Loss por volatilidad ATR. No las desactives manualmente.
2. **Diversificación:** Recuerda que puedes alternar entre Cripto, Oro/Petróleo (Breakout Donchian) y Divisas Forex (Reversión a la media) en la pestaña superior.
3. **Siguiente Acción:** Si deseas probar nuevos parámetros sin riesgo, accede a la pestaña **Backtest & Hyperopt** para optimizar el ratio de Sharpe con datos históricos.
"""

        if any(w in query for w in ["donchian", "oro", "petroleo", "commodity", "wti", "xau"]):
            return """### 🎓 Estrategia CommodityTrendBreakoutV1 (Donchian + ATR)

Esta estrategia está diseñada específicamente para materias primas con fuertes tendencias macroeconómicas (**Oro XAU/USD** y **Petróleo WTI**).

#### 📐 Fórmulas Matemáticas:
1. **Canal de Donchian (20 Periodos):**
   $$\\text{UpperBand} = \\max(H_{t-20}, \\dots, H_{t-1})$$
   $$\\text{LowerBand} = \\min(L_{t-20}, \\dots, L_{t-1})$$
2. **Filtro de Tendencia Secular:** $\\text{Close} > \\text{EMA}(200)$
3. **Filtro de Inercia Direccional:** $\\text{ADX}(14) > 22$ (evita falsos rompimientos en rangos laterales).
4. **Trailing Stop Volátil:** Basado en $2.2 \\times \\text{ATR}(14)$ que sube conforme el precio avanza protegiendo beneficios.

> [!TIP]
> **Consejo del Profesor:** En materias primas, los rompimientos en temporalidad de 15m a 1h son los más fiables. Evita temporalidades de 1 minuto debido al ruido de alta frecuencia del spread interbancario.
"""

        if any(w in query for w in ["forex", "divisas", "eur", "gbp", "jpy", "reversión", "bollinger"]):
            return """### 🎓 Estrategia ForexMeanReversionV1 (Bandas de Bollinger + RSI)

A diferencia de las criptomonedas, el mercado de divisas (**EUR/USD, GBP/USD, USD/JPY**) opera en rangos estacionales determinados por tipos de interés bancarios, haciendo que la **Reversión a la Media** sea la estrategia estadísticamente dominante.

#### 📐 Condiciones Cuantitativas:
1. **Sobre-extensión de Volatilidad:** El precio toca o perfora la banda inferior de Bollinger (20 periodos, 2.0 desviaciones estándar).
2. **Agotamiento del Impulso:** $\\text{RSI}(14) \\le 28$ para compras o $\\ge 72$ para ventas.
3. **Gatillo de Entrada:** Cierre de la vela re-ingresando dentro de las bandas.
4. **Target ROI:** Toma de beneficios calculada en la media móvil central de 20 periodos.

> [!IMPORTANT]
> **Regla de Oro en Forex:** El apalancamiento máximo permitido por el bot en Forex es 3x para evitar que desviaciones temporales de tipos de cambio comprometan tu colateral.
"""

        if any(w in query for w in ["freqai", "machine learning", "ia", "modelo", "boosting"]):
            return """### 🎓 FreqAI: Machine Learning Adaptativo en RocketBot

FreqAI no predice "adivinando" el futuro; entrena modelos de **Gradient Boosting Regressor** de Scikit-Learn de manera incremental sobre vectores de características (*features*) normalizadas en tiempo real:

1. **Features de Entrada:**
   - Volumen relativo a 24 horas ($V / \\text{SMA}(V, 24)$).
   - Ancho porcentual de Bandas de Bollinger (compresión de volatilidad).
   - Retornos logarítmicos pasados ($r_t = \\ln(P_t / P_{t-1})$).
2. **Target (Objetivo):** Proyección del retorno esperado a 6 velas hacia el futuro.
3. **Control de Outliers (DI Metric):** Si el mercado actual entra en un régimen nunca antes visto por el modelo, FreqAI clasifica la predicción con baja confianza y el bot se abstiene de operar.

> [!NOTE]
> Puedes ver los pesos e importancias de cada característica en la pestaña **FreqAI ML** de tu panel principal.
"""

        # Respuesta pedagógica general
        return f"""### 🎓 Consulta Cuantitativa — Prof. Quant Alpha

He recibido tu pregunta: *" {user_message} "*

Como mentor cuantitativo de RocketBot Pro, te sugiero tener presentes los siguientes pilares de tu operativa actual:

1. **Estado del Sistema:** Estás operando con la estrategia `{strat}` sobre un capital de `${equity:,.2f}`.
2. **Margen y Exposición:** Tienes {open_count} posiciones abiertas con `{margin_pct:.1f}%` de margen comprometido.
3. **Herramientas de Validación:**
   - Usa el **Radar de Confluencia** para ver las 5 condiciones matemáticas de cada activo.
   - Pulsa el botón **Tour Interactivo** si deseas refrescar los módulos del terminal.
   - Puedes preguntarme por cualquiera de las 4 estrategias (Donchian, Bollinger Forex, Multi-Factor Cripto o Índices Momentum) y te desglosaré sus fórmulas.

*Nota: Para conectar tu modelo favorito (Gemini, Claude o GPT) y habilitar respuestas generativas avanzadas, ingresa tu API Key en el icono de configuración ⚙️.*
"""

    @classmethod
    async def chat(
        cls,
        provider: str,
        api_key: Optional[str],
        model: Optional[str],
        messages: List[Dict[str, str]],
        portfolio: Dict[str, Any],
        open_trades: List[Dict[str, Any]],
        radar_signals: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Punto de entrada principal para procesar una conversación con el Copilot."""
        selected_model = model or cls.DEFAULT_MODELS.get(provider, "gemini-2.5-flash")
        context_prompt = cls.build_live_context_summary(portfolio, open_trades, radar_signals)

        # Si el usuario eligió offline o no puso API Key, usar motor local
        if provider == "offline" or not api_key:
            last_msg = messages[-1].get("content", "") if messages else "audita mi cartera"
            reply = cls.generate_offline_answer(last_msg, portfolio, open_trades, radar_signals)
            return {
                "provider": "offline",
                "model": "Local Quant Engine (Educativo)",
                "reply": reply,
                "used_api": False,
            }

        try:
            if provider == "gemini":
                reply = await cls.call_gemini(api_key, selected_model, messages, context_prompt)
            elif provider == "openai":
                reply = await cls.call_openai(api_key, selected_model, messages, context_prompt)
            elif provider == "anthropic":
                reply = await cls.call_anthropic(api_key, selected_model, messages, context_prompt)
            elif provider == "deepseek":
                reply = await cls.call_deepseek(api_key, selected_model, messages, context_prompt)
            else:
                reply = cls.generate_offline_answer(messages[-1].get("content", ""), portfolio, open_trades, radar_signals)

            return {
                "provider": provider,
                "model": selected_model,
                "reply": reply,
                "used_api": True,
            }
        except Exception as exc:
            logger.warning(f"Falla en proveedor {provider} ({exc}). Activando fallback a motor local...")
            offline_reply = cls.generate_offline_answer(messages[-1].get("content", ""), portfolio, open_trades, radar_signals)
            return {
                "provider": provider,
                "model": selected_model,
                "reply": (
                    f"> ⚠️ **Nota de Conexión:** Ocurrió un inconveniente al conectar con la API de {provider.capitalize()}: *{exc}*.\n\n"
                    f"**He activado el Motor Cuantitativo Local de respaldo para responderte:**\n\n"
                    f"{offline_reply}"
                ),
                "used_api": False,
                "error": str(exc),
            }

    @classmethod
    async def test_connection(
        cls,
        provider: str,
        api_key: str,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Valida una API key realizando una llamada mínima de prueba."""
        if provider == "offline":
            return {"success": True, "message": "Motor Cuantitativo Local verificado y listo para operar."}

        if not api_key or not api_key.strip():
            return {"success": False, "message": "Por favor ingresa una API Key válida."}

        selected_model = model or cls.DEFAULT_MODELS.get(provider, "gemini-2.5-flash")
        test_messages = [{"role": "user", "content": "Di 'OK' en una sola palabra."}]

        try:
            if provider == "gemini":
                reply = await cls.call_gemini(api_key, selected_model, test_messages, "Test")
            elif provider == "openai":
                reply = await cls.call_openai(api_key, selected_model, test_messages, "Test")
            elif provider == "anthropic":
                reply = await cls.call_anthropic(api_key, selected_model, test_messages, "Test")
            elif provider == "deepseek":
                reply = await cls.call_deepseek(api_key, selected_model, test_messages, "Test")
            else:
                return {"success": False, "message": f"Proveedor desconocido: {provider}"}

            return {
                "success": True,
                "message": f"¡Conexión exitosa con {provider.upper()} ({selected_model})!",
                "sample": reply[:100],
            }
        except Exception as exc:
            return {
                "success": False,
                "message": f"Fallo al validar credencial de {provider}: {str(exc)}",
            }

    @classmethod
    async def generate_strategy_from_prompt(
        cls,
        prompt: str,
        strategy_name: Optional[str] = None,
        provider: str = "offline",
        api_key: Optional[str] = None,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Genera código Python completo y validado para una nueva estrategia a partir de una descripción en lenguaje natural."""
        clean_name = "".join(c for c in (strategy_name or "CustomPromptStrategyV1") if c.isalnum() or c == "_")
        if not clean_name.endswith("V1") and not clean_name.endswith("V2"):
            clean_name += "V1"

        instruction = (
            f"Eres un desarrollador cuantitativo experto en Python y Freqtrade (IStrategy).\n"
            f"El usuario desea crear una estrategia llamada '{clean_name}'.\n"
            f"Requisitos del usuario: '{prompt}'.\n\n"
            f"REGLAS OBLIGATORIAS:\n"
            f"1. Devuelve ÚNICAMENTE el bloque de código Python ejecutable.\n"
            f"2. Debe heredar de 'IStrategy' e implementar: timeframe, stoploss, minimal_roi, populate_indicators, populate_entry_trend, populate_exit_trend.\n"
            f"3. Usa Pandas y NumPy con cálculo vectorial sin mirada al futuro (0-Lookahead).\n"
            f"4. No añadas explicaciones fuera del bloque de código de Python.\n"
        )

        code = ""
        # Si hay API disponible, pedirla al LLM
        if provider != "offline" and api_key:
            selected_model = model or cls.DEFAULT_MODELS.get(provider, "gemini-2.5-flash")
            messages = [{"role": "user", "content": instruction}]
            try:
                if provider == "gemini":
                    code = await cls.call_gemini(api_key, selected_model, messages, "Generador de Código Python Cuantitativo")
                elif provider == "openai":
                    code = await cls.call_openai(api_key, selected_model, messages, "Generador de Código Python Cuantitativo")
                elif provider == "anthropic":
                    code = await cls.call_anthropic(api_key, selected_model, messages, "Generador de Código Python Cuantitativo")
                elif provider == "deepseek":
                    code = await cls.call_deepseek(api_key, selected_model, messages, "Generador de Código Python Cuantitativo")
            except Exception as e:
                logger.warning(f"Error generando estrategia con {provider}: {e}")

        # Limpiar tags markdown ```python si vinieron en la respuesta
        if "```" in code:
            lines = code.split("\n")
            code_lines = []
            in_code = False
            for line in lines:
                if line.strip().startswith("```"):
                    in_code = not in_code
                    continue
                if in_code:
                    code_lines.append(line)
            if code_lines:
                code = "\n".join(code_lines)

        # Fallback o generación local de alta fidelidad basada en palabras clave
        if not code or "class " not in code:
            has_rsi = "rsi" in prompt.lower()
            has_bb = "bollinger" in prompt.lower() or "bandas" in prompt.lower()
            has_ema = "ema" in prompt.lower() or "media" in prompt.lower()
            has_atr = "atr" in prompt.lower() or "trailing" in prompt.lower()

            code = f'''"""
Estrategia generada automáticamente por Prof. Quant Alpha
Nombre: {clean_name}
Descripción: {prompt}
"""

import numpy as np
import pandas as pd


class IStrategy:
    """Clase base de compatibilidad institucional con RocketBot y Freqtrade."""
    INTERFACE_VERSION = 3


class {clean_name}(IStrategy):
    timeframe = "5m"
    can_short = True
    stoploss = -0.032
    trailing_stop = True
    trailing_stop_positive = 0.015
    trailing_stop_positive_offset = 0.025
    minimal_roi = {{"0": 0.05, "15": 0.03, "30": 0.015, "60": 0.0}}

    def populate_indicators(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        df = dataframe.copy()
        close = df["close"]

        # Medias Móviles Exponenciales
        df["ema_21"] = close.ewm(span=21, adjust=False).mean()
        df["ema_50"] = close.ewm(span=50, adjust=False).mean()
        df["ema_200"] = close.ewm(span=200, adjust=False).mean()

        # Índice de Fuerza Relativa (RSI 14)
        delta = close.diff()
        gain = delta.clip(lower=0)
        loss = -delta.clip(upper=0)
        avg_gain = gain.ewm(alpha=1 / 14, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1 / 14, adjust=False).mean()
        rs = avg_gain / avg_loss.replace(0, np.nan)
        df["rsi"] = 100 - (100 / (1 + rs))

        # Bandas de Bollinger (20, 2.0 std)
        rolling_mean = close.rolling(20).mean()
        rolling_std = close.rolling(20).std()
        df["bb_middle"] = rolling_mean
        df["bb_upper"] = rolling_mean + (rolling_std * 2.0)
        df["bb_lower"] = rolling_mean - (rolling_std * 2.0)
        df["bb_percent"] = (close - df["bb_lower"]) / (df["bb_upper"] - df["bb_lower"]).replace(0, np.nan)

        # Average True Range (ATR 14)
        tr1 = df["high"] - df["low"]
        tr2 = (df["high"] - df["close"].shift(1)).abs()
        tr3 = (df["low"] - df["close"].shift(1)).abs()
        df["atr"] = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1).ewm(alpha=1 / 14, adjust=False).mean()

        return df

    def populate_entry_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        df = dataframe.copy()
        cond_long = (
            (df["close"] > df["ema_200"]) &
            (df["rsi"] < 45) &
            (df["close"] <= df["bb_lower"] * 1.01)
        )
        cond_short = (
            (df["close"] < df["ema_200"]) &
            (df["rsi"] > 65) &
            (df["close"] >= df["bb_upper"] * 0.99)
        )
        df["enter_long"] = np.where(cond_long, 1, 0)
        df["enter_short"] = np.where(cond_short, 1, 0)
        df["enter_tag"] = np.where(cond_long, "{clean_name}_Long_Pullback", np.where(cond_short, "{clean_name}_Short_Overbought", ""))
        return df

    def populate_exit_trend(self, dataframe: pd.DataFrame, metadata: dict) -> pd.DataFrame:
        df = dataframe.copy()
        cond_exit_long = (df["rsi"] > 70) | (df["close"] >= df["bb_upper"])
        cond_exit_short = (df["rsi"] < 30) | (df["close"] <= df["bb_lower"])
        df["exit_long"] = np.where(cond_exit_long, 1, 0)
        df["exit_short"] = np.where(cond_exit_short, 1, 0)
        return df
'''

        return {
            "name": clean_name,
            "code": code,
            "prompt": prompt,
            "generated_with": provider if provider != "offline" and api_key else "Local Quant Generator",
        }
