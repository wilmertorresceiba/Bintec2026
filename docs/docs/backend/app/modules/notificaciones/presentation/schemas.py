from datetime import datetime

from app.shared.schemas import EsquemaCamel


class NotificacionRespuesta(EsquemaCamel):
    id: str
    tipo: str
    titulo: str
    mensaje: str
    fecha: datetime
    estado: str


class OfertaRespuesta(EsquemaCamel):
    monto: int
    cuotas: int
    tasa_mensual: float
    valor_cuota: int
    total_a_pagar: int
    fecha_primera_cuota: datetime


class NotificacionDetalleRespuesta(EsquemaCamel):
    notificacion: NotificacionRespuesta
    oferta: OfertaRespuesta | None
