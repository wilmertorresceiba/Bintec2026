"""Interfaz de línea de comandos de deploy.py."""

from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence

from bintec_deploy import __version__, config
from bintec_deploy.config import BACKEND, FRONTEND
from bintec_deploy.consola import Consola
from bintec_deploy.orquestador import Orquestador
from bintec_deploy.sistema import SistemaReal

TODO: str = "todo"
OBJETIVOS: dict[str, tuple[str, ...]] = {
    BACKEND: (BACKEND,),
    FRONTEND: (FRONTEND,),
    TODO: (BACKEND, FRONTEND),
}

EPILOGO: str = """ejemplos:
  python deploy.py backend            inicia solo el backend
  python deploy.py frontend           inicia solo el frontend
  python deploy.py iniciar            inicia el backend y, cuando responde, el frontend
  python deploy.py reiniciar          detiene todo y lo vuelve a iniciar
  python deploy.py detener            detiene todo
  python deploy.py estado             muestra qué está corriendo
  python deploy.py logs backend -n 50 últimas líneas del log
"""


def _añadir_forzar(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--forzar", action="store_true",
        help="cierra también procesos AJENOS a deploy.py que ocupen el puerto",
    )  # fmt: skip


def construir_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="deploy.py",
        description="Inicia, reinicia y detiene el backend y el frontend de la demo Bintec.",
        epilog=EPILOGO,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--version", action="version", version=f"deploy {__version__}")
    sub = parser.add_subparsers(dest="comando", required=True, metavar="comando")

    backend = sub.add_parser("backend", help="inicia SOLO el backend")
    _añadir_forzar(backend)
    backend.add_argument("--sin-preparar", action="store_true", help="no crear venv ni instalar")

    frontend = sub.add_parser("frontend", help="inicia SOLO el frontend")
    _añadir_forzar(frontend)
    frontend.add_argument("--abrir", action="store_true", help="abre el navegador al iniciar")
    frontend.add_argument("--sin-preparar", action="store_true", help="no ejecutar npm install")

    iniciar = sub.add_parser("iniciar", aliases=["start"], help="inicia el backend y después el frontend")
    _añadir_forzar(iniciar)
    iniciar.add_argument("--abrir", action="store_true", help="abre el navegador al iniciar")
    iniciar.add_argument("--sin-preparar", action="store_true", help="no crear venv ni instalar")

    reiniciar = sub.add_parser("reiniciar", aliases=["restart"], help="detiene y vuelve a iniciar")
    reiniciar.add_argument("objetivo", nargs="?", choices=list(OBJETIVOS), default=TODO)
    _añadir_forzar(reiniciar)
    reiniciar.add_argument("--abrir", action="store_true", help="abre el navegador al iniciar")
    reiniciar.add_argument("--sin-preparar", action="store_true", help="no crear venv ni instalar")

    detener = sub.add_parser("detener", aliases=["stop"], help="detiene los servicios")
    detener.add_argument("objetivo", nargs="?", choices=list(OBJETIVOS), default=TODO)
    _añadir_forzar(detener)

    sub.add_parser("estado", aliases=["status"], help="muestra el estado de cada servicio")

    logs = sub.add_parser("logs", help="muestra las últimas líneas del log de un servicio")
    logs.add_argument("servicio", choices=[BACKEND, FRONTEND])
    logs.add_argument("-n", "--lineas", type=int, default=40)
    return parser


def ejecutar(argumentos: Sequence[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    args = construir_parser().parse_args(argumentos)
    orquestador = Orquestador(config.cargar(), SistemaReal(), Consola())
    preparar = not getattr(args, "sin_preparar", False)
    abrir = getattr(args, "abrir", False)
    forzar = getattr(args, "forzar", False)

    match args.comando:
        case "backend":
            return orquestador.iniciar(OBJETIVOS[BACKEND], forzar=forzar, preparar=preparar)
        case "frontend":
            return orquestador.iniciar(
                OBJETIVOS[FRONTEND], abrir_navegador=abrir, forzar=forzar, preparar=preparar
            )
        case "iniciar" | "start":
            return orquestador.iniciar(
                OBJETIVOS[TODO], abrir_navegador=abrir, forzar=forzar, preparar=preparar
            )
        case "reiniciar" | "restart":
            return orquestador.reiniciar(
                OBJETIVOS[args.objetivo], abrir_navegador=abrir, forzar=forzar, preparar=preparar
            )
        case "detener" | "stop":
            return orquestador.detener(OBJETIVOS[args.objetivo], forzar=forzar)
        case "estado" | "status":
            return orquestador.estado()
        case "logs":
            return orquestador.logs(args.servicio, args.lineas)
    return 2
