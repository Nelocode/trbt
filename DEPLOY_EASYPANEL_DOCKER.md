# 🚀 Guía de Despliegue en Easypanel y Docker: RocketBot Pro v2.0

Esta guía detalla paso a paso cómo subir y ejecutar **RocketBot Pro** en producción utilizando **Easypanel** (panel moderno sobre Docker) o cualquier servidor VPS con **Docker / Docker Compose**.

---

## 📋 Arquitectura de Despliegue

RocketBot Pro está preparado para ejecutarse bajo dos modalidades:

| Modalidad | Descripción | Recomendado Para |
| :--- | :--- | :--- |
| **Fullstack Unificado (1 Solo Contenedor)** | Compila el frontend React y lo sirve directamente a través del motor asíncrono FastAPI en el puerto `8090`. Cero problemas de CORS, latencia mínima y menor consumo de RAM. | **Easypanel (Opción Recomendada)**, VPS pequeños (1GB-2GB RAM). |
| **Microservicios Separados** | Frontend servido por Nginx Alpine (`:3000`) y Backend API FastAPI (`:8090`). | Entornos distribuidos o arquitecturas desacopladas. |

---

## 🛠️ Método 1: Despliegue en Easypanel (Paso a Paso)

Easypanel gestiona contenedores Docker con interfaz gráfica, certificados SSL automáticos (Let's Encrypt) y configuración de dominios en segundos.

### Paso 1: Crear el Servicio en Easypanel
1. Entra a tu panel de **Easypanel** (`https://tu-servidor:3000`).
2. Entra a tu proyecto (o crea uno nuevo llamado `trading` o `rocketbot`).
3. Haz clic en **`+ Service`** y selecciona **`App`**.
4. Nombra el servicio: `rocketbot-pro`.

### Paso 2: Conectar el Repositorio Git
1. En la pestaña **General / Source**:
   - Selecciona **GitHub**, **GitLab** o **Git Repository**.
   - Ingresa la URL de tu repositorio y la rama (ej: `main` o `master`).
2. En la sección **Build**:
   - Tipo de compilación: **Dockerfile**.
   - Dockerfile path: `Dockerfile` (el archivo unificado en la raíz).

### Paso 3: Configurar Puertos
1. En la pestaña **Ports**:
   - Publicar puerto: `8090` (Target Port: `8090`).
   - Si deseas acceso web directo con dominio propio, no necesitas exponer el puerto públicamente en el host, Easypanel lo enrutará por su reverse proxy Traefik.

### Paso 4: Volumen Persistente (¡MUY IMPORTANTE!)
Para que tus cuentas aisladas, estrategias generadas por IA y el historial de operaciones no se pierdan al actualizar el contenedor:
1. Ve a la pestaña **Storage / Mounts**.
2. Haz clic en **`+ Add Mount`**.
   - **Type**: `Volume`
   - **Name**: `rocketbot_data`
   - **Mount Path**: `/app/user_data`

### Paso 5: Asignar Dominio con HTTPS Automático
1. Ve a la pestaña **Domains**.
2. Haz clic en **`+ Add Domain`**.
   - Ingresa tu subdominio (ej: `bot.tu-dominio.com`).
   - Asegúrate de que el DNS de tu dominio apunte a la IP de tu VPS con un registro `A`.
   - **Port**: `8090`
   - Marca la casilla **Enable HTTPS / SSL** (Easypanel emitirá un certificado gratuito de Let's Encrypt).
3. Haz clic en **Deploy**.

> 💡 **Nota sobre WebSockets en Easypanel:** Easypanel incluye soporte nativo transparente para WebSockets (`/ws/stream`) sin necesidad de configurar encabezados adicionales.

---

## 🐳 Método 2: Despliegue con Docker Compose en Easypanel

Si prefieres usar la función Compose de Easypanel:
1. En tu proyecto de Easypanel, haz clic en **`+ Service`** -> **`Docker Compose`**.
2. Pega el contenido de nuestro archivo [`docker-compose.yml`](file:///Users/i2carvajal/Documents/Proyectos/RocketBot/docker-compose.yml).
3. Haz clic en **Save** y luego en **Deploy**.

---

## 🖥️ Método 3: Despliegue en VPS Linux (Docker Engine Directo)

Si utilizas un servidor VPS (Ubuntu 22.04 / 24.04 o Debian 12):

### 1. Instalar Docker y Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

### 2. Clonar el Repositorio y Configurar
```bash
git clone <TU_REPOSITORIO_GIT> /opt/rocketbot
cd /opt/rocketbot
cp .env.example .env
```

### 3. Iniciar el Bot en Segundo Plano
```bash
# Iniciar modo unificado fullstack
docker compose up -d --build

# Verificar que los contenedores están saludables (healthy)
docker compose ps
```

### 4. Ver Registros en Vivo
```bash
docker compose logs -f rocketbot
```

### 5. Acceder a la Plataforma
Abre tu navegador en:
`http://IP_DE_TU_VPS:8090`

---

## ⚙️ Variables de Entorno Opcionales (`.env`)

| Variable | Predeterminado | Descripción |
| :--- | :--- | :--- |
| `PORT` | `8090` | Puerto interno del servidor. |
| `HOST` | `0.0.0.0` | Dirección de enlace de red. |
| `PYTHONUNBUFFERED` | `1` | Fuerza a Python a enviar logs inmediatamente a Docker sin buffer. |
| `TELEGRAM_BOT_TOKEN` | *(vacío)* | Token del bot de Telegram para alertas institucionales. |
| `TELEGRAM_CHAT_ID` | *(vacío)* | ID del chat o canal de Telegram receptor. |
| `DISCORD_WEBHOOK_URL` | *(vacío)* | URL de webhook de Discord para avisos de riesgo. |
| `GEMINI_API_KEY` | *(vacío)* | Clave de API de Google Gemini para el Prof. Quant Alpha. |
| `ANTHROPIC_API_KEY` | *(vacío)* | Clave de Anthropic Claude 3.5. |
| `OPENAI_API_KEY` | *(vacío)* | Clave de OpenAI GPT-4o. |

*(Nota: Las claves de API de IA también se pueden configurar dinámicamente desde el cajón del Mentor IA en la interfaz web con cifrado en el navegador).*

---

## 💾 Respaldo y Migración de Datos

Toda la información del sistema se guarda en el directorio `/app/user_data/`:
- `user_data/accounts/`: Cada subcuenta con su propio `config.json`, `portfolio.json` y `trades.json`.
- `user_data/strategies/`: Estrategias en Python (incluidas las generadas por Prompt-to-Strategy).

Para hacer un backup manual en tu VPS:
```bash
tar -czvf rocketbot_backup_$(date +%F).tar.gz user_data/
```
Para restaurar:
```bash
tar -xzvf rocketbot_backup_YYYY-MM-DD.tar.gz
docker compose restart
```
