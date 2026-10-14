from datetime import UTC, datetime

import pytest

from app.modules.cuentas.domain.entities import (
    CuentaAhorro,
    CuentaInvalidaError,
    EstadoCuenta,
    TipoCuenta,
)

AHORA = datetime(2026, 10, 12, tzinfo=UTC)


def _cuenta(**cambios: object) -> CuentaAhorro:
    datos: dict[str, object] = {
        "id": "c1",
        "usuario_id": 1,
        "tipo": TipoCuenta.AHORROS,
        "ultimos_digitos": "5538",
        "saldo_total": 1_000,
        "saldo_disponible": 900,
        "rendimientos_mes": 10,
        "tasa_efectiva_anual": 1.5,
        "fecha_apertura": AHORA,
        "estado": EstadoCuenta.ACTIVA,
    }
    return CuentaAhorro(**{**datos, **cambios})  # type: ignore[arg-type]


def test_la_cuenta_calcula_su_numero_enmascarado_y_el_saldo_retenido() -> None:
    cuenta = _cuenta()
    assert cuenta.numero == "•••• 5538"
    assert cuenta.saldo_retenido == 100


@pytest.mark.parametrize(
    "cambios",
    [
        {"saldo_total": -1},
        {"saldo_disponible": 2_000},
        {"saldo_disponible": -5},
        {"rendimientos_mes": -1},
        {"tasa_efectiva_anual": -0.1},
        {"ultimos_digitos": "12"},
        {"ultimos_digitos": "abcd"},
    ],
)
def test_la_cuenta_rechaza_estados_invalidos(cambios: dict[str, object]) -> None:
    with pytest.raises(CuentaInvalidaError):
        _cuenta(**cambios)
