from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime

from app.modules.creditos.domain.entities import Credito
from app.modules.tarjetas.domain.entities import TarjetaCredito


@dataclass(frozen=True, slots=True)
class ResumenFinanciero:
    deuda_total: int
    cupo_disponible: int
    pago_mensual_estimado: int
    proximo_vencimiento: datetime | None


def calcular_resumen(
    tarjetas: Sequence[TarjetaCredito], creditos: Sequence[Credito]
) -> ResumenFinanciero:
    """Servicio de dominio: consolida la posición financiera del cliente.

    - deuda total = cupo utilizado en tarjetas + saldo a capital de créditos
    - pago mensual estimado = pagos mínimos de tarjetas + cuotas de créditos
    - próximo vencimiento = la fecha de pago más cercana entre todos los productos
    """
    vencimientos: list[datetime] = [t.fecha_limite_pago for t in tarjetas] + [
        c.proximo_pago for c in creditos
    ]
    return ResumenFinanciero(
        deuda_total=sum(t.cupo_utilizado for t in tarjetas)
        + sum(c.saldo_capital for c in creditos),
        cupo_disponible=sum(t.cupo_disponible for t in tarjetas),
        pago_mensual_estimado=sum(t.pago_minimo for t in tarjetas)
        + sum(c.valor_cuota for c in creditos),
        proximo_vencimiento=min(vencimientos) if vencimientos else None,
    )
