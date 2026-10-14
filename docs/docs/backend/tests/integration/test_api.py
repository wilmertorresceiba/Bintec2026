from fastapi.testclient import TestClient

from app.modules.identidad.infrastructure.models import UsuarioModelo
from app.modules.identidad.infrastructure.seguridad import HasheadorScrypt
from app.seed import CLAVE_DEMO, CORREO_DEMO, NOMBRE_DEMO
from tests.conftest import iniciar_sesion


def test_salud(cliente: TestClient) -> None:
    assert cliente.get("/api/salud").json() == {"estado": "ok"}


def test_login_en_dos_pasos_devuelve_la_sesion_en_camel_case(cliente: TestClient) -> None:
    paso1 = cliente.post("/api/auth/login", json={"correo": CORREO_DEMO, "clave": CLAVE_DEMO})
    assert paso1.status_code == 200
    assert set(paso1.json()) == {"desafio", "requiereSegundoFactor"}
    assert paso1.json()["requiereSegundoFactor"] is True
    assert "token" not in paso1.json()  # el paso 1 NO entrega sesión

    paso2 = cliente.post(
        "/api/auth/verificar",
        json={
            "desafio": paso1.json()["desafio"],
            "claveCajero": "1381",
            "codigoSeguridad": "123456",
        },
    )
    assert paso2.status_code == 200
    cuerpo = paso2.json()
    assert cuerpo["usuario"] == {"nombre": NOMBRE_DEMO, "correo": CORREO_DEMO}
    assert cuerpo["token"]


def test_login_con_clave_incorrecta_devuelve_401_con_mensaje(cliente: TestClient) -> None:
    respuesta = cliente.post("/api/auth/login", json={"correo": CORREO_DEMO, "clave": "incorrecta"})
    assert respuesta.status_code == 401
    assert respuesta.json()["code"] == "credenciales_invalidas"
    assert "incorrectos" in respuesta.json()["detail"]


def test_login_con_correo_mal_formado_devuelve_422(cliente: TestClient) -> None:
    assert cliente.post("/api/auth/login", json={"correo": "x", "clave": "y"}).status_code == 422


def test_endpoints_protegidos_exigen_token(cliente: TestClient) -> None:
    for ruta in (
        "/api/dashboard",
        "/api/tarjetas",
        "/api/creditos",
        "/api/movimientos",
        "/api/auth/me",
    ):
        assert cliente.get(ruta).status_code == 401, ruta
    assert (
        cliente.get("/api/dashboard", headers={"Authorization": "Bearer falso"}).status_code == 401
    )


