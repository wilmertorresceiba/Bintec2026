from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum

from app.shared.domain.estado_producto import EstadoProducto
from app.shared.errors import DomainError

_LONGITUD_ULTIMOS_DIGITOS: int = 4
_PORCENTAJE_MAXIMO: int = 100


class MarcaTarjeta(StrEnum):
    VISA = "VISA"
    MASTERCARD = "MASTERCARD"
    AMEX = "AMEX"


class TarjetaInvalidaError(DomainError):
    codigo = "tarjeta_invalida"


@dataclass(frozen=True, slots=True)
class TarjetaCredito:
    """Tarjeta de crédito de un cliente. Los valores monetarios son pesos COP enteros.

    Invariantes: cupo total > 0, 0 <= cupo utilizado <= cupo total,
    pagos >= 0 y últimos dígitos con exactamente 4 números.
    """

    id: str
    usuario_id: int
    marca: MarcaTarjeta
    nombre: str
    ultimos_digitos: str
    cupo_total: int
    cupo_utilizado: int
    pago_minimo: int
    pago_total: int
    fecha_limite_pago: datetime
    estado: EstadoProducto

    def __post_init__(self) -> None:
        if self.cupo_total <= 0:
            raise TarjetaInvalidaError("El cupo total debe ser mayor a cero")
        if not 0 <= self.cupo_utilizado <= self.cupo_total:
            raise TarjetaInvalidaError("El cupo utilizado debe estar entre 0 y el cupo total")
        if self.pago_minimo < 0 or self.pago_total < 0:
            raise TarjetaInvalidaError("Los pagos no pueden ser negativos")
        if (
            len(self.ultimos_digitos) != _LONGITUD_ULTIMOS_DIGITOS
            or not self.ultimos_digitos.isdigit()
        ):
            raise TarjetaInvalidaError("Los últimos dígitos deben ser exactamente 4 números")

    @property
    def cupo_disponible(self) -> int:
        return self.cupo_total - self.cupo_utilizado

    @property
    def porcentaje_uso(self) -> float:
        return self.cupo_utilizado / self.cupo_total * _PORCENTAJE_MAXIMO
