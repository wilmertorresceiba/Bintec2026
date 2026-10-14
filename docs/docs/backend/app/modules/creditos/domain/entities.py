from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum

from app.shared.domain.estado_producto import EstadoProducto
from app.shared.errors import DomainError

_PORCENTAJE_MAXIMO: int = 100


class TipoCredito(StrEnum):
    LIBRE_INVERSION = "Libre inversión"
    VEHICULO = "Vehículo"
    VIVIENDA = "Vivienda"


class CreditoInvalidoError(DomainError):
    codigo = "credito_invalido"


@dataclass(frozen=True, slots=True)
class Credito:
    """Crédito de un cliente. Los valores monetarios son pesos COP enteros.

    Invariantes: 0 <= cuotas pagadas <= cuotas totales (> 0), 0 <= saldo <= monto original,
    cuota > 0 y tasa mensual >= 0.
    """

    id: str
    usuario_id: int
    tipo: TipoCredito
    ultimos_digitos: str
    monto_original: int
    saldo_capital: int
    valor_cuota: int
    cuotas_pagadas: int
    cuotas_totales: int
    tasa_mensual: float
    proximo_pago: datetime
    estado: EstadoProducto

    def __post_init__(self) -> None:
        if self.cuotas_totales <= 0 or not 0 <= self.cuotas_pagadas <= self.cuotas_totales:
            raise CreditoInvalidoError(
                "Las cuotas pagadas deben estar entre 0 y las cuotas totales"
            )
        if self.monto_original <= 0 or not 0 <= self.saldo_capital <= self.monto_original:
            raise CreditoInvalidoError("El saldo debe estar entre 0 y el monto original")
        if self.valor_cuota <= 0 or self.tasa_mensual < 0:
            raise CreditoInvalidoError("La cuota debe ser positiva y la tasa no negativa")

    @property
    def numero(self) -> str:
        return f"•••• {self.ultimos_digitos}"

    @property
    def cuotas_restantes(self) -> int:
        return self.cuotas_totales - self.cuotas_pagadas

    @property
    def porcentaje_pagado(self) -> float:
        return self.cuotas_pagadas / self.cuotas_totales * _PORCENTAJE_MAXIMO
