import React, { useState } from 'react';
import {
  Rocket,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

export interface AuthUser {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'trader' | 'viewer';
  assigned_accounts: string[];
  is_active: boolean;
  created_at: string;
  last_login?: string;
  must_change_password?: boolean;
}

interface LoginModalProps {
  isOpen: boolean;
  apiBase: string;
  onLoginSuccess: (token: string, user: AuthUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, apiBase, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Por favor ingresa usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Credenciales inválidas');
      }

      const data = await res.json();
      onLoginSuccess(data.access_token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0C101A] border border-white/[0.12] rounded-3xl shadow-[0_20px_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col relative">
        {/* Resplandor superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-[#0A7CFF] to-transparent" />

        {/* Cabecera */}
        <div className="p-6 text-center bg-[#070910] border-b border-white/[0.06]">
          <div className="w-12 h-12 rounded-2xl figma-btn-primary p-0 flex items-center justify-center text-white mx-auto mb-3 shadow-[0_0_25px_rgba(10,124,255,0.4)]">
            <Rocket className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-lg font-extrabold text-white font-heading tracking-tight">
            ROCKETBOT <span className="text-[#0A7CFF]">PRO</span>
          </h2>
          <p className="text-xs text-[#8E95A2] font-mono mt-1">
            Plataforma Institucional • Acceso Seguro
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF3B69]/15 border border-[#FF3B69]/30 text-[#FF3B69] text-xs font-mono flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-white font-heading block mb-1.5">
              Usuario o Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E95A2]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: admin o tu_usuario"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-[#0A7CFF] focus:bg-white/[0.07] text-white text-xs font-mono outline-none transition"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-white font-heading block mb-1.5">
              Contraseña de Acceso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8E95A2]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.1] focus:border-[#0A7CFF] focus:bg-white/[0.07] text-white text-xs font-mono outline-none transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8E95A2] hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl figma-btn-primary text-white text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Iniciar Sesión en RocketBot</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-3 bg-[#070910] border-t border-white/[0.06] text-center">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8E95A2] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00DFDF]" />
            <span>Tokens JWT HS256 con cifrado PBKDF2</span>
          </div>
        </div>
      </div>
    </div>
  );
};
