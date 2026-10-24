# ==============================================================================
# RocketBot Pro - Dockerfile Unificado de Producción (Easypanel & Docker)
# ==============================================================================
# Etapa 1: Compilación de Frontend React + Tailwind + Vite
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/rocketbot-ui

COPY rocketbot-ui/package*.json ./
RUN npm install --frozen-lockfile || npm install

COPY rocketbot-ui/ ./
RUN npm run build

# ==============================================================================
# Etapa 2: Servidor Unificado Python (FastAPI + WebSockets + CCXT + SPA)
# ==============================================================================
FROM python:3.10-slim AS runner

WORKDIR /app

# Dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python desde requirements.txt
COPY rocketbot-backend/requirements.txt /app/rocketbot-backend/requirements.txt
RUN pip install --no-cache-dir -r /app/rocketbot-backend/requirements.txt

# Copiar código del backend
COPY rocketbot-backend /app/rocketbot-backend

# Copiar archivos base de usuario (cuentas, estrategias)
COPY user_data /app/user_data

# Copiar el frontend compilado desde la Etapa 1
COPY --from=frontend-builder /app/rocketbot-ui/dist /app/dist

# Variables de entorno predeterminadas
ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/rocketbot-backend \
    PORT=8090 \
    HOST=0.0.0.0

# Volumen persistente para cuentas aisladas, estrategias y datos de mercado
VOLUME ["/app/user_data"]

EXPOSE 8090

# Verificación de salud (Healthcheck)
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://127.0.0.1:${PORT:-8090}/api/v1/overview || exit 1

# Iniciar servidor unificado (FastAPI atiende API, WebSockets y frontend SPA)
CMD ["sh", "-c", "uvicorn server:app --host ${HOST:-0.0.0.0} --port ${PORT:-8090} --workers 1"]
