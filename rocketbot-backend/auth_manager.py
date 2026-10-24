"""
RocketBot Pro - Authentication & Multi-User Management Engine
=============================================================
Sistema institucional de usuarios, roles y autenticación con tokens JWT.
Almacena usuarios y permisos en `user_data/users.db` (SQLite persistente).

Características:
- Cifrado seguro de contraseñas con PBKDF2-HMAC-SHA256 (100,000 iteraciones + salt aleatorio).
- Generación y verificación de tokens JWT (HS256) con expiración configurable.
- Roles de usuario:
  * ADMIN: Acceso total a todas las cuentas, gestión de usuarios y configuración.
  * TRADER: Acceso restringido exclusivamente a las subcuentas asignadas.
  * VIEWER: Acceso de solo lectura a la telemetría (sin poder abrir/cerrar trades).
- Sembrado automático del usuario 'admin' en el primer arranque si la base de datos está vacía.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import sqlite3
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger("rocketbot.auth")

ROOT_DIR = Path(__file__).resolve().parent.parent
USER_DATA_DIR = ROOT_DIR / "user_data"
USER_DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = USER_DATA_DIR / "users.db"
SECRET_KEY_FILE = USER_DATA_DIR / ".jwt_secret"


def _get_or_create_jwt_secret() -> str:
    """Obtiene la clave secreta para firmar tokens JWT desde variable de entorno o disco."""
    env_secret = os.getenv("JWT_SECRET")
    if env_secret:
        return env_secret
    if SECRET_KEY_FILE.exists():
        try:
            return SECRET_KEY_FILE.read_text(encoding="utf-8").strip()
        except Exception:
            pass
    secret = secrets.token_hex(32)
    try:
        SECRET_KEY_FILE.write_text(secret, encoding="utf-8")
    except Exception as e:
        logger.warning(f"No se pudo guardar jwt_secret en archivo: {e}")
    return secret


JWT_SECRET = _get_or_create_jwt_secret()
TOKEN_EXPIRY_SECONDS = 7 * 24 * 3600  # 7 días de validez por defecto


def hash_password(password: str) -> str:
    """Genera un hash seguro PBKDF2-HMAC-SHA256 con salt de 16 bytes."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return f"{salt}:{key.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    """Verifica si la contraseña ingresada coincide con el hash almacenado."""
    try:
        parts = hashed.split(":")
        if len(parts) != 2:
            return False
        salt, expected_hex = parts
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
        return hmac.compare_digest(key.hex(), expected_hex)
    except Exception:
        return False


def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")


def _b64_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding and padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))


