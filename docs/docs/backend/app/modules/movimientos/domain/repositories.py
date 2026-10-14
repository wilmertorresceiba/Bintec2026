from abc import ABC, abstractmethod
from datetime import datetime

from app.modules.movimientos.domain.entities import Movimiento, TipoMovimiento


class MovimientoRepositorio(ABC):
    """Puerto de salida: persistencia de movimientos."""

    @abstractmethod
    def listar_recientes(self, usuario_id: int, limite: int) -> list[Movimiento]:
        """Movimientos del usuario ordenados del más reciente al más antiguo."""
        ...

    @abstractmethod
    def listar_consumos(
        self, usuario_id: int, desde: datetime, hasta: datetime
    ) -> list[Movimiento]:
        """Cargos de consumo (compras y avances) con fecha en el intervalo [desde, hasta)."""
        ...

    @abstractmethod
    def buscar(
        self,
        usuario_id: int,
        desde: datetime | None,
        hasta: datetime | None,
        tipo: TipoMovimiento | None,
        limite: int,
    ) -> list[Movimiento]:
        """Movimientos filtrados (fecha en [desde, hasta)), del más reciente al más antiguo."""
        ...

    @abstractmethod
    def rango_anios_consumo(self, usuario_id: int) -> tuple[int, int] | None:
        """Primer y último año con consumos, o None si el usuario no tiene ninguno."""
        ...
