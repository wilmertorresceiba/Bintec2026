"""Configuración de la aplicación (variables de entorno con prefijo BINTEC_)."""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR: Path = Path(__file__).resolve().parents[2]
DATABASE_DIR: Path = BACKEND_DIR / "database"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_prefix="BINTEC_", extra="ignore"
    )

    database_url: str = f"sqlite:///{(DATABASE_DIR / 'bintec.db').as_posix()}"
    jwt_secret: str = "dev-only-secret-cambiar-en-cualquier-otro-entorno-123"
    jwt_algoritmo: str = "HS256"
    jwt_expiracion_minutos: int = 60
    cors_origenes: list[str] = ["http://localhost:4200"]
    sembrar_al_iniciar: bool = True

    # Segundo factor del login (clave de cajero + código de seguridad)
    desafio_expiracion_minutos: int = 5
    max_intentos_fallidos: int = 3
    minutos_bloqueo: int = 15
    # Código de seguridad FIJO solo para la demo. En producción sería un OTP dinámico
    # (TOTP/SMS) detrás del mismo puerto `VerificadorCodigoSeguridad`.
    codigo_seguridad_demo: str = "123456"


@lru_cache
def get_settings() -> Settings:
    return Settings()