def test_dashboard_cumple_el_contrato_del_frontend(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    cuerpo = cliente.get("/api/dashboard", headers=cabeceras).json()

    assert set(cuerpo) == {"resumen", "tarjetas", "creditos", "movimientos"}
    assert set(cuerpo["resumen"]) == {
        "deudaTotal",
        "cupoDisponible",
        "pagoMensualEstimado",
        "proximoVencimiento",
    }
    assert len(cuerpo["tarjetas"]) == 2
    assert len(cuerpo["creditos"]) == 2
    assert len(cuerpo["movimientos"]) == 6
    assert set(cuerpo["tarjetas"][0]) == {
        "id",
        "marca",
        "nombre",
        "ultimosDigitos",
        "cupoTotal",
        "cupoUtilizado",
        "pagoMinimo",
        "pagoTotal",
        "fechaLimitePago",
        "estado",
    }
    assert set(cuerpo["creditos"][0]) == {
        "id",
        "tipo",
        "numero",
        "montoOriginal",
        "saldoCapital",
        "valorCuota",
        "cuotasPagadas",
        "cuotasTotales",
        "tasaMensual",
        "proximoPago",
        "estado",
    }
    assert set(cuerpo["movimientos"][0]) == {
        "id",
        "fecha",
        "descripcion",
        "producto",
        "tipo",
        "valor",
    }


def test_resumen_del_dashboard_coincide_con_los_productos(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    cuerpo = cliente.get("/api/dashboard", headers=cabeceras).json()
    tarjetas, creditos = cuerpo["tarjetas"], cuerpo["creditos"]
    resumen = cuerpo["resumen"]
    assert resumen["deudaTotal"] == sum(t["cupoUtilizado"] for t in tarjetas) + sum(
        c["saldoCapital"] for c in creditos
    )
    assert resumen["cupoDisponible"] == sum(t["cupoTotal"] - t["cupoUtilizado"] for t in tarjetas)


def test_movimientos_respeta_limite_orden_y_validacion(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    lista = cliente.get("/api/movimientos?limite=3", headers=cabeceras).json()
    assert len(lista) == 3
    fechas = [m["fecha"] for m in lista]
    assert fechas == sorted(fechas, reverse=True)
    assert cliente.get("/api/movimientos?limite=0", headers=cabeceras).status_code == 422
    assert cliente.get("/api/movimientos?limite=101", headers=cabeceras).status_code == 422


def test_un_cliente_no_ve_los_productos_de_otro(cliente: TestClient) -> None:
    """BOLA/IDOR: los datos se acotan siempre al usuario del token."""
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
    token = iniciar_sesion(cliente, "otro@bintec.com", "Otra2026*")
    cuerpo = cliente.get("/api/dashboard", headers={"Authorization": f"Bearer {token}"}).json()
    assert cuerpo["tarjetas"] == []
    assert cuerpo["creditos"] == []
    assert cuerpo["movimientos"] == []
    assert cuerpo["resumen"]["deudaTotal"] == 0
    assert cuerpo["resumen"]["proximoVencimiento"] is None


def test_la_siembra_es_idempotente(settings, cliente: TestClient) -> None:  # type: ignore[no-untyped-def]
    from app.seed import sembrar

    with cliente.app.state.session_factory() as session:  # type: ignore[attr-defined]
        assert sembrar(session) is False


def test_consumo_por_anio_mes_y_dia(cliente: TestClient, cabeceras: dict[str, str]) -> None:
    anual = cliente.get("/api/analitica/consumo?periodo=anio", headers=cabeceras).json()
    assert anual["periodo"] == "anio"
    assert len(anual["puntos"]) >= 3
    assert anual["total"] == sum(p["total"] for p in anual["puntos"]) > 0
    assert set(anual["puntos"][0]) == {"clave", "etiqueta", "total", "transacciones"}
    assert anual["aniosDisponibles"] == [p["clave"] for p in anual["puntos"]]

    anio = anual["aniosDisponibles"][-2]  # año completo (el primero es parcial)
    mensual = cliente.get(
        f"/api/analitica/consumo?periodo=mes&anio={anio}", headers=cabeceras
    ).json()
    assert [p["etiqueta"] for p in mensual["puntos"]][:3] == ["Ene", "Feb", "Mar"]
    assert len(mensual["puntos"]) == 12
    assert mensual["total"] == next(p["total"] for p in anual["puntos"] if p["clave"] == anio)

    diario = cliente.get(
        f"/api/analitica/consumo?periodo=dia&anio={anio}&mes=3", headers=cabeceras
    ).json()
    assert len(diario["puntos"]) == 31
    assert diario["mes"] == 3
    assert diario["total"] == mensual["puntos"][2]["total"]
    assert diario["porProducto"]


def test_consumo_valida_parametros_y_exige_token(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    assert cliente.get("/api/analitica/consumo").status_code == 401
    assert (
        cliente.get("/api/analitica/consumo?periodo=semana", headers=cabeceras).status_code == 422
    )
    assert cliente.get("/api/analitica/consumo?mes=13", headers=cabeceras).status_code == 422


def test_consumo_de_un_cliente_sin_movimientos_es_cero(cliente: TestClient) -> None:
    with cliente.app.state.session_factory() as session:  # type: ignore[attr-defined]
        session.add(
            UsuarioModelo(
                nombre="Nuevo",
                correo="nuevo@bintec.com",
                clave_hash=HasheadorScrypt().hashear("Nueva2026*"),
                clave_cajero_hash=HasheadorScrypt().hashear("1381"),
            )
        )
        session.commit()
    token = iniciar_sesion(cliente, "nuevo@bintec.com", "Nueva2026*")
    cuerpo = cliente.get(
        "/api/analitica/consumo?periodo=anio", headers={"Authorization": f"Bearer {token}"}
    ).json()
    assert cuerpo["total"] == 0
    assert cuerpo["maximo"] is None
    assert len(cuerpo["puntos"]) == 1


def test_reporte_filtra_por_tipo_y_fechas(cliente: TestClient, cabeceras: dict[str, str]) -> None:
    todos = cliente.get("/api/movimientos/reporte?limite=50", headers=cabeceras).json()
    assert len(todos) == 50

    avances = cliente.get("/api/movimientos/reporte?tipo=AVANCE", headers=cabeceras).json()
    assert avances
    assert {m["tipo"] for m in avances} == {"AVANCE"}

    dia = todos[0]["fecha"][:10]
    del_dia = cliente.get(
        f"/api/movimientos/reporte?desde={dia}&hasta={dia}", headers=cabeceras
    ).json()
    assert del_dia
    assert {m["fecha"][:10] for m in del_dia} == {dia}


def test_reporte_rechaza_rango_invertido_y_exige_token(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    invertido = cliente.get(
        "/api/movimientos/reporte?desde=2026-02-01&hasta=2026-01-01", headers=cabeceras
    )
    assert invertido.status_code == 400
    assert invertido.json()["code"] == "rango_invalido"
    assert cliente.get("/api/movimientos/reporte").status_code == 401


def test_cuentas_de_ahorro_cumplen_el_contrato_y_no_incluyen_el_credito_eliminado(
    cliente: TestClient, cabeceras: dict[str, str]
) -> None:
    cuentas = cliente.get("/api/cuentas", headers=cabeceras).json()
    assert [c["tipo"] for c in cuentas] == ["Cuenta de Ahorros", "Ahorro Programado"]
    assert set(cuentas[0]) == {
        "id", "tipo", "numero", "saldoTotal", "saldoDisponible", "saldoRetenido",
        "rendimientosMes", "tasaEfectivaAnual", "fechaApertura", "estado",
    }  # fmt: skip
    assert cuentas[0]["saldoRetenido"] == cuentas[0]["saldoTotal"] - cuentas[0]["saldoDisponible"]
    assert cuentas[0]["numero"].startswith("•••• ")

    creditos = cliente.get("/api/creditos", headers=cabeceras).json()
    assert [c["tipo"] for c in creditos] == ["Vehículo", "Vivienda"]


def test_las_cuentas_exigen_token_y_estan_acotadas_al_cliente(cliente: TestClient) -> None:
    assert cliente.get("/api/cuentas").status_code == 401
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
    token = iniciar_sesion(cliente, "otro@bintec.com", "Otra2026*")
    assert cliente.get("/api/cuentas", headers={"Authorization": f"Bearer {token}"}).json() == []
