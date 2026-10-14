from datetime import datetime

from app.shared.schemas import EsquemaCamel


class CuentaAhorroRespuesta(EsquemaCamel):
    id: str
    tipo: str
    numero: str
    saldo_total: int
    saldo_disponible: int
    saldo_retenido: int
    rendimientos_mes: int
    tasa_efectiva_anual: float
    fecha_apertura: datetime
    estado: str
