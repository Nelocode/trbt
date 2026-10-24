import React, { useState } from 'react';
import { X, KeyRound, CheckCircle, AlertCircle, Lock } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  token: string;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  apiBase,
  token,
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

    if (newPassword.length < 6) {
      setErrorMsg('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
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
        throw new Error(data.detail || 'Error al cambiar contraseña');
      }

      setSuccessMsg('Contraseña actualizada con éxito.');
      setTimeout(() => {
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg('');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de procesamiento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0B0E17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="p-4 bg-[#070910] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0A7CFF]/15 text-[#0A7CFF] border border-[#0A7CFF]/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading">
                Cambiar Contraseña
              </h2>
              <p className="text-[11px] text-[#8E95A2] font-mono">
                Actualiza tus credenciales de acceso a la plataforma
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF3B69]/15 border border-[#FF3B69]/30 text-[#FF3B69] text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#00DFDF]/15 border border-[#00DFDF]/30 text-[#00DFDF] text-xs font-mono flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-white font-heading block mb-1">
              Contraseña Actual *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white outline-none focus:border-[#0A7CFF]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white font-heading block mb-1">
              Nueva Contraseña *
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white outline-none focus:border-[#0A7CFF]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white font-heading block mb-1">
              Confirmar Nueva Contraseña *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la nueva contraseña"
              className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white outline-none focus:border-[#0A7CFF]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-heading font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl figma-btn-primary text-white text-xs font-bold font-heading cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Guardando...' : 'Actualizar Contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
