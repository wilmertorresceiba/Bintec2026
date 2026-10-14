"""Oferta de crédito de libre inversión preaprobada y su simulación (amortización francesa)."""

from dataclasses import dataclass
from datetime import datetime, timedelta

from app.modules.creditos.domain.entities import Credito, TipoCredito
from app.shared.domain.estado_producto import EstadoProducto

_PORCENTAJE: int = 100
DIAS_PRIMERA_CUOTA: int = 30


@dataclass(frozen=True, slots=True)
class OfertaLibreInversion:
    monto: int = 15_000_000
    cuotas: int = 24
    tasa_mensual: float = 1.55  # % mensual

    @property
    def total_a_pagar(self) -> int:
        """Suma de todas las cuotas (capital + intereses)."""
        return self.valor_cuota * self.cuotas

    @property
    def valor_cuota(self) -> int:
        """Cuota fija mensual: C = M·i / (1 − (1 + i)^−n)."""
        tasa = self.tasa_mensual / _PORCENTAJE
        if tasa == 0:
            return round(self.monto / self.cuotas)
        return round(self.monto * tasa / (1 - (1 + tasa) ** -self.cuotas))


OFERTA_LIBRE_INVERSION: OfertaLibreInversion = OfertaLibreInversion()


def crear_credito_desde_oferta(
    credito_id: str,
    usuario_id: int,
    ultimos_digitos: str,
    oferta: OfertaLibreInversion,
    ahora: datetime,
) -> Credito:
    """Crédito nuevo al aceptar la oferta: sin cuotas pagadas y con la primera cuota a 30 días."""
    return Credito(
        id=credito_id,
        usuario_id=usuario_id,
        tipo=TipoCredito.LIBRE_INVERSION,
        ultimos_digitos=ultimos_digitos,
        monto_original=oferta.monto,
        saldo_capital=oferta.monto,
        valor_cuota=oferta.valor_cuota,
        cuotas_pagadas=0,
        cuotas_totales=oferta.cuotas,
        tasa_mensual=oferta.tasa_mensual,
        proximo_pago=ahora + timedelta(days=DIAS_PRIMERA_CUOTA),
        estado=EstadoProducto.AL_DIA,
    )
