from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum

from app.shared.errors import DomainError


class PeriodoUso(StrEnum):
    """Granularidad de la serie de consumo."""

    ANIO = "anio"
    MES = "mes"
    DIA = "dia"


class PeriodoInvalidoError(DomainError):
    codigo = "periodo_invalido"


@dataclass(frozen=True, slots=True)
class CargoConsumo:
    """Cargo de consumo con tarjeta (compra o avance). `monto` siempre es positivo."""

    fecha: datetime
    producto: str
    monto: int


@dataclass(frozen=True, slots=True)
class PuntoConsumo:
    clave: int
    etiqueta: str
    total: int
    transacciones: int


@dataclass(frozen=True, slots=True)
class ConsumoProducto:
    producto: str
    total: int


@dataclass(frozen=True, slots=True)
class SerieConsumo:
    periodo: PeriodoUso
    anio: int
    mes: int | None
    puntos: tuple[PuntoConsumo, ...]
    por_producto: tuple[ConsumoProducto, ...]
    anios_disponibles: tuple[int, ...]

    @property
    def total(self) -> int:
        return sum(p.total for p in self.puntos)

    @property
    def transacciones(self) -> int:
        return sum(p.transacciones for p in self.puntos)

    @property
    def promedio(self) -> int:
        """Consumo promedio por punto de la serie (incluye periodos sin consumo)."""
        return round(self.total / len(self.puntos)) if self.puntos else 0

    @property
    def maximo(self) -> PuntoConsumo | None:
        con_consumo = [p for p in self.puntos if p.total > 0]
        return max(con_consumo, key=lambda p: p.total) if con_consumo else None
