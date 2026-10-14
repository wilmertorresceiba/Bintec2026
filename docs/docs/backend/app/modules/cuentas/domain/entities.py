from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum

from app.shared.errors import DomainError

_LONGITUD_ULTIMOS_DIGITOS: int = 4


class TipoCuenta(StrEnum):
    AHORROS = "Cuenta de Ahorros"
    AHORRO_PROGRAMADO = "Ahorro Programado"


class EstadoCuenta(StrEnum):
    ACTIVA = "ACTIVA"
    INACTIVA = "INACTIVA"
    BLOQUEADA = "BLOQUEADA"


class CuentaInvalidaError(DomainError):
    codigo = "cuenta_invalida"


@dataclass(frozen=True, slots=True)
class CuentaAhorro:
    """Cuenta de ahorros de un cliente. Los valores monetarios son pesos COP enteros.

    Invariantes: saldos >= 0, el saldo disponible no supera el saldo total (la diferencia
    son valores retenidos), tasa efectiva anual >= 0 y 4 últimos dígitos numéricos.
    """

    id: str
    usuario_id: int
    tipo: TipoCuenta
    ultimos_digitos: str
    saldo_total: int
    saldo_disponible: int
    rendimientos_mes: int
    tasa_efectiva_anual: float
    fecha_apertura: datetime
    estado: EstadoCuenta

    def __post_init__(self) -> None:
        if self.saldo_total < 0 or not 0 <= self.saldo_disponible <= self.saldo_total:
            raise CuentaInvalidaError("El saldo disponible debe estar entre 0 y el saldo total")
        if self.rendimientos_mes < 0 or self.tasa_efectiva_anual < 0:
            raise CuentaInvalidaError("Los rendimientos y la tasa no pueden ser negativos")
        if (
            len(self.ultimos_digitos) != _LONGITUD_ULTIMOS_DIGITOS
            or not self.ultimos_digitos.isdigit()
        ):
            raise CuentaInvalidaError("Los últimos dígitos deben ser exactamente 4 números")

    @property
    def numero(self) -> str:
        return f"•••• {self.ultimos_digitos}"

    @property
    def saldo_retenido(self) -> int:
        return self.saldo_total - self.saldo_disponible
