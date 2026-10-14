from __future__ import annotations

import io
import sys
from dataclasses import dataclass, field
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from bintec_deploy.config import Config, Servicio  # noqa: E402
from bintec_deploy.consola import Consola  # noqa: E402
from bintec_deploy.orquestador import Orquestador  # noqa: E402


@dataclass
class ProcesoFalso:
    pid: int
    puerto: int | None
    vivo: bool = True
    responde_tras: int = 0  # cuántas consultas de salud fallan antes de responder
    muere_al_arrancar: bool = False
    consultas: int = 0


@dataclass
class SistemaFalso:
    """Simula procesos, puertos y relojes sin tocar el sistema operativo."""

    procesos: dict[int, ProcesoFalso] = field(default_factory=dict)
    puertos_ajenos: dict[int, int] = field(default_factory=dict)  # puerto -> pid no gestionado
    lanzados: list[list[str]] = field(default_factory=list)
    terminados: list[int] = field(default_factory=list)
    ejecutados: list[list[str]] = field(default_factory=list)
    ejecutables: set[str] = field(default_factory=lambda: {"npx", "npm"})
    reloj: float = 0.0
    siguiente_pid: int = 1000
    puerto_por_servicio: dict[str, int] = field(default_factory=dict)
    arranque_lento: int = 0
    arranque_fallido: set[str] = field(default_factory=set)

    def lanzar(self, comando: list[str], cwd: Path, log: Path, env: dict[str, str]) -> int:
        self.siguiente_pid += 1
        pid = self.siguiente_pid
        es_backend = "uvicorn" in " ".join(comando)
        puerto = int(comando[comando.index("--port") + 1])
        nombre = "backend" if es_backend else "frontend"
        self.lanzados.append(comando)
        log.parent.mkdir(parents=True, exist_ok=True)
        log.write_text("línea 1\nError: algo falló al arrancar\n", encoding="utf-8")
        self.procesos[pid] = ProcesoFalso(
            pid, puerto, muere_al_arrancar=nombre in self.arranque_fallido,
            responde_tras=self.arranque_lento,
        )  # fmt: skip
        return pid

    def esta_vivo(self, pid: int) -> bool:
        proceso = self.procesos.get(pid)
        if proceso is None:
            return pid in self.puertos_ajenos.values()
        if proceso.muere_al_arrancar:
            proceso.vivo = False
        return proceso.vivo

    def terminar_arbol(self, pid: int) -> None:
        self.terminados.append(pid)
        if pid in self.procesos:
            self.procesos[pid].vivo = False
        for puerto, ajeno in list(self.puertos_ajenos.items()):
            if ajeno == pid:
                del self.puertos_ajenos[puerto]

    def _proceso_en(self, puerto: int) -> ProcesoFalso | None:
        return next((p for p in self.procesos.values() if p.vivo and p.puerto == puerto), None)

    def pid_en_puerto(self, puerto: int) -> int | None:
        proceso = self._proceso_en(puerto)
        return proceso.pid if proceso else self.puertos_ajenos.get(puerto)

    def puerto_abierto(self, puerto: int) -> bool:
        return self._proceso_en(puerto) is not None or puerto in self.puertos_ajenos

    def responde(self, url: str) -> bool:
        puerto = int(url.split(":")[2].split("/")[0])
        proceso = self._proceso_en(puerto)
        if proceso is None:
            return puerto in self.puertos_ajenos
        proceso.consultas += 1
        return proceso.consultas > proceso.responde_tras

    def ejecutar(self, comando: list[str], cwd: Path) -> int:
        self.ejecutados.append(comando)
        return 0

    def buscar_ejecutable(self, nombre: str) -> str | None:
        return nombre if nombre in self.ejecutables else None

    def dormir(self, segundos: float) -> None:
        self.reloj += segundos

    def ahora(self) -> float:
        return self.reloj


def hacer_config(base: Path) -> Config:
    backend_dir = base / "backend"
    frontend_dir = base / "frontend"
    (backend_dir / ".venv" / "Scripts").mkdir(parents=True)
    (backend_dir / ".venv" / "bin").mkdir(parents=True)
    (backend_dir / ".venv" / "Scripts" / "python.exe").write_text("", encoding="utf-8")
    (backend_dir / ".venv" / "bin" / "python").write_text("", encoding="utf-8")
    (frontend_dir / "node_modules").mkdir(parents=True)
    return Config(
        backend=Servicio("backend", backend_dir, 8000, "http://127.0.0.1:8000/api/salud", 10, "API"),
        frontend=Servicio("frontend", frontend_dir, 4200, "http://localhost:4200/", 10, "Angular"),
        dir_run=base / ".run",
        dir_logs=base / "logs",
    )


@pytest.fixture
def sistema() -> SistemaFalso:
    return SistemaFalso()


@pytest.fixture
def salida() -> io.StringIO:
    return io.StringIO()


@pytest.fixture
def orquestador(tmp_path: Path, sistema: SistemaFalso, salida: io.StringIO) -> Orquestador:
    return Orquestador(hacer_config(tmp_path), sistema, Consola(salida))
