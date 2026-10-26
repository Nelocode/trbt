import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  Copy,
  Check,
  Eye,
  EyeOff,
  Radio,
  Server,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Trash2,
  Coins,
  CheckCircle2,
} from 'lucide-react';

export interface ExchangeCredentialsInfo {
  exchange: string;
  api_key_masked: string;
  is_testnet: boolean;
  trading_mode?: string;
  connected_at?: string;
  last_verified_at?: string;
  balances?: Record<string, number>;
  permissions?: {
    can_read?: boolean;
    can_trade?: boolean;
    withdrawals_disabled?: boolean;
    safety_score?: string;
    warning?: string;
    spot_trading?: boolean;
    futures_trading?: boolean;
  };
  status?: string;
}

interface ConnectExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  token?: string;
  accountId: string;
  accountName: string;
  currentCredentials?: ExchangeCredentialsInfo | null;
  onCredentialsUpdated: () => void;
}

const SUPPORTED_EXCHANGES = [
  {
    id: 'binance',
    name: 'Binance',
    color: '#F0B90B',
    badge: 'Spot & Futuros USDT-M',
    url: 'https://www.binance.com/es/my/settings/api-management',
    needsPassphrase: false,
  },
  {
    id: 'bybit',
    name: 'Bybit',
    color: '#FFA500',
    badge: 'Unified Trading Account',
    url: 'https://www.bybit.com/app/user/api-management',
    needsPassphrase: false,
  },
  {
    id: 'okx',
    name: 'OKX',
    color: '#0052FF',
    badge: 'Requiere Passphrase',
    url: 'https://www.okx.com/account/my-api',
    needsPassphrase: true,
  },
  {
    id: 'bingx',
    name: 'BingX',
    color: '#2B66FE',
    badge: 'Perpetual Futures & Spot',
    url: 'https://bingx.com/es-es/account/api',
    needsPassphrase: false,
  },
  {
    id: 'bitget',
    name: 'Bitget',
    color: '#00F0FF',
    badge: 'Requiere Passphrase',
    url: 'https://www.bitget.com/es/account/api',
    needsPassphrase: true,
  },
];

