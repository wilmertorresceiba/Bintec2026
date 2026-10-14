from typing import Annotated

from fastapi import Depends
from sqlalchemy.orm import Session

from app.modules.analitica.application.obtener_consumo import ObtenerConsumo
from app.modules.movimientos.infrastructure.repositorio_sqlalchemy import (
    MovimientoRepositorioSqlAlchemy,
)
from app.shared.dependencies import get_session


def obtener_consumo(session: Annotated[Session, Depends(get_session)]) -> ObtenerConsumo:
    return ObtenerConsumo(MovimientoRepositorioSqlAlchemy(session))
