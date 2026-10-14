from __future__ import annotations

import io
from pathlib import Path

from bintec_deploy.config import BACKEND, FRONTEND
from bintec_deploy.orquestador import Orquestador
from bintec_deploy.registro import RegistroPids
from tests.conftest import SistemaFalso

TODO = (BACKEND, FRONTEND)


def _comandos(sistema: SistemaFalso) -> list[str]:
    return ["backend" if "uvicorn" in " ".join(c) else "frontend" for c in sistema.lanzados]


# ----------------------------------------------------------------- iniciar
def test_iniciar_todo_lanza_primero_el_backend_y_despues_el_frontend(
    orquestador: Orquestador, sistema: SistemaFalso
) -> None:
    assert orquestador.iniciar(TODO) == 0
    assert _comandos(sistema) == ["backend", "frontend"]


def test_solo_backend_no_toca_el_frontend(orquestador: Orquestador, sistema: SistemaFalso) -> None:
    assert orquestador.iniciar((BACKEND,)) == 0
    assert _comandos(sistema) == ["backend"]


def test_solo_frontend_avisa_si_el_backend_no_esta_activo(
    orquestador: Orquestador, sistema: SistemaFalso, salida: io.StringIO
) -> None:
    assert orquestador.iniciar((FRONTEND,)) == 0
    assert _comandos(sistema) == ["frontend"]
    assert "backend no está activo" in salida.getvalue()


def test_comandos_de_arranque(orquestador: Orquestador, sistema: SistemaFalso) -> None:
    orquestador.iniciar(TODO, abrir_navegador=True)
    backend, frontend = sistema.lanzados
    assert backend[1:5] == ["-m", "uvicorn", "app.main:crear_app", "--factory"]
    assert backend[-2:] == ["--port", "8000"]
    assert frontend[1:3] == ["ng", "serve"]
    assert "--proxy-config" in frontend
    assert "--open" in frontend


def test_si_ya_esta_corriendo_no_lo_lanza_otra_vez(
    orquestador: Orquestador, sistema: SistemaFalso, salida: io.StringIO
) -> None:
    orquestador.iniciar((BACKEND,))
    assert orquestador.iniciar((BACKEND,)) == 0
    assert len(sistema.lanzados) == 1
    assert "ya está corriendo" in salida.getvalue()


def test_espera_a_que_el_servicio_responda(orquestador: Orquestador, sistema: SistemaFalso) -> None:
    sistema.arranque_lento = 3
    assert orquestador.iniciar((BACKEND,)) == 0
    assert sistema.reloj >= 3  # tuvo que esperar varias consultas


def test_si_el_servicio_muere_al_arrancar_falla_y_muestra_el_log(
    orquestador: Orquestador, sistema: SistemaFalso, salida: io.StringIO
) -> None:
    sistema.arranque_fallido = {"backend"}
    assert orquestador.iniciar((BACKEND,)) == 1
    assert "se cerró al arrancar" in salida.getvalue()
    assert "algo falló al arrancar" in salida.getvalue()


def test_si_el_backend_falla_no_inicia_el_frontend(orquestador: Orquestador, sistema: SistemaFalso) -> None:
    sistema.arranque_fallido = {"backend"}
    assert orquestador.iniciar(TODO) == 1
    assert _comandos(sistema) == ["backend"]


def test_si_no_responde_a_tiempo_falla(orquestador: Orquestador, sistema: SistemaFalso) -> None:
    sistema.arranque_lento = 10_000
    assert orquestador.iniciar((BACKEND,)) == 1


def test_puerto_ocupado_por_un_proceso_ajeno_no_se_mata_sin_forzar(
    orquestador: Orquestador, sistema: SistemaFalso, salida: io.StringIO
) -> None:
    sistema.puertos_ajenos[4200] = 777
    assert orquestador.iniciar((FRONTEND,)) == 1
    assert sistema.terminados == []
    assert "PID 777" in salida.getvalue()
    assert "--forzar" in salida.getvalue()


def test_con_forzar_libera_el_puerto_ajeno_y_arranca(orquestador: Orquestador, sistema: SistemaFalso) -> None:
    sistema.puertos_ajenos[4200] = 777
    assert orquestador.iniciar((FRONTEND,), forzar=True) == 0
    assert sistema.terminados == [777]
    assert _comandos(sistema) == ["frontend"]


def test_prepara_el_entorno_si_faltan_dependencias(
    tmp_path: Path, sistema: SistemaFalso, salida: io.StringIO
) -> None:
    from bintec_deploy.consola import Consola
    from tests.conftest import hacer_config

    config = hacer_config(tmp_path)
    (config.frontend.directorio / "node_modules").rmdir()
    orquesta = Orquestador(config, sistema, Consola(salida))
    assert orquesta.iniciar((FRONTEND,)) == 0
    assert ["npm", "install"] in sistema.ejecutados


