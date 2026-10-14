from datetime import UTC, date, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.modules.identidad.presentation.dependencies import UsuarioActual
from app.modules.movimientos.application.buscar_movimientos import (
    LIMITE_REPORTE_MAXIMO,
    BuscarMovimientos,
)
from app.modules.movimientos.application.listar_movimientos import (
    LIMITE_MAXIMO,
    LIMITE_POR_DEFECTO,
    ListarMovimientos,
)
from app.modules.movimientos.domain.entities import Movimiento, TipoMovimiento
from app.modules.movimientos.presentation.dependencies import (
    obtener_buscar_movimientos,
    obtener_listar_movimientos,
)
from app.modules.movimientos.presentation.schemas import MovimientoRespuesta

router = APIRouter(prefix="/movimientos", tags=["Movimientos"])


@router.get("", response_model=list[MovimientoRespuesta])
def listar_movimientos(
    usuario: UsuarioActual,
    caso: Annotated[ListarMovimientos, Depends(obtener_listar_movimientos)],
    limite: Annotated[int, Query(ge=1, le=LIMITE_MAXIMO)] = LIMITE_POR_DEFECTO,
) -> list[Movimiento]:
    return caso.ejecutar(usuario.id, limite)


def _inicio_del_dia(dia: date) -> datetime:
    return datetime(dia.year, dia.month, dia.day, tzinfo=UTC)


@router.get("/reporte", response_model=list[MovimientoRespuesta])
def reporte_movimientos(
    usuario: UsuarioActual,
    caso: Annotated[BuscarMovimientos, Depends(obtener_buscar_movimientos)],
    desde: date | None = None,
    hasta: date | None = None,
    tipo: TipoMovimiento | None = None,
    limite: Annotated[int, Query(ge=1, le=LIMITE_REPORTE_MAXIMO)] = LIMITE_REPORTE_MAXIMO,
) -> list[Movimiento]:
    """Movimientos filtrados para reportes. `desde` y `hasta` son fechas inclusivas (YYYY-MM-DD)."""
    return caso.ejecutar(
        usuario.id,
        _inicio_del_dia(desde) if desde else None,
        _inicio_del_dia(hasta) + timedelta(days=1) if hasta else None,
        tipo,
        limite,
    )