def create_jwt_token(payload: Dict[str, Any], expires_in: int = TOKEN_EXPIRY_SECONDS) -> str:
    """Genera un token JWT estándar firmado con HMAC-SHA256."""
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    token_payload = {**payload, "iat": now, "exp": now + expires_in}

    hdr_b64 = _b64_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64_encode(json.dumps(token_payload, separators=(",", ":")).encode("utf-8"))
    signature_input = f"{hdr_b64}.{payload_b64}".encode("utf-8")
    sig = hmac.new(JWT_SECRET.encode("utf-8"), signature_input, hashlib.sha256).digest()
    sig_b64 = _b64_encode(sig)

    return f"{hdr_b64}.{payload_b64}.{sig_b64}"


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifica la firma y expiración de un token JWT. Devuelve el payload si es válido."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        hdr_b64, payload_b64, sig_b64 = parts

        signature_input = f"{hdr_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signature_input, hashlib.sha256).digest()
        actual_sig = _b64_decode(sig_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload_bytes = _b64_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        if payload.get("exp", 0) < int(time.time()):
            return None  # Token expirado

        return payload
    except Exception as e:
        logger.debug(f"Error verificando JWT: {e}")
        return None


class AuthManager:
    """Gestor persistente de usuarios y control de acceso RBAC en SQLite."""

    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        """Inicializa las tablas de usuarios y siembra el Administrador por defecto."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    full_name TEXT,
                    role TEXT NOT NULL DEFAULT 'trader',
                    assigned_accounts TEXT NOT NULL DEFAULT '["*"]',
                    is_active INTEGER NOT NULL DEFAULT 1,
                    created_at TEXT NOT NULL,
                    last_login TEXT
                )
                """
            )
            conn.commit()

            # Comprobar si existe al menos un usuario administrador
            cursor.execute("SELECT COUNT(*) as cnt FROM users")
            row = cursor.fetchone()
            if row["cnt"] == 0:
                self._seed_default_admin(cursor, conn)

    def _seed_default_admin(self, cursor: sqlite3.Cursor, conn: sqlite3.Connection):
        """Siembra el usuario inicial de alta gerencia."""
        default_admin_id = "user_admin_001"
        default_user = "admin"
        default_email = "admin@rocketbot.pro"
        default_pass = "RocketBotAdmin2026!"
        now = datetime.now(timezone.utc).isoformat()

        cursor.execute(
            """
            INSERT INTO users (user_id, username, email, password_hash, full_name, role, assigned_accounts, is_active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                default_admin_id,
                default_user,
                default_email,
                hash_password(default_pass),
                "Administrador Institucional",
                "admin",
                json.dumps(["*"]),
                1,
                now,
            ),
        )
        conn.commit()
        logger.info(f"Usuario Administrador inicial creado: '{default_user}' con contraseña por defecto.")

    def authenticate_user(self, username_or_email: str, password: str) -> Optional[Dict[str, Any]]:
        """Valida credenciales y actualiza la última fecha de inicio de sesión."""
        query = "SELECT * FROM users WHERE (username = ? OR email = ?) AND is_active = 1"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, (username_or_email.strip(), username_or_email.strip().lower()))
            row = cursor.fetchone()
            if not row:
                return None

            if not verify_password(password, row["password_hash"]):
                return None

            now = datetime.now(timezone.utc).isoformat()
            cursor.execute("UPDATE users SET last_login = ? WHERE user_id = ?", (now, row["user_id"]))
            conn.commit()

            return self._row_to_dict(row)

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Obtiene un usuario a partir de su ID único."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            return self._row_to_dict(row) if row else None

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE username = ?", (username.strip(),))
            row = cursor.fetchone()
            return self._row_to_dict(row) if row else None

    def list_users(self) -> List[Dict[str, Any]]:
        """Devuelve la lista de usuarios registrados sin exponer los hashes de contraseña."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users ORDER BY created_at ASC")
            rows = cursor.fetchall()
            return [self._row_to_dict(r) for r in rows]

    def create_user(
        self,
        username: str,
        email: str,
        password: str,
        full_name: str = "",
        role: str = "trader",
        assigned_accounts: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Crea un nuevo usuario en la base de datos."""
        username = username.strip()
        email = email.strip().lower()

        if len(password) < 6:
            raise ValueError("La contraseña debe contener al menos 6 caracteres.")

        if role not in ["admin", "trader", "viewer"]:
            role = "trader"

        assigned = assigned_accounts if assigned_accounts is not None else ["*"]
        user_id = f"user_{secrets.token_hex(4)}"
        now = datetime.now(timezone.utc).isoformat()

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO users (user_id, username, email, password_hash, full_name, role, assigned_accounts, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    username,
                    email,
                    hash_password(password),
                    full_name.strip() or username,
                    role,
                    json.dumps(assigned),
                    1,
                    now,
                ),
            )
            conn.commit()

        return self.get_user_by_id(user_id)

    def update_user(
        self,
        user_id: str,
        full_name: Optional[str] = None,
        email: Optional[str] = None,
        role: Optional[str] = None,
        assigned_accounts: Optional[List[str]] = None,
        is_active: Optional[bool] = None,
    ) -> Optional[Dict[str, Any]]:
        """Actualiza atributos de un usuario existente."""
        current = self.get_user_by_id(user_id)
        if not current:
            return None

        fields = []
        params = []

        if full_name is not None:
            fields.append("full_name = ?")
            params.append(full_name.strip())
        if email is not None:
            fields.append("email = ?")
            params.append(email.strip().lower())
        if role is not None and role in ["admin", "trader", "viewer"]:
            fields.append("role = ?")
            params.append(role)
        if assigned_accounts is not None:
            fields.append("assigned_accounts = ?")
            params.append(json.dumps(assigned_accounts))
        if is_active is not None:
            fields.append("is_active = ?")
            params.append(1 if is_active else 0)

        if not fields:
            return current

        params.append(user_id)
        query = f"UPDATE users SET {', '.join(fields)} WHERE user_id = ?"

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, tuple(params))
            conn.commit()

        return self.get_user_by_id(user_id)

    def change_password(self, user_id: str, current_password: str, new_password: str) -> bool:
        """Permite a un usuario cambiar su contraseña validando la contraseña actual."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT password_hash FROM users WHERE user_id = ?", (user_id,))
            row = cursor.fetchone()
            if not row:
                return False

            if not verify_password(current_password, row["password_hash"]):
                return False

            if len(new_password) < 6:
                raise ValueError("La nueva contraseña debe tener al menos 6 caracteres.")

            new_hash = hash_password(new_password)
            cursor.execute("UPDATE users SET password_hash = ? WHERE user_id = ?", (new_hash, user_id))
            conn.commit()
            return True

    def admin_reset_password(self, user_id: str, new_password: str) -> bool:
        """Permite al administrador resetear la contraseña de un usuario."""
        if len(new_password) < 6:
            raise ValueError("La contraseña debe tener al menos 6 caracteres.")
        new_hash = hash_password(new_password)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE users SET password_hash = ? WHERE user_id = ?", (new_hash, user_id))
            conn.commit()
            return cursor.rowcount > 0

    def delete_user(self, user_id: str) -> bool:
        """Elimina un usuario (impide eliminar al último administrador)."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT role FROM users WHERE user_id = ?", (user_id,))
            target = cursor.fetchone()
            if not target:
                return False

            if target["role"] == "admin":
                cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
                admin_count = cursor.fetchone()["count"]
                if admin_count <= 1:
                    raise ValueError("No se puede eliminar el único administrador del sistema.")

            cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
            conn.commit()
            return True

    def can_access_account(self, user: Dict[str, Any], account_id: str) -> bool:
        """Comprueba si un usuario tiene permiso para ver u operar una subcuenta específica."""
        if not user:
            return False
        if user.get("role") == "admin":
            return True
        assigned = user.get("assigned_accounts", [])
        return "*" in assigned or account_id in assigned

    def _row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        """Convierte una fila de base de datos en diccionario sanitizado sin contraseña."""
        d = dict(row)
        d.pop("password_hash", None)
        try:
            d["assigned_accounts"] = json.loads(d.get("assigned_accounts", '["*"]'))
        except Exception:
            d["assigned_accounts"] = ["*"]
        d["is_active"] = bool(d.get("is_active", 1))
        return d


# Instancia singleton del administrador de autenticación
auth_manager = AuthManager()
