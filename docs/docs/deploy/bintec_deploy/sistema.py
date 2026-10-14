"""Acceso al sistema operativo: lanzar procesos, matarlos, consultar puertos y esperar la salud.

Todo lo que toca el SO vive aquí (detrás del protocolo `Sistema`) para poder probar el
orquestador con un sistema falso y sin lanzar procesos reales.
"""

from __future__ import annotations

import contextlib
import os
import re
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Protocol

ES_WINDOWS: bool = os.name == "nt"
_PATRON_NETSTAT = re.compile(r"^\s*TCP\s+(\S+):(\d+)\s+\S+\s+LISTENING\s+(\d+)\s*$", re.IGNORECASE)


class ErrorSistema(RuntimeError):
    """Error esperable al operar con procesos (con un mensaje apto para el usuario)."""


class Sistema(Protocol):
    def lanzar(self, comando: list[str], cwd: Path, log: Path, env: dict[str, str]) -> int: ...

    def esta_vivo(self, pid: int) -> bool: ...

    def terminar_arbol(self, pid: int) -> None: ...

    def pid_en_puerto(self, puerto: int) -> int | None: ...

    def puerto_abierto(self, puerto: int) -> bool: ...

    def responde(self, url: str) -> bool: ...

    def ejecutar(self, comando: list[str], cwd: Path) -> int:
        """Ejecuta un comando de preparación mostrando su salida; devuelve el código de salida."""
        ...

    def buscar_ejecutable(self, nombre: str) -> str | None: ...

    def dormir(self, segundos: float) -> None: ...

    def ahora(self) -> float: ...


def parsear_netstat(salida: str, puerto: int) -> int | None:
    """Extrae el PID que escucha en `puerto` de la salida de `netstat -ano` (Windows)."""
    for linea in salida.splitlines():
        coincidencia = _PATRON_NETSTAT.match(linea)
        if coincidencia and int(coincidencia.group(2)) == puerto:
            return int(coincidencia.group(3))
    return None


class SistemaReal:
    """Implementación real (Windows y POSIX) usando solo la biblioteca estándar."""

    def lanzar(self, comando: list[str], cwd: Path, log: Path, env: dict[str, str]) -> int:
        log.parent.mkdir(parents=True, exist_ok=True)
        entorno = {**os.environ, **env}
        with log.open("ab") as salida:
            salida.write(f"\n===== {time.strftime('%Y-%m-%d %H:%M:%S')} :: {' '.join(comando)}\n".encode())
            salida.flush()
            if ES_WINDOWS:
                # Sin ventana y en su propio grupo: sobrevive al cierre de este script.
                banderas = subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW
                proceso = subprocess.Popen(  # noqa: S603
                    comando, cwd=cwd, env=entorno, stdin=subprocess.DEVNULL,
                    stdout=salida, stderr=subprocess.STDOUT, creationflags=banderas,
                )  # fmt: skip
            else:
                proceso = subprocess.Popen(  # noqa: S603
                    comando, cwd=cwd, env=entorno, stdin=subprocess.DEVNULL,
                    stdout=salida, stderr=subprocess.STDOUT, start_new_session=True,
                )  # fmt: skip
        return proceso.pid

    def esta_vivo(self, pid: int) -> bool:
        if ES_WINDOWS:
            # os.kill(pid, 0) en Windows TERMINA el proceso: se consulta con tasklist.
            resultado = subprocess.run(  # noqa: S603
                ["tasklist", "/FI", f"PID eq {pid}", "/NH", "/FO", "CSV"],  # noqa: S607
                capture_output=True, text=True, check=False,
            )  # fmt: skip
            return f'"{pid}"' in resultado.stdout
        try:
            os.kill(pid, 0)
        except ProcessLookupError:
            return False
        except PermissionError:
            return True
        return True

    def terminar_arbol(self, pid: int) -> None:
        if sys.platform == "win32":
            subprocess.run(  # noqa: S603
                ["taskkill", "/PID", str(pid), "/T", "/F"],  # noqa: S607
                capture_output=True, check=False,
            )  # fmt: skip
            return
        try:
            os.killpg(os.getpgid(pid), signal.SIGTERM)
        except ProcessLookupError:
            return
        for _ in range(50):
            if not self.esta_vivo(pid):
                return
            time.sleep(0.1)
        with contextlib.suppress(ProcessLookupError):
            os.killpg(os.getpgid(pid), signal.SIGKILL)

    def pid_en_puerto(self, puerto: int) -> int | None:
        if ES_WINDOWS:
            salida = subprocess.run(  # noqa: S603
                ["netstat", "-ano"],  # noqa: S607  (sin -p TCP: incluye sockets IPv6)
                capture_output=True, text=True, check=False,
            ).stdout  # fmt: skip
            return parsear_netstat(salida, puerto)
        if shutil.which("lsof"):
            pids = subprocess.run(  # noqa: S603
                ["lsof", "-ti", f"tcp:{puerto}", "-sTCP:LISTEN"],  # noqa: S607
                capture_output=True, text=True, check=False,
            ).stdout.split()  # fmt: skip
            return int(pids[0]) if pids else None
        return None

    def puerto_abierto(self, puerto: int) -> bool:
        for host in ("127.0.0.1", "::1"):
            familia = socket.AF_INET6 if ":" in host else socket.AF_INET
            with socket.socket(familia, socket.SOCK_STREAM) as conexion:
                conexion.settimeout(0.5)
                if conexion.connect_ex((host, puerto)) == 0:
                    return True
        return False

    def responde(self, url: str) -> bool:
        abridor = urllib.request.build_opener(urllib.request.ProxyHandler({}))  # sin proxy
        try:
            with abridor.open(url, timeout=3) as respuesta:  # noqa: S310
                return bool(200 <= respuesta.status < 400)
        except (urllib.error.URLError, OSError, ValueError):
            return False

    def ejecutar(self, comando: list[str], cwd: Path) -> int:
        return subprocess.run(comando, cwd=cwd, check=False).returncode  # noqa: S603

    def buscar_ejecutable(self, nombre: str) -> str | None:
        return shutil.which(nombre)

    def dormir(self, segundos: float) -> None:
        time.sleep(segundos)

    def ahora(self) -> float:
        return time.time()


def python_del_sistema() -> str:
    return sys.executable
