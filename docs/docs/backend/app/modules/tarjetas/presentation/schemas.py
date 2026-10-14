from datetime import datetime

from app.shared.schemas import EsquemaCamel


class TarjetaRespuesta(EsquemaCamel):
    id: str
    marca: str
    nombre: str
    ultimos_digitos: str
    cupo_total: int
    cupo_utilizado: int
    pago_minimo: int
    pago_total: int
    fecha_limite_pago: datetime
    estado: str
