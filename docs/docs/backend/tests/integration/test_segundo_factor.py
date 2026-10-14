from fastapi.testclient import TestClient

from tests.conftest import obtener_desafio


def _verificar(
    cliente: TestClient, desafio: str, cajero: str, codigo: str
) -> tuple[int, dict[str, str]]:
    respuesta = cliente.post(
        "/api/auth/verificar",
        json={"desafio": desafio, "claveCajero": cajero, "codigoSeguridad": codigo},
    )
    return respuesta.status_code, respuesta.json()


def test_el_desafio_del_paso_1_no_sirve_como_sesion(cliente: TestClient) -> None:
    desafio = obtener_desafio(cliente)
    for ruta in ("/api/dashboard", "/api/auth/me", "/api/notificaciones"):
        respuesta = cliente.get(ruta, headers={"Authorization": f"Bearer {desafio}"})
        assert respuesta.status_code == 401, ruta


def test_clave_de_cajero_o_codigo_incorrectos_devuelven_401_sin_revelar_cual(
    cliente: TestClient,
) -> None:
    desafio = obtener_desafio(cliente)
    for cajero, codigo in (("0000", "123456"), ("1381", "000000")):
        estado, cuerpo = _verificar(cliente, desafio, cajero, codigo)
        assert estado == 401
        assert cuerpo["code"] == "segundo_factor_invalido"
        assert "token" not in cuerpo


def test_formato_invalido_devuelve_422(cliente: TestClient) -> None:
    desafio = obtener_desafio(cliente)
    for cajero, codigo in (
        ("13", "123456"),
        ("1381", "12"),
        ("abcd", "123456"),
        ("1381", "12345a"),
    ):
        estado, _ = _verificar(cliente, desafio, cajero, codigo)
        assert estado == 422, (cajero, codigo)


def test_un_desafio_invalido_devuelve_401_para_volver_al_paso_1(cliente: TestClient) -> None:
    estado, cuerpo = _verificar(cliente, "x" * 40, "1381", "123456")
    assert estado == 401
    assert cuerpo["code"] == "desafio_invalido"


def test_tres_intentos_fallidos_bloquean_la_cuenta_temporalmente(cliente: TestClient) -> None:
    desafio = obtener_desafio(cliente)
    for _ in range(2):
        assert _verificar(cliente, desafio, "0000", "123456")[0] == 401
    estado, cuerpo = _verificar(cliente, desafio, "0000", "123456")
    assert estado == 423
    assert cuerpo["code"] == "cuenta_bloqueada"
    assert "bloqueada" in cuerpo["detail"]

    # Bloqueada: ni los datos correctos ni un nuevo paso 1 funcionan
    assert _verificar(cliente, desafio, "1381", "123456")[0] == 423
    bloqueado = cliente.post(
        "/api/auth/login", json={"correo": "wilmer.torres@ceiba.com.co", "clave": "Demo2026*"}
    )
    assert bloqueado.status_code == 423


def test_claves_incorrectas_en_el_paso_1_tambien_cuentan_para_el_bloqueo(
    cliente: TestClient,
) -> None:
    for _ in range(2):
        assert (
            cliente.post(
                "/api/auth/login", json={"correo": "wilmer.torres@ceiba.com.co", "clave": "mala"}
            ).status_code
            == 401
        )
    tercero = cliente.post(
        "/api/auth/login", json={"correo": "wilmer.torres@ceiba.com.co", "clave": "mala"}
    )
    assert tercero.status_code == 423


def test_un_acierto_reinicia_el_contador_de_intentos(cliente: TestClient) -> None:
    desafio = obtener_desafio(cliente)
    assert _verificar(cliente, desafio, "0000", "123456")[0] == 401
    assert _verificar(cliente, desafio, "1381", "123456")[0] == 200
    # tras un acierto vuelve a tener los 3 intentos completos
    for _ in range(2):
        assert _verificar(cliente, desafio, "0000", "123456")[0] == 401
    assert _verificar(cliente, desafio, "1381", "123456")[0] == 200