export const ConnectExchangeModal: React.FC<ConnectExchangeModalProps> = ({
  isOpen,
  onClose,
  apiBase,
  token,
  accountId,
  accountName,
  currentCredentials,
  onCredentialsUpdated,
}) => {
  const [selectedExchange, setSelectedExchange] = useState<string>('binance');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isTestnet, setIsTestnet] = useState(false);
  const [tradingMode, setTradingMode] = useState<'spot' | 'futures'>('futures');

  const [serverIp, setServerIp] = useState('147.93.113.16');
  const [copiedIp, setCopiedIp] = useState(false);

  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const [testResult, setTestResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar estado inicial y Server IP cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    setTestResult(null);

    const fetchStatus = async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${apiBase}/api/v1/exchange/status?account_id=${accountId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.server_ip) setServerIp(data.server_ip);
          if (data.credentials?.exchange) {
            setSelectedExchange(data.credentials.exchange);
          }
        }
      } catch (err) {
        // Silencioso
      }
    };
    fetchStatus();
  }, [isOpen, accountId, apiBase, token]);

  if (!isOpen) return null;

  const currentExchangeMeta = SUPPORTED_EXCHANGES.find((e) => e.id === selectedExchange) || SUPPORTED_EXCHANGES[0];

  const handleCopyIp = () => {
    navigator.clipboard.writeText(serverIp);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setErrorMessage('Por favor ingresa la Clave API y el Secreto para realizar el test.');
      return;
    }
    if (currentExchangeMeta.needsPassphrase && !passphrase.trim()) {
      setErrorMessage(`El exchange ${currentExchangeMeta.name} requiere ingresar tu Passphrase.`);
      return;
    }

    setIsTesting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setTestResult(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/v1/exchange/test-connection`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          exchange: selectedExchange,
          api_key: apiKey.trim(),
          api_secret: apiSecret.trim(),
          passphrase: passphrase.trim() || undefined,
          is_testnet: isTestnet,
          trading_mode: tradingMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Fallo de conexión con el Exchange');
      }

      setTestResult(data);
      setSuccessMessage('¡Conexión verificada exitosamente! Se auditaron permisos y latencia.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al probar conexión con el Exchange.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setErrorMessage('Por favor completa las credenciales de tu exchange.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/v1/exchange/save-keys`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          account_id: accountId,
          exchange: selectedExchange,
          api_key: apiKey.trim(),
          api_secret: apiSecret.trim(),
          passphrase: passphrase.trim() || undefined,
          is_testnet: isTestnet,
          trading_mode: tradingMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Error al guardar credenciales');
      }

      setSuccessMessage(data.message || '¡Exchange vinculado con éxito bajo cifrado AES-256-GCM!');
      setApiKey('');
      setApiSecret('');
      setPassphrase('');
      onCredentialsUpdated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando credenciales cifradas.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(`¿Estás seguro de desvincular el exchange de la cuenta "${accountName}"? Volverá al modo simulación Dry-Run.`)) {
      return;
    }

    setIsDisconnecting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiBase}/api/v1/exchange/disconnect?account_id=${accountId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Error al desvincular');
      }

      setSuccessMessage('Exchange desvinculado con éxito. Modo simulación activo.');
      onCredentialsUpdated();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al desconectar exchange.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const isAlreadyConnected = !!currentCredentials?.api_key_masked;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0F111A] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] bg-gradient-to-r from-blue-950/30 via-cyan-950/20 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  Bóveda Criptográfica AES-256-GCM
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  No-Custodial 100%
                </span>
              </div>
              <h2 className="text-base font-bold text-white font-heading mt-0.5">
                Conectar Exchange de Criptomonedas
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition p-1.5 rounded-lg hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-white/80">
          {/* Target Subaccount Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div>
              <span className="text-[11px] text-white/50 block">Subcuenta Destino:</span>
              <span className="font-semibold text-white text-xs">{accountName}</span>
              <span className="text-[10px] text-white/40 font-mono ml-2">({accountId})</span>
            </div>
            {isAlreadyConnected ? (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-300">
                  {currentCredentials.exchange?.toUpperCase()} Conectado ({currentCredentials.api_key_masked})
                </span>
              </div>
            ) : (
              <span className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
                Modo Simulación (Dry-Run)
              </span>
            )}
          </div>

          {/* Already Connected Info & Disconnect */}
          {isAlreadyConnected && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-semibold text-white text-xs">Claves Vinculadas y Verificadas</span>
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDisconnecting ? 'Desvinculando...' : 'Desvincular Claves'}
                </button>
              </div>

              {currentCredentials.balances && Object.keys(currentCredentials.balances).length > 0 && (
                <div className="pt-2 border-t border-emerald-500/20">
                  <span className="text-[11px] text-emerald-300/80 block mb-1">Balances descubiertos en tu cuenta:</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(currentCredentials.balances).map(([asset, amt]) => (
                      <span key={asset} className="text-xs px-2.5 py-1 rounded bg-black/40 border border-white/10 font-mono text-white">
                        {asset}: <strong className="text-emerald-400">{amt}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Exchange Selector */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              1. Selecciona tu Exchange de Trading:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUPPORTED_EXCHANGES.map((exc) => {
                const isSelected = selectedExchange === exc.id;
                return (
                  <button
                    key={exc.id}
                    type="button"
                    onClick={() => {
                      setSelectedExchange(exc.id);
                      setTestResult(null);
                    }}
                    className={`flex flex-col text-left p-3 rounded-xl border transition relative ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-sm text-white">{exc.name}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: exc.color }}
                      />
                    </div>
                    <span className="text-[10px] text-white/50">{exc.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Safety Checklist & IP Whitelist */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>Instrucciones de Seguridad Bancaria</span>
              </div>
              <a
                href={currentExchangeMeta.url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
              >
                Abrir API en {currentExchangeMeta.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ul className="space-y-1 text-white/75 text-[11px] list-disc list-inside">
              <li>
                Activa solo permisos de <strong className="text-white">Lectura</strong> y{' '}
                <strong className="text-white">Trading (Spot o Futuros)</strong>.
              </li>
              <li className="text-amber-300 font-semibold">
                ⚠️ NUNCA habilites "Retiros (Enable Withdrawals)". RocketBot auditará esto automáticamente.
              </li>
            </ul>

            {/* IP Whitelist Card */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/50 uppercase font-mono block">
                  IP del Servidor (Para Whitelist en Exchange):
                </span>
                <span className="font-mono text-xs font-bold text-cyan-300">{serverIp}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyIp}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.08] hover:bg-white/[0.15] text-xs font-medium text-white transition"
              >
                {copiedIp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/60" />
                    <span>Copiar IP</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Credentials */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                API Key:
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Pega aquí tu Clave API pública..."
                className="w-full px-3 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-white/70">
                  API Secret:
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-[11px] text-white/50 hover:text-white flex items-center gap-1"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showSecret ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <input
                type={showSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                placeholder="Pega aquí tu API Secret..."
                className="w-full px-3 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            {currentExchangeMeta.needsPassphrase && (
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  API Passphrase ({currentExchangeMeta.name}):
                </label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Contraseña creada al generar la API Key..."
                  className="w-full px-3 py-2.5 bg-black/40 border border-white/[0.12] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Trading Mode & Testnet Options */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Modalidad de Trading:
                </label>
                <select
                  value={tradingMode}
                  onChange={(e: any) => setTradingMode(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141620] border border-white/[0.12] rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="futures">Futuros USDT-M (Perpetuos)</option>
                  <option value="spot">Mercado Spot</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={isTestnet}
                    onChange={(e) => setIsTestnet(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0"
                  />
                  <span>Conectar a Testnet / Sandbox</span>
                </label>
              </div>
            </div>
          </div>

          {/* Test Audit Results Banner */}
          {testResult && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Auditoría de Seguridad CCXT Aprobada</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div className="p-2 rounded bg-black/40 border border-white/10">
                  <span className="text-[10px] text-white/50 block">Latencia Servidor:</span>
                  <span className="font-bold text-cyan-300 font-mono">{testResult.latency_ms} ms</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/10">
                  <span className="text-[10px] text-white/50 block">Retiros Desactivados:</span>
                  <span className="font-bold text-emerald-400">
                    {testResult.permissions?.withdrawals_disabled ? '✓ SÍ (Seguro)' : '⚠️ Habilitados'}
                  </span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-white/10">
                  <span className="text-[10px] text-white/50 block">Saldo Libre USDT:</span>
                  <span className="font-bold text-emerald-400 font-mono">${testResult.usdt_free ?? 0}</span>
                </div>
              </div>

              {testResult.permissions?.warning && (
                <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mt-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{testResult.permissions.warning}</span>
                </div>
              )}
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || isSaving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 text-xs font-semibold transition disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditando conexión...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Probar Conexión & Seguridad</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.05] transition"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSaveConnection}
              disabled={isSaving || isTesting || !apiKey || !apiSecret}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black text-xs font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cifrando en Bóveda...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Cifrar y Vincular al Robot</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
