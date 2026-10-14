from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.modules.movimientos.application.buscar_movimientos import BuscarMovimientos
from app.modules.movimientos.application.listar_movimientos import ListarMovimientos
from app.modules.movimientos.infrastructure.repositorio_sqlalchemy import (
    MovimientoRepositorioSqlAlchemy,
)
from app.shared.dependencies import get_session


def obtener_listar_movimientos(
    session: Annotated[Session, Depends(get_session)],
) -> ListarMovimientos:
    return ListarMovimientos(MovimientoRepositorioSqlAlchemy(session))


def obtener_buscar_movimientos(
    session: Annotated[Session, Depends(get_session)],
) -> BuscarMovimientos:
    return BuscarMovimientos(MovimientoRepositorioSqlAlchemy(session))
