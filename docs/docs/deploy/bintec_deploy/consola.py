"""Salida por consola (ASCII-segura para terminales de Windows)."""

from __future__ import annotations

import sys
from typing import TextIO


class Consola:
    def __init__(self, salida: TextIO | None = None) -> None:
        self._salida = salida or sys.stdout

    def _escribir(self, prefijo: str, mensaje: str) -> None:
        print(f"{prefijo} {mensaje}", file=self._salida, flush=True)

    def info(self, mensaje: str) -> None:
        self._escribir("[..]", mensaje)

    def ok(self, mensaje: str) -> None:
        self._escribir("[ok]", mensaje)

    def aviso(self, mensaje: str) -> None:
        self._escribir("[!!]", mensaje)

    def error(self, mensaje: str) -> None:
        self._escribir("[xx]", mensaje)

    def linea(self, mensaje: str = "") -> None:
        print(mensaje, file=self._salida, flush=True)
