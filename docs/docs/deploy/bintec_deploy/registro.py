"""Registro de PIDs: recuerda qué procesos lanzó deploy.py para poder detenerlos después."""

from __future__ import annotations

import json
import time
from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class Registro:
    nombre: str
    pid: int
    puerto: int
    inicio: float  # epoch en segundos
    comando: list[str]


class RegistroPids:
    def __init__(self, directorio: Path) -> None:
        self._directorio = directorio

    def _ruta(self, nombre: str) -> Path:
        return self._directorio / f"{nombre}.json"

    def guardar(self, nombre: str, pid: int, puerto: int, comando: list[str]) -> Registro:
        registro = Registro(nombre, pid, puerto, time.time(), comando)
        self._directorio.mkdir(parents=True, exist_ok=True)
        self._ruta(nombre).write_text(json.dumps(asdict(registro), indent=2), encoding="utf-8")
        return registro

    def leer(self, nombre: str) -> Registro | None:
        ruta = self._ruta(nombre)
        if not ruta.exists():
            return None
        try:
            datos = json.loads(ruta.read_text(encoding="utf-8"))
            return Registro(**datos)
        except (ValueError, TypeError, KeyError):
            ruta.unlink(missing_ok=True)  # registro corrupto: se descarta
            return None

    def borrar(self, nombre: str) -> None:
        self._ruta(nombre).unlink(missing_ok=True)
