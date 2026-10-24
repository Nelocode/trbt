import React, { useState } from 'react';
import { X, Send, Bell, CheckCircle2, AlertTriangle, ExternalLink, MessageSquare } from 'lucide-react';

interface TelegramDiscordModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
}

const STORAGE_KEY = 'rocketbot_notifications_config';

export const TelegramDiscordModal: React.FC<TelegramDiscordModalProps> = ({
  isOpen,
  onClose,
  apiBase,
}) => {
  const [config, setConfig] = useState<{
    discordWebhook: string;
    telegramToken: string;
    telegramChatId: string;
    notifyOnBuy: boolean;
    notifyOnSell: boolean;
    notifyOnCircuitBreaker: boolean;
  }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      discordWebhook: '',
      telegramToken: '',
      telegramChatId: '',
      notifyOnBuy: true,
      notifyOnSell: true,
      notifyOnCircuitBreaker: true,
    };
  });

  const [testResult, setTestResult] = useState<{
    loading: boolean;
    message?: string;
    success?: boolean;
  }>({ loading: false });

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
    onClose();
  };

  const handleTest = async () => {
    setTestResult({ loading: true });
    try {
      const res = await fetch(`${apiBase}/api/v1/notifications/dispatch-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook_url: config.discordWebhook,
          telegram_bot_token: config.telegramToken,
          telegram_chat_id: config.telegramChatId,
          title: 'Prueba de Alertas en Tiempo Real',
          message: '¡Conexión establecida! RocketBot Pro notificará cada orden y alerta de riesgo.',
        }),
      });
      const data = await res.json();
      setTestResult({
        loading: false,
        success: data.channels?.discord || data.channels?.telegram || true,
        message: data.message,
      });
    } catch (e: any) {
      setTestResult({
        loading: false,
        success: false,
        message: `Error de red: ${e.message}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0C101A] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#080A10]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Notificaciones 24/7 (Telegram & Discord)
              </h2>
              <p className="text-xs text-[#8E95A2]">
                Recibe capturas y alertas instantáneas en tu smartphone al abrir o cerrar posiciones.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-5 space-y-4">
          {/* Discord */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white flex items-center justify-between">
              <span>Discord Webhook URL:</span>
              <span className="text-[10px] text-[#8E95A2] font-mono">Canal de Discord</span>
            </label>
            <input
              type="text"
              value={config.discordWebhook}
              onChange={(e) => setConfig({ ...config, discordWebhook: e.target.value.trim() })}
              placeholder="https://discord.com/api/webhooks/..."
              className="w-full px-3 py-2 bg-[#080A10] border border-white/[0.1] rounded-xl text-xs text-white font-mono focus:border-[#0A7CFF] outline-none"
            />
          </div>

          {/* Telegram */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white flex items-center justify-between">
              <span>Telegram Bot Token & Chat ID:</span>
              <span className="text-[10px] text-[#8E95A2] font-mono">@BotFather</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={config.telegramToken}
                onChange={(e) => setConfig({ ...config, telegramToken: e.target.value.trim() })}
                placeholder="Token: 123456:ABC-DEF..."
                className="w-full px-3 py-2 bg-[#080A10] border border-white/[0.1] rounded-xl text-xs text-white font-mono focus:border-[#0A7CFF] outline-none"
              />
              <input
                type="text"
                value={config.telegramChatId}
                onChange={(e) => setConfig({ ...config, telegramChatId: e.target.value.trim() })}
                placeholder="Chat ID: -100123456..."
                className="w-full px-3 py-2 bg-[#080A10] border border-white/[0.1] rounded-xl text-xs text-white font-mono focus:border-[#0A7CFF] outline-none"
              />
            </div>
          </div>

          {/* Opciones de Eventos */}
          <div className="pt-2 border-t border-white/[0.06] space-y-2 text-xs">
            <label className="text-[11px] font-semibold text-[#8E95A2] uppercase tracking-wider block">
              Eventos a Notificar:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifyOnBuy}
                  onChange={(e) => setConfig({ ...config, notifyOnBuy: e.target.checked })}
                  className="rounded text-[#0A7CFF]"
                />
                <span className="text-white text-[11px]">Nuevas Entradas</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifyOnSell}
                  onChange={(e) => setConfig({ ...config, notifyOnSell: e.target.checked })}
                  className="rounded text-[#00DFDF]"
                />
                <span className="text-white text-[11px]">Cierres (TP/SL)</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/[0.05] cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifyOnCircuitBreaker}
                  onChange={(e) => setConfig({ ...config, notifyOnCircuitBreaker: e.target.checked })}
                  className="rounded text-[#FF3B69]"
                />
                <span className="text-white text-[11px]">Alertas de Riesgo</span>
              </label>
            </div>
          </div>

          {/* Resultado de Prueba */}
          {testResult.message && (
            <div
              className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                testResult.success
                  ? 'bg-[#00DFDF]/10 border-[#00DFDF]/30 text-[#00DFDF]'
                  : 'bg-[#FF3B69]/10 border-[#FF3B69]/30 text-[#FF3B69]'
              }`}
            >
              {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <button
              onClick={handleTest}
              disabled={testResult.loading || (!config.discordWebhook && !config.telegramToken)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-heading font-medium text-white transition cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 text-[#0A7CFF]" />
              <span>{testResult.loading ? 'Enviando...' : 'Enviar Prueba'}</span>
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl figma-btn-primary text-xs font-heading font-bold text-white transition cursor-pointer shadow-[0_0_15px_rgba(10,124,255,0.3)]"
            >
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
