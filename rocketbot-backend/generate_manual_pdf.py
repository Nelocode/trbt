"""
Script para generar el manual y guía técnica institucional de RocketBot Pro en PDF
"""

import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

OUTPUT_PATH = Path(__file__).resolve().parent / "rocketbot_manual_pro.pdf"

def generate_pdf():
    doc = SimpleDocTemplate(
        str(OUTPUT_PATH),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#0A7CFF")
    dark_bg = colors.HexColor("#0D1017")
    cyan_color = colors.HexColor("#00DFDF")
    pink_color = colors.HexColor("#FF3B69")
    text_color = colors.HexColor("#2D3139")
    text_light = colors.HexColor("#676D79")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        alignment=TA_CENTER,
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=text_light,
        alignment=TA_CENTER,
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1A1D23"),
        spaceBefore=10,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_color,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=text_color,
        leftIndent=14,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#0A7CFF"),
        backColor=colors.HexColor("#F4F6F9"),
        borderPadding=6,
        spaceAfter=6,
    )

    story = []

    # PORTADA / ENCABEZADO
    story.append(Spacer(1, 10))
    story.append(Paragraph("ROCKETBOT PRO", title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph("Manual de Operaciones, Estrategias Cuantitativas & Guía Multi-Mercado", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceAfter=14))

    # RESUMEN EJECUTIVO
    story.append(Paragraph("1. Resumen Ejecutivo del Sistema", h1_style))
    story.append(Paragraph(
        "<b>RocketBot Pro</b> es una plataforma unificada de trading cuantitativo de alto rendimiento inspirada en la arquitectura sólida de Freqtrade pero rediseñada para eliminar sus mayores cuellos de botella: latencia de sondeo (polling), división rígida de modos de ejecución, falta de observabilidad en vivo y estética utilitaria desactualizada.",
        body_style,
    ))
    story.append(Paragraph(
        "El sistema combina un <b>motor asíncrono en Python</b> (FastAPI + WebSockets + CCXT Live) con una <b>Terminal Web React 19</b> dotada de gráficos TradingView nativos, radar de confluencia multi-factor, laboratorio de backtesting continuo con auditoría anti-lookahead y aprendizaje automático en caliente (FreqAI Gradient Boosting).",
        body_style,
    ))

    # MODOS DE OPERACIÓN
    story.append(Spacer(1, 6))
    story.append(Paragraph("2. Modos de Operación: Simulado (Dry-Run) vs Dinero Real", h1_style))
    story.append(Paragraph(
        "Para garantizar la seguridad del capital, RocketBot opera bajo una estricta separación de capas:",
        body_style,
    ))

    modes_data = [
        ["Aspecto", "Modo Simulado (Dry-Run Activo)", "Modo Dinero Real (Live)"],
        ["Precios y Velas", "100% Reales vía CCXT / Binance Stream", "100% Reales vía CCXT / Binance Stream"],
        ["Cálculo Técnico", "Pandas, NumPy, Indicadores reales", "Pandas, NumPy, Indicadores reales"],
        ["Predicciones IA", "FreqAI GradientBoosting en caliente", "FreqAI GradientBoosting en caliente"],
        ["Capital / Saldo", "Simulado ($10,000 USDT virtuales)", "Balance Real en Exchange / Broker"],
        ["Enrutamiento de Órdenes", "Memoria local protegida", "Ejecución en libro de órdenes con API Key"],
        ["Riesgo Financiero", "Cero (Entorno de entrenamiento)", "Real (Apalancamiento y liquidación activos)"],
    ]
    t_modes = Table(modes_data, colWidths=[1.8*inch, 2.7*inch, 2.7*inch])
    t_modes.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CED4E0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_modes)

    # ESTRATEGIA MULTI-FACTOR
    story.append(Spacer(1, 10))
    story.append(Paragraph("3. Desglose de la Estrategia: RocketMultiFactorV1", h1_style))
    story.append(Paragraph(
        "La estrategia institucional por defecto fue formulada para resolver la causa #1 de pérdida en bots minoristas: operar rebotes aislados en contra de la tendencia primaria. Combina 5 filtros matemáticos simultáneos:",
        body_style,
    ))

    strat_bullets = [
        "<b>1. Filtro de Régimen Macro (EMA 200 + ADX):</b> Si el precio actual cotiza por debajo de la EMA 200, se bloquean todas las compras Long ordinarias. Se requiere que la tendencia primaria esté alineada a favor de la dirección del trade.",
        "<b>2. Extremos de Volatilidad (Bandas de Bollinger %B):</b> Mide la posición normalizada del precio entre las bandas. Un %B &le; 0.15 exige agotamiento de venta antes de permitir la entrada Long.",
        "<b>3. Oscilador de Momentum (RSI 14 Suavizado):</b> Exige que el RSI esté en zona de sobreventa (&le; 34 por defecto) pero con inicio de divergencia positiva.",
        "<b>4. Confirmación de Giro (Histograma MACD):</b> Exige que la barra del histograma sea mayor a la anterior (curvatura ascendente), confirmando que la presión vendedora está cediendo.",
        "<b>5. Volumen Relativo Institucional (RVOL &ge; 1.15x):</b> Compara el volumen actual contra la media de 20 períodos. Descarta movimientos sin participación de liquidez.",
    ]
    for b in strat_bullets:
        story.append(Paragraph(b, bullet_style))

    story.append(Spacer(1, 6))
    story.append(Paragraph("Gestión de Salida y Seguridad:", h2_style))
    risk_bullets = [
        "<b>Stoploss Adaptativo por ATR:</b> No usa un porcentaje estático arbitrario. Ajusta la distancia del stop según la volatilidad promedio real (ATR x 2.2).",
        "<b>Tabla de ROI Escalonada:</b> Toma de ganancias progresiva (+4.5% en spike inmediato, +2.8% tras 15 min, +1.6% tras 45 min).",
        "<b>Trailing Stop Protegido:</b> Se activa al alcanzar +2.2% de ganancia y persigue el precio a una distancia de 1.2% para asegurar el beneficio ante reversiones.",
        "<b>Re-entradas Inteligentes (DCA):</b> Permite hasta 2 órdenes de seguridad solo cuando el precio toca soporte estadístico con agotamiento de venta.",
    ]
    for rb in risk_bullets:
        story.append(Paragraph(rb, bullet_style))

    story.append(PageBreak())

    # SECCIÓN MULTI-ACTIVOS: COMMODITIES, FOREX, ÍNDICES
    story.append(Paragraph("4. Expansión Multi-Activo: Commodities, Divisas e Índices", h1_style))
    story.append(Paragraph(
        "Una de las ventajas competitivas más potentes de RocketBot Pro es que <b>el motor técnico (Pandas + TA + FreqAI + Gestión de Riesgo) es completamente agnóstico al instrumento financiero</b>. Las mismas matemáticas de confluencia aplican exactamente igual para materias primas, pares de divisas tradicionales o acciones.",
        body_style,
    ))
    story.append(Paragraph(
        "A continuación se detallan las 3 vías de integración para habilitar cualquier mercado:",
        body_style,
    ))

    multi_assets_table = [
        ["Mercado", "Activos Típicos", "Conector Tecnológico", "Ventajas de Operar con RocketBot"],
        [
            "Commodities\n(Materias Primas)",
            "Oro (XAU/USD)\nPetróleo (WTI/BRENT)\nPlata (XAG/USD)",
            "Brokers MetaTrader 5 (MT5 Python)\no Interactive Brokers (IBKR TWS API)\no CFDs en Bybit/BingX",
            "Fuerte respeto a zonas técnicas de EMA 200 y soportes ATR. Alta predictibilidad en sesiones de Londres/NY.",
        ],
        [
            "Divisas (Forex)",
            "EUR/USD, GBP/USD\nUSD/JPY, AUD/USD",
            "OANDA REST API v20\no MT5 / cTrader Automate",
            "Bajos spreads, alta liquidez institucional, operación continua 24/5 con micro-lotes precisos.",
        ],
        [
            "Índices & Acciones",
            "S&P 500 (SPY), Nasdaq (QQQ)\nNVDA, AAPL, TSLA",
            "Alpaca Markets API (Cero comisión)\no Interactive Brokers",
            "Permite aplicar filtros de régimen macro sobre los índices principales para operar acciones individuales.",
        ],
    ]
    t_multi = Table(multi_assets_table, colWidths=[1.4*inch, 1.6*inch, 2.0*inch, 2.2*inch])
    t_multi.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CED4E0")),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_multi)

    story.append(Spacer(1, 10))
    story.append(Paragraph("Ejemplo de Integración Directa con Forex / Commodities vía OANDA o Alpaca:", h2_style))
    story.append(Paragraph(
        "Al estar construido sobre Python modular, basta conectar la clase DataProvider a una llamada REST del broker:",
        body_style,
    ))
    story.append(Paragraph(
        """# Conexión instantánea de velas de Oro (XAU/USD) o EUR/USD
import oandapyV20
from oandapyV20.endpoints.instruments import InstrumentsCandles

client = oandapyV20.API(access_token="OANDA_TOKEN")
params = {"count": 250, "granularity": "M5", "price": "M"}
r = InstrumentsCandles(instrument="XAU_USD", params=params)
client.request(r)
# El DataFrame resultante se inyecta directamente al motor de RocketBot""",
        code_style,
    ))

    # GUÍA PASO A PASO
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. Guía de Operación Paso a Paso en la Terminal", h1_style))
    
    steps = [
        ("Paso 1: Monitoreo del Radar de Confluencia", "Revisa la columna derecha de la terminal. El radar clasifica las monedas de mayor a menor probabilidad (0 a 100%). Busca activos con al menos 4 de 5 condiciones en verde antes de considerar entradas."),
        ("Paso 2: Inspección Visual en el Gráfico TradingView", "Haz clic sobre el par en el radar. El gráfico cargará automáticamente sus velas, indicadores y las líneas institucionales de TP (Cyan), SL (Rosa) y Re-entrada DCA (Amarillo)."),
        ("Paso 3: Consulta de Tooltips Explicativos (?)", "Cada métrica, control y parámetro cuenta con un ícono '?' interactivo. Pasa el cursor sobre ellos para conocer la fórmula técnica y el impacto operativo en tu dinero."),
        ("Paso 4: Ejecución Inmediata o Automática", "Puedes dejar que el bot opere automáticamente cuando se cumpla el 100% de las reglas o forzar una entrada inmediata con los botones de un solo clic 'Entrar LONG' o 'Entrar SHORT'."),
        ("Paso 5: Validación y Backtest sin Parar el Bot", "Pasa a la pestaña 'Backtest & Hyperopt'. Puedes correr simulaciones sobre velas históricas, comprobar que no haya sesgo de futuro (Lookahead Audit = 0) y optimizar parámetros con IA."),
        ("Paso 6: Auditoría Preventiva con el Mentor IA (Prof. Quant Alpha)", "Haz clic en 'Mentor IA' o en el botón flotante inferior para recibir un diagnóstico inmediato de margen, distancias a liquidación y sugerencias para optimizar tus estrategias."),
    ]

    for title, desc in steps:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", bullet_style))

    # SECCIÓN 6: MENTOR IA Y AUDITOR MULTI-PROVEEDOR
    story.append(Spacer(1, 10))
    story.append(Paragraph("6. Mentor & Auditor IA Cuántico Multi-Proveedor", h1_style))
    story.append(Paragraph(
        "RocketBot Pro integra al <b>Prof. Quant Alpha</b>, un copiloto con rol de Auditor Senior de Riesgo de Fondos Cuantitativos y Profesor de Trading Algorítmico:",
        body_style,
    ))

    ai_features = [
        ("Auditoría en Tiempo Real de Cartera", "A diferencia de un chat convencional, el motor inyecta automáticamente la telemetría viva (Equity, margen comprometido %, distancias a liquidación de cada activo y PnL flotante) para emitir diagnósticos matemáticos rigurosos."),
        ("Semáforo de Riesgo y Alertas Tempranas", "Evalúa un Risk Score de 0 a 100. Dispara advertencias preventivas si el margen supera el 30%, si una posición se aproxima a liquidación (<8%) o si hay concentración excesiva en un solo sector."),
        ("Soporte Multi-API (Gemini, Claude, GPT-4o, DeepSeek y Motor Local)", "Permite al usuario ingresar sus propias claves de Google Gemini, Anthropic Claude, OpenAI o DeepSeek (guardadas de forma 100% segura en el navegador), o utilizar el Motor Cuántico Local offline sin coste de tokens."),
        ("Profesor de Estrategias e Hiperparámetros", "Resuelve dudas técnicas sobre fórmulas matemáticas (Canales de Donchian, Bandas de Bollinger, ADX, ATR trailing) y orienta sobre qué rangos optimizar en el módulo de Hyperopt."),
    ]

    for f_title, f_desc in ai_features:
        story.append(Paragraph(f"• <b>{f_title}:</b> {f_desc}", bullet_style))

    # SECCIÓN 7: CONTROL EXTREMO DE RIESGO
    story.append(Spacer(1, 10))
    story.append(Paragraph("7. Control Extremo de Riesgo & Circuit Breakers", h1_style))
    story.append(Paragraph(
        "Mecanismos de grado militar para la protección y dimensionamiento del patrimonio:",
        body_style,
    ))
    risk_points = [
        ("Interruptor de Pánico (Kill-Switch)", "Liquida inmediatamente todas las posiciones abiertas a precio de mercado y cancela órdenes pendientes ante flash crashes o noticias imprevistas."),
        ("Disyuntor Diario Automático (Circuit Breaker)", "Bloquea automáticamente la apertura de nuevos trades si la pérdida diaria acumulada supera el 4.0% o si se registran 3 pérdidas consecutivas, imponiendo 12 horas de enfriamiento."),
        ("Dimensionamiento Óptimo de Kelly Fraccional (0.35x)", "Regula matemáticamente el capital sugerido por trade en base a la tasa de acierto (Win Rate) y ratio ganancia/pérdida, garantizando la eliminación del riesgo de ruina."),
    ]
    for r_title, r_desc in risk_points:
        story.append(Paragraph(f"• <b>{r_title}:</b> {r_desc}", bullet_style))

    # SECCIÓN 8: SUITE INSTITUCIONAL
    story.append(Spacer(1, 10))
    story.append(Paragraph("8. Suite Institucional: Correlación, Prop Firms & Alertas", h1_style))
    story.append(Paragraph(
        "Herramientas avanzadas accesibles desde la barra superior de la terminal:",
        body_style,
    ))
    inst_points = [
        ("Matriz de Correlación Cruzada Rolling (30 Períodos)", "Calcula en segundo plano la covarianza de Pearson entre los 12 activos (Cripto, Oro, WTI, Divisas e Índices) y dispara alertas ante coeficientes > 0.75 para evitar sobreexposición direccional."),
        ("Escudo de Cuentas Fondeadas (Prop Firm Shield)", "Monitorea al segundo el cumplimiento estricto de las reglas FTMO y Apex: límite de pérdida diaria (5%), pérdida máxima total (10%) y meta de beneficio (8%)."),
        ("Notificaciones Móviles 24/7 (Telegram & Discord)", "Envía alertas inmediatas a tu smartphone cuando el bot entra, toma beneficios (TP), corta pérdidas (SL) o activa una protección de riesgo."),
        ("Modo Privacidad Oculto", "Enmascara con un clic todas las cifras monetarias con '$••••••' para sesiones de streaming, grabaciones o entornos públicos."),
    ]
    for i_title, i_desc in inst_points:
        story.append(Paragraph(f"• <b>{i_title}:</b> {i_desc}", bullet_style))

    # SECCIÓN 9: MONTE CARLO & PROMPT-TO-STRATEGY
    story.append(Spacer(1, 10))
    story.append(Paragraph("9. Validación Estocástica de Monte Carlo & Prompt-to-Strategy", h1_style))
    story.append(Paragraph(
        "Máxima robustez matemática y creación acelerada de estrategias con Inteligencia Artificial:",
        body_style,
    ))
    mc_points = [
        ("Simulación de Monte Carlo (10,000 Iteraciones)", "Baraja el orden de las operaciones con reemplazo para calcular el Value at Risk (VaR 95%), el CVaR de cola y la distribución de capital proyectada por percentiles (p10, p25, p50, p75, p90)."),
        ("Generador de Estrategias Prompt-to-Strategy", "Permite describir en lenguaje natural cualquier hipótesis de mercado para que la IA genere el script Python completo compatible con IStrategy, guardándolo en user_data/strategies/ para simulación inmediata."),
        ("Voice Copilot con Síntesis de Voz", "Interacción por micrófono para consultar al mentor cuantitativo y recepción de análisis hablados en español."),
    ]
    for m_title, m_desc in mc_points:
        story.append(Paragraph(f"• <b>{m_title}:</b> {m_desc}", bullet_style))

    # SECCIÓN 10: SISTEMA MULTICUENTA AISLADO (MAM / PAMM)
    story.append(Spacer(1, 10))
    story.append(Paragraph("10. Sistema Multicuenta Aislado (MAM / PAMM) & Zero-Contamination", h1_style))
    story.append(Paragraph(
        "Arquitectura multi-tenant de grado hedge fund para operar múltiples cuentas sin colisión de órdenes ni balances:",
        body_style,
    ))
    mam_points = [
        ("Aislamiento Estricto (Zero-Cross Contamination)", "Cada subcuenta es 100% independiente. Sus posiciones, márgenes, órdenes y saldo jamás se cruzan con otra subcuenta. Los datos se persisten en directorios dedicados en user_data/accounts/{account_id}/."),
        ("Perfiles Preconfigurados", "Incluye cuentas configuradas de fábrica para: Dry-Run ($10k), Desafío Prop Firm FTMO ($100k con límites de pérdida 5% diario y 10% total), Bybit Scalping ($5k) y Fondos de Índices S&P/Nasdaq ($50k)."),
        ("Panel Maestro Consolidado (MAM)", "Supervisa en un único cuadro de mando el capital total combinado, saldo libre agregado vs margen comprometido, y rendimiento acumulado."),
        ("Kill-Switch Dual (Individual y Global)", "Permite liquidar posiciones de forma quirúrgica para una subcuenta en apuros o detonar el Kill-Switch Maestro que liquida todas las cuentas del sistema en emergencias."),
    ]
    for a_title, a_desc in mam_points:
        story.append(Paragraph(f"• <b>{a_title}:</b> {a_desc}", bullet_style))

    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CED4E0"), spaceAfter=8))
    story.append(Paragraph(
        "RocketBot Pro • Manual de Operaciones • Confidencial & Propiedad del Usuario • Versión 2.0",
        ParagraphStyle('Footer', parent=styles['Normal'], fontName='Helvetica', fontSize=8, textColor=text_light, alignment=TA_CENTER),
    ))

    doc.build(story)
    print(f"PDF generado con éxito en: {OUTPUT_PATH}")

if __name__ == "__main__":
    generate_pdf()
