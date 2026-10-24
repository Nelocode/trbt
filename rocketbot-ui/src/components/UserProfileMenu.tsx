import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Users,
  LogOut,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { AuthUser } from './LoginModal';

interface UserProfileMenuProps {
  user: AuthUser;
  onOpenUserManagement: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  onOpenUserManagement,
  onOpenChangePassword,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'ADMINISTRADOR',
          color: 'text-[#00DFDF] bg-[#00DFDF]/10 border-[#00DFDF]/30',
        };
      case 'trader':
        return {
          label: 'TRADER',
          color: 'text-[#0A7CFF] bg-[#0A7CFF]/10 border-[#0A7CFF]/30',
        };
      default:
        return {
          label: 'VIEWER',
          color: 'text-[#8E95A2] bg-white/[0.05] border-white/[0.1]',
        };
    }
  };

  const badge = getRoleBadge(user.role);

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón de Perfil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] text-white transition cursor-pointer group"
        title="Perfil de Usuario y Seguridad"
      >
        <div className="w-6 h-6 rounded-lg bg-[#0A7CFF]/20 border border-[#0A7CFF]/40 text-[#0A7CFF] flex items-center justify-center text-xs font-bold font-heading">
          {user.username.charAt(0).toUpperCase()}
        </div>

        <span className="text-xs font-bold font-heading text-white max-w-[100px] truncate hidden md:inline">
          {user.username}
        </span>

        <span
          className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${badge.color}`}
        >
          {badge.label}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#8E95A2] group-hover:text-white transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menú Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#0B0E17] border border-white/[0.14] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Info */}
          <div className="p-3.5 bg-[#070910] border-b border-white/[0.08]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0A7CFF]/20 border border-[#0A7CFF]/40 text-[#0A7CFF] flex items-center justify-center font-bold font-heading text-sm">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white font-heading block truncate">
                  {user.full_name || user.username}
                </span>
                <span className="text-[10px] text-[#8E95A2] font-mono block truncate">
                  {user.email}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#8E95A2]">
              <span>Rol: <strong className="text-white uppercase">{user.role}</strong></span>
              <span>{user.assigned_accounts.includes('*') ? 'Acceso Global' : `${user.assigned_accounts.length} cuentas`}</span>
            </div>
          </div>

          {/* Opciones */}
          <div className="p-1.5 space-y-0.5">
            {user.role === 'admin' && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenUserManagement();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white hover:bg-white/[0.06] transition text-left cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#00DFDF]" />
                <span>Gestión de Usuarios & Roles</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenChangePassword();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-medium text-white hover:bg-white/[0.06] transition text-left cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#0A7CFF]" />
              <span>Cambiar Mi Contraseña</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-medium text-[#FF3B69] hover:bg-[#FF3B69]/10 transition text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
