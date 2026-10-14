from __future__ import annotations

from pathlib import Path

import pytest

from bintec_deploy import config
from bintec_deploy.cli import construir_parser
from bintec_deploy.registro import RegistroPids
from bintec_deploy.sistema import parsear_netstat

NETSTAT = """
Conexiones activas

  Proto  Dirección local         Dirección remota       Estado           PID
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       1128
  TCP    127.0.0.1:8000         0.0.0.0:0              LISTENING       32620
  TCP    [::]:4200              [::]:0                 LISTENING       15392
  TCP    127.0.0.1:8000         127.0.0.1:55455        ESTABLISHED     32620
"""


def test_netstat_encuentra_el_pid_que_escucha_en_el_puerto() -> None:
    assert parsear_netstat(NETSTAT, 8000) == 32620
    assert parsear_netstat(NETSTAT, 4200) == 15392  # también direcciones IPv6
    assert parsear_netstat(NETSTAT, 9999) is None


def test_netstat_ignora_conexiones_establecidas() -> None:
    solo_establecida = "  TCP    127.0.0.1:8000    127.0.0.1:55455    ESTABLISHED    1"
    assert parsear_netstat(solo_establecida, 8000) is None


def test_registro_guarda_lee_y_borra(tmp_path: Path) -> None:
    registro = RegistroPids(tmp_path)
    assert registro.leer("backend") is None
    guardado = registro.guardar("backend", 123, 8000, ["python", "-m", "uvicorn"])
    leido = registro.leer("backend")
    assert leido == guardado
    assert leido is not None and leido.pid == 123
    registro.borrar("backend")
    assert registro.leer("backend") is None


def test_registro_corrupto_se_descarta(tmp_path: Path) -> None:
    (tmp_path / "backend.json").write_text("{no es json", encoding="utf-8")
    assert RegistroPids(tmp_path).leer("backend") is None
    assert not (tmp_path / "backend.json").exists()


def test_configuracion_por_defecto_y_sobrescritura_por_entorno() -> None:
    por_defecto = config.cargar({})
    assert (por_defecto.backend.puerto, por_defecto.frontend.puerto) == (8000, 4200)
    assert por_defecto.backend.directorio.name == "backend"
    assert por_defecto.frontend.directorio.name == "frontend"
    assert por_defecto.backend.url_salud.endswith("/api/salud")

    cambiada = config.cargar(
        {"BINTEC_DEPLOY_BACKEND_PUERTO": "8100", "BINTEC_DEPLOY_FRONTEND_PUERTO": "4300"}
    )
    assert (cambiada.backend.puerto, cambiada.frontend.puerto) == (8100, 4300)
    assert "8100" in cambiada.backend.url_salud


@pytest.mark.parametrize(
    ("argumentos", "comando"),
    [
        (["backend"], "backend"),
        (["frontend"], "frontend"),
        (["iniciar"], "iniciar"),
        (["start"], "start"),
        (["reiniciar"], "reiniciar"),
        (["detener"], "detener"),
        (["stop", "backend"], "stop"),
        (["estado"], "estado"),
        (["logs", "backend", "-n", "5"], "logs"),
    ],
)
def test_el_cli_reconoce_todos_los_comandos(argumentos: list[str], comando: str) -> None:
    assert construir_parser().parse_args(argumentos).comando == comando


def test_el_cli_exige_un_comando_y_valida_los_objetivos() -> None:
    parser = construir_parser()
    with pytest.raises(SystemExit):
        parser.parse_args([])
    with pytest.raises(SystemExit):
        parser.parse_args(["detener", "base-de-datos"])
    assert parser.parse_args(["detener"]).objetivo == "todo"
    assert parser.parse_args(["reiniciar", "frontend"]).objetivo == "frontend"
