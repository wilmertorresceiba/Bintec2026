"""Cómo se arranca cada servicio: comandos, entorno y preparación (venv / node_modules)."""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path

from bintec_deploy.config import BACKEND, FRONTEND, Servicio
from bintec_deploy.sistema import ES_WINDOWS, ErrorSistema, Sistema, python_del_sistema


def python_del_venv(directorio: Path) -> Path:
    return directorio / ".venv" / ("Scripts/python.exe" if ES_WINDOWS else "bin/python")


def comando_backend(servicio: Servicio) -> list[str]:
    return [
        str(python_del_venv(servicio.directorio)),
        "-m", "uvicorn", "app.main:crear_app", "--factory",
        "--host", "127.0.0.1", "--port", str(servicio.puerto),
    ]  # fmt: skip


def comando_frontend(servicio: Servicio, npx: str, abrir_navegador: bool = False) -> list[str]:
    comando = [
        npx, "ng", "serve", "--proxy-config", "proxy.conf.json", "--port", str(servicio.puerto),
    ]  # fmt: skip
    if abrir_navegador:
        comando.append("--open")
    return comando


def entorno(nombre: str) -> dict[str, str]:
    if nombre == BACKEND:
        return {"PYTHONUNBUFFERED": "1", "PYTHONUTF8": "1"}
    return {"NG_CLI_ANALYTICS": "false", "NO_COLOR": "1", "FORCE_COLOR": "0", "CI": "false"}


def preparar(servicio: Servicio, sistema: Sistema, informar: Callable[[str], None]) -> None:
    """Deja listo el servicio: crea el entorno virtual / instala dependencias si faltan."""
    if servicio.nombre == BACKEND:
        _preparar_backend(servicio, sistema, informar)
    else:
        _preparar_frontend(servicio, sistema, informar)


def _preparar_backend(servicio: Servicio, sistema: Sistema, informar: Callable[[str], None]) -> None:
    if not servicio.directorio.is_dir():
        raise ErrorSistema(f"No existe la carpeta del backend: {servicio.directorio}")
    if python_del_venv(servicio.directorio).exists():
        return
    informar("No hay entorno virtual del backend: creándolo e instalando dependencias (una sola vez)…")
    if sistema.ejecutar([python_del_sistema(), "-m", "venv", ".venv"], servicio.directorio) != 0:
        raise ErrorSistema("No se pudo crear el entorno virtual del backend.")
    requisitos = servicio.directorio / "requirements.txt"
    pip = [str(python_del_venv(servicio.directorio)), "-m", "pip", "install", "-r", str(requisitos)]
    if sistema.ejecutar(pip, servicio.directorio) != 0:
        raise ErrorSistema("Falló la instalación de las dependencias del backend (pip).")


def _preparar_frontend(servicio: Servicio, sistema: Sistema, informar: Callable[[str], None]) -> None:
    if not servicio.directorio.is_dir():
        raise ErrorSistema(f"No existe la carpeta del frontend: {servicio.directorio}")
    if sistema.buscar_ejecutable("npx") is None or sistema.buscar_ejecutable("npm") is None:
        raise ErrorSistema("No se encontró Node.js (npm/npx) en el PATH. Instala Node 20 o superior.")
    if (servicio.directorio / "node_modules").is_dir():
        return
    informar("No hay node_modules en el frontend: ejecutando `npm install` (una sola vez)…")
    npm = sistema.buscar_ejecutable("npm") or "npm"
    if sistema.ejecutar([npm, "install"], servicio.directorio) != 0:
        raise ErrorSistema("Falló `npm install` en el frontend.")


def comando_de(servicio: Servicio, sistema: Sistema, abrir_navegador: bool) -> list[str]:
    if servicio.nombre == BACKEND:
        return comando_backend(servicio)
    npx = sistema.buscar_ejecutable("npx")
    if npx is None:
        raise ErrorSistema("No se encontró `npx` en el PATH.")
    return comando_frontend(servicio, npx, abrir_navegador)


NOMBRES: tuple[str, ...] = (BACKEND, FRONTEND)
