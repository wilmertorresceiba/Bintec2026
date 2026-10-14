"""Rutas, puertos y definición de los servicios (con valores por defecto sobrescribibles por entorno)."""

from __future__ import annotations

import os
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path

DEPLOY_DIR: Path = Path(__file__).resolve().parents[1]
RAIZ: Path = DEPLOY_DIR.parent  # .../docs

BACKEND: str = "backend"
FRONTEND: str = "frontend"
ORDEN_INICIO: tuple[str, ...] = (BACKEND, FRONTEND)  # el backend siempre antes que el frontend
ORDEN_DETENCION: tuple[str, ...] = (FRONTEND, BACKEND)

_PREFIJO: str = "BINTEC_DEPLOY_"


@dataclass(frozen=True, slots=True)
class Servicio:
    nombre: str
    directorio: Path
    puerto: int
    url_salud: str
    timeout_salud: int  # segundos que se espera a que responda tras lanzarlo
    descripcion: str


@dataclass(frozen=True, slots=True)
class Config:
    backend: Servicio
    frontend: Servicio
    dir_run: Path  # PIDs de los procesos lanzados
    dir_logs: Path

    def servicio(self, nombre: str) -> Servicio:
        return self.backend if nombre == BACKEND else self.frontend


def cargar(entorno: Mapping[str, str] | None = None) -> Config:
    """Construye la configuración. Variables opcionales (prefijo BINTEC_DEPLOY_):

    BACKEND_DIR, FRONTEND_DIR, BACKEND_PUERTO, FRONTEND_PUERTO.
    """
    env = os.environ if entorno is None else entorno

    def texto(clave: str, defecto: str) -> str:
        return env.get(_PREFIJO + clave, defecto)

    puerto_backend = int(texto("BACKEND_PUERTO", "8000"))
    puerto_frontend = int(texto("FRONTEND_PUERTO", "4200"))
    return Config(
        backend=Servicio(
            nombre=BACKEND,
            directorio=Path(texto("BACKEND_DIR", str(RAIZ / "backend"))),
            puerto=puerto_backend,
            url_salud=f"http://127.0.0.1:{puerto_backend}/api/salud",
            timeout_salud=40,
            descripcion="API FastAPI + SQLite",
        ),
        frontend=Servicio(
            nombre=FRONTEND,
            directorio=Path(texto("FRONTEND_DIR", str(RAIZ / "frontend"))),
            puerto=puerto_frontend,
            url_salud=f"http://localhost:{puerto_frontend}/",
            timeout_salud=180,  # la primera compilación de Angular puede tardar
            descripcion="Angular (ng serve + proxy al backend)",
        ),
        dir_run=DEPLOY_DIR / ".run",
        dir_logs=DEPLOY_DIR / "logs",
    )
