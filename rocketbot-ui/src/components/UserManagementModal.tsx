import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Plus,
  Shield,
  KeyRound,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Lock,
  UserCheck,
  UserX,
} from 'lucide-react';
import { AuthUser } from './LoginModal';
import { AccountSummary } from './AccountSwitcherDropdown';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  token: string;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  apiBase,
  token,
}) => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<AccountSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Formulario nuevo usuario
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'trader' | 'viewer'>('trader');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(['*']);

  // Reset password state
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetNewPass, setResetNewPass] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${apiBase}/api/v1/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      setErrorMsg('Error al cargar la lista de usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailableAccounts(data.accounts || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchAccounts();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${apiBase}/api/v1/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername.trim(),
          email: newEmail.trim(),
          password: newPassword,
          full_name: newFullName.trim(),
          role: newRole,
          assigned_accounts: newRole === 'admin' ? ['*'] : selectedAccounts,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al crear usuario');
      }

      setSuccessMsg(`Usuario '${newUsername}' creado exitosamente.`);
      setIsCreating(false);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la solicitud.');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente al usuario '${username}'?`)) return;
    setErrorMsg('');
    try {
      const res = await fetch(`${apiBase}/api/v1/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al eliminar');
      }
      setSuccessMsg(`Usuario '${username}' eliminado.`);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al eliminar usuario.');
    }
  };

  const handleToggleActive = async (user: AuthUser) => {
    try {
      const res = await fetch(`${apiBase}/api/v1/auth/users/${user.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch {}
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !resetNewPass) return;
    try {
      const res = await fetch(`${apiBase}/api/v1/auth/users/${resetUserId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: resetNewPass }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al restablecer');
      }
      setSuccessMsg('Contraseña restablecida correctamente.');
      setResetUserId(null);
      setResetNewPass('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al restablecer contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0B0E17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="p-4 bg-[#070910] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                Panel de Administración de Usuarios & Permisos RBAC
              </h2>
              <p className="text-[11px] text-[#8E95A2] font-mono">
                Control de acceso, roles institucionales y asignación de subcuentas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#8E95A2] hover:text-white transition cursor-pointer"
              title="Refrescar usuarios"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00DFDF]' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8E95A2] hover:text-white hover:bg-white/[0.05] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notificaciones */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[#FF3B69]/15 border border-[#FF3B69]/30 text-[#FF3B69] text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-[#00DFDF]/15 border border-[#00DFDF]/30 text-[#00DFDF] text-xs font-mono flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4 figma-scrollbar flex-1">
          {/* Barra de acción: Crear Usuario */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-heading">
              {users.length} {users.length === 1 ? 'Usuario Registrado' : 'Usuarios Registrados'}
            </span>

            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl figma-btn-primary text-white text-xs font-bold font-heading transition cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? 'Cancelar' : '+ Nuevo Usuario'}</span>
            </button>
          </div>

          {/* Formulario Desplegable para Crear Usuario */}
          {isCreating && (
            <form onSubmit={handleCreateUser} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.1] space-y-3 animate-in fade-in">
              <span className="text-xs font-bold text-white font-heading block">
                Crear Nuevo Acceso de Usuario
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">Nombre de Usuario *</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ej: trader_juan"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white outline-none focus:border-[#0A7CFF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="ej: juan@empresa.com"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white outline-none focus:border-[#0A7CFF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="ej: Juan Pérez"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white outline-none focus:border-[#0A7CFF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">Contraseña Inicial *</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white outline-none focus:border-[#0A7CFF]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">Rol en el Sistema *</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0C101A] border border-white/[0.1] text-xs font-mono text-white outline-none"
                  >
                    <option value="trader">Trader (Opera solo cuentas asignadas)</option>
                    <option value="admin">Administrador (Acceso total & gestión)</option>
                    <option value="viewer">Viewer (Solo lectura, no puede ordenar)</option>
                  </select>
                </div>

                {newRole !== 'admin' && (
                  <div>
                    <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">Subcuentas Asignadas</label>
                    <div className="max-h-24 overflow-y-auto space-y-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] figma-scrollbar">
                      <label className="flex items-center gap-2 text-xs font-mono text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAccounts.includes('*')}
                          onChange={(e) => setSelectedAccounts(e.target.checked ? ['*'] : [])}
                        />
                        <span>Todas las cuentas (*)</span>
                      </label>
                      {!selectedAccounts.includes('*') &&
                        availableAccounts.map((acc) => (
                          <label key={acc.account_id} className="flex items-center gap-2 text-[11px] font-mono text-white/80 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedAccounts.includes(acc.account_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAccounts([...selectedAccounts, acc.account_id]);
                                } else {
                                  setSelectedAccounts(selectedAccounts.filter((id) => id !== acc.account_id));
                                }
                              }}
                            />
                            <span>{acc.name}</span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] text-white text-xs font-mono cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg figma-btn-primary text-white text-xs font-bold font-heading cursor-pointer"
                >
                  Confirmar y Guardar Usuario
                </button>
              </div>
            </form>
          )}

          {/* Modal flotante de Reset Password */}
          {resetUserId && (
            <form onSubmit={handleResetPassword} className="p-4 rounded-xl bg-[#00DFDF]/5 border border-[#00DFDF]/30 space-y-3">
              <span className="text-xs font-bold text-white font-heading block">
                Restablecer Contraseña para el Usuario
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="Nueva contraseña temporal"
                  required
                  value={resetNewPass}
                  onChange={(e) => setResetNewPass(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs font-mono text-white outline-none focus:border-[#00DFDF]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#00DFDF]/20 hover:bg-[#00DFDF]/30 border border-[#00DFDF]/40 text-[#00DFDF] text-xs font-bold font-heading cursor-pointer"
                >
                  Actualizar Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResetUserId(null);
                    setResetNewPass('');
                  }}
                  className="px-3 py-2 rounded-lg bg-white/[0.05] text-white text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Tabla de Usuarios */}
          <div className="overflow-x-auto border border-white/[0.08] rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#070910] text-[#8E95A2] uppercase text-[10px] border-b border-white/[0.08]">
                <tr>
                  <th className="py-2.5 px-3">Usuario</th>
                  <th className="py-2.5 px-3">Correo</th>
                  <th className="py-2.5 px-3">Rol</th>
                  <th className="py-2.5 px-3">Subcuentas</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((u) => (
                  <tr key={u.user_id} className="hover:bg-white/[0.02] transition">
                    <td className="py-2.5 px-3 font-bold text-white font-heading">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#0A7CFF]/15 text-[#0A7CFF] flex items-center justify-center font-bold text-[11px]">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{u.username}</span>
                          {u.full_name && <span className="text-[10px] text-[#8E95A2] block font-mono font-normal">{u.full_name}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-[#8E95A2]">{u.email}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          u.role === 'admin'
                            ? 'text-[#00DFDF] bg-[#00DFDF]/10 border-[#00DFDF]/30'
                            : u.role === 'trader'
                            ? 'text-[#0A7CFF] bg-[#0A7CFF]/10 border-[#0A7CFF]/30'
                            : 'text-[#8E95A2] bg-white/[0.05] border-white/[0.1]'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#8E95A2] text-[11px]">
                      {u.assigned_accounts.includes('*') ? (
                        <span className="text-[#00DFDF]">Acceso Global (*)</span>
                      ) : (
                        <span>{u.assigned_accounts.length} asignadas</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition ${
                          u.is_active
                            ? 'bg-[#00DFDF]/10 text-[#00DFDF] border border-[#00DFDF]/20'
                            : 'bg-[#FF3B69]/10 text-[#FF3B69] border border-[#FF3B69]/20'
                        }`}
                        title="Clic para activar o desactivar acceso"
                      >
                        {u.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {u.is_active ? 'Activo' : 'Bloqueado'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setResetUserId(u.user_id);
                            setResetNewPass('');
                          }}
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-[#8E95A2] hover:text-[#00DFDF] transition cursor-pointer"
                          title="Restablecer contraseña"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u.user_id, u.username)}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#FF3B69]/15 text-[#8E95A2] hover:text-[#FF3B69] transition cursor-pointer"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
