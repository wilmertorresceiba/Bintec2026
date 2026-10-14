from datetime import UTC, datetime, timedelta

import pytest

from app.modules.creditos.domain.entities import Credito, CreditoInvalidoError, TipoCredito
from app.modules.dashboard.domain.resumen import calcular_resumen
from app.modules.tarjetas.domain.entities import (
    MarcaTarjeta,
    TarjetaCredito,
    TarjetaInvalidaError,
)
from app.shared.domain.estado_producto import EstadoProducto

AHORA = datetime(2026, 10, 12, tzinfo=UTC)


def _tarjeta(**cambios: object) -> TarjetaCredito:
    datos: dict[str, object] = {
        "id": "t1",
        "usuario_id": 1,
        "marca": MarcaTarjeta.VISA,
        "nombre": "Visa",
        "ultimos_digitos": "4821",
        "cupo_total": 1_000,
        "cupo_utilizado": 250,
        "pago_minimo": 25,
        "pago_total": 250,
        "fecha_limite_pago": AHORA + timedelta(days=5),
        "estado": EstadoProducto.AL_DIA,
    }
    return TarjetaCredito(**{**datos, **cambios})  # type: ignore[arg-type]


def _credito(**cambios: object) -> Credito:
    datos: dict[str, object] = {
        "id": "c1",
        "usuario_id": 1,
        "tipo": TipoCredito.VEHICULO,
        "ultimos_digitos": "7745",
        "monto_original": 10_000,
        "saldo_capital": 6_000,
        "valor_cuota": 500,
        "cuotas_pagadas": 10,
        "cuotas_totales": 40,
        "tasa_mensual": 1.2,
        "proximo_pago": AHORA + timedelta(days=2),
        "estado": EstadoProducto.AL_DIA,
    }
    return Credito(**{**datos, **cambios})  # type: ignore[arg-type]


def test_tarjeta_calcula_cupo_disponible_y_uso() -> None:
    tarjeta = _tarjeta()
    assert tarjeta.cupo_disponible == 750
    assert tarjeta.porcentaje_uso == 25


@pytest.mark.parametrize(
    "cambios",
    [
        {"cupo_total": 0},
        {"cupo_utilizado": 2_000},
        {"pago_minimo": -1},
        {"ultimos_digitos": "12"},
        {"ultimos_digitos": "abcd"},
    ],
)
def test_tarjeta_rechaza_estados_invalidos(cambios: dict[str, object]) -> None:
    with pytest.raises(TarjetaInvalidaError):
        _tarjeta(**cambios)


def test_credito_calcula_progreso_y_numero_enmascarado() -> None:
    credito = _credito()
    assert credito.cuotas_restantes == 30
    assert credito.porcentaje_pagado == 25
    assert credito.numero == "•••• 7745"


@pytest.mark.parametrize(
    "cambios",
    [{"cuotas_pagadas": 41}, {"cuotas_totales": 0}, {"saldo_capital": 20_000}, {"valor_cuota": 0}],
)
def test_credito_rechaza_estados_invalidos(cambios: dict[str, object]) -> None:
    with pytest.raises(CreditoInvalidoError):
        _credito(**cambios)


def test_resumen_consolida_deuda_cupo_pagos_y_vencimiento() -> None:
    resumen = calcular_resumen([_tarjeta()], [_credito()])
    assert resumen.deuda_total == 250 + 6_000
    assert resumen.cupo_disponible == 750
    assert resumen.pago_mensual_estimado == 25 + 500
    assert resumen.proximo_vencimiento == AHORA + timedelta(days=2)


def test_resumen_sin_productos_no_tiene_vencimiento() -> None:
    resumen = calcular_resumen([], [])
    assert resumen.deuda_total == 0
    assert resumen.proximo_vencimiento is None
