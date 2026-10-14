from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import crear_app
from app.seed import CLAVE_CAJERO_DEMO, CLAVE_DEMO, CORREO_DEMO
from app.shared.config import Settings

CODIGO_SEGURIDAD = "123456"


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    return Settings(
        database_url=f"sqlite:///{(tmp_path / 'test.db').as_posix()}",
        jwt_secret="secreto-de-pruebas-con-longitud-suficiente-32b",
        sembrar_al_iniciar=True,
    )


@pytest.fixture
def cliente(settings: Settings) -> Iterator[TestClient]:
    with TestClient(crear_app(settings)) as http:
        yield http


def obtener_desafio(http: TestClient, correo: str = CORREO_DEMO, clave: str = CLAVE_DEMO) -> str:
    respuesta = http.post("/api/auth/login", json={"correo": correo, "clave": clave})
    assert respuesta.status_code == 200, respuesta.text
    return str(respuesta.json()["desafio"])


def iniciar_sesion(
    http: TestClient,
    correo: str = CORREO_DEMO,
    clave: str = CLAVE_DEMO,
    clave_cajero: str = CLAVE_CAJERO_DEMO,
    codigo: str = CODIGO_SEGURIDAD,
) -> str:
    """Login completo en dos pasos; devuelve el token de acceso."""
    respuesta = http.post(
        "/api/auth/verificar",
        json={
            "desafio": obtener_desafio(http, correo, clave),
            "claveCajero": clave_cajero,
            "codigoSeguridad": codigo,
        },
    )
    assert respuesta.status_code == 200, respuesta.text
    return str(respuesta.json()["token"])


@pytest.fixture
def cabeceras(cliente: TestClient) -> dict[str, str]:
    return {"Authorization": f"Bearer {iniciar_sesion(cliente)}"}
