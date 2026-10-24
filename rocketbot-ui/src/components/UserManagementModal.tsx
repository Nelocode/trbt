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
  HardDrive,
  Download,
  Archive,
  Calendar,
} from 'lucide-react';
import { AuthUser } from './LoginModal';
import { AccountSummary } from './AccountSwitcherDropdown';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBase: string;
  token: string;
}

interface BackupItem {
  filename: string;
  size_bytes: number;
  size_formatted: string;
  created_at: string;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  apiBase,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'backups'>('users');
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<AccountSummary[]>([]);
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Formulario nuevo usuario (Least Privilege: no wildcard '*' por defecto)
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'trader' | 'viewer'>('trader');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

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
        const accs: AccountSummary[] = data.accounts || [];
        setAvailableAccounts(accs);
        if (selectedAccounts.length === 0 && accs.length > 0) {
          setSelectedAccounts([accs[0].account_id]);
        }
      }
    } catch {}
  };

  const fetchBackups = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/system/backups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch {}
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchAccounts();
      fetchBackups();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newRole !== 'admin' && selectedAccounts.length === 0) {
      setErrorMsg('Debes asignar al menos una subcuenta al trader.');
      return;
    }

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
    } catch {
      setErrorMsg('Error al modificar estado del usuario.');
    }
  };

  const handleAdminResetPassword = async (userId: string) => {
    if (resetNewPass.length < 6) {
      setErrorMsg('La nueva contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    setErrorMsg('');
    try {
      const res = await fetch(`${apiBase}/api/v1/auth/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: resetNewPass }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Error al resetear contraseña');
      }
      setSuccessMsg('Contraseña restablecida con éxito.');
      setResetUserId(null);
      setResetNewPass('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al resetear contraseña.');
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${apiBase}/api/v1/system/backup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al generar respaldo.');
      }
      const data = await res.json();
      setSuccessMsg(`Copia de seguridad creada con éxito: ${data.filename} (${data.size_formatted}).`);
      fetchBackups();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error generando respaldo en disco.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleDownloadBackup = (filename: string) => {
    const url = `${apiBase}/api/v1/system/backups/download/${encodeURIComponent(filename)}?token=${encodeURIComponent(token)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-[#0B0E17] border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabecera */}
        <div className="p-4 bg-[#070910] border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                Panel Institucional de Administración
              </h2>
              <p className="text-[11px] text-[#8E95A2] font-mono">
                Control de acceso RBAC, aislamiento de subcuentas y copias de seguridad de datos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchUsers();
                fetchBackups();
              }}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#8E95A2] hover:text-white transition cursor-pointer"
              title="Refrescar datos"
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

        {/* Selector de Pestañas (Tabs) */}
        <div className="px-5 pt-3 bg-[#0B0E17] border-b border-white/[0.08] flex items-center gap-4">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2.5 text-xs font-heading font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'users'
                ? 'border-[#00DFDF] text-[#00DFDF]'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios & Roles RBAC ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('backups')}
            className={`pb-2.5 text-xs font-heading font-bold transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'backups'
                ? 'border-[#00DFDF] text-[#00DFDF]'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Copias de Seguridad / Backups ({backups.length})</span>
          </button>
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

        {/* Contenido según pestaña */}
        <div className="p-5 overflow-y-auto space-y-4 figma-scrollbar flex-1">
          {activeTab === 'users' ? (
            <>
              {/* Barra de acción: Crear Usuario */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-heading">
                  Gestión de Acceso a Operadores & Analistas
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
                        onChange={(e) => {
                          const r = e.target.value as any;
                          setNewRole(r);
                          if (r === 'admin') {
                            setSelectedAccounts(['*']);
                          } else {
                            setSelectedAccounts(availableAccounts.length > 0 ? [availableAccounts[0].account_id] : []);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-[#0C101A] border border-white/[0.1] text-xs font-mono text-white outline-none"
                      >
                        <option value="trader">Trader (Opera solo cuentas asignadas)</option>
                        <option value="viewer">Viewer (Solo lectura, sin órdenes)</option>
                        <option value="admin">Administrador (Acceso total & gestión)</option>
                      </select>
                    </div>

                    {newRole !== 'admin' && (
                      <div>
                        <label className="text-[10px] font-mono text-[#8E95A2] block mb-1">
                          Subcuentas Específicas Asignadas (Principio Menor Privilegio)
                        </label>
                        <div className="max-h-28 overflow-y-auto space-y-1 p-2 rounded-lg bg-white/[0.02] border border-white/[0.08] figma-scrollbar">
                          {availableAccounts.map((acc) => (
                            <label key={acc.account_id} className="flex items-center gap-2 text-[11px] font-mono text-white/80 cursor-pointer hover:text-white">
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
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-white transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg figma-btn-primary text-xs font-bold text-white transition cursor-pointer shadow-md"
                    >
                      Guardar Usuario
                    </button>
                  </div>
                </form>
              )}

              {/* Reset Password Form Inline */}
              {resetUserId && (
                <div className="p-4 rounded-xl bg-[#00DFDF]/10 border border-[#00DFDF]/30 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-mono text-white">
                    <Lock className="w-4 h-4 text-[#00DFDF]" />
                    <span>Restablecer Contraseña para ID: <strong>{resetUserId}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      value={resetNewPass}
                      onChange={(e) => setResetNewPass(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-[#0C101A] border border-white/[0.15] text-xs font-mono text-white outline-none"
                    />
                    <button
                      onClick={() => handleAdminResetPassword(resetUserId)}
                      className="px-3 py-1.5 rounded-lg figma-btn-primary text-xs font-bold text-white cursor-pointer"
                    >
                      Actualizar
                    </button>
                    <button
                      onClick={() => setResetUserId(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.05] text-xs font-mono text-white/70 hover:text-white cursor-pointer"
                    >
                      X
                    </button>
                  </div>
                </div>
              )}

              {/* Tabla de Usuarios */}
              <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.01]">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-white/[0.03] text-[#8E95A2] uppercase text-[10px] tracking-wider border-b border-white/[0.08]">
                    <tr>
                      <th className="py-2.5 px-3">Usuario / Nombre</th>
                      <th className="py-2.5 px-3">Rol</th>
                      <th className="py-2.5 px-3">Cuentas Permitidas</th>
                      <th className="py-2.5 px-3">Estado</th>
                      <th className="py-2.5 px-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {users.map((u) => (
                      <tr key={u.user_id} className="hover:bg-white/[0.02] transition">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-white">{u.username}</div>
                          <div className="text-[10px] text-[#8E95A2]">{u.full_name || u.email}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30'
                                : u.role === 'trader'
                                ? 'bg-[#00DFDF]/15 text-[#00DFDF] border border-[#00DFDF]/30'
                                : 'bg-white/[0.08] text-white/70 border border-white/15'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-white/80">
                          {u.assigned_accounts.includes('*') ? (
                            <span className="text-[#00DFDF] font-semibold">Todas (*)</span>
                          ) : (
                            <span>{u.assigned_accounts.length} asignadas</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => handleToggleActive(u)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                              u.is_active
                                ? 'bg-[#00E599]/15 text-[#00E599] border border-[#00E599]/30 hover:bg-[#FF3B69]/15 hover:text-[#FF3B69]'
                                : 'bg-[#FF3B69]/15 text-[#FF3B69] border border-[#FF3B69]/30 hover:bg-[#00E599]/15 hover:text-[#00E599]'
                            }`}
                          >
                            {u.is_active ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Activo</span>
                              </>
                            ) : (
                              <>
                                <UserX className="w-3 h-3" />
                                <span>Inactivo</span>
                              </>
                            )}
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
            </>
          ) : (
            /* Pestaña: Copias de Seguridad (Item 10) */
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <div>
                  <h3 className="text-xs font-bold text-white font-heading">
                    Respaldos Automáticos del Sistema (user_data)
                  </h3>
                  <p className="text-[11px] text-[#8E95A2] font-mono mt-0.5">
                    Empaqueta todas las subcuentas, operaciones históricas, usuarios y estrategias en un archivo comprimido .ZIP
                  </p>
                </div>
                <button
                  onClick={handleCreateBackup}
                  disabled={isBackingUp}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl figma-btn-primary text-white text-xs font-bold font-heading transition cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <Archive className={`w-4 h-4 ${isBackingUp ? 'animate-spin' : ''}`} />
                  <span>{isBackingUp ? 'Generando ZIP...' : 'Crear Copia de Seguridad Ahora'}</span>
                </button>
              </div>

              {backups.length === 0 ? (
                <div className="text-center py-10 text-white/40 text-xs font-mono">
                  No se han generado copias de seguridad aún. Haz clic en el botón superior para crear la primera.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.01]">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-white/[0.03] text-[#8E95A2] uppercase text-[10px] tracking-wider border-b border-white/[0.08]">
                      <tr>
                        <th className="py-2.5 px-3">Archivo de Respaldo</th>
                        <th className="py-2.5 px-3">Tamaño</th>
                        <th className="py-2.5 px-3">Fecha y Hora (UTC)</th>
                        <th className="py-2.5 px-3 text-right">Descargar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {backups.map((b) => (
                        <tr key={b.filename} className="hover:bg-white/[0.02] transition">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-white flex items-center gap-2">
                              <Archive className="w-3.5 h-3.5 text-[#00DFDF]" />
                              <span>{b.filename}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-white/80">{b.size_formatted}</td>
                          <td className="py-2.5 px-3 text-white/60">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-white/40" />
                              <span>{new Date(b.created_at).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleDownloadBackup(b.filename)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.06] hover:bg-[#00DFDF]/20 text-white hover:text-[#00DFDF] rounded-lg transition text-xs font-mono cursor-pointer border border-white/[0.08]"
                              title="Descargar archivo ZIP a tu equipo"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
