from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum


class TipoMovimiento(StrEnum):
    COMPRA = "COMPRA"
    PAGO = "PAGO"
    AVANCE = "AVANCE"
    CUOTA_CREDITO = "CUOTA_CREDITO"


@dataclass(frozen=True, slots=True)
class Movimiento:
    """Movimiento de un producto. `valor` es negativo para cargos y positivo para abonos."""

    id: str
    usuario_id: int
    fecha: datetime
    descripcion: str
    producto: str
    tipo: TipoMovimiento
    valor: int

    @property
    def es_abono(self) -> bool:
        return self.valor > 0
