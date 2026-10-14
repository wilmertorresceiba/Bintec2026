from datetime import datetime

from app.shared.schemas import EsquemaCamel


class MovimientoRespuesta(EsquemaCamel):
    id: str
    fecha: datetime
    descripcion: str
    producto: str
    tipo: str
    valor: int
