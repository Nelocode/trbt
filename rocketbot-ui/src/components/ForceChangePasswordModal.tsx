import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

interface ForceChangePasswordModalProps {
  isOpen: boolean;
  apiBase: string;
  token: string;
  onSuccess: () => void;
}

export const ForceChangePasswordModal: React.FC<ForceChangePasswordModalProps> = ({
  isOpen,
  apiBase,
  token,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('Por políticas institucionales, la nueva contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (newPassword === 'RocketBotAdmin2026!') {
      setErrorMsg('Debes elegir una contraseña diferente a la clave de fábrica predeterminada.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Error al cambiar la contraseña.');
      }

      setSuccessMsg('¡Contraseña institucional actualizada correctamente! Accediendo a la terminal...');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de procesamiento. Verifica tu contraseña actual.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#12141A] border-2 border-[#FFB800]/50 rounded-2xl shadow-2xl p-6 text-white relative">
        {/* Encabezado de Advertencia Institucional */}
        <div className="flex items-start gap-4 mb-5 pb-4 border-b border-white/[0.08]">
          <div className="p-3 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-xl text-[#FFB800]">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#FFB800] bg-[#FFB800]/10 px-2 py-0.5 rounded">
              Paso Obligatorio (Solo Primer Acceso)
            </span>
            <h2 className="text-lg font-bold font-heading text-white mt-1">
              Cambio de Contraseña de Administrador
            </h2>
            <p className="text-xs text-white/60 mt-1">
              Has iniciado sesión con la clave de instalación predeterminada. Por seguridad institucional, debes definir una contraseña maestra privada única.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-[#FF3B69]/10 border border-[#FF3B69]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#FF3B69]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-[#00E599]/10 border border-[#00E599]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#00E599]">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium text-white/70 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-white/40" />
              Contraseña Actual (Temporal de Fábrica)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ej: RocketBotAdmin2026!"
              className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-white/70 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#FFB800]" />
              Nueva Contraseña Maestra (Mínimo 8 caracteres)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-white/70 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E599]" />
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#FFB800] transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full py-3 bg-gradient-to-r from-[#FFB800] to-[#FF8800] hover:from-[#FFA700] hover:to-[#FF7700] text-black font-bold font-heading rounded-xl text-sm shadow-lg shadow-[#FFB800]/20 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Actualizando credenciales...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Establecer Nueva Contraseña y Continuar</span>
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-[11px] text-white/40 text-center mt-4">
          Esta acción se solicita únicamente una vez para proteger tu terminal contra accesos no autorizados en la nube.
        </p>
      </div>
    </div>
  );
};
