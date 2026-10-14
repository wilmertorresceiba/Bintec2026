from datetime import datetime

from app.modules.creditos.presentation.schemas import CreditoRespuesta
from app.modules.movimientos.presentation.schemas import MovimientoRespuesta
from app.modules.tarjetas.presentation.schemas import TarjetaRespuesta
from app.shared.schemas import EsquemaCamel


class ResumenRespuesta(EsquemaCamel):
    deuda_total: int
    cupo_disponible: int
    pago_mensual_estimado: int
    proximo_vencimiento: datetime | None


class DashboardRespuesta(EsquemaCamel):
    resumen: ResumenRespuesta
    tarjetas: list[TarjetaRespuesta]
    creditos: list[CreditoRespuesta]
    movimientos: list[MovimientoRespuesta]
