from datetime import UTC, datetime

import pytest

from app.modules.creditos.domain.oferta import (
    OFERTA_LIBRE_INVERSION,
    OfertaLibreInversion,
    crear_credito_desde_oferta,
)
from app.modules.notificaciones.domain.entities import (
    EstadoNotificacion,
    Notificacion,
    NotificacionYaResueltaError,
    TipoNotificacion,
)

AHORA = datetime(2026, 10, 12, tzinfo=UTC)


def _notificacion() -> Notificacion:
    return Notificacion(
        id="n1",
        usuario_id=1,
        tipo=TipoNotificacion.CREDITO_PREAPROBADO,
        titulo="Crédito preaprobado",
        mensaje="Oferta",
        fecha=AHORA,
    )


def test_una_notificacion_nueva_esta_activa() -> None:
    assert _notificacion().activa
    assert _notificacion().estado is EstadoNotificacion.PENDIENTE


def test_aceptar_y_rechazar_la_cierran_sin_mutar_la_original() -> None:
    original = _notificacion()
    assert original.aceptar().estado is EstadoNotificacion.ACEPTADA
    assert original.rechazar().estado is EstadoNotificacion.RECHAZADA
    assert original.activa


@pytest.mark.parametrize("decidir", ["aceptar", "rechazar"])
def test_solo_se_puede_decidir_una_vez(decidir: str) -> None:
    resuelta = _notificacion().aceptar()
    with pytest.raises(NotificacionYaResueltaError):
        getattr(resuelta, decidir)()


def test_la_cuota_sigue_la_amortizacion_francesa() -> None:
    oferta = OfertaLibreInversion(monto=1_200_000, cuotas=12, tasa_mensual=0)
    assert oferta.valor_cuota == 100_000
    cuota = OFERTA_LIBRE_INVERSION.valor_cuota
    total_pagado = cuota * OFERTA_LIBRE_INVERSION.cuotas
    assert OFERTA_LIBRE_INVERSION.monto < total_pagado < OFERTA_LIBRE_INVERSION.monto * 1.3


def test_el_credito_de_la_oferta_nace_sin_pagos_y_con_primera_cuota_a_30_dias() -> None:
    credito = crear_credito_desde_oferta("c1", 1, "1234", OFERTA_LIBRE_INVERSION, AHORA)
    assert credito.cuotas_pagadas == 0
    assert credito.saldo_capital == credito.monto_original == OFERTA_LIBRE_INVERSION.monto
    assert (credito.proximo_pago - AHORA).days == 30
    assert credito.numero == "•••• 1234"