def test_sin_preparar_no_instala_nada(tmp_path: Path, sistema: SistemaFalso, salida: io.StringIO) -> None:
    from bintec_deploy.consola import Consola
    from tests.conftest import hacer_config

    config = hacer_config(tmp_path)
    (config.frontend.directorio / "node_modules").rmdir()
    Orquestador(config, sistema, Consola(salida)).iniciar((FRONTEND,), preparar=False)
    assert sistema.ejecutados == []


def test_sin_node_el_frontend_da_un_error_claro(
    orquestador: Orquestador, sistema: SistemaFalso, salida: io.StringIO
) -> None:
    sistema.ejecutables.clear()
    assert orquestador.iniciar((FRONTEND,)) == 1
    assert "Node.js" in salida.getvalue()


# ----------------------------------------------------------------- detener
def test_detener_cierra_el_frontend_antes_que_el_backend(
    orquestador: Orquestador, sistema: SistemaFalso
) -> None:
    orquestador.iniciar(TODO)
    pid_backend, pid_frontend = list(sistema.procesos)
    assert orquestador.detener(TODO) == 0
    assert sistema.terminados == [pid_frontend, pid_backend]
    assert not sistema.puerto_abierto(8000)
    assert not sistema.puerto_abierto(4200)


def test_detener_borra_el_registro(orquestador: Orquestador, tmp_path: Path) -> None:
    orquestador.iniciar((BACKEND,))
    registro = RegistroPids(tmp_path / ".run")
    assert registro.leer("backend") is not None
    orquestador.detener((BACKEND,))
    assert registro.leer("backend") is None


def test_detener_algo_que_no_corre_no_es_un_error(orquestador: Orquestador, salida: io.StringIO) -> None:
    assert orquestador.detener(TODO) == 0
    assert "ya estaba detenido" in salida.getvalue()


def test_detener_solo_uno_deja_el_otro_en_pie(orquestador: Orquestador, sistema: SistemaFalso) -> None:
    orquestador.iniciar(TODO)
    orquestador.detener((FRONTEND,))
    assert sistema.puerto_abierto(8000)
    assert not sistema.puerto_abierto(4200)


def test_un_proceso_ajeno_no_se_detiene_sin_forzar(
    orquestador: Orquestador, sistema: SistemaFalso, salida: io.StringIO
) -> None:
    sistema.puertos_ajenos[8000] = 555
    orquestador.detener((BACKEND,))
    assert sistema.terminados == []
    assert "no lo inició deploy.py" in salida.getvalue()


def test_detener_con_forzar_cierra_el_proceso_ajeno(orquestador: Orquestador, sistema: SistemaFalso) -> None:
    sistema.puertos_ajenos[8000] = 555
    assert orquestador.detener((BACKEND,), forzar=True) == 0
    assert sistema.terminados == [555]


# --------------------------------------------------------------- reiniciar
def test_reiniciar_detiene_y_vuelve_a_iniciar_en_orden(
    orquestador: Orquestador, sistema: SistemaFalso
) -> None:
    orquestador.iniciar(TODO)
    antiguos = list(sistema.procesos)
    assert orquestador.reiniciar(TODO) == 0
    assert set(antiguos) <= set(sistema.terminados)
    assert _comandos(sistema) == ["backend", "frontend", "backend", "frontend"]
    assert sistema.puerto_abierto(8000) and sistema.puerto_abierto(4200)


def test_reiniciar_solo_el_backend_no_toca_el_frontend(
    orquestador: Orquestador, sistema: SistemaFalso
) -> None:
    orquestador.iniciar(TODO)
    pid_frontend = list(sistema.procesos)[1]
    orquestador.reiniciar((BACKEND,))
    assert pid_frontend not in sistema.terminados
    assert _comandos(sistema) == ["backend", "frontend", "backend"]


# ------------------------------------------------------------ estado y logs
def test_estado_distingue_corriendo_detenido_y_externo(
    orquestador: Orquestador, sistema: SistemaFalso, salida: io.StringIO
) -> None:
    orquestador.iniciar((BACKEND,))
    sistema.puertos_ajenos[4200] = 333
    orquestador.estado()
    texto = salida.getvalue()
    linea_backend = next(linea for linea in texto.splitlines() if linea.startswith("backend"))
    linea_frontend = next(linea for linea in texto.splitlines() if linea.startswith("frontend"))
    assert "corriendo" in linea_backend
    assert "en uso (externo)" in linea_frontend
    assert "333" in linea_frontend


def test_estado_detenido(orquestador: Orquestador, salida: io.StringIO) -> None:
    orquestador.estado()
    assert salida.getvalue().count("detenido") == 2


def test_logs_muestra_las_ultimas_lineas(
    orquestador: Orquestador, tmp_path: Path, salida: io.StringIO
) -> None:
    orquestador.iniciar((BACKEND,))
    assert orquestador.logs("backend", 1) == 0
    assert "algo falló al arrancar" in salida.getvalue()


def test_logs_sin_archivo_avisa(orquestador: Orquestador) -> None:
    assert orquestador.logs("frontend", 10) == 1
