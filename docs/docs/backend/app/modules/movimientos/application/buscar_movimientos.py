from datetime import datetime

from app.modules.movimientos.domain.entities import Movimiento, TipoMovimiento
from app.modules.movimientos.domain.repositories import MovimientoRepositorio
from app.shared.errors import DomainError

LIMITE_REPORTE_MAXIMO: int = 1000


class RangoInvalidoError(DomainError):
    codigo = "rango_invalido"


class BuscarMovimientos:
    """Caso de uso (reportes): movimientos del cliente filtrados por fechas y tipo."""

    def __init__(self, repositorio: MovimientoRepositorio) -> None:
        self._repositorio = repositorio

    def ejecutar(
        self,
        usuario_id: int,
        desde: datetime | None,
        hasta: datetime | None,
        tipo: TipoMovimiento | None,
        limite: int = LIMITE_REPORTE_MAXIMO,
    ) -> list[Movimiento]:
        if desde is not None and hasta is not None and desde >= hasta:
            raise RangoInvalidoError("La fecha inicial debe ser anterior a la fecha final")
        limite_efectivo: int = max(1, min(limite, LIMITE_REPORTE_MAXIMO))
        return self._repositorio.buscar(usuario_id, desde, hasta, tipo, limite_efectivo)
