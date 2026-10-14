from fastapi.testclient import TestClient

from app.modules.creditos.domain.oferta import OFERTA_LIBRE_INVERSION
from app.modules.identidad.infrastructure.models import UsuarioModelo
from app.modules.identidad.infrastructure.seguridad import HasheadorScrypt
from tests.conftest import iniciar_sesion


def _activas(cliente: TestClient, cabeceras: dict[str, str]) -> list[dict[str, object]]:
    lista: list[dict[str, object]] = cliente.get("/api/notificaciones", headers=cabeceras).json()
    return lista


def _creditos(cliente: TestClient, cabeceras: dict[str, str]) -> list[dict[str, object]]:
    lista: list[dict[str, object]] = cliente.get("/api/creditos", headers=cabeceras).json()
    return lista


def test_el_cliente_demo_tiene_la_oferta_de_credito_preaprobado_activa(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    lista = _activas(cliente, cabeceras)
    assert len(lista) == 1
    assert set(lista[0]) == {"id", "tipo", "titulo", "mensaje", "fecha", "estado"}
    assert lista[0]["tipo"] == "CREDITO_PREAPROBADO"
    assert lista[0]["estado"] == "PENDIENTE"
    assert "libre inversión" in str(lista[0]["mensaje"]).lower()


def test_la_notificacion_sigue_activa_hasta_que_el_cliente_decide(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    """Consultarla (o recargar) no la descarta: solo aceptar o rechazar la cierra."""
    for _ in range(3):
        assert len(_activas(cliente, cabeceras)) == 1


def test_la_oferta_no_aparece_como_credito_mientras_no_se_acepte(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    assert len(_creditos(cliente, cabeceras)) == 2


def test_aceptar_crea_el_credito_de_libre_inversion_y_cierra_la_notificacion(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    notificacion_id = _activas(cliente, cabeceras)[0]["id"]
    respuesta = cliente.post(f"/api/notificaciones/{notificacion_id}/aceptar", headers=cabeceras)
    assert respuesta.status_code == 200
    assert respuesta.json()["estado"] == "ACEPTADA"

    assert _activas(cliente, cabeceras) == []
    creditos = _creditos(cliente, cabeceras)
    assert len(creditos) == 3
    nuevo = next(c for c in creditos if c["cuotasPagadas"] == 0)
    assert nuevo["tipo"] == "Libre inversión"
    assert nuevo["montoOriginal"] == nuevo["saldoCapital"] == OFERTA_LIBRE_INVERSION.monto
    assert nuevo["cuotasTotales"] == OFERTA_LIBRE_INVERSION.cuotas
    assert nuevo["valorCuota"] == OFERTA_LIBRE_INVERSION.valor_cuota
    assert nuevo["estado"] == "AL_DIA"


def test_rechazar_cierra_la_notificacion_sin_crear_credito(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    notificacion_id = _activas(cliente, cabeceras)[0]["id"]
    respuesta = cliente.post(f"/api/notificaciones/{notificacion_id}/rechazar", headers=cabeceras)
    assert respuesta.status_code == 200
    assert respuesta.json()["estado"] == "RECHAZADA"
    assert _activas(cliente, cabeceras) == []
    assert len(_creditos(cliente, cabeceras)) == 2


def test_la_decision_es_definitiva_y_no_duplica_creditos(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    notificacion_id = _activas(cliente, cabeceras)[0]["id"]
    assert (
        cliente.post(
            f"/api/notificaciones/{notificacion_id}/aceptar", headers=cabeceras
        ).status_code
        == 200
    )

    for accion in ("aceptar", "rechazar"):
        repetida = cliente.post(
            f"/api/notificaciones/{notificacion_id}/{accion}", headers=cabeceras
        )
        assert repetida.status_code == 409
        assert repetida.json()["code"] == "notificacion_resuelta"
    assert len(_creditos(cliente, cabeceras)) == 3


def test_una_notificacion_inexistente_devuelve_404(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    for accion in ("aceptar", "rechazar"):
        respuesta = cliente.post(f"/api/notificaciones/no-existe/{accion}", headers=cabeceras)
        assert respuesta.status_code == 404
        assert respuesta.json()["code"] == "no_encontrado"


def test_un_cliente_no_puede_ver_ni_decidir_la_oferta_de_otro(cliente: TestClient) -> None:
    """BOLA/IDOR: la notificación ajena responde igual que una inexistente."""
    demo = {"Authorization": f"Bearer {iniciar_sesion(cliente)}"}
    notificacion_id = _activas(cliente, demo)[0]["id"]

    with cliente.app.state.session_factory() as session:  # type: ignore[attr-defined]
        session.add(
            UsuarioModelo(
                nombre="Otro",
                correo="otro@bintec.com",
                clave_hash=HasheadorScrypt().hashear("Otra2026*"),
                clave_cajero_hash=HasheadorScrypt().hashear("1381"),
            )
        )
        session.commit()
    intruso = {"Authorization": f"Bearer {iniciar_sesion(cliente, 'otro@bintec.com', 'Otra2026*')}"}

    assert _activas(cliente, intruso) == []
    for accion in ("aceptar", "rechazar"):
        assert (
            cliente.post(
                f"/api/notificaciones/{notificacion_id}/{accion}", headers=intruso
            ).status_code
            == 404
        )
    assert _creditos(cliente, intruso) == []
    # la oferta original sigue activa y sin créditos nuevos
    assert len(_activas(cliente, demo)) == 1
    assert len(_creditos(cliente, demo)) == 2


def test_las_notificaciones_exigen_token(cliente: TestClient) -> None:
    assert cliente.get("/api/notificaciones").status_code == 401
    assert cliente.post("/api/notificaciones/x/aceptar").status_code == 401
    assert cliente.post("/api/notificaciones/x/rechazar").status_code == 401


def test_el_detalle_de_la_oferta_incluye_sus_condiciones(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    notificacion_id = _activas(cliente, cabeceras)[0]["id"]
    respuesta = cliente.get(f"/api/notificaciones/{notificacion_id}", headers=cabeceras)
    assert respuesta.status_code == 200
    cuerpo = respuesta.json()
    assert cuerpo["notificacion"]["id"] == notificacion_id
    assert cuerpo["notificacion"]["estado"] == "PENDIENTE"
    oferta = cuerpo["oferta"]
    assert set(oferta) == {
        "monto", "cuotas", "tasaMensual", "valorCuota", "totalAPagar", "fechaPrimeraCuota",
    }  # fmt: skip
    assert oferta["monto"] == OFERTA_LIBRE_INVERSION.monto
    assert oferta["valorCuota"] == OFERTA_LIBRE_INVERSION.valor_cuota
    assert oferta["totalAPagar"] == oferta["valorCuota"] * oferta["cuotas"]
    assert oferta["totalAPagar"] > oferta["monto"]


def test_consultar_el_detalle_no_resuelve_la_oferta(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    notificacion_id = _activas(cliente, cabeceras)[0]["id"]
    for _ in range(3):
        cliente.get(f"/api/notificaciones/{notificacion_id}", headers=cabeceras)
    assert len(_activas(cliente, cabeceras)) == 1
    assert len(_creditos(cliente, cabeceras)) == 2


def test_el_detalle_de_otro_cliente_o_inexistente_devuelve_404(cliente: TestClient) -> None:
    demo = {"Authorization": f"Bearer {iniciar_sesion(cliente)}"}
    notificacion_id = _activas(cliente, demo)[0]["id"]
    with cliente.app.state.session_factory() as session:  # type: ignore[attr-defined]
        session.add(
            UsuarioModelo(
                nombre="Otro",
                correo="otro@bintec.com",
                clave_hash=HasheadorScrypt().hashear("Otra2026*"),
                clave_cajero_hash=HasheadorScrypt().hashear("1381"),
            )
        )
        session.commit()
    intruso = {"Authorization": f"Bearer {iniciar_sesion(cliente, 'otro@bintec.com', 'Otra2026*')}"}
    assert cliente.get(f"/api/notificaciones/{notificacion_id}", headers=intruso).status_code == 404
    assert cliente.get("/api/notificaciones/no-existe", headers=demo).status_code == 404
    assert cliente.get(f"/api/notificaciones/{notificacion_id}").status_code == 401
